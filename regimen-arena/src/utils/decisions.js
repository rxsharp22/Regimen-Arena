import decisionPoints from '../data/decisionPoints.json'
import drugs from '../data/drugs.json'

export function getDecisionPoint(id) {
  return decisionPoints[id] ?? null
}

export function getDrugById(id) {
  return drugs.find((d) => d.id === id) ?? null
}

export function filterDp2Options(options, activeDrugs) {
  return options.filter((opt) => {
    if (!opt.applicable_if) return true
    if (opt.applicable_if.includes('any')) return true
    return opt.applicable_if.some((drugId) => activeDrugs.includes(drugId))
  })
}

export function getSpectrumTagsForOption(option) {
  if (!option.drugs?.length) return []
  const tags = new Set()
  for (const drugId of option.drugs) {
    const drug = getDrugById(drugId)
    drug?.spectrum_tags?.forEach((t) => tags.add(t))
  }
  return [...tags]
}

export function optionRequiresRenalAdjustment(option) {
  if (!option.drugs?.length) return false
  return option.drugs.some((id) => getDrugById(id)?.renal_adjustment_required)
}

export function scoreMonitoringPlan(selectedIds, activeDrugs, dp, decisions = {}) {
  const options = dp.options
  let monitoringScore = 0
  const feedbackParts = []
  let hasCritical = false

  const selected = new Set(selectedIds)
  const ivOpatActive = [
    'dp04_6wk_iv_opat',
    'dp04_4wk_iv_then_oral',
    'dp04_4wk_iv_total',
    'dp04_2wk_iv_oral',
  ].includes(decisions.dp_04_duration_and_transition)

  for (const opt of options) {
    if (selected.has(opt.id)) {
      if (opt.critical_flag) {
        hasCritical = true
        if (opt.feedback_if_selected) feedbackParts.push(opt.feedback_if_selected)
      } else {
        if (opt.points) monitoringScore += opt.points
        if (opt.feedback_if_selected) feedbackParts.push(opt.feedback_if_selected)
      }
    }
  }

  for (const opt of options) {
    if (opt.required && !selected.has(opt.id)) {
      monitoringScore = Math.max(0, monitoringScore - 2)
      feedbackParts.push(opt.feedback_if_missed)
    }
    if (opt.required_if) {
      const drugNeeded = opt.required_if.some((d) => activeDrugs.includes(d))
      const ivOpatNeeded = opt.required_if.includes('iv_opat') && ivOpatActive
      if ((drugNeeded || ivOpatNeeded) && !selected.has(opt.id)) {
        monitoringScore = Math.max(0, monitoringScore - 2)
        feedbackParts.push(opt.feedback_if_missed)
      }
    }
  }

  monitoringScore = Math.min(10, Math.max(0, monitoringScore))

  const selectedLabels = options.filter((o) => selected.has(o.id)).map((o) => o.label)

  return {
    monitoringScore,
    feedbackParts,
    hasCritical,
    outcome: hasCritical ? 'unsafe' : monitoringScore >= 8 ? 'optimal' : monitoringScore >= 5 ? 'reasonable' : 'suboptimal',
    selectedLabels,
  }
}
