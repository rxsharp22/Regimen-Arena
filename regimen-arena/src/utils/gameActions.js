import { applyScoreModifiers, computeOutcomeTier } from './scoring'
import { scoreMonitoringPlan } from './decisions'

export function buildDecisionEffects(state, decisionPoint, option, phaseIndex) {
  const phase = phaseIndex
  let score = state.score
  let activeDrugs = [...state.activeDrugs]
  let activeFlags = [...state.activeFlags]
  let criticalFlags = [...state.criticalFlags]
  let outcome = option.outcome
  let feedback = option.feedback ?? ''

  if (decisionPoint.type === 'multi_select') {
    const result = scoreMonitoringPlan(option.selectedIds, state.activeDrugs, decisionPoint, state.decisions)
    score = { ...score, monitoring: result.monitoringScore }
    outcome = result.outcome
    feedback = result.feedbackParts.filter(Boolean).join('\n\n')
    if (result.hasCritical) {
      criticalFlags.push('critical_no_monitoring_plan')
    }
    for (const id of option.selectedIds) {
      const opt = decisionPoint.options.find((o) => o.id === id)
      if (opt?.critical_flag) criticalFlags.push(opt.id)
      if (opt?.flags) activeFlags.push(...opt.flags)
    }
    activeFlags = [...new Set(activeFlags)]
    criticalFlags = [...new Set(criticalFlags)]

    return {
      score,
      activeDrugs,
      activeFlags,
      criticalFlags,
      outcome,
      feedback,
      optionLabel: result.selectedLabels.join('; ') || 'No selections',
    }
  }

  if (option.score_modifiers) {
    score = applyScoreModifiers(score, option.score_modifiers)
  }

  if (option.flags?.length) {
    activeFlags = [...new Set([...activeFlags, ...option.flags])]
  }

  if (option.critical_flag) {
    criticalFlags = [...new Set([...criticalFlags, option.id])]
  }

  if (option.drugs?.length) {
    if (decisionPoint.id === 'dp_01_empiric_regimen' || decisionPoint.id === 'dp_03_deescalation') {
      activeDrugs = [...option.drugs]
    } else {
      activeDrugs = [...new Set([...activeDrugs, ...option.drugs])]
    }
  }

  return {
    score,
    activeDrugs,
    activeFlags,
    criticalFlags,
    outcome,
    feedback,
    optionLabel: option.label,
  }
}

export function finalizeGame(state) {
  const tier = computeOutcomeTier(state.score, state.scoreMaxes, state.criticalFlags)
  return tier
}
