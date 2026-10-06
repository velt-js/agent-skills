# Velt Recorder Best Practices

**Version 1.2.1**  
Velt  
October 2026

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
   - 1.1 [Add VeltRecorderTool, ControlPanel, Player, and Notes Components](#11-add-veltrecordertool-controlpanel-player-and-notes-components)
   - 1.2 [Handle the recorder.done Webhook Event for Completed Recordings](#12-handle-the-recorderdone-webhook-event-for-completed-recordings)
   - 1.3 [Request Device Permissions Before Recording](#13-request-device-permissions-before-recording)
   - 1.4 [Use authProvider on VeltProvider — Never Use identify() or useIdentify()](#14-use-authprovider-on-veltprovider-never-use-identify-or-useidentify)

2. [Recording Configuration](#2-recording-configuration) — **HIGH**
   - 2.1 [Configure Recording Quality Constraints and Encoding Options](#21-configure-recording-quality-constraints-and-encoding-options)
   - 2.2 [Enable Picture-in-Picture for Screen Recordings](#22-enable-picture-in-picture-for-screen-recordings)
   - 2.3 [Select Recording Type and Customize Tool Button](#23-select-recording-type-and-customize-tool-button)
   - 2.4 [Set Maximum Recording Duration](#24-set-maximum-recording-duration)

3. [Data Management](#3-data-management) — **HIGH**
   - 3.1 [Use React Hooks for Reactive Recording Data](#31-use-react-hooks-for-reactive-recording-data)
   - 3.2 [Delete Recordings and Download Latest Video](#32-delete-recordings-and-download-latest-video)
   - 3.3 [Fetch or Subscribe to Recording Data via API](#33-fetch-or-subscribe-to-recording-data-via-api)
   - 3.4 [Recorder Data Type Reference — Core Models](#34-recorder-data-type-reference-core-models)
   - 3.5 [Retrieve Recordings via REST API Endpoint](#35-retrieve-recordings-via-rest-api-endpoint)

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
   - 6.5 [Customize Recorder UI with Wireframe Components](#65-customize-recorder-ui-with-wireframe-components)

7. [Debugging & Testing](#7-debugging-testing) — **LOW-MEDIUM**
   - 7.1 [Debug Common Recorder Issues](#71-debug-common-recorder-issues)

8. [Wireframe Variables](#8-wireframe-variables) — **MEDIUM**
   - 8.1 [Bind Recorder Wireframe Slots Using Template Variables](#81-bind-recorder-wireframe-slots-using-template-variables)
   - 8.2 [Bind Transcription / Subtitles Wireframe Slots Using Template Variables](#82-bind-transcription-subtitles-wireframe-slots-using-template-variables)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns for any Velt Recorder implementation. Includes adding VeltRecorderTool, VeltRecorderControlPanel, and VeltRecorderPlayer in the correct combination, connecting recorded data via event callbacks, requesting device permissions, and handling the recorder.done server-side webhook event.

### 1.1 Add VeltRecorderTool, ControlPanel, Player, and Notes Components

**Impact: CRITICAL (Required for recorder to function with full playback support)**

The Velt Recorder requires four components working together: VeltRecorderTool to initiate recordings, VeltRecorderControlPanel to manage active recordings, VeltRecorderNotes for pinned recordings on the page, and a RecordingPlayback component using VeltRecorderPlayer to play back completed recordings.

**Incorrect (missing control panel, notes, or player not connected):**

```jsx
import { VeltProvider, VeltRecorderTool } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      {/* Missing VeltRecorderControlPanel - no way to manage active recording */}
      {/* Missing VeltRecorderNotes - no pinned recordings on page */}
      {/* Missing RecordingPlayback - no way to play back recordings */}
      <VeltRecorderTool type="all" />
      <YourApp />
    </VeltProvider>
  );
}
```

**Correct (VeltProvider with authProvider + all recorder components):**

```tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  VeltProvider,
  VeltRecorderTool,
  VeltRecorderControlPanel,
  VeltRecorderPlayer,
  VeltRecorderNotes,
  useRecorderAddHandler,
  useSetDocuments,
  useCurrentUser,
} from "@veltdev/react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/AppUserContext";

// Build authProvider from your app's user context — never use useIdentify
function useVeltAuthProvider() {
  const { user } = useAppUser();
  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;
    return {
      user: { userId: user.userId, organizationId: user.organizationId, name: user.name, email: user.email },
      retryConfig: { retryCount: 3, retryDelay: 1000 },
    };
  }, [user]);
  return { authProvider };
}

// Page component wrapping with VeltProvider + authProvider
export default function DocumentPage({ docId }: { docId: string }) {
  const { authProvider } = useVeltAuthProvider();
  if (!authProvider) return <div>Loading...</div>;
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!} authProvider={authProvider}>
      <DocumentSetup docId={docId} />
      <RecorderSetup />
    </VeltProvider>
  );
}

// Document initialization in a child component (not alongside VeltProvider)
function DocumentSetup({ docId }: { docId: string }) {
  const { setDocuments } = useSetDocuments();
  const veltUser = useCurrentUser();
  useEffect(() => {
    if (veltUser && docId) setDocuments([{ id: docId }]);
  }, [veltUser, docId, setDocuments]);
  return null;
}

// Recorder components
function RecorderSetup() {
  return (
    <>
      {/* 1. Recorder tool button — place in your toolbar */}
      <VeltRecorderTool type="all" />

      {/* 2. Floating control panel — manages active recording state */}
      <VeltRecorderControlPanel mode="floating" />

      {/* 3. Pinned recordings — appear where they were created on the page (like comment pins) */}
      <VeltRecorderNotes />

      {/* 4. Floating playback — shows latest recording in bottom-left corner */}
      <RecordingPlayback />
    </>
  );
}
```

**RecordingPlayback component (include in your collaboration component):**

```tsx
function RecordingPlayback() {
  const [recorderId, setRecorderId] = useState<string | null>(null);
  const recorderAddEvent = useRecorderAddHandler();

  useEffect(() => {
    if (recorderAddEvent?.id) {
      setRecorderId(recorderAddEvent.id);
    }
  }, [recorderAddEvent]);

  if (!recorderId) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: 24,
      zIndex: 50,
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Latest Recording</span>
        <button
          onClick={() => setRecorderId(null)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}
        >
          &times;
        </button>
      </div>
      <VeltRecorderPlayer recorderId={recorderId} />
    </div>
  );
}
```

**For HTML:**

```html
<!-- Step 1: Tool to initiate recordings -->
<velt-recorder-tool type="all"></velt-recorder-tool>

<!-- Step 2: Floating control panel -->
<velt-recorder-control-panel mode="floating"></velt-recorder-control-panel>

<!-- Step 3: Pinned recordings on the page -->
<velt-recorder-notes></velt-recorder-notes>

<!-- Step 4: Player for playback (set recorderId dynamically) -->
<velt-recorder-player recorderId="RECORDER_ID"></velt-recorder-player>
```

**Key configuration:**
- `VeltRecorderTool type="all"` — enables audio, video, and screen recording modes
- `VeltRecorderControlPanel mode="floating"` — floating panel that follows the user during recording
- `VeltRecorderNotes` — no props needed, automatically pins recordings to the page
- `RecordingPlayback` — uses `useRecorderAddHandler()` to capture `recorderId` on completion, renders dismissible `VeltRecorderPlayer` in bottom-left corner

**VeltRecorderTool props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'all' \| 'audio' \| 'video' \| 'screen'` | See note | Recording mode. Docs disagree on the default (customize-behavior: `audio`; behaviors reference: `video`), so always set it |
| `panelId` | `string` | None | Bind this tool to a `VeltRecorderControlPanel` with the same `panelId` |
| `buttonLabel` | `string` | None | Custom label for the button |
| `maxLength` | `number` | No limit | Max duration in seconds |
| `pictureInPicture` | `boolean` | `false` | Enable PiP for screen recordings (Chrome, camera on) |
| `recordingCountdown` | `boolean` | `true` | Show countdown before recording |
| `retakeOnVideoEditor` | `boolean` | `false` | Show retake button in the video editor |
| `darkMode` | `boolean` | `false` | Dark mode styling |
| `shadowDom` | `boolean` | `true` | Render in shadow DOM (set `false` for custom CSS) |
| `variant` | `string` | None | Tool wireframe variant |

**VeltRecorderControlPanel props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'floating' \| 'thread'` | `'floating'` | Panel layout mode |
| `panelId` | `string` | None | Identifies this panel when several are mounted |
| `onRecordedData` | `(data) => void` | None | Legacy completion callback; prefer `useRecorderAddHandler()` or the `recordingDone` event |
| `recordingCountdown` | `boolean` | `true` | Countdown before capture |
| `recordingTranscription` | `boolean` | `true` | AI transcription |
| `settingsEmbedded` | `boolean` | `false` | Embed device settings in the panel instead of a modal |
| `videoEditor` | `boolean` | `false` | Enable the post-recording editor (gates the next three props) |
| `autoOpenVideoEditor` | `boolean` | `false` | Auto-open editor after recording |
| `retakeOnVideoEditor` | `boolean` | `false` | Retake button in the editor |
| `videoEditorTimelinePreview` | `boolean` | `false` | Frame previews on the editor timeline |
| `playVideoInFullScreen` | `boolean` | unset | Fullscreen playback |
| `pictureInPicture` | `boolean` | `false` | PiP window during screen recording |
| `maxLength` | `number` | No limit | Max duration in seconds |

`VeltRecorderNotes` accepts `shadowDom`, `videoEditor`, `recordingCountdown`, `recordingTranscription`, `playVideoInFullScreen`, and `videoEditorTimelinePreview`. `VeltRecorderPlayer` takes `recorderId` (effectively required), `summary`, `videoEditor`, `retakeOnVideoEditor`, `playVideoInFullScreen`, `playbackOnPreviewClick`, `shadowDom`, and `onDelete`.

**Shared flags:** recorder boolean props (countdown, transcription, editor, retake, PiP, fullscreen, max length) set process-wide recorder-service flags. If two components set the same flag to different values, the last one to set it wins. Omitting a boolean prop keeps the service default rather than forcing `false`.

**Verification:**
- [ ] VeltRecorderTool renders in toolbar and is clickable
- [ ] VeltRecorderControlPanel appears as floating panel when recording starts
- [ ] VeltRecorderNotes pins recordings to page locations
- [ ] Recording completion triggers RecordingPlayback in bottom-left
- [ ] VeltRecorderPlayer plays back the recording using recorderId
- [ ] Close button dismisses the playback widget
- [ ] All components are within VeltProvider

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/setup - "Add the Velt Recorder Tool component", "Add the Velt Recorder Control Panel component", "Render recorded data in Velt Recorder Player"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - per-prop defaults and shared recorder-service flags
- https://docs.velt.dev/ui-customization/reference/props - recorder component props

---

### 1.2 Handle the recorder.done Webhook Event for Completed Recordings

**Impact: MEDIUM-HIGH (Enables server-side processing of completed recordings including assets and AI transcription)**

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

---

### 1.3 Request Device Permissions Before Recording

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

**Key details:**
- `askDevicePermission()` accepts `{ audio: boolean, video: boolean }` — request only what you need
- `requestScreenPermission()` returns `Promise<MediaStream | null>` — null means denied or cancelled
- Screen permission also enables the screen preview in the Recording Preview Dialog

**Verification:**
- [ ] Device permissions requested before first recording attempt
- [ ] Null/denied case handled gracefully for screen permission
- [ ] Only required permissions requested (audio-only recordings don't need video)

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - askDevicePermission, requestScreenPermission

---

### 1.4 Use authProvider on VeltProvider — Never Use identify() or useIdentify()

**Impact: CRITICAL (Using deprecated auth methods causes silent failures and breaks token refresh)**

VeltProvider requires the `authProvider` prop for user authentication. The `useIdentify()` hook and `client.identify()` method are deprecated — they lack automatic token refresh, retry logic, and proper error handling. Code using these deprecated methods will silently fail in production when tokens expire.

`client.identify()` and `useIdentify()` still exist as exports from `@veltdev/react` but should never be used. Always use `authProvider` on VeltProvider instead.

**Correct (authProvider on VeltProvider):**

```tsx
"use client";

import { useMemo } from "react";
import { VeltProvider } from "@veltdev/react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/AppUserContext";

function useVeltAuthProvider() {
  const { user } = useAppUser();
  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;
    return {
      user: {
        userId: user.userId,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
      },
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            organizationId: user.organizationId,
          }),
        });
        const { token } = await resp.json();
        return token;
      },
    };
  }, [user]);
  return { authProvider };
}

export default function DocumentPage() {
  const { authProvider } = useVeltAuthProvider();
  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider
      apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}
      authProvider={authProvider}
    >
      {/* Recorder and other Velt components go here */}
    </VeltProvider>
  );
}
```

**Why authProvider matters for recordings:** Recordings are tied to authenticated users. Without proper auth via `authProvider`, recording data may not persist correctly, webhook payloads may lack user context, and token expiration will silently break recording uploads in long sessions.

**Verification:**
- [ ] VeltProvider uses `authProvider` prop (not `useIdentify` hook or `client.identify()` method)
- [ ] `authProvider` includes `user` object with `userId`, `organizationId`, `name`, `email`
- [ ] No imports of `useIdentify` from `@veltdev/react`
- [ ] No calls to `client.identify()` anywhere in the codebase

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - Step 5: Authenticate Users

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

**Key concepts:**

- **Quality constraints** (`setRecordingQualityConstraints`) — applied **before** recording, controls raw media input (resolution, frame rate, audio)
- **Encoding options** (`setRecordingEncodingOptions`) — applied **after** capture, controls output file quality and size (bitrate)
- Both use browser-specific keys: `'safari'` and `'other'`
- Higher values in either setting = larger files and longer upload/processing times

**MIME type selection order** (automatic):
1. `video/mp4;codecs=h264,aac` (preferred)
2. `video/mp4`
3. `audio/mp4`
4. `video/webm;codecs=vp9,opus`
5. `video/webm;codecs=vp8,opus`
6. `video/webm;codecs=h264,opus`
7. `video/webm`

**Verification:**
- [ ] Quality constraints set per browser (`safari` and `other` keys)
- [ ] Encoding options set per browser
- [ ] File sizes are acceptable for your upload/storage requirements
- [ ] Audio constraints include noise suppression for better quality

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - setRecordingQualityConstraints, setRecordingEncodingOptions

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

---

### 2.3 Select Recording Type and Customize Tool Button

**Impact: HIGH (Controls what users can record (audio, video, screen, or all))**

The `type` prop on VeltRecorderTool determines which recording mode is available. The docs disagree on the default (the customize-behavior page says `audio`; the behaviors reference says `video`), so always set it explicitly.

**Incorrect (relying on default type):**

```jsx
// Default type is ambiguous across docs; users may get a mode they did not expect
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

**Limit the picker to a subset (comma-separated):**

```jsx
{/* Renders a dropdown limited to audio and video */}
<VeltRecorderTool type="audio, video" />
```

**Bind a tool to a specific control panel:**

```jsx
<VeltRecorderTool type="all" panelId="composer-panel" />
<VeltRecorderControlPanel mode="thread" panelId="composer-panel" />
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

<!-- Subset picker and panel binding -->
<velt-recorder-tool type="audio, video" panel-id="composer-panel"></velt-recorder-tool>
<velt-recorder-control-panel mode="thread" panel-id="composer-panel"></velt-recorder-control-panel>

<!-- With custom label -->
<velt-recorder-tool type="all" button-label="Record Feedback"></velt-recorder-tool>
```

**Key details:**
- `all` shows a mode picker dialog letting users choose between audio, video, and screen
- `audio`, `video`, `screen` go directly to that recording mode without a picker
- A comma-separated `type` (e.g. `'audio, video'`) renders a dropdown limited to those modes
- `screen` only renders where the browser supports screen sharing
- `panelId` binds a tool to the control panel with the same `panelId` when several panels are mounted
- `buttonLabel` adds custom text alongside the recorder icon

**Verification:**
- [ ] Recording type explicitly set via `type` prop
- [ ] Correct mode activates when user clicks the tool
- [ ] Button label matches application context (if customized)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#type - "type"
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#buttonlabel - "buttonLabel"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltRecorderTool & VeltRecorderNotes" (comma-separated `type`, `panelId`)

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

**Key details:**
- `maxLength` is specified in seconds
- Can be set on both VeltRecorderTool and VeltRecorderControlPanel via props
- Can also be set programmatically via `useRecorderUtils().setMaxLength()` or `Velt.getRecorderElement().setMaxLength()`
- When set via props, ensure both components use the same value for consistency

**Verification:**
- [ ] Max recording duration is set
- [ ] Recording automatically stops when limit is reached
- [ ] Value is consistent across VeltRecorderTool and VeltRecorderControlPanel

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - setMaxLength

---

## 3. Data Management

**Impact: HIGH**

Patterns for accessing, subscribing to, and managing recording data. Includes reactive subscriptions via React hooks, one-time fetches, Observable subscriptions, deletion by recorder ID, video downloads, and server-side retrieval via REST API.

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

**Available hooks:**

| Hook | Purpose | Return Type |
|------|---------|-------------|
| `useRecordings()` | Subscribe to all recordings in current document | `GetRecordingsResponse[]` |
| `useRecorderAddHandler()` | Capture recorderId on recording completion | `RecorderAddEvent` |
| `useRecorderUtils()` | Access imperative API methods | Recorder API object |
| `useRecorderEventCallback(type)` | Subscribe to specific lifecycle events | Event data |

**Verification:**
- [ ] Using `useRecordings()` instead of manual polling
- [ ] Using `useRecorderAddHandler()` to capture recorderId for VeltRecorderPlayer
- [ ] Hooks used within components inside VeltProvider

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/setup - useRecorderAddHandler; https://docs.velt.dev/async-collaboration/recorder/customize-behavior - useRecordings, useRecorderUtils

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

**Key details:**
- `deleteRecordings()` accepts a `RecorderRequestQuery` (`{ recorderIds: string[] }`) and returns `Promise<DeleteRecordingsResponse[]>`
- `downloadLatestVideo()` accepts a single `recorderId` string and returns `Promise<boolean>`
- `downloadLatestVideo` downloads the latest edited version if the video was edited

**Player delete control:** `VeltRecorderPlayer` accepts an `onDelete` callback that receives `{ id }` (the `recorderId`). The docs differ on what happens without it: the props reference says it fires when the recording is deleted, while the behaviors reference says the delete control only emits the event and your handler owns the deletion. Wire `onDelete`, check in your build whether the recording is already gone (for example with `fetchRecordings({ recorderIds: [id] })`), and only call `deleteRecordings()` if it is not.

```jsx
<VeltRecorderPlayer
  recorderId={recorderId}
  onDelete={({ id }) => handlePlayerDelete(id)}
/>
```

The `deleteRecording` recorder event fires when a recording is deleted.

**Verification:**
- [ ] Delete functionality available for user-created recordings
- [ ] `onDelete` wired on `VeltRecorderPlayer` and deletion behavior confirmed in your SDK build
- [ ] Download triggers browser download of the latest video version
- [ ] Error cases handled (failed delete, failed download)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#deleterecordings - "deleteRecordings"
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#downloadlatestvideo - "downloadLatestVideo"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltRecorderPlayer" (`onDelete`)

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

**Key details:**
- `fetchRecordings()` returns `Promise<GetRecordingsResponse[]>` — for one-time retrieval
- `getRecordings()` returns `Observable<GetRecordingsResponse[]>` — must call `.subscribe()`, emits on every update
- Both accept optional `{ recorderIds: string[] }` to filter by specific recordings
- Without `recorderIds`, returns all recordings in the current document
- In React, prefer `useRecordings()` hook for simplicity (see `data-hooks` rule)

**Verification:**
- [ ] Using `fetchRecordings()` for one-time data and `getRecordings()` for subscriptions
- [ ] Observable subscriptions cleaned up on unmount (`.unsubscribe()`)
- [ ] `recorderIds` filter used when only specific recordings are needed

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - fetchRecordings, getRecordings

---

### 3.4 Recorder Data Type Reference — Core Models

**Impact: MEDIUM (Correct field names for recording data, annotations, queries, and configuration prevent silent undefined reads)**

Use the documented field names when reading recorder data. Several fields are easy to guess wrong: segments are `transcriptSegments` with `startTimeInSeconds` / `endTimeInSeconds`, asset size is `fileSizeInBytes`, and the non-Safari browser key is `other` (not `others`).

**Incorrect (guessed field names):**

```typescript
const segments = recording.transcription.segments;        // Use transcriptSegments
const start = segments[0].start;                          // Use startTime / startTimeInSeconds
const size = recording.assets[0].size;                    // Use fileSizeInBytes
recorderElement.setRecordingEncodingOptions({ others: {} }); // Use 'other'
```

**Correct (documented shapes):**

```typescript
// RecorderRequestQuery: fetchRecordings / getRecordings / deleteRecordings
interface RecorderRequestQuery {
  recorderIds: string[];
}

// Items returned by fetchRecordings(), getRecordings(), deleteRecordings()
// (GetRecordingDataResponse / DeleteRecordingsResponse), and recordingDone-style events
interface GetRecordingDataResponse {
  recorderId: string;
  from?: User | null;
  metadata?: RecorderMetadata;
  assets: RecorderDataAsset[];            // latest version
  assetsAllVersions: RecorderDataAsset[]; // every edited version
  transcription: RecorderDataTranscription;
}

interface RecorderDataAsset {
  version?: number;
  url: string;
  mimeType?: string;
  fileName?: string;
  fileSizeInBytes?: number;
  fileFormat?: RecorderFileFormat;        // e.g. 'mp3' | 'mp4' | 'webm'
  thumbnailUrl?: string;
  transcription?: RecorderDataTranscription;
}

interface RecorderDataTranscription {
  transcriptSegments?: RecorderDataTranscriptSegment[];
  vttFileUrl?: string;
  contentSummary?: string;
}

interface RecorderDataTranscriptSegment {
  startTime: string;
  endTime: string;
  startTimeInSeconds: number;
  endTimeInSeconds: number;
  text: string;
}

// RecordedData: legacy onRecordedData callback payload
interface RecordedData {
  id: string;                    // recorder annotation ID
  tag: string;                   // recorder player tag you can place in the DOM
  type: string;                  // 'audio' | 'video' | 'screen'
  thumbnailUrl?: string;
  thumbnailWithPlayIconUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  videoPlayerUrl?: string;
  getThumbnailTag: Function;     // returns thumbnail HTML linking to the player
}

// Quality and encoding: keys are 'safari' and 'other'
interface RecorderQualityConstraints {
  safari?: { video?: MediaTrackConstraints; audio?: MediaTrackConstraints };
  other?: { video?: MediaTrackConstraints; audio?: MediaTrackConstraints };
}
interface RecorderEncodingOptions {
  safari?: { videoBitsPerSecond?: number; audioBitsPerSecond?: number };
  other?: { videoBitsPerSecond?: number; audioBitsPerSecond?: number };
}

interface RecorderDevicePermissionOptions {
  audio?: boolean;
  video?: boolean;
}

interface MediaPreviewConfig {
  audio?: { enabled?: boolean; deviceId?: string };
  video?: { enabled?: boolean; deviceId?: string };
  screen?: { enabled?: boolean; stream?: MediaStream };
}
```

**RecorderAnnotation (stored recorder annotation, also returned by the Get Recordings REST API):** `annotationId`, `from`, `color`, `lastUpdated`, `locationId`, `location`, `type`, `recordingType`, `mode` (`'floating' | 'thread'`), `approved`, `attachments` (the deprecated single `attachment` also exists), `annotationIndex`, `pageInfo`, `recordedTime`, `transcription`, `isRecorderResolverUsed` (true while self-hosted PII is being fetched), and `isUrlAvailable` (true once the URL is no longer a local blob).

**Defaults:** encoding defaults are `videoBitsPerSecond` 2,500,000 (Safari) / 1,000,000 (other) and `audioBitsPerSecond` 128,000. Quality defaults target 1280x720 at up to 30 fps with echo cancellation, noise suppression, and auto gain control.

**Verification:**
- [ ] Transcript code reads `transcriptSegments` and `startTimeInSeconds` / `endTimeInSeconds`
- [ ] Asset code reads `fileSizeInBytes`, `fileFormat`, `thumbnailUrl`
- [ ] Quality / encoding objects use the `safari` and `other` keys
- [ ] `assets` used for the latest version; `assetsAllVersions` when edit history matters
- [ ] Upload state checked with `isUrlAvailable` before sharing a URL

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#recorderrequestquery - "RecorderRequestQuery" and Recorder Data models
- https://docs.velt.dev/api-reference/sdk/models/data-models#recorderdataasset - "RecorderDataAsset"
- https://docs.velt.dev/api-reference/sdk/models/data-models#recorderannotation - "RecorderAnnotation"
- https://docs.velt.dev/api-reference/sdk/models/data-models#recordeddata - "RecordedData"
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#setrecordingqualityconstraints - "setRecordingQualityConstraints" (defaults)

---

### 3.5 Retrieve Recordings via REST API Endpoint

**Impact: MEDIUM (Enables server-side retrieval of recording data without the client SDK)**

Use `POST https://api.velt.dev/v2/recordings/get` to retrieve recorder annotations server-side without the client SDK. This is distinct from the client-side `fetchRecordings()` / `getRecordings()` methods (see `data-fetch-subscribe`). Like other v2 REST APIs, the parameters go inside a top-level `data` object, and the response is wrapped in `result`.

**Incorrect (GET method, unwrapped body, wrong pagination field):**

```typescript
const response = await fetch('https://api.velt.dev/v2/recordings/get', {
  method: 'GET',                                   // Must be POST
  body: JSON.stringify({ organizationId: 'org-123' }), // Must be wrapped in { data: { ... } }
});
const { nextPageToken } = await response.json();   // Not a field; use result.pageToken
```

**Correct (server-side POST with headers and `data` body):**

```typescript
const response = await fetch('https://api.velt.dev/v2/recordings/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY!,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN!,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',          // required
      documentId: 'doc-456',              // optional
      recordingIds: ['rec-1', 'rec-2'],   // optional
      pageSize: 10,                       // optional, minimum 1
      // pageToken: previousResult.pageToken,
    },
  }),
});

const { result } = await response.json();
for (const recording of result.data) {
  // recorder annotation: annotationId, recordingType, mode, recordedTime, displayName,
  // attachments[] (url, mimeType, name, type, size), latestVersion, metadata
  console.log(recording.annotationId, recording.attachments?.[0]?.url);
}
const nextPageToken = result.pageToken; // present when more results exist
```

**Request body (`data`):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organizationId` | `string` | Yes | Organization ID |
| `documentId` | `string` | No | Filter to a specific document |
| `recordingIds` | `string[]` | No | Filter to specific recording IDs |
| `pageSize` | `number` | No | Results per page (minimum 1) |
| `pageToken` | `string` | No | Cursor from a previous response's `result.pageToken` |

Errors return `{ error: { status, message } }` (for example `INVALID_ARGUMENT`). The Node and Python backend SDKs wrap the same endpoint.

**Verification:**
- [ ] `POST` method with parameters inside `data`
- [ ] `organizationId` included
- [ ] `x-velt-api-key` and `x-velt-auth-token` read from server-side environment variables
- [ ] Results read from `result.data`; pagination continues with `result.pageToken`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/recordings/get-recordings - "Get Recordings"

---

## 4. Event Handling

**Impact: MEDIUM-HIGH**

Subscription patterns for recorder lifecycle events. Covers all 12 event types including recording state changes, completion events, transcription completion, and error handling via both API subscriptions and React hooks.

### 4.1 Use useRecorderEventCallback for React Event Handling

**Impact: MEDIUM-HIGH (Declarative event handling with automatic cleanup in React components)**

In React, use the `useRecorderEventCallback` hook for declarative event subscriptions instead of manually calling `recorderElement.on().subscribe()` inside useEffect. The hook handles subscription lifecycle automatically.

**Incorrect (manual subscription in React):**

```jsx
function RecorderEvents() {
  const { client } = useVeltClient();

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
  const recordingDoneLocalData = useRecorderEventCallback('recordingDoneLocal');
  const recordingDoneData = useRecorderEventCallback('recordingDone');
  const errorData = useRecorderEventCallback('error');

  useEffect(() => {
    if (transcriptionData) {
      console.log('Transcription ready:', transcriptionData);
    }
  }, [transcriptionData]);

  useEffect(() => {
    if (recordingDoneLocalData) {
      // assets[0].url is a local blob URL (not CDN); only fires when sourceFeature === 'recording'
      console.log('Local save complete:', recordingDoneLocalData);
    }
  }, [recordingDoneLocalData]);

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
All 12 events from the lifecycle API are supported: `recordingStarted`, `recordingPaused`, `recordingResumed`, `recordingStopped`, `recordingCancelled`, `recordingDoneLocal`, `recordingDone`, `recordingSaveInitiated`, `recordingEditDone`, `transcriptionDone`, `deleteRecording`, `error`.

Note: `recordingDoneLocal` fires before cloud upload completes, so `assets[0].url` is a local blob URL at this stage, not a CDN URL. It only fires when `sourceFeature === 'recording'`. Use the existing `recordingDone` event when the permanent CDN URL is needed.

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

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#on - "on" (Hook + API Method)
- https://docs.velt.dev/api-reference/sdk/models/data-models#recordingdonelocalevent - "RecordingDoneLocalEvent"

---

### 4.2 Subscribe to Recorder Lifecycle Events via API

**Impact: MEDIUM-HIGH (React to recording state changes and handle errors)**

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
  // event.assets[0].url is a local blob URL (not CDN); only fires when event.sourceFeature === 'recording'
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
const doneSub = recorderElement.on('recordingDone').subscribe((event) => {
  console.log('Recording completed:', event);
});
const errorSub = recorderElement.on('error').subscribe((event) => {
  // event: { type: 'editFailed' | 'recordingFailed' | 'transcriptionFailed', message, recorderId? }
  console.error('Recorder error:', event.type, event.message);
});

// Clean up when done
doneSub?.unsubscribe();
errorSub?.unsubscribe();
```

**Complete event reference:**

| Event | Description | Event Type |
|-------|-------------|------------|
| `recordingStarted` | Recording begins | RecordingStartedEvent |
| `recordingPaused` | Recording paused | RecordingPausedEvent |
| `recordingResumed` | Recording resumed after pause | RecordingResumedEvent |
| `recordingStopped` | Recording stopped | RecordingStoppedEvent |
| `recordingCancelled` | Recording cancelled | RecordingCancelledEvent |
| `recordingDoneLocal` | Fires immediately after the recording annotation is saved locally, before cloud upload and transcription. `assets[0].url` is a local blob URL; the permanent CDN URL arrives with `recordingDone`. Only fires when `sourceFeature === 'recording'`. | RecordingDoneLocalEvent |
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

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#on - "on" (event list)
- https://docs.velt.dev/api-reference/sdk/models/data-models#recordingerrorevent - "RecordingErrorEvent"

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
/>

// Load from a URL
<VeltVideoEditor
  url="https://example.com/video.mp4"
  variant="compact"
/>

// Load from a Blob object
<VeltVideoEditor
  blob={videoBlob}
/>
```

**For HTML:**

```html
<velt-video-editor
  recorder-id="zK3iEAfvs1Htu3QYPy5S"
></velt-video-editor>

<velt-video-editor
  url="https://example.com/video.mp4"
  variant="compact"
></velt-video-editor>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `blob` | `Blob` | Video blob object |
| `url` | `string` | URL to video file |
| `recorderId` | `string` | Recorder ID to load a specific recording |
| `annotationId` | `string` | Bind to an existing annotation's recording (takes precedence over `recorderId`) |
| `darkMode` | `boolean` | Dark theme (light unless `true`) |
| `variant` | `string` | Editor wireframe variant |

**Key details:**
- Use **one** input source. If you pass several: `annotationId` / `recorderId` switch the editor to embed mode and win; in standalone mode `blob` wins over `url`
- The retake button only shows when the bound recorder enables it
- The standalone editor is independent of VeltRecorderTool and VeltRecorderControlPanel
- Useful for embedding video editing in custom page layouts or dedicated editing views

**Verification:**
- [ ] VeltVideoEditor used (not VeltRecorderPlayer) when editing is needed
- [ ] Exactly one input source provided (blob, url, or recorderId)
- [ ] Component renders and loads the video content

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/setup - "Embed Velt Video Editor (optional)"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltVideoEditor"

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

**Key details:**
- `floating` (default) — always renders at the bottom-left corner of the viewport, regardless of DOM position
- `thread` — renders exactly where the component is placed in the DOM tree
- Use `floating` for general-purpose recording UIs
- Use `thread` for inline contexts like chat threads, forms, or comment composers

**Verification:**
- [ ] Mode explicitly set based on layout requirements
- [ ] `thread` mode used when control panel should appear inline
- [ ] `floating` mode used when viewport overlay is preferred

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - mode

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

  useEffect(() => {
    // Disable transcription (recording won't be sent to LLMs)
    recorderUtils?.disableRecordingTranscription();
    // Re-enable later with recorderUtils.enableRecordingTranscription();
  }, [recorderUtils]);

  return null;
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

**Microphone control:**

```tsx
const recorderElement = client.getRecorderElement();

// Enable/disable microphone during recording
recorderElement.enableRecordingMic();
recorderElement.disableRecordingMic();
```

Use `disableRecordingMic()` for screen-only recordings where audio is not needed.

**Key details:**
- `recordingTranscription` defaults to **enabled** — recordings are sent to LLMs for transcription
- Disabling transcription means no AI summary will be generated
- `summary` prop on VeltRecorderPlayer controls whether the AI summary transcript is displayed (default: `true`). The deprecated `showSummary` prop is ANDed with it, so `showSummary={false}` hides the summary even when `summary` is `true`; use only `summary`
- A summary only appears if the recording was transcribed (`recordingTranscription` on at record time)
- `recordingTranscription` is a shared recorder-service flag: if two components set it differently, the last one wins
- `recordingTranscription` can be set on VeltRecorderNotes and VeltRecorderControlPanel
- Privacy consideration: explicitly disable transcription for recordings containing sensitive, confidential, or regulated content
- `enableRecordingMic()` / `disableRecordingMic()` controls whether the microphone is active during recording

**Verification:**
- [ ] Transcription disabled for sensitive content
- [ ] Microphone disabled for screen-only recordings if audio not needed
- [ ] Summary display matches UX requirements
- [ ] Privacy/compliance requirements reviewed for AI data processing

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#recordingtranscription - "recordingTranscription"
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#summary - "summary"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltRecorderPlayer" (`showSummary` AND `summary`)

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

const { client } = useVeltClient();

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

const { client } = useVeltClient();

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

**Key details:**
- `recordingCountdown` defaults to `true` — shows a countdown before recording starts
- `settingsEmbedded` is only available on VeltRecorderControlPanel (default: `false`)
- When `settingsEmbedded={true}`, use Control Panel wireframes to reposition the settings within the layout
- Disabling countdown is useful for quick-capture UIs but may cause users to miss recording the start of their content

**Verification:**
- [ ] Countdown behavior matches the intended UX flow
- [ ] Settings embedding used with wireframes for proper layout control
- [ ] Users are not confused by immediate recording start if countdown is disabled

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - recordingCountdown, settingsEmbedded

---

### 6.5 Customize Recorder UI with Wireframe Components

**Impact: LOW (Full structural customization of all recorder UI elements)**

The recorder exposes 9 wireframe component hierarchies for full structural customization. Each sub-component accepts `defaultCondition?: boolean` to control visibility. Wireframes are templates: place them inside `VeltWireframe` (React) or `<velt-wireframe style="display:none;">` (HTML), separate from the live recorder components.

**Incorrect (wireframe rendered on its own):**

```jsx
// Outside VeltWireframe the SDK never registers the template
<VeltRecorderAllToolWireframe>
  <span>Record</span>
</VeltRecorderAllToolWireframe>
```

**Correct (inside VeltWireframe):**

```jsx
import { VeltWireframe, VeltRecorderAllToolMenuWireframe } from '@veltdev/react';

<VeltWireframe>
  <VeltRecorderAllToolMenuWireframe>
    <VeltRecorderAllToolMenuWireframe.Audio>Audio note</VeltRecorderAllToolMenuWireframe.Audio>
    <VeltRecorderAllToolMenuWireframe.Video>Camera</VeltRecorderAllToolMenuWireframe.Video>
    <VeltRecorderAllToolMenuWireframe.Screen>Screen</VeltRecorderAllToolMenuWireframe.Screen>
  </VeltRecorderAllToolMenuWireframe>
</VeltWireframe>
```

```html
<velt-wireframe style="display:none;">
  <velt-recorder-all-tool-menu-wireframe>
    <velt-recorder-all-tool-menu-audio-wireframe>Audio note</velt-recorder-all-tool-menu-audio-wireframe>
    <velt-recorder-all-tool-menu-video-wireframe>Camera</velt-recorder-all-tool-menu-video-wireframe>
    <velt-recorder-all-tool-menu-screen-wireframe>Screen</velt-recorder-all-tool-menu-screen-wireframe>
  </velt-recorder-all-tool-menu-wireframe>
</velt-wireframe>
```

**Recorder Tool Wireframes:**

| Wireframe | Description |
|-----------|-------------|
| `VeltRecorderAllToolWireframe` | All-in-one tool with type selector menu |
| `VeltRecorderAllToolMenuWireframe` | Menu with `.Audio`, `.Video`, `.Screen` sub-items |
| `VeltRecorderAudioToolWireframe` | Audio-only recording tool |
| `VeltRecorderVideoToolWireframe` | Video-only recording tool |
| `VeltRecorderScreenToolWireframe` | Screen-only recording tool |

**Control Panel Wireframe:**

```
VeltRecorderControlPanelWireframe
├── .FloatingMode
│   ├── .Container (video/waveform display)
│   ├── .ScreenMiniContainer (mini view for screen recordings)
│   ├── .Loading
│   └── .ActionBar (time, pause/play, stop, clear, PiP buttons)
└── .ThreadMode (inline mode)
```

**Player Wireframe:**

```
VeltRecorderPlayerWireframe
├── .VideoContainer
│   ├── .Video, .Timeline, .PlayButton, .SeekBar
│   ├── .FullScreenButton, .Overlay, .Subtitles
│   ├── .Avatar, .Name, .SubtitlesButton
│   ├── .Transcription, .EditButton, .CopyLink, .Delete
└── .AudioContainer
    ├── .AudioToggle, .Time, .AudioWaveform
    ├── .Subtitles, .Avatar, .Name, .SubtitlesButton
    ├── .Transcription, .CopyLink, .Delete, .Audio
```

**Expanded Player Wireframe:**

```
VeltRecorderPlayerExpandedWireframe
├── .Panel
│   ├── .Display, .CopyLink, .MinimizeButton, .Subtitles
│   └── .Controls
│       ├── .ProgressBar, .ToggleButton, .Time
│       ├── .SubtitleButton, .TranscriptionButton
│       ├── .VolumeButton, .SettingsButton, .DeleteButton
└── .Transcription
```

**Recording Preview Steps Dialog Wireframe:**

```
VeltRecordingPreviewStepsDialogWireframe
├── .Audio
│   ├── .CloseButton, .Timer, .Waveform
│   ├── .SettingsPanel, .ButtonPanel, .BottomPanel
└── .Video
    ├── .CloseButton, .Timer, .VideoPlayer, .ScreenPlayer
    ├── .CameraOffMessage, .CameraButton
    ├── .SettingsPanel, .ButtonPanel, .BottomPanel
```

**Media Source Settings Wireframe:**

```
VeltMediaSourceSettingsWireframe
├── .Audio
│   ├── .ToggleIcon, .SelectedLabel, .Divider
│   └── .Options → .Item (Icon + Label)
└── .Video (same structure as .Audio)
```

**Video Editor Wireframe:**

```
VeltVideoEditorPlayerWireframe
├── .Title, .ApplyButton, .RetakeButton, .DownloadButton, .CloseButton
├── .Preview → .Loading, .Video
├── .ToggleButton, .Time, .SplitButton, .DeleteButton, .AddZoomButton
└── .Timeline
    ├── .BackspaceHint, .Onboarding
    └── .Container → .Playhead, .Trim, .Scale (with dropdown), .Marker
```

**Transcription Wireframe:**

```
VeltTranscriptionWireframe
├── .FloatingMode
│   ├── .Button, .Tooltip
│   └── .PanelContainer → .Panel
│       ├── .CloseButton, .CopyLink
│       ├── .Summary → .Text, .ExpandToggle
│       └── .Content → .Item → .Text, .Time
└── .EmbedMode → .Panel (same structure)
```

**Subtitles Wireframe:**

```
VeltSubtitlesWireframe
├── .EmbedMode → .Text
└── .FloatingMode
    ├── .Button, .Tooltip
    └── .Panel → .CloseButton, .Text
```

**Key details:**
- All wireframe components accept `defaultCondition?: boolean` to control render conditions
- Set `shadowDom={false}` on the parent component to apply custom CSS
- Wireframes override the default UI structure — omitted sub-components won't render

**Verification:**
- [ ] Wireframes are wrapped in `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] Parent component has `shadowDom={false}` for custom styling
- [ ] Wireframe hierarchy matches the component being customized
- [ ] All desired sub-components included (omitted ones won't render)

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/recorder/recorder-tool - "Recorder Tool"
- https://docs.velt.dev/ui-customization/features/async/recorder/control-panel - "Control Panel"
- https://docs.velt.dev/ui-customization/features/async/recorder/recorder-player - "Recorder player"
- https://docs.velt.dev/ui-customization/features/async/recorder/recorder-player-expanded - "Recorder Player Expanded"
- https://docs.velt.dev/ui-customization/features/async/recorder/recording-preview-steps-dialog - "Recording Preview Steps Dialog"
- https://docs.velt.dev/ui-customization/features/async/recorder/media-source-settings - "Media Source Settings"
- https://docs.velt.dev/ui-customization/features/async/recorder/video-editor - "Video Editor"
- https://docs.velt.dev/ui-customization/features/async/recorder/transcription - "Transcription"
- https://docs.velt.dev/ui-customization/features/async/recorder/subtitles - "Subtitles"

---

## 7. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns and verification checklists for Velt recorder integrations.

### 7.1 Debug Common Recorder Issues

**Impact: LOW-MEDIUM (Quick troubleshooting for frequent recorder integration problems)**

Common issues when integrating the Velt Recorder and how to resolve them.

**Issue 1: Recording does not start**

```jsx
// Check: Components must be within VeltProvider
// Check: Device permissions must be granted
// Check: Browser must support MediaRecorder API

// Verify with:
function DebugRecorder() {
  const recorderUtils = useRecorderUtils();

  const checkPermissions = async () => {
    await recorderUtils.askDevicePermission({ audio: true, video: true });
  };

  return (
    <div>
      <button onClick={checkPermissions}>Check Permissions</button>
      <VeltRecorderTool type="all" />
    </div>
  );
}
```

**Issue 2: VeltRecorderPlayer shows nothing**

```jsx
// recorderId must come from the recording completion event
// A null or undefined recorderId means the recording hasn't completed

// Incorrect:
<VeltRecorderPlayer recorderId={undefined} />  // Won't render anything

// Correct:
const recorderAddEvent = useRecorderAddHandler();
useEffect(() => {
  if (recorderAddEvent) {
    setRecorderId(recorderAddEvent.id);  // Only set when recording is done
  }
}, [recorderAddEvent]);

// Also check: recording may still be uploading
```

**Issue 3: Picture-in-Picture not working**

```jsx
// PiP has three requirements — all must be met:
// 1. Browser is Chrome (not Firefox, Safari, or Edge)
// 2. Recording type is 'screen'
// 3. Camera is active during the screen recording

// This won't work:
<VeltRecorderTool type="audio" pictureInPicture={true} />  // Wrong type
<VeltRecorderTool type="screen" pictureInPicture={true} />  // Works in Chrome only
```

**Issue 4: Video editor not appearing**

```jsx
// Video editor must be explicitly enabled — it's off by default
// Only works for video and screen recordings, NOT audio

// This won't show editor:
<VeltRecorderPlayer recorderId={id} />  // videoEditor defaults to false

// This will:
<VeltRecorderPlayer recorderId={id} videoEditor={true} />
// Or via API:
recorderUtils.enableVideoEditor();
```

**Issue 5: Timeline preview not showing in video editor**

```jsx
// Both props must be true — videoEditorTimelinePreview alone does nothing

// Incorrect:
<VeltRecorderControlPanel videoEditorTimelinePreview={true} />  // Missing videoEditor

// Correct:
<VeltRecorderControlPanel
  videoEditor={true}
  videoEditorTimelinePreview={true}
/>
```

**Issue 6: AI transcription not generating**

```jsx
// Transcription is enabled by default but may have been disabled
// Check both VeltRecorderNotes and VeltRecorderControlPanel

// Verify transcription is not disabled:
<VeltRecorderNotes recordingTranscription={true} />
<VeltRecorderControlPanel recordingTranscription={true} />

// Subscribe to transcription event to confirm:
const transcriptionData = useRecorderEventCallback('transcriptionDone');
useEffect(() => {
  if (transcriptionData) {
    console.log('Transcription received:', transcriptionData);
  }
}, [transcriptionData]);
```

**Issue 7: Quality/encoding settings not taking effect**

```jsx
// Settings use browser-specific keys: 'safari' and 'other'
// Using the wrong key means settings are silently ignored

// Incorrect:
recorderUtils.setRecordingQualityConstraints({
  'chrome': { ... }  // Wrong key — use 'other' for non-Safari browsers
});

// Correct:
recorderUtils.setRecordingQualityConstraints({
  'safari': { ... },   // Safari-specific
  'other': { ... }     // All other browsers (Chrome, Firefox, Edge)
});
```

**Issue 8: `recorder.done` webhook never arrives**

```js
// recorder.done is an advanced (V2) webhook event; basic webhooks do not carry it.
// Check the workspace trigger: triggers.recorder.done must be true.
// Enabling the webhook service via the Update Webhook Config REST API seeds the
// recorder triggers off, so re-enable it explicitly.
// The payload's recording data is under body.data, not body.payload.
```

**Issue 9: Two components fight over a setting**

```jsx
// Recorder boolean props set shared recorder-service flags; the last setter wins.
<VeltRecorderControlPanel recordingTranscription={false} />
<VeltRecorderNotes recordingTranscription={true} />   // overrides the panel
// Set each flag in one place, or use the API (e.g. disableRecordingTranscription()).
```

**Verification:**
- [ ] All recorder components are within VeltProvider
- [ ] Device permissions granted before recording
- [ ] recorderId is set from recording completion event, not hardcoded
- [ ] PiP constraints understood (Chrome + screen + camera)
- [ ] Video editor explicitly enabled for video/screen recordings
- [ ] Browser-specific keys used for quality/encoding settings
- [ ] Shared recorder flags configured from one place
- [ ] `recorder.done` trigger enabled on an advanced webhook endpoint if you rely on it

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/setup - "Setup"
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior - "Customize Behavior"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - shared recorder-service flags
- https://docs.velt.dev/webhooks/advanced#recorder - "Recorder"

---

## 8. Wireframe Variables

**Impact: MEDIUM**

Template-variable bindings (`velt-data`, `velt-if`, `velt-class`) exposed by the Recorder wireframe family. Covers the trigger button, recorder pin, control panel (floating / thread / collapsed / paused / loading / screen / video modes), playback widget, and expanded full-screen player — including the shared player config, the six naming-conflict variables that require the full `componentConfigSignal.<name>` path, and the behaviour callbacks (`initRecording`, `onSeekToVideo`, `copyLink`, `deleteRecorderAnnotation`).

### 8.1 Bind Recorder Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives recording-state styling, mode gating, playback time/scrubber binding, and per-type tool variant rendering across the Recorder wireframe family without re-subscribing to recorder state)**

The Recorder wireframe family (`<velt-recorder-...-wireframe>` / `<VeltRecorder...Wireframe>`) covers the trigger button, the pin shown on a recorder annotation, the recording-in-progress control panel (floating / thread / collapsed / paused / loading / screen / video variants), and the playback surface — including the expanded full-screen player and its overlay controls.

You read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing recording state, type gating, or playback time tracking on top of `useRecordings` / `useRecorderEventCallback`.

This feature uses the **flat-config** access pattern — every property lives directly on the root of `componentConfigSignal()` (no nested `appState` / `featureState` / `data` / `uiState`). Reach values via `{componentConfigSignal.<name>}`. The shorter `{<name>}` form also works for any field at the root **except** for the six naming-conflict cases listed below.

For the structural catalog of which recorder wireframe tags exist, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top of that.

**Incorrect (rebuilding recorder state from hooks and gating slots from the host component):**

```jsx
import { useRecorderEventCallback, VeltWireframe, VeltRecorderAllToolWireframe } from '@veltdev/react';

function RecordButton() {
  // Reimplements recordingInProgress + screen-sharing capability the wireframe already exposes.
  const started = useRecorderEventCallback('recordingStarted');
  const stopped = useRecorderEventCallback('recordingStopped');
  const isRecording = !!started && !stopped;
  const canScreen = !!navigator.mediaDevices?.getDisplayMedia;
  return (
    <VeltWireframe>
      <VeltRecorderAllToolWireframe>
        <button className={isRecording ? 'rec on' : 'rec'}>
          {isRecording ? 'Stop' : (canScreen ? 'Record screen' : 'Record')}
        </button>
      </VeltRecorderAllToolWireframe>
    </VeltWireframe>
  );
}
```

**Correct (read the slot's injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltWireframe, VeltRecorderAllToolWireframe, VeltData } from '@veltdev/react';

<VeltWireframe>
  <VeltRecorderAllToolWireframe>
    <button
      className="rec"
      veltClass="'is-recording': {componentConfigSignal.recordingInProgress}, 'is-disabled': {componentConfigSignal.disabled}, 'theme-dark': {componentConfigSignal.darkMode}">
      <span veltIf="!{componentConfigSignal.recordingInProgress}">
        <VeltData field="componentConfigSignal.buttonLabel" />
      </span>
      <span veltIf="{componentConfigSignal.recordingInProgress}">Recording…</span>
    </button>
  </VeltRecorderAllToolWireframe>
</VeltWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-wireframe style="display:none;">
  <velt-recorder-all-tool-wireframe>
    <button class="rec"
            velt-class="'is-recording': {componentConfigSignal.recordingInProgress}">
      <span velt-if="!{componentConfigSignal.recordingInProgress}">
        <velt-data field="componentConfigSignal.buttonLabel"></velt-data>
      </span>
      <span velt-if="{componentConfigSignal.recordingInProgress}">Recording…</span>
    </button>
  </velt-recorder-all-tool-wireframe>
</velt-wireframe>
```

The `recorder-button` element has no direct wireframe slot of its own; customize it through its per-type tool tags (`recorder-audio-tool`, `recorder-video-tool`, `recorder-screen-tool`, `recorder-all-tool`).

#### Naming conflicts — use the full path

Six names collide with mappings used elsewhere. Inside a Recorder wireframe, prefer the explicit `componentConfigSignal.<name>` path for these — the short form resolves to the wrong namespace:

| Conflicting name | Short form resolves to | Use this for Recorder |
|---|---|---|
| `disabled` | `parentLocalUIState.disabled` | `componentConfigSignal.disabled` |
| `darkMode` | `parentLocalUIState.darkMode` | `componentConfigSignal.darkMode` |
| `variant` | `parentLocalUIState.variant` | `componentConfigSignal.variant` |
| `screenSharingSupported` | `componentConfigSignal.featureState.screenSharingSupported` | `componentConfigSignal.screenSharingSupported` |
| `user` | `componentConfigSignal.appState.user` | `componentConfigSignal.user` |
| `annotation` | `componentConfigSignal.data.annotation` | `componentConfigSignal.annotation` |

#### Variables by region

The recorder injects a single flat config object; the variables exposed depend on which wireframe tag the slot lives inside.

**Recorder Button** (no direct slot; bind inside its per-type tool tags `recorder-audio-tool`, `recorder-video-tool`, `recorder-screen-tool`, `recorder-all-tool`):

| Variable | Type | Notes |
|---|---|---|
| `componentConfigSignal.buttonLabel` | `string` | Custom label text (e.g. `"Record"`). |
| `componentConfigSignal.recordingInProgress` | `boolean` | A recording is currently active. |
| `componentConfigSignal.types` | `RecorderMode[]` | Modes permitted on this button — subset of `'audio' \| 'video' \| 'screen' \| 'all'`. Gate per-type child tags with `velt-if="{componentConfigSignal.types.includes('audio')}"` etc. |
| `componentConfigSignal.recorderModes` | `{ AUDIO; VIDEO; SCREEN; ALL }` | Constant id map for comparing to `types`. |
| `componentConfigSignal.disabled` | `boolean` | Button is disabled. |
| `componentConfigSignal.darkMode` | `boolean` | Dark mode is active. |
| `componentConfigSignal.shadowDom` | `boolean` | Shadow-DOM rendering enabled (host config). |
| `componentConfigSignal.screenSharingSupported` | `boolean` | Browser supports `getDisplayMedia`. Gate `recorder-screen-tool` on this. |
| `componentConfigSignal.recordingCountdown` | `boolean` | 3-2-1 countdown overlay is enabled. |
| `componentConfigSignal.variant` | `string` | Wireframe variant id. |
| `componentConfigSignal.initRecording` | `(type) => void` | Click handler — call from a custom button to start a recording of the given type. |

**Recorder Pin** (`<velt-recorder-pin-wireframe>`):

| Variable | Type | Notes |
|---|---|---|
| `componentConfigSignal.recorderPinAnnotation` | `RecorderAnnotation` | The annotation this pin represents (`from`, `recorderId`, `recorders`). |
| `componentConfigSignal.recorderPinSelected` | `boolean` | Pin is currently selected. |
| `componentConfigSignal.multipleRecorderPinsSelected` | `boolean` | Multi-select mode is active. |
| `componentConfigSignal.dragging` | `boolean` | Pin is being dragged. |

**Recorder Player — shared** (used by `<velt-recorder-player-wireframe>`, every `recorder-player-*-wireframe` sub-primitive, the expanded-player tags, and the control-panel's playback-like surfaces). All these tags receive the **same** flat `componentConfigSignal` carrying the active recording's metadata + behaviour callbacks:

| Variable | Type | Notes |
|---|---|---|
| `componentConfigSignal.recordingTranscriptionEnabled` | `boolean` | Transcription overlay is enabled for this recording. |
| `componentConfigSignal.recordingType` | `'audio' \| 'video' \| 'screen'` | Recorder type. Use with `velt-class="'is-{componentConfigSignal.recordingType}': true"`. |
| `componentConfigSignal.recorderInitData` | `RecorderInitData` | Active recording handle (internal — used by playback). |
| `componentConfigSignal.attachment` | `Attachment` | Saved-attachment record — bind `componentConfigSignal.attachment.url`. |
| `componentConfigSignal.videoPosterDefaultImage` | `string` | Default poster image when no first frame is captured yet. |
| `componentConfigSignal.annotation` | `RecorderAnnotation` | Recorder annotation backing this playback. |
| `componentConfigSignal.totalTimeValue` | `number` | Total duration in milliseconds — bind on `recorder-player-time` and `expanded-controls-total-time`. |
| `componentConfigSignal.currentTimeValue` | `number` | Current playback position in milliseconds — bind on `recorder-player-time`, `expanded-controls-current-time`. |
| `componentConfigSignal.user` | `User` | Currently identified end-user — bind `componentConfigSignal.user.name` / `.photoUrl` on `recorder-player-avatar`. |
| `componentConfigSignal.dragging` | `boolean` | Pin / panel is being dragged. |
| `componentConfigSignal.recorderPinSelected` | `boolean` | Pin is currently selected. |
| `componentConfigSignal.sourceFeature` | `'comment' \| 'standalone' \| ...` | Where this player is mounted — `velt-class="'source-{componentConfigSignal.sourceFeature}': true"`. |
| `componentConfigSignal.videoContainerHovered` | `boolean` | Video container is hovered. |
| `componentConfigSignal.mode` | `'floating' \| 'thread'` | Control-panel layout mode (also on player). |
| `componentConfigSignal.variant` | `RecorderVariant` | Wireframe variant id. |
| `componentConfigSignal.isPlaying` | `boolean` | Playback is active — gate `expanded-controls-toggle-play/pause` icons. |
| `componentConfigSignal.isRecording` | `boolean` | Control-panel: recording (not paused) — gate `action-bar-toggle-pause/play` icons. |
| `componentConfigSignal.elapsedTime` | `number` | Elapsed-recording time label (`action-bar-time`). |

**Player behaviour callbacks.** The shared player config exposes ~15 behaviour callbacks you can attach to your own buttons — `timeUpdate`, `toggleVideo`, `onSliderGrab` / `onSliderDrag` / `onSliderRelease`, `onSeekToVideo(seconds)` / `onSeekToAudio(seconds)`, `onSubtitlesButtonClick` / `onSubtitlesPanelDragged`, `onTranscriptionButtonClick` / `onTranscriptionPanelDragged` / `onTranscriptionTimestampClick` / `onTranscriptionSummaryCopy`, `toggleAnnotation`, `copyLink`, `deleteRecorderAnnotation`, `setVideoContainerHovered(boolean)`.

#### Wireframe tag families

The recorder feature has a large set of overridable surfaces. They are grouped here by region; bind only what you actually customise — every tag falls back to the default render.

**Root + per-type tool variants** — gate per-type variants on `types.includes(...)` and the `screen` variant additionally on `screenSharingSupported`:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-audio-tool-wireframe>` | Audio-only variant. |
| `<velt-recorder-video-tool-wireframe>` | Video-only variant. |
| `<velt-recorder-screen-tool-wireframe>` | Screen-only variant. Gate on `{componentConfigSignal.screenSharingSupported}`. |
| `<velt-recorder-all-tool-wireframe>` (+ `-menu-wireframe`, `-menu-audio/-video/-screen-wireframe` children) | Unified "record any" button that opens a per-type menu. |

**Pin / Player root**:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-pin-wireframe>` | Pin overlay on a recorder annotation. |
| `<velt-recorder-player-wireframe>` | Playback widget root — composes the ~20 sub-primitives below. |

**Player internals** — overlay, container, time/name/timeline, action buttons, subtitles, transcription:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-player-overlay-wireframe>` | Overlay UI on top of the playing video (controls + scrubber + buttons). |
| `<velt-recorder-player-video-container-wireframe>` / `<velt-recorder-player-video-wireframe>` | Container + inline `<video>` for video recordings. |
| `<velt-recorder-player-audio-container-wireframe>` / `<velt-recorder-player-audio-wireframe>` | Container + inline `<audio>` for audio recordings. |
| `<velt-recorder-player-audio-waveform-wireframe>` | Animated waveform for audio recordings. |
| `<velt-recorder-player-audio-toggle-wireframe>` (+ `-play-wireframe`, `-pause-wireframe`) | Play / pause button group. |
| `<velt-recorder-player-timeline-wireframe>` (+ `-seek-bar-wireframe`) | Scrubber timeline + draggable seek bar. |
| `<velt-recorder-player-time-wireframe>` | Current / total time labels — bind `currentTimeValue` and `totalTimeValue`. |
| `<velt-recorder-player-name-wireframe>` | Recording's name / title. |
| `<velt-recorder-player-edit-button-wireframe>` / `…-delete-wireframe` / `…-copy-link-wireframe` / `…-full-screen-button-wireframe> ` | Action buttons on the player overlay. |
| `<velt-recorder-player-subtitles-wireframe>` / `…-subtitles-button-wireframe` | Subtitles overlay + toggle. |
| `<velt-recorder-player-transcription-wireframe>` | Transcript panel (subset of transcription variables — full set lives on the Transcription feature config in standalone mode). |
| `<velt-recorder-player-avatar-wireframe>` / `…-play-button-wireframe` | Recorder author's avatar (`user.photoUrl`); compact play-only button. |

**Control panel** (during recording) — floating / thread / collapsed / paused / loading / screen / video modes plus the action bar:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-control-panel-wireframe>` | Root. Props: `mode` (`'floating' \| 'thread'`), `panelId`. |
| `<velt-recorder-control-panel-floating-mode-wireframe>` (+ `-container-wireframe`, `-waveform-wireframe`) | Floating layout. |
| `<velt-recorder-control-panel-thread-mode-wireframe>` | Thread (composer-embedded) layout. |
| `<velt-recorder-control-panel-collapsed-button-wireframe>` (+ `-on-wireframe` / `-off-wireframe`) | Collapsed-state button. Gate `-on` on `{componentConfigSignal.isRecording}`, `-off` on the inverse. |
| `<velt-recorder-control-panel-paused-wireframe>` | Paused-state overlay. |
| `<velt-recorder-control-panel-loading-wireframe>` | Loading state (initialising recorder). |
| `<velt-recorder-control-panel-screen-wireframe>` (+ `-mini-container-wireframe`) | Screen-recording overlays. |
| `<velt-recorder-control-panel-video-wireframe>` | Video-recording overlay. |
| `<velt-recorder-control-panel-action-bar-wireframe>` (+ `-stop-wireframe`, `-clear-wireframe`, `-toggle-wireframe`/`-toggle-pause-wireframe`/`-toggle-play-wireframe`, `-pip-wireframe`, `-time-wireframe`, `-type-icon-wireframe`, `-waveform-wireframe`) | Action-bar children. Gate pause icon on `{componentConfigSignal.isRecording}`, play on its inverse. |

**Expanded player** (full-screen playback) — separate control-bar tags:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-player-expanded-wireframe>` (+ `-panel-wireframe`, `-controls-wireframe`) | Expanded-player root, inner panel, control-bar wrapper. |
| `…-expanded-controls-toggle-button-wireframe` (+ `-play-wireframe`, `-pause-wireframe`) | Play / pause toggle. Gate `-play` on `!{componentConfigSignal.isPlaying}`, `-pause` on `{componentConfigSignal.isPlaying}`. |
| `…-expanded-controls-progress-bar-wireframe` | Scrubber progress bar. |
| `…-expanded-controls-current-time-wireframe` / `…-total-time-wireframe` / `…-time-wireframe` | Time labels — bind `currentTimeValue`, `totalTimeValue`. |
| `…-expanded-controls-volume-button-wireframe` / `…-settings-button-wireframe` / `…-delete-button-wireframe` | Overlay action buttons. |
| `…-expanded-controls-subtitle-button-wireframe` (+ `-icon-wireframe`, `-tooltip-wireframe`) | Subtitle toggle subtree. |
| `…-expanded-controls-transcription-button-wireframe` (+ `-icon-wireframe`, `-tooltip-wireframe`) | Transcription toggle subtree. |
| `…-expanded-copy-link-wireframe` / `…-expanded-minimize-button-wireframe` | Copy-link; minimise (exit fullscreen). |

#### Putting it together

A custom record button paired with a custom playback overlay (scrubber + delete):

```jsx
<VeltWireframe>
  <VeltRecorderAllToolWireframe>
    <button className="my-record"
            veltClass="'is-recording': {componentConfigSignal.recordingInProgress}">
      <span veltIf="!{componentConfigSignal.recordingInProgress}">
        <VeltData field="componentConfigSignal.buttonLabel" />
      </span>
      <span veltIf="{componentConfigSignal.recordingInProgress}">Stop</span>
    </button>
  </VeltRecorderAllToolWireframe>

  <VeltRecorderPlayerWireframe>
    <VeltRecorderPlayerWireframe.VideoContainer>
      <VeltRecorderPlayerWireframe.VideoContainer.Video />
      <VeltRecorderPlayerWireframe.VideoContainer.Overlay />
      <VeltRecorderPlayerWireframe.VideoContainer.Time>
        <VeltData field="componentConfigSignal.currentTimeValue" />
        /
        <VeltData field="componentConfigSignal.totalTimeValue" />
      </VeltRecorderPlayerWireframe.VideoContainer.Time>
      <VeltRecorderPlayerWireframe.VideoContainer.Timeline />
      <VeltRecorderPlayerWireframe.VideoContainer.Delete />
    </VeltRecorderPlayerWireframe.VideoContainer>
  </VeltRecorderPlayerWireframe>
</VeltWireframe>
```

#### Common mistakes — DO NOT

**1. DO NOT use the short `{disabled}` / `{darkMode}` / `{variant}` / `{user}` / `{annotation}` / `{screenSharingSupported}` forms inside a Recorder wireframe.** These six names collide with mappings used elsewhere — always use the full `componentConfigSignal.<name>` path. Other root-level fields (`buttonLabel`, `recordingInProgress`, `types`, `currentTimeValue`, `totalTimeValue`, etc.) accept either form, but prefer the full path for consistency.

**2. DO NOT collapse the audio / video / screen trichotomy into one slot.** Each recorder type has its own tool variant (`recorder-audio-tool` / `…-video-tool` / `…-screen-tool` / `…-all-tool`) and its own control-panel surface. Gate per-type slots with `velt-if="{componentConfigSignal.types.includes('audio')}"` (and additionally with `{componentConfigSignal.screenSharingSupported}` for the screen variant).

**3. DO NOT confuse `isRecording` with `recordingInProgress`.** `recordingInProgress` is true for the entire recording session (button is "stop"); `isRecording` is the paused/unpaused state inside the control-panel action bar.

**4. DO NOT confuse `isPlaying` (player toggle state) with `recordingInProgress` (recorder state).** The expanded-player toggle icons gate on `{componentConfigSignal.isPlaying}`; the record button gates on `{componentConfigSignal.recordingInProgress}`.

**5. DO NOT rebuild scrubber / time logic — bind to the shared callbacks.** The shared player config exposes `onSliderGrab` / `onSliderDrag` / `onSliderRelease`, `onSeekToVideo(seconds)` / `onSeekToAudio(seconds)`, `toggleVideo`, `timeUpdate`, `copyLink`, `deleteRecorderAnnotation`. Attach these to your custom buttons; do not re-implement seek state.

**6. DO NOT call `componentConfigSignal.initRecording` without a type argument.** The recorder button click handler is `initRecording(type)` where `type` is one of `'audio' \| 'video' \| 'screen' \| 'all'`. Pass the type matching the button's intended mode.

**Verification:**
- [ ] Recorder wireframe slots use the full `componentConfigSignal.<name>` path for the six naming-conflict variables (`disabled`, `darkMode`, `variant`, `user`, `annotation`, `screenSharingSupported`)
- [ ] Per-type tool variants (`recorder-audio-tool`, `…-video-tool`, `…-screen-tool`) are gated on `{componentConfigSignal.types.includes(...)}` — and the screen variant additionally on `{componentConfigSignal.screenSharingSupported}`
- [ ] Control-panel action-bar `toggle-pause` / `toggle-play` icons are gated on `{componentConfigSignal.isRecording}` / its inverse — not `recordingInProgress`
- [ ] Expanded-player toggle icons are gated on `{componentConfigSignal.isPlaying}` / its inverse
- [ ] Custom record buttons call `componentConfigSignal.initRecording(type)` with an explicit `'audio' \| 'video' \| 'screen' \| 'all'` argument
- [ ] Custom scrubber / seek / copy-link / delete buttons wire to the shared callbacks (`onSliderDrag`, `onSeekToVideo`, `copyLink`, `deleteRecorderAnnotation`) — not re-implemented
- [ ] Time labels bind `componentConfigSignal.currentTimeValue` / `totalTimeValue` (milliseconds) on `recorder-player-time` and the expanded `current-time` / `total-time` tags
- [ ] The transcript panel relies on the subset exposed via the shared player config — full transcription variables (`vttFileTextArray`, `highlightedTextIndex`) live on the Transcription feature config in standalone mode

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/recorder/wireframe-variables — "Recorder Wireframe Variables" (full per-slot reference)
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `ui/ui-control-panel-mode.md` (floating vs thread modes), `ui/ui-ai-transcription.md` (transcription overlay), `config/config-type-and-mode.md` (recorder modes), `config/config-picture-in-picture.md` (PiP toggle on the action bar)

---

### 8.2 Bind Transcription / Subtitles Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives transcript-panel visibility, active-segment styling, subtitles toggling, and summary expand/collapse state across the Transcription, Subtitles, and Subtitles-Dialog wireframes without re-subscribing to recorder transcription state)**

The Transcription feature renders three related primitives — the transcript panel (`<velt-transcription-...-wireframe>`), the live subtitles overlay (`<velt-subtitles-...-wireframe>`), and a popover subtitles dialog (`<velt-subtitles-dialog-wireframe>`). They share the same flat-config access pattern as the rest of the recorder family: read variables via `<velt-data field="...">`, gate slots with `velt-if="{var}"`, and toggle classes with `velt-class="'cls': {var}"`.

This feature uses **flat-config** access. Use the explicit `componentConfig.<name>` path — the transcription primitives do **not** alias to the short `{name}` form the recorder root supports. The full standalone transcription variable set (`vttFileTextArray`, `highlightedTextIndex`, `transcription.summary`, etc.) lives here; the parent recorder player exposes only a subset (see `wireframe-variables/wireframe-variables-recorder.md`).

**Incorrect (rebuilding transcript state and segment-active styling from hooks):**

```jsx
import { useRecorderEventCallback, VeltWireframe, VeltTranscriptionWireframe } from '@veltdev/react';

function Transcript({ recording, active }) {
  // Reimplements transcriptionVisible + highlightedTextIndex the wireframe already exposes.
  const transcriptionDone = useRecorderEventCallback('transcriptionDone');
  return (
    <VeltWireframe>
      <VeltTranscriptionWireframe.FloatingMode.Panel>
        {transcriptionDone && recording.transcription?.transcriptSegments?.map((seg, i) => (
          <p key={i} className={i === active ? 'on' : ''}>{seg.text}</p>
        ))}
      </VeltTranscriptionWireframe.FloatingMode.Panel>
    </VeltWireframe>
  );
}
```

**Correct (read the slot's injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltWireframe, VeltTranscriptionWireframe, VeltData } from '@veltdev/react';

<VeltWireframe>
  <VeltTranscriptionWireframe.FloatingMode veltClass="'visible': {componentConfig.transcriptionVisible}">
    <VeltTranscriptionWireframe.FloatingMode.Panel>
      <VeltTranscriptionWireframe.FloatingMode.Panel.Summary>
        <p veltIf="{componentConfig.showMoreSummary}">
          <VeltData field="componentConfig.transcription.summary" />
        </p>
      </VeltTranscriptionWireframe.FloatingMode.Panel.Summary>
      <VeltTranscriptionWireframe.FloatingMode.Panel.Content>
        <VeltTranscriptionWireframe.FloatingMode.Panel.Content.Item
          veltClass="'is-active': '{segment.startTimeInSeconds} <= {currentTime} && {segment.endTimeInSeconds} > {currentTime}'">
          <time><VeltData field="segment.startTime" /></time>
          <p><VeltData field="segment.text" /></p>
        </VeltTranscriptionWireframe.FloatingMode.Panel.Content.Item>
      </VeltTranscriptionWireframe.FloatingMode.Panel.Content>
    </VeltTranscriptionWireframe.FloatingMode.Panel>
  </VeltTranscriptionWireframe.FloatingMode>
</VeltWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-wireframe style="display:none;">
  <velt-transcription-floating-mode-wireframe velt-class="'visible': {componentConfig.transcriptionVisible}">
    <velt-transcription-panel-wireframe>
      <velt-transcription-content-item-wireframe
        velt-class="'is-active': '{segment.startTimeInSeconds} <= {currentTime} && {segment.endTimeInSeconds} > {currentTime}'">
        <p><velt-data field="segment.text"></velt-data></p>
      </velt-transcription-content-item-wireframe>
    </velt-transcription-panel-wireframe>
  </velt-transcription-floating-mode-wireframe>
</velt-wireframe>
```

The transcription feature has no root wireframe slot. Register your wireframe on a mode-specific tag: `<velt-transcription-floating-mode-wireframe>` or `<velt-transcription-embed-mode-wireframe>` (`VeltTranscriptionWireframe.FloatingMode` / `.EmbedMode` in React).

#### Transcription config — key variables

State on `<velt-transcription>` and children. Bind via `componentConfig.<name>`:

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.mode` | `'floating' \| 'sidebar' \| 'embed'` | Layout mode — pair with `velt-class="'mode-{componentConfig.mode}': true"`. |
| `componentConfig.transcription` | `Transcription` | Transcript object — bind `componentConfig.transcription.summary`. |
| `componentConfig.transcriptionVisible` | `boolean` | Transcript panel is open. |
| `componentConfig.vttFileTextArray` | `{ startTime, endTime, startTimeInSeconds, endTimeInSeconds, text }[]` | Parsed VTT segments. |
| `componentConfig.highlightedTextIndex` | `number` | Currently-playing segment index (`-1` when none). |
| `componentConfig.showMoreSummary` | `boolean` | Summary expanded state. |
| `componentConfig.copySummaryButtonTooltip` | `string` | "Copy" / "Copied!" tooltip text. |
| `componentConfig.sidebarVisible` | `boolean` | Sidebar variant visible. |
| `componentConfig.darkMode` | `boolean` | Dark mode active. |
| `componentConfig.showDefaultBtn` | `boolean` | Whether to render the default trigger button. |

#### Transcription behaviour callbacks

Attach these to your custom buttons rather than re-implementing seek / copy / toggle state. Each is exposed on `componentConfig.<name>` and is safe to invoke from a custom click handler.

| Callback | Signature | Notes |
|---|---|---|
| `componentConfig.copyToClipboard` | `() => void` | Copies the transcript summary to the clipboard. Pair with `componentConfig.copySummaryButtonTooltip` for the "Copy" / "Copied!" label. |
| `componentConfig.onClose` | `() => void` | Closes the transcript panel. Wire to your custom close button instead of toggling `transcriptionVisible` manually. |
| `componentConfig.onDragRelease` | `(...args) => void` | Drag-to-position release handler for floating-mode transcripts. Wire to your draggable handle's release / pointerup event. |
| `componentConfig.onSeekTo` | `(seconds: number) => void` | Seeks the host player to a given timestamp. Call with `segment.startTimeInSeconds` from a click handler on a `<velt-transcription-content-item-wireframe>` row. |
| `componentConfig.onTranscriptionButtonClick` | `() => void` | Trigger-button click handler. Wire to your custom trigger button instead of toggling `transcriptionVisible`. |
| `componentConfig.toggleShowMoreSummary` | `() => void` | Expands / collapses the summary. Pair with `componentConfig.showMoreSummary` for the expanded state. |
| `componentConfig.toggleSidebar` | `() => void` | Toggles the sidebar variant on / off. Pair with `componentConfig.sidebarVisible`. |

#### Subtitles / Subtitles-Dialog config

State on `<velt-subtitles>` and `<velt-subtitles-dialog>` (the dialog adds CDK-overlay positioning fields):

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.subtitlesVisible` | `boolean` | Subtitles panel visible. |
| `componentConfig.dialogVisible` | `boolean` | Dialog variant visible. |
| `componentConfig.highlightedTextIndex` | `number` | Active segment index. |
| `componentConfig.vttFileTextArray` | `Segment[]` | Same shape as transcription. |
| `componentConfig.transcription` | `Transcription` | Transcript object. |
| `componentConfig.showDefaultBtn` | `boolean` | Render the default toggle button. |
| `componentConfig.onSubtitlesButtonClick` | `Function` | Subtitle-button click handler — wire to your custom button. |

#### Subtitles-Dialog CDK overlay positioning

Dialog-only — these back the popover variant's CDK overlay. Treat as **internal positioning state**: bind only if you are replacing the default popover anchor / offset behaviour. The default render handles them automatically.

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.overlayTrigger` | `CdkOverlayOrigin` | CDK overlay anchor element. Used as the `cdkOverlayOrigin` on the popover. |
| `componentConfig.positions` | `ConnectedPosition[]` | CDK overlay position pairs (e.g., `start`/`bottom`, `end`/`top` fallbacks). Bind to `cdkConnectedOverlayPositions`. |
| `componentConfig.overlayOriginX` | `OverlayOriginX` | Anchor origin X-axis discriminator (`start` / `center` / `end`). |
| `componentConfig.overlayOriginY` | `OverlayOriginY` | Anchor origin Y-axis discriminator (`top` / `center` / `bottom`). |
| `componentConfig.cdkConnectedOverlayOffsetX` | `number` | Horizontal nudge offset, in pixels. Used to compute the popover's inline X offset. |
| `componentConfig.cdkConnectedOverlayOffsetY` | `number` | Vertical nudge offset, in pixels. Used to compute the popover's inline Y offset. |

#### Context-specific variables (only inside `<velt-transcription-content-item-wireframe>`)

| Variable | Type | Notes |
|---|---|---|
| `segment` | `{ startTime, endTime, startTimeInSeconds, endTimeInSeconds, text }` | Per-iteration row from `vttFileTextArray`. |
| `currentTime` | `number` | Current playback time — compare to `segment.startTimeInSeconds` / `endTimeInSeconds` for active styling. |

#### Wireframe tag families

**Transcription:** no root slot; start from `-floating-mode-wireframe` or `-embed-mode-wireframe`, then `-button-wireframe`, `-tooltip-wireframe`, `-panel-wireframe`, `-panel-container-wireframe`, `-content-item-wireframe` (iterates `vttFileTextArray`; injects `segment` / `currentTime`), `-summary-wireframe` (+ `-expand-toggle-wireframe` / `-on-wireframe` / `-off-wireframe`), `-copy-link-wireframe` (+ `-button-wireframe` / `-tooltip-wireframe`), `-close-button-wireframe`.

**Subtitles:** `<velt-subtitles-wireframe>` (root), `-button-wireframe`, `-tooltip-wireframe`, `-panel-wireframe`, `-close-button-wireframe`, `-floating-mode-wireframe`, `-embed-mode-wireframe`, plus `<velt-subtitles-dialog-wireframe>` (popover variant gated on `dialogVisible`).

#### Common mistakes — DO NOT

**1. DO NOT use the short `{var}` form here.** Transcription / subtitles wireframes use explicit `componentConfig.<name>` paths. Unlike the recorder root, the short form is not aliased on these primitives.

**2. DO NOT confuse `transcriptionVisible` with `subtitlesVisible`.** They gate different panels — transcription is the full transcript with summary; subtitles is the live overlay during playback. Bind each to its own panel/button.

**3. DO NOT iterate `vttFileTextArray` manually inside `<velt-transcription-panel-wireframe>`.** Use `<velt-transcription-content-item-wireframe>` — it iterates and injects `segment` + `currentTime` for active-segment styling. Outside that iterator, `segment` and `currentTime` are not resolvable.

**4. DO NOT rebuild seek / copy / toggle logic.** Wire `onSeekTo(seconds)` (transcript timestamp click), `copyToClipboard` (summary copy), `toggleShowMoreSummary`, `toggleSidebar`, and `onSubtitlesButtonClick` to your custom buttons rather than re-implementing them.

**Verification:**
- [ ] Transcription wireframes are registered on a mode tag (floating or embed), inside `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] Transcription / subtitles slots use explicit `componentConfig.<name>` paths (not the short `{name}` form)
- [ ] Per-segment rendering happens inside `<velt-transcription-content-item-wireframe>` so `segment` / `currentTime` are resolvable
- [ ] Active-segment styling compares `{segment.startTimeInSeconds} <= {currentTime} && {segment.endTimeInSeconds} > {currentTime}` (not `highlightedTextIndex` equality alone — that's the indexed-cursor variant)
- [ ] Summary expand / collapse gates on `{componentConfig.showMoreSummary}` and wires `toggleShowMoreSummary` to the toggle
- [ ] Custom transcript / subtitle buttons call `onTranscriptionButtonClick` / `onSubtitlesButtonClick` rather than re-implementing open/close state
- [ ] Subtitles-dialog popover gates on `{componentConfig.dialogVisible}`; CDK overlay positioning fields are left to the default render

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/recorder/transcription-wireframe-variables — "Transcription Wireframe Variables" (full per-slot reference)
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `wireframe-variables/wireframe-variables-recorder.md` (parent recorder player exposes a subset of these variables on `recorder-player-transcription-wireframe` / `recorder-player-subtitles-wireframe`), `ui/ui-ai-transcription.md` (enabling transcription on a recording)

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/recorder/overview
- https://docs.velt.dev/async-collaboration/recorder/setup
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior
- https://console.velt.dev
- https://docs.velt.dev/ui-customization/features/async/recorder/wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/recorder/transcription-wireframe-variables
- https://docs.velt.dev/webhooks/advanced
- https://docs.velt.dev/api-reference/rest-apis/v2/recordings/get-recordings
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle
- https://docs.velt.dev/ui-customization/features/async/recorder/recorder-tool
