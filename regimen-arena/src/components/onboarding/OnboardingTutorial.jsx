import { useState } from 'react'
import { TUTORIAL_SCREENS, TUTORIAL_ACCESS_LABEL } from '../../data/onboardingContent'
import StewardshipLeadNarrator from './StewardshipLeadNarrator'

export default function OnboardingTutorial({ onComplete }) {
  const [step, setStep] = useState(0)
  const screen = TUTORIAL_SCREENS[step]
  const isLast = step === TUTORIAL_SCREENS.length - 1

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1419]">
      <header className="shrink-0 border-b border-[#2a3544] bg-[#151c26] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#4a9ead]/40 flex items-center justify-center text-[#4a9ead] font-bold text-sm">
              RA
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Regimen Arena</h1>
              <p className="text-[10px] text-[#8b9cb3] uppercase tracking-widest">
                {TUTORIAL_ACCESS_LABEL} · Step {step + 1} of {TUTORIAL_SCREENS.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="text-[10px] uppercase tracking-widest text-[#8b9cb3] hover:text-[#4a9ead] transition-colors"
          >
            Skip
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <article className="w-full max-w-2xl bg-[#151c26] border border-[#2a3544] rounded-xl overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.25)]">
          <div className="px-6 py-4 border-b border-[#2a3544] bg-[#1a222d]">
            <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
              Stewardship Lead briefing
            </p>
            <h2 className="text-2xl font-bold text-[#e8edf4] mt-1">{screen.title}</h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            <StewardshipLeadNarrator />
            <blockquote className="border-l-2 border-[#4a9ead]/50 pl-4">
              <p className="text-sm text-[#b8c5d6] leading-relaxed whitespace-pre-line">
                {screen.body}
              </p>
            </blockquote>
          </div>

          <footer className="px-6 py-4 border-t border-[#2a3544] bg-[#1a222d]/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-label="Tutorial progress">
              {TUTORIAL_SCREENS.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    i === step ? 'bg-[#4a9ead]' : i < step ? 'bg-[#4a9ead]/40' : 'bg-[#2a3544]'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-2 rounded-lg text-sm text-[#8b9cb3] border border-[#2a3544] hover:border-[#4a9ead]/40 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => (isLast ? onComplete() : setStep((s) => s + 1))}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#4a9ead]/20 border border-[#4a9ead]/50 text-[#4a9ead] hover:bg-[#4a9ead]/30 transition-colors"
              >
                {isLast ? 'Enter Regimen Arena' : 'Next'}
              </button>
            </div>
          </footer>
        </article>
      </main>
    </div>
  )
}
