# Regimen Arena

Clinical decision simulation for antimicrobial stewardship. A single client-side React + Vite SPA; there is no backend, database, or other service.

## Cursor Cloud specific instructions

- The actual application lives in `regimen-arena/`, not the repo root. All npm commands must run from `regimen-arena/` (the repo root has no `package.json`).
- Standard commands (defined in `regimen-arena/package.json`): `npm run dev` (Vite dev server, port 5173), `npm run build`, `npm run preview` (port 4173), `npm run lint`.
- This is a 100% client-side app — data is static JSON in `src/data/` and game state is an in-memory React reducer (`src/hooks/useGameState.js`). No env vars, secrets, DB, or backend are needed to run or test it.
- There is no test framework configured (no `test` script). End-to-end "testing" means running the dev server and exercising the UI: landing page → Accept Consult → Begin Scenario → select a treatment → Place Order → read feedback → Advance.
- `npm run lint` currently reports pre-existing errors in `src/components/PhaseEngine.jsx` and `src/utils/gameActions.js` on a clean checkout; these are not caused by environment setup.
