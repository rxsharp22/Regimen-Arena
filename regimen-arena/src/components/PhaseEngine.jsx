import { useMemo } from 'react'
import PhaseHeader from './PhaseHeader'
import NewInformationPanel from './NewInformationPanel'
import DecisionPoint from './DecisionPoint'
import FeedbackPanel from './FeedbackPanel'
import ContinueButton from './ContinueButton'
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
  const decisionPoint = useMemo(
    () => getDecisionPoint(currentPhaseData?.decision_point_id),
    [currentPhaseData]
  )

  const handleConfirm = (option, subOption) => {
    onConfirmDecision(decisionPoint, option, phaseIndex, subOption)
  }

  const isFinalPhase = phaseIndex === totalPhases - 1

  return (
    <div className="max-w-4xl mx-auto">
      <PhaseHeader
        phase={currentPhaseData}
        currentIndex={phaseIndex}
        totalPhases={totalPhases}
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
        disabled={state.showFeedback}
      />

      <FeedbackPanel feedback={state.showFeedback ? state.lastFeedback : null} />

      {state.showFeedback && (
        <div className="mt-6 flex justify-end">
          <ContinueButton onClick={onAdvance} isFinal={isFinalPhase} />
        </div>
      )}
    </div>
  )
}
