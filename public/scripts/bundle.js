(function () {
  var DURATION = 220;
  var EASING = "ease-out";
  var running = typeof WeakMap === "function" ? new WeakMap() : null;

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function closest(el, selector) {
    if (!el || el.nodeType !== 1) return null;
    if (el.closest) return el.closest(selector);
    while (el && el.nodeType === 1) {
      if (el.matches && el.matches(selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function getContent(details) {
    return details.querySelector(".accordion__content");
  }

  function cancel(details) {
    if (!running) return;
    var anim = running.get(details);
    if (anim) {
      anim.cancel();
      running.delete(details);
    }
  }

  function animateOpen(details) {
    var content = getContent(details);
    if (!content) return;

    cancel(details);

    details.setAttribute("open", "");

    content.style.overflow = "hidden";
    content.style.height = "0px";
    content.offsetHeight;

    var target = content.scrollHeight;

    var anim = content.animate(
      [{ height: "0px" }, { height: target + "px" }],
      { duration: DURATION, easing: EASING }
    );

    if (running) running.set(details, anim);

    anim.onfinish = function () {
      content.style.height = "";
      content.style.overflow = "";
      if (running) running.delete(details);
    };

    anim.oncancel = function () {
      content.style.height = "";
      content.style.overflow = "";
      if (running) running.delete(details);
    };
  }

  function animateClose(details) {
    var content = getContent(details);
    if (!content) return;

    cancel(details);

    // Keep open while animating so content stays measurable.
    details.setAttribute("open", "");

    content.style.overflow = "hidden";
    var start = content.scrollHeight;

    content.style.height = start + "px";
    content.offsetHeight;

    var anim = content.animate(
      [{ height: start + "px" }, { height: "0px" }],
      { duration: DURATION, easing: EASING }
    );

    if (running) running.set(details, anim);

    anim.onfinish = function () {
      details.removeAttribute("open");
      content.style.height = "";
      content.style.overflow = "";
      if (running) running.delete(details);
    };

    anim.oncancel = function () {
      content.style.height = "";
      content.style.overflow = "";
      if (running) running.delete(details);
    };
  }

  function toggleWithAnimation(event) {
    var target = event.target;
    if (!target || target.nodeType !== 1) return;

    var summary = closest(target, ".accordion__summary");
    if (!summary) return;

    var details = closest(summary, "details.accordion__item");
    if (!details) return;

    if (reducedMotion()) return;
    if (!Element.prototype.animate) return;

    // We control the toggle.
    event.preventDefault();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    event.stopPropagation();

    if (details.hasAttribute("open")) animateClose(details);
    else animateOpen(details);
  }

  // 1) Animate on pointerdown (feels immediate).
  document.addEventListener("pointerdown", toggleWithAnimation, true);

  // 2) Block the native toggle that would happen on click after pointerdown.
  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || target.nodeType !== 1) return;

      var summary = closest(target, ".accordion__summary");
      if (!summary) return;

      if (reducedMotion()) return;
      if (!Element.prototype.animate) return;

      event.preventDefault();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      event.stopPropagation();
    },
    true
  );

  // 3) Keyboard support (Space/Enter).
  document.addEventListener(
    "keydown",
    function (event) {
      if (!(event.key === "Enter" || event.key === " ")) return;

      var target = event.target;
      if (!target || target.nodeType !== 1) return;

      var summary = closest(target, ".accordion__summary");
      if (!summary) return;

      toggleWithAnimation(event);
    },
    true
  );
})();
;
(function () {
  var root = document.documentElement;

  function markEntered() {
    // Use an attribute so className resets won’t break the state.
    root.setAttribute("data-entered", "true");

    // Keep the class too (useful for debugging), but don’t rely on it.
    root.classList.add("is-entered");
  }

  function enter() {
    if ("requestAnimationFrame" in window) {
      requestAnimationFrame(markEntered);
    } else {
      // IE10 fallback
      markEntered();
    }
  }

  // Guard: if some script overwrites <html class="...">, re-add is-entered.
  // (data-entered stays even if className is reset.)
  if ("MutationObserver" in window) {
    var obs = new MutationObserver(function () {
      if (root.getAttribute("data-entered") === "true" && !root.classList.contains("is-entered")) {
        root.classList.add("is-entered");
      }
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enter);
  } else {
    enter();
  }

  // Safety: if we didn't enter, disable the animation layer.
  window.setTimeout(function () {
    if (root.getAttribute("data-entered") !== "true") {
      root.classList.add("no-anim");
    }
  }, 1200);
})();
;
(function () {
  var root = document.documentElement;
  var switcher = document.querySelector(".theme-switcher");
  if (!switcher) return;

  function applyTheme(theme) {
    if (theme === "system" || !theme) {
      root.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      root.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }

  function themeToIndex(theme) {
    if (theme === "light") return 1;
    if (theme === "dark") return 2;
    return 0; // system
  }

  switcher.classList.remove("is-animating");
  void switcher.offsetWidth; // reflow to restart animation
  switcher.classList.add("is-animating");

  function withThemeTransition(fn) {
  var root = document.documentElement;

  // Add class to enable transitions
  root.classList.add("theme-is-switching");

  // Run theme change in next frame to ensure the class is applied first
  requestAnimationFrame(function () {
    fn();

    // Remove the class after the transition window
    window.setTimeout(function () {
      root.classList.remove("theme-is-switching");
    }, 320); // slightly > 260ms
  });
}

  function syncUI(theme) {
    var active = theme || localStorage.getItem("theme") || "system";

    // aria-pressed
    document.querySelectorAll("[data-set-theme]").forEach(function (b) {
      var t = b.getAttribute("data-set-theme");
      b.setAttribute("aria-pressed", t === active ? "true" : "false");
    });

    // bubble index
    switcher.style.setProperty("--active-index", String(themeToIndex(active)));
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-set-theme]");
    if (!btn) return;

    var theme = btn.getAttribute("data-set-theme");
    
    withThemeTransition(function () {
      applyTheme(theme);
      syncUI(theme); // aria-pressed + bubble index
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    var saved = localStorage.getItem("theme"); // "light" | "dark" | null
    applyTheme(saved);
    syncUI(saved || "system");
  });
})();