import { useEffect, useState } from 'react'
import { STEWARDSHIP_LOADING_SPRITES, getSpriteUrlOrFallback } from '../../data/spriteRegistry'

const PROCESSING_LINES = [
  'Reviewing cultures…',
  'Trending renal function…',
  'Checking source-control status…',
  'Updating antimicrobial exposure…',
  'Watching toxicity signals…',
  'Advancing hospital course…',
]

const DURATION_MS = 5000
const LINE_INTERVAL_MS = 1600
const SPRITE_INTERVAL_MS = 1700

export default function CaseAdvanceLoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [spriteIndex, setSpriteIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  const spriteKey = STEWARDSHIP_LOADING_SPRITES[spriteIndex % STEWARDSHIP_LOADING_SPRITES.length]
  const src = getSpriteUrlOrFallback(spriteKey, 'scribe5')

  useEffect(() => {
    const start = Date.now()
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min(100, (elapsed / DURATION_MS) * 100))
      if (elapsed >= DURATION_MS) {
        clearInterval(progressTimer)
        onComplete()
      }
    }, 50)

    const lineTimer = setInterval(() => {
      setLineIndex((i) => (i + 1) % PROCESSING_LINES.length)
    }, LINE_INTERVAL_MS)

    const spriteTimer = setInterval(() => {
      setSpriteIndex((i) => i + 1)
      setImgError(false)
    }, SPRITE_INTERVAL_MS)

    return () => {
      clearInterval(progressTimer)
      clearInterval(lineTimer)
      clearInterval(spriteTimer)
    }
  }, [onComplete])

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <section className="rounded-xl border border-[#2a3544] bg-[#151c26] p-6 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-1">
          Advancing Case Clock
        </p>
        <p className="text-xs text-[#8b9cb3] mb-4">Hospital time is moving forward…</p>

        <div className="flex justify-center mb-4 min-h-[7rem] items-center">
          {!imgError && src ? (
            <img
              src={src}
              alt=""
              className="max-h-28 w-auto object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-24 h-24 rounded-lg border border-dashed border-[#344559]" />
          )}
        </div>

        <p className="text-sm text-[#b8c5d6] mb-4 min-h-[1.25rem] transition-opacity">
          {PROCESSING_LINES[lineIndex]}
        </p>

        <div className="h-1.5 bg-[#0f1419] rounded-full overflow-hidden max-w-md mx-auto">
          <div
            className="h-full bg-[#4a9ead] rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>
    </div>
  )
}
