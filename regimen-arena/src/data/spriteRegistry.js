/**
 * Semantic sprite registry for narrative / character visuals.
 * Drug sprites remain in spriteUrls.js.
 */

const NARRATIVE_SPRITE_FILES = {
  idDoc: 'ID-doc-sprite.png',
  labTech: 'Lab-tech-sprite.png',
  pharmacist: 'Pharmacist-sprite-1.png',
  pharmacistDesk: 'pharmacist-at-desk-sprite.png',
  patientMale: 'male-patient-sprite.png',
  patientFemale: 'female-patient-sprite.png',
  patientGeneric: 'generic-patient-sprite.png',
  patientOlderDialysis: 'generic-older-patient-dialysis-sprite.png',
  patientImproved: 'improved-patient-sprite.png',
  patientDeclining: 'declining-patient-sprite.png',
  scribe5: 'scribe-5-main-sprite.png',
  scribe5Alt: 'Scribe-5-sprite-1.png',
  pharmacistScribeExchange: 'pharmacist-scribe-5-exchange-sprite.png',
  doctorScribeExchange: 'doctor-scribe-5-exchange-sprite.png',
  stewardshipScribe1: 'stewardship-lead-scribe-5-sprite-1.png',
  stewardshipScribe2: 'SL-Scribe-5-sprite-2.png',
  stewardshipScribe3: 'SL-Scribe-5-sprite-3.png',
}

const spriteModules = import.meta.glob('../../../assets/visuals/*.png', {
  eager: true,
  import: 'default',
})

/** @type {Record<string, string>} */
export const SPRITES = Object.fromEntries(
  Object.entries(NARRATIVE_SPRITE_FILES).map(([key, filename]) => {
    const match = Object.entries(spriteModules).find(([path]) => path.endsWith(`/${filename}`))
    return [key, match?.[1] ?? `/assets/visuals/${filename}`]
  })
)

export const STEWARDSHIP_LOADING_SPRITES = [
  'stewardshipScribe1',
  'stewardshipScribe2',
  'stewardshipScribe3',
]

export function getSpriteUrl(key) {
  return SPRITES[key] ?? null
}

export function getSpriteUrlOrFallback(key, fallbackKey = 'patientGeneric') {
  return SPRITES[key] ?? SPRITES[fallbackKey] ?? null
}
