import { ARENA_PREMISE } from '../../data/arenaStageMeta'

export default function ArenaPremiseBrief() {
  return (
    <section className="bg-[#151c26] border border-[#4a9ead]/30 rounded-xl overflow-hidden">
      <header className="px-5 py-3 border-b border-[#2a3544] bg-[#1a222d]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
          {ARENA_PREMISE.title}
        </p>
      </header>
      <div className="px-5 py-4">
        <p className="text-sm text-[#b8c5d6] leading-relaxed whitespace-pre-line">
          {ARENA_PREMISE.body}
        </p>
        <p className="text-[10px] text-[#8b9cb3] mt-3 uppercase tracking-widest">
          You are the stewardship lead · This case is your infection arena
        </p>
      </div>
    </section>
  )
}
