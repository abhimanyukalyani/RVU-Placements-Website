/* office.js — the people, and the academic-year calendar.
   Names and titles are UNVERIFIED placeholders. Each carries a TODO, and the
   page renders that status visibly rather than presenting a guess as fact.
   TODO: confirm every name, title, phone number and email with the office. */
window.RVU = window.RVU || {};

RVU.office = {
  // TODO: confirm with the office before ship
  verified: false,

  people: [
    { name: "Sivakumar S",
      role: "Senior Manager — Placements and Alumni Affairs",
      remit: "Leads the office. Employer relationships, drive scheduling, and any question a recruiter or a parent cannot get answered elsewhere.",
      email: "recruit@rvu.edu.in",     // TODO: confirm a direct address
      phone: null,                      // TODO: confirm direct line
      verified: false },                // TODO: confirm name and title against rvu.edu.in

    { name: null,
      role: "Placement Coordinator — Engineering and Sciences",
      remit: "Day-to-day contact for students in those schools: eligibility, applications, and interview preparation.",
      email: "recruit@rvu.edu.in", phone: null, verified: false },

    { name: null,
      role: "Placement Coordinator — Business, Law and Liberal Arts",
      remit: "Day-to-day contact for students in those schools, and the first call for sector-specific employer introductions.",
      email: "recruit@rvu.edu.in", phone: null, verified: false },

    { name: null,
      role: "Placement Coordinator — Design and Innovation",
      remit: "Portfolio reviews, design-studio relationships, and live project placements.",
      email: "recruit@rvu.edu.in", phone: null, verified: false },

    { name: null,
      role: "Corporate Relations Executive",
      remit: "Maintains the placement sheet every figure on this site is read from, and answers data questions about it.",
      email: "recruit@rvu.edu.in", phone: null, verified: false }
  ],

  // Academic-year calendar. TODO: confirm against the academic calendar.
  calendar: [
    { term: "Term 1 · August – October",
      activity: [
        "Placement cycle registration opens for final-year students",
        "Readiness sessions, twice in the term",
        "Early full-time drives, mostly technology and consulting"
      ] },
    { term: "Term 2 · November – January",
      activity: [
        "Main full-time drive season",
        "Business and Law school windows open",
        "Summer internship applications open in January"
      ] },
    { term: "Term 3 · February – April",
      activity: [
        "Engineering, Design, Sciences and Liberal Arts windows",
        "Internship drives run alongside full-time drives",
        "Pre-placement offers confirmed from the previous summer"
      ] },
    { term: "Term 4 · May – July",
      activity: [
        "Summer internships run",
        "Cohort figures recorded three months post-graduation",
        "Sheet reconciled against offer letters ahead of publication"
      ] }
  ],

  start_here: [
    { audience: "Students", line: "Start with your year on the journey page, then check where you stand.",
      href: "students.html", label: "Your journey" },
    { audience: "Recruiters", line: "Tell us what stage you are at and we route you to the right cohort.",
      href: "recruiters.html", label: "Hire from RVU" },
    { audience: "Parents", line: "Three plain questions, and three things you can actually do.",
      href: "parents.html", label: "For parents" }
  ]
};
