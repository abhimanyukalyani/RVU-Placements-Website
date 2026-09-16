/* ===========================================================================
   motion.js — the whole motion budget. Four primitives, no library.

     1 · scroll-linked bar fill, which locks permanently once full
     2 · section reveal, once per section, on first entry
     3 · the recruiter ticker's pause-on-hover/focus (the loop itself is CSS)
     4 · the figure count-up, which lands on the exact rendered value

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
  /* The band pauses in CSS — .ticker:hover and .ticker:focus-within set
     animation-play-state — so it stops for a mouse and for a Tab key without
     this file, and it keeps stopping if this file fails to load. There is
     nothing here to wire, which is the point: the primitive is real, its
     implementation is one rule in components.css. */

  /* ----------------------------------------------- 4 · the figure count-up */
  /* A figure counts from zero to the value already in the markup, once, on
     first entry. Three things make it safe to show a number that is briefly
     wrong (CLAUDE.md §J.4):

     1. The final value is never computed. It is read out of the DOM, kept
        verbatim, and written back at the end, so the number that settles is
        byte-identical to what render.js produced from data/. The animation
        can only ever be wrong in the middle, never at rest.
     2. It never runs on anything that is not a single number. A bracketed
        placeholder has nothing to count to, and a date is not a quantity —
        both are skipped, so [XXX] and 30 Jun 2026 never animate.
     3. Under prefers-reduced-motion nothing here runs at all, because scan()
        returns before reaching it. The markup's resting state is the final
        value, so deleting this file changes nothing. */

  /* prefix, number, suffix — "₹9.4 LPA" → ["₹", "9.4", " LPA"]. Anchored so a
     string with more than one number (a date) cannot match. */
  var ONE_NUMBER = /^([^\d]*)(\d+(?:\.\d+)?)([^\d]*)$/;

  var COUNT_MS = 1100;
  var STAGGER_MS = 90;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function countUp(el, delay) {
    var raw = el.textContent.trim();
    var m = ONE_NUMBER.exec(raw);
    if (!m) { return; }                       // a date, or no number at all

    var prefix = m[1], digits = m[2], suffix = m[3];
    var target = parseFloat(digits);
    if (!isFinite(target)) { return; }

    var dot = digits.indexOf(".");
    var places = dot === -1 ? 0 : digits.length - dot - 1;

    var started = null;
    function step(now) {
      if (started === null) { started = now; }
      var t = (now - started - delay) / COUNT_MS;
      if (t < 0) { global.requestAnimationFrame(step); return; }
      if (t >= 1) {
        el.textContent = raw;                 // the exact original string
        el.removeAttribute("data-counting");
        return;
      }
      var v = target * easeOutCubic(t);
      el.textContent = prefix + v.toFixed(places) + suffix;
      global.requestAnimationFrame(step);
    }

    el.setAttribute("data-counting", "true");
    el.textContent = prefix + (0).toFixed(places) + suffix;
    global.requestAnimationFrame(step);
  }

  var countObserver = null;

  /* Nothing counts until the reader has actually scrolled. The hub's figure
     row sits close enough to the top that the observer fired on load and the
     numbers were already climbing before anyone had touched the page — an
     effect nobody saw, on a figure they had not looked at yet.

     Deferring the observer, rather than the animation, is what keeps this
     safe: countUp() is the only thing that writes a zero, and it cannot run
     until the observer arms. A reader who never scrolls, or a page too short
     to scroll, simply keeps the real figure on screen the whole time. */
  var hasScrolled = false;
  var waitingOnScroll = [];

  function onFirstScroll() {
    if (hasScrolled) { return; }
    hasScrolled = true;
    global.removeEventListener("scroll", onFirstScroll);
    while (waitingOnScroll.length) { waitingOnScroll.shift()(); }
  }

  function afterFirstScroll(fn) {
    if (hasScrolled) { fn(); return; }
    waitingOnScroll.push(fn);
    global.addEventListener("scroll", onFirstScroll, { passive: true });
  }

  function observeCounts() { afterFirstScroll(collectCounts); }

  function collectCounts() {
    var all = doc.querySelectorAll(".figure-block__value, .figure-block__max");
    var pending = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.getAttribute("data-count-seen")) { continue; }
      el.setAttribute("data-count-seen", "true");
      if (el.textContent.indexOf("[") !== -1) { continue; }   // a placeholder
      if (!ONE_NUMBER.test(el.textContent.trim())) { continue; }
      pending.push(el);
    }
    if (!pending.length) { return; }

    if (!countObserver) {
      countObserver = new global.IntersectionObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
          if (!entries[e].isIntersecting) { continue; }
          var node = entries[e].target;
          countObserver.unobserve(node);
          /* Figures in one row start a beat apart, left to right, so the row
             reads as a sequence rather than four things twitching at once. */
          countUp(node, Number(node.getAttribute("data-count-order") || 0) * STAGGER_MS);
        }
      }, { threshold: 0.4 });
    }

    /* Order within the row, not the document, so each row restarts the beat. */
    var rows = doc.querySelectorAll(".figure-row");
    for (var r = 0; r < rows.length; r++) {
      var vals = rows[r].querySelectorAll(".figure-block__value, .figure-block__max");
      for (var v = 0; v < vals.length; v++) {
        vals[v].setAttribute("data-count-order", String(v));
      }
    }

    for (var p = 0; p < pending.length; p++) { countObserver.observe(pending[p]); }
  }

  function scan() {
    if (REDUCED) { return; }      // bars and sections are already in final state
    observeBars();
    observeReveals();
    observeCounts();
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
