import { useState } from 'react'
import { getOptionDisplay } from '../utils/regimenCard'
import { getDrugById } from '../utils/decisions'
import { useAgentProfile } from '../context/AgentProfileContext'

export default function DrugCard({ option, selected, disabled, onSelect, multiSelect }) {
  const { openProfile } = useAgentProfile()
  const [showDetails, setShowDetails] = useState(false)
  const display = getOptionDisplay(option)
  const drugIds = option?.drugs ?? []

  const handleSelect = () => {
    if (!disabled) onSelect(option.id)
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(option.id)
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className={`w-full text-left border rounded-lg p-4 sm:p-5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#4a9ead]/50 min-h-[4.5rem] ${
        disabled
          ? 'opacity-40 cursor-not-allowed border-[#2a3544] bg-[#151c26]'
          : selected
            ? 'border-[#4a9ead]/70 bg-[#4a9ead]/10 shadow-[0_0_12px_rgba(74,158,173,0.12)] cursor-pointer'
            : 'border-[#2a3544] bg-[#151c26] hover:border-[#4a9ead]/40 cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-2">
        {multiSelect && (
          <span
            className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center text-[10px] ${
              selected ? 'border-[#4a9ead] bg-[#4a9ead] text-[#0f1419]' : 'border-[#2a3544]'
            }`}
            aria-hidden
          >
            {selected ? '✓' : ''}
          </span>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <header>
            <h4 className="font-semibold text-base text-[#e8edf4] leading-snug">
              {display.actionLabel}
            </h4>
            {display.drugClass && (
              <p className="text-sm text-[#8b9cb3] mt-1.5 leading-snug">{display.drugClass}</p>
            )}
          </header>

          {!disabled && display.hasDrugDetails && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                setShowDetails((d) => !d)
              }}
              className="inline-block text-[10px] text-[#4a9ead]/60 hover:text-[#4a9ead] transition-colors cursor-pointer select-none"
            >
              {showDetails ? 'Hide drug details ↑' : 'Drug details ↓'}
            </span>
          )}

          {showDetails && display.hasDrugDetails && (
            <div className="pt-2 border-t border-[#2a3544]/60 space-y-3">
              {display.neutralDrugFacts.map((entry) => (
                <div key={entry.drugName}>
                  <p className="text-xs font-medium text-[#b8c5d6]">
                    {entry.drugName}
                    <span className="text-[#8b9cb3] font-normal">
                      {' '}
                      · {entry.class} · {entry.route}
                    </span>
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {entry.facts.map((fact) => (
                      <li key={fact} className="text-[10px] text-[#8b9cb3] leading-snug">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {drugIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {drugIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openProfile(id)
                      }}
                      className="text-[10px] text-[#4a9ead] hover:text-[#6bb8c7] transition-colors"
                    >
                      {getDrugById(id)?.display_name ?? id} agent profile →
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
