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
    cefepime: {
      displayName: 'Cefepime',
      role: 'Fourth-generation cephalosporin wall-breaker',
      mechanism: 'Advanced beta-lactam cell-wall disruption',
      spriteAlt: 'Cefepime antimicrobial agent sprite.',
      primaryImage: `${VISUAL_BASE}/Cefepime_sprite.png`,
      altImages: [],
    },
    linezolid: {
      displayName: 'Linezolid',
      role: '50S protein synthesis inhibitor',
      mechanism: 'Protein synthesis inhibition — oxazolidinone',
      spriteAlt: 'Linezolid antimicrobial agent sprite.',
      primaryImage: `${VISUAL_BASE}/Linezolid_Sprite.png`,
      altImages: [],
    },
    nafcillin: {
      displayName: 'Nafcillin',
      role: 'Penicillinase-resistant wall-breaker',
      mechanism: 'Cell wall inhibition — penicillinase-resistant beta-lactam',
      spriteAlt: 'Nafcillin antimicrobial agent sprite.',
      primaryImage: `${VISUAL_BASE}/nafcillin-sprite.png`,
      altImages: [],
    },
    oxacillin: {
      displayName: 'Oxacillin',
      role: 'Penicillinase-resistant wall-breaker',
      mechanism: 'Cell wall inhibition — penicillinase-resistant beta-lactam',
      spriteAlt: 'Oxacillin antimicrobial agent sprite.',
      primaryImage: `${VISUAL_BASE}/oxacillin-sprite.png`,
      altImages: [],
    },
    tmp_smx: {
      displayName: 'TMP-SMX',
      shortName: 'Bactrim',
      role: 'Folate pathway inhibitor',
      mechanism: 'Sequential folate pathway blockade',
      spriteAlt: 'Sulfamethoxazole-trimethoprim antimicrobial agent sprite.',
      primaryImage: `${VISUAL_BASE}/Bactrim-sprite.png`,
      altImages: [],
    },
  },

  organisms: {
    mssa: {
      displayName: 'MSSA',
      role: 'Susceptible Staphylococcus aureus',
      primaryImage: `${VISUAL_BASE}/MSSA_Sprite.png`,
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
      displayName: 'Clinical Stewardship Lead',
      role: 'Oversee antimicrobial selection, adjustment, monitoring, and narrowing as clinical data evolve.',
      briefingAlt: 'Stewardship Lead character holding a clinical tablet.',
      primaryImage: `${VISUAL_BASE}/Player-character.png`,
      poses: {
        default: `${VISUAL_BASE}/Player-character.png`,
        arenaOverview: `${VISUAL_BASE}/tutorial-animation-1.png`,
        cultureData: `${VISUAL_BASE}/tutorial-animation-2.png`,
        monitoring: `${VISUAL_BASE}/tutorial-animation-3.png`,
        regimenPlan: `${VISUAL_BASE}/tutorial-animation-4.png`,
      },
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
  bactrim: 'tmp_smx',
  'tmp-smx': 'tmp_smx',
  tmpsmx: 'tmp_smx',
  'trimethoprim-sulfamethoxazole': 'tmp_smx',
  'trimethoprim_sulfamethoxazole': 'tmp_smx',
  'sulfamethoxazole-trimethoprim': 'tmp_smx',
  'sulfamethoxazole_trimethoprim': 'tmp_smx',
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

/** Resolve briefing character image for a pose key (extensible for future variants). */
export function getPlayerBriefingImage(pose = 'default', id = 'stewardshipLead') {
  const record = visualAssets.player[id]
  if (!record) return null
  return record.poses?.[pose] ?? record.primaryImage ?? null
}

export function inferOrganismIdFromText(text) {
  if (!text) return null
  const lower = String(text).toLowerCase()
  if (lower.includes('mrsa')) return 'mrsa'
  if (lower.includes('mssa') || lower.includes('oxacillin-susceptible')) return 'mssa'
  if (lower.includes('staphylococcus aureus') || lower.includes('s. aureus')) return 'mssa'
  return null
}

export function getDrugSpriteAlt(drugId) {
  const visual = getDrugVisual(drugId)
  if (!visual) return null
  return visual.spriteAlt ?? `${visual.displayName ?? drugId} antimicrobial agent sprite.`
}

export function getDrugVisualsForOption(option) {
  if (!option?.drugs?.length) return []
  return option.drugs
    .map((drugId) => getDrugVisual(drugId))
    .filter(Boolean)
}
