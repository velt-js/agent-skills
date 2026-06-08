---
title: Register Getters for Complex Suggestion Targets
impact: HIGH
tags: registerTarget, unregisterTarget, getter, complex values, snapshot
---

## Register Getters for Complex Targets

When a target represents a complex value spanning multiple controls, register a getter so the SDK can snapshot and diff the whole object.

**React / Next.js:**
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

**Other Frameworks:**
```js
suggestionElement.registerTarget({
  targetId: 'row.123',
  getter: () => ({
    qty: Number(document.getElementById('qty-input').value),
    price: Number(document.getElementById('price-input').value),
  }),
});

// To remove the getter:
suggestionElement.unregisterTarget('row.123');
```

### The Getter Must Read Live Edit-Time State

The SDK calls your getter to snapshot `oldValue` on focus and to read `newValue` on commit. If your getter reads from app state that only updates after the user commits (common when suggestion mode is on), both reads return the same value, the diff short-circuits, and no suggestion is ever created.

Read from the live source the user is editing — usually the DOM (`input.value`). For controlled inputs whose state updates on every keystroke, reading from that state is fine.

### Key Points

- `registerTarget()` returns `void` — to remove, call `unregisterTarget(targetId)`
- Clean up registrations on unmount (React: return cleanup from `useEffect`)
- The getter must return the same shape consistently for diff to work
