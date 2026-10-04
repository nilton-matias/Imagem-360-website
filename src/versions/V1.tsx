import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Quem Somos', href: '#sobre' },
  { label: 'Motivação', href: '#motivacao' },
  { label: 'Marcas', href: '#marcas' },
  { label: 'Parceiros', href: '#parceiros' },
  { label: 'Impacto', href: '#impacto' },
  { label: 'Contato', href: '#contato' },
]

const SERVICES = [
  {
    num: '01',
    title: 'Marketing Digital',
    items: ['SMS em massa', 'SMS Transacional (OTP)', 'SMS Bidirecional', 'Email Marketing', 'Email Transacional', 'USSD', 'Criação e gestão de redes sociais'],
  },
  {
    num: '02',
    title: 'Publicidade Out-of-Home',
    items: ['Publicidade na mídia ecológica'],
  },
  {
    num: '03',
    title: 'Estratégias de Marketing',
    items: ['Consultoria', 'Identidade Visual', 'Criação de campanhas publicitárias', 'Ativações e mais'],
  },
]

const CLIENTS = ['PBF / ANC', 'LAM', 'MAHS', 'Petrogas', 'Ministério da Juventude e Desporto']

export default function V1() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredService, setHoveredService] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  const bg = '#f4f0e8'
  const surface = '#ede9e0'
  const border = '#d4cfc4'
  const muted = '#8a8070'
  const secondary = '#5a5248'
  const fg = '#1a1510'
  const fgDim = '#3a3228'
  const accent = '#e8384a'
  const accentHover = '#cc2d3a'

  return (
    <div style={{ background: bg, color: fg, fontFamily: 'var(--font-body)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ background: scrolled ? `rgba(244,240,232,0.97)` : 'transparent', borderBottom: `1px solid ${scrolled ? border : 'transparent'}`, backdropFilter: scrolled ? 'blur(12px)' : 'none' }}>
        <div className="flex items-center justify-between px-6 md:px-10 py-5">
          <a href="#home" className="font-display text-lg font-bold tracking-tight">
            IMAGEM<span style={{ color: accent }}>360</span>
          </a>
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="text-[11px] uppercase tracking-[0.18em] transition-colors"
                style={{ color: muted }} onMouseEnter={e => (e.currentTarget.style.color = fg)} onMouseLeave={e => (e.currentTarget.style.color = muted)}>
                {l.label}
              </a>
            ))}
          </div>
          <a href="#contato" className="hidden lg:block text-[11px] uppercase tracking-[0.18em] px-5 py-2.5 transition-all"
            style={{ border: `1px solid ${accent}`, color: accent }}
            onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = accent }}>
            Fale Connosco
          </a>
          <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="block w-6 h-px" style={{ background: fg, transform: menuOpen ? 'translateY(5px) rotate(45deg)' : '' }} />
            <span className="block w-6 h-px" style={{ background: fg, transform: menuOpen ? 'translateY(-3px) rotate(-45deg)' : '' }} />
          </button>
        </div>
        <div className="lg:hidden overflow-hidden transition-all duration-300" style={{ maxHeight: menuOpen ? '600px' : '0', borderTop: menuOpen ? `1px solid ${border}` : 'none' }}>
          <div className="px-6 py-6 flex flex-col gap-5" style={{ background: bg }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="text-sm uppercase tracking-[0.18em]" style={{ color: secondary }} onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex flex-col justify-between px-6 md:px-10 pt-28 pb-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden">
          <span className="font-display font-bold select-none" style={{ fontSize: 'clamp(18rem,40vw,52rem)', lineHeight: 1, color: 'transparent', WebkitTextStroke: `1px ${border}`, opacity: 0.7, transform: 'translateX(12%)' }}>360</span>
        </div>
        <div className="relative flex items-start justify-between">
          <span className="font-display text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Agência Criativa · Maputo, Moçambique</span>
          <span className="font-display text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Est. 2015</span>
        </div>
        <div className="relative py-10 md:py-16">
          <h1 className="font-display font-bold uppercase leading-[0.88] tracking-tight" style={{ fontSize: 'clamp(3.8rem,11vw,11.5rem)' }}>
            <span className="block">Mentes</span>
            <span className="block italic" style={{ color: accent }}>Iluminadas</span>
            <span className="block">Criam a</span>
            <span className="block">Grandeza</span>
          </h1>
          <div className="mt-8 flex items-center gap-5">
            <div className="h-px w-12 shrink-0" style={{ background: accent }} />
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: secondary }}>Publicitamos com educação, projetando as melhores soluções.</p>
          </div>
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <a href="#servicos" className="group inline-flex items-center gap-4 font-display text-sm uppercase tracking-[0.18em]" style={{ color: fg }}>
            <span className="inline-flex items-center justify-center w-10 h-10 transition-all duration-300 group-hover:rotate-45" style={{ border: `1px solid ${border}` }}>↓</span>
            Ver Serviços
          </a>
          <p className="font-display font-bold uppercase text-sm italic" style={{ color: muted }}>"Pense grande"</p>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicos" className="px-6 md:px-10 py-24" style={{ borderTop: `1px solid ${border}` }}>
        <div className="flex items-center gap-4 mb-16">
          <span className="font-display text-xs font-bold" style={{ color: accent }}>01</span>
          <span className="text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Nossos Serviços</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ border: `1px solid ${border}` }}>
          {SERVICES.map((s, i) => (
            <div key={i} className="p-8 md:p-10 transition-colors duration-300 cursor-default"
              style={{ borderRight: i < 2 ? `1px solid ${border}` : 'none', background: hoveredService === i ? surface : 'transparent' }}
              onMouseEnter={() => setHoveredService(i)} onMouseLeave={() => setHoveredService(null)}>
              <div className="flex items-start justify-between mb-10">
                <span className="font-display text-xs" style={{ color: muted }}>{s.num}</span>
                <div className="w-5 h-5 transition-all duration-300" style={{ border: '1px solid', borderColor: hoveredService === i ? accent : border, transform: hoveredService === i ? 'rotate(45deg)' : '' }} />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold mb-6 leading-tight">{s.title}</h3>
              <ul className="space-y-2">
                {s.items.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: secondary }}>
                    <span className="mt-2 w-1 h-1 rounded-full shrink-0" style={{ background: accent }} />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="sobre" className="px-6 md:px-10 py-24" style={{ borderTop: `1px solid ${border}`, background: surface }}>
        <div className="flex items-center gap-4 mb-16">
          <span className="font-display text-xs font-bold" style={{ color: accent }}>02</span>
          <span className="text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Quem Somos</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="font-display font-bold uppercase leading-[0.9] mb-8" style={{ fontSize: 'clamp(2.8rem,6vw,6rem)' }}>
              Pensamos<br /><span style={{ color: accent }}>fora</span><br />da caixa
            </h2>
            <p className="text-base leading-relaxed mb-5" style={{ color: secondary }}>Nascemos por necessidade de uma empresa criativa com elevação de valores sociais. Desde 2015, publicitamos com educação, projetando as melhores soluções.</p>
            <p className="text-sm leading-relaxed" style={{ color: muted }}>A nossa maneira de pensar e agir é fora da caixa.</p>
          </div>
          <div>
            {[
              { label: 'Visão', text: 'Elevar o nível da criatividade alavancando marcas nacionais e internacionais.' },
              { label: 'Missão', text: 'Comprometimento no crescimento estratégico e manutenção das marcas.' },
              { label: 'Valores', text: 'Responsabilidade ambiental · Responsabilidade social · Qualidade · Eficácia · Integridade · Inovação' },
            ].map((v, i) => (
              <div key={i} className="py-6 flex gap-8" style={{ borderTop: `1px solid ${border}` }}>
                <span className="text-[10px] uppercase tracking-[0.2em] shrink-0 w-16 pt-0.5" style={{ color: muted }}>{v.label}</span>
                <p className="text-sm leading-relaxed" style={{ color: fgDim }}>{v.text}</p>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${border}` }} />
          </div>
        </div>
      </section>

      {/* MOTIVAÇÃO */}
      <section id="motivacao" className="px-6 md:px-10 py-32 relative overflow-hidden" style={{ borderTop: `1px solid ${border}` }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="font-display font-bold select-none" style={{ fontSize: 'clamp(8rem,22vw,28rem)', lineHeight: 1, color: 'transparent', WebkitTextStroke: `1px ${border}`, opacity: 0.45, whiteSpace: 'nowrap' }}>PENSE GRANDE</span>
        </div>
        <div className="relative text-center max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-12 justify-center">
            <span className="font-display text-xs font-bold" style={{ color: accent }}>03</span>
            <span className="text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Motivação</span>
          </div>
          <blockquote className="font-display font-bold uppercase leading-[0.92]" style={{ fontSize: 'clamp(2.5rem,7vw,7rem)' }}>
            "Mentes iluminadas, criam a grandeza desejada.{' '}
            <span style={{ color: accent }}>Pense grande"</span>
          </blockquote>
        </div>
      </section>

      {/* MARCAS */}
      <section id="marcas" className="px-6 md:px-10 py-24" style={{ borderTop: `1px solid ${border}`, background: surface }}>
        <div className="flex items-center gap-4 mb-16">
          <span className="font-display text-xs font-bold" style={{ color: accent }}>04</span>
          <span className="text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Marcas</span>
        </div>
        <div className="flex flex-wrap" style={{ border: `1px solid ${border}` }}>
          {CLIENTS.map((c, i) => (
            <div key={i} className="px-8 py-7 cursor-default transition-colors duration-200"
              style={{ borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = bg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span className="font-display font-bold text-sm uppercase tracking-wide" style={{ color: muted }}>{c}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PARCEIROS */}
      <section id="parceiros" className="px-6 md:px-10 py-24" style={{ borderTop: `1px solid ${border}` }}>
        <div className="flex items-center gap-4 mb-16">
          <span className="font-display text-xs font-bold" style={{ color: accent }}>05</span>
          <span className="text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Parceiros</span>
        </div>
        <div className="flex flex-wrap" style={{ border: `1px solid ${border}` }}>
          <div className="px-8 py-7 cursor-default transition-colors duration-200"
            style={{ borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}
            onMouseEnter={e => (e.currentTarget.style.background = surface)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <span className="font-display font-bold text-sm uppercase tracking-wide" style={{ color: muted }}>Amopão</span>
          </div>
        </div>
      </section>

      {/* IMPACTO */}
      <section id="impacto" className="px-6 md:px-10 py-24" style={{ borderTop: `1px solid ${border}`, background: surface }}>
        <div className="flex items-center gap-4 mb-16">
          <span className="font-display text-xs font-bold" style={{ color: accent }}>06</span>
          <span className="text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Impacto</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: `1px solid ${border}` }}>
          {[{ num: '9+', label: 'Anos no Mercado' }, { num: '5', label: 'Marcas Nacionais' }, { num: '1', label: 'Parceiro Estratégico' }, { num: '360°', label: 'Visão Completa' }].map((s, i) => (
            <div key={i} className="p-8 md:p-12" style={{ borderRight: i < 3 ? `1px solid ${border}` : 'none' }}>
              <div className="font-display font-bold leading-none mb-3" style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', color: accent }}>{s.num}</div>
              <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contato" className="relative px-6 md:px-10 py-32 overflow-hidden" style={{ borderTop: `1px solid ${border}` }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="font-display font-bold select-none" style={{ fontSize: 'clamp(20rem,45vw,60rem)', lineHeight: 1, color: 'transparent', WebkitTextStroke: `1px ${border}`, opacity: 0.5 }}>360</span>
        </div>
        <div className="relative max-w-5xl">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-display text-xs font-bold" style={{ color: accent }}>07</span>
            <span className="text-[11px] uppercase tracking-[0.25em]" style={{ color: muted }}>Contato</span>
          </div>
          <h2 className="font-display font-bold uppercase leading-[0.88] mb-6" style={{ fontSize: 'clamp(3.5rem,10vw,10rem)' }}>
            Vamos<br /><span style={{ color: accent }}>Conversar</span>
          </h2>
          <p className="text-base mb-14" style={{ color: secondary }}>Estamos ansiosos pelo seu contato!</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              {[
                { label: 'Endereço', value: 'Av. Maguiguana, 845, Maputo, Moçambique', href: undefined },
                { label: 'Email', value: 'team@imagem360.agency', href: 'mailto:team@imagem360.agency' },
                { label: 'Telefone', value: '(+258) 875500828', href: 'tel:+258875500828' },
                { label: 'Telefone', value: '(+258) 834920306', href: 'tel:+258834920306' },
              ].map((c, i) => (
                <div key={i}>
                  <div className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: muted }}>{c.label}</div>
                  {c.href ? (
                    <a href={c.href} className="text-sm transition-colors" style={{ color: fgDim }}
                      onMouseEnter={e => (e.currentTarget.style.color = accent)} onMouseLeave={e => (e.currentTarget.style.color = fgDim)}>{c.value}</a>
                  ) : (
                    <span className="text-sm" style={{ color: fgDim }}>{c.value}</span>
                  )}
                </div>
              ))}
            </div>
            {sent ? (
              <div className="flex items-center justify-center p-12" style={{ border: `1px solid ${border}` }}>
                <div className="text-center">
                  <div className="font-display font-bold text-3xl mb-2" style={{ color: accent }}>✓</div>
                  <p className="font-display font-bold uppercase tracking-widest text-sm">Obrigado pelo envio!</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {['Nome', 'Email'].map(p => (
                  <input key={p} type={p === 'Email' ? 'email' : 'text'} placeholder={p} required
                    value={p === 'Nome' ? formData.name : formData.email}
                    onChange={e => setFormData({ ...formData, [p === 'Nome' ? 'name' : 'email']: e.target.value })}
                    className="px-5 py-4 text-sm outline-none bg-transparent"
                    style={{ border: `1px solid ${border}`, color: fg }}
                    onFocus={e => (e.currentTarget.style.borderColor = accent)} onBlur={e => (e.currentTarget.style.borderColor = border)} />
                ))}
                <textarea placeholder="Mensagem" required rows={5} value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="px-5 py-4 text-sm outline-none bg-transparent resize-none"
                  style={{ border: `1px solid ${border}`, color: fg }}
                  onFocus={e => (e.currentTarget.style.borderColor = accent)} onBlur={e => (e.currentTarget.style.borderColor = border)} />
                <button type="submit" className="font-display font-bold text-sm uppercase tracking-[0.18em] px-10 py-4 text-white transition-all"
                  style={{ background: accent }}
                  onMouseEnter={e => (e.currentTarget.style.background = accentHover)} onMouseLeave={e => (e.currentTarget.style.background = accent)}>
                  Enviar →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-10 py-7 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${border}` }}>
        <div className="font-display font-bold tracking-tight text-sm">IMAGEM<span style={{ color: accent }}>360</span></div>
        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: muted }}>© 2025 Todos os direitos do autor reservados</span>
      </footer>
    </div>
  )
}
