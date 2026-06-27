const VISUAL_BASE = '/assets/visuals'

export const visualAssets = {
  drugs: {
    cefazolin: {
      displayName: 'Cefazolin',
      role: 'Beta-lactam wall-breaker',
      mechanism: 'Cell-wall synthesis disruption',
      primaryImage: `${VISUAL_BASE}/Cefazolin_Sprite.png`,
      altImages: [],
    },
    ceftriaxone: {
      displayName: 'Ceftriaxone',
      role: 'Extended-spectrum cephalosporin striker',
      mechanism: 'Cell-wall synthesis disruption',
      primaryImage: `${VISUAL_BASE}/Ceftriaxone_Sprite.png`,
      altImages: [],
    },
    vancomycin: {
      displayName: 'Vancomycin',
      role: 'Binding sentinel',
      mechanism: 'Binds cell-wall precursor target',
      primaryImage: `${VISUAL_BASE}/Vanc_Sprite.png`,
      altImages: [`${VISUAL_BASE}/PL-Vanc2.png`],
    },
    daptomycin: {
      displayName: 'Daptomycin',
      role: 'Calcium-charged membrane striker',
      mechanism: 'Membrane insertion and depolarization',
      primaryImage: `${VISUAL_BASE}/Daptomycin_Sprite.png`,
      altImages: [],
    },
    meropenem: {
      displayName: 'Meropenem',
      role: 'Carbapenem fortress-breacher',
      mechanism: 'Advanced beta-lactam wall disruption',
      primaryImage: `${VISUAL_BASE}/Meropenem_Sprite.png`,
      altImages: [],
    },
    piperacillin_tazobactam: {
      displayName: 'Piperacillin-Tazobactam',
      shortName: 'Pip-Tazo',
      role: 'Breacher + inhibitor support',
      mechanism: 'Beta-lactam wall activity plus beta-lactamase inhibition',
      primaryImage: `${VISUAL_BASE}/Zosyn_Sprite.png`,
      altImages: [`${VISUAL_BASE}/Zosyn-sidekick-sprite.png`],
    },
  },

  organisms: {
    mssa: {
      displayName: 'MSSA',
      role: 'Susceptible Staphylococcus aureus',
      primaryImage: null,
      altImages: [],
    },
    mrsa: {
      displayName: 'MRSA',
      role: 'Methicillin-resistant Staphylococcus aureus',
      primaryImage: `${VISUAL_BASE}/pixellab-mrsa.png`,
      altImages: [],
    },
  },

  player: {
    stewardshipLead: {
      displayName: 'Stewardship Lead',
      role: 'Clinical commander / antimicrobial stewardship strategist',
      primaryImage: `${VISUAL_BASE}/Player-character.png`,
      altImages: [],
    },
  },
}

const DRUG_ID_ALIASES = {
  'piperacillin-tazobactam': 'piperacillin_tazobactam',
  piperacillintazobactam: 'piperacillin_tazobactam',
  zosyn: 'piperacillin_tazobactam',
  'pip-tazo': 'piperacillin_tazobactam',
  'pip tazo': 'piperacillin_tazobactam',
  vanc: 'vancomycin',
}

const ORGANISM_ID_ALIASES = {
  'methicillin-susceptible staphylococcus aureus': 'mssa',
  'methicillin susceptible staphylococcus aureus': 'mssa',
  'staphylococcus aureus': 'mssa',
  's. aureus': 'mssa',
  's aureus': 'mssa',
  'oxacillin-susceptible': 'mssa',
  'oxacillin susceptible': 'mssa',
  'methicillin-resistant staphylococcus aureus': 'mrsa',
  'methicillin resistant staphylococcus aureus': 'mrsa',
}

function normalizeId(id) {
  if (!id) return ''
  return String(id).trim().toLowerCase().replace(/[\s-]+/g, '_')
}

function resolveDrugId(drugId) {
  const normalized = normalizeId(drugId)
  return DRUG_ID_ALIASES[normalized] ?? normalized
}

function resolveOrganismId(organismId) {
  const raw = String(organismId ?? '').trim().toLowerCase()
  if (ORGANISM_ID_ALIASES[raw]) return ORGANISM_ID_ALIASES[raw]
  const normalized = normalizeId(organismId)
  if (normalized.includes('mrsa')) return 'mrsa'
  if (normalized.includes('mssa')) return 'mssa'
  return normalized
}

export function getVisualImageUrl(assetRecord) {
  if (!assetRecord) return null
  if (assetRecord.primaryImage) return assetRecord.primaryImage
  if (assetRecord.altImages?.length) return assetRecord.altImages[0]
  return null
}

export function getDrugVisual(drugId) {
  const id = resolveDrugId(drugId)
  const record = visualAssets.drugs[id]
  if (!record) return null
  return { id, ...record }
}

export function getOrganismVisual(organismId) {
  const id = resolveOrganismId(organismId)
  const record = visualAssets.organisms[id]
  if (!record) return null
  return { id, ...record }
}

export function getPlayerVisual(id = 'stewardshipLead') {
  const record = visualAssets.player[id]
  if (!record) return null
  return { id, ...record }
}

export function inferOrganismIdFromText(text) {
  if (!text) return null
  const lower = String(text).toLowerCase()
  if (lower.includes('mrsa')) return 'mrsa'
  if (lower.includes('mssa') || lower.includes('oxacillin-susceptible')) return 'mssa'
  if (lower.includes('staphylococcus aureus') || lower.includes('s. aureus')) return 'mssa'
  return null
}

export function getDrugVisualsForOption(option) {
  if (!option?.drugs?.length) return []
  return option.drugs
    .map((drugId) => getDrugVisual(drugId))
    .filter(Boolean)
}
