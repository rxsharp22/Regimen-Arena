/**
 * Post-choice stewardship teaching supplements.
 * Pre-choice display derives drug class from drugs.json; do not render these before selection.
 */

import { getDrugById } from '../utils/decisions'

/** @type {Record<string, { drugClass?: string, stewardshipTeaching?: string }>} */
export const optionDisplayMeta = {
  opt_vanco_pip: {
    drugClass: 'Glycopeptide + BL/BLI combination',
  },
  opt_vanco_cefepime: {
    drugClass: 'Glycopeptide + 4th-generation cephalosporin',
  },
  opt_vanco_mono: {
    drugClass: 'Glycopeptide',
  },
  opt_dapto_cefepime: {
    drugClass: 'Lipopeptide + 4th-generation cephalosporin',
  },
  opt_cefazolin_mono: {
    drugClass: 'First-generation cephalosporin',
  },
  opt_meropenem_vanco: {
    drugClass: 'Carbapenem + glycopeptide combination',
  },
  opt_linezolid_mono: {
    drugClass: 'Oxazolidinone',
  },

  dp03_cefazolin: {
    stewardshipTeaching:
      'Strong stewardship move. The organism is MSSA, blood cultures have cleared, and source control has been achieved. A focused anti-staphylococcal beta-lactam is generally preferred over continuing vancomycin when tolerated. The reported allergy history does not describe a high-risk immediate reaction or severe cutaneous reaction, so beta-lactam use should be considered rather than reflexively avoided.',
  },
  dp03_nafcillin: {
    stewardshipTeaching:
      'Clinically active for MSSA bacteremia. Antistaphylococcal penicillins carry more hepatotoxicity and phlebitis than cefazolin. This is a penicillin-class drug — reconcile the documented allergy history before use.',
  },
  dp03_oxacillin: {
    stewardshipTeaching:
      'Equivalent to nafcillin for MSSA bacteremia with similar adverse-effect considerations versus cefazolin. Reconcile the penicillin allergy history before use.',
  },
  dp03_continue_vancomycin: {
    stewardshipTeaching:
      'This is active against the isolate, but it may be a stewardship miss if the patient can receive a beta-lactam. For MSSA bacteremia, continuing vancomycin when a focused anti-staphylococcal beta-lactam is reasonable may preserve unnecessary toxicity and may be less optimal therapy.',
  },
  dp03_daptomycin: {
    stewardshipTeaching:
      'This avoids beta-lactams, but the allergy history should be interpreted before bypassing preferred beta-lactam therapy. Daptomycin may be reasonable when beta-lactams are not usable, but in this case it may represent unnecessary avoidance.',
  },
  dp03_linezolid: {
    stewardshipTeaching:
      'Linezolid is bacteriostatic and is not appropriate as primary therapy for active Staphylococcal bacteremia regardless of oral convenience or susceptibility results.',
  },
  dp03_tmp_smx: {
    stewardshipTeaching:
      'TMP-SMX has oral activity against susceptible MSSA but is premature as the primary agent before completing adequate IV bactericidal therapy for active bacteremia.',
  },
}

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

const DRUG_LIMITATIONS = {
  daptomycin: 'Not for pneumonia — inactivated by pulmonary surfactant',
  linezolid: 'Bacteriostatic agent',
}

export function getMechanismLabel(drugId) {
  return drugMechanismLabels[drugId] ?? null
}

export function getOptionDisplayMeta(optionId) {
  return optionDisplayMeta[optionId] ?? null
}

export function getNeutralDrugFacts(drugId) {
  const drug = getDrugById(drugId)
  if (!drug) return []

  const facts = []
  if (drug.mechanism_short) facts.push(drug.mechanism_short)
  if (drug.renal_adjustment_required) {
    facts.push('Renal dose adjustment may be required')
  }
  if (drug.monitoring?.length) {
    facts.push(`Monitoring: ${drug.monitoring.join(', ')}`)
  }
  if (DRUG_LIMITATIONS[drugId]) {
    facts.push(DRUG_LIMITATIONS[drugId])
  }
  return facts
}
