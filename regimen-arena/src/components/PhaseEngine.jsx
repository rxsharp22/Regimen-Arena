import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import PhaseHeader from './PhaseHeader'
import PatientStatusPanel from './PatientStatusPanel'
import NewInformationPanel from './NewInformationPanel'
import DecisionPoint from './DecisionPoint'
import FeedbackPanel from './FeedbackPanel'
import ContinueButton from './ContinueButton'
import CriticalErrorOverlay from './CriticalErrorOverlay'
import ClinicalResponsePanel from './ClinicalResponsePanel'
import NarrativeEventCard from './NarrativeEventCard'
import InfectionArenaPanel from './arena/InfectionArenaPanel'
import CaseBriefing from './onboarding/CaseBriefing'
import { getDecisionPoint, scoreMonitoringPlan } from '../utils/decisions'

const TRANSITION_CARDS = {
  0: {
    headline: 'The patient is admitted.',
    body: 'Broad-spectrum therapy is running.\nBlood cultures are incubating.\nThe next 48 hours will define what you are dealing with.',
  },
  1: {
    headline: 'Day 2. Renal function worsens.',
    body: 'Overnight labs return.\nCreatinine is up.\nYour choices from admission are now under pressure.',
  },
  2: {
    headline: 'Day 3. The lab calls.',
    body: 'Culture and sensitivity results are final.\nThe organism is identified.\nThe right drug exists.\nThe question is whether you will choose it.',
  },
  3: {
    headline: 'Source controlled. Bacteremia cleared.',
    body: 'Repeat cultures: no growth.\nDebridement complete.\nPlan the duration and route of what remains.',
  },
}

function consequenceHeadline(event) {
  if (event.type === 'treatment_failure') return 'Treatment Failure.'
  if (event.type === 'relapse_event') return 'Relapse.'
  return 'Adverse Event.'
}

function getBattleMeta(option, subOption, decisionPoint, activeDrugs) {
  if (decisionPoint?.type === 'multi_select') {
    const result = scoreMonitoringPlan(option.selectedIds, activeDrugs, decisionPoint, {})
    const labels = decisionPoint.options
      .filter((o) => option.selectedIds.includes(o.id))
      .map((o) => o.label)
    return {
      outcome: result.outcome,
      drugLabel: labels.join('; ') || 'Monitoring plan',
    }
  }
  return {
    outcome: subOption?.outcome ?? option.outcome,
    drugLabel: subOption ? `${option.label} → ${subOption.label}` : option.label,
  }
}

export default function PhaseEngine({
  state,
  phases,
  currentPhaseData,
  totalPhases,
  onConfirmDecision,
  onAdvance,
}) {
  const phaseIndex = state.currentPhase
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCriticalOverlay, setShowCriticalOverlay] = useState(false)
  const [battleState, setBattleState] = useState(null)
  const [showFeedbackText, setShowFeedbackText] = useState(false)
  const [trailCard, setTrailCard] = useState(null)
  const battleStateRef = useRef(null)

  const decisionPoint = useMemo(
    () => getDecisionPoint(currentPhaseData?.decision_point_id),
    [currentPhaseData]
  )

  useEffect(() => {
    setBattleState(null)
    setShowFeedbackText(false)
    setTrailCard(null)
    setShowCriticalOverlay(false)
  }, [state.currentPhase])

  const handleConfirm = useCallback(
    (option, subOption) => {
      setIsProcessing(true)
      setShowFeedbackText(false)
      setTimeout(() => {
        onConfirmDecision(decisionPoint, option, phaseIndex, subOption)
        const meta = getBattleMeta(option, subOption, decisionPoint, state.activeDrugs)
        battleStateRef.current = meta
        setBattleState(meta)
        setIsProcessing(false)
      }, 1200)
    },
    [decisionPoint, onConfirmDecision, phaseIndex, state.activeDrugs]
  )

  const handleBattleComplete = useCallback(() => {
    setShowFeedbackText(true)
    if (battleStateRef.current?.outcome === 'unsafe') {
      setShowCriticalOverlay(true)
    }
  }, [])

  const isFinalPhase = phaseIndex === totalPhases - 1

  const handleAdvance = useCallback(() => {
    setBattleState(null)
    setShowFeedbackText(false)

    if (isFinalPhase) {
      onAdvance()
      return
    }

    if (state.conditionalEvents.length > 0) {
      const event = state.conditionalEvents[0]
      setTrailCard({
        type: 'consequence',
        dayLabel: currentPhaseData.label,
        headline: consequenceHeadline(event),
        body: event.content,
      })
      return
    }

    const card = TRANSITION_CARDS[phaseIndex]
    if (card) {
      setTrailCard({
        type: 'transition',
        dayLabel: currentPhaseData.label,
        headline: card.headline,
        body: card.body,
      })
      return
    }

    onAdvance()
  }, [isFinalPhase, onAdvance, state.conditionalEvents, phaseIndex, currentPhaseData.label])

  const handleTrailContinue = useCallback(() => {
    setTrailCard(null)
    onAdvance()
  }, [onAdvance])

  if (trailCard) {
    return (
      <div className="max-w-4xl mx-auto">
        <NarrativeEventCard {...trailCard} onContinue={handleTrailContinue} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PhaseHeader
        phase={currentPhaseData}
        currentIndex={phaseIndex}
        totalPhases={totalPhases}
        score={state.score}
        scoreMaxes={state.scoreMaxes}
      />

      <PatientStatusPanel
        phaseId={currentPhaseData.id}
        conditionalEvents={state.conditionalEvents}
        score={state.score}
        scoreMaxes={state.scoreMaxes}
      />

      <NewInformationPanel
        phase={currentPhaseData}
        conditionalEvents={state.conditionalEvents}
      />

      {!state.showFeedback && !battleState && !isProcessing && (
        <CaseBriefing phaseId={currentPhaseData.id} />
      )}

      <InfectionArenaPanel
        phase={currentPhaseData}
        activeDrugs={state.activeDrugs}
        conditionalEvents={state.conditionalEvents}
      />

      <DecisionPoint
        key={currentPhaseData.id}
        decisionPoint={decisionPoint}
        activeDrugs={state.activeDrugs}
        onConfirm={handleConfirm}
        disabled={state.showFeedback || isProcessing || !!battleState}
        isProcessing={isProcessing}
      />

      {battleState && (
        <ClinicalResponsePanel
          outcome={battleState.outcome}
          drugLabel={battleState.drugLabel}
          onComplete={handleBattleComplete}
        />
      )}

      {showFeedbackText && (
        <FeedbackPanel feedback={state.lastFeedback} />
      )}

      {showFeedbackText && (
        <div className="mt-6 flex justify-end">
          <ContinueButton onClick={handleAdvance} isFinal={isFinalPhase} />
        </div>
      )}

      {showCriticalOverlay && (
        <CriticalErrorOverlay
          feedback={state.lastFeedback}
          onDismiss={() => setShowCriticalOverlay(false)}
        />
      )}
    </div>
  )
}
