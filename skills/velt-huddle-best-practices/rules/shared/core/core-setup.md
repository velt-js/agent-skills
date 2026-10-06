---
title: Add VeltHuddle and VeltHuddleTool Components
impact: CRITICAL
impactDescription: Two components required — VeltHuddle at app root and VeltHuddleTool in toolbar
tags: huddle, setup, VeltHuddle, VeltHuddleTool, audio, video, screen, featureAllowList
---

## Add VeltHuddle and VeltHuddleTool

Huddle needs two components. `VeltHuddle` renders the huddle UI and participants; add it once at the root of your app inside `VeltProvider`. `VeltHuddleTool` is the button that starts or joins a huddle; place it wherever you want the button, usually the toolbar.

**Why this matters:**

Without `VeltHuddle`, no huddle UI renders even if the tool button is present. Without `VeltHuddleTool`, users have no way to start a huddle.

**Incorrect (tool without the root component):**

```jsx
<header className="toolbar">
  <VeltHuddleTool type="all" /> {/* clicking it starts a huddle nobody can see */}
</header>
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider, VeltHuddle, VeltHuddleTool, VeltPresence } from "@veltdev/react";

function App({ children, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltHuddle />
      <header className="toolbar">
        <VeltPresence />
        <VeltHuddleTool type="all" />
      </header>
      <main>{children}</main>
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```html
<body>
  <velt-huddle></velt-huddle>
  <div class="toolbar">
    <velt-presence></velt-presence>
    <velt-huddle-tool type="all"></velt-huddle-tool>
  </div>
</body>
```

**Modular SDK (v6) note:**

If you pass `featureAllowList` in the init config, include `'huddle'`; otherwise the huddle components can be suppressed. Calling `getHuddleElement()` or `preloadHuddle()` auto-enables an omitted feature and warms its chunk, but listing it is the reliable fix.

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["huddle", "presence"] }}>
  {/* ... */}
</VeltProvider>
```

**Runtime behavior to know:**

- `VeltHuddle` shows nothing until a user joins; media starts only after joining through the tool
- If a huddle is already running, clicking the tool joins it with the existing huddle's type
- A user who was in a huddle rejoins automatically after a page reload
- Set `type` explicitly; the docs disagree on its default (see `config-huddle-types`)

**Verification:**
- [ ] `VeltHuddle` is rendered once at the root inside `VeltProvider`
- [ ] `VeltHuddleTool` is rendered where users expect the button
- [ ] `type` is set explicitly on `VeltHuddleTool`
- [ ] `featureAllowList`, if set, includes `'huddle'`
- [ ] Two different users on the same document can join the same huddle

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/huddle/setup - "Huddle Setup"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltHuddle", "VeltHuddleTool (sibling)"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadhuddle - `preloadHuddle()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`
