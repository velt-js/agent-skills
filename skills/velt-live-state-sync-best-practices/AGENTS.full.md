# Velt Live State Sync Best Practices

**Version 1.0.1**  
undefined  
undefined

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

undefined

---

## Table of Contents

1. [Core](#1-core) — **CRITICAL**
   - 1.1 [Choose the right Live State Sync API and plan for persistence](#11-choose-the-right-live-state-sync-api-and-plan-for-persistence)
   - 1.2 [Wrap Live State Sync in VeltProvider with the authProvider object](#12-wrap-live-state-sync-in-veltprovider-with-the-authprovider-object)

2. [Hooks](#2-hooks) — **CRITICAL**
   - 2.1 [Show connection state with useServerConnectionStateChangeHandler](#21-show-connection-state-with-useserverconnectionstatechangehandler)
   - 2.2 [Split reads and writes with useSetLiveStateData and useLiveStateData](#22-split-reads-and-writes-with-usesetlivestatedata-and-uselivestatedata)
   - 2.3 [Use useLiveState for useState-like shared state](#23-use-uselivestate-for-usestate-like-shared-state)

3. [Element](#3-element) — **HIGH**
   - 3.1 [Observe connection state with onServerConnectionStateChange](#31-observe-connection-state-with-onserverconnectionstatechange)
   - 3.2 [Use fetchLiveStateData for one-shot reads](#32-use-fetchlivestatedata-for-one-shot-reads)
   - 3.3 [Write and subscribe with setLiveStateData and getLiveStateData](#33-write-and-subscribe-with-setlivestatedata-and-getlivestatedata)

4. [Redux](#4-redux) — **HIGH**
   - 4.1 [Switch the Redux sync scope with updateLiveStateDataId](#41-switch-the-redux-sync-scope-with-updatelivestatedataid)
   - 4.2 [Sync Redux actions with createLiveStateMiddleware and explicit filters](#42-sync-redux-actions-with-createlivestatemiddleware-and-explicit-filters)
   - 4.3 [Understand the synced Redux action shape and its timestamp](#43-understand-the-synced-redux-action-shape-and-its-timestamp)

5. [API](#5-api) — **MEDIUM**
   - 5.1 [Broadcast live state from your backend with the REST API or backend SDKs](#51-broadcast-live-state-from-your-backend-with-the-rest-api-or-backend-sdks)
   - 5.2 [Type live state with LiveStateData, LiveStateDataMap, and config types](#52-type-live-state-with-livestatedata-livestatedatamap-and-config-types)

6. [Patterns](#6-patterns) — **MEDIUM**
   - 6.1 [Keep live state small and flat, and clean up ephemeral data yourself](#61-keep-live-state-small-and-flat-and-clean-up-ephemeral-data-yourself)

---

## 1. Core

**Impact: CRITICAL**

`VeltProvider` with the `authProvider` object and a set document, choosing between `useLiveState`, the read/write hooks, the `LiveStateSyncElement`, Redux middleware, and server broadcast, plus the v6 `featureAllowList` key `'liveStateSync'`.

### 1.1 Choose the right Live State Sync API and plan for persistence

**Impact: CRITICAL (Picking the simplest API avoids manual subscription bugs; live state persists indefinitely, so ephemeral data needs explicit cleanup)**

Live State Sync shares data across every client on the same document with very low latency (typically no more than 10 ms), optimistic local-first reads and writes, offline support with sync on reconnect, and server-timestamp last-write-wins conflict resolution. Data persists indefinitely until you remove it.

**Incorrect (hand-rolled subscription for simple shared state):**

```jsx
// Works, but useLiveState already does this with automatic cleanup
const el = useLiveStateSyncUtils();
const [count, setCount] = useState(0);
useEffect(() => {
  const sub = el.getLiveStateData('counter').subscribe(setCount);
  return () => sub?.unsubscribe();
}, [el]);
```

**Correct (start with the simplest API):**

```jsx
import { useLiveState } from '@veltdev/react';

const [count, setCount] = useLiveState('counter', 0);
```

| API | Use when | Access |
|---|---|---|
| `useLiveState(id, initialValue, options?)` | One component reads and writes, like `useState` | `@veltdev/react` |
| `useSetLiveStateData` / `useLiveStateData` | Writer and reader are separate, or you need `merge` / `listenToNewChangesOnly` | `@veltdev/react` |
| `LiveStateSyncElement` | Observables, one-shot `fetchLiveStateData()`, non-React code | `useLiveStateSyncUtils()`, `client.getLiveStateSyncElement()`, `Velt.getLiveStateSyncElement()` |
| `createLiveStateMiddleware` | Sync Redux actions across clients | `@veltdev/react` |
| REST / backend SDK broadcast | Server-driven updates | `POST /v2/livestate/broadcast`, `sdk.api.livestate.broadcastEvent` |

**v6 modular SDK:** if you pass `featureAllowList` in the Velt config, include `'liveStateSync'`; otherwise its chunk is not preloaded. `client.preloadLiveStateSync()` loads it ahead of first use, and calling `getLiveStateSyncElement()` auto-enables the feature.

**Verification Checklist:**
- [ ] `VeltProvider` with `authProvider` wraps the app and a document is set (see `core-auth-provider`)
- [ ] The simplest API that fits is used
- [ ] Ephemeral data (cursors, selections, typing flags) has a cleanup plan (see `patterns-best-practices`)
- [ ] `featureAllowList`, when set, includes `'liveStateSync'`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/overview — latency, offline support, conflict resolution
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — getter and setter methods, `useLiveState`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadlivestatesync — `preloadLiveStateSync()` and `featureAllowList`

---

### 1.2 Wrap Live State Sync in VeltProvider with the authProvider object

**Impact: CRITICAL (Live State Sync APIs do nothing without an authenticated user and a set document; a wrong authProvider shape leaves the SDK unauthenticated)**

Live state is scoped to the authenticated user's organization and the current document. The recommended authentication path is the `authProvider` **object** on `VeltProvider` (`user`, `generateToken`, optional `retryConfig`), or `Velt.setVeltAuthProvider(...)` outside React. Prefer it over the older `useIdentify()` / `client.identify()` calls in new code. Every Live State Sync example you produce, even one focused on a Redux store or a single component, should show this provider setup and a document being set.

**Incorrect (callback shape that the SDK does not accept):**

```jsx
// BUG: authProvider is an object, not a callback that receives veltUser
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={async ({ veltUser }) => veltUser({ userId: 'u1', organizationId: 'org-1' })}
>
  <App />
</VeltProvider>
```

**Correct (React / Next.js):**

```jsx
import { VeltProvider, useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

const user = {
  userId: 'user-123',
  organizationId: 'org-abc',
  name: 'John Doe',
  email: 'john.doe@example.com',
  photoUrl: 'https://i.pravatar.cc/300',
};

function DocumentScope({ children }) {
  const { client } = useVeltClient();
  useEffect(() => {
    if (client) client.setDocuments([{ id: 'whiteboard-42' }]);
  }, [client]);
  return children;
}

export default function Root() {
  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={{
        user,
        retryConfig: { retryCount: 3, retryDelay: 1000 },
        generateToken: async () => fetchVeltTokenFromYourBackend(),
      }}
    >
      <DocumentScope>
        <App />
      </DocumentScope>
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```js
Velt.setVeltAuthProvider({
  user,
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => fetchVeltTokenFromYourBackend(),
});
Velt.setDocuments([{ id: 'whiteboard-42' }]);
```

**Verification Checklist:**
- [ ] `authProvider` is an object with `user` (and `generateToken` for production), not a callback
- [ ] A document is set (`setDocuments` / `useSetDocument`) before reading or writing live state
- [ ] The full `VeltProvider` setup appears in generated examples, not only the store or component code

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart — "Authenticate Users" and "Initialize Document"
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — Live State Sync APIs

---

## 2. Hooks

**Impact: CRITICAL**

React hooks: `useLiveState` (useState-like with `syncDuration`, `resetLiveState`, `listenToNewChangesOnly`), `useSetLiveStateData` / `useLiveStateData` with `merge`, and `useServerConnectionStateChangeHandler`.

### 2.1 Show connection state with useServerConnectionStateChangeHandler

**Impact: HIGH (Users need to know when writes are queued offline; the hook is the reactive source of ServerConnectionState in React)**

`useServerConnectionStateChangeHandler()` returns the current `ServerConnectionState` and re-renders when it changes. While `'offline'`, reads come from the local cache and writes queue until reconnect, so show an indicator.

| Value | Meaning |
|---|---|
| `'online'` | Connected to Velt servers |
| `'offline'` | Not connected; local reads and queued writes |
| `'pendingInit'` | SDK initialization pending |
| `'pendingData'` | Waiting for data from the server |

**Incorrect (treats every non-online state as an error):**

```jsx
const state = useServerConnectionStateChangeHandler();
if (state !== 'online') return <ErrorScreen />; // BUG: blocks the UI during normal startup states
```

**Correct (React / Next.js):**

```jsx
import { useServerConnectionStateChangeHandler } from '@veltdev/react';

function ConnectionBadge() {
  const connectionState = useServerConnectionStateChangeHandler();
  const label = connectionState === 'offline' ? 'Offline: changes will sync later' : connectionState;
  return <span className={`badge badge-${connectionState}`}>{label}</span>;
}
```

**Other Frameworks:** subscribe to `Velt.getLiveStateSyncElement().onServerConnectionStateChange()` (see `element-connection`). `useLiveState` also returns the state as its third tuple item.

**Verification Checklist:**
- [ ] The UI handles `'pendingInit'` and `'pendingData'` as loading, not failure
- [ ] Offline state is communicated without blocking local edits

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — "Server Connection State"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#useserverconnectionstatechangehandler — hook reference

---

### 2.2 Split reads and writes with useSetLiveStateData and useLiveStateData

**Impact: CRITICAL (Separate writer and reader hooks support merge updates and listenToNewChangesOnly; using useLiveState everywhere couples components and overwrites whole objects)**

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

---

### 2.3 Use useLiveState for useState-like shared state

**Impact: CRITICAL (The simplest shared-state API; the value can be null before server data arrives, and resetLiveState wipes persisted data on init)**

`useLiveState(id, initialValue, options?)` works like React's `useState`, but every client on the same document with the same `id` shares the value. It returns `[value, setValue, serverConnectionState]`.

| Option | Default | Effect |
|---|---|---|
| `syncDuration` | `50` (ms) | Debounce before syncing |
| `resetLiveState` | `false` | Reset server state to `initialValue` when the hook initializes |
| `listenToNewChangesOnly` | `false` | Ignore existing data; only receive changes after subscribing |

**Incorrect (no null guard, unintended reset):**

```jsx
const [counter, setCounter] = useLiveState('counter', 0, { resetLiveState: true });
// BUG 1: resetLiveState wipes the shared counter every time any client mounts
// BUG 2: counter can be null before data arrives, so counter + 1 yields 1 instead of the real value
<button onClick={() => setCounter(counter + 1)}>+</button>;
```

**Correct (React / Next.js):**

```jsx
import { useLiveState } from '@veltdev/react';
import { useEffect } from 'react';

export function Counter() {
  const [counter, setCounter, serverConnectionState] = useLiveState('counter', 0, {
    syncDuration: 100,
  });

  useEffect(() => {
    console.log('serverConnectionState:', serverConnectionState);
  }, [serverConnectionState]);

  return (
    <div>
      <button onClick={() => setCounter((counter || 0) - 1)}>-</button>
      <span>Counter: {counter}</span>
      <button onClick={() => setCounter((counter || 0) + 1)}>+</button>
    </div>
  );
}
```

**Other Frameworks:** there is no `useLiveState` equivalent; use `setLiveStateData` / `getLiveStateData` on `Velt.getLiveStateSyncElement()` (see `element-get-set`).

**Verification Checklist:**
- [ ] The `id` is a meaningful, shared string (`'editor-theme'`, `'selected-row'`)
- [ ] Reads guard against `null` before data arrives
- [ ] `resetLiveState: true` is used only when wiping persisted state on init is intended
- [ ] `syncDuration` is tuned for the update rate

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — "Alternative: useLiveState()"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#uselivestate — `useLiveState()`

---

## 3. Element

**Impact: HIGH**

The `LiveStateSyncElement` API: `setLiveStateData`, observable `getLiveStateData` with unsubscribe, Promise-based `fetchLiveStateData`, and `onServerConnectionStateChange`.

### 3.1 Observe connection state with onServerConnectionStateChange

**Impact: MEDIUM (The observable form is the only connection-state API outside React and must be unsubscribed)**

`liveStateSyncElement.onServerConnectionStateChange()` returns an observable of `ServerConnectionState` (`'online'`, `'offline'`, `'pendingInit'`, `'pendingData'`). It is the non-React equivalent of `useServerConnectionStateChangeHandler()`. Use it outside React, or in React when you need manual subscription control.

**Incorrect (subscription never released):**

```js
Velt.getLiveStateSyncElement().onServerConnectionStateChange().subscribe(updateBadge);
// BUG: no handle kept, so the subscription can never be released
```

**Correct (React / Next.js):**

```jsx
const liveStateSyncElement = useLiveStateSyncUtils();

useEffect(() => {
  if (!liveStateSyncElement) return;
  const subscription = liveStateSyncElement
    .onServerConnectionStateChange()
    .subscribe((state) => setConnection(state));
  return () => subscription?.unsubscribe();
}, [liveStateSyncElement]);
```

**Correct (Other Frameworks):**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();
const subscription = liveStateSyncElement
  .onServerConnectionStateChange()
  .subscribe((state) => updateBadge(state));

// When done:
subscription?.unsubscribe();
```

**Verification Checklist:**
- [ ] The subscription handle is kept and unsubscribed on teardown
- [ ] React components that only need the value use `useServerConnectionStateChangeHandler()` instead
- [ ] UI handles all four states

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — "Server Connection State"
- https://docs.velt.dev/api-reference/sdk/models/data-models#serverconnectionstate — `ServerConnectionState`

---

### 3.2 Use fetchLiveStateData for one-shot reads

**Impact: HIGH (fetchLiveStateData returns a Promise snapshot; using it for live UI leaves the UI stale, and using an observable for a one-time check leaks a subscription)**

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

---

### 3.3 Write and subscribe with setLiveStateData and getLiveStateData

**Impact: HIGH (getLiveStateData returns an observable; forgetting to unsubscribe leaks handlers, and omitting merge overwrites other keys)**

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

---

## 4. Redux

**Impact: HIGH**

`createLiveStateMiddleware` setup and action filters, switching scope with `updateLiveStateDataId`, and the synced action shape with its middleware-added UTC timestamp.

### 4.1 Switch the Redux sync scope with updateLiveStateDataId

**Impact: HIGH (Actions sync on the current liveStateDataId; forgetting to update it on navigation mixes state across documents or rooms)**

Call the `updateLiveStateDataId(id)` function returned by `createLiveStateMiddleware` whenever the sync scope changes, for example when the user switches rooms. All actions dispatched after the call sync on the new ID path. Set an initial custom `liveStateDataId` in the middleware config first, then change it dynamically.

**Incorrect (never updates the key on room change):**

```jsx
function Room({ roomId }) {
  // BUG: actions from every room keep syncing on the initial key
  return <Canvas />;
}
```

**Correct (React / Next.js):**

```jsx
import { useEffect } from 'react';
import { updateLiveStateDataId } from './store';

function Room({ roomId }) {
  useEffect(() => {
    updateLiveStateDataId(`room-${roomId}`);
  }, [roomId]);

  return <Canvas />;
}
```

**Verification Checklist:**
- [ ] `updateLiveStateDataId` is exported from the store and called when scope changes
- [ ] The middleware config also sets an initial `liveStateDataId`
- [ ] The ID follows a stable convention such as `room-${roomId}`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/redux-middleware — "Step 3: Selectively sync actions" (`updateLiveStateDataId`)

---

### 4.2 Sync Redux actions with createLiveStateMiddleware and explicit filters

**Impact: HIGH (Without a filter every dispatched action is broadcast, including local UI actions like modal toggles)**

`createLiveStateMiddleware(config?)` returns `{ middleware, updateLiveStateDataId }`. Add `middleware` to your store; dispatched actions that pass the filters are synced to other clients on the same document. Set a custom `liveStateDataId` up front (if omitted, data is stored under a default key) and export `updateLiveStateDataId` if you need to change it later.

**Incorrect (no filter, no custom key):**

```js
const { middleware } = createLiveStateMiddleware();
// BUG: every action, including 'ui/openModal', is synced to every client
```

**Correct (React / Next.js, store.js):**

```js
import { configureStore } from '@reduxjs/toolkit';
import { createLiveStateMiddleware } from '@veltdev/react';

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

```typescript
type LiveStateMiddlewareConfig = {
  allowedActionTypes?: Set<string>;        // sync only these types
  disabledActionTypes?: Set<string>;       // never sync these types
  allowAction?: (action: any) => boolean;  // return true to sync, false to skip
  liveStateDataId?: string;                // custom key; default key if omitted
};
```

Use `allowedActionTypes` for a small set of collaborative actions, `disabledActionTypes` when most actions are collaborative, and `allowAction` for payload-based rules.

**Verification Checklist:**
- [ ] At least one filter is configured
- [ ] A custom `liveStateDataId` is set in the config
- [ ] `updateLiveStateDataId` is exported when the scope changes at runtime
- [ ] `VeltProvider` with `authProvider` still wraps the app (see `core-auth-provider`)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/redux-middleware — Steps 1 to 3 and "Complete Example"

---

### 4.3 Understand the synced Redux action shape and its timestamp

**Impact: MEDIUM (The middleware adds the UTC timestamp itself; setting your own or depending on undocumented fields causes confusion when debugging ordering)**

The middleware stores each synced action as `{ id, action: { type, payload }, timestamp }`. `timestamp` is the UTC time in milliseconds when the action was dispatched, added automatically by the middleware to help with ordering and debugging across clients.

**Incorrect (adds its own timestamp to every action):**

```js
dispatch({ type: 'canvas/addShape', payload: { shapeId: 'rect-1' }, timestamp: Date.now() });
// Unnecessary: the middleware already records a UTC timestamp for each synced action
```

**Correct:**

```js
dispatch({ type: 'canvas/addShape', payload: { shapeId: 'rect-1', x: 100, y: 200 } });
```

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

**Verification Checklist:**
- [ ] Actions are plain `{ type, payload }` objects
- [ ] Debugging tools read `timestamp` from the stored action record
- [ ] `payload` stays serializable

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/redux-middleware — "Step 4: Action Data Structure"

---

## 5. API

**Impact: MEDIUM**

Server-side broadcast via `POST /v2/livestate/broadcast` and the `sdk.api.livestate.broadcastEvent` backend SDK methods, plus the `LiveStateData` / `LiveStateDataMap` / config types.

### 5.1 Broadcast live state from your backend with the REST API or backend SDKs

**Impact: MEDIUM (Server-driven updates reach every subscribed client; the body must be wrapped in a data object and scoped to the same organization, document, and liveStateDataId)**

`POST https://api.velt.dev/v2/livestate/broadcast` is the server-side equivalent of `setLiveStateData`. Clients subscribed to the same `liveStateDataId` on that document receive the update. Send `x-velt-api-key` and `x-velt-auth-token` headers, and put the fields inside a top-level `data` object, as with other Velt REST APIs. A v1 endpoint (`/v1/livestate/broadcast`) with the same parameters also exists.

**Incorrect (fields at the top level, wrong scope):**

```json
{
  "organizationId": "org-123",
  "documentId": "some-other-doc",
  "liveStateDataId": "editor-theme",
  "data": { "mode": "dark" }
}
```

**Correct (REST):**

```bash
curl -X POST https://api.velt.dev/v2/livestate/broadcast \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: $VELT_API_KEY" \
  -H "x-velt-auth-token: $VELT_AUTH_TOKEN" \
  -d '{
    "data": {
      "organizationId": "org-123",
      "documentId": "whiteboard-42",
      "liveStateDataId": "editor-theme",
      "data": { "mode": "dark", "fontSize": 14 },
      "merge": true
    }
  }'
```

**Correct (Node backend SDK, `@veltdev/node`):**

```ts
import { VeltSDK } from '@veltdev/node';

const sdk = VeltSDK.initialize({ apiKey: process.env.VELT_API_KEY, authToken: process.env.VELT_AUTH_TOKEN });

await sdk.api.livestate.broadcastEvent({
  organizationId: 'org-123',
  documentId: 'whiteboard-42',
  liveStateDataId: 'editor-theme',
  data: { mode: 'dark', fontSize: 14 },
  merge: true,
});
```

**Correct (Python backend SDK, `velt-py`):**

```python
from velt_py.models.livestate import BroadcastEventRequest

result = sdk.api.livestate.broadcastEvent(
    BroadcastEventRequest(
        organizationId='org-123',
        documentId='whiteboard-42',
        liveStateDataId='editor-theme',
        data={'mode': 'dark', 'fontSize': 14},
        merge=True,
    )
)
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `organizationId` | `string` | Yes | Must match the client's organization |
| `documentId` | `string` | Yes | Must match the document clients have set |
| `liveStateDataId` | `string` | Yes | Same ID clients read |
| `data` | `object` | Yes | Any serializable JSON |
| `merge` | `boolean` | No | Merge with existing data instead of replacing (default `false`) |

**Verification Checklist:**
- [ ] The REST body wraps the fields in `data`
- [ ] `organizationId`, `documentId`, and `liveStateDataId` match what clients use
- [ ] Partial updates pass `merge: true`
- [ ] API key and auth token stay on the server

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/livestate/broadcast-event — "Broadcast Event"
- https://docs.velt.dev/backend-sdks/node — "Livestate" (`sdk.api.livestate.broadcastEvent`)
- https://docs.velt.dev/backend-sdks/python — "Livestate" (`BroadcastEventRequest`)

---

### 5.2 Type live state with LiveStateData, LiveStateDataMap, and config types

**Impact: MEDIUM (Fetching all data returns a map with your entries under custom; looking up by id instead of liveStateDataId finds nothing)**

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

---

## 6. Patterns

**Impact: MEDIUM**

Persistence and cleanup of ephemeral data, flat state, scoped syncing, `syncDuration` tuning, and offline behavior.

### 6.1 Keep live state small and flat, and clean up ephemeral data yourself

**Impact: MEDIUM (Live state persists indefinitely with no automatic cleanup; stale cursors and selections accumulate unless your code overwrites them)**

Live state data persists until you remove it; there is no automatic cleanup. This is the most common surprise. Session-scoped data (cursors, selections, typing flags) must be cleared by your code, typically by overwriting the user's entry when they leave.

**Incorrect (per-user ephemeral data that is never cleared):**

```jsx
useEffect(() => {
  liveStateSyncElement.setLiveStateData('cursors', { [userId]: position }, { merge: true });
  // BUG: no cleanup, so this user's cursor stays in shared state after they leave
}, [position]);
```

**Correct (clear the user's entry on unmount):**

```jsx
useEffect(() => {
  liveStateSyncElement.setLiveStateData('cursors', { [userId]: position }, { merge: true });
}, [position]);

useEffect(() => {
  return () => {
    liveStateSyncElement.setLiveStateData('cursors', { [userId]: null }, { merge: true });
  };
}, [liveStateSyncElement, userId]);
```

For entries a client never cleaned up (crashed tabs), overwrite them from your server with the broadcast API (see `api-broadcast`).

**Guidelines from the docs:**
- Keep state structures simple and flat.
- Use meaningful IDs that reflect the purpose of the data.
- Sync only what you need, not the entire component state (keep hover, focus, and animation state local).
- Consider network latency when setting `syncDuration`; raise it to batch rapid updates.
- Use `listenToNewChangesOnly` when existing data is irrelevant.
- If using the element APIs, unsubscribe when components unmount. The hooks clean up on their own.

**Offline:** reads and writes are local-first; writes sync on reconnect. Show a connectivity indicator with `useServerConnectionStateChangeHandler()` or `onServerConnectionStateChange()`.

**Verification Checklist:**
- [ ] Ephemeral per-user data has explicit cleanup on unmount or logout
- [ ] Partial updates use `{ merge: true }` to avoid overwriting other users' keys
- [ ] Element-API subscriptions are unsubscribed
- [ ] `resetLiveState: true` is used only when wiping persisted data is intended

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — "Best Practices" and the persistence Info under "Set Live Data"
- https://docs.velt.dev/realtime-collaboration/live-state-sync/overview — offline support and conflict resolution

---
