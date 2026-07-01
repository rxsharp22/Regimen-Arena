import { applyScoreModifiers } from './scoring'
import { scoreMonitoringPlan } from './decisions'
import {
  processBoneDeepDecision,
  finalizeBoneDeepSimulation,
} from '../simulation/boneDeep'

export function buildDecisionEffects(state, decisionPoint, option, phaseIndex, phaseData, subOption = null) {
  const simResult = processBoneDeepDecision({
    simulation: state.simulation,
    eventLog: state.eventLog,
    clinicalSnapshot: state.clinicalSnapshot,
    decisionPoint,
    option,
    subOption,
    phaseId: phaseData?.id,
    phaseLabel: phaseData?.label,
    informationAvailable: phaseData?.new_information ?? [],
    activeDrugsBefore: state.activeDrugs,
  })

  let score = state.score
  let criticalFlags = [...state.criticalFlags]

  if (decisionPoint.type === 'multi_select') {
    const result = scoreMonitoringPlan(option.selectedIds, state.activeDrugs, decisionPoint, state.decisions)
    score = { ...score, monitoring: result.monitoringScore }
    if (result.hasCritical) {
      criticalFlags.push('critical_no_monitoring_plan')
    }
    for (const id of option.selectedIds) {
      const opt = decisionPoint.options.find((o) => o.id === id)
      if (opt?.critical_flag) criticalFlags.push(opt.id)
    }
    criticalFlags = [...new Set(criticalFlags)]
  } else {
    if (option.score_modifiers) {
      score = applyScoreModifiers(score, option.score_modifiers)
    }
    if (option.critical_flag) {
      criticalFlags = [...new Set([...criticalFlags, option.id])]
    }
  }

  const optionLabel =
    decisionPoint.type === 'multi_select'
      ? option.selectedIds
          ?.map((id) => decisionPoint.options.find((o) => o.id === id)?.label)
          .filter(Boolean)
          .join('; ') || 'Monitoring plan'
      : subOption
        ? `${option.label} → ${subOption.label}`
        : option.label

  return {
    score,
    activeDrugs: simResult.activeDrugs,
    activeFlags: simResult.activeFlags,
    criticalFlags,
    simulation: simResult.simulation,
    eventLog: simResult.eventLog,
    clinicalSnapshot: simResult.clinicalSnapshot,
    clinicalUpdate: simResult.clinicalUpdate,
    optionLabel,
    hiddenEffects: simResult.hiddenEffects,
  }
}


export function finalizeGame(state) {
  const { debrief, outcomeTier } = finalizeBoneDeepSimulation(
    state.simulation,
    state.eventLog,
    state.score,
    state.criticalFlags
  )
  return { tier: outcomeTier, debrief }
}
