---
title: Subscribe to Client Lifecycle Events
impact: MEDIUM
impactDescription: Enables reacting to init, user, document, and error state changes
tags: events, lifecycle, client, on, subscribe, useVeltEventCallback
---

## Subscribe to Client Lifecycle Events

The Velt client exposes an event subscription API via `client.on(eventType)` that returns an Observable. Use this to react to initialization updates, user changes, document init, errors (e.g., token expiry), button clicks, permission events, and data provider events.

**Incorrect (no event handling for token expiry or init state):**

```jsx
// No error handling - token_expired goes unnoticed
"use client";
import { VeltProvider } from "@veltdev/react";

export default function App() {
  return (
    <VeltProvider apiKey="KEY" authProvider={authProvider}>
      <Content />
    </VeltProvider>
  );
}
```

**Correct (subscribe to lifecycle events):**

```jsx
import { useEffect } from 'react';
import { useVeltClient } from '@veltdev/react';

export default function CoreEventsListener() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    // Listen to initialization updates
    const initSub = client.on('initUpdate').subscribe((event) => {
      console.log('Init update:', event);
    });

    // Listen to user changes
    const userSub = client.on('userUpdate').subscribe((event) => {
      console.log('User update:', event);
    });

    // Listen to token lifecycle errors (e.g., token_expired)
    const errorSub = client.on('error').subscribe((error) => {
      if (error?.code === 'token_expired') {
        // Refresh token logic here
      }
    });

    return () => {
      initSub?.unsubscribe();
      userSub?.unsubscribe();
      errorSub?.unsubscribe();
    };
  }, [client]);

  return null;
}
```

**React Hook Alternative (useVeltEventCallback):**

```jsx
import { useEffect } from 'react';
import { useVeltEventCallback } from '@veltdev/react';

export default function ErrorHandler() {
  const errorEvent = useVeltEventCallback('error');

  useEffect(() => {
    if (errorEvent?.code === 'token_expired') {
      // Re-authenticate with fresh token
    }
  }, [errorEvent]);

  return null;
}
```

**Available Event Types:**

| Event | Description |
|-------|-------------|
| `initUpdate` | Initialization lifecycle updates (documents/locations set/unset, user init) |
| `userUpdate` | Fired when the Velt user changes (login, logout, or update) |
| `documentInit` | Document initialization status changes |
| `error` | Error events (e.g., `token_expired`) |
| `veltButtonClick` | Fired when a Velt Button is clicked |
| `permissionProvider` | Permission Provider events for access requests, results, and errors |
| `dataProvider` | Data Provider events for debugging get, save, and delete operations |

**Non-React Frameworks:**

```javascript
// Subscribe using Velt global or client instance
const initSub = Velt.on('initUpdate').subscribe((event) => {
  console.log('Init update:', event);
});

const errorSub = Velt.on('error').subscribe((error) => {
  console.log('Velt error:', error);
});

// Unsubscribe when done
initSub?.unsubscribe();
errorSub?.unsubscribe();
```

**Verification:**
- [ ] `client.on('error')` subscription handles `token_expired` events
- [ ] All subscriptions are cleaned up in `useEffect` return
- [ ] Event listeners are set up after client is available
- [ ] Non-React apps call `unsubscribe()` when appropriate

**Source Pointers:**
- `https://docs.velt.dev/get-started/advanced` - Velt Client > Event Subscriptions
