import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SESSIONS_FILE = path.resolve(ROOT, 'data/.sessions.json')

// Rate limiting para login (IP -> { count, lockedUntil })
const loginAttempts = new Map()

// Armazenamento de sessões ativas (token -> { createdAt, expiresAt })
const activeSessions = new Map()

// Carrega sessões existentes do disco na inicialização
function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'))
      const now = Date.now()
      for (const [token, session] of Object.entries(data)) {
        if (session && session.expiresAt > now) {
          activeSessions.set(token, session)
        }
      }
    }
  } catch (err) {
    console.warn('[auth] Aviso ao carregar sessões:', err.message)
  }
}

// Salva sessões no disco
function saveSessions() {
  try {
    const obj = {}
    const now = Date.now()
    for (const [token, session] of activeSessions.entries()) {
      if (session.expiresAt > now) {
        obj[token] = session
      }
    }
    const dataDir = path.dirname(SESSIONS_FILE)
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf8')
  } catch (err) {
    console.warn('[auth] Aviso ao salvar sessões:', err.message)
  }
}

loadSessions()

// Obter a senha atual do admin (lida do .env ou default 'admin360')
export function getAdminPassword() {
  return (process.env.ADMIN_PASSWORD || 'admin360').trim()
}

// Parse de cookies do request
export function parseCookies(req) {
  const list = {}
  const rc = req.headers.cookie
  if (!rc) return list
  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURIComponent(parts.join('='))
  })
  return list
}

// Verifica se a requisição está autenticada
export function isAuthenticated(req) {
  const cookies = parseCookies(req)
  const token = cookies.admin_session || (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return false

  const session = activeSessions.get(token)
  if (!session) return false

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token)
    saveSessions()
    return false
  }

  return true
}

// Middleware de autenticação
export function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Não autorizado. Autentique-se no Painel Admin.' }))
    return false
  }
  return true
}

// Proteção CSRF básica: verifica origin/referer em requisições mutáveis
export function verifyCsrf(req, res) {
  const origin = req.headers.origin || req.headers.referer
  const host = req.headers.host
  if (!origin || !host) return true // Requests sem origin/referer (como cURL local) passam
  try {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Origem da requisição não permitida (CSRF).' }))
      return false
    }
  } catch {
    // Se a URL for inválida
    return true
  }
  return true
}

// Handler para /api/auth/login
export async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Método não permitido.' }))
    return
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  const now = Date.now()

  // Rate limiting check
  const attempt = loginAttempts.get(clientIp) || { count: 0, lockedUntil: 0 }
  if (attempt.lockedUntil > now) {
    const waitSec = Math.ceil((attempt.lockedUntil - now) / 1000)
    res.statusCode = 429
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      error: `Muitas tentativas incorretas. Tente novamente em ${waitSec} segundos.`,
    }))
    return
  }

  let body = {}
  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
  } catch {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'JSON inválido.' }))
    return
  }

  const password = (body.password || '').trim()
  const currentPassword = getAdminPassword()

  // Comparação segura de senha
  const isMatch = password.length === currentPassword.length &&
    crypto.timingSafeEqual(Buffer.from(password), Buffer.from(currentPassword))

  if (!isMatch) {
    attempt.count += 1
    if (attempt.count >= 5) {
      attempt.lockedUntil = now + 15 * 60 * 1000 // Bloqueio por 15 minutos
      loginAttempts.set(clientIp, attempt)
      res.statusCode = 429
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: 'Limite de 5 tentativas excedido. Bloqueado por 15 minutos.',
      }))
      return
    }
    loginAttempts.set(clientIp, attempt)
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      error: `Senha incorreta. Restam ${5 - attempt.count} tentativas.`,
    }))
    return
  }

  // Login bem sucedido: limpa tentativas
  loginAttempts.delete(clientIp)

  // Gera token de sessão seguro
  const token = crypto.randomBytes(32).toString('hex')
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 dias
  activeSessions.set(token, {
    createdAt: now,
    expiresAt: now + maxAge,
    ip: clientIp,
  })
  saveSessions()

  const isProd = process.env.NODE_ENV === 'production'
  const cookieHeader = [
    `admin_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge / 1000}`,
    isProd ? 'Secure' : '',
  ].filter(Boolean).join('; ')

  res.statusCode = 200
  res.setHeader('Set-Cookie', cookieHeader)
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    success: true,
    message: 'Autenticado com sucesso!',
    token, // também retornado para fallback
  }))
}

// Handler para /api/auth/logout
export async function handleLogout(req, res) {
  const cookies = parseCookies(req)
  const token = cookies.admin_session
  if (token) {
    activeSessions.delete(token)
    saveSessions()
  }

  res.statusCode = 200
  res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ success: true, message: 'Sessão encerrada com sucesso.' }))
}

// Handler para /api/auth/me
export async function handleMe(req, res) {
  const authenticated = isAuthenticated(req)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ authenticated }))
}

// Handler para /api/auth/change-password
export async function handleChangePassword(req, res) {
  if (!requireAuth(req, res)) return
  if (!verifyCsrf(req, res)) return

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Método não permitido.' }))
    return
  }

  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
    const newPassword = (body.newPassword || '').trim()

    if (!newPassword || newPassword.length < 4) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'A nova senha deve ter pelo menos 4 caracteres.' }))
      return
    }

    // Atualiza a variável no ambiente em execução
    process.env.ADMIN_PASSWORD = newPassword

    // Atualiza ou adiciona ADMIN_PASSWORD no arquivo .env
    const envFile = path.resolve(ROOT, '.env')
    let envContent = ''
    if (fs.existsSync(envFile)) {
      envContent = fs.readFileSync(envFile, 'utf8')
    }

    if (envContent.includes('ADMIN_PASSWORD=')) {
      envContent = envContent.replace(/ADMIN_PASSWORD=.*(\r?\n|$)/, `ADMIN_PASSWORD=${newPassword}$1`)
    } else {
      envContent += `\nADMIN_PASSWORD=${newPassword}\n`
    }
    fs.writeFileSync(envFile, envContent, 'utf8')

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ success: true, message: 'Senha do administrador alterada com sucesso!' }))
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Erro ao atualizar a senha: ' + err.message }))
  }
}
