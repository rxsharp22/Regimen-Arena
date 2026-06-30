import { useAgentProfile } from '../../context/AgentProfileContext'
import { listAgentProfiles } from '../../data/agentProfiles'
import { getDrugVisual, getVisualImageUrl } from '../../data/visualAssets'

function AgentLibraryCard({ profile, onOpen }) {
  const visual = getDrugVisual(profile.id)
  const imageUrl = getVisualImageUrl(visual)

  return (
    <button
      type="button"
      onClick={() => onOpen(profile.id)}
      className="text-left bg-[#151c26] border border-[#2a3544] rounded-xl overflow-hidden hover:border-[#4a9ead]/45 transition-colors group"
    >
      <div className="h-28 flex items-center justify-center bg-[#0f1419]/80 border-b border-[#2a3544]/60 p-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="max-h-full max-w-full object-contain group-hover:scale-[1.02] transition-transform"
          />
        ) : (
          <span className="text-lg font-bold text-[#4a9ead]/60">
            {profile.name.slice(0, 3).toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[#e8edf4]">{profile.name}</h3>
        <p className="text-[10px] text-[#8b9cb3] mt-1 leading-snug">{profile.className}</p>
      </div>
    </button>
  )
}

export default function AgentLibrary({ onBack }) {
  const { openProfile } = useAgentProfile()
  const profiles = listAgentProfiles()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#4a9ead]">Reference</p>
            <h1 className="text-2xl font-bold">Antimicrobial Agent Library</h1>
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
          General mechanism, monitoring, and stewardship education. Case-specific interpretation
          appears after you place orders in a scenario.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => (
          <AgentLibraryCard key={profile.id} profile={profile} onOpen={openProfile} />
        ))}
      </div>
    </div>
  )
}
