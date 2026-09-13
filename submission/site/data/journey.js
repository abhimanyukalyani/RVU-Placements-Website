/* journey.js — the four-stage spine, and the year-by-year timeline.
   Stages are verbs. Each stage says what it is, what you do, and what the
   office gives you. Addressed to the student in the second person.

   PLACEHOLDER deadlines.
   TODO: confirm every deadline against the academic calendar. */
window.RVU = window.RVU || {};

RVU.journey = {

  stages: [
    { id: "understand", label: "Understand", order: 1,
      what_it_is: "Work out what you are good at and what kinds of work exist. Nothing here commits you to anything.",
      do: ["Take the strengths and interests session",
           "Read three job descriptions in a field you know nothing about",
           "Talk to one final-year student in your school"],
      office_offers: ["Strengths and interests session, twice a term",
                      "A library of real job descriptions by function",
                      "Drop-in hours, no appointment"] },

    { id: "explore", label: "Explore", order: 2,
      what_it_is: "Test the fields that interested you against reality, cheaply, before you commit a summer to one.",
      do: ["Attend two sector talks",
           "Do one informational interview with an alum",
           "Draft a CV and get it reviewed"],
      office_offers: ["Sector talks through the term",
                      "Alumni introductions on request",
                      "CV review within three working days"] },

    { id: "experience", label: "Experience", order: 3,
      what_it_is: "Do the work. An internship or a live project is the single strongest predictor of an offer, and the most common route to a pre-placement offer.",
      do: ["Apply to summer internships from January",
           "Take one live industry project",
           "Keep a record of what you actually built"],
      office_offers: ["Internship drives from January",
                      "Live projects with recruiting partners",
                      "Interview practice, scheduled on request"] },

    { id: "implement", label: "Implement", order: 4,
      what_it_is: "Convert. Register for the cycle, apply to drives, and use the office to prepare for each round.",
      do: ["Register for the placement cycle",
           "Check the drives ledger weekly",
           "Book a mock interview before your first round"],
      office_offers: ["Full-time drives through the cycle",
                      "Mock interviews with feedback",
                      "A placement coordinator for your school"] }
  ],

  // Year 1 to final year. Deadlines that have passed render muted; the next
  // one is highlighted. Both are computed from the date, never hard-coded.
  years: [
    { year: 1, label: "First year", stage: "understand",
      do: ["Attend the strengths and interests session",
           "Join one student club that does something you might work in",
           "Meet your school's placement coordinator once"],
      office_offers: ["Strengths and interests session", "Drop-in hours"],
      deadline: { label: "Strengths and interests session closes", date: "2026-11-14" } },

    { year: 2, label: "Second year", stage: "explore",
      do: ["Attend two sector talks",
           "Draft a CV and have it reviewed",
           "Do one informational interview"],
      office_offers: ["Sector talks", "CV review", "Alumni introductions"],
      deadline: { label: "CV review window closes", date: "2027-01-30" } },

    { year: 3, label: "Third year", stage: "experience",
      do: ["Apply to summer internships",
           "Take a live industry project",
           "Sit one aptitude practice test"],
      office_offers: ["Internship drives", "Live projects", "Aptitude practice"],
      deadline: { label: "Summer internship applications close", date: "2027-02-26" } },

    { year: 4, label: "Final year", stage: "implement",
      do: ["Register for the placement cycle",
           "Check the drives ledger weekly",
           "Book a mock interview before your first round"],
      office_offers: ["Full-time drives", "Mock interviews", "A placement coordinator for your school"],
      deadline: { label: "Placement cycle registration closes", date: "2026-10-31" } }
  ]
};
