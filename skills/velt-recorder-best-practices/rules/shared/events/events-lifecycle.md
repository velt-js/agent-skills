---
title: Subscribe to Recorder Lifecycle Events via API
impact: MEDIUM-HIGH
impactDescription: React to recording state changes and handle errors
tags: events, on, subscribe, recordingStarted, recordingDone, recordingDoneLocal, transcriptionDone, error, lifecycle
---

## Subscribe to Recorder Lifecycle Events via API

The Velt Recorder emits 12 lifecycle events covering recording state changes, completion, transcription, and errors. Use `recorderElement.on('eventType').subscribe()` to listen for these events in any framework.

**Incorrect (not subscribing to error events):**

```jsx
// Only listening for completion — errors silently ignored
const recorderElement = client.getRecorderElement();
recorderElement.on('recordingDone').subscribe((event) => {
  saveRecording(event);
});
// Missing: error events for recording, editing, and transcription failures
```

**Correct (comprehensive event handling):**

```jsx
const recorderElement = client.getRecorderElement();

// Recording state events
recorderElement.on('recordingStarted').subscribe((event) => {
  console.log('Recording started:', event);
});

recorderElement.on('recordingPaused').subscribe((event) => {
  console.log('Recording paused:', event);
});

recorderElement.on('recordingResumed').subscribe((event) => {
  console.log('Recording resumed:', event);
});

recorderElement.on('recordingStopped').subscribe((event) => {
  console.log('Recording stopped:', event);
});

recorderElement.on('recordingCancelled').subscribe((event) => {
  console.log('Recording cancelled:', event);
});

// Completion events
recorderElement.on('recordingDoneLocal').subscribe((event) => {
  // Fires immediately after local save, before cloud upload/transcription
  // event.attachmentUrl is a blob URL (not CDN) — only fires when event.sourceFeature === 'recording'
  console.log('Local save complete:', event);
});

recorderElement.on('recordingDone').subscribe((event) => {
  console.log('Recording completed:', event);
});

recorderElement.on('recordingSaveInitiated').subscribe((event) => {
  console.log('Recording save initiated:', event);
});

recorderElement.on('recordingEditDone').subscribe((event) => {
  console.log('Recording edit saved:', event);
});

// AI event
recorderElement.on('transcriptionDone').subscribe((event) => {
  console.log('Transcription ready:', event);
});

// Error handling — covers editFailed, recordingFailed, transcriptionFailed
recorderElement.on('error').subscribe((event) => {
  console.error('Recorder error:', event);
});
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();
recorderElement.on('recordingDone').subscribe((event) => {
  console.log('Recording completed:', event);
});
recorderElement.on('error').subscribe((event) => {
  console.error('Recorder error:', event);
});
```

**Complete event reference:**

| Event | Description | Event Type |
|-------|-------------|------------|
| `recordingStarted` | Recording begins | RecordingStartedEvent |
| `recordingPaused` | Recording paused | RecordingPausedEvent |
| `recordingResumed` | Recording resumed after pause | RecordingResumedEvent |
| `recordingStopped` | Recording stopped | RecordingStoppedEvent |
| `recordingCancelled` | Recording cancelled | RecordingCancelledEvent |
| `recordingDoneLocal` | Fires immediately after recording annotation saved locally, before cloud processing. Attachment URL is a blob URL. Only fires when sourceFeature === 'recording'. | RecordingDoneLocalEvent |
| `recordingDone` | Recording completed (permanent CDN URL available) | RecordingDoneEvent |
| `recordingSaveInitiated` | Recording save started | RecordingSaveInitiatedEvent |
| `recordingEditDone` | Video editor "Done" clicked | RecordingEditDoneEvent |
| `transcriptionDone` | AI transcription ready | TranscriptionDoneEvent |
| `deleteRecording` | Recording deleted | RecordingDeleteEvent |
| `error` | Error occurred | RecordingErrorEvent |

**Error subtypes:** `editFailed`, `recordingFailed`, `transcriptionFailed`

**Verification:**
- [ ] Subscribed to `error` event for failure handling
- [ ] Subscribed to `recordingDone` for recording completion flow
- [ ] Subscriptions cleaned up on component unmount (`.unsubscribe()`)

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - Event Subscription, on
