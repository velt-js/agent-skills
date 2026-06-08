---
title: Live State Data Models and TypeScript Types
impact: MEDIUM
tags: LiveStateData, LiveStateDataMap, SetLiveStateDataConfig, types, TypeScript
---

## Live State Data Models

Reference types for Live State Sync data structures. Use these for type safety when working with the element API or raw data.

### LiveStateData

The core data envelope returned by subscriptions and fetches:

```typescript
interface LiveStateData {
  id: string;                              // MD5 hash of liveStateDataId
  liveStateDataId: string;                 // Your unique identifier string
  data: string | number | boolean | JSON;  // The actual synced data
  lastUpdated: any;                        // Server timestamp of last update
  updatedBy: User;                         // User who last updated this data
  tabId?: string | null;                   // Browser tab identifier (if applicable)
}
```

### LiveStateDataMap

Returned by `fetchLiveStateData()` when called without arguments:

```typescript
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
```

- `custom` contains your application data (keyed by `liveStateDataId`)
- `default` contains Velt internal state (single editor mode, auto-sync)

### Config Types

```typescript
interface SetLiveStateDataConfig {
  merge?: boolean;  // Default: false — merge with existing data instead of replacing
}

interface FetchLiveStateDataRequest {
  liveStateDataId?: string;  // Omit to fetch all live state data
}
```

### Key Points

- `LiveStateData.data` can be any serializable type — keep structures flat for best performance
- `updatedBy` contains the full Velt `User` object of whoever last wrote this state
- When fetching all data, your custom state lives under `LiveStateDataMap.custom`
- The `id` field is an MD5 hash generated from `liveStateDataId` — use `liveStateDataId` for lookups, not `id`
