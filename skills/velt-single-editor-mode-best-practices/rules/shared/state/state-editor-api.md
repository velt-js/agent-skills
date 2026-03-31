---
title: Subscribe to Editor State and Identity via API
impact: HIGH
impactDescription: Framework-agnostic editor state tracking with proper cleanup
tags: isUserEditor, getEditor, subscribe, Observable, UserEditorAccess, unsubscribe
---

## Subscribe to Editor State and Identity via API

Use `isUserEditor()` and `getEditor()` Observables for real-time editor state tracking in non-React contexts or when you need manual subscription control. Handle null and undefined return values correctly.

**Incorrect (not handling null/undefined states):**

```jsx
const liveStateSyncElement = client.getLiveStateSyncElement();

// Not handling null (loading) or undefined (no editors)
liveStateSyncElement.isUserEditor().subscribe((access) => {
  // TypeError when access is null or undefined
  const role = access.isEditor ? 'Editor' : 'Viewer';
});
```

**Correct (full state handling with cleanup):**

```jsx
import { useVeltClient } from '@veltdev/react';

function EditorStatus() {
  const { client } = useVeltClient();
  const [editorState, setEditorState] = useState(null);
  const [currentEditor, setCurrentEditor] = useState(null);

  useEffect(() => {
    const liveStateSyncElement = client.getLiveStateSyncElement();

    // Subscribe to editor access state
    const stateSub = liveStateSyncElement.isUserEditor().subscribe((access) => {
      if (access === null) return;       // State not available yet
      if (access === undefined) {        // No editors in Single Editor Mode
        setEditorState({ isEditor: false, isEditorOnCurrentTab: false });
        return;
      }
      setEditorState(access); // { isEditor, isEditorOnCurrentTab }
    });

    // Subscribe to current editor identity
    const editorSub = liveStateSyncElement.getEditor().subscribe((user) => {
      setCurrentEditor(user); // { name, email, userId, photoUrl }
    });

    return () => {
      stateSub?.unsubscribe();
      editorSub?.unsubscribe();
    };
  }, [client]);

  return (
    <div>
      <p>Role: {editorState?.isEditor ? 'Editor' : 'Viewer'}</p>
      {currentEditor && <p>Current editor: {currentEditor.name}</p>}
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

const sub = liveStateSyncElement.isUserEditor().subscribe((access) => {
  if (access === null) return;      // Loading
  if (access === undefined) return; // No editors
  updateUI(access.isEditor, access.isEditorOnCurrentTab);
});

const editorSub = liveStateSyncElement.getEditor().subscribe((user) => {
  if (user) showEditorBadge(user.name, user.photoUrl);
});

// Cleanup
sub.unsubscribe();
editorSub.unsubscribe();
```

**Return values for `isUserEditor()`:**

| Value | Meaning |
|-------|---------|
| `null` | State not available yet (loading) |
| `undefined` | No current editors in Single Editor Mode |
| `{ isEditor, isEditorOnCurrentTab }` | User's editor access state |

**Key details:**
- In React, prefer `useUserEditorState()` and `useEditor()` hooks (see `state-hooks` rule)
- Both Observables emit reactively on every change
- Must unsubscribe on cleanup to prevent memory leaks

**Verification:**
- [ ] Null and undefined return values handled separately
- [ ] Subscriptions cleaned up on unmount
- [ ] Editor identity displayed to all users (not just the editor)

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isUserEditor, getEditor
