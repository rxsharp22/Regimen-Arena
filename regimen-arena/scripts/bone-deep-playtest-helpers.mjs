import phases from '../src/data/phases.json' with { type: 'json' }
import { INITIAL_SCORE, SCORE_MAXES } from '../src/utils/scoring.js'
import { initBoneDeepSimulation, finalizeBoneDeepSimulation } from '../src/simulation/boneDeep/index.js'
import { applyConfirmDecision, applyAdvancePhase } from '../src/utils/gameReducerHelpers.js'
import { getPendingTherapyEventDecisionId } from '../src/simulation/boneDeep/therapyEvents.js'
import { getDecisionPoint } from '../src/utils/decisions.js'

export function createGameState() {
  const init = initBoneDeepSimulation()
  return {
    scenarioId: 'scenario_01',
    currentPhase: 0,
    phaseHistory: [],
    decisions: {},
    activeFlags: [],
    activeDrugs: [],
    criticalFlags: [],
    score: { ...INITIAL_SCORE },
    scoreMaxes: { ...SCORE_MAXES },
    feedbackLog: [],
    conditionalEvents: [],
    gameStatus: 'active',
    showFeedback: false,
    lastFeedback: null,
    simulation: init.simulation,
    eventLog: init.eventLog,
    clinicalSnapshot: init.clinicalSnapshot,
    debrief: null,
  }
}

export function opt(dpId, optionId) {
  const dp = getDecisionPoint(dpId)
  const option = dp.options.find((o) => o.id === optionId)
  if (!option) throw new Error(`Missing option ${optionId} on ${dpId}`)
  return { decisionPoint: dp, option }
}

export function confirmOnly(state, dpId, optionId, subOption = null) {
  const { decisionPoint, option } = opt(dpId, optionId)
  return applyConfirmDecision(state, {
    decisionPoint,
    option,
    phaseIndex: state.currentPhase,
    subOption,
  })
}

export function confirmAndAdvance(state, dpId, optionId, subOption = null) {
  return applyAdvancePhase(
    confirmOnly(state, dpId, optionId, subOption)
  )
}

export function advanceOnly(state) {
  return applyAdvancePhase(state)
}

export function confirmMonitoring(state, selectedIds) {
  const dp = getDecisionPoint('dp_05_monitoring_plan')
  return applyConfirmDecision(state, {
    decisionPoint: dp,
    option: { selectedIds },
    phaseIndex: state.currentPhase,
    subOption: null,
  })
}

export function therapyPending(state) {
  return getPendingTherapyEventDecisionId(state.simulation, state.decisions)
}

export function resolveTherapyIfNeeded(state, responseByDp) {
  let next = state
  let pending = therapyPending(next)
  while (pending) {
    const optionId = responseByDp[pending]
    if (!optionId) throw new Error(`No canned response for ${pending}`)
    const dp = getDecisionPoint(pending)
    const isTherapyOnly = dp.therapy_event_only === true
    next = isTherapyOnly
      ? confirmOnly(next, pending, optionId)
      : confirmAndAdvance(next, pending, optionId)
    pending = therapyPending(next)
  }
  return next
}

/** Advance through phase_09 post-discharge (ends at game complete). */
export function advanceToDebrief(state) {
  let next = { ...state }
  while (next.gameStatus !== 'complete' && next.currentPhase < phases.length - 1) {
    const phase = phases[next.currentPhase]
    if (phase.decision_point_id && !therapyPending(next)) {
      break
    }
    next = advanceOnly(next)
  }
  if (next.gameStatus !== 'complete') {
    next = advanceOnly(next)
  }
  while (next.currentPhase < phases.length - 1 && next.gameStatus !== 'complete') {
    next = advanceOnly(next)
  }
  return next
}

export function finalizeState(state) {
  const { debrief } = finalizeBoneDeepSimulation(
    state.simulation,
    state.eventLog,
    state.score,
    state.criticalFlags
  )
  return debrief
}

export function playStrongRecoveryPath() {
  let s = createGameState()
  s = confirmAndAdvance(s, 'dp_01_empiric_regimen', 'opt_vanco_cefepime')
  s = advanceOnly(s)
  s = confirmAndAdvance(s, 'dp_gram_stain_response', 'gs_continue_empiric')
  s = confirmAndAdvance(s, 'dp_source_control', 'sc_urgent_or')
  s = confirmAndAdvance(s, 'dp_02_dose_reassessment', 'dp02_reduce_cefepime')
  s = resolveTherapyIfNeeded(s, {
    dp_vanco_infusion_response: 'vanco_pause_slow_restart',
    dp_cefepime_neuro_response: 'cefepime_adjust_monitor',
    dp_allergy_clarification: 'allergy_proceed_cefazolin',
  })
  if (therapyPending(s) === 'dp_allergy_clarification') {
    s = confirmOnly(s, 'dp_allergy_clarification', 'allergy_proceed_cefazolin')
  }
  s = confirmAndAdvance(s, 'dp_03_deescalation', 'dp03_cefazolin')
  while (s.currentPhase < 6) s = advanceOnly(s)
  s = resolveTherapyIfNeeded(s, {
    dp_dapto_toxicity_response: 'dapto_resp_hold_recheck_ck',
    dp_cefepime_neuro_response: 'cefepime_adjust_monitor',
  })
  while (s.currentPhase < 7) s = advanceOnly(s)
  s = confirmAndAdvance(s, 'dp_04_duration_and_transition', 'dp04_6wk_iv_opat')
  s = advanceOnly(
    confirmMonitoring(s, [
      'mon_bmp_weekly',
      'mon_clinical_followup',
      'mon_id_followup',
      'mon_opat_line_check',
      'mon_vanco_auc',
    ])
  )
  while (s.gameStatus !== 'complete') s = advanceOnly(s)
  return s
}
