const RESISTANCE_OVERLAYS = {
  esbl: { icon: '⛨', label: 'ESBL', broken: true },
  carbapenemase: { icon: '🔒', label: 'Carbapenemase' },
  efflux: { icon: '↗', label: 'Efflux pump' },
  biofilm: { icon: '≋', label: 'Biofilm' },
}

function GramPositiveCocciGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="w-16 h-16" aria-label="Gram-positive cocci clusters">
      <circle cx="24" cy="28" r="7" fill="none" stroke="#c9a8a8" strokeWidth="1.5" opacity="0.9" />
      <circle cx="36" cy="24" r="7" fill="none" stroke="#c9a8a8" strokeWidth="1.5" opacity="0.9" />
      <circle cx="32" cy="36" r="7" fill="none" stroke="#c9a8a8" strokeWidth="1.5" opacity="0.9" />
      <circle cx="20" cy="38" r="6" fill="none" stroke="#c9a8a8" strokeWidth="1.2" opacity="0.7" />
      <circle cx="42" cy="34" r="6" fill="none" stroke="#c9a8a8" strokeWidth="1.2" opacity="0.7" />
      <text x="32" y="58" textAnchor="middle" fill="#8b9cb3" fontSize="7" fontFamily="IBM Plex Sans">G+ cocci</text>
    </svg>
  )
}

function GramNegativeRodsGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="w-16 h-16" aria-label="Gram-negative rods">
      <rect x="18" y="20" width="6" height="22" rx="2" fill="none" stroke="#a8c4c9" strokeWidth="1.5" transform="rotate(-15 21 31)" />
      <rect x="30" y="18" width="6" height="24" rx="2" fill="none" stroke="#a8c4c9" strokeWidth="1.5" />
      <rect x="42" y="22" width="6" height="20" rx="2" fill="none" stroke="#a8c4c9" strokeWidth="1.5" transform="rotate(12 45 32)" />
      <text x="32" y="58" textAnchor="middle" fill="#8b9cb3" fontSize="7" fontFamily="IBM Plex Sans">G− rods</text>
    </svg>
  )
}

function YeastGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="w-16 h-16" aria-label="Yeast forms">
      <ellipse cx="32" cy="30" rx="12" ry="14" fill="none" stroke="#c9c4a8" strokeWidth="1.5" />
      <circle cx="26" cy="26" r="2" fill="#c9c4a8" opacity="0.4" />
      <circle cx="36" cy="28" r="1.5" fill="#c9c4a8" opacity="0.4" />
      <path d="M32 16 Q28 10 32 8 Q36 10 32 16" fill="none" stroke="#c9c4a8" strokeWidth="1" />
      <text x="32" y="58" textAnchor="middle" fill="#8b9cb3" fontSize="7" fontFamily="IBM Plex Sans">yeast</text>
    </svg>
  )
}

function OrganismGlyph({ morphology }) {
  switch (morphology) {
    case 'gram_negative_rods':
      return <GramNegativeRodsGlyph />
    case 'yeast':
      return <YeastGlyph />
    case 'gram_positive_cocci':
    default:
      return <GramPositiveCocciGlyph />
  }
}

function SusceptibilityGrid({ susceptibilities }) {
  const resultColor = (r) => {
    if (r === 'S') return 'text-[#3d9a6e] border-[#3d9a6e]/40 bg-[#3d9a6e]/10'
    if (r === 'I') return 'text-[#c9a227] border-[#c9a227]/40 bg-[#c9a227]/10'
    return 'text-[#c45c5c] border-[#c45c5c]/40 bg-[#c45c5c]/10'
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 mt-3">
      {susceptibilities.map(({ drug, result }) => (
        <div key={drug} className="text-center">
          <div className="text-[9px] text-[#8b9cb3] truncate mb-0.5">{drug}</div>
          <div className={`text-xs font-bold py-1 rounded border ${resultColor(result)}`}>{result}</div>
        </div>
      ))}
    </div>
  )
}

export default function CultureOrganismHUD({ organism, visible }) {
  if (!visible || !organism) {
    return (
      <div className="border border-dashed border-[#2a3544] rounded-md p-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3]">Culture & Organism HUD</p>
        <p className="text-xs text-[#4a5568] mt-2">Awaiting culture finalization at T36</p>
      </div>
    )
  }

  return (
    <div className="border border-[#2a3544] rounded-md p-4 bg-[#151c26]">
      <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] mb-3">Culture & Organism HUD</p>

      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <OrganismGlyph morphology={organism.morphology} />
          {organism.resistance?.map((r) => {
            const overlay = RESISTANCE_OVERLAYS[r]
            if (!overlay) return null
            return (
              <span
                key={r}
                className="absolute -top-1 -right-1 text-xs bg-[#1a222d] border border-[#c45c5c]/50 rounded px-1"
                title={overlay.label}
              >
                {overlay.icon}
              </span>
            )
          })}
          {organism.resistance?.includes('biofilm') && (
            <div className="absolute inset-0 rounded-full bg-[#4a9ead]/10 blur-sm pointer-events-none" aria-hidden />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm italic">{organism.name}</h4>
          <span className="inline-block text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded border border-[#3d9a6e]/40 text-[#3d9a6e] bg-[#3d9a6e]/10">
            {organism.interpretation}
          </span>
          <SusceptibilityGrid susceptibilities={organism.susceptibilities} />
        </div>
      </div>
    </div>
  )
}
