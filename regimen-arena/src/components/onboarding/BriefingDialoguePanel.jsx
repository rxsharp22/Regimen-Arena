import { NARRATOR } from '../../data/onboardingContent'

export default function BriefingDialoguePanel({
  title,
  body,
  speaker = NARRATOR.speaker,
  className = '',
}) {
  return (
    <section
      className={`briefing-dialogue-panel flex flex-col min-h-0 ${className}`}
      aria-labelledby="briefing-dialogue-title"
    >
      <div className="briefing-dialogue-connector" aria-hidden />

      <header className="briefing-dialogue-header shrink-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="briefing-transmit-dot" aria-hidden />
          <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
            {speaker}
            <span className="text-[#8b9cb3] font-normal mx-1.5" aria-hidden>
              //
            </span>
            Arena Briefing
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] mt-1">
          Clinical Briefing · Transmission active
        </p>
      </header>

      <div className="briefing-dialogue-body flex-1 min-h-0">
        <h2 id="briefing-dialogue-title" className="text-xl md:text-2xl font-bold text-[#e8edf4]">
          {title}
        </h2>
        <p className="mt-4 text-sm text-[#b8c5d6] leading-relaxed whitespace-pre-line">
          {body}
        </p>
      </div>
    </section>
  )
}
