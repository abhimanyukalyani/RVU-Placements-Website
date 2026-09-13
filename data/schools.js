/* schools.js — the eight schools of RV University.
   School names verified against rvu.edu.in.

   Two schools are NOT part of the graduating placement cohort. They are
   present in the data with in_placement_cohort: false and a stated reason,
   because a school that is silently absent from a placement page is
   indistinguishable from one that did badly. The exclusion is published on
   methodology.html rather than left for a reader to notice.

   The six in-cohort schools reconcile exactly to RVU.placements.cohort:
   totals to 412, seeking to 318, placed to 287, and every bucket to its
   university figure. render.js asserts all of it and counts only the six.

   Programme lists remain empty pending confirmation. FIGURES ARE PLACEHOLDERS. */
window.RVU = window.RVU || {};

RVU.schools = [
  {
    id: "solas",
    name: "School of Liberal Arts and Sciences",
    abbr: "SoLAS",
    in_placement_cohort: true,
    exclusion_reason: null,
    programmes: [],                 // TODO: confirm programme list against rvu.edu.in
    cohort: { total_graduates: 92, seeking_through_university: 70,
              continuing_further_study: 12, entrepreneurship_or_family_business: 4,
              placed_independently: 4, postponing_search: 2, students_placed: 62 },
    salary_inr_lpa: { min: 3.6, max: 19.5, mean: 8.2, median: 7.4, n: 62 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "February – May"
  },
  {
    id: "sdi",
    name: "School of Design and Innovation",
    abbr: "SDI",
    in_placement_cohort: true,
    exclusion_reason: null,
    programmes: [],                 // TODO: confirm programme list against rvu.edu.in
    cohort: { total_graduates: 68, seeking_through_university: 53,
              continuing_further_study: 7, entrepreneurship_or_family_business: 4,
              placed_independently: 3, postponing_search: 1, students_placed: 48 },
    salary_inr_lpa: { min: 3.8, max: 24.0, mean: 9.2, median: 8.1, n: 48 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "January – April"
  },
  {
    id: "soeb",
    name: "School of Economics and Business",
    abbr: "SoEB",
    in_placement_cohort: true,
    exclusion_reason: null,
    programmes: [],                 // TODO: confirm programme list against rvu.edu.in
    cohort: { total_graduates: 72, seeking_through_university: 55,
              continuing_further_study: 9, entrepreneurship_or_family_business: 4,
              placed_independently: 3, postponing_search: 1, students_placed: 49 },
    salary_inr_lpa: { min: 4.0, max: 30.0, mean: 10.4, median: 9.0, n: 49 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "November – February"
  },
  {
    id: "socse",
    name: "School of Computer Science and Engineering",
    abbr: "SoCSE",
    in_placement_cohort: true,
    exclusion_reason: null,
    programmes: [],                 // TODO: confirm programme list against rvu.edu.in
    cohort: { total_graduates: 96, seeking_through_university: 78,
              continuing_further_study: 10, entrepreneurship_or_family_business: 4,
              placed_independently: 3, postponing_search: 1, students_placed: 71 },
    salary_inr_lpa: { min: 4.2, max: 42.0, mean: 13.1, median: 11.2, n: 71 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "January – April"
  },
  {
    id: "sol",
    name: "School of Law",
    abbr: "SoL",
    in_placement_cohort: true,
    exclusion_reason: null,
    programmes: [],                 // TODO: confirm programme list against rvu.edu.in
    cohort: { total_graduates: 54, seeking_through_university: 41,
              continuing_further_study: 6, entrepreneurship_or_family_business: 3,
              placed_independently: 3, postponing_search: 1, students_placed: 37 },
    salary_inr_lpa: { min: 4.5, max: 20.0, mean: 9.7, median: 8.9, n: 37 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "October – January"
  },
  {
    id: "sofmca",
    name: "School of Film, Media and Creative Arts",
    abbr: "SoFMCA",
    in_placement_cohort: true,
    exclusion_reason: null,
    programmes: [],                 // TODO: confirm programme list against rvu.edu.in
    cohort: { total_graduates: 30, seeking_through_university: 21,
              continuing_further_study: 2, entrepreneurship_or_family_business: 2,
              placed_independently: 3, postponing_search: 2, students_placed: 20 },
    salary_inr_lpa: { min: 3.6, max: 22.0, mean: 8.5, median: 7.6, n: 20 },
    top_recruiters: [],             // TODO: confirm against the placement sheet
    availability_window: "February – May"
  },

  /* --- not part of the graduating placement cohort ---------------------- */

  {
    id: "soahp",
    name: "School of Allied and Healthcare Professions",
    abbr: "SoAHP",
    in_placement_cohort: false,
    exclusion_reason: "Undergraduate programmes only; the first cohort has not " +
                      "yet graduated, so there is nothing to report.",
    programmes: [],                 // TODO: confirm programme list against rvu.edu.in
    cohort: null,                   // no graduating cohort yet — not zero, absent
    salary_inr_lpa: null,
    top_recruiters: [],
    availability_window: null
  },
  {
    id: "sceps",
    name: "School for Continuing Education & Professional Studies",
    abbr: "SCEPS",
    in_placement_cohort: false,
    exclusion_reason: "Continuing education for working professionals; its students " +
                      "are not part of the graduating placement cohort.",
    programmes: [],                 // TODO: confirm programme list against rvu.edu.in
    cohort: null,
    salary_inr_lpa: null,
    top_recruiters: [],
    availability_window: null
  }
];

/* Convenience: the six schools every figure on the site is computed over.
   Derived, never stored separately, so it cannot drift from the list above. */
RVU.placementSchools = function () {
  return RVU.schools.filter(function (s) { return s.in_placement_cohort; });
};
