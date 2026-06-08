---
title: fetchLiveStateData — Promise-Based One-Shot Read
impact: HIGH
tags: fetchLiveStateData, promise, one-shot, SSR, initialization
---

## fetchLiveStateData — Promise-Based One-Shot Read

`fetchLiveStateData` returns a **Promise** instead of an observable. Use it for one-time reads where you don't need ongoing updates — component initialization, server-side rendering, or conditional checks before acting.

```tsx
const liveStateSyncElement = useLiveStateSyncUtils();

// Fetch a specific live state value
const theme = await liveStateSyncElement.fetchLiveStateData({
  liveStateDataId: 'editor-theme',
});

// Fetch ALL live state data (omit the parameter)
const allData = await liveStateSyncElement.fetchLiveStateData();
```

### Signature

```typescript
fetchLiveStateData<T>(request?: { liveStateDataId: string }): Promise<T>
```

- With `{ liveStateDataId }` — returns the data for that specific ID
- Without arguments — returns all live state data as a `LiveStateDataMap`

### Use Cases

- **Component initialization**: Load current state once on mount, then switch to `getLiveStateData` subscription for updates
- **Pre-action check**: Read current state before performing a write to avoid conflicts
- **Server-side rendering**: Fetch state during SSR where subscriptions aren't appropriate
- **One-time data retrieval**: When you just need to read a value once without tracking changes

### Key Points

- This is a snapshot — it does NOT update reactively. For reactive updates, use `getLiveStateData().subscribe()` or the hooks
- Supports generic typing: `fetchLiveStateData<MyType>(...)` returns `Promise<MyType>`
- Omitting the request parameter returns the entire `LiveStateDataMap` including custom and default (single editor, auto-sync) data
