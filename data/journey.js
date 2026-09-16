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
  /* PLACEHOLDER. The four years and the stage each maps to are structural —
     they come from this site's own model, not from the university — so they
     stay. Everything inside a year is institution-specific and is therefore
     bracketed: the activities, what the office provides, and the deadline with
     its date. Nothing here is a guess dressed as a fact.

     Deadlines carry date: null on purpose. render.js prints [DD MMM YYYY] for
     a null date and tags the row "Pending" rather than computing a next or a
     passed deadline, so the timeline cannot claim a date it does not have.

     TODO: replace every bracket below from the placement calendar. The count
     of items in each list is itself a placeholder — three is a layout
     decision, not a finding. */
  years: [
    { year: 1, label: "First year", stage: "understand",
      do: ["[First-year action 1]", "[First-year action 2]", "[First-year action 3]"],
      office_offers: ["[Office provision 1]", "[Office provision 2]", "[Office provision 3]"],
      deadline: { label: "[First-year deadline]", date: null } },

    { year: 2, label: "Second year", stage: "explore",
      do: ["[Second-year action 1]", "[Second-year action 2]", "[Second-year action 3]"],
      office_offers: ["[Office provision 1]", "[Office provision 2]", "[Office provision 3]"],
      deadline: { label: "[Second-year deadline]", date: null } },

    { year: 3, label: "Third year", stage: "experience",
      do: ["[Third-year action 1]", "[Third-year action 2]", "[Third-year action 3]"],
      office_offers: ["[Office provision 1]", "[Office provision 2]", "[Office provision 3]"],
      deadline: { label: "[Third-year deadline]", date: null } },

    { year: 4, label: "Final year", stage: "implement",
      do: ["[Final-year action 1]", "[Final-year action 2]", "[Final-year action 3]"],
      office_offers: ["[Office provision 1]", "[Office provision 2]", "[Office provision 3]"],
      deadline: { label: "[Final-year deadline]", date: null } }
  ]
};
