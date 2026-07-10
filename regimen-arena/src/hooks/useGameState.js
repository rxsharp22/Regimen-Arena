import { useReducer, useCallback } from 'react'
import phases from '../data/phases.json'
import { INITIAL_SCORE, SCORE_MAXES } from '../utils/scoring'
import { finalizeGame } from '../utils/gameActions'
import { initBoneDeepSimulation } from '../simulation/boneDeep'
import { applyConfirmDecision, applyAdvancePhase } from '../utils/gameReducerHelpers'

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
      const afterDecision = applyConfirmDecision(state, action)
      const logEntry = afterDecision.feedbackLog[afterDecision.feedbackLog.length - 1]
      return {
        ...afterDecision,
        showFeedback: true,
        lastFeedback: {
          ...logEntry,
          option: action.option,
          subOption: action.subOption,
        },
      }
    }

    case 'CONFIRM_DECISION_AND_ADVANCE': {
      const afterDecision = applyConfirmDecision(state, action)
      return applyAdvancePhase(afterDecision)
    }

    case 'ADVANCE_PHASE':
      return applyAdvancePhase(state)

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

  const confirmDecisionAndAdvance = useCallback(
    (decisionPoint, option, phaseIndex, subOption = null) => {
      dispatch({ type: 'CONFIRM_DECISION_AND_ADVANCE', decisionPoint, option, phaseIndex, subOption })
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
    confirmDecisionAndAdvance,
    totalPhases: phases.length,
    currentPhaseData: phases[state.currentPhase] ?? null,
    phases,
  }
}
