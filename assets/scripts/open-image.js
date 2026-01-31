(function () {
  var overlay, img;

  function open(src) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "img-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");

      img = document.createElement("img");
      overlay.appendChild(img);

      overlay.addEventListener("click", close);
      document.addEventListener("keydown", onKey);

      document.body.appendChild(overlay);
    }

    img.src = src;
    overlay.classList.add("is-open");
  }

  function close() {
    overlay.classList.remove("is-open");
    img.removeAttribute("src");
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  document.addEventListener("click", function (e) {
    var pic = e.target.closest("picture[data-full]");
    if (!pic) return;

    open(pic.getAttribute("data-full"));
  });
})();