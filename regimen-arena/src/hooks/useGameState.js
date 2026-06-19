import { useReducer, useCallback } from 'react'
import phases from '../data/phases.json'
import { INITIAL_SCORE, SCORE_MAXES } from '../utils/scoring'
import { resolveConditionalEvents } from '../utils/conditionalEvents'

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
  gameStatus: 'intro',
  showFeedback: false,
  outcomeTier: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'BEGIN_SCENARIO':
      return { ...state, gameStatus: 'active' }

    case 'SET_DECISION':
      return {
        ...state,
        decisions: { ...state.decisions, [action.decisionId]: action.optionId },
      }

    case 'ADD_FLAGS':
      return {
        ...state,
        activeFlags: [...new Set([...state.activeFlags, ...action.flags])],
      }

    case 'ADD_DRUGS':
      return {
        ...state,
        activeDrugs: [...new Set([...state.activeDrugs, ...action.drugs])],
      }

    case 'ADD_CRITICAL_FLAG':
      return {
        ...state,
        criticalFlags: [...new Set([...state.criticalFlags, action.flagId])],
      }

    case 'UPDATE_SCORE':
      return { ...state, score: action.score }

    case 'LOG_FEEDBACK':
      return {
        ...state,
        feedbackLog: [...state.feedbackLog, action.entry],
        showFeedback: true,
      }

    case 'SET_CONDITIONAL_EVENTS':
      return { ...state, conditionalEvents: action.events }

    case 'ADVANCE_PHASE': {
      const next = state.currentPhase + 1
      if (next >= phases.length) {
        return { ...state, gameStatus: 'complete', currentPhase: next - 1 }
      }

      const { events, scorePenalty } = resolveConditionalEvents(
        next,
        state.activeDrugs,
        state.activeFlags
      )

      return {
        ...state,
        currentPhase: next,
        phaseHistory: [...state.phaseHistory, phases[state.currentPhase].id],
        conditionalEvents: events,
        score: scorePenalty ? { ...state.score, ...scorePenalty } : state.score,
        showFeedback: false,
      }
    }

    case 'SET_OUTCOME_TIER':
      return { ...state, outcomeTier: action.tier }

    case 'RESET':
      return initialGameState

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  const beginScenario = useCallback(() => dispatch({ type: 'BEGIN_SCENARIO' }), [])
  const advancePhase = useCallback(() => dispatch({ type: 'ADVANCE_PHASE' }), [])
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), [])

  return {
    state,
    dispatch,
    beginScenario,
    advancePhase,
    resetGame,
    totalPhases: phases.length,
    currentPhaseData: phases[state.currentPhase] ?? null,
  }
}
