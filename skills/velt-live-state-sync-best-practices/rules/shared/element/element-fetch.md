---
title: Use fetchLiveStateData for one-shot reads
impact: HIGH
impactDescription: fetchLiveStateData returns a Promise snapshot; using it for live UI leaves the UI stale, and using an observable for a one-time check leaks a subscription
tags: fetchLiveStateData, FetchLiveStateDataRequest, LiveStateDataMap, promise, one-shot, initialization
---

## Use fetchLiveStateData for one-shot reads

`fetchLiveStateData(request?)` returns a **Promise** with the current value instead of an observable. Use it for initialization, conditional checks before a write, or any one-time read. Pass `{ liveStateDataId }` for one entry; omit the request to get all live state data for the document (a `LiveStateDataMap` with your entries under `custom`). It supports a generic type parameter.

**Incorrect (snapshot used as live UI):**

```jsx
const theme = await liveStateSyncElement.fetchLiveStateData({ liveStateDataId: 'editor-theme' });
setTheme(theme); // BUG: never updates when another client changes the theme
```

**Correct (React / Next.js):**

```jsx
// Hook form of the element
const liveStateSyncElement = useLiveStateSyncUtils();

// One entry
const theme = await liveStateSyncElement.fetchLiveStateData({ liveStateDataId: 'editor-theme' });

// Everything on the document
const all = await liveStateSyncElement.fetchLiveStateData();

// API method form
const element = client.getLiveStateSyncElement();
const sameTheme = await element.fetchLiveStateData({ liveStateDataId: 'editor-theme' });
```

**Correct (Other Frameworks):**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();
const theme = await liveStateSyncElement.fetchLiveStateData({ liveStateDataId: 'editor-theme' });
```

For values that must stay current, subscribe with `getLiveStateData()` or use the hooks.

**Verification Checklist:**
- [ ] `fetchLiveStateData` is used only for one-time reads
- [ ] Code that fetches everything reads app data from `LiveStateDataMap.custom`
- [ ] Reactive UI uses `getLiveStateData()` or the hooks

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup#fetch-live-data — "Fetch Live Data"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#fetchlivestatedata — `fetchLiveStateData()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#livestatedatamap — `LiveStateDataMap`
