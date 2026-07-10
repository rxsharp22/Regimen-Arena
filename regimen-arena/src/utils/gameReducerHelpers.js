import phases from '../data/phases.json'
import { INITIAL_SCORE, SCORE_MAXES, applyScoreModifiers } from './scoring'
import { resolveConditionalEvents } from './conditionalEvents'
import { buildDecisionEffects, finalizeGame } from './gameActions'
import { initBoneDeepSimulation, processBoneDeepPhaseAdvance } from '../simulation/boneDeep'

function applyConfirmDecision(state, { decisionPoint, option, phaseIndex, subOption }) {
  const phaseData = phases[phaseIndex]

  const effects = buildDecisionEffects(
    state,
    decisionPoint,
    option,
    phaseIndex,
    phaseData,
    subOption
  )

  if (subOption?.score_modifiers) {
    effects.score = applyScoreModifiers(effects.score, subOption.score_modifiers)
  }
  if (subOption?.flags) {
    effects.activeFlags = [...new Set([...effects.activeFlags, ...subOption.flags])]
  }

  const logEntry = {
    phase: phaseIndex,
    phaseLabel: phaseData?.label,
    decisionId: decisionPoint.id,
    optionLabel: subOption
      ? `${option.label ?? effects.optionLabel} → ${subOption.label}`
      : effects.optionLabel,
    clinicalUpdate: effects.clinicalUpdate,
  }

  return {
    ...state,
    decisions: {
      ...state.decisions,
      [decisionPoint.id]: option.id ?? option.selectedIds,
      ...(subOption ? { [decisionPoint.oral_stepdown_sub_decision?.id]: subOption.id } : {}),
    },
    activeFlags: effects.activeFlags,
    activeDrugs: effects.activeDrugs,
    criticalFlags: effects.criticalFlags,
    score: effects.score,
    simulation: effects.simulation,
    eventLog: effects.eventLog,
    clinicalSnapshot: effects.clinicalSnapshot,
    feedbackLog: [...state.feedbackLog, logEntry],
    showFeedback: false,
    lastFeedback: null,
  }
}

function applyAdvancePhase(state) {
  const next = state.currentPhase + 1
  const advancingToPhase = phases[next]

  const advanceResult = processBoneDeepPhaseAdvance({
    simulation: state.simulation,
    eventLog: state.eventLog,
    clinicalSnapshot: state.clinicalSnapshot,
    phaseId: advancingToPhase?.id ?? phases[state.currentPhase]?.id,
  })

  if (next >= phases.length) {
    const { tier, debrief } = finalizeGame({
      ...state,
      simulation: advanceResult.simulation,
      eventLog: advanceResult.eventLog,
    })
    return {
      ...state,
      simulation: advanceResult.simulation,
      eventLog: advanceResult.eventLog,
      clinicalSnapshot: advanceResult.clinicalSnapshot,
      gameStatus: 'complete',
      outcomeTier: tier,
      debrief,
      showFeedback: false,
      lastFeedback: null,
    }
  }

  const { events, scorePenalty } = resolveConditionalEvents(
    next,
    state.activeDrugs,
    state.activeFlags
  )

  const simEvents = advanceResult.conditionalEvents ?? []
  const mergedEvents = [...simEvents, ...events]

  return {
    ...state,
    currentPhase: next,
    phaseHistory: [...state.phaseHistory, phases[state.currentPhase].id],
    simulation: advanceResult.simulation,
    eventLog: advanceResult.eventLog,
    clinicalSnapshot: advanceResult.clinicalSnapshot,
    conditionalEvents: mergedEvents,
    phaseNarratives: advanceResult.phaseNarratives,
    score: scorePenalty ? applyScoreModifiers(state.score, scorePenalty) : state.score,
    showFeedback: false,
    lastFeedback: null,
  }
}

export { applyConfirmDecision, applyAdvancePhase }
