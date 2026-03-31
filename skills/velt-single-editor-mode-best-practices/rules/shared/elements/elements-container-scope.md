---
title: Scope Single Editor Mode to Specific Containers and Enable Auto-Sync
impact: HIGH
impactDescription: Control which areas of the page are governed by Single Editor Mode
tags: singleEditorModeContainerIds, containers, scope, enableAutoSyncState, data-velt-sync-state, input, textarea, contenteditable
---

## Scope Single Editor Mode to Specific Containers and Enable Auto-Sync

By default, Single Editor Mode applies to the entire DOM. Use `singleEditorModeContainerIds()` to restrict it to specific containers. Use `enableAutoSyncState()` with `data-velt-sync-state` to auto-sync text element contents.

**Incorrect (applying SEM to entire DOM when only editor area needs it):**

```jsx
const liveStateSyncElement = useLiveStateSyncUtils();

useEffect(() => {
  // Entire DOM is read-only for viewers — navigation, toolbars, etc. all disabled
  liveStateSyncElement.enableSingleEditorMode();
}, [liveStateSyncElement]);
```

**Correct (scoped to specific containers):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function App() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  useEffect(() => {
    liveStateSyncElement.enableSingleEditorMode();

    // Only apply SEM to these container IDs
    liveStateSyncElement.singleEditorModeContainerIds(['editor', 'rightPanel']);
  }, [liveStateSyncElement]);

  return (
    <div>
      <nav>Always interactive for all users</nav>
      <div id="editor">Only editable by the editor</div>
      <div id="rightPanel">Only editable by the editor</div>
      <footer>Always interactive for all users</footer>
    </div>
  );
}
```

**Auto-sync text elements:**

```jsx
function App() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  useEffect(() => {
    liveStateSyncElement.enableSingleEditorMode();
    // Enable auto-sync for text elements
    liveStateSyncElement.enableAutoSyncState();
  }, [liveStateSyncElement]);

  return (
    <div>
      {/* Each synced element needs a unique id */}
      <input id="titleInput" data-velt-sync-state="true" />
      <textarea id="descriptionArea" data-velt-sync-state="true" />
      <div id="richEditor" contentEditable data-velt-sync-state="true" />
    </div>
  );
}
```

**Supported auto-sync elements:**
- `<input>` — text inputs
- `<textarea>` — multi-line text areas
- ContentEditable `<div>` — rich text areas

**Key details:**
- `singleEditorModeContainerIds()` accepts an array of HTML element IDs
- Elements outside the specified containers remain interactive for all users
- `enableAutoSyncState()` must be called before using `data-velt-sync-state` attribute
- Each synced element must have a **unique `id`** attribute for proper sync tracking
- Container scoping and auto-sync can be used together

**Verification:**
- [ ] Container IDs match actual DOM element IDs
- [ ] Navigation and shared controls are outside scoped containers
- [ ] Auto-sync elements have unique `id` attributes
- [ ] `enableAutoSyncState()` called before using `data-velt-sync-state`

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - singleEditorModeContainerIds, Auto-Sync Text Elements
