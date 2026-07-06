import { useState } from 'react'
import { getSpriteUrlOrFallback } from '../../data/spriteRegistry'
import { resolvePatientSpriteKey } from '../../utils/patientSprites'

/**
 * @param {'generic' | 'improved' | 'declining' | 'dialysis' | 'male'} variant
 */
export default function PatientStatusVisual({ variant = 'generic', label, className = '' }) {
  const [imgError, setImgError] = useState(false)
  const spriteKey = resolvePatientSpriteKey(variant)
  const src = getSpriteUrlOrFallback(spriteKey)

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {!imgError && src ? (
        <img
          src={src}
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg border border-[#2a3544]/60 bg-[#0f1419]/40"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-16 h-16 rounded-lg border border-dashed border-[#344559] bg-[#0f1419]/40" />
      )}
      {label && <span className="text-[9px] uppercase tracking-wider text-[#8b9cb3] text-center">{label}</span>}
    </div>
  )
}
