---
title: Debug Common Recorder Issues
impact: LOW-MEDIUM
impactDescription: Quick troubleshooting for frequent recorder integration problems
tags: debugging, troubleshooting, common issues, recorder, VeltProvider
---

## Debug Common Recorder Issues

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

**Verification:**
- [ ] All recorder components are within VeltProvider
- [ ] Device permissions granted before recording
- [ ] recorderId is set from recording completion event, not hardcoded
- [ ] PiP constraints understood (Chrome + screen + camera)
- [ ] Video editor explicitly enabled for video/screen recordings
- [ ] Browser-specific keys used for quality/encoding settings

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/setup; https://docs.velt.dev/async-collaboration/recorder/customize-behavior
