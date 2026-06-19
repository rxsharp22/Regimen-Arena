import { useReducer, useCallback } from 'react'
import phases from '../data/phases.json'
import { INITIAL_SCORE, SCORE_MAXES } from '../utils/scoring'
import { resolveConditionalEvents } from '../utils/conditionalEvents'
import { buildDecisionEffects, finalizeGame } from '../utils/gameActions'
import { applyScoreModifiers } from '../utils/scoring'

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
  lastFeedback: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'BEGIN_SCENARIO':
      return { ...state, gameStatus: 'active', showFeedback: false, lastFeedback: null }

    case 'CONFIRM_DECISION': {
      const { decisionPoint, option, phaseIndex, subOption } = action
      let effects = buildDecisionEffects(state, decisionPoint, option, phaseIndex)

      if (subOption?.score_modifiers) {
        effects.score = applyScoreModifiers(effects.score, subOption.score_modifiers)
      }
      if (subOption?.flags) {
        effects.activeFlags = [...new Set([...effects.activeFlags, ...subOption.flags])]
      }

      const feedbackEntry = {
        phase: phaseIndex,
        phaseLabel: phases[phaseIndex]?.label,
        decisionId: decisionPoint.id,
        optionLabel: subOption
          ? `${effects.optionLabel} → ${subOption.label}`
          : effects.optionLabel,
        outcome: subOption?.outcome ?? effects.outcome,
        feedback: subOption
          ? `${effects.feedback}\n\nOral step-down: ${subOption.feedback}`
          : effects.feedback,
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
        feedbackLog: [...state.feedbackLog, feedbackEntry],
        showFeedback: true,
        lastFeedback: {
          ...feedbackEntry,
          option,
          subOption,
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

      if (next >= phases.length) {
        const tier = finalizeGame(state)
        return {
          ...state,
          gameStatus: 'complete',
          outcomeTier: tier,
          showFeedback: false,
          lastFeedback: null,
        }
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
        score: scorePenalty ? applyScoreModifiers(state.score, scorePenalty) : state.score,
        showFeedback: false,
        lastFeedback: null,
      }
    }

    case 'RESET':
      return { ...initialGameState }

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

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
    beginScenario,
    advancePhase,
    resetGame,
    confirmDecision,
    totalPhases: phases.length,
    currentPhaseData: phases[state.currentPhase] ?? null,
    phases,
  }
}
