type Version = 1 | 2 | 3

interface Props {
  current: Version
  onChange: (v: Version) => void
}

const LABELS: Record<Version, { short: string; desc: string }> = {
  1: { short: 'V1', desc: 'Editorial' },
  2: { short: 'V2', desc: 'Colorida' },
  3: { short: 'V3', desc: 'Proposta' },
}

export default function VersionToggle({ current, onChange }: Props) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[100] flex items-center gap-1 p-1 rounded-full shadow-2xl"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(13,59,30,0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {([1, 2, 3] as Version[]).map(v => {
        const active = current === v
        const disabled = false
        return (
          <button
            key={v}
            onClick={() => !disabled && onChange(v)}
            disabled={disabled}
            title={LABELS[v].desc}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300"
            style={{
              background: active ? '#e8384a' : 'transparent',
              color: active ? '#fff' : disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
            onMouseLeave={e => { if (!active && !disabled) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          >
            <span>{LABELS[v].short}</span>
            <span className="hidden sm:inline font-normal opacity-70" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'none', fontSize: '10px' }}>
              {LABELS[v].desc}
            </span>
          </button>
        )
      })}
    </div>
  )
}
