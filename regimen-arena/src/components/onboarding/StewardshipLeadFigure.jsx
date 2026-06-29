import { useState } from 'react'
import { NARRATOR } from '../../data/onboardingContent'
import { getPlayerBriefingImage, getPlayerVisual } from '../../data/visualAssets'

export default function StewardshipLeadFigure({
  characterPose = 'default',
  className = '',
}) {
  const asset = getPlayerVisual('stewardshipLead')
  const imageUrl = getPlayerBriefingImage(characterPose)
  const [imageFailed, setImageFailed] = useState(false)
  const altText = asset?.briefingAlt ?? 'Stewardship Lead character holding a clinical tablet.'
  const showImage = imageUrl && !imageFailed

  return (
    <div className={`briefing-character-zone ${className}`}>
      <div className="briefing-character-glow" aria-hidden />
      <div className="briefing-character-frame">
        {showImage ? (
          <img
            src={imageUrl}
            alt={altText}
            width={512}
            height={768}
            decoding="async"
            onError={() => setImageFailed(true)}
            className="briefing-character-image"
          />
        ) : (
          <div
            className="briefing-character-fallback"
            role="img"
            aria-label={altText}
          >
            <span className="text-2xl font-bold tracking-wide text-[#4a9ead]">
              {NARRATOR.initials}
            </span>
            <p className="text-[10px] uppercase tracking-widest mt-2 text-[#8b9cb3]">
              {NARRATOR.speaker}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
