export default function DebriefPanel({ debrief }) {
  if (!debrief) return null

  const { patientOutcome, disposition, stewardshipPerformance, keySuccesses, missedOpportunities, turningPoints, courseExplanation, expertPathway } = debrief

  return (
    <div className="space-y-6">
      <section className="p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-2">
          Patient Outcome
        </p>
        <p className="text-sm text-[#e8edf4] font-medium mb-1">{patientOutcome.summary}</p>
        <p className="text-xs text-[#8b9cb3]">Disposition: {disposition}</p>
      </section>

      {debrief.postDischarge && (
        <section className="p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
          <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-2">
            Post-Discharge Course
          </p>
          <p className="text-sm text-[#b8c5d6] leading-relaxed">{debrief.postDischarge.narrative}</p>
          {debrief.postDischarge.linkedScenarioUnlocked && (
            <p className="text-xs text-[#4a9ead] mt-3 font-medium">
              Linked scenario unlocked: Line in the Bloodstream
            </p>
          )}
        </section>
      )}

      <section className="p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-3">
          Stewardship Performance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stewardshipPerformance.map(({ domain, score, max, label }) => (
            <div key={domain} className="rounded border border-[#2a3544] px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-[#8b9cb3]">{label}</p>
              <p className="text-sm font-semibold text-[#e8edf4] mt-1">
                {score}/{max}
              </p>
            </div>
          ))}
        </div>
      </section>

      {keySuccesses.length > 0 && (
        <section className="p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
          <p className="text-[10px] uppercase tracking-widest text-[#3d9a6e] font-semibold mb-2">
            Key Successful Decisions
          </p>
          <ul className="space-y-1">
            {keySuccesses.map((s) => (
              <li key={s} className="text-sm text-[#b8c5d6] flex gap-2">
                <span className="text-[#3d9a6e]">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {missedOpportunities.length > 0 && (
        <section className="p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold mb-2">
            Missed Opportunities
          </p>
          <ul className="space-y-1">
            {missedOpportunities.map((m) => (
              <li key={m} className="text-sm text-[#b8c5d6] flex gap-2">
                <span className="text-[#c9a227]">–</span>
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      {turningPoints.length > 0 && (
        <section className="p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
          <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-2">
            Major Turning Points
          </p>
          <ul className="space-y-2">
            {turningPoints.map((tp, i) => (
              <li key={i} className="text-sm text-[#b8c5d6]">
                <span className="text-[#8b9cb3] text-xs">T+{tp.time}h · </span>
                {tp.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-2">
          Why the Patient Improved or Worsened
        </p>
        <p className="text-sm text-[#b8c5d6] leading-relaxed">{courseExplanation}</p>
      </section>

      <section className="p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-2">
          Expert Pathway Summary
        </p>
        <ol className="list-decimal list-inside space-y-1">
          {expertPathway.map((step) => (
            <li key={step} className="text-sm text-[#b8c5d6] leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
