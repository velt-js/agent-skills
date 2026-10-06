---
title: Customize Huddle Tool Button
impact: MEDIUM
impactDescription: Slots and CSS parts for customizing the huddle tool button
tags: huddle, customization, slots, css-parts, VeltHuddleTool, velt-huddle-tool, ui
---

## Customizing the Huddle Tool Button

`VeltHuddleTool` supports a `button` slot for replacing the default button, and CSS `::part()` hooks for styling the default button inside its shadow DOM. For deeper layout changes, use the huddle wireframes (see `wireframe-variables-huddle`).

**Why this matters:**

Default components may not match your design system. The slot keeps all huddle behavior while letting you render your own button. Invented CSS variable names silently do nothing, so use only documented parts and variables.

**Incorrect (wrong host element, undocumented CSS variable):**

```html
<!-- The slot must be on velt-huddle-tool, not another tool element -->
<velt-user-invite-tool>
  <button slot="button">Huddle</button>
</velt-user-invite-tool>

<style>
  :root { --velt-huddle-z-index: 1000; } /* not a documented Velt variable */
</style>
```

**Correct (React / Next.js: custom button via slot):**

```jsx
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltHuddleTool type="all">
      <button slot="button" className="custom-huddle-btn">
        <PhoneIcon />
        <span>Huddle</span>
      </button>
    </VeltHuddleTool>
  );
}
```

**Correct (Other Frameworks):**

```html
<velt-huddle-tool type="all">
  <button slot="button">Huddle</button>
</velt-huddle-tool>
```

**CSS parts:**

| Part | Targets |
|---|---|
| `container` | Tool container |
| `button-container` | Button container |
| `button-icon` | Button SVG icon |

```css
velt-huddle-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
}
```

**CSS variables:** use only variables listed on the Global Styles / CSS variables pages. If a variable is not listed there, it does not exist.

**Customization guidelines:**

- Use `slot="button"` to replace the button content while keeping huddle functionality
- Use CSS parts to adjust the default button without replacing it
- Use `darkMode` on `VeltHuddleTool` for the dark theme
- Use huddle wireframes (`<velt-huddle-tool-wireframe>`, `<velt-huddle-wireframe>`) to restructure the tool or room

**Verification:**
- [ ] The slot is placed inside `VeltHuddleTool` / `<velt-huddle-tool>`
- [ ] Clicking the custom button still starts or joins a huddle
- [ ] CSS parts used are `container`, `button-container`, or `button-icon`
- [ ] No undocumented CSS variables are used

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/huddle/slots - "Slots"
- https://docs.velt.dev/ui-customization/features/realtime/huddle/parts - "Parts"
- https://docs.velt.dev/ui-customization/features/realtime/huddle/variables - "Variables"
- https://docs.velt.dev/global-styles/global-styles - "Global Styles"
