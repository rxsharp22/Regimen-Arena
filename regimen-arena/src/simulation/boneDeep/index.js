import { createInitialBoneDeepState } from './state'
import { applyBoneDeepDecision } from './decisionEffects'
import { advanceBoneDeepTime, getPhaseTimeHours } from './timeProgression'
import { projectClinicalState, buildImmediateClinicalUpdate } from './clinicalProjection'
import { buildBoneDeepDebrief, computeDebriefTier } from './debrief'
import { createEventLogEntry, attachLaterConsequences } from './eventLog'

export function initBoneDeepSimulation() {
  const simulation = createInitialBoneDeepState()
  const clinicalSnapshot = projectClinicalState(simulation)
  return { simulation, clinicalSnapshot, eventLog: [] }
}

export function processBoneDeepDecision({
  simulation,
  eventLog,
  clinicalSnapshot,
  decisionPoint,
  option,
  subOption,
  phaseId,
  phaseLabel,
  informationAvailable,
  activeDrugsBefore,
}) {
  const decisionLabel = subOption
    ? `${option.label} → ${subOption.label}`
    : decisionPoint.type === 'multi_select'
      ? option.selectedIds
          ?.map((id) => decisionPoint.options.find((o) => o.id === id)?.label)
          .filter(Boolean)
          .join('; ') || 'Monitoring plan'
      : option.label

  const { state: nextSim, hiddenEffects, flags, pendingConsequences, monitoringScore } =
    applyBoneDeepDecision(simulation, decisionPoint, option, subOption, activeDrugsBefore)

  const activeRegimen =
    nextSim.activeTherapy.length > 0 ? nextSim.activeTherapy : activeDrugsBefore

  const optionIds =
    decisionPoint.type === 'multi_select'
      ? option.selectedIds ?? []
      : [option.id, subOption?.id].filter(Boolean)

  const logEntry = createEventLogEntry({
    scenarioTimeHours: nextSim.scenarioTimeHours,
    phaseId,
    phaseLabel,
    decisionId: decisionPoint.id,
    optionId: decisionPoint.type === 'multi_select' ? null : option.id ?? null,
    optionIds,
    decisionLabel,
    informationAvailable,
    activeRegimen,
    hiddenEffects,
    flags,
    pendingConsequences,
  })

  const clinicalUpdate = buildImmediateClinicalUpdate(nextSim, decisionLabel, hiddenEffects)
  const nextSnapshot = clinicalUpdate.snapshot

  return {
    simulation: nextSim,
    eventLog: [...eventLog, logEntry],
    clinicalSnapshot: nextSnapshot,
    clinicalUpdate,
    activeDrugs: activeRegimen,
    activeFlags: nextSim.flags,
    hiddenEffects,
    monitoringScore,
  }
}

export function processBoneDeepPhaseAdvance({
  simulation,
  eventLog,
  clinicalSnapshot,
  phaseId,
}) {
  const { state: nextSim, clinicalNarratives, triggeredConsequences } = advanceBoneDeepTime(
    simulation,
    phaseId
  )

  let nextLog = eventLog
  if (triggeredConsequences.length > 0) {
    const lastDecision = [...eventLog].reverse().find((e) => e.decisionId)
    if (lastDecision) {
      nextLog = attachLaterConsequences(eventLog, lastDecision.decisionId, triggeredConsequences)
    }
  }

  const prevSnapshot = clinicalSnapshot
  const nextSnapshot = projectClinicalState(nextSim, prevSnapshot)

  return {
    simulation: { ...nextSim, scenarioTimeHours: getPhaseTimeHours(phaseId) ?? nextSim.scenarioTimeHours },
    eventLog: nextLog,
    clinicalSnapshot: nextSnapshot,
    phaseNarratives: clinicalNarratives,
    conditionalEvents: buildConditionalEvents(nextSim, triggeredConsequences),
  }
}

function buildConditionalEvents(simulation, narratives) {
  const events = []
  for (const narrative of narratives) {
    if (narrative.includes('AKI')) {
      events.push({ type: 'toxicity_event', content: narrative })
    } else if (narrative.includes('Persistent') || narrative.includes('positive')) {
      events.push({ type: 'treatment_failure', content: narrative })
    } else if (narrative.includes('Relapse')) {
      events.push({ type: 'relapse_event', content: narrative })
    } else if (narrative.includes('abscess') || narrative.includes('source control')) {
      events.push({ type: 'clinical_update', content: narrative })
    } else {
      events.push({ type: 'clinical_update', content: narrative })
    }
  }
  if (simulation.akiOccurred && !narratives.some((n) => n.includes('AKI'))) {
    events.push({
      type: 'toxicity_event',
      content: `SCr ${simulation.creatinine.toFixed(1)} mg/dL — nephrotoxicity concern with current regimen.`,
    })
  }
  return events
}

export function finalizeBoneDeepSimulation(simulation, eventLog, score, criticalFlags) {
  const debrief = buildBoneDeepDebrief(simulation, eventLog, score, criticalFlags)
  const outcomeTier = computeDebriefTier(debrief, criticalFlags)
  return { debrief, outcomeTier }
}

export { projectClinicalState, buildImmediateClinicalUpdate }
