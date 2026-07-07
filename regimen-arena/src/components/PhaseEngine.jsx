import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import PhaseHeader from './PhaseHeader'
import PatientStatusPanel from './PatientStatusPanel'
import NewInformationPanel from './NewInformationPanel'
import DecisionPoint from './DecisionPoint'
import ClinicalUpdatePanel from './ClinicalUpdatePanel'
import ContinueButton from './ContinueButton'
import CriticalErrorOverlay from './CriticalErrorOverlay'
import NarrativeEventCard from './NarrativeEventCard'
import InfectionArenaPanel from './arena/InfectionArenaPanel'
import CaseBriefing from './onboarding/CaseBriefing'
import AdvisorPanel from './visuals/AdvisorPanel'
import CaseAdvanceLoadingScreen from './visuals/CaseAdvanceLoadingScreen'
import OrderReviewPanel from './visuals/OrderReviewPanel'
import PostDischargePanel from './visuals/PostDischargePanel'
import { getDecisionPoint, getDrugById } from '../utils/decisions'
import { getAdvisorForPhase, getAdvisorForConditionalEvent } from '../simulation/boneDeep/advisorContext'

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
    headline: 'Preliminary microbiology.',
    body: 'Gram stain suggests gram-positive cocci in clusters.\nIdentification and susceptibilities remain pending.\nEmpiric coverage decisions still matter.',
  },
  3: {
    headline: 'Source control on the table.',
    body: 'Purulent drainage persists.\nSurgical consultation is available.\nAntibiotics alone cannot sterilize uncontrolled bone infection.',
  },
  4: {
    headline: 'Renal function under pressure.',
    body: 'Creatinine has risen on empiric therapy.\nDose adjustment decisions matter now.',
  },
  5: {
    headline: 'The lab calls.',
    body: 'Culture and sensitivity results are final.\nOrganism identification is available.\nDefinitive therapy selection follows.',
  },
  6: {
    headline: 'Clinical response emerges.',
    body: 'Repeat cultures, wound status, and renal trend reflect prior decisions.\nConsequences appear through data, not grades.',
  },
  7: {
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
  const [showCaseClock, setShowCaseClock] = useState(false)
  const [showCriticalOverlay, setShowCriticalOverlay] = useState(false)
  const [showFeedbackText, setShowFeedbackText] = useState(false)
  const [trailCard, setTrailCard] = useState(null)
  const [orderReview, setOrderReview] = useState(null)
  const [decisionResetKey, setDecisionResetKey] = useState(0)
  const pendingConfirmRef = useRef(null)

  const needsDaptoResponse =
    state.simulation?.daptoToxicityPending && !state.decisions?.dp_dapto_toxicity_response

  const decisionPoint = useMemo(() => {
    if (needsDaptoResponse) return getDecisionPoint('dp_dapto_toxicity_response')
    if (currentPhaseData?.decision_point_id) {
      return getDecisionPoint(currentPhaseData.decision_point_id)
    }
    return null
  }, [currentPhaseData, needsDaptoResponse])

  const isPostDischargePhase = currentPhaseData?.post_discharge === true
  const isInfoOnlyPhase = !decisionPoint && !needsDaptoResponse

  const phaseAdvisor = useMemo(
    () =>
      getAdvisorForPhase(currentPhaseData?.id, {
        simulation: state.simulation,
        conditionalEvents: state.conditionalEvents,
      }),
    [currentPhaseData?.id, state.simulation, state.conditionalEvents]
  )

  useEffect(() => {
    setShowFeedbackText(false)
    setTrailCard(null)
    setShowCriticalOverlay(false)
    setShowCaseClock(false)
    setOrderReview(null)
    pendingConfirmRef.current = null
  }, [state.currentPhase])

  const buildOrderLabel = useCallback(
    (option, subOption) => {
      if (!decisionPoint) return 'Order submitted'
      if (decisionPoint.type === 'multi_select') return 'Monitoring plan submitted'
      if (subOption) return `${option.label} → ${subOption.label}`
      return option.label ?? 'Order submitted'
    },
    [decisionPoint]
  )

  const buildDrugLabels = useCallback((option, subOption) => {
    const ids = [...(option?.drugs ?? [])]
    if (subOption?.drugs?.length) ids.push(...subOption.drugs)
    return ids.map((id) => getDrugById(id)?.display_name ?? id)
  }, [])

  const handlePlaceOrder = useCallback(
    (option, subOption) => {
      setShowFeedbackText(false)
      setOrderReview({ option, subOption })
    },
    []
  )

  const handleChangeOrder = useCallback(() => {
    setOrderReview(null)
    pendingConfirmRef.current = null
    setDecisionResetKey((k) => k + 1)
  }, [])

  const handleConfirmAdvance = useCallback(() => {
    if (!orderReview) return
    pendingConfirmRef.current = orderReview
    setShowCaseClock(true)
  }, [orderReview])

  const handleCaseClockComplete = useCallback(() => {
    setShowCaseClock(false)
    const pending = pendingConfirmRef.current
    if (!pending || !decisionPoint) return

    onConfirmDecision(decisionPoint, pending.option, phaseIndex, pending.subOption)
    setOrderReview(null)
    pendingConfirmRef.current = null
    setShowFeedbackText(true)
  }, [decisionPoint, onConfirmDecision, phaseIndex])

  useEffect(() => {
    if (!showFeedbackText || state.criticalFlags.length === 0) return
    const latestCritical = state.criticalFlags[state.criticalFlags.length - 1]
    if (
      latestCritical === 'critical_error_linezolid_bacteremia' ||
      latestCritical === 'critical_insufficient_duration' ||
      latestCritical === 'critical_no_monitoring_plan'
    ) {
      setShowCriticalOverlay(true)
    }
  }, [showFeedbackText, state.criticalFlags])

  const isFinalPhase = phaseIndex === totalPhases - 1

  const handleAdvance = useCallback(() => {
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
    const eventAdvisor = state.conditionalEvents[0]
      ? getAdvisorForConditionalEvent(state.conditionalEvents[0])
      : null
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {eventAdvisor && (
          <AdvisorPanel
            spriteKey={eventAdvisor.spriteKey}
            title={eventAdvisor.title}
            subtitle={eventAdvisor.subtitle}
            tone={eventAdvisor.tone}
          >
            {eventAdvisor.body}
          </AdvisorPanel>
        )}
        <NarrativeEventCard {...trailCard} onContinue={handleTrailContinue} />
      </div>
    )
  }

  if (showCaseClock) {
    return (
      <div className="max-w-4xl mx-auto">
        <CaseAdvanceLoadingScreen onComplete={handleCaseClockComplete} />
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

      {phaseAdvisor && !isPostDischargePhase && (
        <AdvisorPanel
          spriteKey={phaseAdvisor.spriteKey}
          title={phaseAdvisor.title}
          subtitle={phaseAdvisor.subtitle}
          tone={phaseAdvisor.tone}
          className="mb-4"
        >
          {phaseAdvisor.body}
        </AdvisorPanel>
      )}

      <PatientStatusPanel
        conditionalEvents={state.conditionalEvents}
        clinicalSnapshot={state.clinicalSnapshot}
        simulation={state.simulation}
      />

      {!isPostDischargePhase && (
        <NewInformationPanel
          phase={currentPhaseData}
          conditionalEvents={state.conditionalEvents}
        />
      )}

      {isPostDischargePhase && <PostDischargePanel simulation={state.simulation} />}

      {!state.showFeedback && !orderReview && !showCaseClock && !isPostDischargePhase && (
        <CaseBriefing phaseId={currentPhaseData.id} />
      )}

      {!isPostDischargePhase && (
        <InfectionArenaPanel
          phase={currentPhaseData}
          activeDrugs={state.activeDrugs}
          conditionalEvents={state.conditionalEvents}
          clinicalSnapshot={state.clinicalSnapshot}
        />
      )}

      {isInfoOnlyPhase || isPostDischargePhase ? (
        <div className="mt-8 flex justify-end">
          <ContinueButton onClick={handleInfoOnlyContinue} isFinal={isFinalPhase} />
        </div>
      ) : (
        <>
          {!orderReview && !showCaseClock && (
            <DecisionPoint
              key={`${currentPhaseData.id}-${decisionPoint?.id}-${decisionResetKey}`}
              decisionPoint={decisionPoint}
              activeDrugs={state.activeDrugs}
              simulation={state.simulation}
              onConfirm={handlePlaceOrder}
              disabled={state.showFeedback || showFeedbackText}
            />
          )}

          {orderReview && !showCaseClock && (
            <OrderReviewPanel
              orderLabel={buildOrderLabel(orderReview.option, orderReview.subOption)}
              drugLabels={buildDrugLabels(orderReview.option, orderReview.subOption)}
              onConfirmAdvance={handleConfirmAdvance}
              onChangeOrder={handleChangeOrder}
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
