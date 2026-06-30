import { useAgentProfile } from '../../context/AgentProfileContext'
import { getAgentProfile } from '../../data/agentProfiles'
import AgentProfileContent from './AgentProfileContent'

export default function AgentProfileModal() {
  const { drugId, closeProfile } = useAgentProfile()
  if (!drugId || !getAgentProfile(drugId)) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-profile-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0f1419]/88 backdrop-blur-[2px]"
        onClick={closeProfile}
        aria-label="Close agent profile"
      />

      <div className="agent-profile-modal relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden rounded-t-xl sm:rounded-xl border border-[#2a3544] bg-[#151c26] shadow-[0_0_40px_rgba(0,0,0,0.45)] flex flex-col">
        <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-[#2a3544] bg-[#1a222d]">
          <p id="agent-profile-title" className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
            Antimicrobial Agent Profile
          </p>
          <button
            type="button"
            onClick={closeProfile}
            className="text-[10px] uppercase tracking-widest text-[#8b9cb3] hover:text-[#4a9ead] transition-colors px-2 py-1"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <AgentProfileContent drugId={drugId} />
        </div>
      </div>
    </div>
  )
}
