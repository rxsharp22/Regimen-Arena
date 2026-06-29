import AllergyCallout from './AllergyCallout'
import { getRegimenTeachingNotes } from '../utils/regimenCard'
import { OUTCOME_TIER_LABELS } from '../utils/scoring'

const OUTCOME_COLORS = {
  optimal: 'text-[#3d9a6e]',
  reasonable: 'text-[#4a9ead]',
  acceptable: 'text-[#c9a227]',
  suboptimal: 'text-[#c9a227]',
  excessive_spectrum: 'text-[#c45c5c]',
  unsafe: 'text-[#c45c5c]',
}

export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null

  const optionId = feedback.option?.id ?? feedback.subOption?.id
  const teachingNotes = optionId ? getRegimenTeachingNotes(optionId) : null
  const outcomeLabel = feedback.outcome ? OUTCOME_TIER_LABELS[feedback.outcome] : null
  const outcomeColor = OUTCOME_COLORS[feedback.outcome] ?? 'text-[#b8c5d6]'

  return (
    <section className="mt-6 p-5 rounded-xl border border-[#2a3544] bg-[#151c26] space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-3">
          Clinical Update
        </p>
        {outcomeLabel && (
          <p className={`text-sm font-semibold mb-2 ${outcomeColor}`}>
            Assessment: {outcomeLabel}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-line text-[#b8c5d6]">
          {feedback.feedback}
        </p>
      </div>

      {teachingNotes && (
        <div className="pt-3 border-t border-[#2a3544]/60">
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] font-semibold mb-2">
            Clinical interpretation
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-line text-[#b8c5d6]">
            {teachingNotes}
          </p>
        </div>
      )}

      {feedback.showAllergyCallout && <AllergyCallout callout={feedback.allergyCallout} />}
    </section>
  )
}
