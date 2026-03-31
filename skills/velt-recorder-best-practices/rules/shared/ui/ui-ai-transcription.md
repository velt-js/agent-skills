---
title: Configure AI Transcription and Summary Display
impact: MEDIUM
impactDescription: Controls LLM-powered transcription and summary visibility
tags: recordingTranscription, summary, AI, LLM, privacy, VeltRecorderNotes, VeltRecorderPlayer, VeltRecorderControlPanel
---

## Configure AI Transcription and Summary Display

Velt Recorder supports AI-powered transcription and summary generation for recordings. Transcription is enabled by default — when enabled, recording content is sent to LLMs for processing. Disable it for sensitive content.

**Incorrect (leaving transcription enabled for sensitive recordings):**

```jsx
{/* Default: transcription is enabled — recording sent to LLMs */}
{/* This may violate privacy/compliance requirements for sensitive content */}
<VeltRecorderNotes />
<VeltRecorderControlPanel mode="thread" />
```

**Correct (explicit transcription control):**

```jsx
{/* Disable transcription for sensitive recordings */}
<VeltRecorderNotes recordingTranscription={false} />
<VeltRecorderControlPanel
  mode="thread"
  recordingTranscription={false}
/>

{/* Control summary display on player */}
<VeltRecorderPlayer
  recorderId={recorderId}
  summary={true}   // Show AI-generated summary (default: true)
/>

{/* Hide summary */}
<VeltRecorderPlayer
  recorderId={recorderId}
  summary={false}
/>
```

**Transcription via API:**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function TranscriptionConfig() {
  const recorderUtils = useRecorderUtils();

  // Disable transcription (recording won't be sent to LLMs)
  recorderUtils.disableRecordingTranscription();

  // Re-enable transcription
  recorderUtils.enableRecordingTranscription();
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();
recorderElement.disableRecordingTranscription();
recorderElement.enableRecordingTranscription();
```

**For HTML:**

```html
<velt-recorder-notes recording-transcription="false"></velt-recorder-notes>
<velt-recorder-control-panel recording-transcription="false"></velt-recorder-control-panel>
<velt-recorder-player recorder-id="RECORDER_ID" summary="true"></velt-recorder-player>
```

**Key details:**
- `recordingTranscription` defaults to **enabled** — recordings are sent to LLMs for transcription
- Disabling transcription means no AI summary will be generated
- `summary` prop on VeltRecorderPlayer controls whether the AI summary transcript is displayed (default: `true`)
- `recordingTranscription` can be set on VeltRecorderNotes and VeltRecorderControlPanel
- Privacy consideration: explicitly disable transcription for recordings containing sensitive, confidential, or regulated content

**Verification:**
- [ ] Transcription disabled for sensitive content
- [ ] Summary display matches UX requirements
- [ ] Privacy/compliance requirements reviewed for AI data processing

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - recordingTranscription, summary
