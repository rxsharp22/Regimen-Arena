import { useReducer, useCallback } from 'react'
import phases from '../data/phases.json'
import { INITIAL_SCORE, SCORE_MAXES } from '../utils/scoring'
import { resolveConditionalEvents } from '../utils/conditionalEvents'
import { buildDecisionEffects, finalizeGame } from '../utils/gameActions'
import { applyScoreModifiers } from '../utils/scoring'
import { initBoneDeepSimulation, processBoneDeepPhaseAdvance } from '../simulation/boneDeep'

const { simulation: initialSimulation, clinicalSnapshot: initialClinicalSnapshot } =
  initBoneDeepSimulation()

export const initialGameState = {
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
  gameStatus: 'landing',
  showFeedback: false,
  lastFeedback: null,
  simulation: initialSimulation,
  eventLog: [],
  clinicalSnapshot: initialClinicalSnapshot,
  debrief: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'BEGIN_INTRO':
      return { ...state, gameStatus: 'intro' }

    case 'BEGIN_SCENARIO': {
      const init = initBoneDeepSimulation()
      return {
        ...state,
        gameStatus: 'active',
        showFeedback: false,
        lastFeedback: null,
        simulation: init.simulation,
        eventLog: init.eventLog,
        clinicalSnapshot: init.clinicalSnapshot,
        currentPhase: 0,
        phaseHistory: [],
        decisions: {},
        activeFlags: [],
        activeDrugs: [],
        criticalFlags: [],
        score: { ...INITIAL_SCORE },
        feedbackLog: [],
        conditionalEvents: [],
        debrief: null,
      }
    }

    case 'CONFIRM_DECISION': {
      const { decisionPoint, option, phaseIndex, subOption } = action
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
        showFeedback: true,
        lastFeedback: {
          ...logEntry,
          option,
          subOption,
          clinicalUpdate: effects.clinicalUpdate,
          allergyCallout: decisionPoint.allergy_callout,
          showAllergyCallout:
            decisionPoint.allergy_callout &&
            (option.allergy_callout ||
              decisionPoint.allergy_callout.trigger_options?.includes(option.id)),
        },
      }
    }

    case 'ADVANCE_PHASE': {
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

    case 'RESET': {
      const init = initBoneDeepSimulation()
      return {
        ...initialGameState,
        simulation: init.simulation,
        clinicalSnapshot: init.clinicalSnapshot,
      }
    }

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  const beginIntro = useCallback(() => dispatch({ type: 'BEGIN_INTRO' }), [])
  const beginScenario = useCallback(() => dispatch({ type: 'BEGIN_SCENARIO' }), [])
  const advancePhase = useCallback(() => dispatch({ type: 'ADVANCE_PHASE' }), [])
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), [])

  const confirmDecision = useCallback(
    (decisionPoint, option, phaseIndex, subOption = null) => {
      dispatch({ type: 'CONFIRM_DECISION', decisionPoint, option, phaseIndex, subOption })
    },
    []
  )

  return {
    state,
    dispatch,
    beginIntro,
    beginScenario,
    advancePhase,
    resetGame,
    confirmDecision,
    totalPhases: phases.length,
    currentPhaseData: phases[state.currentPhase] ?? null,
    phases,
  }
}
