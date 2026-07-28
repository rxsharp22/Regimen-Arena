import { getDrugById } from '../../utils/decisions'

/** Default IV dosing labels for Bone Deep (institutional protocol shorthand). */
export const DEFAULT_THERAPY_DOSING = {
  vancomycin: { dose: '15 mg/kg', interval: 'q12h', adjusted: false },
  cefepime: { dose: '2 g', interval: 'q12h', adjusted: false },
  piperacillin_tazobactam: { dose: '3.375 g', interval: 'q6h', adjusted: false },
  daptomycin: { dose: '6 mg/kg', interval: 'q24h', adjusted: false },
  cefazolin: { dose: '2 g', interval: 'q8h', adjusted: false },
  nafcillin: { dose: '2 g', interval: 'q4h', adjusted: false },
  oxacillin: { dose: '2 g', interval: 'q4h', adjusted: false },
  linezolid: { dose: '600 mg', interval: 'q12h', adjusted: false },
  meropenem: { dose: '1 g', interval: 'q8h', adjusted: false },
  tmp_smx: { dose: '5 mg/kg', interval: 'q12h', adjusted: false },
}

export const RENAL_ADJUSTED_DOSING = {
  vancomycin: { dose: '15 mg/kg', interval: 'q24h (AUC-guided)', adjusted: true },
  cefepime: { dose: '1 g', interval: 'q12h', adjusted: true },
  piperacillin_tazobactam: { dose: '2.25 g', interval: 'q8h', adjusted: true },
  daptomycin: { dose: '6 mg/kg', interval: 'q48h', adjusted: true },
  cefazolin: { dose: '1 g', interval: 'q12h', adjusted: true },
}

/** Canonical active drug IDs — simulation.activeTherapy is source of truth. */
export function getActiveDrugIds(state) {
  if (!state) return []
  return [...(state.activeTherapy ?? [])]
}

export function isDrugActive(state, drugId) {
  return getActiveDrugIds(state).includes(drugId)
}

export function getActiveRegimen(state) {
  return getActiveDrugIds(state)
}

export function getTherapyDosing(state, drugId) {
  const custom = state?.therapyDosing?.[drugId]
  if (custom) return custom
  return DEFAULT_THERAPY_DOSING[drugId] ?? null
}

export function formatDrugDosing(state, drugId) {
  const drug = getDrugById(drugId)
  const dosing = getTherapyDosing(state, drugId)
  const name = drug?.display_name ?? drugId
  if (!dosing) return name
  return `${name} ${dosing.dose} IV ${dosing.interval}`
}

export function getActiveTherapyDisplay(state) {
  const ids = getActiveDrugIds(state)
  if (!ids.length) return 'No active antimicrobial orders'
  return ids.map((id) => formatDrugDosing(state, id)).join(' + ')
}

export function isMonotherapy(state, drugId) {
  const ids = getActiveDrugIds(state)
  return ids.length === 1 && ids[0] === drugId
}

export function isCefazolinRenallyAdjusted(state) {
  return Boolean(state?.therapyDosing?.cefazolin?.adjusted || (isDrugActive(state, 'cefazolin') && state?.renalDoseAdjusted))
}

export function applyTherapyDosingForDrugs(state, drugIds, { adjusted = false } = {}) {
  const therapyDosing = { ...(state.therapyDosing ?? {}) }
  for (const drugId of drugIds) {
    const source = adjusted && RENAL_ADJUSTED_DOSING[drugId]
      ? RENAL_ADJUSTED_DOSING[drugId]
      : DEFAULT_THERAPY_DOSING[drugId]
    if (source) {
      therapyDosing[drugId] = { ...source }
    }
  }
  return { ...state, therapyDosing }
}

export function setDrugDosingAdjusted(state, drugId) {
  const adjusted = RENAL_ADJUSTED_DOSING[drugId]
  if (!adjusted) return state
  return {
    ...state,
    therapyDosing: {
      ...(state.therapyDosing ?? {}),
      [drugId]: { ...adjusted },
    },
  }
}

export function getRegimenDosingSnapshot(state) {
  const ids = getActiveDrugIds(state)
  return Object.fromEntries(ids.map((id) => [id, getTherapyDosing(state, id)]))
}
