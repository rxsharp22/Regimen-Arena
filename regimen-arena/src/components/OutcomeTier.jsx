import { OUTCOME_TIER_COLORS, OUTCOME_TIER_LABELS } from '../utils/scoring'

export default function OutcomeTier({ tier }) {
  return (
    <div className={`text-center p-6 rounded-xl border ${OUTCOME_TIER_COLORS[tier] ?? OUTCOME_TIER_COLORS.reasonable}`}>
      <p className="text-[10px] uppercase tracking-widest mb-2 opacity-80">Outcome Tier</p>
      <h2 className="text-4xl font-bold">{OUTCOME_TIER_LABELS[tier] ?? tier}</h2>
    </div>
  )
}
