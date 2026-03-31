---
title: Configure Recording Quality Constraints and Encoding Options
impact: MEDIUM-HIGH
impactDescription: Controls recording fidelity, file size, and browser compatibility
tags: quality, encoding, constraints, resolution, frameRate, bitrate, safari, browser, setRecordingQualityConstraints, setRecordingEncodingOptions
---

## Configure Recording Quality Constraints and Encoding Options

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
