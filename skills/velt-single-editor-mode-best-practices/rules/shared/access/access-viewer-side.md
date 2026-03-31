---
title: Request and Cancel Editor Access as Viewer
impact: HIGH
impactDescription: Enable viewers to request editing access from the current editor
tags: requestEditorAccess, cancelEditorAccessRequest, Observable, pending, accepted, rejected, viewer
---

## Request and Cancel Editor Access as Viewer

Viewers use `requestEditorAccess()` to request editing rights. The method returns an Observable that emits the request status: `null` (pending), `true` (accepted), or `false` (rejected).

**Incorrect (not subscribing to the Observable result):**

```jsx
const liveStateSyncElement = useLiveStateSyncUtils();

// Fire-and-forget — no way to know if request was accepted or rejected
liveStateSyncElement.requestEditorAccess();
```

**Correct (subscribing to request status):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function ViewerAccessRequest() {
  const liveStateSyncElement = useLiveStateSyncUtils();
  const [requestStatus, setRequestStatus] = useState(null);
  const subscriptionRef = useRef(null);

  const handleRequest = () => {
    subscriptionRef.current = liveStateSyncElement
      .requestEditorAccess()
      .subscribe((status) => {
        if (status === null) {
          setRequestStatus('pending');
        } else if (status === true) {
          setRequestStatus('accepted');
          // User is now the editor
        } else {
          setRequestStatus('rejected');
        }
      });
  };

  const handleCancel = () => {
    liveStateSyncElement.cancelEditorAccessRequest();
    subscriptionRef.current?.unsubscribe();
    setRequestStatus(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => subscriptionRef.current?.unsubscribe();
  }, []);

  return (
    <div>
      {requestStatus === null && (
        <button onClick={handleRequest}>Request Edit Access</button>
      )}
      {requestStatus === 'pending' && (
        <div>
          <p>Waiting for editor to respond...</p>
          <button onClick={handleCancel}>Cancel Request</button>
        </div>
      )}
      {requestStatus === 'accepted' && <p>You are now the editor</p>}
      {requestStatus === 'rejected' && (
        <div>
          <p>Request was rejected</p>
          <button onClick={() => setRequestStatus(null)}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

const subscription = liveStateSyncElement.requestEditorAccess().subscribe((status) => {
  if (status === null) showPendingUI();
  else if (status === true) showEditorUI();
  else showRejectedUI();
});

// Cancel the request
liveStateSyncElement.cancelEditorAccessRequest();
subscription.unsubscribe();
```

**Observable return values:**

| Value | Meaning |
|-------|---------|
| `null` | Request is pending — waiting for editor response |
| `true` | Request accepted — user is now the editor |
| `false` | Request rejected by the editor |

**Key details:**
- `requestEditorAccess()` returns an Observable — must call `.subscribe()`
- Store the subscription reference for cleanup and cancellation
- `cancelEditorAccessRequest()` cancels the pending request (editor sees request disappear)
- No dedicated React hook exists for viewer-side requests — use the API Observable pattern even in React

**Verification:**
- [ ] Observable subscribed to (not fire-and-forget)
- [ ] All 3 states handled (null/pending, true/accepted, false/rejected)
- [ ] Cancel button available while request is pending
- [ ] Subscription cleaned up on unmount

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - requestEditorAccess, cancelEditorAccessRequest
