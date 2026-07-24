/**
 * Regimen-awareness regression checks for Bone Deep.
 * Run: npx vite-node scripts/verify-regimen-awareness.mjs
 */
import decisionPoints from '../src/data/decisionPoints.json' with { type: 'json' }
import { createInitialBoneDeepState } from '../src/simulation/boneDeep/state.js'
import { applyBoneDeepDecision } from '../src/simulation/boneDeep/decisionEffects.js'
import { applyTherapyDosingForDrugs, setDrugDosingAdjusted } from '../src/simulation/boneDeep/activeRegimen.js'
import {
  resolveDecisionPointForSimulation,
  resolveDeescalationOptions,
  resolveRenalDoseOptions,
} from '../src/simulation/boneDeep/regimenPresentation.js'
import { getDecisionPoint } from '../src/utils/decisions.js'
import {
  createGameState,
  confirmAndAdvance,
  advanceOnly,
  confirmOnly,
  resolveTherapyIfNeeded,
} from './bone-deep-playtest-helpers.mjs'

let failed = 0

function assert(name, condition, detail = '') {
  const ok = Boolean(condition)
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ` (${detail})` : ''}`)
}

function optionLabels(options) {
  return options.map((o) => o.label)
}

function baseState(drugs) {
  let s = createInitialBoneDeepState()
  s = { ...s, activeTherapy: [...drugs] }
  return applyTherapyDosingForDrugs(s, drugs)
}

// A — Cefazolin active when MSSA finalizes
{
  const state = baseState(['cefazolin'])
  const dp = getDecisionPoint('dp_03_deescalation')
  const resolved = resolveDecisionPointForSimulation(dp, state)
  const labels = optionLabels(resolved.options)

  assert('A: Continue cefazolin IV appears', labels.some((l) => l === 'Continue Cefazolin IV'))
  assert('A: Transition to cefazolin IV does not appear', !labels.some((l) => /Transition to cefazolin/i.test(l)))
  assert('A: Continue vancomycin IV does not appear', !labels.some((l) => /Continue vancomycin/i.test(l)))
  assert(
    'A: Alternatives use Change to wording',
    labels.filter((l) => /nafcillin|oxacillin/i.test(l)).every((l) => l.startsWith('Change to'))
  )

  const beforeScore = state.deescalationScore
  const { state: after } = applyBoneDeepDecision(
    state,
    dp,
    resolved.options.find((o) => o.id === 'dp03_cefazolin'),
    null,
    state.activeTherapy
  )
  assert('A: De-escalation score not credited twice', after.deescalationScore === beforeScore)
  assert('A: Cefazolin remains active', after.activeTherapy.join() === 'cefazolin')
}

// B — Vancomycin active when MSSA finalizes
{
  const state = baseState(['vancomycin'])
  const resolved = resolveDecisionPointForSimulation(getDecisionPoint('dp_03_deescalation'), state)
  const labels = optionLabels(resolved.options)

  assert('B: Transition to cefazolin IV appears', labels.some((l) => /Transition to Cefazolin/i.test(l)))
  assert('B: Continue vancomycin IV appears', labels.some((l) => l === 'Continue vancomycin IV'))
  assert('B: Continue cefazolin IV does not appear', !labels.some((l) => /Continue Cefazolin/i.test(l)))
}

// C — Nafcillin active when MSSA finalizes
{
  const state = baseState(['nafcillin'])
  const resolved = resolveDecisionPointForSimulation(getDecisionPoint('dp_03_deescalation'), state)
  const labels = optionLabels(resolved.options)

  assert('C: Continue nafcillin IV appears', labels.some((l) => l === 'Continue Nafcillin IV'))
  assert('C: Transition to nafcillin IV does not appear', !labels.some((l) => /Transition to Nafcillin/i.test(l)))
  assert('C: Continue vancomycin IV does not appear', !labels.some((l) => /Continue vancomycin/i.test(l)))
}

// D — Cefazolin active, not renal-adjusted
{
  const state = baseState(['cefazolin'])
  const resolved = resolveDecisionPointForSimulation(getDecisionPoint('dp_02_dose_reassessment'), state)
  const labels = optionLabels(resolved.options)
  const ids = resolved.options.map((o) => o.id)

  assert('D: Cefazolin renal-adjustment option appears', ids.includes('dp02_adjust_cefazolin'))
  assert('D: Continuation option appears', ids.includes('dp02_no_change'))
  assert(
    'D: Current cefazolin dose and interval visible',
    resolved.instruction?.includes('2 g') && resolved.instruction?.includes('q8h')
  )
}

// E — Cefazolin active and already renal-adjusted
{
  let state = baseState(['cefazolin'])
  state = setDrugDosingAdjusted(state, 'cefazolin')
  state = { ...state, renalDoseAdjusted: true }

  const resolved = resolveDecisionPointForSimulation(getDecisionPoint('dp_02_dose_reassessment'), state)
  const ids = resolved.options.map((o) => o.id)
  const noChange = resolved.options.find((o) => o.id === 'dp02_no_change')

  assert('E: No duplicate cefazolin adjustment option', !ids.includes('dp02_adjust_cefazolin'))
  assert('E: Coherent continuation option', noChange?.label?.includes('already adjusted'))
  assert(
    'E: Adjusted dose and interval visible',
    resolved.instruction?.includes('1 g') && resolved.instruction?.includes('q12h')
  )

  const { state: after } = applyBoneDeepDecision(
    state,
    getDecisionPoint('dp_02_dose_reassessment'),
    noChange,
    null,
    state.activeTherapy
  )
  assert('E: Adjusted dosing preserved', after.therapyDosing?.cefazolin?.adjusted === true)
}

// F — Cefepime or vancomycin at renal decision
{
  for (const drug of ['cefepime', 'vancomycin']) {
    const state = baseState([drug])
    const ids = resolveRenalDoseOptions(getDecisionPoint('dp_02_dose_reassessment').options, state).map(
      (o) => o.id
    )
    assert(`F: ${drug} has renal options`, ids.some((id) => id !== 'dp02_no_change'))
    assert(`F: cefazolin option hidden for ${drug}`, !ids.includes('dp02_adjust_cefazolin'))
  }
}

// G — No internal implementation strings in production rendering
{
  const drugs = ['cefazolin', 'vancomycin', 'nafcillin']
  for (const drug of drugs) {
    const state = baseState([drug])
    for (const dpId of ['dp_02_dose_reassessment', 'dp_03_deescalation']) {
      const resolved = resolveDecisionPointForSimulation(getDecisionPoint(dpId), state)
      const blob = JSON.stringify(resolved)
      assert(
        `G: No internal strings in ${dpId} (${drug})`,
        !/applicable_if|DP1|hidden state|dp02_|dp03_/i.test(
          `${resolved.prompt} ${resolved.instruction ?? ''} ${resolved.note ?? ''} ${optionLabels(resolved.options).join(' ')}`
        )
      )
      void blob
    }
  }
}

// H — Full cefazolin path state consistency
{
  let s = createGameState()
  s = confirmAndAdvance(s, 'dp_01_empiric_regimen', 'opt_cefazolin_mono')
  assert('H: Empiric cefazolin active', s.activeDrugs.join() === 'cefazolin')
  assert('H: Empiric dosing recorded', s.simulation.therapyDosing?.cefazolin?.dose === '2 g')

  s = advanceOnly(s)
  s = confirmAndAdvance(s, 'dp_gram_stain_response', 'gs_continue_empiric')
  s = confirmAndAdvance(s, 'dp_source_control', 'sc_urgent_or')

  const renalDp = resolveDecisionPointForSimulation(getDecisionPoint('dp_02_dose_reassessment'), s.simulation)
  assert('H: Renal screen shows cefazolin adjust', renalDp.options.some((o) => o.id === 'dp02_adjust_cefazolin'))

  s = confirmAndAdvance(s, 'dp_02_dose_reassessment', 'dp02_adjust_cefazolin')
  assert('H: After renal adjust, cefazolin dosing updated', s.simulation.therapyDosing?.cefazolin?.adjusted === true)

  s = resolveTherapyIfNeeded(s, {
    dp_vanco_infusion_response: 'vanco_pause_slow_restart',
    dp_cefepime_neuro_response: 'cefepime_adjust_monitor',
    dp_allergy_clarification: 'allergy_proceed_cefazolin',
  })
  if (s.simulation.therapyEventState?.pendingDecisionId === 'dp_allergy_clarification') {
    s = confirmOnly(s, 'dp_allergy_clarification', 'allergy_proceed_cefazolin')
  }

  const deescDp = resolveDecisionPointForSimulation(getDecisionPoint('dp_03_deescalation'), s.simulation)
  const continueCef = deescDp.options.find((o) => o.id === 'dp03_cefazolin')
  assert('H: MSSA finalize shows Continue cefazolin', continueCef?.label === 'Continue Cefazolin IV')

  const deescScoreBefore = s.simulation.deescalationScore
  s = confirmAndAdvance(s, 'dp_03_deescalation', 'dp03_cefazolin')
  assert('H: De-escalation not double-credited', s.simulation.deescalationScore === deescScoreBefore)

  const lastLog = s.eventLog[s.eventLog.length - 1]
  assert('H: Event log records regimen action', lastLog.regimenAction === 'continue')
  assert('H: Event log active regimen matches', lastLog.activeRegimenAfter?.join() === 'cefazolin')
}

if (failed > 0) {
  console.error(`\n${failed} regimen-awareness check(s) failed.`)
  process.exit(1)
}
console.log('\nAll regimen-awareness checks passed.')
