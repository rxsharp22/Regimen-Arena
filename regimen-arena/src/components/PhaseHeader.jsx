export default function PhaseHeader({ phase, currentIndex, totalPhases }) {
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
    </header>
  )
}
