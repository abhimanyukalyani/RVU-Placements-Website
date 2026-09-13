/* drives.js — live and closed drives.
   No peer site in the audit publishes drive windows at all.
   status is one of: open | closing | closed | offers_out
   Dates are ISO so they sort and compare without parsing tricks.

   PLACEHOLDER. Organisation names are illustrative.
   TODO: confirm the drive calendar against the placement sheet. */
window.RVU = window.RVU || {};

RVU.drives = [
  { id: "d-001", company: "[Organisation 01]", sector: "Technology & IT services",
    role: "Software Engineer, New Grad", location: "Bengaluru", ctc_lpa: 14.0,
    eligible_schools: ["socse", "solas"], min_cgpa: 7.0,
    opens: "2026-09-01", closes: "2026-09-16", stage: "Applications open", status: "closing" },

  { id: "d-002", company: "[Organisation 07]", sector: "Financial services & fintech",
    role: "Analyst, Risk & Strategy", location: "Mumbai", ctc_lpa: 11.5,
    eligible_schools: ["soeb", "solas"], min_cgpa: 7.5,
    opens: "2026-09-02", closes: "2026-09-17", stage: "Applications open", status: "closing" },

  { id: "d-003", company: "[Organisation 14]", sector: "Design, media & creative industries",
    role: "Product Designer", location: "Bengaluru", ctc_lpa: 9.5,
    eligible_schools: ["sdi", "sofmca"], min_cgpa: 6.5,
    opens: "2026-09-05", closes: "2026-09-18", stage: "Portfolio review", status: "closing" },

  { id: "d-004", company: "[Organisation 02]", sector: "Technology & IT services",
    role: "Data Analyst", location: "Hyderabad", ctc_lpa: 10.2,
    eligible_schools: ["socse", "solas", "soeb"], min_cgpa: 7.0,
    opens: "2026-09-08", closes: "2026-09-30", stage: "Applications open", status: "open" },

  { id: "d-005", company: "[Organisation 11]", sector: "Consulting & professional services",
    role: "Associate Consultant", location: "Bengaluru", ctc_lpa: 12.0,
    eligible_schools: ["soeb", "solas", "socse"], min_cgpa: 7.5,
    opens: "2026-09-10", closes: "2026-10-05", stage: "Applications open", status: "open" },

  { id: "d-006", company: "[Organisation 18]", sector: "Industry, health & public sector",
    role: "Graduate Engineer Trainee", location: "Pune", ctc_lpa: 7.8,
    eligible_schools: ["socse", "solas"], min_cgpa: 6.5,
    opens: "2026-09-11", closes: "2026-10-09", stage: "Applications open", status: "open" },

  { id: "d-007", company: "[Organisation 19]", sector: "Industry, health & public sector",
    role: "Legal Associate", location: "Delhi NCR", ctc_lpa: 9.0,
    eligible_schools: ["sol"], min_cgpa: 7.0,
    opens: "2026-09-12", closes: "2026-10-12", stage: "Applications open", status: "open" },

  { id: "d-008", company: "[Organisation 15]", sector: "Design, media & creative industries",
    role: "Content Strategist", location: "Remote, India", ctc_lpa: 7.2,
    eligible_schools: ["solas", "sdi", "sofmca"], min_cgpa: 6.0,
    opens: "2026-09-12", closes: "2026-10-16", stage: "Applications open", status: "open" },

  { id: "d-009", company: "[Organisation 03]", sector: "Technology & IT services",
    role: "Platform Engineer", location: "Bengaluru", ctc_lpa: 16.5,
    eligible_schools: ["socse"], min_cgpa: 8.0,
    opens: "2026-08-04", closes: "2026-08-29", stage: "Offers released", status: "offers_out" },

  { id: "d-010", company: "[Organisation 08]", sector: "Financial services & fintech",
    role: "Investment Operations Associate", location: "Mumbai", ctc_lpa: 10.0,
    eligible_schools: ["soeb"], min_cgpa: 7.0,
    opens: "2026-08-06", closes: "2026-08-31", stage: "Offers released", status: "offers_out" },

  { id: "d-011", company: "[Organisation 04]", sector: "Technology & IT services",
    role: "QA Engineer", location: "Chennai", ctc_lpa: 8.4,
    eligible_schools: ["socse", "solas"], min_cgpa: 6.5,
    opens: "2026-07-14", closes: "2026-08-08", stage: "Drive complete", status: "closed" },

  { id: "d-012", company: "[Organisation 12]", sector: "Consulting & professional services",
    role: "Research Associate", location: "Bengaluru", ctc_lpa: 8.8,
    eligible_schools: ["solas", "soeb", "sol"], min_cgpa: 7.0,
    opens: "2026-07-20", closes: "2026-08-14", stage: "Drive complete", status: "closed" }
];
