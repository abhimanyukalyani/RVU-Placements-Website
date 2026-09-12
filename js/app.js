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
      R.mount("[data-recruiters]", R.recruiterStrip(RVU.recruiters.sectors));
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
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

}(typeof window !== "undefined" ? window : globalThis));
