import { useMemo, useState, useEffect, useCallback } from 'react'
import PhaseHeader from './PhaseHeader'
import PatientStatusPanel from './PatientStatusPanel'
import NewInformationPanel from './NewInformationPanel'
import DecisionPoint from './DecisionPoint'
import FeedbackPanel from './FeedbackPanel'
import ContinueButton from './ContinueButton'
import CriticalErrorOverlay from './CriticalErrorOverlay'
import { getDecisionPoint, getDrugById } from '../utils/decisions'

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

  const decisionPoint = useMemo(
    () => getDecisionPoint(currentPhaseData?.decision_point_id),
    [currentPhaseData]
  )

  useEffect(() => {
    if (state.showFeedback && state.lastFeedback?.outcome === 'unsafe') {
      setShowCriticalOverlay(true)
    }
  }, [state.showFeedback, state.lastFeedback])

  useEffect(() => {
    if (!state.showFeedback) {
      setShowCriticalOverlay(false)
    }
  }, [state.showFeedback])

  const handleConfirm = useCallback(
    (option, subOption) => {
      setIsProcessing(true)
      setTimeout(() => {
        onConfirmDecision(decisionPoint, option, phaseIndex, subOption)
        setIsProcessing(false)
      }, 1200)
    },
    [decisionPoint, onConfirmDecision, phaseIndex]
  )

  const isFinalPhase = phaseIndex === totalPhases - 1

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
      />

      <NewInformationPanel
        phase={currentPhaseData}
        conditionalEvents={state.conditionalEvents}
      />

      {state.activeDrugs.length > 0 && (
        <div className="mt-6 px-4 py-3 rounded-lg border border-[#2a3544] bg-[#151c26]">
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-1">
            Active Regimen
          </p>
          <p className="text-sm text-[#e8edf4]">
            {state.activeDrugs
              .map((id) => getDrugById(id)?.display_name ?? id.replace(/_/g, ' '))
              .join(' + ')}
          </p>
        </div>
      )}

      <DecisionPoint
        key={currentPhaseData.id}
        decisionPoint={decisionPoint}
        activeDrugs={state.activeDrugs}
        onConfirm={handleConfirm}
        disabled={state.showFeedback || isProcessing}
        isProcessing={isProcessing}
      />

      <FeedbackPanel feedback={state.showFeedback ? state.lastFeedback : null} />

      {state.showFeedback && (
        <div className="mt-6 flex justify-end">
          <ContinueButton onClick={onAdvance} isFinal={isFinalPhase} />
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
