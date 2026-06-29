import { useState } from 'react'
import { getDrugById } from '../../utils/decisions'
import { getDrugVisual, getVisualImageUrl } from '../../data/visualAssets'
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

function getAccentForDrug(drugId) {
  const drug = getDrugById(drugId)
  return CLASS_ACCENT[drug?.class] ?? '#4a9ead'
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(/[\s-]+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function SingleSpriteTile({ drugId }) {
  const [imageFailed, setImageFailed] = useState(false)
  const drug = getDrugById(drugId)
  const visual = getDrugVisual(drugId)
  const imageUrl = getVisualImageUrl(visual)
  const showImage = imageUrl && !imageFailed
  const accent = getAccentForDrug(drugId)
  const mechanism = getMechanismLabel(drugId)
  const displayName = drug?.display_name ?? visual?.displayName ?? drugId

  return (
    <div className="flex flex-col min-w-0 flex-1">
      <div
        className="relative rounded-md border overflow-hidden"
        style={{ borderColor: `${accent}55`, backgroundColor: '#0a0e13' }}
      >
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <div className="flex items-center justify-center h-[4.5rem] px-2 pt-1 bg-gradient-to-b from-[#121820] to-[#0a0e13]">
          {showImage ? (
            <img
              src={imageUrl}
              alt=""
              onError={() => setImageFailed(true)}
              className="max-h-[3.75rem] max-w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
            />
          ) : (
            <span className="text-sm font-semibold tracking-wide text-[#4a9ead]/80">
              {getInitials(displayName)}
            </span>
          )}
        </div>
        <div className="px-2 py-1 border-t border-[#2a3544]/80 bg-[#0f1419]">
          <p className="text-[9px] font-semibold text-[#e8edf4] truncate">{displayName}</p>
          {mechanism && (
            <p className="text-[8px] text-[#4a9ead]/90 leading-tight mt-0.5 line-clamp-2">
              {mechanism}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegimenSpritePanel({ drugIds = [] }) {
  if (!drugIds.length) return null

  const isPaired = drugIds.length > 1

  return (
    <div className="rounded-lg border border-[#2a3544] bg-[#0f1419]/90 overflow-hidden">
      <div className="px-2.5 py-1 border-b border-[#2a3544]/80 bg-[#151c26] flex items-center justify-between gap-2">
        <span className="text-[9px] uppercase tracking-widest text-[#8b9cb3]">
          {isPaired ? 'Paired regimen' : 'Agent mechanism tile'}
        </span>
        {isPaired && (
          <span className="text-[9px] text-[#4a9ead]/70 uppercase tracking-wider">Dual coverage</span>
        )}
      </div>
      <div className={`p-2 flex items-stretch gap-1.5 ${isPaired ? '' : ''}`}>
        {drugIds.map((drugId, index) => (
          <div key={drugId} className="contents">
            {index > 0 && (
              <div className="flex items-center justify-center shrink-0 w-5 self-center" aria-hidden>
                <span className="text-[10px] font-bold text-[#4a9ead]/60">+</span>
              </div>
            )}
            <SingleSpriteTile drugId={drugId} />
          </div>
        ))}
      </div>
    </div>
  )
}
