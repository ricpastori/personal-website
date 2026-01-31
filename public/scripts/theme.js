(function () {
    var root = document.documentElement;

    function applyTheme(theme) {
      if (theme === "system" || !theme) {
        root.removeAttribute("data-theme");
        localStorage.removeItem("theme");
      } else {
        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
      }
    }

    function syncButtons(currentTheme) {
      var activeTheme = currentTheme || localStorage.getItem("theme") || "system";

      document.querySelectorAll("[data-set-theme]").forEach(function (b) {
        var t = b.getAttribute("data-set-theme");
        var isActive = t === activeTheme;
        b.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    // Al click su un qualunque bottone con data-set-theme
    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-set-theme]");
      if (!btn) return;

      var theme = btn.getAttribute("data-set-theme");
      applyTheme(theme);
      syncButtons(theme);
    });

    // All'avvio: applica tema salvato e stato aria-pressed corretto
    document.addEventListener("DOMContentLoaded", function () {
      var saved = localStorage.getItem("theme");
      applyTheme(saved);
      syncButtons(saved);
    });
  })();