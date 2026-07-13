import { clamp } from './state'
import {
  markTherapyEventResolved,
  THERAPY_EVENT_DECISION_IDS,
} from './therapyEvents'

function mergeFlags(state, flags = []) {
  return [...new Set([...state.flags, ...flags])]
}

function applyDrugChange(state, drugs, replace = false) {
  const activeTherapy = replace ? [...drugs] : [...new Set([...state.activeTherapy, ...drugs])]
  return { ...state, activeTherapy }
}

function spectrumForDrugs(drugs) {
  const map = {
    vancomycin: 6,
    piperacillin_tazobactam: 8,
    cefepime: 7,
    meropenem: 9,
    daptomycin: 5,
    cefazolin: 3,
    nafcillin: 3,
    oxacillin: 3,
    linezolid: 4,
    tmp_smx: 3,
  }
  return drugs.reduce((sum, d) => sum + (map[d] ?? 4), 0)
}

function toxicityForDrugs(drugs) {
  const map = {
    vancomycin: 6,
    piperacillin_tazobactam: 5,
    cefepime: 4,
    meropenem: 4,
    daptomycin: 4,
    cefazolin: 1,
    nafcillin: 3,
    oxacillin: 3,
    linezolid: 3,
    tmp_smx: 2,
  }
  return drugs.reduce((sum, d) => sum + (map[d] ?? 2), 0)
}

const EMPERIC_EFFECTS = {
  opt_vanco_pip: {
    drugs: ['vancomycin', 'piperacillin_tazobactam'],
    replace: true,
    stability: 4,
    spectrumBurden: 14,
    toxicityBurden: 11,
    renalRisk: 8,
    flags: ['nephrotoxicity_risk', 'vanco_pip_interaction'],
    stewardship: { coverage: 8, safety: 5, stewardship: 6, dosing: 7 },
  },
  opt_vanco_cefepime: {
    drugs: ['vancomycin', 'cefepime'],
    replace: true,
    stability: 6,
    spectrumBurden: 13,
    toxicityBurden: 7,
    renalRisk: 5,
    flags: [],
    stewardship: { coverage: 8, safety: 8, stewardship: 7, dosing: 7 },
  },
  opt_vanco_mono: {
    drugs: ['vancomycin'],
    replace: true,
    stability: 3,
    spectrumBurden: 6,
    toxicityBurden: 6,
    renalRisk: 5,
    flags: ['incomplete_gram_negative_coverage'],
    stewardship: { coverage: 6, safety: 7, stewardship: 7, dosing: 7 },
  },
  opt_dapto_cefepime: {
    drugs: ['daptomycin', 'cefepime'],
    replace: true,
    stability: 6,
    spectrumBurden: 12,
    toxicityBurden: 6,
    renalRisk: 4,
    flags: ['ck_monitoring_required'],
    stewardship: { coverage: 8, safety: 7, stewardship: 7, dosing: 7 },
  },
  opt_cefazolin_mono: {
    drugs: ['cefazolin'],
    replace: true,
    stability: -2,
    spectrumBurden: 3,
    toxicityBurden: 1,
    renalRisk: 1,
    flags: ['no_mrsa_coverage'],
    stewardship: { coverage: 3, safety: 9, stewardship: 5, dosing: 8 },
    infectionBurden: 5,
    bacteremiaDelay: true,
  },
  opt_meropenem_vanco: {
    drugs: ['meropenem', 'vancomycin'],
    replace: true,
    stability: 5,
    spectrumBurden: 18,
    toxicityBurden: 8,
    renalRisk: 6,
    flags: ['carbapenem_stewardship_alert'],
    stewardship: { coverage: 9, safety: 6, stewardship: 2, dosing: 6 },
  },
  opt_linezolid_mono: {
    drugs: ['linezolid'],
    replace: true,
    stability: -4,
    spectrumBurden: 4,
    toxicityBurden: 3,
    renalRisk: 1,
    flags: ['bacteriostatic_for_bacteremia', 'no_gram_negative_coverage'],
    stewardship: { coverage: 4, safety: 5, stewardship: 3, dosing: 7 },
    infectionBurden: 8,
    bacteremiaDelay: true,
  },
}

const GRAM_STAIN_EFFECTS = {
  gs_continue_empiric: {
    stability: 2,
    stewardship: { monitoring: 6, stewardship: 7 },
    flags: ['gram_stain_acknowledged'],
  },
  gs_reinforce_gram_positive: {
    stability: 3,
    toxicityBurden: 1,
    stewardship: { coverage: 8, monitoring: 7 },
    flags: ['gram_positive_reassessment'],
  },
  gs_repeat_cultures: {
    stability: 2,
    stewardship: { monitoring: 8 },
    flags: ['repeat_cultures_ordered'],
  },
  gs_reassess_source: {
    stability: 4,
    dischargeReadiness: 5,
    relapseRisk: -8,
    stewardship: { source_control: 8 },
    flags: ['source_control_prioritized'],
  },
  gs_monitor_renal_tox: {
    stability: 3,
    toxicityBurden: -1,
    stewardship: { safety: 8, monitoring: 9, dosing: 8 },
    flags: ['enhanced_monitoring', 'renal_monitoring_intensified'],
  },
}

const SOURCE_CONTROL_EFFECTS = {
  sc_prompt_debridement: {
    sourceControlStatus: 'scheduled',
    infectionBurden: -15,
    stability: 5,
    dischargeReadiness: 10,
    relapseRisk: -12,
    flags: ['source_control_scheduled'],
    stewardship: { source_control: 9 },
    pending: ['debridement_completed'],
  },
  sc_urgent_or: {
    sourceControlStatus: 'completed',
    infectionBurden: -25,
    stability: 8,
    bacteremiaStatus: 'clearing',
    feverDelta: -0.4,
    wbcDelta: -2,
    dischargeReadiness: 15,
    relapseRisk: -18,
    flags: ['source_control_achieved'],
    stewardship: { source_control: 10 },
  },
  sc_delay_medical: {
    sourceControlStatus: 'delayed',
    infectionBurden: 10,
    stability: -6,
    relapseRisk: 15,
    mortalityRisk: 8,
    dischargeReadiness: -10,
    flags: ['source_control_delayed'],
    stewardship: { source_control: 2 },
    pending: ['abscess_persists', 'possible_transfer'],
  },
  sc_conservative_wound_care: {
    sourceControlStatus: 'inadequate',
    infectionBurden: 15,
    stability: -8,
    relapseRisk: 20,
    mortalityRisk: 12,
    flags: ['inadequate_source_control'],
    pending: ['worsening_sepsis_risk'],
    stewardship: { source_control: 0 },
  },
}

const DOSE_EFFECTS = {
  dp02_vanco_extend_interval: {
    renalDoseAdjusted: true,
    toxicityBurden: -4,
    renalRisk: -6,
    stability: 3,
    stewardship: { safety: 10, dosing: 10 },
  },
  dp02_vanco_hold_recheck: {
    renalDoseAdjusted: true,
    toxicityBurden: -3,
    renalRisk: -4,
    stability: 1,
    coverageGap: true,
    stewardship: { safety: 8, dosing: 8 },
  },
  dp02_switch_dapto: {
    drugs: ['daptomycin'],
    replacePartial: 'vancomycin',
    renalDoseAdjusted: true,
    toxicityBurden: -2,
    renalRisk: -3,
    flags: ['ck_monitoring_required'],
    stewardship: { safety: 8, dosing: 8, stewardship: 7 },
  },
  dp02_reduce_cefepime: {
    renalDoseAdjusted: true,
    toxicityBurden: -3,
    renalRisk: -5,
    stewardship: { safety: 10, dosing: 10 },
  },
  dp02_reduce_pip_tazo: {
    renalDoseAdjusted: true,
    toxicityBurden: -2,
    renalRisk: -3,
    stewardship: { safety: 7, dosing: 8 },
  },
  dp02_dapto_dose_adjust: {
    renalDoseAdjusted: true,
    toxicityBurden: -2,
    renalRisk: -4,
    stewardship: { safety: 10, dosing: 10 },
  },
  dp02_no_change: {
    renalDoseAdjusted: false,
    toxicityBurden: 6,
    renalRisk: 10,
    creatinineDelta: 0.5,
    flags: ['aki_dosing_miss', 'toxicity_risk'],
    pending: ['aki_event'],
    stewardship: { safety: 2, dosing: 2 },
  },
}

const DEESCALATION_EFFECTS = {
  dp03_cefazolin: {
    drugs: ['cefazolin'],
    replace: true,
    infectionBurden: -12,
    bacteremiaStatus: 'clearing',
    spectrumBurden: 3,
    toxicityBurden: 1,
    deescalationScore: 10,
    betaLactamAccess: 'utilized',
    allergyStewardship: 'reconciled_low_risk',
    stability: 6,
    flags: ['allergy_reconciliation_note'],
    stewardship: { coverage: 10, stewardship: 10, deescalation: 10, safety: 10 },
  },
  dp03_nafcillin: {
    drugs: ['nafcillin'],
    replace: true,
    infectionBurden: -10,
    bacteremiaStatus: 'clearing',
    spectrumBurden: 3,
    toxicityBurden: 4,
    deescalationScore: 8,
    betaLactamAccess: 'utilized_direct_pcn',
    allergyStewardship: 'acknowledged',
    stability: 4,
    flags: ['nafcillin_safety_profile', 'pcn_allergy_direct_class'],
    stewardship: { coverage: 9, stewardship: 8, deescalation: 9, safety: 7 },
  },
  dp03_oxacillin: {
    drugs: ['oxacillin'],
    replace: true,
    infectionBurden: -10,
    bacteremiaStatus: 'clearing',
    spectrumBurden: 3,
    toxicityBurden: 4,
    deescalationScore: 8,
    betaLactamAccess: 'utilized_direct_pcn',
    allergyStewardship: 'acknowledged',
    stability: 4,
    flags: ['oxacillin_safety_profile', 'pcn_allergy_direct_class'],
    stewardship: { coverage: 9, stewardship: 8, deescalation: 9, safety: 7 },
  },
  dp03_continue_vancomycin: {
    drugs: ['vancomycin'],
    replace: true,
    infectionBurden: -4,
    bacteremiaStatus: 'clearing_slow',
    spectrumBurden: 6,
    toxicityBurden: 6,
    deescalationScore: 0,
    stability: 2,
    flags: ['failed_deescalation', 'vancomycin_for_mssa_bacteremia'],
    stewardship: { coverage: 6, stewardship: 2, deescalation: 0, safety: 5 },
  },
  dp03_daptomycin: {
    drugs: ['daptomycin'],
    replace: true,
    infectionBurden: -8,
    bacteremiaStatus: 'clearing_slow',
    spectrumBurden: 5,
    toxicityBurden: 4,
    deescalationScore: 5,
    betaLactamAccess: 'avoided_low_risk_allergy',
    flags: ['suboptimal_allergy_avoidance', 'ck_monitoring_required'],
    stewardship: { coverage: 8, stewardship: 6, deescalation: 6, safety: 7 },
  },
  dp03_linezolid: {
    drugs: ['linezolid'],
    replace: true,
    infectionBurden: 5,
    bacteremiaStatus: 'persistent',
    spectrumBurden: 4,
    toxicityBurden: 3,
    deescalationScore: 0,
    persistentBacteremia: true,
    treatmentFailure: true,
    flags: ['critical_error_linezolid_bacteremia'],
    pending: ['treatment_failure_bacteremia'],
    stewardship: { coverage: 3, stewardship: 1, deescalation: 0, safety: 2 },
  },
  dp03_tmp_smx: {
    drugs: ['tmp_smx'],
    replace: true,
    infectionBurden: -2,
    bacteremiaStatus: 'persistent_risk',
    spectrumBurden: 3,
    deescalationScore: 2,
    flags: ['premature_oral_stepdown_for_bacteremia'],
    stewardship: { coverage: 5, stewardship: 4, deescalation: 3, safety: 6 },
  },
}

const DURATION_EFFECTS = {
  dp04_6wk_iv_opat: {
    durationAdequacy: 10,
    opatReadiness: 15,
    dischargeReadiness: 20,
    relapseRisk: -20,
    flags: [],
    stewardship: { duration: 10, stewardship: 9, source_control: 9 },
  },
  dp04_4wk_iv_then_oral: {
    durationAdequacy: 8,
    opatReadiness: 10,
    dischargeReadiness: 15,
    relapseRisk: -10,
    oralStepdown: true,
    stewardship: { duration: 9, stewardship: 9, source_control: 8 },
  },
  dp04_4wk_iv_total: {
    durationAdequacy: 7,
    opatReadiness: 12,
    dischargeReadiness: 12,
    relapseRisk: -8,
    stewardship: { duration: 8, stewardship: 7, source_control: 8 },
  },
  dp04_2wk_iv_oral: {
    durationAdequacy: 3,
    opatReadiness: 5,
    dischargeReadiness: 5,
    relapseRisk: 15,
    flags: ['insufficient_duration_osteo_bacteremia'],
    stewardship: { duration: 3, stewardship: 4, source_control: 4 },
  },
  dp04_14_days_total: {
    durationAdequacy: 0,
    opatReadiness: 0,
    dischargeReadiness: -5,
    relapseRisk: 30,
    flags: ['critical_insufficient_duration'],
    pending: ['relapse_event'],
    stewardship: { duration: 0, stewardship: 1, source_control: 2 },
  },
  dp04_oral_only_now: {
    durationAdequacy: 2,
    opatReadiness: 0,
    dischargeReadiness: 0,
    relapseRisk: 20,
    flags: ['premature_oral_stepdown'],
    stewardship: { duration: 2, stewardship: 3, source_control: 3 },
  },
  dp04_dalbavancin_weekly: {
    durationAdequacy: 8,
    opatReadiness: 18,
    dischargeReadiness: 22,
    relapseRisk: -12,
    lineComplicationRisk: -15,
    flags: ['dalbavancin_continuation'],
    stewardship: { duration: 9, stewardship: 8, source_control: 8 },
  },
}

const DAPTO_TOXICITY_RESPONSE_EFFECTS = {
  dapto_resp_continue_monitor: {
    toxicityBurden: 1,
    flags: ['ck_monitoring_intensified'],
    stewardship: { safety: 6, monitoring: 7 },
  },
  dapto_resp_hold_recheck_ck: {
    toxicityBurden: -1,
    stability: 1,
    flags: ['dapto_held_pending_ck'],
    stewardship: { safety: 7, monitoring: 8 },
  },
  dapto_resp_switch_cefazolin: {
    drugs: ['cefazolin'],
    replace: true,
    toxicityBurden: -4,
    deescalationScore: 9,
    stability: 5,
    daptoToxicityPending: false,
    stewardship: { safety: 9, deescalation: 9, stewardship: 9 },
  },
  dapto_resp_switch_vancomycin: {
    drugs: ['vancomycin'],
    replace: true,
    toxicityBurden: -2,
    stability: 3,
    daptoToxicityPending: false,
    stewardship: { safety: 7, deescalation: 5 },
  },
  dapto_resp_hold_switch_beta_lactam: {
    drugs: ['cefazolin'],
    replace: true,
    toxicityBurden: -3,
    deescalationScore: 8,
    daptoToxicityPending: false,
    stewardship: { safety: 8, deescalation: 8 },
  },
}

const VANCO_INFUSION_RESPONSE_EFFECTS = {
  vanco_pause_slow_restart: {
    stability: 2,
    toxicityBurden: -1,
    stewardship: { safety: 8, monitoring: 7 },
    flags: ['vanco_infusion_managed'],
  },
  vanco_slow_premed: {
    stability: 2,
    stewardship: { safety: 8, stewardship: 7 },
    flags: ['vanco_infusion_managed'],
  },
  vanco_document_infusion_reaction: {
    stability: 2,
    toxicityBurden: -1,
    stewardship: { safety: 9, stewardship: 8 },
    flags: ['vanco_infusion_documented'],
  },
  vanco_stop_permanent: {
    toxicityBurden: 1,
    dischargeReadiness: -5,
    stewardship: { safety: 6, stewardship: 5 },
    flags: ['vanco_stopped_infusion'],
  },
  vanco_continue_unchanged: {
    toxicityBurden: 3,
    stability: -4,
    dischargeReadiness: -8,
    stewardship: { safety: 3, monitoring: 2 },
    flags: ['vanco_infusion_ignored'],
  },
}

const CEFEPIME_NEURO_RESPONSE_EFFECTS = {
  cefepime_adjust_monitor: {
    renalDoseAdjusted: true,
    toxicityBurden: -2,
    stability: 3,
    stewardship: { safety: 9, dosing: 9, monitoring: 8 },
    flags: ['cefepime_adjusted_neuro'],
  },
  cefepime_hold_switch: {
    // Removes cefepime from active therapy; gram-negative coverage re-evaluation
    // is recorded via flag. No replacement drug is added here — whether
    // alternative GN coverage is needed depends on the active infection state.
    replacePartial: 'cefepime',
    toxicityBurden: -1,
    stability: 2,
    stewardship: { safety: 8, stewardship: 7 },
    flags: ['cefepime_held_neuro'],
  },
  cefepime_evaluate_other_causes: {
    toxicityBurden: -1,
    stability: 1,
    stewardship: { safety: 7, monitoring: 8 },
    flags: ['cefepime_reassessed'],
  },
  cefepime_continue_unchanged: {
    toxicityBurden: 4,
    stability: -8,
    dischargeReadiness: -12,
    relapseRisk: 10,
    stewardship: { safety: 2, dosing: 2 },
    flags: ['cefepime_neuro_ignored'],
  },
}

const ALLERGY_CLARIFICATION_EFFECTS = {
  allergy_proceed_cefazolin: {
    allergyStewardship: 'clarified_low_risk',
    betaLactamAccess: 'available',
    // deescalationScore intentionally NOT set here — owned by dp_03_deescalation.
    // Stewardship.deescalation capped at 5 so this reconciliation event cannot
    // inflate de-escalation domain beyond what actual de-escalation decisions earn.
    toxicityBurden: -2,
    stewardship: { deescalation: 5, stewardship: 9, safety: 8 },
    flags: ['allergy_clarified_low_risk'],
  },
  allergy_test_dose: {
    allergyStewardship: 'clarified_low_risk',
    betaLactamAccess: 'cautious_pathway',
    stewardship: { safety: 8, stewardship: 7 },
    flags: ['allergy_test_dose_planned'],
  },
  allergy_avoid_all_beta_lactams: {
    allergyStewardship: 'avoided_despite_clarification',
    betaLactamAccess: 'restricted_by_label',
    toxicityBurden: 2,
    stewardship: { deescalation: 3, stewardship: 4 },
    flags: ['unnecessary_beta_lactam_avoidance'],
  },
  allergy_continue_non_beta_lactam: {
    allergyStewardship: 'unaddressed',
    stewardship: { stewardship: 5, deescalation: 4 },
    flags: ['allergy_unaddressed'],
  },
}

const ORAL_AGENT_EFFECTS = {
  oral_tmp_smx: { relapseRisk: -4, stewardship: { stewardship: 8, coverage: 8 } },
  oral_clindamycin: { relapseRisk: -3, stewardship: { stewardship: 7, coverage: 7 } },
  oral_doxycycline: { relapseRisk: -1, stewardship: { stewardship: 6, coverage: 6 } },
  oral_ciprofloxacin: { relapseRisk: 8, flags: ['fluoroquinolone_staph_resistance_risk'], stewardship: { stewardship: 3, coverage: 4 } },
  oral_amoxicillin_clav: { relapseRisk: 5, flags: ['suboptimal_oral_stepdown_agent'], stewardship: { stewardship: 4, coverage: 5 } },
}

const MISHANDLED_THERAPY_RESPONSES = new Set([
  'vanco_continue_unchanged',
  'cefepime_continue_unchanged',
  'allergy_avoid_all_beta_lactams',
  'dapto_resp_continue_monitor',
])

function therapyEventIdForDecision(decisionId) {
  return Object.entries(THERAPY_EVENT_DECISION_IDS).find(([, id]) => id === decisionId)?.[0]
}

function applyStewardshipDomains(state, domains = {}) {
  const stewardshipDomains = { ...state.stewardshipDomains }
  for (const [key, val] of Object.entries(domains)) {
    if (key in stewardshipDomains) {
      stewardshipDomains[key] = Math.max(stewardshipDomains[key], val)
    }
  }
  return stewardshipDomains
}

function applyEffectBlock(state, effect) {
  let next = { ...state }
  const hiddenEffects = []

  if (effect.drugs) {
    if (effect.replace) {
      next = applyDrugChange(next, effect.drugs, true)
    } else if (effect.replacePartial) {
      const filtered = next.activeTherapy.filter((d) => d !== effect.replacePartial)
      next = { ...next, activeTherapy: [...new Set([...filtered, ...effect.drugs])] }
    } else {
      next = applyDrugChange(next, effect.drugs, false)
    }
    hiddenEffects.push(`active_therapy:${next.activeTherapy.join('+')}`)
  }

  if (effect.stability != null) {
    next.patientStability = clamp(next.patientStability + effect.stability, 0, 100)
    hiddenEffects.push(`stability:${effect.stability > 0 ? '+' : ''}${effect.stability}`)
  }
  if (effect.infectionBurden != null) {
    next.infectionBurden = clamp(next.infectionBurden + effect.infectionBurden, 0, 100)
    hiddenEffects.push(`infection_burden:${effect.infectionBurden > 0 ? '+' : ''}${effect.infectionBurden}`)
  }
  if (effect.spectrumBurden != null) {
    next.spectrumBurden = effect.spectrumBurden
    hiddenEffects.push(`spectrum_burden:${effect.spectrumBurden}`)
  } else if (effect.drugs && effect.replace) {
    next.spectrumBurden = spectrumForDrugs(effect.drugs)
    hiddenEffects.push(`spectrum_burden:${next.spectrumBurden}`)
  }
  if (effect.toxicityBurden != null) {
    if (effect.drugs && effect.replace) {
      next.toxicityBurden = clamp(effect.toxicityBurden, 0, 100)
    } else {
      next.toxicityBurden = clamp(state.toxicityBurden + effect.toxicityBurden, 0, 100)
    }
    hiddenEffects.push(`toxicity_burden:${next.toxicityBurden}`)
  } else if (effect.drugs && effect.replace) {
    next.toxicityBurden = toxicityForDrugs(effect.drugs)
    hiddenEffects.push(`toxicity_burden:${next.toxicityBurden}`)
  }
  if (effect.renalRisk != null) {
    next.creatinine = clamp(next.creatinine + (effect.renalRisk > 5 ? 0.3 : 0), 1.2, 4.5)
    if (effect.renalRisk > 5) hiddenEffects.push('renal_risk_elevated')
  }
  if (effect.creatinineDelta) {
    next.creatinine = clamp(next.creatinine + effect.creatinineDelta, 1.2, 4.5)
    next.renalTrend = 'worsening'
    hiddenEffects.push(`creatinine:+${effect.creatinineDelta}`)
  }
  if (effect.feverDelta) {
    next.feverC = clamp(next.feverC + effect.feverDelta, 36.5, 40.5)
    hiddenEffects.push(`fever:${effect.feverDelta > 0 ? '+' : ''}${effect.feverDelta}`)
  }
  if (effect.wbcDelta) {
    next.wbc = clamp(next.wbc + effect.wbcDelta, 4, 30)
    hiddenEffects.push(`wbc:${effect.wbcDelta > 0 ? '+' : ''}${effect.wbcDelta}`)
  }
  if (effect.sourceControlStatus) {
    next.sourceControlStatus = effect.sourceControlStatus
    hiddenEffects.push(`source_control:${effect.sourceControlStatus}`)
  }
  if (effect.bacteremiaStatus) {
    next.bacteremiaStatus = effect.bacteremiaStatus
    hiddenEffects.push(`bacteremia:${effect.bacteremiaStatus}`)
  }
  if (effect.bacteremiaDelay) {
    next.bacteremiaStatus = 'positive_persists'
    hiddenEffects.push('bacteremia:delayed_clearance')
  }
  if (effect.deescalationScore != null) {
    next.deescalationScore = effect.deescalationScore
    hiddenEffects.push(`deescalation_score:${effect.deescalationScore}`)
  }
  if (effect.durationAdequacy != null) {
    next.durationAdequacy = effect.durationAdequacy
    hiddenEffects.push(`duration_adequacy:${effect.durationAdequacy}`)
  }
  if (effect.relapseRisk != null) {
    next.relapseRisk = clamp(next.relapseRisk + effect.relapseRisk, 0, 100)
    hiddenEffects.push(`relapse_risk:${effect.relapseRisk > 0 ? '+' : ''}${effect.relapseRisk}`)
  }
  if (effect.lineComplicationRisk != null) {
    next.lineComplicationRisk = clamp(
      (next.lineComplicationRisk ?? 25) + effect.lineComplicationRisk,
      0,
      100
    )
    hiddenEffects.push(`line_complication_risk:${effect.lineComplicationRisk}`)
  }
  if (effect.mortalityRisk != null) {
    next.mortalityRisk = clamp(next.mortalityRisk + effect.mortalityRisk, 0, 100)
    hiddenEffects.push(`mortality_risk:+${effect.mortalityRisk}`)
  }
  if (effect.dischargeReadiness != null) {
    next.dischargeReadiness = clamp(next.dischargeReadiness + effect.dischargeReadiness, 0, 100)
    hiddenEffects.push(`discharge_readiness:${effect.dischargeReadiness > 0 ? '+' : ''}${effect.dischargeReadiness}`)
  }
  if (effect.opatReadiness != null) {
    next.opatReadiness = clamp(next.opatReadiness + effect.opatReadiness, 0, 100)
    hiddenEffects.push(`opat_readiness:${effect.opatReadiness > 0 ? '+' : ''}${effect.opatReadiness}`)
  }
  if (effect.renalDoseAdjusted != null) {
    next.renalDoseAdjusted = effect.renalDoseAdjusted
    hiddenEffects.push(`renal_dose_adjusted:${effect.renalDoseAdjusted}`)
  }
  if (effect.betaLactamAccess) {
    next.betaLactamAccess = effect.betaLactamAccess
    hiddenEffects.push(`beta_lactam_access:${effect.betaLactamAccess}`)
  }
  if (effect.allergyStewardship) {
    next.allergyStewardship = effect.allergyStewardship
    hiddenEffects.push(`allergy_stewardship:${effect.allergyStewardship}`)
  }
  if (effect.persistentBacteremia) next.persistentBacteremia = true
  if (effect.treatmentFailure) next.treatmentFailure = true
  if (effect.flags) {
    next.flags = mergeFlags(next, effect.flags)
    hiddenEffects.push(`flags:${effect.flags.join(',')}`)
  }
  if (effect.pending) {
    next.pendingConsequences = [...new Set([...next.pendingConsequences, ...effect.pending])]
    hiddenEffects.push(`pending:${effect.pending.join(',')}`)
  }
  if (effect.daptoToxicityPending === false) {
    next.daptoToxicityPending = false
    hiddenEffects.push('dapto_toxicity:addressed')
  }
  if (effect.stewardship) {
    next.stewardshipDomains = applyStewardshipDomains(next, effect.stewardship)
  }

  return { state: next, hiddenEffects }
}

export function applyMonitoringDecision(state, selectedIds, activeDrugs, decisionPoint) {
  let next = { ...state }
  const hiddenEffects = []
  let monitoringScore = 0
  const selected = new Set(selectedIds)

  const ivOpatActive = next.durationAdequacy >= 7

  for (const opt of decisionPoint.options) {
    if (selected.has(opt.id) && opt.points) monitoringScore += opt.points
  }
  for (const opt of decisionPoint.options) {
    if (opt.required && !selected.has(opt.id)) monitoringScore = Math.max(0, monitoringScore - 2)
    if (opt.required_if) {
      const drugNeeded = opt.required_if.some((d) => activeDrugs.includes(d))
      const ivOpatNeeded = opt.required_if.includes('iv_opat') && ivOpatActive
      if ((drugNeeded || ivOpatNeeded) && !selected.has(opt.id)) {
        monitoringScore = Math.max(0, monitoringScore - 2)
      }
    }
  }
  monitoringScore = Math.min(10, Math.max(0, monitoringScore))

  if (selected.has('mon_nothing')) {
    next.opatReadiness = clamp(next.opatReadiness - 30, 0, 100)
    next.dischargeReadiness = clamp(next.dischargeReadiness - 20, 0, 100)
    next.relapseRisk = clamp(next.relapseRisk + 15, 0, 100)
    next.flags = mergeFlags(next, ['critical_no_monitoring_plan'])
    hiddenEffects.push('monitoring:none_selected')
  } else {
    next.opatReadiness = clamp(next.opatReadiness + monitoringScore * 2, 0, 100)
    next.dischargeReadiness = clamp(next.dischargeReadiness + monitoringScore, 0, 100)
    next.relapseRisk = clamp(next.relapseRisk - monitoringScore, 0, 100)
    hiddenEffects.push(`monitoring_score:${monitoringScore}`)
  }

  next.stewardshipDomains = applyStewardshipDomains(next, { monitoring: monitoringScore })

  return {
    state: next,
    hiddenEffects,
    flags: next.flags,
    pendingConsequences: next.pendingConsequences,
    monitoringScore,
  }
}

export function applyBoneDeepDecision(state, decisionPoint, option, subOption = null, activeDrugsBefore = []) {
  const optionId = option.id ?? option.selectedIds?.join(',')
  let effect = null
  let hiddenEffects = []
  let next = { ...state }

  if (decisionPoint.type === 'multi_select') {
    return applyMonitoringDecision(state, option.selectedIds, activeDrugsBefore, decisionPoint)
  }

  switch (decisionPoint.id) {
    case 'dp_01_empiric_regimen':
      effect = EMPERIC_EFFECTS[optionId]
      break
    case 'dp_gram_stain_response':
      effect = GRAM_STAIN_EFFECTS[optionId]
      break
    case 'dp_source_control':
      effect = SOURCE_CONTROL_EFFECTS[optionId]
      break
    case 'dp_02_dose_reassessment':
      effect = DOSE_EFFECTS[optionId]
      break
    case 'dp_03_deescalation':
      effect = DEESCALATION_EFFECTS[optionId]
      if (optionId === 'dp03_cefazolin' || optionId === 'dp03_nafcillin' || optionId === 'dp03_oxacillin') {
        next.organismRevealed = true
        next.organismIdentity = 'MSSA'
        next.susceptibilityRevealed = true
      }
      break
    case 'dp_04_duration_and_transition':
      effect = DURATION_EFFECTS[optionId]
      if (subOption) {
        const oralEffect = ORAL_AGENT_EFFECTS[subOption.id]
        if (oralEffect) {
          const oralResult = applyEffectBlock(next, oralEffect)
          next = oralResult.state
          hiddenEffects.push(...oralResult.hiddenEffects)
        }
      }
      break
    case 'dp_dapto_toxicity_response':
      effect = DAPTO_TOXICITY_RESPONSE_EFFECTS[optionId]
      next.daptoToxicityPending = false
      break
    case 'dp_vanco_infusion_response':
      effect = VANCO_INFUSION_RESPONSE_EFFECTS[optionId]
      break
    case 'dp_cefepime_neuro_response':
      effect = CEFEPIME_NEURO_RESPONSE_EFFECTS[optionId]
      break
    case 'dp_allergy_clarification':
      effect = ALLERGY_CLARIFICATION_EFFECTS[optionId]
      break
    default:
      break
  }

  if (effect) {
    const result = applyEffectBlock(next, effect)
    next = result.state
    hiddenEffects = [...hiddenEffects, ...result.hiddenEffects]
  }

  const therapyEventId = therapyEventIdForDecision(decisionPoint.id)
  if (therapyEventId) {
    const mishandled = MISHANDLED_THERAPY_RESPONSES.has(optionId)
    next = markTherapyEventResolved(next, therapyEventId, optionId, mishandled)
    if (therapyEventId === 'dapto_ck_toxicity') {
      next.daptoToxicityPending = false
    }
    hiddenEffects.push(`therapy_event:${therapyEventId}:${optionId}`)
  }

  return {
    state: next,
    hiddenEffects,
    flags: next.flags,
    pendingConsequences: next.pendingConsequences,
  }
}