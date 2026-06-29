import patient from '../../data/patient.json'
import scenario from '../../data/scenario.json'
import { getArenaStageContext } from '../../utils/arenaStage'
import { ARENA_CAPTION } from '../../data/onboardingContent'
import { isGuidedMode } from '../../data/displayMode'
import { getDrugById } from '../../utils/decisions'
import DeployedAgentTile from './DeployedAgentTile'
import OrganismSprite from '../OrganismSprite'
import VisualAssetDisplay from '../VisualAssetDisplay'
import { getOrganismVisual } from '../../data/visualAssets'

function StatusBadge({ label, value }) {
  return (
    <div className="rounded border border-[#2a3544] bg-[#0f1419]/60 px-2 py-1 min-w-0">
      <p className="text-[8px] uppercase tracking-widest text-[#8b9cb3]">{label}</p>
      <p className="text-[10px] mt-0.5 leading-snug text-[#e8edf4]">{value}</p>
    </div>
  )
}

function ModifierChip({ label, value }) {
  return (
    <span className="inline-flex flex-col rounded border border-[#344559] bg-[#1a222d] px-2 py-1 text-left">
      <span className="text-[8px] uppercase tracking-wider text-[#8b9cb3]">{label}</span>
      <span className="text-[10px] mt-0.5 text-[#b8c5d6]">{value}</span>
    </span>
  )
}

export default function InfectionArenaPanel({
  phase,
  activeDrugs = [],
  conditionalEvents = [],
}) {
  const ctx = getArenaStageContext({
    phase,
    conditionalEvents,
    activeDrugs,
  })

  const organismAsset = ctx.organismId ? getOrganismVisual(ctx.organismId) : null
  const deployedLabel =
    activeDrugs.length > 0
      ? activeDrugs.map((id) => getDrugById(id)?.display_name ?? id).join(' + ')
      : null

  const footerLabel = isGuidedMode() ? 'Stewardship directive' : 'Status update'

  return (
    <section
      className="mb-6 rounded-xl border border-[#2a3544] bg-[#151c26] overflow-hidden"
      aria-label="Infection arena clinical dashboard"
    >
      <header className="px-4 py-3 border-b border-[#2a3544] bg-[#1a222d] flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
            Infection Arena
          </p>
          <p className="text-xs text-[#8b9cb3] mt-0.5">{ctx.infectionSite}</p>
          <p className="text-[10px] text-[#4a9ead]/80 mt-1 leading-snug max-w-md">{ARENA_CAPTION}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded border border-[#344559] text-[#8b9cb3] bg-[#1a222d] uppercase font-semibold">
          {scenario.severity} presentation
        </span>
      </header>

      <div className="px-4 py-2 border-b border-[#2a3544]/60 flex flex-wrap gap-2">
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1a222d] border border-[#344559] text-[#b8c5d6] font-medium">
          {ctx.stageLabel}
        </span>
        <StatusBadge label="Culture status" value={ctx.cultureStatus} />
        <StatusBadge label="Organism" value={ctx.organismStatus} />
      </div>

      <div className="arena-floor px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 items-start">
          <div className="rounded-lg border border-[#2a3544] bg-[#0f1419]/80 p-3">
            <p className="text-[9px] uppercase tracking-widest text-[#8b9cb3] mb-2">
              Microbiology
            </p>
            <div className="flex flex-col items-center justify-center min-h-[6.5rem]">
              {ctx.organismId ? (
                <>
                  {organismAsset ? (
                    <VisualAssetDisplay asset={organismAsset} size="lg" />
                  ) : (
                    <OrganismSprite organismId={ctx.organismId} label={ctx.organismStatus} />
                  )}
                  <p className="text-[10px] text-[#b8c5d6] mt-2 text-center leading-snug">
                    {ctx.organismStatus}
                  </p>
                </>
              ) : (
                <div className="text-center px-2">
                  <div className="w-16 h-16 mx-auto rounded-full border border-dashed border-[#344559] flex items-center justify-center bg-[#0a0e13]">
                    <span className="text-[10px] font-mono text-[#8b9cb3]">—</span>
                  </div>
                  <p className="text-[10px] text-[#8b9cb3] mt-2">Organism not identified</p>
                  <p className="text-[9px] text-[#8b9cb3]/80 mt-1">Awaiting culture data</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#2a3544] bg-[#0f1419]/80 p-3">
            <p className="text-[9px] uppercase tracking-widest text-[#8b9cb3] mb-1">
              Current regimen
            </p>
            {deployedLabel && (
              <p className="text-[10px] text-[#b8c5d6] mb-2 leading-snug">{deployedLabel}</p>
            )}
            <div className="arena-deployment-lane flex flex-wrap items-end gap-3 min-h-[5.5rem] py-1">
              {activeDrugs.length > 0 ? (
                activeDrugs.map((drugId) => (
                  <DeployedAgentTile key={drugId} drugId={drugId} />
                ))
              ) : (
                <p className="text-xs text-[#8b9cb3] italic py-4">No active antimicrobial orders</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Patient data">
          {ctx.modifiers.map((mod) => (
            <ModifierChip key={mod.id} label={mod.label} value={mod.value} />
          ))}
        </div>

        {ctx.clinicalFacts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2a3544]/50">
            <p className="text-[9px] uppercase tracking-widest text-[#8b9cb3] mb-1.5">
              Clinical data
            </p>
            <ul className="space-y-1">
              {ctx.clinicalFacts.map((line, i) => (
                <li key={i} className="text-[11px] text-[#b8c5d6] flex gap-2 leading-snug">
                  <span className="text-[#8b9cb3] shrink-0" aria-hidden>
                    •
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <footer className="px-4 py-3 border-t border-[#2a3544] bg-[#1a222d]/80">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] mb-1">{footerLabel}</p>
        <p className="text-sm text-[#b8c5d6] leading-relaxed">{ctx.directive}</p>
      </footer>
    </section>
  )
}
