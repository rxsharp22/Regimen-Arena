import scenario from './data/scenario.json'
import patient from './data/patient.json'
import LandingPage from './components/LandingPage'
import ScenarioIntro from './components/ScenarioIntro'
import PhaseEngine from './components/PhaseEngine'
import ScoreScreen from './components/ScoreScreen'
import { useGameState } from './hooks/useGameState'

export default function App() {
  const {
    state,
    beginIntro,
    beginScenario,
    advancePhase,
    resetGame,
    confirmDecision,
    currentPhaseData,
    totalPhases,
    phases,
  } = useGameState()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="ra-header shrink-0 border-b border-[#2a3544] bg-[#151c26] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#4a9ead]/40 flex items-center justify-center text-[#4a9ead] font-bold text-sm">
            RA
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Regimen Arena</h1>
            <p className="text-[10px] text-[#8b9cb3] uppercase tracking-widest">
              {scenario.title} — Antimicrobial Stewardship Simulation
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        {state.gameStatus === 'landing' && (
          <LandingPage onEnter={beginIntro} />
        )}

        {state.gameStatus === 'intro' && (
          <ScenarioIntro scenario={scenario} patient={patient} onBegin={beginScenario} />
        )}

        {state.gameStatus === 'active' && currentPhaseData && (
          <PhaseEngine
            state={state}
            phases={phases}
            currentPhaseData={currentPhaseData}
            totalPhases={totalPhases}
            onConfirmDecision={confirmDecision}
            onAdvance={advancePhase}
          />
        )}

        {state.gameStatus === 'complete' && (
          <ScoreScreen state={state} onRestart={resetGame} />
        )}
      </main>
    </div>
  )
}
