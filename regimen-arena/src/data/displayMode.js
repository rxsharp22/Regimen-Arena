/**
 * Display mode controls how much interpretive guidance appears before decisions.
 *
 * - arena: neutral clinical facts pre-decision; teaching after choice (default)
 * - guided: intent labels, coverage chips, and hints visible before decision
 *
 * TODO: Expose a UI toggle (e.g. header settings) and persist learner preference.
 * Guided Mode may restore intent labels, coverage chips, and pre-decision hints.
 */

/** @typedef {'arena' | 'guided'} DisplayMode */

/** @type {DisplayMode} */
export const DISPLAY_MODE = 'arena'

export function isGuidedMode() {
  return DISPLAY_MODE === 'guided'
}

export function isArenaMode() {
  return DISPLAY_MODE === 'arena'
}
