---
title: Handle the recorder.done Webhook Event for Completed Recordings
impact: MEDIUM-HIGH
impactDescription: Enables server-side processing of completed recordings including assets and AI transcription
tags: webhook, recorder.done, advanced-webhooks, WebhookV2Payload, RecorderPayload, RecorderTrigger, triggers, assets, transcription, server-side
---

## Handle the recorder.done Webhook Event for Completed Recordings

Velt fires `recorder.done` on advanced (V2) webhooks when a recording finishes processing, whether or not transcription was enabled. The body is a `WebhookV2Payload` (`event`, `actionType`, `source`, `webhookId`) whose `data` field is a `RecorderPayload` with the recording's assets and transcription. Basic (V1) webhooks do not carry recorder events. Toggle the event per workspace with `triggers.recorder.done`.

**Incorrect (reading assets from the top level or from a `payload` field):**

```typescript
app.post('/webhook', express.json(), (req, res) => {
  const { assets, transcription } = req.body;          // Wrong: undefined
  const { payload } = req.body;                         // Wrong: there is no payload field
  processRecording(assets ?? payload?.assets);
  res.sendStatus(200);
});
```

**Correct (verify, check `event`, read `data`):**

```typescript
import express from 'express';

// Keep the raw body for signature verification (webhook-id, webhook-timestamp, webhook-signature)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!verifyVeltSignature(req.headers, req.body)) return res.sendStatus(401);

  const { event, data } = JSON.parse(req.body.toString());

  if (event === 'recorder.done') {
    const { recorderId, assets, transcription, from, metadata } = data as RecorderPayload;

    for (const asset of assets ?? []) {
      console.log('Asset URL:', asset.url);
      console.log('Format:', asset.fileFormat); // e.g. 'mp3' | 'mp4' | 'webm'
      console.log('Segments:', asset.transcription?.transcriptSegments);
    }

    if (transcription) {
      console.log('VTT file:', transcription.vttFileUrl);
      console.log('Summary:', transcription.contentSummary);
    }

    enqueueRecordingJob({ recorderId, documentId: metadata?.documentId, createdBy: from?.userId });
  }

  res.sendStatus(200); // Respond 2xx within 15 seconds; process asynchronously
});
```

**RecorderPayload (`data`):**

| Field | Type | Description |
|-------|------|-------------|
| `actionUser` | `User` | User who triggered the recording action |
| `metadata` | `MetadataExternal` | Document and context metadata |
| `recorderId` | `string` | Recorder instance ID |
| `from` | `User \| null` | User who created the recording |
| `assets` | `RecorderDataAsset[]` | Latest processed assets |
| `assetsAllVersions` | `RecorderDataAsset[]` | All historical asset versions (edits create versions) |
| `transcription` | `RecorderDataTranscription` | Top-level transcription |

**RecorderDataAsset:** `version`, `url` (required), `mimeType`, `fileName`, `fileSizeInBytes`, `fileFormat`, `thumbnailUrl`, `transcription`.

**RecorderDataTranscription:** `transcriptSegments` (`RecorderDataTranscriptSegment[]`: `startTime`, `endTime`, `startTimeInSeconds`, `endTimeInSeconds`, `text`), `vttFileUrl`, `contentSummary`.

**Toggling the event:**

```typescript
// RecorderTrigger, set under triggers.recorder in the workspace webhook configuration
type RecorderTrigger = {
  done?: boolean; // default true
};
// Disable: triggers: { recorder: { done: false } }
```

The data model documents `done` as defaulting to `true`. When you first enable the webhook service through the Update Webhook Config workspace REST API, the seeded defaults turn the `recorder` triggers off, so confirm the stored value with Get Webhook Config if events do not arrive.

**Verification:**
- [ ] Endpoint is an advanced (V2) webhook endpoint subscribed to `recorder.done`
- [ ] Signature verified on the raw body before parsing
- [ ] Handler checks `event === 'recorder.done'` and reads fields from `data`
- [ ] Handler returns 2xx promptly and processes assets asynchronously
- [ ] `triggers.recorder.done` enabled for the workspace (check after enabling via REST)

**Source Pointers:**
- https://docs.velt.dev/webhooks/advanced#recorder - "Recorder" (`recorder.done`)
- https://docs.velt.dev/webhooks/advanced#verifying-webhook-signatures - "Verifying webhook signatures"
- https://docs.velt.dev/api-reference/sdk/models/data-models#recorderpayload - "RecorderPayload"
- https://docs.velt.dev/api-reference/sdk/models/data-models#recordertrigger - "RecorderTrigger"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/webhookconfig-update - "Update Webhook Config" (seeded trigger defaults)
