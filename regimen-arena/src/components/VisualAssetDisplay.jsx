import { useState } from 'react'
import { getVisualImageUrl } from '../data/visualAssets'

const SIZE_CLASSES = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  card: 'h-28 w-full',
}

function getInitials(asset) {
  const name = asset?.shortName || asset?.displayName || ''
  if (!name) return '?'
  const parts = name.split(/[\s-]+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function Placeholder({ asset, size, className }) {
  const isCard = size === 'card'
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-[#344559] bg-[#0f1419]/80 text-[#8b9cb3] ${
        isCard ? 'h-full w-full min-h-[5.5rem]' : SIZE_CLASSES[size] ?? SIZE_CLASSES.md
      } ${className ?? ''}`}
      aria-hidden={!asset?.displayName}
    >
      <div className="text-center px-2">
        <span
          className={`font-semibold tracking-wide text-[#4a9ead] ${
            isCard ? 'text-lg' : 'text-xs'
          }`}
        >
          {getInitials(asset)}
        </span>
        {isCard && (
          <p className="text-[9px] uppercase tracking-widest mt-1 text-[#8b9cb3]">Visual pending</p>
        )}
      </div>
    </div>
  )
}

export default function VisualAssetDisplay({
  asset,
  size = 'md',
  label,
  showMeta = false,
  className = '',
  imageClassName = '',
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getVisualImageUrl(asset)
  const showImage = imageUrl && !imageFailed
  const isCard = size === 'card'
  const frameClass = isCard
    ? 'w-full'
    : `shrink-0 ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md}`

  const altText = label || asset?.displayName || 'Visual asset'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className={frameClass}>
        {showImage ? (
          <img
            src={imageUrl}
            alt={altText}
            onError={() => setImageFailed(true)}
            className={`object-contain rounded-lg border border-[#2a3544] bg-[#0f1419]/60 ${
              isCard ? 'h-28 w-full' : 'h-full w-full'
            } ${imageClassName}`}
          />
        ) : (
          <Placeholder asset={asset} size={size} className={imageClassName} />
        )}
      </div>

      {showMeta && asset && (
        <div className="min-w-0">
          {asset.displayName && (
            <p className="text-sm font-semibold text-[#e8edf4] truncate">{asset.displayName}</p>
          )}
          {asset.role && <p className="text-xs text-[#8b9cb3] mt-0.5">{asset.role}</p>}
          {asset.mechanism && (
            <p className="text-[10px] text-[#4a9ead]/80 mt-1 leading-snug">{asset.mechanism}</p>
          )}
          {imageUrl && (
            <p className="text-[9px] font-mono text-[#8b9cb3]/70 mt-1 truncate" title={imageUrl}>
              {imageUrl}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
