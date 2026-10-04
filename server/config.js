import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Raiz do repositório (server/..)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const resolveFromRoot = (value, fallback) => path.resolve(ROOT, value || fallback)
const isTruthy = value => ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase())

/**
 * Configuração central do servidor.
 * Todos os caminhos são getters "preguiçosos": são lidos de process.env no momento
 * do uso, permitindo que testes e produção os substituam via variáveis de ambiente.
 *
 * Separação de responsabilidades:
 *   código-fonte  → src/, server/
 *   conteúdo      → data/site-content.json        (DATA_DIR)
 *   uploads       → uploads/clients/*.webp         (UPLOADS_DIR)
 *   build público → dist/                          (DIST_DIR)
 */
export const config = {
  get root() {
    return ROOT
  },
  get dataDir() {
    return resolveFromRoot(process.env.DATA_DIR, 'data')
  },
  get contentFile() {
    return path.join(this.dataDir, 'site-content.json')
  },
  // Conteúdo inicial versionado no Git (usado apenas se data/site-content.json não existir)
  get seedFile() {
    return path.join(ROOT, 'data', 'site-content.seed.json')
  },
  get backupsDir() {
    return path.join(this.dataDir, 'backups')
  },
  get uploadsDir() {
    return resolveFromRoot(process.env.UPLOADS_DIR, 'uploads')
  },
  get distDir() {
    return resolveFromRoot(process.env.DIST_DIR, 'dist')
  },
  get port() {
    const port = Number.parseInt(process.env.PORT || '3000', 10)
    return Number.isFinite(port) ? port : 3000
  },
  get host() {
    return process.env.HOST || '127.0.0.1'
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production'
  },
  // Só confiar em X-Forwarded-* / X-Real-IP quando atrás do Nginx
  get trustProxy() {
    return isTruthy(process.env.TRUST_PROXY)
  },
}
