export default function NarrativeEventCard({ type, dayLabel, headline, body, onContinue }) {
  const borderClass =
    type === 'consequence' ? 'border-[#c45c5c]/60' : 'border-[#4a9ead]/40'
  const accentClass = type === 'consequence' ? 'text-[#c45c5c]' : 'text-[#4a9ead]'

  return (
    <div className="max-w-xl mx-auto trail-card-in">
      <div className={`bg-[#1a222d] border rounded-xl p-8 ${borderClass}`}>
        <p className={`text-[10px] uppercase tracking-widest font-semibold ${accentClass}`}>
          {dayLabel}
        </p>
        <hr className="border-[#2a3544] my-4" />
        <h2 className="text-2xl font-bold text-[#e8edf4] mb-4">{headline}</h2>
        <p className="text-sm font-mono text-[#b8c5d6] leading-relaxed whitespace-pre-line">
          {body}
        </p>
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="text-sm font-medium text-[#4a9ead] hover:text-[#4a9ead]/80 transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
