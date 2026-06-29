/**
 * Phase-specific arena data — neutral facts for Arena Mode,
 * interpretive copy retained for Guided Mode and post-choice teaching.
 */

export const ARENA_PREMISE = {
  title: 'How Regimen Arena works',
  body: `Each case places you in a simulated infection arena — a clinical decision space where antimicrobial choices, patient factors, and evolving data interact.

Your role is stewardship strategist: choose and adjust regimens as information returns. Drug agents represent mechanisms of action deployed against the infection site. Organism tokens represent identity, susceptibility, and resistance pressure.

Clinical data, renal function, allergies, source control, and response markers modify what is possible at each step. Interpret the facts, place your orders, and refine therapy as new information arrives.`,
}

/** @type {Record<string, {
 *   stageLabel: string,
 *   cultureStatus: string,
 *   organismStatus: string,
 *   organismId: string|null,
 *   sourceControl: string,
 *   statusUpdate: string,
 *   directiveGuided?: string
 * }>} */
export const PHASE_ARENA_CONFIG = {
  phase_01: {
    stageLabel: 'T=0 — Admission',
    cultureStatus: 'Blood cultures drawn; results pending',
    organismStatus: 'Not identified',
    organismId: null,
    sourceControl: 'Surgical debridement not performed',
    statusUpdate: 'Blood cultures obtained. No microbiology results available.',
    directiveGuided:
      'Blood cultures are pending. Deploy empiric therapy based on likely organisms, severity, allergy history, renal function, and stewardship tradeoffs.',
  },
  phase_02: {
    stageLabel: 'T=12 Hours',
    cultureStatus: 'Incubating — no final identification',
    organismStatus: 'Not identified',
    organismId: null,
    sourceControl: 'Podiatry consulted; debridement scheduled',
    statusUpdate: 'SCr 2.3 mg/dL (up from 1.9). MRI confirms osteomyelitis of 5th metatarsal.',
    directiveGuided:
      'Response and toxicity markers are changing. Adjust therapy before the regimen harms the patient or misses the pathogen.',
  },
  phase_03: {
    stageLabel: 'T=36–48 Hours — Culture final',
    cultureStatus: 'Finalized — susceptibilities reported',
    organismStatus: 'Staphylococcus aureus — oxacillin susceptible',
    organismId: 'mssa',
    sourceControl: 'Debridement scheduled/in progress',
    statusUpdate: 'Blood culture: MSSA. Susceptibilities available.',
    directiveGuided:
      'New microbiology data have entered the arena. Reassess spectrum and narrow when appropriate.',
  },
  phase_04: {
    stageLabel: 'T=5–7 Days',
    cultureStatus: 'Repeat blood cultures — no growth at 72h',
    organismStatus: 'Staphylococcus aureus — oxacillin susceptible',
    organismId: 'mssa',
    sourceControl: 'Surgical debridement completed; bone biopsy MSSA',
    statusUpdate: 'Afebrile. Repeat blood cultures negative. SCr 1.7 mg/dL.',
    directiveGuided:
      'Bacteremia has cleared and source control is achieved. Plan duration, route, and monitoring for the remaining course.',
  },
  phase_05: {
    stageLabel: 'Discharge Planning',
    cultureStatus: 'Prior cultures negative; outpatient course ongoing',
    organismStatus: 'Blood culture: MSSA. Susceptibilities on file.',
    organismId: 'mssa',
    sourceControl: 'Debridement completed',
    statusUpdate: 'Afebrile ×48h. Hemodynamically stable. Repeat blood cultures negative.',
    directiveGuided:
      'Build a monitoring plan for the outpatient course. Surveillance for toxicity, relapse, and line complications remains active.',
  },
}

export const INFECTION_SITE_LABEL = 'Right foot — diabetic foot infection with bacteremia'
