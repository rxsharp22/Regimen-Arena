/**
 * Clinical presentation metadata for regimen selection cards.
 * Keyed by decision option id — keeps gameplay data in decisionPoints.json separate.
 */

export const drugMechanismLabels = {
  vancomycin: 'Cell-wall precursor binder',
  cefepime: 'Advanced beta-lactam wall disruptor',
  piperacillin_tazobactam: 'Beta-lactam + beta-lactamase inhibitor',
  daptomycin: 'Calcium-activated membrane disruptor',
  cefazolin: 'Focused beta-lactam wall disruptor',
  meropenem: 'Carbapenem wall disruptor',
  linezolid: '50S protein synthesis inhibitor',
  nafcillin: 'Penicillinase-resistant beta-lactam',
  oxacillin: 'Penicillinase-resistant beta-lactam',
  tmp_smx: 'Folate pathway inhibitor',
}

/** @type {Record<string, { intent: string, coverage: string[], monitoringFlags: string[] }>} */
export const regimenOptionMeta = {
  // —— Empiric regimen (DP1) ——
  opt_vanco_pip: {
    intent: 'Broad empiric coverage',
    coverage: ['MRSA', 'MSSA', 'Gram-negative', 'Pseudomonas', 'Anaerobes'],
    monitoringFlags: ['Renal dosing', 'Nephrotoxicity signal', 'Broad-spectrum pressure'],
  },
  opt_vanco_cefepime: {
    intent: 'MRSA + antipseudomonal coverage',
    coverage: ['MRSA', 'MSSA', 'Gram-negative', 'Pseudomonas'],
    monitoringFlags: ['Renal dosing', 'Vancomycin monitoring', 'Cefepime neurotoxicity caution'],
  },
  opt_vanco_mono: {
    intent: 'MRSA-focused, limited Gram-negative coverage',
    coverage: ['MRSA', 'MSSA', 'Enterococcus'],
    monitoringFlags: ['Limited Gram-negative coverage', 'Vancomycin monitoring'],
  },
  opt_dapto_cefepime: {
    intent: 'Alternative MRSA agent + antipseudomonal coverage',
    coverage: ['MRSA', 'MSSA', 'VRE', 'Gram-negative', 'Pseudomonas'],
    monitoringFlags: ['CPK monitoring', 'Not for pneumonia', 'Renal dosing'],
  },
  opt_cefazolin_mono: {
    intent: 'Focused MSSA / streptococcal option',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Not MRSA', 'Focused coverage', 'Allergy history matters'],
  },
  opt_meropenem_vanco: {
    intent: 'Maximum-spectrum empiric coverage',
    coverage: ['MRSA', 'MSSA', 'Gram-negative', 'Pseudomonas', 'Anaerobes', 'ESBL'],
    monitoringFlags: ['Carbapenem stewardship alert', 'Renal dosing', 'Broad-spectrum pressure'],
  },
  opt_linezolid_mono: {
    intent: 'Gram-positive-only, bacteriostatic option',
    coverage: ['MRSA', 'VRE'],
    monitoringFlags: ['No Gram-negative coverage', 'Bacteriostatic for bacteremia', 'CBC monitoring'],
  },

  // —— De-escalation (DP3) ——
  dp03_cefazolin: {
    intent: 'Preferred MSSA de-escalation',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Beta-lactam superior to vanco', 'Allergy history matters', 'Renal dosing'],
  },
  dp03_nafcillin: {
    intent: 'Active antistaphylococcal penicillin',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Penicillin-class drug', 'Hepatotoxicity risk', 'Allergy history matters'],
  },
  dp03_oxacillin: {
    intent: 'Antistaphylococcal penicillin alternative',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Penicillin-class drug', 'Hepatotoxicity risk', 'Allergy history matters'],
  },
  dp03_continue_vancomycin: {
    intent: 'Maintain current gram-positive agent',
    coverage: ['MRSA', 'MSSA'],
    monitoringFlags: ['Suboptimal for MSSA bacteremia', 'Vancomycin monitoring', 'Missed de-escalation'],
  },
  dp03_daptomycin: {
    intent: 'Beta-lactam-sparing MSSA option',
    coverage: ['MRSA', 'MSSA', 'VRE'],
    monitoringFlags: ['CPK monitoring', 'Suboptimal allergy avoidance', 'Renal dosing'],
  },
  dp03_linezolid: {
    intent: 'Oral-capable gram-positive agent',
    coverage: ['MRSA', 'VRE'],
    monitoringFlags: ['Bacteriostatic for bacteremia', 'Not for active bacteremia', 'CBC monitoring'],
  },
  dp03_tmp_smx: {
    intent: 'Oral step-down candidate',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Premature for active bacteremia', 'Hyperkalemia risk', 'Renal dosing'],
  },
}

export function getMechanismLabel(drugId) {
  return drugMechanismLabels[drugId] ?? null
}
