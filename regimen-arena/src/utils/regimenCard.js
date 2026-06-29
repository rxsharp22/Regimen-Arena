import { getDrugById } from './decisions'
import {
  drugMechanismLabels,
  regimenOptionMeta,
  getMechanismLabel,
} from '../data/regimenCardMeta'

const SPECTRUM_TAG_TO_CHIP = {
  MRSA: 'MRSA',
  MSSA: 'MSSA',
  'Gram-': 'Gram-negative',
  'Limited GN': 'Limited Gram-negative',
  Pseudomonas: 'Pseudomonas',
  Anaerobes: 'Anaerobes',
  Enterococcus: 'Enterococcus',
  ESBL: 'ESBL',
  VRE: 'VRE',
}

function deriveCoverageFromDrugs(drugIds) {
  const chips = new Set()
  for (const drugId of drugIds) {
    const drug = getDrugById(drugId)
    drug?.spectrum_tags?.forEach((tag) => {
      const chip = SPECTRUM_TAG_TO_CHIP[tag]
      if (chip) chips.add(chip)
    })
  }
  return [...chips]
}

export function getRegimenCardMeta(option) {
  const explicit = regimenOptionMeta[option?.id]
  if (explicit) {
    return {
      intent: explicit.intent,
      coverage: explicit.coverage,
      monitoringFlags: explicit.monitoringFlags,
      richLayout: Boolean(option?.drugs?.length),
    }
  }

  if (!option?.drugs?.length) {
    return { richLayout: false }
  }

  return {
    intent: null,
    coverage: deriveCoverageFromDrugs(option.drugs),
    monitoringFlags: [],
    richLayout: true,
  }
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
