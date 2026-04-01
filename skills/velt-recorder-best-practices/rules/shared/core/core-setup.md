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

**Correct (all components with floating playback and pinned notes):**

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  VeltRecorderTool,
  VeltRecorderControlPanel,
  VeltRecorderPlayer,
  VeltRecorderNotes,
  useRecorderAddHandler,
} from "@veltdev/react";

// Add these to your collaboration component alongside comments, presence, etc.

// 1. Recorder tool button — place in your toolbar
<VeltRecorderTool type="all" />

// 2. Floating control panel — manages active recording state
<VeltRecorderControlPanel mode="floating" />

// 3. Pinned recordings — appear where they were created on the page (like comment pins)
<VeltRecorderNotes />

// 4. Floating playback — shows latest recording in bottom-left corner
<RecordingPlayback />
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

**Verification:**
- [ ] VeltRecorderTool renders in toolbar and is clickable
- [ ] VeltRecorderControlPanel appears as floating panel when recording starts
- [ ] VeltRecorderNotes pins recordings to page locations
- [ ] Recording completion triggers RecordingPlayback in bottom-left
- [ ] VeltRecorderPlayer plays back the recording using recorderId
- [ ] Close button dismisses the playback widget
- [ ] All components are within VeltProvider

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/setup - Add Velt Recorder Tool, Add Velt Recorder Control Panel, Render Velt Recorder Player
