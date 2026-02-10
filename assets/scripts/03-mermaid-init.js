// Mermaid integration layer.
// CDN-hosted Mermaid, but theme + rerender logic stays local.

function resolveMermaidTheme() {
  var t = document.documentElement.getAttribute("data-theme");

  if (t === "dark") return "dark";
  if (t === "light") return "default";

  // system
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "default";
}

function resetForRerender(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];

    if (!el.getAttribute("data-mermaid-src")) {
      el.setAttribute("data-mermaid-src", el.textContent);
    } else {
      el.textContent = el.getAttribute("data-mermaid-src");
    }

    el.removeAttribute("data-processed");
  }
}

function renderMermaid() {
  if (!window.mermaid) return;

  var nodes = document.querySelectorAll("pre.mermaid");
  if (!nodes.length) return;

  resetForRerender(nodes);

  window.mermaid.initialize({
    startOnLoad: false,
    theme: resolveMermaidTheme()
  });

  window.mermaid.run({ querySelector: "pre.mermaid" });
}

document.addEventListener("DOMContentLoaded", renderMermaid);

var raf = 0;
document.addEventListener("themechange", function () {
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(function () {
    raf = 0;
    renderMermaid();
  });
});