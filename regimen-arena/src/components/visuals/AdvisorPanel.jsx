import { useState } from 'react'
import { getSpriteUrlOrFallback } from '../../data/spriteRegistry'

const TONE_STYLES = {
  neutral: 'border-[#2a3544] bg-[#151c26]',
  lab: 'border-[#3d9a6e]/40 bg-[#151c26]',
  pharmacy: 'border-[#4a9ead]/40 bg-[#151c26]',
  warning: 'border-[#c9a227]/50 bg-[#c9a227]/5',
  improving: 'border-[#3d9a6e]/50 bg-[#3d9a6e]/5',
  declining: 'border-[#c45c5c]/50 bg-[#c45c5c]/5',
  debrief: 'border-[#4a9ead]/50 bg-[#1a222d]',
}

export default function AdvisorPanel({
  spriteKey,
  title,
  subtitle,
  children,
  tone = 'neutral',
  className = '',
}) {
  const [imgError, setImgError] = useState(false)
  const src = getSpriteUrlOrFallback(spriteKey, 'scribe5')

  return (
    <section
      className={`rounded-xl border p-4 flex gap-4 items-start ${TONE_STYLES[tone] ?? TONE_STYLES.neutral} ${className}`}
    >
      <div className="shrink-0 w-20 sm:w-24">
        {!imgError && src ? (
          <img
            src={src}
            alt=""
            className="w-full h-auto rounded-lg border border-[#2a3544]/60 bg-[#0f1419]/50 object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-20 h-20 rounded-lg border border-dashed border-[#344559] flex items-center justify-center text-[10px] text-[#8b9cb3] text-center px-1">
            Clinical update
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">{title}</p>
        )}
        {subtitle && <p className="text-sm font-medium text-[#e8edf4] mt-1">{subtitle}</p>}
        {children && (
          <div className="text-sm text-[#b8c5d6] leading-relaxed mt-2 whitespace-pre-line">{children}</div>
        )}
      </div>
    </section>
  )
}
