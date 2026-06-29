import { getDrugById } from '../../utils/decisions'
import { getMechanismLabel } from '../../utils/regimenCard'

const CLASS_ACCENT = {
  Glycopeptide: '#c9a227',
  '1st-gen Cephalosporin': '#4a9ead',
  '4th-gen Cephalosporin': '#4a9ead',
  'BL/BLI Combination': '#5b9cff',
  'Cyclic Lipopeptide': '#3d9a6e',
  Carbapenem: '#c45c5c',
  Oxazolidinone: '#8c4ecf',
  'Antistaphylococcal Penicillin': '#4a9ead',
  'Folate Synthesis Inhibitor': '#8b9cb3',
}

function getAccent(drugId) {
  const drug = getDrugById(drugId)
  return CLASS_ACCENT[drug?.class] ?? '#4a9ead'
}

function getEmblemCode(drugId) {
  const drug = getDrugById(drugId)
  if (!drug) return drugId.slice(0, 3).toUpperCase()
  const words = drug.display_name.split(/[\s-+]+/).filter(Boolean)
  if (words.length >= 2) return words.map((w) => w[0]).join('').slice(0, 3).toUpperCase()
  return drug.display_name.slice(0, 3).toUpperCase()
}

export default function MechanismEmblem({ drugId, compact = false }) {
  const drug = getDrugById(drugId)
  const accent = getAccent(drugId)
  const mechanism = getMechanismLabel(drugId)
  const code = getEmblemCode(drugId)
  const name = drug?.display_name ?? drugId

  if (compact) {
    return (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded border text-[9px] font-bold tracking-wide shrink-0"
        style={{ borderColor: `${accent}66`, backgroundColor: `${accent}14`, color: accent }}
        title={`${name} — ${mechanism ?? drug?.class ?? ''}`}
        aria-label={`${name}, ${mechanism ?? ''}`}
      >
        {code}
      </span>
    )
  }

  return (
    <div
      className="flex items-center gap-2 min-w-0 rounded-md border px-2 py-1.5 bg-[#0f1419]/80"
      style={{ borderColor: `${accent}44` }}
    >
      <span
        className="flex items-center justify-center w-9 h-9 rounded border text-[10px] font-bold shrink-0"
        style={{ borderColor: `${accent}66`, backgroundColor: `${accent}14`, color: accent }}
        aria-hidden
      >
        {code}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-[#e8edf4] truncate">{name}</p>
        {mechanism && (
          <p className="text-[9px] text-[#4a9ead]/85 leading-tight truncate">{mechanism}</p>
        )}
      </div>
    </div>
  )
}

export function MechanismEmblemRow({ drugIds = [] }) {
  if (!drugIds.length) return null
  const isPaired = drugIds.length > 1

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {drugIds.map((drugId, index) => (
        <div key={drugId} className="flex items-center gap-1.5 min-w-0">
          {index > 0 && (
            <span className="text-[10px] text-[#4a9ead]/50 font-medium shrink-0" aria-hidden>
              +
            </span>
          )}
          <MechanismEmblem drugId={drugId} />
        </div>
      ))}
      {isPaired && (
        <span className="text-[8px] uppercase tracking-widest text-[#8b9cb3] w-full sm:w-auto">
          Paired regimen
        </span>
      )}
    </div>
  )
}
