const CRITICAL_EXPLANATIONS = {
  critical_error_linezolid_bacteremia:
    'Linezolid was selected for active Staphylococcal bacteremia — a bacteriostatic agent inappropriate for bloodstream infection clearance.',
  critical_insufficient_duration:
    'Therapy duration was truncated despite confirmed osteomyelitis — high relapse risk.',
  critical_no_monitoring_plan:
    'No outpatient monitoring plan was established for a prolonged antimicrobial course.',
  dp03_linezolid:
    'Linezolid chosen for Staphylococcal bacteremia — critical treatment failure risk.',
  dp04_14_days_total:
    '14-day total duration chosen despite bone involvement and bacteremia.',
  mon_nothing:
    'Discharged without structured monitoring for complicated MSSA osteomyelitis on OPAT.',
}

export default function CriticalFlags({ flags }) {
  if (!flags?.length) return null

  return (
    <div className="p-4 rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10">
      <h3 className="text-sm font-semibold text-[#ef4444] mb-3">Critical Errors</h3>
      <ul className="space-y-2">
        {flags.map((flag) => (
          <li key={flag} className="text-sm text-[#b8c5d6]">
            <span className="text-[#ef4444] font-medium">{flag.replace(/_/g, ' ')}</span>
            {CRITICAL_EXPLANATIONS[flag] && (
              <span className="block text-xs text-[#8b9cb3] mt-0.5">
                {CRITICAL_EXPLANATIONS[flag]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
