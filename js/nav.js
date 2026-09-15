/* ===========================================================================
   nav.js — the mega-menu's behaviour.

   Desktop: hover or focus opens a panel. Escape closes and returns focus to
   the trigger. Arrow keys move within an open panel.

   Below 900px there is no hover, so the same markup becomes a disclosure
   list: the trigger toggles on click and the panel stays in flow. A hover
   menu on a touch screen is a menu that opens when you are trying to follow
   the link.
   =========================================================================== */
(function (global) {
  "use strict";
  var doc = global.document;
  if (!doc) { return; }

  var TOUCH_QUERY = "(max-width: 900px)";

  function init() {
    var nav = doc.querySelector(".mega");
    if (!nav) { return; }

    var items = nav.querySelectorAll("[data-mega-item]");
    var openItem = null;

    function isCollapsed() {
      return global.matchMedia && global.matchMedia(TOUCH_QUERY).matches;
    }

    function panelOf(item) { return item.querySelector("[data-mega-panel]"); }
    function triggerOf(item) { return item.querySelector("[data-mega-trigger]"); }

    function close(item) {
      if (!item) { return; }
      panelOf(item).hidden = true;
      triggerOf(item).setAttribute("aria-expanded", "false");
      if (openItem === item) { openItem = null; }
    }

    function closeAll() {
      for (var i = 0; i < items.length; i++) { close(items[i]); }
    }

    function open(item) {
      if (openItem && openItem !== item) { close(openItem); }
      panelOf(item).hidden = false;
      triggerOf(item).setAttribute("aria-expanded", "true");
      openItem = item;
    }

    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var trigger = triggerOf(item);
        var panel = panelOf(item);

        /* Hover only where hovering exists. */
        item.addEventListener("mouseenter", function () {
          if (!isCollapsed()) { open(item); }
        });
        item.addEventListener("mouseleave", function () {
          if (!isCollapsed()) { close(item); }
        });

        /* Focusing the trigger opens the panel on desktop, so a keyboard user
           sees the same thing a mouse user does. */
        trigger.addEventListener("focus", function () {
          if (!isCollapsed()) { open(item); }
        });

        /* On a touch layout the trigger is a disclosure: first activation
           opens, second follows the link. */
        trigger.addEventListener("click", function (e) {
          if (!isCollapsed()) { return; }
          if (panel.hidden) { e.preventDefault(); open(item); }
        });

        trigger.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown") {
            e.preventDefault(); open(item);
            var first = panel.querySelector(".mega__link");
            if (first) { first.focus(); }
          } else if (e.key === "Escape") {
            close(item);
          }
        });

        panel.addEventListener("keydown", function (e) {
          var links = panel.querySelectorAll(".mega__link");
          var at = -1, k;
          for (k = 0; k < links.length; k++) { if (links[k] === doc.activeElement) { at = k; } }

          if (e.key === "Escape") {
            e.preventDefault(); close(item); trigger.focus();      // focus returns
          } else if (e.key === "ArrowDown" && at > -1) {
            e.preventDefault(); links[Math.min(at + 1, links.length - 1)].focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (at <= 0) { trigger.focus(); } else { links[at - 1].focus(); }
          } else if (e.key === "Home") {
            e.preventDefault(); links[0].focus();
          } else if (e.key === "End") {
            e.preventDefault(); links[links.length - 1].focus();
          }
        });

        /* Tabbing out of the whole item closes it. */
        item.addEventListener("focusout", function (e) {
          if (!item.contains(e.relatedTarget)) { close(item); }
        });
      }(items[i]));
    }

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openItem) {
        var t = triggerOf(openItem);
        closeAll();
        if (t) { t.focus(); }
      }
    });

    /* A layout change between hover and disclosure must not strand an open
       panel in the wrong mode. */
    if (global.matchMedia) {
      var mq = global.matchMedia(TOUCH_QUERY);
      var onChange = function () { closeAll(); };
      if (mq.addEventListener) { mq.addEventListener("change", onChange); }
      else if (mq.addListener) { mq.addListener(onChange); }
    }
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else { init(); }

}(typeof window !== "undefined" ? window : globalThis));
