---
title: Add VeltHuddle and VeltHuddleTool Components
impact: CRITICAL
impactDescription: Two components required — VeltHuddle at app root and VeltHuddleTool in toolbar
tags: huddle, setup, VeltHuddle, VeltHuddleTool, audio, video, screen
---

## Add VeltHuddle and VeltHuddleTool

Huddle requires two components working together. `VeltHuddle` renders the huddle UI and participant list — place it inside `VeltProvider` at the root level. `VeltHuddleTool` is the button users click to start or join a huddle — place it in your toolbar alongside `VeltPresence`.

**Why this matters:**

Without `VeltHuddle` at the root, no huddle UI will render even if `VeltHuddleTool` is present. Without `VeltHuddleTool`, users have no way to initiate a huddle. Both components must be present within the `VeltProvider` tree.

**React: Full huddle setup**

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

**React: VeltHuddleTool with specific type**

```jsx
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <div className="toolbar">
      {/* type="all" shows dropdown with audio, video, and screen options */}
      <VeltHuddleTool type="all" />
    </div>
  );
}
```

**HTML: Basic huddle setup**

```html
<!-- Place at app root inside Velt-initialized container -->
<velt-huddle></velt-huddle>

<!-- Place in toolbar -->
<div class="toolbar">
  <velt-presence></velt-presence>
  <velt-huddle-tool type="all"></velt-huddle-tool>
</div>
```

**Placement guidelines:**

- Place `VeltHuddle` at the root level inside `VeltProvider`, before or after main content
- Place `VeltHuddleTool` in the toolbar or header alongside other collaboration tools
- `VeltHuddleTool` with `type="all"` enables audio, video, and screen sharing options via dropdown
- `VeltHuddle` renders the participant bubbles and huddle overlay — it has no visual output until a huddle is active

**Verification:**
- [ ] `VeltHuddle` is rendered at the root level inside `VeltProvider`
- [ ] `VeltHuddleTool` is rendered in the toolbar or header area
- [ ] Both components are within the `VeltProvider` tree
- [ ] `type` prop is set on `VeltHuddleTool` (typically `"all"` for full functionality)
- [ ] Clicking the huddle tool button initiates a huddle session

**Source Pointers:**
- `https://docs.velt.dev/huddle/setup` - Huddle setup guide
