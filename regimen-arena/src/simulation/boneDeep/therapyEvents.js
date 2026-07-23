import { clamp } from './state'
import { weightedChoice } from './weightedOutcomes'
import { rollDaptoToxicity } from './weightedOutcomes'

export const MAX_THERAPY_EVENTS_PER_RUN = 2
export const MAX_THERAPY_EVENTS_HIGH_RISK = 3

export function createInitialTherapyEventState() {
  return {
    eligibleEvents: [],
    triggeredEvents: [],
    resolvedEvents: [],
    unresolvedEvents: [],
    eventResponses: {},
    eventsThisRun: 0,
  }
}

/** Maps therapy event id → response decision point id */
export const THERAPY_EVENT_DECISION_IDS = {
  dapto_ck_toxicity: 'dp_dapto_toxicity_response',
  vanco_infusion_reaction: 'dp_vanco_infusion_response',
  cefepime_neurotoxicity: 'dp_cefepime_neuro_response',
  beta_lactam_allergy_clarification: 'dp_allergy_clarification',
}

const EVENT_META = {
  dapto_ck_toxicity: {
    label: 'Daptomycin toxicity signal',
    type: 'toxicity_event',
    countsTowardCap: true,
    rollPhases: ['phase_06'],
    noProcPenalty: true,
  },
  vanco_infusion_reaction: {
    label: 'Vancomycin infusion reaction',
    type: 'toxicity_event',
    countsTowardCap: true,
    rollPhases: ['phase_02b', 'phase_03', 'phase_04'],
    noProcPenalty: true,
  },
  cefepime_neurotoxicity: {
    label: 'Cefepime neurotoxicity concern',
    type: 'toxicity_event',
    countsTowardCap: true,
    rollPhases: ['phase_04', 'phase_06'],
    noProcPenalty: true,
  },
  beta_lactam_allergy_clarification: {
    label: 'Beta-lactam allergy clarification',
    type: 'stewardship_opportunity',
    countsTowardCap: false,
    rollPhases: ['phase_05'],
    deterministic: true,
    noProcPenalty: true,
  },
}

function alreadyTriggered(state, eventId) {
  const tes = state.therapyEventState ?? createInitialTherapyEventState()
  return tes.triggeredEvents.some((e) => e.id === eventId)
}

function eventsCap(state) {
  const highRisk =
    state.toxicityBurden >= 8 ||
    (!state.renalDoseAdjusted && state.creatinine >= 2.2) ||
    state.flags?.includes('critical_no_monitoring_plan')
  return highRisk ? MAX_THERAPY_EVENTS_HIGH_RISK : MAX_THERAPY_EVENTS_PER_RUN
}

function frequencyDampening(state) {
  const n = state.therapyEventState?.eventsThisRun ?? 0
  if (n >= 2) return 0.15
  if (n >= 1) return 0.4
  return 1
}

function eligibleVancoInfusion(state) {
  if (!state.activeTherapy?.includes('vancomycin')) return false
  if (alreadyTriggered(state, 'vanco_infusion_reaction')) return false
  if (state.flags?.includes('vanco_infusion_occurred')) return false
  return state.scenarioTimeHours <= 48 || state.scenarioTimeHours === 0
}

function weightVancoInfusion(state) {
  let w = 1.2
  if (state.toxicityBurden >= 6) w *= 1.5
  if (!state.renalDoseAdjusted && state.creatinine >= 2.0) w *= 1.3
  if (state.scenarioTimeHours <= 24) w *= 1.2
  return w
}

function rollVancoSeverity(state, rng) {
  return weightedChoice(
    [
      {
        id: 'mild',
        weight: 5,
        requiresResponse: false,
        narrative:
          'Nursing reports mild flushing and pruritus during the vancomycin infusion. Blood pressure remains stable. Symptoms resolve with slowing the infusion rate.',
      },
      {
        id: 'moderate',
        weight: 2 * (state.toxicityBurden >= 6 ? 1.5 : 1),
        requiresResponse: true,
        narrative:
          'Nursing reports flushing, warmth, and pruritus during the vancomycin infusion. Blood pressure remains stable. The infusion is paused while symptoms are assessed.',
      },
      {
        id: 'severe',
        weight: 0.4,
        requiresResponse: true,
        narrative:
          'During vancomycin infusion the patient develops pronounced flushing, pruritus, and chest tightness. Blood pressure remains stable but symptoms require evaluation before restart.',
      },
    ],
    rng
  )
}

function eligibleCefepimeNeuro(state) {
  if (!state.activeTherapy?.includes('cefepime')) return false
  if (alreadyTriggered(state, 'cefepime_neurotoxicity')) return false
  return state.creatinine >= 2.0 || state.renalTrend === 'worsening'
}

function weightCefepimeNeuro(state) {
  let w = 1.0
  if (state.renalDoseAdjusted) w *= 0.25
  if (!state.renalDoseAdjusted) w *= 2.2
  if (state.creatinine >= 2.2) w *= 1.5
  if (state.scenarioTimeHours >= 36) w *= 1.3
  if (state.toxicityBurden >= 6) w *= 1.2
  return w
}

function eligibleAllergyClarification(state) {
  if (alreadyTriggered(state, 'beta_lactam_allergy_clarification')) return false
  if (state.allergyStewardship === 'clarified_low_risk') return false
  if (state.allergyStewardship === 'avoided_despite_clarification') return false
  return state.organismRevealed && state.organismIdentity === 'MSSA'
}

function eligibleDapto(state) {
  if (!state.activeTherapy?.includes('daptomycin')) return false
  if (state.daptoToxicityTier) return false
  if (alreadyTriggered(state, 'dapto_ck_toxicity')) return false
  return true
}

function buildTriggeredRecord(eventId, phaseId, severity, narrative, requiresResponse) {
  return {
    id: eventId,
    label: EVENT_META[eventId]?.label ?? eventId,
    phaseId,
    severity,
    narrative,
    requiresResponse,
    resolved: false,
    mishandled: false,
    responseDecisionId: requiresResponse ? THERAPY_EVENT_DECISION_IDS[eventId] : null,
    triggeredAtHours: null,
  }
}

function appendTherapyEvent(state, record, countsTowardCap) {
  const tes = { ...(state.therapyEventState ?? createInitialTherapyEventState()) }
  tes.triggeredEvents = [...tes.triggeredEvents, { ...record, triggeredAtHours: state.scenarioTimeHours }]
  if (record.requiresResponse) {
    tes.unresolvedEvents = [...tes.unresolvedEvents, record.id]
  } else {
    tes.resolvedEvents = [...tes.resolvedEvents, record.id]
  }
  if (countsTowardCap) {
    tes.eventsThisRun += 1
  }
  return { ...state, therapyEventState: tes }
}

function syncDaptomycinLegacy(state, roll) {
  if (!roll) return state
  let next = {
    ...state,
    daptoToxicityTier: roll.tier,
    daptoToxicityNarrative: roll.narrative,
  }
  if (roll.requiresResponse) {
    next.daptoToxicityPending = true
    next.toxicityBurden = clamp(next.toxicityBurden + 2, 0, 100)
  }
  return next
}

function procDaptoEvent(state, phaseId, rng) {
  const roll = rollDaptoToxicity(state, rng)
  if (!roll || roll.id === 'dapto_ck_stable') return { state, narrative: null, proc: null }
  if (roll.id === 'dapto_ck_mild' && rng() > 0.5) {
    return {
      state: syncDaptomycinLegacy(
        appendTherapyEvent(
          state,
          buildTriggeredRecord('dapto_ck_toxicity', phaseId, 'mild', roll.narrative, false),
          true
        ),
        roll
      ),
      narrative: roll.narrative,
      proc: 'dapto_ck_toxicity',
    }
  }
  const requiresResponse = roll.requiresResponse
  const record = buildTriggeredRecord(
    'dapto_ck_toxicity',
    phaseId,
    roll.tier,
    roll.narrative,
    requiresResponse
  )
  let next = appendTherapyEvent(state, record, true)
  next = syncDaptomycinLegacy(next, roll)
  next.variabilityFlags = [...(next.variabilityFlags ?? []), roll.id]
  return { state: next, narrative: roll.narrative, proc: 'dapto_ck_toxicity' }
}

function procVancoEvent(state, phaseId, rng) {
  const severity = rollVancoSeverity(state, rng)
  if (!severity) return { state, narrative: null, proc: null }
  const record = buildTriggeredRecord(
    'vanco_infusion_reaction',
    phaseId,
    severity.id,
    severity.narrative,
    severity.requiresResponse
  )
  let next = appendTherapyEvent(state, record, true)
  next.flags = [...new Set([...next.flags, 'vanco_infusion_occurred'])]
  if (severity.requiresResponse) {
    next.toxicityBurden = clamp(next.toxicityBurden + 1, 0, 100)
  }
  return { state: next, narrative: severity.narrative, proc: 'vanco_infusion_reaction' }
}

function procCefepimeEvent(state, phaseId) {
  const narrative =
    'Overnight, nursing notes new confusion and intermittent myoclonic jerks. Renal function remains impaired, and cefepime exposure is reassessed among other causes.'
  const record = buildTriggeredRecord(
    'cefepime_neurotoxicity',
    phaseId,
    'moderate',
    narrative,
    true
  )
  let next = appendTherapyEvent(state, record, true)
  next.toxicityBurden = clamp(next.toxicityBurden + 2, 0, 100)
  next.flags = [...new Set([...next.flags, 'cefepime_neuro_occurred'])]
  return { state: next, narrative, proc: 'cefepime_neurotoxicity' }
}

function procAllergyEvent(state, phaseId) {
  const narrative =
    'Allergy history is clarified: childhood rash only, no anaphylaxis, no severe cutaneous reaction, and the patient later tolerated cephalexin.'
  const record = buildTriggeredRecord(
    'beta_lactam_allergy_clarification',
    phaseId,
    'opportunity',
    narrative,
    true
  )
  return {
    state: appendTherapyEvent(state, record, false),
    narrative,
    proc: 'beta_lactam_allergy_clarification',
  }
}

/**
 * Roll at most one weighted therapy event per phase entry.
 * Allergy clarification is deterministic on phase_05 when eligible.
 */
export function processTherapyEventsOnPhaseEnter(state, phaseId, rng = Math.random) {
  const narratives = []
  let next = { ...state }

  if (!next.therapyEventState) {
    next.therapyEventState = createInitialTherapyEventState()
  }

  // Deterministic stewardship opportunity — does not count toward adverse-event cap
  if (phaseId === 'phase_05' && eligibleAllergyClarification(next)) {
    const result = procAllergyEvent(next, phaseId)
    next = result.state
    narratives.push(result.narrative)
    return { state: next, narratives, conditionalEvents: buildConditionalFromProc(result.proc, result.narrative) }
  }

  const cap = eventsCap(next)
  if (next.therapyEventState.eventsThisRun >= cap) {
    return { state: next, narratives, conditionalEvents: [] }
  }

  const damp = frequencyDampening(next)
  const candidates = []

  if (EVENT_META.dapto_ck_toxicity.rollPhases.includes(phaseId) && eligibleDapto(next)) {
    candidates.push({ id: 'dapto_ck_toxicity', weight: 2.0 * damp })
  }
  if (EVENT_META.vanco_infusion_reaction.rollPhases.includes(phaseId) && eligibleVancoInfusion(next)) {
    candidates.push({ id: 'vanco_infusion_reaction', weight: weightVancoInfusion(next) * damp })
  }
  if (EVENT_META.cefepime_neurotoxicity.rollPhases.includes(phaseId) && eligibleCefepimeNeuro(next)) {
    candidates.push({ id: 'cefepime_neurotoxicity', weight: weightCefepimeNeuro(next) * damp })
  }

  if (!candidates.length) {
    return { state: next, narratives, conditionalEvents: [] }
  }

  // No-proc branch — weighted chance to skip all events this phase
  const noProcWeight = 6 + (next.therapyEventState.eventsThisRun === 0 ? 3 : 0)
  const totalProcWeight = candidates.reduce((s, c) => s + c.weight, 0)
  const roll = rng() * (totalProcWeight + noProcWeight)
  if (roll > totalProcWeight) {
    return { state: next, narratives, conditionalEvents: [] }
  }

  const chosen = weightedChoice(candidates, rng)
  if (!chosen) {
    return { state: next, narratives, conditionalEvents: [] }
  }

  let result
  switch (chosen.id) {
    case 'dapto_ck_toxicity':
      result = procDaptoEvent(next, phaseId, rng)
      break
    case 'vanco_infusion_reaction':
      result = procVancoEvent(next, phaseId, rng)
      break
    case 'cefepime_neurotoxicity':
      result = procCefepimeEvent(next, phaseId)
      break
    default:
      return { state: next, narratives, conditionalEvents: [] }
  }

  next = result.state
  if (result.narrative) narratives.push(result.narrative)

  return {
    state: next,
    narratives,
    conditionalEvents: buildConditionalFromProc(result.proc, result.narrative),
  }
}

function buildConditionalFromProc(procId, narrative) {
  if (!procId || !narrative) return []
  const meta = EVENT_META[procId]
  const type = meta?.type === 'stewardship_opportunity' ? 'clinical_update' : 'toxicity_event'
  return [{ type, content: narrative, therapyEventId: procId }]
}

/** Pending response decision point id, if any. Preserves legacy daptomycin check. */
export function getPendingTherapyEventDecisionId(simulation, decisions = {}) {
  if (!simulation) return null

  if (simulation.daptoToxicityPending && !decisions.dp_dapto_toxicity_response) {
    return 'dp_dapto_toxicity_response'
  }

  const tes = simulation.therapyEventState
  if (!tes?.unresolvedEvents?.length) return null

  for (const eventId of tes.unresolvedEvents) {
    const decisionId = THERAPY_EVENT_DECISION_IDS[eventId]
    if (decisionId && !decisions[decisionId]) {
      return decisionId
    }
  }
  return null
}

export function getTriggeredTherapyEvent(simulation, decisionId) {
  const tes = simulation?.therapyEventState
  if (!tes) return null
  const eventId = Object.entries(THERAPY_EVENT_DECISION_IDS).find(([, id]) => id === decisionId)?.[0]
  if (!eventId) return null
  return tes.triggeredEvents.find((e) => e.id === eventId && !e.resolved) ?? null
}

export function markTherapyEventResolved(state, eventId, optionId, mishandled = false) {
  const tes = { ...(state.therapyEventState ?? createInitialTherapyEventState()) }
  tes.unresolvedEvents = tes.unresolvedEvents.filter((id) => id !== eventId)
  if (!tes.resolvedEvents.includes(eventId)) {
    tes.resolvedEvents = [...tes.resolvedEvents, eventId]
  }
  tes.eventResponses = { ...tes.eventResponses, [eventId]: optionId }
  tes.triggeredEvents = tes.triggeredEvents.map((e) =>
    e.id === eventId ? { ...e, resolved: true, mishandled, responseId: optionId } : e
  )
  return { ...state, therapyEventState: tes }
}

export function getTherapyEventsForDebrief(simulation) {
  return simulation?.therapyEventState?.triggeredEvents ?? []
}

const RESPONSE_LABELS = {
  vanco_pause_slow_restart: 'Pause, assess, restart at slower rate',
  vanco_slow_premed: 'Slow future infusions; consider premedication',
  vanco_document_infusion_reaction: 'Document infusion reaction (not IgE allergy)',
  vanco_stop_permanent: 'Stop vancomycin permanently',
  vanco_continue_unchanged: 'Continue infusion unchanged',
  cefepime_adjust_monitor: 'Renally adjust cefepime and monitor neurologic status',
  cefepime_hold_switch: 'Hold cefepime and switch gram-negative coverage',
  cefepime_evaluate_other_causes: 'Evaluate other causes while reassessing cefepime',
  cefepime_continue_unchanged: 'Continue cefepime unchanged',
  allergy_proceed_cefazolin: 'Document low-risk allergy; proceed with cefazolin',
  allergy_test_dose: 'Request cautious test dose or allergy evaluation',
  allergy_avoid_all_beta_lactams: 'Avoid all beta-lactams despite clarification',
  allergy_continue_non_beta_lactam: 'Continue non-beta-lactam without reconciliation',
  dapto_resp_continue_monitor: 'Continue daptomycin with closer CK monitoring',
  dapto_resp_hold_recheck_ck: 'Hold dose; recheck CK and symptoms',
  dapto_resp_switch_cefazolin: 'Switch to cefazolin',
  dapto_resp_switch_vancomycin: 'Switch to vancomycin',
  dapto_resp_hold_switch_beta_lactam: 'Hold daptomycin; switch to beta-lactam',
}

const THERAPY_EVENT_DEBRIEF = {
  dapto_ck_toxicity: {
    type: 'toxicity_event',
    expertNote:
      'Rising CK on daptomycin warrants dose hold, closer monitoring, or transition to MSSA-appropriate beta-lactam when allergy history is low risk.',
  },
  vanco_infusion_reaction: {
    type: 'toxicity_event',
    expertNote:
      'Vancomycin infusion reactions are typically rate-related and distinct from IgE-mediated allergy. Slowing or pausing the infusion with appropriate documentation preserves therapy when still indicated.',
    terminologyNote:
      'Older literature may refer to "red man syndrome"; contemporary charting favors "vancomycin infusion reaction."',
  },
  cefepime_neurotoxicity: {
    type: 'toxicity_event',
    expertNote:
      'Cefepime neurotoxicity risk rises with renal impairment and inadequate dose adjustment. Confusion should prompt reassessment of cefepime exposure among other causes.',
  },
  beta_lactam_allergy_clarification: {
    type: 'stewardship_opportunity',
    expertNote:
      'Low-risk penicillin allergy (childhood rash, no anaphylaxis, tolerated cephalosporin) supports beta-lactam use for MSSA when source control and susceptibilities allow — cefazolin does not cover MRSA.',
  },
}

/** Debrief-only teaching entries for events that actually triggered. */
export function buildTherapyEventDebriefEntries(simulation) {
  const events = getTherapyEventsForDebrief(simulation)
  return events.map((ev) => {
    const meta = THERAPY_EVENT_DEBRIEF[ev.id] ?? {}
    const responseLabel = ev.responseId ? RESPONSE_LABELS[ev.responseId] ?? ev.responseId : null
    let impact
    if (!ev.requiresResponse) {
      impact = 'Observed during the admission; no separate response decision was required.'
    } else if (!ev.resolved) {
      impact = 'Response was not completed before discharge — downstream safety and recovery risk may persist.'
    } else if (ev.mishandled) {
      impact = 'The selected response increased toxicity burden, delayed recovery, or missed a stewardship opportunity.'
    } else {
      impact = 'The response appropriately addressed the clinical signal and limited downstream harm.'
    }
    return {
      id: ev.id,
      label: ev.label ?? EVENT_META[ev.id]?.label ?? ev.id,
      type: meta.type ?? EVENT_META[ev.id]?.type ?? 'therapy_event',
      severity: ev.severity,
      narrative: ev.narrative,
      responseLabel,
      resolved: ev.resolved,
      mishandled: ev.mishandled,
      impact,
      expertNote: meta.expertNote ?? null,
      terminologyNote: meta.terminologyNote ?? null,
    }
  })
}

export function getPostDischargeEventModifiers(state) {
  const tes = state.therapyEventState
  if (!tes) return { rehabBoost: 0, confusionBoost: 0, resolvedBoost: 0, therapyDisruption: 0 }

  let rehabBoost = 0
  let confusionBoost = 0
  let resolvedBoost = 0
  let therapyDisruption = 0

  for (const ev of tes.triggeredEvents) {
    if (ev.id === 'cefepime_neurotoxicity' && (ev.mishandled || tes.unresolvedEvents.includes(ev.id))) {
      rehabBoost += 3
      confusionBoost += 4
    }
    if (ev.id === 'cefepime_neurotoxicity' && ev.responseId && !ev.mishandled) {
      rehabBoost -= 1
    }
    if (ev.id === 'vanco_infusion_reaction' && ev.mishandled) {
      therapyDisruption += 3
    }
    if (ev.id === 'vanco_infusion_reaction' && ev.responseId === 'vanco_stop_permanent') {
      therapyDisruption += 2
    }
    if (ev.id === 'beta_lactam_allergy_clarification' && ev.responseId === 'allergy_proceed_cefazolin') {
      resolvedBoost += 2
    }
    if (ev.id === 'beta_lactam_allergy_clarification' && ev.responseId === 'allergy_avoid_all_beta_lactams') {
      therapyDisruption += 2
    }
    if (ev.id === 'dapto_ck_toxicity' && (ev.mishandled || tes.unresolvedEvents.includes(ev.id))) {
      rehabBoost += 2
      confusionBoost += 1
    }
  }

  return { rehabBoost, confusionBoost, resolvedBoost, therapyDisruption }
}
