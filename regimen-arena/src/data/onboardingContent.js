export const TUTORIAL_STORAGE_KEY = 'regimen-arena-tutorial-complete'

export const PLAYER_ROLE = {
  title: 'Clinical Stewardship Lead',
  shortTitle: 'Stewardship Lead',
  description:
    'You oversee antimicrobial selection, adjustment, monitoring, and narrowing as clinical data evolve.',
}

export const NARRATOR = {
  speaker: 'Stewardship Lead',
  initials: 'SL',
}

export const DRUG_AGENT_EXPLANATION = {
  title: 'Mechanism-based visual agents',
  body: `Antimicrobials appear as mechanism-based agents.

A wall-breaker represents cell-wall disruption. A binding sentinel represents target binding. A membrane striker represents membrane disruption.

The visuals are mnemonics, not shortcuts. A powerful-looking agent can still be the wrong choice if the spectrum, toxicity, allergy history, or infection site does not fit.`,
}

export const ARENA_CAPTION =
  'This arena represents the patient’s infection state. Watch how new data changes the best regimen.'

export const TUTORIAL_ACCESS_LABEL = 'About the Arena'

export const TUTORIAL_SCREENS = [
  {
    id: 'welcome',
    title: 'Welcome',
    speaker: NARRATOR.speaker,
    imageKey: 'stewardshipLeadDefault',
    imageAlt: 'Stewardship Lead character holding a clinical tablet.',
    visualTheme: 'welcome',
    body: `Welcome to Regimen Arena.

I’m the Stewardship Lead. My job is not to pick the biggest antimicrobial on the board. My job is to make the regimen fit the patient.

Every case you enter is a simulated infection course. The data will change. Your decisions should change with it.`,
  },
  {
    id: 'arena',
    title: 'What the Arena Represents',
    speaker: NARRATOR.speaker,
    imageKey: 'arenaOverview',
    imageAlt: 'Stewardship Lead presenting an arena overview interface.',
    visualTheme: 'arena-overview',
    body: `The arena is a visual model of the patient’s infection state.

Pathogen pressure, culture data, renal function, allergies, toxicity risk, source control, and clinical response all shape the field.

Some information will be known. Some will be pending. Some will become clearer only after you commit to a plan.`,
  },
  {
    id: 'agents',
    title: 'Why Drugs Look Like Agents',
    speaker: NARRATOR.speaker,
    imageKey: 'regimenPlan',
    imageAlt:
      'Stewardship Lead reviewing mechanism-based antimicrobial agents and regimen planning.',
    visualTheme: 'regimen-plan',
    body: DRUG_AGENT_EXPLANATION.body,
  },
  {
    id: 'decisions',
    title: 'How Decisions Work',
    speaker: NARRATOR.speaker,
    imageKey: 'cultureData',
    imageAlt: 'Stewardship Lead reviewing culture and susceptibility data.',
    visualTheme: 'culture-data',
    body: `You’ll make decisions across the infection course.

At first, you may need empiric coverage with incomplete data. Later, cultures, susceptibilities, response, and source control may let you narrow therapy.

The best move is not always escalation. Sometimes it is de-escalation. Sometimes it is monitoring. Sometimes it is recognizing that antibiotics alone are not enough.`,
  },
  {
    id: 'judged',
    title: 'How You Are Judged',
    speaker: NARRATOR.speaker,
    imageKey: 'monitoring',
    imageAlt: 'Stewardship Lead reviewing monitoring labs and stewardship fit criteria.',
    visualTheme: 'monitoring',
    body: `Your choices are judged by clinical fit.

Did you cover the likely pathogen when uncertainty was high?
Did you narrow when the target became clear?
Did you account for renal function, allergy history, toxicity, and route?
Did you avoid unnecessary spectrum when the patient no longer needed it?

That is the arena.

Not combat for combat’s sake. Stewardship under pressure.`,
  },
]
