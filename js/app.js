/* ===========================================================================
   app.js — boot, nav active-state, and the hub's composition.

   Prose lives here; figures do not. Every number on the page resolves from
   data/ through render.js. If a digit appears in a content position in an
   .html file, that is a bug (CLAUDE.md §E.7).

   Classic script. Loaded last, after every data/*.js and render.js.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU || {};
  var R = RVU.render;
  var doc = global.document;

  /* --- copy · addressed to one reader at a time (CLAUDE.md §F) ----------- */
  var COPY = {
    hero: {
      eyebrow: "RV University",
      title: "Placements",
      // The thesis, in the second person. No superlatives: every claim here
      // is a description of how the page works, checkable against the page.
      subhead: "You are here to find work, to hire, or to understand what " +
               "either looks like for someone you care about. Every figure " +
               "below comes from one sheet, carries the date it was recorded, " +
               "and shows the spread behind it.",
      actions: [
        { label: "See the outcomes",       href: "outcomes.html" },
        { label: "Start a hiring request", href: "hire.html", quiet: true }
      ]
    },

    doors: [
      { label: "01 · For students",
        title: "Know where you stand, and what to do next",
        body: "Your timeline year by year, an eligibility check that tells you " +
              "where you stand today, and every live drive in one list.",
        linkText: "Start with your year",
        href: "students.html" },

      { label: "02 · For recruiters",
        title: "Tell us your stage, and we route you",
        body: "Tell us what stage you're at. We'll route you to the right " +
              "cohort, the right window, and a named person.",
        linkText: "Tell us what you need",
        href: "recruiters.html" },

      { label: "03 · For parents",
        title: "What the process is, and what you can do",
        body: "What the placement process actually is, what the numbers mean " +
              "in plain English, and three things you can do.",
        linkText: "See what you can do",
        href: "parents.html" }
    ],

    figures:      { eyebrow: "The cohort at a glance" },
    distribution: { eyebrow: "Where the offers landed",
                    title: "The spread behind the median",
                    aside: "Every student placed, sorted by the size of their " +
                           "offer. The median sits inside the second band." },
    denominator:  { eyebrow: "Who these numbers are about" },
    recruiters:   { eyebrow: "Recruiting organisations",
                    title: "Who hired from this cohort",
                    aside: "Set as names, not logos. Organisation names are " +
                           "placeholders until the placement sheet is loaded." },
    closing:      { eyebrow: "Act this week",
                    title: "Closing this week",
                    link: { label: "See all live drives", href: "drives.html" } }
  };

  /* --- captions for the figure row · the words, not the numbers ---------- */
  var FIGURE_CAPTIONS = {
    offers:     "Offers made",
    recruiters: "Recruiting organisations",
    median:     "Median package",
    highest:    "Highest"
  };

  /* ----------------------------------------------------------------- nav */
  /* A page declares its audience with data-audience on <body>; this marks the
     matching switcher link. Navigation itself is plain markup and works with
     JS off — only the active-state is set here. */
  function markCurrentAudience() {
    var current = doc.body.getAttribute("data-audience");
    if (!current) { return; }
    var links = doc.querySelectorAll(".audience-switcher__link");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      if (href.indexOf(current) === 0) { links[i].setAttribute("aria-current", "page"); }
    }
  }

  /* --------------------------------------------------------- the footer */
  function renderFooterStamp() {
    var node = doc.querySelector("[data-rvu-stamp]");
    if (node) { node.textContent = R.stamp(); }
  }

  /* ------------------------------------------------------------- the hub */
  function renderHub() {
    if (!doc.querySelector("[data-hub]")) { return; }

    var p   = RVU.placements;
    var c   = p.cohort;
    var basic = p.salary_inr_lpa.basic;

    /* -- hero ------------------------------------------------------------ */
    R.mount("[data-hero]",
      R.eyebrow(COPY.hero.eyebrow) +
      "<h1 class=\"hero__title\">" + R.esc(COPY.hero.title) + "</h1>" +
      "<p class=\"hero__subhead\">" + R.esc(COPY.hero.subhead) + "</p>" +
      "<div class=\"hero__actions\">" +
        R.pill(COPY.hero.actions[0]) + R.pill(COPY.hero.actions[1]) +
      "</div>");

    /* -- three doors ----------------------------------------------------- */
    R.mount("[data-doors]", R.doors(COPY.doors));

    /* -- figure row + cohort stamp --------------------------------------- */
    /* The recruiting-organisations figure is COUNTED from recruiters.js.
       There is no count field in the data to fall out of step with the list
       rendered further down the page. */
    var recruiterCount = R.countRecruiters(RVU.recruiters.sectors);

    R.mount("[data-figures]",
      R.eyebrow(COPY.figures.eyebrow) +
      R.figureRow([
        { value: c.offers_made,   caption: FIGURE_CAPTIONS.offers },
        { value: recruiterCount,  caption: FIGURE_CAPTIONS.recruiters },
        { value: basic.median, fmt: "inr_lpa", isMedian: true,
          caption: FIGURE_CAPTIONS.median,
          max: basic.max, maxLabel: FIGURE_CAPTIONS.highest }
      ]));

    /* -- distribution row · in the same view as the median figure -------- */
    R.mount("[data-distribution]",
      R.eyebrow(COPY.distribution.eyebrow) +
      "<h2 class=\"section-head__title\">" + R.esc(COPY.distribution.title) + "</h2>" +
      "<p class=\"section-head__aside\">" + R.esc(COPY.distribution.aside) + "</p>" +
      "<div class=\"stack\">" + R.distributionRow(p.distribution) + "</div>");

    /* -- denominator line ------------------------------------------------
       The figure row above states offers, organisations and the median. This
       sentence states the cohort. Neither repeats the other's numbers, and
       the percentage is bare because the sentence around it carries the
       denominator in words. */
    R.mount("[data-denominator]",
      R.eyebrow(COPY.denominator.eyebrow, { onPanel: true }) +
      "<p class=\"denominator__text\">" +
        "<b>" + R.esc(R.fig(c.students_placed)) + "</b> of the " +
        "<b>" + R.esc(R.fig(c.seeking_through_university)) + "</b> students seeking " +
        "placement through the university received an offer — " +
        "<b>" + R.esc(R.pct(c.students_placed, c.seeking_through_university,
                            { bare: true })) + "</b>. " +
        "Of the rest of the graduating class, " +
        R.esc(R.fig(c.continuing_further_study)) + " continued to further study, " +
        R.esc(R.fig(c.entrepreneurship_or_family_business)) +
        " went to entrepreneurship or a family business, " +
        R.esc(R.fig(c.placed_independently)) + " placed independently, and " +
        R.esc(R.fig(c.postponing_search)) + " postponed the search." +
      "</p>");

    /* -- recruiter strip · names as text, hairline dividers, no logos ---- */
    R.mount("[data-recruiters]",
      R.eyebrow(COPY.recruiters.eyebrow) +
      "<h2 class=\"section-head__title\">" + R.esc(COPY.recruiters.title) + "</h2>" +
      "<p class=\"section-head__aside\">" + R.esc(COPY.recruiters.aside) + "</p>" +
      "<div class=\"stack\">" + R.recruiterStrip(RVU.recruiters.sectors) + "</div>");

    /* -- closing this week ----------------------------------------------- */
    var closing = [];
    for (var i = 0; i < RVU.drives.length; i++) {
      if (RVU.drives[i].status === "closing") { closing.push(RVU.drives[i]); }
    }

    R.mount("[data-closing]",
      R.eyebrow(COPY.closing.eyebrow) +
      "<h2 class=\"section-head__title\">" + R.esc(COPY.closing.title) + "</h2>" +
      "<div class=\"stack\">" + R.ledger(closing) + "</div>" +
      "<p class=\"hero__actions\">" + R.pill(COPY.closing.link) + "</p>");
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    if (!R) {
      if (global.console) { console.error("RVU: render.js did not load."); }
      return;
    }
    markCurrentAudience();
    renderFooterStamp();
    renderHub();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

}(typeof window !== "undefined" ? window : globalThis));
