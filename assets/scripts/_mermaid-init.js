// _mermaid-init.js
(function () {
  "use strict";

  function resolveTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "dark") return "dark";
    if (t === "light") return "default";

    if (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "default";
  }

  // Decode HTML entities without touching layout.
  function decodeEntities(str) {
    if (!str || str.indexOf("&") === -1) return str;
    var ta = document.createElement("textarea");
    ta.innerHTML = str;
    return ta.value;
  }

  function getSource(pre) {
    var cached = pre.getAttribute("data-mermaid-src");
    if (cached) return cached;

    var code = pre.querySelector(".diagram--source");
    if (!code) return "";

    var src = code.textContent || "";
    src = decodeEntities(src);
    src = src.replace(/^\uFEFF/, ""); // strip BOM if any

    pre.setAttribute("data-mermaid-src", src);
    return src;
  }

  function cleanup(pre) {
    // Remove previously rendered SVGs (re-render on theme change)
    var svgs = pre.querySelectorAll("svg");
    for (var i = 0; i < svgs.length; i++) {
      svgs[i].parentNode.removeChild(svgs[i]);
    }
  }

  function insertSvg(pre, svgText) {
    var wrap = document.createElement("div");
    wrap.innerHTML = svgText;

    var svg = wrap.querySelector("svg");
    if (!svg) return;

    // Responsive: let CSS control scaling (max-width:100%), do NOT force width:100%.
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Keep it a block element and center it (CSS also does this; OK to double).
    svg.style.display = "block";
    svg.style.height = "auto";
    svg.style.maxWidth = "100%";
    svg.style.margin = "0 auto";

    var code = pre.querySelector(".diagram--source");
    if (code && code.parentNode === pre) {
      pre.insertBefore(svg, code);
    } else {
      pre.appendChild(svg);
    }
  }

  function renderOne(pre, index) {
    var src = getSource(pre);
    if (!src || !src.replace(/\s+/g, "").length) return Promise.resolve();

    cleanup(pre);

    var id = "mmd-" + Date.now() + "-" + index;

    return window.mermaid
      .render(id, src)
      .then(function (res) {
        insertSvg(pre, res.svg);
        // bindFunctions can be undefined depending on build
        if (res && res.bindFunctions) {
          // pass the SVG node if needed; some builds accept element, others accept id
          try { res.bindFunctions(document.getElementById(id)); } catch (e) {}
        }
      })
      .catch(function (err) {
        console.groupCollapsed("[Mermaid] Render error (block #" + (index + 1) + ")");
        console.error(err);
        console.info("Diagram source:");
        console.log(src);
        console.groupEnd();
      });
  }

  function renderAll() {
    if (!window.mermaid) {
      if (window.console && console.warn) {
        console.warn("[Mermaid] Mermaid not loaded (window.mermaid missing).");
      }
      return;
    }

    window.mermaid.initialize({
      startOnLoad: false,
      theme: resolveTheme(),
      suppressErrorRendering: true
    });

    var pres = document.querySelectorAll("figure.diagram--mermaid pre.mermaid");
    if (!pres || !pres.length) return;

    // Render sequentially to avoid race conditions on slower browsers.
    var chain = Promise.resolve();
    for (var i = 0; i < pres.length; i++) {
      (function (pre, idx) {
        chain = chain.then(function () {
          return renderOne(pre, idx);
        });
      })(pres[i], i);
    }
  }

  document.addEventListener("DOMContentLoaded", renderAll);
  document.addEventListener("themechange", renderAll);
})();