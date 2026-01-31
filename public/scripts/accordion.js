(() => {
  const DURATION = 220;
  const EASING = "ease-out";

  /** @type {WeakMap<HTMLDetailsElement, Animation>} */
  const running = new WeakMap();

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** @param {HTMLDetailsElement} el */
  function cancel(el) {
    const anim = running.get(el);
    if (anim) {
      anim.cancel();
      running.delete(el);
    }
  }

  /**
   * Animates a <details> element between its closed and open heights.
   * We keep "open" present until the end when closing.
   * @param {HTMLDetailsElement} details
   * @param {boolean} toOpen
   */
  function animateDetails(details, toOpen) {
    // Respect reduced motion or lack of Web Animations API.
    if (reducedMotion() || typeof details.animate !== "function") {
      if (toOpen) details.setAttribute("open", "");
      else details.removeAttribute("open");
      return;
    }

    cancel(details);

    const startHeight = details.offsetHeight;

    if (toOpen) {
      details.setAttribute("open", "");
    }

    // Force layout so the new state is measurable.
    // eslint-disable-next-line no-unused-expressions
    details.offsetHeight;

    const endHeight = details.offsetHeight;

    // If closing, we still need open during the animation to keep content in layout.
    if (!toOpen) {
      // Ensure it's open while we animate closed.
      details.setAttribute("open", "");
    }

    // Lock height to start value to avoid jumps.
    details.style.height = `${startHeight}px`;
    details.style.overflow = "hidden";

    // Force layout after setting height.
    // eslint-disable-next-line no-unused-expressions
    details.offsetHeight;

    const anim = details.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: DURATION, easing: EASING }
    );

    running.set(details, anim);

    anim.onfinish = () => {
      // Cleanup inline styles.
      details.style.height = "";
      details.style.overflow = "";

      if (!toOpen) {
        details.removeAttribute("open");
      }

      running.delete(details);
    };

    anim.oncancel = () => {
      details.style.height = "";
      details.style.overflow = "";
      running.delete(details);
    };
  }

  function handleToggleIntent(event, summary) {
    /** @type {HTMLDetailsElement|null} */
    const details = summary.closest("details.accordion__item");
    if (!details) return;

    // We take control of the toggle to animate it.
    event.preventDefault();

    const isOpen = details.hasAttribute("open");
    animateDetails(details, !isOpen);
  }

  // Pointer: best for avoiding native toggle timing issues.
  document.addEventListener("pointerdown", (event) => {
    /** @type {HTMLElement|null} */
    const summary = event.target instanceof HTMLElement
      ? event.target.closest("summary.accordion__summary")
      : null;

    if (!summary) return;
    handleToggleIntent(event, summary);
  });

  // Keyboard: Space/Enter should behave like click.
  document.addEventListener("keydown", (event) => {
    if (!(event.key === "Enter" || event.key === " ")) return;

    /** @type {HTMLElement|null} */
    const summary = event.target instanceof HTMLElement
      ? event.target.closest("summary.accordion__summary")
      : null;

    if (!summary) return;
    handleToggleIntent(event, summary);
  });
})();