function DataRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-[#2a3544]/50 last:border-0">
      <span className="text-xs text-[#8b9cb3] shrink-0">{label}</span>
      <span className={`text-sm text-right ${highlight ? 'text-[#c9a227] font-medium' : 'text-[#e8edf4]'}`}>
        {value}
      </span>
    </div>
  )
}

function SectionCard({ title, children, accent }) {
  return (
    <section className={`bg-[#151c26] border border-[#2a3544] rounded-lg overflow-hidden ${accent ?? ''}`}>
      <header className="px-4 py-2.5 border-b border-[#2a3544] bg-[#1a222d]">
        <h3 className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">{title}</h3>
      </header>
      <div className="px-4 py-3">{children}</div>
    </section>
  )
}

export default function ScenarioIntro({ scenario, patient, onBegin }) {
  const sexLabel = patient.sex === 'male' ? 'Male' : patient.sex === 'female' ? 'Female' : patient.sex

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="text-center space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead]">Scenario 01</p>
        <h1 className="text-3xl font-bold tracking-tight">{scenario.title}</h1>
        <p className="text-sm text-[#8b9cb3] max-w-2xl mx-auto leading-relaxed">{scenario.synopsis}</p>
      </header>

      <article className="bg-[#1a222d] border border-[#2a3544] rounded-xl panel-glow overflow-hidden">
        <header className="px-6 py-4 border-b border-[#2a3544] bg-[#151c26] flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-1">Patient</p>
            <h2 className="text-2xl font-bold">
              {patient.name}
              <span className="text-[#8b9cb3] font-normal text-lg ml-2">
                {patient.age} y/o {sexLabel}
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded border border-[#c45c5c]/40 text-[#c45c5c] bg-[#c45c5c]/10 uppercase font-semibold tracking-wide">
              {scenario.severity}
            </span>
            <span className="text-xs text-[#8b9cb3]">{patient.weight_kg} kg</span>
          </div>
        </header>

        <div className="p-6 space-y-4">
          <SectionCard title="Presentation">
            <p className="text-sm text-[#b8c5d6] leading-relaxed">{patient.presentation}</p>
            <p className="text-xs text-[#8b9cb3] mt-3 leading-relaxed border-t border-[#2a3544]/50 pt-3">
              <span className="text-[#4a9ead] font-medium">Imaging: </span>
              {patient.imaging}
            </p>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Vitals">
              <DataRow label="Temperature" value={`${patient.vitals.temp_c} °C`} />
              <DataRow label="Heart Rate" value={`${patient.vitals.hr} bpm`} />
              <DataRow label="Blood Pressure" value={`${patient.vitals.bp} mmHg`} />
              <DataRow label="Respiratory Rate" value={`${patient.vitals.rr} /min`} />
              <DataRow label="SpO₂" value={`${patient.vitals.spo2_pct}%`} />
            </SectionCard>

            <SectionCard title="Admission Labs">
              <DataRow label="WBC" value={`${patient.labs.wbc} ×10³/µL`} highlight />
              <DataRow label="SCr" value={`${patient.labs.scr} mg/dL`} />
              <DataRow label="Est. CrCl" value={`${patient.labs.crcl_estimated} mL/min`} />
              <DataRow label="Glucose" value={`${patient.labs.glucose} mg/dL`} highlight />
              <DataRow label="Lactate" value={`${patient.labs.lactate} mmol/L`} />
              <DataRow label="CRP" value={patient.labs.crp} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Past Medical History">
              <ul className="space-y-1.5">
                {patient.pmh.map((item) => (
                  <li key={item} className="text-sm text-[#b8c5d6] flex gap-2">
                    <span className="text-[#4a9ead] shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Home Medications">
              <ul className="space-y-1.5">
                {patient.home_meds.map((med) => (
                  <li key={med} className="text-sm text-[#b8c5d6] flex gap-2">
                    <span className="text-[#4a9ead] shrink-0">•</span>
                    {med}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard title="Allergies" accent="border-[#c9a227]/30">
            {patient.allergies.map((allergy) => (
              <div key={allergy.allergen} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-[#c9a227]">{allergy.allergen}</span>
                <span className="text-sm text-[#b8c5d6]">{allergy.reaction}</span>
                <span className="text-xs text-[#8b9cb3]">
                  ({allergy.onset}; {allergy.risk_level} risk)
                </span>
              </div>
            ))}
          </SectionCard>
        </div>
      </article>

      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBegin}
          className="px-8 py-3 rounded-lg text-sm font-semibold bg-[#4a9ead]/20 border border-[#4a9ead]/50 text-[#4a9ead] hover:bg-[#4a9ead]/30 transition-colors shadow-[0_0_16px_rgba(74,158,173,0.15)]"
        >
          Begin Scenario
        </button>
        <p className="text-[10px] text-[#8b9cb3] uppercase tracking-widest">
          Educational simulation only — not for patient care
        </p>
      </div>
    </div>
  )
}
