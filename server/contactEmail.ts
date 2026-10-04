const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export interface ContactData {
  name?: string
  nome?: string
  email: string
  subject?: string
  assunto?: string
  message?: string
  mensagem?: string
  phone?: string
  telefone?: string
}

function required(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function escapeHtml(value: string | number | undefined | null = ''): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function row(label: string, value: string | undefined): string {
  return `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e8edf3;color:#5a7085;font-size:13px;width:150px;font-weight:600;">${escapeHtml(label)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e8edf3;color:#0f1e2d;font-size:14px;line-height:1.5;">${escapeHtml(value || '-')}</td>
    </tr>
  `
}

export function normalizeContactPayload(payload: ContactData) {
  return {
    nome: (payload.nome || payload.name || '').trim(),
    email: (payload.email || '').trim().toLowerCase(),
    assunto: (payload.assunto || payload.subject || 'Contacto via Website').trim(),
    mensagem: (payload.mensagem || payload.message || '').trim(),
    telefone: (payload.telefone || payload.phone || '').trim(),
  }
}

export function validateContactPayload(payload: ContactData): string | null {
  if (!payload || typeof payload !== 'object') {
    return 'Dados de formulário inválidos.'
  }

  const normalized = normalizeContactPayload(payload)

  if (!required(normalized.nome)) {
    return 'Por favor, indique o seu nome.'
  }

  if (!required(normalized.email)) {
    return 'Por favor, indique o seu email.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    return 'O endereço de email introduzido não é válido.'
  }

  if (!required(normalized.mensagem)) {
    return 'Por favor, escreva a sua mensagem.'
  }

  if (normalized.mensagem.length < 5) {
    return 'A mensagem é demasiado curta. Por favor forneça mais detalhes.'
  }

  return null
}

/** Email para a agência no modelo CLARO */
function buildAgencyNotificationEmail(data: ReturnType<typeof normalizeContactPayload>) {
  const subject = `[Website Imagem 360] ${data.assunto} - ${data.nome}`

  const text = [
    'Nova mensagem de contacto recebida pelo website.',
    '',
    `Nome: ${data.nome}`,
    `Email: ${data.email}`,
    `Telefone: ${data.telefone || 'Não informado'}`,
    `Assunto: ${data.assunto}`,
    '',
    'Mensagem:',
    data.mensagem,
    '',
    `Data/Hora: ${new Date().toLocaleString('pt-PT')}`,
  ].join('\n')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f7fa;color:#0f1e2d;padding:24px 16px;margin:0;">
      <div style="max-width:680px;margin:0 auto;background-color:#ffffff;border:1px solid #e8edf3;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(15,30,45,0.05);">
        
        <!-- Cabeçalho Claro com destaque Imagem 360 -->
        <div style="background-color:#ffffff;padding:24px 28px;border-bottom:2px solid #e8384a;">
          <div style="color:#e8384a;text-transform:uppercase;font-size:12px;letter-spacing:1.5px;font-weight:bold;">Imagem 360</div>
          <h1 style="color:#0f1e2d;margin:8px 0 0;font-size:22px;font-weight:700;">Nova Mensagem de Contacto</h1>
        </div>

        <div style="padding:24px 28px;">
          <h2 style="font-size:15px;color:#0f1e2d;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Dados do Remetente</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            ${row('Nome', data.nome)}
            ${row('Email', data.email)}
            ${data.telefone ? row('Telefone', data.telefone) : ''}
            ${row('Assunto', data.assunto)}
          </table>

          <h2 style="font-size:15px;color:#0f1e2d;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Mensagem</h2>
          <div style="padding:16px 18px;background-color:#f8fafc;border-left:3px solid #e8384a;border:1px solid #e8edf3;border-left-width:3px;border-radius:4px;">
            <p style="margin:0;font-size:14px;color:#0f1e2d;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.mensagem)}</p>
          </div>

          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e8edf3;display:flex;justify-content:space-between;align-items:center;">
            <a href="mailto:${escapeHtml(data.email)}?subject=Re:%20${encodeURIComponent(data.assunto)}" style="display:inline-block;background-color:#e8384a;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Responder a ${escapeHtml(data.nome)}</a>
            <span style="font-size:12px;color:#7a8a9a;">Enviado via website Imagem 360</span>
          </div>
        </div>

      </div>
    </body>
    </html>
  `

  return { subject, text, html }
}

/** Email de confirmação para o visitante no modelo CLARO */
function buildClientConfirmationEmail(data: ReturnType<typeof normalizeContactPayload>) {
  const subject = `Recebemos a sua mensagem - Imagem 360`

  const text = [
    `Olá ${data.nome},`,
    '',
    'Recebemos a sua mensagem através do website da Imagem 360 e a nossa equipa irá analisá-la.',
    'Entraremos em contacto brevemente.',
    '',
    `Assunto: ${data.assunto}`,
    '',
    'Com os melhores cumprimentos,',
    'Equipa Imagem 360',
    'Av. Maguiguana, 845, Maputo, Moçambique',
    'Email: team@imagem360.agency',
  ].join('\n')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f7fa;color:#0f1e2d;padding:24px 16px;margin:0;">
      <div style="max-width:620px;margin:0 auto;background-color:#ffffff;border:1px solid #e8edf3;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(15,30,45,0.05);">
        
        <!-- Cabeçalho Claro -->
        <div style="background-color:#ffffff;padding:24px 28px;border-bottom:2px solid #e8384a;">
          <div style="color:#e8384a;text-transform:uppercase;font-size:12px;letter-spacing:1.5px;font-weight:bold;">Imagem 360</div>
          <h1 style="color:#0f1e2d;margin:8px 0 0;font-size:22px;font-weight:700;">Mensagem Recebida</h1>
        </div>

        <div style="padding:24px 28px;color:#0f1e2d;font-size:14px;line-height:1.6;">
          <p style="margin-top:0;">Olá <strong>${escapeHtml(data.nome)}</strong>,</p>
          <p>Recebemos a sua mensagem através do nosso website e a nossa equipa entrará em contacto consigo com a maior brevidade possível.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            ${row('Assunto', data.assunto)}
            ${row('Email para resposta', data.email)}
          </table>

          <p style="margin-bottom:0;color:#5a7085;">Obrigado por contactar a <strong>Imagem 360</strong>.</p>
          <p style="font-size:12px;color:#8f96a3;margin-top:16px;">
            Av. Maguiguana, 845, Maputo, Moçambique • team@imagem360.agency
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  return { subject, text, html }
}

export async function sendContactEmail(
  payload: ContactData,
  env: Record<string, string | undefined> = process.env
): Promise<{ ok: boolean; status: number; body: { message?: string; error?: string; id?: string } }> {
  const validationError = validateContactPayload(payload)
  if (validationError) {
    return { ok: false, status: 400, body: { error: validationError } }
  }

  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      body: { error: 'RESEND_API_KEY não configurada no servidor.' },
    }
  }

  const normalized = normalizeContactPayload(payload)

  // Destinatário da agência
  const to = env.CONTACT_TO_EMAIL || env.QUOTE_TO_EMAIL || env.RESEND_TO_EMAIL || 'nilton.nhanteme@gmail.com'
  const from = env.RESEND_FROM_EMAIL || 'Imagem 360 <onboarding@resend.dev>'

  const { subject, text, html } = buildAgencyNotificationEmail(normalized)

  console.info('[resend] Enviando mensagem de contacto para', to)

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: normalized.email,
      subject,
      text,
      html,
    }),
  })

  const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string; error?: string }

  if (!response.ok) {
    console.error('[resend] Falha no envio para Resend', {
      status: response.status,
      error: data.message || data.error,
    })
    return {
      ok: false,
      status: response.status,
      body: { error: data.message || data.error || 'Falha ao enviar email pelo serviço Resend.' },
    }
  }

  console.info('[resend] Mensagem enviada com sucesso, id:', data.id)

  // Enviar email de confirmação para o visitante (não bloqueante)
  try {
    const confirmation = buildClientConfirmationEmail(normalized)
    await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [normalized.email],
        reply_to: to,
        subject: confirmation.subject,
        text: confirmation.text,
        html: confirmation.html,
      }),
    }).catch(err => {
      console.warn('[resend] Confirmação ao cliente não enviada:', err?.message || err)
    })
  } catch (err) {
    console.warn('[resend] Erro ao enviar confirmação ao cliente:', err)
  }

  return {
    ok: true,
    status: 200,
    body: {
      id: data.id,
      message: 'Mensagem enviada com sucesso! Entraremos em contacto brevemente.',
    },
  }
}

export async function handleContactApi(
  body: ContactData,
  env: Record<string, string | undefined> = process.env
) {
  try {
    return await sendContactEmail(body, env)
  } catch (error) {
    console.error('[contact-api] Erro interno:', error)
    return {
      ok: false,
      status: 500,
      body: { error: 'Ocorreu um erro interno ao enviar a mensagem. Tente novamente mais tarde.' },
    }
  }
}
