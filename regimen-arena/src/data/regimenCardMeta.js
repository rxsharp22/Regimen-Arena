/**
 * Clinical presentation metadata for regimen selection cards.
 * Arena Mode uses neutralLabel pre-decision; intent/coverage/flags for Guided Mode
 * and post-choice teaching.
 */

export const drugMechanismLabels = {
  vancomycin: 'Cell-wall precursor binder',
  cefepime: 'Beta-lactam cell-wall agent',
  piperacillin_tazobactam: 'Beta-lactam + beta-lactamase inhibitor',
  daptomycin: 'Calcium-activated membrane disruptor',
  cefazolin: 'Beta-lactam cell-wall agent',
  meropenem: 'Carbapenem beta-lactam',
  linezolid: '50S protein synthesis inhibitor',
  nafcillin: 'Penicillinase-resistant beta-lactam',
  oxacillin: 'Penicillinase-resistant beta-lactam',
  tmp_smx: 'Folate pathway inhibitor',
}

/** @type {Record<string, {
 *   neutralLabel: string,
 *   intent: string,
 *   coverage: string[],
 *   monitoringFlags: string[],
 *   teachingNotes?: string
 * }>} */
export const regimenOptionMeta = {
  opt_vanco_pip: {
    neutralLabel: 'Glycopeptide + beta-lactam/BLI combination',
    intent: 'Broad empiric coverage',
    coverage: ['MRSA', 'MSSA', 'Gram-negative', 'Pseudomonas', 'Anaerobes'],
    monitoringFlags: ['Renal dosing', 'Nephrotoxicity signal', 'Broad-spectrum pressure'],
    teachingNotes:
      'Provides broad gram-positive and gram-negative coverage including MRSA and Pseudomonas. The vancomycin + piperacillin-tazobactam pairing carries a well-characterized nephrotoxicity signal — especially relevant with baseline CKD and worsening renal function.',
  },
  opt_vanco_cefepime: {
    neutralLabel: 'Glycopeptide + 4th-generation cephalosporin',
    intent: 'MRSA + antipseudomonal coverage',
    coverage: ['MRSA', 'MSSA', 'Gram-negative', 'Pseudomonas'],
    monitoringFlags: ['Renal dosing', 'Vancomycin monitoring', 'Cefepime neurotoxicity caution'],
    teachingNotes:
      'Covers MRSA and broad gram-negatives including Pseudomonas while avoiding the vancomycin + pip-tazo nephrotoxicity interaction. Cefepime requires renal dose adjustment at reduced CrCl.',
  },
  opt_vanco_mono: {
    neutralLabel: 'Glycopeptide monotherapy',
    intent: 'MRSA-focused, limited Gram-negative coverage',
    coverage: ['MRSA', 'MSSA', 'Enterococcus'],
    monitoringFlags: ['Limited Gram-negative coverage', 'Vancomycin monitoring'],
    teachingNotes:
      'Covers gram-positives including MRSA but lacks routine gram-negative coverage for a polymicrobial diabetic foot source. Vancomycin AUC monitoring applies.',
  },
  opt_dapto_cefepime: {
    neutralLabel: 'Lipopeptide + 4th-generation cephalosporin',
    intent: 'Alternative MRSA agent + antipseudomonal coverage',
    coverage: ['MRSA', 'MSSA', 'VRE', 'Gram-negative', 'Pseudomonas'],
    monitoringFlags: ['CPK monitoring', 'Not for pneumonia', 'Renal dosing'],
    teachingNotes:
      'Daptomycin is inactivated by pulmonary surfactant and is not for pneumonia. Baseline and weekly CK monitoring required. Provides an alternative gram-positive strategy with cefepime for gram-negatives.',
  },
  opt_cefazolin_mono: {
    neutralLabel: 'First-generation cephalosporin',
    intent: 'Focused MSSA / streptococcal option',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Not MRSA', 'Focused coverage', 'Allergy history matters'],
    teachingNotes:
      'Excellent MSSA agent once confirmed, but lacks MRSA coverage for empiric bacteremia with osteomyelitis. Penicillin allergy history should be reconciled before beta-lactam use.',
  },
  opt_meropenem_vanco: {
    neutralLabel: 'Carbapenem + glycopeptide combination',
    intent: 'Maximum-spectrum empiric coverage',
    coverage: ['MRSA', 'MSSA', 'Gram-negative', 'Pseudomonas', 'Anaerobes', 'ESBL'],
    monitoringFlags: ['Carbapenem stewardship alert', 'Renal dosing', 'Broad-spectrum pressure'],
    teachingNotes:
      'Extremely broad empiric spectrum including ESBL-capable organisms. Without documented MDR gram-negative risk factors, carbapenem empiric use represents unnecessary stewardship pressure.',
  },
  opt_linezolid_mono: {
    neutralLabel: 'Oxazolidinone monotherapy',
    intent: 'Gram-positive-only, bacteriostatic option',
    coverage: ['MRSA', 'VRE'],
    monitoringFlags: ['No Gram-negative coverage', 'Bacteriostatic for bacteremia', 'CBC monitoring'],
    teachingNotes:
      'Linezolid is bacteriostatic and lacks robust data for Staphylococcal bacteremia as monotherapy. No gram-negative coverage for a likely polymicrobial foot infection.',
  },

  dp03_cefazolin: {
    neutralLabel: 'First-generation cephalosporin',
    intent: 'Preferred MSSA de-escalation',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Beta-lactam superior to vanco', 'Allergy history matters', 'Renal dosing'],
    teachingNotes:
      'Beta-lactams are clinically superior to vancomycin for MSSA bacteremia. Cefazolin is preferred given tolerability and the low-risk penicillin allergy phenotype on file.',
  },
  dp03_nafcillin: {
    neutralLabel: 'Antistaphylococcal penicillin',
    intent: 'Active antistaphylococcal penicillin',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Penicillin-class drug', 'Hepatotoxicity risk', 'Allergy history matters'],
    teachingNotes:
      'Active for MSSA bacteremia but higher hepatotoxicity and phlebitis burden than cefazolin. Direct penicillin-class drug — allergy history must be reconciled.',
  },
  dp03_oxacillin: {
    neutralLabel: 'Antistaphylococcal penicillin',
    intent: 'Antistaphylococcal penicillin alternative',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Penicillin-class drug', 'Hepatotoxicity risk', 'Allergy history matters'],
    teachingNotes:
      'Equivalent to nafcillin for MSSA. Same adverse-effect profile compared with cefazolin; penicillin allergy documentation required.',
  },
  dp03_continue_vancomycin: {
    neutralLabel: 'Continue glycopeptide',
    intent: 'Maintain current gram-positive agent',
    coverage: ['MRSA', 'MSSA'],
    monitoringFlags: ['Suboptimal for MSSA bacteremia', 'Vancomycin monitoring', 'Missed de-escalation'],
    teachingNotes:
      'Susceptibility to vancomycin does not make it the preferred MSSA agent. Failure to de-escalate to a beta-lactam when cultures support it is a stewardship miss.',
  },
  dp03_daptomycin: {
    neutralLabel: 'Cyclic lipopeptide',
    intent: 'Beta-lactam-sparing MSSA option',
    coverage: ['MRSA', 'MSSA', 'VRE'],
    monitoringFlags: ['CPK monitoring', 'Suboptimal allergy avoidance', 'Renal dosing'],
    teachingNotes:
      'Acceptable when beta-lactams are truly contraindicated. The documented childhood rash is a low-risk allergy phenotype — avoiding beta-lactams forfeits superior MSSA outcomes.',
  },
  dp03_linezolid: {
    neutralLabel: 'Oxazolidinone',
    intent: 'Oral-capable gram-positive agent',
    coverage: ['MRSA', 'VRE'],
    monitoringFlags: ['Bacteriostatic for bacteremia', 'Not for active bacteremia', 'CBC monitoring'],
    teachingNotes:
      'Linezolid is not appropriate for active Staphylococcal bacteremia regardless of susceptibility. Bacteriostatic activity and higher failure rates make this a critical error.',
  },
  dp03_tmp_smx: {
    neutralLabel: 'Folate synthesis inhibitor',
    intent: 'Oral step-down candidate',
    coverage: ['MSSA', 'Strep'],
    monitoringFlags: ['Premature for active bacteremia', 'Hyperkalemia risk', 'Renal dosing'],
    teachingNotes:
      'TMP-SMX has a role in oral step-down for bone infections but is premature as primary therapy before adequate IV bactericidal treatment of active bacteremia.',
  },
}

export function getMechanismLabel(drugId) {
  return drugMechanismLabels[drugId] ?? null
}

export function getRegimenOptionMeta(optionId) {
  return regimenOptionMeta[optionId] ?? null
}
