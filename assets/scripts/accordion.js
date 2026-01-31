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

  // ---- NEW: animation state classes (CSS micro feel) ----
  function setState(details, isOpening) {
    details.classList.add("is-animating");
    if (isOpening) details.classList.add("is-opening");
    else details.classList.remove("is-opening");
  }

  function clearState(details) {
    details.classList.remove("is-animating");
    details.classList.remove("is-opening");
  }

  function animateOpen(details) {
    var content = getContent(details);
    if (!content) return;

    cancel(details);
    setState(details, true);

    // Open first so content becomes measurable
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
      clearState(details);
      if (running) running.delete(details);
    };

    anim.oncancel = function () {
      content.style.height = "";
      content.style.overflow = "";
      clearState(details);
      if (running) running.delete(details);
    };
  }

  function animateClose(details) {
    var content = getContent(details);
    if (!content) return;

    cancel(details);
    setState(details, false);

    // Keep open while animating so content stays measurable
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
      clearState(details);
      if (running) running.delete(details);
    };

    anim.oncancel = function () {
      content.style.height = "";
      content.style.overflow = "";
      clearState(details);
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

    event.preventDefault();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    event.stopPropagation();

    if (details.hasAttribute("open")) animateClose(details);
    else animateOpen(details);
  }

  document.addEventListener("pointerdown", toggleWithAnimation, true);

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