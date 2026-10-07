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
  login: (password: string) => boolean
  logout: () => void

  setAdminPassword: (password: string) => boolean
}

const STORAGE_KEY_CONTENT = 'imagem360_site_content_draft'
const STORAGE_KEY_PUBLISHED = 'imagem360_site_content_published'
const STORAGE_KEY_AUTH = 'imagem360_admin_auth'
const STORAGE_KEY_PW = 'imagem360_admin_password'

const ContentContext = createContext<
  ContentContextType | undefined
>(undefined)

export const ContentProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY_CONTENT)
      if (draft) {
        return JSON.parse(draft)
      }
      const published = localStorage.getItem(STORAGE_KEY_PUBLISHED)
      if (published) {
        return JSON.parse(published)
      }
    } catch (e) {
      console.error('Erro ao ler rascunho/cache local:', e)
    }
    return defaultContent as SiteContent
  })

  const [hasLocalDraft, setHasLocalDraft] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY_CONTENT))
    } catch {
      return false
    }
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTH) === 'true'
    } catch {
      return false
    }
  })

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.hash.includes('admin') ||
        window.location.pathname.includes('admin')
      )
    }
    return false
  })

  // Sincroniza conteúdo publicado do servidor AWS / local
  useEffect(() => {
    let cancelled = false
    async function loadServerContent() {
      try {
        const response = await fetch('/api/content?t=' + Date.now(), {
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' },
        })
        if (!response.ok) return
        const data = await response.json()
        if (!cancelled && data?.content) {
          // Atualiza o cache do conteúdo publicado
          try {
            localStorage.setItem(STORAGE_KEY_PUBLISHED, JSON.stringify(data.content))
          } catch {}

          // Se o utilizador não tiver um rascunho local pendente, atualiza o ecrã
          const hasDraft = Boolean(localStorage.getItem(STORAGE_KEY_CONTENT))
          if (!hasDraft) {
            setContent(data.content)
          }
        }
      } catch {}
    }
    loadServerContent()
    return () => {
      cancelled = true
    }
  }, [])

  // Sincroniza abertura via URL (hash ou rota /admin)
  useEffect(() => {
    const checkUrl = () => {
      if (typeof window !== 'undefined') {
        if (
          window.location.hash.includes('admin') ||
          window.location.pathname.includes('admin')
        ) {
          setIsAdminOpen(true)
        }
      }
    }

    checkUrl()
    window.addEventListener('hashchange', checkUrl)
    window.addEventListener('popstate', checkUrl)
    return () => {
      window.removeEventListener('hashchange', checkUrl)
      window.removeEventListener('popstate', checkUrl)
    }
  }, [])

  const closeAdmin = () => {
    setIsAdminOpen(false)
    if (typeof window !== 'undefined') {
      if (
        window.location.hash.includes('admin') ||
        window.location.pathname.includes('admin')
      ) {
        window.history.replaceState(null, '', '/')
      }
    }
  }

  const updateContent = (newContent: SiteContent) => {
    setContent(newContent)
    try {
      localStorage.setItem(
        STORAGE_KEY_CONTENT,
        JSON.stringify(newContent)
      )
      setHasLocalDraft(true)
    } catch (error) {
      console.error('Erro ao guardar rascunho:', error)
    }
  }

  const saveDraftLocally = (draft: SiteContent) => {
    setContent(draft)
    try {
      localStorage.setItem(
        STORAGE_KEY_CONTENT,
        JSON.stringify(draft)
      )
      setHasLocalDraft(true)
    } catch (e) {
      console.error('Erro ao salvar rascunho:', e)
    }
  }

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_CONTENT)
      // Guarda a versão publicada atual no cache permanente
      localStorage.setItem(STORAGE_KEY_PUBLISHED, JSON.stringify(content))
    } catch {}
    // Mantém o conteúdo atual no ecrã (NÃO reverte para os valores default antigos)
    setHasLocalDraft(false)
  }

  const resetToOriginal = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_CONTENT)
      localStorage.removeItem(STORAGE_KEY_PUBLISHED)
    } catch {}
    setContent(defaultContent as SiteContent)
    setHasLocalDraft(false)
  }

  const login = (password: string): boolean => {
    const currentActivePassword =
      localStorage.getItem(STORAGE_KEY_PW) || 'admin360'

    if (password.trim() === currentActivePassword.trim()) {
      setIsAuthenticated(true)
      try {
        localStorage.setItem(STORAGE_KEY_AUTH, 'true')
      } catch {}
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH)
    } catch {}
  }

  const setAdminPassword = (password: string): boolean => {
    const cleanPw = password.trim()
    if (!cleanPw) return false
    try {
      localStorage.setItem(STORAGE_KEY_PW, cleanPw)
      return true
    } catch {
      return false
    }
  }

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
