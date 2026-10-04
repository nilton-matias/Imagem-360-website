import React, {
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
