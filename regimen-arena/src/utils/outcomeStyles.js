export const OUTCOME_STYLES = {
  optimal: 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10',
  reasonable: 'text-[#3b82f6] border-[#3b82f6]/40 bg-[#3b82f6]/10',
  acceptable: 'text-[#84cc16] border-[#84cc16]/40 bg-[#84cc16]/10',
  suboptimal: 'text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10',
  excessive_spectrum: 'text-[#f97316] border-[#f97316]/40 bg-[#f97316]/10',
  unsafe: 'text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10',
}

export function getOutcomeStyle(outcome) {
  return OUTCOME_STYLES[outcome] ?? OUTCOME_STYLES.reasonable
}
