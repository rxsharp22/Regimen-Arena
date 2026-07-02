export function createEventLogEntry({
  scenarioTimeHours,
  phaseId,
  phaseLabel,
  decisionId,
  optionId = null,
  optionIds = [],
  decisionLabel,
  informationAvailable,
  activeRegimen,
  hiddenEffects,
  flags,
  pendingConsequences = [],
}) {
  return {
    id: `${decisionId ?? 'advance'}_${scenarioTimeHours}_${Date.now()}`,
    scenarioTimeHours,
    phaseId,
    phaseLabel,
    decisionId,
    optionId,
    optionIds: [...optionIds],
    decisionLabel,
    informationAvailable,
    activeRegimen: [...activeRegimen],
    hiddenEffects,
    flags: [...flags],
    pendingConsequences: [...pendingConsequences],
    laterConsequences: [],
  }
}

export function attachLaterConsequences(eventLog, decisionId, consequences) {
  if (!consequences?.length) return eventLog
  return eventLog.map((entry) => {
    if (entry.decisionId !== decisionId || entry.laterConsequences.length > 0) return entry
    return { ...entry, laterConsequences: consequences }
  })
}
