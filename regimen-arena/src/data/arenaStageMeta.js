/**
 * Phase-specific arena framing copy and stage labels.
 * Clinical terms first; light arena metaphor second.
 */

export const ARENA_PREMISE = {
  title: 'How Regimen Arena works',
  body: `Each case places you in a simulated infection arena — a clinical decision space where antimicrobial choices, patient factors, and evolving data interact.

Your role is stewardship strategist: choose and adjust regimens as information returns. Drug agents represent mechanisms of action deployed against the infection site. Organism tokens represent identity, susceptibility, and resistance pressure.

Broad empiric therapy may stabilize the patient, but it carries toxicity, resistance, and monitoring tradeoffs. Cultures, renal function, allergies, source control, and response markers all modify the arena. The best regimen fits the patient now and can be narrowed when better data arrive.`,
}

/** @type {Record<string, { stageLabel: string, cultureStatus: string, organismStatus: string, organismId: string|null, directive: string, sourceControl: string }>} */
export const PHASE_ARENA_CONFIG = {
  phase_01: {
    stageLabel: 'Empiric therapy — cultures pending',
    cultureStatus: 'Pending — blood cultures drawn',
    organismStatus: 'Unknown',
    organismId: null,
    sourceControl: 'Not yet achieved — wound debridement pending',
    directive:
      'Blood cultures are pending. Deploy empiric therapy based on likely organisms, severity, allergy history, renal function, and stewardship tradeoffs.',
  },
  phase_02: {
    stageLabel: 'Monitoring — renal function shifting',
    cultureStatus: 'Incubating — preliminary data only',
    organismStatus: 'Not yet identified',
    organismId: null,
    sourceControl: 'Planned — podiatry debridement scheduled',
    directive:
      'Response and toxicity markers are changing. Adjust therapy before the regimen harms the patient or misses the pathogen.',
  },
  phase_03: {
    stageLabel: 'De-escalation — organism identified',
    cultureStatus: 'Finalized — susceptibilities available',
    organismStatus: 'MSSA (oxacillin-susceptible)',
    organismId: 'mssa',
    sourceControl: 'In progress — debridement underway',
    directive:
      'New microbiology data have entered the arena. Reassess spectrum and narrow when appropriate.',
  },
  phase_04: {
    stageLabel: 'Duration & transition planning',
    cultureStatus: 'Cleared — repeat cultures negative',
    organismStatus: 'MSSA — source controlled',
    organismId: 'mssa',
    sourceControl: 'Achieved — surgical debridement complete',
    directive:
      'Bacteremia has cleared and source control is achieved. Plan duration, route, and monitoring for the remaining course.',
  },
  phase_05: {
    stageLabel: 'Discharge & outpatient monitoring',
    cultureStatus: 'Cleared',
    organismStatus: 'MSSA — treated',
    organismId: 'mssa',
    sourceControl: 'Achieved',
    directive:
      'Build a monitoring plan for the outpatient course. Surveillance for toxicity, relapse, and line complications remains active.',
  },
}

export const INFECTION_SITE_LABEL = 'Right foot — diabetic foot osteomyelitis with bacteremia'
