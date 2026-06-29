import { getDrugById } from './decisions'
import {
  drugMechanismLabels,
  regimenOptionMeta,
  getMechanismLabel,
  getRegimenOptionMeta,
} from '../data/regimenCardMeta'
import { isGuidedMode } from '../data/displayMode'

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
  const guided = isGuidedMode()

  if (explicit) {
    return {
      subtitle: guided ? explicit.intent : explicit.neutralLabel,
      coverage: explicit.coverage,
      monitoringFlags: explicit.monitoringFlags,
      showDetailsByDefault: guided,
      richLayout: Boolean(option?.drugs?.length),
    }
  }

  if (!option?.drugs?.length) {
    return { richLayout: false, showDetailsByDefault: guided }
  }

  return {
    subtitle: null,
    coverage: deriveCoverageFromDrugs(option.drugs),
    monitoringFlags: [],
    showDetailsByDefault: guided,
    richLayout: true,
  }
}

export function getRegimenTeachingNotes(optionId) {
  const meta = getRegimenOptionMeta(optionId)
  if (!meta) return null

  const parts = []
  if (meta.intent) parts.push(`Regimen role: ${meta.intent}`)
  if (meta.monitoringFlags?.length) {
    parts.push(`Key considerations: ${meta.monitoringFlags.join(' · ')}`)
  }
  if (meta.teachingNotes) parts.push(meta.teachingNotes)

  return parts.length > 0 ? parts.join('\n\n') : null
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
