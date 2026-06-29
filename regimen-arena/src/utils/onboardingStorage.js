import { TUTORIAL_STORAGE_KEY } from '../data/onboardingContent'

export function hasCompletedTutorial() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true'
  } catch {
    return true
  }
}

export function markTutorialComplete() {
  try {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
  } catch {
    // ignore storage failures
  }
}

export function clearTutorialComplete() {
  try {
    window.localStorage.removeItem(TUTORIAL_STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
}
