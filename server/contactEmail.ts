import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'

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

// Carrega o logotipo oficial da Imagem 360 em base64 para inclusão inline (CID)
// DEPOIS:
// Carrega o logotipo oficial da Imagem 360 em base64
let LOGO_BASE64 = ''
try {
  const logoPath = path.resolve(process.cwd(), 'src/imports/logo_novo_360.png')
  if (fs.existsSync(logoPath)) {
    LOGO_BASE64 = fs.readFileSync(logoPath).toString('base64')
  }
} catch (e) {
  console.warn('[email] Aviso ao ler logotipo:', e)
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
      <td style="padding:10px 14px;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;width:150px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(label)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;line-height:1.5;">${escapeHtml(value || '-')}</td>
    </tr>
  `
}

export function normalizeContactPayload(payload: ContactData) {
  return {
    nome: (payload.nome || payload.name || '').trim(),
    email: (payload.email || '').trim().toLowerCase(),
    assunto: (payload.assunto || payload.subject || 'Contacto').trim(),
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

/**
 * 1. Email de notificação para a agência
 * Assunto: IMAGEM 360 - {assunto}
 * Header: Claro / Branco com Logo Oficial
 * Sem menção de "Enviado via Website Imagem 360"
 */
function buildAgencyNotificationEmail(data: ReturnType<typeof normalizeContactPayload>) {
  const subject = `IMAGEM 360 - ${data.assunto}`

  const text = [
    'Nova mensagem recebida através do website:',
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
    <html lang="pt">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f7fa;color:#0f172a;padding:28px 16px;margin:0;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.04);">
        
              <!-- HEADER CLARO COM O LOGOTIPO OFICIAL PEQUENO AO LADO DO TÍTULO -->
        <div style="background-color:#ffffff;padding:20px 32px;border-bottom:2px solid #e8384a;">
          <table style="width:100%;border-collapse:collapse;" role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:48px;vertical-align:middle;padding-right:14px;">
                <img src="https://media.githubusercontent.com/media/nilton-matias/Imagem-360-website/main/public/logo_360.png" alt="Imagem 360" width="42" height="42" style="display:block;width:42px;height:42px;object-fit:contain;border:0;outline:none;" />
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#e8384a;line-height:1.2;">IMAGEM 360</div>
                <h1 style="color:#0f172a;margin:2px 0 0 0;font-size:18px;font-weight:800;line-height:1.2;">Nova Mensagem de Contacto</h1>
              </td>
            </tr>
          </table>
        </div>

        <!-- CORPO CLARO -->
        <div style="padding:28px 32px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            ${row('Nome', data.nome)}
            ${row('Email', data.email)}
            ${data.telefone ? row('Telefone', data.telefone) : ''}
            ${row('Assunto', data.assunto)}
          </table>

          <div style="margin-top:20px;padding:18px 20px;background-color:#f8fafc;border-radius:10px;border-left:4px solid #e8384a;border:1px solid #edf2f7;border-left:4px solid #e8384a;">
            <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#e8384a;">Mensagem:</p>
            <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.mensagem)}</p>
          </div>

          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #edf2f7;">
            <a href="mailto:${escapeHtml(data.email)}?subject=Re:%20${encodeURIComponent(subject)}" style="display:inline-block;background-color:#e8384a;color:#ffffff;text-decoration:none;padding:11px 24px;border-radius:999px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">Responder a ${escapeHtml(data.nome)}</a>
          </div>
        </div>

      </div>
    </body>
    </html>
  `

  return { subject, text, html }
}

/**
 * 2. Email de confirmação para o visitante
 * Assunto: IMAGEM 360 - {assunto}
 * Header: Claro / Branco com Logo Oficial
 * Sem menção de "Enviado via Website Imagem 360"
 */
function buildClientConfirmationEmail(data: ReturnType<typeof normalizeContactPayload>) {
  const subject = `IMAGEM 360 - ${data.assunto}`

  const text = [
    `Olá ${data.nome},`,
    '',
    'Recebemos a sua mensagem e a nossa equipa entrará em contacto consigo muito em breve.',
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
    <html lang="pt">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f7fa;color:#0f172a;padding:28px 16px;margin:0;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.04);">
        
                <!-- HEADER CLARO COM O LOGOTIPO OFICIAL PEQUENO AO LADO DO TÍTULO -->
        <div style="background-color:#ffffff;padding:20px 32px;border-bottom:2px solid #e8384a;">
          <table style="width:100%;border-collapse:collapse;" role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:44px;vertical-align:middle;padding-right:14px;">
                <img src="https://media.githubusercontent.com/media/nilton-matias/Imagem-360-website/main/public/logo_360.png" alt="Imagem 360" width="38" height="38" style="display:block;width:38px;height:38px;object-fit:contain;border:0;outline:none;" />
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#e8384a;line-height:1.2;">IMAGEM 360</div>
                <h1 style="color:#0f172a;margin:2px 0 0 0;font-size:18px;font-weight:800;line-height:1.2;">Mensagem Recebida com Sucesso</h1>
              </td>
            </tr>
          </table>
        </div>

        <!-- CORPO CLARO -->
        <div style="padding:28px 32px;background-color:#ffffff;color:#334155;font-size:14px;line-height:1.6;">
          <p style="margin-top:0;">Olá <strong>${escapeHtml(data.nome)}</strong>,</p>
          <p>Agradecemos o seu contacto através da <strong>Imagem 360</strong>. A nossa equipa já recebeu a sua mensagem e entrará em contacto consigo com a maior brevidade possível.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background-color:#f8fafc;border:1px solid #edf2f7;border-radius:8px;">
            ${row('Assunto', data.assunto)}
            ${row('Email de resposta', data.email)}
          </table>

          <p style="margin-bottom:0;color:#64748b;margin-top:24px;">
            Com os melhores cumprimentos,<br>
            <strong style="color:#0f172a;">Equipa Imagem 360</strong><br>
            <span style="font-size:12px;color:#94a3b8;">Av. Maguiguana, 845, Maputo, Moçambique • team@imagem360.agency</span>
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

  const normalized = normalizeContactPayload(payload)

  // Destinatário da agência
  const rawTo = (env.CONTACT_TO_EMAIL || env.QUOTE_TO_EMAIL || env.SMTP_USER || 'nilton.nhanteme@gmail.com').trim()
  const to = rawTo.includes('@') && rawTo.includes('.') ? rawTo : 'nilton.nhanteme@gmail.com'

  const { subject, text, html } = buildAgencyNotificationEmail(normalized)

  // 1. Envio prioritário via Nodemailer SMTP (Google Workspace / Gmail)
  if (env.SMTP_USER && env.SMTP_PASS) {
    try {
      const port = parseInt(env.SMTP_PORT || '465', 10)
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })

      const fromName = env.SMTP_FROM_NAME || 'Imagem 360 Website'
      const info = await transporter.sendMail({
        from: `"${fromName}" <${env.SMTP_USER}>`,
        to,
        replyTo: normalized.email,
        subject,
        text,
        html,
      })

      console.info('[smtp] Mensagem enviada com sucesso via Nodemailer, messageId:', info.messageId)

      // Envio de confirmação ao cliente
      try {
        const confirmation = buildClientConfirmationEmail(normalized)
        await transporter.sendMail({
          from: `"${fromName}" <${env.SMTP_USER}>`,
          to: normalized.email,
          replyTo: to,
          subject: confirmation.subject,
          text: confirmation.text,
          html: confirmation.html,
        }).catch(err => {
          console.warn('[smtp] Aviso: Confirmação ao cliente não enviada:', err?.message || err)
        })
      } catch (err) {
        console.warn('[smtp] Aviso: Erro ao enviar confirmação ao cliente:', err)
      }

      return {
        ok: true,
        status: 200,
        body: {
          id: info.messageId,
          message: 'Mensagem enviada com sucesso! Entraremos em contacto brevemente.',
        },
      }
    } catch (smtpErr: any) {
      console.error('[smtp] Falha ao enviar via Nodemailer SMTP:', smtpErr)
      return {
        ok: false,
        status: 500,
        body: { error: 'Erro ao enviar email pelo servidor SMTP: ' + (smtpErr?.message || '') },
      }
    }
  }

  // 2. Fallback via Resend se RESEND_API_KEY estiver configurada
  const apiKey = env.RESEND_API_KEY
  if (apiKey) {
    const from = env.RESEND_FROM_EMAIL || 'Imagem 360 <onboarding@resend.dev>'
    console.info('[resend] Enviando mensagem de contacto para', to, 'com assunto:', subject)

    const attachments = LOGO_BASE64
      ? [
          {
            filename: 'logo_novo_360.png',
            content: LOGO_BASE64,
            content_type: 'image/png',
            content_id: 'logo360',
          },
        ]
      : undefined

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
        attachments,
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
          attachments,
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

  return {
    ok: false,
    status: 500,
    body: { error: 'Nenhum serviço de envio de email configurado (configure SMTP_USER e SMTP_PASS no .env).' },
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
