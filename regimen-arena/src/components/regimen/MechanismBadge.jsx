export default function MechanismBadge({ drugName, mechanism }) {
  if (!mechanism) return null
  return (
    <div className="min-w-0">
      {drugName && (
        <p className="text-[9px] uppercase tracking-wider text-[#8b9cb3] truncate">{drugName}</p>
      )}
      <p className="text-[10px] text-[#4a9ead] leading-snug mt-0.5">{mechanism}</p>
    </div>
  )
}
