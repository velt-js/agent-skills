---
title: Type live state with LiveStateData, LiveStateDataMap, and config types
impact: MEDIUM
impactDescription: Fetching all data returns a map with your entries under custom; looking up by id instead of liveStateDataId finds nothing
tags: LiveStateData, LiveStateDataMap, SetLiveStateDataConfig, FetchLiveStateDataRequest, ServerConnectionState, types, TypeScript
---

## Type live state with LiveStateData, LiveStateDataMap, and config types

`fetchLiveStateData()` with no request returns a `LiveStateDataMap`. Your application entries live under `custom`, keyed by `liveStateDataId`; `default` holds Velt-internal state (single editor mode, auto-sync).

**Incorrect (reads the map root and keys by the MD5 id):**

```typescript
const all = await liveStateSyncElement.fetchLiveStateData();
const theme = all['editor-theme'];            // BUG: app data lives under all.custom
const byHash = all.custom?.[entry.id];        // BUG: id is an MD5 hash; key by liveStateDataId
```

**Correct:**

```typescript
const all = await liveStateSyncElement.fetchLiveStateData();
const themeEntry = all.custom?.['editor-theme'];
const theme = themeEntry?.data;
const lastEditor = themeEntry?.updatedBy?.name;
```

```typescript
interface LiveStateData {
  id: string;                              // MD5 hash of liveStateDataId
  liveStateDataId: string;
  data: string | number | boolean | JSON;
  lastUpdated: any;
  updatedBy: User;
  tabId?: string | null;
}

interface LiveStateDataMap {
  custom?: { [liveStateDataId: string]: LiveStateData };
  default?: {
    singleEditor?: SingleEditorLiveStateData;
    autoSyncState?: {
      current?: LiveStateData;
      history?: { [liveStateDataId: string]: LiveStateData };
    };
  };
}

interface SetLiveStateDataConfig { merge?: boolean }              // default false
interface FetchLiveStateDataRequest { liveStateDataId?: string }  // omit for all data
type ServerConnectionState = 'online' | 'offline' | 'pendingInit' | 'pendingData';
```

**Verification Checklist:**
- [ ] App data is read from `LiveStateDataMap.custom`
- [ ] Lookups use `liveStateDataId`, not `id`
- [ ] `updatedBy` is treated as a full Velt `User`

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#livestatedata — `LiveStateData`
- https://docs.velt.dev/api-reference/sdk/models/data-models#livestatedatamap — `LiveStateDataMap`
- https://docs.velt.dev/api-reference/sdk/models/data-models#fetchlivestatedatarequest — `FetchLiveStateDataRequest`
