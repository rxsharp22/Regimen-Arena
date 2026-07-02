import AllergyCallout from './AllergyCallout'

export default function ClinicalUpdatePanel({ feedback }) {
  if (!feedback) return null

  const update = feedback.clinicalUpdate
  if (!update) return null

  return (
    <section className="mt-6 p-5 rounded-xl border border-[#2a3544] bg-[#151c26] space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-3">
          Clinical Update
        </p>
        <p className="text-sm font-medium text-[#e8edf4] mb-2">{update.headline}</p>
        <p className="text-sm leading-relaxed whitespace-pre-line text-[#b8c5d6]">
          {update.narrative}
        </p>
      </div>

      {update.snapshot?.complications?.length > 0 && (
        <div className="pt-3 border-t border-[#2a3544]/60">
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] font-semibold mb-2">
            Active concerns
          </p>
          <ul className="space-y-1">
            {update.snapshot.complications.map((c) => (
              <li key={c} className="text-sm text-[#c9a227]">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.showAllergyCallout && <AllergyCallout callout={feedback.allergyCallout} />}
    </section>
  )
}
