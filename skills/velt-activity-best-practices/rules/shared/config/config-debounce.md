---
title: Configure CRDT Activity Debounce Time
impact: MEDIUM
impactDescription: Tune how CRDT keystrokes are grouped into activity records; values under the 10-second minimum are ignored
tags: debounce, crdt, setActivityDebounceTime, useCrdtUtils, batching, edits, noise
---

## Configure CRDT Activity Debounce Time

CRDT editor keystrokes are batched into a single activity record per debounce window. The default window is 10 minutes, which can make a document timeline too coarse. Use `setActivityDebounceTime()` on the CRDT element to pick a window that matches your timeline. The minimum is 10 seconds (10,000 ms).

**Incorrect (calling it on the wrong element, and below the minimum):**

```jsx
const activityElement = client.getActivityElement();
// ActivityElement has no setActivityDebounceTime method
activityElement.setActivityDebounceTime(5000);

const crdtElement = client.getCrdtElement();
// 5000 ms is below the 10,000 ms minimum
crdtElement.setActivityDebounceTime(5000);
```

**Correct (React / Next.js):**

```jsx
import { useEffect } from 'react';
import { useVeltClient } from '@veltdev/react';

function EditorSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // One activity record per 30-second editing window
    const crdtElement = client.getCrdtElement();
    crdtElement.setActivityDebounceTime(30000);
  }, [client]);

  return <YourEditor />;
}

// Hook alternative: useCrdtUtils() exposes the same method
// const crdtUtils = useCrdtUtils();
// crdtUtils?.setActivityDebounceTime(30000);
```

**Correct (Other Frameworks):**

```js
const crdtElement = Velt.getCrdtElement();
crdtElement.setActivityDebounceTime(30000); // 30 seconds
```

**Key details:**
- Parameter is in **milliseconds**
- **Default: 10 minutes (600,000 ms)**
- **Minimum: 10 seconds (10,000 ms)**. The overview page's `setActivityDebounceTime(5000)` example is below this minimum; use 10,000 ms or more
- Called on the **CRDT element** (`getCrdtElement()` / `useCrdtUtils()`), not the activity element
- All edits within the window are flushed as one activity record (`featureType: 'crdt'`, action `crdt.editor_edit`)
- Lower values give more granular records; higher values give less noise

**Verification:**
- [ ] `setActivityDebounceTime()` called on the CRDT element
- [ ] Value is at least 10,000 ms
- [ ] Activity feed shows batched CRDT entries at the expected cadence

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setactivitydebouncetime - "setActivityDebounceTime()" (default 10 minutes, minimum 10 seconds)
- https://docs.velt.dev/async-collaboration/activity/overview#automatic-activity-logging - "Automatic Activity Logging"
