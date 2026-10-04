#!/usr/bin/env bash

set -e

echo "=========================================="
echo " IMAGEM 360 - FIX SECURITY"
echo "=========================================="

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

mkdir -p runtime/content
mkdir -p runtime/uploads/clients
mkdir -p runtime/content/backups

echo ""
echo "[1/5] Atualizando .gitignore..."

touch .gitignore

grep -qxF "runtime/" .gitignore || echo "runtime/" >> .gitignore
grep -qxF "data/" .gitignore || echo "data/" >> .gitignore
grep -qxF ".env" .gitignore || echo ".env" >> .gitignore

echo "[2/5] Criando server/auth.js..."

cat > server/auth.js <<'EOF'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const RUNTIME_DIR = path.resolve(__dirname, '../runtime')
const ADMIN_FILE = path.join(RUNTIME_DIR, 'admin.json')

const SESSION_COOKIE = 'imagem360_session'
const SESSION_TTL = 8 * 60 * 60 * 1000

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET

  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET não configurado ou demasiado curto.'
    )
  }

  return secret
}

function ensureRuntime() {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true })
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')

  return {
    salt,
    hash,
  }
}

function verifyPassword(password, stored) {
  const derived = crypto.scryptSync(password, stored.salt, 64)

  const expected = Buffer.from(stored.hash, 'hex')

  return (
    expected.length === derived.length &&
    crypto.timingSafeEqual(expected, derived)
  )
}

function ensureAdmin() {
  ensureRuntime()

  if (fs.existsSync(ADMIN_FILE)) {
    return
  }

  const initialPassword = process.env.ADMIN_PASSWORD

  if (!initialPassword || initialPassword.length < 8) {
    throw new Error(
      'ADMIN_PASSWORD deve existir no .env e ter pelo menos 8 caracteres na primeira execução.'
    )
  }

  const password = hashPassword(initialPassword)

  fs.writeFileSync(
    ADMIN_FILE,
    JSON.stringify(
      {
        password,
        createdAt: new Date().toISOString(),
      },
      null,
      2
    )
  )

  console.log('Administrador inicial criado em runtime/admin.json')
}

function readAdmin() {
  ensureAdmin()

  return JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'))
}

function saveAdmin(admin) {
  ensureRuntime()

  const tempFile = `${ADMIN_FILE}.tmp`

  fs.writeFileSync(tempFile, JSON.stringify(admin, null, 2))
  fs.renameSync(tempFile, ADMIN_FILE)
}

function sign(value) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(value)
    .digest('hex')
}

function createSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL
  const payload = String(expiresAt)
  const signature = sign(payload)

  return `${payload}.${signature}`
}

function verifySessionToken(token) {
  if (!token) {
    return false
  }

  const [expiresAt, signature] = token.split('.')

  if (!expiresAt || !signature) {
    return false
  }

  if (Date.now() > Number(expiresAt)) {
    return false
  }

  const expected = sign(expiresAt)

  if (signature.length !== expected.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

function parseCookies(req) {
  const header = req.headers.cookie || ''

  return Object.fromEntries(
    header
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const index = part.indexOf('=')

        if (index === -1) {
          return [part, '']
        }

        return [
          part.slice(0, index),
          decodeURIComponent(part.slice(index + 1)),
        ]
      })
  )
}

function setSessionCookie(res, token) {
  const secure =
    process.env.NODE_ENV === 'production' ? '; Secure' : ''

  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL / 1000}${secure}`
  )
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
  )
}

export function isAuthenticated(req) {
  const cookies = parseCookies(req)

  return verifySessionToken(cookies[SESSION_COOKIE])
}

export function requireAuth(req, res) {
  if (isAuthenticated(req)) {
    return true
  }

  res.writeHead(401, {
    'Content-Type': 'application/json; charset=utf-8',
  })

  res.end(
    JSON.stringify({
      success: false,
      error: 'Não autenticado.',
    })
  )

  return false
}

const loginAttempts = new Map()

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

function isRateLimited(req) {
  const ip = getClientIp(req)
  const now = Date.now()

  const current = loginAttempts.get(ip)

  if (!current || now - current.startedAt > 15 * 60 * 1000) {
    loginAttempts.set(ip, {
      startedAt: now,
      attempts: 1,
    })

    return false
  }

  current.attempts += 1

  return current.attempts > 5
}

export async function handleAuth(req, res, pathname, body) {
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify({
        authenticated: isAuthenticated(req),
      })
    )

    return true
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    if (isRateLimited(req)) {
      res.writeHead(429, {
        'Content-Type': 'application/json; charset=utf-8',
      })

      res.end(
        JSON.stringify({
          success: false,
          error: 'Muitas tentativas. Aguarde alguns minutos.',
        })
      )

      return true
    }

    const password = String(body?.password || '')

    if (!password) {
      res.writeHead(400, {
        'Content-Type': 'application/json; charset=utf-8',
      })

      res.end(
        JSON.stringify({
          success: false,
          error: 'Senha obrigatória.',
        })
      )

      return true
    }

    const admin = readAdmin()

    if (!verifyPassword(password, admin.password)) {
      res.writeHead(401, {
        'Content-Type': 'application/json; charset=utf-8',
      })

      res.end(
        JSON.stringify({
          success: false,
          error: 'Senha incorreta.',
        })
      )

      return true
    }

    const token = createSessionToken()

    setSessionCookie(res, token)

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify({
        success: true,
      })
    )

    return true
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    clearSessionCookie(res)

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify({
        success: true,
      })
    )

    return true
  }

  if (pathname === '/api/auth/password' && req.method === 'POST') {
    if (!requireAuth(req, res)) {
      return true
    }

    const password = String(body?.password || '')

    if (password.length < 8) {
      res.writeHead(400, {
        'Content-Type': 'application/json; charset=utf-8',
      })

      res.end(
        JSON.stringify({
          success: false,
          error: 'A nova senha deve ter pelo menos 8 caracteres.',
        })
      )

      return true
    }

    const admin = readAdmin()

    admin.password = hashPassword(password)
    admin.updatedAt = new Date().toISOString()

    saveAdmin(admin)

    clearSessionCookie(res)

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify({
        success: true,
        message: 'Senha alterada. Faça login novamente.',
      })
    )

    return true
  }

  return false
}
EOF

echo "[3/5] Criando server/upload.js..."

cat > server/upload.js <<'EOF'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireAuth } from './auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = path.resolve(
  __dirname,
  '../runtime/uploads/clients'
)

const MAX_SIZE = 5 * 1024 * 1024

function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

function detectImage(buffer) {
  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return 'png'
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpg'
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString() === 'RIFF' &&
    buffer.subarray(8, 12).toString() === 'WEBP'
  ) {
    return 'webp'
  }

  return null
}

async function readBody(req) {
  const chunks = []
  let total = 0

  for await (const chunk of req) {
    total += chunk.length

    if (total > MAX_SIZE) {
      throw new Error('Imagem demasiado grande. Limite: 5 MB.')
    }

    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

function extractMultipart(body, boundary) {
  const delimiter = Buffer.from(`--${boundary}`)
  const headerEnd = Buffer.from('\r\n\r\n')

  let start = body.indexOf(delimiter)

  while (start !== -1) {
    const partStart = start + delimiter.length

    if (
      body[partStart] === 45 &&
      body[partStart + 1] === 45
    ) {
      break
    }

    const headersEnd = body.indexOf(
      headerEnd,
      partStart
    )

    if (headersEnd === -1) {
      break
    }

    const dataStart = headersEnd + headerEnd.length

    const nextBoundary = body.indexOf(
      Buffer.from(`\r\n--${boundary}`),
      dataStart
    )

    if (nextBoundary === -1) {
      break
    }

    const headers = body
      .subarray(partStart, headersEnd)
      .toString('utf8')

    const data = body.subarray(dataStart, nextBoundary)

    const disposition = headers.match(
      /Content-Disposition:.*name="([^"]+)".*filename="([^"]*)"/i
    )

    if (disposition) {
      return {
        name: disposition[1],
        filename: disposition[2],
        data,
      }
    }

    start = body.indexOf(delimiter, nextBoundary)
  }

  return null
}

export async function handleUpload(req, res) {
  if (!requireAuth(req, res)) {
    return true
  }

  if (req.method !== 'POST') {
    return false
  }

  const contentType = req.headers['content-type'] || ''

  if (!contentType.startsWith('multipart/form-data;')) {
    res.writeHead(400, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify({
        success: false,
        error: 'O upload deve usar multipart/form-data.',
      })
    )

    return true
  }

  const match = contentType.match(/boundary="?([^";]+)"?/i)

  if (!match) {
    res.writeHead(400, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify({
        success: false,
        error: 'Boundary multipart inválido.',
      })
    )

    return true
  }

  try {
    const body = await readBody(req)

    const file = extractMultipart(body, match[1])

    if (!file || !file.data?.length) {
      throw new Error('Nenhuma imagem foi enviada.')
    }

    const extension = detectImage(file.data)

    if (!extension) {
      throw new Error(
        'Formato inválido. Use PNG, JPG ou WebP.'
      )
    }

    ensureUploadDir()

    const filename = `${crypto.randomUUID()}.${extension}`

    const destination = path.join(
      UPLOAD_DIR,
      filename
    )

    fs.writeFileSync(destination, file.data)

    res.writeHead(201, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify({
        success: true,
        url: `/uploads/clients/${filename}`,
        filename,
      })
    )

    return true
  } catch (error) {
    res.writeHead(400, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify({
        success: false,
        error: error.message || 'Falha no upload.',
      })
    )

    return true
  }
}
EOF

echo "[4/5] Verificando package.json..."

node -e "
const p=require('./package.json');
if (!p.dependencies?.sharp && !p.devDependencies?.sharp) {
  console.log('AVISO: sharp não está instalado.');
  console.log('Execute: npm install sharp');
}
"

echo "[5/5] Concluído."

echo ""
echo "=========================================="
echo " SECURITY FILES CRIADOS"
echo "=========================================="
echo ""
echo "Próximo passo:"
echo "  npm install sharp"
echo ""
echo "Depois execute:"
echo "  git diff"
echo ""