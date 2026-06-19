import { buildSparklinePath, getSeverityStyle } from '../utils/stewardship'

function Sparkline({ values, color = '#4a9ead' }) {
  const path = buildSparklinePath(values)
  return (
    <svg width="48" height="16" className="inline-block ml-2">
      <path d={path} className="sparkline" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function VitalItem({ label, value, unit }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-[#2a3544]/60 last:border-0">
      <span className="text-[#8b9cb3] text-xs uppercase tracking-wide">{label}</span>
      <span className="font-semibold text-sm tabular-nums">
        {value}
        {unit && <span className="text-[#8b9cb3] font-normal text-xs ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

export default function PatientStatusPanel({ patient, scenario, currentStage }) {
  const vitals = scenario.vitalsByStage[currentStage]
  const labs = scenario.labsByStage[currentStage]
  const severity = scenario.severityByStage[currentStage]
  const alerts = scenario.alertsByStage[currentStage] ?? []

  return (
    <aside className="flex flex-col h-full bg-[#1a222d] border border-[#2a3544] rounded-lg panel-glow overflow-hidden">
      <header className="px-4 py-3 border-b border-[#2a3544] bg-[#151c26]">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] mb-1">Patient Status</p>
        <h2 className="text-lg font-semibold">
          {patient.name} · {patient.age}{patient.sex === 'male' ? 'M' : 'F'}
        </h2>
        <p className="text-xs text-[#8b9cb3] mt-0.5">{patient.weight_kg} kg</p>
      </header>

      <div className="px-4 py-3 border-b border-[#2a3544]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#8b9cb3] uppercase tracking-wide">Severity</span>
          <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded border ${getSeverityStyle(severity)}`}>
            {severity}
          </span>
        </div>
        <p className="text-xs text-[#8b9cb3] leading-relaxed line-clamp-3">{patient.presentation}</p>
      </div>

      <div className="px-4 py-3 border-b border-[#2a3544]">
        <h3 className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-2">Vitals</h3>
        <VitalItem label="HR" value={vitals.hr} unit="bpm" />
        <VitalItem label="BP" value={vitals.bp} unit="mmHg" />
        <VitalItem label="RR" value={vitals.rr} unit="/min" />
        <VitalItem label="Temp" value={vitals.temp} unit="°C" />
        <VitalItem label="SpO₂" value={vitals.spo2} unit="%" />
      </div>

      <div className="px-4 py-3 border-b border-[#2a3544]">
        <h3 className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-2">Lab Trends</h3>
        <div className="flex justify-between items-center py-1.5">
          <span className="text-xs text-[#8b9cb3]">WBC</span>
          <span className="text-sm font-semibold tabular-nums flex items-center">
            {labs.wbc}
            <Sparkline values={labs.wbcTrend} color="#4a9ead" />
          </span>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span className="text-xs text-[#8b9cb3]">SCr</span>
          <span className="text-sm font-semibold tabular-nums flex items-center">
            {labs.scr}
            <Sparkline values={labs.scrTrend} color={labs.scr > 2 ? '#c45c5c' : '#3d9a6e'} />
          </span>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="px-4 py-3 flex-1">
          <h3 className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-2">Active Alerts</h3>
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert}
                className="text-xs px-2.5 py-2 rounded border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227] alert-pulse"
              >
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-4 py-3 mt-auto border-t border-[#2a3544] bg-[#151c26]">
        <h3 className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-1.5">Allergies</h3>
        {patient.allergies.map((a) => (
          <div key={a.allergen} className="text-xs">
            <span className="text-[#c9a227] font-medium">{a.allergen}</span>
            <span className="text-[#8b9cb3]"> — {a.reaction} ({a.risk_level} risk)</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
