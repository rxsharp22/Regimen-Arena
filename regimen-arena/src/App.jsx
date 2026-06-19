import { useCockpitState } from './hooks/useCockpitState'
import PatientStatusPanel from './components/PatientStatusPanel'
import ClinicalTimelinePanel from './components/ClinicalTimelinePanel'
import RegimenControlPanel from './components/RegimenControlPanel'

export default function App() {
  const {
    state,
    scenario,
    patient,
    stageConfig,
    availableDrugs,
    outcome,
    toggleEvent,
    addDrug,
    removeDrug,
    evaluateRegimen,
    advanceStage,
    setStage,
    reset,
  } = useCockpitState()

  const canAdvance =
    state.currentStage === 't0'
      ? state.activeRegimen.length > 0 && state.currentFeedback !== null
      : state.currentStage === 't12'
        ? state.activeRegimen.length > 0 && state.currentFeedback !== null
        : state.currentStage === 't36'
          ? state.activeRegimen.length > 0 && state.currentFeedback !== null
          : false

  const showCulture =
    state.currentStage === 't36' ||
    state.currentStage === 'outcome' ||
    state.unlockedStages.includes('t36')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shrink-0 border-b border-[#2a3544] bg-[#151c26] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#4a9ead]/40 flex items-center justify-center text-[#4a9ead] font-bold text-sm">
            RA
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Regimen Arena</h1>
            <p className="text-[10px] text-[#8b9cb3] uppercase tracking-widest">Clinical Decision Cockpit</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#8b9cb3] hidden sm:inline">
            Educational simulation only — not for patient care
          </span>
          {state.gameComplete && (
            <button
              type="button"
              onClick={reset}
              className="text-xs px-3 py-1.5 rounded border border-[#2a3544] text-[#8b9cb3] hover:text-[#e8edf4] hover:border-[#4a9ead]/40"
            >
              Restart Scenario
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 min-h-0 auto-rows-fr lg:h-[calc(100vh-57px)]">
        <div className="lg:col-span-3 min-h-[320px] lg:min-h-0">
          <PatientStatusPanel
            patient={patient}
            scenario={scenario}
            currentStage={state.currentStage}
          />
        </div>

        <div className="lg:col-span-5 min-h-[400px] lg:min-h-0">
          <ClinicalTimelinePanel
            scenario={scenario}
            currentStage={state.currentStage}
            unlockedStages={state.unlockedStages}
            expandedEvents={state.expandedEvents}
            onToggleEvent={toggleEvent}
            onSetStage={setStage}
            onAdvance={advanceStage}
            canAdvance={canAdvance}
            stageConfig={stageConfig}
            gameComplete={state.gameComplete}
            outcome={outcome}
          />
        </div>

        <div className="lg:col-span-4 min-h-[400px] lg:min-h-0">
          <RegimenControlPanel
            availableDrugs={availableDrugs}
            activeRegimen={state.activeRegimen}
            currentStage={state.currentStage}
            stageConfig={stageConfig}
            onAddDrug={addDrug}
            onRemoveDrug={removeDrug}
            onEvaluate={evaluateRegimen}
            currentFeedback={state.currentFeedback}
            organism={state.organism}
            showCulture={showCulture}
          />
        </div>
      </main>
    </div>
  )
}
