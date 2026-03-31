---
title: Handle Editor Access Requests via API
impact: HIGH
impactDescription: Enable editors to accept or reject access requests from viewers
tags: isEditorAccessRequested, acceptEditorAccessRequest, rejectEditorAccessRequest, EditorRequest, requestedBy
---

## Handle Editor Access Requests via API

When a viewer requests editor access, the current editor receives the request via `isEditorAccessRequested()`. The editor must respond with `acceptEditorAccessRequest()` or `rejectEditorAccessRequest()`.

**Incorrect (not subscribing to incoming requests):**

```jsx
// Editor has no way to see or respond to access requests
// Viewers are stuck waiting indefinitely
```

**Correct (editor-side request handling via API):**

```jsx
import { useVeltClient } from '@veltdev/react';

function EditorRequestHandler() {
  const { client } = useVeltClient();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const liveStateSyncElement = client.getLiveStateSyncElement();

    const sub = liveStateSyncElement.isEditorAccessRequested().subscribe((data) => {
      if (data === null) {
        // No active request, or user is not the editor, or request was canceled
        setRequest(null);
        return;
      }
      // Active request from a viewer
      setRequest(data); // { requestStatus: 'requested', requestedBy: User }
    });

    return () => sub?.unsubscribe();
  }, [client]);

  const handleAccept = () => {
    const liveStateSyncElement = client.getLiveStateSyncElement();
    liveStateSyncElement.acceptEditorAccessRequest();
  };

  const handleReject = () => {
    const liveStateSyncElement = client.getLiveStateSyncElement();
    liveStateSyncElement.rejectEditorAccessRequest();
  };

  if (!request) return null;

  return (
    <div>
      <p>{request.requestedBy.name} wants to edit</p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleReject}>Reject</button>
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.isEditorAccessRequested().subscribe((data) => {
  if (data === null) return;
  showRequestBanner(data.requestedBy.name);
});

// On user action:
liveStateSyncElement.acceptEditorAccessRequest();
// or
liveStateSyncElement.rejectEditorAccessRequest();
```

**Key details:**
- `isEditorAccessRequested()` returns `null` when: user is not the editor, no active request, or request was canceled
- The `EditorRequest` object contains `requestStatus` ('requested') and `requestedBy` (User with name, email, userId, photoUrl)
- After accepting, the requester becomes the new editor and the current editor becomes a viewer
- In React, prefer `useEditorAccessRequestHandler()` hook (see `access-hooks` rule)

**Verification:**
- [ ] Subscribed to incoming access requests
- [ ] Null state handled (no request or not editor)
- [ ] Accept and reject buttons wired to correct methods
- [ ] Subscription cleaned up on unmount

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isEditorAccessRequested, acceptEditorAccessRequest, rejectEditorAccessRequest
