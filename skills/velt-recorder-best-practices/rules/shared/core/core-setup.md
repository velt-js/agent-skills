---
title: Add VeltRecorderTool, ControlPanel, Player, and Notes Components
impact: CRITICAL
impactDescription: Required for recorder to function with full playback support
tags: recorder, setup, VeltRecorderTool, VeltRecorderControlPanel, VeltRecorderPlayer, VeltRecorderNotes, useRecorderAddHandler
---

## Add VeltRecorderTool, ControlPanel, Player, and Notes Components

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
