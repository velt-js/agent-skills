---
title: Request Device Permissions Before Recording
impact: HIGH
impactDescription: Prevents permission-denied errors during recording
tags: permissions, device, camera, microphone, screen, askDevicePermission, requestScreenPermission
---

## Request Device Permissions Before Recording

Browser device permissions (camera, microphone, screen) should be requested proactively during onboarding rather than waiting for the first recording attempt. This prevents unexpected permission dialogs and allows graceful handling when permissions are denied.

**Incorrect (no proactive permission handling):**

```jsx
function RecorderSetup() {
  // No permission request — user sees browser permission dialog
  // only when they click record, with no recovery if denied
  return <VeltRecorderTool type="all" />;
}
```

**Correct (proactive permission requests during setup):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function RecorderSetup() {
  const recorderUtils = useRecorderUtils();

  const requestPermissions = async () => {
    // Request camera and microphone permissions
    await recorderUtils.askDevicePermission({
      audio: true,
      video: true
    });

    // Request screen capture permission separately (enables screen preview)
    const stream = await recorderUtils.requestScreenPermission();
    if (!stream) {
      console.warn('Screen permission denied or cancelled');
    }
  };

  return (
    <div>
      <button onClick={requestPermissions}>Enable Recording</button>
      <VeltRecorderTool type="all" />
    </div>
  );
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();

// Request camera and microphone
await recorderElement.askDevicePermission({
  audio: true,
  video: true
});

// Request screen capture (returns MediaStream or null)
const stream = await recorderElement.requestScreenPermission();
```

**Key details:**
- `askDevicePermission()` accepts `{ audio: boolean, video: boolean }` — request only what you need
- `requestScreenPermission()` returns `Promise<MediaStream | null>` — null means denied or cancelled
- Screen permission also enables the screen preview in the Recording Preview Dialog

**Verification:**
- [ ] Device permissions requested before first recording attempt
- [ ] Null/denied case handled gracefully for screen permission
- [ ] Only required permissions requested (audio-only recordings don't need video)

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - askDevicePermission, requestScreenPermission
