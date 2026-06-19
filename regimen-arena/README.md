# Regimen Arena

A clinical decision simulation cockpit for antimicrobial stewardship education. Scenario 01: **Bone Deep** — diabetic foot osteomyelitis with bacteremia.

## Quick Start

```bash
cd regimen-arena
npm install
npm run dev
```

Open the local URL shown in the terminal (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## UI Overview

Three-panel clinical cockpit layout:

- **Patient Status** (left) — vitals, lab sparklines, severity badge, active alerts
- **Clinical Timeline** (center) — T0 → T12 → T36 → Outcome with inline expanding event cards
- **Regimen Control** (right) — antibiotic cards with spectrum bars, warnings, culture HUD, stewardship feedback

## Tech Stack

- React (functional components + hooks)
- Tailwind CSS v4
- Local JSON scenario data — no backend

## Disclaimer

Educational simulation only. Not medical advice. Not for real patient care.
