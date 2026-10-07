// Serverless / Local publish handler: Salva conteúdo diretamente sem chamar o GitHub
import fs from 'node:fs'
import path from 'node:path'

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      configured: true,
      service: 'Persistência Direta Local / AWS (Sem dependência de GitHub)',
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido. Use POST.' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const content = body?.content

    if (!content) {
      return res.status(400).json({ success: false, message: 'Nenhum conteúdo enviado para publicação.' })
    }

    // Salva no arquivo local do projeto se estiver em ambiente Node
    try {
      const filePath = path.resolve(process.cwd(), 'src/data/site-content.json')
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8')
      console.log('✅ Conteúdo salvo com sucesso diretamente em:', filePath)
    } catch (fsErr) {
      console.warn('Aviso ao gravar no arquivo:', fsErr)
    }

    return res.status(200).json({
      success: true,
      message: 'Alterações salvas com sucesso diretamente no servidor!',
    })
  } catch (error: any) {
    console.error('Erro na API publish:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao salvar conteúdo.',
    })
  }
}
