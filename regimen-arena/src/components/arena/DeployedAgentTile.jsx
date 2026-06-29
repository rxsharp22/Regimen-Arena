import { useState } from 'react'
import { getDrugById } from '../../utils/decisions'
import { getDrugVisual, getVisualImageUrl } from '../../data/visualAssets'
import { getMechanismLabel } from '../../utils/regimenCard'

export default function DeployedAgentTile({ drugId }) {
  const [imageFailed, setImageFailed] = useState(false)
  const drug = getDrugById(drugId)
  const visual = getDrugVisual(drugId)
  const imageUrl = getVisualImageUrl(visual)
  const showImage = imageUrl && !imageFailed
  const mechanism = getMechanismLabel(drugId)
  const name = drug?.display_name ?? visual?.displayName ?? drugId

  return (
    <div className="flex flex-col items-center min-w-[4.5rem] max-w-[5.5rem]">
      <div className="w-full rounded-md border border-[#4a9ead]/35 bg-gradient-to-b from-[#151c26] to-[#0a0e13] p-1.5 arena-agent-deploy">
        <div className="flex items-center justify-center h-14">
          {showImage ? (
            <img
              src={imageUrl}
              alt=""
              onError={() => setImageFailed(true)}
              className="max-h-12 max-w-full object-contain"
            />
          ) : (
            <span className="text-xs font-semibold text-[#4a9ead]/70">{name.slice(0, 3)}</span>
          )}
        </div>
      </div>
      <p className="text-[8px] text-[#e8edf4] font-medium mt-1 text-center leading-tight line-clamp-2">
        {name}
      </p>
      {mechanism && (
        <p className="text-[7px] text-[#4a9ead]/75 text-center leading-tight line-clamp-2 mt-0.5">
          {mechanism}
        </p>
      )}
    </div>
  )
}
