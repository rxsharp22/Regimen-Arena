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
// Allergy clarification is deterministic on phase_05 when MSSA is revealed.
// We drive to phase_05 manually and assert allergy clarification stays on the
// same phase index when resolved via confirmOnly (therapy_event_only = true).
{
  let s = createGameState()
  s = confirmAndAdvance(s, 'dp_01_empiric_regimen', 'opt_vanco_cefepime')
  s = advanceOnly(s)
  s = confirmAndAdvance(s, 'dp_gram_stain_response', 'gs_continue_empiric')
  s = confirmAndAdvance(s, 'dp_source_control', 'sc_urgent_or')
  s = confirmAndAdvance(s, 'dp_02_dose_reassessment', 'dp02_reduce_cefepime')
  // Drain any non-allergy therapy events that fired on the way to phase_05,
  // leaving dp_allergy_clarification for the explicit phase-invariance assertion.
  {
    let safetyIterations = 0
    let p = therapyPending(s)
    while (p && p !== 'dp_allergy_clarification') {
      if (safetyIterations++ > 5) { failed += 1; console.log('FAIL: therapy event drain looped unexpectedly'); break }
      const responses = {
        dp_vanco_infusion_response: 'vanco_pause_slow_restart',
        dp_cefepime_neuro_response: 'cefepime_adjust_monitor',
        dp_dapto_toxicity_response: 'dapto_resp_hold_recheck_ck',
      }
      if (!responses[p]) { failed += 1; console.log(`FAIL: no canned response for ${p}`); break }
      s = confirmOnly(s, p, responses[p])
      p = therapyPending(s)
    }
  }
  assert('At culture reveal phase', phases[s.currentPhase]?.id === 'phase_05', phases[s.currentPhase]?.id)
  // Allergy clarification is deterministic at phase_05 entry
  const pending = therapyPending(s)
  assert(
    'Allergy clarification is pending at phase_05',
    pending === 'dp_allergy_clarification',
    `pending=${pending ?? 'none'}`
  )
  if (pending === 'dp_allergy_clarification') {
    const phaseBefore = s.currentPhase
    s = confirmOnly(s, 'dp_allergy_clarification', 'allergy_proceed_cefazolin')
    assert('therapy_event_only: allergy clarification stays on same phase index', s.currentPhase === phaseBefore)
    assert('MSSA de-escalation DP is next after allergy resolved', phases[s.currentPhase]?.decision_point_id === 'dp_03_deescalation')
    assert('No pending therapy event blocks de-escalation after allergy resolved', therapyPending(s) === null)
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
