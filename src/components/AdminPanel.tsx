import React, { useState } from 'react'
import { useSiteContent } from '../context/ContentContext'
import { publishContent } from '../services/githubService'
import { resolveImageSource } from '../utils/imageMap'
import { ClientItem, StatItem } from '../types/content'
import logoImagem360 from '../imports/logo_novo_360.png'

export default function AdminPanel() {
  const {
    content,
    updateContent,
    saveDraftLocally,
    clearDraft,
    hasLocalDraft,
    gitHubConfig,
    isAdminOpen,
    setIsAdminOpen,
    isAuthenticated,
    login,
    logout,
    setAdminPassword,
  } = useSiteContent()

  // Modo claro como padrão para a cliente
  const [adminDark, setAdminDark] = useState(false)
  const [activeTab, setActiveTab] = useState<'marcas' | 'numeros' | 'produto' | 'textos' | 'seguranca'>('marcas')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string; url?: string }>({
    type: null,
    message: '',
  })
  const [newPassword, setNewPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [newBrand, setNewBrand] = useState({ name: '', img: '' })
  const [newStat, setNewStat] = useState<Omit<StatItem, 'id'>>({
    value: 10,
    suffix: '+',
    prefix: false,
    labelPt: '',
    labelEn: '',
  })

  if (!isAdminOpen) return null

  const ui = adminDark
    ? {
        bg: '#0d0c13',
        headerBg: '#13111b',
        sidebarBg: '#100e17',
        cardBg: '#181622',
        inputBg: 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.09)',
        text: '#f3f2f7',
        textMuted: '#9a94a8',
        textDim: '#706b80',
        activeTabBg: 'rgba(232,56,74,0.16)',
        logoFilter: 'brightness(2) contrast(1.05)',
      }
    : {
        bg: '#f8fafc',
        headerBg: '#ffffff',
        sidebarBg: '#f1f5f9',
        cardBg: '#ffffff',
        inputBg: '#ffffff',
        border: '#e2e8f0',
        text: '#0f172a',
        textMuted: '#64748b',
        textDim: '#94a3b8',
        activeTabBg: 'rgba(232,56,74,0.10)',
        logoFilter: 'none',
      }

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
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'var(--font-body, system-ui, sans-serif)',
        }}
      >
        <div
          style={{
            background: ui.headerBg,
            border: `1px solid ${ui.border}`,
            borderRadius: '24px',
            maxWidth: '420px',
            width: '100%',
            padding: '36px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            color: ui.text,
            textAlign: 'center',
          }}
        >
          <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <img src={logoImagem360} alt="Imagem 360" style={{ maxHeight: '100%', maxWidth: '160px', objectFit: 'contain', filter: ui.logoFilter }} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em', color: ui.text }}>Painel de Gestão</h2>
          <p style={{ fontSize: '13px', color: ui.textMuted, marginBottom: '24px', lineHeight: 1.5 }}>
            Acesso administrativo para edição de marcas parceiras, números e conteúdos do site.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              placeholder="Digite a senha de acesso"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              autoFocus
              style={{
                padding: '14px 18px',
                background: ui.inputBg,
                border: `1px solid ${ui.border}`,
                borderRadius: '12px',
                color: ui.text,
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {loginError && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0, fontWeight: 600 }}>{loginError}</p>}
            <button
              type="submit"
              style={{
                padding: '14px',
                background: '#e8384a',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(232,56,74,0.3)',
                transition: 'background 0.2s',
              }}
            >
              Entrar no Painel
            </button>
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              style={{ background: 'transparent', border: 'none', color: ui.textMuted, fontSize: '12px', cursor: 'pointer', padding: '8px' }}
            >
              Fechar e voltar ao site
            </button>
          </form>
        </div>
      </div>
    )
  }

  const handlePublish = async () => {
    setSaveStatus({ type: 'loading', message: 'Publicando alterações no site...' })

    const res = await publishContent(content, gitHubConfig)
    if (res.success) {
      setSaveStatus({
        type: 'success',
        message: 'Alterações publicadas com sucesso! O site foi atualizado.',
        url: res.commitUrl,
      })
      clearDraft()
    } else {
      setSaveStatus({ type: 'error', message: res.message })
    }
  }

  const handleTestPreview = () => {
    saveDraftLocally(content)
    setSaveStatus({
      type: 'success',
      message: 'Prévia salva! As alterações já estão visíveis no seu navegador para conferência.',
    })
  }

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrand.name.trim()) return

    updateContent({
      ...content,
      clients: [...content.clients, { id: 'brand_' + Date.now(), name: newBrand.name, img: newBrand.img || 'imgLAM' }],
    })
    setNewBrand({ name: '', img: '' })
  }

  const handleRemoveBrand = (id: string) => {
    updateContent({
      ...content,
      clients: content.clients.filter(c => c.id !== id),
    })
  }

  const handleBrandImageUpload = (e: React.ChangeEvent<HTMLInputElement>, brandId?: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const dataUrl = event.target?.result as string
      if (brandId) {
        updateContent({
          ...content,
          clients: content.clients.map(c => (c.id === brandId ? { ...c, img: dataUrl } : c)),
        })
      } else {
        setNewBrand(prev => ({ ...prev, img: dataUrl }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddStat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStat.labelPt.trim()) return

    updateContent({
      ...content,
      stats: [...content.stats, { id: 'stat_' + Date.now(), ...newStat }],
    })
    setNewStat({ value: 10, suffix: '+', prefix: false, labelPt: '', labelEn: '' })
  }

  const handleRemoveStat = (id: string) => {
    updateContent({
      ...content,
      stats: content.stats.filter(s => s.id !== id),
    })
  }

  const handleUpdateStat = (id: string, field: keyof StatItem, val: any) => {
    updateContent({
      ...content,
      stats: content.stats.map(s => (s.id === id ? { ...s, [field]: val } : s)),
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: ui.bg,
        display: 'flex',
        flexDirection: 'column',
        color: ui.text,
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 28px',
          background: ui.headerBg,
          borderBottom: `1px solid ${ui.border}`,
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ height: '36px', display: 'flex', alignItems: 'center' }}>
            <img src={logoImagem360} alt="Imagem 360" style={{ maxHeight: '100%', maxWidth: '120px', objectFit: 'contain', filter: ui.logoFilter }} />
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '10px', color: ui.text }}>
              Painel de Gestão
              {hasLocalDraft ? (
                <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '99px', background: '#f59e0b', color: '#000', fontWeight: 800 }}>
                  Prévia Ativa
                </span>
              ) : (
                <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '99px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                  Sincronizado
                </span>
              )}
            </h1>
            <p style={{ fontSize: '11px', color: ui.textMuted, margin: 0 }}>Altere textos, marcas e métricas com publicação imediata</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAdminDark(!adminDark)}
            style={{
              padding: '8px 14px',
              background: ui.sidebarBg,
              color: ui.text,
              border: `1px solid ${ui.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {adminDark ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>

          <button
            onClick={handleTestPreview}
            title="Salva na memória do navegador para você conferir as alterações"
            style={{
              padding: '8px 16px',
              background: ui.sidebarBg,
              color: ui.text,
              border: `1px solid ${ui.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>👁️</span> Testar Prévia
          </button>

          <button
            onClick={handlePublish}
            title="Publicar alterações diretamente no site oficial"
            style={{
              padding: '8px 22px',
              background: '#e8384a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(232,56,74,0.3)',
            }}
          >
            <span>🚀</span> Publicar Alterações
          </button>

          <button
            onClick={() => setIsAdminOpen(false)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: ui.sidebarBg,
              border: `1px solid ${ui.border}`,
              color: ui.text,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Fechar Painel e Ver Site"
          >
            ✕
          </button>
        </div>
      </header>

      {saveStatus.type && (
        <div
          style={{
            padding: '12px 28px',
            background: saveStatus.type === 'success' ? '#10b981' : saveStatus.type === 'error' ? '#ef4444' : '#3b82f6',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <strong>{saveStatus.type === 'success' ? '✓ ' : saveStatus.type === 'error' ? '✕ ' : '⏳ '}</strong>
            {saveStatus.message}
          </div>
          <button onClick={() => setSaveStatus({ type: null, message: '' })} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside
          style={{
            width: '230px',
            background: ui.sidebarBg,
            borderRight: `1px solid ${ui.border}`,
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {[
            { id: 'marcas', label: 'Marcas Parceiras', icon: '🏢' },
            { id: 'numeros', label: 'Números de Impacto', icon: '📊' },
            { id: 'produto', label: '360-Message & Link', icon: '🚀' },
            { id: 'textos', label: 'Textos & Seções', icon: '📝' },
            { id: 'seguranca', label: 'Alterar Senha', icon: '🔒' },
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
                background: activeTab === tab.id ? ui.activeTabBg : 'transparent',
                color: activeTab === tab.id ? '#e8384a' : ui.textMuted,
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

          <div style={{ marginTop: 'auto', borderTop: `1px solid ${ui.border}`, paddingTop: '16px' }}>
            <button
              onClick={logout}
              style={{ width: '100%', padding: '10px', background: 'transparent', color: ui.textDim, border: `1px solid ${ui.border}`, borderRadius: '8px', fontSize: '11px', cursor: 'pointer', textAlign: 'center', fontWeight: 600 }}
            >
              Sair do Modo Admin
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: ui.bg }}>
          {activeTab === 'marcas' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: ui.text }}>Marcas que Confiam em Nós</h2>
                <p style={{ fontSize: '13px', color: ui.textMuted, margin: 0 }}>Gerencie os logotipos e nomes das empresas parceiras exibidas na página inicial.</p>
              </div>

              <div style={{ background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e8384a' }}>
                  + Adicionar Nova Marca
                </h3>
                <form onSubmit={handleAddBrand} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '14px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Nome da Empresa / Marca</label>
                    <input
                      type="text"
                      placeholder="Ex: Banco Comercial ou Empresa Parceira"
                      value={newBrand.name}
                      onChange={e => setNewBrand({ ...newBrand, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Logotipo da Marca</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Link da imagem ou envie ao lado"
                        value={newBrand.img.startsWith('data:') ? '[Imagem Carregada do Computador]' : newBrand.img}
                        onChange={e => setNewBrand({ ...newBrand, img: e.target.value })}
                        style={{ flex: 1, padding: '12px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                      <label style={{ padding: '12px 16px', background: ui.sidebarBg, border: `1px solid ${ui.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: ui.text, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {content.clients.map((client, idx) => (
                  <div
                    key={client.id || idx}
                    style={{
                      background: ui.cardBg,
                      border: `1px solid ${ui.border}`,
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div
                      style={{
                        height: '70px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
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
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={client.name}
                        onChange={e => {
                          updateContent({
                            ...content,
                            clients: content.clients.map(c => (c.id === client.id ? { ...c, name: e.target.value } : c)),
                          })
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: ui.inputBg,
                          border: `1px solid ${ui.border}`,
                          borderRadius: '6px',
                          color: ui.text,
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', color: '#e8384a', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                        Trocar logo
                        <input type="file" accept="image/*" onChange={e => handleBrandImageUpload(e, client.id)} style={{ display: 'none' }} />
                      </label>

                      <button
                        onClick={() => handleRemoveBrand(client.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', padding: '4px 8px', fontWeight: 600 }}
                      >
                        Excluir 🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'numeros' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: ui.text }}>Números que Comprovam (Impacto)</h2>
                <p style={{ fontSize: '13px', color: ui.textMuted, margin: 0 }}>Edite os valores numéricos, sufixos e textos das métricas em destaque.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
                {content.stats.map(stat => (
                  <div
                    key={stat.id}
                    style={{
                      background: ui.cardBg,
                      border: `1px solid ${ui.border}`,
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: '120px 100px 1fr 1fr auto',
                      gap: '16px',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: ui.textMuted, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Valor Numérico</label>
                      <input
                        type="number"
                        value={stat.value}
                        onChange={e => handleUpdateStat(stat.id, 'value', Number(e.target.value))}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: '#e8384a', fontSize: '18px', fontWeight: 800 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: ui.textMuted, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Sufixo</label>
                      <input
                        type="text"
                        value={stat.suffix}
                        placeholder="Ex: +"
                        onChange={e => handleUpdateStat(stat.id, 'suffix', e.target.value)}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: ui.textMuted, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Texto (Português)</label>
                      <input
                        type="text"
                        value={stat.labelPt}
                        onChange={e => handleUpdateStat(stat.id, 'labelPt', e.target.value)}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: ui.textMuted, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Texto (Inglês)</label>
                      <input
                        type="text"
                        value={stat.labelEn}
                        onChange={e => handleUpdateStat(stat.id, 'labelEn', e.target.value)}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <button
                        onClick={() => handleRemoveStat(stat.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e8384a' }}>
                  + Adicionar Nova Métrica
                </h3>
                <form onSubmit={handleAddStat} style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr 1fr auto', gap: '14px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Valor</label>
                    <input
                      type="number"
                      value={newStat.value}
                      onChange={e => setNewStat({ ...newStat, value: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Sufixo</label>
                    <input
                      type="text"
                      placeholder="Ex: +"
                      value={newStat.suffix}
                      onChange={e => setNewStat({ ...newStat, suffix: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Texto PT</label>
                    <input
                      type="text"
                      placeholder="Ex: Campanhas Realizadas"
                      value={newStat.labelPt}
                      onChange={e => setNewStat({ ...newStat, labelPt: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Texto EN</label>
                    <input
                      type="text"
                      placeholder="Ex: Campaigns Delivered"
                      value={newStat.labelEn}
                      onChange={e => setNewStat({ ...newStat, labelEn: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
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

          {activeTab === 'produto' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: ui.text }}>360-Message & Links</h2>
                <p style={{ fontSize: '13px', color: ui.textMuted, margin: 0 }}>Configure para onde o botão do 360-Message redireciona e personalize o texto da seção.</p>
              </div>

              <div style={{ background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '16px', padding: '28px', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#e8384a', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    🔗 Link de Destino do Botão "Experimentar o 360-Message"
                  </label>
                  <input
                    type="url"
                    value={content.productLink}
                    onChange={e => updateContent({ ...content, productLink: e.target.value })}
                    placeholder="https://360-message.com"
                    style={{ width: '100%', padding: '14px 16px', background: ui.inputBg, border: '2px solid rgba(232,56,74,0.3)', borderRadius: '10px', color: ui.text, fontSize: '14px', fontWeight: 600 }}
                  />
                  <p style={{ fontSize: '12px', color: ui.textMuted, marginTop: '6px' }}>
                    Ao clicar no botão no site, o visitante é direcionado para esta página em uma nova aba.
                  </p>
                </div>

                <div style={{ borderTop: `1px solid ${ui.border}`, paddingTop: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Texto de Destaque da Seção</label>
                  <input
                    type="text"
                    value={content.copy.pt.product[4]}
                    onChange={e => {
                      const newProd = [...content.copy.pt.product]
                      newProd[4] = e.target.value
                      updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, product: newProd } } })
                    }}
                    style={{ width: '100%', padding: '12px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Texto do Botão de Ação</label>
                  <input
                    type="text"
                    value={content.copy.pt.product[5]}
                    onChange={e => {
                      const newProd = [...content.copy.pt.product]
                      newProd[5] = e.target.value
                      updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, product: newProd } } })
                    }}
                    style={{ width: '100%', padding: '12px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'textos' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: ui.text }}>Textos do Site</h2>
                <p style={{ fontSize: '13px', color: ui.textMuted, margin: 0 }}>Edite os textos do Hero, Sobre Nós e Contatos da agência.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '16px', color: '#e8384a', textTransform: 'uppercase' }}>
                    1. Hero (Topo da Página)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Título Principal (PT)</label>
                      <input
                        type="text"
                        value={content.copy.pt.hero[0]}
                        onChange={e => {
                          const newHero = [...content.copy.pt.hero]
                          newHero[0] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px', marginBottom: '10px' }}
                      />
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Linha Destacada (PT)</label>
                      <input
                        type="text"
                        value={content.copy.pt.hero[1]}
                        onChange={e => {
                          const newHero = [...content.copy.pt.hero]
                          newHero[1] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px', marginBottom: '10px' }}
                      />
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Descrição (PT)</label>
                      <textarea
                        rows={3}
                        value={content.copy.pt.hero[2]}
                        onChange={e => {
                          const newHero = [...content.copy.pt.hero]
                          newHero[2] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Título Principal (EN)</label>
                      <input
                        type="text"
                        value={content.copy.en.hero[0]}
                        onChange={e => {
                          const newHero = [...content.copy.en.hero]
                          newHero[0] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, en: { ...content.copy.en, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px', marginBottom: '10px' }}
                      />
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Linha Destacada (EN)</label>
                      <input
                        type="text"
                        value={content.copy.en.hero[1]}
                        onChange={e => {
                          const newHero = [...content.copy.en.hero]
                          newHero[1] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, en: { ...content.copy.en, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px', marginBottom: '10px' }}
                      />
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Descrição (EN)</label>
                      <textarea
                        rows={3}
                        value={content.copy.en.hero[2]}
                        onChange={e => {
                          const newHero = [...content.copy.en.hero]
                          newHero[2] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, en: { ...content.copy.en, hero: newHero } } })
                        }}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '16px', color: '#e8384a', textTransform: 'uppercase' }}>
                    2. Informações de Contato
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Email Principal</label>
                      <input
                        type="email"
                        value={content.contactInfo.email}
                        onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, email: e.target.value } })}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Telefone Principal</label>
                      <input
                        type="text"
                        value={content.contactInfo.phones[0] || ''}
                        onChange={e => {
                          const newPhones = [...content.contactInfo.phones]
                          newPhones[0] = e.target.value
                          updateContent({ ...content, contactInfo: { ...content.contactInfo, phones: newPhones } })
                        }}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Endereço (PT)</label>
                      <input
                        type="text"
                        value={content.contactInfo.addressPt}
                        onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, addressPt: e.target.value } })}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '6px', fontWeight: 600 }}>Link do Google Maps</label>
                      <input
                        type="text"
                        value={content.contactInfo.mapsUrl}
                        onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, mapsUrl: e.target.value } })}
                        style={{ width: '100%', padding: '10px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div style={{ maxWidth: '560px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: ui.text }}>Segurança do Painel</h2>
                <p style={{ fontSize: '13px', color: ui.textMuted, margin: 0 }}>Altere a senha de acesso a este painel administrativo.</p>
              </div>

              <div style={{ background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: ui.text, marginBottom: '8px' }}>
                  Nova Senha de Administrador
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="password"
                    placeholder="Digite a nova senha"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ flex: 1, padding: '12px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                  />
                  <button
                    onClick={() => {
                      if (newPassword.trim()) {
                        setAdminPassword(newPassword.trim())
                        setNewPassword('')
                        setPasswordSuccess('Senha alterada com sucesso!')
                        setTimeout(() => setPasswordSuccess(''), 4000)
                      }
                    }}
                    style={{ padding: '12px 20px', background: '#e8384a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Salvar
                  </button>
                </div>
                {passwordSuccess && (
                  <p style={{ color: '#10b981', fontSize: '13px', fontWeight: 600, marginTop: '10px', margin: '10px 0 0' }}>
                    ✓ {passwordSuccess}
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
