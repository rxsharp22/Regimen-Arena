/**
 * Verifies allergy clarification vs MSSA de-escalation scoring alignment.
 * Run: npx vite-node scripts/verify-allergy-scoring.mjs
 */
import phases from '../src/data/phases.json' with { type: 'json' }
import decisionPoints from '../src/data/decisionPoints.json' with { type: 'json' }
import { INITIAL_SCORE, SCORE_MAXES } from '../src/utils/scoring.js'
import { initBoneDeepSimulation } from '../src/simulation/boneDeep/index.js'
import { applyConfirmDecision, applyAdvancePhase } from '../src/utils/gameReducerHelpers.js'
import { getPendingTherapyEventDecisionId } from '../src/simulation/boneDeep/therapyEvents.js'
import { getDecisionPoint } from '../src/utils/decisions.js'

function createState() {
  const init = initBoneDeepSimulation()
  return {
    scenarioId: 'scenario_01',
    currentPhase: 0,
    phaseHistory: [],
    decisions: {},
    activeFlags: [],
    activeDrugs: [],
    criticalFlags: [],
    score: { ...INITIAL_SCORE },
    scoreMaxes: { ...SCORE_MAXES },
    feedbackLog: [],
    conditionalEvents: [],
    gameStatus: 'active',
    showFeedback: false,
    lastFeedback: null,
    simulation: init.simulation,
    eventLog: init.eventLog,
    clinicalSnapshot: init.clinicalSnapshot,
    debrief: null,
  }
}

function opt(dpId, optionId) {
  const dp = getDecisionPoint(dpId)
  const option = dp.options.find((o) => o.id === optionId)
  if (!option) throw new Error(`Missing option ${optionId} on ${dpId}`)
  return { decisionPoint: dp, option }
}

function confirmAndAdvance(state, dpId, optionId) {
  const { decisionPoint, option } = opt(dpId, optionId)
  const after = applyConfirmDecision(state, {
    decisionPoint,
    option,
    phaseIndex: state.currentPhase,
    subOption: null,
  })
  return applyAdvancePhase(after)
}

function advanceOnly(state) {
  return applyAdvancePhase(state)
}

function snapshot(state, label) {
  const sim = state.simulation
  return {
    label,
    scoreDeescalation: state.score.deescalation,
    simDeescalationScore: sim.deescalationScore,
    stewardshipDeescalation: sim.stewardshipDomains?.deescalation ?? 0,
    allergyStewardship: sim.allergyStewardship,
    pendingTherapyDp: getPendingTherapyEventDecisionId(sim, state.decisions),
  }
}

function confirmOnly(state, dpId, optionId) {
  const { decisionPoint, option } = opt(dpId, optionId)
  return applyConfirmDecision(state, {
    decisionPoint,
    option,
    phaseIndex: state.currentPhase,
    subOption: null,
  })
}

function playToCultureReveal(state) {
  let s = confirmAndAdvance(state, 'dp_01_empiric_regimen', 'opt_vanco_cefepime')
  s = advanceOnly(s) // phase_02 info
  s = confirmAndAdvance(s, 'dp_gram_stain_response', 'gs_continue_empiric')
  s = confirmAndAdvance(s, 'dp_source_control', 'sc_urgent_or')
  s = confirmAndAdvance(s, 'dp_02_dose_reassessment', 'dp02_reduce_cefepime')
  return s // now at phase_05 after last advance
}

const THERAPY_DEFAULT_RESPONSE = {
  dp_vanco_infusion_response: 'vanco_pause_slow_restart',
  dp_cefepime_neuro_response: 'cefepime_adjust_monitor',
  dp_dapto_toxicity_response: 'dapto_resp_hold_recheck_ck',
}

function resolveBlockingTherapyEvents(state) {
  let pending = getPendingTherapyEventDecisionId(state.simulation, state.decisions)
  while (pending && pending !== 'dp_allergy_clarification') {
    const responseId = THERAPY_DEFAULT_RESPONSE[pending]
    if (!responseId) {
      throw new Error(`Unexpected therapy event before allergy clarification: ${pending}`)
    }
    state = confirmOnly(state, pending, responseId)
    pending = getPendingTherapyEventDecisionId(state.simulation, state.decisions)
  }
  return state
}

function runPath(deescalationOptionId) {
  let state = playToCultureReveal(createState())
  state = resolveBlockingTherapyEvents(state)

  const atReveal = snapshot(state, 'At culture reveal (before allergy DP)')
  if (atReveal.pendingTherapyDp !== 'dp_allergy_clarification') {
    throw new Error(
      `Expected dp_allergy_clarification pending, got ${atReveal.pendingTherapyDp}`
    )
  }

  state = confirmOnly(state, 'dp_allergy_clarification', 'allergy_proceed_cefazolin')
  const afterAllergy = snapshot(state, 'After allergy_proceed_cefazolin')

  const pendingAfterAllergy = getPendingTherapyEventDecisionId(state.simulation, state.decisions)
  if (pendingAfterAllergy) {
    throw new Error(`Therapy DP still pending after allergy response: ${pendingAfterAllergy}`)
  }

  state = confirmOnly(state, 'dp_03_deescalation', deescalationOptionId)
  const afterDeescalation = snapshot(state, `After ${deescalationOptionId}`)

  return { atReveal, afterAllergy, afterDeescalation }
}

console.log('=== Scoring pipeline check ===\n')

const bad = runPath('dp03_continue_vancomycin')
const good = runPath('dp03_cefazolin')

function printPath(title, result) {
  console.log(title)
  for (const row of [result.afterAllergy, result.afterDeescalation]) {
    console.log(
      `  ${row.label}: score.deescalation=${row.scoreDeescalation}/10, deescalationScore=${row.simDeescalationScore}, stewardship.deescalation=${row.stewardshipDeescalation}`
    )
  }
  console.log('')
}

printPath('Path A — allergy reconciled, then continue vancomycin (poor MSSA de-escalation):', bad)
printPath('Path B — allergy reconciled, then cefazolin (appropriate MSSA de-escalation):', good)

const badFinal = bad.afterDeescalation
const goodFinal = good.afterDeescalation

const checks = [
  {
    name: 'Allergy alone does not max score.deescalation',
    pass: bad.afterAllergy.scoreDeescalation <= 5,
    detail: `got ${bad.afterAllergy.scoreDeescalation}`,
  },
  {
    name: 'Allergy alone does not set deescalationScore',
    pass: bad.afterAllergy.simDeescalationScore === 0,
    detail: `got ${bad.afterAllergy.simDeescalationScore}`,
  },
  {
    name: 'Poor MSSA de-escalation stays well below perfect on score.deescalation',
    pass: badFinal.scoreDeescalation < 8,
    detail: `got ${badFinal.scoreDeescalation}`,
  },
  {
    name: 'Poor MSSA de-escalation keeps deescalationScore at 0',
    pass: badFinal.simDeescalationScore === 0,
    detail: `got ${badFinal.simDeescalationScore}`,
  },
  {
    name: 'Appropriate MSSA de-escalation improves score.deescalation vs poor path',
    pass: goodFinal.scoreDeescalation > badFinal.scoreDeescalation,
    detail: `good=${goodFinal.scoreDeescalation}, bad=${badFinal.scoreDeescalation}`,
  },
  {
    name: 'Appropriate MSSA de-escalation sets deescalationScore high',
    pass: goodFinal.simDeescalationScore >= 8,
    detail: `got ${goodFinal.simDeescalationScore}`,
  },
  {
    name: 'Score + simulation pipelines agree on good path (both near max)',
    pass:
      goodFinal.scoreDeescalation >= 8 &&
      goodFinal.simDeescalationScore >= 8 &&
      goodFinal.stewardshipDeescalation >= 8,
    detail: `score=${goodFinal.scoreDeescalation}, sim=${goodFinal.simDeescalationScore}, domain=${goodFinal.stewardshipDeescalation}`,
  },
]

let failed = 0
for (const c of checks) {
  const mark = c.pass ? 'PASS' : 'FAIL'
  if (!c.pass) failed += 1
  console.log(`${mark}: ${c.name} (${c.detail})`)
}

process.exit(failed > 0 ? 1 : 0)
