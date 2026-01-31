# CSS Style Guide (Modern CSS + Legacy-Readable Fallbacks)

This repository uses **modern CSS** (tokens, theme variables, dynamic viewport units) while ensuring the site remains **readable and usable** on legacy enterprise browsers (baseline: **IE10+**).

**Goal:** graceful degradation (readable layout + content).  
**Non-goal:** pixel-perfect parity on IE10.  
Legacy baseline: **Light theme only**.

---

## 0. Compatibility Philosophy

- **Modern-first** in source.
- **Graceful degradation**: unsupported features may be ignored, but content must remain usable.
- **Critical UI must not depend on custom properties** (IE10 ignores them).
- Modern-only enhancements (dark theme, `accent-color`, `dvh/dvw`, `clamp`) are allowed with sensible fallbacks.

---

## 1. Tokens (Design System via Custom Properties)

Tokens are defined in `:root` and consumed throughout the CSS.

Token categories used in this repo:

- **Colors**: semantic tokens (`--color-background`, `--color-foreground`, `--color-accent`, …)
- **Typography**: font families, weights, line-heights, steps (`--font-body`, `--step-*`, …)
- **Spacing / sizing**: `--size-*`
- **Breakpoints**: `--breakpoint-*`

### Important: Legacy Behavior

IE10 does not support:

- `var(--token)`
- modern color spaces like `oklch()`
- `clamp()`
- logical properties

So tokens exist primarily for modern browsers. **Legacy support is achieved in component rules via explicit fallbacks.**

---

## 2. Variable Fallback Rule (Explicit, Required)

Because IE10 ignores custom properties entirely, **you must not rely on `var()` for critical styling**.

### 2.1 Required Pattern for Critical Styles (Preferred)

For any property affecting readability or layout stability, declare:

1. a literal fallback first (Light theme baseline)
2. the token-based value second

```css
/* Critical: always provide a literal fallback first */
body {
  background-color: #ffffff;
  background-color: var(--color-background);

  color: #111111;
  color: var(--color-foreground);

  font-family: "Segoe UI", Arial, sans-serif;
  font-family: var(--font-sans);
}
```

**Critical styles include:**

- color, background-color
- borders used as separators (border-color, outline-color)
- font-size when it can impact layout readability
- line-height
- primary spacing that prevents overlap/clipping (padding, margin in key layout containers)
- width/height/min/max when essential to layout

### 2.2 Allowed Pattern for Non-Critical Enhancements

`var(--token, fallback)` is allowed for modern browsers only, but it does not help IE10.
Use it only for “polish” (shadows, subtle effects), or in addition to 2.1.

```CSS
/* Non-critical: OK to use var() fallback for modern browsers */
.card {
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,.08));
}
```

If the property is critical, still include the literal fallback first:

```CSS
.card {
  background-color: #ffffff;
  background-color: var(--surface, #ffffff);
}
```

### 2.3 Token Usage Rule of Thumb

If a recruiter on IE10 must still read/navigate the page, the relevant properties must have literal fallbacks.

---

## 3. Theming (Light default, dark as enhancement)

- `:root` defines the Light theme tokens (runtime defaults).
- Dark mode via `prefers-color-scheme` and `[data-theme="dark"]` is allowed.
- IE10 is expected to render Light theme only (fallback literals).

Implementation rule:

- Fallback literals should always match the Light theme.

---

## 4. Accent Color (Form Controls)

`accent-color` is progressive enhancement.

```CSS
input[type="checkbox"],
input[type="radio"] {
  accent-color: #ff3d32;             /* safe explicit */
  accent-color: var(--color-accent); /* token-based */
}
```

If unsupported, default native controls are acceptable.

---

## 5. Viewport Units (dvh / dvw)

Always provide vh/vw fallback first.

```CSS
.hero {
  min-height: 100vh;
  min-height: 100dvh;
}
```

```CSS
.fullscreen {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  width: 100dvw;
}
```

---

## 6. Modern Functions (clamp, min, max)

Allowed only with a usable fallback declared first.

This is especially relevant because typography tokens may use clamp() (e.g. --font-body).

```CSS
body {
  font-size: 16px;              /* IE10 baseline */
  font-size: var(--font-body);  /* modern */
}
```

For headings based on step tokens, provide a baseline first:

```CSS
h1 {
  font-size: 40px;          /* baseline */
  font-size: var(--step-4); /* modern scale */
}
```

---

## 7. Selectors

### Allowed

- Class selectors only
- Flat selectors preferred
- BEM-style selectors

```CSS
.card {}
.card__title {}
.card--featured {}
```

### Avoid

- IDs
- Deep selectors
- Tag + class coupling
- Styling by DOM structure

```CSS
#header {}
div.card span.title {}
.card > .title {}
```

---

## 8. Class Naming (BEM – Required)

This codebase uses BEM (Block / Element / Modifier) consistently.

### 8.1 Block

Standalone component, reusable and context-independent.

```CSS
.card {}
.btn {}
.meta-row {}
```

### 8.2 Element (__)

A structural part of a block, not meaningful on its own.

```CSS
.card__title {}
.card__content {}
.meta-row__item {}
```

Rules:

- Elements must not exist without their block
- Do not use elements for variants

### 8.3 Modifier (--)

A variation of appearance or behavior of a block or element.

```CSS
.btn--solid {}
.btn--ghost {}
.btn--icon-only {}

.card--compact {}
.card--highlighted {}
```

Rules:

- Modifiers do not replace the base class
- Modifiers can be combined

```HTML
<button class="button button--ghost button--icon-only">
```

### 8.4 State Classes

Ephemeral or runtime states not tied to design variants.

```CSS
.is-active {}
.is-disabled {}
.has-error {}
```

Rules:

- State classes are never styled alone
- They modify an existing block/element

```CSS
.btn.is-active {}
.card.has-error {}
```

### 8.5 Naming Rules Summary

- Use kebab-case
- Use __ only for structural elements
- Use -- only for variants/modifiers
- Never invent hybrid forms (.card__active)
- Prefer clarity over brevity

---

## 9. Comments & Sectioning

Comments are a structural tool, not decoration.
They are used to make large CSS files scannable, self-documenting, and safe to maintain over time, especially in mixed modern / legacy contexts.

### 9.1 Major Sections (Required)

Use block-style section headers to separate major conceptual areas (e.g. Typography, Tokens, Layout, Components).

Format must follow this pattern:

```CSS
/* ==========================================================================
   Section Name
   Optional short description or constraints
   ========================================================================== */
```

Guidelines:

- Use = characters to visually anchor sections
- Section titles must be semantic, not file-based
- Optional notes should explain constraints or goals, not implementation details
- One major section = one clear responsibility

Example:

```CSS
/* ==========================================================================
   Typography + Layout (global)
   - Baseline spacing works in IE10+
   - No reliance on modern-only selectors
   ========================================================================== */
```

### 9.2 Subsections (Recommended)

Within a major section, use lighter dashed comments to group related rules.

Format:

```CSS
/* Subsection title -------------------------------------------------- */
```

Rules:

- Use for logical grouping (e.g. “Copy”, “Lists”, “Headings”)
- Do not nest subsections too deeply
- Prefer clarity over exhaustiveness

Example:

```CSS
/* Copy ------------------------------------------------------------- */
```

### 9.3 Inline Explanatory Comments (Intent-Focused)

Inline comments are allowed only when they explain intent, constraints, or non-obvious decisions.

They should answer why, not what.

Good examples:

```CSS
/* Physical fallback first */
margin-bottom: 1rem;
margin-bottom: var(--size-4);
```

```CSS
/* Reduce top margin when heading is first child */
main > h1 {
  margin-top: 0;
}
```

Avoid:

- Restating what the property does
- Commenting obvious CSS
- Over-commenting repetitive patterns

### 9.4 Ordering & Readability Rules

- Comments always precede the code they describe
- Never place large comment blocks mid-rule
- Blank lines are allowed between logical blocks, but comments define structure, not spacing

### 9.5 Commenting Philosophy

- CSS should be readable top-down without opening DevTools
- A developer should understand:
  - where they are
  - what the section controls
  - what constraints apply (legacy, rhythm, accessibility)
- If a section needs many inline comments, reconsider its scope

---

## 10. Graceful Degradation Checklist

Before merging CSS changes, ensure:

- Critical styles have literal fallbacks (Light theme baseline).
- `dvh/dvw` always includes vh/vw first.
- `accent-color` is optional.
- Any usage of `clamp()` (direct or via tokens) has a baseline first.
- The site remains readable if variables are ignored (IE10 baseline).
