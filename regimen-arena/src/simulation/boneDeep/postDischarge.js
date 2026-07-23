import { weightedChoice } from './weightedOutcomes'
import { getPostDischargeEventModifiers } from './therapyEvents'

const OUTCOME_META = {
  resolved_completed: {
    title: 'Therapy completed',
    spriteKey: 'patientImproved',
    advisorSprite: 'scribe5',
    tone: 'improving',
  },
  rehab_monitoring: {
    title: 'Rehab with monitoring burden',
    spriteKey: 'patientGeneric',
    advisorSprite: 'scribe5',
    tone: 'neutral',
  },
  readmission_infection: {
    title: 'Readmission — recurrent infection',
    spriteKey: 'patientDeclining',
    advisorSprite: 'labTech',
    tone: 'declining',
  },
  followup_failure: {
    title: 'Follow-up failure',
    spriteKey: 'patientDeclining',
    advisorSprite: 'scribe5',
    tone: 'declining',
  },
  line_complication: {
    title: 'Line complication',
    spriteKey: 'patientDeclining',
    advisorSprite: 'labTech',
    tone: 'declining',
    linkedScenario: 'Line in the Bloodstream',
  },
  severe_deterioration: {
    title: 'Severe deterioration',
    spriteKey: 'patientDeclining',
    advisorSprite: 'scribe5',
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

function formatBeats(beats) {
  return beats.filter(Boolean).join('\n\n')
}

function buildNarrativeBeats(state, outcomeId) {
  const opatLine = hasOpatLineExposure(state)
  const sourcePoor = !sourceOk(state)

  switch (outcomeId) {
    case 'resolved_completed':
      if (opatLine) {
        return [
          'Day 7 after discharge: Home health reports improving wound drainage and stable BMP.',
          'Day 21: IV antibiotic course completed. PICC removed after final dose.',
          'Day 30: No recurrent fever; outpatient wound clinic continues follow-up.',
        ]
      }
      return [
        'Day 7 after discharge: Wound drainage is decreasing on step-down oral therapy.',
        'Day 14: Interval labs and ID follow-up remain reassuring.',
        'Day 30: Planned antimicrobial course completed without readmission.',
      ]

    case 'rehab_monitoring':
      return [
        'Day 5 after discharge: The patient transfers to rehab for wound care and mobility support.',
        'Day 12: Weekly labs require repeated coordination with outside facilities.',
        'Day 21: Infection is controlled, but recovery remains monitoring-intensive.',
      ]

    case 'readmission_infection':
      return [
        sourcePoor
          ? 'Day 8 after discharge: Foot pain and drainage worsen despite oral antibiotics.'
          : 'Day 10 after discharge: Fever returns with worsening foot pain.',
        'Day 11: Repeat blood cultures are positive; imaging suggests ongoing deep infection.',
        'Day 12: The patient is readmitted for IV therapy and reassessment of source control.',
      ]

    case 'followup_failure':
      return [
        'Day 5 after discharge: The first outpatient lab draw is missed.',
        'Day 11: ID clinic follow-up is not kept; no interval creatinine is available.',
        'Day 14: EMS brings the patient to the ED with fever, confusion, and worsening wound drainage.',
      ]

    case 'line_complication':
      if (!opatLine) {
        return [
          'Day 9 after discharge: The patient reports increasing pain at a prior peripheral access site.',
          'Day 11: Local erythema prompts outpatient evaluation.',
          'Day 13: Blood cultures are obtained; readmission is arranged for parenteral therapy.',
        ]
      }
      return [
        'Day 10 after discharge: Home health notes erythema and tenderness near the line site.',
        'Day 12: The patient develops chills during infusion and stops the dose.',
        'Day 13: Blood cultures are repeated in the ED; readmission follows.',
      ]

    case 'severe_deterioration':
      return [
        'Day 9 after discharge: The patient returns with hypotension and worsening foot infection.',
        'Day 10: Broad-spectrum therapy and resuscitation are escalated in the ICU.',
        'Despite maximal support, the course progresses to septic shock and multiorgan dysfunction.',
      ]

    default:
      return ['Post-discharge course remains under close follow-up.']
  }
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
    followupWeight += 6
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
    severeWeight = Math.max(0, severeWeight * 0.12)
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
  const chosen = weightedChoice(weights, rng)
  const meta = OUTCOME_META[chosen.id]
  const narrative = formatBeats(buildNarrativeBeats(state, chosen.id))

  const outcome = {
    id: chosen.id,
    ...meta,
    narrative,
    relapseOccurred: ['readmission_infection', 'followup_failure', 'line_complication'].includes(
      chosen.id
    ),
    mortalityEvent: chosen.id === 'severe_deterioration',
  }

  return outcome
}

/** @deprecated internal copy map removed — use resolvePostDischargeOutcome */
export const OUTCOME_COPY = OUTCOME_META
