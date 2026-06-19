import { getOutcomeStyle } from '../utils/outcomeStyles'

export default function FeedbackLog({ entries }) {
  if (!entries?.length) return null

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
        Decision Log
      </h3>
      {entries.map((entry, i) => (
        <div key={i} className="border border-[#2a3544] rounded-lg p-4 bg-[#151c26]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs text-[#8b9cb3]">{entry.phaseLabel ?? `Phase ${entry.phase + 1}`}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold ${getOutcomeStyle(entry.outcome)}`}>
              {entry.outcome}
            </span>
          </div>
          <p className="text-sm font-medium text-[#e8edf4]">{entry.optionLabel}</p>
          <p className="text-xs text-[#8b9cb3] mt-2 leading-relaxed whitespace-pre-line">
            {entry.feedback}
          </p>
        </div>
      ))}
    </div>
  )
}
