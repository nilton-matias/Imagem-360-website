import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.resolve(ROOT, 'dist')

// Carregar variáveis do .env se existir
const envPath = path.resolve(ROOT, '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  }
}

const PORT = parseInt(process.env.PORT || '3000', 10)
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }

  const urlPath = (req.url || '/').split('?')[0]

  // ── ROTA: /api/contact ──────────────────────────────────
  if (urlPath === '/api/contact') {
    if (req.method === 'GET') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        status: 'online',
        service: 'Imagem 360 Contact API (Standalone Server)',
        configured: Boolean(process.env.RESEND_API_KEY),
      }))
      return
    }

    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Método não permitido.' }))
      return
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'RESEND_API_KEY não configurada no servidor.' }))
      return
    }

    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')

      const nome = (body?.nome || body?.name || '').trim()
      const email = (body?.email || '').trim().toLowerCase()
      const assunto = (body?.assunto || body?.subject || 'Contacto via Website').trim()
      const mensagem = (body?.mensagem || body?.message || '').trim()
      const telefone = (body?.telefone || body?.phone || '').trim()

      if (!nome) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Por favor, indique o seu nome.' }))
        return
      }
      if (!email || !email.includes('@')) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Por favor, indique um email válido.' }))
        return
      }
      if (!mensagem) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Por favor, escreva a sua mensagem.' }))
        return
      }

      const to = (process.env.CONTACT_TO_EMAIL || 'nilton.nhanteme@gmail.com').trim()
      const from = process.env.RESEND_FROM_EMAIL || 'Imagem 360 <onboarding@resend.dev>'

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f7fa;color:#0f172a;padding:24px 16px;margin:0;">
          <div style="max-width:580px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.05);">
            <div style="background-color:#ffffff;padding:20px 28px;border-bottom:2px solid #e8384a;display:flex;align-items:center;gap:16px;">
              <img src="https://cdn.jsdelivr.net/gh/nilton-matias/Imagem-360-website@main/public/logo_360.png" alt="Imagem 360" style="height:36px;width:auto;display:block;border:0;" />
              <h1 style="color:#0f172a;margin:0;font-size:18px;font-weight:800;line-height:1.2;">Nova Mensagem de Contacto</h1>
            </div>
            <div style="padding:28px;">
              <p style="margin:0 0 8px;"><strong>Nome:</strong> ${nome}</p>
              <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
              ${telefone ? `<p style="margin:0 0 8px;"><strong>Telefone:</strong> ${telefone}</p>` : ''}
              <p style="margin:0 0 16px;"><strong>Assunto:</strong> ${assunto}</p>
              <div style="padding:16px;background-color:#f8fafc;border-radius:8px;border-left:4px solid #e8384a;margin-bottom:24px;">
                <p style="margin:0;color:#334155;line-height:1.6;white-space:pre-wrap;">${mensagem}</p>
              </div>
              <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(assunto)}" style="display:inline-block;background-color:#e8384a;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:999px;font-weight:700;font-size:13px;">Responder a ${nome}</a>
            </div>
          </div>
        </body>
        </html>
      `

      const resendRes = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `IMAGEM 360 - ${assunto}`,
          text: `Nome: ${nome}\nEmail: ${email}\nAssunto: ${assunto}\n\nMensagem:\n${mensagem}`,
          html: htmlBody,
        }),
      })

      const resendData = await resendRes.json().catch(() => ({}))
      if (!resendRes.ok) {
        res.statusCode = resendRes.status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: resendData.message || 'Falha ao enviar email pelo Resend.' }))
        return
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ success: true, message: 'Mensagem enviada com sucesso!' }))
      return
    } catch (err) {
      console.error('Erro no endpoint /api/contact:', err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Erro interno ao processar contacto.' }))
      return
    }
  }

  // ── ROTA: /api/publish ──────────────────────────────────
  if (urlPath === '/api/publish') {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Use POST.' }))
      return
    }

    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')

      if (body?.content) {
        const targetPath = path.resolve(ROOT, 'src/data/site-content.json')
        fs.writeFileSync(targetPath, JSON.stringify(body.content, null, 2), 'utf8')
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ success: true, message: 'Conteúdo atualizado com sucesso no servidor!' }))
      return
    } catch (err) {
      console.error('Erro no /api/publish:', err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Erro ao salvar alterações.' }))
      return
    }
  }

  // ── ARQUIVOS ESTÁTICOS (dist) ───────────────────────────
  let safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = path.join(DIST, safePath)

  // Se o caminho terminar em barra ou for pasta, tenta index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }

  // Se o arquivo existir no dist, entrega direto com MIME correto
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    // Cache longo para assets versionados do Vite
    if (urlPath.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600')
    }

    res.statusCode = 200
    res.setHeader('Content-Type', contentType)
    fs.createReadStream(filePath).pipe(res)
    return
  }

  // Se for um asset que não existe, retorna 404 (evita enviar index.html para .png/.css quebrado)
  if (urlPath.startsWith('/assets/')) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Asset não encontrado: 404')
    return
  }

  // Fallback SPA para index.html
  const indexPath = path.join(DIST, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    fs.createReadStream(indexPath).pipe(res)
    return
  }

  res.statusCode = 404
  res.end('Build não encontrado. Execute `npm run build` primeiro.')
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor Imagem 360 rodando em http://0.0.0.0:${PORT}`)
})
