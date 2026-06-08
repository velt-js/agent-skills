---
title: Element API — setLiveStateData and getLiveStateData
impact: HIGH
tags: useLiveStateSyncUtils, setLiveStateData, getLiveStateData, subscribe, observable, unsubscribe
---

## Element API — setLiveStateData and getLiveStateData

`useLiveStateSyncUtils()` returns the `LiveStateSyncElement` object for imperative control. Use this when you need observable subscriptions, non-React frameworks, or want to call set/get from event handlers or effects.

### Getting the Element

```tsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function MyComponent() {
  const liveStateSyncElement = useLiveStateSyncUtils();
  // use liveStateSyncElement.setLiveStateData(), .getLiveStateData(), etc.
}
```

For non-React frameworks:
```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();
```

### Writing Data

```tsx
// Replace entirely
liveStateSyncElement.setLiveStateData('cursor-position', { x: 100, y: 200 });

// Merge with existing data (only updates keys you pass)
liveStateSyncElement.setLiveStateData('settings', { fontSize: 16 }, { merge: true });
```

### Reading Data (Observable)

`getLiveStateData` returns an **observable** — you must subscribe and unsubscribe.

```tsx
useEffect(() => {
  const subscription = liveStateSyncElement
    .getLiveStateData('cursor-position', { listenToNewChangesOnly: true })
    .subscribe((data) => {
      setCursor(data);
    });

  return () => subscription?.unsubscribe();
}, [liveStateSyncElement]);
```

### Key Points

- Always clean up subscriptions in the useEffect return (or component unmount equivalent)
- `getLiveStateData` is reactive (observable stream); for a one-shot read, use `fetchLiveStateData` instead (see `element-fetch`)
- The `{ merge: true }` config on `setLiveStateData` is useful for partial updates to objects without overwriting other keys
- `{ listenToNewChangesOnly: true }` on `getLiveStateData` skips the initial server state and only fires on new changes
