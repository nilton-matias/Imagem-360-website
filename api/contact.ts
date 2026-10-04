const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Healthcheck para verificar se a Resend está ativa
  if (req.method === 'GET') {
    const isConfigured = Boolean(process.env.RESEND_API_KEY)
    return res.status(200).json({
      configured: isConfigured,
      service: 'Resend Contact API',
      to: process.env.CONTACT_TO_EMAIL || 'nilton.nhanteme@gmail.com',
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido. Use POST.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurada nas Environment Variables da Vercel.' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const nome = (body?.nome || body?.name || '').trim()
    const email = (body?.email || '').trim().toLowerCase()
    const assunto = (body?.assunto || body?.subject || 'Contacto via Website').trim()
    const mensagem = (body?.mensagem || body?.message || '').trim()
    const telefone = (body?.telefone || body?.phone || '').trim()

    if (!nome) return res.status(400).json({ error: 'Por favor, indique o seu nome.' })
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Por favor, indique um email válido.' })
    if (!mensagem) return res.status(400).json({ error: 'Por favor, escreva a sua mensagem.' })

    const rawTo = (process.env.CONTACT_TO_EMAIL || 'nilton.nhanteme@gmail.com').trim()
    const to = rawTo.includes('@') && rawTo.includes('.') ? rawTo : 'nilton.nhanteme@gmail.com'
    const from = process.env.RESEND_FROM_EMAIL || 'Imagem 360 <onboarding@resend.dev>'

    const emailSubject = `IMAGEM 360 - ${assunto}`

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

    // Envio para a agência
    const response = await fetch(RESEND_ENDPOINT, {
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
        text: `Nome: ${nome}\nEmail: ${email}\nAssunto: ${assunto}\n\nMensagem:\n${mensagem}`,
        html: htmlBody,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Falha ao enviar email pelo serviço Resend.' })
    }

    return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' })
  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error)
    return res.status(500).json({ error: error?.message || 'Erro interno ao processar contacto.' })
  }
}