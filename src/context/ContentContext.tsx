import React, { createContext, useContext, useState, useEffect } from 'react'
import defaultContent from '../data/site-content.json'
import { SiteContent, GitHubConfig } from '../types/content'

interface ContentContextType {
  content: SiteContent
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>
  updateContent: (newContent: SiteContent) => void
  resetToOriginal: () => void
  saveDraftLocally: (draft: SiteContent) => void
  clearDraft: () => void
  hasLocalDraft: boolean
  gitHubConfig: GitHubConfig
  saveGitHubConfig: (config: GitHubConfig) => void
  isAdminOpen: boolean
  setIsAdminOpen: (open: boolean) => void
  closeAdmin: () => void
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  adminPassword: string
  setAdminPassword: (pw: string) => void
}

const STORAGE_KEY_CONTENT = 'imagem360_site_content_draft'
const STORAGE_KEY_GITHUB = 'imagem360_github_config'
const STORAGE_KEY_AUTH = 'imagem360_admin_auth'
const STORAGE_KEY_PW = 'imagem360_admin_password'

const defaultGitHubConfig: GitHubConfig = {
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  filePath: 'src/data/site-content.json',
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTENT)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Erro ao ler rascunho salvo:', e)
    }
    return defaultContent as SiteContent
  })

  const [hasLocalDraft, setHasLocalDraft] = useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_KEY_CONTENT)
  })

  const [gitHubConfig, setGitHubConfigState] = useState<GitHubConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GITHUB)
      if (saved) {
        return { ...defaultGitHubConfig, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.error('Erro ao carregar configurações do GitHub:', e)
    }
    return defaultGitHubConfig
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'true'
  })

  const [adminPassword, setAdminPasswordState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_PW) || 'admin360'
  })

  // O painel NUNCA deve abrir sozinho ao carregar o site
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false)

  // Função para fechar o painel e limpar qualquer #admin da barra de endereço
  const closeAdmin = () => {
    setIsAdminOpen(false)
    if (typeof window !== 'undefined' && window.location.hash.includes('admin')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  // Sincroniza abertura se o utilizador colocar #admin na barra de endereço intencionalmente
  useEffect(() => {
    // Se houver #admin residual no primeiro carregamento, limpa imediatamente da barra de endereço
    if (typeof window !== 'undefined' && window.location.hash.includes('admin')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true)
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const updateContent = (newContent: SiteContent) => {
    setContent(newContent)
    try {
      localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(newContent))
      setHasLocalDraft(true)
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e)
    }
  }

  const saveDraftLocally = (draft: SiteContent) => {
    setContent(draft)
    localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(draft))
    setHasLocalDraft(true)
  }

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY_CONTENT)
    setContent(defaultContent as SiteContent)
    setHasLocalDraft(false)
  }

  const resetToOriginal = () => {
    clearDraft()
  }

  const saveGitHubConfig = (config: GitHubConfig) => {
    setGitHubConfigState(config)
    localStorage.setItem(STORAGE_KEY_GITHUB, JSON.stringify(config))
  }

  const setAdminPassword = (pw: string) => {
    const cleanPw = pw.trim()
    setAdminPasswordState(cleanPw)
    localStorage.setItem(STORAGE_KEY_PW, cleanPw)
  }

  const login = (password: string): boolean => {
    const currentActivePassword = localStorage.getItem(STORAGE_KEY_PW) || adminPassword || 'admin360'
    if (password.trim() === currentActivePassword.trim()) {
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEY_AUTH, 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEY_AUTH)
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
        gitHubConfig,
        saveGitHubConfig,
        isAdminOpen,
        setIsAdminOpen,
        closeAdmin,
        isAuthenticated,
        login,
        logout,
        adminPassword,
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
    throw new Error('useSiteContent must be used within a ContentProvider')
  }
  return context
}
