/* ===========================================================================
   motion.js — the whole motion budget. Three primitives, no library.

     1 · scroll-linked bar fill, which locks permanently once full
     2 · section reveal, once per section, on first entry
     3 · the recruiter ticker's pause-on-hover/focus (the loop itself is CSS)

   Two rules govern everything here:

   Nothing is hidden by CSS alone. Every element is at its resting, readable
   state by default; JS only offsets something at the moment it has committed
   to animating it back. Delete this file and the site reads exactly the same,
   with every bar full and every section visible.

   prefers-reduced-motion is checked once, at the top. Under it this file
   observes nothing and writes nothing — the markup's own resting state is the
   final state, so no information is lost (CLAUDE.md §G, §J).
   =========================================================================== */
(function (global) {
  "use strict";

  var doc = global.document;
  if (!doc) { return; }

  var REDUCED = global.matchMedia &&
                global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Progress hits 1 when the element's top reaches this fraction of the
     viewport, so a bar completes comfortably before it leaves the screen
     rather than only at the very bottom. */
  var COMPLETE_AT = 0.65;

  /* ------------------------------------------------- 1 · scroll-linked bars */

  var tracked = [];          // bars currently mid-fill
  var rafId = null;

  function fillProgress(rect, vh) {
    /* 0 when the top is at the bottom of the viewport, 1 by COMPLETE_AT. */
    var start = vh;
    var end = vh * COMPLETE_AT;
    if (start === end) { return 1; }
    var p = (start - rect.top) / (start - end);
    return p < 0 ? 0 : (p > 1 ? 1 : p);
  }

  function frame() {
    rafId = null;
    if (!tracked.length) { return; }

    var vh = global.innerHeight || doc.documentElement.clientHeight;

    /* Read every rect first, then write every value. Interleaving them makes
       the browser recompute layout once per bar per frame. */
    var reads = [];
    var i;
    for (i = 0; i < tracked.length; i++) {
      reads.push(fillProgress(tracked[i].el.getBoundingClientRect(), vh));
    }

    var still = [];
    for (i = 0; i < tracked.length; i++) {
      var item = tracked[i];
      var p = reads[i];
      if (p >= 1) {
        item.el.style.setProperty("--fill", "1");
        item.el.setAttribute("data-filled", "true");
        if (observer) { observer.unobserve(item.el); }   // never again
      } else {
        item.el.style.setProperty("--fill", String(Math.round(p * 1000) / 1000));
        still.push(item);
      }
    }
    tracked = still;
    if (tracked.length) { rafId = global.requestAnimationFrame(frame); }
  }

  function schedule() {
    if (rafId === null && tracked.length) {
      rafId = global.requestAnimationFrame(frame);
    }
  }

  var observer = null;

  /* Idempotent: a bar already observed, or already full, is left alone. The
     outcomes explorer rebuilds its bars on every tab change and toggle, so
     this runs again each time and must never reset one that has finished. */
  function observeBars() {
    var all = doc.querySelectorAll("[data-fill-bar]");
    var bars = [], k;
    for (k = 0; k < all.length; k++) {
      if (all[k].getAttribute("data-fill-seen") !== "true") { bars.push(all[k]); }
    }
    if (!bars.length) { return; }

    if (!global.IntersectionObserver) {
      /* No observer: show the finished state rather than an empty one. */
      for (var n = 0; n < bars.length; n++) {
        bars[n].style.setProperty("--fill", "1");
        bars[n].setAttribute("data-filled", "true");
      }
      return;
    }

    if (!observer) { observer = new global.IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        var el = entries[e].target;
        if (!entries[e].isIntersecting) { continue; }
        if (el.getAttribute("data-filled") === "true") { continue; }
        var known = false;
        for (var t = 0; t < tracked.length; t++) {
          if (tracked[t].el === el) { known = true; }
        }
        if (!known) { tracked.push({ el: el }); }
      }
      schedule();
    }, { threshold: 0 }); }

    for (var i = 0; i < bars.length; i++) {
      /* Only now does the bar start from zero. Until this line it has been
         sitting at its full, readable width. */
      bars[i].setAttribute("data-fill-seen", "true");
      bars[i].style.setProperty("--fill", "0");
      observer.observe(bars[i]);
    }

    global.addEventListener("scroll", schedule, { passive: true });
    global.addEventListener("resize", schedule, { passive: true });
  }

  /* ------------------------------------------------------ 2 · section reveal */

  function observeReveals() {
    var blocks = doc.querySelectorAll("[data-reveal]");
    if (!blocks.length || !global.IntersectionObserver) { return; }

    var io = new global.IntersectionObserver(function (entries, self) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) { continue; }
        entries[i].target.setAttribute("data-revealed", "true");
        self.unobserve(entries[i].target);               // once, then never
      }
    }, { threshold: 0.06 });

    for (var b = 0; b < blocks.length; b++) {
      if (blocks[b].getAttribute("data-reveal-armed") === "true") { continue; }
      /* The offset is applied here, not in the stylesheet, so a failed script
         leaves the content where it already was: visible. */
      blocks[b].setAttribute("data-reveal-armed", "true");
      io.observe(blocks[b]);
    }
  }

  /* ----------------------------------------------------------- 3 · ticker */

  function wireTicker() {
    var track = doc.querySelector("[data-ticker-track]");
    if (!track) { return; }
    var band = track.parentNode;

    function pause() { band.setAttribute("data-paused", "true"); }
    function play()  { band.removeAttribute("data-paused"); }

    band.addEventListener("mouseenter", pause);
    band.addEventListener("mouseleave", play);
    band.addEventListener("focusin", pause);
    band.addEventListener("focusout", function (e) {
      if (!band.contains(e.relatedTarget)) { play(); }
    });
  }

  function scan() {
    wireTicker();                 // pause-on-focus matters even under reduced motion
    if (REDUCED) { return; }      // bars and sections are already in final state
    observeBars();
    observeReveals();
  }

  /* Pages that mount content after load — the outcomes explorer, the drives
     ledger — call this once they have rendered. Safe to call repeatedly. */
  var RVU = global.RVU = global.RVU || {};
  RVU.motion = { scan: scan };

  function init() { scan(); }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else { init(); }

}(typeof window !== "undefined" ? window : globalThis));
