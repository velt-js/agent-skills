---
title: Add VeltRecorderTool, ControlPanel, and Player Components
impact: CRITICAL
impactDescription: Required for recorder to function
tags: recorder, setup, VeltRecorderTool, VeltRecorderControlPanel, VeltRecorderPlayer, VeltRecorderNotes
---

## Add VeltRecorderTool, ControlPanel, and Player Components

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

```html
<!-- Step 1: Tool to initiate recordings -->
<velt-recorder-tool type="all"></velt-recorder-tool>

<!-- Step 2: Control panel to manage active recording -->
<velt-recorder-control-panel mode="thread"></velt-recorder-control-panel>

<!-- Step 3: Player for playback (set recorderId dynamically) -->
<velt-recorder-player recorderId="RECORDER_ID"></velt-recorder-player>
```

**Optional: VeltRecorderNotes** pins recordings to specific screen locations:

```jsx
import { VeltRecorderNotes } from '@veltdev/react';

// Add alongside other recorder components for location-pinned recordings
<VeltRecorderNotes />
```

**Verification:**
- [ ] VeltRecorderTool renders and is clickable
- [ ] VeltRecorderControlPanel appears when recording starts
- [ ] Recording completion event provides recorderId
- [ ] VeltRecorderPlayer plays back the recording using recorderId
- [ ] All components are within VeltProvider

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/setup - Add Velt Recorder Tool, Add Velt Recorder Control Panel, Render Velt Recorder Player
