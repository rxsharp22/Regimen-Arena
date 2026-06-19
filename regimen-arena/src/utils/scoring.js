const SCORE_DIMENSIONS = [
  'coverage',
  'safety',
  'stewardship',
  'dosing',
  'deescalation',
  'duration',
  'monitoring',
  'source_control',
]

export const INITIAL_SCORE = Object.fromEntries(SCORE_DIMENSIONS.map((d) => [d, 0]))

export const SCORE_MAXES = Object.fromEntries(SCORE_DIMENSIONS.map((d) => [d, 10]))

export function applyScoreModifiers(score, modifiers = {}) {
  const next = { ...score }
  for (const [dimension, delta] of Object.entries(modifiers)) {
    if (dimension in next) {
      next[dimension] = Math.max(0, Math.min(SCORE_MAXES[dimension], next[dimension] + delta))
    }
  }
  return next
}

export function sumAllDimensions(score) {
  return SCORE_DIMENSIONS.reduce((sum, d) => sum + (score[d] ?? 0), 0)
}

export function sumAllMaxes(maxes = SCORE_MAXES) {
  return SCORE_DIMENSIONS.reduce((sum, d) => sum + (maxes[d] ?? 0), 0)
}

export function computeOutcomeTier(score, scoreMaxes, criticalFlags = []) {
  if (criticalFlags.length > 0) {
    return 'unsafe'
  }

  const total = sumAllDimensions(score)
  const max = sumAllMaxes(scoreMaxes)
  const pct = max > 0 ? total / max : 0

  if (pct >= 0.85) return 'optimal'
  if (pct >= 0.65) return 'reasonable'
  if (pct >= 0.45) return 'suboptimal'
  return 'unsafe'
}

export const OUTCOME_TIER_LABELS = {
  optimal: 'Optimal',
  reasonable: 'Reasonable',
  suboptimal: 'Suboptimal',
  unsafe: 'Unsafe',
}

export const OUTCOME_TIER_COLORS = {
  optimal: 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10',
  reasonable: 'text-[#3b82f6] border-[#3b82f6]/40 bg-[#3b82f6]/10',
  suboptimal: 'text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10',
  unsafe: 'text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10',
}
