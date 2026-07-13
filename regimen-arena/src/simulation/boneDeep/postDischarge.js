import { weightedChoice } from './weightedOutcomes'
import { getPostDischargeEventModifiers } from './therapyEvents'

const OUTCOME_COPY = {
  resolved_completed: {
    title: 'Therapy completed',
    spriteKey: 'patientImproved',
    advisorSprite: 'scribe5',
    narrative:
      'Day 21 after discharge: Follow-up labs remain stable. The wound continues to improve. IV therapy is completed, and the PICC is removed after the final dose.',
    tone: 'improving',
  },
  rehab_monitoring: {
    title: 'Rehab with monitoring burden',
    spriteKey: 'patientGeneric',
    advisorSprite: 'scribe5',
    narrative:
      'Day 14 after discharge: The patient is transferred to rehab for wound care and mobility support. Therapy continues with weekly labs, but monitoring requires repeated coordination.',
    tone: 'neutral',
  },
  readmission_infection: {
    title: 'Readmission — recurrent infection',
    spriteKey: 'patientDeclining',
    advisorSprite: 'labTech',
    narrative:
      'Day 10 after discharge: The patient returns with fever and worsening foot pain. Repeat cultures are positive, and imaging suggests ongoing infection.',
    tone: 'declining',
  },
  followup_failure: {
    title: 'Follow-up failure',
    spriteKey: 'patientDeclining',
    advisorSprite: 'scribe5',
    narrative:
      'Day 18 after discharge: The patient misses follow-up and no interval labs are available. EMS later brings the patient to the ED with fever, confusion, and worsening wound drainage.',
    tone: 'declining',
  },
  line_complication: {
    title: 'Line complication',
    spriteKey: 'patientDeclining',
    advisorSprite: 'labTech',
    narrative:
      'Day 16 after discharge: The home health nurse reports erythema and drainage around the line site. The patient develops chills during infusion and returns to the ED for blood cultures.',
    tone: 'declining',
    linkedScenario: 'Line in the Bloodstream',
  },
  severe_deterioration: {
    title: 'Severe deterioration',
    spriteKey: 'patientDeclining',
    advisorSprite: 'scribe5',
    narrative:
      'Despite escalation after readmission, the patient deteriorates with septic shock and multiorgan dysfunction.',
    tone: 'declining',
  },
}

function sourceOk(state) {
  return state.sourceControlStatus === 'completed'
}

function monitoringPlanStrong(state) {
  const monitoringScore = state.stewardshipDomains?.monitoring ?? 0
  return monitoringScore >= 7 && !state.flags?.includes('critical_no_monitoring_plan')
}

function hasOpatLineExposure(state) {
  const ivOpatDrugs = ['vancomycin', 'cefazolin', 'nafcillin', 'oxacillin', 'daptomycin']
  const onIvTherapy = state.activeTherapy?.some((d) => ivOpatDrugs.includes(d))
  const planningOpat = state.opatReadiness >= 45 || state.durationAdequacy >= 6
  const dalbavancin = state.flags?.includes('dalbavancin_continuation')
  return onIvTherapy && planningOpat && !dalbavancin
}

function buildOutcomeWeights(state) {
  const recovery = Math.max(0, state.patientStability - 40) / 60
  const relapse = state.relapseRisk / 100
  const readmit = (state.relapseRisk + (state.followUpFailureRisk ?? 20)) / 200
  const lineRisk = (state.lineComplicationRisk ?? 25) / 100
  const mortality = state.mortalityRisk / 100
  const poorTox = state.toxicityBurden / 100
  const poorSource = state.sourceControlStatus !== 'completed' ? 0.4 : 0
  const poorDuration = state.durationAdequacy < 5 ? 0.35 : 0
  const therapyActive = (state.activeTherapy?.length ?? 0) > 0
  const infectionControlled = state.infectionBurden < 45 && state.bacteremiaStatus !== 'persistent'
  const monitoringStrong = monitoringPlanStrong(state)
  const opatLine = hasOpatLineExposure(state)

  const eventMods = getPostDischargeEventModifiers(state)

  const resolvedBase =
    sourceOk(state) && therapyActive && infectionControlled
      ? Math.max(1, 6 * recovery + (state.durationAdequacy >= 7 ? 4 : 0) - relapse * 4 + eventMods.resolvedBoost)
      : Math.max(0.15, recovery)

  let followupWeight = 1 + readmit * 5
  if (state.flags?.includes('critical_no_monitoring_plan')) {
    followupWeight += 5
  } else if (monitoringStrong) {
    followupWeight = Math.max(0.25, followupWeight * 0.35)
  }

  let lineWeight = 0.4 + lineRisk * 4
  if (!opatLine) {
    lineWeight *= 0.2
  } else if (monitoringStrong) {
    lineWeight *= 0.45
  }
  if (state.flags?.includes('dalbavancin_continuation')) {
    lineWeight *= 0.25
  }

  let severeWeight = mortality * 4 + poorTox * 2 + poorSource * 4 - recovery * 3 + eventMods.therapyDisruption * 0.5
  if (sourceOk(state) && infectionControlled && monitoringStrong && recovery > 0.65) {
    severeWeight = Math.max(0, severeWeight * 0.15)
  }

  return [
    { id: 'resolved_completed', weight: resolvedBase },
    { id: 'rehab_monitoring', weight: Math.max(1, 3 + (state.opatReadiness < 60 ? 2 : 0) + eventMods.rehabBoost + eventMods.confusionBoost * 0.5) },
    {
      id: 'readmission_infection',
      weight: Math.max(0.5, 2 + relapse * 8 + poorSource * 6 + poorDuration * 5),
    },
    { id: 'followup_failure', weight: Math.max(0.2, followupWeight + eventMods.confusionBoost * 0.4) },
    { id: 'line_complication', weight: Math.max(0.15, lineWeight) },
    { id: 'severe_deterioration', weight: Math.max(0, severeWeight) },
  ]
}

export function resolvePostDischargeOutcome(state, rng = Math.random) {
  const weights = buildOutcomeWeights(state)
  const chosen = weightedChoice(
    weights.map((w) => ({ ...w, ...OUTCOME_COPY[w.id] })),
    rng
  )

  const outcome = {
    id: chosen.id,
    ...OUTCOME_COPY[chosen.id],
    relapseOccurred: ['readmission_infection', 'followup_failure', 'line_complication'].includes(
      chosen.id
    ),
    mortalityEvent: chosen.id === 'severe_deterioration',
  }

  return outcome
}
