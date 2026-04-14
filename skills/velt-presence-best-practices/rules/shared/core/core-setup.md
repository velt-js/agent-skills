---
title: Add VeltPresence and VeltCursor Components
impact: CRITICAL
impactDescription: VeltPresence shows user avatars and VeltCursor enables cursor tracking
tags: presence, cursor, avatars, setup, VeltPresence, VeltCursor
---

## Add VeltPresence for User Avatars

`VeltPresence` renders a row of avatars showing who is currently viewing the document. It works out of the box with no props required for basic usage. Place it in your toolbar or header area, separate from the main content region.

`VeltCursor` enables real-time cursor tracking so users can see each other's mouse positions. It is covered in detail in a separate rule and is most relevant for canvas or spatial apps.

**Why this matters:**

Without presence indicators, users have no way of knowing who else is active in the same document. This leads to conflicting edits, duplicated work, and a poor collaborative experience.

**React: Basic presence setup**

```jsx
"use client";
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <div className="toolbar">
      <h1>Document Title</h1>
      <VeltPresence />
    </div>
  );
}
```

**React: With VeltCursor for cursor tracking**

```jsx
"use client";
import { VeltPresence, VeltCursor } from "@veltdev/react";

function CollaborativeEditor() {
  return (
    <>
      <header className="toolbar">
        <VeltPresence />
      </header>
      <main className="editor-canvas">
        <VeltCursor />
        {/* Your editor content */}
      </main>
    </>
  );
}
```

**HTML: Basic presence setup**

```html
<div class="toolbar">
  <h1>Document Title</h1>
  <velt-presence></velt-presence>
</div>
```

**HTML: With cursor tracking**

```html
<div class="toolbar">
  <velt-presence></velt-presence>
</div>
<div class="editor-canvas">
  <velt-cursor></velt-cursor>
</div>
```

**Placement guidelines:**

- Place `VeltPresence` in the toolbar, header, or navigation bar — not inside scrollable content
- Place `VeltCursor` inside the content area where cursor tracking is needed
- `VeltPresence` requires no props for basic usage; it automatically displays all active users
- `VeltCursor` is most useful in canvas, whiteboard, or spatial applications

**Verification:**
- [ ] `VeltPresence` is rendered inside the app (within `VeltProvider`)
- [ ] Presence avatars appear in the toolbar or header area
- [ ] Multiple users see each other's avatars when viewing the same document
- [ ] `VeltCursor` is added if cursor tracking is needed (canvas/spatial apps)

**Source Pointers:**
- `https://docs.velt.dev/presence/setup` - Presence setup guide
- `https://docs.velt.dev/cursor/setup` - Cursor setup guide
