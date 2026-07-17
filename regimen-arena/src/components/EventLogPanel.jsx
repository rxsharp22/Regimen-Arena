import { useState } from 'react'

export default function EventLogPanel({ eventLog }) {
  const [open, setOpen] = useState(false)
  if (!eventLog?.length) return null

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left text-xs uppercase tracking-widest text-[#4a9ead] font-semibold hover:text-[#6bb8c4] transition-colors"
        aria-expanded={open}
      >
        {open ? 'Hide simulation event log ↑' : 'Show simulation event log ↓'}
      </button>
      {open &&
        eventLog.map((entry) => (
          <div key={entry.id} className="border border-[#2a3544] rounded-lg p-4 bg-[#151c26]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs text-[#8b9cb3]">
                T+{entry.scenarioTimeHours}h · {entry.phaseLabel}
              </span>
            </div>
            <p className="text-sm font-medium text-[#e8edf4]">{entry.decisionLabel}</p>
            {entry.laterConsequences?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#2a3544]/50">
                <p className="text-[10px] uppercase text-[#c9a227] mb-1">Later consequences</p>
                {entry.laterConsequences.map((c, i) => (
                  <p key={i} className="text-xs text-[#b8c5d6]">
                    {c}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
