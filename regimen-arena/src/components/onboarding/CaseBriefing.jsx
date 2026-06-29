import { getCaseBriefing } from '../../data/caseBriefings'

function BriefList({ title, items }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-1.5">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-xs text-[#b8c5d6] flex gap-2 leading-snug">
            <span className="text-[#8b9cb3] shrink-0" aria-hidden>
              •
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CaseBriefing({ phaseId }) {
  const briefing = getCaseBriefing(phaseId)
  if (!briefing) return null

  return (
    <section className="mb-6 bg-[#151c26] border border-[#2a3544] rounded-xl overflow-hidden">
      <header className="px-4 py-3 border-b border-[#2a3544] bg-[#1a222d]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
          Case briefing
        </p>
        <p className="text-sm font-medium text-[#e8edf4] mt-0.5">{briefing.decisionPhase}</p>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-1">
            Infection syndrome / site
          </p>
          <p className="text-sm text-[#b8c5d6]">{briefing.syndrome}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BriefList title="Patient factors" items={briefing.patientFactors} />
          <BriefList title="Data known" items={briefing.known} />
        </div>

        <BriefList title="Data pending" items={briefing.pending} />
      </div>
    </section>
  )
}
