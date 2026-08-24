/**
 * Hardening regression: vancomycin narrowing + phase_06 trajectory idempotency.
 * Run: npx vite-node scripts/verify-trajectory-hardening.mjs
 */
import { getActiveTherapyDisplay } from '../src/simulation/boneDeep/activeRegimen.js'
import { initBoneDeepSimulation } from '../src/simulation/boneDeep/index.js'
import { resolveDecisionPointForSimulation } from '../src/simulation/boneDeep/regimenPresentation.js'
import { advanceBoneDeepTime } from '../src/simulation/boneDeep/timeProgression.js'
import { getDecisionPoint } from '../src/utils/decisions.js'
import {
  createGameState,
  confirmAndAdvance,
  advanceOnly,
  confirmOnly,
} from './bone-deep-playtest-helpers.mjs'

let failed = 0

function assert(name, condition, detail = '') {
  const ok = Boolean(condition)
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ` (${detail})` : ''}`)
}

function trajectoryFields(sim) {
  return {
    infectionBurden: sim.infectionBurden,
    patientStability: sim.patientStability,
    feverC: sim.feverC,
    wbc: sim.wbc,
    bacteremiaStatus: sim.bacteremiaStatus,
    cultureClearance: sim.cultureClearance,
    woundDrainage: sim.woundDrainage,
    flag: sim.clinicalTrajectoryAppliedAtPhase06,
  }
}

function fieldsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

const STRONG_PRE_PHASE_06 = [
  { dp: 'dp_01_empiric_regimen', opt: 'opt_vanco_cefepime' },
  { advance: true },
  { dp: 'dp_gram_stain_response', opt: 'gs_continue_empiric' },
  { dp: 'dp_source_control', opt: 'sc_urgent_or' },
  { dp: 'dp_02_dose_reassessment', opt: 'dp02_reduce_cefepime' },
  { confirmOnly: true, dp: 'dp_allergy_clarification', opt: 'allergy_proceed_cefazolin' },
  { dp: 'dp_03_deescalation', opt: 'dp03_cefazolin' },
]

const POOR_SOURCE_PRE_PHASE_06 = [
  { dp: 'dp_01_empiric_regimen', opt: 'opt_vanco_cefepime' },
  { advance: true },
  { dp: 'dp_gram_stain_response', opt: 'gs_continue_empiric' },
  { dp: 'dp_source_control', opt: 'sc_delay_medical' },
  { dp: 'dp_02_dose_reassessment', opt: 'dp02_reduce_cefepime' },
  { confirmOnly: true, dp: 'dp_allergy_clarification', opt: 'allergy_proceed_cefazolin' },
  { dp: 'dp_03_deescalation', opt: 'dp03_cefazolin' },
]

function playSteps(steps) {
  let s = createGameState()
  for (const step of steps) {
    if (step.advance) s = advanceOnly(s)
    else if (step.confirmOnly) s = confirmOnly(s, step.dp, step.opt)
    else s = confirmAndAdvance(s, step.dp, step.opt)
  }
  return s
}

// Vancomycin narrowing from vancomycin + cefepime
{
  let s = createGameState()
  s = confirmAndAdvance(s, 'dp_01_empiric_regimen', 'opt_vanco_cefepime')
  assert('Vanco narrow: empiric vanco+cefepime', s.simulation.activeTherapy.join() === 'vancomycin,cefepime')

  const beforeRegimen = [...s.simulation.activeTherapy]
  const deescDp = resolveDecisionPointForSimulation(getDecisionPoint('dp_03_deescalation'), s.simulation)
  const continueVanco = deescDp.options.find((o) => o.id === 'dp03_continue_vancomycin')
  assert('Vanco narrow: option uses narrow wording', continueVanco?.label === 'Narrow to Vancomycin IV')
  assert('Vanco narrow: option regimen action narrow', continueVanco?._regimenAction === 'narrow')

  s = advanceOnly(s)
  s = confirmAndAdvance(s, 'dp_gram_stain_response', 'gs_continue_empiric')
  s = confirmAndAdvance(s, 'dp_source_control', 'sc_urgent_or')
  s = confirmAndAdvance(s, 'dp_02_dose_reassessment', 'dp02_reduce_cefepime')
  s = confirmOnly(s, 'dp_allergy_clarification', 'allergy_proceed_cefazolin')

  const logBefore = s.eventLog.length
  s = confirmAndAdvance(s, 'dp_03_deescalation', 'dp03_continue_vancomycin')

  assert('Vanco narrow: active therapy vancomycin only', s.simulation.activeTherapy.join() === 'vancomycin')
  assert('Vanco narrow: cefepime not active', !s.simulation.activeTherapy.includes('cefepime'))
  assert(
    'Vanco narrow: display shows vancomycin only',
    !getActiveTherapyDisplay(s.simulation).toLowerCase().includes('cefepime')
  )
  assert(
    'Vanco narrow: cefepime neuro eligibility removed',
    !s.simulation.activeTherapy.includes('cefepime')
  )

  const lastLog = s.eventLog[s.eventLog.length - 1]
  assert('Vanco narrow: event log regimen action narrow', lastLog.regimenAction === 'narrow')
  assert(
    'Vanco narrow: event log before vanco+cefepime',
    lastLog.activeRegimenBefore?.includes('vancomycin') && lastLog.activeRegimenBefore?.includes('cefepime')
  )
  assert('Vanco narrow: event log after vancomycin only', lastLog.activeRegimenAfter?.join() === 'vancomycin')
  assert('Vanco narrow: deescalation score not maxed', s.simulation.deescalationScore === 0)
  assert('Vanco narrow: one new log entry', s.eventLog.length === logBefore + 1)
  void beforeRegimen
}

// Cefazolin true continuation preserved
{
  let s = createGameState()
  s = confirmAndAdvance(s, 'dp_01_empiric_regimen', 'opt_cefazolin_mono')
  s = advanceOnly(s)
  s = confirmAndAdvance(s, 'dp_gram_stain_response', 'gs_continue_empiric')
  s = confirmAndAdvance(s, 'dp_source_control', 'sc_urgent_or')
  s = confirmAndAdvance(s, 'dp_02_dose_reassessment', 'dp02_adjust_cefazolin')
  s = confirmOnly(s, 'dp_allergy_clarification', 'allergy_proceed_cefazolin')

  const deescScoreBefore = s.simulation.deescalationScore
  const dosingBefore = { ...s.simulation.therapyDosing?.cefazolin }

  const deescDp = resolveDecisionPointForSimulation(getDecisionPoint('dp_03_deescalation'), s.simulation)
  const continueCefa = deescDp.options.find((o) => o.id === 'dp03_cefazolin')
  assert('Cefazolin continue: Continue label', continueCefa?.label === 'Continue Cefazolin IV')
  assert('Cefazolin continue: regimen action continue', continueCefa?._regimenAction === 'continue')

  s = confirmAndAdvance(s, 'dp_03_deescalation', 'dp03_cefazolin')

  assert('Cefazolin continue: sole active therapy', s.simulation.activeTherapy.join() === 'cefazolin')
  assert('Cefazolin continue: no duplicate de-escalation credit', s.simulation.deescalationScore === deescScoreBefore)
  assert(
    'Cefazolin continue: dosing unchanged',
    JSON.stringify(s.simulation.therapyDosing?.cefazolin) === JSON.stringify(dosingBefore)
  )

  const lastLog = s.eventLog[s.eventLog.length - 1]
  assert('Cefazolin continue: event log action continue', lastLog.regimenAction === 'continue')
}

// Strong-path phase_06 idempotency
{
  const s = playSteps(STRONG_PRE_PHASE_06)
  let sim = { ...s.simulation }

  const first = advanceBoneDeepTime(sim, 'phase_06')
  const afterFirst = trajectoryFields(first.state)
  assert('Strong idempotency: flag set after first apply', afterFirst.flag === true)

  const second = advanceBoneDeepTime(first.state, 'phase_06')
  const afterSecond = trajectoryFields(second.state)
  assert('Strong idempotency: no trajectory change on reapply', fieldsEqual(afterFirst, afterSecond))
  assert(
    'Strong idempotency: no extra stability bonus',
    afterSecond.patientStability === afterFirst.patientStability
  )
  assert(
    'Strong idempotency: no extra burden reduction',
    afterSecond.infectionBurden === afterFirst.infectionBurden
  )
}

// Poor-path phase_06 idempotency
{
  const s = playSteps(POOR_SOURCE_PRE_PHASE_06)
  let sim = { ...s.simulation }

  const first = advanceBoneDeepTime(sim, 'phase_06')
  const afterFirst = trajectoryFields(first.state)

  const second = advanceBoneDeepTime(first.state, 'phase_06')
  const afterSecond = trajectoryFields(second.state)
  assert('Poor idempotency: no trajectory change on reapply', fieldsEqual(afterFirst, afterSecond))
  assert(
    'Poor idempotency: stability not stacked',
    afterSecond.patientStability === afterFirst.patientStability
  )
  assert(
    'Poor idempotency: burden not stacked',
    afterSecond.infectionBurden === afterFirst.infectionBurden
  )
}

// Reset / new simulation flag behavior
{
  let s = playSteps(STRONG_PRE_PHASE_06)
  const advanced = advanceBoneDeepTime(s.simulation, 'phase_06')
  assert('Reset: first sim flag true', advanced.state.clinicalTrajectoryAppliedAtPhase06 === true)

  const init = initBoneDeepSimulation()
  assert('Reset: new sim flag false', init.simulation.clinicalTrajectoryAppliedAtPhase06 === false)

  const freshAdvance = advanceBoneDeepTime(init.simulation, 'phase_06')
  assert('Reset: fresh sim can apply trajectory', freshAdvance.state.clinicalTrajectoryAppliedAtPhase06 === true)
}

// Legacy state without flag field
{
  const legacy = { ...initBoneDeepSimulation().simulation }
  delete legacy.clinicalTrajectoryAppliedAtPhase06
  const result = advanceBoneDeepTime(legacy, 'phase_06')
  assert('Legacy: missing flag still applies once', result.state.clinicalTrajectoryAppliedAtPhase06 === true)
}

if (failed > 0) {
  console.error(`\n${failed} trajectory-hardening check(s) failed.`)
  process.exit(1)
}
console.log('\nAll trajectory-hardening checks passed.')
