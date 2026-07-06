import { clamp } from './state'
import { rollDaptoToxicity, rollVancomycinRenalVariability } from './weightedOutcomes'
import { resolvePostDischargeOutcome } from './postDischarge'

const PHASE_TIME_HOURS = {
  phase_01: 0,
  phase_02: 12,
  phase_03: 24,
  phase_04: 36,
  phase_05: 48,
  phase_06: 120,
  phase_07: 144,
  phase_08: 168,
  phase_09: 504,
}

function resolvePendingConsequences(state) {
  let next = { ...state }
  const triggered = []
  const remaining = []

  for (const consequence of next.pendingConsequences) {
    let fired = false
    switch (consequence) {
      case 'debridement_completed':
        if (next.sourceControlStatus === 'scheduled' || next.sourceControlStatus === 'completed') {
          next.sourceControlStatus = 'completed'
          next.infectionBurden = clamp(next.infectionBurden - 10, 0, 100)
          next.woundDrainage = 'decreasing_serous'
          next.feverC = clamp(next.feverC - 0.3, 36.5, 40.5)
          next.wbc = clamp(next.wbc - 1.5, 4, 30)
          next.bacteremiaStatus = next.bacteremiaStatus === 'positive_pending' ? 'positive_confirmed' : next.bacteremiaStatus
          triggered.push('Surgical debridement completed; wound drainage improving.')
          fired = true
        }
        break
      case 'abscess_persists':
        if (next.sourceControlStatus === 'delayed' || next.sourceControlStatus === 'inadequate') {
          next.infectionBurden = clamp(next.infectionBurden + 8, 0, 100)
          next.feverC = clamp(next.feverC + 0.2, 36.5, 40.5)
          next.wbc = clamp(next.wbc + 1, 4, 30)
          next.woundDrainage = 'purulent_increasing'
          triggered.push('Foot abscess remains uncontrolled; purulent drainage persists.')
          fired = true
        }
        break
      case 'possible_transfer':
        if (next.sourceControlStatus === 'delayed' && next.infectionBurden > 80) {
          next.transferredForSourceControl = true
          next.patientStability = clamp(next.patientStability - 10, 0, 100)
          triggered.push('Patient transferred for higher-level surgical source control.')
          fired = true
        }
        break
      case 'aki_event':
        if (!next.renalDoseAdjusted && next.toxicityBurden > 8) {
          next.akiOccurred = true
          next.creatinine = clamp(next.creatinine + 0.6, 1.2, 4.5)
          next.renalTrend = 'worsening'
          next.patientStability = clamp(next.patientStability - 8, 0, 100)
          triggered.push('AKI worsened — SCr rising with nephrotoxic regimen exposure.')
          fired = true
        }
        break
      case 'worsening_sepsis_risk':
        if (next.sourceControlStatus === 'inadequate') {
          next.patientStability = clamp(next.patientStability - 12, 0, 100)
          next.mortalityRisk = clamp(next.mortalityRisk + 10, 0, 100)
          triggered.push('Systemic signs worsening without adequate source control.')
          fired = true
        }
        break
      case 'treatment_failure_bacteremia':
        if (next.treatmentFailure || next.persistentBacteremia) {
          next.bacteremiaStatus = 'persistent'
          next.cultureClearance = 'positive'
          next.feverC = clamp(next.feverC + 0.5, 36.5, 40.5)
          next.patientStability = clamp(next.patientStability - 15, 0, 100)
          triggered.push('Repeat blood cultures remain positive; fever recurs.')
          fired = true
        }
        break
      case 'relapse_event':
        if (next.durationAdequacy < 5) {
          next.relapseOccurred = true
          next.dischargeReadiness = 0
          next.patientStability = clamp(next.patientStability - 20, 0, 100)
          triggered.push('Relapse within weeks of discharge — recurrent osteomyelitis on MRI.')
          fired = true
        }
        break
      default:
        remaining.push(consequence)
        continue
    }
    if (!fired) remaining.push(consequence)
  }

  next.pendingConsequences = remaining
  next.triggeredConsequences = [...next.triggeredConsequences, ...triggered]
  return { state: next, triggered }
}

function applyOptimalCourseStabilityBonus(state) {
  const bacteremiaControlled =
    state.bacteremiaStatus === 'cleared' ||
    state.cultureClearance === 'cleared' ||
    state.deescalationScore >= 8

  if (
    state.sourceControlStatus === 'completed' &&
    state.renalDoseAdjusted &&
    bacteremiaControlled
  ) {
    state.patientStability = clamp(state.patientStability + 1, 0, 100)
  }
}

function applyNaturalProgression(state, phaseId) {
  let next = { ...state }
  const narratives = []

  switch (phaseId) {
    case 'phase_02':
      next.bacteremiaStatus = 'positive_confirmed'
      next.scenarioTimeHours = PHASE_TIME_HOURS.phase_02
      if (next.activeTherapy.length > 0) {
        next.feverC = clamp(next.feverC - 0.2, 36.5, 40.5)
        next.wbc = clamp(next.wbc - 1.2, 4, 30)
        next.patientStability = clamp(next.patientStability + 3, 0, 100)
      }
      narratives.push('Blood cultures ×2 positive for gram-positive cocci in clusters. MRI confirms osteomyelitis with adjacent abscess.')
      break
    case 'phase_04':
      next.scenarioTimeHours = PHASE_TIME_HOURS.phase_04
      if (next.renalDoseAdjusted) {
        next.creatinine = clamp(next.creatinine - 0.1, 1.2, 4.5)
      } else if (next.toxicityBurden > 6) {
        next.creatinine = clamp(next.creatinine + 0.2, 1.2, 4.5)
        next.renalTrend = 'worsening'
      }
      break
    case 'phase_05':
      next.scenarioTimeHours = PHASE_TIME_HOURS.phase_05
      next.organismRevealed = true
      next.organismIdentity = 'MSSA'
      next.susceptibilityRevealed = true
      narratives.push('Organism identified: MSSA with beta-lactam susceptibility.')
      if (next.deescalationScore >= 8 && next.sourceControlStatus === 'completed') {
        next.bacteremiaStatus = 'cleared'
        next.cultureClearance = 'cleared'
        next.feverC = clamp(next.feverC - 0.5, 36.0, 40.5)
        next.wbc = clamp(next.wbc - 2, 4, 30)
        narratives.push('Repeat blood cultures at 72 hours: no growth.')
      } else if (next.persistentBacteremia || next.bacteremiaStatus === 'persistent') {
        next.bacteremiaStatus = 'persistent'
        next.cultureClearance = 'positive'
        narratives.push('Repeat blood cultures remain positive.')
      } else {
        narratives.push('Blood cultures under evaluation.')
      }
      break
    case 'phase_06': {
      next.scenarioTimeHours = PHASE_TIME_HOURS.phase_06
      if (next.sourceControlStatus === 'completed') {
        next.woundDrainage = 'serous_minimal'
        next.creatinine = clamp(next.creatinine - 0.2, 1.2, 4.5)
        next.renalTrend = 'improving'
        narratives.push('Post-debridement wound improving. Renal function trending toward baseline.')
      }
      if (next.akiOccurred && next.renalDoseAdjusted) {
        narratives.push('Renal function recovering after dose adjustment.')
      }
      if (next.activeTherapy.includes('daptomycin') && !next.daptoToxicityTier) {
        const daptoRoll = rollDaptoToxicity(next)
        if (daptoRoll) {
          narratives.push(daptoRoll.narrative)
          next.variabilityFlags = [...(next.variabilityFlags ?? []), daptoRoll.id]
          next.daptoToxicityTier = daptoRoll.tier
          next.daptoToxicityNarrative = daptoRoll.narrative
          if (daptoRoll.requiresResponse) {
            next.daptoToxicityPending = true
            next.toxicityBurden = clamp(next.toxicityBurden + 2, 0, 100)
          }
        }
      }
      const vancoRoll = rollVancomycinRenalVariability(next)
      if (vancoRoll) {
        narratives.push(vancoRoll.narrative)
        next.variabilityFlags = [...(next.variabilityFlags ?? []), vancoRoll.id]
      }
      applyOptimalCourseStabilityBonus(next)
      break
    }
    case 'phase_07':
      next.scenarioTimeHours = PHASE_TIME_HOURS.phase_07
      if (next.durationAdequacy >= 7) {
        next.dischargeReadiness = clamp(next.dischargeReadiness + 15, 0, 100)
        narratives.push('Duration plan supports osteomyelitis with bacteremia after source control.')
      }
      applyOptimalCourseStabilityBonus(next)
      if (
        next.sourceControlStatus === 'completed' &&
        (next.bacteremiaStatus === 'cleared' || next.cultureClearance === 'cleared') &&
        next.patientStability >= 45
      ) {
        next.dalbavancinOffered = true
      }
      break
    case 'phase_08':
      next.scenarioTimeHours = PHASE_TIME_HOURS.phase_08
      if (next.opatReadiness >= 60 && next.dischargeReadiness >= 50) {
        narratives.push('Outpatient antimicrobial therapy planning initiated.')
      } else {
        narratives.push('Discharge planning delayed pending clinical stability and monitoring structure.')
      }
      applyOptimalCourseStabilityBonus(next)
      break
    case 'phase_09':
      next.scenarioTimeHours = PHASE_TIME_HOURS.phase_09
      {
        const outcome = resolvePostDischargeOutcome(next)
        next.postDischargeOutcomeId = outcome.id
        next.postDischargeNarrative = outcome.narrative
        next.linkedScenarioUnlocked = Boolean(outcome.linkedScenario)
        if (outcome.relapseOccurred) next.relapseOccurred = true
        if (outcome.mortalityEvent) {
          next.mortalityRisk = 100
          next.patientStability = clamp(next.patientStability - 30, 0, 100)
        }
        if (outcome.id === 'resolved_completed') {
          next.recoveryMomentum = clamp(next.recoveryMomentum + 20, 0, 100)
        }
        narratives.push(outcome.narrative)
      }
      break
    default:
      if (PHASE_TIME_HOURS[phaseId] != null) {
        next.scenarioTimeHours = PHASE_TIME_HOURS[phaseId]
      }
      break
  }

  return { state: next, narratives }
}

export function advanceBoneDeepTime(state, phaseId) {
  const pending = resolvePendingConsequences(state)
  let next = pending.state
  const triggered = [...pending.triggered]

  const progression = applyNaturalProgression(next, phaseId)
  next = progression.state

  return {
    state: next,
    clinicalNarratives: [...triggered, ...progression.narratives],
    triggeredConsequences: triggered,
  }
}

export function getPhaseTimeHours(phaseId) {
  return PHASE_TIME_HOURS[phaseId] ?? 0
}
