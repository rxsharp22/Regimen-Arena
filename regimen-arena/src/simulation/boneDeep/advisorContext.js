/** Maps Bone Deep phases and events to advisor sprite / tone — UI helper only. */

export function getAdvisorForPhase(phaseId, { simulation, conditionalEvents = [] } = {}) {
  const hasTox = conditionalEvents.some((e) => e.type === 'toxicity_event' || e.type === 'adverse_event')
  const hasLab = conditionalEvents.some((e) => e.type === 'lab_result' || e.type === 'microbiology')

  switch (phaseId) {
    case 'phase_01':
      return {
        spriteKey: 'idDoc',
        title: 'ID Consult',
        subtitle: 'New consult — diabetic foot infection',
        tone: 'neutral',
        body: 'New consult: diabetic foot infection with concern for deeper involvement. Cultures are pending, renal function is not pristine, and source control may matter as much as the first antibiotic choice.',
      }
    case 'phase_02':
      return {
        spriteKey: 'labTech',
        title: 'Laboratory',
        subtitle: 'Overnight culture and imaging data',
        tone: 'lab',
        body: null,
      }
    case 'phase_02b':
      return {
        spriteKey: 'labTech',
        title: 'Microbiology',
        subtitle: 'Preliminary Gram stain available',
        tone: 'lab',
        body: 'Preliminary blood culture update: Gram-positive cocci in clusters. Identification and susceptibilities are pending.',
      }
    case 'phase_04':
      return {
        spriteKey: 'pharmacist',
        title: 'Pharmacy',
        subtitle: 'Renal dosing reassessment',
        tone: 'pharmacy',
        body: 'Renal function has changed on therapy. Review dose and interval for renally cleared agents.',
      }
    case 'phase_05':
      return {
        spriteKey: 'labTech',
        title: 'Microbiology',
        subtitle: 'Culture finalization',
        tone: 'lab',
        body: null,
      }
    case 'phase_06':
      if (simulation?.daptoToxicityPending) {
        return {
          spriteKey: 'pharmacistDesk',
          title: 'Pharmacy monitoring',
          subtitle: 'Daptomycin toxicity signal',
          tone: 'warning',
          body: simulation.daptoToxicityNarrative,
        }
      }
      return {
        spriteKey: hasTox ? 'pharmacist' : 'labTech',
        title: hasTox ? 'Pharmacy / Toxicity' : 'Clinical response',
        subtitle: 'Mid-course assessment',
        tone: hasTox ? 'warning' : 'neutral',
        body: null,
      }
    case 'phase_07':
      return {
        spriteKey: 'pharmacistDesk',
        title: 'Disposition planning',
        subtitle: 'Duration and route',
        tone: 'pharmacy',
        body: null,
      }
    case 'phase_08':
      return {
        spriteKey: 'pharmacist',
        title: 'OPAT coordination',
        subtitle: 'Outpatient monitoring plan',
        tone: 'pharmacy',
        body: null,
      }
    case 'phase_09':
      return {
        spriteKey: 'scribe5',
        title: 'Post-Discharge Course',
        subtitle: 'The case clock advances beyond discharge',
        tone: 'neutral',
        body: simulation?.postDischargeNarrative,
      }
    default:
      if (hasLab) {
        return { spriteKey: 'labTech', title: 'Chart update', tone: 'lab', body: null }
      }
      return null
  }
}

export function getAdvisorForConditionalEvent(event) {
  if (!event) return null
  if (event.type === 'toxicity_event' || event.type === 'adverse_event' || event.type === 'safety_alert') {
    return {
      spriteKey: 'pharmacist',
      title: 'Pharmacy alert',
      subtitle: event.type.replace(/_/g, ' '),
      tone: 'warning',
      body: event.content,
    }
  }
  if (event.type === 'treatment_failure' || event.type === 'relapse_event') {
    return {
      spriteKey: 'labTech',
      title: 'Clinical concern',
      subtitle: 'Evolving course',
      tone: 'declining',
      body: event.content,
    }
  }
  if (event.type === 'microbiology' || event.type === 'lab_result') {
    return {
      spriteKey: 'labTech',
      title: 'Laboratory',
      subtitle: 'New data',
      tone: 'lab',
      body: event.content,
    }
  }
  return null
}

export function getAdvisorForTherapyEvent(decisionId, simulation) {
  const event = simulation?.therapyEventState?.triggeredEvents?.find(
    (e) => !e.resolved && e.responseDecisionId === decisionId
  )

  switch (decisionId) {
    case 'dp_vanco_infusion_response':
      return {
        spriteKey: 'pharmacist',
        title: 'Pharmacy / Nursing',
        subtitle: 'Vancomycin infusion reaction',
        tone: 'warning',
        body: event?.narrative ?? 'Infusion-related symptoms reported during vancomycin administration.',
      }
    case 'dp_cefepime_neuro_response':
      return {
        spriteKey: 'pharmacist',
        title: 'Pharmacy / Neurology concern',
        subtitle: 'Neurologic change on therapy',
        tone: 'warning',
        body:
          event?.narrative ??
          'New confusion and myoclonic activity noted. Cefepime exposure is reassessed among other causes.',
      }
    case 'dp_allergy_clarification':
      return {
        spriteKey: 'scribe5',
        title: 'Allergy reconciliation',
        subtitle: 'Beta-lactam stewardship opportunity',
        tone: 'neutral',
        body:
          event?.narrative ??
          'Allergy history clarification may support appropriate beta-lactam use for MSSA when otherwise indicated.',
      }
    case 'dp_dapto_toxicity_response':
      return {
        spriteKey: 'pharmacistDesk',
        title: 'Pharmacy monitoring',
        subtitle: 'Daptomycin toxicity signal',
        tone: 'warning',
        body: simulation?.daptoToxicityNarrative ?? event?.narrative,
      }
    default:
      return null
  }
}
