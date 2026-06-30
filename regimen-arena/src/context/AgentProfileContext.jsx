import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AgentProfileContext = createContext(null)

export function AgentProfileProvider({ children }) {
  const [drugId, setDrugId] = useState(null)

  const openProfile = useCallback((id) => {
    if (id) setDrugId(id)
  }, [])

  const closeProfile = useCallback(() => {
    setDrugId(null)
  }, [])

  useEffect(() => {
    if (!drugId) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeProfile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drugId, closeProfile])

  return (
    <AgentProfileContext.Provider value={{ drugId, openProfile, closeProfile }}>
      {children}
    </AgentProfileContext.Provider>
  )
}

export function useAgentProfile() {
  const ctx = useContext(AgentProfileContext)
  if (!ctx) {
    throw new Error('useAgentProfile must be used within AgentProfileProvider')
  }
  return ctx
}
