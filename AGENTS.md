# Regimen Arena

Clinical decision simulation for antimicrobial stewardship. A single client-side React + Vite SPA; there is no backend, database, or other service.

## Simulation direction (required reading)

Before changing gameplay, scenario content, feedback UX, scoring, or visual metaphors, read and follow:

**[docs/regimen-arena-simulation-rule.md](docs/regimen-arena-simulation-rule.md)**

Regimen Arena is a **stateful antimicrobial stewardship simulation**, not a quiz app. During active gameplay, do not immediately label choices as correct, wrong, optimal, reasonable, or unsafe. Decisions should update hidden patient/infection/treatment/stewardship state; consequences should emerge over time through clinical data and narrative. Explicit teaching and grading belong primarily in the **final debrief**. Battle illustrations are optional teaching visuals, not the core game engine.

## Cursor Cloud specific instructions

- The actual application lives in `regimen-arena/`, not the repo root. All npm commands must run from `regimen-arena/` (the repo root has no `package.json`).
- Standard commands (defined in `regimen-arena/package.json`): `npm run dev` (Vite dev server, port 5173), `npm run build`, `npm run preview` (port 4173), `npm run lint`.
- This is a 100% client-side app — data is static JSON in `src/data/` and game state is an in-memory React reducer (`src/hooks/useGameState.js`). No env vars, secrets, DB, or backend are needed to run or test it.
- There is no test framework configured (no `test` script). End-to-end "testing" means running the dev server and exercising the UI: landing page → Accept Consult → Begin Scenario → select a treatment → Place Order → read feedback → Advance.
- `npm run lint` currently reports pre-existing errors in `src/components/PhaseEngine.jsx` and `src/utils/gameActions.js` on a clean checkout; these are not caused by environment setup.
