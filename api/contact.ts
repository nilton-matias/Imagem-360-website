import { handleContactApi } from '../server/contactEmail'

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Healthcheck para verificar se a Resend está configurada
  if (req.method === 'GET') {
    const isConfigured = Boolean(process.env.RESEND_API_KEY)
    return res.status(200).json({
      configured: isConfigured,
      service: 'Resend Contact API',
      to: process.env.CONTACT_TO_EMAIL || process.env.QUOTE_TO_EMAIL || 'default',
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido. Use POST.' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const result = await handleContactApi(body, process.env)
    return res.status(result.status).json(result.body)
  } catch (error) {
    console.error('Erro na API de contacto:', error)
    return res.status(500).json({ error: 'Erro inesperado ao processar a mensagem.' })
  }
}

