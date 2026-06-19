const TIER_COLORS = {
  optimal: 'text-[#3d9a6e] border-[#3d9a6e]/40 bg-[#3d9a6e]/10',
  reasonable: 'text-[#4a9ead] border-[#4a9ead]/40 bg-[#4a9ead]/10',
  suboptimal: 'text-[#c9a227] border-[#c9a227]/40 bg-[#c9a227]/10',
  risky: 'text-[#c45c5c] border-[#c45c5c]/40 bg-[#c45c5c]/10',
  acceptable: 'text-[#8b9cb3] border-[#8b9cb3]/40 bg-[#8b9cb3]/10',
}

const SEVERITY_STYLES = {
  stable: 'bg-[#3d9a6e]/20 text-[#3d9a6e] border-[#3d9a6e]/40',
  septic: 'bg-[#c45c5c]/20 text-[#c45c5c] border-[#c45c5c]/40',
  deteriorating: 'bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/40',
  improving: 'bg-[#3d9a6e]/20 text-[#4a9ead] border-[#4a9ead]/40',
}

export function getTierStyle(tier) {
  return TIER_COLORS[tier] ?? TIER_COLORS.reasonable
}

export function getSeverityStyle(severity) {
  return SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.stable
}

export function getRegimenKey(drugIds) {
  return [...drugIds].sort().join('+')
}

export function evaluateStewardship(regimen, stage, scenario) {
  if (stage === 't12') {
    const ids = regimen.map((d) => d.id)
    const hasVancoPip =
      ids.includes('vancomycin') && ids.includes('piperacillin_tazobactam')
    if (hasVancoPip) {
      return {
        tier: 'suboptimal',
        message:
          'Vancomycin + piperacillin-tazobactam in worsening AKI compounds nephrotoxicity risk. Consider interval extension, holding doses, or switching gram-positive coverage.',
      }
    }
    const hasRenallyCleared = ids.some((id) =>
      ['vancomycin', 'cefepime', 'piperacillin_tazobactam', 'daptomycin'].includes(id)
    )
    if (hasRenallyCleared) {
      return {
        tier: 'reasonable',
        message:
          'Renal function has declined to CrCl ~22. Renally cleared agents on board require dose or interval adjustment. AUC-guided vancomycin and cefepime dose reduction are priorities.',
      }
    }
    return scenario.stewardshipFeedback.empiric.default
  }

  const key = getRegimenKey(regimen.map((d) => d.id))
  const feedbackMap =
    stage === 't36' || stage === 'outcome'
      ? scenario.stewardshipFeedback.deescalation
      : scenario.stewardshipFeedback.empiric

  if (feedbackMap[key]) return feedbackMap[key]

  const primary = regimen[0]?.id
  if (primary && feedbackMap[primary]) return feedbackMap[primary]

  return feedbackMap.default
}

export function computeOutcomeTier(feedbackHistory) {
  const tiers = feedbackHistory.map((f) => f.tier)
  if (tiers.includes('risky')) return { tier: 'unsafe', label: 'Unsafe', description: 'Critical stewardship errors detected during the treatment course.' }
  if (tiers.filter((t) => t === 'optimal').length >= 2) return { tier: 'optimal', label: 'Optimal', description: 'Excellent antimicrobial stewardship across empiric and targeted phases.' }
  if (tiers.includes('suboptimal')) return { tier: 'suboptimal', label: 'Suboptimal', description: 'Several decisions left coverage or safety gaps that could affect outcomes.' }
  return { tier: 'reasonable', label: 'Reasonable', description: 'Clinically defensible choices with room for optimization.' }
}

export function buildSparklinePath(values, width = 48, height = 16) {
  if (!values?.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = width / (values.length - 1 || 1)
  return values
    .map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 2) - 1
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
