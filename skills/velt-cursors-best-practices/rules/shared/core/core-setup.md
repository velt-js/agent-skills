---
title: Add VeltCursor Component for Real-Time Cursor Tracking
impact: CRITICAL
impactDescription: VeltCursor must be placed inside the collaborative content area, not in the toolbar
tags: cursor, setup, VeltCursor, canvas, whiteboard, placement
---

## Add VeltCursor Inside the Content Area

`VeltCursor` enables real-time cursor tracking so users can see each other's mouse positions. Place it inside the collaborative content area where users interact spatially -- not in the toolbar or header (that is where `VeltPresence` goes).

**Why this matters:**

Cursor tracking is essential for spatial collaboration apps like whiteboards, canvas editors, design tools, and ReactFlow diagrams. Without `VeltCursor`, users cannot see where others are pointing or working. Placing it in the wrong container (e.g., toolbar) causes cursors to render in a non-interactive area.

**React: Basic cursor setup**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasArea() {
  return (
    <main className="canvas-container">
      <VeltCursor />
      {/* Your collaborative content here */}
    </main>
  );
}
```

**React: Full layout with presence in toolbar and cursor in canvas**

```jsx
"use client";
import { VeltPresence, VeltCursor } from "@veltdev/react";

function CollaborativeApp() {
  return (
    <>
      <header className="toolbar">
        <h1>My Whiteboard</h1>
        <VeltPresence />
      </header>
      <main className="canvas">
        <VeltCursor />
        {/* Canvas content, ReactFlow, design surface */}
      </main>
    </>
  );
}
```

**HTML: Basic cursor setup**

```html
<div class="canvas-container">
  <velt-cursor></velt-cursor>
  <!-- Your collaborative content here -->
</div>
```

**HTML: Full layout**

```html
<header class="toolbar">
  <velt-presence></velt-presence>
</header>
<main class="canvas">
  <velt-cursor></velt-cursor>
</main>
```

**Placement guidelines:**

- Place `VeltCursor` inside the content area where users interact spatially (canvas, whiteboard, editor)
- Place `VeltPresence` in the toolbar or header -- never in the same container as `VeltCursor`
- `VeltCursor` works with default config (no props needed for basic usage)
- Best for: canvas apps, whiteboards, design tools, ReactFlow diagrams, collaborative documents
- `VeltCursor` requires `VeltProvider` as an ancestor and a valid authenticated user

**Verification:**
- [ ] `VeltCursor` is rendered inside the collaborative content area (not toolbar)
- [ ] `VeltPresence` is in the toolbar/header, separate from cursor area
- [ ] `VeltProvider` wraps the entire app with valid `apiKey` and `authProvider`
- [ ] Multiple users see each other's cursors in the content area
- [ ] `'use client'` directive is present in Next.js components

**Source Pointers:**
- `https://docs.velt.dev/cursor/setup` - Cursor setup guide
- `https://docs.velt.dev/presence/setup` - Presence setup guide
