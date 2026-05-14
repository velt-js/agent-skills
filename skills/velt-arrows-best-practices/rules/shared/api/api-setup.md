---
title: Set up Velt Arrows — place VeltArrows (root) and VeltArrowTool (trigger), then get the ArrowElement handle
impact: HIGH
impactDescription: VeltArrows alone won't show a draw trigger and VeltArrowTool alone won't render placed arrows; both components are required, and the ArrowElement handle is the programmatic entry point for runtime config
tags: arrows, VeltArrows, VeltArrowTool, velt-arrows, velt-arrow-tool, ArrowElement, getArrowElement, setup, slot, custom-button
---

## Set up Velt Arrows — components and the ArrowElement handle

The Arrows feature is two components plus one programmatic handle:

- `<VeltArrows>` (or `<velt-arrows>`) — the **root** orchestrator. Mount once near the top of your app. It hosts every placed arrow on the document.
- `<VeltArrowTool>` (or `<velt-arrow-tool>`) — the **toolbar trigger** that starts a new arrow. Mount it inside whatever toolbar you have.
- `client.getArrowElement()` — returns the `ArrowElement` handle for programmatic config (e.g. setting `allowedElementIds` at runtime). React-hook form: not provided; call via `useVeltClient()`.

Without `<VeltArrows>` you can place a trigger but arrows never render; without `<VeltArrowTool>` users have no way to start drawing.

**React / Next.js — minimal end-to-end setup:**

```tsx
import { VeltArrows, VeltArrowTool } from '@veltdev/react';

export default function App() {
  return (
    <div>
      {/* Root orchestrator — mount once, near the top of the tree */}
      <VeltArrows />

      {/* Trigger — mount wherever your toolbar lives */}
      <div className="toolbar">
        <VeltArrowTool />
      </div>

      {/* ...the rest of your app... */}
    </div>
  );
}
```

**Other Frameworks (HTML / web component) — minimal setup:**

```html
<!doctype html>
<html lang="en">
  <head>
    <title>App</title>
    <script type="module" src="https://cdn.velt.dev/lib/sdk@latest/velt.js" onload="loadVelt()"></script>
    <script>
      async function loadVelt() {
        await Velt.init("YOUR_VELT_API_KEY");
      }
    </script>
  </head>
  <body>
    <velt-arrows></velt-arrows>
    <div class="toolbar">
      <velt-arrow-tool></velt-arrow-tool>
    </div>
  </body>
</html>
```

**Get the ArrowElement handle (React / Next.js):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function ArrowsBootstrap() {
  const { client } = useVeltClient();
  useEffect(() => {
    if (!client) return;
    const arrowElement = client.getArrowElement();
    // Use arrowElement.allowedElementIds(...) etc. — see config-customize
  }, [client]);
  return null;
}
```

**Get the ArrowElement handle (Other Frameworks):**

```js
const arrowElement = Velt.getArrowElement();
```

**Custom tool button — child-replacement pattern (React / Next.js):**

```tsx
import { VeltArrowTool } from '@veltdev/react';

function YourToolbar() {
  return (
    <VeltArrowTool>
      {/* This child replaces the default arrow icon button entirely */}
      <button className="myArrowButton">Draw arrow</button>
    </VeltArrowTool>
  );
}
```

**Custom tool button — child-replacement (Other Frameworks):**

```html
<velt-arrow-tool>
  <!-- Child replaces the default icon button entirely -->
  <button class="myArrowButton">Draw arrow</button>
</velt-arrow-tool>
```

**Named `slot="button"` variant (alternative form):**

```tsx
<VeltArrowTool>
  <button slot="button">Arrow</button>
</VeltArrowTool>
```

```html
<velt-arrow-tool>
  <button slot="button">Arrow</button>
</velt-arrow-tool>
```

Both forms work — the plain child pattern (most common in the official `custom-button.mdx` docs) and the named-slot pattern (from the `slots.mdx` page) target the same `button` slot. Prefer the plain child form for new code; the named `slot="button"` attribute is explicit and helpful if you ever need to add additional slots in the future.

**Common pitfalls:**
- DO NOT mount `<VeltArrows>` inside a conditional that unmounts on tool toggle — it owns the per-document arrow state. Mount it once at the top of the tree.
- DO NOT call `getArrowElement()` before the Velt client is ready. In React, guard on `client` inside a `useEffect`.
- DO NOT mount more than one `<VeltArrows>` per document — extras get ignored or cause duplicate rendering depending on placement.

**Verification Checklist:**
- [ ] Exactly one `<VeltArrows>` is mounted near the root of the app
- [ ] At least one `<VeltArrowTool>` is mounted somewhere users can click it
- [ ] `client.getArrowElement()` is called only after the Velt client is initialized
- [ ] Custom tool buttons are passed as children of `<VeltArrowTool>` (replaces the default button entirely)
- [ ] In React, the ArrowElement-bootstrap effect has a `[client]` dependency

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/arrows/setup — component placement
- https://docs.velt.dev/api-reference/sdk/api/api-methods#getarrowelement — `client.getArrowElement()`
- https://docs.velt.dev/ui-customization/features/async/arrows/custom-button — custom-button child-slot pattern
