import { useState } from 'react'
import { getDrugById } from '../../utils/decisions'
import { getDrugVisual, getDrugSpriteAlt, getVisualImageUrl } from '../../data/visualAssets'
import { getMechanismLabel } from '../../utils/regimenCard'
import { useAgentProfile } from '../../context/AgentProfileContext'

export default function DeployedAgentTile({ drugId }) {
  const { openProfile } = useAgentProfile()
  const [imageFailed, setImageFailed] = useState(false)
  const drug = getDrugById(drugId)
  const visual = getDrugVisual(drugId)
  const imageUrl = getVisualImageUrl(visual)
  const name = drug?.display_name ?? visual?.displayName ?? drugId
  const spriteAlt = getDrugSpriteAlt(drugId) ?? `${name} antimicrobial agent sprite.`
  const showImage = imageUrl && !imageFailed
  const mechanism = getMechanismLabel(drugId)

  return (
    <button
      type="button"
      onClick={() => openProfile(drugId)}
      className="flex flex-col items-center min-w-[4.5rem] max-w-[5.5rem] text-center group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9ead]/50"
      title={`View ${name} agent profile`}
    >
      <div className="w-full rounded-md border border-[#4a9ead]/35 bg-gradient-to-b from-[#151c26] to-[#0a0e13] p-1.5 arena-agent-deploy group-hover:border-[#4a9ead]/55 transition-colors">
        <div className="flex items-center justify-center h-14">
          {showImage ? (
            <img
              src={imageUrl}
              alt={spriteAlt}
              onError={() => setImageFailed(true)}
              className="max-h-12 max-w-full object-contain briefing-sprite-image"
            />
          ) : (
            <span className="text-xs font-semibold text-[#4a9ead]/70">{name.slice(0, 3)}</span>
          )}
        </div>
      </div>
      <p className="text-[8px] text-[#e8edf4] font-medium mt-1 leading-tight line-clamp-2 group-hover:text-[#4a9ead] transition-colors">
        {name}
      </p>
      {mechanism && (
        <p className="text-[7px] text-[#4a9ead]/75 leading-tight line-clamp-2 mt-0.5">
          {mechanism}
        </p>
      )}
    </button>
  )
}
