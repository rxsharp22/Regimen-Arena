const STABILITY = {
  critical: { label: 'Critical', color: '#c45c5c' },
  guarded: { label: 'Guarded', color: '#c9a227' },
  improving: { label: 'Improving', color: '#4a9ead' },
  stable: { label: 'Stable', color: '#3d9a6e' },
}

const ADVERSE_EVENT_TYPES = new Set(['toxicity_event', 'treatment_failure', 'relapse_event'])

function trendArrow(trend) {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

function trendColor(trend, invert = false) {
  const isUp = trend === 'up'
  const bad = invert ? !isUp : isUp
  if (trend === 'stable') return '#8b9cb3'
  return bad ? '#c45c5c' : '#3d9a6e'
}

function VitalItem({ label, value, unit, trend, invertTrend = false }) {
  return (
    <span className="whitespace-nowrap">
      {label}: {value}
      {unit}
      <span style={{ color: trendColor(trend, invertTrend) }} className="ml-0.5">
        {trendArrow(trend)}
      </span>
    </span>
  )
}

export default function PatientStatusPanel({
  conditionalEvents = [],
  clinicalSnapshot = null,
}) {
  const snapshot = clinicalSnapshot
  if (!snapshot) return null

  const hasAdverseEvent = conditionalEvents.some((e) => ADVERSE_EVENT_TYPES.has(e.type))
  const stabilityKey = hasAdverseEvent ? 'critical' : snapshot.stability
  const stability = STABILITY[stabilityKey] ?? STABILITY.guarded
  const statusText = hasAdverseEvent
    ? `${snapshot.statusText} · Adverse event on chart.`
    : snapshot.statusText
  const { vitals, trend } = snapshot

  return (
    <div className="relative bg-[#151c26] border border-[#2a3544] rounded-lg px-4 py-3 mb-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            className="text-xs font-semibold uppercase tracking-wide shrink-0"
            style={{ color: stability.color }}
          >
            {stability.label}
          </span>
          <span className="text-xs text-[#8b9cb3]">{statusText}</span>
        </div>
        <div className="flex flex-wrap gap-x-1 gap-y-1 text-xs tabular-nums text-[#e8edf4] shrink-0">
          <VitalItem label="T" value={vitals.temp_c} unit="°" trend={trend.temp} invertTrend />
          <span className="text-[#8b9cb3]">·</span>
          <VitalItem label="HR" value={vitals.hr} unit="" trend={trend.hr} />
          <span className="text-[#8b9cb3]">·</span>
          <VitalItem label="BP" value={vitals.bp} unit="" trend={trend.bp} invertTrend />
          <span className="text-[#8b9cb3]">·</span>
          <VitalItem label="SCr" value={vitals.scr} unit="" trend={trend.scr} />
          <span className="text-[#8b9cb3]">·</span>
          <VitalItem label="WBC" value={vitals.wbc} unit="" trend={trend.wbc} invertTrend />
        </div>
      </div>

      {(snapshot.woundStatus || snapshot.dischargeStatus) && (
        <div className="mt-2 pt-2 border-t border-[#2a3544]/50 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#b8c5d6]">
          {snapshot.woundStatus && <span>Wound: {snapshot.woundStatus}</span>}
          {snapshot.cultureStatus && <span>Cultures: {snapshot.cultureStatus}</span>}
          {snapshot.dischargeStatus && <span>Disposition: {snapshot.dischargeStatus}</span>}
        </div>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ backgroundColor: stability.color }}
      />
    </div>
  )
}
