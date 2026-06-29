import patientTimeline from '../data/patientTimeline.json'
import { PHASE_ARENA_CONFIG, INFECTION_SITE_LABEL } from '../data/arenaStageMeta'
import { inferOrganismIdFromText } from '../data/visualAssets'
import { isGuidedMode } from '../data/displayMode'
import patient from '../data/patient.json'

const ADVERSE_TYPES = new Set(['toxicity_event', 'treatment_failure', 'relapse_event'])

function organismFromPhase(phase) {
  for (const item of phase?.new_information ?? []) {
    if (item.organism || item.interpretation) {
      const id =
        inferOrganismIdFromText(item.interpretation) ?? inferOrganismIdFromText(item.organism)
      return {
        status: item.interpretation ?? item.organism ?? 'Identified',
        organismId: id,
      }
    }
    if (item.content?.includes('MSSA')) {
      return { status: 'Staphylococcus aureus — oxacillin susceptible', organismId: 'mssa' }
    }
  }
  return null
}

function formatAllergyFact(allergy) {
  if (!allergy) return 'None documented'
  return `Reported ${allergy.reaction} with ${allergy.allergen} (${allergy.onset}). No anaphylaxis, angioedema, or severe cutaneous reaction documented.`
}

function buildVitalsFact(vitals, trend) {
  if (!vitals) return null
  const trendNote = trend?.scr === 'up' ? ' · SCr ↑' : trend?.scr === 'down' ? ' · SCr ↓' : ''
  return `T ${vitals.temp_c}°C · HR ${vitals.hr} · BP ${vitals.bp} · SCr ${vitals.scr} · WBC ${vitals.wbc}${trendNote}`
}

export function getArenaStageContext({ phase, conditionalEvents = [], activeDrugs = [] }) {
  const config = PHASE_ARENA_CONFIG[phase?.id] ?? {
    stageLabel: phase?.label ?? 'Clinical phase',
    cultureStatus: 'See chart update',
    organismStatus: 'See chart update',
    organismId: null,
    sourceControl: 'See clinical notes',
    statusUpdate: phase?.narrative ?? '',
    directiveGuided: phase?.narrative ?? '',
  }

  const timeline = patientTimeline[phase?.id]
  const organismFromChart = organismFromPhase(phase)
  const guided = isGuidedMode()

  const organismStatus = organismFromChart?.status ?? config.organismStatus
  const organismId = organismFromChart?.organismId ?? config.organismId

  const scr = timeline?.vitals?.scr ?? patient?.labs?.scr
  const crcl = patient?.labs?.crcl_estimated

  const modifiers = [
    {
      id: 'renal',
      label: 'Renal function',
      value: scr ? `SCr ${scr} mg/dL · baseline CKD 3b (CrCl ~${crcl} mL/min)` : `Est. CrCl ${crcl} mL/min`,
      alert: false,
    },
    {
      id: 'allergy',
      label: 'Allergy history',
      value: formatAllergyFact(patient?.allergies?.[0]),
      alert: false,
    },
    {
      id: 'vitals',
      label: 'Vitals / labs',
      value: buildVitalsFact(timeline?.vitals, timeline?.trend) ?? 'See chart',
      alert: false,
    },
    {
      id: 'source',
      label: 'Source control',
      value: config.sourceControl,
      alert: false,
    },
  ]

  const clinicalFacts = []
  const vitalsFact = buildVitalsFact(timeline?.vitals, timeline?.trend)
  if (vitalsFact) clinicalFacts.push(vitalsFact)
  if (timeline?.status_text) clinicalFacts.push(timeline.status_text)

  const hasAdverse = conditionalEvents.some((e) => ADVERSE_TYPES.has(e.type))
  if (hasAdverse) {
    const event = conditionalEvents.find((e) => ADVERSE_TYPES.has(e.type))
    if (event?.content) clinicalFacts.push(event.content)
  }

  return {
    infectionSite: INFECTION_SITE_LABEL,
    stageLabel: config.stageLabel,
    cultureStatus: config.cultureStatus,
    organismStatus,
    organismId,
    sourceControl: config.sourceControl,
    statusUpdate: config.statusUpdate,
    directive: guided ? (config.directiveGuided ?? config.statusUpdate) : config.statusUpdate,
    modifiers,
    clinicalFacts,
    deployedDrugIds: activeDrugs,
  }
}
