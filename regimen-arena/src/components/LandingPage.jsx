export default function LandingPage({ onEnter }) {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead]">
          Antimicrobial Stewardship Training
        </p>
        <h1 className="text-4xl font-bold tracking-tight mt-3">Regimen Arena</h1>
        <p className="text-sm text-[#8b9cb3] mt-2">Complex cases. Competing priorities. Your call.</p>
      </section>

      <p className="mt-10 mb-3 text-[10px] uppercase tracking-widest text-[#8b9cb3]">
        Active Consults
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onEnter}
          className="text-left bg-[#1a222d] border border-[#2a3544] rounded-xl overflow-hidden hover:border-[#4a9ead]/40 transition-colors cursor-pointer"
        >
          <div className="bg-[#151c26] px-5 py-3 border-b border-[#2a3544] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#8b9cb3]">
              Consult Request
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#c45c5c]/40 text-[#c45c5c] bg-[#c45c5c]/10 uppercase font-semibold">
              Severe
            </span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <h2 className="text-lg font-bold text-[#e8edf4]">01 — Bone Deep</h2>
            <p className="text-xs text-[#8b9cb3]">
              58M · DFI with osteomyelitis · Bacteremia · CKD 3b · Low-risk PCN allergy
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Pharmacy', 'ID', 'Stewardship'].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#b8c5d6] leading-relaxed">
              Empiric coverage → renal adjustment → de-escalation → duration → OPAT monitoring.
            </p>
          </div>
          <div className="border-t border-[#2a3544] px-5 py-3 flex justify-end">
            <span className="text-sm font-medium text-[#4a9ead]">Accept Consult →</span>
          </div>
        </button>

        <div className="bg-[#1a222d] border border-[#2a3544] rounded-xl overflow-hidden opacity-50 cursor-not-allowed pointer-events-none">
          <div className="bg-[#151c26] px-5 py-3 border-b border-[#2a3544] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#8b9cb3]">
              Consult Request
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3] bg-[#2a3544]/30 uppercase font-semibold">
              Pending
            </span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <h2 className="text-lg font-bold text-[#e8edf4]">
              02 — <span className="blur-sm select-none">Redacted</span>
            </h2>
            <p className="text-xs text-[#8b9cb3]">— — —</p>
            <div className="flex flex-wrap gap-1.5">
              {['???', '???', '???'].map((tag, i) => (
                <span
                  key={i}
                  className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#b8c5d6] leading-relaxed blur-sm select-none">— — —</p>
          </div>
          <div className="border-t border-[#2a3544] px-5 py-3 flex justify-end">
            <span className="text-sm text-[#8b9cb3]">Coming Soon</span>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-[10px] text-[#8b9cb3] uppercase tracking-widest">
        Educational simulation only — not for patient care
      </p>
    </div>
  )
}
