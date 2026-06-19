export default function PhaseHeader({ phase, currentIndex, totalPhases, score, scoreMaxes }) {
  const total = Object.values(score ?? {}).reduce((s, v) => s + v, 0)
  const max = Object.values(scoreMaxes ?? {}).reduce((s, v) => s + v, 0)
  const pct = max > 0 ? (total / max) * 100 : 0

  return (
    <header className="border-b border-[#2a3544] pb-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead]">
          Phase {currentIndex + 1} of {totalPhases}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: totalPhases }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i < currentIndex ? 'bg-[#3d9a6e]' : i === currentIndex ? 'bg-[#4a9ead]' : 'bg-[#2a3544]'
              }`}
            />
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-bold">{phase.label}</h2>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] text-[#8b9cb3] uppercase tracking-widest shrink-0">
          Score
        </span>
        <div className="flex-1 h-1.5 bg-[#0f1419] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#4a9ead] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] text-[#8b9cb3] tabular-nums shrink-0">
          {Math.round(pct)}%
        </span>
      </div>
    </header>
  )
}
