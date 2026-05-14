---
title: Use type:'text' Store for Collaborative Plain Text
impact: HIGH
impactDescription: Text stores use Y.Text semantics for character-level conflict-free merging; binding a textarea to this store enables real-time collaborative plain-text editing without managing subscriptions manually
tags: crdt, core, useStore, text, Y.Text, createVeltStore, forceResetInitialContent, textarea, plain-text
---

## Use type:'text' Store for Collaborative Plain Text

A text store is backed by Yjs `Y.Text` and is the correct type for any plain-text collaborative data (notes, code snippets, simple text fields). The `useStore` hook (React) and `createVeltStore` factory (non-React) both accept `type: 'text'`. The hook handles initialization, real-time subscriptions, and cleanup automatically.

Always coalesce the reactive `value` with `?? ''` (or `|| ''`) before binding it to a textarea or display element, because the value is `null` before the store is hydrated.

Do not use the `map` or `array` type to store plain text, and do not split a single text document into multiple stores to work around merge conflicts — `Y.Text` already handles concurrent character-level edits correctly.

**Correct (React — useStore with type:'text'):**

```tsx
import { useStore } from '@veltdev/crdt-react';

function CollaborativeNotepad() {
  const {
    value: text,
    update: updateText,
    isLoading,
    error,
  } = useStore<string>({
    storeId: 'my-text-store',
    type: 'text',
    initialValue: '',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <textarea
      // Coalesce null to empty string — value is null before the store is hydrated
      value={text ?? ''}
      onChange={(e) => updateText(e.target.value)}
      placeholder="Start typing..."
    />
  );
}
```

**Correct (non-React — createVeltStore with type:'text'):**

```js
import { createVeltStore } from '@veltdev/crdt';

async function initStore(veltClient) {
  const store = await createVeltStore({
    id: 'my-text-store',
    type: 'text',
    initialValue: '',
    veltClient,
  });
  if (!store) return;

  // Seed the UI with the current value
  const textarea = document.querySelector('.notepad-textarea');
  if (textarea) textarea.value = store.getValue() || '';

  // Subscribe to all future changes (local and remote)
  const unsubscribe = store.subscribe((newText) => {
    // Only update the textarea if it is not focused to avoid cursor jump
    if (textarea && textarea !== document.activeElement) {
      textarea.value = typeof newText === 'string' ? newText : '';
    }
  });

  // Wire textarea input to store.update()
  if (textarea) {
    textarea.addEventListener('input', () => {
      store.update(textarea.value);
    });
  }

  return unsubscribe;
}
```

**forceResetInitialContent (optional):**

By default, `initialValue` is only applied when the document has no existing remote state. Set `forceResetInitialContent: true` to always overwrite remote state with `initialValue` on initialization.

```tsx
const { value: text } = useStore<string>({
  storeId: 'my-text-store',
  type: 'text',
  initialValue: defaultText,
  forceResetInitialContent: true,
});
```

**Verification Checklist:**
- [ ] `type: 'text'` is set on the store config (not `'map'` or `'array'`)
- [ ] Reactive `value` is coalesced with `?? ''` before binding to a textarea or display element
- [ ] `update()` (React) or `store.update()` (non-React) is called on every input event — not debounced per character unless intentional
- [ ] `store.subscribe()` returns an unsubscribe function that is called on cleanup (non-React only)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/text - Text store setup, read, update, subscribe, and version management
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - Core CRDT setup (Steps 1-2 must be completed first)
