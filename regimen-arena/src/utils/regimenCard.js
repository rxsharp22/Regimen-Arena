import { getDrugById } from './decisions'
import {
  getMechanismLabel,
  getOptionDisplayMeta,
  getNeutralDrugFacts,
  drugMechanismLabels,
} from '../data/regimenCardMeta'

function deriveDrugClassSubtitle(drugIds, optionId) {
  const override = getOptionDisplayMeta(optionId)?.drugClass
  if (override) return override

  if (drugIds.length === 1) {
    return getDrugById(drugIds[0])?.class ?? null
  }

  if (drugIds.length > 1) {
    return drugIds
      .map((id) => getDrugById(id)?.class)
      .filter(Boolean)
      .join(' + ')
  }

  return null
}

/**
 * Neutral pre-choice display data. No rationale, coverage hints, or stewardship conclusions.
 */
export function getOptionDisplay(option) {
  const drugIds = option?.drugs ?? []
  const drugClass = deriveDrugClassSubtitle(drugIds, option?.id)

  const neutralDrugFacts = drugIds.flatMap((id) => {
    const drug = getDrugById(id)
    const facts = getNeutralDrugFacts(id)
    return drug
      ? [{ drugName: drug.display_name, route: drug.route, class: drug.class, facts }]
      : []
  })

  return {
    actionLabel: option?.label ?? '',
    drugClass,
    neutralDrugFacts,
    hasDrugDetails: drugIds.length > 0,
  }
}

/** @deprecated Use getOptionDisplay — kept for any guided-mode expansion */
export function getRegimenCardMeta(option) {
  const display = getOptionDisplay(option)
  return {
    subtitle: display.drugClass,
    richLayout: display.hasDrugDetails,
    showDetailsByDefault: false,
    coverage: [],
    monitoringFlags: [],
  }
}

export function getRegimenTeachingNotes(optionId) {
  return getOptionDisplayMeta(optionId)?.stewardshipTeaching ?? null
}

export function getMechanismLabelsForDrugs(drugIds = []) {
  return drugIds
    .map((id) => {
      const drug = getDrugById(id)
      const label = getMechanismLabel(id)
      if (!drug && !label) return null
      return {
        drugId: id,
        drugName: drug?.display_name ?? id.replace(/_/g, ' '),
        mechanism: label ?? drug?.mechanism_short ?? null,
      }
    })
    .filter(Boolean)
}

export { drugMechanismLabels, getMechanismLabel }
