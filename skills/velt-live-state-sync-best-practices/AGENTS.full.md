# Velt Live State Sync Best Practices — Full Reference

> IMPORTANT: Authentication MUST use the `authProvider` callback on `<VeltProvider>`:
> ```jsx
> <VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
> ```
> The `useIdentify` hook and `client.identify()` are **deprecated and must never be used**.

---

## Use authProvider for Authentication

When setting up Velt Live State Sync, authentication must use the `authProvider` callback on `VeltProvider`. The deprecated `useIdentify` hook and `client.identify()` method must never be used.

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  const authProvider = async ({ veltUser }) => {
    const user = await getAuthenticatedUser();
    veltUser({
      userId: user.uid,
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
      organizationId: 'your-org-id',
    });
  };

  return (
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
      <YourApp />
    </VeltProvider>
  );
}
```

The `authProvider` pattern is the only supported authentication method — `useIdentify` is deprecated and will be removed.

### Always Include VeltProvider Setup

Every Live State Sync implementation must include the `VeltProvider` wrapper with `authProvider` in the output — even when the primary task is about store setup, middleware configuration, or component logic. Without `VeltProvider`, none of the Live State Sync APIs will function. Always show the full App component with `VeltProvider` and `authProvider` as part of your implementation.

---

## Live State Sync Feature Overview

Velt Live State Sync provides real-time shared state across clients with extremely low latency (≤10ms typical), optimistic local-first reads/writes, full offline support, and automatic sync on reconnect. Conflict resolution uses server-timestamp last-write-wins. Data persists indefinitely until manually removed — there is no automatic cleanup.

### Choosing the Right API

Velt offers three tiers of Live State Sync API. Pick the simplest one that fits your use case:

| API | When to Use | Import |
|-----|-------------|--------|
| `useLiveState` hook | Simple shared state (counters, toggles, selections) — works like `useState` | `import { useLiveState } from '@veltdev/react'` |
| `useSetLiveStateData` / `useLiveStateData` hooks | Separate read/write concerns, merge updates, or listen-to-new-changes-only | `@veltdev/react` (auto-available inside VeltProvider) |
| `useLiveStateSyncUtils()` element API | Observable subscriptions, promise-based fetch, non-React frameworks, or advanced control | `@veltdev/react` or `Velt.getLiveStateSyncElement()` |
| Redux middleware | Sync an entire Redux store (or filtered slices) across clients | `import { createLiveStateMiddleware } from '@veltdev/react'` |

For most React use cases, start with `useLiveState`. Escalate to the element API or Redux middleware only when you need observable subscriptions, one-shot fetches, or full store sync.

### Prerequisites

- `VeltProvider` with `authProvider` must wrap your app (see `core-auth-provider`)
- A `documentId` should be set to scope shared state to a specific document/room
- No additional packages beyond `@veltdev/react` are needed

### Key Characteristics

- **Persistence**: Data persists indefinitely until you manually remove it — plan for cleanup
- **Conflict resolution**: Last-write-wins based on server timestamps
- **Offline**: Reads work from local cache; writes queue and sync on reconnect
- **Latency**: Optimistic local-first — UI updates immediately, server confirms async

---

## useLiveState Hook

`useLiveState` is the simplest API for shared state — it works like React's `useState` but syncs across all clients viewing the same document.

```tsx
import { useLiveState } from '@veltdev/react';

function Counter() {
  const [counter, setCounter, serverConnectionState] = useLiveState<number>(
    'counter',
    0,
    { syncDuration: 100 }
  );

  return (
    <div>
      <button onClick={() => setCounter((counter || 0) - 1)}>-</button>
      <span>Counter: {counter}</span>
      <button onClick={() => setCounter((counter || 0) + 1)}>+</button>
    </div>
  );
}
```

### Signature

```typescript
const [value, setValue, connectionState] = useLiveState<T>(id, initialValue, options?)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Unique identifier — all clients with same `id` share this state |
| `initialValue` | `T` | Initial value before server data arrives |
| `options.syncDuration` | `number` | Debounce delay in ms before syncing to server (default: 50ms) |
| `options.resetLiveState` | `boolean` | Reset server state to `initialValue` on init (default: false) |
| `options.listenToNewChangesOnly` | `boolean` | Only receive changes made after subscribing (default: false) |

### Return Tuple

| Index | Type | Description |
|-------|------|-------------|
| `[0]` value | `T` | Current state value (updates reactively) |
| `[1]` setValue | `(value: T) => void` | Setter — updates local state immediately, syncs after `syncDuration` |
| `[2]` connectionState | `ServerConnectionState` | `'online'` \| `'offline'` \| `'pendingInit'` \| `'pendingData'` |

### Key Points

- The `id` string scopes the state — use meaningful names like `'editor-theme'` or `'selected-row'`
- `syncDuration` controls the debounce: lower = more responsive but more network traffic; higher = batches rapid changes
- Guard against null: use `(counter || 0)` since the value can be `null` before server data arrives
- `resetLiveState: true` clears any previously persisted value — use only when you intentionally want a fresh start

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

---

## Monitor Server Connection State

`useServerConnectionStateChangeHandler` returns the current connection status as a reactive value. Use it to show connectivity indicators or disable inputs while offline.

```tsx
function ConnectionBadge() {
  const connectionState = useServerConnectionStateChangeHandler();

  return <span className={`badge badge-${connectionState}`}>{connectionState}</span>;
}
```

### ServerConnectionState Values

| Value | Meaning |
|-------|---------|
| `'online'` | Connected to Velt servers — reads and writes are live |
| `'offline'` | Disconnected — reads use local cache, writes queue for sync |
| `'pendingInit'` | SDK is initializing |
| `'pendingData'` | Connected but waiting for initial data from server |

### Key Points

- The hook is reactive — it re-renders your component whenever the state changes
- During `'offline'`, live state still works locally (optimistic reads/writes) but changes won't reach other clients until reconnection
- For the observable (non-hook) equivalent, use `liveStateSyncElement.onServerConnectionStateChange().subscribe()` (see element rules)

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

---

## Element API — onServerConnectionStateChange

The observable equivalent of `useServerConnectionStateChangeHandler`. Use when you need connection state in a non-React context or want manual subscription control.

```tsx
const liveStateSyncElement = useLiveStateSyncUtils();

useEffect(() => {
  const subscription = liveStateSyncElement
    .onServerConnectionStateChange()
    .subscribe((state) => {
      console.log('Connection state:', state);
      // state is 'online' | 'offline' | 'pendingInit' | 'pendingData'
    });

  return () => subscription?.unsubscribe();
}, [liveStateSyncElement]);
```

### Key Points

- Returns an observable — subscribe and clean up on unmount
- Emits the same `ServerConnectionState` values as the hook: `'online'`, `'offline'`, `'pendingInit'`, `'pendingData'`
- For React components, prefer the `useServerConnectionStateChangeHandler` hook (simpler, no manual subscription)
- Use this API for non-React frameworks or when composing with other observables

---

## Redux Middleware Setup

`createLiveStateMiddleware` syncs your Redux store across clients. Every dispatched action (that passes the filter) is broadcast to all connected clients, who replay it through their own reducers.

```tsx
import { createLiveStateMiddleware } from '@veltdev/react';
import { configureStore } from '@reduxjs/toolkit';

const { middleware, updateLiveStateDataId } = createLiveStateMiddleware({
  allowedActionTypes: new Set(['canvas/addShape', 'canvas/moveShape', 'canvas/deleteShape']),
  liveStateDataId: 'canvas-state',
});

export const store = configureStore({
  reducer: { canvas: canvasReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
});

export { updateLiveStateDataId };
```

### Configuration

```typescript
type LiveStateMiddlewareConfig = {
  allowedActionTypes?: Set<string>;       // Whitelist — only sync these action types
  disabledActionTypes?: Set<string>;      // Blacklist — sync everything except these
  allowAction?: (action: any) => boolean; // Dynamic filter callback
  liveStateDataId?: string;               // Scope key for the synced state (recommended)
};
```

### Action Filtering

You have three complementary filters — use the simplest one that fits:

1. **`allowedActionTypes`** (whitelist): Only actions with `type` in this Set are synced. Best when you have a small, known set of collaborative actions.
2. **`disabledActionTypes`** (blacklist): All actions sync except these. Best when most actions are collaborative but a few are local-only (e.g., UI state).
3. **`allowAction`** callback: Dynamic filter with full action access. Use for complex rules (e.g., only sync if payload meets a condition).

If none are provided, **all** dispatched actions are synced — this is rarely what you want. Always configure at least one filter to avoid syncing local-only UI state (like modal open/close, hover states).

### Key Points

- Set `liveStateDataId` upfront to scope the synced state — it can be changed later with `updateLiveStateDataId`
- The middleware wraps each action in `{ id, action: { type, payload }, timestamp }` before syncing (see `redux-action-structure`)
- Filters are evaluated locally before broadcast — non-matching actions dispatch normally but are not sent to other clients

---

## Dynamic liveStateDataId with updateLiveStateDataId

`updateLiveStateDataId` lets you switch the sync scope at runtime — for example, when a user navigates between documents or rooms.

```tsx
import { updateLiveStateDataId } from './store';

function DocumentView({ documentId }: { documentId: string }) {
  useEffect(() => {
    updateLiveStateDataId(`doc-${documentId}`);
  }, [documentId]);

  return <Editor />;
}
```

### How It Works

- `createLiveStateMiddleware` returns `{ middleware, updateLiveStateDataId }`
- Export `updateLiveStateDataId` from your store file
- Call it whenever the context changes (document switch, room change, etc.)
- All actions dispatched after the call use the new ID
- Actions already in flight use the old ID — there is no retroactive update

### Key Points

- Always set an initial `liveStateDataId` in the middleware config, then update dynamically — don't rely solely on dynamic updates
- The ID change takes effect immediately for new dispatches
- Other clients subscribed to the old ID stop receiving this client's actions; clients on the new ID start receiving them
- Common pattern: `doc-${documentId}` or `room-${roomId}` to scope state per document/room

---

## Redux Action Wire Format

The middleware automatically wraps dispatched Redux actions before syncing them. Understanding this format helps when debugging or building custom middleware on top.

### Wire Format

```json
{
  "id": "ACTION_ID",
  "action": {
    "type": "canvas/addShape",
    "payload": { "shapeId": "rect-1", "x": 100, "y": 200 }
  },
  "timestamp": 1759745729823
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Auto-generated unique action ID |
| `action.type` | `string` | Original Redux action type |
| `action.payload` | `any` | Original action payload (if present) |
| `timestamp` | `number` | UTC milliseconds — added automatically by the middleware |

### Key Points

- The timestamp is server-assigned for conflict resolution (last-write-wins) — do not set it manually
- Your reducers receive the original unwrapped `{ type, payload }` — the wrapping is transparent
- The `id` field ensures idempotent replay — the same action won't be applied twice even if delivered multiple times
- Use the `allowAction` callback if you need to inspect or filter based on the wrapped structure

---

## REST API — Broadcast Live State Data

Use the broadcast endpoint to set live state from your backend (e.g., server-driven updates, cron jobs, admin actions). This is the server-side equivalent of `setLiveStateData`.

### Endpoint

```
POST https://api.velt.dev/v1/livestate/broadcast
```

(Also available at `v2`: `POST https://api.velt.dev/v2/livestate/broadcast`)

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `x-velt-api-key` | Yes | Your Velt API key |
| `x-velt-auth-token` | Yes | Your Velt auth token |

### Request Body

```json
{
  "organizationId": "your-org-id",
  "documentId": "doc-123",
  "liveStateDataId": "editor-theme",
  "data": { "mode": "dark", "fontSize": 14 },
  "merge": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `organizationId` | `string` | Yes | Organization scope |
| `documentId` | `string` | Yes | Document scope |
| `liveStateDataId` | `string` | Yes | Live state data identifier |
| `data` | `any` | Yes | Serializable JSON data to broadcast |
| `merge` | `boolean` | No | Merge with existing data (default: false) |

### Key Points

- This endpoint writes to the same data store as the client-side hooks — clients subscribed to the same `liveStateDataId` receive the update in real time
- Use `merge: true` to update specific keys without overwriting the entire object
- The `organizationId` and `documentId` must match what the client-side `VeltProvider` and document setup use
- Both v1 and v2 endpoints accept the same parameters

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

---

## Best Practices and Gotchas

### Data Structure

- **Keep state flat**: Deeply nested objects are harder to merge and increase serialization overhead. Prefer `{ x: 100, y: 200 }` over `{ position: { coordinates: { x: 100, y: 200 } } }`
- **Use meaningful IDs**: `'cursor-position-editor'` is better than `'data-1'` — IDs are shared across all clients and appear in debug tools
- **Sync only what you need**: Don't put your entire component state into live state. Sync the collaborative parts (shared selections, cursors, tool modes) and keep local-only state (hover, focus, animation) in regular React state

### Performance

- **Tune `syncDuration`**: Default 50ms is good for most cases. For rapid input (typing, dragging), increase to 100-200ms to batch updates. For critical real-time state (cursor position), keep at 50ms or lower
- **Use `listenToNewChangesOnly`** when you don't need the initial server value — reduces the initial data payload and avoids stale-data flash
- **Use `merge: true`** for partial object updates instead of reading the full object, modifying locally, and writing back — avoids race conditions where two clients overwrite each other's changes

### Cleanup and Persistence — Data Persists Indefinitely

Live state data is **never automatically cleaned up** — it persists on Velt's servers indefinitely until you explicitly remove it. This is the most common gotcha with Live State Sync. Every implementation that creates temporary or session-scoped state (cursors, selections, typing indicators) must include cleanup logic:

- **Client-side cleanup on unmount**: In your useEffect cleanup, call `setLiveStateData` with `null` or empty data using `merge: true` to remove the leaving user's data
- **Server-side cleanup via cron**: Call the broadcast REST API with empty data on a schedule to clear stale entries
- **`resetLiveState: true`** on `useLiveState` clears persisted data on component mount — useful for ephemeral state that should start fresh each session, but be careful: if two clients mount simultaneously, they may reset each other's writes

```tsx
// Example: Clean up cursor data when user leaves
useEffect(() => {
  return () => {
    liveStateSyncElement.setLiveStateData('cursors', {
      [currentUser.userId]: null,
    }, { merge: true });
  };
}, [liveStateSyncElement, currentUser]);
```

Always mention this persistence behavior when implementing Live State Sync features, especially for ephemeral data like cursors, selections, or presence indicators.

### Subscription Cleanup

- **Always unsubscribe** from `getLiveStateData` and `onServerConnectionStateChange` observables in your cleanup function (useEffect return, componentWillUnmount, or framework equivalent)
- For React hooks (`useLiveState`, `useLiveStateData`, `useSetLiveStateData`), cleanup is automatic — no manual unsubscription needed

### Offline Behavior

- Reads work from local cache when offline — the UI stays responsive
- Writes queue locally and sync automatically when the connection is restored
- Use `useServerConnectionStateChangeHandler` or `onServerConnectionStateChange` to show a connectivity indicator so users know their changes aren't live yet

---

