import { useState, useEffect, useRef } from 'react'
import { sendContactMessage } from '../services/contactService'
import heroImg  from '../assets/hero.png'
import imgLAM    from '../assets/71b4ddcb-f27b-4cf2-a9cb-03a003079d28.png'
import imgMAHS   from '../assets/43125cf7-99ea-49eb-9d83-2778192b4e55.png'
import imgPetro  from '../assets/550ee893-25d8-42d1-a998-66ea9bbe171f.png'
import imgAmopao from '../assets/6f2cf065-bac9-4c65-8fa2-601d5c71e34e.png'
import imgBread  from '../assets/8b484c38-6242-46ac-9cf1-e3e09bcce684.png'
import imgPBF    from '../assets/7975e11e-f074-453f-9042-417445fbfce3.png'

// ── Paleta ────────────────────────────────────────────────
const R      = '#e8384a'
const R_DARK = '#c42d3d'
const R_SOFT = '#fef0f1'
const R_MID  = '#fbd5d8'
const DARK   = '#180a0c'
const MID    = '#5a3236'
const MUTED  = '#9a8284'
const BG     = '#f7f7f7'
const WHITE  = '#ffffff'

// ── Dados ─────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Serviços',    href: '#servicos' },
  { label: 'Quem Somos',  href: '#sobre' },
  { label: 'Impacto',     href: '#impacto' },
  { label: 'Marcas',      href: '#marcas' },
  { label: '360 Message', href: '#message', accent: true },
  { label: 'Contato',     href: '#contato' },
]

const CANAIS = [
  {
    num: '01', title: 'Marketing Digital',
    desc: 'Alcance preciso, entrega imediata. SMS, email e redes sociais integrados numa só estratégia.',
    items: ['SMS em massa', 'SMS Transacional (OTP)', 'SMS Bidirecional', 'Email Marketing', 'Email Transacional', 'USSD', 'Criação e gestão de redes sociais'],
  },
  {
    num: '02', title: 'Publicidade Out-of-Home',
    desc: 'Onde menos se espera, mais se impacta. Publicidade que vai ao encontro das pessoas.',
    items: ['Publicidade na mídia ecológica', 'Sacos de pão brandizados', 'Distribuição em bairros-alvo'],
  },
  {
    num: '03', title: 'Estratégias de Marketing',
    desc: 'Da ideia à execução — pensamos a comunicação da sua marca de forma integral.',
    items: ['Consultoria estratégica', 'Identidade Visual', 'Criação de campanhas', 'Ativações e mais'],
  },
]

const STATS = [
  { value: 50, suffix: '+', label: 'Campanhas' },
  { value: 10, suffix: '+', label: 'Marcas activas' },
  { value: 9,  suffix: '+', label: 'Anos no mercado' },
  { value: 3,  suffix: '',  label: 'Canais integrados' },
]

const CLIENTS = [
  { name: 'LAM — Linhas Aéreas de Moçambique', img: imgLAM },
  { name: 'MAHS — Mozambique Airport Handling Services', img: imgMAHS },
  { name: 'Petrogás', img: imgPetro },
  { name: 'AMOPÃO', img: imgAmopao },
  { name: 'PBF / ANC', img: imgPBF },
]

const VMV = [
  { l: 'Visão',   v: 'Elevar o nível da criatividade alavancando marcas nacionais e internacionais.' },
  { l: 'Missão',  v: 'Comprometimento no crescimento estratégico e manutenção das marcas.' },
  { l: 'Valores', v: 'Responsabilidade ambiental · Social · Qualidade · Eficácia · Integridade · Inovação' },
]

// ── Blob decorativo ───────────────────────────────────────
function Blob({ color = R_SOFT, style = {} }: { color?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ ...style, pointerEvents: 'none' }}>
      <path fill={color} d="M47.4,-57.2C59.7,-46.4,67.2,-30.2,69.3,-13.4C71.4,3.4,68,20.8,59.3,34.4C50.6,48,36.5,57.8,20.5,63.2C4.5,68.6,-13.5,69.6,-28.8,63.5C-44.1,57.4,-56.8,44.2,-64.1,28.3C-71.4,12.4,-73.4,-6.2,-67.8,-21.7C-62.2,-37.2,-49,-49.5,-34.8,-59.6C-20.6,-69.7,-5.4,-77.5,8.5,-77.5C22.4,-77.5,35.1,-68,47.4,-57.2Z" transform="translate(100 100)" />
    </svg>
  )
}

// ── Tag de secção ─────────────────────────────────────────
function STag({ label }: { label: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '5px 14px', background: R_SOFT, borderRadius: '999px', border: `1px solid ${R_MID}` }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: R, display: 'inline-block' }} />
      <span style={{ fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.22em', color: R, fontWeight: 700 }}>{label}</span>
    </div>
  )
}

// ── Hooks ─────────────────────────────────────────────────
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

function useInView(ref: React.RefObject<Element | null>) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.2 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return seen
}

function StatCard({ value, suffix, label, started }: { value: number; suffix: string; label: string; started: boolean }) {
  const count = useCountUp(value, 1600, started)
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding: '32px 24px', borderRadius: '24px', background: hov ? R : WHITE, boxShadow: hov ? `0 12px 40px ${R}40` : '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.3s', cursor: 'default', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.4rem,4vw,3.8rem)', lineHeight: 1, color: hov ? WHITE : R, marginBottom: '8px', transition: 'color 0.3s' }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: hov ? 'rgba(255,255,255,0.7)' : MUTED, transition: 'color 0.3s' }}>{label}</div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────
export default function V2() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [focus, setFocus]         = useState<string | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const dragState   = useRef({ dragging: false, startX: 0, scrollLeft: 0 })
  const [form, setForm]           = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent]           = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const statsRef = useRef<HTMLDivElement>(null)
  const statsOn  = useInView(statsRef as React.RefObject<Element>)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const inp = (f: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box', padding: '14px 18px', fontSize: '14px',
    color: DARK, background: BG, border: `2px solid ${focus === f ? R : R_MID}`,
    borderRadius: '14px', outline: 'none', fontFamily: 'var(--font-body)',
    transition: 'border-color 0.2s',
  })

  return (
    <div style={{ background: WHITE, color: DARK, fontFamily: 'var(--font-body)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV — pill flutuante ──────────────────────────── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px clamp(16px,4vw,48px) 0', pointerEvents: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 10px 10px 20px', borderRadius: '999px', pointerEvents: 'auto',
          background: scrolled ? 'rgba(255,250,250,0.95)' : WHITE,
          boxShadow: scrolled ? `0 4px 32px ${R}18` : '0 2px 20px rgba(0,0,0,0.07)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${R_MID}`, transition: 'all 0.3s',
        }}>
          <a href="#" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: DARK, textDecoration: 'none', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: R, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, letterSpacing: '0', boxShadow: `0 2px 8px ${R}55` }}>360</span>
            IMAGEM
          </a>

          <nav className="nav-links" style={{ alignItems: 'center', gap: '24px' }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: l.accent ? R : MUTED, fontWeight: l.accent ? 700 : 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = R)}
                onMouseLeave={e => (e.currentTarget.style.color = l.accent ? R : MUTED)}>
                {l.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href="#contato" className="hidden lg:block"
              style={{ padding: '9px 22px', background: R, color: WHITE, borderRadius: '999px', fontSize: '11px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'background 0.2s', boxShadow: `0 4px 16px ${R}44` }}
              onMouseEnter={e => (e.currentTarget.style.background = R_DARK)}
              onMouseLeave={e => (e.currentTarget.style.background = R)}>
              Falar com a equipa
            </a>
            <button className="lg:hidden" onClick={() => setMenuOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px' }}>
              <span style={{ display: 'block', width: '20px', height: '2px', background: DARK, borderRadius: '2px', transition: 'transform 0.3s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: DARK, borderRadius: '2px', transition: 'transform 0.3s', transform: menuOpen ? 'rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ marginTop: '8px', borderRadius: '24px', padding: '20px 24px', background: WHITE, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: `1px solid ${R_MID}`, display: 'flex', flexDirection: 'column', gap: '14px', pointerEvents: 'auto' }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em', color: l.accent ? R : MID, fontWeight: l.accent ? 700 : 400, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <a href="#contato" style={{ padding: '12px', background: R, color: WHITE, borderRadius: '999px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }} onClick={() => setMenuOpen(false)}>Falar com a equipa</a>
          </div>
        )}
      </div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: 'clamp(110px,14vw,140px) clamp(20px,6vw,80px) clamp(60px,8vw,80px)', position: 'relative', overflow: 'hidden' }}>
        <Blob color={R_SOFT} style={{ position: 'absolute', top: '-15%', right: '-10%', width: '560px', height: '560px', opacity: 0.9 }} />
        <Blob color={R_MID} style={{ position: 'absolute', bottom: '-10%', left: '-8%', width: '400px', height: '400px', opacity: 0.35 }} />

        <div style={{ maxWidth: '1160px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', position: 'relative' }} className="hero-grid">
          <div>
            <STag label="Maputo, Moçambique · desde 2015" />

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.8rem,5.5vw,6rem)', lineHeight: 0.88, textTransform: 'uppercase', color: DARK, letterSpacing: '-0.03em', marginBottom: '26px' }}>
              Sua marca,<br />em todos<br /><span style={{ color: R }}>os sinais.</span>
            </h1>

            <p style={{ fontSize: 'clamp(14px,1.5vw,16px)', color: MUTED, lineHeight: 1.78, maxWidth: '420px', marginBottom: '40px' }}>
              Publicitamos com educação, projetando as melhores soluções de comunicação para marcas que querem crescer em Moçambique.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <a href="#servicos"
                style={{ padding: '14px 30px', background: R, color: WHITE, borderRadius: '999px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', boxShadow: `0 6px 24px ${R}55`, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = R_DARK)}
                onMouseLeave={e => (e.currentTarget.style.background = R)}>
                Explorar serviços →
              </a>
              <a href="#contato"
                style={{ padding: '14px 30px', background: WHITE, color: R, border: `2px solid ${R_MID}`, borderRadius: '999px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = R)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = R_MID)}>
                Falar com a equipa
              </a>
            </div>

            {/* Mini stats no hero */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '40px' }}>
              {[{ n: '9+', l: 'Anos' }, { n: '50+', l: 'Campanhas' }, { n: '360°', l: 'Visão' }].map(s => (
                <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 18px', background: WHITE, borderRadius: '999px', border: `1px solid ${R_MID}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: R }}>{s.n}</span>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: MUTED }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '5%', borderRadius: '50%', background: `radial-gradient(circle, ${R_SOFT} 0%, transparent 70%)`, filter: 'blur(24px)' }} />
            <img src={heroImg} alt="Imagem 360" style={{ width: '100%', maxWidth: '520px', height: 'auto', position: 'relative', filter: 'drop-shadow(0 16px 48px rgba(232,56,74,0.15))' }} />
          </div>
        </div>
      </section>

      {/* ── CANAIS — carrossel drag ───────────────────────── */}
      <section id="servicos" style={{ padding: 'clamp(64px,8vw,96px) 0', borderTop: `1px solid ${R_MID}` }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px,6vw,80px)', marginBottom: '40px' }}>
          <STag label="O que fazemos" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.6rem)', textTransform: 'uppercase', color: DARK, lineHeight: 0.9, letterSpacing: '-0.025em' }}>
            Três canais.<br />Um só parceiro.
          </h2>
        </div>

        {/* Hint de scroll */}
        <div style={{ padding: '0 clamp(20px,6vw,80px)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: MUTED, fontWeight: 600 }}>Arraste para explorar</span>
          <span style={{ color: MUTED, fontSize: '14px' }}>→</span>
        </div>

        {/* Carrossel */}
        <div
          ref={carouselRef}
          style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '8px clamp(20px,6vw,80px) 40px', scrollSnapType: 'x mandatory', cursor: 'grab', userSelect: 'none', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={e => {
            const el = carouselRef.current; if (!el) return
            dragState.current = { dragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft }
            el.style.cursor = 'grabbing'
          }}
          onMouseMove={e => {
            if (!dragState.current.dragging) return
            const el = carouselRef.current; if (!el) return
            const x = e.pageX - el.offsetLeft
            el.scrollLeft = dragState.current.scrollLeft - (x - dragState.current.startX)
          }}
          onMouseUp={() => { dragState.current.dragging = false; if (carouselRef.current) carouselRef.current.style.cursor = 'grab' }}
          onMouseLeave={() => { dragState.current.dragging = false; if (carouselRef.current) carouselRef.current.style.cursor = 'grab' }}>
          {CANAIS.map((c, i) => (
            <div key={i} style={{
              flexShrink: 0, width: 'clamp(300px,70vw,520px)', scrollSnapAlign: 'start',
              background: i === 1 ? R : WHITE,
              borderRadius: '28px',
              border: `1.5px solid ${i === 1 ? R : R_MID}`,
              padding: 'clamp(28px,4vw,44px)',
              boxShadow: i === 1 ? `0 12px 40px ${R}44` : '0 2px 16px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', gap: '28px',
              pointerEvents: 'none',
            }}>
              {/* Número + seta */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(3rem,6vw,5rem)', lineHeight: 1, color: i === 1 ? 'rgba(255,255,255,0.2)' : R_MID, letterSpacing: '-0.04em' }}>{c.num}</span>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: i === 1 ? 'rgba(255,255,255,0.15)' : R_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: i === 1 ? WHITE : R, border: `1px solid ${i === 1 ? 'rgba(255,255,255,0.2)' : R_MID}` }}>↗</div>
              </div>

              {/* Título + descrição */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.6rem,3vw,2.4rem)', textTransform: 'uppercase', color: i === 1 ? WHITE : DARK, lineHeight: 0.92, letterSpacing: '-0.02em', marginBottom: '14px' }}>{c.title}</h3>
                <p style={{ fontSize: '14px', color: i === 1 ? 'rgba(255,255,255,0.65)' : MUTED, lineHeight: 1.7 }}>{c.desc}</p>
              </div>

              {/* Lista de serviços */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {c.items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '11px', fontSize: '13px', color: i === 1 ? 'rgba(255,255,255,0.8)' : MID }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: i === 1 ? 'rgba(255,255,255,0.5)' : R, flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Spacer final */}
          <div style={{ flexShrink: 0, width: 'clamp(4px,2vw,32px)' }} />
        </div>
      </section>

      {/* ── IMPACTO ──────────────────────────────────────── */}
      <section id="impacto" ref={statsRef} style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,6vw,80px)', borderTop: `1px solid ${R_MID}` }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <STag label="Impacto" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.6rem)', textTransform: 'uppercase', color: DARK, marginBottom: '40px', lineHeight: 0.9, letterSpacing: '-0.025em' }}>
            Números que<br />comprovam.
          </h2>

          <div style={{ background: R_SOFT, borderRadius: '32px', padding: 'clamp(28px,5vw,48px)', marginBottom: '48px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px' }}>
              {STATS.map((s, i) => <StatCard key={i} value={s.value} suffix={s.suffix} label={s.label} started={statsOn} />)}
            </div>
          </div>

          {/* Ecological media */}
          <div style={{ borderRadius: '28px', overflow: 'hidden', background: WHITE, border: `1px solid ${R_MID}`, boxShadow: `0 4px 32px rgba(232,56,74,0.07)` }}>
            <div style={{ padding: 'clamp(32px,5vw,52px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '40px', alignItems: 'center' }}>
              <div>
                <STag label="Canal 02 · Destaque" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,3rem)', textTransform: 'uppercase', color: DARK, lineHeight: 0.9, marginBottom: '14px', letterSpacing: '-0.02em' }}>
                  Publicidade<br />na <span style={{ color: R }}>mídia ecológica</span>
                </h3>
                <p style={{ fontSize: '15px', color: MUTED, lineHeight: 1.75, marginBottom: '24px' }}>
                  Os nossos sacos de pão brandizados chegam diariamente a milhares de famílias em Maputo — ecológicos, reutilizáveis e com alto recall de marca.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[['♻️','Ecológico e reutilizável'],['📍','Distribuição por bairros'],['👁','Alto recall de marca'],['📅','Contacto diário']].map(([icon, label]) => (
                    <div key={label as string} style={{ padding: '13px', background: R_SOFT, borderRadius: '14px', border: `1px solid ${R_MID}` }}>
                      <div style={{ fontSize: '18px', marginBottom: '5px' }}>{icon}</div>
                      <div style={{ fontSize: '12px', color: MID, lineHeight: 1.4 }}>{label as string}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', aspectRatio: '4/3' }}>
                  <img src={imgBread} alt="Saco de pão brandizado" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: '14px', left: '16px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>Sacos de pão brandizados · AMOPÃO</span>
                  </div>
                </div>
                {['Impressão com a sua marca', 'Distribuição em padarias parceiras', 'Nas mãos do consumidor diariamente'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: R_SOFT, borderRadius: '14px', border: `1px solid ${R_MID}` }}>
                    <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: R, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: '13px', color: MID }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUEM SOMOS ───────────────────────────────────── */}
      <section id="sobre" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,6vw,80px)', borderTop: `1px solid ${R_MID}` }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px', alignItems: 'stretch' }}>
          {/* Card vermelho */}
          <div style={{ background: R, borderRadius: '32px', padding: 'clamp(36px,5vw,56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '440px', position: 'relative', overflow: 'hidden' }}>
            <Blob color="rgba(255,255,255,0.08)" style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '300px', height: '300px' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px', padding: '5px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.22em', color: WHITE, fontWeight: 700 }}>Quem Somos</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.2rem,4.5vw,4.5rem)', textTransform: 'uppercase', color: WHITE, lineHeight: 0.88, marginBottom: '20px', letterSpacing: '-0.025em' }}>
                Nascemos<br />para pensar<br />fora da caixa.
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                A Imagem 360 nasceu por necessidade de uma empresa criativa com elevação de valores sociais. Desde 2015, publicitamos com educação.
              </p>
            </div>
            <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', position: 'relative' }}>"A nossa maneira de pensar e agir é fora da caixa."</p>
          </div>

          {/* VMV */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {VMV.map((row, i) => (
              <div key={i} style={{ padding: '24px 28px', background: WHITE, borderRadius: '24px', border: `1px solid ${R_MID}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', gap: '16px', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 28px ${R}14`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)')}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: R_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${R_MID}` }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: R, textTransform: 'uppercase' }}>{row.l[0]}</span>
                </div>
                <div>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: R, fontWeight: 700, marginBottom: '5px' }}>{row.l}</p>
                  <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.65 }}>{row.v}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARCAS ───────────────────────────────────────── */}
      <section id="marcas" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,6vw,80px)', background: R_SOFT, borderTop: `1px solid ${R_MID}` }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <STag label="Marcas que confiam em nós" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.6rem)', textTransform: 'uppercase', color: DARK, marginBottom: '16px', lineHeight: 0.9, letterSpacing: '-0.025em' }}>
            Empresas que<br />escolheram a Imagem 360.
          </h2>
          <p style={{ fontSize: '15px', color: MUTED, marginBottom: '44px' }}>Marcas moçambicanas e internacionais que confiam na nossa comunicação.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '14px' }}>
            {CLIENTS.map(c => (
              <div key={c.name}
                style={{ padding: '28px 20px', background: WHITE, borderRadius: '20px', border: `1.5px solid ${R_MID}`, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', transition: 'all 0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = R; e.currentTarget.style.boxShadow = `0 8px 28px ${R}20` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = R_MID; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}>
                <img src={c.img} alt={c.name} style={{ maxWidth: '130px', maxHeight: '60px', width: '100%', height: 'auto', objectFit: 'contain' }} />
              </div>
            ))}
            <div
              style={{ padding: '28px 20px', background: WHITE, borderRadius: '20px', border: `1.5px solid ${R_MID}`, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', transition: 'all 0.25s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = R; e.currentTarget.style.boxShadow = `0 8px 28px ${R}20` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = R_MID; e.currentTarget.style.boxShadow = 'none' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, textAlign: 'center', lineHeight: 1.5 }}>Ministério da<br />Juventude e Desporto</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 360 MESSAGE ──────────────────────────────────── */}
      <section id="message" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,6vw,80px)', borderTop: `1px solid ${R_MID}`, position: 'relative', overflow: 'hidden' }}>
        <Blob color={R_SOFT} style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', opacity: 0.8 }} />
        <div style={{ maxWidth: '1160px', margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <STag label="Produto · 360 Message" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.2rem,5vw,4.2rem)', textTransform: 'uppercase', color: DARK, lineHeight: 0.9, letterSpacing: '-0.03em', marginBottom: '20px' }}>
              A comunicação<br />da sua marca,<br /><span style={{ color: R }}>numa só plataforma.</span>
            </h2>
            <p style={{ fontSize: '16px', color: MUTED, lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 36px' }}>
              SMS em massa, email marketing e USSD integrados numa ferramenta simples, rápida e feita para o mercado moçambicano.
            </p>
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 36px', background: R, color: WHITE, border: 'none', borderRadius: '999px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', boxShadow: `0 8px 32px ${R}55`, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = R_DARK; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = R; e.currentTarget.style.transform = 'translateY(0)' }}>
              Experimentar o 360 Message
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px' }}>
            {[
              { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'SMS em Massa', desc: 'Chegue a milhares de contactos em segundos' },
              { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Email Marketing', desc: 'Campanhas visuais com métricas em tempo real' },
              { icon: 'M12 18h.01M8 21h8a2 2 0 002-2v-1a7 7 0 10-14 0v1a2 2 0 002 2z', title: 'USSD', desc: 'Interacção directa sem necessidade de internet' },
              { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Relatórios', desc: 'Dashboards com resultados de cada campanha' },
            ].map(f => (
              <div key={f.title}
                style={{ padding: '24px', background: WHITE, borderRadius: '20px', border: `1.5px solid ${R_MID}`, transition: 'all 0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = R; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${R}16` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = R_MID; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: R_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', border: `1px solid ${R_MID}` }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={R} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon}/></svg>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: DARK, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{f.title}</p>
                <p style={{ fontSize: '12px', color: MUTED, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTATO ──────────────────────────────────────── */}
      <section id="contato" style={{ padding: 'clamp(64px,8vw,96px) clamp(20px,6vw,80px)', borderTop: `1px solid ${R_MID}` }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px' }}>
          {/* Card vermelho info */}
          <div style={{ background: R, borderRadius: '32px', padding: 'clamp(36px,5vw,52px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '480px', position: 'relative', overflow: 'hidden' }}>
            <Blob color="rgba(255,255,255,0.07)" style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '280px', height: '280px' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '5px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.22em', color: WHITE, fontWeight: 700 }}>Contato</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.5rem,5vw,5rem)', textTransform: 'uppercase', color: WHITE, lineHeight: 0.88, marginBottom: '14px', letterSpacing: '-0.025em' }}>
                Vamos<br /><span style={{ opacity: 0.85 }}>conversar.</span>
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '36px' }}>Estamos ansiosos pelo seu contato!</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
              {/* Endereço com Maps */}
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '3px' }}>Endereço</p>
                <span style={{ fontSize: '14px', color: WHITE }}>Av. Maguiguana, 845, Maputo, Moçambique</span>
                <div style={{ marginTop: '6px' }}>
                  <a href="https://maps.google.com/?q=Av.+Maguiguana+845+Maputo+Mozambique" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                    Ver no Google Maps ↗
                  </a>
                </div>
              </div>
              {[
                { l: 'Email',    v: 'team@imagem360.agency',  h: 'mailto:team@imagem360.agency' },
                { l: 'Telefone', v: '(+258) 875500828',       h: 'tel:+258875500828' },
                { l: 'Telefone', v: '(+258) 834920306',       h: 'tel:+258834920306' },
              ].map((c, i) => (
                <div key={i}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '3px' }}>{c.l}</p>
                  <a href={c.h} style={{ fontSize: '14px', color: WHITE, textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>{c.v}</a>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <div style={{ background: WHITE, borderRadius: '32px', padding: 'clamp(36px,5vw,52px)', border: `1px solid ${R_MID}`, boxShadow: `0 4px 28px rgba(232,56,74,0.07)` }}>
            {sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '16px', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: R, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: `0 6px 24px ${R}55` }}>✓</div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '15px', color: DARK }}>Obrigado pelo envio!</p>
                <p style={{ fontSize: '13px', color: MUTED, maxWidth: '320px', lineHeight: 1.6 }}>Recebemos a sua mensagem através do Resend e entraremos em contacto brevemente.</p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  style={{ marginTop: '8px', padding: '8px 18px', background: 'transparent', color: R, border: `1px solid ${R}`, borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={async e => {
                e.preventDefault()
                if (isSubmitting) return
                setErrorMessage('')
                setIsSubmitting(true)
                const res = await sendContactMessage(form)
                setIsSubmitting(false)
                if (res.success) {
                  setSent(true)
                  setForm({ name: '', email: '', subject: '', message: '' })
                } else {
                  setErrorMessage(res.message)
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: DARK, marginBottom: '6px' }}>Envie-nos uma mensagem</p>
                {errorMessage && (
                  <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(232,56,74,0.1)', border: '1px solid rgba(232,56,74,0.3)', color: R, fontSize: '13px' }}>
                    {errorMessage}
                  </div>
                )}
                {[['name','Nome','text'],['email','Email','email'],['subject','Assunto','text']].map(([f,p,type]) => (
                  <input key={f} type={type} placeholder={p} required={f !== 'subject'}
                    disabled={isSubmitting}
                    value={form[f as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f]: e.target.value })}
                    onFocus={() => setFocus(f)} onBlur={() => setFocus(null)}
                    style={{ ...inp(f), opacity: isSubmitting ? 0.6 : 1 }} />
                ))}
                <textarea placeholder="Mensagem" required rows={5} value={form.message}
                  disabled={isSubmitting}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  onFocus={() => setFocus('message')} onBlur={() => setFocus(null)}
                  style={{ ...inp('message'), resize: 'none', opacity: isSubmitting ? 0.6 : 1 }} />
                <button type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '14px', background: isSubmitting ? `${R}99` : R, color: WHITE, border: 'none', borderRadius: '999px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '4px', boxShadow: `0 4px 18px ${R}44`, transition: 'background 0.2s' }}
                  onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = R_DARK }}
                  onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = R }}>
                  {isSubmitting ? 'A enviar...' : 'Enviar mensagem →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ margin: '0 clamp(16px,3vw,48px) clamp(16px,3vw,32px)', borderRadius: '24px', background: WHITE, border: `1px solid ${R_MID}`, padding: 'clamp(18px,3vw,28px) clamp(20px,4vw,48px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <a href="#" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: DARK, textDecoration: 'none', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: R, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, boxShadow: `0 2px 8px ${R}55` }}>360</span>
          IMAGEM
        </a>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: MUTED }}>© 2025 Todos os direitos do autor reservados</span>
      </footer>
    </div>
  )
}
