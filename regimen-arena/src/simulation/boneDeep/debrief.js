import { SCORE_MAXES, sumAllDimensions, sumAllMaxes } from '../../utils/scoring'
import { projectClinicalState } from './clinicalProjection'
import { buildTherapyEventDebriefEntries } from './therapyEvents'

const UNSAFE_DECISION_FLAGS = new Set([
  'critical_no_monitoring_plan',
  'critical_insufficient_duration',
  'critical_error_linezolid_bacteremia',
  'inadequate_source_control',
])

const CONCERNING_DECISION_IDS = new Set([
  'sc_delay_medical',
  'sc_conservative_wound_care',
  'dp02_no_change',
  'dp04_14_days_total',
  'dp04_2wk_iv_oral',
  'dp04_oral_only_now',
  'opt_cefazolin_mono',
  'opt_linezolid_mono',
  'opt_meropenem_vanco',
])

function overallOutcome(state) {
  if (state.relapseOccurred || state.mortalityRisk > 70) return 'poor'
  if (state.treatmentFailure || state.persistentBacteremia) return 'complicated'
  if (state.patientStability >= 60 && state.dischargeReadiness >= 50) return 'favorable'
  if (state.patientStability >= 40) return 'guarded_recovery'
  return 'deteriorating'
}

function disposition(state) {
  if (state.relapseOccurred) return 'Readmitted with recurrent diabetic foot osteomyelitis'
  if (state.transferredForSourceControl) return 'Transferred for higher-level surgical source control'
  if (state.dischargeReadiness >= 70 && state.opatReadiness >= 55) {
    return 'Discharged on outpatient parenteral antimicrobial therapy with ID follow-up'
  }
  if (state.dischargeReadiness >= 50) return 'Discharged on oral/step-down therapy with close follow-up'
  if (state.treatmentFailure) return 'Prolonged inpatient course for persistent bacteremia'
  return 'Extended inpatient management'
}

function stewardshipPerformance(domains) {
  return Object.entries(domains).map(([domain, score]) => ({
    domain,
    score,
    max: 10,
    label: domain.replace(/_/g, ' '),
  }))
}

function chosenOptionIds(eventLog) {
  return new Set(
    eventLog.flatMap((entry) =>
      entry.optionIds?.length ? entry.optionIds : entry.optionId ? [entry.optionId] : []
    )
  )
}

function identifySuccesses(eventLog, state) {
  const successes = []
  const optionIds = chosenOptionIds(eventLog)

  if (optionIds.has('dp03_cefazolin')) {
    successes.push('De-escalated to cefazolin for MSSA bacteremia with low-risk allergy reconciliation')
  }
  if (optionIds.has('sc_urgent_or') || optionIds.has('sc_prompt_debridement')) {
    successes.push('Prioritized surgical source control for deep foot infection')
  }
  if (optionIds.has('dp02_vanco_extend_interval') || optionIds.has('dp02_reduce_cefepime')) {
    successes.push('Adjusted antimicrobial dosing for worsening renal function')
  }
  if (optionIds.has('dp04_6wk_iv_opat')) {
    successes.push('Planned adequate duration with OPAT for osteomyelitis with bacteremia')
  }
  if (state.renalDoseAdjusted && !state.akiOccurred) {
    successes.push('Maintained renal safety through dose adjustment')
  }
  if (state.bacteremiaStatus === 'cleared') {
    successes.push('Achieved blood culture clearance')
  }
  if (optionIds.has('vanco_pause_slow_restart') || optionIds.has('vanco_document_infusion_reaction')) {
    successes.push('Managed vancomycin infusion reaction without unnecessary allergy labeling')
  }
  if (optionIds.has('cefepime_adjust_monitor') || optionIds.has('cefepime_hold_switch')) {
    successes.push('Addressed cefepime neurotoxicity concern with dose adjustment or switch')
  }
  if (optionIds.has('allergy_proceed_cefazolin')) {
    successes.push('Reconciled low-risk penicillin allergy and supported MSSA beta-lactam pathway')
  }
  if (optionIds.has('dapto_resp_hold_recheck_ck') || optionIds.has('dapto_resp_switch_cefazolin')) {
    successes.push('Responded appropriately to daptomycin CK toxicity signal')
  }
  return [...new Set(successes)]
}

function identifyMissedOpportunities(eventLog, state) {
  const missed = []
  const optionIds = chosenOptionIds(eventLog)

  if (!optionIds.has('dp03_cefazolin') && state.organismIdentity === 'MSSA') {
    if (optionIds.has('dp03_continue_vancomycin')) {
      missed.push('Did not de-escalate to beta-lactam therapy for confirmed MSSA bacteremia')
    }
    if (optionIds.has('dp03_daptomycin')) {
      missed.push('Avoided beta-lactam despite low-risk penicillin allergy history')
    }
  }
  if (optionIds.has('sc_delay_medical') || optionIds.has('sc_conservative_wound_care')) {
    missed.push('Delayed or inadequate source control for abscess and osteomyelitis')
  }
  if (optionIds.has('dp02_no_change')) {
    missed.push('Failed to adjust renally cleared agents during AKI')
  }
  if (optionIds.has('dp04_14_days_total') || optionIds.has('dp04_2wk_iv_oral')) {
    missed.push('Planned insufficient total duration for osteomyelitis with bacteremia')
  }
  if (state.flags.includes('critical_no_monitoring_plan')) {
    missed.push('Discharged without structured outpatient monitoring')
  }
  if (optionIds.has('vanco_continue_unchanged')) {
    missed.push('Continued vancomycin infusion unchanged despite infusion reaction symptoms')
  }
  if (optionIds.has('cefepime_continue_unchanged')) {
    missed.push('Did not adjust or reassess cefepime despite neurologic toxicity signal')
  }
  if (optionIds.has('allergy_avoid_all_beta_lactams')) {
    missed.push('Avoided beta-lactams after low-risk allergy clarification for MSSA')
  }
  if (optionIds.has('dapto_resp_continue_monitor') && state.daptoToxicityTier === 'severe') {
    missed.push('Continued daptomycin despite severe CK elevation')
  }
  return missed
}

function turningPoints(eventLog, state) {
  const points = []
  for (const entry of eventLog) {
    if (entry.decisionId === 'dp_01_empiric_regimen') {
      points.push({ time: entry.scenarioTimeHours, text: `Empiric therapy selected: ${entry.decisionLabel}` })
    }
    if (entry.decisionId === 'dp_source_control') {
      points.push({ time: entry.scenarioTimeHours, text: `Source control decision: ${entry.decisionLabel}` })
    }
    if (entry.decisionId === 'dp_03_deescalation') {
      points.push({ time: entry.scenarioTimeHours, text: `Definitive therapy: ${entry.decisionLabel}` })
    }
  }
  for (const c of state.triggeredConsequences) {
    points.push({ time: state.scenarioTimeHours, text: c })
  }
  for (const ev of state.therapyEventState?.triggeredEvents ?? []) {
    points.push({
      time: ev.triggeredAtHours ?? state.scenarioTimeHours,
      text: `Therapy event: ${ev.label}`,
    })
  }
  return points
}

function courseExplanation(state) {
  const parts = []
  if (state.sourceControlStatus === 'completed') {
    parts.push('Surgical source control reduced ongoing infection burden and supported bacteremia clearance.')
  } else {
    parts.push('Incomplete source control limited the ability to clear deep infection and bacteremia.')
  }
  if (state.deescalationScore >= 8) {
    parts.push('Appropriate MSSA-targeted beta-lactam therapy improved clearance and stewardship metrics.')
  } else if (state.persistentBacteremia) {
    parts.push('Definitive therapy choices contributed to persistent bloodstream infection.')
  }
  if (state.renalDoseAdjusted) {
    parts.push('Renal dose adjustments mitigated further nephrotoxic injury.')
  } else if (state.akiOccurred) {
    parts.push('Failure to adjust renally cleared agents worsened AKI on baseline CKD.')
  }
  if (state.durationAdequacy >= 7) {
    parts.push('Adequate planned duration supported durable cure after source control.')
  } else if (state.relapseOccurred) {
    parts.push('Insufficient duration contributed to relapse of osteomyelitis.')
  }
  return parts.join(' ')
}

function expertPathway() {
  return [
    'Empiric vancomycin plus gram-negative coverage (cefepime preferred over pip-tazo given AKI risk) with renal dosing',
    'Urgent surgical debridement for osteomyelitis and abscess',
    'Renal dose adjustment as SCr rises',
    'De-escalation to cefazolin once MSSA confirmed, with low-risk allergy reconciliation',
    'Repeat cultures to document clearance',
    '4–6 weeks total therapy (IV with OPAT or IV then oral step-down) with BMP, clinical follow-up, and ID oversight',
  ]
}

function averageScorePct(score, scoreMaxes) {
  const total = sumAllDimensions(score)
  const max = sumAllMaxes(scoreMaxes)
  return max > 0 ? total / max : 0
}

function hasUnsafeDecisions(eventLog, state, criticalFlags) {
  if (criticalFlags?.length > 0) return true
  if (state.flags?.some((f) => UNSAFE_DECISION_FLAGS.has(f))) return true
  const optionIds = chosenOptionIds(eventLog)
  return (
    optionIds.has('sc_conservative_wound_care') ||
    optionIds.has('dp04_14_days_total') ||
    optionIds.has('opt_linezolid_mono') ||
    optionIds.has('dp04_oral_only_now')
  )
}

function monitoringPlanStrong(state) {
  const monitoringScore = state.stewardshipDomains?.monitoring ?? 0
  return monitoringScore >= 7 && !state.flags?.includes('critical_no_monitoring_plan')
}

export function computeStewardshipTier(score, scoreMaxes, eventLog, state, criticalFlags) {
  if (hasUnsafeDecisions(eventLog, state, criticalFlags)) {
    return 'unsafe'
  }

  const pct = averageScorePct(score, scoreMaxes ?? SCORE_MAXES)
  const optionIds = chosenOptionIds(eventLog)
  const concerningChoices = [...optionIds].filter((id) => CONCERNING_DECISION_IDS.has(id)).length
  const missed = identifyMissedOpportunities(eventLog, state).length

  if (pct >= 0.88 && concerningChoices === 0 && missed <= 1) return 'excellent'
  if (pct >= 0.78 && missed <= 2) return 'strong'
  if (pct >= 0.62) return 'adequate'
  if (pct >= 0.45 || concerningChoices <= 2) return 'concerning'
  return 'concerning'
}

export function computePatientOutcomeTier(state) {
  const pd = state.postDischargeOutcomeId

  if (pd === 'severe_deterioration' || state.mortalityRisk >= 90) return 'death'
  if (pd === 'readmission_infection' || state.relapseOccurred) return 'readmitted'
  if (pd === 'line_complication' || pd === 'followup_failure') return 'readmitted'
  if (pd === 'rehab_monitoring' || overallOutcome(state) === 'guarded_recovery') {
    return 'complex_recovery'
  }
  if (pd === 'resolved_completed' || overallOutcome(state) === 'favorable') return 'resolved'
  if (overallOutcome(state) === 'complicated' || overallOutcome(state) === 'poor') {
    return state.transferredForSourceControl ? 'icu_transfer' : 'readmitted'
  }
  return 'complex_recovery'
}

export function computeOutcomeAttribution(state, eventLog, stewardshipTier, criticalFlags) {
  const pd = state.postDischargeOutcomeId
  const sourcePoor = state.sourceControlStatus !== 'completed'
  const therapyWeak = (state.activeTherapy?.length ?? 0) === 0 || state.infectionBurden >= 55
  const monitoringWeak = state.flags?.includes('critical_no_monitoring_plan')
  const monitoringStrong = monitoringPlanStrong(state)

  if (
    criticalFlags?.length > 0 ||
    monitoringWeak ||
    sourcePoor && ['readmission_infection', 'severe_deterioration'].includes(pd) ||
    therapyWeak && pd === 'readmission_infection'
  ) {
    return 'decision_driven'
  }

  if (
    monitoringStrong &&
    ['followup_failure', 'line_complication', 'rehab_monitoring'].includes(pd) &&
    ['excellent', 'strong', 'adequate'].includes(stewardshipTier)
  ) {
    return 'clinical_variability'
  }

  if (
    ['followup_failure', 'line_complication', 'rehab_monitoring'].includes(pd) &&
    ['excellent', 'strong'].includes(stewardshipTier)
  ) {
    return 'mixed'
  }

  if (pd === 'resolved_completed') return 'decision_driven'
  return 'mixed'
}

function attributionSummary(attribution, stewardshipTier, patientOutcome, state) {
  const pd = state.postDischargeOutcomeId

  if (attribution === 'clinical_variability') {
    if (pd === 'line_complication') {
      return 'Line complication appears to be a post-discharge clinical/system event rather than a direct unsafe inpatient decision.'
    }
    if (pd === 'followup_failure') {
      return 'Follow-up failure occurred despite a mostly appropriate inpatient monitoring and discharge plan.'
    }
    return 'Strong stewardship performance with a complicated post-discharge outcome driven largely by clinical variability.'
  }

  if (attribution === 'mixed') {
    return 'Readmission or complication reflects both reasonable elements of the plan and residual clinical/system risk.'
  }

  if (stewardshipTier === 'unsafe') {
    return 'Preventable harm was strongly linked to high-risk antimicrobial, source-control, monitoring, or duration decisions.'
  }

  if (patientOutcome === 'resolved') {
    return 'Clinical course aligned with timely source control, appropriate therapy, and adequate planning.'
  }

  return 'Outcome was mostly driven by the antimicrobial and source-control decisions made during the case.'
}

function headlineForAssessment(stewardshipTier, patientOutcome, attribution) {
  if (attribution === 'clinical_variability' && ['excellent', 'strong'].includes(stewardshipTier)) {
    return 'Strong stewardship performance with complicated post-discharge outcome'
  }
  if (stewardshipTier === 'unsafe') {
    return 'High-risk stewardship decisions contributed to patient harm'
  }
  if (patientOutcome === 'resolved') {
    return 'Appropriate stewardship with favorable patient outcome'
  }
  if (patientOutcome === 'readmitted' && attribution === 'mixed') {
    return 'Reasonable inpatient plan with readmission after discharge'
  }
  return 'Stewardship performance and patient outcome are reported separately below'
}

export const STEWARDSHIP_TIER_LABELS = {
  excellent: 'Excellent',
  strong: 'Strong',
  adequate: 'Adequate',
  concerning: 'Concerning',
  unsafe: 'Unsafe',
}

export const PATIENT_OUTCOME_LABELS = {
  resolved: 'Resolved',
  complex_recovery: 'Complex Recovery',
  readmitted: 'Readmitted',
  icu_transfer: 'ICU Transfer',
  death: 'Death',
}

export const ATTRIBUTION_LABELS = {
  decision_driven: 'Mostly decision-driven',
  mixed: 'Mixed decision/system factors',
  clinical_variability: 'Mostly clinical variability despite reasonable plan',
}

export function buildBoneDeepDebrief(state, eventLog, score, criticalFlags) {
  const outcome = overallOutcome(state)
  const snapshot = projectClinicalState(state)
  const stewardshipTier = computeStewardshipTier(score, SCORE_MAXES, eventLog, state, criticalFlags)
  const patientOutcomeTier = computePatientOutcomeTier(state)
  const attribution = computeOutcomeAttribution(state, eventLog, stewardshipTier, criticalFlags)
  const therapyEvents = buildTherapyEventDebriefEntries(state)

  const assessment = {
    stewardshipPerformance: stewardshipTier,
    patientOutcome: patientOutcomeTier,
    outcomeAttribution: attribution,
    headline: headlineForAssessment(stewardshipTier, patientOutcomeTier, attribution),
    attributionSummary: attributionSummary(attribution, stewardshipTier, patientOutcomeTier, state),
  }

  return {
    assessment,
    patientOutcome: {
      tier: outcome,
      summary:
        outcome === 'favorable'
          ? 'Patient stabilized, bacteremia cleared, and discharged with an appropriate outpatient plan.'
          : outcome === 'guarded_recovery'
            ? 'Patient improved but with residual risks from prior clinical course.'
            : outcome === 'complicated'
              ? 'Patient experienced complications including treatment failure or persistent infection.'
              : outcome === 'poor'
                ? state.postDischargeOutcomeId === 'severe_deterioration'
                  ? 'Patient deteriorated after discharge despite inpatient efforts.'
                  : 'Patient deteriorated or relapsed after discharge.'
                : 'Patient remains unstable with ongoing infection concerns.',
    },
    disposition: disposition(state),
    postDischarge: state.postDischargeNarrative
      ? {
          outcomeId: state.postDischargeOutcomeId,
          narrative: state.postDischargeNarrative,
          linkedScenarioUnlocked: state.linkedScenarioUnlocked,
        }
      : null,
    stewardshipPerformance: stewardshipPerformance(state.stewardshipDomains),
    score,
    criticalFlags,
    keySuccesses: identifySuccesses(eventLog, state),
    missedOpportunities: identifyMissedOpportunities(eventLog, state),
    turningPoints: turningPoints(eventLog, state),
    courseExplanation: courseExplanation(state),
    expertPathway: expertPathway(),
    clinicalSnapshot: snapshot,
    therapyEvents,
    eventLog,
  }
}

/** @deprecated Use debrief.assessment — kept for compatibility */
export function computeDebriefTier(debrief, criticalFlags) {
  const tier = debrief.assessment?.stewardshipPerformance ?? 'adequate'
  if (criticalFlags?.length > 0 && tier !== 'unsafe') return 'suboptimal'
  const map = {
    excellent: 'optimal',
    strong: 'optimal',
    adequate: 'reasonable',
    concerning: 'suboptimal',
    unsafe: 'unsafe',
  }
  return map[tier] ?? 'reasonable'
}
