import scenario from './data/scenario.json'
import patient from './data/patient.json'
import ScenarioIntro from './components/ScenarioIntro'
import { useGameState } from './hooks/useGameState'

export default function App() {
  const { state, beginScenario } = useGameState()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shrink-0 border-b border-[#2a3544] bg-[#151c26] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#4a9ead]/40 flex items-center justify-center text-[#4a9ead] font-bold text-sm">
            RA
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Regimen Arena</h1>
            <p className="text-[10px] text-[#8b9cb3] uppercase tracking-widest">
              Antimicrobial Stewardship Simulation
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        {state.gameStatus === 'intro' ? (
          <ScenarioIntro scenario={scenario} patient={patient} onBegin={beginScenario} />
        ) : (
          <div className="max-w-4xl mx-auto text-center py-16 text-[#8b9cb3]">
            <p className="text-sm">Phase engine coming next.</p>
          </div>
        )}
      </main>
    </div>
  )
}
