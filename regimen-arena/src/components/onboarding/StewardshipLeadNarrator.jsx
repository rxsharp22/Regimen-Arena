import { NARRATOR } from '../../data/onboardingContent'
import VisualAssetDisplay from '../VisualAssetDisplay'
import { getPlayerVisual } from '../../data/visualAssets'

export default function StewardshipLeadNarrator({ className = '' }) {
  const asset = getPlayerVisual('stewardshipLead')

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-[#2a3544] bg-[#0f1419]/60 px-3 py-2.5 ${className}`}
    >
      <div className="relative shrink-0">
        <VisualAssetDisplay
          asset={asset}
          size="sm"
          className="[&_img]:rounded-full [&_div]:rounded-full"
          imageClassName="rounded-full"
        />
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#4a9ead]/60 bg-[#151c26] text-[8px] font-bold tracking-wide text-[#4a9ead]"
          aria-hidden
        >
          {NARRATOR.initials}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3]">Speaker</p>
        <p className="text-sm font-semibold text-[#e8edf4]">{NARRATOR.speaker}</p>
      </div>
    </div>
  )
}
