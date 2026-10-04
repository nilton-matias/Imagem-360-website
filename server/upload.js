import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireAuth, verifyCsrf } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const UPLOADS_DIR = path.resolve(ROOT, 'public/uploads/clients')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

// Garante que o diretório de uploads existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Assinaturas mágicas de arquivos permitidos
const MAGIC_NUMBERS = {
  png: [0x89, 0x50, 0x4e, 0x47],
  jpg: [0xff, 0xd8, 0xff],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46], // 'RIFF'
}

function checkMagicNumber(buffer, type) {
  const magic = MAGIC_NUMBERS[type]
  if (!magic) return false
  if (buffer.length < magic.length) return false
  for (let i = 0; i < magic.length; i++) {
    if (buffer[i] !== magic[i]) return false
  }
  if (type === 'webp') {
    // Para WebP, bytes 8 a 11 devem ser 'WEBP' (0x57, 0x45, 0x42, 0x50)
    if (buffer.length < 12) return false
    return (
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    )
  }
  return true
}

function detectImageFormat(buffer, declaredMime = '') {
  if (checkMagicNumber(buffer, 'png')) return 'png'
  if (checkMagicNumber(buffer, 'jpg')) return 'jpg'
  if (checkMagicNumber(buffer, 'webp')) return 'webp'
  if (checkMagicNumber(buffer, 'gif')) return 'gif'

  // Verificação de SVG
  const sample = buffer.slice(0, 1024).toString('utf8').trim()
  if (sample.includes('<svg') && (declaredMime.includes('svg') || sample.startsWith('<?xml') || sample.startsWith('<svg'))) {
    // Sanitização de SVG: proíbe <script> e handlers javascript
    if (/<\s*script|javascript\s*:|on\w+\s*=/i.test(sample)) {
      return null // Malicioso!
    }
    return 'svg'
  }

  return null
}

// Parser simples e seguro de multipart/form-data para um único campo de arquivo
function parseMultipartBuffer(bodyBuffer, boundary) {
  const boundaryDelimiter = Buffer.from(`--${boundary}`)
  let startIdx = bodyBuffer.indexOf(boundaryDelimiter)
  if (startIdx === -1) return null

  startIdx += boundaryDelimiter.length
  const headerEnd = Buffer.from('\r\n\r\n')
  const headerIdx = bodyBuffer.indexOf(headerEnd, startIdx)
  if (headerIdx === -1) return null

  const headers = bodyBuffer.slice(startIdx, headerIdx).toString('utf8')
  const contentIdx = headerIdx + 4

  const nextBoundaryIdx = bodyBuffer.indexOf(boundaryDelimiter, contentIdx)
  if (nextBoundaryIdx === -1) return null

  // Remove o \r\n antes do próximo boundary
  const fileContent = bodyBuffer.slice(contentIdx, nextBoundaryIdx - 2)

  // Extrair contentType dos headers
  const mimeMatch = headers.match(/Content-Type:\s*([^\r\n;]+)/i)
  const mime = mimeMatch ? mimeMatch[1].trim() : ''

  return { fileContent, mime }
}

export async function handleUpload(req, res) {
  if (!requireAuth(req, res)) return
  if (!verifyCsrf(req, res)) return

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Método não permitido. Use POST.' }))
    return
  }

  const contentType = req.headers['content-type'] || ''
  const contentLength = parseInt(req.headers['content-length'] || '0', 10)

  if (contentLength > MAX_FILE_SIZE) {
    res.statusCode = 413
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'O arquivo excede o limite máximo permitido de 5 MB.' }))
    return
  }

  try {
    const chunks = []
    let totalLength = 0

    for await (const chunk of req) {
      totalLength += chunk.length
      if (totalLength > MAX_FILE_SIZE) {
        res.statusCode = 413
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'O arquivo excede o limite máximo de 5 MB.' }))
        return
      }
      chunks.push(chunk)
    }

    const rawBody = Buffer.concat(chunks)
    let fileBuffer = null
    let declaredMime = contentType

    if (contentType.includes('multipart/form-data')) {
      const match = contentType.match(/boundary=([^;]+)/i)
      if (!match) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Boundary do multipart ausente.' }))
        return
      }
      const parsed = parseMultipartBuffer(rawBody, match[1].trim())
      if (!parsed || !parsed.fileContent.length) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Nenhum arquivo enviado no formulário.' }))
        return
      }
      fileBuffer = parsed.fileContent
      declaredMime = parsed.mime || declaredMime
    } else if (contentType.startsWith('image/')) {
      fileBuffer = rawBody
    } else {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Content-Type deve ser multipart/form-data ou image/*.' }))
      return
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Arquivo vazio.' }))
      return
    }

    // Validação estrita de formato através de Magic Bytes
    const format = detectImageFormat(fileBuffer, declaredMime)
    if (!format) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: 'Arquivo inválido ou não suportado. Formatos aceitos: PNG, JPG, WebP, GIF, SVG.',
      }))
      return
    }

    // Gera um nome único aleatório (evita path traversal ou sobrescrita)
    const uniqueHash = crypto.randomBytes(6).toString('hex')
    const timestamp = Date.now()
    let finalFilename = ''
    let outputBuffer = fileBuffer

    // Processamento de imagem com sharp se disponível
    let processedWithSharp = false
    try {
      const sharp = (await import('sharp')).default

      if (['png', 'jpg', 'webp'].includes(format)) {
        outputBuffer = await sharp(fileBuffer)
          .rotate() // auto-orientação EXIF
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer()

        finalFilename = `client-${timestamp}-${uniqueHash}.webp`
        processedWithSharp = true
      }
    } catch (sharpErr) {
      console.warn('[upload] Sharp não pôde processar, salvando original:', sharpErr.message)
    }

    if (!processedWithSharp) {
      finalFilename = `client-${timestamp}-${uniqueHash}.${format}`
    }

    // Salva o arquivo no diretório persistente
    const targetPath = path.join(UPLOADS_DIR, finalFilename)
    fs.writeFileSync(targetPath, outputBuffer)

    // Se o diretório dist/uploads/clients existir (após build), copia também para sincronizar
    const distUploads = path.resolve(ROOT, 'dist/uploads/clients')
    if (fs.existsSync(distUploads)) {
      try {
        fs.writeFileSync(path.join(distUploads, finalFilename), outputBuffer)
      } catch (copyErr) {
        console.warn('[upload] Aviso ao sincronizar com dist:', copyErr.message)
      }
    }

    const publicUrl = `/uploads/clients/${finalFilename}`

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      size: outputBuffer.length,
      format: processedWithSharp ? 'webp' : format,
    }))
  } catch (err) {
    console.error('[upload] Erro ao processar upload:', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Erro interno ao processar a imagem.' }))
  }
}
