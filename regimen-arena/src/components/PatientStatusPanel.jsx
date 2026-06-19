import patientTimeline from '../data/patientTimeline.json'

const STABILITY_COLORS = {
  critical: { label: 'Critical', bar: 'bg-[#c45c5c]', text: 'text-[#c45c5c]' },
  guarded: { label: 'Guarded', bar: 'bg-[#c9a227]', text: 'text-[#c9a227]' },
  improving: { label: 'Improving', bar: 'bg-[#4a9ead]', text: 'text-[#4a9ead]' },
  stable: { label: 'Stable', bar: 'bg-[#3d9a6e]', text: 'text-[#3d9a6e]' },
}

const ADVERSE_EVENT_TYPES = new Set(['toxicity_event', 'treatment_failure', 'relapse_event'])

function trendArrow(trend) {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

function trendColor(trend) {
  if (trend === 'up') return 'text-[#c45c5c]'
  if (trend === 'down') return 'text-[#3d9a6e]'
  return 'text-[#8b9cb3]'
}

function VitalItem({ label, value, unit, trend }) {
  return (
    <span className="whitespace-nowrap">
      {label}: {value}
      {unit}
      <span className={`ml-0.5 ${trendColor(trend)}`}>{trendArrow(trend)}</span>
    </span>
  )
}

export default function PatientStatusPanel({ phaseId, conditionalEvents = [] }) {
  const base = patientTimeline[phaseId]
  if (!base) return null

  const hasAdverseEvent = conditionalEvents.some((e) => ADVERSE_EVENT_TYPES.has(e.type))
  const stability = hasAdverseEvent ? 'critical' : base.stability
  const statusText = hasAdverseEvent
    ? `${base.status_text} ⚠ Adverse event triggered.`
    : base.status_text
  const colors = STABILITY_COLORS[stability] ?? STABILITY_COLORS.guarded
  const { vitals, trend } = base

  return (
    <div className="bg-[#151c26] border border-[#2a3544] rounded-lg mb-6 overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span
              className={`text-[10px] uppercase tracking-widest font-semibold shrink-0 ${colors.text}`}
            >
              {colors.label}
            </span>
            <span className="text-xs text-[#8b9cb3]">{statusText}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs tabular-nums text-[#e8edf4] shrink-0">
            <VitalItem label="T" value={vitals.temp_c} unit="°C" trend="stable" />
            <VitalItem label="HR" value={vitals.hr} unit="" trend={trend.hr} />
            <VitalItem label="BP" value={vitals.bp} unit="" trend={trend.bp} />
            <VitalItem label="SCr" value={vitals.scr} unit="" trend={trend.scr} />
          </div>
        </div>
      </div>
      <div className={`h-1 ${colors.bar}`} />
    </div>
  )
}
