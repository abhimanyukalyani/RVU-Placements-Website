/* schools.js — six schools.
   Per-school cohorts reconcile to RVU.placements.cohort: totals sum to 412,
   seeking to 318, placed to 287, and every bucket to its university figure.
   render.js asserts all of it.

   SCHOOL NAMES ARE UNVERIFIED. Each carries a TODO. Programme lists are
   deliberately empty rather than guessed — an invented programme list is
   worse than a visibly pending one. */
window.RVU = window.RVU || {};

RVU.schools = [
  {
    id: "engineering",
    // TODO: confirm against rvu.edu.in
    name: "School of Computer Science & Engineering",
    programmes: [],                 // TODO: confirm against rvu.edu.in
    cohort: { total_graduates: 96, seeking_through_university: 78,
              continuing_further_study: 10, entrepreneurship_or_family_business: 4,
              placed_independently: 3, postponing_search: 1, students_placed: 71 },
    salary_inr_lpa: { min: 4.2, max: 42.0, mean: 13.1, median: 11.2, n: 71 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "January – April"
  },
  {
    id: "design",
    // TODO: confirm against rvu.edu.in
    name: "School of Design & Innovation",
    programmes: [],                 // TODO: confirm against rvu.edu.in
    cohort: { total_graduates: 88, seeking_through_university: 70,
              continuing_further_study: 9, entrepreneurship_or_family_business: 4,
              placed_independently: 4, postponing_search: 1, students_placed: 64 },
    salary_inr_lpa: { min: 3.8, max: 24.0, mean: 9.2, median: 8.1, n: 64 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "January – April"
  },
  {
    id: "business",
    // TODO: confirm against rvu.edu.in
    name: "School of Business",
    programmes: [],                 // TODO: confirm against rvu.edu.in
    cohort: { total_graduates: 72, seeking_through_university: 55,
              continuing_further_study: 9, entrepreneurship_or_family_business: 4,
              placed_independently: 3, postponing_search: 1, students_placed: 49 },
    salary_inr_lpa: { min: 4.0, max: 30.0, mean: 10.4, median: 9.0, n: 49 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "November – February"
  },
  {
    id: "liberal-arts",
    // TODO: confirm against rvu.edu.in
    name: "School of Liberal Arts & Humanities",
    programmes: [],                 // TODO: confirm against rvu.edu.in
    cohort: { total_graduates: 61, seeking_through_university: 46,
              continuing_further_study: 8, entrepreneurship_or_family_business: 4,
              placed_independently: 2, postponing_search: 1, students_placed: 41 },
    salary_inr_lpa: { min: 3.6, max: 18.0, mean: 7.9, median: 7.1, n: 41 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "February – May"
  },
  {
    id: "law",
    // TODO: confirm against rvu.edu.in
    name: "School of Law",
    programmes: [],                 // TODO: confirm against rvu.edu.in
    cohort: { total_graduates: 54, seeking_through_university: 41,
              continuing_further_study: 6, entrepreneurship_or_family_business: 3,
              placed_independently: 3, postponing_search: 1, students_placed: 37 },
    salary_inr_lpa: { min: 4.5, max: 20.0, mean: 9.7, median: 8.9, n: 37 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "October – January"
  },
  {
    id: "sciences",
    // TODO: confirm against rvu.edu.in
    name: "School of Sciences",
    programmes: [],                 // TODO: confirm against rvu.edu.in
    cohort: { total_graduates: 41, seeking_through_university: 28,
              continuing_further_study: 4, entrepreneurship_or_family_business: 2,
              placed_independently: 4, postponing_search: 3, students_placed: 25 },
    salary_inr_lpa: { min: 4.4, max: 19.5, mean: 9.3, median: 8.5, n: 25 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "February – May"
  }
];
