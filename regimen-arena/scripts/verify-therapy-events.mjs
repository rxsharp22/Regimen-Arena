/**
 * Therapy event frequency smoke test (seeded RNG).
 * Run: npx vite-node scripts/verify-therapy-events.mjs
 */
import { createInitialBoneDeepState } from '../src/simulation/boneDeep/state.js'
import { processTherapyEventsOnPhaseEnter } from '../src/simulation/boneDeep/therapyEvents.js'
import { applyBoneDeepDecision } from '../src/simulation/boneDeep/decisionEffects.js'
import { getDecisionPoint } from '../src/utils/decisions.js'

function mulberry32(seed) {
  return function rng() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function applyEmpiric(state, optionId) {
  const dp = getDecisionPoint('dp_01_empiric_regimen')
  const option = dp.options.find((o) => o.id === optionId)
  return applyBoneDeepDecision(state, dp, option).state
}

function countAdverseEvents(state) {
  return state.therapyEventState?.eventsThisRun ?? 0
}

function simulateVancoRun(seed) {
  const rng = mulberry32(seed)
  let state = createInitialBoneDeepState()
  state = applyEmpiric(state, 'opt_vanco_cefepime')
  state.scenarioTimeHours = 12
  state = processTherapyEventsOnPhaseEnter(state, 'phase_02b', rng).state
  state = processTherapyEventsOnPhaseEnter(state, 'phase_03', rng).state
  state.scenarioTimeHours = 36
  state.creatinine = 2.3
  state = processTherapyEventsOnPhaseEnter(state, 'phase_04', rng).state
  return countAdverseEvents(state)
}

function simulateCefepimeRenalRun(seed, adjusted) {
  const rng = mulberry32(seed)
  let state = createInitialBoneDeepState()
  state = applyEmpiric(state, 'opt_vanco_cefepime')
  state.creatinine = 2.3
  state.renalDoseAdjusted = adjusted
  state.scenarioTimeHours = 36
  let events = 0
  const r1 = processTherapyEventsOnPhaseEnter(state, 'phase_04', rng)
  state = r1.state
  events = countAdverseEvents(state)
  state.scenarioTimeHours = 120
  const r2 = processTherapyEventsOnPhaseEnter(state, 'phase_06', rng)
  state = r2.state
  events = countAdverseEvents(state)
  const neuro = state.therapyEventState.triggeredEvents.some((e) => e.id === 'cefepime_neurotoxicity')
  return { events, neuro }
}

const RUNS = 48
let vancoEventRuns = 0
for (let i = 0; i < RUNS; i += 1) {
  if (simulateVancoRun(1000 + i) > 0) vancoEventRuns += 1
}

let neuroAdjusted = 0
let neuroUnadjusted = 0
for (let i = 0; i < RUNS; i += 1) {
  if (simulateCefepimeRenalRun(2000 + i, true).neuro) neuroAdjusted += 1
  if (simulateCefepimeRenalRun(3000 + i, false).neuro) neuroUnadjusted += 1
}

let failed = 0
function assert(name, pass, detail) {
  if (!pass) failed += 1
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name} (${detail})`)
}

const vancoRate = vancoEventRuns / RUNS
assert(
  'Vancomycin infusion not on every run',
  vancoRate < 0.85,
  `${(vancoRate * 100).toFixed(0)}% of ${RUNS} runs had ≥1 adverse event through phase_04`
)
assert(
  'Cefepime neuro more likely without renal adjustment',
  neuroUnadjusted >= neuroAdjusted,
  `neuro proc: unadjusted=${neuroUnadjusted}, adjusted=${neuroAdjusted} / ${RUNS}`
)

// Allergy does not increment adverse cap
{
  let state = createInitialBoneDeepState()
  state.organismRevealed = true
  state.organismIdentity = 'MSSA'
  const result = processTherapyEventsOnPhaseEnter(state, 'phase_05', () => 0.5)
  const allergy = result.state.therapyEventState.triggeredEvents.some(
    (e) => e.id === 'beta_lactam_allergy_clarification'
  )
  assert(
    'Allergy clarification does not count toward adverse eventsThisRun',
    allergy && result.state.therapyEventState.eventsThisRun === 0,
    `eventsThisRun=${result.state.therapyEventState.eventsThisRun}`
  )
}

process.exit(failed > 0 ? 1 : 0)
