export const TUTORIAL_STORAGE_KEY = 'regimen-arena-tutorial-complete'

export const PLAYER_ROLE = {
  title: 'Clinical Stewardship Lead',
  shortTitle: 'Stewardship Lead',
  description:
    'You oversee antimicrobial selection, adjustment, monitoring, and narrowing as clinical data evolve.',
}

export const DRUG_AGENT_EXPLANATION = {
  title: 'Mechanism-based visual agents',
  body: `Drug agents are visual mnemonics for antimicrobial mechanisms. A wall-breaker represents cell-wall disruption. A binding sentinel represents target binding. A membrane striker represents membrane disruption.

The art helps you remember the mechanism, but your choice must be based on the case.`,
}

export const ARENA_CAPTION =
  'This arena represents the patient’s infection state. Watch how new data changes the best regimen.'

export const TUTORIAL_SCREENS = [
  {
    id: 'what',
    title: 'What is Regimen Arena?',
    body: 'Regimen Arena is a tactical antimicrobial stewardship simulator. You will manage infection cases as clinical data changes over time.',
    highlight: PLAYER_ROLE.shortTitle,
  },
  {
    id: 'arena',
    title: 'What is the arena?',
    body: 'The arena is a visual model of the patient’s infection course. It tracks organism pressure, cultures, source control, renal function, allergies, toxicity, and response.',
  },
  {
    id: 'agents',
    title: 'What are antimicrobial agents?',
    body: `${DRUG_AGENT_EXPLANATION.body}

Antimicrobials are represented as mechanism-based agents. Their appearance reflects class, mechanism, role, or monitoring burden — not raw power.`,
  },
  {
    id: 'goal',
    title: 'What are you trying to do?',
    body: `As ${PLAYER_ROLE.title}, choose therapy that fits the phase: empiric coverage when uncertainty is high, targeted therapy when cultures return, safe monitoring when therapy continues, and narrowing when stewardship allows.`,
  },
  {
    id: 'rule',
    title: 'Stewardship rule',
    body: 'The broadest regimen is not always the best regimen. Every choice has tradeoffs. Control infection while minimizing unnecessary spectrum, toxicity, resistance pressure, and missed monitoring.',
  },
]
