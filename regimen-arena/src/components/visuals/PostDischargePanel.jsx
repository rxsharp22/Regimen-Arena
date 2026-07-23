import AdvisorPanel from './AdvisorPanel'
import PatientStatusVisual from './PatientStatusVisual'
import { getSpriteUrlOrFallback } from '../../data/spriteRegistry'

function NarrativeBeats({ text }) {
  if (!text) return null
  const beats = text.split(/\n\n+/).filter(Boolean)
  if (beats.length <= 1) {
    return <p className="text-sm sm:text-base text-[#b8c5d6] leading-relaxed">{text}</p>
  }
  return (
    <ul className="space-y-3">
      {beats.map((beat) => (
        <li key={beat} className="text-sm sm:text-base text-[#b8c5d6] leading-relaxed flex gap-2">
          <span className="text-[#4a9ead] shrink-0">•</span>
          <span>{beat}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PostDischargePanel({ simulation }) {
  if (!simulation?.postDischargeNarrative) return null

  const variant =
    simulation.postDischargeOutcomeId === 'resolved_completed'
      ? 'improved'
      : ['readmission_infection', 'followup_failure', 'line_complication', 'severe_deterioration'].includes(
            simulation.postDischargeOutcomeId
          )
        ? 'declining'
        : 'generic'

  return (
    <div className="space-y-4 mt-6">
      <AdvisorPanel
        spriteKey="scribe5"
        title="Post-Discharge Course"
        subtitle="The case clock advances beyond discharge"
        tone={variant === 'declining' ? 'declining' : variant === 'improved' ? 'improving' : 'neutral'}
      >
        <NarrativeBeats text={simulation.postDischargeNarrative} />
      </AdvisorPanel>

      <div className="flex items-center gap-4 p-4 rounded-xl border border-[#2a3544] bg-[#151c26]">
        <PatientStatusVisual variant={variant} label="Patient status" />
      </div>

      {simulation.linkedScenarioUnlocked && (
        <div className="p-4 rounded-xl border border-[#4a9ead]/40 bg-[#4a9ead]/10 flex gap-3 items-center">
          {getSpriteUrlOrFallback('labTech') && (
            <img
              src={getSpriteUrlOrFallback('labTech')}
              alt=""
              className="w-12 h-12 object-contain rounded"
            />
          )}
          <p className="text-sm text-[#b8c5d6]">
            <span className="text-[#4a9ead] font-semibold">Linked scenario unlocked: </span>
            Line in the Bloodstream
          </p>
        </div>
      )}
    </div>
  )
}
