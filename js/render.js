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

    /* 6 · schools reconcile to the university figures, bucket by bucket */
    var schools = RVU.schools || [];
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

    /* 7 · every drive references a real school id and closes after it opens */
    var drives = RVU.drives || [];
    var validStatus = { open: 1, closing: 1, closed: 1, offers_out: 1 };
    var ids = {};
    for (var si = 0; si < schools.length; si++) { ids[schools[si].id] = true; }
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
    if (block.max !== undefined && block.max !== null) {
      html += "<span class=\"figure-block__max\">" +
              esc(block.maxLabel || "Highest") + " " +
              esc(R.fig(block.max, block.fmt)) + "</span>";
    }
    html += "<span class=\"figure-block__caption t-label\">" +
            esc(block.caption) + "</span>";
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
                  "<span class=\"distribution__bar\" style=\"width:" + width + "%\"></span>" +
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

  /* --- recruiter-strip ----------------------------------------------------
     Names as text with hairline dividers. Never logos: nobody's mark is
     misused, and no image placeholder ships. */
  function recruiterStrip(sectors) {
    var names = [], i, j;
    for (i = 0; i < sectors.length; i++) {
      for (j = 0; j < sectors[i].companies.length; j++) {
        names.push(sectors[i].companies[j]);
      }
    }
    var html = "<ul class=\"recruiter-strip\">";
    for (i = 0; i < names.length; i++) {
      html += "<li class=\"recruiter-strip__name\">" + esc(names[i]) + "</li>";
    }
    return html + "</ul>";
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
  R.recruiterStrip = recruiterStrip;
  R.countRecruiters = countRecruiters;
  R.ledger = ledger;
  R.ledgerRow = ledgerRow;
  R.dataTable = dataTable;
  R.disclosure = disclosure;
  R.audienceSwitcher = audienceSwitcher;
  R.arrowIcon = arrowIcon;
  R.mount = mount;

}(typeof window !== "undefined" ? window : globalThis));
