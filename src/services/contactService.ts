export interface ContactFormData {
  name: string
  email: string
  subject?: string
  message: string
  phone?: string
}

export interface ContactResponse {
  success: boolean
  message: string
  id?: string
}

export async function sendContactMessage(data: ContactFormData): Promise<ContactResponse> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: data.name,
        email: data.email,
        assunto: data.subject || 'Contacto via Website',
        mensagem: data.message,
        telefone: data.phone || '',
      }),
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMessage =
        result?.error ||
        result?.message ||
        'Não foi possível enviar a mensagem no momento. Por favor tente novamente.'
      return {
        success: false,
        message: errorMessage,
      }
    }

    return {
      success: true,
      message: result?.message || 'A sua mensagem foi enviada com sucesso! Entraremos em contacto brevemente.',
      id: result?.id,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      message: `Erro ao comunicar com o servidor: ${errorMsg}`,
    }
  }
}
