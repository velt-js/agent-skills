---
title: Configure Fullscreen Playback and Click Behavior
impact: MEDIUM
impactDescription: Controls recording playback UX
tags: playVideoInFullScreen, playbackOnPreviewClick, VeltRecorderPlayer, playback
---

## Configure Fullscreen Playback and Click Behavior

Control how recordings are played back by enabling fullscreen mode for better visibility and configuring click-to-play behavior on previews.

**Incorrect (small player for long screen recordings):**

```jsx
{/* Long screen recordings are hard to view in a small inline player */}
<VeltRecorderPlayer recorderId={recorderId} />
```

**Correct (fullscreen playback for screen recordings):**

```jsx
{/* Per-player fullscreen */}
<VeltRecorderPlayer
  recorderId={recorderId}
  playVideoInFullScreen={true}
/>

{/* Global fullscreen setting via control panel */}
<VeltRecorderControlPanel
  mode="thread"
  playVideoInFullScreen={true}
/>

{/* Global fullscreen setting via recorder notes */}
<VeltRecorderNotes playVideoInFullScreen={true} />
```

**Click-to-play behavior:**

```jsx
{/* Enable click-to-play/pause on recording preview (default: true) */}
<VeltRecorderPlayer
  recorderId={recorderId}
  playbackOnPreviewClick={true}
/>

{/* Disable click-to-play — useful when embedding in clickable containers */}
<VeltRecorderPlayer
  recorderId={recorderId}
  playbackOnPreviewClick={false}
/>
```

**Playback via API:**

```jsx
import { useVeltClient } from '@veltdev/react';

const client = useVeltClient();

// Enable/disable click-to-play programmatically
client.getRecorderElement().enablePlaybackOnPreviewClick();
client.getRecorderElement().disablePlaybackOnPreviewClick();
```

**For HTML:**

```html
<velt-recorder-player
  recorder-id="RECORDER_ID"
  play-video-in-full-screen="true"
  playback-on-preview-click="true"
></velt-recorder-player>
```

**Key details:**
- `playVideoInFullScreen` can be set per-player or globally via VeltRecorderControlPanel/VeltRecorderNotes
- `playbackOnPreviewClick` defaults to `true` — disable it when the player is inside a clickable container to prevent event conflicts
- Both have API equivalents for programmatic control

**Verification:**
- [ ] Fullscreen enabled for screen recording playback
- [ ] Click-to-play behavior matches UX requirements
- [ ] No click event conflicts when player is in clickable containers

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - playVideoInFullScreen, playbackOnPreviewClick
