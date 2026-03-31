---
title: Enable Picture-in-Picture for Screen Recordings
impact: MEDIUM
impactDescription: Allows multitasking during screen recording with camera overlay
tags: pictureInPicture, PiP, screen, camera, Chrome, useRecorderUtils
---

## Enable Picture-in-Picture for Screen Recordings

Picture-in-Picture (PiP) mode shows a floating camera overlay during screen recordings, enabling users to multitask while recording. This feature is disabled by default and has specific browser and mode constraints.

**Incorrect (enabling PiP without understanding constraints):**

```jsx
// PiP won't work in Firefox/Safari — Chrome only
// PiP won't work for audio-only or video-only recordings
<VeltRecorderTool type="audio" pictureInPicture={true} />
```

**Correct (PiP enabled for screen recordings on Chrome):**

```jsx
{/* PiP requires: Chrome browser + screen recording + camera active */}
<VeltRecorderTool type="screen" pictureInPicture={true} />
<VeltRecorderControlPanel mode="floating" pictureInPicture={true} />
```

**Correct (PiP via API with programmatic control):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function RecorderWithPiP() {
  const recorderUtils = useRecorderUtils();

  const enablePiP = () => {
    recorderUtils.enablePictureInPicture();
  };

  const openPiP = () => {
    // Open PiP window during an active recording
    recorderUtils.openPictureInPicture();
  };

  const closePiP = () => {
    // Close PiP window, return to normal recording view
    recorderUtils.exitPictureInPicture();
  };

  return (
    <div>
      <button onClick={enablePiP}>Enable PiP</button>
      <button onClick={openPiP}>Open PiP</button>
      <button onClick={closePiP}>Close PiP</button>
      <VeltRecorderTool type="screen" />
    </div>
  );
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();
recorderElement.enablePictureInPicture();
recorderElement.openPictureInPicture();   // During active recording
recorderElement.exitPictureInPicture();   // During active recording

// To disable:
recorderElement.disablePictureInPicture();
```

**Constraints:**
- **Chrome only** — PiP is not supported in Firefox or Safari
- **Screen recording mode only** — does not work with audio or video-only recordings
- **Camera must be active** — PiP shows the camera feed as an overlay on screen capture
- `openPictureInPicture()` and `exitPictureInPicture()` only work during an active recording

**Verification:**
- [ ] PiP enabled only for screen recording type
- [ ] Browser is Chrome (feature degrades gracefully in other browsers)
- [ ] Camera permission granted before activating PiP
- [ ] PiP window appears during active screen recording

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - enablePictureInPicture, openPictureInPicture, exitPictureInPicture
