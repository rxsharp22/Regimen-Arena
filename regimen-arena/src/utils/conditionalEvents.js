import conditionalEventsData from '../data/conditionalEvents.json'
import phases from '../data/phases.json'
import { applyScoreModifiers } from './scoring'

export function resolveConditionalEvents(phaseIndex, activeDrugs, activeFlags) {
  const phaseId = phases[phaseIndex]?.id
  if (!phaseId) return { events: [], scorePenalty: null }

  const triggered = conditionalEventsData.filter((event) => {
    const drugMatch = event.trigger_drug && activeDrugs.includes(event.trigger_drug)
    const flagMatch = event.trigger_flag && activeFlags.includes(event.trigger_flag)
    return (drugMatch || flagMatch) && event.trigger_phase === phaseId
  })

  let score = null
  for (const event of triggered) {
    if (event.score_penalty) {
      score = applyScoreModifiers(score ?? {}, event.score_penalty)
    }
  }

  return { events: triggered, scorePenalty: score }
}

export function getConditionalEventsForPhase(phaseId, activeDrugs, activeFlags) {
  return conditionalEventsData.filter((event) => {
    const drugMatch = event.trigger_drug && activeDrugs.includes(event.trigger_drug)
    const flagMatch = event.trigger_flag && activeFlags.includes(event.trigger_flag)
    return (drugMatch || flagMatch) && event.trigger_phase === phaseId
  })
}
