---
title: Use useVeltInitState for Conditional Rendering
impact: MEDIUM
impactDescription: Prevents rendering collaboration UI before Velt is fully initialized
tags: init, state, useVeltInitState, getVeltInitState, lifecycle, ready
---

## Use useVeltInitState for Conditional Rendering

`useVeltInitState()` returns `true` when both the Velt User and Document are initialized. Use it to gate collaboration features that require full initialization before rendering.

**Incorrect (no initialization check - features may fail):**

```jsx
"use client";
import { VeltComments } from "@veltdev/react";

export default function CollabFeatures() {
  // Renders immediately - may fail if user/document not ready
  return <VeltComments />;
}
```

**Correct (gate on initialization state):**

```jsx
"use client";
import { useVeltInitState } from '@veltdev/react';
import { VeltComments } from "@veltdev/react";
import { useEffect } from 'react';

export default function CollabFeatures() {
  const veltInitState = useVeltInitState();

  useEffect(() => {
    if (veltInitState) {
      // Velt is fully initialized - safe to perform actions
      console.log('Velt ready: user and document initialized');
    }
  }, [veltInitState]);

  if (!veltInitState) {
    return <div>Loading collaboration...</div>;
  }

  return <VeltComments />;
}
```

**Observable Variant (non-hooks or advanced use):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

export default function MyComponent() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const subscription = client.getVeltInitState().subscribe((veltInitState) => {
      console.log('Velt Init State:', veltInitState);
    });

    return () => subscription?.unsubscribe();
  }, [client]);

  return null;
}
```

**Non-React Frameworks:**

```javascript
// Angular/Vue/HTML
const subscription = Velt.getVeltInitState().subscribe((veltInitState) => {
  console.log('Velt Init State:', veltInitState);
  if (veltInitState) {
    // Safe to use collaboration features
  }
});

// Cleanup
subscription?.unsubscribe();
```

**Verification:**
- [ ] `useVeltInitState()` returns `true` after user and document are both set
- [ ] Collaboration components are gated behind init state check
- [ ] Observable subscription is cleaned up on unmount

**Source Pointers:**
- `https://docs.velt.dev/get-started/advanced` - getVeltInitState()
