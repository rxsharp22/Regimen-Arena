import { getActiveDrugIds } from './activeRegimen'

/** MSSA-directed agents for Bone Deep bacteremia clearance modeling. */
const MSSA_PREFERRED_BETA_LACTAMS = ['cefazolin', 'nafcillin', 'oxacillin']
const MSSA_ACTIVE_ALTERNATIVES = ['vancomycin', 'daptomycin']
const BACTEREMIA_INADEQUATE_AGENTS = ['linezolid']

export function hasPreferredMssaBetaLactam(state) {
  return getActiveDrugIds(state).some((id) => MSSA_PREFERRED_BETA_LACTAMS.includes(id))
}

export function hasMssaActiveTherapy(state) {
  const active = getActiveDrugIds(state)
  return active.some(
    (id) => MSSA_PREFERRED_BETA_LACTAMS.includes(id) || MSSA_ACTIVE_ALTERNATIVES.includes(id)
  )
}

export function hasInadequateBacteremiaTherapy(state) {
  const active = getActiveDrugIds(state)
  if (!active.length) return true
  return active.some((id) => BACTEREMIA_INADEQUATE_AGENTS.includes(id))
}

function sourceControlled(state) {
  return state.sourceControlStatus === 'completed'
}

function sourceUncontrolled(state) {
  return ['delayed', 'inadequate', 'uncontrolled_abscess'].includes(state.sourceControlStatus)
}

function organismIsMssa(state) {
  return state.organismRevealed && state.organismIdentity === 'MSSA'
}

/**
 * Resolve repeat-culture bacteremia trajectory at day 5–7 (phase_06 entry).
 * Returns state patches — not UI text.
 */
export function resolveBacteremiaTrajectory(state, { phaseId = 'phase_06' } = {}) {
  if (phaseId !== 'phase_06' || !organismIsMssa(state)) {
    return { patches: {}, narrative: null }
  }

  const infectionBurden = state.infectionBurden ?? 85
  const stability = state.patientStability ?? 35
  const patches = {}

  if (state.treatmentFailure || state.persistentBacteremia || state.bacteremiaStatus === 'persistent') {
    patches.bacteremiaStatus = 'persistent'
    patches.cultureClearance = 'positive'
    patches.persistentBacteremia = true
    return {
      patches,
      narrative: 'Repeat blood cultures remain positive; persistent bacteremia on therapy.',
    }
  }

  if (hasInadequateBacteremiaTherapy(state)) {
    patches.bacteremiaStatus = 'persistent'
    patches.cultureClearance = 'positive'
    patches.persistentBacteremia = true
    return {
      patches,
      narrative: 'Repeat blood cultures remain positive; bacteremia has not cleared on current therapy.',
    }
  }

  if (sourceUncontrolled(state) && infectionBurden >= 60) {
    if (infectionBurden >= 80 || stability < 30) {
      patches.bacteremiaStatus = 'persistent'
      patches.cultureClearance = 'positive'
      return {
        patches,
        narrative:
          'Repeat blood cultures remain positive with ongoing deep infection and inadequate source control.',
      }
    }
    patches.bacteremiaStatus = 'clearing_slow'
    patches.cultureClearance = 'pending'
    return {
      patches,
      narrative:
        'Repeat blood cultures show intermittent positivity; clearance is delayed with uncontrolled source.',
    }
  }

  if (!hasMssaActiveTherapy(state)) {
    patches.bacteremiaStatus = 'persistent'
    patches.cultureClearance = 'positive'
    return {
      patches,
      narrative: 'Repeat blood cultures remain positive without active MSSA-directed therapy.',
    }
  }

  if (hasPreferredMssaBetaLactam(state) && sourceControlled(state) && infectionBurden < 65 && stability >= 30) {
    patches.bacteremiaStatus = 'cleared'
    patches.cultureClearance = 'cleared'
    return {
      patches,
      narrative: 'Repeat blood cultures at 72 hours: no growth.',
    }
  }

  if (hasPreferredMssaBetaLactam(state) && sourceControlled(state) && infectionBurden < 75 && stability >= 28) {
    patches.bacteremiaStatus = 'clearing'
    patches.cultureClearance = 'pending'
    return {
      patches,
      narrative: 'Repeat blood cultures: most recent set without growth; earlier sets positive.',
    }
  }

  const onVancomycinOrDaptoOnly =
    getActiveDrugIds(state).some((id) => MSSA_ACTIVE_ALTERNATIVES.includes(id)) &&
    !hasPreferredMssaBetaLactam(state)

  if (onVancomycinOrDaptoOnly && sourceControlled(state) && infectionBurden < 70) {
    patches.bacteremiaStatus = 'clearing_slow'
    patches.cultureClearance = 'pending'
    return {
      patches,
      narrative: 'Repeat blood cultures: slow clearance on non–beta-lactam MSSA therapy.',
    }
  }

  if (onVancomycinOrDaptoOnly) {
    patches.bacteremiaStatus = 'clearing_slow'
    patches.cultureClearance = 'pending'
    return {
      patches,
      narrative: 'Repeat blood cultures remain intermittently positive on vancomycin/daptomycin therapy.',
    }
  }

  if (infectionBurden >= 70 || stability < 35) {
    patches.bacteremiaStatus = 'clearing_slow'
    patches.cultureClearance = 'pending'
    return {
      patches,
      narrative: 'Repeat blood cultures: clearance delayed with ongoing systemic infection.',
    }
  }

  patches.bacteremiaStatus = 'clearing'
  patches.cultureClearance = 'pending'
  return {
    patches,
    narrative: 'Repeat blood cultures under evaluation with partial clinical response.',
  }
}

export function applyBacteremiaTrajectory(state, context = {}) {
  const { patches, narrative } = resolveBacteremiaTrajectory(state, context)
  if (!Object.keys(patches).length) {
    return { state, narrative: null, patches: {} }
  }
  return {
    state: { ...state, ...patches },
    narrative,
    patches,
  }
}

export function repeatCultureStatusText(state) {
  if (state.cultureClearance === 'cleared') {
    return 'Repeat blood cultures at 72 hours: no growth'
  }
  if (state.bacteremiaStatus === 'persistent') {
    return 'Repeat blood cultures remain positive'
  }
  if (state.bacteremiaStatus === 'clearing_slow') {
    return 'Repeat blood cultures: slow clearance — intermittent positivity'
  }
  if (state.bacteremiaStatus === 'clearing') {
    return 'Repeat blood cultures: clearance in progress'
  }
  if (state.bacteremiaStatus === 'cleared') {
    return 'Blood cultures cleared'
  }
  if (state.bacteremiaStatus === 'positive_confirmed') {
    return 'Blood cultures positive ×2'
  }
  if (state.bacteremiaStatus === 'positive_pending') {
    return 'Blood cultures pending'
  }
  if (state.bacteremiaStatus === 'positive_persists') {
    return 'Blood cultures remain positive'
  }
  return 'Blood cultures under evaluation'
}
