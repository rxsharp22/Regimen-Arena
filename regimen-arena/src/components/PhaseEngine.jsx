import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import PhaseHeader from './PhaseHeader'
import PatientStatusPanel from './PatientStatusPanel'
import NewInformationPanel from './NewInformationPanel'
import DecisionPoint from './DecisionPoint'
import ClinicalUpdatePanel from './ClinicalUpdatePanel'
import ContinueButton from './ContinueButton'
import CriticalErrorOverlay from './CriticalErrorOverlay'
import ClinicalResponsePanel from './ClinicalResponsePanel'
import NarrativeEventCard from './NarrativeEventCard'
import InfectionArenaPanel from './arena/InfectionArenaPanel'
import CaseBriefing from './onboarding/CaseBriefing'
import { getDecisionPoint } from '../utils/decisions'

const TRANSITION_CARDS = {
  0: {
    headline: 'The patient is admitted.',
    body: 'Broad-spectrum therapy is running.\nBlood cultures are incubating.\nThe next 48 hours will define what you are dealing with.',
  },
  1: {
    headline: 'Overnight data return.',
    body: 'MRI confirms osteomyelitis with abscess.\nBlood cultures are positive.\nSource control becomes urgent.',
  },
  2: {
    headline: 'Source control on the table.',
    body: 'Purulent drainage persists.\nSurgical consultation is available.\nAntibiotics alone cannot sterilize uncontrolled bone infection.',
  },
  3: {
    headline: 'Renal function under pressure.',
    body: 'Creatinine has risen on empiric therapy.\nDose adjustment decisions matter now.',
  },
  4: {
    headline: 'The lab calls.',
    body: 'Culture and sensitivity results are final.\nMSSA is identified.\nDefinitive therapy selection follows.',
  },
  5: {
    headline: 'Clinical response emerges.',
    body: 'Repeat cultures, wound status, and renal trend reflect prior decisions.\nConsequences appear through data, not grades.',
  },
  6: {
    headline: 'Planning the home stretch.',
    body: 'Source control and culture data inform duration and route.\nOPAT feasibility depends on monitoring and stability.',
  },
}

function consequenceHeadline(event) {
  if (event.type === 'treatment_failure') return 'Treatment concern on chart.'
  if (event.type === 'relapse_event') return 'Relapse.'
  if (event.type === 'toxicity_event') return 'Adverse event.'
  return 'Clinical update.'
}

export default function PhaseEngine({
  state,
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
    () =>
      currentPhaseData?.decision_point_id
        ? getDecisionPoint(currentPhaseData.decision_point_id)
        : null,
    [currentPhaseData]
  )

  const isInfoOnlyPhase = !currentPhaseData?.decision_point_id

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
        const label = subOption
          ? `${option.label} → ${subOption.label}`
          : decisionPoint.type === 'multi_select'
            ? 'Monitoring plan submitted'
            : option.label
        battleStateRef.current = { drugLabel: label, illustration: 'therapy_deployed' }
        setBattleState(battleStateRef.current)
        setIsProcessing(false)
      }, 1200)
    },
    [decisionPoint, onConfirmDecision, phaseIndex]
  )

  const handleBattleComplete = useCallback(() => {
    setShowFeedbackText(true)
    if (state.criticalFlags.length > 0) {
      const latestCritical = state.criticalFlags[state.criticalFlags.length - 1]
      if (
        latestCritical === 'critical_error_linezolid_bacteremia' ||
        latestCritical === 'critical_insufficient_duration' ||
        latestCritical === 'critical_no_monitoring_plan'
      ) {
        setShowCriticalOverlay(true)
      }
    }
  }, [state.criticalFlags])

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

  const handleInfoOnlyContinue = useCallback(() => {
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
        conditionalEvents={state.conditionalEvents}
        clinicalSnapshot={state.clinicalSnapshot}
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
        clinicalSnapshot={state.clinicalSnapshot}
      />

      {isInfoOnlyPhase ? (
        <div className="mt-8 flex justify-end">
          <ContinueButton onClick={handleInfoOnlyContinue} isFinal={isFinalPhase} />
        </div>
      ) : (
        <>
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
              drugLabel={battleState.drugLabel}
              illustration={
                state.lastFeedback?.clinicalUpdate?.illustration ?? battleState.illustration
              }
              onComplete={handleBattleComplete}
            />
          )}

          {showFeedbackText && <ClinicalUpdatePanel feedback={state.lastFeedback} />}

          {showFeedbackText && (
            <div className="mt-6 flex justify-end">
              <ContinueButton onClick={handleAdvance} isFinal={isFinalPhase} />
            </div>
          )}
        </>
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
