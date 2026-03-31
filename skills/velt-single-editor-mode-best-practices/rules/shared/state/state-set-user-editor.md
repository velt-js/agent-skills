---
title: Set User as Editor with Error Handling
impact: CRITICAL
impactDescription: Required to assign editing rights and handle conflicts
tags: setUserAsEditor, error handling, same_user_editor_current_tab, same_user_editor_different_tab, another_user_editor, editCurrentTab
---

## Set User as Editor with Error Handling

`setUserAsEditor()` returns a Promise with an optional error object. Handle all 3 error codes to provide clear UX feedback when editor assignment fails.

**Incorrect (not handling errors):**

```jsx
const liveStateSyncElement = useLiveStateSyncUtils();

// Fire-and-forget — no error handling
const handleEdit = () => {
  liveStateSyncElement.setUserAsEditor();
};
```

**Correct (full error handling):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function EditButton() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  const handleStartEditing = async () => {
    const result = await liveStateSyncElement.setUserAsEditor();

    if (result?.error) {
      switch (result.error.code) {
        case 'same_user_editor_current_tab':
          // User is already the editor on this tab — no action needed
          console.log('You are already editing on this tab');
          break;
        case 'same_user_editor_different_tab':
          // User is editor on another tab — offer to switch
          console.log('You are editing in another tab');
          // Call editCurrentTab() to move editing here
          liveStateSyncElement.editCurrentTab();
          break;
        case 'another_user_editor':
          // Someone else is editing — must request access
          console.log('Another user is currently editing');
          break;
      }
    } else {
      console.log('You are now the editor');
    }
  };

  return <button onClick={handleStartEditing}>Start Editing</button>;
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

const result = await liveStateSyncElement.setUserAsEditor();
if (result?.error) {
  console.log('Error:', result.error.code, result.error.message);
}
```

**Error codes:**

| Code | Meaning | Suggested Action |
|------|---------|------------------|
| `same_user_editor_current_tab` | Already editing on this tab | No action needed |
| `same_user_editor_different_tab` | Editing on another tab | Call `editCurrentTab()` to switch |
| `another_user_editor` | Different user is editing | Call `requestEditorAccess()` |

**Key details:**
- Always `await` the result — the Promise resolves to `{ error?: ErrorEvent }` or void
- Call on explicit user action (e.g., button click, start typing) — not automatically on page load
- Use `editCurrentTab()` to move editing to the current tab when the user is editor on a different tab

**Verification:**
- [ ] `setUserAsEditor()` awaited
- [ ] All 3 error codes handled with appropriate UX
- [ ] `editCurrentTab()` called for `same_user_editor_different_tab` scenario
- [ ] Called on explicit user interaction, not page load

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - setUserAsEditor, editCurrentTab
