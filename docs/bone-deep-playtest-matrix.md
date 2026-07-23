# Bone Deep Playtest Matrix

Developer QA reference for **Bone Deep** (`scenario_01`). Not shown to players.

Automated reducer checks: `npm run verify:bone-deep` (from `regimen-arena/`).

---

## How to read this matrix

| Column | Meaning |
|--------|---------|
| **Choices** | Representative decision option IDs |
| **Events** | Therapy events that may proc (RNG unless noted) |
| **Stewardship** | Expected `assessment.stewardshipPerformance` tier |
| **Patient outcome** | Expected `assessment.patientOutcome` tier |
| **Attribution** | Expected `assessment.outcomeAttribution` |
| **RNG** | What can vary despite good play |

Tiers: Stewardship = Excellent / Strong / Adequate / Concerning / Unsafe. Patient = Resolved / Complex Recovery / Readmitted / ICU Transfer / Death.

---

## Path 1 — Strong recovery

**Choices**

| Phase | Option IDs |
|-------|------------|
| Empiric | `opt_vanco_cefepime` |
| Gram stain | `gs_continue_empiric` |
| Source control | `sc_urgent_or` |
| Renal | `dp02_reduce_cefepime` |
| Allergy (if shown) | `allergy_proceed_cefazolin` |
| De-escalation | `dp03_cefazolin` |
| Duration | `dp04_6wk_iv_opat` |
| Monitoring | `mon_bmp_weekly`, `mon_clinical_followup`, `mon_id_followup`, `mon_opat_line_check`, `mon_vanco_auc` |

**Flow:** Order review → Confirm / Advance Case Clock after each decision; allergy clarification stays on `phase_05` before `dp_03_deescalation`.

**Events:** 0–1 adverse therapy events possible before culture reveal (vanco infusion, cefepime neuro). Allergy clarification is deterministic on `phase_05` (stewardship opportunity, not adverse cap).

**Expected**

- Stewardship: **Excellent** or **Strong**
- Patient: **Resolved** or **Complex Recovery** (rehab_monitoring if OPAT burden)
- Attribution: **decision-driven** if resolved; **clinical variability** or **mixed** if mild post-discharge complication with strong monitoring
- Avoid **Unsafe** unless a truly unsafe option is chosen

**RNG:** Post-discharge weighted outcome; line complication suppressed without OPAT line exposure.

---

## Path 2 — Delayed source control

**Choices:** Reasonable empiric (e.g. `opt_vanco_cefepime`), `sc_delay_medical` or `sc_conservative_wound_care`, otherwise average care.

**Events:** Infection persistence narratives; readmission weights ↑.

**Expected**

- Stewardship: **Concerning** or **Adequate** (source-control domain low)
- Patient: **Readmitted** or **Complex Recovery**
- Attribution: **decision-driven** or **mixed**

---

## Path 3 — Poor empiric / inactive therapy

**Choices:** `opt_cefazolin_mono` or `opt_linezolid_mono` early; slow correction.

**Events:** Treatment failure / persistent bacteremia flags possible.

**Expected**

- Stewardship: **Concerning**; **Unsafe** if `opt_linezolid_mono` or critical flags
- Patient: **Readmitted**, **ICU transfer**, or **Complex Recovery**
- Attribution: **decision-driven**

---

## Path 4 — Vancomycin infusion reaction

**Choices:** Vancomycin active (`opt_vanco_cefepime` or `opt_vanco_mono`).

**Events:** `vanco_infusion_reaction` may proc `phase_02b`–`phase_04` (~minority of runs).

**Responses if triggered**

| Response | Expected |
|----------|----------|
| `vanco_pause_slow_restart` / document / slow premed | Safety stable; no debrief penalty for event that did not occur if no proc |
| `vanco_continue_unchanged` | ↑ toxicity, disposition delay; mishandled flag |

**No proc:** No response DP; **no score penalty** for event never shown.

---

## Path 5 — Cefepime renal / neurotoxicity

**Choices:** `opt_vanco_cefepime`; renal phase `dp02_reduce_cefepime` vs `dp02_no_change`.

**Events:** `cefepime_neurotoxicity` more likely without renal adjustment (see `verify-therapy-events.mjs`).

**Expected**

- Adjusted: lower neuro proc rate
- Ignored neuro (`cefepime_continue_unchanged`): safety ↓, rehab/confusion post-discharge modifiers ↑

---

## Path 6 — Daptomycin CK event

**Choices:** `opt_dapto_cefepime` empiric; reach `phase_06`.

**Events:** `dapto_ck_toxicity` not every run; moderate/severe requires `dp_dapto_toxicity_response`.

**Expected**

- `dapto_resp_hold_recheck_ck` / switch to beta-lactam: acceptable stewardship
- `dapto_resp_continue_monitor` on severe: mishandled; not automatic **Unsafe** tier alone

---

## Path 7 — Poor monitoring plan

**Choices:** Strong inpatient path through duration; monitoring `mon_nothing` only.

**Events:** None required.

**Expected**

- Stewardship: monitoring domain low; **Concerning** or **Adequate** overall
- Patient: **followup_failure** weight ↑
- Attribution: **decision-driven** (weak monitoring plan flag)

---

## Path 8 — Strong play + adverse RNG

**Choices:** Path 1 quality; accept post-discharge roll of `line_complication` or `followup_failure` with strong monitoring.

**Expected**

- Stewardship: remains **Strong** / **Excellent** if responses appropriate
- Patient: may be **Readmitted** / **Complex Recovery**
- Attribution: **clinical variability** when monitoring strong and tier not Unsafe
- **Unsafe** should not come from RNG alone (2026-07: low score pct maps to **Concerning**, not Unsafe, without unsafe decision IDs)

---

## Flow verification checklist (manual)

- [ ] Place Order → Order Review → Change Order clears local selection only
- [ ] Confirm / Advance applies decision after loading; no extra “Order acknowledged” step
- [ ] `therapy_event_only` does not skip `dp_03_deescalation` on `phase_05`
- [ ] Restart scenario resets `therapyEventState`
- [ ] Post-discharge shows multi-beat narrative (bullets in UI)
- [ ] Debrief separates stewardship vs patient outcome vs attribution

---

## Automated scripts

| Script | Purpose |
|--------|---------|
| `scripts/verify-bone-deep-flow.mjs` | Phase progression, allergy/de-escalation ordering, reset |
| `scripts/verify-therapy-events.mjs` | Seeded event frequency smoke tests |
| `scripts/verify-allergy-scoring.mjs` | Allergy vs MSSA de-escalation score alignment |
| `scripts/bone-deep-playtest-helpers.mjs` | Shared reducer helpers + strong path |

---

## Known remaining issues / next branches

- Susceptibility report / antibiogram phase (not in scope)
- Nafcillin/oxacillin-specific events; linezolid event
- Additional Dalbavancin branches
- Broader visual polish for Infection Arena on small screens

**Recommended next branch:** susceptibility/antibiogram or linezolid stewardship event (per product roadmap).
