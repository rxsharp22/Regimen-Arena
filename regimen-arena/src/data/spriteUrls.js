/**
 * Drug sprite URLs resolved at build time via Vite.
 * Source files live in repo-root assets/visuals/ (synced to public at build).
 * Missing files are omitted — UI falls back to initials instead of 404ing.
 */

/** @type {Record<string, string>} filename -> drug id */
const SPRITE_FILENAME_TO_DRUG_ID = {
  'Cefazolin_Sprite.png': 'cefazolin',
  'Ceftriaxone_Sprite.png': 'ceftriaxone',
  'Vanc_Sprite.png': 'vancomycin',
  'Daptomycin_Sprite.png': 'daptomycin',
  'Meropenem_Sprite.png': 'meropenem',
  'Zosyn_Sprite.png': 'piperacillin_tazobactam',
  'Cefepime_sprite.png': 'cefepime',
  'Linezolid_Sprite.png': 'linezolid',
  'Bactrim-sprite.png': 'tmp_smx',
  'bactrim-sprite.png': 'tmp_smx',
  'nafcillin-sprite.png': 'nafcillin',
  'Nafcillin-sprite.png': 'nafcillin',
  'oxacillin-sprite.png': 'oxacillin',
  'Oxacillin-sprite.png': 'oxacillin',
}

const spriteModules = import.meta.glob('../../../assets/visuals/*.png', {
  eager: true,
  import: 'default',
})

/** @type {Record<string, string>} drug id -> bundled asset URL */
export const SPRITE_URLS = Object.entries(spriteModules).reduce((map, [path, url]) => {
  const filename = path.split('/').pop()
  const drugId = SPRITE_FILENAME_TO_DRUG_ID[filename]
  if (drugId && url) map[drugId] = url
  return map
}, {})

/** Drug ids referenced in visualAssets that should have sprite files when available. */
export const EXPECTED_DRUG_SPRITES = [
  'cefazolin',
  'ceftriaxone',
  'vancomycin',
  'daptomycin',
  'meropenem',
  'piperacillin_tazobactam',
  'cefepime',
  'linezolid',
  'tmp_smx',
  'nafcillin',
  'oxacillin',
]

export function getBundledDrugSpriteUrl(drugId) {
  const id = String(drugId ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
  return SPRITE_URLS[id] ?? null
}
