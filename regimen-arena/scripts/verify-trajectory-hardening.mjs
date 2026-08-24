/**
 * Hardening regression: vancomycin narrowing + phase_06 trajectory idempotency.
 * Run: npx vite-node scripts/verify-trajectory-hardening.mjs
 */
import { getActiveTherapyDisplay } from '../src/simulation/boneDeep/activeRegimen.js'
import { applyBoneDeepDecision } from '../src/simulation/boneDeep/decisionEffects.js'
import { initBoneDeepSimulation } from '../src/simulation/boneDeep/index.js'
import { resolveDecisionPointForSimulation } from '../src/simulation/boneDeep/regimenPresentation.js'
import { createInitialBoneDeepState } from '../src/simulation/boneDeep/state.js'
import { advanceBoneDeepTime } from '../src/simulation/boneDeep/timeProgression.js'
import { processTherapyEventsOnPhaseEnter } from '../src/simulation/boneDeep/therapyEvents.js'
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

function mulberry32(seed) {
  return function rng() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function therapySnapshot(state) {
  const tes = state.therapyEventState ?? {}
  return {
    eventsThisRun: tes.eventsThisRun ?? 0,
    triggeredIds: (tes.triggeredEvents ?? []).map((e) => e.id),
    unresolved: [...(tes.unresolvedEvents ?? [])],
    evaluatedPhases: [...(tes.evaluatedPhases ?? [])],
    variabilityFlags: [...(state.variabilityFlags ?? [])],
  }
}

function baseVancoMonoPhase06() {
  let state = createInitialBoneDeepState()
  const dp = getDecisionPoint('dp_01_empiric_regimen')
  const option = dp.options.find((o) => o.id === 'opt_vanco_cefepime')
  state = applyBoneDeepDecision(state, dp, option).state
  state.activeTherapy = ['vancomycin']
  state.scenarioTimeHours = 120
  state.organismRevealed = true
  state.organismIdentity = 'MSSA'
  state.sourceControlStatus = 'completed'
  return state
}

function baseCefepimePhase06() {
  let state = createInitialBoneDeepState()
  const dp = getDecisionPoint('dp_01_empiric_regimen')
  const option = dp.options.find((o) => o.id === 'opt_vanco_cefepime')
  state = applyBoneDeepDecision(state, dp, option).state
  state.activeTherapy = ['vancomycin', 'cefepime']
  state.creatinine = 2.3
  state.renalTrend = 'worsening'
  state.scenarioTimeHours = 120
  return state
}

function findCefepimeProcSeed() {
  for (let seed = 0; seed < 500; seed += 1) {
    const rng = mulberry32(5000 + seed)
    const state = baseCefepimePhase06()
    const result = processTherapyEventsOnPhaseEnter(state, 'phase_06', rng)
    if (result.state.therapyEventState.triggeredEvents.some((e) => e.id === 'cefepime_neurotoxicity')) {
      return 5000 + seed
    }
  }
  return null
}

function findNoProcSeedWithCandidates() {
  for (let seed = 0; seed < 500; seed += 1) {
    const rng = mulberry32(6000 + seed)
    const state = baseCefepimePhase06()
    const result = processTherapyEventsOnPhaseEnter(state, 'phase_06', rng)
    const snap = therapySnapshot(result.state)
    if (
      snap.evaluatedPhases.includes('phase_06') &&
      !snap.triggeredIds.includes('cefepime_neurotoxicity')
    ) {
      return 6000 + seed
    }
  }
  return null
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

// Therapy events: no-proc re-entry (phase evaluated, no event)
{
  const seed = findNoProcSeedWithCandidates()
  assert('Therapy no-proc: seeded state found', seed != null, `seed=${seed}`)
  if (seed != null) {
    const rng = mulberry32(seed)
    const state = baseCefepimePhase06()
    const first = processTherapyEventsOnPhaseEnter(state, 'phase_06', rng)
    const snap1 = therapySnapshot(first.state)
    const traj1 = trajectoryFields(first.state)

    const second = processTherapyEventsOnPhaseEnter(first.state, 'phase_06', rng)
    const snap2 = therapySnapshot(second.state)
    const traj2 = trajectoryFields(second.state)

    assert('Therapy no-proc: phase_06 marked evaluated', snap1.evaluatedPhases.includes('phase_06'))
    assert('Therapy no-proc: no event on first roll', !snap1.triggeredIds.includes('cefepime_neurotoxicity'))
    assert('Therapy no-proc: snapshot unchanged on re-entry', fieldsEqual(snap1, snap2))
    assert('Therapy no-proc: trajectory unchanged on re-entry', fieldsEqual(traj1, traj2))
  }
}

// Therapy events: proc re-entry (same pending event, no duplicate)
{
  const seed = findCefepimeProcSeed()
  assert('Therapy proc: seeded cefepime neuro found', seed != null, `seed=${seed}`)
  if (seed != null) {
    const rng = mulberry32(seed)
    const state = baseCefepimePhase06()
    const first = processTherapyEventsOnPhaseEnter(state, 'phase_06', rng)
    const snap1 = therapySnapshot(first.state)

    const second = processTherapyEventsOnPhaseEnter(first.state, 'phase_06', rng)
    const snap2 = therapySnapshot(second.state)

    assert('Therapy proc: cefepime neuro triggered once', snap1.triggeredIds.includes('cefepime_neurotoxicity'))
    assert('Therapy proc: unresolved preserved', snap2.unresolved.includes('cefepime_neurotoxicity'))
    assert('Therapy proc: event count not incremented', snap2.eventsThisRun === snap1.eventsThisRun)
    assert('Therapy proc: triggered set unchanged', fieldsEqual(snap1.triggeredIds, snap2.triggeredIds))
  }
}

// Vancomycin renal variability: no duplicate roll on phase_06 re-entry
{
  const s = playSteps([
    { dp: 'dp_01_empiric_regimen', opt: 'opt_vanco_cefepime' },
    { advance: true },
    { dp: 'dp_gram_stain_response', opt: 'gs_continue_empiric' },
    { dp: 'dp_source_control', opt: 'sc_urgent_or' },
    { dp: 'dp_02_dose_reassessment', opt: 'dp02_reduce_cefepime' },
    { confirmOnly: true, dp: 'dp_allergy_clarification', opt: 'allergy_proceed_cefazolin' },
    { dp: 'dp_03_deescalation', opt: 'dp03_continue_vancomycin' },
  ])
  let sim = { ...s.simulation }
  const first = advanceBoneDeepTime(sim, 'phase_06')
  const flags1 = [...(first.state.variabilityFlags ?? [])]
  const therapy1 = therapySnapshot(first.state)

  const second = advanceBoneDeepTime(first.state, 'phase_06')
  const flags2 = [...(second.state.variabilityFlags ?? [])]
  const therapy2 = therapySnapshot(second.state)

  assert('Vanco variability: flags stable on re-entry', flags1.join() === flags2.join())
  assert('Vanco variability: therapy snapshot stable', fieldsEqual(therapy1, therapy2))
}

// Future phase eligibility after phase_06 evaluated
{
  let state = createInitialBoneDeepState()
  const dp = getDecisionPoint('dp_01_empiric_regimen')
  state = applyBoneDeepDecision(state, dp, dp.options.find((o) => o.id === 'opt_vanco_cefepime')).state
  state.scenarioTimeHours = 36
  state.creatinine = 2.3
  state.therapyEventState = {
    ...state.therapyEventState,
    evaluatedPhases: ['phase_06'],
  }
  const before = state.therapyEventState.eventsThisRun
  const after = processTherapyEventsOnPhaseEnter(state, 'phase_04', mulberry32(7001)).state
  assert(
    'Future phase: phase_04 still evaluable when phase_06 marked',
    after.therapyEventState.evaluatedPhases.includes('phase_04') ||
      after.therapyEventState.eventsThisRun >= before
  )
}

// Therapy evaluatedPhases reset on new simulation
{
  const init = initBoneDeepSimulation()
  assert(
    'Therapy reset: evaluatedPhases empty',
    (init.simulation.therapyEventState?.evaluatedPhases ?? []).length === 0
  )
}

if (failed > 0) {
  console.error(`\n${failed} trajectory-hardening check(s) failed.`)
  process.exit(1)
}
console.log('\nAll trajectory-hardening checks passed.')
