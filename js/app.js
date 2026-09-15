/* ===========================================================================
   app.js — boot, nav active-state, and the list blocks.

   Prose is not here. It lives in the markup of each page, where it can be
   edited directly (and, after the WordPress port, in Gutenberg). This file
   fills figure slots and mounts the blocks whose contents are data — the
   distribution, the recruiter strip, the ledger — none of which contain copy.

   Classic script. Loaded last, after every data/*.js and render.js.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU || {};
  var R = RVU.render;
  var doc = global.document;

  /* Navigation is plain markup and works with JS off; only the active state
     is set here. A page declares its audience with data-audience on <body>. */
  function markCurrentAudience() {
    var current = doc.body.getAttribute("data-audience");
    if (!current) { return; }
    var links = doc.querySelectorAll(".audience-switcher__link");
    for (var i = 0; i < links.length; i++) {
      if ((links[i].getAttribute("href") || "").indexOf(current) === 0) {
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  /* Blocks whose every item comes from data/. No copy passes through here. */
  function mountDataBlocks() {
    if (doc.querySelector("[data-distribution]")) {
      R.mount("[data-distribution]", R.distributionRow(RVU.placements.distribution));
    }

    if (doc.querySelector("[data-recruiters]")) {
      /* The hub shows a strip, not the whole register; the figure beside it
         still counts every organisation in the data. */
      R.mount("[data-recruiters]", R.recruiterStrip(RVU.recruiters.sectors, 24));
    }

    if (doc.querySelector("[data-spine]")) {
      R.mount("[data-spine]", R.stageSpine(RVU.journey.stages));
    }

    if (doc.querySelector("[data-timeline]")) {
      R.mount("[data-timeline]", R.yearTimeline(RVU.journey.years));
    }

    if (doc.querySelector("[data-service-levels]")) {
      R.mount("[data-service-levels]", R.serviceLevels(RVU.intakeFields.service_levels));
    }

    if (doc.querySelector("[data-schools-table]")) {
      R.mount("[data-schools-table]", R.schoolsTable(RVU.schools));
    }

    if (doc.querySelector("[data-work-terms]")) {
      R.mount("[data-work-terms]", R.workTerms(RVU.intakeFields, RVU.schools));
    }

    if (doc.querySelector("[data-glossary]")) {
      R.mount("[data-glossary]", R.glossary(RVU.glossary));
    }

    /* The parents' page states the same two figures the hub does, but in
       words a first-time reader can act on. Same source, same stamp. */
    if (doc.querySelector("[data-parent-figures]")) {
      var basic = RVU.placements.salary_inr_lpa.basic;
      R.mount("[data-parent-figures]",
        "<div class=\"figure-row\">" +
          "<div class=\"figure-block figure-block--median\">" +
            "<span class=\"figure-block__value\">" + R.esc(R.fig(basic.median, "inr_lpa")) + "</span>" +
            "<span class=\"figure-block__max\">Highest " + R.esc(R.fig(basic.max, "inr_lpa")) + "</span>" +
            "<span class=\"figure-block__caption t-label\">Median package, last cohort</span>" +
          "</div>" +
        "</div>");
    }

    if (doc.querySelector("[data-denominator-plain]")) {
      var c = RVU.placements.cohort;
      R.mount("[data-denominator-plain]",
        "<div class=\"denominator\">" +
          "<p class=\"eyebrow\">The same figure, with its denominator</p>" +
          "<p class=\"denominator__text\">" +
            "<b>" + R.esc(R.fig(c.students_placed)) + "</b> of the <b>" +
            R.esc(R.fig(c.seeking_through_university)) + "</b> students who were looking " +
            "for a placement through the university received an offer. That is <b>" +
            R.esc(R.pct(c.students_placed, c.seeking_through_university, { bare: true })) +
            "</b> of them &mdash; and the two numbers it is made from are printed beside it, " +
            "every time it appears." +
          "</p>" +
        "</div>");
    }

    if (doc.querySelector("[data-scope-table]")) {
      R.mount("[data-scope-table]", R.scopeTable(RVU.schools));
    }
    if (doc.querySelector("[data-classification-table]")) {
      R.mount("[data-classification-table]", R.classificationTable(RVU.placements.cohort));
    }
    if (doc.querySelector("[data-deviations]")) {
      R.mount("[data-deviations]", R.deviationsTable(RVU.meta));
    }
    if (doc.querySelector("[data-archive]")) {
      R.mount("[data-archive]", R.archiveTable(RVU.meta));
    }
    if (doc.querySelector("[data-school-index]")) {
      R.mount("[data-school-index]", R.schoolIndex(RVU.schools));
    }
    if (doc.querySelector("[data-schools]")) {
      R.mount("[data-schools]", R.schoolSections(RVU.schools, RVU.placements.distribution));
    }

    if (doc.querySelector("[data-roles]")) {
      R.mount("[data-roles]", R.roles(RVU.office.roles));
    }
    if (doc.querySelector("[data-office-convention]")) {
      doc.querySelector("[data-office-convention]").textContent = RVU.office.convention;
    }
    if (doc.querySelector("[data-calendar]")) {
      R.mount("[data-calendar]", R.calendar(RVU.office.calendar));
    }
    if (doc.querySelector("[data-start-here]")) {
      R.mount("[data-start-here]", R.startHere(RVU.office.start_here));
    }

    if (doc.querySelector("[data-closing]")) {
      var closing = [];
      for (var i = 0; i < RVU.drives.length; i++) {
        if (RVU.drives[i].status === "closing") { closing.push(RVU.drives[i]); }
      }
      R.mount("[data-closing]", R.ledger(closing));
    }
  }

  function boot() {
    if (!R) {
      if (global.console) { console.error("RVU: render.js did not load."); }
      return;
    }
    markCurrentAudience();
    mountDataBlocks();
    R.fillSlots();          // last: the mounted blocks may carry slots of their own
    R.checkViews();         // §E.2 and §E.3, over every view on the page
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

}(typeof window !== "undefined" ? window : globalThis));
