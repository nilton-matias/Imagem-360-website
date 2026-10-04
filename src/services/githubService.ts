import { SiteContent } from '../types/content'

export async function publishContent(
  content: SiteContent,
  _config?: unknown,
  commitMessage = 'Atualização de conteúdos do site'
): Promise<{
  success: boolean
  message: string
  commitUrl?: string
}> {
  try {
    const response = await fetch('/api/publish', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        message: commitMessage,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data?.success) {
      return {
        success: false,
        message:
          data?.message ||
          data?.error ||
          'Não foi possível publicar as alterações.',
      }
    }

    return {
      success: true,
      message:
        data.message ||
        'Alterações publicadas com sucesso.',
      commitUrl: data.commitUrl,
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Erro ao comunicar com o servidor.',
    }
  }
}

export async function testGitHubConnection() {
  return {
    success: false,
    message:
      'A publicação via GitHub foi removida. O conteúdo agora é gerido pelo servidor.',
  }
}

export async function commitContentToGitHub() {
  return {
    success: false,
    message:
      'A publicação direta no GitHub foi removida por segurança.',
  }
}
