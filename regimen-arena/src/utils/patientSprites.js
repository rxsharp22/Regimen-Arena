/** Maps clinical state to patient sprite keys and variants. */

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
