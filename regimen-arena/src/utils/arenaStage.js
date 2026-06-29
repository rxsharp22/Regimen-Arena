import patientTimeline from '../data/patientTimeline.json'
import { PHASE_ARENA_CONFIG, INFECTION_SITE_LABEL } from '../data/arenaStageMeta'
import { inferOrganismIdFromText } from '../data/visualAssets'

const STABILITY_LABELS = {
  critical: 'Critical',
  guarded: 'Guarded',
  improving: 'Improving',
  stable: 'Stable',
}

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
      return { status: 'MSSA', organismId: 'mssa' }
    }
  }
  return null
}

export function getArenaStageContext({ phase, patient, conditionalEvents = [], activeDrugs = [] }) {
  const config = PHASE_ARENA_CONFIG[phase?.id] ?? {
    stageLabel: phase?.label ?? 'Clinical phase',
    cultureStatus: 'See chart update',
    organismStatus: 'See chart update',
    organismId: null,
    sourceControl: 'See clinical notes',
    directive: phase?.narrative ?? '',
  }

  const timeline = patientTimeline[phase?.id]
  const organismFromChart = organismFromPhase(phase)

  const organismStatus = organismFromChart?.status ?? config.organismStatus
  const organismId = organismFromChart?.organismId ?? config.organismId

  const hasAdverse = conditionalEvents.some((e) => ADVERSE_TYPES.has(e.type))
  const stabilityKey = hasAdverse ? 'critical' : timeline?.stability ?? 'guarded'

  const scr = timeline?.vitals?.scr ?? patient?.labs?.scr
  const crcl = patient?.labs?.crcl_estimated
  const renalAlert = scr >= 2.0 || (timeline?.trend?.scr === 'up' && phase?.id !== 'phase_01')

  const modifiers = [
    {
      id: 'renal',
      label: 'Renal function',
      value: scr ? `SCr ${scr} · CKD 3b` : `Est. CrCl ${crcl} mL/min`,
      alert: renalAlert,
    },
    {
      id: 'allergy',
      label: 'Allergy',
      value: patient?.allergies?.[0]
        ? `${patient.allergies[0].allergen} — ${patient.allergies[0].risk_level} risk`
        : 'None documented',
      alert: Boolean(patient?.allergies?.length),
    },
    {
      id: 'stability',
      label: 'Clinical stability',
      value: STABILITY_LABELS[stabilityKey] ?? stabilityKey,
      alert: stabilityKey === 'critical',
    },
    {
      id: 'source',
      label: 'Source control',
      value: config.sourceControl,
      alert: phase?.id === 'phase_01' || phase?.id === 'phase_02',
    },
  ]

  const pressures = []
  if (timeline?.status_text) pressures.push(timeline.status_text)
  if (hasAdverse) {
    pressures.push(conditionalEvents.find((e) => ADVERSE_TYPES.has(e.type))?.content ?? 'Adverse event active')
  }
  if (renalAlert && phase?.id !== 'phase_05') {
    pressures.push('Renal function requires dose vigilance')
  }
  if (patient?.allergies?.[0]?.risk_level === 'low') {
    pressures.push('Low-risk penicillin allergy — reconcile before beta-lactam avoidance')
  }

  return {
    infectionSite: INFECTION_SITE_LABEL,
    stageLabel: config.stageLabel,
    cultureStatus: config.cultureStatus,
    organismStatus,
    organismId,
    sourceControl: config.sourceControl,
    directive: config.directive,
    modifiers,
    pressures,
    deployedDrugIds: activeDrugs,
    stabilityKey,
  }
}
