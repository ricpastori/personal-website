// _mermaid-init.js
// Mermaid init (expects Mermaid UMD on window.mermaid via CDN).
// Markup expected (from your render hook):
//
// <figure class="diagram diagram--mermaid">
//   <pre class="mermaid">
//     <code class="diagram--source">...mermaid source...</code>
//   </pre>
//   <figcaption>...</figcaption>
// </figure>
//
// Goals:
// - Render INSIDE <pre class="mermaid"> (so your existing CSS keeps working).
// - Keep a stable source-of-truth for rerenders (theme change), even though Mermaid replaces <pre> content.
// - Avoid parsing Mermaid's own injected SVG/CSS on rerender.
// - ES5 compatible (IE10+).

(function () {
  function resolveMermaidTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "dark") return "dark";
    if (t === "light") return "default";

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "default";
  }

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList || []);
  }

  function normalizeNewlines(s) {
    return (s || "").replace(/\r\n/g, "\n");
  }

  function sanitizeSource(s) {
    // Keep it minimal: Mermaid is sensitive, so avoid fancy transformations.
    s = s || "";
    s = s.replace(/^\uFEFF/, "");  // strip BOM
    s = s.replace(/\u00A0/g, " "); // NBSP -> space
    s = normalizeNewlines(s);
    return s;
  }

  function getTargets() {
    // IMPORTANT: Only our Mermaid blocks (pre.mermaid). Mermaid will replace content,
    // so we need to persist the source on the <pre>.
    return toArray(document.querySelectorAll("figure.diagram--mermaid > pre.mermaid"));
  }

  function initMermaid() {
    // Initialize per render batch, so theme changes apply correctly.
    window.mermaid.initialize({
      startOnLoad: false,
      theme: resolveMermaidTheme(),
      suppressErrorRendering: true,
      flowchart: {
        htmlLabels: false,
        useMaxWidth: true
      },
      themeVariables: {
        fontSize: "16px",
        fontFamily: "inherit"
      }
    });
  }

  function getOrCaptureSource(pre) {
    // Source-of-truth must survive Mermaid replacing the <pre> contents.
    // We store it as a DOM attribute AFTER reading it once from <code.diagram--source>.
    var saved = pre.getAttribute("data-mermaid-src");
    if (saved && saved.length) return saved;

    var code = pre.querySelector("code.diagram--source");
    var src = "";

    if (code) {
      src = code.textContent || "";
    } else {
      // Fallback: if the code node isn't there for any reason.
      src = pre.textContent || "";
    }

    src = sanitizeSource(src);

    // Store on the <pre> (JS writes it, so no Hugo attribute-safety issues).
    pre.setAttribute("data-mermaid-src", src);

    return src;
  }

  function restoreSource(pre, src) {
    // Mermaid expects the raw source as the node's textContent.
    // This also wipes any previous SVG that Mermaid injected.
    pre.textContent = src;
  }

  function renderOne(pre, index) {
    var src = getOrCaptureSource(pre);

    // Guard: empty blocks should be no-ops
    if (!src || !src.replace(/\s+/g, "").length) {
      return Promise.resolve();
    }

    // Always restore before parse/run to prevent parsing injected SVG/CSS.
    restoreSource(pre, src);

    return window.mermaid
      .parse(src)
      .then(function () {
        // Restore again to ensure Mermaid sees only source.
        restoreSource(pre, src);

        // Render only this node
        return window.mermaid.run({ nodes: [pre] });
      })
      .catch(function (err) {
        // Keep source restored (still hidden visually by your CSS if needed).
        restoreSource(pre, src);

        console.groupCollapsed("[Mermaid] Syntax error (block #" + (index + 1) + ")");
        console.error(err);
        console.info("Diagram source:");
        console.log(src);
        console.groupEnd();
      });
  }

  function renderAll() {
    if (!window.mermaid) {
      console.warn("[Mermaid] Mermaid not loaded (window.mermaid is missing).");
      return;
    }

    var targets = getTargets();
    if (!targets.length) return;

    initMermaid();

    // Render sequentially for stability and predictable DOM mutation.
    var chain = Promise.resolve();
    for (var i = 0; i < targets.length; i++) {
      (function (el, idx) {
        chain = chain.then(function () {
          return renderOne(el, idx);
        });
      })(targets[i], i);
    }
  }

  function boot() {
    // CDN can be slow; wait briefly without async/await (IE10-safe).
    var tries = 0;

    (function tick() {
      tries++;

      if (window.mermaid) {
        renderAll();
        return;
      }

      if (tries < 30) {
        setTimeout(tick, 50);
      } else {
        console.warn("[Mermaid] Mermaid not available after waiting; diagrams will remain as source.");
      }
    })();
  }

  // Debounced rerender on theme change
  var raf = 0;
  function scheduleRerender() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0;
      renderAll();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    boot();
  });

  document.addEventListener("themechange", function () {
    scheduleRerender();
  });
})();