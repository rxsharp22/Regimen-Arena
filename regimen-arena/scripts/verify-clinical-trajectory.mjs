/**
 * Clinical trajectory and culture-clearance regression checks.
 * Run: npx vite-node scripts/verify-clinical-trajectory.mjs
 */
import phases from '../src/data/phases.json' with { type: 'json' }
import { projectClinicalState } from '../src/simulation/boneDeep/clinicalProjection.js'
import { repeatCultureStatusText } from '../src/simulation/boneDeep/bacteremiaTrajectory.js'
import { isDalbavancinEligible } from '../src/simulation/boneDeep/index.js'
import { getDecisionPoint } from '../src/utils/decisions.js'
import { applyConfirmDecision, applyAdvancePhase } from '../src/utils/gameReducerHelpers.js'
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

function snapshot(state) {
  const sim = state.simulation
  const clinical = projectClinicalState(sim)
  return {
    phase: phases[state.currentPhase]?.id,
    fever: sim.feverC,
    wbc: sim.wbc,
    creatinine: sim.creatinine,
    infectionBurden: sim.infectionBurden,
    stability: sim.patientStability,
    bacteremia: sim.bacteremiaStatus,
    cultureClearance: sim.cultureClearance,
    wound: sim.woundDrainage,
    activeTherapy: [...sim.activeTherapy],
    deescalationScore: sim.deescalationScore,
    cultureText: clinical.cultureStatus,
    aki: sim.akiOccurred,
    renalAdjusted: sim.renalDoseAdjusted,
  }
}

function confirmMonitoring(state, ids) {
  const dp = getDecisionPoint('dp_05_monitoring_plan')
  return applyAdvancePhase(
    applyConfirmDecision(state, {
      decisionPoint: dp,
      option: { selectedIds: ids },
      phaseIndex: state.currentPhase,
      subOption: null,
    })
  )
}

function playSteps(steps) {
  let s = createGameState()
  for (const step of steps) {
    if (step.advance) s = advanceOnly(s)
    else if (step.confirm) s = confirmAndAdvance(s, step.dp, step.opt, step.sub)
    else if (step.confirmOnly) s = confirmOnly(s, step.dp, step.opt)
    else if (step.monitoring) s = confirmMonitoring(s, step.ids)
  }
  return s
}

function advanceToPhase06(steps) {
  let s = playSteps(steps)
  while (s.currentPhase < 6) s = advanceOnly(s)
  return s
}

const basicMonitoring = [
  'mon_bmp_weekly',
  'mon_clinical_followup',
  'mon_id_followup',
  'mon_opat_line_check',
]

const STRONG_STEPS = [
  { confirm: true, dp: 'dp_01_empiric_regimen', opt: 'opt_vanco_cefepime' },
  { advance: true },
  { confirm: true, dp: 'dp_gram_stain_response', opt: 'gs_continue_empiric' },
  { confirm: true, dp: 'dp_source_control', opt: 'sc_urgent_or' },
  { confirm: true, dp: 'dp_02_dose_reassessment', opt: 'dp02_reduce_cefepime' },
  { confirmOnly: true, dp: 'dp_allergy_clarification', opt: 'allergy_proceed_cefazolin' },
  { confirm: true, dp: 'dp_03_deescalation', opt: 'dp03_cefazolin' },
]

const CEFAZOLIN_START_STEPS = [
  { confirm: true, dp: 'dp_01_empiric_regimen', opt: 'opt_cefazolin_mono' },
  { advance: true },
  { confirm: true, dp: 'dp_gram_stain_response', opt: 'gs_continue_empiric' },
  { confirm: true, dp: 'dp_source_control', opt: 'sc_urgent_or' },
  { confirm: true, dp: 'dp_02_dose_reassessment', opt: 'dp02_adjust_cefazolin' },
  { confirmOnly: true, dp: 'dp_allergy_clarification', opt: 'allergy_proceed_cefazolin' },
  { confirm: true, dp: 'dp_03_deescalation', opt: 'dp03_cefazolin' },
]

const POOR_SOURCE_STEPS = [
  { confirm: true, dp: 'dp_01_empiric_regimen', opt: 'opt_vanco_cefepime' },
  { advance: true },
  { confirm: true, dp: 'dp_gram_stain_response', opt: 'gs_continue_empiric' },
  { confirm: true, dp: 'dp_source_control', opt: 'sc_delay_medical' },
  { confirm: true, dp: 'dp_02_dose_reassessment', opt: 'dp02_reduce_cefepime' },
  { confirmOnly: true, dp: 'dp_allergy_clarification', opt: 'allergy_proceed_cefazolin' },
  { confirm: true, dp: 'dp_03_deescalation', opt: 'dp03_cefazolin' },
]

const ACCUMULATED_POOR_STEPS = [
  { confirm: true, dp: 'dp_01_empiric_regimen', opt: 'opt_linezolid_mono' },
  { advance: true },
  { confirm: true, dp: 'dp_gram_stain_response', opt: 'gs_continue_empiric' },
  { confirm: true, dp: 'dp_source_control', opt: 'sc_conservative_wound_care' },
  { confirm: true, dp: 'dp_02_dose_reassessment', opt: 'dp02_no_change' },
  { confirmOnly: true, dp: 'dp_allergy_clarification', opt: 'allergy_avoid_all_beta_lactams' },
  { confirm: true, dp: 'dp_03_deescalation', opt: 'dp03_continue_vancomycin' },
]

// Strong pathway
{
  const s = advanceToPhase06(STRONG_STEPS)
  const snap = snapshot(s)
  assert('Strong: at phase_06', snap.phase === 'phase_06')
  assert('Strong: infection burden improved', snap.infectionBurden < 70, `got ${snap.infectionBurden}`)
  assert('Strong: stability maintained/improved', snap.stability >= 45, `got ${snap.stability}`)
  assert('Strong: fever improved from admission', snap.fever < 38.5, `got ${snap.fever}`)
  assert('Strong: WBC improved from admission', snap.wbc < 17, `got ${snap.wbc}`)
  assert('Strong: wound improved with source control', snap.wound !== 'purulent_increasing')
  assert(
    'Strong: bacteremia cleared or clearing',
    ['cleared', 'clearing'].includes(snap.bacteremia),
    `got ${snap.bacteremia}`
  )
  assert('Strong: cultureClearance not stuck pending', snap.cultureClearance !== 'pending', `got ${snap.cultureClearance}`)
  assert('Strong: culture text matches cleared state', snap.cultureText.includes('no growth') || snap.cultureText.includes('cleared') || snap.cultureText.includes('clearance'))
  assert('Strong: active therapy is cefazolin', snap.activeTherapy.join() === 'cefazolin')
}

// Cefazolin-from-start pathway
{
  const beforeMssa = playSteps([
    ...CEFAZOLIN_START_STEPS.slice(0, 6),
  ])
  const deescBefore = beforeMssa.simulation.deescalationScore

  const s = advanceToPhase06(CEFAZOLIN_START_STEPS)
  const snap = snapshot(s)

  assert('Cefazolin start: remains cefazolin', snap.activeTherapy.join() === 'cefazolin')
  assert('Cefazolin start: no vancomycin', !snap.activeTherapy.includes('vancomycin'))
  assert('Cefazolin start: no duplicate de-escalation credit', snap.deescalationScore === deescBefore, `got ${snap.deescalationScore}`)
  assert(
    'Cefazolin start: clearance without deescalationScore>=8',
    ['cleared', 'clearing'].includes(snap.bacteremia),
    `bacteremia=${snap.bacteremia} deesc=${snap.deescalationScore}`
  )
  assert(
    'Cefazolin start: culture trajectory resolved',
    snap.cultureClearance === 'cleared' || snap.bacteremia === 'cleared' || snap.bacteremia === 'clearing',
    `clearance=${snap.cultureClearance} bacteremia=${snap.bacteremia}`
  )
  assert('Cefazolin start: culture narrative agrees', snap.cultureText.includes('no growth') || snap.cultureText.includes('clearance'))
}

// Vancomycin → cefazolin pathway
{
  const s = advanceToPhase06(STRONG_STEPS)
  const snap = snapshot(s)
  assert('Vanco→cefa: active cefazolin at phase_06', snap.activeTherapy.join() === 'cefazolin')
  assert('Vanco→cefa: favorable vitals', snap.fever < 38.6 && snap.wbc < 16.5)
  assert('Vanco→cefa: culture trajectory improved', ['cleared', 'clearing'].includes(snap.bacteremia))
}

// Poor source-control pathway
{
  const strong = snapshot(advanceToPhase06(STRONG_STEPS))
  const poor = snapshot(advanceToPhase06(POOR_SOURCE_STEPS))

  assert('Poor source: higher infection burden than strong', poor.infectionBurden > strong.infectionBurden)
  assert('Poor source: lower stability than strong', poor.stability < strong.stability)
  assert('Poor source: fever not better than strong', poor.fever >= strong.fever - 0.1)
  assert('Poor source: WBC not better than strong', poor.wbc >= strong.wbc - 0.5)
  assert(
    'Poor source: bacteremia worse than strong',
    poor.bacteremia === 'persistent' ||
      poor.bacteremia === 'clearing_slow' ||
      (strong.bacteremia === 'cleared' && poor.bacteremia !== 'cleared'),
    `strong=${strong.bacteremia} poor=${poor.bacteremia}`
  )
  assert('Poor source: wound reflects uncontrolled source', ['purulent', 'purulent_increasing'].includes(poor.wound))
  assert('Poor source: culture narrative differs from strong', poor.cultureText !== strong.cultureText)
}

// Accumulated poor pathway
{
  const strong = snapshot(advanceToPhase06(STRONG_STEPS))
  const poor = snapshot(advanceToPhase06(ACCUMULATED_POOR_STEPS))

  assert('Accumulated poor: lower stability than strong', poor.stability < strong.stability)
  assert('Accumulated poor: higher infection burden than strong', poor.infectionBurden > strong.infectionBurden)
  assert('Accumulated poor: fever worse than strong', poor.fever > strong.fever)
  assert('Accumulated poor: WBC worse than strong', poor.wbc > strong.wbc)
  assert(
    'Accumulated poor: bacteremia not cleared',
    poor.bacteremia !== 'cleared' || poor.cultureClearance !== 'cleared'
  )
}

// Culture state / presentation agreement
{
  const cases = [
    { bacteremiaStatus: 'cleared', cultureClearance: 'cleared', organismRevealed: true, scenarioTimeHours: 120 },
    { bacteremiaStatus: 'clearing', cultureClearance: 'pending', organismRevealed: true, scenarioTimeHours: 120 },
    { bacteremiaStatus: 'clearing_slow', cultureClearance: 'pending', organismRevealed: true, scenarioTimeHours: 120 },
    { bacteremiaStatus: 'persistent', cultureClearance: 'positive', organismRevealed: true, scenarioTimeHours: 120 },
  ]

  for (const c of cases) {
    const state = { ...createGameState().simulation, ...c }
    const text = repeatCultureStatusText(state)
    const projected = projectClinicalState(state).cultureStatus
    assert(
      `Culture text agreement (${c.bacteremiaStatus})`,
      text === projected,
      `resolver="${text}" projection="${projected}"`
    )
  }
}

// Divergence regression
{
  const strong = snapshot(advanceToPhase06(STRONG_STEPS))
  const poor = snapshot(advanceToPhase06(ACCUMULATED_POOR_STEPS))

  let diffs = 0
  if (strong.infectionBurden !== poor.infectionBurden) diffs += 1
  if (strong.stability !== poor.stability) diffs += 1
  if (strong.bacteremia !== poor.bacteremia) diffs += 1
  if (strong.fever !== poor.fever) diffs += 1
  if (strong.wbc !== poor.wbc) diffs += 1
  if (strong.wound !== poor.wound) diffs += 1

  assert('Divergence: strong vs poor differ on >=4 clinical dimensions', diffs >= 4, `diffs=${diffs}`)
}

// Dalbavancin reachability after clearance fix
{
  let s = advanceToPhase06(STRONG_STEPS)
  assert(
    'Dalbavancin: cultures cleared at phase_06',
    s.simulation.bacteremiaStatus === 'cleared' || s.simulation.cultureClearance === 'cleared',
    `bacteremia=${s.simulation.bacteremiaStatus} clearance=${s.simulation.cultureClearance}`
  )

  s = advanceOnly(s)
  assert('Dalbavancin: phase_07 reached', phases[s.currentPhase]?.id === 'phase_07')
  assert(
    'Dalbavancin: offered when prerequisites met',
    s.simulation.dalbavancinOffered === true || isDalbavancinEligible(s.simulation),
    `offered=${s.simulation.dalbavancinOffered} eligible=${isDalbavancinEligible(s.simulation)}`
  )

  s = confirmAndAdvance(s, 'dp_04_duration_and_transition', 'dp04_6wk_iv_opat')

  const dp = getDecisionPoint('dp_04_duration_and_transition')
  const hasDalbavancinOption = dp.options.some((o) => o.id === 'dp04_dalbavancin_weekly')
  assert('Dalbavancin: option present in duration DP', hasDalbavancinOption)
}

if (failed > 0) {
  console.error(`\n${failed} clinical-trajectory check(s) failed.`)
  process.exit(1)
}
console.log('\nAll clinical-trajectory checks passed.')
