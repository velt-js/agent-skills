---
title: Split reads and writes with useSetLiveStateData and useLiveStateData
impact: CRITICAL
impactDescription: Separate writer and reader hooks support merge updates and listenToNewChangesOnly; using useLiveState everywhere couples components and overwrites whole objects
tags: useSetLiveStateData, useLiveStateData, merge, listenToNewChangesOnly, SetLiveStateDataConfig
---

## Split reads and writes with useSetLiveStateData and useLiveStateData

`useSetLiveStateData(liveStateDataId, liveStateData, config?)` syncs a value to every client; `config.merge: true` merges into the existing object instead of replacing it. `useLiveStateData(liveStateDataId, config?)` returns the current value reactively; `config.listenToNewChangesOnly: true` only delivers changes made after subscribing. Use these when one component writes and another reads, or when you need merge semantics.

**Incorrect (replaces the whole object from two writers):**

```jsx
// Component A
useSetLiveStateData('editor-theme', { mode: 'dark' });
// Component B
useSetLiveStateData('editor-theme', { fontSize: 16 });
// BUG: each write replaces the object, so 'mode' and 'fontSize' overwrite each other
```

**Correct (React / Next.js):**

```jsx
import { useSetLiveStateData, useLiveStateData } from '@veltdev/react';

function FontSizeWriter({ fontSize }) {
  useSetLiveStateData('editor-theme', { fontSize }, { merge: true });
  return null;
}

function ThemeDisplay() {
  const theme = useLiveStateData('editor-theme');
  return <div>Mode: {theme?.mode} / Font: {theme?.fontSize}</div>;
}
```

**Other Frameworks:** use `setLiveStateData(id, data, { merge: true })` and `getLiveStateData(id, config).subscribe(...)` on `Velt.getLiveStateSyncElement()` (see `element-get-set`).

**Verification Checklist:**
- [ ] Multiple writers to one object pass `{ merge: true }`
- [ ] Readers null-guard the returned value
- [ ] `listenToNewChangesOnly` is set only when existing data should be ignored

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup#set-live-data — "Set Live Data"
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup#get-live-data — "Get Live Data"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesetlivestatedata — `useSetLiveStateData()` / `useLiveStateData()`
