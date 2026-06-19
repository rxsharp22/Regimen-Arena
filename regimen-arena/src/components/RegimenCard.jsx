const WARNING_META = {
  nephrotoxicity: { icon: '◉', label: 'Nephrotoxicity', color: '#c45c5c' },
  neurotoxicity: { icon: '◉', label: 'Neurotoxicity risk', color: '#c9a227' },
  cdiff: { icon: '◉', label: 'C. difficile risk', color: '#c9a227' },
  myopathy: { icon: '◉', label: 'Myopathy / CK', color: '#c9a227' },
  hepatotoxicity: { icon: '◉', label: 'Hepatotoxicity', color: '#c9a227' },
  myelosuppression: { icon: '◉', label: 'Myelosuppression', color: '#c45c5c' },
  bacteriostatic: { icon: '◉', label: 'Bacteriostatic', color: '#c45c5c' },
  stewardship: { icon: '◉', label: 'Stewardship concern', color: '#c9a227' },
}

const SPECTRUM_LABELS = [
  { key: 'gramPositive', label: 'G+' },
  { key: 'gramNegative', label: 'G−' },
  { key: 'anaerobes', label: 'Ana' },
  { key: 'pseudomonas', label: 'Ps' },
]

function SpectrumBars({ spectrum }) {
  return (
    <div className="space-y-1 mt-2">
      {SPECTRUM_LABELS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-[9px] text-[#8b9cb3] w-6 shrink-0">{label}</span>
          <div className="flex-1 h-1.5 bg-[#0f1419] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${spectrum[key]}%`,
                backgroundColor: spectrum[key] > 70 ? '#3d9a6e' : spectrum[key] > 30 ? '#4a9ead' : '#2a3544',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function WarningIcons({ warnings }) {
  if (!warnings?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {warnings.map((w) => {
        const meta = WARNING_META[w] ?? { icon: '◉', label: w, color: '#c9a227' }
        return (
          <span
            key={w}
            className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border"
            style={{ borderColor: `${meta.color}40`, color: meta.color, backgroundColor: `${meta.color}15` }}
            title={meta.label}
          >
            <span aria-hidden>{meta.icon}</span>
            {meta.label}
          </span>
        )
      })}
    </div>
  )
}

export function RegimenCard({ drug, inRegimen, onAdd, onRemove, compact }) {
  return (
    <div
      className={`border rounded-md p-3 transition-all ${
        inRegimen
          ? 'border-[#4a9ead]/60 bg-[#4a9ead]/10 shadow-[0_0_8px_rgba(74,158,173,0.15)]'
          : 'border-[#2a3544] bg-[#151c26] hover:border-[#2a3544]/80'
      } ${compact ? 'p-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-sm truncate">{drug.display_name}</h4>
          <p className="text-[10px] text-[#8b9cb3]">{drug.class} · {drug.route}</p>
        </div>
        {inRegimen ? (
          <button
            type="button"
            onClick={() => onRemove(drug.id)}
            className="shrink-0 text-[10px] px-2 py-1 rounded border border-[#c45c5c]/40 text-[#c45c5c] hover:bg-[#c45c5c]/10"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(drug)}
            className="shrink-0 text-[10px] px-2 py-1 rounded border border-[#3d9a6e]/40 text-[#3d9a6e] hover:bg-[#3d9a6e]/10"
          >
            Add
          </button>
        )}
      </div>
      {!compact && (
        <>
          <SpectrumBars spectrum={drug.spectrum} />
          <WarningIcons warnings={drug.warnings} />
          {drug.renal_adjustment_required && (
            <p className="text-[9px] text-[#c9a227] mt-2">⚠ Renal adjustment required</p>
          )}
        </>
      )}
    </div>
  )
}

export function ActiveRegimenItem({ drug, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded border border-[#4a9ead]/30 bg-[#4a9ead]/5">
      <div>
        <span className="text-sm font-medium">{drug.display_name}</span>
        <span className="text-[10px] text-[#8b9cb3] ml-2">{drug.dose_placeholder}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-[10px] px-2 py-0.5 rounded border border-[#2a3544] text-[#8b9cb3] hover:text-[#e8edf4]"
          title="Dose adjustment placeholder"
        >
          Adjust
        </button>
        <button
          type="button"
          onClick={() => onRemove(drug.id)}
          className="text-[10px] text-[#c45c5c] hover:underline"
        >
          ×
        </button>
      </div>
    </div>
  )
}
