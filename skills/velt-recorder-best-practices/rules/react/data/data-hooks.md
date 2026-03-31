---
title: Use React Hooks for Reactive Recording Data
impact: HIGH
impactDescription: Real-time access to recording data and completion events in React components
tags: hooks, useRecordings, useRecorderAddHandler, useRecorderUtils, react
---

## Use React Hooks for Reactive Recording Data

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
