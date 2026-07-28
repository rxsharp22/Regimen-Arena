import { getDrugById } from '../../utils/decisions'
import {
  getActiveDrugIds,
  isDrugActive,
  isMonotherapy,
  isCefazolinRenallyAdjusted,
  getActiveTherapyDisplay,
} from './activeRegimen'

const DEESCALATION_TARGETS = {
  dp03_cefazolin: 'cefazolin',
  dp03_nafcillin: 'nafcillin',
  dp03_oxacillin: 'oxacillin',
  dp03_daptomycin: 'daptomycin',
  dp03_linezolid: 'linezolid',
  dp03_tmp_smx: 'tmp_smx',
}

const CONTINUATION_SCORE_MODIFIERS = {
  dp03_cefazolin: { coverage: 9, stewardship: 8, safety: 9 },
  dp03_nafcillin: { coverage: 8, stewardship: 7, safety: 7 },
  dp03_oxacillin: { coverage: 8, stewardship: 7, safety: 7 },
  dp03_daptomycin: { coverage: 7, stewardship: 6, safety: 7 },
}

function drugDisplayName(drugId) {
  return getDrugById(drugId)?.display_name ?? drugId
}

function routeLabel(drugId) {
  const route = getDrugById(drugId)?.route ?? 'IV'
  if (route === 'IV/PO' || drugId === 'linezolid' || drugId === 'tmp_smx') return ' IV/PO'
  return ' IV'
}

function usesTransitionWording(activeDrugs) {
  return activeDrugs.some((d) => ['vancomycin', 'daptomycin', 'linezolid'].includes(d))
}

export function resolveDeescalationPrompt(basePrompt, state) {
  const active = getActiveDrugIds(state)
  if (isMonotherapy(state, 'cefazolin')) {
    return 'Blood cultures have finalized MSSA. The patient is already receiving cefazolin. How do you proceed with definitive therapy?'
  }
  if (isMonotherapy(state, 'nafcillin')) {
    return 'Blood cultures have finalized MSSA. The patient is already receiving nafcillin. How do you proceed with definitive therapy?'
  }
  if (isMonotherapy(state, 'oxacillin')) {
    return 'Blood cultures have finalized MSSA. The patient is already receiving oxacillin. How do you proceed with definitive therapy?'
  }
  if (active.length > 1) {
    return 'Blood cultures have finalized MSSA. Review the current combination regimen and select definitive therapy.'
  }
  return basePrompt
}

export function resolveDeescalationOptions(options, state) {
  const active = getActiveDrugIds(state)
  const resolved = []

  for (const opt of options) {
    if (opt.id === 'dp03_continue_vancomycin') {
      if (!isDrugActive(state, 'vancomycin')) continue
      resolved.push({
        ...opt,
        label: 'Continue vancomycin IV',
        _regimenAction: 'continue',
      })
      continue
    }

    const targetDrug = DEESCALATION_TARGETS[opt.id]
    if (!targetDrug) {
      resolved.push(opt)
      continue
    }

    if (isMonotherapy(state, targetDrug)) {
      resolved.push({
        ...opt,
        label: `Continue ${drugDisplayName(targetDrug)} IV`,
        score_modifiers: CONTINUATION_SCORE_MODIFIERS[opt.id] ?? opt.score_modifiers,
        _regimenAction: 'continue',
      })
      continue
    }

    if (isDrugActive(state, targetDrug) && active.length > 1) {
      resolved.push({
        ...opt,
        label: `Narrow to ${drugDisplayName(targetDrug)}${routeLabel(targetDrug)}`,
        _regimenAction: 'narrow',
      })
      continue
    }

    const prefix = usesTransitionWording(active) ? 'Transition to' : 'Change to'
    resolved.push({
      ...opt,
      label: `${prefix} ${drugDisplayName(targetDrug)}${routeLabel(targetDrug)}`,
      _regimenAction: 'change',
    })
  }

  return resolved
}

export function resolveRenalDoseOptions(options, state) {
  const active = getActiveDrugIds(state)
  const cefazolinOnly = active.length === 1 && active[0] === 'cefazolin'
  const cefazolinAdjusted = isCefazolinRenallyAdjusted(state)

  return options
    .filter((opt) => {
      if (!opt.applicable_if) return true
      if (opt.applicable_if.includes('any')) return true
      if (!opt.applicable_if.some((drugId) => active.includes(drugId))) return false

      if (opt.id === 'dp02_adjust_cefazolin' && cefazolinAdjusted) return false
      if (opt.id === 'dp02_continue_cefazolin_adjusted' && !cefazolinAdjusted) return false

      return true
    })
    .map((opt) => {
      if (opt.id === 'dp02_no_change' && cefazolinOnly) {
        if (cefazolinAdjusted) {
          return {
            ...opt,
            label: 'Continue current cefazolin regimen (dose already adjusted)',
            _regimenAction: 'continue_adjusted',
          }
        }
        return {
          ...opt,
          label: 'Continue current cefazolin regimen without changes',
          _regimenAction: 'continue_unchanged',
        }
      }
      return { ...opt, _regimenAction: opt._regimenAction ?? 'adjust' }
    })
}

export function isContinuationDeescalation(optionId, state) {
  const target = DEESCALATION_TARGETS[optionId]
  if (!target) return optionId === 'dp03_continue_vancomycin' && isDrugActive(state, 'vancomycin')
  return isMonotherapy(state, target)
}

export function getRegimenActionForOption(decisionPointId, optionId, state) {
  if (decisionPointId === 'dp_02_dose_reassessment') {
    if (optionId === 'dp02_adjust_cefazolin') return 'adjust'
    if (optionId === 'dp02_no_change') {
      if (isMonotherapy(state, 'cefazolin') && isCefazolinRenallyAdjusted(state)) {
        return 'continue_adjusted'
      }
      return 'continue_unchanged'
    }
    if (optionId !== 'dp02_no_change' && optionId.startsWith('dp02_')) return 'adjust'
  }

  if (decisionPointId === 'dp_03_deescalation') {
    if (optionId === 'dp03_continue_vancomycin' && isDrugActive(state, 'vancomycin')) {
      return 'continue'
    }
    if (isContinuationDeescalation(optionId, state)) return 'continue'
    const target = DEESCALATION_TARGETS[optionId]
    if (target && isDrugActive(state, target) && getActiveDrugIds(state).length > 1) {
      return 'narrow'
    }
    if (target) {
      return usesTransitionWording(getActiveDrugIds(state)) ? 'transition' : 'change'
    }
  }

  return null
}

export function resolveDecisionPointForSimulation(decisionPoint, simulation) {
  if (!decisionPoint || !simulation) return decisionPoint

  if (decisionPoint.id === 'dp_03_deescalation') {
    return {
      ...decisionPoint,
      prompt: resolveDeescalationPrompt(decisionPoint.prompt, simulation),
      options: resolveDeescalationOptions(decisionPoint.options, simulation),
    }
  }

  if (decisionPoint.id === 'dp_02_dose_reassessment') {
    return {
      ...decisionPoint,
      note: undefined,
      instruction: `Current regimen: ${getActiveTherapyDisplay(simulation)}`,
      options: resolveRenalDoseOptions(decisionPoint.options, simulation),
    }
  }

  return decisionPoint
}
