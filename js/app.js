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
  /* One nav, rendered from one list in render.js, on every page. */
  function mountMenu() {
    var mount = doc.querySelector("[data-mega-mount]");
    if (!mount) { return; }
    mount.innerHTML = R.megaMenu(doc.body.getAttribute("data-audience") || "");
  }

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
      /* The hub band carries every organisation in the data, so the figure
         beside it and the band itself count the same list. */
      R.mount("[data-recruiters]", R.recruiterTicker(RVU.recruiters.sectors));
      wireTicker();
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

    if (doc.querySelector("[data-closing]") || doc.querySelector("[data-closing-line]")) {
      var closing = [];
      for (var i = 0; i < RVU.drives.length; i++) {
        if (RVU.drives[i].status === "closing") { closing.push(RVU.drives[i]); }
      }
      if (doc.querySelector("[data-closing]")) {
        R.mount("[data-closing]", R.ledger(closing));
      }
      /* The hub keeps one live line instead of the whole ledger. The count is
         read from drives.js like any other figure — §E.7 — so the hub still
         reads as live without becoming a second source for the ledger. */
      var line = doc.querySelector("[data-closing-line]");
      if (line) {
        line.textContent = closing.length === 1
          ? "1 drive closing this week \u2192"
          : closing.length + " drives closing this week \u2192";
      }
    }

    /* The hub eyebrow carries the cohort year rather than repeating the
       university name the masthead already says. */
    var yr = doc.querySelector("[data-stamp-year]");
    if (yr) { yr.textContent = "Cohort " + RVU.meta.cohort_year; }
  }

  /* A name in the band opens that organisation's drives beneath it. One panel
     is reused: a second click on the same name closes it, and the status node
     says which organisation is open so a screen-reader user is told what
     changed rather than left to discover it. */
  function wireTicker() {
    var band   = doc.querySelector("[data-ticker]");
    var panel  = doc.querySelector("[data-recruiter-panel]");
    var status = doc.querySelector("[data-recruiter-status]");
    if (!band || !panel) { return; }
    var open = null;

    band.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-recruiter]");
      if (!btn) { return; }
      var name = btn.getAttribute("data-recruiter");

      var pressed = band.querySelectorAll("[data-recruiter][aria-expanded='true']");
      for (var i = 0; i < pressed.length; i++) {
        pressed[i].setAttribute("aria-expanded", "false");
      }

      if (open === name) {
        open = null;
        panel.hidden = true;
        panel.innerHTML = "";
        if (status) { status.textContent = "Closed."; }
        return;
      }

      open = name;
      btn.setAttribute("aria-expanded", "true");
      panel.innerHTML = R.recruiterPanel(name, RVU.drives);
      panel.hidden = false;
      if (status) {
        var n = 0;
        for (var d = 0; d < RVU.drives.length; d++) {
          if (RVU.drives[d].company === name) { n++; }
        }
        status.textContent = name + ": " + (n === 1 ? "1 drive" : n + " drives") +
                             " in this cycle.";
      }
      R.fillSlots(panel);
    });
  }

  /* Every top-level block below the hero reveals once on first entry. The hero
     is deliberately excluded: it is above the fold on load, and content the
     reader is already looking at should not move. The attribute is all this
     does — motion.js decides whether anything animates, and under reduced
     motion nothing does. */
  function markReveals() {
    var main = doc.querySelector(".site-main");
    if (!main) { return; }
    var kids = main.children;
    for (var i = 1; i < kids.length; i++) {
      if (kids[i].tagName === "NOSCRIPT") { continue; }
      kids[i].setAttribute("data-reveal", "");
    }
  }

  function boot() {
    if (!R) {
      if (global.console) { console.error("RVU: render.js did not load."); }
      return;
    }
    mountMenu();
    markCurrentAudience();
    mountDataBlocks();
    R.fillSlots();          // last: the mounted blocks may carry slots of their own
    R.checkViews();         // §E.2 and §E.3, over every view on the page
    markReveals();
    if (RVU.motion) { RVU.motion.scan(); }   // bars and reveals mounted above
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

}(typeof window !== "undefined" ? window : globalThis));
