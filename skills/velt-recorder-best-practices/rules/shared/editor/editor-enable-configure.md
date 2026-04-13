---
title: Enable and Configure the Video Editor
impact: MEDIUM
impactDescription: Adds post-recording editing capabilities for video and screen recordings
tags: videoEditor, enableVideoEditor, autoOpenVideoEditor, retakeOnVideoEditor, videoEditorTimelinePreview, onboardingTooltip
---

## Enable and Configure the Video Editor

The video editor allows users to trim, split, and delete sections of recordings after capture. It is disabled by default and only works for video and screen recordings (not audio). Multiple configuration options control editor behavior.

**Incorrect (enabling timeline preview without enabling editor):**

```jsx
{/* videoEditorTimelinePreview requires videoEditor to also be true */}
<VeltRecorderControlPanel videoEditorTimelinePreview={true} />
```

**Correct (video editor with full configuration):**

```jsx
{/* Enable video editor on control panel */}
<VeltRecorderControlPanel
  videoEditor={true}
  autoOpenVideoEditor={true}
  retakeOnVideoEditor={true}
  videoEditorTimelinePreview={true}
/>

{/* Enable video editor on player */}
<VeltRecorderPlayer
  recorderId={recorderId}
  videoEditor={true}
  retakeOnVideoEditor={true}
/>

{/* Enable video editor on recorder notes */}
<VeltRecorderNotes
  videoEditor={true}
  videoEditorTimelinePreview={true}
/>
```

**Correct (video editor via API):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function EditorConfig() {
  const recorderUtils = useRecorderUtils();

  useEffect(() => {
    // Enable video editor globally
    recorderUtils.enableVideoEditor();

    // Enable retake button on video editor
    recorderUtils.enableRetakeOnVideoEditor();

    // Enable onboarding tooltip
    recorderUtils.enableOnboardingTooltip();
  }, [recorderUtils]);

  return <VeltRecorderTool type="video" />;
}
```

**For HTML:**

```html
<velt-recorder-control-panel
  video-editor="true"
  auto-open-video-editor="true"
  retake-on-video-editor="true"
  video-editor-timeline-preview="true"
></velt-recorder-control-panel>

<velt-recorder-player
  recorder-id="RECORDER_ID"
  video-editor="true"
></velt-recorder-player>
```

**Configuration options:**

| Option | Default | Component(s) | Description |
|--------|---------|---------------|-------------|
| `videoEditor` | `false` | Notes, Player, ControlPanel | Master toggle for video editor |
| `autoOpenVideoEditor` | `false` | ControlPanel only | Auto-open editor when recording finishes |
| `retakeOnVideoEditor` | `false` | Player, ControlPanel, Tool | Show retake button to re-record |
| `videoEditorTimelinePreview` | `false` | Notes, ControlPanel | Show frame snapshots in timeline |
| `enableOnboardingTooltip()` | `false` | API only | Show onboarding tooltip |

**Keyboard shortcuts in editor:**
- `s` — Split video at selected frame
- `d`, `delete`, or `backspace` — Delete selected video section
- `space` — Toggle play/pause

**Disable methods (API):**

```tsx
const recorderElement = client.getRecorderElement();

// Disable video editor
recorderElement.disableVideoEditor();

// Disable retake button
recorderElement.disableRetakeOnVideoEditor();

// Disable onboarding tooltip
recorderElement.disableOnboardingTooltip();
```

**Constraints:**
- Video editor only works for **video** and **screen** recordings (not audio)
- `videoEditorTimelinePreview` requires `videoEditor` to also be `true`
- The Recording Editor is currently in beta

**Verification:**
- [ ] `videoEditor` enabled on relevant components
- [ ] `videoEditorTimelinePreview` only set when `videoEditor` is also `true`
- [ ] Editor only expected for video/screen recordings, not audio
- [ ] Retake button enabled if re-recording is desired

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/setup - Enable Recording Editor; https://docs.velt.dev/async-collaboration/recorder/customize-behavior - videoEditor, autoOpenVideoEditor, retakeOnVideoEditor, videoEditorTimelinePreview
