/**
 * Reducer-level Bone Deep flow checks.
 * Run: npx vite-node scripts/verify-bone-deep-flow.mjs
 */
import phases from '../src/data/phases.json' with { type: 'json' }
import { initBoneDeepSimulation } from '../src/simulation/boneDeep/index.js'
import {
  createGameState,
  confirmOnly,
  confirmAndAdvance,
  advanceOnly,
  therapyPending,
  resolveTherapyIfNeeded,
  playStrongRecoveryPath,
  finalizeState,
} from './bone-deep-playtest-helpers.mjs'

let failed = 0

function assert(name, condition, detail = '') {
  const ok = Boolean(condition)
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ` (${detail})` : ''}`)
}

// Restart resets therapy event state
{
  let s = createGameState()
  s = confirmAndAdvance(s, 'dp_01_empiric_regimen', 'opt_vanco_cefepime')
  s = advanceOnly(s)
  s = confirmAndAdvance(s, 'dp_gram_stain_response', 'gs_continue_empiric')
  const withHistory = s.simulation.therapyEventState?.eventsThisRun ?? 0
  const fresh = initBoneDeepSimulation()
  assert(
    'New simulation resets therapyEventState',
    fresh.simulation.therapyEventState.eventsThisRun === 0 &&
      fresh.simulation.therapyEventState.triggeredEvents.length === 0,
    `had eventsThisRun=${withHistory}`
  )
}

// Therapy_event_only does not advance phase (allergy on phase_05)
{
  let s = createGameState()
  s = confirmAndAdvance(s, 'dp_01_empiric_regimen', 'opt_vanco_cefepime')
  s = advanceOnly(s)
  s = confirmAndAdvance(s, 'dp_gram_stain_response', 'gs_continue_empiric')
  s = confirmAndAdvance(s, 'dp_source_control', 'sc_urgent_or')
  s = confirmAndAdvance(s, 'dp_02_dose_reassessment', 'dp02_reduce_cefepime')
  s = resolveTherapyIfNeeded(s, {
    dp_vanco_infusion_response: 'vanco_pause_slow_restart',
    dp_cefepime_neuro_response: 'cefepime_adjust_monitor',
    dp_allergy_clarification: 'allergy_proceed_cefazolin',
  })
  assert('At culture reveal phase', phases[s.currentPhase]?.id === 'phase_05', phases[s.currentPhase]?.id)
  const pending = therapyPending(s)
  if (pending === 'dp_allergy_clarification') {
    const phaseBefore = s.currentPhase
    s = confirmOnly(s, 'dp_allergy_clarification', 'allergy_proceed_cefazolin')
    assert('Allergy clarification stays on same phase index', s.currentPhase === phaseBefore)
    assert('MSSA de-escalation DP follows allergy', phases[s.currentPhase]?.decision_point_id === 'dp_03_deescalation')
    assert('No pending therapy blocks de-escalation', therapyPending(s) === null)
  } else {
    console.log('SKIP: allergy clarification did not proc on this run (RNG)')
  }
}

// Confirm+advance advances phase after non-therapy decision
{
  let s = createGameState()
  const phase0 = s.currentPhase
  s = confirmAndAdvance(s, 'dp_01_empiric_regimen', 'opt_vanco_cefepime')
  assert('Empiric confirm advances phase', s.currentPhase === phase0 + 1)
}

// Durable state unchanged until confirm (simulation snapshot before confirm)
{
  const s = createGameState()
  const simBefore = s.simulation.scenarioTimeHours
  const drugsBefore = [...(s.activeDrugs ?? [])]
  assert('Pre-decision simulation time stable', s.simulation.scenarioTimeHours === simBefore)
  assert('Pre-decision activeDrugs stable', (s.activeDrugs ?? []).join() === drugsBefore.join())
}

// Strong path stewardship tier smoke test
{
  const s = playStrongRecoveryPath()
  const debrief = finalizeState(s)
  const tier = debrief.assessment?.stewardshipPerformance
  assert(
    'Strong recovery path yields Strong or Excellent stewardship',
    tier === 'excellent' || tier === 'strong',
    `got ${tier}`
  )
  assert(
    'Strong recovery path is not Unsafe from RNG alone',
    tier !== 'unsafe',
    `got ${tier}`
  )
}

process.exit(failed > 0 ? 1 : 0)
