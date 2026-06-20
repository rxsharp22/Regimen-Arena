import { useState } from 'react'
import { getDrugById, getSpectrumTagsForOption, optionRequiresRenalAdjustment } from '../utils/decisions'

function DrugLine({ drugId }) {
  const drug = getDrugById(drugId)
  if (!drug) return null
  return (
    <div className="flex justify-between text-xs text-[#8b9cb3] mt-1">
      <span className="text-[#b8c5d6]">{drug.display_name}</span>
      <span>
        {drug.class} · {drug.route}
      </span>
    </div>
  )
}

export default function DrugCard({ option, selected, disabled, onSelect, multiSelect }) {
  const [showRef, setShowRef] = useState(false)
  const spectrumTags = getSpectrumTagsForOption(option)
  const renalRequired = optionRequiresRenalAdjustment(option)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option.id)}
      className={`w-full text-left border rounded-lg p-4 transition-all ${
        disabled
          ? 'opacity-40 cursor-not-allowed border-[#2a3544] bg-[#151c26]'
          : selected
            ? 'border-[#4a9ead]/70 bg-[#4a9ead]/10 shadow-[0_0_12px_rgba(74,158,173,0.12)]'
            : 'border-[#2a3544] bg-[#151c26] hover:border-[#4a9ead]/40'
      }`}
    >
      <div className="flex items-start gap-2">
        {multiSelect && (
          <span
            className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center text-[10px] ${
              selected ? 'border-[#4a9ead] bg-[#4a9ead] text-[#0f1419]' : 'border-[#2a3544]'
            }`}
          >
            {selected ? '✓' : ''}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{option.label}</h4>
          {option.drugs?.map((id) => (
            <DrugLine key={id} drugId={id} />
          ))}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowRef((r) => !r)
              }}
              className="mt-2 text-[10px] text-[#4a9ead]/60 hover:text-[#4a9ead] transition-colors"
            >
              {showRef ? 'Hide reference ↑' : 'Drug reference ↓'}
            </button>
          )}
          {showRef && !disabled && (
            <>
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
                <p className="text-[10px] text-[#c9a227] mt-2">⚠ Renal adjustment required</p>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  )
}
