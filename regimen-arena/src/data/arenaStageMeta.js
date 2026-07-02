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
    stageLabel: 'T=12 Hours — Imaging & Cultures',
    cultureStatus: 'Blood cultures positive — identification pending',
    organismStatus: 'Not identified',
    organismId: null,
    sourceControl: 'Abscess identified; source control not yet achieved',
    statusUpdate: 'MRI confirms osteomyelitis with abscess. Blood cultures positive.',
    directiveGuided:
      'New imaging and culture data have arrived. Review the clinical course as information evolves.',
  },
  phase_03: {
    stageLabel: 'T=24 Hours — Source Control',
    cultureStatus: 'Blood cultures positive',
    organismStatus: 'Not identified',
    organismId: null,
    sourceControl: 'Source control decision required',
    statusUpdate: 'Persistent drainage and systemic signs. Surgical consult available.',
    directiveGuided:
      'Deep infection with bacteremia requires source control. Decide on debridement timing.',
  },
  phase_04: {
    stageLabel: 'T=36 Hours — Renal Dosing',
    cultureStatus: 'Blood cultures positive — ID pending',
    organismStatus: 'Not identified',
    organismId: null,
    sourceControl: 'Per prior source-control decision',
    statusUpdate: 'SCr 2.3 mg/dL. Renal dose adjustment may be needed.',
    directiveGuided:
      'Response and toxicity markers are changing. Adjust therapy before the regimen harms the patient.',
  },
  phase_05: {
    stageLabel: 'T=48 Hours — Culture final',
    cultureStatus: 'Finalized — susceptibilities reported',
    organismStatus: 'Staphylococcus aureus — oxacillin susceptible',
    organismId: 'mssa',
    sourceControl: 'Per prior source-control decision',
    statusUpdate: 'Blood culture: MSSA. Susceptibilities available.',
    directiveGuided:
      'New microbiology data have entered the arena. Reassess spectrum and narrow when appropriate.',
  },
  phase_06: {
    stageLabel: 'T=5–7 Days — Clinical Response',
    cultureStatus: 'Repeat cultures per clinical course',
    organismStatus: 'Staphylococcus aureus — oxacillin susceptible',
    organismId: 'mssa',
    sourceControl: 'Per prior source-control decision',
    statusUpdate: 'Repeat cultures, wound status, and renal trend available.',
    directiveGuided:
      'Monitor clinical response. Consequences of prior decisions emerge through labs and exam.',
  },
  phase_07: {
    stageLabel: 'T=7–10 Days — Duration & Route',
    cultureStatus: 'Per clinical course',
    organismStatus: 'Staphylococcus aureus — oxacillin susceptible',
    organismId: 'mssa',
    sourceControl: 'Per prior source-control decision',
    statusUpdate: 'Plan duration, route, and OPAT feasibility.',
    directiveGuided:
      'Plan duration, route, and monitoring for the remaining course.',
  },
  phase_08: {
    stageLabel: 'Discharge Planning',
    cultureStatus: 'Prior cultures per clinical course',
    organismStatus: 'Blood culture: MSSA. Susceptibilities on file.',
    organismId: 'mssa',
    sourceControl: 'Per prior source-control decision',
    statusUpdate: 'Outpatient course planning underway.',
    directiveGuided:
      'Build a monitoring plan for the outpatient course. Surveillance for toxicity, relapse, and line complications remains active.',
  },
}

export const INFECTION_SITE_LABEL = 'Right foot — diabetic foot infection with bacteremia'
