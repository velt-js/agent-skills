# Velt Recorder Best Practices

**Version 1.0.0**  
Velt  
March 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive Velt Recorder implementation guide covering audio, video, and screen recording components, recording configuration, device permissions, data management, event handling, video editor integration, and UI/UX customization. This skill provides evidence-backed patterns for integrating Velt's Recorder system into React, Next.js, and other web applications. Covers VeltRecorderTool, VeltRecorderControlPanel, VeltRecorderPlayer, VeltRecorderNotes, and VeltVideoEditor setup, recording quality and encoding configuration, reactive data hooks, lifecycle event subscriptions, and post-recording editing workflows.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Add VeltRecorderTool, ControlPanel, and Player Components](#11-add-veltrecordertool-controlpanel-and-player-components)
   - 1.2 [Request Device Permissions Before Recording](#12-request-device-permissions-before-recording)

2. [Recording Configuration](#2-recording-configuration) — **HIGH**
   - 2.1 [Configure Recording Quality Constraints and Encoding Options](#21-configure-recording-quality-constraints-and-encoding-options)
   - 2.2 [Enable Picture-in-Picture for Screen Recordings](#22-enable-picture-in-picture-for-screen-recordings)
   - 2.3 [Select Recording Type and Customize Tool Button](#23-select-recording-type-and-customize-tool-button)
   - 2.4 [Set Maximum Recording Duration](#24-set-maximum-recording-duration)

3. [Data Management](#3-data-management) — **HIGH**
   - 3.1 [Use React Hooks for Reactive Recording Data](#31-use-react-hooks-for-reactive-recording-data)
   - 3.2 [Delete Recordings and Download Latest Video](#32-delete-recordings-and-download-latest-video)
   - 3.3 [Fetch or Subscribe to Recording Data via API](#33-fetch-or-subscribe-to-recording-data-via-api)

4. [Event Handling](#4-event-handling) — **MEDIUM-HIGH**
   - 4.1 [Use useRecorderEventCallback for React Event Handling](#41-use-userecordereventcallback-for-react-event-handling)
   - 4.2 [Subscribe to Recorder Lifecycle Events via API](#42-subscribe-to-recorder-lifecycle-events-via-api)

5. [Video Editor](#5-video-editor) — **MEDIUM**
   - 5.1 [Embed the Standalone VeltVideoEditor Component](#51-embed-the-standalone-veltvideoeditor-component)
   - 5.2 [Enable and Configure the Video Editor](#52-enable-and-configure-the-video-editor)

6. [UI/UX Configuration](#6-uiux-configuration) — **MEDIUM**
   - 6.1 [Choose Floating vs Thread Mode for Control Panel](#61-choose-floating-vs-thread-mode-for-control-panel)
   - 6.2 [Configure AI Transcription and Summary Display](#62-configure-ai-transcription-and-summary-display)
   - 6.3 [Configure Fullscreen Playback and Click Behavior](#63-configure-fullscreen-playback-and-click-behavior)
   - 6.4 [Control Countdown Timer and Embedded Settings](#64-control-countdown-timer-and-embedded-settings)

7. [Debugging & Testing](#7-debugging-testing) — **LOW-MEDIUM**
   - 7.1 [Debug Common Recorder Issues](#71-debug-common-recorder-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns for any Velt Recorder implementation. Includes adding VeltRecorderTool, VeltRecorderControlPanel, and VeltRecorderPlayer in the correct combination, connecting recorded data via event callbacks, and requesting device permissions.

### 1.1 Add VeltRecorderTool, ControlPanel, and Player Components

**Impact: CRITICAL (Required for recorder to function)**

The Velt Recorder requires three components working together: VeltRecorderTool to initiate recordings, VeltRecorderControlPanel to manage active recordings, and VeltRecorderPlayer to play back completed recordings. The player requires a `recorderId` obtained from the recording completion event.

**Incorrect (missing control panel or player not connected):**

```jsx
import { VeltProvider, VeltRecorderTool } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      {/* Missing VeltRecorderControlPanel - no way to manage active recording */}
      {/* Missing VeltRecorderPlayer - no way to play back recordings */}
      <VeltRecorderTool type="all" />
      <YourApp />
    </VeltProvider>
  );
}
```

**Correct (all three components with event wiring):**

```jsx
import { useState } from 'react';
import {
  VeltProvider,
  VeltRecorderTool,
  VeltRecorderControlPanel,
  VeltRecorderPlayer,
  useRecorderAddHandler
} from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      {/* Step 1: Tool to initiate recordings */}
      <VeltRecorderTool type="all" />

      {/* Step 2: Control panel to manage active recording */}
      <VeltRecorderControlPanel mode="thread" />

      {/* Step 3: Player renders in child component with recorderId */}
      <RecordingPlayback />
    </VeltProvider>
  );
}

function RecordingPlayback() {
  const [recorderId, setRecorderId] = useState(null);

  // Capture recorderId when recording completes
  const recorderAddEvent = useRecorderAddHandler();
  useEffect(() => {
    if (recorderAddEvent) {
      setRecorderId(recorderAddEvent.id);
    }
  }, [recorderAddEvent]);

  if (!recorderId) return null;
  return <VeltRecorderPlayer recorderId={recorderId} />;
}
```

**For HTML:**

```jsx
<!-- Step 1: Tool to initiate recordings -->
<velt-recorder-tool type="all"></velt-recorder-tool>

<!-- Step 2: Control panel to manage active recording -->
<velt-recorder-control-panel mode="thread"></velt-recorder-control-panel>

<!-- Step 3: Player for playback (set recorderId dynamically) -->
<velt-recorder-player recorderId="RECORDER_ID"></velt-recorder-player>
import { VeltRecorderNotes } from '@veltdev/react';

// Add alongside other recorder components for location-pinned recordings
<VeltRecorderNotes />
```

**Optional: VeltRecorderNotes** pins recordings to specific screen locations:

Reference: https://docs.velt.dev/async-collaboration/recorder/setup - Add Velt Recorder Tool, Add Velt Recorder Control Panel, Render Velt Recorder Player

---

### 1.2 Request Device Permissions Before Recording

**Impact: HIGH (Prevents permission-denied errors during recording)**

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

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - askDevicePermission, requestScreenPermission

---

## 2. Recording Configuration

**Impact: HIGH**

Configuration options for recording sessions. Includes recording type selection (all, audio, video, screen), max duration limits, Picture-in-Picture mode for screen recordings, microphone control, and quality/encoding settings per browser.

### 2.1 Configure Recording Quality Constraints and Encoding Options

**Impact: MEDIUM-HIGH (Controls recording fidelity, file size, and browser compatibility)**

Recording quality has two layers: input constraints (what the camera/microphone captures) and encoding options (how the output file is compressed). Both are browser-specific and affect file size, upload time, and processing duration.

**Incorrect (using very high quality without considering tradeoffs):**

```jsx
const recorderUtils = useRecorderUtils();

// Extremely high resolution and bitrate — leads to huge files
recorderUtils.setRecordingQualityConstraints({
  'other': {
    'video': {
      width: { exact: 3840 },
      height: { exact: 2160 },
      frameRate: { exact: 60 }
    }
  }
});
recorderUtils.setRecordingEncodingOptions({
  'other': {
    videoBitsPerSecond: 10000000 // 10 Mbps — very large files
  }
});
```

**Correct (balanced quality settings per browser):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function RecorderConfig() {
  const recorderUtils = useRecorderUtils();

  useEffect(() => {
    // Input quality constraints — affects raw capture
    recorderUtils.setRecordingQualityConstraints({
      'safari': {
        'video': {
          width: { min: 640, ideal: 1280, max: 1280 },
          height: { min: 360, ideal: 720, max: 720 },
          frameRate: { min: 15, ideal: 20, max: 30 },
          aspectRatio: { ideal: 1.777777778 }
        },
        'audio': {
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      },
      'other': {
        'video': {
          width: { min: 640, ideal: 1280, max: 1280 },
          height: { min: 360, ideal: 720, max: 720 },
          frameRate: { min: 15, ideal: 20, max: 30 },
          aspectRatio: { ideal: 1.777777778 }
        }
      }
    });

    // Output encoding options — affects saved file
    recorderUtils.setRecordingEncodingOptions({
      'safari': {
        videoBitsPerSecond: 2500000,  // 2.5 Mbps
        audioBitsPerSecond: 128000     // 128 Kbps
      },
      'other': {
        videoBitsPerSecond: 1000000,  // 1 Mbps
        audioBitsPerSecond: 128000     // 128 Kbps
      }
    });
  }, [recorderUtils]);

  return <VeltRecorderTool type="all" />;
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();
recorderElement.setRecordingQualityConstraints({ /* same config */ });
recorderElement.setRecordingEncodingOptions({ /* same config */ });
```

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - setRecordingQualityConstraints, setRecordingEncodingOptions

---

### 2.2 Enable Picture-in-Picture for Screen Recordings

**Impact: MEDIUM (Allows multitasking during screen recording with camera overlay)**

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

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - enablePictureInPicture, openPictureInPicture, exitPictureInPicture

---

### 2.3 Select Recording Type and Customize Tool Button

**Impact: HIGH (Controls what users can record (audio, video, screen, or all))**

The `type` prop on VeltRecorderTool determines which recording mode is available. The default is `audio`, which may not match your use case. Set it explicitly to avoid confusion.

**Incorrect (relying on default type):**

```jsx
// Default type is 'audio' — users may expect video or screen recording
<VeltRecorderTool />
```

**Correct (explicit type selection):**

```jsx
{/* All modes — shows a mode picker dialog */}
<VeltRecorderTool type="all" />

{/* Audio only — starts audio recording directly */}
<VeltRecorderTool type="audio" />

{/* Video only — starts webcam recording directly */}
<VeltRecorderTool type="video" />

{/* Screen only — starts screen capture directly */}
<VeltRecorderTool type="screen" />
```

**Custom button label:**

```jsx
{/* Add descriptive text to the recorder button */}
<VeltRecorderTool type="all" buttonLabel="Record Feedback" />
```

**For HTML:**

```html
<velt-recorder-tool type="all"></velt-recorder-tool>
<velt-recorder-tool type="audio"></velt-recorder-tool>
<velt-recorder-tool type="video"></velt-recorder-tool>
<velt-recorder-tool type="screen"></velt-recorder-tool>

<!-- With custom label -->
<velt-recorder-tool type="all" button-label="Record Feedback"></velt-recorder-tool>
```

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - type, buttonLabel

---

### 2.4 Set Maximum Recording Duration

**Impact: HIGH (Prevents runaway recordings and controls upload sizes)**

Without a max duration limit, recordings can grow indefinitely, leading to oversized files, slow uploads, and excessive storage costs. Set `maxLength` in seconds to enforce a cap.

**Incorrect (no duration limit):**

```jsx
// No maxLength — recordings can run indefinitely
<VeltRecorderTool type="all" />
<VeltRecorderControlPanel mode="thread" />
```

**Correct (duration limit via props):**

```jsx
{/* Set max recording length to 120 seconds (2 minutes) */}
<VeltRecorderTool type="all" maxLength={120} />
<VeltRecorderControlPanel mode="thread" maxLength={120} />
```

**Correct (duration limit via API):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function RecorderConfig() {
  const recorderUtils = useRecorderUtils();

  useEffect(() => {
    // Set max recording length to 120 seconds
    recorderUtils.setMaxLength(120);
  }, [recorderUtils]);

  return <VeltRecorderTool type="all" />;
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();
recorderElement.setMaxLength(120); // 120 seconds
```

**For HTML:**

```html
<velt-recorder-tool type="all" max-length="120"></velt-recorder-tool>
<velt-recorder-control-panel mode="thread" max-length="120"></velt-recorder-control-panel>
```

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - setMaxLength

---

## 3. Data Management

**Impact: HIGH**

Patterns for accessing, subscribing to, and managing recording data. Includes reactive subscriptions via React hooks, one-time fetches, Observable subscriptions, deletion by recorder ID, and video downloads.

### 3.1 Use React Hooks for Reactive Recording Data

**Impact: HIGH (Real-time access to recording data and completion events in React components)**

Velt provides dedicated React hooks for recording data that handle subscriptions and cleanup automatically. Use these instead of manual polling or imperative API calls within React components.

**Incorrect (polling for recording data):**

```jsx
function RecordingList() {
  const [recordings, setRecordings] = useState([]);

  // Polling with setInterval — wasteful and introduces lag
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchRecordingsManually();
      setRecordings(data);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return recordings.map(r => <div key={r.id}>{r.id}</div>);
}
```

**Correct (reactive hooks):**

```jsx
import {
  useRecordings,
  useRecorderAddHandler,
  useRecorderUtils
} from '@veltdev/react';

function RecordingList() {
  // Subscribe to all recordings in the current document (reactive)
  const recordings = useRecordings();

  useEffect(() => {
    if (recordings) {
      console.log('Recordings updated:', recordings);
    }
  }, [recordings]);

  return recordings?.map(r => <div key={r.id}>{r.id}</div>);
}

function RecordingCapture() {
  const [latestId, setLatestId] = useState(null);

  // Capture recorderId when a new recording completes
  const recorderAddEvent = useRecorderAddHandler();

  useEffect(() => {
    if (recorderAddEvent) {
      setLatestId(recorderAddEvent.id);
    }
  }, [recorderAddEvent]);

  return latestId ? <VeltRecorderPlayer recorderId={latestId} /> : null;
}

function RecorderConfig() {
  // Access imperative API methods
  const recorderUtils = useRecorderUtils();

  const setLimit = () => {
    recorderUtils.setMaxLength(120);
  };

  return <button onClick={setLimit}>Set 2min limit</button>;
}
```

Reference: https://docs.velt.dev/async-collaboration/recorder/setup - useRecorderAddHandler; https://docs.velt.dev/async-collaboration/recorder/customize-behavior - useRecordings, useRecorderUtils

---

### 3.2 Delete Recordings and Download Latest Video

**Impact: MEDIUM (Manage recording lifecycle and enable user-facing download)**

Use `deleteRecordings()` to remove recordings by ID and `downloadLatestVideo()` to download the most recent version of a recording. Both return Promises for async handling.

**Incorrect (not providing deletion or download capabilities):**

```jsx
// No way for users to manage recordings after creation
<VeltRecorderPlayer recorderId={recorderId} />
```

**Correct (delete and download via API):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function RecordingActions({ recorderId }) {
  const recorderUtils = useRecorderUtils();

  const handleDelete = async () => {
    const results = await recorderUtils.deleteRecordings({
      recorderIds: [recorderId]
    });
    console.log('Deleted:', results);
  };

  const handleDownload = async () => {
    const success = await recorderUtils.downloadLatestVideo(recorderId);
    if (!success) {
      console.error('Download failed');
    }
  };

  return (
    <div>
      <VeltRecorderPlayer recorderId={recorderId} />
      <button onClick={handleDownload}>Download</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();

// Delete recordings by IDs
const results = await recorderElement.deleteRecordings({
  recorderIds: ['RECORDER_ID_1', 'RECORDER_ID_2']
});

// Download latest version of a recording
const success = await recorderElement.downloadLatestVideo('RECORDER_ID');
```

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - deleteRecordings, downloadLatestVideo

---

### 3.3 Fetch or Subscribe to Recording Data via API

**Impact: HIGH (Access recording data from non-React contexts or with granular control)**

Use `fetchRecordings()` for one-time data retrieval (returns a Promise) and `getRecordings()` for reactive subscriptions (returns an Observable). Both support optional filtering by recorder IDs.

**Incorrect (confusing Promise and Observable patterns):**

```jsx
const recorderElement = useRecorderUtils();

// getRecordings returns an Observable, not a Promise — this won't work
const data = await recorderElement.getRecordings();
```

**Correct (one-time fetch via Promise):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function FetchExample() {
  const recorderUtils = useRecorderUtils();

  const loadRecordings = async () => {
    // Fetch all recordings in the current document
    const allRecordings = await recorderUtils.fetchRecordings();
    console.log('All recordings:', allRecordings);

    // Fetch specific recordings by ID
    const specific = await recorderUtils.fetchRecordings({
      recorderIds: ['RECORDER_ID_1', 'RECORDER_ID_2']
    });
    console.log('Specific recordings:', specific);
  };

  return <button onClick={loadRecordings}>Load Recordings</button>;
}
```

**Correct (reactive subscription via Observable):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function SubscribeExample() {
  const recorderUtils = useRecorderUtils();

  useEffect(() => {
    // Subscribe to all recordings (reactive updates)
    const subscription = recorderUtils.getRecordings().subscribe((data) => {
      console.log('Recordings updated:', data);
    });

    return () => subscription.unsubscribe();
  }, [recorderUtils]);

  // Subscribe to specific recorder IDs
  useEffect(() => {
    const subscription = recorderUtils.getRecordings({
      recorderIds: ['RECORDER_ID']
    }).subscribe((data) => {
      console.log('Specific recording:', data);
    });

    return () => subscription.unsubscribe();
  }, [recorderUtils]);
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();

// One-time fetch
const recordings = await recorderElement.fetchRecordings();

// Reactive subscription
recorderElement.getRecordings().subscribe((data) => {
  console.log('Recordings updated:', data);
});

// With specific IDs
recorderElement.getRecordings({
  recorderIds: ['RECORDER_ID']
}).subscribe((data) => {
  console.log('Specific recording:', data);
});
```

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - fetchRecordings, getRecordings

---

## 4. Event Handling

**Impact: MEDIUM-HIGH**

Subscription patterns for recorder lifecycle events. Covers all 11 event types including recording state changes, completion events, transcription completion, and error handling via both API subscriptions and React hooks.

### 4.1 Use useRecorderEventCallback for React Event Handling

**Impact: MEDIUM-HIGH (Declarative event handling with automatic cleanup in React components)**

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

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - Event Subscription (React hook)

---

### 4.2 Subscribe to Recorder Lifecycle Events via API

**Impact: MEDIUM-HIGH (React to recording state changes and handle errors)**

The Velt Recorder emits 11 lifecycle events covering recording state changes, completion, transcription, and errors. Use `recorderElement.on('eventType').subscribe()` to listen for these events in any framework.

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

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - Event Subscription, on

---

## 5. Video Editor

**Impact: MEDIUM**

Configuration and integration of the video editor for post-recording editing. Includes enabling the editor on components, auto-open behavior, retake button, onboarding tooltip, timeline preview with frame snapshots, and the standalone VeltVideoEditor component.

### 5.1 Embed the Standalone VeltVideoEditor Component

**Impact: MEDIUM (Adds video viewing and editing outside the standard recorder flow)**

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
  darkMode={true}
/>

// Load from a URL
<VeltVideoEditor
  url="https://example.com/video.mp4"
  darkMode={true}
  variant="compact"
/>

// Load from a Blob object
<VeltVideoEditor
  blob={videoBlob}
  darkMode={true}
/>
```

**For HTML:**

```html
<velt-video-editor
  recorder-id="zK3iEAfvs1Htu3QYPy5S"
  dark-mode="true"
></velt-video-editor>

<velt-video-editor
  url="https://example.com/video.mp4"
  dark-mode="true"
  variant="compact"
></velt-video-editor>
```

Reference: https://docs.velt.dev/async-collaboration/recorder/setup - Embed Velt Video Editor

---

### 5.2 Enable and Configure the Video Editor

**Impact: MEDIUM (Adds post-recording editing capabilities for video and screen recordings)**

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

Reference: https://docs.velt.dev/async-collaboration/recorder/setup - Enable Recording Editor; https://docs.velt.dev/async-collaboration/recorder/customize-behavior - videoEditor, autoOpenVideoEditor, retakeOnVideoEditor, videoEditorTimelinePreview

---

## 6. UI/UX Configuration

**Impact: MEDIUM**

Visual and behavioral customization of recorder components. Includes control panel display modes (floating vs thread), fullscreen playback, click-to-play behavior, countdown timer, embedded settings, and AI transcription/summary display.

### 6.1 Choose Floating vs Thread Mode for Control Panel

**Impact: MEDIUM (Controls where the recording preview appears during active recording)**

VeltRecorderControlPanel has two display modes that determine where the recording preview and controls appear. Choose the right mode for your layout.

**Incorrect (using default floating mode in a thread/chat context):**

```jsx
// Default 'floating' mode renders at bottom-left corner,
// ignoring DOM position — wrong for inline chat or form layouts
<div className="chat-message">
  <VeltRecorderControlPanel />
</div>
```

**Correct (explicit mode selection):**

```jsx
{/* Floating mode — renders at bottom-left corner of the viewport
    regardless of where the component is placed in the DOM */}
<VeltRecorderControlPanel mode="floating" />

{/* Thread mode — renders exactly where placed in the DOM,
    useful for inline/chat layouts */}
<div className="message-composer">
  <VeltRecorderControlPanel mode="thread" />
</div>
```

**For HTML:**

```html
<!-- Floating: viewport overlay -->
<velt-recorder-control-panel mode="floating"></velt-recorder-control-panel>

<!-- Thread: inline at DOM position -->
<velt-recorder-control-panel mode="thread"></velt-recorder-control-panel>
```

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - mode

---

### 6.2 Configure AI Transcription and Summary Display

**Impact: MEDIUM (Controls LLM-powered transcription and summary visibility)**

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

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - recordingTranscription, summary

---

### 6.3 Configure Fullscreen Playback and Click Behavior

**Impact: MEDIUM (Controls recording playback UX)**

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

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - playVideoInFullScreen, playbackOnPreviewClick

---

### 6.4 Control Countdown Timer and Embedded Settings

**Impact: LOW-MEDIUM (Customize recording start experience and settings panel placement)**

The recording countdown timer (enabled by default) gives users a visual cue before recording starts. The settings panel can be embedded inline within the control panel for custom layouts.

**Incorrect (disabling countdown without considering impact):**

```jsx
{/* Without countdown, recording starts immediately —
    users may miss the beginning of their content */}
<VeltRecorderControlPanel recordingCountdown={false} />
```

**Correct (intentional countdown configuration):**

```jsx
{/* Keep countdown enabled (default) for standard recording flows */}
<VeltRecorderControlPanel mode="thread" />

{/* Disable countdown for quick-capture scenarios */}
<VeltRecorderControlPanel
  mode="thread"
  recordingCountdown={false}
/>

{/* Disable countdown on recorder notes */}
<VeltRecorderNotes recordingCountdown={false} />
```

**Embedded settings:**

```jsx
{/* Embed settings panel inline within the control panel */}
<VeltRecorderControlPanel
  mode="thread"
  settingsEmbedded={true}
/>
```

**Countdown via API:**

```jsx
import { useVeltClient } from '@veltdev/react';

const client = useVeltClient();

// Enable/disable countdown programmatically
client.getRecorderElement().enableRecordingCountdown();
client.getRecorderElement().disableRecordingCountdown();
```

**For HTML:**

```html
<velt-recorder-control-panel
  mode="thread"
  recording-countdown="false"
  settings-embedded="true"
></velt-recorder-control-panel>

<velt-recorder-notes recording-countdown="false"></velt-recorder-notes>
```

Reference: https://docs.velt.dev/async-collaboration/recorder/customize-behavior - recordingCountdown, settingsEmbedded

---

## 7. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns and verification checklists for Velt recorder integrations.

### 7.1 Debug Common Recorder Issues

**Impact: LOW-MEDIUM (Quick troubleshooting for frequent recorder integration problems)**

Common issues when integrating the Velt Recorder and how to resolve them.

**Issue 1: Recording does not start**

Reference: https://docs.velt.dev/async-collaboration/recorder/setup; https://docs.velt.dev/async-collaboration/recorder/customize-behavior

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/recorder/overview
- https://docs.velt.dev/async-collaboration/recorder/setup
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior
- https://console.velt.dev
