import { getDrugById } from './decisions'

function formatNewInformationItem(item) {
  if (item.content) return item.content
  if (item.organism) {
    return `${item.organism}${item.interpretation ? ` — ${item.interpretation}` : ''}`
  }
  return null
}

export function buildWhatChanged(phase, conditionalEvents = [], phaseIndex = 0) {
  const items = []

  for (const info of phase?.new_information ?? []) {
    const text = formatNewInformationItem(info)
    if (text) items.push({ prefix: 'New', text })
  }

  for (const event of conditionalEvents) {
    if (event.content) {
      items.push({ prefix: 'New', text: event.content })
    }
  }

  if (items.length === 0 && phaseIndex > 0) {
    return [
      {
        prefix: 'Note',
        text: 'No new diagnostic data. Clinical course is being reassessed.',
      },
    ]
  }

  return items
}

export function buildSituationSnapshot(clinicalSnapshot, simulation) {
  if (!clinicalSnapshot) return []

  const bullets = []

  if (clinicalSnapshot.woundStatus) {
    bullets.push(clinicalSnapshot.woundStatus)
  }
  if (clinicalSnapshot.cultureStatus) {
    bullets.push(clinicalSnapshot.cultureStatus)
  }
  if (clinicalSnapshot.organismStatus && clinicalSnapshot.organismStatus !== 'Organism not yet identified') {
    bullets.push(clinicalSnapshot.organismStatus)
  } else if (simulation?.gramStainRevealed && !simulation?.organismRevealed) {
    bullets.push('Gram-positive cocci in clusters — identification pending')
  }
  if (clinicalSnapshot.renalStatus) {
    bullets.push(clinicalSnapshot.renalStatus)
  }
  if (clinicalSnapshot.sourceControlLabel) {
    bullets.push(clinicalSnapshot.sourceControlLabel)
  }

  return bullets.slice(0, 4)
}

export function buildActiveConcerns({ clinicalSnapshot, simulation, activeDrugs = [] }) {
  const concerns = []

  if (
    simulation?.bacteremiaStatus === 'positive_pending' ||
    simulation?.bacteremiaStatus === 'positive_confirmed' ||
    simulation?.bacteremiaStatus === 'persistent'
  ) {
    concerns.push({ id: 'bacteremia', label: 'Bacteremia' })
  }
  if (simulation?.creatinine >= 1.9 || clinicalSnapshot?.renalWarning) {
    concerns.push({ id: 'ckd', label: 'CKD / renal dosing' })
  }
  if (
    simulation?.sourceControlStatus === 'uncontrolled_abscess' ||
    simulation?.sourceControlStatus === 'delayed' ||
    simulation?.sourceControlStatus === 'inadequate' ||
    simulation?.sourceControlStatus === 'scheduled'
  ) {
    concerns.push({ id: 'source', label: 'Source control needed' })
  }
  if (!simulation?.organismRevealed) {
    concerns.push({ id: 'cultures', label: 'Cultures pending' })
  }
  if (simulation?.daptoToxicityPending || simulation?.toxicityBurden >= 7) {
    concerns.push({ id: 'toxicity', label: 'Toxicity monitoring' })
  }
  if (simulation?.opatReadiness >= 40 || simulation?.dischargeReadiness >= 40) {
    concerns.push({ id: 'opat', label: 'OPAT planning' })
  }
  if (simulation?.dischargeReadiness < 40 && simulation?.scenarioTimeHours >= 120) {
    concerns.push({ id: 'discharge', label: 'Discharge delayed' })
  }
  if (activeDrugs.includes('daptomycin')) {
    concerns.push({ id: 'ck', label: 'CK monitoring' })
  }

  return concerns
}

export function buildActiveTherapySummary(activeDrugs = []) {
  if (!activeDrugs.length) return 'No active antimicrobial orders'
  return activeDrugs.map((id) => getDrugById(id)?.display_name ?? id).join(' + ')
}
