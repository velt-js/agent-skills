---
title: Write and subscribe with setLiveStateData and getLiveStateData
impact: HIGH
impactDescription: getLiveStateData returns an observable; forgetting to unsubscribe leaks handlers, and omitting merge overwrites other keys
tags: useLiveStateSyncUtils, getLiveStateSyncElement, setLiveStateData, getLiveStateData, merge, listenToNewChangesOnly, subscribe, unsubscribe
---

## Write and subscribe with setLiveStateData and getLiveStateData

The `LiveStateSyncElement` gives imperative control: `setLiveStateData(liveStateDataId, liveStateData, config?)` writes any serializable value, and `getLiveStateData(liveStateDataId, config?)` returns an **observable** you subscribe to. Get the element with `useLiveStateSyncUtils()` (or `client.getLiveStateSyncElement()`) in React and `Velt.getLiveStateSyncElement()` elsewhere.

**Incorrect (subscription never released, partial update overwrites the object):**

```jsx
useEffect(() => {
  liveStateSyncElement.getLiveStateData('settings').subscribe(setSettings); // BUG: no unsubscribe
}, []);

// BUG: replaces the whole 'settings' object, dropping every other key
liveStateSyncElement.setLiveStateData('settings', { fontSize: 16 });
```

**Correct (React / Next.js):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';
import { useEffect, useState } from 'react';

function Settings() {
  const liveStateSyncElement = useLiveStateSyncUtils();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!liveStateSyncElement) return;
    const subscription = liveStateSyncElement
      .getLiveStateData('settings', { listenToNewChangesOnly: false })
      .subscribe((data) => setSettings(data));
    return () => subscription?.unsubscribe();
  }, [liveStateSyncElement]);

  const bumpFont = () =>
    liveStateSyncElement.setLiveStateData('settings', { fontSize: 16 }, { merge: true });

  return <button onClick={bumpFont}>Font: {settings?.fontSize}</button>;
}
```

**Correct (Other Frameworks):**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.setLiveStateData('settings', { fontSize: 16 }, { merge: true });

const subscription = liveStateSyncElement
  .getLiveStateData('settings')
  .subscribe((data) => render(data));

// When done:
subscription?.unsubscribe();
```

`listenToNewChangesOnly: true` skips existing data and only emits changes made after you subscribe (default `false`). For a one-shot read use `fetchLiveStateData()` (see `element-fetch`).

**Verification Checklist:**
- [ ] Every `getLiveStateData(...).subscribe()` has a matching `unsubscribe()`
- [ ] Partial object updates pass `{ merge: true }`
- [ ] React code reads the element from `useLiveStateSyncUtils()` or `client.getLiveStateSyncElement()`; other frameworks use `Velt.getLiveStateSyncElement()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup#set-live-data — "Set Live Data"
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup#get-live-data — "Get Live Data"
- https://docs.velt.dev/api-reference/sdk/models/data-models#setlivestatedataconfig — `SetLiveStateDataConfig`
