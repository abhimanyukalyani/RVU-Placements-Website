/* meta.js — cohort year, dates, provenance.
   Read by every page; stamped into every figure block.
   Classic script. Assigns onto the one global. No modules, no fetch. */
window.RVU = window.RVU || {};

RVU.meta = {
  cohort_year: "2025–26",
  record_date: "2026-06-30",   // three months post-graduation, per the IPRS pattern
  publish_date: "2026-09-12",  // six months post-graduation
  updated: "2026-09-12",
  source: "Corporate & Alumni Relations placement sheet",
  maintainer: "Corporate & Alumni Relations, RV University",
  contact_email: "placements@rvu.edu.in",

  // "placeholder" flips to "live" when real figures land. render.js reads this
  // to decide whether to show the placeholder notice; it does not change how
  // any individual figure renders — a null value is bracketed either way.
  status: "placeholder",

  audited_by: null,            // e.g. "Brickwork Ratings" if external audit is adopted
  retention_months: 12,        // raw data retained twelve months
  currency_note: "Offers outside India are converted to USD and PPP-adjusted " +
                 "using World Bank factors."
};
