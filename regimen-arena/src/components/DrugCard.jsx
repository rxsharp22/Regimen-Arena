import { useState } from 'react'
import { getDrugById, getSpectrumTagsForOption, optionRequiresRenalAdjustment } from '../utils/decisions'
import { getRegimenCardMeta } from '../utils/regimenCard'
import { isArenaMode } from '../data/displayMode'
import { MechanismEmblemRow } from './arena/MechanismEmblem'
import CoverageChip from './regimen/CoverageChip'
import MonitoringFlag from './regimen/MonitoringFlag'

function DrugReferenceLine({ drugId }) {
  const drug = getDrugById(drugId)
  if (!drug) return null
  return (
    <div className="flex justify-between gap-2 text-xs text-[#8b9cb3] mt-1">
      <span className="text-[#b8c5d6]">{drug.display_name}</span>
      <span className="text-right shrink-0">
        {drug.class} · {drug.route}
      </span>
    </div>
  )
}

export default function DrugCard({ option, selected, disabled, onSelect, multiSelect }) {
  const [showDetails, setShowDetails] = useState(false)
  const meta = getRegimenCardMeta(option)
  const spectrumTags = getSpectrumTagsForOption(option)
  const renalRequired = optionRequiresRenalAdjustment(option)
  const hasDrugs = Boolean(option.drugs?.length)
  const richLayout = hasDrugs && meta.richLayout !== false
  const detailsOpen = showDetails || meta.showDetailsByDefault

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
      className={`w-full text-left border rounded-lg p-4 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#4a9ead]/50 ${
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

        <div className="flex-1 min-w-0 space-y-3">
          <header>
            <h4 className="font-semibold text-sm text-[#e8edf4] leading-snug">{option.label}</h4>
            {meta.subtitle && (
              <p className="text-[11px] text-[#8b9cb3] mt-1 leading-snug">{meta.subtitle}</p>
            )}
          </header>

          {richLayout && <MechanismEmblemRow drugIds={option.drugs} />}

          {detailsOpen && meta.coverage?.length > 0 && (
            <div className="flex flex-wrap gap-1" aria-label="Spectrum coverage">
              {meta.coverage.map((chip) => (
                <CoverageChip key={chip} label={chip} />
              ))}
            </div>
          )}

          {detailsOpen && meta.monitoringFlags?.length > 0 && (
            <div className="flex flex-wrap gap-1" aria-label="Monitoring and tradeoffs">
              {meta.monitoringFlags.map((flag) => (
                <MonitoringFlag key={flag} label={flag} />
              ))}
            </div>
          )}

          {!disabled && hasDrugs && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                setShowDetails((d) => !d)
              }}
              className="inline-block mt-1 text-[10px] text-[#4a9ead]/60 hover:text-[#4a9ead] transition-colors cursor-pointer select-none"
            >
              {detailsOpen ? 'Hide drug details ↑' : 'Drug details ↓'}
            </span>
          )}

          {detailsOpen && !disabled && hasDrugs && (
            <div className="pt-2 border-t border-[#2a3544]/60 space-y-1">
              {option.drugs.map((id) => (
                <DrugReferenceLine key={id} drugId={id} />
              ))}
              {spectrumTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {spectrumTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {renalRequired && (
                <p className="text-[10px] text-[#8b9cb3] mt-2">
                  Renal dose adjustment may apply — verify CrCl
                </p>
              )}
            </div>
          )}

          {!richLayout && !hasDrugs && isArenaMode() && (
            <p className="text-[10px] text-[#8b9cb3]">Clinical action option</p>
          )}

          {!richLayout && !hasDrugs && !isArenaMode() && option.flags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {option.flags.slice(0, 3).map((flag) => (
                <MonitoringFlag key={flag} label={flag.replace(/_/g, ' ')} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
