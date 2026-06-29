/**
 * Neutral per-phase case briefings — facts only, no correct-action hints.
 */

/** @type {Record<string, {
 *   decisionPhase: string,
 *   syndrome: string,
 *   patientFactors: string[],
 *   known: string[],
 *   pending: string[]
 * }>} */
export const CASE_BRIEFINGS = {
  phase_01: {
    decisionPhase: 'Empiric antimicrobial therapy',
    syndrome: 'Diabetic foot infection with suspected osteomyelitis and bacteremia',
    patientFactors: [
      'CKD Stage 3b (baseline CrCl ~32 mL/min)',
      'Reported penicillin allergy — childhood rash',
      'Type 2 diabetes mellitus',
      'Hemodynamically unstable on presentation',
    ],
    known: [
      'Purulent foot wound with suspected bone involvement',
      'Blood cultures drawn on admission',
      'Plain film concerning for osteomyelitis; MRI pending',
    ],
    pending: [
      'Blood culture identification and susceptibilities',
      'Definitive organism and resistance profile',
    ],
  },
  phase_02: {
    decisionPhase: 'Renal dose reassessment',
    syndrome: 'Diabetic foot osteomyelitis with bacteremia — therapy ongoing',
    patientFactors: [
      'SCr rising (2.3 mg/dL; estimated CrCl ~22 mL/min)',
      'Active antimicrobial regimen from admission',
      'CKD Stage 3b baseline',
    ],
    known: [
      'MRI confirms osteomyelitis of 5th metatarsal with adjacent abscess',
      'Podiatry consulted; debridement scheduled',
      'Organism not yet identified',
    ],
    pending: [
      'Final culture and susceptibility results',
    ],
  },
  phase_03: {
    decisionPhase: 'Targeted therapy / regimen adjustment',
    syndrome: 'MSSA bacteremia with diabetic foot osteomyelitis',
    patientFactors: [
      'Reported penicillin allergy — childhood rash',
      'Recovering renal function',
      'Current empiric regimen active',
    ],
    known: [
      'Blood culture: Staphylococcus aureus, oxacillin-susceptible (MSSA)',
      'Broad susceptibilities reported',
      'Clinical signs improving',
    ],
    pending: [
      'Duration and route planning',
      'Formal allergy reconciliation documentation',
    ],
  },
  phase_04: {
    decisionPhase: 'Duration and route planning',
    syndrome: 'MSSA osteomyelitis — source control achieved',
    patientFactors: [
      'Diabetic host',
      'Renal function improving (SCr 1.7 mg/dL)',
      'Prolonged IV therapy course anticipated',
    ],
    known: [
      'Repeat blood cultures negative at 72 hours',
      'Surgical debridement completed',
      'Bone biopsy: MSSA, susceptibilities match blood isolates',
    ],
    pending: [
      'Outpatient monitoring and transition plan',
    ],
  },
  phase_05: {
    decisionPhase: 'Outpatient monitoring plan',
    syndrome: 'MSSA osteomyelitis — outpatient antimicrobial course',
    patientFactors: [
      'Recent AKI with improving renal function',
      'Prolonged antimicrobial exposure',
      'OPAT or oral step-down in progress',
    ],
    known: [
      'Afebrile ×48h; hemodynamically stable',
      'Repeat blood cultures negative',
      'Active antimicrobial regimen selected',
    ],
    pending: [
      'Structured outpatient surveillance elements',
    ],
  },
}

export function getCaseBriefing(phaseId) {
  return CASE_BRIEFINGS[phaseId] ?? null
}
