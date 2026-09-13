/* ===========================================================================
   intake.js — module 4, the recruiter hiring request.

   Waterloo's structure: classify by stage first, then route. Four steps, and
   step 3 gives before it takes — it tells the recruiter which schools match,
   roughly how many students that is, and when the next window opens, all
   computed from schools.js and drives.js before anything is submitted.

   No backend. Submit renders a confirmation and logs a payload keyed by the
   sheet columns in data/intake-fields.js, which is also the demonstration:
   this form already speaks the office's spreadsheet.
   =========================================================================== */
(function (global) {
  "use strict";

  var RVU = global.RVU = global.RVU || {};
  var doc = global.document;
  if (!doc) { return; }

  var R, F, step = 1, TOTAL = 4;

  /* Every entered value lives here, so Back never loses anything. */
  var data = {};

  /* ------------------------------------------------------------ the match */
  /* Schools whose students the drives in this sector are actually open to. */
  function matchSchools(sector) {
    var ids = {}, i, j;
    for (i = 0; i < RVU.drives.length; i++) {
      var d = RVU.drives[i];
      if (sector && d.sector !== sector) { continue; }
      for (j = 0; j < d.eligible_schools.length; j++) { ids[d.eligible_schools[j]] = true; }
    }
    var placement = RVU.placementSchools();
    var out = [];
    for (i = 0; i < placement.length; i++) {
      if (ids[placement[i].id]) { out.push(placement[i]); }
    }
    /* A sector nobody has recruited in yet is not a dead end: the whole
       placement cohort is available, and the page says so. */
    return out.length ? out : placement.slice();
  }

  function cohortSize(schools) {
    var n = 0;
    for (var i = 0; i < schools.length; i++) {
      n += schools[i].cohort.seeking_through_university;
    }
    return n;
  }

  function nextWindow(schools) {
    var ids = {}, i;
    for (i = 0; i < schools.length; i++) { ids[schools[i].id] = true; }
    var best = null;
    for (i = 0; i < RVU.drives.length; i++) {
      var d = RVU.drives[i];
      if (d.status !== "open" && d.status !== "closing") { continue; }
      var touches = false;
      for (var j = 0; j < d.eligible_schools.length; j++) {
        if (ids[d.eligible_schools[j]]) { touches = true; }
      }
      if (!touches) { continue; }
      if (best === null || d.closes < best) { best = d.closes; }
    }
    return best;
  }

  /* ----------------------------------------------------------- the fields */
  function optionsFor(field) {
    if (field.options) { return field.options; }
    if (field.options_from === "placements.by_function") {
      return RVU.placements.by_function.map(function (f) {
        return { value: f.name, label: f.name };
      });
    }
    if (field.options_from === "drives.sector") {
      var seen = {}, out = [];
      for (var i = 0; i < RVU.drives.length; i++) {
        var s = RVU.drives[i].sector;
        if (!seen[s]) { seen[s] = true; out.push({ value: s, label: s }); }
      }
      return out;
    }
    return [];
  }

  function fieldHtml(field) {
    var id = "f-" + field.name;
    var value = data[field.name] === undefined ? "" : data[field.name];
    var html = "<div class=\"field\">";

    if (field.type === "radio") {
      html = "<fieldset class=\"field\"><legend>" + R.esc(field.label) + "</legend>" +
             "<div class=\"radio-set radio-set--stack\">";
      var opts = optionsFor(field);
      for (var i = 0; i < opts.length; i++) {
        html += "<label class=\"radio\"><input type=\"radio\" name=\"" + R.esc(field.name) +
                "\" value=\"" + R.esc(opts[i].value) + "\"" +
                (value === opts[i].value ? " checked" : "") + "> " +
                R.esc(opts[i].label) + "</label>";
      }
      html += "</div><p class=\"field__error\" id=\"error-" + R.esc(field.name) +
              "\" role=\"alert\"></p></fieldset>";
      return html;
    }

    html += "<label class=\"field__label\" for=\"" + id + "\">" + R.esc(field.label) +
            (field.required ? "" : " (optional)") + "</label>";

    if (field.type === "select") {
      html += "<select id=\"" + id + "\" name=\"" + R.esc(field.name) + "\">" +
              "<option value=\"\">Choose one</option>";
      var o = optionsFor(field);
      for (var j = 0; j < o.length; j++) {
        html += "<option value=\"" + R.esc(o[j].value) + "\"" +
                (value === o[j].value ? " selected" : "") + ">" + R.esc(o[j].label) + "</option>";
      }
      html += "</select>";
    } else if (field.type === "textarea") {
      html += "<textarea id=\"" + id + "\" name=\"" + R.esc(field.name) + "\">" +
              R.esc(value) + "</textarea>";
    } else {
      html += "<input type=\"" + R.esc(field.type) + "\" id=\"" + id + "\" name=\"" +
              R.esc(field.name) + "\" value=\"" + R.esc(value) + "\"" +
              (field.type === "number" ? " min=\"1\" step=\"1\"" : "") + ">";
    }

    html += "<p class=\"field__error\" id=\"error-" + R.esc(field.name) + "\" role=\"alert\"></p>";
    return html + "</div>";
  }

  /* ------------------------------------------------------------- step 3 */
  function matchPanelHtml() {
    var schools = matchSchools(data.sector);
    var size = cohortSize(schools);
    var when = nextWindow(schools);

    var names = "";
    for (var i = 0; i < schools.length; i++) {
      names += "<li class=\"match__school\">" + R.esc(schools[i].name) +
               " <span class=\"match__window\">" + R.esc(schools[i].availability_window) +
               "</span></li>";
    }

    return "<div class=\"match\">" +
      "<p class=\"eyebrow\">What we can tell you now</p>" +
      "<h3 class=\"match__title\">Before you send anything, here is what your answers match</h3>" +
      "<p class=\"match__lead\">Computed from the schools' current cohorts and the drives " +
        "already scheduled. Nothing has been submitted yet.</p>" +

      "<div class=\"figure-row\">" +
        "<div class=\"figure-block\">" +
          "<span class=\"figure-block__value\">" + R.esc(R.fig(schools.length)) + "</span>" +
          "<span class=\"figure-block__caption t-label\">Schools that match</span>" +
        "</div>" +
        "<div class=\"figure-block\">" +
          "<span class=\"figure-block__value\">" + R.esc(R.fig(size)) + "</span>" +
          "<span class=\"figure-block__caption t-label\">Students seeking placement</span>" +
        "</div>" +
        "<div class=\"figure-block\">" +
          "<span class=\"figure-block__value figure-block__value--date\">" +
            R.esc(R.fig(when, "date")) + "</span>" +
          "<span class=\"figure-block__caption t-label\">Next window closes</span>" +
        "</div>" +
      "</div>" +
      "<p class=\"cohort-stamp t-caption\">" + R.esc(R.stamp()) + "</p>" +

      "<ul class=\"match__list\">" + names + "</ul>" +
      "<p class=\"t-caption match__note\">Cohort sizes are the students seeking placement " +
        "through the university, not the full graduating class. Availability windows are " +
        "when each school's students are free to interview.</p>" +
    "</div>";
  }

  /* -------------------------------------------------------------- render */
  function stepFields(n) {
    var s = F.steps[n - 1];
    return s.fields || [];
  }

  function render() {
    var s = F.steps[step - 1];
    var html = "";

    html += "<p class=\"eyebrow\">Step " + step + " of " + TOTAL + "</p>";
    html += "<h2 class=\"section-head__title\" id=\"step-title\" tabindex=\"-1\">" +
            R.esc(s.legend) + "</h2>";
    html += "<ol class=\"progress\">";
    for (var i = 0; i < F.steps.length; i++) {
      html += "<li class=\"progress__item" + (i + 1 === step ? " progress__item--current" : "") +
              "\"" + (i + 1 === step ? " aria-current=\"step\"" : "") + ">" +
              R.esc(F.steps[i].legend) + "</li>";
    }
    html += "</ol>";

    if (s.id === "cohort_match") {
      html += matchPanelHtml();
    } else {
      html += "<div class=\"form__grid\">";
      var fields = stepFields(step);
      for (var f = 0; f < fields.length; f++) { html += fieldHtml(fields[f]); }
      html += "</div>";
    }

    /* "Information only" never sees a form. */
    if (step === 1 && data.intent === "info") {
      html += infoOnlyHtml();
    }

    html += "<div class=\"hero__actions\">";
    if (step > 1) {
      html += "<button type=\"button\" class=\"pill pill--quiet\" data-back>Go back a step</button>";
    }
    if (!(step === 1 && data.intent === "info")) {
      html += step === TOTAL
        ? "<button type=\"submit\" class=\"pill\">Send the hiring request</button>"
        : "<button type=\"button\" class=\"pill\" data-next>Continue</button>";
    }
    html += "</div>";

    doc.getElementById("intake-step").innerHTML = html;
    wire();
  }

  function infoOnlyHtml() {
    var html = "<div class=\"match\">" +
      "<p class=\"eyebrow\">No form needed</p>" +
      "<h3 class=\"match__title\">Here are the answers, without a form</h3>" +
      "<ul class=\"match__list\">";
    for (var i = 0; i < F.service_levels.length; i++) {
      html += "<li class=\"match__school\">" + R.esc(F.service_levels[i].what) +
              " <span class=\"match__window\">" + R.esc(F.service_levels[i].within) + "</span></li>";
    }
    html += "</ul>" +
      "<p class=\"match__lead\">There is no charge for any of it. Write to " +
      "<a href=\"mailto:" + R.esc(RVU.meta.contact_email) + "\">" +
      R.esc(RVU.meta.contact_email) + "</a> when you want to go further, or read " +
      "<a href=\"recruiters.html#how-it-works\">how hiring here works</a>.</p></div>";
    return html;
  }

  function collect() {
    var fields = stepFields(step);
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.type === "radio") {
        var checked = doc.querySelector("input[name=\"" + f.name + "\"]:checked");
        if (checked) { data[f.name] = checked.value; }
      } else {
        var node = doc.getElementById("f-" + f.name);
        if (node) { data[f.name] = node.value; }
      }
    }
  }

  function validateStep() {
    var errors = [], fields = stepFields(step);
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (!f.required) { continue; }
      var v = data[f.name];
      if (v === undefined || v === null || String(v).trim() === "") {
        errors.push({ field: f.name, message: "Add your " + f.label.toLowerCase() +
                      " so the office can act on this without emailing you back." });
      } else if (f.type === "email" && String(v).indexOf("@") === -1) {
        errors.push({ field: f.name, message: "Include the @ so we can reply — for example name@company.com." });
      } else if (f.type === "number" && (isNaN(Number(v)) || Number(v) < 1)) {
        errors.push({ field: f.name, message: "Enter how many positions you are hiring for, as a number." });
      }
    }
    return errors;
  }

  function showErrors(errors) {
    var all = doc.querySelectorAll(".field__error");
    for (var i = 0; i < all.length; i++) { all[i].textContent = ""; }
    for (var j = 0; j < errors.length; j++) {
      var slot = doc.getElementById("error-" + errors[j].field);
      if (slot) { slot.textContent = errors[j].message; }
      var input = doc.getElementById("f-" + errors[j].field) ||
                  doc.querySelector("[name=\"" + errors[j].field + "\"]");
      if (input) { input.setAttribute("aria-invalid", "true"); }
    }
    if (errors.length) {
      var first = doc.getElementById("f-" + errors[0].field) ||
                  doc.querySelector("[name=\"" + errors[0].field + "\"]");
      if (first) { first.focus(); }
    }
  }

  function next() {
    collect();
    var errors = validateStep();
    if (errors.length) { showErrors(errors); return; }
    if (step < TOTAL) { step++; render(); focusHeading(); }
  }

  function back() {
    collect();                 // keep what is on screen before stepping away
    if (step > 1) { step--; render(); focusHeading(); }
  }

  function focusHeading() {
    var h = doc.getElementById("step-title");
    if (h) { h.focus(); }
  }

  /* The payload is keyed by the sheet columns, so the office can paste it
     straight into the working sheet. */
  function payload() {
    var out = { submitted_at: new Date().toISOString(), source: "rvu-placements-site" };
    for (var s = 0; s < F.steps.length; s++) {
      var fields = F.steps[s].fields || [];
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (f.sheet_column) { out[f.sheet_column] = data[f.name] === undefined ? null : data[f.name]; }
      }
    }
    var schools = matchSchools(data.sector);
    out["Matched schools"] = schools.map(function (x) { return x.name; }).join("; ");
    out["Matched cohort size"] = cohortSize(schools);
    return out;
  }

  function submit(event) {
    event.preventDefault();
    collect();
    var errors = validateStep();
    if (errors.length) { showErrors(errors); return; }

    var p = payload();
    if (global.console) {
      console.info("RVU hiring request — payload shaped for the Corporate Relations sheet:");
      console.info(JSON.stringify(p, null, 2));
    }

    var schools = matchSchools(data.sector);
    var when = nextWindow(schools);

    var html = "<p class=\"eyebrow\">Request received</p>" +
      "<h2 class=\"result__headline\">Thank you — here is what happens next, and when</h2>" +
      "<ol class=\"result__actions result__actions--ordered\">";
    for (var i = 0; i < F.service_levels.length; i++) {
      html += "<li>" + R.esc(F.service_levels[i].what) + " — <strong>" +
              R.esc(F.service_levels[i].within) + "</strong></li>";
    }
    html += "</ol>" +
      "<p class=\"result__line\"><span class=\"result__key t-label\">Your cohort</span>" +
        R.esc(String(schools.length)) + " schools, " + R.esc(R.fig(cohortSize(schools))) +
        " students seeking placement, next window closing " + R.esc(R.fig(when, "date")) + "</p>" +
      "<p class=\"result__line\"><span class=\"result__key t-label\">Your contact</span>" +
        "Corporate &amp; Alumni Relations, RV University — " +
        "<a href=\"mailto:" + R.esc(RVU.meta.contact_email) + "\">" +
        R.esc(RVU.meta.contact_email) + "</a></p>" +
      "<p class=\"cohort-stamp t-caption\">" + R.esc(R.stamp()) + "</p>" +
      "<p class=\"t-caption result__note\">These are target service levels, not a contract. " +
        "Nothing was sent anywhere: this build has no server, and your answers were written " +
        "to the browser console in the shape the office's sheet expects.</p>" +
      "<p class=\"hero__actions\"><a class=\"pill\" href=\"recruiters.html\">Back to recruiter information</a></p>";

    doc.getElementById("intake-step").innerHTML = html;
    doc.getElementById("intake-form").setAttribute("data-complete", "true");
    focusHeadingAfterSubmit();
  }

  function focusHeadingAfterSubmit() {
    var h = doc.querySelector(".result__headline");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
  }

  function wire() {
    var n = doc.querySelector("[data-next]"); if (n) { n.addEventListener("click", next); }
    var b = doc.querySelector("[data-back]"); if (b) { b.addEventListener("click", back); }
    var intent = doc.querySelectorAll("input[name=\"intent\"]");
    for (var i = 0; i < intent.length; i++) {
      intent[i].addEventListener("change", function (e) {
        data.intent = e.target.value; render();
      });
    }
    var sector = doc.getElementById("f-sector");
    if (sector) { sector.addEventListener("change", function (e) { data.sector = e.target.value; }); }
  }

  function init() {
    if (!doc.getElementById("intake-form")) { return; }
    R = RVU.render;
    F = RVU.intakeFields;

    var m = global.location.search.match(/intent=([^&]+)/);
    if (m) { data.intent = decodeURIComponent(m[1]); }

    doc.getElementById("intake-form").addEventListener("submit", submit);
    render();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else { init(); }

}(typeof window !== "undefined" ? window : globalThis));
