import React, { useState } from 'react'
import { useSiteContent } from '../context/ContentContext'
import { publishContent } from '../services/githubService'
import { StatItem } from '../types/content'
import { BRAND_IMAGE_OPTIONS, resolveImageSource } from '../utils/imageMap'
import logoImg from '../imports/logo_novo_360.png'

export default function AdminPanel() {
  const {
    content,
    updateContent,
    resetToOriginal,
    gitHubConfig,
    isAdminOpen,
    setIsAdminOpen,
    isAuthenticated,
    login,
    logout,
    setAdminPassword,
  } = useSiteContent()

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
        setLoginError('Senha incorreta. Tente novamente.')
      }
    }

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '380px', background: ui.headerBg, border: `1px solid ${ui.border}`, borderRadius: '20px', padding: '36px 30px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', color: ui.text }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img src={logoImg} alt="Logo" style={{ height: '42px', objectFit: 'contain', filter: ui.logoFilter }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', marginBottom: '6px' }}>Painel Administrativo</h3>
          <p style={{ fontSize: '13px', color: ui.textMuted, textAlign: 'center', marginBottom: '24px' }}>Digite a senha para gerenciar o site</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Senha de acesso"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              autoFocus
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', background: ui.inputBg, border: `1.5px solid ${ui.border}`, borderRadius: '12px', color: ui.text, fontSize: '14px', marginBottom: '14px', outline: 'none' }}
            />
            {loginError && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '14px', textAlign: 'center', fontWeight: 600 }}>{loginError}</p>}
            <button type="submit" style={{ width: '100%', padding: '14px', background: '#e8384a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
              Entrar no Painel
            </button>
            <button type="button" onClick={() => setIsAdminOpen(false)} style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', color: ui.textMuted, border: 'none', fontSize: '12px', cursor: 'pointer' }}>
              Cancelar e voltar ao site
            </button>
          </form>
        </div>
      </div>
    )
  }

  const handlePublish = async () => {
    setSaveStatus({ type: 'loading', message: 'Publicando alterações no GitHub e Vercel...' })
    const res = await publishContent(content, gitHubConfig)
    if (res.success) {
      setSaveStatus({
        type: 'success',
        message: res.message,
        url: res.commitUrl,
      })
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 6000)
    } else {
      setSaveStatus({
        type: 'error',
        message: res.message,
      })
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1080px', height: '90vh', background: ui.bg, border: `1px solid ${ui.border}`, borderRadius: '24px', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: ui.text }}>
        
        {/* Header */}
        <div style={{ padding: '16px 24px', background: ui.headerBg, borderBottom: `1px solid ${ui.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={logoImg} alt="Logo" style={{ height: '32px', objectFit: 'contain', filter: ui.logoFilter }} />
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Painel Administrativo
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>ATIVO</span>
              </h2>
              <span style={{ fontSize: '11px', color: ui.textMuted }}>Edição visual e publicação com 1 clique</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setAdminDark(d => !d)}
              title={adminDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              style={{ padding: '8px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {adminDark ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
            </button>
            <button
              onClick={handlePublish}
              disabled={saveStatus.type === 'loading'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#e8384a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,56,74,0.3)' }}
            >
              {saveStatus.type === 'loading' ? '⏳ Publicando...' : '🚀 Publicar Alterações'}
            </button>
            <button onClick={logout} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.textMuted, fontSize: '12px', cursor: 'pointer' }}>
              Sair
            </button>
            <button onClick={() => setIsAdminOpen(false)} style={{ width: '34px', height: '34px', borderRadius: '50%', background: ui.inputBg, border: `1px solid ${ui.border}`, color: ui.text, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        </div>

        {saveStatus.type && (
          <div style={{ padding: '10px 24px', background: saveStatus.type === 'success' ? '#10b981' : saveStatus.type === 'error' ? '#ef4444' : '#3b82f6', color: '#fff', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{saveStatus.message}</span>
            {saveStatus.url && (
              <a href={saveStatus.url} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontSize: '12px' }}>
                Ver no GitHub →
              </a>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: '220px', background: ui.sidebarBg, borderRight: `1px solid ${ui.border}`, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'marcas', label: 'Marcas Parceiras', icon: '🏢' },
              { id: 'numeros', label: 'Números de Impacto', icon: '📊' },
              { id: 'produto', label: '360-Message & Link', icon: '🚀' },
              { id: 'textos', label: 'Textos & Seções', icon: '✍️' },
              { id: 'seguranca', label: 'Alterar Senha', icon: '🔐' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: activeTab === tab.id ? ui.activeTabBg : 'transparent',
                  color: activeTab === tab.id ? '#e8384a' : ui.textMuted,
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${ui.border}` }}>
              <button
                onClick={() => {
                  if (confirm('Deseja realmente restaurar todos os textos e marcas originais?')) {
                    resetToOriginal()
                  }
                }}
                style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${ui.border}`, borderRadius: '8px', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                Restaurar Original
              </button>
            </div>
          </div>

          {/* Conteúdo da Aba */}
          <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
            {activeTab === 'marcas' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Marcas que confiam em nós</h3>
                <p style={{ fontSize: '13px', color: ui.textMuted, marginBottom: '20px' }}>Gerencie as marcas que aparecem no carrossel de clientes.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                  {content.clients.map((c, i) => (
                    <div key={i} style={{ padding: '14px', background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '60px', height: '40px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                        <img src={resolveImageSource(c.img)} alt={c.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: ui.textDim }}>{c.img}</div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = content.clients.filter((_, idx) => idx !== i)
                          updateContent({ ...content, clients: updated })
                        }}
                        style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '18px', background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Adicionar Nova Marca</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Nome da Marca"
                      value={newBrand.name}
                      onChange={e => setNewBrand({ ...newBrand, name: e.target.value })}
                      style={{ flex: 1, padding: '10px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                    />
                    <select
                      value={newBrand.img}
                      onChange={e => setNewBrand({ ...newBrand, img: e.target.value })}
                      style={{ flex: 1, padding: '10px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                    >
                      <option value="">Selecione uma imagem...</option>
                      {BRAND_IMAGE_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (newBrand.name && newBrand.img) {
                          updateContent({ ...content, clients: [...content.clients, { id: 'client_' + Date.now(), ...newBrand }] })
                          setNewBrand({ name: '', img: '' })
                        }
                      }}
                      style={{ padding: '10px 20px', background: '#e8384a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'numeros' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Números que comprovam</h3>
                <p style={{ fontSize: '13px', color: ui.textMuted, marginBottom: '20px' }}>Altere os dados de estatística de impacto exibidos no site.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                  {content.stats.map((s, i) => (
                    <div key={i} style={{ padding: '18px', background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Valor</label>
                          <input
                            type="number"
                            value={s.value}
                            onChange={e => {
                              const updated = [...content.stats]
                              updated[i] = { ...updated[i], value: Number(e.target.value) }
                              updateContent({ ...content, stats: updated })
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '6px', color: ui.text, fontSize: '14px', fontWeight: 700 }}
                          />
                        </div>
                        <div style={{ width: '70px' }}>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Sufixo</label>
                          <input
                            type="text"
                            value={s.suffix}
                            onChange={e => {
                              const updated = [...content.stats]
                              updated[i] = { ...updated[i], suffix: e.target.value }
                              updateContent({ ...content, stats: updated })
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '6px', color: ui.text, fontSize: '14px', fontWeight: 700 }}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Rótulo (Português)</label>
                        <input
                          type="text"
                          value={s.labelPt}
                          onChange={e => {
                            const updated = [...content.stats]
                            updated[i] = { ...updated[i], labelPt: e.target.value }
                            updateContent({ ...content, stats: updated })
                          }}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '6px', color: ui.text, fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Rótulo (Inglês)</label>
                        <input
                          type="text"
                          value={s.labelEn}
                          onChange={e => {
                            const updated = [...content.stats]
                            updated[i] = { ...updated[i], labelEn: e.target.value }
                            updateContent({ ...content, stats: updated })
                          }}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '6px', color: ui.text, fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'produto' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Configurações do 360-Message</h3>
                <p style={{ fontSize: '13px', color: ui.textMuted, marginBottom: '20px' }}>Link de redirecionamento e textos do produto.</p>
                <div style={{ padding: '20px', background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Link do Botão "Experimentar o 360-Message"</label>
                    <input
                      type="url"
                      value={content.productLink || 'https://360-message.com'}
                      onChange={e => updateContent({ ...content, productLink: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Texto de Chamada do Produto</label>
                    <textarea
                      rows={3}
                      value={content.copy.pt.product[4]}
                      onChange={e => {
                        const newProd = [...content.copy.pt.product]
                        newProd[4] = e.target.value
                        updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, product: newProd } } })
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'textos' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Textos & Seções do Site</h3>
                <p style={{ fontSize: '13px', color: ui.textMuted, marginBottom: '20px' }}>Edição de títulos e informações principais.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '18px', background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Título Principal (Hero)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        value={content.copy.pt.hero[1]}
                        onChange={e => {
                          const newHero = [...content.copy.pt.hero]
                          newHero[1] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, hero: newHero } } })
                        }}
                        style={{ padding: '10px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                      <input
                        type="text"
                        value={content.copy.pt.hero[2]}
                        onChange={e => {
                          const newHero = [...content.copy.pt.hero]
                          newHero[2] = e.target.value
                          updateContent({ ...content, copy: { ...content.copy, pt: { ...content.copy.pt, hero: newHero } } })
                        }}
                        style={{ padding: '10px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ padding: '18px', background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Informações de Contacto</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                      <input
                        type="email"
                        placeholder="Email"
                        value={content.contactInfo.email}
                        onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, email: e.target.value } })}
                        style={{ padding: '10px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                      <input
                        type="text"
                        placeholder="Morada"
                        value={content.contactInfo.addressPt}
                        onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, addressPt: e.target.value } })}
                        style={{ padding: '10px 12px', background: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguranca' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Segurança do Painel</h3>
                <p style={{ fontSize: '13px', color: ui.textMuted, marginBottom: '20px' }}>Altere a senha de acesso da área de administração.</p>
                <div style={{ padding: '20px', background: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px', maxWidth: '400px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="password"
                      placeholder="Nova senha"
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
                    <p style={{ color: '#10b981', fontSize: '13px', fontWeight: 600, margin: '10px 0 0' }}>
                      ✓ {passwordSuccess}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
