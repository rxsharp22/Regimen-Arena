import { projectClinicalState } from './clinicalProjection'

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
    parts.push('Suboptimal definitive therapy contributed to persistent bloodstream infection.')
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

export function buildBoneDeepDebrief(state, eventLog, score, criticalFlags) {
  const outcome = overallOutcome(state)
  const snapshot = projectClinicalState(state)

  return {
    patientOutcome: {
      tier: outcome,
      summary:
        outcome === 'favorable'
          ? 'Patient stabilized, bacteremia cleared, and discharged with an appropriate outpatient plan.'
          : outcome === 'guarded_recovery'
            ? 'Patient improved but with residual risks from suboptimal decisions.'
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
    eventLog,
  }
}

export function computeDebriefTier(debrief, criticalFlags) {
  if (criticalFlags?.length > 0) return 'unsafe'
  const outcome = debrief.patientOutcome.tier
  if (outcome === 'favorable') return 'optimal'
  if (outcome === 'guarded_recovery') return 'reasonable'
  if (outcome === 'complicated') return 'suboptimal'
  return 'unsafe'
}
