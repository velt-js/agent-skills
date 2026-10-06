---
title: Restrict Cursor Display to Specific DOM Elements
impact: HIGH
impactDescription: Control which areas show cursors using allowedElementIds
tags: allowedElementIds, cursor-restriction, canvas, DOM, spatial
---

## Restrict Cursors to Specific Elements

Use `allowedElementIds` to limit cursor display to specific DOM elements. This prevents cursors from appearing in toolbars, sidebars, or other non-collaborative areas.

**Why this matters:**

By default, cursors appear everywhere within the document scope. In apps with toolbars, sidebars, and panels alongside a canvas, you want cursors only on the collaborative surface. Without restriction, cursor movement in the toolbar creates visual noise and confusion.

**GOTCHA: allowedElementIds takes a JSON string, not an array.**

The documented contract for the component prop is a stringified JSON array (`JSON.stringify([...])`). The API method takes a plain array.

**Incorrect (plain array on the component):**

```jsx
<VeltCursor allowedElementIds={["canvas-area"]} />
```

**Correct (React: stringified array on the single root VeltCursor):**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasWithCursors() {
  return (
    <>
      <VeltCursor allowedElementIds={JSON.stringify(["canvas-area"])} />
      <div id="toolbar">{/* No cursors here */}</div>
      <div id="canvas-area">{/* Cursors only appear while hovering this element */}</div>
    </>
  );
}
```

**React: Multiple allowed elements**

```jsx
<VeltCursor allowedElementIds={JSON.stringify(["canvas-area", "sidebar-panel"])} />
```

**HTML: Restrict cursors**

```html
<velt-cursor allowed-element-ids='["canvas-area"]'></velt-cursor>
```

**API: Programmatic configuration**

```jsx
"use client";
import { useEffect } from "react";
import { useCursorUtils } from "@veltdev/react";

function CursorConfig() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.allowedElementIds(["canvas-area"]);
    }
  }, [cursorElement]);

  return null;
}
```

**Other Frameworks:**

```javascript
const cursorElement = Velt.getCursorElement();
cursorElement.allowedElementIds(["canvas-area"]);
```

**Key points:**

- The component prop takes `JSON.stringify([...])` (the documented contract)
- When unset or empty, cursors render anywhere on the page
- The API method accepts a regular JavaScript array
- Element IDs must match actual DOM element `id` attributes
- Multiple IDs can be specified to allow cursors in several areas
- Use this when your app has distinct collaborative vs. non-collaborative zones

**Verification:**
- [ ] `allowedElementIds` is passed as `JSON.stringify([...])` on the component (not a plain array)
- [ ] Target element IDs exist in the DOM
- [ ] Cursors appear only within the specified elements
- [ ] Cursors do not appear in toolbar, sidebar, or other excluded areas
- [ ] Tested with multiple users to confirm restriction works for all cursors

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#allowedelementids - "allowedElementIds"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `allowedElementIds` behavior
