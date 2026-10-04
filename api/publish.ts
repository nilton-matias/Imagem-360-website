// Vercel Serverless Function: /api/publish
export default async function handler(req: any, res: any) {
  // Configurar CORS básico se necessário
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Permite verificar status das variáveis de ambiente
  if (req.method === 'GET') {
    const isConfigured = Boolean(
      process.env.GITHUB_TOKEN &&
      process.env.GITHUB_OWNER &&
      process.env.GITHUB_REPO
    )
    return res.status(200).json({
      configured: isConfigured,
      owner: process.env.GITHUB_OWNER || '',
      repo: process.env.GITHUB_REPO || '',
      branch: process.env.GITHUB_BRANCH || 'main',
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido. Use POST.' })
  }

  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  const filePath = process.env.GITHUB_FILE_PATH || 'src/data/site-content.json'

  if (!token || !owner || !repo) {
    return res.status(500).json({
      success: false,
      message: 'Variáveis de ambiente do GitHub não configuradas no servidor/Vercel (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO).',
    })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const content = body?.content
    const commitMessage = body?.message || 'Atualização de conteúdo via Painel Admin'

    if (!content) {
      return res.status(400).json({ success: false, message: 'Nenhum conteúdo enviado para publicação.' })
    }

    // 1. Obter o SHA do arquivo atual no repositório
    let currentSha: string | undefined
    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (getRes.ok) {
      const existingData: any = await getRes.json()
      currentSha = existingData.sha
    } else if (getRes.status !== 404) {
      return res.status(getRes.status).json({
        success: false,
        message: `Erro ao consultar o arquivo no GitHub (${getRes.status}). Verifique o token e permissões.`,
      })
    }

    // 2. Codificar o JSON em Base64 com suporte total a UTF-8
    const jsonString = JSON.stringify(content, null, 2)
    const utf8Bytes = new TextEncoder().encode(jsonString)
    let binary = ''
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i])
    }
    const base64Content = Buffer.from(binary, 'binary').toString('base64')

    // 3. Commit no GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          branch,
          sha: currentSha,
        }),
      }
    )

    if (!putRes.ok) {
      const errData: any = await putRes.json().catch(() => ({}))
      return res.status(putRes.status).json({
        success: false,
        message: `Erro no GitHub (${putRes.status}): ${errData.message || putRes.statusText}`,
      })
    }

    const result: any = await putRes.json()
    const commitUrl = result.commit?.html_url || `https://github.com/${owner}/${repo}/commits/${branch}`

    return res.status(200).json({
      success: true,
      message: 'Alterações publicadas com sucesso! A Vercel iniciou a atualização automática do site.',
      commitUrl,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({
      success: false,
      message: `Erro no servidor ao publicar: ${msg}`,
    })
  }
}
