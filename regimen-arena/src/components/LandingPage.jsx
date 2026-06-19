export default function LandingPage({ onEnter }) {
  return (
    <div>
      <section className="max-w-2xl mx-auto text-center py-12 md:py-16">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-4">
          Antimicrobial Stewardship
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Make the call.</h1>
        <p className="text-sm text-[#8b9cb3] leading-relaxed max-w-lg mx-auto">
          Regimen Arena puts you in the seat of a clinical pharmacist. Read the case, select your
          regimen, and defend your reasoning. Every decision scores.
        </p>
      </section>

      <section className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
        <button
          type="button"
          onClick={onEnter}
          className="text-left bg-[#1a222d] border border-[#2a3544] rounded-xl p-5 hover:border-[#4a9ead]/40 transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#4a9ead]/40 text-[#4a9ead]">
              01
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#c45c5c]/40 text-[#c45c5c] bg-[#c45c5c]/10">
              Critical
            </span>
          </div>
          <h2 className="text-lg font-bold mb-2">Bone Deep</h2>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {['MSSA bacteremia', 'Osteomyelitis', 'OPAT'].map((tag) => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3]"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#8b9cb3] leading-relaxed mb-4">
            A diabetic patient with exposed bone, bacteremia, and worsening renal function. Start
            empiric. De-escalate when the culture returns.
          </p>
          <span className="text-sm font-medium text-[#4a9ead]">Begin →</span>
        </button>

        <div className="bg-[#1a222d] border border-[#2a3544] rounded-xl p-5 opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3]">
              02
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3] bg-[#2a3544]/30">
              Coming Soon
            </span>
          </div>
          <h2 className="text-lg font-bold mb-2">Redacted</h2>
          <p className="text-xs text-[#8b9cb3] blur-sm select-none mb-3">████████</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['???', '???', '???'].map((tag, i) => (
              <span
                key={i}
                className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3]"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-sm text-[#8b9cb3]">Locked</span>
        </div>
      </section>

      <p className="mt-8 text-center text-[10px] text-[#8b9cb3] uppercase tracking-widest">
        Educational simulation only — not for patient care
      </p>
    </div>
  )
}
