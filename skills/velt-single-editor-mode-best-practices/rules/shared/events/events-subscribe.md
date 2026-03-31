---
title: Subscribe to Single Editor Mode Events via API
impact: MEDIUM
impactDescription: React to access requests, role assignments, and tab changes
tags: on, subscribe, accessRequested, accessRequestCanceled, accessAccepted, accessRejected, editorAssigned, viewerAssigned, editorOnDifferentTabDetected, events
---

## Subscribe to Single Editor Mode Events via API

Single Editor Mode emits 7 event types covering access requests, role assignments, and multi-tab detection. Use `liveStateSyncElement.on('eventType').subscribe()` for framework-agnostic event handling.

**Incorrect (only subscribing to assignment events):**

```jsx
// Missing access request and tab events — incomplete UX
liveStateSyncElement.on('editorAssigned').subscribe((event) => {
  showNotification('New editor assigned');
});
```

**Correct (comprehensive event handling):**

```jsx
const liveStateSyncElement = client.getLiveStateSyncElement();

// Editor-side events
liveStateSyncElement.on('accessRequested').subscribe((event) => {
  console.log('Access requested by:', event);
});

liveStateSyncElement.on('accessRequestCanceled').subscribe((event) => {
  console.log('Access request canceled:', event);
});

// Viewer-side events
liveStateSyncElement.on('accessAccepted').subscribe((event) => {
  console.log('Your request was accepted:', event);
});

liveStateSyncElement.on('accessRejected').subscribe((event) => {
  console.log('Your request was rejected:', event);
});

// Role assignment events
liveStateSyncElement.on('editorAssigned').subscribe((event) => {
  console.log('Editor assigned:', event);
});

liveStateSyncElement.on('viewerAssigned').subscribe((event) => {
  console.log('Viewer assigned:', event);
});

// Multi-tab event
liveStateSyncElement.on('editorOnDifferentTabDetected').subscribe((event) => {
  console.log('Editor opened document in another tab:', event);
});
```

**Complete event reference:**

| Category | Event | Description | Event Object |
|----------|-------|-------------|--------------|
| Editor | `accessRequested` | Viewer requests access | AccessRequestEvent |
| Editor | `accessRequestCanceled` | Viewer cancels their request | AccessRequestEvent |
| Viewer | `accessAccepted` | Editor accepted the request | AccessRequestEvent |
| Viewer | `accessRejected` | Editor rejected the request | AccessRequestEvent |
| Assignment | `editorAssigned` | User becomes the editor | SEMEvent |
| Assignment | `viewerAssigned` | User becomes a viewer | SEMEvent |
| Tab | `editorOnDifferentTabDetected` | Editor opened same document in another tab | SEMEvent |

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.on('editorAssigned').subscribe((event) => {
  updateRoleUI('editor');
});
```

**Key details:**
- In React, prefer `useLiveStateSyncEventCallback()` hook (see `events-hooks` rule)
- Each `.on()` call returns an Observable — must call `.subscribe()`
- Store subscription references for cleanup (`.unsubscribe()`)
- `editorOnDifferentTabDetected` fires when the editor opens the same document in a second browser tab

**Verification:**
- [ ] Relevant events subscribed to for UX needs
- [ ] Subscriptions cleaned up on unmount
- [ ] Multi-tab event handled when `singleTabEditor: true`

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Event Subscription
