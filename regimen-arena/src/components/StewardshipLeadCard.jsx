import VisualAssetDisplay from './VisualAssetDisplay'
import { getPlayerVisual } from '../data/visualAssets'

export default function StewardshipLeadCard({ compact = false, className = '' }) {
  const asset = getPlayerVisual('stewardshipLead')
  if (!asset) return null

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 bg-[#151c26] border border-[#2a3544] rounded-lg px-3 py-2 ${className}`}
      >
        <VisualAssetDisplay asset={asset} size="sm" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#4a9ead]">Command</p>
          <p className="text-sm font-semibold text-[#e8edf4] truncate">{asset.displayName}</p>
        </div>
      </div>
    )
  }

  return (
    <aside
      className={`bg-[#151c26] border border-[#2a3544] rounded-xl overflow-hidden ${className}`}
    >
      <header className="px-4 py-2 border-b border-[#2a3544] bg-[#1a222d]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
          Stewardship Command
        </p>
      </header>
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-start">
        <VisualAssetDisplay asset={asset} size="lg" className="shrink-0" />
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[#e8edf4]">{asset.displayName}</h3>
          <p className="text-sm text-[#8b9cb3] mt-1 leading-relaxed">{asset.role}</p>
        </div>
      </div>
    </aside>
  )
}
