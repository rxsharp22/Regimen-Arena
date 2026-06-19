import { SCORE_DIMENSIONS } from '../utils/scoring'

const DIMENSION_LABELS = {
  coverage: 'Coverage',
  safety: 'Safety',
  stewardship: 'Stewardship',
  dosing: 'Dosing',
  deescalation: 'De-escalation',
  duration: 'Duration',
  monitoring: 'Monitoring',
  source_control: 'Source Control',
}

export default function DimensionBars({ score, scoreMaxes }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
        Score by Dimension
      </h3>
      {SCORE_DIMENSIONS.map((dim) => {
        const value = score[dim] ?? 0
        const max = scoreMaxes[dim] ?? 10
        const pct = max > 0 ? (value / max) * 100 : 0
        return (
          <div key={dim}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#b8c5d6]">{DIMENSION_LABELS[dim]}</span>
              <span className="text-[#8b9cb3] tabular-nums">
                {value}/{max}
              </span>
            </div>
            <div className="h-2 bg-[#0f1419] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#4a9ead] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
