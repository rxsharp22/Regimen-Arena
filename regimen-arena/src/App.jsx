import { useEffect, useState } from 'react'
import scenario from './data/scenario.json'
import patient from './data/patient.json'
import LandingPage from './components/LandingPage'
import ScenarioIntro from './components/ScenarioIntro'
import PhaseEngine from './components/PhaseEngine'
import ScoreScreen from './components/ScoreScreen'
import VisualGallery from './components/VisualGallery'
import OnboardingTutorial from './components/onboarding/OnboardingTutorial'
import { useGameState } from './hooks/useGameState'
import { hasCompletedTutorial, markTutorialComplete } from './utils/onboardingStorage'
import { TUTORIAL_ACCESS_LABEL } from './data/onboardingContent'

function isVisualGalleryView() {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.get('view') === 'visuals') return true
  return window.location.hash === '#/visuals' || window.location.pathname.endsWith('/visuals')
}

function openVisualGallery() {
  const url = new URL(window.location.href)
  url.searchParams.set('view', 'visuals')
  url.hash = ''
  window.history.pushState({}, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function closeVisualGallery() {
  const url = new URL(window.location.href)
  url.searchParams.delete('view')
  url.hash = ''
  window.history.pushState({}, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

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

  const [showGallery, setShowGallery] = useState(isVisualGalleryView)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialReady, setTutorialReady] = useState(false)

  useEffect(() => {
    setShowTutorial(!hasCompletedTutorial())
    setTutorialReady(true)
  }, [])

  useEffect(() => {
    const syncGallery = () => setShowGallery(isVisualGalleryView())
    window.addEventListener('popstate', syncGallery)
    return () => window.removeEventListener('popstate', syncGallery)
  }, [])

  const handleOpenGallery = () => {
    openVisualGallery()
    setShowGallery(true)
  }

  const handleCloseGallery = () => {
    closeVisualGallery()
    setShowGallery(false)
  }

  const handleTutorialComplete = () => {
    markTutorialComplete()
    setShowTutorial(false)
  }

  const handleOpenTutorial = () => {
    setShowTutorial(true)
  }

  if (!tutorialReady) {
    return null
  }

  if (showTutorial) {
    return <OnboardingTutorial onComplete={handleTutorialComplete} />
  }

  if (showGallery) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="ra-header shrink-0 border-b border-[#2a3544] bg-[#151c26] px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#4a9ead]/40 flex items-center justify-center text-[#4a9ead] font-bold text-sm">
              RA
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Regimen Arena</h1>
              <p className="text-[10px] text-[#8b9cb3] uppercase tracking-widest">Visual gallery</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <VisualGallery onBack={handleCloseGallery} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="ra-header shrink-0 border-b border-[#2a3544] bg-[#151c26] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#4a9ead]/40 flex items-center justify-center text-[#4a9ead] font-bold text-sm">
            RA
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-tight">Regimen Arena</h1>
            <p className="text-[10px] text-[#8b9cb3] uppercase tracking-widest">
              {scenario.title} — Antimicrobial Stewardship Simulation
            </p>
          </div>
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={handleOpenGallery}
              className="text-[10px] uppercase tracking-widest text-[#8b9cb3] hover:text-[#4a9ead] transition-colors shrink-0"
            >
              Visuals
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenTutorial}
            className="text-[10px] uppercase tracking-widest text-[#8b9cb3] hover:text-[#4a9ead] transition-colors shrink-0"
          >
            {TUTORIAL_ACCESS_LABEL}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        {state.gameStatus === 'landing' && (
          <LandingPage onEnter={beginIntro} onOpenTutorial={handleOpenTutorial} />
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
