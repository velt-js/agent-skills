---
title: Customize Huddle Tool Button
impact: MEDIUM
impactDescription: Slots, CSS parts, and CSS variables for customizing huddle UI
tags: huddle, customization, slots, css, wireframe, VeltHuddleTool, ui
---

## Customizing the Huddle Tool Button

`VeltHuddleTool` supports customization via slots for replacing the default button content, CSS parts for styling internal elements, and CSS variables for layout control.

**Why this matters:**

Default Velt UI components may not match your application's design system. Customization ensures the huddle button integrates visually with your toolbar while preserving all real-time functionality.

**React: Custom button via slot**

```jsx
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltHuddleTool type="all">
      <button slot="button">Start Call</button>
    </VeltHuddleTool>
  );
}
```

**React: Custom button with icon**

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

**HTML: Custom button via slot**

```html
<velt-huddle-tool type="all">
  <button slot="button">Start Call</button>
</velt-huddle-tool>
```

**CSS Parts for styling:**

The following CSS parts are available for targeting internal elements:

```css
/* Style the outer container */
velt-huddle-tool::part(container) {
  border-radius: 8px;
}

/* Style the button container */
velt-huddle-tool::part(button-container) {
  padding: 4px 8px;
}

/* Style the button icon */
velt-huddle-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--brand-primary);
}
```

**CSS Variable for z-index:**

```css
:root {
  --velt-huddle-z-index: 1000;
}
```

This controls the stacking order of the huddle overlay UI. Increase this value if the huddle panel renders behind other elements like modals or drawers.

**Customization guidelines:**

- Use the `slot="button"` approach to fully replace the button content while keeping huddle functionality
- Use CSS parts when you want to adjust styling without replacing the default markup
- The `--velt-huddle-z-index` variable affects the huddle overlay, not the tool button itself
- Slots and CSS parts can be combined for full control

**Verification:**
- [ ] Custom button renders correctly inside `VeltHuddleTool`
- [ ] Clicking the custom button still triggers huddle start/join
- [ ] CSS part styles apply without breaking huddle functionality
- [ ] Huddle overlay z-index is appropriate for your app's layering
- [ ] Custom styles match the application's design system

**Source Pointers:**
- `https://docs.velt.dev/huddle/customize-ui` - Huddle UI customization
