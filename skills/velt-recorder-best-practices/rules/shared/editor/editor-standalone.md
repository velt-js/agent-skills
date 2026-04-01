---
title: Embed the Standalone VeltVideoEditor Component
impact: MEDIUM
impactDescription: Adds video viewing and editing outside the standard recorder flow
tags: VeltVideoEditor, standalone, blob, url, recorderId, darkMode, variant
---

## Embed the Standalone VeltVideoEditor Component

VeltVideoEditor is a standalone component for viewing and editing video recordings independently of the recorder flow. It accepts video input via blob, URL, or recorderId.

**Incorrect (using VeltRecorderPlayer for editing):**

```jsx
{/* VeltRecorderPlayer only plays back — it does not provide editing tools */}
<VeltRecorderPlayer recorderId={recorderId} />
```

**Correct (standalone video editor with different input sources):**

```jsx
import { VeltVideoEditor } from '@veltdev/react';

// Load from a recorded video by recorder ID
<VeltVideoEditor
  recorderId="zK3iEAfvs1Htu3QYPy5S"
  darkMode={false}
/>

// Load from a URL
<VeltVideoEditor
  url="https://example.com/video.mp4"
  darkMode={false}
  variant="compact"
/>

// Load from a Blob object
<VeltVideoEditor
  blob={videoBlob}
  darkMode={false}
/>
```

**For HTML:**

```html
<velt-video-editor
  recorder-id="zK3iEAfvs1Htu3QYPy5S"
  dark-mode="false"
></velt-video-editor>

<velt-video-editor
  url="https://example.com/video.mp4"
  dark-mode="false"
  variant="compact"
></velt-video-editor>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `blob` | `Blob` | Video blob object |
| `url` | `string` | URL to video file |
| `recorderId` | `string` | Recorder ID to load a specific recording |
| `darkMode` | `boolean` | Enable dark mode styling |
| `variant` | `string` | Variant styling option |

**Key details:**
- Use **one** input source: `blob`, `url`, or `recorderId` — not multiple simultaneously
- The standalone editor is independent of VeltRecorderTool and VeltRecorderControlPanel
- Useful for embedding video editing in custom page layouts or dedicated editing views

**Verification:**
- [ ] VeltVideoEditor used (not VeltRecorderPlayer) when editing is needed
- [ ] Exactly one input source provided (blob, url, or recorderId)
- [ ] Component renders and loads the video content

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/setup - Embed Velt Video Editor
