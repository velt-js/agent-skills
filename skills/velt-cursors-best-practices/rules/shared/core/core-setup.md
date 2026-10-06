---
title: Add VeltCursor Once Near the App Root
impact: CRITICAL
impactDescription: VeltCursor is Velt-positioned and mount-once; extra instances are inert and placement does not confine cursors
tags: cursor, setup, VeltCursor, placement, mount-once, allowedElementIds, featureAllowList
---

## Add VeltCursor Once Near the App Root

`VeltCursor` renders the live cursors of other users on the same document and location. Add it once, at the root of your app inside `VeltProvider`. Velt positions every remote cursor as an overlay and adapts it to each viewer's screen size and content. To limit cursors to a region (a canvas, not the toolbar), use `allowedElementIds`, not placement.

**Why this matters:**

Only the first `velt-cursor` element in the DOM subscribes to the live-cursor stream; additional instances are inert. Mounting `VeltCursor` inside a container does not confine cursors to it.

**Incorrect (one cursor per container, expecting placement to scope cursors):**

```jsx
<aside className="toolbar"><VeltCursor /></aside>
<main className="canvas"><VeltCursor /></main>
{/* Second instance does nothing; cursors still show over the toolbar */}
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider, VeltCursor, VeltPresence } from "@veltdev/react";

export default function App({ authProvider, children }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltCursor allowedElementIds={JSON.stringify(["canvas"])} />
      <header className="toolbar">
        <VeltPresence />
      </header>
      <main id="canvas">{children}</main>
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```html
<body>
  <velt-cursor allowed-element-ids='["canvas"]'></velt-cursor>
  <header class="toolbar"><velt-presence></velt-presence></header>
  <main id="canvas"></main>
</body>
```

**Modular SDK (v6) note:**

If you pass `featureAllowList` in the init config, include `'cursor'`; otherwise `VeltCursor` can be suppressed. Calling `getCursorElement()` or `preloadCursor()` auto-enables an omitted feature, but listing it is the reliable fix.

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["cursor", "presence"] }}>
  {/* ... */}
</VeltProvider>
```

**Placement guidelines:**

- Mount exactly one `VeltCursor`, near the root
- Use `allowedElementIds` to confine cursors to collaborative regions
- `VeltCursor` needs no props for basic usage
- Cursors require an identified (non-anonymous) user; your own cursor is not shown back to you
- Best for canvas apps, whiteboards, design tools, and ReactFlow diagrams; text editors use CRDT carets instead

**Verification:**
- [ ] Exactly one `VeltCursor` / `<velt-cursor>` is mounted, inside `VeltProvider`
- [ ] `allowedElementIds` (stringified on the component) is set when cursors should stay in one region
- [ ] `featureAllowList`, if set, includes `'cursor'`
- [ ] Two different users on the same document see each other's cursors
- [ ] `'use client'` directive is present in Next.js components

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#allowedelementids - "allowedElementIds"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "VeltCursor" (positioning, mount-once)
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`
