import VisualAssetDisplay from './VisualAssetDisplay'
import { getOrganismVisual, inferOrganismIdFromText } from '../data/visualAssets'

const TYPE_STYLES = {
  imaging: 'border-l-[#6b8cae]',
  lab: 'border-l-[#3d9a6e]',
  lab_result: 'border-l-[#3d9a6e]',
  microbiology: 'border-l-[#c9a227]',
  procedure: 'border-l-[#4a9ead]',
  consult: 'border-l-[#4a9ead]',
  clinical: 'border-l-[#4a9ead]',
  safety_alert: 'border-l-[#c45c5c]',
  adverse_event: 'border-l-[#c9a227]',
  toxicity_event: 'border-l-[#c45c5c]',
  treatment_failure: 'border-l-[#c45c5c]',
  relapse_event: 'border-l-[#c45c5c]',
}

export default function NewInformationPanel({ phase, conditionalEvents = [] }) {
  const items = [...(phase.new_information ?? [])]

  return (
    <section className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
        Chart Update
      </h3>

      {phase.narrative && (
        <p className="text-sm text-[#b8c5d6] leading-relaxed border border-[#2a3544] rounded-lg px-4 py-3 bg-[#151c26]">
          {phase.narrative}
        </p>
      )}

      {items.length === 0 && conditionalEvents.length === 0 && (
        <p className="text-xs text-[#8b9cb3] italic">No new data this phase.</p>
      )}

      {items.map((item, i) => (
        <div
          key={`${item.type}-${i}`}
          className={`border border-[#2a3544] border-l-[3px] rounded-md px-4 py-3 bg-[#151c26] ${TYPE_STYLES[item.type] ?? 'border-l-[#4a9ead]'}`}
        >
          <span className="text-[10px] uppercase tracking-wider text-[#8b9cb3]">{item.type}</span>
          {item.organism ? (
            <div className="mt-1 flex gap-3 items-start">
              {(() => {
                const organismId =
                  inferOrganismIdFromText(item.interpretation) ??
                  inferOrganismIdFromText(item.organism)
                const asset = organismId ? getOrganismVisual(organismId) : null
                return asset ? (
                  <VisualAssetDisplay asset={asset} size="md" className="shrink-0" />
                ) : null
              })()}
              <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.organism}</p>
              <p className="text-xs text-[#3d9a6e] mt-0.5">{item.interpretation}</p>
              <p className="text-xs text-[#8b9cb3] mt-1">{item.source}</p>
              {item.susceptibilities && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {Object.entries(item.susceptibilities).map(([drug, result]) => (
                    <span
                      key={drug}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-[#2a3544] text-[#b8c5d6]"
                    >
                      {drug}: {result}
                    </span>
                  ))}
                </div>
              )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#e8edf4] mt-1">{item.content}</p>
          )}
        </div>
      ))}

      {conditionalEvents.map((event, i) => (
        <div
          key={`conditional-${i}`}
          className={`border border-[#2a3544] border-l-[3px] rounded-md px-4 py-3 bg-[#c45c5c]/5 ${TYPE_STYLES[event.type] ?? 'border-l-[#c45c5c]'}`}
        >
          <span className="text-[10px] uppercase tracking-wider text-[#c45c5c]">
            {event.type.replace(/_/g, ' ')}
          </span>
          <p className="text-sm text-[#e8edf4] mt-1">{event.content}</p>
        </div>
      ))}
    </section>
  )
}
