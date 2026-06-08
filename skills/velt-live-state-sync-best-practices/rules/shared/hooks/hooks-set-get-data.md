---
title: useSetLiveStateData and useLiveStateData Hooks
impact: CRITICAL
tags: useSetLiveStateData, useLiveStateData, merge, listenToNewChangesOnly
---

## useSetLiveStateData and useLiveStateData Hooks

These hooks separate reading and writing live state. Use them when you need merge updates, listen-to-new-changes-only, or when different components read vs. write.

### Writing: useSetLiveStateData

```tsx
import { useSetLiveStateData } from '@veltdev/react';

function ThemeSelector() {
  // Syncs the value to all clients whenever it changes
  useSetLiveStateData('editor-theme', { mode: 'dark', fontSize: 14 });

  // With merge — updates only the keys you pass, preserving the rest
  useSetLiveStateData('editor-theme', { fontSize: 16 }, { merge: true });
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `liveStateDataId` | `string` | Unique identifier |
| `liveStateData` | `any` | Serializable data to sync |
| `config.merge` | `boolean` | Merge with existing data instead of replacing (default: false) |

### Reading: useLiveStateData

```tsx
import { useLiveStateData } from '@veltdev/react';

function ThemeDisplay() {
  const theme = useLiveStateData('editor-theme');
  // theme updates reactively as any client changes it

  return <div>Current theme: {theme?.mode}</div>;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `liveStateDataId` | `string` | ID to subscribe to |
| `config.listenToNewChangesOnly` | `boolean` | Only receive changes after subscribing (default: false) |

### When to Use These vs useLiveState

- Use `useLiveState` when a single component both reads and writes (simpler API)
- Use `useSetLiveStateData`/`useLiveStateData` when:
  - One component writes, another reads
  - You need `merge: true` to partially update objects
  - You want `listenToNewChangesOnly` on the reader side
