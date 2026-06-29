import { PLAYER_ROLE, ARENA_CAPTION } from '../../data/onboardingContent'

export default function ArenaPremiseBrief() {
  return (
    <section className="bg-[#151c26] border border-[#4a9ead]/30 rounded-xl overflow-hidden">
      <header className="px-5 py-3 border-b border-[#2a3544] bg-[#1a222d]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
          Your role · {PLAYER_ROLE.title}
        </p>
      </header>
      <div className="px-5 py-4 space-y-2">
        <p className="text-sm text-[#b8c5d6] leading-relaxed">{PLAYER_ROLE.description}</p>
        <p className="text-xs text-[#8b9cb3] leading-relaxed">{ARENA_CAPTION}</p>
      </div>
    </section>
  )
}
