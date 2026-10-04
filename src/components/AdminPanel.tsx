import React, { useState } from 'react'
import { useSiteContent } from '../context/ContentContext'
import { commitContentToGitHub, testGitHubConnection } from '../services/githubService'
import { resolveImageSource } from '../utils/imageMap'
import { ClientItem, StatItem } from '../types/content'

export default function AdminPanel() {
  const {
    content,
    updateContent,
    saveDraftLocally,
    clearDraft,
    hasLocalDraft,
    gitHubConfig,
    saveGitHubConfig,
    isAdminOpen,
    setIsAdminOpen,
    isAuthenticated,
    login,
    logout,
    adminPassword,
    setAdminPassword,
  } = useSiteContent()

  const [activeTab, setActiveTab] = useState<'marcas' | 'numeros' | 'produto' | 'textos' | 'github'>('marcas')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string; url?: string }>({
    type: null,
    message: '',
  })
  const [testingConnection, setTestingConnection] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  // Estados locais para edição rápida de formulários
  const [newBrand, setNewBrand] = useState({ name: '', img: '' })
  const [newStat, setNewStat] = useState<Omit<StatItem, 'id'>>({
    value: 10,
    suffix: '+',
    prefix: false,
    labelPt: '',
    labelEn: '',
  })

  if (!isAdminOpen) return null

  // Tela de Login se não estiver autenticado
  if (!isAuthenticated) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault()
      if (login(passwordInput)) {
        setLoginError('')
        setPasswordInput('')
      } else {
        setLoginError('Senha incorreta. A senha padrão inicial é "admin360".')
      }
    }

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#121016', border: '1px solid rgba(232, 56, 74, 0.4)', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)', color: '#fff', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(232,56,74,0.15)', border: '1px solid #e8384a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#e8384a', fontSize: '24px' }}>
            🔐
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>Painel Administrativo</h2>
          <p style={{ fontSize: '13px', color: '#a09bb0', marginBottom: '24px', lineHeight: 1.5 }}>
            Acesso para edição de marcas, métricas, textos e integração direta com GitHub & Vercel.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              placeholder="Digite a senha de administrador"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              autoFocus
              style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
            />
            {loginError && <p style={{ color: '#ff5c5c', fontSize: '12px', margin: 0 }}>{loginError}</p>}
            <button
              type="submit"
              style={{ padding: '14px', background: '#e8384a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 4px 20px rgba(232,56,74,0.4)', transition: 'background 0.2s' }}
            >
              Entrar no Painel
            </button>
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer', padding: '8px' }}
            >
              Fechar e voltar ao site
            </button>
          </form>
          <div style={{ marginTop: '20px', fontSize: '11px', color: '#666', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            Dica inicial: A senha padrão de fábrica é <strong style={{ color: '#e8384a' }}>admin360</strong>. Você pode alterá-la na aba de configurações.
          </div>
        </div>
      </div>
    )
  }

  // Ações do painel
  const handleSaveToGitHub = async () => {
    if (!gitHubConfig.token || !gitHubConfig.owner || !gitHubConfig.repo) {
      setActiveTab('github')
      setSaveStatus({
        type: 'error',
        message: 'Por favor, configure o Token e Repositório do GitHub na aba "GitHub & Vercel" antes de salvar.',
      })
      return
    }

    setSaveStatus({ type: 'loading', message: 'Fazendo commit no GitHub e acionando o build na Vercel...' })

    const res = await commitContentToGitHub(gitHubConfig, content)
    if (res.success) {
      setSaveStatus({
        type: 'success',
        message: res.message,
        url: res.commitUrl,
      })
      // Mantém rascunho local limpo pois já foi commitado
      clearDraft()
    } else {
      setSaveStatus({ type: 'error', message: res.message })
    }
  }

  const handleTestPreview = () => {
    saveDraftLocally(content)
    setSaveStatus({
      type: 'success',
      message: 'Prévia salva localmente com sucesso! As alterações já estão visíveis no site para você testar.',
    })
  }

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', 'site-content.json')
    dlAnchor.click()
    dlAnchor.remove()
  }

  // Manipulação de Marcas
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrand.name.trim()) return

    const brandItem: ClientItem = {
      id: 'brand_' + Date.now(),
      name: newBrand.name,
      img: newBrand.img || 'imgLAM',
    }

    const updated = {
      ...content,
      clients: [...content.clients, brandItem],
    }
    updateContent(updated)
    setNewBrand({ name: '', img: '' })
  }

  const handleRemoveBrand = (id: string) => {
    const updated = {
      ...content,
      clients: content.clients.filter(c => c.id !== id),
    }
    updateContent(updated)
  }

  const handleBrandImageUpload = (e: React.ChangeEvent<HTMLInputElement>, brandId?: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const dataUrl = event.target?.result as string
      if (brandId) {
        // Atualiza marca existente
        const updated = {
          ...content,
          clients: content.clients.map(c => (c.id === brandId ? { ...c, img: dataUrl } : c)),
        }
        updateContent(updated)
      } else {
        // Novo logo
        setNewBrand(prev => ({ ...prev, img: dataUrl }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Manipulação de Números / Estatísticas
  const handleAddStat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStat.labelPt.trim()) return

    const statItem: StatItem = {
      id: 'stat_' + Date.now(),
      ...newStat,
    }

    const updated = {
      ...content,
      stats: [...content.stats, statItem],
    }
    updateContent(updated)
    setNewStat({ value: 10, suffix: '+', prefix: false, labelPt: '', labelEn: '' })
  }

  const handleRemoveStat = (id: string) => {
    const updated = {
      ...content,
      stats: content.stats.filter(s => s.id !== id),
    }
    updateContent(updated)
  }

  const handleUpdateStat = (id: string, field: keyof StatItem, val: any) => {
    const updated = {
      ...content,
      stats: content.stats.map(s => (s.id === id ? { ...s, [field]: val } : s)),
    }
    updateContent(updated)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 4, 8, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        color: '#ede9f0',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
      }}
    >
      {/* Barra Superior */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          background: '#0d0b13',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e8384a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '15px' }}>
            360
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Painel de Gestão de Conteúdo
              {hasLocalDraft && (
                <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '99px', background: '#f59e0b', color: '#000', fontWeight: 800, letterSpacing: '0.05em' }}>
                  Prévia Ativa
                </span>
              )}
            </h1>
            <p style={{ fontSize: '11px', color: '#8c859d', margin: 0 }}>Edição de marcas, números e textos do site com deploy via GitHub e Vercel</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleTestPreview}
            title="Salva na memória do seu navegador para você visualizar o site agora mesmo"
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>👁️</span> Testar Prévia ao Vivo
          </button>

          <button
            onClick={handleDownloadJson}
            title="Baixar arquivo JSON atual para seu computador"
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📥</span> Baixar JSON
          </button>

          <button
            onClick={handleSaveToGitHub}
            title="Commitar no repositório GitHub e acionar publicação automática no Vercel"
            style={{ padding: '8px 20px', background: '#e8384a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 16px rgba(232,56,74,0.4)' }}
          >
            <span>🚀</span> Publicar no GitHub / Vercel
          </button>

          <button
            onClick={() => setIsAdminOpen(false)}
            style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Fechar Painel e Ver Site"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Alerta de Status */}
      {saveStatus.type && (
        <div
          style={{
            padding: '12px 28px',
            background: saveStatus.type === 'success' ? '#064e3b' : saveStatus.type === 'error' ? '#7f1d1d' : '#1e3a8a',
            color: '#fff',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>
            <strong>{saveStatus.type === 'success' ? '✓ Sucesso: ' : saveStatus.type === 'error' ? '✕ Atenção: ' : '⏳ Processando: '}</strong>
            {saveStatus.message}
            {saveStatus.url && (
              <a href={saveStatus.url} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', marginLeft: '10px', textDecoration: 'underline' }}>
                Ver commit no GitHub →
              </a>
            )}
          </div>
          <button onClick={() => setSaveStatus({ type: null, message: '' })} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
            ✕
          </button>
        </div>
      )}

      {/* Abas e Conteúdo */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Menu Lateral de Abas */}
        <aside style={{ width: '240px', background: '#09080e', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'marcas', label: 'Marcas Parceiras', icon: '🏢' },
            { id: 'numeros', label: 'Números de Impacto', icon: '📊' },
            { id: 'produto', label: '360-Message & Links', icon: '🚀' },
            { id: 'textos', label: 'Textos & Seções', icon: '📝' },
            { id: 'github', label: 'GitHub & Vercel', icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(232,56,74,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#e8384a' : '#a09bb0',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '13px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <button
              onClick={logout}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: '#888', border: 'none', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', textAlign: 'center' }}
            >
              Sair do Modo Admin
            </button>
          </div>
        </aside>

        {/* Área Principal de Configurações */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: '#0e0c14' }}>
          {/* ABA: MARCAS */}
          {activeTab === 'marcas' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Marcas que Confiam em Nós</h2>
                  <p style={{ fontSize: '13px', color: '#9a94a8', margin: 0 }}>Gerencie os logotipos e nomes das empresas parceiras exibidas na página inicial.</p>
                </div>
              </div>

              {/* Formulário para Adicionar Nova Marca */}
              <div style={{ background: '#14121b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e8384a' }}>
                  + Adicionar Nova Marca
                </h3>
                <form onSubmit={handleAddBrand} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '14px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Nome da Empresa / Marca</label>
                    <input
                      type="text"
                      placeholder="Ex: Banco Comercial ou Empresa XYZ"
                      value={newBrand.name}
                      onChange={e => setNewBrand({ ...newBrand, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Logotipo (Upload ou Link URL)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Link da imagem ou envie abaixo"
                        value={newBrand.img.startsWith('data:') ? '[Imagem Carregada do Computador]' : newBrand.img}
                        onChange={e => setNewBrand({ ...newBrand, img: e.target.value })}
                        style={{ flex: 1, padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                      <label style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        📁 Carregar
                        <input type="file" accept="image/*" onChange={e => handleBrandImageUpload(e)} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ padding: '12px 24px', background: '#e8384a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', height: '44px' }}
                  >
                    Adicionar Marca
                  </button>
                </form>
              </div>

              {/* Lista de Marcas Cadastradas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {content.clients.map((client, idx) => (
                  <div
                    key={client.id || idx}
                    style={{
                      background: '#14121b',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '70px',
                        background: '#ffffff',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={resolveImageSource(client.img)}
                        alt={client.name}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        onError={e => {
                          // Fallback se URL falhar
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={client.name}
                        onChange={e => {
                          const updated = {
                            ...content,
                            clients: content.clients.map(c => (c.id === client.id ? { ...c, name: e.target.value } : c)),
                          }
                          updateContent(updated)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', color: '#93c5fd', cursor: 'pointer', textDecoration: 'underline' }}>
                        Trocar logo
                        <input type="file" accept="image/*" onChange={e => handleBrandImageUpload(e, client.id)} style={{ display: 'none' }} />
                      </label>

                      <button
                        onClick={() => handleRemoveBrand(client.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', padding: '4px 8px' }}
                      >
                        Excluir 🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA: NÚMEROS DE IMPACTO */}
          {activeTab === 'numeros' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Números que Comprovam (Impacto)</h2>
                <p style={{ fontSize: '13px', color: '#9a94a8', margin: 0 }}>Edite os valores numéricos, sufixos e textos em português e inglês das métricas em destaque.</p>
              </div>

              {/* Lista de Métricas Existentes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
                {content.stats.map(stat => (
                  <div
                    key={stat.id}
                    style={{
                      background: '#14121b',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: '120px 100px 1fr 1fr auto',
                      gap: '16px',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Valor Numérico</label>
                      <input
                        type="number"
                        value={stat.value}
                        onChange={e => handleUpdateStat(stat.id, 'value', Number(e.target.value))}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8384a', fontSize: '18px', fontWeight: 800 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Sufixo / Prefixo</label>
                      <input
                        type="text"
                        value={stat.suffix}
                        placeholder="Ex: +"
                        onChange={e => handleUpdateStat(stat.id, 'suffix', e.target.value)}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Rótulo em Português</label>
                      <input
                        type="text"
                        value={stat.labelPt}
                        onChange={e => handleUpdateStat(stat.id, 'labelPt', e.target.value)}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Rótulo em Inglês</label>
                      <input
                        type="text"
                        value={stat.labelEn}
                        onChange={e => handleUpdateStat(stat.id, 'labelEn', e.target.value)}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <button
                        onClick={() => handleRemoveStat(stat.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar Nova Métrica */}
              <div style={{ background: '#14121b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e8384a' }}>
                  + Adicionar Nova Métrica
                </h3>
                <form onSubmit={handleAddStat} style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr 1fr auto', gap: '14px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Valor</label>
                    <input
                      type="number"
                      value={newStat.value}
                      onChange={e => setNewStat({ ...newStat, value: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Sufixo</label>
                    <input
                      type="text"
                      placeholder="Ex: +"
                      value={newStat.suffix}
                      onChange={e => setNewStat({ ...newStat, suffix: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Rótulo PT</label>
                    <input
                      type="text"
                      placeholder="Ex: Clientes Satisfeitos"
                      value={newStat.labelPt}
                      onChange={e => setNewStat({ ...newStat, labelPt: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Rótulo EN</label>
                    <input
                      type="text"
                      placeholder="Ex: Satisfied Clients"
                      value={newStat.labelEn}
                      onChange={e => setNewStat({ ...newStat, labelEn: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ padding: '11px 20px', background: '#e8384a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Adicionar
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ABA: 360-MESSAGE & LINKS */}
          {activeTab === 'produto' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>360-Message & Links de Ação</h2>
                <p style={{ fontSize: '13px', color: '#9a94a8', margin: 0 }}>Configure para onde o botão do 360-Message redireciona e personalize o texto da seção.</p>
              </div>

              <div style={{ background: '#14121b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#e8384a', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    🔗 Link do Botão "Experimentar o 360-Message"
                  </label>
                  <input
                    type="url"
                    value={content.productLink}
                    onChange={e => updateContent({ ...content, productLink: e.target.value })}
                    placeholder="https://360-message.com"
                    style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,56,74,0.4)', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600 }}
                  />
                  <p style={{ fontSize: '11px', color: '#9a94a8', marginTop: '6px' }}>
                    Ao clicar no botão "Experimentar o 360-Message", o visitante será aberto nesta URL em uma nova aba.
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>Texto de Destaque (PT)</label>
                  <input
                    type="text"
                    value={content.copy.pt.product[4]}
                    onChange={e => {
                      const newProd = [...content.copy.pt.product]
                      newProd[4] = e.target.value
                      updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, product: newProd } } })
                    }}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>Texto do Botão (PT)</label>
                  <input
                    type="text"
                    value={content.copy.pt.product[5]}
                    onChange={e => {
                      const newProd = [...content.copy.pt.product]
                      newProd[5] = e.target.value
                      updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, product: newProd } } })
                    }}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA: TEXTOS & SEÇÕES */}
          {activeTab === 'textos' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Textos do Site (Português & Inglês)</h2>
                <p style={{ fontSize: '13px', color: '#9a94a8', margin: 0 }}>Edite os textos do Hero, Sobre Nós, Contato e Rodapé.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Hero Section */}
                <div style={{ background: '#14121b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#e8384a', textTransform: 'uppercase' }}>
                    1. Hero (Topo da Página)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Título Principal (PT)</label>
                      <input
                        type="text"
                        value={content.copy.pt.hero[0]}
                        onChange={e => {
                          const newHero = [...content.copy.pt.hero]
                          newHero[0] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', marginBottom: '10px' }}
                      />
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Linha Destacada (PT)</label>
                      <input
                        type="text"
                        value={content.copy.pt.hero[1]}
                        onChange={e => {
                          const newHero = [...content.copy.pt.hero]
                          newHero[1] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', marginBottom: '10px' }}
                      />
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Descrição (PT)</label>
                      <textarea
                        rows={3}
                        value={content.copy.pt.hero[2]}
                        onChange={e => {
                          const newHero = [...content.copy.pt.hero]
                          newHero[2] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Título Principal (EN)</label>
                      <input
                        type="text"
                        value={content.copy.en.hero[0]}
                        onChange={e => {
                          const newHero = [...content.copy.en.hero]
                          newHero[0] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, en: { ...content.copy.en, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', marginBottom: '10px' }}
                      />
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Linha Destacada (EN)</label>
                      <input
                        type="text"
                        value={content.copy.en.hero[1]}
                        onChange={e => {
                          const newHero = [...content.copy.en.hero]
                          newHero[1] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, en: { ...content.copy.en, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', marginBottom: '10px' }}
                      />
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Descrição (EN)</label>
                      <textarea
                        rows={3}
                        value={content.copy.en.hero[2]}
                        onChange={e => {
                          const newHero = [...content.copy.en.hero]
                          newHero[2] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, en: { ...content.copy.en, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contatos */}
                <div style={{ background: '#14121b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#e8384a', textTransform: 'uppercase' }}>
                    2. Informações de Contato
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Email Principal</label>
                      <input
                        type="email"
                        value={content.contactInfo.email}
                        onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, email: e.target.value } })}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Telefone 1</label>
                      <input
                        type="text"
                        value={content.contactInfo.phones[0] || ''}
                        onChange={e => {
                          const newPhones = [...content.contactInfo.phones]
                          newPhones[0] = e.target.value
                          updateContent({ ...content, contactInfo: { ...content.contactInfo, phones: newPhones } })
                        }}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Endereço (PT)</label>
                      <input
                        type="text"
                        value={content.contactInfo.addressPt}
                        onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, addressPt: e.target.value } })}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>Link Google Maps</label>
                      <input
                        type="text"
                        value={content.contactInfo.mapsUrl}
                        onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, mapsUrl: e.target.value } })}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA: CONFIGURAÇÃO GITHUB & VERCEL */}
          {activeTab === 'github' && (
            <div style={{ maxWidth: '780px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Configuração do GitHub & Vercel</h2>
                <p style={{ fontSize: '13px', color: '#9a94a8', margin: 0 }}>
                  Conecte o painel ao repositório GitHub do seu projeto. Ao clicar em "Publicar", o painel atualiza o arquivo <code style={{ color: '#e8384a' }}>src/data/site-content.json</code> diretamente no GitHub, fazendo a Vercel republicar o site em segundos.
                </p>
              </div>

              <div style={{ background: '#14121b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e8384a', marginBottom: '6px' }}>
                    Personal Access Token (GitHub Token)
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={gitHubConfig.token}
                    onChange={e => saveGitHubConfig({ ...gitHubConfig, token: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', display: 'block' }}>
                    Fica salvo com segurança no seu navegador via LocalStorage. Nunca é compartilhado publicamente.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>Dono / Usuário do GitHub (Owner)</label>
                    <input
                      type="text"
                      placeholder="Ex: nilton ou sua-organizacao"
                      value={gitHubConfig.owner}
                      onChange={e => saveGitHubConfig({ ...gitHubConfig, owner: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>Nome do Repositório (Repo)</label>
                    <input
                      type="text"
                      placeholder="Ex: redesign-agency-website"
                      value={gitHubConfig.repo}
                      onChange={e => saveGitHubConfig({ ...gitHubConfig, repo: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>Branch</label>
                    <input
                      type="text"
                      placeholder="main"
                      value={gitHubConfig.branch}
                      onChange={e => saveGitHubConfig({ ...gitHubConfig, branch: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>Caminho do Arquivo JSON</label>
                    <input
                      type="text"
                      value={gitHubConfig.filePath}
                      disabled
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#888', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    disabled={testingConnection}
                    onClick={async () => {
                      setTestingConnection(true)
                      const res = await testGitHubConnection(gitHubConfig)
                      setTestingConnection(false)
                      setSaveStatus({
                        type: res.success ? 'success' : 'error',
                        message: res.message,
                      })
                    }}
                    style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                  >
                    {testingConnection ? 'Testando conexão...' : '⚡ Testar Conexão com Repositório'}
                  </button>
                </div>
              </div>

              {/* Guia Rápido de como criar Token */}
              <div style={{ background: '#121019', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', fontSize: '13px', lineHeight: 1.6, color: '#aaa' }}>
                <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700 }}>Como gerar o Token do GitHub em 1 minuto:</h4>
                <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Acesse <strong>github.com &gt; Settings &gt; Developer Settings &gt; Personal access tokens &gt; Tokens (classic)</strong>.</li>
                  <li>Clique em <strong>Generate new token (classic)</strong>.</li>
                  <li>Dê um nome (ex: <code>admin-site</code>) e marque a caixinha <strong>repo</strong> (acesso completo a repositórios).</li>
                  <li>Clique em <strong>Generate token</strong> no fim da página e cole o código acima.</li>
                </ol>
              </div>

              {/* Alterar Senha de Admin */}
              <div style={{ marginTop: '24px', background: '#14121b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700 }}>Segurança do Painel</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="password"
                    placeholder="Nova senha do admin"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', maxWidth: '260px' }}
                  />
                  <button
                    onClick={() => {
                      if (newPassword.trim()) {
                        setAdminPassword(newPassword.trim())
                        setNewPassword('')
                        alert('Senha de administrador alterada com sucesso!')
                      }
                    }}
                    style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Salvar Nova Senha
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
