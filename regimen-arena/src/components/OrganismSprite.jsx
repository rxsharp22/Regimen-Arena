import { useState } from 'react'
import { getOrganismVisual, getVisualImageUrl } from '../data/visualAssets'
import VisualAssetDisplay from './VisualAssetDisplay'

const ANIM_CLASS = {
  idle: 'bacteria-idle',
  hit: 'bacteria-hit',
  miss: 'bacteria-miss',
  backfire: 'bacteria-backfire',
  cleared: '',
}

export default function OrganismSprite({ animState = 'idle', organismId = 'mssa', label }) {
  const animClass = ANIM_CLASS[animState] ?? ANIM_CLASS.idle
  const clearedClass = animState === 'cleared' ? 'opacity-20 scale-75 transition-all duration-700' : ''
  const asset = getOrganismVisual(organismId)
  const imageUrl = getVisualImageUrl(asset)
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = imageUrl && !imageFailed
  const displayLabel = label || asset?.displayName || 'S. AUREUS'

  return (
    <div className={`flex flex-col items-center ${animClass} ${clearedClass}`}>
      {showImage ? (
        <img
          src={imageUrl}
          alt={displayLabel}
          onError={() => setImageFailed(true)}
          className="w-20 h-20 object-contain"
        />
      ) : (
        <VisualAssetDisplay asset={asset ?? { displayName: displayLabel }} size="lg" />
      )}
      <span className="text-[9px] font-mono text-[#8b9cb3] mt-1 tracking-wider">
        {displayLabel.toUpperCase()}
      </span>
    </div>
  )
}
