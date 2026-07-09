import { useState } from 'react'
import PhaseHeader from '../PhaseHeader'
import AdvisorPanel from '../visuals/AdvisorPanel'
import InfectionArenaPanel from '../arena/InfectionArenaPanel'
import {
  buildWhatChanged,
  buildSituationSnapshot,
  buildActiveConcerns,
  buildActiveTherapySummary,
} from '../../utils/phasePresentation'

function ConcernChip({ label }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-[#344559] bg-[#1a222d] text-[#b8c5d6]">
      {label}
    </span>
  )
}

function SnapshotCard({ children }) {
  return (
    <li className="text-sm text-[#b8c5d6] leading-relaxed flex gap-2">
      <span className="text-[#4a9ead] shrink-0 mt-0.5" aria-hidden>
        •
      </span>
      <span>{children}</span>
    </li>
  )
}

function Section({ title, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-[#2a3544] bg-[#151c26] p-4 sm:p-5 ${className}`}>
      <h3 className="text-xs uppercase tracking-widest text-[#4a9ead] font-semibold mb-3">{title}</h3>
      {children}
    </section>
  )
}

export default function ClinicalPhaseLayout({
  phase,
  phaseIndex,
  totalPhases,
  score,
  scoreMaxes,
  clinicalSnapshot,
  simulation,
  activeDrugs,
  conditionalEvents,
  advisor,
  isPostDischargePhase = false,
  children,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const whatChanged = buildWhatChanged(phase, conditionalEvents, phaseIndex)
  const snapshot = buildSituationSnapshot(clinicalSnapshot, simulation)
  const concerns = buildActiveConcerns({ clinicalSnapshot, simulation, activeDrugs })
  const therapySummary = buildActiveTherapySummary(activeDrugs)

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
      <PhaseHeader
        phase={phase}
        currentIndex={phaseIndex}
        totalPhases={totalPhases}
        score={score}
        scoreMaxes={scoreMaxes}
      />

      {advisor && !isPostDischargePhase && (
        <AdvisorPanel
          spriteKey={advisor.spriteKey}
          title={advisor.title}
          subtitle={advisor.subtitle}
          tone={advisor.tone}
        >
          {advisor.body}
        </AdvisorPanel>
      )}

      {!isPostDischargePhase && (
        <>
          {snapshot.length > 0 && (
            <Section title="Situation Snapshot">
              <ul className="space-y-2">
                {snapshot.map((line) => (
                  <SnapshotCard key={line}>{line}</SnapshotCard>
                ))}
              </ul>
            </Section>
          )}

          <Section title="What Changed Since Last Update">
            <ul className="space-y-2">
              {whatChanged.map((item, i) => (
                <li key={`${item.text}-${i}`} className="text-sm leading-relaxed">
                  <span className="font-semibold text-[#4a9ead]">{item.prefix}: </span>
                  <span className="text-[#e8edf4]">{item.text}</span>
                </li>
              ))}
            </ul>
          </Section>

          {concerns.length > 0 && (
            <Section title="Active Concerns">
              <div className="flex flex-wrap gap-2">
                {concerns.map((c) => (
                  <ConcernChip key={c.id} label={c.label} />
                ))}
              </div>
            </Section>
          )}

          <div className="rounded-xl border border-[#2a3544] bg-[#151c26] px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-[#8b9cb3] font-semibold mb-1">
              Active Therapy
            </p>
            <p className="text-sm text-[#e8edf4] font-medium">{therapySummary}</p>
          </div>

          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            className="w-full text-left rounded-xl border border-[#2a3544] bg-[#151c26] px-4 py-3 text-sm text-[#4a9ead] hover:bg-[#1a222d] transition-colors"
            aria-expanded={detailsOpen}
          >
            {detailsOpen ? 'Hide expanded clinical details ↑' : 'Show expanded clinical details ↓'}
          </button>

          {detailsOpen && (
            <div className="space-y-4">
              <InfectionArenaPanel
                phase={phase}
                activeDrugs={activeDrugs}
                conditionalEvents={conditionalEvents}
                clinicalSnapshot={clinicalSnapshot}
              />
            </div>
          )}
        </>
      )}

      {children}
    </div>
  )
}
