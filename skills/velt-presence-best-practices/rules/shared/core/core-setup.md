---
title: Add VeltPresence and VeltCursor Components
impact: CRITICAL
impactDescription: VeltPresence shows user avatars and VeltCursor enables cursor tracking
tags: presence, cursor, avatars, setup, VeltPresence, VeltCursor, featureAllowList
---

## Add VeltPresence for User Avatars

`VeltPresence` renders a row of avatars for users who are online on the same document. It needs no props for basic usage. It is statically placed: it renders exactly where you mount it, so put it in your toolbar or header.

`VeltCursor` is different: it is Velt-positioned. Mount it once near the app root and Velt paints every remote cursor as an overlay. See the `cursor-setup` rule.

**Why this matters:**

Without presence indicators, users cannot tell who else is active in the same document. This leads to conflicting edits and duplicated work.

**Incorrect (presence inside scrolling content, cursor mounted per section):**

```jsx
<main className="scroll-area">
  <VeltPresence /> {/* scrolls away with the content */}
  <section><VeltCursor /></section>
  <section><VeltCursor /></section> {/* only the first velt-cursor subscribes; the rest are inert */}
</main>
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider, VeltPresence, VeltCursor } from "@veltdev/react";

function App({ authProvider, children }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltCursor /> {/* once, near the root */}
      <header className="toolbar">
        <h1>Document Title</h1>
        <VeltPresence />
      </header>
      <main>{children}</main>
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```html
<body>
  <velt-cursor></velt-cursor>
  <div class="toolbar">
    <h1>Document Title</h1>
    <velt-presence></velt-presence>
  </div>
</body>
```

**Modular SDK (v6) note:**

If you pass `featureAllowList` in the init config, only the listed features are allowed to run and preload. Include `'presence'` (and `'cursor'` if you use `VeltCursor`); otherwise the components can be suppressed. Calling `getPresenceElement()` or `preloadPresence()` auto-enables an omitted feature, but listing it is the reliable fix.

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["presence", "cursor", "comment"] }}>
  {/* ... */}
</VeltProvider>
```

**Placement guidelines:**

- Place `VeltPresence` in the toolbar, header, or navigation bar, not inside scrollable content
- Mount `VeltCursor` once near the root; use `allowedElementIds` to confine cursors to a region
- Presence requires an identified (non-anonymous) user
- Test by opening the page in two browsers with two different users

**Verification:**
- [ ] `VeltPresence` is rendered inside `VeltProvider`
- [ ] Presence avatars appear in the toolbar or header area
- [ ] Two different users on the same document see each other's avatars
- [ ] `VeltCursor` is mounted once (if cursor tracking is needed)
- [ ] `featureAllowList`, if set, includes `'presence'` (and `'cursor'`)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/setup - "Presence Setup"
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "Presence, Cursors & Reactions" (positioning and mount-once behavior)
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`
