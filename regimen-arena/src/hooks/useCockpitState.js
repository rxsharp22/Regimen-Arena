import { useReducer, useCallback, useMemo } from 'react'
import scenario from '../data/scenario.json'
import drugsData from '../data/drugs.json'
import patient from '../data/patient.json'
import { evaluateStewardship, computeOutcomeTier } from '../utils/stewardship'

const STAGE_ORDER = ['t0', 't12', 't36', 'outcome']

const initialState = {
  currentStage: 't0',
  unlockedStages: ['t0'],
  expandedEvents: {},
  activeRegimen: [],
  feedbackHistory: [],
  currentFeedback: null,
  organism: null,
  gameComplete: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_EVENT': {
      const id = action.eventId
      return {
        ...state,
        expandedEvents: { ...state.expandedEvents, [id]: !state.expandedEvents[id] },
      }
    }

    case 'ADD_DRUG': {
      if (state.activeRegimen.some((d) => d.id === action.drug.id)) return state
      return { ...state, activeRegimen: [...state.activeRegimen, action.drug], currentFeedback: null }
    }

    case 'REMOVE_DRUG':
      return {
        ...state,
        activeRegimen: state.activeRegimen.filter((d) => d.id !== action.drugId),
        currentFeedback: null,
      }

    case 'EVALUATE_REGIMEN': {
      const feedback = evaluateStewardship(state.activeRegimen, state.currentStage, scenario)
      const exists = state.feedbackHistory.some((f) => f.stage === state.currentStage)
      const feedbackHistory = exists
        ? state.feedbackHistory.map((f) => (f.stage === state.currentStage ? { stage: state.currentStage, ...feedback } : f))
        : [...state.feedbackHistory, { stage: state.currentStage, ...feedback }]
      return { ...state, currentFeedback: feedback, feedbackHistory }
    }

    case 'ADVANCE_STAGE': {
      const idx = STAGE_ORDER.indexOf(state.currentStage)
      if (idx < 0 || idx >= STAGE_ORDER.length - 1) return state
      const next = STAGE_ORDER[idx + 1]
      const unlocked = state.unlockedStages.includes(next)
        ? state.unlockedStages
        : [...state.unlockedStages, next]

      let organism = state.organism
      if (next === 't36' || next === 'outcome') {
        const cultureEvent = scenario.timelineEvents.t36?.find((e) => e.organism)
        organism = cultureEvent?.organism ?? organism
      }

      const gameComplete = next === 'outcome'

      return {
        ...state,
        currentStage: next,
        unlockedStages: unlocked,
        currentFeedback: null,
        organism,
        gameComplete,
      }
    }

    case 'SET_STAGE':
      if (!state.unlockedStages.includes(action.stage)) return state
      return { ...state, currentStage: action.stage, currentFeedback: null }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

export function useCockpitState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const drugs = useMemo(() => drugsData, [])
  const stageConfig = useMemo(
    () => scenario.timelineStages.find((s) => s.id === state.currentStage),
    [state.currentStage]
  )

  const availableDrugs = useMemo(() => {
    if (state.currentStage === 't0') {
      const ids = stageConfig?.empiricOptions ?? []
      return drugs.filter((d) => ids.includes(d.id))
    }
    if (state.currentStage === 't36') {
      return drugs.filter((d) =>
        ['cefazolin', 'vancomycin', 'nafcillin', 'daptomycin', 'linezolid'].includes(d.id)
      )
    }
    return []
  }, [state.currentStage, stageConfig, drugs])

  const outcome = useMemo(
    () => (state.gameComplete ? computeOutcomeTier(state.feedbackHistory) : null),
    [state.gameComplete, state.feedbackHistory]
  )

  const actions = {
    toggleEvent: useCallback((eventId) => dispatch({ type: 'TOGGLE_EVENT', eventId }), []),
    addDrug: useCallback((drug) => dispatch({ type: 'ADD_DRUG', drug }), []),
    removeDrug: useCallback((drugId) => dispatch({ type: 'REMOVE_DRUG', drugId }), []),
    evaluateRegimen: useCallback(() => dispatch({ type: 'EVALUATE_REGIMEN' }), []),
    advanceStage: useCallback(() => dispatch({ type: 'ADVANCE_STAGE' }), []),
    setStage: useCallback((stage) => dispatch({ type: 'SET_STAGE', stage }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  }

  return { state, scenario, patient, drugs, stageConfig, availableDrugs, outcome, ...actions }
}
