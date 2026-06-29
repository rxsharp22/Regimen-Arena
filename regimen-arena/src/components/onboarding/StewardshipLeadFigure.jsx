import { useState } from 'react'
import { NARRATOR } from '../../data/onboardingContent'
import { getTutorialImage } from '../../data/tutorialAssets'

export default function StewardshipLeadFigure({
  imageKey = 'stewardshipLeadDefault',
  imageAlt,
  visualTheme,
  className = '',
}) {
  const tutorialImage = getTutorialImage(imageKey)
  const src = tutorialImage.src
  const alt = imageAlt ?? tutorialImage.alt
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = src && !imageFailed

  return (
    <div
      className={`briefing-character-zone ${className}`}
      data-visual-theme={visualTheme ?? tutorialImage.theme}
    >
      <div className="briefing-character-glow" aria-hidden />
      <div className="briefing-character-frame">
        {showImage ? (
          <img
            src={src}
            alt={alt}
            width={512}
            height={768}
            decoding="async"
            onError={() => setImageFailed(true)}
            className="briefing-character-image"
          />
        ) : (
          <div className="briefing-character-fallback" role="img" aria-label={alt}>
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
