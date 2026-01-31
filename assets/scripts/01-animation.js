(function () {
  var root = document.documentElement;

  var ATTR = "data-reveal";
  var PENDING = "pending";
  var READY = "ready";
  var OFF = "off";

  var hasEntered = false;

  function set(state) {
    root.setAttribute(ATTR, state);
  }

  function enter() {
    if (hasEntered) return;
    hasEntered = true;

    if ("requestAnimationFrame" in window) {
      requestAnimationFrame(function () {
        set(READY);
      });
    } else {
      // IE10 fallback
      set(READY);
    }
  }

  // Respect reduced motion
  if (window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    set(OFF);
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enter);
  } else {
    enter();
  }

  // Safety: never leave the page hidden
  window.setTimeout(function () {
    if (!hasEntered) {
      set(OFF);
    }
  }, 1200);
})();