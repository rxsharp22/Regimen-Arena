import { useState, useEffect, useRef } from 'react'
import OrganismSprite from './OrganismSprite'

function SimulationIllustration({ type }) {
  if (type === 'none' || !type) return null

  if (type === 'renal_warning') {
    return (
      <div className="flex flex-col items-center gap-1" aria-label="Renal toxicity monitoring cue">
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-[#c9a227]">
          <path
            fill="currentColor"
            d="M16 4c-4 0-7 3-7 7v2c0 5 3 9 7 15 4-6 7-10 7-15v-2c0-4-3-7-7-7zm0 4a3 3 0 0 1 3 3v2c0 3-2 6-3 8-1-2-3-5-3-8v-2a3 3 0 0 1 3-3z"
          />
          <text x="16" y="20" textAnchor="middle" fill="#0f1419" fontSize="10" fontWeight="bold">
            !
          </text>
        </svg>
        <span className="text-[9px] text-[#c9a227] uppercase tracking-wide">Renal monitoring</span>
      </div>
    )
  }

  if (type === 'source_control_tether') {
    return (
      <div className="flex flex-col items-center gap-1" aria-label="Uncontrolled infection source">
        <svg width="48" height="32" viewBox="0 0 48 32">
          <circle cx="36" cy="16" r="8" fill="#d9b548" opacity="0.8" />
          <path d="M4 16 Q20 4 36 16" stroke="#c45c5c" strokeWidth="2" fill="none" strokeDasharray="4 2" />
          <rect x="2" y="12" width="8" height="8" rx="2" fill="#c45c5c" opacity="0.6" />
        </svg>
        <span className="text-[9px] text-[#c45c5c] uppercase tracking-wide text-center">
          Source uncontrolled
        </span>
      </div>
    )
  }

  if (type === 'cefazolin_wall') {
    return (
      <div className="flex flex-col items-center gap-1" aria-label="Beta-lactam cell-wall activity against MSSA">
        <svg width="48" height="32" viewBox="0 0 48 32">
          <circle cx="36" cy="16" r="10" fill="#d9b548" opacity="0.9" />
          <circle cx="36" cy="16" r="10" fill="none" stroke="#4a9ead" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="8" y1="16" x2="24" y2="16" stroke="#4a9ead" strokeWidth="2" />
          <polygon points="24,12 30,16 24,20" fill="#4a9ead" />
        </svg>
        <span className="text-[9px] text-[#4a9ead] uppercase tracking-wide text-center">
          Cell-wall activity
        </span>
      </div>
    )
  }

  return null
}

export default function ClinicalResponsePanel({ drugLabel, illustration = 'none', onComplete }) {
  const [phase, setPhase] = useState('idle')
  const [spriteState, setSpriteState] = useState('idle')
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('projectile'), 50)
    const t2 = setTimeout(() => {
      setPhase('impact')
      setSpriteState('hit')
    }, 380)
    const t3 = setTimeout(() => onCompleteRef.current(), 1800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="mt-6 bg-[#151c26] border border-[#2a3544] rounded-xl p-5">
      <div className="flex items-center justify-between gap-4 min-h-[100px]">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-1">Order Placed</p>
          <p className="text-sm font-medium text-[#e8edf4]">{drugLabel}</p>
        </div>
        <div className="w-24 flex items-center justify-center relative">
          {phase === 'projectile' && illustration === 'cefazolin_wall' && (
            <div className="w-3 h-3 rounded-full bg-[#4a9ead] projectile-fly" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <SimulationIllustration type={phase === 'impact' ? illustration : 'none'} />
          <OrganismSprite animState={spriteState} organismId="mssa" label="MSSA" />
        </div>
      </div>
      {phase === 'impact' && (
        <p className="text-center mt-4 text-sm text-[#8b9cb3] effect-text-in">
          Order transmitted. Clinical course will update as time advances.
        </p>
      )}
    </div>
  )
}
