import { useState, useEffect, useRef } from 'react'
import { useSiteContent } from '../context/ContentContext'
import { resolveImageSource } from '../utils/imageMap'
import imgLAM    from '../assets/71b4ddcb-f27b-4cf2-a9cb-03a003079d28.png'
import imgMAHS   from '../assets/43125cf7-99ea-49eb-9d83-2778192b4e55.png'
import imgPetro  from '../assets/550ee893-25d8-42d1-a998-66ea9bbe171f.png'
import imgAmopao from '../assets/6f2cf065-bac9-4c65-8fa2-601d5c71e34e.png'
import imgBread  from '../assets/8b484c38-6242-46ac-9cf1-e3e09bcce684.png'
import imgPBF    from '../assets/7975e11e-f074-453f-9042-417445fbfce3.png'
import logoImagem360 from '../imports/logo_novo_360.png'
import imgSolido from '../imports/Microbanco_Solido_-_Fundo_Branco-01.png'
import imgJogaBets from '../imports/JOGA_BETS_LOGO_-_FINAL.jpg'
import imgMJD from '../imports/MINISTERIO.jpg'

// ── Paleta ────────────────────────────────────────────────
const R      = '#e8384a'
const R_DARK = '#c42d3d'

const L = {
  bg:       '#ffffff',
  bgAlt:    '#ffffff',
  fg:       '#100d0d',
  fgMid:    '#3a2d2e',
  fgMuted:  '#8a7a7b',
  border:   'rgba(0,0,0,0.08)',
  glass:    'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.9)',
  navGlass: 'rgba(255,255,255,0.82)',
  shadow:   '0 8px 40px rgba(0,0,0,0.08)',
  cardShadow:'0 2px 20px rgba(0,0,0,0.06)',
}

const D = {
  bg:       '#000000',
  bgAlt:    '#000000',
  fg:       '#ede9f0',
  fgMid:    '#b8afc8',
  fgMuted:  '#6a6180',
  border:   'rgba(255,255,255,0.07)',
  glass:    'rgba(13,11,23,0.75)',
  glassBorder: 'rgba(255,255,255,0.09)',
  navGlass: 'rgba(0,0,0,0.88)',
  shadow:   '0 8px 40px rgba(0,0,0,0.6)',
  cardShadow:'0 2px 20px rgba(0,0,0,0.45)',
}

// ── Hook: count-up ────────────────────────────────────────
function useCountUp(target: number, duration = 1600, started = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!started) return
    let s: number | null = null
    const tick = (ts: number) => {
      if (!s) s = ts
      const p = Math.min((ts - s) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])
  return val
}

// ── Hook: in-view ─────────────────────────────────────────
function useInView(ref: React.RefObject<Element | null>) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.2 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return seen
}

// ── Dados ─────────────────────────────────────────────────
const COPY = {
  pt: {
    nav: ['Serviços', 'Quem Somos', 'Impacto', 'Marcas', '360-Message', 'Contacto'],
    hero: ['A sua marca nos canais', 'indispensáveis.', 'Publicitamos com educação, projetando as melhores soluções de comunicação para as marcas que querem crescer em qualquer parte do mundo.', 'Explorar serviços'],
    services: ['O que fazemos', 'Várias ações aplicadas.', 'Um só parceiro.', 'Serviços incluídos'],
    impact: ['Impacto', 'Números que', 'comprovam.'],
    about: ['Quem somos', 'O pensamento', 'fora da caixa.'],
    brands: ['Marcas que confiam em nós', 'Empresas moçambicanas e internacionais que escolheram a Imagem 360 como parceira de trabalho.'],
    product: ['Produto · 360-Message', 'A comunicação', 'da sua marca,', 'numa só plataforma.', 'SMS, Email e USSD integrados na plataforma multicanal, rápida e feita para o mercado nacional e internacional.', 'Experimentar o 360-Message'],
    contact: ['Contacto', 'Vamos', 'conversar.', 'Estamos ansiosos pelo seu contacto!', 'Endereço', 'Ver no Google Maps', 'Telefone', 'Envie-nos uma mensagem', 'Nome', 'Assunto', 'Mensagem', 'Enviar mensagem', 'Obrigado pelo envio!'],
  },
  en: {
    nav: ['Services', 'About Us', 'Impact', 'Brands', '360-Message', 'Contact'],
    hero: ['Your brand across the', 'essential channels.', 'We advertise through education, designing the best communication solutions for brands that want to grow anywhere in the world.', 'Explore services'],
    services: ['What we do', 'Multiple actions applied.', 'One partner.', 'Included services'],
    impact: ['Impact', 'Numbers that', 'prove it.'],
    about: ['About us', 'Thinking', 'outside the box.'],
    brands: ['Brands that trust us', 'Mozambican and international companies that chose Imagem 360 as their working partner.'],
    product: ['Product · 360-Message', 'Your brand’s', 'communication,', 'on one platform.', 'SMS, Email and USSD integrated into a fast multichannel platform built for national and international markets.', 'Try 360-Message'],
    contact: ['Contact', 'Let’s', 'talk.', 'We look forward to hearing from you!', 'Address', 'View on Google Maps', 'Phone', 'Send us a message', 'Name', 'Subject', 'Message', 'Send message', 'Thank you for your message!'],
  },
} as const

const CANAIS_PT = [
  {
    num: '01', tag: 'Canal 01', title: 'Marketing Digital',
    desc: 'Alcance preciso, entrega imediata. SMS, email e redes sociais integrados numa só estratégia.',
    items: ['SMS em massa', 'SMS Transacional (OTP)', 'SMS Bidirecional', 'Email Marketing', 'Email Transacional', 'USSD', 'Criação e gestão de redes sociais'],
  },
  {
    num: '02', tag: 'Canal 02', title: 'Publicidade Out-of-Home',
    desc: 'Onde menos se espera, mais se impacta. Publicidade que vai ao encontro das pessoas.',
    items: ['Publicidade na mídia ecológica'],
  },
  {
    num: '03', tag: 'Canal 03', title: 'Estratégias de Marketing',
    desc: 'Da ideia à execução — pensamos a comunicação da sua marca de forma integral.',
    items: ['Consultoria estratégica', 'Identidade Visual', 'Criação de campanhas', 'Ativações e mais'],
  },
]

const CANAIS_EN = [
  {
    num: '01', tag: 'Channel 01', title: 'Digital Marketing',
    desc: 'Precise reach, immediate delivery. SMS, email and social media integrated into one strategy.',
    items: ['Bulk SMS', 'Transactional SMS (OTP)', 'Two-way SMS', 'Email Marketing', 'Transactional Email', 'USSD', 'Social media creation and management'],
  },
  {
    num: '02', tag: 'Channel 02', title: 'Out-of-Home Advertising',
    desc: 'Where it is least expected, it creates the greatest impact. Advertising that meets people where they are.',
    items: ['Eco-media advertising'],
  },
  {
    num: '03', tag: 'Channel 03', title: 'Marketing Strategies',
    desc: 'From idea to execution—we approach your brand communication as a whole.',
    items: ['Strategic consulting', 'Visual Identity', 'Campaign creation', 'Activations and more'],
  },
]

const STATS_PT = [
  { value: 50, suffix: '+', label: 'Campanhas' },
  { value: 11, suffix: '', label: 'Anos no mercado' },
  { value: 3, suffix: '+ de ', prefix: true, label: 'Canais integrados' },
]

const STATS_EN = [
  { value: 50, suffix: '+', label: 'Campaigns' },
  { value: 11, suffix: '', label: 'Years in the market' },
  { value: 3, suffix: 'More than ', prefix: true, label: 'Integrated channels' },
]

const CLIENTS = [
  { name: 'LAM — Linhas Aéreas de Moçambique', img: imgLAM },
  { name: 'MAHS — Mozambique Airport Handling Services', img: imgMAHS },
  { name: 'Petrogás', img: imgPetro },
  { name: 'AMOPÃO', img: imgAmopao },
  { name: 'PBF / ANC', img: imgPBF },
  { name: 'Microbanco Sólido', img: imgSolido },
  { name: 'Joga Bets', img: imgJogaBets },
  { name: 'Ministério da Juventude e Desporto', img: imgMJD },
]

function MoonIcon({ dark }: { dark: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"
        fill={dark ? '#000000' : '#ffffff'}
      />
    </svg>
  )
}

// ── Componente principal ──────────────────────────────────
export default function V3() {
  const [dark, setDark]         = useState(false)
  const [lang, setLang]         = useState<'pt' | 'en'>('pt')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCanal, setActiveCanal] = useState(0)
  const [form, setForm]         = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent]         = useState(false)
  const [focus, setFocus]       = useState<string | null>(null)

  const { content, setIsAdminOpen, hasLocalDraft, clearDraft } = useSiteContent()
  const t = dark ? D : L
  const copy = content.copy[lang] || COPY[lang]
  const canais = lang === 'pt' ? CANAIS_PT : CANAIS_EN
  const stats = content.stats
  const clients = content.clients
  const productLink = content.productLink || 'https://360-message.com'
  const navLinks = [
    { label: copy.nav[0], href: '#servicos' },
    { label: copy.nav[1], href: '#sobre' },
    { label: copy.nav[2], href: '#impacto' },
    { label: copy.nav[3], href: '#marcas' },
    { label: copy.nav[4], href: '#message', accent: true },
    { label: copy.nav[5], href: '#contato' },
  ]
  const statsRef = useRef<HTMLDivElement>(null)
  const statsOn  = useInView(statsRef as React.RefObject<Element>)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const inp = (f: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box', padding: '13px 16px',
    fontSize: '14px', color: t.fg, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    border: `1.5px solid ${focus === f ? R : t.border}`,
    borderRadius: '12px', outline: 'none', fontFamily: 'var(--font-body)',
    transition: 'border-color 0.2s, background 0.3s',
  })

  return (
    <div style={{ background: t.bg, color: t.fg, fontFamily: 'var(--font-body)', minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>

      {hasLocalDraft && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#f59e0b', color: '#000', padding: '6px 20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          <span>⚠️ Rascunho local pendente (ainda não publicado no GitHub).</span>
          <button onClick={() => setIsAdminOpen(true)} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '999px', padding: '3px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}>Abrir Painel Admin</button>
          <button onClick={clearDraft} style={{ background: 'transparent', color: '#000', border: '1px solid rgba(0,0,0,0.4)', borderRadius: '999px', padding: '3px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Descartar rascunho</button>
        </div>
      )}

      {/* ── NAV ──────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.4s',
        ...(scrolled ? {
          background: t.navGlass,
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderBottom: `1px solid ${t.border}`,
          boxShadow: dark ? '0 1px 0 rgba(255,255,255,0.04)' : '0 1px 0 rgba(0,0,0,0.06)',
        } : {
          background: 'transparent',
          backdropFilter: 'none',
        }),
      }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px,5vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '66px' }}>
          <a href="#" aria-label="Imagem 360" style={{ width: '112px', height: '48px', display: 'flex', alignItems: 'center' }}>
            <img src={logoImagem360} alt="Imagem 360" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: dark ? 'brightness(1.8) contrast(0.9)' : 'none', transition: 'filter 0.3s' }} />
          </a>

          <nav className="nav-links" style={{ alignItems: 'center', gap: '22px' }}>
            {navLinks.map(l => (
              <a key={l.href} href={l.href}
                style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: l.accent ? R : t.fgMuted, textDecoration: 'none', transition: 'color 0.2s', fontWeight: l.accent ? 700 : 400 }}
                onMouseEnter={e => (e.currentTarget.style.color = R)}
                onMouseLeave={e => (e.currentTarget.style.color = l.accent ? R : t.fgMuted)}>
                {l.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setLang(current => current === 'pt' ? 'en' : 'pt')}
              aria-label={lang === 'pt' ? 'Switch to English' : 'Mudar para português'}
              style={{ height: '38px', minWidth: '44px', padding: '0 10px', borderRadius: '999px', background: 'transparent', color: t.fg, border: `1px solid ${t.border}`, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', transition: 'all 0.3s' }}>
              {lang === 'pt' ? 'EN' : 'PT'}
            </button>
            <button onClick={() => setDark(d => !d)}
              aria-label={dark ? (lang === 'pt' ? 'Mudar para modo claro' : 'Switch to light mode') : (lang === 'pt' ? 'Mudar para modo escuro' : 'Switch to dark mode')}
              className="hidden lg:flex"
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: dark ? '#ffffff' : '#000000', border: `1px solid ${dark ? '#ffffff' : '#000000'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
              <MoonIcon dark={dark} />
            </button>
            <button className="lg:hidden" onClick={() => setMenuOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px' }}>
              <span style={{ display: 'block', width: '22px', height: '2px', background: t.fg, borderRadius: '2px', transition: 'transform 0.3s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: t.fg, borderRadius: '2px', transition: 'transform 0.3s', transform: menuOpen ? 'rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ borderTop: `1px solid ${t.border}`, padding: '18px clamp(20px,5vw,48px) 24px', background: t.navGlass, backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {navLinks.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.12em', color: t.fgMid, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={() => setLang(current => current === 'pt' ? 'en' : 'pt')} style={{ flex: 1, padding: '12px', background: R, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{lang === 'pt' ? 'English' : 'Português'}</button>
              <button onClick={() => setDark(d => !d)}
                aria-label={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                style={{ width: '44px', height: '44px', borderRadius: '50%', background: dark ? '#ffffff' : '#000000', border: `1px solid ${dark ? '#ffffff' : '#000000'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                <MoonIcon dark={dark} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: 'clamp(100px,12vw,130px) clamp(20px,5vw,80px) clamp(60px,8vw,80px)', position: 'relative', overflow: 'hidden' }}>

        {/* Glow fundo */}
        <div style={{ position: 'absolute', top: '-10%', right: '5%', width: '55vw', height: '55vw', maxWidth: '700px', maxHeight: '700px', borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(232,56,74,0.14) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(232,56,74,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1160px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }} className="hero-grid">

          {/* Texto */}
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.8rem,5.5vw,6rem)', lineHeight: 0.88, textTransform: 'uppercase', color: t.fg, letterSpacing: '-0.03em', marginBottom: '26px', transition: 'color 0.3s' }}>
              {copy.hero[0]}<br /><span style={{ color: R }}>{copy.hero[1]}</span>
            </h1>

            <p style={{ fontSize: 'clamp(14px,1.5vw,16px)', color: t.fgMuted, lineHeight: 1.78, maxWidth: '400px', marginBottom: '40px', transition: 'color 0.3s' }}>
              {copy.hero[2]}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <a href="#servicos" style={{ padding: '13px 28px', background: R, color: '#fff', borderRadius: '999px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', transition: 'background 0.2s', boxShadow: `0 6px 24px ${R}55` }}
                onMouseEnter={e => (e.currentTarget.style.background = R_DARK)}
                onMouseLeave={e => (e.currentTarget.style.background = R)}>
                {copy.hero[3]} →
              </a>
            </div>
          </div>

          {/* Sistema visual: marca, utilizador, comunicação e marketing */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '500px' }}>
            <div style={{ position: 'absolute', width: '390px', height: '390px', borderRadius: '50%', border: `1px solid ${dark ? 'rgba(232,56,74,0.35)' : 'rgba(232,56,74,0.22)'}`, boxShadow: `0 0 80px ${dark ? 'rgba(232,56,74,0.12)' : 'rgba(232,56,74,0.08)'}` }} />
            <svg viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, overflow: 'visible' }}>
              <defs>
                <marker id="flow-arrow-start" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={R} />
                </marker>
                <marker id="flow-arrow-end" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={R} />
                </marker>
              </defs>
              {[
                { d: 'M250 142 C250 118 250 99 250 78', delay: '0s' },
                { d: 'M180 310 C145 336 118 365 91 405', delay: '0.7s' },
                { d: 'M320 310 C355 336 382 365 409 405', delay: '1.4s' },
              ].map(flow => (
                <g key={flow.d}>
                  <path d={flow.d} fill="none" stroke={R} strokeWidth="9" strokeOpacity={dark ? 0.08 : 0.06} />
                  <path d={flow.d} fill="none" stroke={R} strokeWidth="2" strokeOpacity={dark ? 0.86 : 0.68} markerStart="url(#flow-arrow-start)" markerEnd="url(#flow-arrow-end)" />
                  <circle className="signal-flow-dot" r="4" fill={R}>
                    <animateMotion dur="2.8s" begin={flow.delay} repeatCount="indefinite" path={flow.d} />
                  </circle>
                  <circle className="signal-flow-dot" r="3" fill={R} fillOpacity="0.58">
                    <animateMotion dur="2.8s" begin={flow.delay} repeatCount="indefinite" path={flow.d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                  </circle>
                </g>
              ))}
              {[[250, 142], [180, 310], [320, 310]].map(([cx, cy]) => (
                <g key={`${cx}-${cy}`}>
                  <circle cx={cx} cy={cy} r="8" fill={dark ? '#000000' : '#ffffff'} stroke={R} strokeWidth="1.5" />
                  <circle cx={cx} cy={cy} r="3" fill={R} />
                </g>
              ))}
            </svg>
            <div style={{ position: 'relative', zIndex: 2, width: '230px', height: '230px', borderRadius: '50%', padding: '34px', background: t.glass, border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)'}`, boxShadow: dark ? '0 24px 70px rgba(0,0,0,0.65)' : '0 24px 70px rgba(0,0,0,0.13)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
              <img src={logoImagem360} alt="Imagem 360" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: dark ? 'brightness(1.8) contrast(0.9)' : 'none', transition: 'filter 0.3s' }} />
            </div>
            <div style={{ position: 'absolute', top: '3%', left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '999px', background: dark ? 'rgba(15,15,15,0.9)' : 'rgba(255,255,255,0.94)', border: `1px solid ${t.border}`, boxShadow: t.cardShadow, backdropFilter: 'blur(14px)' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: R, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 5px ${R}22` }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                </svg>
              </span>
              <span style={{ color: t.fg, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lang === 'pt' ? 'Utilizador' : 'User'}</span>
            </div>
            {[
              { label: lang === 'pt' ? 'Comunicação' : 'Communication', type: 'communication', bottom: '10%', right: '-2%' },
              { label: 'Marketing', type: 'marketing', bottom: '10%', left: '0%' },
            ].map(item => (
              <div key={item.label} style={{ position: 'absolute', right: item.right, bottom: item.bottom, left: item.left, zIndex: 3, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '999px', background: dark ? 'rgba(15,15,15,0.9)' : 'rgba(255,255,255,0.94)', border: `1px solid ${t.border}`, boxShadow: t.cardShadow, backdropFilter: 'blur(14px)' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: R, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 5px ${R}22` }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {item.type === 'marketing' ? (
                      <>
                        <path d="M3 11v2a2 2 0 0 0 2 2h2l2 4h3l-2-4 9-4V7l-12 4H5a2 2 0 0 0-2 2" />
                        <path d="M19 9h2" />
                      </>
                    ) : (
                      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    )}
                  </svg>
                </span>
                <span style={{ color: t.fg, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CANAIS — accordion hover ─────────────────────── */}
      <section id="servicos" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,80px)', borderTop: `1px solid ${t.border}`, transition: 'border-color 0.3s' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <STag label={copy.services[0]} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.6rem)', textTransform: 'uppercase', color: t.fg, marginBottom: '48px', lineHeight: 0.9, letterSpacing: '-0.025em', transition: 'color 0.3s' }}>
            {copy.services[1]}<br />{copy.services[2]}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {canais.map((c, i) => {
              const open = activeCanal === i
              return (
                <div key={i}
                  onMouseEnter={() => setActiveCanal(i)}
                  style={{ borderTop: `1px solid ${t.border}`, borderBottom: i === canais.length - 1 ? `1px solid ${t.border}` : 'none', transition: 'all 0.4s', overflow: 'hidden' }}>

                  {/* Cabeçalho sempre visível */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: open ? '28px 0 20px' : '22px 0', cursor: 'default', transition: 'padding 0.4s', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', flex: 1 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '12px', color: open ? R : t.fgMuted, letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'color 0.3s', flexShrink: 0 }}>
                        {c.num}
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.4rem,2.8vw,2.4rem)', textTransform: 'uppercase', color: open ? t.fg : t.fgMuted, lineHeight: 1, letterSpacing: '-0.02em', transition: 'color 0.35s', margin: 0 }}>
                        {c.title}
                      </h3>
                    </div>
                    {/* Seta indicadora */}
                    <span style={{ fontSize: '18px', color: open ? R : t.fgMuted, transition: 'all 0.35s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>→</span>
                  </div>

                  {/* Conteúdo expansível */}
                  <div style={{
                    display: 'grid',
                    gridTemplateRows: open ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.4s cubic-bezier(0.4,0,0.2,1)',
                  }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '28px', paddingBottom: '32px', opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(-8px)', transition: 'opacity 0.35s 0.05s, transform 0.35s 0.05s' }}>
                        <p style={{ fontSize: '15px', color: t.fgMuted, lineHeight: 1.75, transition: 'color 0.3s', alignSelf: 'start', paddingTop: '4px' }}>{c.desc}</p>
                        <div style={{ background: t.glass, borderRadius: '18px', padding: '24px 26px', border: `1px solid ${t.glassBorder}`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: t.cardShadow }}>
                          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.22em', color: t.fgMuted, marginBottom: '14px', fontWeight: 700 }}>{copy.services[3]}</p>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {c.items.map(item => (
                              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '11px', fontSize: '13px', color: t.fgMid }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: R, flexShrink: 0 }} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── IMPACTO ──────────────────────────────────────── */}
      <section id="impacto" ref={statsRef} style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,80px)', background: dark ? D.bgAlt : L.bg, borderTop: `1px solid ${t.border}`, transition: 'background 0.3s, border-color 0.3s' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <STag label={copy.impact[0]} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.6rem)', textTransform: 'uppercase', color: t.fg, marginBottom: '48px', lineHeight: 0.9, letterSpacing: '-0.025em', transition: 'color 0.3s' }}>
            {copy.impact[1]}<br />{copy.impact[2]}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '2px', borderRadius: '22px', overflow: 'hidden', background: t.border, border: `1px solid ${t.border}`, marginBottom: '56px' }}>
            {stats.map((s, i) => {
              const label = 'labelPt' in s ? (lang === 'pt' ? (s as any).labelPt : (s as any).labelEn) : (s as any).label
              return (
                <StatCell
                  key={('id' in s && (s as any).id) || i}
                  value={s.value}
                  suffix={s.suffix}
                  prefix={'prefix' in s ? (s as any).prefix : false}
                  label={label}
                  started={statsOn}
                  bg={dark ? D.bg : L.bgAlt}
                  muted={t.fgMuted}
                />
              )
            })}
          </div>

          {/* Ecological media — tom claro, adapta ao tema */}
          <div style={{ borderRadius: '28px', overflow: 'hidden', background: dark ? 'rgba(255,255,255,0.04)' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`, boxShadow: dark ? '0 4px 40px rgba(0,0,0,0.3)' : '0 4px 40px rgba(0,0,0,0.06)', position: 'relative' }}>

            <div style={{ padding: 'clamp(36px,6vw,60px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '48px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '5px 12px', background: 'rgba(232,56,74,0.08)', borderRadius: '999px', border: '1px solid rgba(232,56,74,0.18)' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: R, display: 'inline-block' }} />
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.22em', color: R, fontWeight: 700 }}>{lang === 'pt' ? 'Direitos do autor' : 'Copyright'}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,3rem)', textTransform: 'uppercase', color: t.fg, lineHeight: 0.88, marginBottom: '16px', letterSpacing: '-0.025em', transition: 'color 0.3s' }}>
                  {lang === 'pt' ? 'Publicidade na' : 'Eco-media'}<br /><span style={{ color: R }}>{lang === 'pt' ? 'mídia ecológica' : 'advertising'}</span>
                </h3>
                <p style={{ fontSize: '15px', color: t.fgMuted, lineHeight: 1.75, marginBottom: '28px', transition: 'color 0.3s' }}>
                  {lang === 'pt'
                    ? 'Divulgação de marcas nacionais e internacionais, através do uso de sacos biodegradáveis para armazenar produtos alimentares entre outros.'
                    : 'Promoting national and international brands through biodegradable bags used to store food products and more.'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { icon: 'M20.8 3.2C14 3.5 8.6 5.8 6.1 10.1c-1.9 3.2-.8 6.5 1.6 8.2 2.6 1.8 6.2 1.1 8.1-1.8 2.4-3.7 2.1-8.3 5-13.3ZM5 21c2-5 5.5-8.2 10.5-10.5', color: '#2f9e62', label: lang === 'pt' ? 'Ecológico e indispensável' : 'Eco-friendly and essential' },
                    { icon: 'M4 20V10l8-6 8 6v10M8 20v-6h8v6', label: lang === 'pt' ? 'Distribuição nos estabelecimentos comerciais' : 'Distribution in retail establishments' },
                    { icon: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z', label: lang === 'pt' ? '0% de desperdício' : '0% waste' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '14px', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(232,56,74,0.04)', borderRadius: '12px', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(232,56,74,0.10)'}` }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'color' in item ? item.color : R} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}><path d={item.icon}/></svg>
                      <div style={{ fontSize: '12px', color: t.fgMuted, lineHeight: 1.4, transition: 'color 0.3s' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Foto real */}
                <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', aspectRatio: '4/3' }}>
                  <img src={imgBread} alt="Saco de pão brandizado — mídia ecológica" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                {(lang === 'pt'
                  ? ['Produção e impressão com publicidade', 'Distribuição em padarias, supermercados, farmácias, entre outros.', 'Nas mãos do consumidor diariamente']
                  : ['Production and printing with advertising', 'Distribution in bakeries, supermarkets, pharmacies and more.', 'In consumers’ hands every day']
                ).map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', border: `1px solid ${t.border}` }}>
                    <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: R, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: '13px', color: t.fgMid, transition: 'color 0.3s' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUEM SOMOS ───────────────────────────────────── */}
      <section id="sobre" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,80px)', borderTop: `1px solid ${t.border}`, transition: 'border-color 0.3s' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '48px 64px', alignItems: 'start' }}>
          <div>
            <STag label={copy.about[0]} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.6rem)', textTransform: 'uppercase', color: t.fg, lineHeight: 0.9, letterSpacing: '-0.025em', marginBottom: '22px', transition: 'color 0.3s' }}>
              {copy.about[1]}<br /><span style={{ color: R }}>{copy.about[2]}</span>
            </h2>
            <p style={{ fontSize: '15px', color: t.fgMuted, lineHeight: 1.75, marginBottom: '12px', transition: 'color 0.3s' }}>
              {lang === 'pt'
                ? 'Imagem 360, Lda, agência de marketing e publicidade, existente desde 2015. Nasceu por necessidade de uma empresa criativa com elevação de valores sociais, dinamizando o marketing com respostas a todas as demandas.'
                : 'Imagem 360, Lda is a marketing and advertising agency established in 2015. It was born from the need for a creative company that elevates social values and energises marketing with answers to every demand.'}
            </p>
            <p style={{ fontSize: '14px', color: t.fgMuted, lineHeight: 1.7, opacity: 0.7 }}>{lang === 'pt' ? 'Publicitamos com educação, projetando as melhores soluções.' : 'We advertise through education, designing the best solutions.'}</p>
          </div>

          <div>
            {(lang === 'pt' ? [
              { l: 'Visão', v: 'Elevar o nível da criatividade, alavancando marcas nacionais e internacionais.' },
              { l: 'Missão', v: 'Comprometimento no crescimento estratégico e manutenção das marcas.' },
              { l: 'Valores', v: 'Responsabilidade ambiental · Social · Qualidade · Eficácia · Integridade · Inovação' },
              { l: 'Inovação', v: 'Inovamos, trazendo sentido e vida à nossa comunicação.' },
              { l: 'Canais', v: 'Temos os melhores canais de marketing digital e publicidade out of home.' },
              { l: 'Equipa', v: 'Contamos com uma equipa dedicada, genial e super responsável.' },
            ] : [
              { l: 'Vision', v: 'Elevating creativity to advance national and international brands.' },
              { l: 'Mission', v: 'Commitment to the strategic growth and long-term development of brands.' },
              { l: 'Values', v: 'Environmental responsibility · Social responsibility · Quality · Effectiveness · Integrity · Innovation' },
              { l: 'Innovation', v: 'We innovate, bringing meaning and life to our communication.' },
              { l: 'Channels', v: 'We offer the best digital marketing and out-of-home advertising channels.' },
              { l: 'Team', v: 'We have a dedicated, brilliant and highly responsible team.' },
            ]).map((row, i, arr) => (
              <div key={i} style={{ padding: '20px 0', borderTop: `1px solid ${t.border}`, borderBottom: i === arr.length - 1 ? `1px solid ${t.border}` : 'none', display: 'flex', gap: '16px', transition: 'border-color 0.3s' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: R, fontWeight: 700, width: '50px', flexShrink: 0, paddingTop: '2px' }}>{row.l}</span>
                <p style={{ fontSize: '13px', color: t.fgMid, lineHeight: 1.65, transition: 'color 0.3s' }}>{row.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARCAS ───────────────────────────────────────── */}
      <section id="marcas" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,80px)', background: dark ? D.bgAlt : L.bg, borderTop: `1px solid ${t.border}`, transition: 'background 0.3s, border-color 0.3s' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <STag label={copy.brands[0]} />
          <p style={{ fontSize: '15px', color: t.fgMuted, marginBottom: '44px', transition: 'color 0.3s' }}>
            {copy.brands[1]}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px' }}>
            {clients.map(c => (
              <div key={('id' in c && (c as any).id) || c.name}
                style={{ padding: '24px 18px', background: dark ? 'rgba(255,255,255,0.045)' : '#ffffff', borderRadius: '18px', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', transition: 'all 0.25s', boxShadow: dark ? '0 14px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.035)' : '0 8px 28px rgba(0,0,0,0.07)', minHeight: '124px', overflow: 'hidden', isolation: 'isolate' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${R}55`; e.currentTarget.style.boxShadow = `0 8px 28px ${R}18` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'; e.currentTarget.style.boxShadow = dark ? '0 14px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.035)' : '0 8px 28px rgba(0,0,0,0.07)' }}>
                <div style={{ width: '170px', height: '76px', padding: '10px 14px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: dark ? '0 8px 24px rgba(0,0,0,0.28)' : 'none' }}>
                  <img
                    src={resolveImageSource(c.img)}
                    alt={c.name}
                    style={{ maxWidth: '142px', maxHeight: '56px', width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 360 MESSAGE — secção produto ─────────────────── */}
      <section id="message" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,80px)', borderTop: `1px solid ${t.border}`, position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}>
        {/* Glow de fundo */}
        <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '200%', background: `radial-gradient(ellipse, ${dark ? 'rgba(232,56,74,0.1)' : 'rgba(232,56,74,0.06)'} 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1160px', margin: '0 auto', position: 'relative' }}>
          {/* Cabeçalho centrado */}
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px', padding: '7px 16px', background: dark ? 'rgba(232,56,74,0.12)' : 'rgba(232,56,74,0.07)', borderRadius: '999px', border: `1px solid ${dark ? 'rgba(232,56,74,0.25)' : 'rgba(232,56,74,0.15)'}` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={R} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.25em', color: R, fontWeight: 700 }}>{copy.product[0]}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.2rem,5vw,4.2rem)', textTransform: 'uppercase', color: t.fg, lineHeight: 0.9, letterSpacing: '-0.03em', marginBottom: '20px', transition: 'color 0.3s' }}>
              {copy.product[1]}<br />{copy.product[2]}<br /><span style={{ color: R }}>{copy.product[3]}</span>
            </h2>
            <p style={{ fontSize: '16px', color: t.fgMuted, lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 36px', transition: 'color 0.3s' }}>
              {copy.product[4]}
            </p>
            <a
              href={productLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', gap: '10px', padding: '15px 36px', background: R, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', boxShadow: `0 8px 32px ${R}55`, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = R_DARK; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${R}66` }}
              onMouseLeave={e => { e.currentTarget.style.background = R; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${R}55` }}>
              {copy.product[5]}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
            {[
              { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'SMS em Massa', desc: 'Chegue a milhares de contactos em segundos' },
              { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Email Marketing', desc: 'Campanhas visuais com métricas em tempo real' },
              { icon: 'M12 18h.01M8 21h8a2 2 0 002-2v-1a7 7 0 10-14 0v1a2 2 0 002 2z', title: 'USSD', desc: 'Interacção directa sem necessidade de internet' },
              { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Relatórios', desc: 'Dashboards com resultados de cada campanha' },
            ].map(f => (
              <div key={f.title} style={{ padding: '24px', background: t.glass, borderRadius: '18px', border: `1px solid ${t.glassBorder}`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: t.cardShadow, transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${R}44`; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.glassBorder; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: dark ? 'rgba(232,56,74,0.15)' : 'rgba(232,56,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={R} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon}/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: t.fg, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '-0.01em', transition: 'color 0.3s' }}>
                  {lang === 'pt' ? f.title : ({ 'SMS em Massa': 'Bulk SMS', 'Email Marketing': 'Email Marketing', USSD: 'USSD', Relatórios: 'Reports' }[f.title] ?? f.title)}
                </p>
                <p style={{ fontSize: '12px', color: t.fgMuted, lineHeight: 1.6, transition: 'color 0.3s' }}>
                  {lang === 'pt' ? f.desc : ({ 'Chegue a milhares de contactos em segundos': 'Reach thousands of contacts in seconds', 'Campanhas visuais com métricas em tempo real': 'Visual campaigns with real-time metrics', 'Interacção directa sem necessidade de internet': 'Direct interaction without internet access', 'Dashboards com resultados de cada campanha': 'Dashboards with results from every campaign' }[f.desc] ?? f.desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTATO ──────────────────────────────────────── */}
      <section id="contato" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,80px)', borderTop: `1px solid ${t.border}`, transition: 'border-color 0.3s' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '56px' }}>
          <div>
            <STag label={copy.contact[0]} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.6rem)', textTransform: 'uppercase', color: t.fg, lineHeight: 0.9, letterSpacing: '-0.025em', marginBottom: '22px', transition: 'color 0.3s' }}>
              {copy.contact[1]}<br /><span style={{ color: R }}>{copy.contact[2]}</span>
            </h2>
            <p style={{ fontSize: '15px', color: t.fgMuted, lineHeight: 1.75, marginBottom: '36px' }}>{copy.contact[3]}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Endereço com link Google Maps */}
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.22em', color: R, fontWeight: 700, marginBottom: '4px' }}>{copy.contact[4]}</p>
                <span style={{ fontSize: '14px', color: t.fgMid, transition: 'color 0.3s' }}>Av. Maguiguana, 845, Maputo, Moçambique</span>
                <div style={{ marginTop: '8px' }}>
                  <a
                    href="https://maps.google.com/?q=Av.+Maguiguana+845+Maputo+Mozambique"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: R, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    {copy.contact[5]}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7v10"/>
                    </svg>
                  </a>
                </div>
              </div>
              {[
                { l: 'Email',    v: 'team@imagem360.agency',  h: 'mailto:team@imagem360.agency' },
                { l: copy.contact[6], v: '(+258) 834920306', h: 'tel:+258834920306' },
                { l: copy.contact[6], v: '(+258) 875500828', h: 'tel:+258875500828' },
              ].map((c, i) => (
                <div key={i}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.22em', color: R, fontWeight: 700, marginBottom: '3px' }}>{c.l}</p>
                  <a href={c.h} style={{ fontSize: '14px', color: t.fgMid, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = R)} onMouseLeave={e => (e.currentTarget.style.color = t.fgMid)}>{c.v}</a>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <div style={{ background: t.glass, padding: '38px', borderRadius: '24px', border: `1px solid ${t.glassBorder}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: t.shadow, transition: 'all 0.3s' }}>
            {sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', gap: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: R, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: `0 6px 24px ${R}55` }}>✓</div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '15px', color: t.fg }}>{copy.contact[12]}</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: t.fg, marginBottom: '6px', transition: 'color 0.3s' }}>{copy.contact[7]}</p>
                {[['name',copy.contact[8],'text'],['email','Email','email'],['subject',copy.contact[9],'text']].map(([f,p,type]) => (
                  <input key={f} type={type} placeholder={p} required={f !== 'subject'}
                    value={form[f as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f]: e.target.value })}
                    onFocus={() => setFocus(f)} onBlur={() => setFocus(null)}
                    style={inp(f)} />
                ))}
                <textarea placeholder={copy.contact[10]} required rows={5} value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  onFocus={() => setFocus('message')} onBlur={() => setFocus(null)}
                  style={{ ...inp('message'), resize: 'none' }} />
                <button type="submit" style={{ padding: '13px', background: R, color: '#fff', border: 'none', borderRadius: '12px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', transition: 'background 0.2s', marginTop: '4px', boxShadow: `0 4px 18px ${R}44` }}
                  onMouseEnter={e => (e.currentTarget.style.background = R_DARK)}
                  onMouseLeave={e => (e.currentTarget.style.background = R)}>
                  {copy.contact[11]}
                </button>
              </form>
            )}
          </div>
        </div>

      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ background: '#000000', padding: 'clamp(24px,4vw,36px) clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)' }}>
          © 2025 {lang === 'pt' ? 'Todos os direitos do autor reservados' : 'All rights reserved'}
        </span>
        <button
          onClick={() => setIsAdminOpen(true)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '999px',
            padding: '6px 14px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(232,56,74,0.15)'
            e.currentTarget.style.borderColor = R
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          }}
        >
          <span>🔐</span> Painel Admin
        </button>
      </footer>
    </div>
  )
}

// ── StatCell ──────────────────────────────────────────────
function StatCell({ value, suffix, prefix = false, label, started, bg, muted }: { value: number; suffix: string; prefix?: boolean; label: string; started: boolean; bg: string; muted: string }) {
  const count = useCountUp(value, 1600, started)
  return (
    <div style={{ background: bg, padding: '40px 24px', textAlign: 'center', transition: 'background 0.3s' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.8rem,5vw,4.5rem)', lineHeight: 1, color: R, marginBottom: '10px' }}>
        {prefix ? suffix : ''}{count}{prefix ? '' : suffix}
      </div>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: muted, transition: 'color 0.3s' }}>{label}</div>
    </div>
  )
}

// ── STag ──────────────────────────────────────────────────
function STag({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
      <div style={{ width: '20px', height: '2px', background: R, borderRadius: '2px', flexShrink: 0 }} />
      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.25em', color: R, fontWeight: 700 }}>{label}</span>
    </div>
  )
}
