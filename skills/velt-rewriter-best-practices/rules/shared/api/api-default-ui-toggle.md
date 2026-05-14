---
title: Control the Default Rewriter Toolbar with enableDefaultUI / disableDefaultUI
impact: HIGH
impactDescription: Separates toolbar visibility from rewriter functionality, enabling fully custom selection UIs
tags: rewriter, RewriterElement, enableDefaultUI, disableDefaultUI, toolbar, custom-ui
---

## Control the Default Rewriter Toolbar with enableDefaultUI / disableDefaultUI

`RewriterElement` exposes `enableDefaultUI()` and `disableDefaultUI()` methods that show or hide the default selection toolbar **without disabling the rewriter feature itself**. When the default UI is off, all rewriter events still fire — consumers can subscribe to them and render their own custom UI instead.

This matters because some applications already have a text-selection toolbar or want a completely custom rewrite experience. Without `disableDefaultUI()`, the Velt default toolbar always appears on selection, which conflicts with existing selection UIs.

Do not attempt to hide the toolbar with CSS alone — use the API method so event subscriptions continue to work correctly.

**Correct (React / Next.js — disable default toolbar and handle events yourself):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function RewriterController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const rewriterElement = client.getRewriterElement();

    // Hide the built-in toolbar; events still fire
    rewriterElement.disableDefaultUI();

    // Re-enable later if needed
    // rewriterElement.enableDefaultUI();
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks — disable default toolbar):**

```js
// After Velt is initialized
const rewriterElement = Velt.getRewriterElement();

// Hide the built-in toolbar; events still fire
rewriterElement.disableDefaultUI();

// Re-enable later if needed
// rewriterElement.enableDefaultUI();
```

**Verification Checklist:**
- [ ] `getRewriterElement()` is called after `client` is available (inside `useEffect` with client dependency for React)
- [ ] `disableDefaultUI()` is used instead of CSS hiding so events remain active
- [ ] A custom selection UI or event handler is wired up when the default UI is disabled
- [ ] `enableDefaultUI()` is available to restore the toolbar if toggling dynamically

**Source Pointers:**
- https://docs.velt.dev/ai/rewriter/customize-behavior#enabledefaultui - `enableDefaultUI` / `disableDefaultUI` API reference
