# Regimen Arena Simulation Rule

This document is the durable product rule for Regimen Arena. Future AI coding assistants and contributors should treat it as authoritative when making gameplay, UX, content, or architecture decisions.

## Core Identity

Regimen Arena is a provider-facing tactical antimicrobial stewardship simulator. It is **not** a quiz app, flashcard app, patient-facing infusion companion, generic RPG, or arcade battler.

The player practices managing infection scenarios as clinical information evolves over time. The central challenge is not simply selecting the “right answer,” but making timely antimicrobial, monitoring, source-control, and stewardship decisions under uncertainty.

## Product North Star

Regimen Arena should feel like **managing an evolving infection case**, not answering a multiple-choice test.

The patient, organism, infection, labs, cultures, toxicity risk, resistance profile, and disposition should respond to player decisions over time.

## Required Simulation Principle

**Do not immediately tell the player that a decision is correct, wrong, optimal, reasonable, or unsafe during active gameplay.**

Instead:

1. The player makes a clinical decision.
2. The decision updates hidden simulation state.
3. Time advances.
4. The patient, infection, labs, cultures, organism, toxicity profile, or care trajectory changes.
5. Consequences appear through narrative updates, clinical data, visual state changes, complications, or disposition changes.
6. The final debrief explains what was optimal, suboptimal, risky, or unsafe.

## Hidden State Requirement

Each scenario should maintain hidden simulation state when relevant, including:

- patient stability
- infection burden
- organism identity
- resistance profile
- source control status
- culture clearance
- active/inactive therapy
- spectrum burden
- toxicity burden
- renal/hepatic monitoring needs
- de-escalation status
- duration adequacy
- discharge readiness
- mortality or deterioration risk
- stewardship score domains
- event log

The user-facing interface should reveal consequences through **clinical storytelling**, not answer-key language.

## Acceptable Feedback During Gameplay

Use clinical consequences such as:

- fever improves or persists
- WBC improves or worsens
- creatinine rises
- repeat cultures remain positive
- blood cultures clear
- source remains uncontrolled
- patient becomes confused or hypotensive
- ID recommends additional workup
- TEE is ordered
- discharge is delayed
- OPAT planning becomes available
- patient transfers to higher level of care
- relapse occurs
- toxicity event occurs

**Avoid direct educational grading during the active scenario.**

## Final Debrief Requirement

Explicit teaching belongs primarily at the **end of the scenario**.

The final debrief should include:

- patient outcome
- disposition endpoint
- stewardship performance by domain
- key successful decisions
- missed opportunities
- major turning points
- why the patient improved or worsened
- what an expert pathway might have looked like

## Scenario Structure Rule

Every scenario should be built around an evolving clinical arc:

1. Initial presentation
2. Empiric decision under uncertainty
3. New diagnostic information
4. Treatment adjustment or narrowing decision
5. Monitoring/source-control/dosing decision
6. Clinical response or complication
7. Disposition or endpoint
8. Final debrief

Scenarios should support branching or conditional consequences whenever possible.

## Event Log Rule

Every meaningful player decision should be recorded in an event log with:

- scenario time
- decision made
- information available at the time
- active regimen
- relevant flags
- hidden effects applied
- later consequences triggered

This event log will support future learner evaluation, stewardship scoring, analytics, and debriefing.

## Battle Illustration Rule

**Battle visuals are optional teaching illustrations, not the core game engine.**

Do not add Phaser, Pixi, Excalibur, Godot, or a full game engine unless the current React/CSS/SVG approach cannot support a clearly defined educational animation need.

Battle illustrations may show:

- antibiotic mechanism
- organism morphology
- resistance mechanism
- source-control issue
- toxicity/monitoring cue
- partial treatment response
- treatment failure

Battle illustrations must teach something. If the visual does not clarify mechanism, resistance, source control, monitoring, toxicity, or stewardship, simplify it or remove it.

## Visual Accuracy Rule

Visual metaphors may simplify microbiology, but must not teach the wrong concept.

**Acceptable examples:**

- cefazolin damaging MSSA cell-wall integrity
- vancomycin binding a cell-wall target
- daptomycin disrupting membrane integrity
- beta-lactamase disabling vulnerable beta-lactams
- persistent source control causing bacterial regrowth or continued seeding

**Avoid visuals that imply:**

- all antibiotics work by smashing walls
- vancomycin is preferred definitive therapy for MSSA
- cefazolin is easily destroyed by routine staphylococcal beta-lactamase
- resistance is just “extra HP”
- source control is optional in deep infection or line infection
- broad-spectrum therapy is automatically better

## Scenario Portfolio Rule

Do not overwrite useful scenarios to create new ones.

Preserve distinct clinical identities:

- **Bone Deep** — diabetic foot osteomyelitis, bacteremia, CKD dosing, allergy stewardship, debridement/source control, duration and OPAT monitoring.
- **Line in the Bloodstream** — PICC-associated S. aureus bacteremia, empiric coverage, line removal, MSSA/MRSA optimization, persistent bacteremia, repeat cultures, discharge versus deterioration.

Build a reusable scenario engine that can support both.

## Development Rule

Prefer small, testable vertical slices.

For each new scenario or engine change:

1. Preserve the current working app.
2. Add reusable structure only where needed.
3. Keep clinical logic separate from UI.
4. Avoid new dependencies unless clearly justified.
5. Do not redesign into a quiz, monster battler, or generic RPG.
6. Maintain provider-facing clinical seriousness with professionally playful visuals only where they reinforce learning.

## One-Sentence Guardrail

**Regimen Arena is a stateful antimicrobial stewardship simulation where clinical decisions change the patient’s course over time; it should not behave like a quiz that immediately labels answers as right or wrong.**
