import { useEffect, useState } from 'react'
import scenario from './data/scenario.json'
import patient from './data/patient.json'
import LandingPage from './components/LandingPage'
import ScenarioIntro from './components/ScenarioIntro'
import PhaseEngine from './components/PhaseEngine'
import ScoreScreen from './components/ScoreScreen'
import VisualGallery from './components/VisualGallery'
import AgentLibrary from './components/agents/AgentLibrary'
import AgentProfileModal from './components/agents/AgentProfileModal'
import OnboardingTutorial from './components/onboarding/OnboardingTutorial'
import { AgentProfileProvider } from './context/AgentProfileContext'
import { useGameState } from './hooks/useGameState'
import { hasCompletedTutorial, markTutorialComplete } from './utils/onboardingStorage'
import { TUTORIAL_ACCESS_LABEL } from './data/onboardingContent'

function getViewParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('view')
}

function isVisualGalleryView() {
  const view = getViewParam()
  if (view === 'visuals') return true
  return window.location.hash === '#/visuals' || window.location.pathname.endsWith('/visuals')
}

function isAgentLibraryView() {
  return getViewParam() === 'agents'
}

function setAppView(view) {
  const url = new URL(window.location.href)
  if (view) {
    url.searchParams.set('view', view)
  } else {
    url.searchParams.delete('view')
  }
  url.hash = ''
  window.history.pushState({}, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function openVisualGallery() {
  setAppView('visuals')
}

function closeVisualGallery() {
  setAppView(null)
}

function openAgentLibrary() {
  setAppView('agents')
}

function closeAgentLibrary() {
  setAppView(null)
}

function AppShell({ children, subtitle, headerActions }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="ra-header shrink-0 border-b border-[#2a3544] bg-[#151c26] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#4a9ead]/40 flex items-center justify-center text-[#4a9ead] font-bold text-sm">
            RA
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-tight">Regimen Arena</h1>
            <p className="text-[10px] text-[#8b9cb3] uppercase tracking-widest truncate">
              {subtitle}
            </p>
          </div>
          {headerActions}
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}

function MainGame({ onOpenTutorial, onOpenAgentLibrary, onOpenGallery }) {
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
    <AppShell
      subtitle={`${scenario.title} — Antimicrobial Stewardship Simulation`}
      headerActions={
        <>
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={onOpenGallery}
              className="text-[10px] uppercase tracking-widest text-[#8b9cb3] hover:text-[#4a9ead] transition-colors shrink-0"
            >
              Visuals
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAgentLibrary}
            className="text-[10px] uppercase tracking-widest text-[#8b9cb3] hover:text-[#4a9ead] transition-colors shrink-0"
          >
            Agent Reference
          </button>
          <button
            type="button"
            onClick={onOpenTutorial}
            className="text-[10px] uppercase tracking-widest text-[#8b9cb3] hover:text-[#4a9ead] transition-colors shrink-0"
          >
            {TUTORIAL_ACCESS_LABEL}
          </button>
        </>
      }
    >
      {state.gameStatus === 'landing' && (
        <LandingPage onEnter={beginIntro} onOpenTutorial={onOpenTutorial} />
      )}

      {state.gameStatus === 'intro' && (
        <ScenarioIntro scenario={scenario} patient={patient} onBegin={beginScenario} />
      )}

      {state.gameStatus === 'active' && currentPhaseData && (
        <PhaseEngine
          state={state}
          currentPhaseData={currentPhaseData}
          totalPhases={totalPhases}
          onConfirmDecision={confirmDecision}
          onAdvance={advancePhase}
        />
      )}

      {state.gameStatus === 'complete' && <ScoreScreen state={state} onRestart={resetGame} />}
    </AppShell>
  )
}

export default function App() {
  const [showGallery, setShowGallery] = useState(isVisualGalleryView)
  const [showAgentLibrary, setShowAgentLibrary] = useState(isAgentLibraryView)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialReady, setTutorialReady] = useState(false)

  useEffect(() => {
    setShowTutorial(!hasCompletedTutorial())
    setTutorialReady(true)
  }, [])

  useEffect(() => {
    const syncViews = () => {
      setShowGallery(isVisualGalleryView())
      setShowAgentLibrary(isAgentLibraryView())
    }
    window.addEventListener('popstate', syncViews)
    return () => window.removeEventListener('popstate', syncViews)
  }, [])

  const handleOpenGallery = () => {
    openVisualGallery()
    setShowGallery(true)
    setShowAgentLibrary(false)
  }

  const handleCloseGallery = () => {
    closeVisualGallery()
    setShowGallery(false)
  }

  const handleOpenAgentLibrary = () => {
    openAgentLibrary()
    setShowAgentLibrary(true)
    setShowGallery(false)
  }

  const handleCloseAgentLibrary = () => {
    closeAgentLibrary()
    setShowAgentLibrary(false)
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

  return (
    <AgentProfileProvider>
      {showTutorial ? (
        <OnboardingTutorial onComplete={handleTutorialComplete} />
      ) : showGallery ? (
        <AppShell subtitle="Visual gallery">
          <VisualGallery onBack={handleCloseGallery} />
        </AppShell>
      ) : showAgentLibrary ? (
        <AppShell subtitle="Antimicrobial agent reference">
          <AgentLibrary onBack={handleCloseAgentLibrary} />
        </AppShell>
      ) : (
        <MainGame
          onOpenTutorial={handleOpenTutorial}
          onOpenAgentLibrary={handleOpenAgentLibrary}
          onOpenGallery={handleOpenGallery}
        />
      )}
      <AgentProfileModal />
    </AgentProfileProvider>
  )
}
