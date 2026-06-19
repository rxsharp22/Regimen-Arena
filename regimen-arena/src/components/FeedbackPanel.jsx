import { getOutcomeStyle } from '../utils/outcomeStyles'
import AllergyCallout from './AllergyCallout'

export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null

  return (
    <section
      className={`mt-6 p-5 rounded-xl border ${getOutcomeStyle(feedback.outcome)}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-widest font-bold">Feedback</span>
        <span className="text-xs px-2 py-0.5 rounded border border-current uppercase font-semibold">
          {feedback.outcome}
        </span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-line">{feedback.feedback}</p>
      {feedback.showAllergyCallout && <AllergyCallout callout={feedback.allergyCallout} />}
    </section>
  )
}
