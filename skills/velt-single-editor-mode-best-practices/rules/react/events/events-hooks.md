---
title: Use useLiveStateSyncEventCallback for React Event Subscriptions
impact: MEDIUM
impactDescription: Declarative event handling with automatic cleanup in React
tags: useLiveStateSyncEventCallback, hooks, react, events, accessRequested, editorAssigned
---

## Use useLiveStateSyncEventCallback for React Event Subscriptions

In React, use `useLiveStateSyncEventCallback()` for declarative event subscriptions instead of manually calling `.on().subscribe()`.

**Incorrect (manual subscription in React):**

```jsx
function EventHandler() {
  const { client } = useVeltClient();

  useEffect(() => {
    const sub = client.getLiveStateSyncElement()
      .on('editorAssigned')
      .subscribe((event) => { /* ... */ });
    return () => sub?.unsubscribe();
  }, [client]);
}
```

**Correct (hook-based event subscriptions):**

```jsx
import { useLiveStateSyncEventCallback } from '@veltdev/react';

function SingleEditorEvents() {
  // One hook call per event type
  const accessRequested = useLiveStateSyncEventCallback('accessRequested');
  const accessAccepted = useLiveStateSyncEventCallback('accessAccepted');
  const editorAssigned = useLiveStateSyncEventCallback('editorAssigned');
  const differentTab = useLiveStateSyncEventCallback('editorOnDifferentTabDetected');

  useEffect(() => {
    if (accessRequested) {
      console.log('Someone requested access:', accessRequested);
    }
  }, [accessRequested]);

  useEffect(() => {
    if (accessAccepted) {
      console.log('Access request accepted:', accessAccepted);
    }
  }, [accessAccepted]);

  useEffect(() => {
    if (editorAssigned) {
      console.log('Editor assigned:', editorAssigned);
    }
  }, [editorAssigned]);

  useEffect(() => {
    if (differentTab) {
      console.log('Editor on different tab:', differentTab);
    }
  }, [differentTab]);

  return null; // Event handler component
}
```

**Supported event types:**
`accessRequested`, `accessRequestCanceled`, `accessAccepted`, `accessRejected`, `editorAssigned`, `viewerAssigned`, `editorOnDifferentTabDetected`

**Key details:**
- Each event type needs a separate hook call
- Hook returns event data or null (no event yet)
- React to changes via `useEffect` with the return value as a dependency
- Handles subscription lifecycle and cleanup automatically

**Verification:**
- [ ] Using hook instead of manual `.on().subscribe()` in React
- [ ] Each event type has its own hook call and useEffect handler
- [ ] Hook used within component inside VeltProvider

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Event Subscription (Using Hooks)
