# Regimen Arena

Clinical decision simulation for antimicrobial stewardship. Scenario 01: **Bone Deep**.

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  data/
    patient.json           # Section 9 — patient demographics, vitals, labs
    scenario.json          # Section 10 — scenario metadata
    phases.json            # Section 10 — phase timeline
    decisionPoints.json    # Section 11 — all decision points
    drugs.json             # Section 12 — drug reference
    conditionalEvents.json # Section 8 — triggered events
  components/
    ScenarioIntro.jsx      # Patient card + Begin button
    PhaseEngine.jsx        # (stub) Phase gameplay loop
    ...
  hooks/
    useGameState.js        # Game state reducer
  utils/
    scoring.js
    conditionalEvents.js
```

## Disclaimer

Educational simulation only. Not medical advice. Not for real patient care.
