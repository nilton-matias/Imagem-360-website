import { config } from './config.js'

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function sendJson(res, status, body, headers = {}) {
  if (res.headersSent) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value)
  res.end(JSON.stringify(body))
}

/**
 * Lê o corpo do pedido respeitando um limite de bytes.
 * Se o limite for ultrapassado, continua a drenar (até 4x o limite) para conseguir
 * responder 413 de forma limpa; acima disso, corta a ligação.
 */
export async function readBody(req, limit) {
  const declared = Number(req.headers['content-length'] || 0)
  if (declared > limit) throw new HttpError(413, `Pedido demasiado grande (máximo ${formatBytes(limit)}).`)

  const chunks = []
  let size = 0
  let tooLarge = false

  for await (const chunk of req) {
    size += chunk.length
    if (size > limit * 4) {
      req.destroy()
      break
    }
    if (size > limit) {
      tooLarge = true
      continue
    }
    chunks.push(chunk)
  }

  if (tooLarge || size > limit) throw new HttpError(413, `Pedido demasiado grande (máximo ${formatBytes(limit)}).`)
  return Buffer.concat(chunks)
}

export async function readJson(req, limit) {
  const contentType = String(req.headers['content-type'] || '').toLowerCase()
  if (!contentType.startsWith('application/json')) {
    throw new HttpError(415, 'Content-Type deve ser application/json.')
  }
  const buffer = await readBody(req, limit)
  try {
    return JSON.parse(buffer.toString('utf8') || '{}')
  } catch {
    throw new HttpError(400, 'JSON inválido.')
  }
}

/** IP do cliente. Só usa cabeçalhos do proxy quando TRUST_PROXY=true (Nginx). */
export function getClientIp(req) {
  if (config.trustProxy) {
    const realIp = String(req.headers['x-real-ip'] || '').trim()
    if (realIp) return realIp
    const forwarded = String(req.headers['x-forwarded-for'] || '')
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
    // O último valor é o adicionado pelo nosso proxy (os anteriores podem ser forjados)
    if (forwarded.length) return forwarded[forwarded.length - 1]
  }
  return req.socket?.remoteAddress || 'unknown'
}

/** Rate limiter simples em memória (janela fixa por chave). */
export function createRateLimiter({ windowMs, max }) {
  const buckets = new Map()

  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key)
  }, Math.min(windowMs, 60_000))
  timer.unref?.()

  const bucketFor = key => {
    const now = Date.now()
    let bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(key, bucket)
    }
    return bucket
  }

  return {
    check(key) {
      const bucket = bucketFor(key)
      return {
        allowed: bucket.count < max,
        retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000)),
      }
    },
    hit(key) {
      bucketFor(key).count += 1
    },
    consume(key) {
      const result = this.check(key)
      if (result.allowed) this.hit(key)
      return result
    },
    reset(key) {
      buckets.delete(key)
    },
  }
}

export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}
