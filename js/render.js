/* ===========================================================================
   render.js — the figure rules, owned in code.

   CLAUDE.md §E is a set of structural rules, not editorial guidance. This file
   is where they are enforced, so a page author cannot break them by accident:

     · fig()   an unpopulated figure renders in brackets. Never 0, never an
               em dash, never an empty box.
     · pct()   throws if called without a denominator. There is no way to put
               a bare percentage on a page.
     · stamp() the cohort stamp, from RVU.meta. Every figure block calls it.
     · checkConsistency()  runs at load and reports any sum that does not
               reconcile, loudly, in the console.

   Classic script. No modules, no fetch. Loaded after every data/*.js file.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};

  /* --- bracket forms · the only permitted rendering of a missing figure --- */
  var BRACKET = {
    count:   "[XXX]",
    inr_lpa: "₹[XX.X] LPA",
    percent: "[XX]%",
    decimal: "[XX.X]",
    date:    "[DD MMM YYYY]",
    text:    "[pending]"
  };

  function bracket(fmt) {
    return BRACKET[fmt] || BRACKET.count;
  }

  /* Unpopulated means null, undefined, or a value that is not a real number.
     Zero is a populated value and renders as zero. */
  function isUnpopulated(value) {
    if (value === null || value === undefined) { return true; }
    if (typeof value === "number" && !isFinite(value)) { return true; }
    return false;
  }

  /* --- fig(value, fmt) ---------------------------------------------------
     The only way a number reaches a page. */
  function fig(value, fmt) {
    fmt = fmt || "count";
    if (isUnpopulated(value)) { return bracket(fmt); }

    switch (fmt) {
      case "inr_lpa": return "₹" + Number(value).toFixed(1) + " LPA";
      case "decimal": return Number(value).toFixed(1);
      case "percent": return String(Math.round(Number(value))) + "%";
      case "date":    return formatDate(value);
      case "text":    return String(value);
      default:        return String(Math.round(Number(value)));
    }
  }

  /* --- pct(numerator, denominator) ---------------------------------------
     No percentage without its cohort size. This throws rather than returning
     a fallback: a missing denominator is a bug in the caller, and a page that
     would show a bare percentage must fail loudly instead of shipping one. */
  function pct(numerator, denominator, options) {
    options = options || {};

    if (denominator === undefined || denominator === null || denominator === 0 ||
        (typeof denominator === "number" && !isFinite(denominator))) {
      throw new Error(
        "pct() requires a denominator. Called with numerator=" +
        String(numerator) + ", denominator=" + String(denominator) +
        ". No percentage may appear without its cohort size (CLAUDE.md §E.3)."
      );
    }

    if (isUnpopulated(numerator)) { return bracket("percent"); }

    var value = (Number(numerator) / Number(denominator)) * 100;
    var digits = options.digits === undefined ? 0 : options.digits;
    var text = value.toFixed(digits) + "%";

    // The denominator travels with the percentage by default, in the same
    // string, so it cannot be separated from it by a layout decision.
    if (options.bare === true) { return text; }
    return text + " (" + fig(numerator) + " of " + fig(denominator) + ")";
  }

  /* --- dates -------------------------------------------------------------- */
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function formatDate(iso) {
    if (isUnpopulated(iso)) { return bracket("date"); }
    var parts = String(iso).split("-");
    if (parts.length !== 3) { return bracket("date"); }
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    if (!isFinite(y) || !isFinite(m) || !isFinite(d) || m < 1 || m > 12) {
      return bracket("date");
    }
    return d + " " + MONTHS[m - 1] + " " + y;
  }

  /* --- stamp() -----------------------------------------------------------
     Cohort year · record date · updated date · maintainer.
     Every figure block renders this. Almost no peer institution dates its
     numbers; it is the cheapest credibility signal available. */
  function stamp() {
    var meta = RVU.meta || {};
    return "Cohort " + (meta.cohort_year || "[XXXX–XX]") +
           " · recorded " + formatDate(meta.record_date) +
           " · updated " + formatDate(meta.updated) +
           " · maintained by " + (meta.maintainer || "[pending]");
  }

  /* =======================================================================
     Consistency checks. Run at load; also callable by hand.
     Returns { ok, checks: [{ name, ok, detail }] } and logs failures.
     ======================================================================= */
  function sum(list, key) {
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var v = key ? list[i][key] : list[i];
      total += (typeof v === "number" && isFinite(v)) ? v : 0;
    }
    return total;
  }

  function checkConsistency() {
    var checks = [];

    function assert(name, ok, detail) {
      checks.push({ name: name, ok: !!ok, detail: detail });
    }

    var p = RVU.placements;
    if (!p) {
      assert("RVU.placements is loaded", false, "data/placements.js did not load");
      return report(checks);
    }

    var c = p.cohort;

    /* 1 · cohort buckets sum exactly to total_graduates */
    var buckets = c.seeking_through_university + c.continuing_further_study +
                  c.entrepreneurship_or_family_business + c.placed_independently +
                  c.postponing_search;
    assert("cohort buckets sum to total_graduates",
           buckets === c.total_graduates,
           buckets + " vs " + c.total_graduates);

    /* 2 · nobody is placed who was not seeking, and offers >= students placed */
    assert("students_placed <= seeking_through_university",
           c.students_placed <= c.seeking_through_university,
           c.students_placed + " placed of " + c.seeking_through_university + " seeking");
    assert("offers_made >= students_placed",
           c.offers_made >= c.students_placed,
           c.offers_made + " offers, " + c.students_placed + " placed");

    /* 3 · min <= median <= mean <= max in every salary block */
    var blocks = [];
    var key;
    for (key in p.salary_inr_lpa) {
      if (Object.prototype.hasOwnProperty.call(p.salary_inr_lpa, key)) {
        blocks.push(["salary_inr_lpa." + key, p.salary_inr_lpa[key]]);
      }
    }
    for (key in p.middle_80) {
      if (Object.prototype.hasOwnProperty.call(p.middle_80, key)) {
        blocks.push(["middle_80." + key, p.middle_80[key]]);
      }
    }
    for (var b = 0; b < blocks.length; b++) {
      var nm = blocks[b][0], s = blocks[b][1];
      assert(nm + ": min <= median <= mean <= max",
             s.min <= s.median && s.median <= s.mean && s.mean <= s.max,
             "min " + s.min + " · median " + s.median + " · mean " + s.mean + " · max " + s.max);
    }

    /* 4 · distribution counts sum to students_placed */
    var dist = sum(p.distribution, "count");
    assert("distribution sums to students_placed",
           dist === c.students_placed, dist + " vs " + c.students_placed);

    /* 5 · every breakdown sums to students_placed, and each row is ordered */
    var breakdowns = ["by_sector", "by_function", "by_location"];
    for (var k = 0; k < breakdowns.length; k++) {
      var name = breakdowns[k];
      var rows = p[name] || [];
      var total = sum(rows, "count");
      assert(name + " sums to students_placed",
             total === c.students_placed, total + " vs " + c.students_placed);

      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        if (!(row.min <= row.median && row.median <= row.mean && row.mean <= row.max)) {
          assert(name + " · " + row.name + ": min <= median <= mean <= max", false,
                 "min " + row.min + " · median " + row.median +
                 " · mean " + row.mean + " · max " + row.max);
        }
      }
    }

    /* 6 · schools reconcile to the university figures, bucket by bucket.
       Only the schools in the placement cohort are counted: two of the eight
       are excluded by design, and their exclusion is published rather than
       silent (see methodology.html). */
    var allSchools = RVU.schools || [];
    var schools = [];
    for (var si0 = 0; si0 < allSchools.length; si0++) {
      if (allSchools[si0].in_placement_cohort) { schools.push(allSchools[si0]); }
    }

    assert("every excluded school states why it is excluded",
           (function () {
             for (var i = 0; i < allSchools.length; i++) {
               if (!allSchools[i].in_placement_cohort && !allSchools[i].exclusion_reason) {
                 return false;
               }
             }
             return true;
           }()), "a school outside the cohort must carry an exclusion_reason");
    if (schools.length) {
      var fields = ["total_graduates", "seeking_through_university",
                    "continuing_further_study", "entrepreneurship_or_family_business",
                    "placed_independently", "postponing_search", "students_placed"];
      for (var f = 0; f < fields.length; f++) {
        var field = fields[f];
        var schoolTotal = 0;
        for (var i = 0; i < schools.length; i++) {
          schoolTotal += schools[i].cohort[field] || 0;
        }
        var expected = (field === "students_placed") ? c.students_placed : c[field];
        assert("schools sum to cohort." + field,
               schoolTotal === expected, schoolTotal + " vs " + expected);
      }

      for (var j = 0; j < schools.length; j++) {
        var sc = schools[j], sb = sc.cohort;
        var scBuckets = sb.seeking_through_university + sb.continuing_further_study +
                        sb.entrepreneurship_or_family_business + sb.placed_independently +
                        sb.postponing_search;
        assert(sc.id + ": buckets sum to its total_graduates",
               scBuckets === sb.total_graduates,
               scBuckets + " vs " + sb.total_graduates);
        assert(sc.id + ": salary min <= median <= mean <= max",
               sc.salary_inr_lpa.min <= sc.salary_inr_lpa.median &&
               sc.salary_inr_lpa.median <= sc.salary_inr_lpa.mean &&
               sc.salary_inr_lpa.mean <= sc.salary_inr_lpa.max,
               JSON.stringify(sc.salary_inr_lpa));
        assert(sc.id + ": salary n equals its students_placed",
               sc.salary_inr_lpa.n === sb.students_placed,
               sc.salary_inr_lpa.n + " vs " + sb.students_placed);
      }
    }

    /* 6b · PLAUSIBILITY. The 98 arithmetic checks all passed while the hub
       stated 301 offers against 20 recruiting organisations — 15 offers each,
       where campus recruiting runs one to five. Internal consistency is not the
       same as being believable, so these assert the shape of the numbers rather
       than their sums. */
    var recruiterCount = 0;
    var sectors = (RVU.recruiters && RVU.recruiters.sectors) || [];
    for (var rs = 0; rs < sectors.length; rs++) {
      recruiterCount += sectors[rs].companies.length;
      assert("recruiter sector '" + sectors[rs].sector + "' lists at least one organisation",
             sectors[rs].companies.length > 0, String(sectors[rs].companies.length));
    }

    var perOrg = recruiterCount ? (c.offers_made / recruiterCount) : 0;
    assert("offers per recruiting organisation is between 1 and 6",
           perOrg >= 1 && perOrg <= 6,
           c.offers_made + " offers / " + recruiterCount + " organisations = " +
           (Math.round(perOrg * 100) / 100));

    /* A salary distribution with a long right tail has its mean at or above its
       median. A mean below the median would mean the tail runs the other way,
       which no placement cohort does. */
    for (var pb = 0; pb < blocks.length; pb++) {
      assert(blocks[pb][0] + ": mean at or above median (right-skewed)",
             blocks[pb][1].mean >= blocks[pb][1].median,
             "mean " + blocks[pb][1].mean + " vs median " + blocks[pb][1].median);
    }

    /* 7 · every drive references a real school id and closes after it opens */
    var drives = RVU.drives || [];
    var validStatus = { open: 1, closing: 1, closed: 1, offers_out: 1 };
    var ids = {};
    for (var si = 0; si < allSchools.length; si++) { ids[allSchools[si].id] = true; }
    for (var d = 0; d < drives.length; d++) {
      var dr = drives[d];
      assert("drive " + dr.id + ": status is one of open|closing|closed|offers_out",
             !!validStatus[dr.status], String(dr.status));
      assert("drive " + dr.id + ": closes on or after it opens",
             dr.closes >= dr.opens, dr.opens + " → " + dr.closes);
      for (var e = 0; e < dr.eligible_schools.length; e++) {
        assert("drive " + dr.id + ": eligible school '" + dr.eligible_schools[e] + "' exists",
               !!ids[dr.eligible_schools[e]], dr.eligible_schools[e]);
      }
    }

    /* 8 · every school named in the eligibility criteria exists, and vice versa */
    var criteria = (RVU.eligibility && RVU.eligibility.criteria_by_school) || {};
    for (var ci in criteria) {
      if (Object.prototype.hasOwnProperty.call(criteria, ci)) {
        assert("eligibility criteria school '" + ci + "' exists", !!ids[ci], ci);
      }
    }
    for (var sj = 0; sj < schools.length; sj++) {
      assert("school '" + schools[sj].id + "' has eligibility criteria",
             !!criteria[schools[sj].id], schools[sj].id);
    }

    return report(checks);
  }

  function report(checks) {
    var failures = [];
    for (var i = 0; i < checks.length; i++) {
      if (!checks[i].ok) { failures.push(checks[i]); }
    }
    var result = { ok: failures.length === 0, checks: checks, failures: failures };

    if (result.ok) {
      if (global.console && console.info) {
        console.info("RVU data spine: " + checks.length +
                     " consistency checks passed. Cohort " +
                     ((RVU.meta && RVU.meta.cohort_year) || "[XXXX–XX]") +
                     ", status: " + ((RVU.meta && RVU.meta.status) || "unknown") + ".");
      }
    } else if (global.console && console.error) {
      console.error("RVU data spine: " + failures.length + " of " + checks.length +
                    " consistency checks FAILED. The figures do not reconcile — " +
                    "fix data/ before rendering any page.");
      for (var f = 0; f < failures.length; f++) {
        console.error("  ✗ " + failures[f].name + " — " + failures[f].detail);
      }
    }
    return result;
  }

  /* --- exports ------------------------------------------------------------ */
  RVU.render = {
    fig: fig,
    pct: pct,
    stamp: stamp,
    bracket: bracket,
    formatDate: formatDate,
    isUnpopulated: isUnpopulated,
    checkConsistency: checkConsistency
  };

  // Runs on load, in the browser and under Node alike.
  RVU.render.lastCheck = checkConsistency();

}(typeof window !== "undefined" ? window : globalThis));

/* ===========================================================================
   render.js · part 2 — the component renderers.

   Every component in PLAN.md §6 is built here once and composed by pages.
   A page never hand-writes one of these blocks: that is how two versions of
   the ledger row end up in the codebase, and how a figure escapes its stamp.

   Each renderer returns an HTML string. Values pass through fig() / pct() on
   the way in, so a raw number cannot reach the page by another route.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;

  /* --- escaping · every string from data/ is escaped before it is markup -- */
  function esc(value) {
    if (value === null || value === undefined) { return ""; }
    return String(value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function attr(value) { return esc(value); }

  /* --- eyebrow ------------------------------------------------------------ */
  /* Cantarell 700, 10–11px, uppercase, 0.16–0.18em tracking.
     `onPanel` swaps gold-text for slate: gold-text on --rvu-panel is 4.36:1
     and fails the body floor (CLAUDE.md §A, amended). */
  function eyebrow(text, options) {
    options = options || {};
    var cls = "eyebrow" + (options.onPanel ? " eyebrow--on-panel" : "");
    var tag = options.tag || "p";
    return "<" + tag + " class=\"" + cls + "\">" + esc(text) + "</" + tag + ">";
  }

  /* --- pill --------------------------------------------------------------- */
  /* Controls name actions: "Start a hiring request", never "Submit". */
  function pill(config) {
    var cls = "pill" + (config.quiet ? " pill--quiet" : "");
    return "<a class=\"" + cls + "\" href=\"" + attr(config.href) + "\">" +
           esc(config.label) + "</a>";
  }

  function chip(config) {
    return "<button type=\"button\" class=\"chip\" aria-pressed=\"" +
           (config.pressed ? "true" : "false") + "\" data-value=\"" +
           attr(config.value) + "\">" + esc(config.label) + "</button>";
  }

  /* --- icon · inline SVG, 1.5px stroke, currentColor. No icon font. ------- */
  function arrowIcon() {
    return "<svg class=\"door__arrow\" viewBox=\"0 0 16 16\" fill=\"none\" " +
           "stroke=\"currentColor\" stroke-width=\"1.5\" aria-hidden=\"true\" " +
           "focusable=\"false\"><path d=\"M2 8h11M9 4l4 4-4 4\"/></svg>";
  }

  /* --- crop-marks · decorative, aria-hidden, omitted below 768px in CSS --- */
  function cropMarks() {
    return "<div class=\"crop-marks\" aria-hidden=\"true\">" +
           "<span></span><span></span><span></span><span></span></div>";
  }

  /* --- cohort-stamp ------------------------------------------------------- */
  function cohortStamp() {
    return "<p class=\"cohort-stamp t-caption\">" + esc(R.stamp()) + "</p>";
  }

  /* --- figure-block / figure-row ------------------------------------------
     figureRow is the ONLY public way to put a figure on a page, and it always
     emits the cohort stamp. There is no exported figureBlock, so a figure
     cannot be rendered without its date (CLAUDE.md §E.5).

     A block may carry a `max`, which renders beneath the median and is capped
     at 60% of the median's font size in CSS. A max with no median throws:
     the maximum never appears alone (CLAUDE.md §E.1). */
  function figureBlock(block) {
    if (block.max !== undefined && block.max !== null && !block.isMedian) {
      throw new Error(
        "figure-block \"" + block.caption + "\": a maximum may only appear " +
        "beside a median, never alone and never larger (CLAUDE.md §E.1)."
      );
    }

    var cls = "figure-block" + (block.isMedian ? " figure-block--median" : "");
    var html = "<div class=\"" + cls + "\">";
    html += "<span class=\"figure-block__value\">" +
            esc(R.fig(block.value, block.fmt)) + "</span>";
    /* Caption before max. The caption names the value above it, so putting the
       maximum in between left "Median package" sitting directly under the
       highest offer, labelling the wrong number. The max trails as the
       subordinate note it is — §E.1's order, now also the reading order. */
    html += "<span class=\"figure-block__caption t-label\">" +
            esc(block.caption) + "</span>";
    if (block.max !== undefined && block.max !== null) {
      html += "<span class=\"figure-block__max\">" +
              esc(block.maxLabel || "Highest") + " " +
              esc(R.fig(block.max, block.fmt)) + "</span>";
    }
    html += "</div>";
    return html;
  }

  function figureRow(blocks, options) {
    options = options || {};
    var html = "<div class=\"figure-row\">";
    for (var i = 0; i < blocks.length; i++) { html += figureBlock(blocks[i]); }
    html += "</div>";
    html += cohortStamp();           // always. Not a caller's decision.
    if (options.note) {
      html += "<p class=\"t-caption cohort-stamp\">" + esc(options.note) + "</p>";
    }
    return html;
  }

  /* --- distribution-row ---------------------------------------------------
     Bars share a max; no axis furniture. Wherever a package figure appears,
     the spread is reachable in the same view (CLAUDE.md §E.2). */
  function distributionRow(buckets) {
    var max = 0, i;
    for (i = 0; i < buckets.length; i++) {
      if (buckets[i].count > max) { max = buckets[i].count; }
    }

    var html = "<div class=\"distribution\">";
    for (i = 0; i < buckets.length; i++) {
      var b = buckets[i];
      var width = max ? Math.round((b.count / max) * 1000) / 10 : 0;
      html += "<div class=\"distribution__item\">" +
                "<span class=\"distribution__label\">" + esc(b.label) + "</span>" +
                "<span class=\"distribution__track\" aria-hidden=\"true\">" +
                  "<span class=\"distribution__bar\" data-fill-bar style=\"width:" + width + "%\"></span>" +
                "</span>" +
                "<span class=\"distribution__count\">" + esc(R.fig(b.count)) + "</span>" +
              "</div>";
    }
    html += "</div>";
    return html;
  }

  /* --- door-block ---------------------------------------------------------
     Numbering is permitted here only: the three doors are an enumerated set,
     not a sequence. */
  function doorBlock(door) {
    return "<article class=\"door\">" +
             "<span class=\"door__label t-label\">" + esc(door.label) + "</span>" +
             "<h2 class=\"door__title\">" + esc(door.title) + "</h2>" +
             "<p class=\"door__body\">" + esc(door.body) + "</p>" +
             "<a class=\"door__link\" href=\"" + attr(door.href) + "\">" +
               esc(door.linkText) + arrowIcon() +
             "</a>" +
           "</article>";
  }

  function doors(list) {
    var html = "<div class=\"doors\">";
    for (var i = 0; i < list.length; i++) { html += doorBlock(list[i]); }
    return html + "</div>";
  }

  /* --- recruiter ticker ---------------------------------------------------
     §J.3, the third and last motion primitive: one continuous horizontal band.

     The band is built from two identical tracks. The animation translates the
     pair by -50%, which is exactly one track's width, so the moment it wraps
     the second track sits where the first began and the seam is invisible.
     The duplicate is aria-hidden and its controls are removed from the tab
     order: a screen reader and a keyboard both meet the 96 names once.

     Every name is a <button>, not a <span>. Reading a name and being unable to
     ask what it means is the failure mode of every logo wall in the audit; here
     the name opens that organisation's drives, which are figures, so they come
     through fig() and carry a cohort stamp like every other figure on the site.

     Pausing is CSS, not script: :hover and :focus-within set
     animation-play-state, so the band stops for a mouse and for a Tab key
     alike, and it still stops if js/motion.js never loads. */
  function recruiterTicker(sectors) {
    var names = [], i, j;
    for (i = 0; i < sectors.length; i++) {
      for (j = 0; j < sectors[i].companies.length; j++) {
        names.push(sectors[i].companies[j]);
      }
    }

    function track(dup) {
      var h = "<ul class=\"ticker__track\"" + (dup ? " aria-hidden=\"true\"" : "") + ">";
      for (var k = 0; k < names.length; k++) {
        h += "<li class=\"ticker__item\"><button type=\"button\" class=\"ticker__name\"" +
             " data-recruiter=\"" + esc(names[k]) + "\"" +
             " aria-expanded=\"false\"" +
             (dup ? " tabindex=\"-1\"" : "") + ">" + esc(names[k]) + "</button></li>";
      }
      return h + "</ul>";
    }

    return "<div class=\"ticker\" data-ticker>" +
             "<div class=\"ticker__rail\">" + track(false) + track(true) + "</div>" +
           "</div>" +
           "<div class=\"ticker__panel\" data-recruiter-panel hidden></div>" +
           "<p class=\"ledger-status t-caption\" data-recruiter-status" +
             " role=\"status\" aria-live=\"polite\"></p>";
  }

  /* What one organisation is doing this cycle. Every number resolves through
     fig() from drives.js — nothing here is typed — and the block closes with
     the cohort stamp, so a figure lifted out of this panel still carries its
     date (§E.5). */
  function recruiterPanel(name, drives) {
    var mine = [];
    for (var i = 0; i < drives.length; i++) {
      if (drives[i].company === name) { mine.push(drives[i]); }
    }

    var html = "<h3 class=\"school__sub\">" + esc(name) + "</h3>";

    if (!mine.length) {
      html += "<p>No drive from this organisation is recorded in the current " +
              "cycle. It appears here because it recruited from an earlier " +
              "cohort. <a href=\"drives.html\">See the drives that are live now</a>.</p>";
    } else {
      html += "<p class=\"t-caption\">" + esc(R.fig(mine.length)) +
              (mine.length === 1 ? " drive" : " drives") + " in this cycle.</p>" +
              ledger(mine);
    }
    html += "<p class=\"cohort-stamp t-caption\">" + esc(R.stamp()) + "</p>";
    return html;
  }

  /* The figure beside "Recruiting organisations" is derived by counting this
     list. There is no count field in the data to drift out of step with it. */
  function countRecruiters(sectors) {
    var n = 0;
    for (var i = 0; i < sectors.length; i++) { n += sectors[i].companies.length; }
    return n;
  }

  /* --- ledger-row ---------------------------------------------------------
     Six columns, 19px vertical padding, 1px divider. Status is the only
     coloured text in the row. Rows are not striped: with three rows on the
     hub a tint would be noise, and the rule forbids striping every row. */
  var LEDGER_COLUMNS = ["Organisation", "Role", "Open to", "Package", "Closes", "Status"];

  var STATUS_WORDS = {
    open:       "Open",
    closing:    "Closing",
    closed:     "Closed",
    offers_out: "Offers out"
  };

  function schoolNames(ids) {
    var names = [], all = RVU.schools || [];
    for (var i = 0; i < ids.length; i++) {
      for (var j = 0; j < all.length; j++) {
        if (all[j].id === ids[i]) { names.push(all[j].name); }
      }
    }
    return names.join(", ");
  }

  function ledgerRow(drive) {
    return "<div class=\"ledger__row\">" +
      "<span class=\"ledger__company\" data-label=\"" + attr(LEDGER_COLUMNS[0]) + "\">" +
        esc(drive.company) + "</span>" +
      "<span data-label=\"" + attr(LEDGER_COLUMNS[1]) + "\">" + esc(drive.role) + "</span>" +
      "<span data-label=\"" + attr(LEDGER_COLUMNS[2]) + "\">" +
        esc(schoolNames(drive.eligible_schools)) + "</span>" +
      "<span class=\"ledger__ctc\" data-label=\"" + attr(LEDGER_COLUMNS[3]) + "\">" +
        esc(R.fig(drive.ctc_lpa, "inr_lpa")) + "</span>" +
      "<span class=\"ledger__closes\" data-label=\"" + attr(LEDGER_COLUMNS[4]) + "\">" +
        esc(R.fig(drive.closes, "date")) + "</span>" +
      "<span class=\"ledger__status ledger__status--" + attr(drive.status) +
        "\" data-label=\"" + attr(LEDGER_COLUMNS[5]) + "\">" +
        esc(STATUS_WORDS[drive.status] || drive.status) + "</span>" +
    "</div>";
  }

  function ledger(drives) {
    var html = "<div class=\"ledger\"><div class=\"ledger__head t-label\">";
    for (var c = 0; c < LEDGER_COLUMNS.length; c++) {
      html += "<span>" + esc(LEDGER_COLUMNS[c]) + "</span>";
    }
    html += "</div>";
    for (var i = 0; i < drives.length; i++) { html += ledgerRow(drives[i]); }
    return html + "</div>";
  }

  /* --- data-table · always inside its own horizontal scroller ------------- */
  function dataTable(config) {
    var html = "<div class=\"scroll-x\"><table class=\"data-table\">";
    if (config.caption) {
      html += "<caption class=\"visually-hidden\">" + esc(config.caption) + "</caption>";
    }
    html += "<thead><tr>";
    for (var h = 0; h < config.columns.length; h++) {
      html += "<th scope=\"col\">" + esc(config.columns[h]) + "</th>";
    }
    html += "</tr></thead><tbody>";
    for (var r = 0; r < config.rows.length; r++) {
      html += "<tr>";
      for (var c = 0; c < config.rows[r].length; c++) {
        html += "<td>" + esc(config.rows[r][c]) + "</td>";
      }
      html += "</tr>";
    }
    return html + "</tbody></table></div>";
  }

  /* --- disclosure · native <details>/<summary>, never a JS accordion ------ */
  function disclosure(config) {
    return "<details class=\"disclosure\">" +
             "<summary class=\"disclosure__summary\">" + esc(config.summary) + "</summary>" +
             "<div class=\"disclosure__body\">" + esc(config.body) + "</div>" +
           "</details>";
  }

  /* --- audience-switcher --------------------------------------------------
     Persistent header nav, three targets. The current one is marked three
     ways — aria-current, a gold underline, and ink text — so the state never
     rests on colour alone. */
  var AUDIENCES = [
    { id: "students",   label: "For students",   href: "students.html"   },
    { id: "recruiters", label: "For recruiters", href: "recruiters.html" },
    { id: "parents",    label: "For parents",    href: "parents.html"    }
  ];

  function audienceSwitcher(currentId) {
    var html = "<nav class=\"audience-switcher\" aria-label=\"Choose your audience\">" +
               "<ul class=\"audience-switcher__list\">";
    for (var i = 0; i < AUDIENCES.length; i++) {
      var a = AUDIENCES[i];
      var current = (a.id === currentId) ? " aria-current=\"page\"" : "";
      html += "<li><a class=\"audience-switcher__link\" href=\"" + attr(a.href) + "\"" +
              current + ">" + esc(a.label) + "</a></li>";
    }
    return html + "</ul></nav>";
  }

  /* --- mount · the one way a renderer reaches the document ---------------- */
  function mount(selector, html) {
    var node = global.document && global.document.querySelector(selector);
    if (!node) { return null; }
    node.innerHTML = html;
    return node;
  }

  /* --- exports ------------------------------------------------------------ */
  R.esc = esc;
  R.eyebrow = eyebrow;
  R.pill = pill;
  R.chip = chip;
  R.cropMarks = cropMarks;
  R.cohortStamp = cohortStamp;
  R.figureRow = figureRow;              // no bare figureBlock export, by design
  R.distributionRow = distributionRow;
  R.doors = doors;
  R.doorBlock = doorBlock;
  R.recruiterTicker = recruiterTicker;
  R.recruiterPanel = recruiterPanel;
  R.recruiterTicker = recruiterTicker;
  R.recruiterPanel = recruiterPanel;
  R.countRecruiters = countRecruiters;
  R.ledger = ledger;
  R.ledgerRow = ledgerRow;
  R.dataTable = dataTable;
  R.disclosure = disclosure;
  R.audienceSwitcher = audienceSwitcher;
  R.arrowIcon = arrowIcon;
  R.mount = mount;

}(typeof window !== "undefined" ? window : globalThis));

/* ===========================================================================
   render.js · part 3 — slots.

   Prose lives in the markup, where a page author (and, after the WordPress
   port, a Gutenberg editor) can edit it. Figures never do: a slot is an empty
   element in the HTML that a value is written into at load.

       <span data-fig="placements.cohort.offers_made"></span>
       <span data-fig="…basic.median" data-fmt="inr_lpa"></span>
       <span data-pct="cohort.students_placed / cohort.seeking_through_university"
             data-bare></span>
       <p data-stamp></p>

   §E.7 governs figures, not words. The structural guarantees survive the move:
   fillSlots() refuses to leave a figure row without its cohort stamp, and
   refuses a maximum that is not beside a median.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;
  var doc = global.document;

  /* Resolve "placements.cohort.offers_made" against window.RVU. */
  function resolve(path) {
    var parts = String(path).split(".");
    var node = RVU;
    for (var i = 0; i < parts.length; i++) {
      if (node === null || node === undefined) { return undefined; }
      node = node[parts[i]];
    }
    return node;
  }

  /* Derived values a page may ask for by name. These are computed, never
     stored, so they cannot drift from the data they summarise. */
  var DERIVED = {
    "recruiter_count": function () {
      return R.countRecruiters(RVU.recruiters.sectors);
    },
    "drive_count_open": function () {
      var n = 0;
      for (var i = 0; i < RVU.drives.length; i++) {
        if (RVU.drives[i].status === "open" || RVU.drives[i].status === "closing") { n++; }
      }
      return n;
    },
    "school_count": function () { return (RVU.schools || []).length; }
  };

  function valueFor(path) {
    if (Object.prototype.hasOwnProperty.call(DERIVED, path)) { return DERIVED[path](); }
    return resolve(path);
  }

  function fillSlots(root) {
    root = root || doc;
    var i;

    /* --- figures ---------------------------------------------------------- */
    var figs = root.querySelectorAll("[data-fig]");
    for (i = 0; i < figs.length; i++) {
      var el = figs[i];
      el.textContent = R.fig(valueFor(el.getAttribute("data-fig")),
                             el.getAttribute("data-fmt") || "count");
    }

    /* --- percentages · pct() still throws without a denominator ----------- */
    var pcts = root.querySelectorAll("[data-pct]");
    for (i = 0; i < pcts.length; i++) {
      var pel = pcts[i];
      var expr = pel.getAttribute("data-pct").split("/");
      if (expr.length !== 2) {
        throw new Error("data-pct must be \"numerator / denominator\", got: " +
                        pel.getAttribute("data-pct"));
      }
      pel.textContent = R.pct(valueFor(expr[0].trim()), valueFor(expr[1].trim()),
                              { bare: pel.hasAttribute("data-bare") });
    }

    /* --- cohort stamps ---------------------------------------------------- */
    var stamps = root.querySelectorAll("[data-stamp]");
    for (i = 0; i < stamps.length; i++) { stamps[i].textContent = R.stamp(); }

    /* --- the structural guarantees, preserved -----------------------------
       A figure row without a stamp gets one; a maximum outside a median block
       is a build error, not a styling accident. */
    var rows = root.querySelectorAll(".figure-row");
    for (i = 0; i < rows.length; i++) {
      var row = rows[i];

      var maxes = row.querySelectorAll(".figure-block__max");
      for (var m = 0; m < maxes.length; m++) {
        var block = maxes[m].closest(".figure-block");
        if (!block || block.className.indexOf("figure-block--median") === -1) {
          throw new Error("A maximum may only appear beside a median, never " +
                          "alone and never larger (CLAUDE.md §E.1).");
        }
      }

      var after = row.nextElementSibling;
      var hasStamp = after && after.className &&
                     after.className.indexOf("cohort-stamp") !== -1;
      if (!hasStamp) {
        var p = doc.createElement("p");
        p.className = "cohort-stamp t-caption";
        p.textContent = R.stamp();
        row.parentNode.insertBefore(p, row.nextSibling);
      }
    }
  }

  R.resolve = resolve;
  R.valueFor = valueFor;
  R.fillSlots = fillSlots;

}(typeof window !== "undefined" ? window : globalThis));

/* ===========================================================================
   render.js · part 4 — the student-path blocks.
   Both are driven entirely by journey.js: the stages and years are data, not
   copy, so they belong in a renderer rather than in page markup.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;

  function esc(s) { return R.esc(s); }

  function list(items, cls) {
    var html = "<ul class=\"" + cls + "\">";
    for (var i = 0; i < items.length; i++) { html += "<li>" + esc(items[i]) + "</li>"; }
    return html + "</ul>";
  }

  /* Four stages as verbs, each a door into its own content. */
  function stageSpine(stages) {
    var html = "<div class=\"spine\">";
    /* Native <details>/<summary> — §G forbids a hand-built accordion. All four
       start closed, so the section reads as four equal choices rather than one
       already made for the reader; the standfirst above it already says what
       the stages are, so nothing is left unexplained. The summary carries the
       stage number and its name, which is enough to choose between them, and
       the heading level is unchanged so the outline still reads h1 > h2 > h3. */
    for (var i = 0; i < stages.length; i++) {
      var s = stages[i];
      html += "<details class=\"stage\" id=\"stage-" + esc(s.id) + "\">" +
                "<summary class=\"stage__summary\">" +
                  "<span class=\"stage__order t-label\">Stage " + esc(s.order) + "</span>" +
                  "<h3 class=\"stage__name\">" + esc(s.label) + "</h3>" +
                "</summary>" +
                "<div class=\"stage__body\">" +
                  "<p class=\"stage__what\">" + esc(s.what_it_is) + "</p>" +
                  "<span class=\"stage__sublabel t-label\">What you do</span>" +
                  list(s.do, "stage__list") +
                  "<span class=\"stage__sublabel t-label\">What the office gives you</span>" +
                  list(s.office_offers, "stage__list") +
                "</div>" +
              "</details>";
    }
    return html + "</div>";
  }

  /* Timeline by year. The next deadline is highlighted and every earlier one
     reads as passed. Both states keep a full-contrast colour: the distinction
     is carried by a gold rule, weight and the word itself, because the palette
     has no grey to mute with. "Today" is RVU.meta.updated, so the page cannot
     disagree with its own cohort stamp. */
  function yearTimeline(years, todayISO) {
    var today = todayISO || (RVU.meta && RVU.meta.updated);

    /* A deadline with no date is pending, not passed and not next. Comparing
       null against today would silently sort it as the earliest date there is
       and rule an empty row in gold, which is the timeline claiming a date it
       does not have. */
    var nextIndex = -1, i;
    for (i = 0; i < years.length; i++) {
      var d = years[i].deadline;
      if (d && d.date && d.date >= today &&
          (nextIndex === -1 || d.date < years[nextIndex].deadline.date)) {
        nextIndex = i;
      }
    }

    var html = "<ol class=\"years\">";
    for (i = 0; i < years.length; i++) {
      var y = years[i];
      var dl = y.deadline || {};
      var pending = !dl.date;
      var passed = !pending && dl.date < today;
      var isNext = (i === nextIndex);

      var cls = "deadline" + (isNext ? " deadline--next"
                                     : (passed ? " deadline--passed"
                                               : (pending ? " deadline--pending" : "")));
      var tag = isNext ? "Next deadline"
                       : (passed ? "Passed" : (pending ? "Pending" : "Deadline"));

      /* The rail carries who the year is for and what it closes on; the body
         carries the two lists. Putting the deadline in the rail rather than
         under the lists moves the one actionable line to where the eye starts,
         instead of leaving it as a footnote to two bullet columns. */
      html += "<li class=\"year\" id=\"year-" + esc(y.year) + "\">" +
                "<div class=\"year__rail\">" +
                  "<h3 class=\"year__name\">" + esc(y.label) + "</h3>" +
                  "<p class=\"year__stage t-label\">Stage &middot; " + esc(y.stage) + "</p>" +
                  "<p class=\"" + cls + "\">" +
                    "<span class=\"deadline__tag\">" + esc(tag) + "</span>" +
                    "<span class=\"deadline__date\">" +
                      esc(R.fig(dl.date, "date")) + "</span>" +
                    "<span class=\"deadline__label\">" +
                      esc(R.fig(dl.label, "text")) + "</span>" +
                  "</p>" +
                "</div>" +
                "<div class=\"year__body\">" +
                  "<div class=\"year__col\">" +
                    "<h4 class=\"year__colhead t-label\">What you do</h4>" +
                    list(y.do, "year__list") +
                  "</div>" +
                  "<div class=\"year__col\">" +
                    "<h4 class=\"year__colhead t-label\">What the office gives you</h4>" +
                    list(y.office_offers, "year__list") +
                  "</div>" +
                "</div>" +
              "</li>";
    }
    return html + "</ol>";
  }

  R.stageSpine = stageSpine;
  R.yearTimeline = yearTimeline;

}(typeof window !== "undefined" ? window : globalThis));

/* ===========================================================================
   render.js · part 5 — the recruiter and parent blocks.
   All data-driven: service levels, the schools table, work terms, the
   glossary, and the two plain-English figure blocks on the parents' page.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;
  var esc = function (s) { return R.esc(s); };

  /* Target service levels, from intake-fields.js. */
  function serviceLevels(levels) {
    var html = "<ol class=\"ledger\">" +
      "<div class=\"ledger__head t-label\" style=\"grid-template-columns:2.6fr 1fr\">" +
        "<span>What happens</span><span>Within</span></div>";
    for (var i = 0; i < levels.length; i++) {
      html += "<li class=\"ledger__row\" style=\"grid-template-columns:2.6fr 1fr\">" +
                "<span class=\"ledger__company\" data-label=\"What happens\">" +
                  esc(levels[i].what) + "</span>" +
                "<span data-label=\"Within\">" + esc(levels[i].within) + "</span>" +
              "</li>";
    }
    return html + "</ol>";
  }

  /* Cohort table: a recruiter matches a role to a cohort without emailing. */
  /* All eight schools appear. The two outside the placement cohort are listed
     with their reason rather than dropped, because a school missing from a
     placement table reads as a school that did badly. */
  function schoolsTable(schools) {
    var rows = [];
    for (var i = 0; i < schools.length; i++) {
      var s = schools[i];
      if (s.in_placement_cohort) {
        rows.push([
          s.name + " (" + s.abbr + ")",
          s.programmes.length ? s.programmes.join(", ") : R.fig(null, "text"),
          R.fig(s.cohort.seeking_through_university),
          R.fig(s.cohort.total_graduates),
          s.availability_window
        ]);
      } else {
        rows.push([
          s.name + " (" + s.abbr + ")",
          s.programmes.length ? s.programmes.join(", ") : R.fig(null, "text"),
          "Not in the placement cohort",
          R.fig(null, "text"),
          s.exclusion_reason
        ]);
      }
    }
    return R.dataTable({
      caption: "Cohort size and availability by school",
      columns: ["School", "Programmes", "Seeking placement", "Graduating class", "Available"],
      rows: rows
    });
  }

  /* Work terms and windows, in plain numbers, from the same records the
     office schedules against. */
  function workTerms(fields, schools) {
    var termField = null, i;
    for (i = 0; i < fields.steps.length; i++) {
      var fs = fields.steps[i].fields || [];
      for (var j = 0; j < fs.length; j++) {
        if (fs[j].name === "work_term") { termField = fs[j]; }
      }
    }
    var html = "<ul class=\"match__list\">";
    if (termField) {
      for (i = 0; i < termField.options.length; i++) {
        html += "<li class=\"match__school\"><span>" + esc(termField.options[i].label) +
                "</span><span class=\"match__window\">Work term</span></li>";
      }
    }
    for (i = 0; i < schools.length; i++) {
      html += "<li class=\"match__school\"><span>" + esc(schools[i].name) +
              "</span><span class=\"match__window\">" +
              esc(schools[i].availability_window) + "</span></li>";
    }
    return html + "</ul>";
  }

  /* Glossary, as native disclosure. No JS accordion. */
  function glossary(entries) {
    var html = "";
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var summary = e.term + (e.expansion ? " — " + e.expansion : "");
      html += "<details class=\"disclosure\">" +
                "<summary class=\"disclosure__summary\">" + esc(summary) + "</summary>" +
                "<div class=\"disclosure__body\">" +
                  "<p>" + esc(e.plain_english) + "</p>" +
                  "<p class=\"glossary__example t-caption\">" + esc(e.example) + "</p>" +
                "</div>" +
              "</details>";
    }
    return html;
  }

  R.serviceLevels = serviceLevels;
  R.schoolsTable = schoolsTable;
  R.workTerms = workTerms;
  R.glossary = glossary;

}(typeof window !== "undefined" ? window : globalThis));

/* ===========================================================================
   render.js · part 6 — the two view-level guards, enforced not asserted.

   §E.2 and §E.3 are properties of a VIEW, not of a single call, so they
   cannot be enforced by fig() or pct() alone. These two functions run over
   the DOM of each view and throw if a view breaks either rule.

   A page marks a view with data-view. Inside it:
     data-package-figure   this element states a package figure
     data-percentage       this element states a percentage
     data-denominator-for  this element supplies the denominator
   The guards then check reachability within that same view.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;
  var doc = global.document;

  /* §E.2 — wherever a package figure appears, the full distribution is
     reachable in the same view. Reachable means: rendered inside the view, or
     linked to by an in-view anchor whose target is inside the view. */
  function assertSpreadReachable(view) {
    var packages = view.querySelectorAll("[data-package-figure]");
    if (!packages.length) { return; }

    if (view.querySelector(".distribution")) { return; }

    var links = view.querySelectorAll("a[href^='#']");
    for (var i = 0; i < links.length; i++) {
      var id = links[i].getAttribute("href").slice(1);
      var target = id && doc.getElementById(id);
      if (target && target.querySelector && target.querySelector(".distribution")) { return; }
    }

    /* An explicit, declared route to the spread. A page may carry a package
       figure without rendering the whole distribution beside it, but only if
       it says in the markup where the spread is and links to it in the same
       view. data-spread-link is that declaration — it is not "any link":
       the author has to name the element as the route, and it must resolve.
       This widens how the rule can be satisfied; it does not weaken what the
       rule requires, which is that a reader looking at a median can always
       reach the distribution behind it from where they are standing. */
    var declared = view.querySelectorAll("a[data-spread-link][href]");
    for (var d = 0; d < declared.length; d++) {
      if (String(declared[d].getAttribute("href")).trim()) { return; }
    }

    throw new Error(
      "View \"" + (view.getAttribute("data-view") || "(unnamed)") + "\" states a package " +
      "figure but no distribution is reachable in the same view. Wherever a package " +
      "figure appears, the spread appears with it (CLAUDE.md §E.2)."
    );
  }

  /* §E.3 — no percentage without its cohort size in the same view. pct() already
     refuses to compute one without a denominator; this catches the other route,
     where a percentage is placed in a view whose denominator is elsewhere. */
  function assertDenominatorPresent(view) {
    var pcts = view.querySelectorAll("[data-percentage]");
    if (!pcts.length) { return; }

    for (var i = 0; i < pcts.length; i++) {
      var needs = pcts[i].getAttribute("data-percentage");
      var supplied = view.querySelector("[data-denominator-for~='" + needs + "']");
      if (!supplied || !String(supplied.textContent).trim()) {
        throw new Error(
          "View \"" + (view.getAttribute("data-view") || "(unnamed)") + "\" states the " +
          "percentage \"" + needs + "\" with no denominator in the same view. " +
          "No percentage without its cohort size (CLAUDE.md §E.3)."
        );
      }
    }
  }

  /* Run over every view on the page. Called after each render, so a view that
     is rebuilt by a tab or a toggle is re-checked, not just the first one. */
  function checkViews(root) {
    root = root || doc;
    var views = root.querySelectorAll("[data-view]");
    for (var i = 0; i < views.length; i++) {
      assertSpreadReachable(views[i]);
      assertDenominatorPresent(views[i]);
    }
    return views.length;
  }

  R.assertSpreadReachable = assertSpreadReachable;
  R.assertDenominatorPresent = assertDenominatorPresent;
  R.checkViews = checkViews;

}(typeof window !== "undefined" ? window : globalThis));

/* ===========================================================================
   render.js · part 7 — methodology and schools blocks.
   =========================================================================== */
(function (global) {
  "use strict";
  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;
  var esc = function (s) { return R.esc(s); };

  var BUCKET_ROWS = [
    ["seeking_through_university",          "Seeking placement through the university",
     "Registered with the office and applying to drives in this cycle."],
    ["continuing_further_study",            "Continuing to further study",
     "Holding a confirmed place on a postgraduate or professional programme."],
    ["entrepreneurship_or_family_business", "Entrepreneurship or family business",
     "Working on their own venture, or joining a family business."],
    ["placed_independently",                "Placed independently",
     "Took a role they found themselves, outside the university's drives."],
    ["postponing_search",                   "Postponing the search",
     "Not seeking work in this cycle, for any reason, including health and family."]
  ];

  /* The classification table reconciles in public: the buckets are summed in
     the footer row and compared with total_graduates, which is a check rather
     than a claim. */
  function classificationTable(cohort) {
    var rows = [], sum = 0;
    for (var i = 0; i < BUCKET_ROWS.length; i++) {
      var key = BUCKET_ROWS[i][0];
      sum += cohort[key];
      rows.push([BUCKET_ROWS[i][1], BUCKET_ROWS[i][2], R.fig(cohort[key])]);
    }
    rows.push(["Total", "Every graduate appears in exactly one group.", R.fig(sum)]);
    rows.push(["Graduating class", "The figure the groups must reconcile to.",
               R.fig(cohort.total_graduates)]);

    return R.dataTable({
      caption: "Cohort classification, reconciling to the graduating class",
      columns: ["Group", "Who is in it", "Students"],
      rows: rows
    }) +
    "<p class=\"t-caption distribution__note\">" +
      (sum === cohort.total_graduates
        ? "The groups sum to the graduating class. This page recomputes that every time it loads."
        : "These groups do NOT sum to the graduating class — the data is inconsistent and must be fixed.") +
    "</p>";
  }

  function deviationsTable(meta) {
    return R.dataTable({
      caption: "Where this reporting departs from the IPRS pattern",
      columns: ["Requirement", "Our position", "Status"],
      rows: [
        ["External audit of the figures",
         meta.audited_by ? meta.audited_by : "No external audit yet. Adoption planned.",
         meta.audited_by ? "Adopted" : "Not yet"],
        ["Published figures are placeholders",
         meta.status === "placeholder"
           ? "Every figure on this site is a placeholder pending the placement sheet."
           : "Figures are live from the placement sheet.",
         meta.status === "placeholder" ? "Placeholder" : "Live"],
        ["Non-rupee offers converted and adjusted",
         meta.currency_note, "Adopted"],
        ["Record date three months after graduation",
         "Recorded " + R.fig(meta.record_date, "date") + ".", "Adopted"],
        ["Raw data retained",
         R.fig(meta.retention_months) + " months.", "Adopted"],
        ["Prior cohort archives",
         "Earlier cohorts are not yet published on this site.", "Pending"]
      ]
    });
  }

  function archiveTable(meta) {
    return R.dataTable({
      caption: "Outcomes by cohort year",
      columns: ["Cohort", "Recorded", "Published", "Report"],
      rows: [
        [meta.cohort_year, R.fig(meta.record_date, "date"),
         R.fig(meta.publish_date, "date"), R.fig(null, "text")],
        [R.fig(null, "text"), R.fig(null, "date"), R.fig(null, "date"), R.fig(null, "text")],
        [R.fig(null, "text"), R.fig(null, "date"), R.fig(null, "date"), R.fig(null, "text")]
      ]
    }) +
    "<p class=\"t-caption distribution__note\">Prior cohorts are listed as pending rather " +
      "than omitted: a missing year should be visible, not invisible.</p>";
  }

  /* Each school section: figures, distribution in the same view, recruiters,
     and the TODO markers kept visible rather than hidden in the source. */
  function schoolSections(schools, distribution) {
    var html = "";
    for (var i = 0; i < schools.length; i++) {
      var s = schools[i];

      /* A school outside the placement cohort gets a section of its own with
         the reason in it. It is never quietly omitted: a silent exclusion is
         exactly the criticism the audit makes of Plaksha's reporting. */
      if (!s.in_placement_cohort) {
        html += "<section class=\"school\" id=\"" + esc(s.id) + "\">" +
          "<h2 class=\"school__name\">" + esc(s.name) + " <span class=\"school__abbr\">" +
            esc(s.abbr) + "</span></h2>" +
          "<p class=\"school__todo\"><strong>Not part of the graduating placement " +
            "cohort.</strong> " + esc(s.exclusion_reason) + " No figure on this site " +
            "includes its students, in the numerator or the denominator. " +
            "<a href=\"methodology.html#cohort-scope\">Which schools are counted</a> " +
            "sets out the scope in full.</p>" +
        "</section>";
        continue;
      }

      var sal = s.salary_inr_lpa;

      html += "<section class=\"school\" id=\"" + esc(s.id) + "\" data-view=\"school-" +
                esc(s.id) + "\">" +
        "<h2 class=\"school__name\">" + esc(s.name) + " <span class=\"school__abbr\">" +
          esc(s.abbr) + "</span></h2>" +
        "<p class=\"school__meta\">" +
          esc(R.fig(s.cohort.total_graduates)) + " graduating &middot; " +
          esc(R.fig(s.cohort.seeking_through_university)) + " seeking placement through the " +
          "university &middot; available " + esc(s.availability_window) +
        "</p>" +

        "<div class=\"figure-row\" data-package-figure>" +
          "<div class=\"figure-block figure-block--median\">" +
            "<span class=\"figure-block__value\">" + esc(R.fig(sal.median, "inr_lpa")) + "</span>" +
            "<span class=\"figure-block__caption t-label\">Median package</span>" +
            "<span class=\"figure-block__max\">Highest " + esc(R.fig(sal.max, "inr_lpa")) + "</span>" +
          "</div>" +
          "<div class=\"figure-block\">" +
            "<span class=\"figure-block__value\">" + esc(R.fig(s.cohort.students_placed)) + "</span>" +
            "<span class=\"figure-block__caption t-label\">Students placed</span>" +
          "</div>" +
          "<div class=\"figure-block\">" +
            "<span class=\"figure-block__value\">" + esc(R.fig(sal.n)) + "</span>" +
            "<span class=\"figure-block__caption t-label\">Offers behind these figures</span>" +
          "</div>" +
        "</div>" +
        "<p class=\"cohort-stamp t-caption\">" + esc(R.stamp()) + "</p>" +

        "<h3 class=\"school__sub\">Programmes</h3>" +
        (s.programmes.length
          ? "<p>" + esc(s.programmes.join(", ")) + "</p>"
          : "<p class=\"school__todo\">Programme list " + esc(R.fig(null, "text")) +
            " — to be confirmed against rvu.edu.in before this page ships. " +
            "An invented programme list would be worse than a visibly pending one.</p>") +

        "<h3 class=\"school__sub\">Top recruiters</h3>" +
        (s.top_recruiters.length
          ? "<p>" + esc(s.top_recruiters.join(", ")) + "</p>"
          : "<p class=\"school__todo\">Recruiter list " + esc(R.fig(null, "text")) +
            " — to be confirmed against the placement sheet.</p>") +

        "<h3 class=\"school__sub\" id=\"spread-" + esc(s.id) + "\">The spread across the university</h3>" +
        R.distributionRow(distribution) +
        "<p class=\"t-caption distribution__note\">This distribution is the whole " +
          "university's, not this school's alone: per-school distributions are not in the " +
          "placement sheet yet. It is shown here because a median must never appear " +
          "without a spread beside it.</p>" +

        "<p class=\"hero__actions\">" +
          "<a class=\"pill pill--quiet\" href=\"drives.html?school=" + esc(s.id) + "\">" +
            "See drives open to this school</a>" +
        "</p>" +
      "</section>";
    }
    return html;
  }

  /* --- school comparison --------------------------------------------------
     Six schools on one scale. Reading eight sections in sequence tells you
     what each school did; it does not tell you how they compare, which is the
     question a reader actually arrives with. Every bar is measured against the
     same maximum — the largest median among the six — so bar length is
     comparable across rows rather than per-row normalised, which is the trick
     that makes every school look equally strong.

     Medians only. A row of maxima would breach §E.1 in the one place where the
     comparison is most tempting to game. Each row carries its own count of
     offers behind the figure, so no bar stands without its denominator, and
     the spread behind every median is one link away. */
  function schoolComparison(schools) {
    var rows = [], i, max = 0;
    for (i = 0; i < schools.length; i++) {
      if (!schools[i].in_placement_cohort) { continue; }
      rows.push(schools[i]);
      if (schools[i].salary_inr_lpa.median > max) {
        max = schools[i].salary_inr_lpa.median;
      }
    }

    var html = "<div class=\"compare\">";
    for (i = 0; i < rows.length; i++) {
      var s = rows[i];
      var w = max ? Math.round((s.salary_inr_lpa.median / max) * 1000) / 10 : 0;
      html += "<div class=\"compare__item\">" +
                "<a class=\"compare__label\" href=\"#" + esc(s.id) + "\">" +
                  esc(s.name) +
                  "<span class=\"compare__n t-caption\">" +
                    esc(R.fig(s.salary_inr_lpa.n)) + " offers</span>" +
                "</a>" +
                "<span class=\"compare__track\" aria-hidden=\"true\">" +
                  "<span class=\"compare__bar\" data-fill-bar style=\"width:" + w + "%\"></span>" +
                "</span>" +
                "<span class=\"compare__value\">" +
                  esc(R.fig(s.salary_inr_lpa.median, "inr_lpa")) + "</span>" +
              "</div>";
    }
    html += "</div>";

    return html +
      "<p class=\"t-caption distribution__note\">Median basic package, all " +
        esc(R.fig(rows.length)) + " schools in the placement cohort drawn against " +
        "the same scale &mdash; the longest bar is the largest median, at " +
        esc(R.fig(max, "inr_lpa")) + ". " +
        "<a href=\"outcomes.html#spread\" data-spread-link>See the spread behind " +
        "the university median</a>.</p>" +
      "<p class=\"cohort-stamp t-caption\">" + esc(R.stamp()) + "</p>";
  }

  function schoolIndex(schools) {
    var html = "<div class=\"school-index\">";
    for (var i = 0; i < schools.length; i++) {
      html += "<a class=\"chip\" href=\"#" + esc(schools[i].id) + "\">" +
              esc(schools[i].name) + "</a>";
    }
    return html + "</div>";
  }

  R.classificationTable = classificationTable;
  R.deviationsTable = deviationsTable;
  R.archiveTable = archiveTable;
  R.schoolSections = schoolSections;
  R.schoolIndex = schoolIndex;
  R.schoolComparison = schoolComparison;

}(typeof window !== "undefined" ? window : globalThis));

/* ===========================================================================
   render.js · part 8 — the office.
   Unverified people render with the role first and the name bracketed, so the
   page never presents a guessed name as a confirmed one.
   =========================================================================== */
(function (global) {
  "use strict";
  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;
  var esc = function (s) { return R.esc(s); };
  /* Same aliasing part 2 uses: an attribute value is escaped the same way as
     text, so attr() is esc() under a name that says where it is going. */
  var attr = esc;

  /* Roles, not people. A role plus a working route is real information; a
     name we cannot verify is not, and a column of [pending] names reads as an
     unfinished page rather than a deliberate one. If the office later supplies
     names, a `name` field on each role renders here without a redesign. */
  function roles(list) {
    var html = "";
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      html += "<div class=\"person\">" +
        "<span class=\"person__scope t-label\">" + esc(r.scope) + "</span>" +
        "<h3 class=\"person__role\">" + esc(r.role) + "</h3>" +
        (r.name ? "<p class=\"person__name\">" + esc(r.name) + "</p>" : "") +
        "<ul class=\"person__handles\">";
      for (var j = 0; j < r.handles.length; j++) {
        html += "<li>" + esc(r.handles[j]) + "</li>";
      }
      html += "</ul>" +
        "<p class=\"person__contact\">" +
          "<a href=\"mailto:" + esc(r.route) + "\">" + esc(r.route) + "</a>" +
          " &middot; direct line " + esc(R.fig(r.direct_line, "text")) +
        "</p>" +
        "<p class=\"person__note t-caption\">" + esc(r.route_note) + "</p>" +
      "</div>";
    }
    return html;
  }

  function calendar(terms) {
    var html = "";
    for (var i = 0; i < terms.length; i++) {
      html += "<section class=\"term\">" +
        "<h3 class=\"term__name\">" + esc(terms[i].term) + "</h3><ul class=\"term__list\">";
      for (var j = 0; j < terms[i].activity.length; j++) {
        html += "<li>" + esc(terms[i].activity[j]) + "</li>";
      }
      html += "</ul></section>";
    }
    return html;
  }

  function startHere(rows) {
    var html = "<ul class=\"match__list\">";
    for (var i = 0; i < rows.length; i++) {
      html += "<li class=\"match__school\">" +
                "<span><strong>" + esc(rows[i].audience) + "</strong> — " +
                  esc(rows[i].line) + "</span>" +
                "<a class=\"match__window\" href=\"" + esc(rows[i].href) + "\">" +
                  esc(rows[i].label) + "</a>" +
              "</li>";
    }
    return html + "</ul>";
  }

  /* --- the university footer block ---------------------------------------
     The postal address comes from office.js; the email is general_email, the
     same string the Recruiting column uses, so the site has one placements
     address rather than two that could drift. Neither is typed into 11
     separate footers — the same one-source rule the figures follow. */
  function universityContact(office) {
    var c = office.university_contact;
    return "<span class=\"contact__line\">" + esc(c.address) + "</span>" +
           "<span class=\"contact__line\">" +
             "<a href=\"mailto:" + attr(office.general_email) + "\">" +
               esc(office.general_email) + "</a>" +
           "</span>";
  }

  /* Four brand marks drawn as 1.5px outlines on currentColor (§G: inline SVG,
     no icon font, no second colour). Outlines rather than the usual solid
     glyphs so they share the icon language the rest of the site uses.

     Each link carries a visible-to-screen-readers name; the glyph itself is
     aria-hidden, so the control is never announced as just "link". */
  var SOCIAL_ICON = {
    Facebook:
      "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/>" +
      "<path d=\"M15 8h-1.5A1.5 1.5 0 0 0 12 9.5V21M9.5 13.5h5\"/>",
    YouTube:
      "<rect x=\"2.5\" y=\"6\" width=\"19\" height=\"12\" rx=\"4\"/>" +
      "<path d=\"M10.5 9.5l4.5 2.5-4.5 2.5z\"/>",
    LinkedIn:
      "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/>" +
      "<path d=\"M7.5 10.5V17M7.5 7.5v.01M11.5 17v-3.75a2.25 2.25 0 0 1 4.5 0V17\"/>",
    Instagram:
      "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/>" +
      "<circle cx=\"12\" cy=\"12\" r=\"3.5\"/>" +
      "<path d=\"M16.9 7.1v.01\"/>"
  };

  function socialLinks(list) {
    var html = "<ul class=\"social\">";
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var glyph = SOCIAL_ICON[s.name] || "";
      html += "<li><a class=\"social__link\" href=\"" + attr(s.href) + "\"" +
                " rel=\"noopener noreferrer\">" +
                "<svg class=\"social__icon\" viewBox=\"0 0 24 24\" fill=\"none\"" +
                  " stroke=\"currentColor\" stroke-width=\"1.5\"" +
                  " stroke-linecap=\"round\" stroke-linejoin=\"round\"" +
                  " aria-hidden=\"true\" focusable=\"false\">" + glyph + "</svg>" +
                "<span class=\"visually-hidden\">" + esc(s.name) + "</span>" +
              "</a></li>";
    }
    return html + "</ul>";
  }

  R.roles = roles;
  R.universityContact = universityContact;
  R.socialLinks = socialLinks;
  R.calendar = calendar;
  R.startHere = startHere;
}(typeof window !== "undefined" ? window : globalThis));

/* Scope table: all eight schools, six counted and two not, with the reason. */
(function (global) {
  "use strict";
  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;
  function scopeTable(schools) {
    var rows = [];
    for (var i = 0; i < schools.length; i++) {
      var s = schools[i];
      rows.push([
        s.name + " (" + s.abbr + ")",
        s.in_placement_cohort ? "Counted" : "Not counted",
        s.in_placement_cohort
          ? R.fig(s.cohort.total_graduates) + " graduating, " +
            R.fig(s.cohort.seeking_through_university) + " seeking placement"
          : s.exclusion_reason
      ]);
    }
    return R.dataTable({
      caption: "Which schools are in the placement cohort",
      columns: ["School", "In the figures", "Detail"],
      rows: rows
    });
  }
  R.scopeTable = scopeTable;
}(typeof window !== "undefined" ? window : globalThis));

/* ===========================================================================
   render.js · part 9 — the audience mega-menu.

   One source for the whole navigation. Every page renders the same markup, so
   a page added to a panel below appears on all 11 pages at once.

   schools.html sits under all three audiences on purpose: a recruiter wants
   design students, a parent wants the School of Law. It was previously
   reachable from no page at all.
   =========================================================================== */
(function (global) {
  "use strict";
  var RVU = global.RVU = global.RVU || {};
  var R = RVU.render;
  var esc = function (s) { return R.esc(s); };

  var MENU = [
    { id: "students", label: "For students", href: "students.html", items: [
      { label: "Your journey",        href: "students.html" },
      { label: "Where you stand",     href: "eligibility.html" },
      { label: "Live drives",         href: "drives.html" },
      { label: "Placement by school", href: "schools.html" },
      { label: "Outcomes",            href: "outcomes.html" }
    ] },
    { id: "recruiters", label: "For recruiters", href: "recruiters.html", items: [
      { label: "How to hire",             href: "recruiters.html#how-it-works" },
      { label: "Start a hiring request",  href: "hire.html" },
      { label: "Our students & schools",  href: "recruiters.html#cohorts" },
      { label: "Drive windows",           href: "recruiters.html#windows" },
      { label: "Placement by school",     href: "schools.html" },
      { label: "Outcomes",                href: "outcomes.html" }
    ] },
    { id: "parents", label: "For parents", href: "parents.html", items: [
      { label: "What the numbers mean",  href: "parents.html#q3" },
      { label: "Three things you can do", href: "parents.html#q2" },
      { label: "Placement by school",    href: "schools.html" },
      { label: "Who to contact",         href: "office.html" },
      { label: "Outcomes",               href: "outcomes.html" },
      { label: "How we report",          href: "methodology.html" }
    ] }
  ];

  /* PARKED: not called at the moment — js/app.js mounts audienceSwitcher()
     instead. Kept complete and tested so the mega-menu can be turned back on
     without rebuilding it. See "MEGA-MENU (PARKED)" in components.css. */
  function megaMenu(currentId) {
    var html = "<nav class=\"mega\" aria-label=\"Choose your audience\">" +
               "<ul class=\"mega__list\">";
    for (var i = 0; i < MENU.length; i++) {
      var a = MENU[i];
      var current = (a.id === currentId) ? " aria-current=\"page\"" : "";
      html += "<li class=\"mega__item\" data-mega-item>" +
        "<a class=\"mega__trigger audience-switcher__link\" href=\"" + esc(a.href) + "\"" +
          current + " aria-expanded=\"false\" aria-controls=\"mega-" + esc(a.id) + "\"" +
          " data-mega-trigger>" + esc(a.label) + "</a>" +
        "<div class=\"mega__panel\" id=\"mega-" + esc(a.id) + "\" data-mega-panel hidden>" +
          "<ul class=\"mega__links\">";
      for (var j = 0; j < a.items.length; j++) {
        html += "<li><a class=\"mega__link\" href=\"" + esc(a.items[j].href) + "\">" +
                esc(a.items[j].label) + "</a></li>";
      }
      html += "</ul></div></li>";
    }
    return html + "</ul></nav>";
  }

  R.megaMenu = megaMenu;
  R.MENU = MENU;
}(typeof window !== "undefined" ? window : globalThis));
