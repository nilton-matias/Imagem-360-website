import { GitHubConfig, SiteContent } from '../types/content'

export async function testGitHubConnection(config: GitHubConfig): Promise<{ success: boolean; message: string }> {
  if (!config.token) {
    return { success: false, message: 'O Token do GitHub é obrigatório.' }
  }
  if (!config.owner || !config.repo) {
    return { success: false, message: 'Informe o utilizador/organização e o nome do repositório.' }
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, message: 'Token inválido ou expirado.' }
      }
      if (res.status === 404) {
        return { success: false, message: 'Repositório não encontrado. Verifique se o nome e o utilizador estão corretos e se o token tem permissão de leitura.' }
      }
      return { success: false, message: `Erro GitHub (${res.status}): ${res.statusText}` }
    }

    const data = await res.json()
    return { success: true, message: `Conexão bem-sucedida com o repositório ${data.full_name}!` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, message: `Falha na requisição: ${msg}` }
  }
}

export async function commitContentToGitHub(
  config: GitHubConfig,
  content: SiteContent,
  commitMessage = 'Atualização de conteúdos do site via Painel Admin'
): Promise<{ success: boolean; message: string; commitUrl?: string }> {
  const filePath = config.filePath || 'src/data/site-content.json'
  const branch = config.branch || 'main'

  if (!config.token || !config.owner || !config.repo) {
    return { success: false, message: 'Configurações do GitHub incompletas. Preencha o Token, Repositório e Usuário.' }
  }

  try {
    // 1. Obter o SHA atual do arquivo no GitHub (necessário para atualizar)
    let currentSha: string | undefined
    const getRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (getRes.ok) {
      const existingData = await getRes.json()
      currentSha = existingData.sha
    } else if (getRes.status !== 404) {
      return {
        success: false,
        message: `Não foi possível consultar o arquivo atual no repositório (${getRes.status}). Verifique o token e as permissões.`,
      }
    }

    // 2. Codificar JSON em Base64 com suporte total a UTF-8 (acentos em português)
    const jsonString = JSON.stringify(content, null, 2)
    // Converte UTF-8 adequadamente para base64
    const utf8Bytes = new TextEncoder().encode(jsonString)
    let binary = ''
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i])
    }
    const base64Content = btoa(binary)

    // 3. Fazer o PUT para criar ou atualizar o arquivo
    const putRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          branch,
          sha: currentSha, // se existir, sobrescreve; se não, cria
        }),
      }
    )

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}))
      return {
        success: false,
        message: `Erro ao fazer commit (${putRes.status}): ${errData.message || putRes.statusText}`,
      }
    }

    const result = await putRes.json()
    const commitUrl = result.commit?.html_url || `https://github.com/${config.owner}/${config.repo}/commits/${branch}`

    return {
      success: true,
      message: 'Alterações commitadas com sucesso no GitHub! O deploy da Vercel foi iniciado automaticamente.',
      commitUrl,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, message: `Erro inesperado ao salvar no GitHub: ${msg}` }
  }
}

/**
 * Publica o conteúdo de forma transparente:
 * 1. Tenta a Serverless API (/api/publish) onde as variáveis de ambiente do GitHub estão protegidas na Vercel.
 * 2. Se a API falhar ou não estiver configurada, tenta o fallback com as credenciais salvas (se existirem).
 */
export async function publishContent(
  content: SiteContent,
  config?: GitHubConfig,
  commitMessage = 'Atualização de conteúdos do site via Painel Admin'
): Promise<{ success: boolean; message: string; commitUrl?: string }> {
  try {
    const apiRes = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, message: commitMessage }),
    })

    const data = await apiRes.json().catch(() => ({}))

    if (apiRes.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Alterações salvas com sucesso! O deploy da Vercel foi iniciado automaticamente.',
        commitUrl: data.commitUrl,
      }
    }

    // Se a API não estiver configurada e houver config local configurada
    if (config?.token && config?.owner && config?.repo) {
      return await commitContentToGitHub(config, content, commitMessage)
    }

    return {
      success: false,
      message: data.message || 'Não foi possível publicar. Verifique as variáveis de ambiente GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO no painel da Vercel.',
    }
  } catch (err: unknown) {
    if (config?.token && config?.owner && config?.repo) {
      return await commitContentToGitHub(config, content, commitMessage)
    }
    const msg = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      message: `Erro na comunicação com a API de publicação: ${msg}`,
    }
  }
}

