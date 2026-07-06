/** Weighted clinical variability for Bone Deep — constrained by hidden state. */

export function weightedChoice(options, rng = Math.random) {
  if (!options?.length) return null
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  let roll = rng() * total
  for (const option of options) {
    roll -= option.weight
    if (roll <= 0) return option
  }
  return options[options.length - 1]
}

/**
 * Roll daptomycin CK trajectory when patient is on daptomycin.
 * Returns { tier, narrative, requiresResponse, ckMultiplier }
 */
export function rollDaptoToxicity(state, rng = Math.random) {
  if (!state.activeTherapy?.includes('daptomycin')) return null

  let renalWeight = state.creatinine >= 2.2 ? 3 : state.creatinine >= 1.9 ? 2 : 1
  let toxicityWeight = state.toxicityBurden >= 6 ? 2 : 1
  const prolonged = state.scenarioTimeHours >= 120 ? 2 : 1

  const options = [
    {
      id: 'dapto_ck_stable',
      weight: 4,
      tier: 'stable',
      requiresResponse: false,
      narrative: 'CK remains within normal limits on current daptomycin dosing.',
    },
    {
      id: 'dapto_ck_mild',
      weight: 3 * renalWeight,
      tier: 'mild',
      requiresResponse: false,
      narrative: 'CK mildly elevated above baseline without muscle symptoms. Trending recommended.',
    },
    {
      id: 'dapto_ck_moderate',
      weight: 2 * toxicityWeight * prolonged,
      tier: 'moderate',
      requiresResponse: true,
      narrative:
        'CK rises to approximately 3× ULN. The patient reports mild proximal muscle aching. Daptomycin toxicity reassessment is needed.',
    },
    {
      id: 'dapto_ck_severe',
      weight: 1 * renalWeight * toxicityWeight,
      tier: 'severe',
      requiresResponse: true,
      narrative:
        'CK continues to rise with worsening myalgias. Inpatient team flags possible daptomycin-associated myopathy.',
    },
  ]

  return weightedChoice(options, rng)
}

export function rollVancomycinRenalVariability(state, rng = Math.random) {
  if (!state.activeTherapy?.includes('vancomycin')) return null

  const options = [
    {
      id: 'vanco_renal_stable',
      weight: state.renalDoseAdjusted ? 5 : 2,
      narrative: 'Vancomycin levels remain within target range with stable renal function.',
    },
    {
      id: 'vanco_scr_rise',
      weight: state.renalDoseAdjusted ? 2 : 4,
      narrative: 'SCr has risen further on vancomycin. AUC reassessment and dose interval review are on the chart.',
    },
    {
      id: 'vanco_subtherapeutic',
      weight: state.renalDoseAdjusted ? 1 : 2,
      narrative: 'Vancomycin exposure may be subtherapeutic after dose adjustment — levels are being rechecked.',
    },
  ]

  return weightedChoice(options, rng)
}
