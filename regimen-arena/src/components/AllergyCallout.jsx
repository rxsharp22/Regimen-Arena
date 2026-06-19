export default function AllergyCallout({ callout }) {
  if (!callout) return null

  return (
    <div className="mt-4 p-4 rounded-lg border border-[#c9a227]/50 bg-[#c9a227]/10">
      <h4 className="text-sm font-semibold text-[#c9a227] mb-2">{callout.title}</h4>
      <p className="text-sm text-[#b8c5d6] leading-relaxed">{callout.content}</p>
    </div>
  )
}
