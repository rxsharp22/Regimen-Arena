const ANIM_CLASS = {
  idle: 'bacteria-idle',
  hit: 'bacteria-hit',
  miss: 'bacteria-miss',
  backfire: 'bacteria-backfire',
  cleared: '',
}

function FallbackSprite() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden>
      <circle cx="32" cy="32" r="12" fill="none" stroke="#c9a227" strokeWidth="2" opacity="0.9" />
      <circle cx="48" cy="28" r="12" fill="none" stroke="#c9a227" strokeWidth="2" opacity="0.9" />
      <circle cx="40" cy="44" r="12" fill="none" stroke="#c9a227" strokeWidth="2" opacity="0.85" />
      <circle cx="26" cy="42" r="10" fill="none" stroke="#c9a227" strokeWidth="1.5" opacity="0.7" />
    </svg>
  )
}

export default function OrganismSprite({ animState = 'idle', src }) {
  const animClass = ANIM_CLASS[animState] ?? ANIM_CLASS.idle
  const clearedClass = animState === 'cleared' ? 'opacity-20 scale-75 transition-all duration-700' : ''

  return (
    <div className={`flex flex-col items-center ${animClass} ${clearedClass}`}>
      {src ? (
        <img src={src} alt="" className="w-20 h-20 object-contain" />
      ) : (
        <FallbackSprite />
      )}
      {!src && (
        <span className="text-[9px] font-mono text-[#8b9cb3] mt-1 tracking-wider">S. AUREUS</span>
      )}
    </div>
  )
}
