import VisualAssetDisplay from './VisualAssetDisplay'
import { visualAssets } from '../data/visualAssets'

function GallerySection({ title, items }) {
  const entries = Object.entries(items)
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-bold text-[#e8edf4]">{title}</h2>
        <p className="text-xs text-[#8b9cb3] mt-1">{entries.length} registered</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(([id, record]) => (
          <article
            key={id}
            className="bg-[#151c26] border border-[#2a3544] rounded-lg p-4 space-y-3"
          >
            <VisualAssetDisplay asset={{ id, ...record }} size="card" showMeta />
            {record.altImages?.length > 0 && (
              <div className="pt-2 border-t border-[#2a3544]/60">
                <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-2">
                  Alt images
                </p>
                <div className="flex flex-wrap gap-2">
                  {record.altImages.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-14 w-14 object-contain rounded border border-[#2a3544] bg-[#0f1419]/60"
                    />
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default function VisualGallery({ onBack }) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#4a9ead]">Internal</p>
            <h1 className="text-2xl font-bold">Visual Asset Gallery</h1>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-[#4a9ead] hover:text-[#6bb8c7] transition-colors"
            >
              ← Back to game
            </button>
          )}
        </div>
        <p className="text-sm text-[#8b9cb3] leading-relaxed">
          Review registered sprites and placeholders as they appear in the game UI. Add new assets by
          updating <code className="text-[#b8c5d6]">src/data/visualAssets.js</code>.
        </p>
      </header>

      <GallerySection title="Drug agents" items={visualAssets.drugs} />
      <GallerySection title="Organism tokens" items={visualAssets.organisms} />
      <GallerySection title="Player / command" items={visualAssets.player} />
    </div>
  )
}
