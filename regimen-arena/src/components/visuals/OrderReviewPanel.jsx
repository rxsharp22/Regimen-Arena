import ConfirmButton from '../ConfirmButton'

export default function OrderReviewPanel({
  orderLabel,
  drugLabels = [],
  onConfirmAdvance,
  onChangeOrder,
}) {
  return (
    <section className="mt-6 rounded-xl border border-[#2a3544] bg-[#151c26] p-5 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-1">
          Order Review
        </p>
        <p className="text-xs text-[#8b9cb3] mb-3">
          Confirm this order to advance the case clock, or go back to change your selection.
        </p>
        <p className="text-sm font-medium text-[#e8edf4]">{orderLabel}</p>
        {drugLabels.length > 0 && (
          <ul className="mt-2 space-y-1">
            {drugLabels.map((label) => (
              <li key={label} className="text-xs text-[#b8c5d6] flex gap-2">
                <span className="text-[#4a9ead]" aria-hidden>
                  •
                </span>
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <ConfirmButton label="Confirm / Advance Case Clock" onClick={onConfirmAdvance} />
        <button
          type="button"
          onClick={onChangeOrder}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-[#344559] text-[#b8c5d6] bg-[#1a222d] hover:bg-[#243040] transition-colors"
        >
          Change Order / Go Back
        </button>
      </div>
    </section>
  )
}
