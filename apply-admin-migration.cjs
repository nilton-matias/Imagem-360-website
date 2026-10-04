const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()

function file(name) {
  return path.join(ROOT, name)
}

function read(name) {
  const target = file(name)

  if (!fs.existsSync(target)) {
    throw new Error(`Arquivo não encontrado: ${name}`)
  }

  return fs.readFileSync(target, 'utf8')
}

function write(name, content) {
  fs.writeFileSync(file(name), content, 'utf8')
  console.log(`✓ ${name}`)
}

function backup(name) {
  const target = file(name)

  if (!fs.existsSync(target)) return

  const backupPath = `${target}.backup-admin-migration`

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(target, backupPath)
    console.log(`  backup: ${path.basename(backupPath)}`)
  }
}

console.log('')
console.log('==============================================')
console.log(' IMAGEM 360 - ADMIN MIGRATION')
console.log('==============================================')
console.log('')

/*
|--------------------------------------------------------------------------
| 1. ContentContext
|--------------------------------------------------------------------------
*/

backup('src/context/ContentContext.tsx')

const context = `import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import defaultContent from '../data/site-content.json'
import { SiteContent } from '../types/content'

interface ContentContextType {
  content: SiteContent
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>
  updateContent: (newContent: SiteContent) => void
  resetToOriginal: () => void
  saveDraftLocally: (draft: SiteContent) => void
  clearDraft: () => void
  hasLocalDraft: boolean

  isAdminOpen: boolean
  setIsAdminOpen: (open: boolean) => void
  closeAdmin: () => void

  isAuthenticated: boolean
  login: (password: string) => Promise<boolean>
  logout: () => Promise<void>

  setAdminPassword: (password: string) => Promise<boolean>
}

const STORAGE_KEY_CONTENT = 'imagem360_site_content_draft'

const ContentContext = createContext<
  ContentContextType | undefined
>(undefined)

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      'Erro na comunicação com o servidor.'
    )
  }

  return data
}

export const ContentProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(
    defaultContent as SiteContent
  )

  const [hasLocalDraft, setHasLocalDraft] =
    useState<boolean>(false)

  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(false)

  const [isAdminOpen, setIsAdminOpen] =
    useState<boolean>(false)

  /*
   * Carrega o conteúdo publicado pelo servidor.
   *
   * Se a API ainda não estiver disponível durante desenvolvimento,
   * utiliza o conteúdo bundled pelo Vite.
   */
  useEffect(() => {
    let cancelled = false

    async function loadContent() {
      try {
        const response = await fetch('/api/content', {
          credentials: 'same-origin',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Content API unavailable')
        }

        const data = await response.json()

        if (!cancelled && data?.content) {
          setContent(data.content)
        }
      } catch {
        if (!cancelled) {
          setContent(defaultContent as SiteContent)
        }
      }
    }

    loadContent()

    return () => {
      cancelled = true
    }
  }, [])

  /*
   * Verifica a sessão existente no servidor.
   */
  useEffect(() => {
    let cancelled = false

    async function checkSession() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'same-origin',
          cache: 'no-store',
        })

        const data = await response.json().catch(() => ({}))

        if (!cancelled) {
          setIsAuthenticated(Boolean(data?.authenticated))
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false)
        }
      }
    }

    checkSession()

    return () => {
      cancelled = true
    }
  }, [])

  /*
   * Rascunho local.
   *
   * O rascunho é permitido no browser.
   * A autenticação e o conteúdo publicado NÃO são.
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTENT)

      if (saved) {
        setHasLocalDraft(true)
      }
    } catch {
      setHasLocalDraft(false)
    }
  }, [])

  const updateContent = (newContent: SiteContent) => {
    setContent(newContent)

    try {
      localStorage.setItem(
        STORAGE_KEY_CONTENT,
        JSON.stringify(newContent)
      )

      setHasLocalDraft(true)
    } catch (error) {
      console.error(
        'Erro ao guardar rascunho:',
        error
      )
    }
  }

  const saveDraftLocally = (draft: SiteContent) => {
    setContent(draft)

    localStorage.setItem(
      STORAGE_KEY_CONTENT,
      JSON.stringify(draft)
    )

    setHasLocalDraft(true)
  }

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY_CONTENT)

    setHasLocalDraft(false)
  }

  const resetToOriginal = () => {
    setContent(defaultContent as SiteContent)
    clearDraft()
  }

  const login = async (
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.success) {
        setIsAuthenticated(false)
        return false
      }

      setIsAuthenticated(true)

      return true
    } catch (error) {
      console.error(
        'Erro no login:',
        error
      )

      setIsAuthenticated(false)

      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      })
    } catch (error) {
      console.error(
        'Erro ao terminar sessão:',
        error
      )
    } finally {
      setIsAuthenticated(false)
    }
  }

  const setAdminPassword = async (
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        '/api/auth/change-password',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newPassword: password,
          }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.success) {
        return false
      }

      /*
       * O backend encerra a sessão após alteração
       * da senha.
       */
      setIsAuthenticated(false)

      return true
    } catch (error) {
      console.error(
        'Erro ao alterar senha:',
        error
      )

      return false
    }
  }

  const closeAdmin = () => {
    setIsAdminOpen(false)

    if (
      typeof window !== 'undefined' &&
      window.location.hash.includes('admin')
    ) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname +
          window.location.search
      )
    }
  }

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.hash.includes('admin')
    ) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname +
          window.location.search
      )
    }

    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true)
      }
    }

    window.addEventListener(
      'hashchange',
      handleHash
    )

    return () =>
      window.removeEventListener(
        'hashchange',
        handleHash
      )
  }, [])

  return (
    <ContentContext.Provider
      value={{
        content,
        setContent,
        updateContent,
        resetToOriginal,
        saveDraftLocally,
        clearDraft,
        hasLocalDraft,

        isAdminOpen,
        setIsAdminOpen,
        closeAdmin,

        isAuthenticated,
        login,
        logout,

        setAdminPassword,
      }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export function useSiteContent() {
  const context = useContext(ContentContext)

  if (!context) {
    throw new Error(
      'useSiteContent must be used within a ContentProvider'
    )
  }

  return context
}
`

write(
  'src/context/ContentContext.tsx',
  context
)

/*
|--------------------------------------------------------------------------
| 2. githubService
|--------------------------------------------------------------------------
|
| Mantemos o nome do serviço para evitar imports espalhados pelo projeto.
| Mas ele deixa de falar com GitHub.
|--------------------------------------------------------------------------
*/

backup('src/services/githubService.ts')

const githubService = `import { SiteContent } from '../types/content'

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
`

write(
  'src/services/githubService.ts',
  githubService
)

/*
|--------------------------------------------------------------------------
| 3. AdminPanel - alterações cirúrgicas
|--------------------------------------------------------------------------
*/

backup('src/components/AdminPanel.tsx')

let admin = read(
  'src/components/AdminPanel.tsx'
)

/*
 * Remove configuração GitHub do destructuring.
 */
admin = admin.replace(
  /\\n\\s*gitHubConfig,?/,
  ''
)

/*
 * Login síncrono -> assíncrono.
 */
admin = admin.replace(
  `const handleLogin = (e: React.FormEvent) => {
      e.preventDefault()
      if (login(passwordInput)) {`,
  `const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault()

      const authenticated = await login(passwordInput)

      if (authenticated) {`
)

/*
 * Publicação não precisa mais de GitHubConfig.
 */
admin = admin.replace(
  `publishContent(content, gitHubConfig)`,
  `publishContent(content)`
)

/*
 * FileReader/Base64 -> upload HTTP.
 */
const oldUpload = `onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = ev => {
                                setNewBrand(b => ({ ...b, img: ev.target?.result as string }))
                              }
                              reader.readAsDataURL(file)
                            }
                          }}`

const newUpload = `onChange={async e => {
                            const file = e.target.files?.[0]

                            if (!file) return

                            if (file.size > 5 * 1024 * 1024) {
                              alert('A imagem não pode ultrapassar 5 MB.')
                              return
                            }

                            const formData = new FormData()
                            formData.append('file', file)

                            try {
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                credentials: 'same-origin',
                                body: formData,
                              })

                              const data = await response.json().catch(() => ({}))

                              if (!response.ok || !data?.success) {
                                throw new Error(
                                  data?.error ||
                                  data?.message ||
                                  'Falha no upload da imagem.'
                                )
                              }

                              setNewBrand(b => ({
                                ...b,
                                img: data.url,
                              }))
                            } catch (error) {
                              alert(
                                error instanceof Error
                                  ? error.message
                                  : 'Falha no upload da imagem.'
                              )
                            } finally {
                              e.target.value = ''
                            }
                          }}`

if (admin.includes(oldUpload)) {
  admin = admin.replace(
    oldUpload,
    newUpload
) } else {
  console.log(
    '⚠ Upload FileReader não encontrado exatamente. Será necessário revisar manualmente.'
  )
}

/*
 * Password handler:
 * localStorage -> backend.
 *
 * Procuramos o padrão atual do projeto.
 */
admin = admin.replace(
  /const handleChangePassword = \(e: React\.FormEvent\) => \{[\s\S]*?^\s*\}/m,
  match => {
    if (!match.includes('setAdminPassword')) {
      return match
    }

    return match
      .replace(
        'const handleChangePassword = (e: React.FormEvent) => {',
        'const handleChangePassword = async (e: React.FormEvent) => {'
      )
      .replace(
        'if (setAdminPassword(trimmedNew)) {',
        'if (await setAdminPassword(trimmedNew)) {'
      )
  }
)

/*
 * Remover configurações antigas de GitHub caso existam
 * no painel.
 *
 * Não removemos a UI automaticamente porque queremos
 * preservar o layout. O serviço já não utiliza tokens.
 */

write(
  'src/components/AdminPanel.tsx',
  admin
)

/*
|--------------------------------------------------------------------------
| 4. runtime directories
|--------------------------------------------------------------------------
*/

fs.mkdirSync(
  file('runtime/content/backups'),
  { recursive: true }
)

fs.mkdirSync(
  file('runtime/uploads/clients'),
  { recursive: true }
)

console.log('✓ runtime/content')
console.log('✓ runtime/content/backups')
console.log('✓ runtime/uploads/clients')

/*
|--------------------------------------------------------------------------
| 5. .gitignore
|--------------------------------------------------------------------------
*/

const gitignorePath = file('.gitignore')

let gitignore = fs.existsSync(gitignorePath)
  ? fs.readFileSync(gitignorePath, 'utf8')
  : ''

for (const entry of [
  'runtime/',
  'data/',
  '.env',
]) {
  if (!gitignore.split(/\\r?\\n/).includes(entry)) {
    gitignore += `\\n${entry}`
  }
}

fs.writeFileSync(
  gitignorePath,
  gitignore.replace(/^\\n+/, '') + '\\n',
  'utf8'
)

console.log('✓ .gitignore')

console.log('')
console.log('==============================================')
console.log(' MIGRAÇÃO APLICADA')
console.log('==============================================')
console.log('')
console.log('Backups criados com:')
console.log('  *.backup-admin-migration')
console.log('')
console.log('IMPORTANTE:')
console.log('O backend ainda precisa expor:')
console.log('  GET  /api/content')
console.log('  POST /api/auth/login')
console.log('  POST /api/auth/logout')
console.log('  GET  /api/auth/me')
console.log('  POST /api/auth/change-password')
console.log('  POST /api/upload')
console.log('  POST /api/publish')
console.log('')
console.log('Ainda NÃO faça git commit.')
console.log('')