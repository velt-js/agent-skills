---
title: Fetch or Subscribe to Recording Data via API
impact: HIGH
impactDescription: Access recording data from non-React contexts or with granular control
tags: fetchRecordings, getRecordings, subscribe, observable, recorderIds
---

## Fetch or Subscribe to Recording Data via API

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
