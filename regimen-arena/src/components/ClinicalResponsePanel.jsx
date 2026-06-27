import { useState, useEffect, useRef } from 'react'
import OrganismSprite from './OrganismSprite'

const ASSESSMENT = {
  optimal: { text: 'Bactericidal · Optimal spectrum', color: '#3d9a6e', large: true },
  reasonable: { text: 'Appropriate coverage', color: '#4a9ead', large: false },
  acceptable: { text: 'Suboptimal agent for indication', color: '#c9a227', large: false },
  suboptimal: { text: 'Coverage gap identified', color: '#c9a227', large: false },
  excessive_spectrum: { text: 'Spectrum exceeds indication', color: '#c45c5c', large: false },
  unsafe: { text: 'TREATMENT FAILURE RISK', color: '#c45c5c', large: true },
}

function animForOutcome(outcome) {
  if (outcome === 'optimal' || outcome === 'reasonable') return 'hit'
  if (outcome === 'unsafe') return 'backfire'
  return 'miss'
}

export default function ClinicalResponsePanel({ outcome, drugLabel, onComplete }) {
  const [phase, setPhase] = useState('idle')
  const [spriteState, setSpriteState] = useState('idle')
  const assessment = ASSESSMENT[outcome] ?? ASSESSMENT.reasonable
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('projectile'), 50)
    const t2 = setTimeout(() => {
      setPhase('impact')
      setSpriteState(animForOutcome(outcome))
    }, 380)
    const t3 = setTimeout(() => onCompleteRef.current(), 2000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [outcome])

  return (
    <div className="mt-6 bg-[#151c26] border border-[#2a3544] rounded-xl p-5">
      <div className="flex items-center justify-between gap-4 min-h-[100px]">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-1">Order Placed</p>
          <p className="text-sm font-medium text-[#e8edf4]">{drugLabel}</p>
        </div>
        <div className="w-24 flex items-center justify-center relative">
          {phase === 'projectile' && (
            <div className="w-3 h-3 rounded-full bg-[#4a9ead] projectile-fly" />
          )}
        </div>
        <OrganismSprite animState={spriteState} organismId="mssa" label="MSSA" />
      </div>
      {phase === 'impact' && (
        <p
          className={`text-center mt-4 effect-text-in ${assessment.large ? 'text-lg font-bold' : 'text-sm font-semibold'}`}
          style={{ color: assessment.color }}
        >
          {assessment.text}
        </p>
      )}
    </div>
  )
}
