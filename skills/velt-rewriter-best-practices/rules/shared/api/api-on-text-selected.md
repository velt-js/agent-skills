---
title: Subscribe to text selection with on('textSelected')
impact: HIGH
impactDescription: Surfaces the user's selected text and its DOM context — required input for askAi, replaceText, and addComment
tags: rewriter, RewriterElement, on, textSelected, TextSelectedEvent, subscribe, observable
---

## Subscribe to text selection with on('textSelected')

`RewriterElement.on('textSelected')` returns an Observable that emits a `TextSelectedEvent` every time a user highlights text in a Rewriter-enabled region. The event object carries the selected text plus the DOM-position context that `replaceText` and `addComment` need to anchor their operation — you do not have to track ranges yourself.

The event is what stitches the rest of the flow together. Without subscribing, you have no entry point for `askAi` (which needs `selectedText`) or `replaceText` / `addComment` (which need the event itself to identify the DOM target).

The Observable is hot — multiple subscribers all receive the same events. In React, subscribe inside `useEffect` and unsubscribe in the cleanup to avoid stale handlers after re-render.

**Correct (React / Next.js — subscribe and dispatch):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function RewriterListener() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const rewriterElement = client.getRewriterElement();

    const subscription = rewriterElement.on('textSelected').subscribe(async (event) => {
      // event.text is the user's selection
      // event itself carries DOM-anchor data — pass it through to replaceText / addComment
      console.log('Selected text:', event.text);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const rewriterElement = Velt.getRewriterElement();

const subscription = rewriterElement.on('textSelected').subscribe((event) => {
  console.log('Selected text:', event.text);
});

// Later: subscription.unsubscribe();
```

**Pitfalls:**
- DO NOT try to read the user's selection from `window.getSelection()` — you'll lose the Velt-managed anchor metadata that `replaceText` / `addComment` need. Use the event.
- DO NOT subscribe before `enableRewriter()` is called — no events will fire.
- DO NOT forget to `unsubscribe()` on cleanup; otherwise stale handlers accumulate.

**Verification Checklist:**
- [ ] `enableRewriter()` is called before this subscription is set up
- [ ] `subscribe()` is called on the Observable returned from `on('textSelected')`
- [ ] The full `event` (not just `event.text`) is passed forward to `replaceText` / `addComment`
- [ ] In React, the subscription is created inside `useEffect` and disposed in the cleanup
- [ ] No manual DOM range tracking — Velt's event is the source of truth

**Source Pointers:**
- https://docs.velt.dev/ai/rewriter/setup — Step 2: Subscribe to text selection events
- https://docs.velt.dev/api-reference/sdk/models/data-models#textselectedevent — `TextSelectedEvent` shape
