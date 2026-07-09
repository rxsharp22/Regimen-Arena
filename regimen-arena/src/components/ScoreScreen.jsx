import DebriefOutcomeSummary from './DebriefOutcomeSummary'
import DimensionBars from './DimensionBars'
import CriticalFlags from './CriticalFlags'
import DebriefPanel from './DebriefPanel'
import EventLogPanel from './EventLogPanel'
import AdvisorPanel from './visuals/AdvisorPanel'

export default function ScoreScreen({ state, onRestart }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <AdvisorPanel
        spriteKey="stewardshipScribe1"
        title="Stewardship Debrief"
        subtitle="Bone Deep — case summary"
        tone="debrief"
      >
        Explicit teaching and performance grading appear here — not during active gameplay.
      </AdvisorPanel>

      <DebriefOutcomeSummary assessment={state.debrief?.assessment} />

      {state.debrief && <DebriefPanel debrief={state.debrief} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DimensionBars score={state.score} scoreMaxes={state.scoreMaxes} />
        <CriticalFlags flags={state.criticalFlags} />
      </div>

      {state.debrief?.eventLog && <EventLogPanel eventLog={state.debrief.eventLog} />}

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
