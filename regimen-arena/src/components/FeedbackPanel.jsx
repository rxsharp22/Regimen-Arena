import AllergyCallout from './AllergyCallout'

export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null

  return (
    <section className="mt-6 p-5 rounded-xl border border-[#2a3544] bg-[#151c26]">
      <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-3">
        Clinical Update
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-line text-[#b8c5d6]">{feedback.feedback}</p>
      {feedback.showAllergyCallout && <AllergyCallout callout={feedback.allergyCallout} />}
    </section>
  )
}
