---
title: Use React Hooks for Editor State
impact: CRITICAL
impactDescription: Declarative editor state access with automatic cleanup in React
tags: useUserEditorState, useEditor, hooks, react, isEditor, isEditorOnCurrentTab
---

## Use React Hooks for Editor State

Use `useUserEditorState()` and `useEditor()` hooks for declarative editor state access in React components. These handle subscription lifecycle automatically.

**Incorrect (manual Observable subscription in React):**

```jsx
function EditorStatus() {
  const { client } = useVeltClient();
  const [isEditor, setIsEditor] = useState(false);

  // Manual subscription — requires cleanup, error-prone
  useEffect(() => {
    const sub = client.getLiveStateSyncElement().isUserEditor().subscribe((access) => {
      setIsEditor(access?.isEditor ?? false);
    });
    return () => sub?.unsubscribe();
  }, [client]);
}
```

**Correct (React hooks):**

```jsx
import {
  useUserEditorState,
  useEditor,
  useLiveStateSyncUtils
} from '@veltdev/react';

function EditorStatus() {
  const { isEditor, isEditorOnCurrentTab } = useUserEditorState();
  const editor = useEditor();
  const liveStateSyncElement = useLiveStateSyncUtils();

  // Tab locking: user is editor but on a different tab
  if (isEditor && !isEditorOnCurrentTab) {
    return (
      <div>
        <p>You are editing in another tab</p>
        <button onClick={() => liveStateSyncElement.editCurrentTab()}>
          Edit on this tab
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>Role: {isEditor ? 'Editor' : 'Viewer'}</p>
      {editor && <p>Current editor: {editor.name}</p>}
      {!isEditor && (
        <button onClick={() => liveStateSyncElement.setUserAsEditor()}>
          Start Editing
        </button>
      )}
    </div>
  );
}
```

**Available hooks:**

| Hook | Returns | Description |
|------|---------|-------------|
| `useUserEditorState()` | `{ isEditor, isEditorOnCurrentTab }` | Current user's editor status |
| `useEditor()` | `User` object or null | Current editor's identity (name, email, userId, photoUrl) |
| `useLiveStateSyncUtils()` | LiveStateSyncElement | API access for imperative methods |

**Key patterns:**
- `isEditor && !isEditorOnCurrentTab` — user is editor but on a different tab, show "Edit on this tab" button
- `!isEditor` — user is a viewer, show "Start Editing" or "Request Access" button
- `editor?.name` — display who is currently editing to all users

**Verification:**
- [ ] Using hooks instead of manual Observable subscriptions
- [ ] Tab locking UX implemented (isEditor && !isEditorOnCurrentTab)
- [ ] Viewer UX provides path to request or take editor access
- [ ] Hooks used within components inside VeltProvider

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Step 4, Step 6; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isUserEditor, getEditor
