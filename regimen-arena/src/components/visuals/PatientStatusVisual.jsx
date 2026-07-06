import { useState } from 'react'
import { getSpriteUrlOrFallback } from '../../data/spriteRegistry'

/**
 * @param {'generic' | 'improved' | 'declining' | 'dialysis' | 'male'} variant
 */
export function resolvePatientSpriteKey(variant) {
  const map = {
    generic: 'patientGeneric',
    improved: 'patientImproved',
    declining: 'patientDeclining',
    dialysis: 'patientOlderDialysis',
    male: 'patientMale',
  }
  return map[variant] ?? 'patientGeneric'
}

export function patientVariantFromSnapshot(clinicalSnapshot, simulation = null) {
  if (!clinicalSnapshot) return 'generic'

  const stability = clinicalSnapshot.stability
  const renalWarning = clinicalSnapshot.renalWarning || simulation?.akiOccurred
  const complications = clinicalSnapshot.complications ?? []

  if (
    stability === 'critical' ||
    complications.length >= 2 ||
    clinicalSnapshot.bacteremiaStatus === 'persistent'
  ) {
    return 'declining'
  }
  if (stability === 'stable' || stability === 'improving') {
    return renalWarning ? 'dialysis' : 'improved'
  }
  if (renalWarning && simulation?.creatinine >= 2.2) {
    return 'dialysis'
  }
  return 'generic'
}

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
