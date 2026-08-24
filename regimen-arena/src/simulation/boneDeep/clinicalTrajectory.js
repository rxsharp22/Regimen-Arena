import { clamp } from './state'

const ADMISSION_FEVER = 38.9
const ADMISSION_WBC = 18.4

/**
 * Derive target vitals from accumulated simulation state (deterministic).
 */
export function deriveClinicalVitals(state) {
  const infectionBurden = state.infectionBurden ?? 85
  const stability = state.patientStability ?? 35

  let feverC = 36.5 + (infectionBurden / 100) * 3.2
  let wbc = 4 + (infectionBurden / 100) * 14

  switch (state.bacteremiaStatus) {
    case 'cleared':
      feverC -= 0.6
      wbc -= 3
      break
    case 'clearing':
      feverC -= 0.35
      wbc -= 1.8
      break
    case 'clearing_slow':
      feverC -= 0.1
      wbc -= 0.8
      break
    case 'persistent':
    case 'positive_persists':
      feverC += 0.4
      wbc += 1.5
      break
    default:
      break
  }

  if (state.sourceControlStatus === 'completed') {
    feverC -= 0.35
    wbc -= 1.2
  } else if (['delayed', 'inadequate', 'uncontrolled_abscess'].includes(state.sourceControlStatus)) {
    feverC += 0.25
    wbc += 0.8
  }

  if (stability >= 60) {
    feverC -= 0.2
    wbc -= 0.5
  } else if (stability < 25) {
    feverC += 0.5
    wbc += 1
  }

  if (state.akiOccurred && !state.renalDoseAdjusted) {
    feverC += 0.15
  }

  if (state.toxicityBurden >= 10) {
    feverC += 0.1
  }

  feverC = clamp(feverC, 36.0, 40.5)
  wbc = clamp(wbc, 4, 30)

  return {
    feverC: Number(feverC.toFixed(1)),
    wbc: Number(wbc.toFixed(1)),
  }
}

/**
 * Apply wound drainage progression at phase_06 from source control + infection burden.
 */
export function deriveWoundDrainage(state) {
  if (['delayed', 'inadequate', 'uncontrolled_abscess'].includes(state.sourceControlStatus)) {
    return state.infectionBurden >= 75 ? 'purulent_increasing' : 'purulent'
  }
  if (state.sourceControlStatus === 'completed') {
    if (state.infectionBurden < 50) return 'serous_minimal'
    if (state.infectionBurden < 65) return 'decreasing_serous'
    return 'decreasing_serous'
  }
  return state.woundDrainage ?? 'purulent'
}

/**
 * Apply mid-course clinical trajectory updates at phase_06.
 */
export function applyClinicalTrajectory(state, phaseId = 'phase_06') {
  if (phaseId !== 'phase_06') {
    return { state, vitals: null, skipped: false }
  }

  if (state.clinicalTrajectoryAppliedAtPhase06) {
    return { state, vitals: null, skipped: true }
  }

  let next = { ...state }
  const vitals = deriveClinicalVitals(next)

  next.feverC = vitals.feverC
  next.wbc = vitals.wbc
  next.woundDrainage = deriveWoundDrainage(next)

  if (next.sourceControlStatus === 'completed' && next.renalDoseAdjusted && next.akiOccurred) {
    next.creatinine = clamp(next.creatinine - 0.15, 1.2, 4.5)
    next.renalTrend = 'improving'
  } else if (next.sourceControlStatus === 'completed' && next.renalDoseAdjusted) {
    next.creatinine = clamp(next.creatinine - 0.2, 1.2, 4.5)
    next.renalTrend = 'improving'
  } else if (next.akiOccurred && !next.renalDoseAdjusted) {
    next.renalTrend = 'worsening'
  }

  if (next.bacteremiaStatus === 'cleared' && next.cultureClearance === 'cleared') {
    next.patientStability = clamp(next.patientStability + 4, 0, 100)
  } else if (next.bacteremiaStatus === 'persistent') {
    next.patientStability = clamp(next.patientStability - 5, 0, 100)
  }

  if (next.infectionBurden < 55 && next.sourceControlStatus === 'completed') {
    next.infectionBurden = clamp(next.infectionBurden - 3, 0, 100)
  }

  next.clinicalTrajectoryAppliedAtPhase06 = true

  return { state: next, vitals, skipped: false }
}

export function clinicalTrajectorySnapshot(state) {
  const vitals = deriveClinicalVitals(state)
  return {
    feverC: vitals.feverC,
    wbc: vitals.wbc,
    woundDrainage: deriveWoundDrainage(state),
    feverImprovedFromAdmission: vitals.feverC < ADMISSION_FEVER - 0.3,
    wbcImprovedFromAdmission: vitals.wbc < ADMISSION_WBC - 1,
    admissionFever: ADMISSION_FEVER,
    admissionWbc: ADMISSION_WBC,
  }
}
