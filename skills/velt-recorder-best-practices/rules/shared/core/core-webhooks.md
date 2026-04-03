---
title: Handle the recorder.done Webhook Event for Completed Recordings
impact: MEDIUM-HIGH
impactDescription: Enables server-side processing of completed recordings including assets and AI transcription
tags: webhook, recorder.done, RecorderPayload, RecorderTrigger, triggers, assets, transcription, server-side
---

## Handle the recorder.done Webhook Event for Completed Recordings

Velt fires a `recorder.done` server-side webhook when a recording session completes. The event delivers a `RecorderPayload` containing recording assets and AI transcription data. Toggle the event via `triggers.recorder.done` (defaults to `true`).

**Incorrect (ignoring the event field before processing payload):**

```typescript
// Missing event type check — will process all webhook events as recorder.done
app.post('/webhook', express.json(), (req, res) => {
  const { assets, transcription } = req.body; // Wrong — payload is nested
  processRecording(assets);
  res.sendStatus(200);
});
```

**Correct (Express webhook handler with event guard and nested payload):**

```typescript
import express from 'express';

app.post('/webhook', express.json(), (req, res) => {
  const { event, payload } = req.body;

  if (event === 'recorder.done') {
    const { assets, transcription } = payload as RecorderPayload;

    // Process each recording asset
    for (const asset of assets ?? []) {
      console.log('Asset URL:', asset.url);
      console.log('Format:', asset.fileFormat); // 'mp3' | 'mp4' | 'webm'
      console.log('Transcript segments:', asset.transcription?.transcriptSegments);
    }

    // Process top-level transcription data
    if (transcription) {
      console.log('VTT file:', transcription.vttFileUrl);
      console.log('Summary:', transcription.contentSummary);
    }
  }

  res.sendStatus(200);
});
```

**RecorderPayload shape:**

| Field | Type | Description |
|-------|------|-------------|
| `actionUser` | `object` | The user who completed the recording |
| `metadata` | `object` | Document and context metadata |
| `recorderId` | `string` | Unique identifier for this recording |
| `from` | `string` | Recording source identifier |
| `assets` | `RecorderDataAsset[]` | Array of recording asset files produced on completion |
| `assetsAllVersions` | `RecorderDataAsset[]` | All versions of assets across editing history |
| `transcription` | `RecorderDataTranscription` | Top-level AI transcription for the recording |

**RecorderDataAsset fields:**

| Field | Type | Description |
|-------|------|-------------|
| `version` | `number` | Asset version number |
| `url` | `string` | URL of the recording file |
| `mimeType` | `string` | MIME type of the file |
| `fileName` | `string` | File name |
| `fileSizeInBytes` | `number` | File size |
| `fileFormat` | `'mp3' \| 'mp4' \| 'webm'` | Output format |
| `thumbnailUrl` | `string` | URL of the video thumbnail |
| `transcription` | `RecorderDataTranscription` | Per-asset transcription data |

**RecorderDataTranscription fields:**

| Field | Type | Description |
|-------|------|-------------|
| `transcriptSegments` | `RecorderDataTranscriptSegment[]` | Timed transcript segments |
| `vttFileUrl` | `string` | URL of the VTT subtitle file |
| `contentSummary` | `string` | AI-generated summary of the recording |

**RecorderDataTranscriptSegment fields:** `startTime`, `endTime`, `startTimeInSeconds`, `endTimeInSeconds`, `text`.

**Toggling the webhook via TriggersConfig:**

<!-- TODO (v5.0.2-beta.11): Verify whether triggers.recorder.done is set via the Velt console, SDK config, or both. Release note confirms the toggle path (triggers.recorder.done) and that RecorderTrigger = { done?: boolean } was added to TriggersConfig, but the exact configuration surface is not specified in the release note. -->

```typescript
// RecorderTrigger type (added in v5.0.2-beta.11)
type RecorderTrigger = {
  done?: boolean; // defaults to true
};

// Disable the recorder.done webhook
// triggers: { recorder: { done: false } }
```

**Verification:**
- [ ] Webhook handler checks `event === 'recorder.done'` before accessing payload fields
- [ ] `assets` and `transcription` accessed from the nested `payload` object, not `req.body` directly
- [ ] Handler returns a `200` response promptly (process data asynchronously if needed)
- [ ] `triggers.recorder.done` set to `false` in config if the webhook is not needed

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/webhooks - recorder.done webhook event
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior - Triggers configuration
