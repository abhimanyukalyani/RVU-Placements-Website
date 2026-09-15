/* ===========================================================================
   outcomes.js — module 3, the outcomes explorer.

   Not a dashboard: an argument in four moves.
     1  the denominator first, as a segmented bar that reconciles visibly
     2  median first, maximum beside it and capped at 60% of its size in CSS
     3  the whole distribution, with a Middle 80% toggle
     4  breakdowns, every row carrying its own count of data points

   Every render ends by calling R.checkViews(), so the two view-level rules in
   §E.2 and §E.3 are enforced on each redraw, not just the first paint.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var doc = global.document;
  if (!doc) { return; }

  var R, P, middle80 = false, tab = "by_sector";

  var TAB_LABEL = {
    by_sector:   "By sector",
    by_function: "By function",
    by_location: "By location"
  };

  var BUCKETS = [
    { key: "seeking_through_university",            label: "Seeking placement through the university" },
    { key: "continuing_further_study",              label: "Continuing to further study" },
    { key: "entrepreneurship_or_family_business",   label: "Entrepreneurship or family business" },
    { key: "placed_independently",                  label: "Placed independently" },
    { key: "postponing_search",                     label: "Postponing the search" }
  ];

  /* ---------------------------------------------- 1 · the denominator first */
  function classification() {
    var c = P.cohort, i, sum = 0;
    for (i = 0; i < BUCKETS.length; i++) { sum += c[BUCKETS[i].key]; }

    var segs = "", rows = "";
    for (i = 0; i < BUCKETS.length; i++) {
      var v = c[BUCKETS[i].key];
      var w = (v / c.total_graduates) * 100;
      segs += "<span class=\"segbar__seg segbar__seg--" + (i + 1) + "\" data-fill-bar style=\"width:" +
              (Math.round(w * 10) / 10) + "%\" aria-hidden=\"true\"></span>";
      rows += "<li class=\"segkey__item\">" +
                "<span class=\"segkey__swatch segkey__swatch--" + (i + 1) + "\" aria-hidden=\"true\"></span>" +
                "<span class=\"segkey__label\">" + R.esc(BUCKETS[i].label) + "</span>" +
                "<span class=\"segkey__count tabular\">" + R.esc(R.fig(v)) + "</span>" +
              "</li>";
    }

    return "<div class=\"segbar\" role=\"img\" aria-label=\"" +
             R.esc("Every graduate in exactly one group, totalling " +
                   R.fig(c.total_graduates)) + "\">" + segs + "</div>" +
           "<ul class=\"segkey\">" + rows + "</ul>" +
           "<p class=\"segkey__total\">" +
             "<span class=\"t-label\">Reconciles to</span> " +
             "<b class=\"tabular\" data-denominator-for=\"placement-rate cohort-share\">" +
               R.esc(R.fig(sum)) + "</b> graduates, which is the whole class of " +
             "<b class=\"tabular\">" + R.esc(R.fig(c.total_graduates)) + "</b>. " +
             "Every graduate appears in exactly one group." +
           "</p>";
  }

  /* ------------------------------------- 2 · median first, maximum beside it */
  function headline() {
    var s = middle80 ? P.middle_80.basic : P.salary_inr_lpa.basic;
    var c = P.cohort;

    return "<div class=\"figure-row\" data-package-figure>" +
        "<div class=\"figure-block figure-block--median\">" +
          "<span class=\"figure-block__value\">" + R.esc(R.fig(s.median, "inr_lpa")) + "</span>" +
          "<span class=\"figure-block__max\">Highest " + R.esc(R.fig(s.max, "inr_lpa")) + "</span>" +
          "<span class=\"figure-block__caption t-label\">Median basic package" +
            (middle80 ? ", middle 80%" : "") + "</span>" +
        "</div>" +
        "<div class=\"figure-block\">" +
          "<span class=\"figure-block__value\">" + R.esc(R.fig(s.mean, "inr_lpa")) + "</span>" +
          "<span class=\"figure-block__caption t-label\">Mean</span>" +
        "</div>" +
        "<div class=\"figure-block\">" +
          "<span class=\"figure-block__value\">" + R.esc(R.fig(s.n)) + "</span>" +
          "<span class=\"figure-block__caption t-label\">Offers behind these figures</span>" +
        "</div>" +
      "</div>" +
      "<p class=\"cohort-stamp t-caption\">" + R.esc(R.stamp()) + "</p>" +
      "<p class=\"headline__read\">" +
        "Half of the " + "<b class=\"tabular\" data-denominator-for=\"placement-rate\">" +
        R.esc(R.fig(s.n)) + "</b> students with an offer received more than " +
        R.esc(R.fig(s.median, "inr_lpa")) + ", half less. The mean sits " +
        (s.mean > s.median ? "above" : "at or below") + " the median, which is what a " +
        "small number of large offers does to an average — it is why the median leads here." +
      "</p>";
  }

  /* ------------------------------------------- 3 · the whole distribution */
  function distribution() {
    var band = middle80 ? P.middle_80.basic : null;
    var max = 0, i;
    for (i = 0; i < P.distribution.length; i++) {
      if (P.distribution[i].count > max) { max = P.distribution[i].count; }
    }

    var html = "<div class=\"distribution\">";
    for (i = 0; i < P.distribution.length; i++) {
      var b = P.distribution[i];
      var w = max ? Math.round((b.count / max) * 1000) / 10 : 0;

      /* When the Middle 80% view is on, buckets that fall outside the band are
         drawn as an outline rather than a fill — a graphic distinction, since
         the palette has no second colour to use and none of them is red. */
      var outside = false;
      if (band) {
        var to = (b.to === null) ? Infinity : b.to;
        outside = (to <= band.min) || (b.from >= band.max);
      }

      html += "<div class=\"distribution__item\">" +
                "<span class=\"distribution__label\">" + R.esc(b.label) +
                  (outside ? " <span class=\"t-label distribution__flag\">outside the band</span>" : "") +
                "</span>" +
                "<span class=\"distribution__track\" aria-hidden=\"true\">" +
                  "<span class=\"distribution__bar" + (outside ? " distribution__bar--outside" : "") +
                    "\" data-fill-bar style=\"width:" + w + "%\"></span>" +
                "</span>" +
                "<span class=\"distribution__count\">" + R.esc(R.fig(b.count)) + "</span>" +
              "</div>";
    }
    html += "</div>";

    html += "<p class=\"t-caption distribution__note\">" +
      (middle80
        ? ("The middle 80% excludes the top and bottom decile: " +
           R.esc(R.fig(P.middle_80.basic.n)) + " of " +
           R.esc(R.fig(P.salary_inr_lpa.basic.n)) + " offers, between " +
           R.esc(R.fig(P.middle_80.basic.min, "inr_lpa")) + " and " +
           R.esc(R.fig(P.middle_80.basic.max, "inr_lpa")) + ". " +
           "Bars drawn as outlines fall outside that band. Counts are unchanged — " +
           "the bands are wider than the deciles, so a bucket can straddle the edge.")
        : ("All " + R.esc(R.fig(P.salary_inr_lpa.basic.n)) + " offers. " +
           "Switch to the middle 80% to see the same class with the top and bottom " +
           "decile removed, which is where an outlier stops moving the mean.")) +
      "</p>";

    return html;
  }

  /* ------------------------------------------------------- 4 · breakdowns */
  function breakdowns() {
    var rows = P[tab], out = [], i, total = 0;
    for (i = 0; i < rows.length; i++) { total += rows[i].count; }

    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      out.push([
        r.name,
        R.fig(r.count),
        R.fig(r.min, "inr_lpa"),
        R.fig(r.median, "inr_lpa"),
        R.fig(r.mean, "inr_lpa"),
        R.fig(r.max, "inr_lpa")
      ]);
    }

    var tabs = "<div class=\"filter-chips\" role=\"tablist\" aria-label=\"Break the cohort down by\">";
    var keys = ["by_sector", "by_function", "by_location"];
    for (i = 0; i < keys.length; i++) {
      tabs += "<button type=\"button\" class=\"chip\" role=\"tab\" data-tab=\"" + keys[i] +
              "\" aria-selected=\"" + (keys[i] === tab) + "\" aria-pressed=\"" +
              (keys[i] === tab) + "\">" + R.esc(TAB_LABEL[keys[i]]) + "</button>";
    }
    tabs += "</div>";

    return tabs +
      R.dataTable({
        caption: TAB_LABEL[tab] + ", with the count of offers behind each row",
        columns: ["" + TAB_LABEL[tab].replace("By ", "").replace(/^./, function (m) {
          return m.toUpperCase();
        }), "Offers", "Lowest", "Median", "Mean", "Highest"],
        rows: out
      }) +
      "<p class=\"t-caption distribution__note\">Every row carries the number of offers " +
        "behind it, so a thin cell cannot read as a trend. The rows sum to " +
        "<b class=\"tabular\">" + R.esc(R.fig(total)) + "</b> offers, the whole placed cohort.</p>" +
      "<p class=\"cohort-stamp t-caption\">" + R.esc(R.stamp()) + "</p>";
  }

  /* ------------------------------------------------------------- render */
  function render() {
    R.mount("[data-classification]", classification());
    R.mount("[data-headline]", headline());
    R.mount("[data-spread]", distribution());
    R.mount("[data-breakdowns]", breakdowns());

    var toggle = doc.getElementById("toggle-middle80");
    if (toggle) { toggle.setAttribute("aria-pressed", middle80 ? "true" : "false"); }

    var status = doc.getElementById("outcomes-status");
    if (status) {
      status.textContent = middle80
        ? "Showing the middle 80% of offers."
        : "Showing all offers.";
    }

    wireTabs();

    /* The rules are checked on every redraw, not just the first paint. */
    R.checkViews();

    /* This redraw made new bars; hand them to the motion system. */
    if (RVU.motion) { RVU.motion.scan(); }
  }

  function wireTabs() {
    var buttons = doc.querySelectorAll("[data-tab]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (e) {
        tab = e.currentTarget.getAttribute("data-tab");
        render();
        var again = doc.querySelector("[data-tab='" + tab + "']");
        if (again) { again.focus(); }
      });
    }
  }

  function init() {
    if (!doc.querySelector("[data-classification]")) { return; }
    R = RVU.render;
    P = RVU.placements;

    var toggle = doc.getElementById("toggle-middle80");
    if (toggle) {
      toggle.addEventListener("click", function () { middle80 = !middle80; render(); });
    }
    render();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else { init(); }

}(typeof window !== "undefined" ? window : globalThis));
