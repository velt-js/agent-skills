---
title: Use useEditorAccessRequestHandler for React Access Flow
impact: HIGH
impactDescription: Declarative access request handling for the editor side in React
tags: useEditorAccessRequestHandler, hooks, react, EditorRequest, accept, reject
---

## Use useEditorAccessRequestHandler for React Access Flow

In React, use `useEditorAccessRequestHandler()` on the editor side instead of manually subscribing to `isEditorAccessRequested()`. Combine with `useLiveStateSyncUtils()` for accept/reject actions.

**Incorrect (manual subscription in React):**

```jsx
function EditorHandler() {
  const { client } = useVeltClient();

  useEffect(() => {
    const sub = client.getLiveStateSyncElement()
      .isEditorAccessRequested()
      .subscribe((data) => {
        // Manual cleanup needed, error-prone
      });
    return () => sub?.unsubscribe();
  }, [client]);
}
```

**Correct (hook-based editor-side handling):**

```jsx
import {
  useEditorAccessRequestHandler,
  useLiveStateSyncUtils,
  useUserEditorState
} from '@veltdev/react';

function EditorAccessPanel() {
  const editorAccessRequested = useEditorAccessRequestHandler();
  const liveStateSyncElement = useLiveStateSyncUtils();
  const { isEditor } = useUserEditorState();

  // Only show to the current editor when there is an active request
  if (!isEditor || !editorAccessRequested) return null;

  return (
    <div className="access-request-banner">
      <p>{editorAccessRequested.requestedBy.name} wants to edit</p>
      <button onClick={() => liveStateSyncElement.acceptEditorAccessRequest()}>
        Accept
      </button>
      <button onClick={() => liveStateSyncElement.rejectEditorAccessRequest()}>
        Reject
      </button>
    </div>
  );
}
```

**Key details:**
- `useEditorAccessRequestHandler()` returns `EditorRequest | null`
  - `null` — no active request, user is not editor, or request was canceled
  - `EditorRequest` — `{ requestStatus: 'requested', requestedBy: User }`
- Accept/reject methods are on the LiveStateSyncElement, not on the hook return value
- The viewer side still uses the API Observable pattern (`requestEditorAccess().subscribe()`) — no dedicated viewer hook exists
- After accepting, the requester becomes editor and the current editor becomes viewer

**Verification:**
- [ ] Using hook instead of manual Observable subscription
- [ ] Null check before rendering request UI
- [ ] Accept/reject wired to `liveStateSyncElement` methods
- [ ] Only displayed when user is editor (`isEditor === true`)

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Step 5; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isEditorAccessRequested
