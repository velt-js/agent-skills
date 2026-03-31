---
title: Enable Single Editor Mode with Configuration and Default UI
impact: CRITICAL
impactDescription: Required for Single Editor Mode to function
tags: setup, enableSingleEditorMode, disableSingleEditorMode, useLiveStateSyncUtils, VeltSingleEditorModePanel, customMode, singleTabEditor, enableDefaultSingleEditorUI
---

## Enable Single Editor Mode with Configuration and Default UI

Single Editor Mode must be explicitly enabled via the Live State Sync element. Configure `customMode` and `singleTabEditor` options, and either use the default UI panel or build a custom interface.

**Incorrect (enabling without cleanup or UI):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function App() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  useEffect(() => {
    // No cleanup — SEM stays enabled even after unmount
    liveStateSyncElement.enableSingleEditorMode();
    // No UI — users can't see editor status or request access
  }, [liveStateSyncElement]);

  return <YourApp />;
}
```

**Correct (full setup with config, default UI, and cleanup):**

```jsx
import {
  useLiveStateSyncUtils,
  VeltSingleEditorModePanel
} from '@veltdev/react';

function App() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  useEffect(() => {
    // Enable with configuration
    liveStateSyncElement.enableSingleEditorMode({
      customMode: false,        // SDK auto-manages read-only state (default)
      singleTabEditor: true,    // Restrict editing to one tab (default)
    });

    // Enable default UI for editor status and access requests
    liveStateSyncElement.enableDefaultSingleEditorUI();

    // Cleanup on unmount
    return () => {
      liveStateSyncElement.disableSingleEditorMode();
    };
  }, [liveStateSyncElement]);

  return (
    <div>
      {/* Render the panel component for access request UI */}
      <VeltSingleEditorModePanel shadowDom={false} />
      <YourApp />
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.enableSingleEditorMode({
  customMode: false,
  singleTabEditor: true,
});

liveStateSyncElement.enableDefaultSingleEditorUI();
```

**For HTML:**

```html
<velt-single-editor-mode-panel shadow-dom="false"></velt-single-editor-mode-panel>
```

**Configuration options:**

| Option | Default | Description |
|--------|---------|-------------|
| `customMode` | `false` | When `true`, SDK won't auto-manage read-only state — you must handle UI state manually |
| `singleTabEditor` | `true` | Restrict editing to a single browser tab per user |

**Panel component props:**

| Prop | Type | Description |
|------|------|-------------|
| `shadowDom` | `boolean` | Enable/disable shadow DOM |
| `darkMode` | `boolean` | Enable dark mode |
| `variant` | `string` | UI variant styling |

**Key details:**
- Initialize Velt (VeltProvider + user auth) before enabling Single Editor Mode
- `enableDefaultSingleEditorUI()` shows a built-in panel with editor status, access requests, and timeout countdown
- For custom UI, call `disableDefaultSingleEditorUI()` and use the hooks/APIs from the access and state rules
- Call `disableSingleEditorMode()` on cleanup to properly release resources

**Verification:**
- [ ] VeltProvider configured with API key and user authenticated
- [ ] `enableSingleEditorMode()` called with explicit config
- [ ] Default UI enabled or custom UI implemented
- [ ] `disableSingleEditorMode()` called on unmount/cleanup

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Initialize Single Editor Mode; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - enableSingleEditorMode, enableDefaultSingleEditorUI
