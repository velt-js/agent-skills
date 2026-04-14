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

The component prop expects a stringified JSON array. Passing a plain JavaScript array will silently fail.

**React: Restrict cursors to a canvas element**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasWithCursors() {
  return (
    <div>
      <div id="toolbar">
        {/* No cursors here */}
      </div>
      <div id="canvas-area">
        <VeltCursor allowedElementIds={JSON.stringify(["canvas-area"])} />
        {/* Cursors only appear within this div */}
      </div>
    </div>
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

**Vanilla JS:**

```javascript
const cursorElement = client.getCursorElement();
cursorElement.allowedElementIds(["canvas-area"]);
```

**Key points:**

- The component prop requires `JSON.stringify()` -- passing a plain array will not work
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
- `https://docs.velt.dev/cursor/customize-behavior/allowed-element-ids` - Allowed element IDs
