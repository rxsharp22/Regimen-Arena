import OutcomeTier from './OutcomeTier'
import DimensionBars from './DimensionBars'
import CriticalFlags from './CriticalFlags'
import FeedbackLog from './FeedbackLog'

export default function ScoreScreen({ state, onRestart }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <OutcomeTier tier={state.outcomeTier} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DimensionBars score={state.score} scoreMaxes={state.scoreMaxes} />
        <CriticalFlags flags={state.criticalFlags} />
      </div>

      <FeedbackLog entries={state.feedbackLog} />

      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onRestart}
          className="px-8 py-3 rounded-lg text-sm font-semibold border border-[#4a9ead]/50 text-[#4a9ead] bg-[#4a9ead]/15 hover:bg-[#4a9ead]/25 transition-colors"
        >
          Restart Scenario
        </button>
      </div>
    </div>
  )
}
