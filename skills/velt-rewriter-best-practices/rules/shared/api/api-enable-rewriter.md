---
title: Enable the Rewriter feature with enableRewriter / disableRewriter
impact: HIGH
impactDescription: Activates AI text-rewriter functionality on the page; without it, no text-selection events fire and the rewriter is dormant
tags: rewriter, RewriterElement, enableRewriter, disableRewriter, setup, feature-toggle
---

## Enable the Rewriter feature with enableRewriter / disableRewriter

`RewriterElement.enableRewriter()` turns the Rewriter feature ON for the page. Until it is called, the Rewriter is inert — no `textSelected` events fire, `askAi` / `replaceText` / `addComment` have nothing to act on, and the default toolbar never appears. `disableRewriter()` deactivates the feature.

This is distinct from `enableDefaultUI()` / `disableDefaultUI()`:
- `enableRewriter` / `disableRewriter` — **feature toggle**. Off = no events, no functionality at all.
- `enableDefaultUI` / `disableDefaultUI` — **toolbar visibility toggle**. The feature stays on; only Velt's built-in selection toolbar is hidden. Events still fire so you can render custom UI.

A common mistake is using `disableDefaultUI()` when you wanted to turn the feature off entirely (or vice versa). Pick based on intent:
- "Stop the rewriter from doing anything" → `disableRewriter()`
- "Hide the default toolbar but keep the events" → `disableDefaultUI()`

`enableRewriter()` is the first call in the canonical setup flow (enable → subscribe to `textSelected` → call `askAi` → call `replaceText` or `addComment`).

**Correct (React / Next.js — enable on mount, disable on unmount):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function RewriterBootstrap() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const rewriterElement = client.getRewriterElement();
    rewriterElement.enableRewriter();
    return () => rewriterElement.disableRewriter();
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
if (Velt) {
  const rewriterElement = Velt.getRewriterElement();
  rewriterElement.enableRewriter();
  // Later, to deactivate:
  // rewriterElement.disableRewriter();
}
```

**Verification Checklist:**
- [ ] `enableRewriter()` is called before subscribing to `textSelected` or calling `askAi` / `replaceText` / `addComment`
- [ ] Feature toggle (`enableRewriter` / `disableRewriter`) is not confused with toolbar toggle (`enableDefaultUI` / `disableDefaultUI`)
- [ ] In React, the call lives inside a `useEffect` guarded on `client`, with `disableRewriter()` in the cleanup
- [ ] `getRewriterElement()` is called after the Velt client is initialized

**Source Pointers:**
- https://docs.velt.dev/ai/rewriter/setup — Step 1: Enable Rewriter
- https://docs.velt.dev/ai/rewriter/customize-behavior#enablerewriter — API reference
