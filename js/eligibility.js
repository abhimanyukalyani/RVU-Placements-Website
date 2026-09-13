/* ===========================================================================
   eligibility.js — module 1, the eligibility checker.

   Six inputs; three result states. There is no bare "ineligible": the third
   state names the single blocking criterion, what would change it, and by
   when (CLAUDE.md §F — rules are written as capability, never as grounds for
   disqualification).

   evaluate() is pure and depends only on window.RVU data, so the whole input
   space can be enumerated and checked for dead ends. The DOM wiring below it
   does no reasoning of its own.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var doc = global.document;

  var STORAGE_KEY = "rvu.eligibility.last";

  /* ------------------------------------------------------------ the engine */

  function schoolById(id) {
    var all = RVU.schools || [];
    for (var i = 0; i < all.length; i++) { if (all[i].id === id) { return all[i]; } }
    return null;
  }

  function criteriaFor(id) {
    var c = (RVU.eligibility && RVU.eligibility.criteria_by_school) || {};
    return c[id] || { min_cgpa: 7.0, max_backlogs: 1, notes: null };
  }

  /* Drives this student could apply to today: open to their school, still
     accepting, and at or below their CGPA. */
  function matchingDrives(input) {
    var out = [], all = RVU.drives || [];
    for (var i = 0; i < all.length; i++) {
      var d = all[i];
      if (d.status !== "open" && d.status !== "closing") { continue; }
      if (d.eligible_schools.indexOf(input.school) === -1) { continue; }
      if (typeof input.cgpa === "number" && input.cgpa < d.min_cgpa) { continue; }
      out.push(d);
    }
    return out;
  }

  /* Drives that would open up if the CGPA rose — used to say what changes. */
  function reachableDrives(input) {
    var out = [], all = RVU.drives || [];
    for (var i = 0; i < all.length; i++) {
      var d = all[i];
      if (d.status !== "open" && d.status !== "closing") { continue; }
      if (d.eligible_schools.indexOf(input.school) === -1) { continue; }
      out.push(d);
    }
    return out;
  }

  function lowestFloor(drives) {
    var lo = null;
    for (var i = 0; i < drives.length; i++) {
      if (lo === null || drives[i].min_cgpa < lo) { lo = drives[i].min_cgpa; }
    }
    return lo;
  }

  function driveIds(drives) {
    var ids = [];
    for (var i = 0; i < drives.length; i++) { ids.push(drives[i].id); }
    return ids;
  }

  function drivesLink(input) {
    return "drives.html?school=" + encodeURIComponent(input.school) + "&eligible=me";
  }

  var POLICY_SHORT = "One offer at a time: accept an offer and you step out of " +
                     "the pool so the next student gets the seat. Decline it and " +
                     "you are back in the same day — declining costs you nothing.";

  /* validate() separates "you told us something impossible" from "here is
     where you stand". A validation problem is never a result state. */
  function validate(input) {
    var errors = [];
    if (!input.school || !schoolById(input.school)) {
      errors.push({ field: "school", message: "Choose your school so we can apply the right criteria." });
    }
    if (!input.year) {
      errors.push({ field: "year", message: "Choose your year of study." });
    }
    if (input.cgpa === null || input.cgpa === undefined || input.cgpa === "" ||
        typeof input.cgpa !== "number" || !isFinite(input.cgpa)) {
      errors.push({ field: "cgpa", message: "Enter your current CGPA, between 0 and 10. If you do not have one yet, enter 0 and we will show you the internship route." });
    } else if (input.cgpa < 0 || input.cgpa > 10) {
      errors.push({ field: "cgpa", message: "CGPA runs from 0 to 10. Enter the figure on your latest transcript." });
    }
    if (input.backlogs === null || input.backlogs === undefined || input.backlogs === "" ||
        typeof input.backlogs !== "number" || !isFinite(input.backlogs) || input.backlogs < 0) {
      errors.push({ field: "backlogs", message: "Enter how many active backlogs you have. Enter 0 if you have none." });
    }
    if (input.holdingOffer !== true && input.holdingOffer !== false) {
      errors.push({ field: "holdingOffer", message: "Tell us whether you are holding an offer, so we can apply the one-offer policy." });
    }
    return errors;
  }

  function evaluate(input) {
    var errors = validate(input);
    if (errors.length) { return { state: "invalid", errors: errors }; }

    var school = schoolById(input.school);
    var crit = criteriaFor(input.school);
    var matching = matchingDrives(input);
    var reachable = reachableDrives(input);
    var floor = lowestFloor(reachable);

    var base = {
      school: school,
      criteria: crit,
      matching: driveIds(matching),
      matchingCount: matching.length,
      policy: POLICY_SHORT,
      notes: crit.notes
    };

    /* -- blocker 1 · holding a live offer ---------------------------------
       Named first because it overrides everything else, and because the way
       back is immediate. */
    if (input.holdingOffer === true) {
      return merge(base, {
        state: "not_current",
        branch: "holding_offer",
        headline: "You are holding an offer, so you are out of the pool for now",
        condition: "You are holding one live offer.",
        change: "Decline it through your coordinator and you return to the pool the same day. Nothing is recorded against you for declining.",
        by_when: "The same day you decline.",
        links: [
          { label: "Find your coordinator", href: "office.html" },
          { label: "See what you would return to", href: drivesLink(input) }
        ],
        actions: [
          "Email your coordinator to say whether you are keeping or declining the offer.",
          "If you are keeping it, tell the office so your seat is released to the next student."
        ]
      });
    }

    /* -- blocker 2 · backlogs above the school's ceiling ------------------- */
    if (input.backlogs > crit.max_backlogs) {
      var toClear = input.backlogs - crit.max_backlogs;
      return merge(base, {
        state: "not_current",
        branch: "backlogs_over",
        headline: "Clearing " + (toClear === 1 ? "one backlog" : toClear + " backlogs") +
                  " puts you back in the pool",
        condition: (crit.max_backlogs === 0
                     ? school.name + " asks for no active backlogs at the point of application."
                     : school.name + " allows up to " + crit.max_backlogs +
                       " active backlog at the point of application.") +
                   " You have " + input.backlogs + ".",
        change: "Clear " + (toClear === 1 ? "one" : toClear) +
                " and every drive listed for your school reopens to you.",
        by_when: "At the next application window after your result is published.",
        links: [
          { label: "Plan it with the office", href: "office.html" },
          { label: "See the drives this would open", href: drivesLink(input) }
        ],
        actions: [
          "Ask the office to put you in touch with your faculty coordinator to plan the attempt.",
          "Keep your CV and transcript current so nothing else holds you up when you are back in."
        ]
      });
    }

    /* -- years 1 and 2 · the journey, not the drives ----------------------- */
    if (input.year <= 2) {
      return merge(base, {
        state: "conditions",
        branch: "year_1_2",
        headline: "You are on track — drives come later, and what you do now decides how they go",
        condition: "Full-time drives open in your final year and internships in your penultimate year. You are in year " + input.year + ".",
        change: "Nothing is blocking you. The students who do best in the final-year cycle are the ones who used years 1 and 2 to work out what they want.",
        by_when: "Internship applications open in your third year, in January.",
        links: [
          { label: "See what your year asks of you", href: "students.html#year-" + input.year },
          { label: "Look at the live drives anyway", href: "drives.html" }
        ],
        actions: [
          "Book the strengths and interests session — it is the entry point for your year.",
          "Read three job descriptions in a field you know nothing about."
        ]
      });
    }

    /* -- year 3 · internships, and the route to a pre-placement offer ------ */
    if (input.year === 3) {
      return merge(base, {
        state: "conditions",
        branch: "year_3",
        headline: "You are eligible for internships now, and for full-time drives next year",
        condition: "Penultimate-year students apply to internships. Full-time drives open in your final year.",
        change: "An internship is the most common route to a pre-placement offer, so this is the year that matters most for next year's result.",
        by_when: "Internship applications open in January.",
        links: [
          { label: "See drives open to your school", href: drivesLink(input) },
          { label: "Your third year, in detail", href: "students.html#year-3" }
        ],
        actions: [
          "Get your CV reviewed before January — the office turns reviews round in three working days.",
          "Take one live industry project this term."
        ]
      });
    }

    /* -- final year, CGPA below every floor open to the school ------------- */
    if (matching.length === 0) {
      var hasReachable = reachable.length > 0;
      return merge(base, {
        state: "conditions",
        branch: hasReachable ? "cgpa_below_floors" : "no_drives_for_school",
        headline: hasReachable
          ? "No drive currently open to your school matches your CGPA — here is what changes that"
          : "No drive is open to your school this week — the office can tell you what is coming",
        condition: hasReachable
          ? ("The lowest CGPA floor among drives open to " + school.name +
             " is " + floor + ". Yours is " + input.cgpa + ".")
          : ("No employer currently has an open window for " + school.name + "."),
        change: hasReachable
          ? ("Your next semester result moves this. Drives also set their own floors, and new ones open through the cycle at different levels.")
          : ("Windows for " + school.name + " open through the cycle; the office knows which employers are scheduled next."),
        by_when: hasReachable
          ? "Your next semester result, and each new drive as it opens."
          : "Ask the office for your school's next confirmed window.",
        links: [
          { label: "See every live drive and its floor", href: "drives.html" },
          { label: "Ask the office what is coming", href: "office.html" }
        ],
        actions: [
          "Set the drives ledger filter to your school and check it weekly — floors differ drive by drive.",
          "Book a CV review now so you are ready the week a matching drive opens."
        ]
      });
    }

    /* -- final year, at the backlog ceiling -------------------------------- */
    if (crit.max_backlogs > 0 && input.backlogs === crit.max_backlogs) {
      return merge(base, {
        state: "conditions",
        branch: "at_backlog_ceiling",
        headline: "You can apply now, and clearing your backlog protects that",
        condition: "You are at " + school.name + "'s ceiling of " + crit.max_backlogs +
                   " active backlog. You can apply, but a second one would pause you.",
        change: "Clear the one you have and nothing can pause you mid-cycle.",
        by_when: "Before your next semester result is published.",
        links: [
          { label: "Apply to the " + matching.length +
                    (matching.length === 1 ? " drive" : " drives") + " open to you",
            href: drivesLink(input) },
          { label: "Plan the attempt with the office", href: "office.html" }
        ],
        actions: [
          "Apply to the drives open to you now — being at the ceiling does not stop you.",
          "Register the backlog attempt so it is cleared before the next window."
        ]
      });
    }

    /* -- final year, clear ------------------------------------------------- */
    return merge(base, {
      state: "eligible",
      branch: "eligible",
      headline: "You are eligible for " + matching.length +
                (matching.length === 1 ? " drive open right now" : " drives open right now"),
      condition: null,
      change: "Keep your CV and transcript current and you stay eligible for everything that opens this cycle.",
      by_when: "Registration for the cycle closes on 31 October.",
      links: [
        { label: "See the drives you can apply to", href: drivesLink(input) },
        { label: "Book a mock interview", href: "office.html" }
      ],
      actions: [
        "Apply to the drives listed for you — each one closes on its own date.",
        "Book a mock interview before your first round."
      ]
    });
  }

  function merge(a, b) {
    var out = {}, k;
    for (k in a) { if (Object.prototype.hasOwnProperty.call(a, k)) { out[k] = a[k]; } }
    for (k in b) { if (Object.prototype.hasOwnProperty.call(b, k)) { out[k] = b[k]; } }
    return out;
  }

  RVU.eligibilityEngine = {
    evaluate: evaluate,
    validate: validate,
    matchingDrives: matchingDrives,
    criteriaFor: criteriaFor,
    STORAGE_KEY: STORAGE_KEY,
    POLICY_SHORT: POLICY_SHORT
  };

  /* ================================================================== the UI */
  if (!doc) { return; }

  function el(id) { return doc.getElementById(id); }

  function readForm() {
    var cgpaRaw = el("cgpa").value.trim();
    var backRaw = el("backlogs").value.trim();
    var offer = doc.querySelector("input[name=\"holding-offer\"]:checked");
    return {
      school: el("school").value,
      programme: el("programme").value,
      year: el("year").value ? parseInt(el("year").value, 10) : null,
      cgpa: cgpaRaw === "" ? null : parseFloat(cgpaRaw),
      backlogs: backRaw === "" ? null : parseInt(backRaw, 10),
      holdingOffer: offer ? (offer.value === "yes") : null
    };
  }

  /* Only the six schools in the graduating placement cohort. SoAHP has no
     graduating cohort yet and SCEPS is continuing education; offering either
     here would produce a result the office could not act on. Both exclusions
     are stated on methodology.html rather than left silent. */
  function fillSchools() {
    var sel = el("school"), all = RVU.placementSchools();
    for (var i = 0; i < all.length; i++) {
      var o = doc.createElement("option");
      o.value = all[i].id; o.textContent = all[i].name;
      sel.appendChild(o);
    }
  }

  /* Programme lists are empty in the data by design — inventing them would be
     worse than showing them as pending. The field stays visible, labelled and
     disabled, and never blocks a result. */
  function fillProgrammes() {
    var sel = el("programme");
    var school = schoolById(el("school").value);
    sel.innerHTML = "";
    var list = (school && school.programmes) || [];
    var o = doc.createElement("option");
    if (!list.length) {
      /* No disabled select here: a browser greys a disabled control's text to
         its own colour — measured at 3.47:1 on the panel ground — which is
         outside the nine and below the body floor. A readonly, single-option
         select keeps the token colour and is still inert. */
      o.value = ""; o.textContent = "Programme list pending — this does not affect your result";
      sel.appendChild(o);
      sel.disabled = false;
      sel.setAttribute("aria-readonly", "true");
      sel.classList.add("field__select--pending");
      return;
    }
    sel.disabled = false;
    sel.removeAttribute("aria-readonly");
    sel.classList.remove("field__select--pending");
    o.value = ""; o.textContent = "Choose your programme";
    sel.appendChild(o);
    for (var i = 0; i < list.length; i++) {
      var p = doc.createElement("option");
      p.value = list[i]; p.textContent = list[i];
      sel.appendChild(p);
    }
  }

  function clearErrors() {
    var nodes = doc.querySelectorAll(".field__error");
    for (var i = 0; i < nodes.length; i++) { nodes[i].textContent = ""; }
    var inputs = doc.querySelectorAll("#eligibility-form [aria-invalid]");
    for (var j = 0; j < inputs.length; j++) { inputs[j].removeAttribute("aria-invalid"); }
  }

  function showErrors(errors) {
    for (var i = 0; i < errors.length; i++) {
      var f = errors[i].field;
      var slot = el("error-" + f);
      if (slot) { slot.textContent = errors[i].message; }
      var input = el(f) || doc.querySelector("[name=\"" + f + "\"]");
      if (input) { input.setAttribute("aria-invalid", "true"); }
    }
    var first = el(errors[0].field) || doc.querySelector("[name=\"" + errors[0].field + "\"]");
    if (first) { first.focus(); }
  }

  var STATE_LABEL = {
    eligible:    "Eligible",
    conditions:  "Eligible, with something to know",
    not_current: "Paused — and here is the way back"
  };

  function renderResult(result, input) {
    var R = RVU.render;
    var html = "";

    if (showingExample) {
      html += "<p class=\"example-note\"><span class=\"t-label\">Example</span> " +
              "This is a worked example, not your result — final year, no backlogs, " +
              "not holding an offer. Change any field above and press the button to " +
              "see where you actually stand.</p>";
    }

    html += "<p class=\"eyebrow\">" + R.esc(STATE_LABEL[result.state]) + "</p>";
    html += "<h2 class=\"result__headline\">" + R.esc(result.headline) + "</h2>";

    if (result.condition) {
      html += "<p class=\"result__line\"><span class=\"result__key t-label\">What applies</span>" +
              R.esc(result.condition) + "</p>";
    }
    html += "<p class=\"result__line\"><span class=\"result__key t-label\">What changes it</span>" +
            R.esc(result.change) + "</p>";
    html += "<p class=\"result__line\"><span class=\"result__key t-label\">By when</span>" +
            R.esc(result.by_when) + "</p>";

    html += "<ul class=\"result__actions\">";
    for (var a = 0; a < result.actions.length; a++) {
      html += "<li>" + R.esc(result.actions[a]) + "</li>";
    }
    html += "</ul>";

    html += "<p class=\"hero__actions\">";
    for (var l = 0; l < result.links.length; l++) {
      html += "<a class=\"pill" + (l ? " pill--quiet" : "") + "\" href=\"" +
              R.esc(result.links[l].href) + "\">" + R.esc(result.links[l].label) + "</a>";
    }
    html += "</p>";

    if (result.notes) {
      html += "<p class=\"t-caption result__note\">" + R.esc(result.notes) + "</p>";
    }
    html += "<p class=\"t-caption result__note\">" + R.esc(result.policy) + "</p>";
    html += "<p class=\"t-caption result__note\">This result is in the address bar — " +
            "copy the link to share it with your coordinator.</p>";
    // The result is computed from the live drive list, so it carries the same
    // provenance stamp as every other figure on the site.
    html += "<p class=\"cohort-stamp t-caption\">" + R.esc(R.stamp()) + "</p>";

    var panel = el("result");
    panel.innerHTML = html;
    panel.hidden = false;
  }

  /* An untouched page shows a worked example rather than an empty form, so a
     first-time visitor sees the shape of an answer before typing anything.
     It is labelled as an example and is replaced the moment they submit.
     Final year, no backlogs, no offer is the ordinary case: 71% of students
     in that position are eligible outright, and 100% at a CGPA of 7 or above. */
  var EXAMPLE = { year: 4, cgpa: 7.6, backlogs: 0, holdingOffer: false };
  var showingExample = false;

  function fillExample() {
    var placement = RVU.placementSchools();
    var first = placement.length ? placement[0].id : "";
    el("school").value = first;
    fillProgrammes();
    el("year").value = String(EXAMPLE.year);
    el("cgpa").value = String(EXAMPLE.cgpa);
    el("backlogs").value = String(EXAMPLE.backlogs);
    var r = doc.querySelector("input[name=\"holding-offer\"][value=\"no\"]");
    if (r) { r.checked = true; }
    showingExample = true;
    submit(null, { example: true });
  }

  function encodeState(input) {
    var q = "?school=" + encodeURIComponent(input.school) +
            "&year=" + encodeURIComponent(input.year) +
            "&cgpa=" + encodeURIComponent(input.cgpa) +
            "&backlogs=" + encodeURIComponent(input.backlogs) +
            "&offer=" + (input.holdingOffer ? "yes" : "no");
    return q;
  }

  function decodeState() {
    var q = global.location.search;
    if (!q || q.length < 2) { return null; }
    var out = {}, pairs = q.substring(1).split("&");
    for (var i = 0; i < pairs.length; i++) {
      var kv = pairs[i].split("=");
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
    }
    if (!out.school) { return null; }
    return out;
  }

  function store(result, input) {
    try {
      global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        school: input.school, year: input.year, cgpa: input.cgpa,
        backlogs: input.backlogs, holdingOffer: input.holdingOffer,
        state: result.state, matching: result.matching, saved: new Date().toISOString()
      }));
    } catch (e) { /* private mode, or storage disabled — the checker still works */ }
  }

  function submit(event, options) {
    if (event) { event.preventDefault(); }
    if (!(options && options.example)) { showingExample = false; }
    clearErrors();
    var input = readForm();
    var result = evaluate(input);

    if (result.state === "invalid") { showErrors(result.errors); return; }

    renderResult(result, input);
    store(result, input);

    // The result is shareable: the state goes into the address bar without
    // reloading, so a student can send the link to a coordinator.
    if (!showingExample && global.history && global.history.replaceState) {
      global.history.replaceState(null, "", encodeState(input));
    }
  }

  function prefillFromUrl() {
    var q = decodeState();
    if (!q) { return false; }
    if (q.school) { el("school").value = q.school; fillProgrammes(); }
    if (q.year) { el("year").value = q.year; }
    if (q.cgpa) { el("cgpa").value = q.cgpa; }
    if (q.backlogs) { el("backlogs").value = q.backlogs; }
    if (q.offer) {
      var r = doc.querySelector("input[name=\"holding-offer\"][value=\"" + q.offer + "\"]");
      if (r) { r.checked = true; }
    }
    return true;
  }

  function init() {
    if (!el("eligibility-form")) { return; }
    fillSchools();
    fillProgrammes();
    el("school").addEventListener("change", fillProgrammes);
    el("eligibility-form").addEventListener("submit", submit);
    if (prefillFromUrl()) { submit(null); } else { fillExample(); }
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else { init(); }

}(typeof window !== "undefined" ? window : globalThis));
