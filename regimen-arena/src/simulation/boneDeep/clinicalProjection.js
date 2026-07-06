function stabilityLabel(score) {
  if (score < 30) return 'critical'
  if (score < 50) return 'guarded'
  if (score < 70) return 'improving'
  return 'stable'
}

function trendFromDelta(delta) {
  if (delta > 0.05) return 'up'
  if (delta < -0.05) return 'down'
  return 'stable'
}

function feverTrend(prev, current) {
  return trendFromDelta(current - prev)
}

function woundDescription(drainage, sourceControl) {
  const map = {
    purulent: 'Plantar wound with purulent drainage and surrounding erythema.',
    purulent_increasing: 'Wound drainage worsening; purulence increasing despite antibiotics.',
    decreasing_serous: 'Drainage decreasing; mixed serous output after debridement.',
    serous_minimal: 'Minimal serous drainage; wound bed granulating.',
  }
  const base = map[drainage] ?? map.purulent
  if (sourceControl === 'delayed' || sourceControl === 'inadequate') {
    return `${base} Abscess pocket remains uncontrolled.`
  }
  if (sourceControl === 'scheduled') {
    return `${base} Surgical debridement scheduled.`
  }
  if (sourceControl === 'completed') {
    return `${base} Source control achieved after debridement.`
  }
  return base
}

function cultureStatusText(state) {
  if (state.cultureClearance === 'cleared') return 'Repeat blood cultures: no growth'
  if (state.bacteremiaStatus === 'positive_pending') return 'Blood cultures pending'
  if (state.gramStainRevealed && !state.organismRevealed) {
    return 'Preliminary Gram stain: gram-positive cocci in clusters — identification pending'
  }
  if (state.bacteremiaStatus === 'positive_confirmed') return 'Blood cultures positive ×2'
  if (state.bacteremiaStatus === 'persistent') return 'Persistent bacteremia on repeat cultures'
  if (state.bacteremiaStatus === 'clearing' || state.bacteremiaStatus === 'clearing_slow') {
    return 'Initial bacteremia; clearance in progress'
  }
  if (state.bacteremiaStatus === 'cleared') return 'Blood cultures cleared'
  return 'Blood cultures pending'
}

function organismText(state) {
  if (!state.organismRevealed) {
    if (state.gramStainRevealed) {
      return 'Gram-positive cocci in clusters — identification pending'
    }
    return 'Organism not yet identified'
  }
  if (state.susceptibilityRevealed) {
    return `${state.organismIdentity} — oxacillin susceptible (beta-lactam susceptible)`
  }
  return state.organismIdentity ?? 'Gram-positive cocci'
}

function renalNarrative(state) {
  const scr = state.creatinine.toFixed(1)
  if (state.akiOccurred) {
    return `SCr ${scr} mg/dL — AKI on CKD; ${state.renalDoseAdjusted ? 'dose adjustment in place' : 'dose adjustment needed'}`
  }
  if (state.renalTrend === 'worsening') return `SCr ${scr} mg/dL (worsening from baseline 1.9)`
  if (state.renalTrend === 'improving') return `SCr ${scr} mg/dL (improving toward baseline)`
  return `SCr ${scr} mg/dL`
}

function dischargeNarrative(state) {
  if (state.relapseOccurred) return 'Readmitted — discharge plan failed'
  if (state.transferredForSourceControl) return 'Transferred for surgical source control'
  if (state.dischargeReadiness >= 70 && state.opatReadiness >= 60) {
    return 'Discharge planning active; OPAT coordination underway'
  }
  if (state.dischargeReadiness >= 40) return 'Discharge planning in progress'
  return 'Inpatient care continuing'
}

function complicationFlags(state) {
  const flags = []
  if (state.akiOccurred) flags.push('AKI')
  if (state.persistentBacteremia || state.bacteremiaStatus === 'persistent') flags.push('Persistent bacteremia')
  if (state.sourceControlStatus === 'delayed' || state.sourceControlStatus === 'inadequate') {
    flags.push('Inadequate source control')
  }
  if (state.treatmentFailure) flags.push('Treatment failure risk')
  if (state.relapseOccurred) flags.push('Relapse')
  return flags
}

export function projectClinicalState(state, previousSnapshot = null) {
  const stability = stabilityLabel(state.patientStability)
  const prevFever = previousSnapshot?.vitals?.temp_c ?? state.feverC
  const prevScr = previousSnapshot?.vitals?.scr ?? state.creatinine
  const prevWbc = previousSnapshot?.vitals?.wbc ?? state.wbc

  const statusParts = [
    `T ${state.feverC.toFixed(1)}°C`,
    state.feverC < 38 ? 'afebrile trend' : 'febrile',
    `WBC ${state.wbc.toFixed(1)}`,
    renalNarrative(state),
    cultureStatusText(state),
  ]

  if (state.woundDrainage) {
    statusParts.push(woundDescription(state.woundDrainage, state.sourceControlStatus))
  }

  return {
    stability,
    stabilityLabel: stability.charAt(0).toUpperCase() + stability.slice(1),
    statusText: statusParts.join(' · '),
    vitals: {
      temp_c: Number(state.feverC.toFixed(1)),
      hr: state.patientStability < 40 ? 118 : state.patientStability < 60 ? 104 : 88,
      bp: state.patientStability < 40 ? '98/62' : state.patientStability < 60 ? '108/70' : '122/76',
      scr: Number(state.creatinine.toFixed(1)),
      wbc: Number(state.wbc.toFixed(1)),
    },
    trend: {
      temp: feverTrend(prevFever, state.feverC),
      scr: trendFromDelta(state.creatinine - prevScr),
      wbc: trendFromDelta(state.wbc - prevWbc),
      hr: state.patientStability < 50 ? 'up' : 'down',
      bp: state.patientStability < 50 ? 'down' : 'up',
    },
    woundStatus: woundDescription(state.woundDrainage, state.sourceControlStatus),
    cultureStatus: cultureStatusText(state),
    organismStatus: organismText(state),
    organismId: state.organismRevealed ? 'mssa' : null,
    sourceControlStatus: state.sourceControlStatus,
    sourceControlLabel: formatSourceControl(state.sourceControlStatus),
    renalStatus: renalNarrative(state),
    bacteremiaStatus: state.bacteremiaStatus,
    dischargeStatus: dischargeNarrative(state),
    opatStatus:
      state.opatReadiness >= 60
        ? 'OPAT plan feasible with monitoring'
        : state.opatReadiness >= 30
          ? 'OPAT requires additional planning'
          : 'OPAT not yet safe',
    complications: complicationFlags(state),
    renalWarning: state.toxicityBurden >= 7 || state.akiOccurred,
    abscessUncontrolled:
      state.sourceControlStatus === 'delayed' ||
      state.sourceControlStatus === 'inadequate' ||
      state.sourceControlStatus === 'uncontrolled_abscess',
    cefazolinActive: state.activeTherapy.includes('cefazolin'),
    showRenalWarningIcon: state.toxicityBurden >= 7 || (state.akiOccurred && !state.renalDoseAdjusted),
    showSourceControlTether:
      state.sourceControlStatus === 'delayed' ||
      state.sourceControlStatus === 'inadequate' ||
      state.sourceControlStatus === 'uncontrolled_abscess',
  }
}

function formatSourceControl(status) {
  const map = {
    uncontrolled_abscess: 'Abscess uncontrolled — debridement needed',
    scheduled: 'Debridement scheduled',
    completed: 'Surgical debridement completed',
    delayed: 'Source control delayed',
    inadequate: 'Inadequate source control',
  }
  return map[status] ?? status
}

export function buildImmediateClinicalUpdate(state, decisionLabel, hiddenEffects) {
  const snapshot = projectClinicalState(state)
  const lines = [`Order placed: ${decisionLabel}.`]

  if (hiddenEffects.some((e) => e.includes('source_control'))) {
    lines.push(snapshot.sourceControlLabel)
  }
  if (hiddenEffects.some((e) => e.includes('renal') || e.includes('toxicity'))) {
    lines.push(snapshot.renalStatus)
  }
  if (state.activeTherapy.length > 0) {
    lines.push(`Active regimen updated.`)
  }

  lines.push('Clinical course will evolve with time — monitor labs, cultures, and wound status.')

  return {
    headline: 'Order acknowledged',
    narrative: lines.join('\n'),
    snapshot,
    illustration: pickIllustration(state, hiddenEffects),
  }
}

function pickIllustration(state, hiddenEffects) {
  if (state.showRenalWarningIcon) return 'renal_warning'
  if (state.showSourceControlTether) return 'source_control_tether'
  if (state.cefazolinActive && state.organismRevealed) return 'cefazolin_wall'
  if (hiddenEffects.some((e) => e.includes('active_therapy'))) return 'therapy_deployed'
  return 'none'
}
