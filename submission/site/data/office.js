/* office.js — the placement office, by role and route.

   NO PERSONAL NAMES. Roles and the channel that reaches them are things we
   know; the people filling them are not, and a page of bracketed names reads
   as unfinished rather than as deliberate. When the office supplies names they
   become a `name` field on these roles and the page renders them; until then
   the role IS the contact, which is a real answer rather than a gap.

   `direct_line: null` renders as brackets, the same convention every figure on
   the site follows. Nothing here is invented to fill a space.

   TODO: confirm the role list and the direct lines.
   The address itself is settled: placements@rvu.edu.in is RV University's
   published placements address. */
window.RVU = window.RVU || {};

RVU.office = {
  name: "Corporate & Alumni Relations",
  university: "RV University",

  /* The one address, repeated everywhere on the site rather than scattered. */
  general_email: "placements@rvu.edu.in",

  /* The convention, stated once and rendered on the page. */
  convention: "Where the placement sheet has not yet supplied a detail, this " +
              "page shows it in brackets rather than filling it with a guess — " +
              "the same rule every figure on this site follows.",

  roles: [
    {
      id: "lead",
      role: "Placements and Alumni Affairs",
      scope: "Leads the office",
      handles: [
        "Employer relationships and new recruiting partnerships",
        "Drive scheduling across the six schools in the placement cohort",
        "Anything a recruiter, student or parent could not get answered elsewhere"
      ],
      route: "placements@rvu.edu.in",
      route_note: "Write with your question; it reaches the office lead.",
      direct_line: null
    },
    {
      id: "coordination",
      role: "Placement coordination, by school",
      scope: "Day-to-day contact for students",
      handles: [
        "Eligibility questions and the one-offer policy in your case",
        "Applications, interview preparation and mock interviews",
        "Curriculum vitae review, returned within three working days"
      ],
      route: "placements@rvu.edu.in",
      route_note: "Name your school in the subject line and it is routed to that " +
                  "school's coordinator.",
      direct_line: null
    },
    {
      id: "corporate",
      role: "Corporate relations",
      scope: "Employer intake and the placement record",
      handles: [
        "Hiring requests, cohort matching and drive logistics",
        "Maintaining the placement sheet every figure on this site is read from",
        "Questions about how a figure was derived"
      ],
      route: "placements@rvu.edu.in",
      route_note: "Hiring requests can also be started from the recruiter page.",
      direct_line: null
    }
  ],

  /* Academic-year calendar. TODO: confirm against the academic calendar. */
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
        "School of Economics and Business, and School of Law, windows open",
        "Summer internship applications open in January"
      ] },
    { term: "Term 3 · February – April",
      activity: [
        "Computer Science, Design, Liberal Arts and Sciences, and Film and Media windows",
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
