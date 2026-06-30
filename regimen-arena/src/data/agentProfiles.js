/**
 * Agent Profile educational content — general drug facts only.
 * Case-specific teaching remains in post-choice feedback (regimenCardMeta).
 */

import { getDrugById } from '../utils/decisions'
import { getDrugSpriteAlt, getDrugVisual, getVisualImageUrl } from './visualAssets'

/** @type {Record<string, {
 *   visualMetaphor?: string,
 *   clinicalRole?: string,
 *   keyLimitations?: string[],
 *   resistanceNotes?: string[],
 *   stewardshipTrap?: string,
 *   arenaBehavior?: string,
 *   needsClinicalReview?: boolean
 * }>} */
const PROFILE_EXTENSIONS = {
  vancomycin: {
    visualMetaphor:
      'Shown as a binding sentinel. The design represents glycopeptide binding to cell-wall precursor targets rather than direct wall rupture.',
    clinicalRole:
      'Covers many Gram-positive organisms, including MRSA. Often used empirically when MRSA risk is a concern.',
    keyLimitations: [
      'Inferior to beta-lactams for MSSA when a suitable beta-lactam can be used',
      'Nephrotoxicity risk, amplified with certain combinations',
      'Requires therapeutic drug monitoring in many settings',
    ],
    resistanceNotes: ['Vancomycin-intermediate or resistant enterococci and staphylococci alter utility'],
    stewardshipTrap:
      'Continuing vancomycin after a susceptible beta-lactam target is identified may miss a narrower, often preferred option.',
    arenaBehavior:
      'Binds precursor targets in the arena model. Effective against many Gram-positive tokens, but broad Gram-positive coverage carries monitoring and narrowing obligations.',
  },
  piperacillin_tazobactam: {
    visualMetaphor:
      'Shown as a breacher with inhibitor support. The paired design reflects beta-lactam cell-wall activity plus beta-lactamase inhibition.',
    clinicalRole:
      'Broad empiric agent covering many Gram-negatives, Pseudomonas, anaerobes, and some Gram-positives.',
    keyLimitations: [
      'Broad spectrum increases resistance pressure if continued unnecessarily',
      'Nephrotoxicity signal when combined with vancomycin',
      'Renal dose adjustment required',
    ],
    resistanceNotes: ['Beta-lactamase production and other Gram-negative resistance mechanisms may limit activity'],
    stewardshipTrap:
      'Convenient broad coverage can linger after cultures clarify a narrower target.',
    arenaBehavior:
      'Applies broad cell-wall pressure across multiple organism classes in the arena metaphor. High stewardship cost if deployed without indication.',
  },
  cefepime: {
    visualMetaphor:
      'Shown as an advanced wall-disruptor. The design represents fourth-generation cephalosporin beta-lactam pressure against cell-wall construction.',
    clinicalRole:
      'Often used when antipseudomonal Gram-negative coverage is needed alongside Gram-positive activity.',
    keyLimitations: [
      'No anaerobic coverage',
      'Neurotoxicity risk with accumulation in renal dysfunction',
      'Renal dose adjustment required',
    ],
    resistanceNotes: ['May be affected by beta-lactamases and other Gram-negative resistance mechanisms'],
    stewardshipTrap:
      'Useful empirically in the right setting, but should be narrowed when cultures and susceptibilities allow.',
    arenaBehavior:
      'Pressures cell-wall construction in susceptible organisms. Broad Gram-negative reach carries stewardship cost if continued unnecessarily.',
  },
  daptomycin: {
    visualMetaphor:
      'Shown as a calcium-charged membrane striker. The design reflects membrane insertion and depolarization rather than cell-wall binding.',
    clinicalRole:
      'Gram-positive coverage including MRSA and VRE in appropriate settings.',
    keyLimitations: [
      'Inactivated by pulmonary surfactant — not for pneumonia',
      'Myopathy and CK elevation with monitoring requirements',
      'Renal dosing considerations at low CrCl',
    ],
    resistanceNotes: ['Resistance can emerge with exposure; susceptibility should guide ongoing use'],
    stewardshipTrap:
      'Can be selected to avoid beta-lactams without reconciling whether avoidance is truly necessary.',
    arenaBehavior:
      'Strikes the membrane lane in the arena model. Strong against many Gram-positive tokens but cannot operate in pulmonary surfactant environments.',
  },
  cefazolin: {
    visualMetaphor:
      'Shown as a beta-lactam wall-breaker. The design represents focused first-generation cephalosporin cell-wall disruption.',
    clinicalRole:
      'Focused anti-staphylococcal and Gram-positive beta-lactam with limited Gram-negative reach.',
    keyLimitations: [
      'Limited Gram-negative coverage',
      'Renal dose adjustment may be required',
      'Penicillin cross-reactivity is possible but often low with cephalosporins in low-risk allergy histories',
    ],
    resistanceNotes: ['Not active against MRSA; beta-lactam resistance mechanisms apply'],
    stewardshipTrap:
      'A preferred narrowing agent for susceptible staphylococcal infections when beta-lactams are appropriate — underused when allergy history is not prohibitive.',
    arenaBehavior:
      'Efficient wall-breaker against susceptible Gram-positive organisms in the arena. Narrower footprint than broad empiric agents.',
  },
  nafcillin: {
    visualMetaphor:
      'Represented as a penicillinase-resistant wall-breaker in the agent taxonomy. No dedicated sprite asset yet.',
    clinicalRole:
      'Antistaphylococcal penicillin active against MSSA and other susceptible Gram-positives.',
    keyLimitations: [
      'Penicillin-class drug — allergy reconciliation required',
      'Hepatotoxicity and thrombophlebitis compared with cefazolin',
      'Less convenient for outpatient parenteral therapy than some alternatives',
    ],
    resistanceNotes: ['MRSA and beta-lactam resistance negate activity'],
    stewardshipTrap:
      'Clinically active for MSSA but often not the preferred agent when cefazolin is tolerated.',
    arenaBehavior:
      'Direct beta-lactam wall pressure against susceptible staphylococcal tokens. Penicillin-class constraints apply in the simulation.',
    needsClinicalReview: false,
  },
  oxacillin: {
    visualMetaphor:
      'Represented as a penicillinase-resistant wall-breaker in the agent taxonomy. No dedicated sprite asset yet.',
    clinicalRole:
      'Antistaphylococcal penicillin with MSSA activity similar to nafcillin.',
    keyLimitations: [
      'Penicillin-class drug — allergy reconciliation required',
      'Hepatotoxicity and thrombophlebitis',
      'Similar outpatient practicality limitations as nafcillin',
    ],
    resistanceNotes: ['MRSA and beta-lactam resistance negate activity'],
    stewardshipTrap:
      'Equivalent clinical niche to nafcillin — consider whether a cephalosporin is preferable when allergy risk is low.',
    arenaBehavior:
      'Focused wall-breaker against susceptible Gram-positive organisms. Requires penicillin-class consideration in the arena model.',
    needsClinicalReview: false,
  },
  linezolid: {
    visualMetaphor:
      'Shown as a 50S protein synthesis inhibitor. The design reflects ribosomal target binding rather than cell-wall disruption.',
    clinicalRole:
      'Gram-positive coverage including MRSA and VRE with IV and oral availability.',
    keyLimitations: [
      'Bacteriostatic — limited role for bloodstream infection clearance',
      'Myelosuppression, serotonin interaction, and neuropathy risks with prolonged use',
      'No Gram-negative coverage',
    ],
    resistanceNotes: ['Resistance can develop; susceptibility should be confirmed'],
    stewardshipTrap:
      'Oral convenience can tempt use where bactericidal agents with stronger bloodstream data are needed.',
    arenaBehavior:
      'Binds protein synthesis targets in the arena model. Can suppress susceptible Gram-positive tokens but lacks the clearance profile of bactericidal wall agents for active bacteremia.',
  },
  meropenem: {
    visualMetaphor:
      'Shown as a carbapenem fortress-breacher. The design represents broad beta-lactam wall disruption across many pathogen classes.',
    clinicalRole:
      'Reserved broad agent for serious infections when multidrug-resistant Gram-negatives, ESBL producers, or similar risks are present.',
    keyLimitations: [
      'Very broad spectrum — high resistance pressure if overused',
      'Renal dose adjustment required',
      'Seizure risk at higher exposures in some patients',
    ],
    resistanceNotes: ['Carbapenemases and other resistance mechanisms may negate activity'],
    stewardshipTrap:
      'Empiric use without risk factors may be broader than necessary.',
    arenaBehavior:
      'Applies wide cell-wall pressure across Gram-negative and anaerobic lanes in the arena. Highest stewardship cost when deployed without indication.',
  },
  tmp_smx: {
    visualMetaphor:
      'Represented as a folate pathway inhibitor in the agent taxonomy. No dedicated sprite asset yet.',
    clinicalRole:
      'Activity against some Gram-positives and selected Gram-negatives with oral availability in susceptible isolates.',
    keyLimitations: [
      'Not appropriate as primary therapy for active Staphylococcal bacteremia',
      'Hyperkalemia, creatinine effects, and myelosuppression risks',
      'Renal dose adjustment required',
    ],
    resistanceNotes: ['Resistance common in many organisms; susceptibility testing required'],
    stewardshipTrap:
      'Oral activity can be tempting before completing adequate IV bactericidal therapy for bacteremia.',
    arenaBehavior:
      'Disrupts folate synthesis in susceptible organisms. Better suited to step-down than primary bacteremia clearance in the simulation.',
    needsClinicalReview: false,
  },
  ceftriaxone: {
    visualMetaphor:
      'Shown as an extended-spectrum cephalosporin striker. The design represents third-generation cephalosporin cell-wall disruption.',
    clinicalRole:
      'Broad Gram-negative and some Gram-positive coverage with convenient dosing in many settings.',
    keyLimitations: [
      'Not antipseudomonal',
      'Biliary excretion — caution in neonates and with calcium interactions',
      'Renal adjustment generally less critical than other beta-lactams',
    ],
    resistanceNotes: ['ESBL and other beta-lactam resistance mechanisms may limit utility'],
    stewardshipTrap:
      'Convenient spectrum can be continued when a narrower agent would suffice.',
    arenaBehavior:
      'Extended wall-breaker reach in the arena model without Pseudomonas lane coverage.',
    needsClinicalReview: true,
  },
}

/**
 * @param {string} drugId
 * @returns {import('./agentProfiles').AgentProfile | null}
 */
export function getAgentProfile(drugId) {
  const drug = getDrugById(drugId)
  const ext = PROFILE_EXTENSIONS[drugId]
  if (!drug && !ext) return null

  const visual = getDrugVisual(drugId)
  const sprite = visual ? getVisualImageUrl(visual) : null

  return {
    id: drugId,
    name: drug?.display_name ?? visual?.displayName ?? drugId.replace(/_/g, ' '),
    className: drug?.class ?? 'Antimicrobial agent',
    route: drug?.route ?? '—',
    mechanism:
      drug?.mechanism_short ??
      visual?.mechanism ??
      'Mechanism data not available.',
    visualMetaphor:
      ext?.visualMetaphor ??
      (visual?.role
        ? `Shown as ${visual.role.toLowerCase()}. ${visual.mechanism ?? ''}`
        : 'Visual metaphor pending clinical review.'),
    clinicalRole: ext?.clinicalRole ?? 'Clinical role summary pending review.',
    spectrumSummary: drug?.spectrum_tags ?? [],
    keyLimitations: ext?.keyLimitations ?? drug?.toxicity_flags ?? [],
    monitoring: drug?.monitoring ?? [],
    resistanceNotes: ext?.resistanceNotes ?? [],
    stewardshipTrap:
      ext?.stewardshipTrap ?? drug?.stewardship_note ?? 'Stewardship considerations pending review.',
    arenaBehavior:
      ext?.arenaBehavior ?? 'Arena behavior description pending review.',
    sprite,
    spriteAlt: visual ? getDrugSpriteAlt(drugId) : `${drug?.display_name ?? drugId} agent profile.`,
    visualRole: visual?.role ?? null,
    needsClinicalReview: ext?.needsClinicalReview ?? false,
    hasSprite: Boolean(sprite),
  }
}

export function listAgentProfileIds() {
  return Object.keys(PROFILE_EXTENSIONS)
}

export function listAgentProfiles() {
  return listAgentProfileIds()
    .map((id) => getAgentProfile(id))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))
}
