import fs from 'node:fs'
import path from 'node:path'
import { config } from './config.js'

/**
 * Carrega um ficheiro .env simples (KEY=VALUE) para process.env.
 * - Não sobrescreve variáveis já definidas (ex.: definidas pelo PM2 ou pelo shell).
 * - Não faz expansão de variáveis ($VAR), para não corromper hashes de senha.
 */
export function loadEnvFile(file = path.join(config.root, '.env')) {
  if (!fs.existsSync(file)) return false

  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separator = line.indexOf('=')
    if (separator <= 0) continue

    const key = line.slice(0, separator).trim().replace(/^export\s+/, '')
    let value = line.slice(separator + 1).trim()

    const quoted =
      (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))
    if (quoted && value.length >= 2) value = value.slice(1, -1)

    if (process.env[key] === undefined) process.env[key] = value
  }

  return true
}
