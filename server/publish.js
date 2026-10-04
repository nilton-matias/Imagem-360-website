import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { requireAuth, verifyCsrf } from './auth.js'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_FILE = path.resolve(ROOT, 'data/site-content.json')
const SRC_DATA_FILE = path.resolve(ROOT, 'src/data/site-content.json')
const BACKUPS_DIR = path.resolve(ROOT, 'data/backups')

if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true })
}

// Bloqueio de concorrência para evitar múltiplos builds simultâneos
let isBuildLocked = false

// Valida minimamente a integridade do JSON de conteúdo
function validateContent(content) {
  if (!content || typeof content !== 'object') return false
  if (!Array.isArray(content.stats)) return false
  if (!Array.isArray(content.clients)) return false
  if (!content.copy || typeof content.copy !== 'object') return false
  return true
}

// Cria backup do arquivo atual
function createBackup() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(BACKUPS_DIR, `site-content-${timestamp}.json`)
    fs.copyFileSync(DATA_FILE, backupPath)

    // Manter no máximo os 15 backups mais recentes
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('site-content-') && f.endsWith('.json'))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time)

    if (files.length > 15) {
      for (const oldFile of files.slice(15)) {
        try {
          fs.unlinkSync(path.join(BACKUPS_DIR, oldFile.name))
        } catch {
          // ignora
        }
      }
    }

    return backupPath
  } catch (err) {
    console.warn('[publish] Aviso ao criar backup:', err.message)
    return null
  }
}

// Restaura backup em caso de falha de build
function restoreBackup(backupPath) {
  if (!backupPath || !fs.existsSync(backupPath)) return false
  try {
    fs.copyFileSync(backupPath, DATA_FILE)
    if (fs.existsSync(path.dirname(SRC_DATA_FILE))) {
      fs.copyFileSync(backupPath, SRC_DATA_FILE)
    }
    console.info('[publish] Rollback executado: backup restaurado com sucesso.')
    return true
  } catch (err) {
    console.error('[publish] Erro crítico ao restaurar backup:', err)
    return false
  }
}

// Migra qualquer base64 residual no payload para arquivo antes de salvar
async function sanitizeClients(clients) {
  const uploadsDir = path.resolve(ROOT, 'public/uploads/clients')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

  const sanitized = []
  for (let i = 0; i < clients.length; i++) {
    const client = { ...clients[i] }
    if (client.img && client.img.startsWith('data:image/')) {
      try {
        const matches = client.img.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/)
        if (matches) {
          const ext = matches[1].replace('jpeg', 'jpg').split('+')[0]
          const base64Data = matches[2]
          const buffer = Buffer.from(base64Data, 'base64')
          const filename = `migrated-${Date.now()}-${i}.${ext}`
          const filePath = path.join(uploadsDir, filename)
          fs.writeFileSync(filePath, buffer)
          client.img = `/uploads/clients/${filename}`
          console.info(`[publish] Base64 da marca ${client.name} convertido para ${client.img}`)
        }
      } catch (err) {
        console.warn(`[publish] Erro ao converter Base64 da marca ${client.name}:`, err.message)
      }
    }
    sanitized.push(client)
  }
  return sanitized
}

export async function handlePublish(req, res) {
  if (!requireAuth(req, res)) return
  if (!verifyCsrf(req, res)) return

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Método não permitido. Use POST.' }))
    return
  }

  // Verificação de concorrência
  if (isBuildLocked) {
    res.statusCode = 409
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      error: 'Outra publicação já está em processamento. Aguarde alguns instantes.',
    }))
    return
  }

  isBuildLocked = true
  let backupPath = null

  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const rawBody = Buffer.concat(chunks).toString('utf8')
    const body = JSON.parse(rawBody || '{}')
    const content = body?.content

    if (!validateContent(content)) {
      isBuildLocked = false
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Estrutura de dados inválida. A publicação foi rejeitada.' }))
      return
    }

    // 1. Converte qualquer base64 para arquivos em uploads
    content.clients = await sanitizeClients(content.clients)

    // 2. Cria backup do conteúdo anterior
    backupPath = createBackup()

    // 3. Salva novo conteúdo em data/site-content.json e sincroniza com src/data/site-content.json
    const formattedJson = JSON.stringify(content, null, 2)
    fs.writeFileSync(DATA_FILE, formattedJson, 'utf8')
    if (fs.existsSync(path.dirname(SRC_DATA_FILE))) {
      fs.writeFileSync(SRC_DATA_FILE, formattedJson, 'utf8')
    }

    // 4. Executa npm run build
    console.info('[publish] Iniciando compilação do site (npm run build)...')
    const startTime = Date.now()

    let buildStdout = ''
    let buildStderr = ''
    try {
      const result = await execAsync('npm run build', {
        cwd: ROOT,
        timeout: 120000, // 2 minutos máximo
      })
      buildStdout = result.stdout || ''
      buildStderr = result.stderr || ''
    } catch (buildErr) {
      console.error('[publish] Erro durante o build:', buildErr.message)
      // Executa rollback imediato
      restoreBackup(backupPath)
      isBuildLocked = false

      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: 'A compilação do site falhou. O conteúdo anterior foi restaurado automaticamente.',
        details: buildErr.stderr || buildErr.stdout || buildErr.message,
      }))
      return
    }

    // 5. Verifica se o build gerou os arquivos esperados
    const distIndex = path.resolve(ROOT, 'dist/index.html')
    if (!fs.existsSync(distIndex)) {
      restoreBackup(backupPath)
      isBuildLocked = false

      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: 'O arquivo dist/index.html não foi gerado. O conteúdo anterior foi restaurado.',
      }))
      return
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.info(`[publish] Build concluído com sucesso em ${duration}s!`)

    isBuildLocked = false
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      success: true,
      message: `Publicação concluída com sucesso em ${duration}s! As alterações estão ativas no site.`,
    }))
  } catch (err) {
    if (backupPath) restoreBackup(backupPath)
    isBuildLocked = false
    console.error('[publish] Erro geral:', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Erro interno ao processar a publicação: ' + err.message }))
  }
}
