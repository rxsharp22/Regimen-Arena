import {
  STEWARDSHIP_TIER_LABELS,
  PATIENT_OUTCOME_LABELS,
  ATTRIBUTION_LABELS,
} from '../simulation/boneDeep/debrief'

const STEWARDSHIP_COLORS = {
  excellent: 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10',
  strong: 'text-[#3d9a6e] border-[#3d9a6e]/40 bg-[#3d9a6e]/10',
  adequate: 'text-[#3b82f6] border-[#3b82f6]/40 bg-[#3b82f6]/10',
  concerning: 'text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10',
  unsafe: 'text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10',
}

const OUTCOME_COLORS = {
  resolved: 'text-[#3d9a6e] border-[#3d9a6e]/40 bg-[#3d9a6e]/10',
  complex_recovery: 'text-[#3b82f6] border-[#3b82f6]/40 bg-[#3b82f6]/10',
  readmitted: 'text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10',
  icu_transfer: 'text-[#c45c5c] border-[#c45c5c]/40 bg-[#c45c5c]/10',
  death: 'text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10',
}

function SummaryCard({ label, value, colorClass }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${colorClass}`}>
      <p className="text-[10px] uppercase tracking-widest mb-1 opacity-80">{label}</p>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
    </div>
  )
}

export default function DebriefOutcomeSummary({ assessment }) {
  if (!assessment) return null

  const stewardshipColor =
    STEWARDSHIP_COLORS[assessment.stewardshipPerformance] ?? STEWARDSHIP_COLORS.adequate
  const outcomeColor = OUTCOME_COLORS[assessment.patientOutcome] ?? OUTCOME_COLORS.complex_recovery

  return (
    <div className="space-y-4">
      {assessment.headline && (
        <p className="text-sm text-[#b8c5d6] text-center leading-relaxed px-2">
          {assessment.headline}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          label="Stewardship Performance"
          value={STEWARDSHIP_TIER_LABELS[assessment.stewardshipPerformance] ?? assessment.stewardshipPerformance}
          colorClass={stewardshipColor}
        />
        <SummaryCard
          label="Patient Outcome"
          value={PATIENT_OUTCOME_LABELS[assessment.patientOutcome] ?? assessment.patientOutcome}
          colorClass={outcomeColor}
        />
        <div className="rounded-xl border border-[#2a3544] bg-[#151c26] p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-1">Outcome Attribution</p>
          <p className="text-sm font-semibold text-[#e8edf4] leading-snug">
            {ATTRIBUTION_LABELS[assessment.outcomeAttribution] ?? assessment.outcomeAttribution}
          </p>
        </div>
      </div>

      {assessment.attributionSummary && (
        <p className="text-sm text-[#8b9cb3] text-center leading-relaxed px-2">
          {assessment.attributionSummary}
        </p>
      )}
    </div>
  )
}
