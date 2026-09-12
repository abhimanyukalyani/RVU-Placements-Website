/* eligibility.js — rules for the checker.
   Every rule carries a `capability` string alongside its `condition`:
   the same fact written as how to stay eligible, never as grounds for
   disqualification (CLAUDE.md §F). The checker renders `capability`.

   PLACEHOLDER thresholds.
   TODO: confirm every threshold and the one-offer policy with the office. */
window.RVU = window.RVU || {};

RVU.eligibility = {

  registration_window: { opens: "2026-07-01", closes: "2026-10-31" },

  rules: [
    { id: "registered",
      condition: "Registered with the placement office for the current cycle.",
      capability: "Register once for the cycle and you are in the pool for every drive in it. Registration is open until 31 October.",
      blocking: true },

    { id: "cgpa",
      condition: "Meets the CGPA floor set by the individual drive.",
      capability: "Each drive sets its own CGPA floor — most sit between 6.5 and 7.5. Your CGPA opens some drives now and more with your next semester's result.",
      blocking: true },

    { id: "backlogs",
      condition: "No more than one active backlog at the time of application.",
      capability: "Clear a backlog and every drive that was closed to you reopens at the next application window. The office can put you in touch with the faculty coordinator to plan it.",
      blocking: true },

    { id: "final-year",
      condition: "In the final year of a programme, or in the penultimate year for internships.",
      capability: "Final-year students apply to full-time roles; penultimate-year students apply to internships, which are the most common route to a pre-placement offer.",
      blocking: true },

    { id: "attendance",
      condition: "Attended the pre-placement readiness sessions for the cycle.",
      capability: "Two readiness sessions per cycle. Miss one and the recording plus a short catch-up with a coordinator counts in its place.",
      blocking: false },

    { id: "documents",
      condition: "Current CV and transcript on file with the office.",
      capability: "Keep a current CV and transcript on file and you never miss a window while paperwork catches up. The office reviews CVs on request.",
      blocking: false }
  ],

  // Per-school overrides. null means "the university default applies".
  criteria_by_school: {
    "engineering":  { min_cgpa: 7.0, max_backlogs: 1, notes: null },
    "design":       { min_cgpa: 6.5, max_backlogs: 1, notes: "Portfolio review replaces the aptitude round for most design drives." },
    "business":     { min_cgpa: 7.0, max_backlogs: 1, notes: null },
    "liberal-arts": { min_cgpa: 6.5, max_backlogs: 1, notes: null },
    "law":          { min_cgpa: 7.0, max_backlogs: 0, notes: "Bar-council registration timelines affect start dates for litigation roles." },
    "sciences":     { min_cgpa: 6.5, max_backlogs: 1, notes: null }
  },

  one_offer_policy: {
    summary: "One offer at a time. Accept an offer and you step out of the pool, so the next student in line gets the seat.",
    detail: "You may hold one live offer. While you hold it you are out of the pool for further drives. Decline it and you return to the pool immediately — declining costs you nothing and is not recorded against you.",
    exceptions: [
      "An internship offer does not close the pool for full-time drives.",
      "A pre-placement offer may be held while you apply to a materially higher band; tell your coordinator first so the office can plan around it."
    ]
  },

  // Reasons a student's eligibility is paused, each with the route back in.
  pause_reasons: [
    { id: "holding-offer", reason: "You are holding a live offer.",
      route_back: "Decline the offer through your coordinator and you return to the pool the same day." },
    { id: "backlog", reason: "You have more than one active backlog.",
      route_back: "Clear one backlog to return at the next application window." },
    { id: "registration", reason: "You are not registered for the current cycle.",
      route_back: "Register with the office; registration is open until 31 October." },
    { id: "documents", reason: "Your CV or transcript on file is out of date.",
      route_back: "Send a current CV and transcript to the office; this is cleared within one working day." }
  ]
};
