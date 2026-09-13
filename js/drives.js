/* ===========================================================================
   drives.js — module 2, the live drives ledger.

   Filter chips, sort, and a row count announced on change. Status is the only
   coloured text in a row, and nothing is red: a closed drive is carried by
   wording and weight (CLAUDE.md §A, §D).

   "Eligible to me" reads the last checker result from sessionStorage. If there
   isn't one, the chip says so and offers the checker rather than sitting inert.

   Empty states say what to change. The string "no results" appears nowhere.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var doc = global.document;
  if (!doc) { return; }

  var R, state = {
    school: "all",
    sector: "all",
    status: "all",
    closingThisWeek: false,
    eligibleToMe: false,
    sort: "closes"
  };

  var STATUS_ORDER = ["open", "closing", "closed", "offers_out"];
  var STATUS_WORDS = { open: "Open", closing: "Closing", closed: "Closed", offers_out: "Offers out" };

  function lastResult() {
    try {
      var raw = global.sessionStorage.getItem(RVU.eligibilityEngine.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function sectors() {
    var seen = {}, out = [];
    for (var i = 0; i < RVU.drives.length; i++) {
      var s = RVU.drives[i].sector;
      if (!seen[s]) { seen[s] = true; out.push(s); }
    }
    return out;
  }

  function withinDays(iso, days) {
    var now = new Date(RVU.meta.updated + "T00:00:00");
    var then = new Date(iso + "T00:00:00");
    var diff = (then - now) / 86400000;
    return diff >= 0 && diff <= days;
  }

  function apply() {
    var rows = RVU.drives.slice();
    var last = lastResult();

    if (state.eligibleToMe && last) {
      rows = rows.filter(function (d) {
        return last.matching.indexOf(d.id) !== -1;
      });
    }
    if (state.school !== "all") {
      rows = rows.filter(function (d) { return d.eligible_schools.indexOf(state.school) !== -1; });
    }
    if (state.sector !== "all") {
      rows = rows.filter(function (d) { return d.sector === state.sector; });
    }
    if (state.status !== "all") {
      rows = rows.filter(function (d) { return d.status === state.status; });
    }
    if (state.closingThisWeek) {
      rows = rows.filter(function (d) { return withinDays(d.closes, 7); });
    }

    rows.sort(function (a, b) {
      if (state.sort === "ctc")     { return b.ctc_lpa - a.ctc_lpa; }
      if (state.sort === "company") { return a.company < b.company ? -1 : 1; }
      if (a.closes === b.closes) { return a.company < b.company ? -1 : 1; }
      return a.closes < b.closes ? -1 : 1;
    });

    return rows;
  }

  /* Empty states name the filter to change and offer the control that does it.
     Never "no results". */
  function emptyMessage() {
    var last = lastResult();

    if (state.eligibleToMe && !last) {
      return {
        headline: "Run the eligibility check and this list narrows to you",
        body: "“Eligible to me” uses your last check. You have not run one in this " +
              "browser session yet, so there is nothing to match against.",
        link: { label: "Check where you stand", href: "eligibility.html" }
      };
    }
    if (state.eligibleToMe && last) {
      return {
        headline: "Widen the filter and you will see what is close",
        body: "Nothing open matches your last check together with the other filters you " +
              "have set. Turn off “Eligible to me” to see every drive and its CGPA " +
              "floor, or clear the school and sector filters.",
        link: { label: "See every live drive", href: "#", clear: true }
      };
    }
    if (state.closingThisWeek) {
      return {
        headline: "Nothing closes in the next seven days — look further out",
        body: "Turn off “Closing this week” to see drives with later deadlines, " +
              "which is where most of the cycle sits.",
        link: { label: "Clear the filters", href: "#", clear: true }
      };
    }
    if (state.school !== "all" || state.sector !== "all" || state.status !== "all") {
      return {
        headline: "Change one filter and there will be drives here",
        body: "No drive matches every filter you have set at once. Clearing the sector " +
              "filter usually opens the most, since sectors run on different calendars.",
        link: { label: "Clear the filters", href: "#", clear: true }
      };
    }
    return {
      headline: "The ledger is between cycles",
      body: "No drive is live right now. The office publishes each window as it is " +
            "confirmed, and can tell you which employers are scheduled next.",
      link: { label: "Ask the office what is coming", href: "office.html" }
    };
  }

  function render() {
    var rows = apply();
    var out = doc.getElementById("ledger-output");
    var count = doc.getElementById("ledger-count");

    if (!rows.length) {
      var m = emptyMessage();
      out.innerHTML =
        "<div class=\"empty-state\">" +
          "<h3 class=\"empty-state__headline\">" + R.esc(m.headline) + "</h3>" +
          "<p class=\"empty-state__body\">" + R.esc(m.body) + "</p>" +
          "<p class=\"hero__actions\">" +
            (m.link.clear
              ? "<button type=\"button\" class=\"pill\" data-clear>" + R.esc(m.link.label) + "</button>"
              : "<a class=\"pill\" href=\"" + R.esc(m.link.href) + "\">" + R.esc(m.link.label) + "</a>") +
          "</p>" +
        "</div>";
    } else {
      out.innerHTML = R.ledger(rows);
    }

    count.textContent = rows.length === 1
      ? "Showing 1 drive."
      : "Showing " + rows.length + " drives.";

    var clear = out.querySelector("[data-clear]");
    if (clear) { clear.addEventListener("click", clearAll); }
  }

  function clearAll() {
    state.school = "all"; state.sector = "all"; state.status = "all";
    state.closingThisWeek = false; state.eligibleToMe = false;
    syncControls();
    render();
    doc.getElementById("filters").focus();
  }

  function syncControls() {
    doc.getElementById("filter-school").value = state.school;
    doc.getElementById("filter-sector").value = state.sector;
    doc.getElementById("filter-status").value = state.status;
    doc.getElementById("filter-sort").value = state.sort;
    setChip("chip-closing", state.closingThisWeek);
    setChip("chip-eligible", state.eligibleToMe);
  }

  function setChip(id, on) {
    doc.getElementById(id).setAttribute("aria-pressed", on ? "true" : "false");
  }

  function toggleChip(id, key) {
    state[key] = !state[key];
    setChip(id, state[key]);
    render();
  }

  function buildControls() {
    var schoolSel = doc.getElementById("filter-school");
    var placement = RVU.placementSchools();
    for (var i = 0; i < placement.length; i++) {
      var o = doc.createElement("option");
      o.value = placement[i].id; o.textContent = placement[i].name;
      schoolSel.appendChild(o);
    }
    var sectorSel = doc.getElementById("filter-sector");
    var list = sectors();
    for (var j = 0; j < list.length; j++) {
      var s = doc.createElement("option");
      s.value = list[j]; s.textContent = list[j];
      sectorSel.appendChild(s);
    }
    var statusSel = doc.getElementById("filter-status");
    for (var k = 0; k < STATUS_ORDER.length; k++) {
      var st = doc.createElement("option");
      st.value = STATUS_ORDER[k]; st.textContent = STATUS_WORDS[STATUS_ORDER[k]];
      statusSel.appendChild(st);
    }
  }

  function init() {
    if (!doc.getElementById("ledger-output")) { return; }
    R = RVU.render;
    buildControls();

    doc.getElementById("filter-school").addEventListener("change", function (e) {
      state.school = e.target.value; render();
    });
    doc.getElementById("filter-sector").addEventListener("change", function (e) {
      state.sector = e.target.value; render();
    });
    doc.getElementById("filter-status").addEventListener("change", function (e) {
      state.status = e.target.value; render();
    });
    doc.getElementById("filter-sort").addEventListener("change", function (e) {
      state.sort = e.target.value; render();
    });
    doc.getElementById("chip-closing").addEventListener("click", function () {
      toggleChip("chip-closing", "closingThisWeek");
    });
    doc.getElementById("chip-eligible").addEventListener("click", function () {
      toggleChip("chip-eligible", "eligibleToMe");
    });

    /* Arriving from the checker: drives.html?school=…&eligible=me */
    var q = global.location.search;
    if (q.indexOf("eligible=me") !== -1) { state.eligibleToMe = true; }
    var m = q.match(/school=([^&]+)/);
    if (m) { state.school = decodeURIComponent(m[1]); }

    /* Tell the student the filter is live, and where it came from. */
    var note = doc.getElementById("eligible-note");
    var last = lastResult();
    if (last) {
      note.textContent = "Your last eligibility check is in this browser session, so " +
                         "“Eligible to me” can filter against it.";
    } else {
      note.textContent = "Run the eligibility check and “Eligible to me” will " +
                         "filter this list down to the drives you can apply to.";
    }

    syncControls();
    render();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else { init(); }

}(typeof window !== "undefined" ? window : globalThis));
