---
title: Use useRecorderEventCallback for React Event Handling
impact: MEDIUM-HIGH
impactDescription: Declarative event handling with automatic cleanup in React components
tags: useRecorderEventCallback, hooks, react, events, lifecycle
---

## Use useRecorderEventCallback for React Event Handling

In React, use the `useRecorderEventCallback` hook for declarative event subscriptions instead of manually calling `recorderElement.on().subscribe()` inside useEffect. The hook handles subscription lifecycle automatically.

**Incorrect (manual subscription in React):**

```jsx
function RecorderEvents() {
  const client = useVeltClient();

  // Manual subscription requires cleanup and is error-prone
  useEffect(() => {
    const recorderElement = client.getRecorderElement();
    const sub = recorderElement.on('transcriptionDone').subscribe((event) => {
      handleTranscription(event);
    });
    return () => sub.unsubscribe();
  }, [client]);

  return <VeltRecorderTool type="all" />;
}
```

**Correct (useRecorderEventCallback hook):**

```jsx
import { useRecorderEventCallback } from '@veltdev/react';

function RecorderEvents() {
  // Declarative subscription — cleanup is automatic
  const transcriptionData = useRecorderEventCallback('transcriptionDone');
  const recordingDoneData = useRecorderEventCallback('recordingDone');
  const errorData = useRecorderEventCallback('error');

  useEffect(() => {
    if (transcriptionData) {
      console.log('Transcription ready:', transcriptionData);
    }
  }, [transcriptionData]);

  useEffect(() => {
    if (recordingDoneData) {
      console.log('Recording completed:', recordingDoneData);
    }
  }, [recordingDoneData]);

  useEffect(() => {
    if (errorData) {
      console.error('Recorder error:', errorData);
    }
  }, [errorData]);

  return <VeltRecorderTool type="all" />;
}
```

**Supported event types:**
All 11 events from the lifecycle API are supported: `recordingStarted`, `recordingPaused`, `recordingResumed`, `recordingStopped`, `recordingCancelled`, `recordingDone`, `recordingSaveInitiated`, `recordingEditDone`, `transcriptionDone`, `deleteRecording`, `error`.

**Key details:**
- `useRecorderEventCallback('eventType')` returns the event data or null
- React to changes via `useEffect` with the return value as a dependency
- Different from `useRecorderAddHandler()` which is specifically for the recording completion flow (capturing recorderId for VeltRecorderPlayer)
- Each event type needs a separate hook call

**Verification:**
- [ ] Using `useRecorderEventCallback` instead of manual `.on().subscribe()` in React
- [ ] Each event type has its own hook call and useEffect handler
- [ ] Error events subscribed to for failure handling
- [ ] Hook used within a component inside VeltProvider

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - Event Subscription (React hook)
