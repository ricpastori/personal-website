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