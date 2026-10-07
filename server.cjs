const http = require('http')
const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')

// Carrega variáveis do arquivo .env manualmente para não depender de pacotes externos
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        let val = trimmed.slice(eqIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}
loadEnv()

// Porta padrão 3005 para evitar conflitos com outros projetos (ex: 3000 ou 8080)
const PORT = parseInt(process.env.PORT || '3005', 10)
const DIST_DIR = path.resolve(__dirname, 'dist')
const PUBLIC_DIR = path.resolve(__dirname, 'public')
const SITE_CONTENT_PATH = path.resolve(__dirname, 'src/data/site-content.json')

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

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

const LOGO_URL = process.env.EMAIL_LOGO_URL || 'https://media.githubusercontent.com/media/nilton-matias/Imagem-360-website/main/public/logo_360.png'

// Helper resiliente para envio via Nodemailer SMTP (com IPv4 forçado e fallback de portas na AWS)
async function sendSmtpMail(mailOptions) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const initialPort = parseInt(process.env.SMTP_PORT || '465', 10)

  // Testa a porta configurada primeiro (465 SSL ou 587 STARTTLS) e depois a alternativa
  const portsToTry = initialPort === 465 ? [465, 587] : [587, 465]
  let lastError = null

  for (const port of portsToTry) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        family: 4, // CRÍTICO NA AWS EC2: Força IPv4 para evitar timeout IPv6 de 60s
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      })

      const info = await transporter.sendMail(mailOptions)
      console.log(`[smtp] Email enviado com sucesso via porta ${port}:`, info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (err) {
      console.warn(`[smtp] Tentativa na porta ${port} falhou:`, err.message)
      lastError = err
    }
  }

  throw lastError
}

// Handler de envio de email (Nodemailer SMTP com fallback para Resend)
async function handleContact(req, res, body) {
  const nome = (body?.nome || body?.name || '').trim()
  const email = (body?.email || '').trim().toLowerCase()
  const assunto = (body?.assunto || body?.subject || 'Contacto via Website').trim()
  const mensagem = (body?.mensagem || body?.message || '').trim()
  const telefone = (body?.telefone || body?.phone || '').trim()

  if (!nome) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Por favor, indique o seu nome.' }))
  }
  if (!email || !email.includes('@')) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Por favor, indique um email válido.' }))
  }
  if (!mensagem) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Por favor, escreva a sua mensagem.' }))
  }

  const rawTo = (process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER || 'nilton.nhanteme@gmail.com').trim()
  const to = rawTo.includes('@') && rawTo.includes('.') ? rawTo : 'nilton.nhanteme@gmail.com'

  const emailSubject = `IMAGEM 360 - ${assunto}`
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f7fa;color:#0f172a;padding:24px 16px;margin:0;">
      <div style="max-width:580px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.05);">
        <div style="background-color:#ffffff;padding:20px 28px;border-bottom:2px solid #e8384a;">
          <table style="width:100%;border-collapse:collapse;" role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:48px;vertical-align:middle;padding-right:14px;">
                <img src="${LOGO_URL}" alt="Imagem 360" width="42" height="42" style="display:block;width:42px;height:42px;object-fit:contain;border:0;outline:none;" />
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#e8384a;line-height:1.2;">IMAGEM 360</div>
                <h1 style="color:#0f172a;margin:2px 0 0 0;font-size:18px;font-weight:800;line-height:1.2;">Nova Mensagem de Contacto</h1>
              </td>
            </tr>
          </table>
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
        <div style="padding:14px 28px;background-color:#fafafa;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;text-align:center;">
          © Imagem 360, Lda • Agência de Marketing e Publicidade
        </div>
      </div>
    </body>
    </html>
  `
  const textBody = `Nome: ${nome}\nEmail: ${email}\n${telefone ? `Telefone: ${telefone}\n` : ''}Assunto: ${assunto}\n\nMensagem:\n${mensagem}`

  // 1. Envio prioritário via Nodemailer SMTP (Google Workspace / Gmail)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || 'Imagem 360 Website'
      const fromUser = process.env.SMTP_USER
      await sendSmtpMail({
        from: `"${fromName}" <${fromUser}>`,
        to,
        replyTo: email,
        subject: emailSubject,
        text: textBody,
        html: htmlBody,
      })

      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ success: true, message: 'Mensagem enviada com sucesso!' }))
    } catch (err) {
      console.error('Erro Nodemailer SMTP:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Erro ao enviar email pelo servidor SMTP: ' + (err.message || '') }))
    }
  }

  // 2. Fallback via Resend se RESEND_API_KEY estiver configurada
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      const from = process.env.RESEND_FROM_EMAIL || 'Imagem 360 <onboarding@resend.dev>'
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: emailSubject,
          text: textBody,
          html: htmlBody,
        }),
      })

      const resendData = await resendRes.json().catch(() => ({}))

      if (!resendRes.ok) {
        res.writeHead(resendRes.status, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: resendData.message || 'Falha ao enviar email pelo serviço Resend.' }))
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ success: true, message: 'Mensagem enviada com sucesso!' }))
    } catch (err) {
      console.error('Erro Resend:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Erro de comunicação ao enviar email.' }))
    }
  }

  res.writeHead(500, { 'Content-Type': 'application/json' })
  return res.end(JSON.stringify({ error: 'Nenhum serviço de envio de email configurado (configure SMTP ou Resend no .env).' }))
}

// Handler para salvar conteúdo do painel administrativo
function handlePublish(req, res, body) {
  if (!body?.content) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: 'Nenhum conteúdo enviado para publicação.' }))
  }

  try {
    const jsonStr = JSON.stringify(body.content, null, 2)
    // 1. Salva no arquivo de dados do projeto
    fs.writeFileSync(SITE_CONTENT_PATH, jsonStr, 'utf8')

    console.log(`[${new Date().toISOString()}] Conteúdo atualizado com sucesso no servidor AWS!`)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: true,
      message: 'Conteúdo e imagens salvos com sucesso no servidor AWS!',
    }))
  } catch (err) {
    console.error('Erro ao salvar site-content:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: false, message: 'Erro ao gravar arquivo no disco do servidor.' }))
  }
}

// Serve arquivos estáticos (dist e public)
function serveStaticFile(reqPath, res) {
  let cleanPath = decodeURIComponent(reqPath.split('?')[0])
  if (cleanPath === '/') cleanPath = '/index.html'

  // Procura primeiro em dist/
  let filePath = path.join(DIST_DIR, cleanPath)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // Procura em public/ (ex: uploads)
    const publicPath = path.join(PUBLIC_DIR, cleanPath)
    if (fs.existsSync(publicPath) && !fs.statSync(publicPath).isDirectory()) {
      filePath = publicPath
    } else {
      // Fallback para SPA (Single Page Application)
      filePath = path.join(DIST_DIR, 'index.html')
    }
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    return res.end('404 Not Found')
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  res.writeHead(200, { 'Content-Type': contentType })
  fs.createReadStream(filePath).pipe(res)
}

// Servidor HTTP
const server = http.createServer((req, res) => {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    return res.end()
  }

  const url = req.url.split('?')[0]

  // ROTA: /api/contact
  if (url === '/api/contact') {
    if (req.method === 'GET') {
      const isSmtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
      const isResendConfigured = Boolean(process.env.RESEND_API_KEY)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        configured: isSmtpConfigured || isResendConfigured,
        service: isSmtpConfigured
          ? `Nodemailer SMTP (${process.env.SMTP_USER})`
          : (isResendConfigured ? 'Resend Contact API' : 'Não configurado'),
        destination: process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER || 'nilton.nhanteme@gmail.com',
      }))
    }

    if (req.method === 'POST') {
      const chunks = []
      req.on('data', chunk => chunks.push(chunk))
      req.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          handleContact(req, res, body)
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'JSON inválido' }))
        }
      })
      return
    }
  }

  // ROTA: /api/publish
  if (url === '/api/publish') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        configured: true,
        storage: 'AWS Local Disk Persistent',
      }))
    }

    if (req.method === 'POST') {
      const chunks = []
      req.on('data', chunk => chunks.push(chunk))
      req.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          handlePublish(req, res, body)
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'JSON inválido ou payload corrompido' }))
        }
      })
      return
    }
  }

  // ROTA: /api/content
  if (url === '/api/content') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    })
    try {
      if (fs.existsSync(SITE_CONTENT_PATH)) {
        const fileData = fs.readFileSync(SITE_CONTENT_PATH, 'utf8')
        return res.end(JSON.stringify({ success: true, content: JSON.parse(fileData) }))
      }
    } catch {}
    return res.end(JSON.stringify({ success: true }))
  }

  // ROTA: /api/auth/login e /api/auth/me
  if (url.startsWith('/api/auth')) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, authenticated: true }))
  }

  // Se não for rota de API, serve os arquivos estáticos compilados do React
  serveStaticFile(req.url, res)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`)
  console.log(` Servidor Imagem 360 rodando na porta ${PORT}`)
  console.log(` Modo: Produção AWS`)
  console.log(` Frontend: ${DIST_DIR}`)
  console.log(` APIs ativas: /api/contact e /api/publish`)
  console.log(`===============================================`)
})
