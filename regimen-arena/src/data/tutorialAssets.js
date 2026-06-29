const VISUAL_BASE = '/assets/visuals'

/** Stewardship Lead tutorial / briefing image registry */
export const TUTORIAL_ASSETS = {
  stewardshipLeadDefault: {
    src: `${VISUAL_BASE}/Player-character-transparent.png`,
    alt: 'Stewardship Lead character holding a clinical tablet.',
    theme: 'default',
  },
  arenaOverview: {
    src: `${VISUAL_BASE}/tutorial-animation-1-transparent.png`,
    alt: 'Stewardship Lead presenting an arena overview interface.',
    theme: 'arena-overview',
  },
  cultureData: {
    src: `${VISUAL_BASE}/tutorial-animation-2-transparent.png`,
    alt: 'Stewardship Lead reviewing culture and susceptibility data.',
    theme: 'culture-data',
  },
  monitoring: {
    src: `${VISUAL_BASE}/tutorial-animation-3-transparent.png`,
    alt: 'Stewardship Lead reviewing monitoring labs and toxicity risk.',
    theme: 'monitoring',
  },
  regimenPlan: {
    src: `${VISUAL_BASE}/tutorial-animation-4-transparent.png`,
    alt: 'Stewardship Lead reviewing regimen planning and de-escalation pathways.',
    theme: 'regimen-plan',
  },
}

/**
 * @param {keyof typeof TUTORIAL_ASSETS | string | undefined} key
 * @returns {{ src: string, alt: string, theme: string }}
 */
export function getTutorialImage(key) {
  if (key && TUTORIAL_ASSETS[key]) return TUTORIAL_ASSETS[key]
  return TUTORIAL_ASSETS.stewardshipLeadDefault
}
