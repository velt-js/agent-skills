---
title: Register a getter for multi-input targets and read live values
impact: HIGH
impactDescription: A getter that reads saved state instead of the live edit returns the same value twice, so no suggestion is ever created
tags: registerTarget, unregisterTarget, useRegisterTarget, useUnregisterTarget, getter, complex values, snapshot
---

## Register a getter for multi-input targets and read live values

When one target covers several inputs (for example a table row with `qty` and `price`), there is no single `.value` to read. Register a getter that returns the whole object. The SDK calls it on focus to capture `oldValue` and on commit to capture `newValue`, so it must return what the user currently sees.

**Incorrect (getter reads state that only updates after save):**

```jsx
registerTarget({
  targetId: 'row.123',
  // BUG: savedRow only changes after the user saves, so oldValue === newValue
  getter: () => ({ qty: savedRow.qty, price: savedRow.price }),
});
```

**Correct (React / Next.js):**

```jsx
import { useRegisterTarget, useUnregisterTarget } from '@veltdev/react';
import { useEffect } from 'react';

function EditableRow() {
  const { registerTarget } = useRegisterTarget();
  const { unregisterTarget } = useUnregisterTarget();

  useEffect(() => {
    registerTarget({
      targetId: 'row.123',
      getter: () => ({
        qty: Number(document.getElementById('qty-input').value),
        price: Number(document.getElementById('price-input').value),
      }),
    });
    return () => unregisterTarget('row.123');
  }, []);

  return (
    <div data-velt-suggestion-target="row.123">
      <input id="qty-input" type="number" defaultValue="5" />
      <input id="price-input" type="number" defaultValue="99" />
    </div>
  );
}
```

**Correct (Other Frameworks):**

```js
suggestionElement.registerTarget({
  targetId: 'row.123',
  getter: () => ({
    qty: Number(document.getElementById('qty-input').value),
    price: Number(document.getElementById('price-input').value),
  }),
});

// Later, to remove the getter:
suggestionElement.unregisterTarget('row.123');
```

Read from the DOM (`input.value`), or for controlled inputs that update state on every keystroke, from that state. `registerTarget()` returns `void`; remove a registration with `unregisterTarget(targetId)`.

**Verification Checklist:**
- [ ] The getter returns live, edit-time values (DOM or per-keystroke state)
- [ ] The getter returns the same shape every time
- [ ] React code unregisters in the `useEffect` cleanup
- [ ] The wrapper element carries the same `data-velt-suggestion-target` as the registered `targetId`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "1. Define Suggestion Targets" (getter Warning and Note)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#registertarget — `registerTarget()` / `unregisterTarget()`
