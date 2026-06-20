export default function CriticalErrorOverlay({ feedback, onDismiss }) {
  if (!feedback || feedback.outcome !== 'unsafe') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1419]/90">
      <div className="bg-[#1a222d] border-2 border-[#c45c5c] rounded-2xl p-8 max-w-lg mx-4 shadow-[0_0_40px_rgba(196,92,92,0.3)]">
        <p className="text-[#c45c5c] text-xs uppercase tracking-widest font-bold">
          ⚠ Critical Clinical Event
        </p>
        <p className="text-base font-semibold text-[#e8edf4] mt-4 mb-2">{feedback.optionLabel}</p>
        <p className="text-sm text-[#b8c5d6] leading-relaxed whitespace-pre-line">
          {feedback.feedback}
        </p>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onDismiss}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-[#c45c5c]/50 text-[#c45c5c] bg-[#c45c5c]/15 hover:bg-[#c45c5c]/25 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}
