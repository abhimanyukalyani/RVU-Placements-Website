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
