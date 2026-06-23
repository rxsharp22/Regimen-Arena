import React from 'react'

export default function LandingPage({ onEnter }) {
return ( <div className="max-w-5xl mx-auto">
{/* Hero Section */} <section className="text-center py-14"> <p className="text-[10px] uppercase tracking-[0.35em] text-[#5b9cff]">
Clinical Tactical Stewardship </p>

```
    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-4">
      Regimen Arena
    </h1>

    <div className="w-32 h-px mx-auto mt-6 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

    <p className="text-lg text-[#b8c5d6] mt-6">
      Complex Cases. Competing Priorities. Your Call.
    </p>

    <p className="text-sm text-[#8b9cb3] mt-3 max-w-2xl mx-auto leading-relaxed">
      Learn antimicrobial stewardship through tactical decision-making.
      Balance efficacy, toxicity, resistance, and patient-specific factors
      while guiding therapy from empiric coverage to completion.
    </p>
  </section>

  {/* Operations Header */}
  <div className="mb-4">
    <p className="text-[10px] uppercase tracking-[0.3em] text-[#5b9cff]">
      Active Operations
    </p>
  </div>

  {/* Mission Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {/* Active Operation */}
    <button
      type="button"
      onClick={onEnter}
      className="
        text-left
        bg-[#1a222d]
        border
        border-[#344559]
        rounded-xl
        overflow-hidden
        cursor-pointer
        transition-all
        hover:border-[#5b9cff]/50
        hover:-translate-y-0.5
        hover:shadow-[0_0_20px_rgba(91,156,255,0.15)]
      "
    >
      {/* Header */}
      <div className="bg-[#151c26] px-5 py-3 border-b border-[#2a3544] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-[#8b9cb3]">
          Operation Brief
        </span>

        <span className="text-[10px] px-2 py-0.5 rounded border border-[#c45c5c]/40 text-[#c45c5c] bg-[#c45c5c]/10 uppercase font-semibold">
          High Risk
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#5b9cff]">
            Operation 01
          </p>

          <h2 className="text-2xl font-bold text-[#e8edf4] mt-1">
            Bone Deep
          </h2>
        </div>

        <p className="text-sm text-[#8b9cb3]">
          58M · Diabetic foot infection · Osteomyelitis · Bacteremia ·
          CKD 3b · Low-risk PCN allergy
        </p>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-2">
            Operational Challenges
          </p>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Bacteremia',
              'Renal Function',
              'Drug Allergy',
              'Stewardship',
            ].map((tag) => (
              <span
                key={tag}
                className="
                  text-[9px]
                  uppercase
                  tracking-wide
                  px-2
                  py-1
                  rounded
                  border
                  border-[#344559]
                  text-[#b8c5d6]
                "
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="border-l-2 border-[#5b9cff]/40 pl-3">
          <p className="text-sm text-[#d4e0ef] leading-relaxed">
            Stabilize the patient. Identify the pathogen. Optimize therapy.
            Balance efficacy, toxicity, resistance pressure, and long-term
            stewardship goals.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#2a3544] px-5 py-3 flex justify-end">
        <span className="text-sm font-semibold text-[#5b9cff]">
          Begin Encounter →
        </span>
      </div>
    </button>

    {/* Locked Operation */}
    <div className="bg-[#1a222d] border border-[#2a3544] rounded-xl overflow-hidden opacity-50 cursor-not-allowed pointer-events-none">
      <div className="bg-[#151c26] px-5 py-3 border-b border-[#2a3544] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-[#8b9cb3]">
          Operation Brief
        </span>

        <span className="text-[10px] px-2 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3] bg-[#2a3544]/30 uppercase font-semibold">
          Locked
        </span>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3]">
            Operation 02
          </p>

          <h2 className="text-2xl font-bold text-[#e8edf4]">
            <span className="blur-sm select-none">Classified</span>
          </h2>
        </div>

        <p className="text-sm text-[#8b9cb3]">
          Additional stewardship scenarios coming soon.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {['???', '???', '???'].map((tag, i) => (
            <span
              key={i}
              className="
                text-[9px]
                uppercase
                tracking-wide
                px-2
                py-1
                rounded
                border
                border-[#2a3544]
                text-[#8b9cb3]
              "
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-[#2a3544] px-5 py-3 flex justify-end">
        <span className="text-sm text-[#8b9cb3]">
          Future Deployment
        </span>
      </div>
    </div>
  </div>

  {/* Disclaimer */}
  <p className="mt-12 text-center text-[10px] text-[#8b9cb3] uppercase tracking-widest">
    Educational simulation only — not intended for patient care decisions
  </p>
</div>

)
}
