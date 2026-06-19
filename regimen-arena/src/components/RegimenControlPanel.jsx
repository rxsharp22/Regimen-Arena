import { RegimenCard, ActiveRegimenItem } from './RegimenCard'
import CultureOrganismHUD from './CultureOrganismHUD'
import { getTierStyle } from '../utils/stewardship'

export default function RegimenControlPanel({
  availableDrugs,
  activeRegimen,
  currentStage,
  stageConfig,
  onAddDrug,
  onRemoveDrug,
  onEvaluate,
  currentFeedback,
  organism,
  showCulture,
}) {
  const canSelectDrugs = currentStage === 't0' || currentStage === 't36'
  const showOrganism = showCulture || currentStage === 'outcome'

  return (
    <aside className="flex flex-col h-full bg-[#1a222d] border border-[#2a3544] rounded-lg panel-glow overflow-hidden min-h-0">
      <header className="px-4 py-3 border-b border-[#2a3544] bg-[#151c26] shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] mb-1">Regimen Control</p>
        <h2 className="text-lg font-semibold">Antimicrobial Cockpit</h2>
      </header>

      <div className="px-4 py-3 border-b border-[#2a3544] shrink-0">
        <h3 className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-2">Current Regimen</h3>
        {activeRegimen.length === 0 ? (
          <p className="text-xs text-[#4a5568] italic">No agents selected</p>
        ) : (
          <div className="space-y-1.5">
            {activeRegimen.map((drug) => (
              <ActiveRegimenItem key={drug.id} drug={drug} onRemove={onRemoveDrug} />
            ))}
          </div>
        )}
      </div>

      {currentFeedback && (
        <div className={`mx-4 mt-3 px-3 py-2.5 rounded-md border text-sm shrink-0 ${getTierStyle(currentFeedback.tier)}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">{currentFeedback.tier}</span>
            <span className="text-[10px] text-[#8b9cb3]">stewardship feedback</span>
          </div>
          <p className="text-xs leading-relaxed">{currentFeedback.message}</p>
        </div>
      )}

      <div className="px-4 py-3 border-b border-[#2a3544] shrink-0">
        <CultureOrganismHUD organism={organism} visible={showOrganism} />
      </div>

      {canSelectDrugs && (
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          <h3 className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-2">
            {currentStage === 't0' ? 'Empiric Options' : 'De-escalation Options'}
          </h3>
          <div className="space-y-2">
            {availableDrugs.map((drug) => (
              <RegimenCard
                key={drug.id}
                drug={drug}
                inRegimen={activeRegimen.some((d) => d.id === drug.id)}
                onAdd={onAddDrug}
                onRemove={onRemoveDrug}
              />
            ))}
          </div>
        </div>
      )}

      {!canSelectDrugs && currentStage !== 'outcome' && (
        <div className="flex-1 px-4 py-3">
          <p className="text-xs text-[#8b9cb3] leading-relaxed">
            Review current regimen against new clinical data. Evaluate stewardship alignment before advancing.
          </p>
        </div>
      )}

      <footer className="px-4 py-3 border-t border-[#2a3544] bg-[#151c26] shrink-0 space-y-2">
        {canSelectDrugs && (
          <button
            type="button"
            onClick={onEvaluate}
            disabled={activeRegimen.length === 0}
            className="w-full py-2 px-4 rounded-md text-sm font-medium border border-[#2a3544] text-[#e8edf4] hover:bg-[#2a3544]/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Evaluate Regimen
          </button>
        )}
        {currentStage === 't12' && (
          <button
            type="button"
            onClick={onEvaluate}
            disabled={activeRegimen.length === 0}
            className="w-full py-2 px-4 rounded-md text-sm font-medium border border-[#c9a227]/40 text-[#c9a227] hover:bg-[#c9a227]/10 disabled:opacity-40"
          >
            Reassess Dosing (T12)
          </button>
        )}
      </footer>
    </aside>
  )
}
