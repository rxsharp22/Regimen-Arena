const EVENT_STYLES = {
  clinical: 'border-l-[#4a9ead]',
  lab: 'border-l-[#3d9a6e]',
  imaging: 'border-l-[#6b8cae]',
  microbiology: 'border-l-[#c9a227]',
  alert: 'border-l-[#c45c5c]',
}

const EVENT_ICONS = {
  clinical: '◆',
  lab: '▲',
  imaging: '◎',
  microbiology: '●',
  alert: '⚠',
}

function TimelineEventCard({ event, expanded, onToggle }) {
  return (
    <div
      className={`border border-[#2a3544] rounded-md bg-[#151c26] overflow-hidden border-l-[3px] ${EVENT_STYLES[event.type] ?? 'border-l-[#4a9ead]'}`}
    >
      <button
        type="button"
        onClick={() => onToggle(event.id)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#1a222d]/80 transition-colors"
      >
        <span className="text-[#4a9ead] text-sm mt-0.5 shrink-0" aria-hidden>
          {EVENT_ICONS[event.type]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#8b9cb3]">{event.type}</span>
            <span className="text-[#8b9cb3] text-xs">{expanded ? '−' : '+'}</span>
          </div>
          <h4 className="font-medium text-sm mt-0.5">{event.title}</h4>
          <p className="text-xs text-[#8b9cb3] mt-1">{event.summary}</p>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 pl-10 text-sm text-[#b8c5d6] leading-relaxed border-t border-[#2a3544]/50 pt-2">
          {event.detail}
        </div>
      )}
    </div>
  )
}

export default function ClinicalTimelinePanel({
  scenario,
  currentStage,
  unlockedStages,
  expandedEvents,
  onToggleEvent,
  onSetStage,
  onAdvance,
  canAdvance,
  stageConfig,
  gameComplete,
  outcome,
}) {
  const stages = scenario.timelineStages
  const events = scenario.timelineEvents[currentStage] ?? []

  return (
    <section className="flex flex-col h-full bg-[#1a222d] border border-[#2a3544] rounded-lg panel-glow overflow-hidden min-h-0">
      <header className="px-4 py-3 border-b border-[#2a3544] bg-[#151c26] shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] mb-1">Clinical Timeline</p>
        <h2 className="text-lg font-semibold">{scenario.title}</h2>
        <p className="text-xs text-[#8b9cb3] mt-1">{scenario.synopsis}</p>
      </header>

      <div className="px-4 py-4 border-b border-[#2a3544] shrink-0">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-px timeline-connector -translate-y-1/2 z-0" />
          {stages.map((stage, i) => {
            const unlocked = unlockedStages.includes(stage.id)
            const active = currentStage === stage.id
            return (
              <button
                key={stage.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSetStage(stage.id)}
                className={`relative z-10 flex flex-col items-center gap-1 transition-opacity ${
                  unlocked ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    active
                      ? 'border-[#4a9ead] bg-[#4a9ead]/20 text-[#4a9ead] shadow-[0_0_12px_rgba(74,158,173,0.35)]'
                      : unlocked
                        ? 'border-[#2a3544] bg-[#151c26] text-[#8b9cb3] hover:border-[#4a9ead]/50'
                        : 'border-[#2a3544] bg-[#0f1419] text-[#4a5568]'
                  }`}
                >
                  {stage.label}
                </div>
                <span className={`text-[10px] uppercase tracking-wide ${active ? 'text-[#4a9ead]' : 'text-[#8b9cb3]'}`}>
                  {stage.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-b border-[#2a3544] shrink-0">
        <h3 className="text-sm font-medium">{stageConfig?.title}</h3>
        <p className="text-xs text-[#8b9cb3] mt-1">{stageConfig?.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        {events.map((event) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            expanded={!!expandedEvents[event.id]}
            onToggle={onToggleEvent}
          />
        ))}

        {gameComplete && outcome && (
          <div className={`mt-4 p-4 rounded-lg border ${outcome.tier === 'optimal' ? 'border-[#3d9a6e]/40 bg-[#3d9a6e]/10' : outcome.tier === 'unsafe' ? 'border-[#c45c5c]/40 bg-[#c45c5c]/10' : outcome.tier === 'suboptimal' ? 'border-[#c9a227]/40 bg-[#c9a227]/10' : 'border-[#4a9ead]/40 bg-[#4a9ead]/10'}`}>
            <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mb-1">Outcome Assessment</p>
            <h4 className="text-xl font-bold mb-2">{outcome.label}</h4>
            <p className="text-sm text-[#b8c5d6]">{outcome.description}</p>
          </div>
        )}
      </div>

      {!gameComplete && (
        <footer className="px-4 py-3 border-t border-[#2a3544] bg-[#151c26] shrink-0">
          <button
            type="button"
            onClick={onAdvance}
            disabled={!canAdvance}
            className="w-full py-2.5 px-4 rounded-md text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#4a9ead]/20 border border-[#4a9ead]/50 text-[#4a9ead] hover:bg-[#4a9ead]/30 enabled:shadow-[0_0_12px_rgba(74,158,173,0.2)]"
          >
            {stageConfig?.advanceLabel ?? 'Advance Timeline'}
          </button>
        </footer>
      )}
    </section>
  )
}
