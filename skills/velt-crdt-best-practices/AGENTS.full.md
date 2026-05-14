# Velt Crdt Best Practices

**Version 2.1.0**  
Velt  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive best practices guide for implementing real-time collaborative editing with Velt CRDT (Yjs). Contains 35 rules across 5 categories: Core CRDT (13 rules), Tiptap (7 rules), BlockNote (4 rules), CodeMirror (6 rules), and ReactFlow (5 rules). Each rule includes explanations, incorrect vs. correct code examples, verification checklists, and source pointers to official Velt documentation.

---

## Table of Contents

1. [Core CRDT](#1-core-crdt) — **CRITICAL**
   - 1.1 [Use useCrdtUtils() and useCrdtEventCallback() Hooks for CRDT Operations](#11-use-usecrdtutils-and-usecrdteventcallback-hooks-for-crdt-operations)
   - 1.2 [Use useVeltCrdtStore Hook for React CRDT Stores (v1 — DEPRECATED)](#12-use-useveltcrdtstore-hook-for-react-crdt-stores-v1-deprecated)
   - 1.3 [Choose the Correct CRDT Store Type for Your Data](#13-choose-the-correct-crdt-store-type-for-your-data)
   - 1.4 [Initialize Velt Client Before Creating CRDT Stores](#14-initialize-velt-client-before-creating-crdt-stores)
   - 1.5 [Install Correct CRDT Packages for Your Framework](#15-install-correct-crdt-packages-for-your-framework)
   - 1.6 [Manage CRDT Store Lifecycle and Cleanup with destroy()](#16-manage-crdt-store-lifecycle-and-cleanup-with-destroy)
   - 1.7 [Migrate Core CRDT Store Integrations from v1 to v2](#17-migrate-core-crdt-store-integrations-from-v1-to-v2)
   - 1.8 [Save Named Version Checkpoints for State Recovery](#18-save-named-version-checkpoints-for-state-recovery)
   - 1.9 [Subscribe to CRDT updateData Events with Observable Pattern](#19-subscribe-to-crdt-updatedata-events-with-observable-pattern)
   - 1.10 [Subscribe to Store Changes for Remote Updates](#110-subscribe-to-store-changes-for-remote-updates)
   - 1.11 [Test Collaboration with Multiple Browser Profiles](#111-test-collaboration-with-multiple-browser-profiles)
   - 1.12 [Use CrdtActivityActionTypes for Type-Safe Activity Filtering](#112-use-crdtactivityactiontypes-for-type-safe-activity-filtering)
   - 1.13 [Use CrdtElement Message Stream for Yjs-Backed Collaborative Editors](#113-use-crdtelement-message-stream-for-yjs-backed-collaborative-editors)
   - 1.14 [Use Custom Encryption Provider for Sensitive Data](#114-use-custom-encryption-provider-for-sensitive-data)
   - 1.15 [Use REST APIs to Manage CRDT Data Server-Side](#115-use-rest-apis-to-manage-crdt-data-server-side)
   - 1.16 [Use setActivityDebounceTime() to Control CRDT Activity Flush Frequency](#116-use-setactivitydebouncetime-to-control-crdt-activity-flush-frequency)
   - 1.17 [Use type:'array' Store for Collaborative Ordered Lists](#117-use-typearray-store-for-collaborative-ordered-lists)
   - 1.18 [Use type:'map' Store for Collaborative Key-Value Objects](#118-use-typemap-store-for-collaborative-key-value-objects)
   - 1.19 [Use type:'text' Store for Collaborative Plain Text](#119-use-typetext-store-for-collaborative-plain-text)
   - 1.20 [Use type:'xml' Store with Yjs APIs — Never Call update()](#120-use-typexml-store-with-yjs-apis-never-call-update)
   - 1.21 [Use update() Method to Modify Store Values](#121-use-update-method-to-modify-store-values)
   - 1.22 [Use useStore (v2) for Reactive CRDT Stores with Status, Sync, and Error State](#122-use-usestore-v2-for-reactive-crdt-stores-with-status-sync-and-error-state)
   - 1.23 [Use VeltCrdtStoreMap for Runtime Debugging](#123-use-veltcrdtstoremap-for-runtime-debugging)
   - 1.24 [Use Webhooks to Listen for CRDT Data Changes](#124-use-webhooks-to-listen-for-crdt-data-changes)
   - 1.25 [Use createVeltStore for Non-React CRDT Stores](#125-use-createveltstore-for-non-react-crdt-stores)

2. [Tiptap Integration](#2-tiptap-integration) — **CRITICAL**
   - 2.1 [Load Tiptap Editor with SSR Disabled in Next.js](#21-load-tiptap-editor-with-ssr-disabled-in-nextjs)
   - 2.2 [Use useVeltTiptapCrdtExtension Hook for React Tiptap (v1 — DEPRECATED)](#22-use-usevelttiptapcrdtextension-hook-for-react-tiptap-v1-deprecated)
   - 2.3 [Add CSS for Collaboration Cursors in Tiptap](#23-add-css-for-collaboration-cursors-in-tiptap)
   - 2.4 [Disable Tiptap History When Using CRDT](#24-disable-tiptap-history-when-using-crdt)
   - 2.5 [Install Tiptap CRDT Packages Correctly](#25-install-tiptap-crdt-packages-correctly)
   - 2.6 [Integrate TiptapVeltComments Extension When Using Comments with CRDT](#26-integrate-tiptapveltcomments-extension-when-using-comments-with-crdt)
   - 2.7 [Migrate Tiptap CRDT Integrations from v1 to v2](#27-migrate-tiptap-crdt-integrations-from-v1-to-v2)
   - 2.8 [Test Tiptap Collaboration with Multiple Users](#28-test-tiptap-collaboration-with-multiple-users)
   - 2.9 [Use HTML String Format for Tiptap CRDT Initial Content](#29-use-html-string-format-for-tiptap-crdt-initial-content)
   - 2.10 [Use the CollaborationManager API for Status, Versions, and Yjs Internals](#210-use-the-collaborationmanager-api-for-status-versions-and-yjs-internals)
   - 2.11 [Use Unique editorId for Each Tiptap Instance](#211-use-unique-editorid-for-each-tiptap-instance)
   - 2.12 [Use createVeltTipTapStore for Non-React Tiptap (v1 — DEPRECATED)](#212-use-createvelttiptapstore-for-non-react-tiptap-v1-deprecated)

3. [BlockNote Integration](#3-blocknote-integration) — **HIGH**
   - 3.1 [Install BlockNote CRDT Packages Correctly](#31-install-blocknote-crdt-packages-correctly)
   - 3.2 [Test BlockNote Collaboration with Multiple Users](#32-test-blocknote-collaboration-with-multiple-users)
   - 3.3 [Use Unique editorId for Each BlockNote Instance](#33-use-unique-editorid-for-each-blocknote-instance)
   - 3.4 [Use useVeltBlockNoteCrdtExtension for BlockNote Collaboration (v1 — DEPRECATED)](#34-use-useveltblocknotecrdtextension-for-blocknote-collaboration-v1-deprecated)
   - 3.5 [Migrate BlockNote CRDT Integrations from v1 to v2](#35-migrate-blocknote-crdt-integrations-from-v1-to-v2)
   - 3.6 [Use the CollaborationManager API for Status, Versions, and Yjs Internals](#36-use-the-collaborationmanager-api-for-status-versions-and-yjs-internals)

4. [CodeMirror Integration](#4-codemirror-integration) — **HIGH**
   - 4.1 [Use useVeltCodeMirrorCrdtExtension for React CodeMirror (v1 — DEPRECATED)](#41-use-useveltcodemirrorcrdtextension-for-react-codemirror-v1-deprecated)
   - 4.2 [Install CodeMirror CRDT Packages](#42-install-codemirror-crdt-packages)
   - 4.3 [Migrate CodeMirror CRDT Integrations from v1 to v2](#43-migrate-codemirror-crdt-integrations-from-v1-to-v2)
   - 4.4 [Test CodeMirror Collaboration with Multiple Users](#44-test-codemirror-collaboration-with-multiple-users)
   - 4.5 [Use the CollaborationManager API for Status, Versions, and Yjs Internals](#45-use-the-collaborationmanager-api-for-status-versions-and-yjs-internals)
   - 4.6 [Use Unique editorId for Each CodeMirror Instance](#46-use-unique-editorid-for-each-codemirror-instance)
   - 4.7 [Wire yCollab Extension with the v2 CollaborationPrimitives](#47-wire-ycollab-extension-with-the-v2-collaborationprimitives)
   - 4.8 [Use createVeltCodeMirrorStore for Non-React CodeMirror (v1 — DEPRECATED)](#48-use-createveltcodemirrorstore-for-non-react-codemirror-v1-deprecated)

5. [ReactFlow Integration](#5-reactflow-integration) — **HIGH**
   - 5.1 [Install ReactFlow CRDT Package](#51-install-reactflow-crdt-package)
   - 5.2 [Test ReactFlow Collaboration with Multiple Users](#52-test-reactflow-collaboration-with-multiple-users)
   - 5.3 [Use CRDT Handlers for Node and Edge Changes](#53-use-crdt-handlers-for-node-and-edge-changes)
   - 5.4 [Use Unique editorId for Each ReactFlow Diagram](#54-use-unique-editorid-for-each-reactflow-diagram)
   - 5.5 [Use useVeltReactFlowCrdtExtension for Collaborative Diagrams](#55-use-useveltreactflowcrdtextension-for-collaborative-diagrams)

---

## 1. Core CRDT

**Impact: CRITICAL**

Framework-agnostic CRDT fundamentals including Velt initialization, store creation, store types, subscriptions, updates, versioning, encryption, and debugging. Required foundation for all editor integrations.

### 1.1 Use useCrdtUtils() and useCrdtEventCallback() Hooks for CRDT Operations

**Impact: MEDIUM (Provides React-idiomatic access to CrdtElement methods and CRDT event subscriptions)**

React apps should use `useCrdtUtils()` for CrdtElement operations (webhooks, activity debounce) and `useCrdtEventCallback()` for subscribing to CRDT events, instead of manually calling `client.getCrdtElement()`.

**Incorrect (manual CrdtElement access in React):**

```tsx
import { useVeltClient } from '@veltdev/react';

function CrdtSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // Manual access bypasses React lifecycle patterns
    const crdtElement = client.getCrdtElement();
    crdtElement.enableWebhook();
  }, [client]);
}
```

**Correct (useCrdtUtils hook for CrdtElement methods):**

```tsx
import { useCrdtUtils } from "@veltdev/react";
import { useEffect } from "react";

export function CrdtWebhookSetup() {
  const crdtUtils = useCrdtUtils();

  useEffect(() => {
    if (!crdtUtils) return;

    // Enable webhook
    crdtUtils.enableWebhook();

    // Optional: Change webhook debounce time (minimum 5 seconds)
    crdtUtils.setWebhookDebounceTime(10 * 1000); // 10 seconds

    // Set activity debounce
    crdtUtils.setActivityDebounceTime(30000); // 30 seconds
  }, [crdtUtils]);

  return <div>CRDT Configured</div>;
}
```

**Correct (useCrdtEventCallback hook for event subscriptions):**

```tsx
import { useCrdtEventCallback } from "@veltdev/react";
import { useEffect } from "react";

export function CrdtEventListener() {
  // Automatically subscribes to updateData events and cleans up on unmount
  const crdtUpdateData = useCrdtEventCallback("updateData");

  useEffect(() => {
    if (crdtUpdateData) {
      console.log("[CRDT] event on data change: ", crdtUpdateData);
    }
  }, [crdtUpdateData]);

  return <div>Listening for CRDT events</div>;
}
```

---

### 1.2 Use useVeltCrdtStore Hook for React CRDT Stores (v1 — DEPRECATED)

**Impact: LOW (v1 API retained for backwards-compatibility only. New integrations must use the v2 useStore hook (see core-store-v2-api.md and core-v1-to-v2-migration.md).)**

> **DEPRECATED:** This rule documents the v1 React CRDT store hook and is retained for backwards-compatibility reference only. **New integrations must use `useStore` from `@veltdev/crdt-react`** — see `rules/shared/core/core-store-v2-api.md` for the canonical v2 pattern and `rules/shared/core/core-v1-to-v2-migration.md` for the migration table. The v1 `useVeltCrdtStore` hook internally delegates to v2 `useStore` via a compatibility wrapper.

In React, the v1 API uses `useVeltCrdtStore` for automatic lifecycle management. The hook handles subscriptions, updates, and cleanup on unmount — but **does not surface** `isLoading`, `isSynced`, `status`, or `error` reactive state; those are only available in the v2 `useStore` hook.

**Incorrect (manual store creation in React):**

```tsx
import { createVeltStore } from '@veltdev/crdt';

function Editor() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    // Manual creation misses cleanup and reactive updates
    createVeltStore({ id: 'doc', type: 'text' }).then(setStore);
  }, []);

  return <div>{/* ... */}</div>;
}
```

**Correct (v1 useVeltCrdtStore hook — deprecated; prefer v2 useStore):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  const { value, update, store } = useVeltCrdtStore<string>({
    id: 'my-collab-note',
    type: 'text',
    initialValue: 'Hello, world!',
  });

  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => update(e.target.value)}
    />
  );
}
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Legacy API (v1) > useVeltCrdtStore() (deprecated))

---

### 1.3 Choose the Correct CRDT Store Type for Your Data

**Impact: CRITICAL (Wrong type causes merge conflicts or data loss)**

Velt CRDT supports four Yjs-backed types: `text`, `array`, `map`, and `xml`. Each has different merge semantics. Using the wrong type causes unexpected behavior on concurrent edits.

**Incorrect (text type for object data):**

```ts
// Using text for JSON object - will cause merge issues
const store = await createVeltStore({
  id: 'settings',
  type: 'text',
  initialValue: JSON.stringify({ theme: 'light', fontSize: 14 }),
});
```

**Correct (map type for object data):**

```ts
// Map type properly merges concurrent key-value updates
const store = await createVeltStore<{ theme: string; fontSize: number }>({
  id: 'settings',
  type: 'map',
  initialValue: { theme: 'light', fontSize: 14 },
});
```

**Correct (text type for collaborative text):**

```tsx
const { value, update } = useStore<string>({
  storeId: 'note',
  type: 'text',
  initialValue: '',
});

return <textarea value={value ?? ''} onChange={(e) => update(e.target.value)} />;
```

**Correct (array type for lists):**

```tsx
const { value, update } = useStore<string[]>({
  storeId: 'todo-list',
  type: 'array',
  initialValue: [],
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 3: Choose a store type)

---

### 1.4 Initialize Velt Client Before Creating CRDT Stores

**Impact: CRITICAL (Prevents CRDT store creation failures)**

CRDT stores require a properly initialized Velt client. React apps must wrap with `VeltProvider`; other frameworks must call `initVelt()` before creating stores.

**Incorrect (store created without Velt initialization):**

```tsx
// React - missing VeltProvider
function App() {
  // This will fail - no Velt client available
  const { store } = useStore({ storeId: 'note', type: 'text' });
  return <div>{/* ... */}</div>;
}
```

**Correct (React / Next.js):**

```tsx
import { VeltProvider } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY">
      <CollaborativeEditor />
    </VeltProvider>
  );
}

function CollaborativeEditor() {
  // Now works - VeltProvider initialized the client
  const { store } = useStore({ storeId: 'note', type: 'text' });
  return <div>{/* ... */}</div>;
}
```

**Correct (Other Frameworks):**

```ts
import { createVeltStore } from '@veltdev/crdt';
import { initVelt } from '@veltdev/client';

// Step 1: Initialize Velt client first
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Now create store with veltClient
const store = await createVeltStore({
  id: 'my-document',
  type: 'text',
  veltClient,  // Required - pass the initialized client
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 2: Initialize Velt in your app)

---

### 1.5 Install Correct CRDT Packages for Your Framework

**Impact: CRITICAL (Missing packages prevent CRDT from working)**

Install the appropriate Velt CRDT packages based on your framework. React apps need the hook wrapper; other frameworks use the core library directly.

**Incorrect (missing required packages):**

```bash
# Missing @veltdev/crdt - won't work
npm install @veltdev/crdt-react
```

**Correct (React / Next.js):**

```bash
npm install @veltdev/crdt-react @veltdev/crdt @veltdev/react
```

**Correct (Other Frameworks - Vue, Angular, vanilla JS):**

```bash
npm install @veltdev/crdt @veltdev/client
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Setup > ### Step 1: Install Dependencies)

---

### 1.6 Manage CRDT Store Lifecycle and Cleanup with destroy()

**Impact: MEDIUM (Prevents memory leaks and stale listeners when stores are no longer needed)**

In non-React frameworks, you must manually call `store.destroy()` to clean up resources and listeners when done with a CRDT store. In React, the `useStore` hook handles cleanup automatically on unmount. The store also exposes Yjs-level accessors (`getDoc()`, `getProvider()`, `getText()`, `getXml()`) for advanced integrations.

**Incorrect (no cleanup in non-React frameworks):**

```typescript
// Store is never destroyed — listeners and connections remain active
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
// Component or page unmounts without cleanup
```

**Correct (React / Next.js — automatic cleanup via hook):**

```tsx
import { useStore } from '@veltdev/crdt-react';

function Editor() {
  // Cleanup happens automatically when component unmounts
  const { store, value } = useStore<string>({
    storeId: 'my-collab-note',
    type: 'text',
  });

  return <div>{value}</div>;
}
```

**Correct (Other Frameworks — manual destroy):**

```typescript
import { createVeltStore } from '@veltdev/crdt';

const store = await createVeltStore<string>({
  id: 'my-document',
  type: 'text',
  veltClient,
});

// When done with the store (e.g., page navigation, cleanup)
store.destroy();
```

---

### 1.7 Migrate Core CRDT Store Integrations from v1 to v2

**Impact: HIGH (v1 useVeltCrdtStore (React) is deprecated; v2 useStore is required for new integrations. Non-React createVeltStore retains its entry-point name but gains new config fields.)**

The v1 React hook `useVeltCrdtStore` (from `@veltdev/crdt-react`) is deprecated and remains exported only for backwards-compatibility (it internally delegates to v2 `useStore` via a wrapper). All new React integrations must use `useStore`. The non-React `createVeltStore` (`@veltdev/crdt`) keeps the same entry-point name but its `StoreConfig` gains new v2 fields (`forceResetInitialContent`, `contentKey`, `userId`, `collection`, `logLevel`). When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

### React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `useVeltCrdtStore(config)` | `useStore(config)` |
| Store ID field | `id` | `storeId` |
| Status tracking | Not available | `isLoading`, `isSynced`, `status` |
| Error handling | Not available | `onError` callback + `error` reactive field |
| Force reset | Not available | `forceResetInitialContent: boolean` |
| Type union | `'text' \| 'array' \| 'map' \| 'xml'` | adds `'xmltext'` |
| Awareness access | `store.getAwareness()` | `useAwareness(store)` reactive hook |
| Version management | `value, versions, saveVersion, getVersions, getVersionById, restoreVersion, setStateFromVersion` | Same names — surface unchanged |
| Cleanup | Automatic on unmount | Automatic on unmount |

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

const { value, update, store, versions, saveVersion } = useVeltCrdtStore<string>({
  id: 'my-collab-note',         // v2: storeId
  type: 'text',
  initialValue: 'Hello, world!',
  debounceMs: 100,
});

// No way to gate UI on loading / sync / error in v1
return <textarea value={value ?? ''} onChange={(e) => update(e.target.value)} />;
```

**Correct (v2):**

```tsx
import { useStore, useAwareness } from '@veltdev/crdt-react';

const {
  value, update, store,
  isLoading, isSynced, status, error,
  versions, saveVersion,
} = useStore<string>({
  storeId: 'my-collab-note',
  type: 'text',
  initialValue: 'Hello, world!',
  debounceMs: 100,
  onError: (err) => console.error(err),
});

const { remoteStates, localState, setLocalState } = useAwareness(store);

if (error) return <div>Error: {error.message}</div>;
if (isLoading) return <div>Connecting... ({status})</div>;

return <textarea value={value ?? ''} onChange={(e) => update(e.target.value)} />;
```

`createVeltStore` keeps the same entry-point and signature shape. v2 adds the following `StoreConfig` fields, all optional:
| Field | Type | Notes |
|---|---|---|
| `forceResetInitialContent` | `boolean` | If `true`, always reset to `initialValue` on init (template flows). Default `false`. |
| `contentKey` | `string` | Yjs shared-type content key. Default `'content'`. |
| `userId` | `string` | Update attribution. |
| `collection` | `string` | Document grouping namespace. |
| `logLevel` | `'silent' \| 'error' \| 'warn' \| 'debug'` | Default `'error'`. |
Existing v1 call sites continue to work without changes — no migration is forced. Adopt the new fields opportunistically.

**Example (v2 createVeltStore with new fields):**

```js
import { createVeltStore } from '@veltdev/crdt';

const store = await createVeltStore({
  id: 'my-array-store',
  type: 'array',
  initialValue: [{ id: '1', name: 'First item' }],
  veltClient: client,
  // v2 additions:
  forceResetInitialContent: false,
  contentKey: 'content',
  logLevel: 'warn',
});
```

- [ ] All `useVeltCrdtStore` imports replaced with `useStore` from `@veltdev/crdt-react`
- [ ] All `id` config fields renamed to `storeId` (React only)
- [ ] UI now gates on `isLoading` / `error` / `status` before reading `value`
- [ ] `onError` callback wired for production code
- [ ] Awareness reads use `useAwareness(store)` in React (not `store.getAwareness()` directly)
- [ ] `forceResetInitialContent` adopted in template/onboarding flows where v1 had to delete-and-recreate
- [ ] Non-React `createVeltStore` call sites reviewed for opportunistic adoption of new fields (`contentKey`, `logLevel`, etc.)

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Migration Guide: v1 to v2; ## Legacy API (v1))

---

### 1.8 Save Named Version Checkpoints for State Recovery

**Impact: MEDIUM-HIGH (Enables rollback to known good states)**

Use `saveVersion()` to create named checkpoints that can be restored later. Useful for autosave, undo/redo at document level, or user-triggered saves.

**Correct (React - saving versions):**

```tsx
import { useStore } from '@veltdev/crdt-react';

function Editor() {
  const { saveVersion, getVersions, setStateFromVersion } =
    useStore<string>({ storeId: 'my-collab-note', type: 'text' });

  async function handleSave() {
    const versionId = await saveVersion('User checkpoint');
    console.log('Saved version:', versionId);
  }

  async function handleRestore() {
    const versions = await getVersions();
    if (versions.length === 0) return;
    const latest = versions[0];
    await setStateFromVersion(latest);
  }

  return (
    <div>
      <button onClick={handleSave}>Save Version</button>
      <button onClick={handleRestore}>Restore Latest</button>
    </div>
  );
}
```

**Correct (Vanilla JS):**

```ts
const store = await createVeltStore<string>({
  id: 'doc',
  type: 'text',
  veltClient,
});

// Save a version
const versionId = await store.saveVersion('Initial checkpoint');

// Get all versions
const versions = await store.getVersions();

// Restore from version
const fetched = await store.getVersionById(versionId);
if (fetched) {
  await store.setStateFromVersion(fetched);
}
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 6: Save and restore versions)

---

### 1.9 Subscribe to CRDT updateData Events with Observable Pattern

**Impact: HIGH (Enables real-time reactions to CRDT data changes on the client side)**

`CrdtElement.on("updateData")` returns an Observable that emits a `CrdtUpdateDataEvent` whenever CRDT data changes. Use `.subscribe()` on the returned Observable and clean up the subscription on unmount to avoid memory leaks.

**Incorrect (callback-style pattern that does not exist):**

```typescript
// Wrong: on() does not accept a callback as the second argument
const crdtElement = client.getCrdtElement();
crdtElement.on('updateData', (data) => {
  console.log(data);
});
```

**Correct (React / Next.js using useCrdtEventCallback hook):**

```jsx
import { useCrdtEventCallback } from "@veltdev/react";
import { useEffect } from "react";

export function CrdtChangeListener() {
  // Hook: automatically subscribes and cleans up
  const crdtUpdateData = useCrdtEventCallback("updateData");

  useEffect(() => {
    console.log("[CRDT] event on data change: ", crdtUpdateData);
  }, [crdtUpdateData]);

  return <div>Listening for changes</div>;
}
```

**Correct (React / Next.js using API with Observable):**

```jsx
import { useVeltClient } from "@veltdev/react";
import { useEffect } from "react";

export function CrdtChangeListener() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const crdtElement = client.getCrdtElement();

    // on() returns an Observable — call .subscribe() on it
    const subscription = crdtElement.on("updateData").subscribe((eventData) => {
      console.log("[CRDT] event on data change: ", eventData);
      // eventData structure:
      // {
      //   methodName: string,
      //   uniqueId: string,
      //   timestamp: number,
      //   source: string,
      //   payload: {
      //     id: string,
      //     data: unknown,
      //     lastUpdatedBy: string,
      //     sessionId: string | null,
      //     lastUpdate: string
      //   }
      // }
    });

    return () => subscription.unsubscribe();
  }, [client]);

  return <div>Listening for changes</div>;
}
```

**Correct (Other Frameworks — Observable pattern):**

```html
<script>
const crdtElement = Velt.getCrdtElement();

// on() returns an Observable — call .subscribe()
crdtElement.on("updateData").subscribe((eventData) => {
  console.log("[CRDT] event on data change: ", eventData);
});
</script>
```

**Event types:**

```typescript
interface CrdtUpdateDataEvent {
  methodName: string;              // Method that triggered the update
  uniqueId: string;                // Unique event ID
  timestamp: number;               // Unix timestamp
  source: string;                  // Source identifier
  payload: CrdtUpdateDataPayload;  // Update data
}

interface CrdtUpdateDataPayload {
  id: string;                      // Editor/store ID
  data: unknown;                   // Updated content
  lastUpdatedBy: string;           // User ID of last editor
  sessionId: string | null;        // Session ID
  lastUpdate: string;              // ISO timestamp of last update
}
```

---

### 1.10 Subscribe to Store Changes for Remote Updates

**Impact: HIGH (Enables real-time collaboration visibility)**

To see changes from other collaborators, subscribe to store updates. In React, the hook's `value` is reactive. In vanilla JS, use `store.subscribe()`.

**Incorrect (not subscribing - missing remote updates):**

```ts
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
const value = store.getValue(); // Only gets current value once
// Remote changes won't be visible
```

**Correct (React - reactive value):**

```tsx
import { useEffect } from 'react';
import { useStore } from '@veltdev/crdt-react';

function Editor() {
  const { value } = useStore<string>({ storeId: 'my-collab-note', type: 'text' });

  useEffect(() => {
    console.log('Updated value:', value);
  }, [value]);

  return <div>{value}</div>;
}
```

**Correct (Vanilla JS - manual subscription):**

```ts
const store = await createVeltStore<string>({
  id: 'doc',
  type: 'text',
  veltClient,
});

// Subscribe to all changes (local and remote)
const unsubscribe = store.subscribe((newValue) => {
  console.log('Updated value:', newValue);
  document.getElementById('output').textContent = newValue;
});

// Cleanup when done
unsubscribe();
```

**Alternative: One-time read with getValue():**

```ts
// For one-time read (not reactive)
const currentValue = store.getValue();
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 5: Listen for changes)

---

### 1.11 Test Collaboration with Multiple Browser Profiles

**Impact: LOW (Catches sync issues before production)**

Real-time collaboration must be tested with multiple authenticated users. Use different browser profiles to test with separate user identities on the same machine.

**Incorrect (same user in multiple tabs):**

```typescript
// This doesn't test true multi-user collaboration
Tab 1: User A on document-1
Tab 2: User A on document-1  // Same session, not a real test
```

**Correct (different users in different profiles):**

```typescript
Profile 1 (Chrome): User A (alice@example.com) on document-1
Profile 2 (Chrome Guest): User B (bob@example.com) on document-1
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Testing and Debugging)

---

### 1.12 Use CrdtActivityActionTypes for Type-Safe Activity Filtering

**Impact: MEDIUM (Eliminates raw-string action type errors when filtering CRDT activities)**

The `CrdtActivityActionTypes` exported constant provides the canonical string values for CRDT action types. Use it — and the accompanying `CrdtActivityActionType` union type — instead of raw strings when building `ActionSubscribeConfig.actionTypes` filters, so that typos are caught at compile time and the code self-documents intent.

**Incorrect (raw string values for action type filtering):**

```typescript
// Raw strings are error-prone and not refactor-safe
const activities = activityElement.getAllActivities({
  actionTypes: ['crdt.editor_edit'],
});
```

**Correct (React / Next.js — type-safe filtering with CrdtActivityActionTypes):**

```jsx
import { CrdtActivityActionTypes } from '@veltdev/react';
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function CrdtActivityFilter() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const activityElement = client.getActivityElement();

    // Type-safe filtering of CRDT activities
    const subscription = activityElement.getAllActivities({
      actionTypes: [
        CrdtActivityActionTypes.EDITOR_EDIT,
      ],
    }).subscribe((activities) => {
      console.log('CRDT edit activities:', activities);
    });

    return () => subscription.unsubscribe();
  }, [client]);
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
import { CrdtActivityActionTypes } from '@veltdev/types';

const activityElement = client.getActivityElement();

const subscription = activityElement.getAllActivities({
  actionTypes: [
    CrdtActivityActionTypes.EDITOR_EDIT,
  ],
}).subscribe((activities) => {
  console.log('CRDT edit activities:', activities);
});
```

---

### 1.13 Use CrdtElement Message Stream for Yjs-Backed Collaborative Editors

**Impact: HIGH (Enables low-latency Yjs sync and awareness over a single Firebase RTDB channel with built-in encryption and snapshot-based pruning)**

`CrdtElement` exposes six methods that implement a y-redis-style message stream over a single Firebase RTDB channel per document. Without this pattern, custom Yjs integrations must manage their own transport, snapshot, and pruning logic, leading to unbounded storage growth and complex replay logic.

**Incorrect (no snapshot baseline, replaying all messages from the beginning):**

```typescript
// Replays the entire history on every load — O(n) in message count,
// no snapshot baseline, and no pruning keeps storage growing forever
const messages = await crdtElement.getMessages({ id: 'my-doc', afterTs: 0 });
for (const msg of messages) {
  Y.applyUpdate(ydoc, new Uint8Array(msg.data));
}
```

**Correct (snapshot + incremental replay + real-time stream + periodic pruning):**

```tsx
import { useVeltClient } from '@veltdev/react';
import * as Y from 'yjs';
import { useEffect, useRef } from 'react';

function CollaborativeEditor({ docId }: { docId: string }) {
  const { client } = useVeltClient();
  const ydocRef = useRef(new Y.Doc());

  useEffect(() => {
    if (!client) return;

    const ydoc = ydocRef.current;
    const crdtElement = client.getCrdtElement();
    let unsubscribe: (() => void) | undefined;

    async function initStream() {
      // --- Initial load: snapshot baseline + incremental replay ---
      const snapshot = await crdtElement.getSnapshot({ id: docId });
      if (snapshot?.state) {
        Y.applyUpdate(ydoc, new Uint8Array(snapshot.state));
      }
      const afterTs = snapshot?.timestamp ?? 0;
      const messages = await crdtElement.getMessages({ id: docId, afterTs });
      for (const msg of messages) {
        Y.applyUpdate(ydoc, new Uint8Array(msg.data));
      }

      // --- Real-time streaming ---
      unsubscribe = crdtElement.onMessage({
        id: docId,
        callback: (msg) => {
          Y.applyUpdate(ydoc, new Uint8Array(msg.data));
        },
      });

      // --- Send local updates upstream ---
      ydoc.on('update', async (update: Uint8Array) => {
        await crdtElement.pushMessage({
          id: docId,
          data: Array.from(update),
          yjsClientId: ydoc.clientID,
          messageType: 'sync',
          source: 'tiptap',
        });
      });
    }

    initStream();

    return () => {
      unsubscribe?.();
    };
  }, [client, docId]);

  // ... render editor with ydocRef.current
}

// --- Periodic snapshot checkpoint and pruning (run on a timer or on save) ---
async function checkpointAndPrune(client: any, docId: string, ydoc: Y.Doc) {
  const crdtElement = client.getCrdtElement();

  await crdtElement.saveSnapshot({
    id: docId,
    state: Y.encodeStateAsUpdate(ydoc),
    vector: Y.encodeStateVector(ydoc),
    source: 'tiptap',
  });

  // Remove messages older than 24 hours
  await crdtElement.pruneMessages({
    id: docId,
    beforeTs: Date.now() - 24 * 60 * 60 * 1000,
  });
}
```

**Data types:**

```typescript
interface CrdtMessageData {
  data: number[];        // Yjs update bytes (lib0-encoded)
  source: string;        // Source identifier (e.g., 'tiptap')
  timestamp: number;     // Unix timestamp (ms)
}

interface CrdtSnapshotData {
  state: Uint8Array;     // Encoded Yjs state (Y.encodeStateAsUpdate output)
  timestamp: number;     // Unix timestamp (ms)
  vector?: Uint8Array;   // State vector (Y.encodeStateVector output)
}

interface CrdtPushMessageQuery {
  id: string;                    // Document ID
  data: number[];                // Yjs update bytes
  yjsClientId: number;          // Yjs client ID (ydoc.clientID)
  messageType: 'sync' | 'awareness'; // Message type
  source?: string;               // Source identifier
}
```

---

### 1.14 Use Custom Encryption Provider for Sensitive Data

**Impact: MEDIUM (Protects collaborative data at rest)**

Encrypt CRDT data before it's stored in Velt by registering a custom encryption provider. For CRDT, input data is `Uint8Array | number[]`.

**Correct (React - encryption provider):**

```tsx
import { VeltProvider } from '@veltdev/react';

async function encryptData(config: EncryptConfig<number[]>): Promise<string> {
  const encryptedData = await yourEncryptDataMethod(config.data);
  return encryptedData;
}

async function decryptData(config: DecryptConfig<string>): Promise<number[]> {
  const decryptedData = await yourDecryptDataMethod(config.data);
  return decryptedData;
}

const encryptionProvider: VeltEncryptionProvider<number[], string> = {
  encrypt: encryptData,
  decrypt: decryptData,
};

function App() {
  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      encryptionProvider={encryptionProvider}
    >
      <CollaborativeEditor />
    </VeltProvider>
  );
}
```

**Correct (Vanilla JS):**

```ts
import { initVelt } from '@veltdev/client';

const encryptionProvider = {
  encrypt: async (config) => {
    return await yourEncryptMethod(config.data);
  },
  decrypt: async (config) => {
    return await yourDecryptMethod(config.data);
  },
};

const client = await initVelt('YOUR_API_KEY');
client.setEncryptionProvider(encryptionProvider);
```

**Encryption Provider Interface:**

```ts
interface VeltEncryptionProvider<TInput, TOutput> {
  encrypt: (config: EncryptConfig<TInput>) => Promise<TOutput>;
  decrypt: (config: DecryptConfig<TOutput>) => Promise<TInput>;
}

interface EncryptConfig<T> {
  data: T;
  documentId: string;
  // ... other context
}
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## APIs > ### Custom Encryption)

---

### 1.15 Use REST APIs to Manage CRDT Data Server-Side

**Impact: HIGH (Access, create, and update collaborative editor data from backend services)**

Use the CRDT REST APIs to get, add, or update editor data from your backend. This enables server-side seeding of initial content, processing, export, indexing, or backup of collaborative content without requiring a client connection.

**Incorrect (client-only data access):**

```typescript
// Can only access CRDT data from client-side
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
const value = store.getValue();
// No way to access or seed data from backend
```

**Correct (Get CRDT data via REST API):**

```bash
# Get CRDT data for a specific document/editor
curl -X POST https://api.velt.dev/v2/crdt/get \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{
    "data": {
      "organizationId": "org-id",
      "documentId": "doc-id",
      "editorId": "editor-id"
    }
  }'
```

**Correct (Add new CRDT data via REST API):**

```bash
# Create new CRDT editor data (errors if editorId already exists)
curl -X POST https://api.velt.dev/v2/crdt/add \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{
    "data": {
      "organizationId": "org-id",
      "documentId": "doc-id",
      "editorId": "editor-id",
      "data": "Hello, collaborative world!",
      "type": "text"
    }
  }'
```

**Correct (Update existing CRDT data via REST API):**

```bash
# Replace existing CRDT editor data (generates proper CRDT ops for connected clients)
curl -X POST https://api.velt.dev/v2/crdt/update \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{
    "data": {
      "organizationId": "org-id",
      "documentId": "doc-id",
      "editorId": "editor-id",
      "data": "Updated content!",
      "type": "text"
    }
  }'
```

**Get Response Type:**

```typescript
// GET response returns an array of CrdtDataObject
interface CrdtDataObject {
  data: string | object | unknown[];  // Content (type depends on store type)
  id: string;                         // Editor ID
  lastUpdate: string;                 // ISO timestamp of last update
  lastUpdatedBy: string;              // User ID of last editor
  sessionId: string | null;           // Session ID
}

// Response structure:
// { result: { status: "success", data: CrdtDataObject[] } }
```

---

### 1.16 Use setActivityDebounceTime() to Control CRDT Activity Flush Frequency

**Impact: MEDIUM (Prevents excessive activity records from batched editor keystrokes)**

By default, Velt batches CRDT editor keystrokes into a single activity log record over a 10-minute batching window before flushing to the activity log feed. Call `setActivityDebounceTime()` on `CrdtElement` to tune the batching window duration — use a shorter window for near-real-time audit trails, or a longer one to reduce write volume.

**Incorrect (relying on the 10-minute default when a different cadence is needed):**

```typescript
// Default batching window is 600,000 ms (10 minutes) — too long for audit trail use cases
const crdtElement = client.getCrdtElement();
// No debounce configuration; activity records are batched for a full 10-minute window
```

**Correct (React / Next.js — 30-second batching window):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function CrdtActivityDebounceSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const crdtElement = client.getCrdtElement();

    // Batch CRDT editor edit activities over a 30-second window before flushing
    // Default: 600000 (10 minutes) | Minimum enforced: 10000 (10 seconds)
    crdtElement.setActivityDebounceTime(30000);
  }, [client]);
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
// Obtain CrdtElement after Velt client is initialized
const crdtElement = client.getCrdtElement();

// Batch CRDT editor edit activities over a 30-second window before flushing
crdtElement.setActivityDebounceTime(30000);
```

---

### 1.17 Use type:'array' Store for Collaborative Ordered Lists

**Impact: HIGH (Array stores use Y.Array semantics for conflict-free ordered-list merging; using a text store to serialize JSON arrays loses per-element merge granularity and causes data loss on concurrent edits)**

An array store is backed by Yjs `Y.Array` and is the correct type for any ordered, list-shaped collaborative data (todo lists, item queues, ordered sequences). The `useStore` hook (React) and `createVeltStore` factory (non-React) both accept `type: 'array'`. The hook handles initialization, real-time subscriptions, and cleanup automatically.

Always guard the returned `value` with `Array.isArray()` before calling `.map()` or spreading, because the value is `null` before the store is hydrated.

Do not serialize an array to JSON and store it in a `text` store — this loses per-element merge granularity and causes entire-array replacement on concurrent edits.

**Correct (React — useStore with type:'array'):**

```tsx
import { useStore } from '@veltdev/crdt-react';

interface Item {
  id: string;
  name: string;
}

function CollaborativeList() {
  const {
    value: items,
    update: updateItems,
    store,
    isLoading,
    error,
  } = useStore<Item[]>({
    storeId: 'my-array-store',
    type: 'array',
    initialValue: [{ id: '1', name: 'First item' }],
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Guard before map/spread — value is null until the store is hydrated
  const itemList = Array.isArray(items) ? items : [];

  // Add a new item — read the latest synchronous value from store inside handlers
  const addItem = (name: string) => {
    const current = store.getValue() || [];
    if (Array.isArray(current)) {
      updateItems([...current, { id: crypto.randomUUID(), name }]);
    }
  };

  // Remove an item
  const removeItem = (id: string) => {
    const current = store.getValue() || [];
    if (Array.isArray(current)) {
      updateItems(current.filter((item) => item.id !== id));
    }
  };

  return (
    <ul>
      {itemList.map((item) => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
```

**Correct (non-React — createVeltStore with type:'array'):**

```js
import { createVeltStore } from '@veltdev/crdt';

async function initStore(veltClient) {
  const store = await createVeltStore({
    id: 'my-array-store',
    type: 'array',
    initialValue: [{ id: '1', name: 'First item' }],
    veltClient,
  });
  if (!store) return;

  // Seed UI with current value
  renderItems(Array.isArray(store.getValue()) ? store.getValue() : []);

  // Subscribe to all future changes (local and remote)
  const unsubscribe = store.subscribe((newItems) => {
    renderItems(Array.isArray(newItems) ? newItems : []);
  });

  // Call unsubscribe when the component/view is torn down
  return unsubscribe;
}
```

**forceResetInitialContent (optional):**

```tsx
const { value: items } = useStore<Item[]>({
  storeId: 'my-array-store',
  type: 'array',
  initialValue: defaultItems,
  forceResetInitialContent: true,
});
```

---

### 1.18 Use type:'map' Store for Collaborative Key-Value Objects

**Impact: HIGH (Map stores use Y.Map semantics for per-key conflict-free merging; using a text store to serialize objects loses key-level merge granularity and causes full-object replacement on concurrent edits)**

A map store is backed by Yjs `Y.Map` and is the correct type for any key-value shaped collaborative data (settings, form state, configuration objects). The `useStore` hook (React) and `createVeltStore` factory (non-React) both accept `type: 'map'`. The hook handles initialization, real-time subscriptions, and cleanup automatically.

Always guard the returned `value` with `typeof value === 'object' && value !== null && !Array.isArray(value)` before iterating with `Object.entries()` or `Object.keys()`, because the value is `null` before the store is hydrated.

Do not serialize an object to JSON and store it in a `text` store — this loses per-key merge granularity and causes entire-object replacement on concurrent edits.

**Correct (React — useStore with type:'map'):**

```tsx
import { useStore } from '@veltdev/crdt-react';

type DataMap = Record<string, string>;

function CollaborativeKVStore() {
  const {
    value: entries,
    update: updateEntries,
    store,
    isLoading,
    error,
  } = useStore<DataMap>({
    storeId: 'my-map-store',
    type: 'map',
    initialValue: { key1: 'value1' },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Guard: value is a plain object (not array, not null) before iterating
  const entriesMap =
    entries && typeof entries === 'object' && !Array.isArray(entries) ? entries : {};

  // Set or overwrite a key — read latest synchronous value from store inside handlers
  const setKey = (key: string, val: string) => {
    const current = store.getValue() || {};
    updateEntries({ ...current, [key]: val });
  };

  // Remove a key
  const deleteKey = (key: string) => {
    const current = store.getValue() || {};
    const updated = { ...current };
    delete updated[key];
    updateEntries(updated);
  };

  return (
    <ul>
      {Object.entries(entriesMap).map(([key, value]) => (
        <li key={key}>
          {key}: {value}
          <button onClick={() => deleteKey(key)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
```

**Correct (non-React — createVeltStore with type:'map'):**

```js
import { createVeltStore } from '@veltdev/crdt';

async function initStore(veltClient) {
  const store = await createVeltStore({
    id: 'my-map-store',
    type: 'map',
    initialValue: { key1: 'value1' },
    veltClient,
  });
  if (!store) return;

  // Seed UI with current value
  renderEntries(store.getValue() || {});

  // Subscribe to all future changes (local and remote)
  const unsubscribe = store.subscribe((newData) => {
    renderEntries(newData && typeof newData === 'object' && !Array.isArray(newData) ? newData : {});
  });

  return unsubscribe;
}
```

**forceResetInitialContent (optional):**

```tsx
const { value: entries } = useStore<DataMap>({
  storeId: 'my-map-store',
  type: 'map',
  initialValue: defaultEntries,
  forceResetInitialContent: true,
});
```

---

### 1.19 Use type:'text' Store for Collaborative Plain Text

**Impact: HIGH (Text stores use Y.Text semantics for character-level conflict-free merging; binding a textarea to this store enables real-time collaborative plain-text editing without managing subscriptions manually)**

A text store is backed by Yjs `Y.Text` and is the correct type for any plain-text collaborative data (notes, code snippets, simple text fields). The `useStore` hook (React) and `createVeltStore` factory (non-React) both accept `type: 'text'`. The hook handles initialization, real-time subscriptions, and cleanup automatically.

Always coalesce the reactive `value` with `?? ''` (or `|| ''`) before binding it to a textarea or display element, because the value is `null` before the store is hydrated.

Do not use the `map` or `array` type to store plain text, and do not split a single text document into multiple stores to work around merge conflicts — `Y.Text` already handles concurrent character-level edits correctly.

**Correct (React — useStore with type:'text'):**

```tsx
import { useStore } from '@veltdev/crdt-react';

function CollaborativeNotepad() {
  const {
    value: text,
    update: updateText,
    isLoading,
    error,
  } = useStore<string>({
    storeId: 'my-text-store',
    type: 'text',
    initialValue: '',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <textarea
      // Coalesce null to empty string — value is null before the store is hydrated
      value={text ?? ''}
      onChange={(e) => updateText(e.target.value)}
      placeholder="Start typing..."
    />
  );
}
```

**Correct (non-React — createVeltStore with type:'text'):**

```js
import { createVeltStore } from '@veltdev/crdt';

async function initStore(veltClient) {
  const store = await createVeltStore({
    id: 'my-text-store',
    type: 'text',
    initialValue: '',
    veltClient,
  });
  if (!store) return;

  // Seed the UI with the current value
  const textarea = document.querySelector('.notepad-textarea');
  if (textarea) textarea.value = store.getValue() || '';

  // Subscribe to all future changes (local and remote)
  const unsubscribe = store.subscribe((newText) => {
    // Only update the textarea if it is not focused to avoid cursor jump
    if (textarea && textarea !== document.activeElement) {
      textarea.value = typeof newText === 'string' ? newText : '';
    }
  });

  // Wire textarea input to store.update()
  if (textarea) {
    textarea.addEventListener('input', () => {
      store.update(textarea.value);
    });
  }

  return unsubscribe;
}
```

**forceResetInitialContent (optional):**

```tsx
const { value: text } = useStore<string>({
  storeId: 'my-text-store',
  type: 'text',
  initialValue: defaultText,
  forceResetInitialContent: true,
});
```

---

### 1.20 Use type:'xml' Store with Yjs APIs — Never Call update()

**Impact: CRITICAL (XML stores do NOT support the update() method — calling it is a no-op or causes errors; all mutations must go through store.getXml() (Y.XmlFragment) and Yjs APIs directly, and the yjs package must be installed separately)**

An XML store is backed by Yjs `Y.XmlFragment` and is the correct type for tree-shaped collaborative data (outline editors, structured documents, or any DOM-like hierarchy). Unlike `text`, `map`, and `array` stores, **the XML store does not use `update()`**. All mutations must go through Yjs APIs directly via `store.getXml()`.

The `xml` type also requires the `yjs` package as a direct dependency — install it with `npm i yjs` in addition to the Velt CRDT packages.

Do not call `update()` on an XML store — it is not supported and will not propagate mutations. Do not use `type: 'xml'` for plain text or flat key-value data; use `type: 'text'` or `type: 'map'` instead.

**Correct (React — useStore with type:'xml', mutations via store.getXml()):**

```tsx
import { useStore } from '@veltdev/crdt-react';
import * as Y from 'yjs'; // requires: npm i yjs
import { useEffect, useRef, useState } from 'react';

interface TreeNode {
  id: string;
  text: string;
  children: TreeNode[];
}

function CollaborativeOutline() {
  const xmlRef = useRef<Y.XmlFragment | null>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);

  // useStore returns store, isLoading, error — there is no update() for xml stores
  const { store, isLoading, error } = useStore<string>({
    storeId: 'my-xml-store',
    type: 'xml',
  });

  useEffect(() => {
    if (!store) return;

    // Get the raw Y.XmlFragment — all mutations go through this object
    const xml = store.getXml() as unknown as Y.XmlFragment | null;
    if (!xml) return;
    xmlRef.current = xml;

    // Populate with initial content if the document is empty
    // Wrap mutations in doc.transact() for atomic batching
    if (xml.length === 0) {
      const doc = store.getDoc();
      doc.transact(() => {
        const el = new Y.XmlElement('node');
        el.setAttribute('id', 'root-1');
        el.setAttribute('text', 'Getting Started');
        xml.insert(0, [el]);
      });
    }

    // Seed React state with the current tree
    setNodes(xmlFragmentToNodes(xml));

    // Subscribe to all future changes (local and remote)
    const unsub = store.subscribe(() => {
      if (xmlRef.current) {
        setNodes(xmlFragmentToNodes(xmlRef.current));
      }
    });

    return () => unsub();
  }, [store]);

  // Mutate via Yjs APIs — setAttribute is fine-grained and merges better than replacement
  const updateNodeText = (nodeId: string, newText: string) => {
    const xml = xmlRef.current;
    if (!xml) return;
    const el = findElementById(xml, nodeId);
    if (el) el.setAttribute('text', newText);
  };

  // Add a child node inside a transaction for atomicity
  const addNode = (text: string) => {
    const xml = xmlRef.current;
    if (!xml || !store) return;
    const doc = store.getDoc();
    doc.transact(() => {
      const el = new Y.XmlElement('node');
      el.setAttribute('id', crypto.randomUUID());
      el.setAttribute('text', text);
      xml.insert(xml.length, [el]);
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.id}>
          <input
            value={node.text}
            onChange={(e) => updateNodeText(node.id, e.target.value)}
          />
        </li>
      ))}
    </ul>
  );
}

// Helper: convert Y.XmlFragment to a plain-object tree
function xmlFragmentToNodes(container: Y.XmlFragment | Y.XmlElement): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (let i = 0; i < container.length; i++) {
    const child = container.get(i);
    if (child instanceof Y.XmlElement && child.nodeName === 'node') {
      nodes.push({
        id: child.getAttribute('id') || '',
        text: child.getAttribute('text') || '',
        children: xmlFragmentToNodes(child),
      });
    }
  }
  return nodes;
}

// Helper: find a Y.XmlElement by 'id' attribute (recursive)
function findElementById(
  container: Y.XmlFragment | Y.XmlElement,
  id: string
): Y.XmlElement | null {
  for (let i = 0; i < container.length; i++) {
    const child = container.get(i);
    if (child instanceof Y.XmlElement) {
      if (child.getAttribute('id') === id) return child;
      const found = findElementById(child, id);
      if (found) return found;
    }
  }
  return null;
}
```

**Correct (non-React — createVeltStore with type:'xml'):**

```js
import { createVeltStore } from '@veltdev/crdt';
import * as Y from 'yjs'; // requires: npm i yjs

async function initStore(veltClient) {
  const store = await createVeltStore({
    id: 'my-xml-store',
    type: 'xml',
    // No initialValue — seed via Yjs APIs after checking xml.length === 0
    veltClient,
  });
  if (!store) return;

  const xml = store.getXml();
  if (!xml) return;

  // Populate with initial content if the document is empty
  if (xml.length === 0) {
    const doc = store.getDoc();
    doc.transact(() => {
      const el = new Y.XmlElement('node');
      el.setAttribute('id', 'root-1');
      el.setAttribute('text', 'Getting Started');
      xml.insert(0, [el]);
    });
  }

  // Seed the UI
  renderTree(xml);

  // Subscribe to all future changes (local and remote)
  const unsubscribe = store.subscribe(() => {
    renderTree(xml);
  });

  return unsubscribe;
}
```

**Force-resetting XML initial content:**

```tsx
const xml = store.getXml() as unknown as Y.XmlFragment | null;
if (!xml || !store) return;

const doc = store.getDoc();
doc.transact(() => {
  // Delete all existing content, then re-populate
  if (xml.length > 0) xml.delete(0, xml.length);
  populateInitialContent(xml);
});
```

---

### 1.21 Use update() Method to Modify Store Values

**Impact: HIGH (Ensures changes sync to all collaborators)**

Always use the store's `update()` method to modify values. Direct mutation bypasses CRDT synchronization and won't propagate to other users.

**Incorrect (direct mutation - won't sync):**

```tsx
function Editor() {
  const { value } = useStore<string>({ storeId: 'note', type: 'text' });

  const handleChange = (e) => {
    // Direct assignment - other users won't see this
    value = e.target.value;
  };

  return <input onChange={handleChange} />;
}
```

**Correct (React - using update from hook):**

```tsx
import { useStore } from '@veltdev/crdt-react';

function Editor() {
  const { value, update } = useStore<string>({
    storeId: 'my-collab-note',
    type: 'text',
  });

  const handleChange = (e) => {
    update(e.target.value); // Syncs to all collaborators
  };

  return <input value={value ?? ''} onChange={handleChange} />;
}
```

**Correct (Vanilla JS):**

```ts
const store = await createVeltStore<string>({
  id: 'doc',
  type: 'text',
  veltClient,
});

// Use store.update() for changes
store.update('Hello, collaborative world!');
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 4: Set or update the store value)

---

### 1.22 Use useStore (v2) for Reactive CRDT Stores with Status, Sync, and Error State

**Impact: CRITICAL (v2 useStore hook is the canonical entry point; without it, you lose status/sync/error reactivity and forceResetInitialContent, and your code stays pinned to deprecated v1 surface)**

In v2 of `@veltdev/crdt-react`, `useStore<T>` is the canonical React hook for creating a CRDT store. It replaces the v1 `useVeltCrdtStore` hook and surfaces reactive `isLoading`, `isSynced`, `status`, and `error` state alongside the same `value` / `update` / `store` / `versions` surface. The non-React `createVeltStore` factory remains the entry point for Vue, Angular, and vanilla JS.

Wire UI state to the hook's reactive return fields (or `store.subscribe` in non-React) rather than reading Yjs internals directly. The hook handles initialization, real-time subscriptions, and cleanup automatically.

**Correct (React — read reactive state from the hook):**

```tsx
import { useStore } from '@veltdev/crdt-react';

interface Item { id: string; name: string; }

function Component() {
  const {
    value: items,
    update: updateItems,
    store,
    isLoading,
    isSynced,
    status,
    error,
  } = useStore<Item[]>({
    storeId: 'my-array-store',
    type: 'array', // 'text' | 'map' | 'array' | 'xml' | 'xmltext'
    initialValue: [{ id: '1', name: 'First item' }],
    onError: (err) => console.error('CRDT error:', err),
  });

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading) return <div>Connecting... ({status})</div>;

  const list = Array.isArray(items) ? items : [];
  return <ul>{list.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;
}
```

**Correct (non-React — createVeltStore with v2 config surface):**

```js
import { createVeltStore } from '@veltdev/crdt';
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_API_KEY');
client.setDocument('my-document-id');

// Gate on Velt readiness before creating the store
client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const store = await createVeltStore({
    id: 'my-array-store',
    type: 'array',
    initialValue: [{ id: '1', name: 'First item' }],
    veltClient: client,
    // v2 additions
    forceResetInitialContent: false, // if true, always reset to initialValue on init
    contentKey: 'content',           // Yjs shared-type content key
    debounceMs: 0,
    enablePresence: true,
  });

  if (!store) return;

  const unsubscribe = store.subscribe((newValue) => {
    console.log('Updated value:', newValue);
  });

  // Teardown
  unsubscribe();
  store.destroy();
});
```

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

// v1: no isLoading / isSynced / status / error / forceResetInitialContent
const { value, update, store } = useVeltCrdtStore<string>({
  id: 'my-doc',          // v2 renamed to storeId
  type: 'text',
});
import { useStore, useAwareness } from '@veltdev/crdt-react';

const { store } = useStore<Item[]>({ storeId: 'my-store', type: 'array', initialValue: [] });
const { remoteStates, localState, setLocalState } = useAwareness(store);

// Set local awareness state — broadcast to peers
setLocalState({
  user: { userId: 'user-1', name: 'John', color: '#ff0000' },
  cursor: { anchor: 0, head: 5 },
});

// Clear local awareness
setLocalState(null);
```

`useStore<T>(config: UseStoreConfig<T>): UseStoreReturn<T>`
| `UseStoreConfig<T>` field | Type | Notes |
|---|---|---|
| `storeId` | `string` | Unique document identifier (renamed from v1 `id`). |
| `type` | `'text' \| 'map' \| 'array' \| 'xml' \| 'xmltext'` | Yjs shared-type. `'xmltext'` is new in v2. |
| `initialValue` | `T` | Applied only when remote state is empty (unless `forceResetInitialContent`). |
| `debounceMs` | `number` | Throttle backend writes (ms). Default `0`. |
| `enablePresence` | `boolean` | Default `true`. |
| `forceResetInitialContent` | `boolean` | **New in v2.** If `true`, always reset to `initialValue` on init (template flows). |
| `onError` | `(err) => void` | **New in v2.** Error callback. |
| `veltClient` | `VeltClient` | Optional explicit client; falls back to `VeltProvider` context. |
| `UseStoreReturn<T>` field | Type | Notes |
|---|---|---|
| `value` | `T \| null` | Current value, reactively updated. |
| `update` | `(newValue: T) => void` | Replace the entire store value. |
| `store` | `Store<T> \| null` | Underlying store instance for advanced use. |
| `isLoading` | `boolean` | **New in v2.** `true` while initializing. |
| `isSynced` | `boolean` | **New in v2.** `true` when connected and synced. |
| `status` | `'connecting' \| 'connected' \| 'disconnected'` | **New in v2.** Reactive connection status. |
| `error` | `Error \| null` | **New in v2.** Init error, if any. |
| `versions` | `Version[]` | Reactive list of saved versions. |
| `saveVersion / getVersions / getVersionById / restoreVersion / setStateFromVersion` | functions | Version management — same surface as v1. |
`useAwareness(store)` wraps the Yjs Awareness instance from a store. It is reactive: `remoteStates` updates as peers change their awareness, `setLocalState` is a stable setter.
`useAwareness` accepts `null` safely — pair it with the `store` return value from `useStore` without a guard.
`createVeltStore` (from `@veltdev/crdt`) is unchanged in entry-point name but the `StoreConfig` accepts the new v2 fields below. Returns `Promise<Store<T> | null>` (resolves to `null` on init failure).
| `StoreConfig<T>` field | Type | Notes |
|---|---|---|
| `id` / `type` / `initialValue` / `veltClient` / `debounceMs` / `enablePresence` | — | Same as v1. |
| `forceResetInitialContent` | `boolean` | **New in v2.** Default `false`. |
| `contentKey` | `string` | **New in v2.** Default `'content'`. |
| `userId` | `string` | **New in v2.** Update attribution. |
| `collection` | `string` | **New in v2.** Document grouping namespace. |
| `logLevel` | `'silent' \| 'error' \| 'warn' \| 'debug'` | **New in v2.** Default `'error'`. |
- [ ] React code uses `useStore` (v2) — not `useVeltCrdtStore` (v1)
- [ ] `storeId` is used instead of `id` in React config
- [ ] UI gates on `isLoading` / `error` reactive fields before reading `value`
- [ ] `onError` callback is wired for production code
- [ ] Awareness state is read via `useAwareness(store)` — not by reaching for `store.getAwareness()` manually in React
- [ ] Non-React code uses the same `createVeltStore` entry point with v2 config fields where needed (`forceResetInitialContent`, `contentKey`, etc.)
- [ ] Subscriptions in non-React always pair `store.subscribe()` with the returned unsubscribe call

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## APIs > React: useStore(), React: useAwareness(), Non-React: createVeltStore(), Store Methods)

---

### 1.23 Use VeltCrdtStoreMap for Runtime Debugging

**Impact: LOW (Enables real-time inspection of CRDT state)**

`window.VeltCrdtStoreMap` is a global debugging interface automatically created by Velt CRDT. Use it in the browser console to inspect stores, monitor values, and diagnose sync issues.

**Browser Console Commands:**

```js
// Get a specific store by ID
const store = window.VeltCrdtStoreMap.get('my-store-id');
console.log('Current value:', store.getValue());

// Get the first registered store (if ID unknown)
const firstStore = window.VeltCrdtStoreMap.get();

// Get all active stores
const allStores = window.VeltCrdtStoreMap.getAll();
console.log('Total stores:', Object.keys(allStores).length);

// Subscribe to changes for debugging
store.subscribe((value) => {
  console.log('Value changed:', value);
});
```

**Monitor Store Registration Events:**

```js
// Fired when a new store is registered
window.addEventListener('veltCrdtStoreRegister', (event) => {
  console.log('Store registered:', event.detail.id);
});

// Fired when a store is destroyed
window.addEventListener('veltCrdtStoreUnregister', (event) => {
  console.log('Store unregistered:', event.detail.id);
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Debugging > #### window.VeltCrdtStoreMap)

---

### 1.24 Use Webhooks to Listen for CRDT Data Changes

**Impact: HIGH (Enables server-side reactions to collaborative data changes)**

CRDT stores support webhook notifications for data changes, allowing server-side systems to react to collaborative edits. Webhooks are disabled by default and use a 5-second debounce to batch rapid changes.

**Incorrect (no server-side awareness of CRDT changes):**

```typescript
// Server has no way to know when collaborative data changes
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
// Only client-side subscribe() is available
```

**Correct (enabling webhooks for server-side notifications):**

```jsx
import { useVeltClient } from '@veltdev/react';

function CrdtWebhookSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const crdtElement = client.getCrdtElement();

    // Enable webhooks for CRDT data changes
    crdtElement.enableWebhook();

    // Optional: customize debounce time (default 5000ms, minimum 5000ms)
    crdtElement.setWebhookDebounceTime(10000);
  }, [client]);
}
```

**Subscribing to `updateData` Events (Client-Side):**

```jsx
import { useVeltClient } from '@veltdev/react';

function CrdtChangeListener() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const crdtElement = client.getCrdtElement();

    // on() returns an Observable — call .subscribe() on it
    const subscription = crdtElement.on("updateData").subscribe((eventData) => {
      console.log('CRDT data changed:', eventData);
    });

    return () => subscription.unsubscribe();
  }, [client]);
}
```

**Webhook payload structure (sent to your webhook URL):**

```typescript
// POST to your webhook endpoint
{
  notificationSource: 'crdt',
  crdtData: {
    id: string;               // Editor/store ID
    data: unknown;             // Current content
    lastUpdatedBy: string;     // User ID of last editor
    sessionId: string | null;  // Session ID
    lastUpdate: string;        // ISO timestamp
  }
}
```

---

### 1.25 Use createVeltStore for Non-React CRDT Stores

**Impact: CRITICAL (Required for Vue, Angular, vanilla JS integrations)**

For Vue, Angular, or vanilla JavaScript, use `createVeltStore` from `@veltdev/crdt`. You must pass the initialized `veltClient` and manually handle cleanup.

**Incorrect (missing veltClient):**

```ts
import { createVeltStore } from '@veltdev/crdt';

// Missing veltClient - will fail
const store = await createVeltStore({
  id: 'my-document',
  type: 'text',
});
```

**Correct (with veltClient and cleanup):**

```ts
import { createVeltStore } from '@veltdev/crdt';
import { initVelt } from '@veltdev/client';

// Step 1: Initialize Velt
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Authenticate user
await veltClient.setVeltAuthProvider({
  user: { userId: 'user-1', name: 'John' },
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-1' }),
    });
    const { token } = await resp.json();
    return token;
  },
});

// Step 3: Set document context
await veltClient.setDocument('my-document-id');

// Step 4: Create store
const store = await createVeltStore<string>({
  id: 'my-document',
  type: 'text',
  initialValue: 'Hello, world!',
  veltClient,
});

// Step 5: Subscribe to changes
const unsubscribe = store.subscribe((newValue) => {
  console.log('Updated value:', newValue);
});

// Step 6: Update value
store.update('Hello, collaborative world!');

// Step 7: Cleanup when done
unsubscribe();
store.destroy();
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 3: Initialize a CRDT store > Other Frameworks)

---

## 2. Tiptap Integration

**Impact: CRITICAL**

Rich text collaborative editing with Tiptap. Covers installation, setup, history conflict, cursor styling, and testing.

### 2.1 Load Tiptap Editor with SSR Disabled in Next.js

**Impact: CRITICAL (Without this, the app will crash with g.catch or window/document errors on first load)**

Tiptap, y-prosemirror, and @veltdev/tiptap-velt-comments use browser-only APIs (DOM, window, document). In Next.js, these packages cause server-side rendering crashes if imported normally. The editor component must be loaded with `next/dynamic` and `ssr: false`.

**Incorrect (direct import — causes SSR crash):**

```tsx
// app/dashboard/[docId]/page.tsx
'use client';
import { TiptapCollabEditor } from '@/components/velt/TiptapCollabEditor';

export default function DocumentPage() {
  // ❌ This will crash with "g.catch is not a function" or similar SSR errors
  return <TiptapCollabEditor documentId="doc-1" />;
}
```

**Correct (dynamic import with SSR disabled):**

```tsx
// app/dashboard/[docId]/page.tsx
'use client';
import dynamic from 'next/dynamic';

const TiptapCollabEditor = dynamic(
  () => import('@/components/velt/TiptapCollabEditor').then(m => ({ default: m.TiptapCollabEditor })),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

export default function DocumentPage() {
  // ✅ Editor only loads in the browser, no SSR crash
  return <TiptapCollabEditor documentId="doc-1" />;
}
```

**This also applies to:**

```tsx
// components/velt/TiptapCollabEditor.tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
// ... rest of component
```

---

### 2.2 Use useVeltTiptapCrdtExtension Hook for React Tiptap (v1 — DEPRECATED)

**Impact: LOW (v1 API retained for backwards-compatibility only. New integrations must use the v2 useCollaboration hook (see tiptap-collaboration-manager.md and tiptap-v1-to-v2-migration.md).)**

> **DEPRECATED:** This rule documents the v1 React Tiptap CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `useCollaboration` from `@veltdev/tiptap-crdt-react`** — see `rules/shared/tiptap/tiptap-collaboration-manager.md` for the canonical v2 pattern and `rules/shared/tiptap/tiptap-v1-to-v2-migration.md` for the migration table.

In React, the v1 API uses `useVeltTiptapCrdtExtension` to get the `VeltCrdt` extension for Tiptap. Pass it to `useEditor` extensions array.

**Incorrect (missing VeltCrdt extension):**

```tsx
const editor = useEditor({
  extensions: [StarterKit],
  content: '',
});
// No CRDT - collaboration won't work
```

**Correct (with VeltCrdt extension):**

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useVeltTiptapCrdtExtension } from '@veltdev/tiptap-crdt-react';

function CollaborativeEditor() {
  const { VeltCrdt } = useVeltTiptapCrdtExtension({
    editorId: 'velt-tiptap-crdt-demo',
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false,  // IMPORTANT: Disable history (Tiptap v3 uses undoRedo, not history)
      }),
      ...(VeltCrdt ? [VeltCrdt] : []),
    ],
    content: '',
  }, [VeltCrdt]);

  return <EditorContent editor={editor} />;
}
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 3: Initialize Velt CRDT Extension > React / Next.js)

---

### 2.3 Add CSS for Collaboration Cursors in Tiptap

**Impact: CRITICAL (Without this CSS, remote user cursors render as thick full-width blocks instead of thin carets)**

Add CSS styles to make collaboration cursors/carets visible as thin lines. Without styling, cursors appear as thick full-width blocks.

**Required CSS (add to `globals.css`):**

```css
/* ===== y-prosemirror cursors (used by Velt CRDT) ===== */

/* Thin caret line */
.ProseMirror .ProseMirror-yjs-cursor {
  position: relative;
  border-left: 2px solid #0d0d0d;
  border-right: none;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  word-break: normal;
}

/* Force the inner span to inline so cursor doesn't expand to full width */
.ProseMirror .ProseMirror-yjs-cursor > span {
  display: inline !important;
}

/* Floating username label above the caret */
.ProseMirror .ProseMirror-yjs-cursor > div {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-weight: 600;
  font-style: normal;
  line-height: normal;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  color: white;
  white-space: nowrap;
  user-select: none;
}

/* Selection highlight for remote users */
.ProseMirror .ProseMirror-yjs-selection {
  opacity: 0.3;
}

/* ===== Tiptap collaboration-cursor extension (alternative integration) ===== */

.ProseMirror .collaboration-cursor__caret,
.ProseMirror .collaboration-carets__caret {
  border-left: 1px solid #0d0d0d !important;
  border-right: 1px solid #0d0d0d !important;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

/* Username label above the caret */
.ProseMirror .collaboration-cursor__label,
.ProseMirror .collaboration-carets__label {
  border-radius: 3px 3px 3px 0;
  color: #0d0d0d;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  left: -1px;
  line-height: normal;
  padding: 0.1rem 0.3rem;
  position: absolute;
  top: -1.4em;
  user-select: none;
  white-space: nowrap;
}
```

The `!important` flags and `.ProseMirror` parent selector are required because y-prosemirror applies inline `background-color` styles that override class-based styling without them. The `> span { display: inline !important }` rule is critical for the y-prosemirror integration — without it, the cursor span renders as a block element spanning the full editor width.

**Optional: Custom cursor colors per user:**

```css
/* y-prosemirror: colors are set via inline styles by the extension */
/* Tiptap collaboration-cursor: override with data attributes */
.collaboration-cursor__caret[data-user-id="user-1"] {
  border-color: #3b82f6;
}
.collaboration-cursor__label[data-user-id="user-1"] {
  background-color: #3b82f6;
  color: white;
}
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 4: Add CSS for Collaboration Cursor)

---

### 2.4 Disable Tiptap History When Using CRDT

**Impact: CRITICAL (Prevents undo/redo conflicts and content desync)**

Tiptap's built-in history extension conflicts with CRDT's undo/redo mechanism. You MUST disable it to prevent content desync and unexpected undo behavior.

**Incorrect (history enabled - causes conflicts):**

```tsx
const { extension } = useCollaboration({ editorId: 'my-tiptap-editor' });

const editor = new Editor({
  element: editorElRef.current,
  extensions: [
    StarterKit,  // history enabled by default!
    extension,
  ],
});
// Undo/redo will conflict with CRDT, causing desync
```

**Correct (history explicitly disabled):**

```tsx
const { extension } = useCollaboration({ editorId: 'my-tiptap-editor' });

useEffect(() => {
  if (!extension || !editorElRef.current) return;
  const editor = new Editor({
    element: editorElRef.current,
    extensions: [
      StarterKit.configure({
        undoRedo: false,  // CRITICAL: Disable history (Tiptap v3 uses undoRedo)
      }),
      extension,
    ],
    content: '',
  });
  return () => editor.destroy();
}, [extension]);
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Notes > **Disable history**: Turn off Tiptap `history` when using collaboration)

---

### 2.5 Install Tiptap CRDT Packages Correctly

**Impact: CRITICAL (Missing packages prevent Tiptap collaboration)**

Install all required Tiptap and Velt CRDT packages. React apps use `@veltdev/tiptap-crdt-react`; other frameworks use `@veltdev/tiptap-crdt`.

**Correct (React / Next.js):**

```bash
npm install @veltdev/tiptap-crdt-react @veltdev/tiptap-crdt @veltdev/react @veltdev/types @tiptap/core @tiptap/starter-kit yjs
```

**Correct (Other Frameworks - Vue, Angular, vanilla):**

```bash
npm install @veltdev/tiptap-crdt @veltdev/client @tiptap/core @tiptap/starter-kit yjs
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 1: Install Dependencies)

---

### 2.6 Integrate TiptapVeltComments Extension When Using Comments with CRDT

**Impact: CRITICAL (Without the TiptapVeltComments extension in the editor, the app will FREEZE when users try to add comments)**

When both Comments and CRDT features are selected for a Tiptap editor, the `TiptapVeltComments` extension **must** be added to the editor's extensions array. The global `<VeltComments>` component alone is not sufficient — it initializes the comment infrastructure but the editor needs the extension to handle comment creation and rendering. Without it, the app freezes when a user tries to add a comment.

**Required integration (4 parts):**

```tsx
// VeltComments must have textMode={false} and shadowDom={false} when using TipTap —
// the editor extension handles text commenting, not the default text mode.
<VeltComments textMode={false} shadowDom={false} />
import { TiptapVeltComments, addComment, renderComments } from "@veltdev/tiptap-velt-comments";
import { useCommentAnnotations } from "@veltdev/react";
import { useCollaboration } from "@veltdev/tiptap-crdt-react";

const { extension } = useCollaboration({ editorId: 'my-tiptap-editor' });

useEffect(() => {
  if (!extension || !editorElRef.current) return;
  const editor = new Editor({
    element: editorElRef.current,
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      TiptapVeltComments,  // MUST be before the CRDT extension
      extension,           // CRDT extension last
    ],
    content: '',
  });
  return () => editor.destroy();
}, [extension]);
const commentAnnotations = useCommentAnnotations();

useEffect(() => {
  if (editor && commentAnnotations?.length) {
    renderComments({ editor, commentAnnotations });
  }
}, [editor, commentAnnotations]);
<button onClick={() => addComment({ editor })}>Add Comment</button>
```

> Note: Older v4 packages exported `triggerAddComment` and `highlightComments` — these are deprecated. Use `addComment` and `renderComments` instead.

**Common mistake — causes FREEZE:**

```tsx
// WRONG: VeltComments wrapper without editor extension
<VeltComments textMode={false} />  // Global wrapper — necessary but NOT sufficient
<TiptapEditor /> // Editor WITHOUT TiptapVeltComments in extensions — FREEZE on comment

// CORRECT: Both global wrapper AND editor extension
<VeltComments textMode={false} />  // Global wrapper
<TiptapEditor /> // Editor WITH TiptapVeltComments in extensions array
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap`

---

### 2.7 Migrate Tiptap CRDT Integrations from v1 to v2

**Impact: HIGH (v1 APIs (useVeltTiptapCrdtExtension, createVeltTiptapCrdtExtension) are deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points)**

The v1 Tiptap CRDT API (`useVeltTiptapCrdtExtension` for React, `createVeltTiptapCrdtExtension` for non-React) is deprecated and remains exported only for backward compatibility. All new integrations must use the v2 entry points (`useCollaboration` / `createCollaboration`), which return a `CollaborationManager` with reactive status, sync state, and a richer Yjs surface. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

### React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `useVeltTiptapCrdtExtension(config)` | `useCollaboration(config)` |
| Extension access | `response.VeltCrdt` | `response.extension` |
| Store access | `response.store` (`VeltTipTapStore`) | `response.manager` (`CollaborationManager`) |
| Version management | `store.saveVersion()`, `store.getVersions()`, `store.setStateFromVersion(v)` | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | Not available | `response.status`, `response.isSynced` |
| Error handling | `onConnectionError` callback | `onError` callback + `response.error` state |
| Sync notification | `onSynced` callback (fires once) | `response.isSynced` (reactive) |
| Editor mounting | `useEditor` with `VeltCrdt` in deps | `new Editor(...)` inside `useEffect([extension])` |
| Cleanup | Automatic on unmount | Automatic on unmount |

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltTiptapCrdtExtension } from '@veltdev/tiptap-crdt-react';

const { VeltCrdt, isLoading, store } = useVeltTiptapCrdtExtension({
  editorId: 'my-doc',
  initialContent: '<p>Hello</p>',
  onSynced: (doc) => console.log('Synced!'),
  onConnectionError: (err) => console.error(err),
});

const editor = useEditor({
  extensions: [
    StarterKit.configure({ undoRedo: false }),
    ...(VeltCrdt ? [VeltCrdt] : []),
  ],
}, [VeltCrdt]);

// Versions
const versions = await store.getVersions();
await store.setStateFromVersion(versions[0]);
```

**Correct (v2):**

```tsx
import { useCollaboration } from '@veltdev/tiptap-crdt-react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const editorElRef = useRef<HTMLDivElement>(null);

const { extension, isLoading, isSynced, status, error, manager } = useCollaboration({
  editorId: 'my-doc',
  initialContent: '<p>Hello</p>',
  onError: (err) => console.error(err),
});

useEffect(() => {
  if (!extension || !editorElRef.current) return;
  const editor = new Editor({
    element: editorElRef.current,
    extensions: [StarterKit.configure({ undoRedo: false }), extension],
    content: '',
  });
  return () => editor.destroy();
}, [extension]);

// Versions
const versions = await manager.getVersions();
await manager.restoreVersion(versions[0].versionId);

// Status (new)
if (error) return <div>Error: {error.message}</div>;
if (isLoading) return <div>Connecting...</div>;
```

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `createVeltTiptapCrdtExtension(config, callback)` | `await createCollaboration(config)` |
| Return value | Cleanup function | `CollaborationManager` instance |
| Extension access | Via callback: `response.VeltCrdt` | Via method: `manager.createExtension()` |
| Store access | Via callback: `response.store` | Via method: `manager.getStore()` |
| Version management | `store.saveVersion()`, `store.getVersions()`, `store.setStateFromVersion(v)` | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | Not available | `manager.onStatusChange()`, `manager.onSynced()` |
| Cleanup | Call returned cleanup function | `manager.destroy()` or `editor.destroy()` (triggers auto-cleanup) |
| Error handling | `onConnectionError` callback | `onError` callback |
| Sync notification | `onSynced` callback (fires once) | `manager.onSynced()` (subscribable) |
| Yjs internals | `store.getYDoc()`, `store.getYXml()` | `manager.getDoc()`, `manager.getXmlFragment()`, `manager.getAwareness()`, `manager.getProvider()` |

**Incorrect (v1 — deprecated):**

```js
import { createVeltTiptapCrdtExtension } from '@veltdev/tiptap-crdt';

const cleanup = createVeltTiptapCrdtExtension(
  {
    editorId: 'my-doc',
    veltClient: client,
    initialContent: '<p>Hello</p>',
    onSynced: (doc) => console.log('Synced!'),
    onConnectionError: (err) => console.error(err),
  },
  ({ VeltCrdt, store }) => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        ...(VeltCrdt ? [VeltCrdt] : []),
      ],
    });
  }
);

// Later: tear down
cleanup();
```

**Correct (v2):**

```js
import { createCollaboration } from '@veltdev/tiptap-crdt';

// Gate on Velt readiness before creating the manager
client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-doc',
    veltClient: client,
    initialContent: '<p>Hello</p>',
    onError: (err) => console.error(err),
  });

  const editor = new Editor({
    element: document.querySelector('#editor'),
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      manager.createExtension(),
    ],
    content: '',
  });

  // Subscribe to sync (replaces onSynced callback)
  manager.onSynced((synced) => synced && console.log('Synced!'));
  manager.onStatusChange((status) => console.log('Status:', status));

  // Tear down via editor (preferred) or manager.destroy()
  // editor.destroy() cascades to manager.destroy() via the extension's onDestroy hook
});
```

- [ ] All `useVeltTiptapCrdtExtension` imports replaced with `useCollaboration`
- [ ] All `createVeltTiptapCrdtExtension` callback flows replaced with `await createCollaboration(...)`
- [ ] `VeltCrdt` references renamed to `extension`
- [ ] `store.*` version calls migrated to `manager.*` equivalents (`saveVersion`, `getVersions`, `restoreVersion`)
- [ ] `onConnectionError` callbacks renamed to `onError`
- [ ] `onSynced` one-shot callbacks replaced with `manager.onSynced(...)` subscription or `isSynced` reactive state
- [ ] React editor creation moved out of `useEditor` and into `useEffect([extension])` with `new Editor(...)`
- [ ] Non-React flow gated on `client.getVeltInitState().subscribe(...)` before calling `createCollaboration`
- [ ] Old `store.getYDoc` / `store.getYXml` calls replaced with `manager.getDoc` / `manager.getXmlFragment`
- [ ] v1 cleanup function replaced with `manager.destroy()` or relying on editor-driven auto-destroy

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Migration Guide: v1 to v2; ## Legacy API (v1))

---

### 2.8 Test Tiptap Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test Tiptap collaboration by opening the same page with different authenticated users in separate browser profiles.

**Debug with Console:**

```js
// Check store state
window.VeltCrdtStoreMap.get('your-editor-id').getValue();

// Monitor changes
window.VeltCrdtStoreMap.get('your-editor-id').subscribe(v => console.log(v));
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Testing and Debugging)

---

### 2.9 Use HTML String Format for Tiptap CRDT Initial Content

**Impact: HIGH (Passing JSON objects as initialContent renders raw JSON text in the editor instead of formatted content)**

The `initialContent` parameter of `useCollaboration` (v2) — and the deprecated `useVeltTiptapCrdtExtension` (v1) — accepts an **HTML string**, not a JSON object. Passing a JSON object will render raw JSON text in the editor.

**Incorrect (JSON object — renders as raw text):**

```tsx
const { extension } = useCollaboration({
  editorId: 'my-editor',
  // WRONG: This renders as literal JSON text in the editor
  initialContent: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] },
});
```

**Correct (HTML string):**

```tsx
const { extension } = useCollaboration({
  editorId: 'my-editor',
  // CORRECT: HTML string renders as formatted content
  initialContent: '<p>Hello world</p>',
});
```

**Correct (no initial content — let CRDT handle it):**

```tsx
const { extension } = useCollaboration({
  editorId: 'my-editor',
  // CORRECT: Omit initialContent for new documents — CRDT manages content
});
```

**If your backend returns ProseMirror JSON, convert to HTML first:**

```tsx
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';

const veltInitialContent = useMemo(() => {
  if (!backendContent) return undefined;
  if (typeof backendContent === 'string') return backendContent; // Already HTML
  // Convert ProseMirror JSON to HTML
  return generateHTML(backendContent, [StarterKit]);
}, [backendContent]);

const { extension } = useCollaboration({
  editorId: 'my-editor',
  initialContent: veltInitialContent,
});
```

**Force-reset to template (use sparingly — destroys remote state):**

```js
const { extension } = useCollaboration({
  editorId: 'my-tiptap-editor',
  initialContent: '<p>Fresh start!</p>',
  forceResetInitialContent: true,  // Always overwrite remote content on init
});
// Non-React equivalent
const manager = await createCollaboration({
  editorId: 'my-document-id',
  veltClient: client,
  initialContent: '<p>Fresh start!</p>',
  forceResetInitialContent: true,
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap`

---

### 2.10 Use the CollaborationManager API for Status, Versions, and Yjs Internals

**Impact: HIGH (Without using the manager API, you lose access to connection status, sync state, version management, and Yjs escape hatches in v2)**

In v2 of `@veltdev/tiptap-crdt(-react)`, `useCollaboration` (React) and `createCollaboration` (non-React) both surface a `CollaborationManager` instance. The manager is the single entry point for connection status, sync state, version management, and Yjs-level escape hatches. Wire UI state to its observables (or reactive return values) instead of trying to read Yjs internals directly from the editor.

**Correct (React — read reactive state from the hook):**

```tsx
import { useCollaboration } from '@veltdev/tiptap-crdt-react';

const { extension, isLoading, isSynced, status, error, manager } = useCollaboration({
  editorId: 'my-tiptap-editor',
  initialContent: '<p>Start typing...</p>',
  onError: (err) => console.error('Collaboration error:', err),
});

if (error) return <div>Error: {error.message}</div>;
if (isLoading || !extension) return <div>Connecting...</div>;

return (
  <>
    <div>Status: {status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
    <div ref={editorElRef} />
  </>
);
```

**Correct (non-React — subscribe via the manager):**

```js
import { createCollaboration } from '@veltdev/tiptap-crdt';

const manager = await createCollaboration({
  editorId: 'my-document-id',
  veltClient: client,
  initialContent: '<p>Start typing...</p>',
  onError: (err) => console.error('Collaboration error:', err),
});

// Subscribe to status / sync — always store the unsubscribe and call it on teardown
const unsubStatus = manager.onStatusChange((status) => console.log('status', status));
const unsubSynced = manager.onSynced((synced) => console.log('synced', synced));

// Read current values at any time
console.log(manager.status);       // 'connecting' | 'connected' | 'disconnected'
console.log(manager.synced);       // boolean
console.log(manager.initialized);  // boolean

// On teardown
unsubStatus();
unsubSynced();
manager.destroy(); // safe to call multiple times; auto-fires when editor is destroyed
// Save a named snapshot — returns a versionId
const versionId = await manager.saveVersion('Before major edit');

// List versions: [{ versionId, versionName, timestamp }, ...]
const versions = await manager.getVersions();

// Restore by versionId — pushes the restored state to all clients
await manager.restoreVersion(versions[0].versionId);

// Apply a Version object's state locally (no broadcast)
await manager.setStateFromVersion(version);
const doc        = manager.getDoc();         // Y.Doc
const xml        = manager.getXmlFragment(); // Y.XmlFragment | null  (TipTap content root)
const provider   = manager.getProvider();    // SyncProvider
const awareness  = manager.getAwareness();   // Awareness (Yjs awareness protocol)
const crdtStore  = manager.getStore();       // Velt CRDT Store<string>
```

The manager exposes the underlying Yjs primitives for advanced use (custom plugins, debugging, interop with other Yjs tooling). Prefer the manager's high-level methods first; reach for these only when you actually need Yjs-level control.

**Incorrect (poking at the editor for Yjs internals):**

```js
// WRONG: reach for editor.storage or editor.view to find Y.Doc — undefined behaviour
const ydoc = (editor as any).storage?.collaboration?.document;
// SETUP
const unsubStatus = manager.onStatusChange((s) => updateBadge(s));
const unsubSynced = manager.onSynced((synced) => updateBadge(undefined, synced));

// TEARDOWN — call before manager.destroy() and on component unmount
unsubStatus();
unsubSynced();
manager.destroy();
```

Every `manager.on*` method returns an `Unsubscribe` function. Treat them like event listeners — always pair `subscribe` with `unsubscribe` so listeners do not leak:
In React, the `useCollaboration` hook handles this automatically — use the returned reactive `status` / `isSynced` / `error` values instead of calling `manager.onStatusChange` manually unless you need imperative side effects.

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 3, 5, 6, 11; ## APIs)

---

### 2.11 Use Unique editorId for Each Tiptap Instance

**Impact: HIGH (Prevents content cross-contamination)**

Each Tiptap editor must have a unique `editorId`. If you have multiple editors in your app (or across pages), reusing the same ID causes content to merge incorrectly.

**Incorrect (same editorId for different editors):**

```tsx
// Page 1: Document editor
const { extension } = useCollaboration({
  editorId: 'editor',  // Generic ID
});

// Page 2: Notes sidebar
const { extension } = useCollaboration({
  editorId: 'editor',  // Same ID - content will merge!
});
```

**Correct (unique editorId per logical editor):**

```tsx
// Page 1: Document editor
const { extension } = useCollaboration({
  editorId: `document-${documentId}`,  // Unique per document
});

// Page 2: Notes sidebar
const { extension } = useCollaboration({
  editorId: `notes-${documentId}`,  // Different namespace
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Notes > **Unique editorId**: Use a unique `editorId` per editor instance)

---

### 2.12 Use createVeltTipTapStore for Non-React Tiptap (v1 — DEPRECATED)

**Impact: LOW (v1 API retained for backwards-compatibility only. New integrations must use the v2 createCollaboration entry point (see tiptap-collaboration-manager.md and tiptap-v1-to-v2-migration.md).)**

> **DEPRECATED:** This rule documents the v1 non-React Tiptap CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `createCollaboration` from `@veltdev/tiptap-crdt`** — see `rules/shared/tiptap/tiptap-collaboration-manager.md` for the canonical v2 pattern (which covers both React and non-React) and `rules/shared/tiptap/tiptap-v1-to-v2-migration.md` for the migration table.

For Vue, Angular, or vanilla JS, the v1 API uses `createVeltTipTapStore` to create the CRDT store, then get the collaboration extension.

**Correct (vanilla JS implementation):**

```js
import { initVelt } from '@veltdev/client';
import { createVeltTipTapStore } from '@veltdev/tiptap-crdt';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';

// Step 1: Initialize Velt client
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Authenticate user
const user = { userId: 'user-1', name: 'John Doe', color: '#3b82f6' };
await veltClient.setVeltAuthProvider({
  user,
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId }),
    });
    const { token } = await resp.json();
    return token;
  },
});

// Step 3: Set document
await veltClient.setDocument('my-document-id');

// Step 4: Create CRDT store
const store = await createVeltTipTapStore({
  editorId: 'velt-tiptap-crdt-demo',
  veltClient: veltClient,
});

// Step 5: Create TipTap editor
const editor = new Editor({
  element: document.getElementById('editor'),
  extensions: [
    StarterKit.configure({ undoRedo: false }),  // Disable history (Tiptap v3)
    store.getCollabExtension(),
    CollaborationCaret.configure({
      provider: store.getStore().getProvider(),
      user: { name: user.name, color: user.color },
    }),
  ],
  content: '',
});

// Cleanup on unmount
editor.destroy();
store.destroy();
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 3: Initialize Velt CRDT Extension > Other Frameworks)

---

## 3. BlockNote Integration

**Impact: HIGH**

Block-based collaborative editing with BlockNote. v2 adds non-React support and a unified `CollaborationManager` API.

### 3.1 Install BlockNote CRDT Packages Correctly

**Impact: CRITICAL (Missing packages prevent BlockNote collaboration)**

Install all required BlockNote and Velt CRDT packages. React apps use `@veltdev/blocknote-crdt-react`; other frameworks use `@veltdev/blocknote-crdt`. As of v2, non-React BlockNote is supported.

**Correct (React / Next.js):**

```bash
npm install @veltdev/blocknote-crdt-react @veltdev/blocknote-crdt @veltdev/react @veltdev/types @blocknote/core @blocknote/react @blocknote/mantine yjs
```

**Correct (Other Frameworks - Vue, Angular, vanilla):**

```bash
npm install @veltdev/blocknote-crdt @veltdev/client @blocknote/core yjs
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (### Step 1: Install Dependencies)

---

### 3.2 Test BlockNote Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test BlockNote collaboration using different authenticated users in separate browser profiles.

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Testing and Debugging)

---

### 3.3 Use Unique editorId for Each BlockNote Instance

**Impact: HIGH (Prevents content cross-contamination)**

Each BlockNote editor must have a unique `editorId`. Reusing IDs causes content from different editors to merge incorrectly.

**Incorrect (hardcoded generic ID):**

```tsx
import { useCollaboration } from '@veltdev/blocknote-crdt-react';

const { collaborationConfig } = useCollaboration({
  editorId: 'editor',  // Will conflict with other editors
});
```

**Correct (unique ID per editor):**

```tsx
import { useCollaboration } from '@veltdev/blocknote-crdt-react';

const { collaborationConfig } = useCollaboration({
  editorId: `blocknote-${documentId}`,  // Unique per document
});
```

> Both the v2 hook `useCollaboration` and the deprecated v1 hook `useVeltBlockNoteCrdtExtension` accept `editorId` with the same semantics. New code should use `useCollaboration` — see `rules/shared/blocknote/blocknote-collaboration-manager.md`.

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Notes > **Unique editorId**)

---

### 3.4 Use useVeltBlockNoteCrdtExtension for BlockNote Collaboration (v1 — DEPRECATED)

**Impact: LOW (v1 API retained for backwards-compatibility only. New integrations must use the v2 useCollaboration hook (see blocknote-collaboration-manager.md and blocknote-v1-to-v2-migration.md).)**

> **DEPRECATED:** This rule documents the v1 React BlockNote CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `useCollaboration` from `@veltdev/blocknote-crdt-react`** — see `rules/shared/blocknote/blocknote-collaboration-manager.md` for the canonical v2 pattern and `rules/shared/blocknote/blocknote-v1-to-v2-migration.md` for the migration table.

Use `useVeltBlockNoteCrdtExtension` to get the `collaborationConfig` for BlockNote. Pass it to `useCreateBlockNote`.

**Incorrect (missing collaboration config):**

```tsx
const editor = useCreateBlockNote({});
// No collaboration - won't sync
```

**Correct (with collaborationConfig):**

```tsx
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { useVeltBlockNoteCrdtExtension } from '@veltdev/blocknote-crdt-react';

function CollaborativeEditor() {
  const { collaborationConfig, isLoading } = useVeltBlockNoteCrdtExtension({
    editorId: 'YOUR_EDITOR_ID',
    initialContent: JSON.stringify([{ type: 'paragraph', content: '' }]),
  });

  const editor = useCreateBlockNote({
    collaboration: collaborationConfig,
  }, [collaborationConfig]);

  return (
    <BlockNoteView
      editor={editor}
      key={collaborationConfig ? 'collab-on' : 'collab-off'}
    />
  );
}
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (### Step 3: Initialize Velt CRDT Extension)

---

### 3.5 Migrate BlockNote CRDT Integrations from v1 to v2

**Impact: HIGH (v1 API (useVeltBlockNoteCrdtExtension) is deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points)**

The v1 BlockNote CRDT API (`useVeltBlockNoteCrdtExtension` for React) is deprecated and remains exported only for backward compatibility — it internally delegates to `useCollaboration` (v2) via a compatibility wrapper. All new integrations must use the v2 entry points (`useCollaboration` for React, `createCollaboration` for non-React), which return a `CollaborationManager` with reactive status, sync state, first-class version methods, and a richer Yjs surface. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

v2 also introduces non-React BlockNote support via `@veltdev/blocknote-crdt` and `createCollaboration`. In v1, only React was supported.

### React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `useVeltBlockNoteCrdtExtension(config)` | `useCollaboration(config)` |
| Collab config | `response.collaborationConfig` | `response.collaborationConfig` (same usage with `useCreateBlockNote`) |
| Store access | `response.store` (`VeltBlockNoteStore`) | `response.manager` (`CollaborationManager`) |
| Version management | `store.setStateFromVersion(v)` (no save/list/restore on store) | `saveVersion`, `getVersions`, `restoreVersion` returned directly from the hook (first-class) |
| Status tracking | Not available | `response.status`, `response.isSynced` |
| Error handling | Not available | `onError` callback + `response.error` state |
| Cursor labels | Not configurable | `showCursorLabels: 'activity' \| 'always'` |
| `initialContent` shape | JSON `string` (`JSON.stringify([...])`) | `PartialBlock[]` array (typed BlockNote blocks) |
| Cleanup | Automatic on unmount | Automatic on unmount |

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltBlockNoteCrdtExtension } from '@veltdev/blocknote-crdt-react';
import { useCreateBlockNote } from '@blocknote/react';

const { collaborationConfig, isLoading, store } = useVeltBlockNoteCrdtExtension({
  editorId: 'my-doc',
  initialContent: JSON.stringify([{ type: 'paragraph', content: '' }]),
});

const editor = useCreateBlockNote({
  collaboration: collaborationConfig,
}, [collaborationConfig]);

// Versions via store
await store.setStateFromVersion(someVersion);
```

**Correct (v2):**

```tsx
import { useCollaboration } from '@veltdev/blocknote-crdt-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';

const {
  collaborationConfig,
  isLoading,
  isSynced,
  status,
  error,
  manager,
  saveVersion,
  getVersions,
  restoreVersion,
} = useCollaboration({
  editorId: 'my-doc',
  initialContent: [{ type: 'paragraph', content: '' }],
  onError: (err) => console.error(err),
});

const editor = useCreateBlockNote(
  collaborationConfig ? { collaboration: collaborationConfig } : {},
  [collaborationConfig],
);

// Versions are first-class returns from the hook
await saveVersion('Draft v1');
const versions = await getVersions();
await restoreVersion(versions[0].versionId);

// Status (new)
if (error) return <div>Error: {error.message}</div>;
if (isLoading || !collaborationConfig) return <div>Connecting...</div>;

return <BlockNoteView editor={editor} theme="light" />;
```

v1 did not document non-React BlockNote support. v2 introduces `@veltdev/blocknote-crdt` and `createCollaboration` so vanilla / Vue / Angular apps can drive BlockNote collaboration via the manager.
| Aspect | v1 (not supported) | v2 (current) |
|---|---|---|
| Entry point | — | `await createCollaboration(config)` |
| Return value | — | `CollaborationManager` instance |
| Collab config | — | `manager.getCollaborationConfig()` → pass to `BlockNoteEditor.create({ collaboration: ... })` |
| Version management | — | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | — | `manager.onStatusChange()`, `manager.onSynced()` |
| Cleanup | — | `manager.destroy()` (idempotent) |
| Yjs internals | — | `manager.getDoc()`, `manager.getXmlFragment()`, `manager.getAwareness()`, `manager.getProvider()` |

**Correct (v2 — non-React):**

```js
import { createCollaboration } from '@veltdev/blocknote-crdt';
import { BlockNoteEditor } from '@blocknote/core';

client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-doc',
    veltClient: client,
    initialContent: [{ type: 'paragraph', content: 'Hello' }],
    onError: (err) => console.error(err),
  });

  const editor = BlockNoteEditor.create({
    collaboration: manager.getCollaborationConfig(),
  });
  editor.mount(document.getElementById('editor'));

  // Subscribe to sync / status (replaces any v1 callback pattern)
  manager.onSynced((synced) => synced && console.log('Synced!'));
  manager.onStatusChange((status) => console.log('Status:', status));

  // Versions
  await manager.saveVersion('Draft v1');
  const versions = await manager.getVersions();
  await manager.restoreVersion(versions[0].versionId);
});
```

- [ ] All `useVeltBlockNoteCrdtExtension` imports replaced with `useCollaboration`
- [ ] `initialContent` migrated from `JSON.stringify([...])` to a `PartialBlock[]` array
- [ ] `store.*` references migrated to `manager.*` equivalents or the React first-class returns (`saveVersion`, `getVersions`, `restoreVersion`)
- [ ] `store.setStateFromVersion(v)` calls replaced with `manager.restoreVersion(versionId)` (broadcasts) or `manager.setStateFromVersion(v)` (local-only)
- [ ] `onError` callback added; UI reads `response.error` for runtime errors
- [ ] UI wired to reactive `status` / `isSynced` instead of relying on the absence of v1 indicators
- [ ] Non-React BlockNote flow gated on `client.getVeltInitState().subscribe(...)` before calling `createCollaboration`
- [ ] Old `store.getYDoc` / `store.getYXml` / `store.isConnected` calls replaced with `manager.getDoc` / `manager.getXmlFragment` / `manager.status`
- [ ] `manager.destroy()` used in place of v1 implicit cleanup when the editor is not the lifecycle owner

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Migration Guide: v1 to v2; ## Legacy API (v1))

---

### 3.6 Use the CollaborationManager API for Status, Versions, and Yjs Internals

**Impact: HIGH (Without using the manager API, you lose access to connection status, sync state, version management, and Yjs escape hatches in v2)**

In v2 of `@veltdev/blocknote-crdt(-react)`, `useCollaboration` (React) and `createCollaboration` (non-React) both surface a `CollaborationManager` instance. The manager is the single entry point for connection status, sync state, version management, and Yjs-level escape hatches. The hook/factory returns a `collaborationConfig` object that you pass to `useCreateBlockNote({ collaboration: ... })` or `BlockNoteEditor.create({ collaboration: ... })`. Wire UI state to the hook's reactive return values (or the manager's observables in non-React) instead of trying to read Yjs internals directly from the editor.

**Correct (React — read reactive state from the hook):**

```tsx
import { useCollaboration } from '@veltdev/blocknote-crdt-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

function CollaborativeEditor() {
  const {
    collaborationConfig,
    isLoading,
    isSynced,
    status,
    error,
    manager,
    saveVersion,
    getVersions,
    restoreVersion,
  } = useCollaboration({
    editorId: 'my-blocknote-editor',
    onError: (err) => console.error('Collaboration error:', err),
  });

  const editor = useCreateBlockNote(
    collaborationConfig ? { collaboration: collaborationConfig } : {},
    [collaborationConfig],
  );

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading || !collaborationConfig) return <div>Connecting...</div>;

  return (
    <>
      <div>Status: {status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
      <BlockNoteView editor={editor} theme="light" />
    </>
  );
}
```

When the `collaboration` config is provided, BlockNote automatically uses the `Y.XmlFragment` as the document source, enables remote cursor rendering, and switches undo/redo to the Yjs `UndoManager`. No additional configuration is needed.

**Correct (non-React — subscribe via the manager):**

```js
import { createCollaboration } from '@veltdev/blocknote-crdt';
import { BlockNoteEditor } from '@blocknote/core';

client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-blocknote-editor',
    veltClient: client,
    initialContent: [
      { type: 'paragraph', content: 'Welcome to the collaborative editor!' },
    ],
    onError: (err) => console.error('Collaboration error:', err),
  });

  const editor = BlockNoteEditor.create({
    collaboration: manager.getCollaborationConfig(),
  });
  editor.mount(document.getElementById('editor'));

  // Subscribe to status / sync — always store the unsubscribe and call it on teardown
  const unsubStatus = manager.onStatusChange((status) => console.log('status', status));
  const unsubSynced = manager.onSynced((synced) => console.log('synced', synced));

  // Read current values at any time
  console.log(manager.status);       // 'connecting' | 'connected' | 'disconnected'
  console.log(manager.synced);       // boolean
  console.log(manager.initialized);  // boolean

  // On teardown
  unsubStatus();
  unsubSynced();
  manager.destroy(); // safe to call multiple times
});
// Save a named snapshot — returns a versionId
const versionId = await manager.saveVersion('Before major edit');

// List versions: [{ versionId, versionName, timestamp }, ...]
const versions = await manager.getVersions();

// Restore by versionId — pushes the restored state to all clients
await manager.restoreVersion(versions[0].versionId);

// Apply a Version object's state locally (no broadcast)
await manager.setStateFromVersion(version);
const doc        = manager.getDoc();         // Y.Doc
const xml        = manager.getXmlFragment(); // Y.XmlFragment | null  (BlockNote document-store key)
const provider   = manager.getProvider();    // SyncProvider
const awareness  = manager.getAwareness();   // Awareness (Yjs awareness protocol)
const crdtStore  = manager.getStore();       // Velt CRDT Store<string>
```

`initialContent` is applied exactly once — only when the document is brand new. On subsequent loads, the persisted content is used instead. Pass `forceResetInitialContent: true` to always overwrite remote data — this is a development-only flag.
In React, the hook returns version methods as first-class APIs. In non-React, call them on the manager.
The manager exposes the underlying Yjs primitives for advanced use (custom plugins, debugging, interop with other Yjs tooling). Prefer the manager's high-level methods first; reach for these only when you actually need Yjs-level control.

**Incorrect (poking at the editor for Yjs internals):**

```js
// WRONG: reach into editor internals to find Y.Doc — undefined behaviour
const ydoc = (editor as any)._tiptapEditor?.storage?.collaboration?.document;
// SETUP
const unsubStatus = manager.onStatusChange((s) => updateBadge(s));
const unsubSynced = manager.onSynced((synced) => updateBadge(undefined, synced));

// TEARDOWN — call before manager.destroy() and on component unmount
unsubStatus();
unsubSynced();
manager.destroy();
```

Every `manager.on*` method returns an `Unsubscribe` function. Treat them like event listeners — always pair `subscribe` with `unsubscribe` so listeners do not leak:
In React, the `useCollaboration` hook handles this automatically — use the returned reactive `status` / `isSynced` / `error` values instead of calling `manager.onStatusChange` manually unless you need imperative side effects.

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (### Step 3, 4, 5, 10, 11; ## APIs)

---

## 4. CodeMirror Integration

**Impact: HIGH**

Collaborative code editing with CodeMirror. Covers yCollab wiring and both React and vanilla setups.

### 4.1 Use useVeltCodeMirrorCrdtExtension for React CodeMirror (v1 — DEPRECATED)

**Impact: LOW (v1 API retained for backwards-compatibility only. New integrations must use the v2 useCollaboration hook (see codemirror-collaboration-manager.md and codemirror-v1-to-v2-migration.md).)**

> **DEPRECATED:** This rule documents the v1 React CodeMirror CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `useCollaboration` from `@veltdev/codemirror-crdt-react`** — see `rules/shared/codemirror/codemirror-collaboration-manager.md` for the canonical v2 pattern and `rules/shared/codemirror/codemirror-v1-to-v2-migration.md` for the migration table.

Use `useVeltCodeMirrorCrdtExtension` to get the store, then wire it into CodeMirror with `yCollab`.

**Correct (React implementation):**

```tsx
import { useVeltCodeMirrorCrdtExtension } from '@veltdev/codemirror-crdt-react';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';
import { useEffect, useRef } from 'react';

function CollaborativeCodeEditor({ editorId }: { editorId: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const { store, isLoading } = useVeltCodeMirrorCrdtExtension({ editorId });

  useEffect(() => {
    if (!store || !editorRef.current) return;

    // Clean up existing view
    viewRef.current?.destroy();

    const startState = EditorState.create({
      doc: store.getYText()?.toString() ?? '',
      extensions: [
        basicSetup,
        yCollab(
          store.getYText()!,
          store.getAwareness(),
          { undoManager: store.getUndoManager() }
        ),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [store]);

  return (
    <div>
      <div ref={editorRef} />
      <div>{isLoading ? 'Connecting...' : 'Connected'}</div>
    </div>
  );
}
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Legacy API (v1) > React: useVeltCodeMirrorCrdtExtension() (deprecated))

---

### 4.2 Install CodeMirror CRDT Packages

**Impact: CRITICAL (Required for CodeMirror collaboration)**

Install the Velt CodeMirror CRDT packages plus `y-codemirror.next` for Yjs integration.

**Correct (React / Next.js):**

```bash
npm install @veltdev/codemirror-crdt-react @veltdev/codemirror-crdt @veltdev/react @veltdev/types codemirror @codemirror/state @codemirror/view y-codemirror.next yjs
```

**Correct (Other Frameworks):**

```bash
npm install @veltdev/codemirror-crdt @veltdev/client codemirror @codemirror/state y-codemirror.next yjs
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 1: Install Dependencies)

---

### 4.3 Migrate CodeMirror CRDT Integrations from v1 to v2

**Impact: HIGH (v1 APIs (useVeltCodeMirrorCrdtExtension, createVeltCodeMirrorStore / createVeltCodeMirrorCrdtExtension) are deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points)**

The v1 CodeMirror CRDT API (`useVeltCodeMirrorCrdtExtension` for React, `createVeltCodeMirrorStore` / `createVeltCodeMirrorCrdtExtension` for non-React) is deprecated and remains exported only for backward compatibility. All new integrations must use the v2 entry points (`useCollaboration` / `createCollaboration`), which return a `CollaborationManager` with reactive status, sync state, version management, and richer Yjs escape hatches. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

### React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `useVeltCodeMirrorCrdtExtension(config)` | `useCollaboration(config)` |
| Yjs access | `store.getYText()`, `store.getAwareness()` | `primitives.ytext`, `primitives.awareness` |
| Undo manager | `store.getUndoManager()` | `primitives.undoManager` |
| Manager access | `response.store` (`VeltCodeMirrorStore`) | `response.manager` (`CollaborationManager`) |
| Version management | `store.getEncodedState()`, `store.setStateFromVersion(v)` | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | Not available | `response.status`, `response.isSynced` (reactive) |
| Error handling | Not available | `onError` callback + `response.error` state |
| Cleanup | Automatic on unmount | Automatic on unmount |

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltCodeMirrorCrdtExtension } from '@veltdev/codemirror-crdt-react';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';

const { store, isLoading } = useVeltCodeMirrorCrdtExtension({
  editorId: 'my-doc',
  initialContent: 'console.log("Hello!");',
});

if (store) {
  const state = EditorState.create({
    doc: store.getYText()?.toString() ?? '',
    extensions: [
      basicSetup,
      yCollab(store.getYText()!, store.getAwareness(), {
        undoManager: store.getUndoManager(),
      }),
    ],
  });
}

// Versions
const encoded = store.getEncodedState();
await store.setStateFromVersion(someVersion);
```

**Correct (v2):**

```tsx
import { useCollaboration } from '@veltdev/codemirror-crdt-react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';
import { useEffect, useRef } from 'react';

const editorElRef = useRef<HTMLDivElement>(null);

const { primitives, isLoading, isSynced, status, error, manager } = useCollaboration({
  editorId: 'my-doc',
  initialContent: 'console.log("Hello!");',
  onError: (err) => console.error(err),
});

useEffect(() => {
  if (!primitives?.ytext || !editorElRef.current) return;
  const state = EditorState.create({
    doc: primitives.ytext.toString(),
    extensions: [
      basicSetup,
      yCollab(primitives.ytext, primitives.awareness, {
        undoManager: primitives.undoManager,
      }),
    ],
  });
  const view = new EditorView({ state, parent: editorElRef.current });
  return () => view.destroy();
}, [primitives]);

// Versions
const versions = await manager.getVersions();
await manager.restoreVersion(versions[0].versionId);

// Status (new)
if (error) return <div>Error: {error.message}</div>;
if (isLoading) return <div>Connecting...</div>;
```

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `createVeltCodeMirrorStore(config)` / `createVeltCodeMirrorCrdtExtension(config, callback)` | `await createCollaboration(config)` |
| Return value | Store / cleanup function | `CollaborationManager` instance |
| Yjs primitives | `store.getYText()`, `store.getAwareness()`, `store.getUndoManager()` | `manager.getCollaborationPrimitives()` → `{ ytext, awareness, undoManager, doc }` |
| Store access | `store` (`VeltCodeMirrorStore`) | `manager.getStore()` |
| Version management | `store.getEncodedState()`, `store.setStateFromVersion(v)` | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | Not available | `manager.onStatusChange()`, `manager.onSynced()` |
| Cleanup | `store.destroy()` or cleanup function | `manager.destroy()` |
| Error handling | `onConnectionError` callback | `onError` callback |
| Sync notification | `onSynced` callback (fires once) | `manager.onSynced()` (subscribable) |
| Yjs internals | `store.getYDoc()`, `store.getYText()`, `store.getAwareness()`, `store.getUndoManager()` | `manager.getDoc()`, `manager.getYText()`, `manager.getAwareness()`, `manager.getUndoManager()`, `manager.getProvider()` |

**Incorrect (v1 — deprecated):**

```js
import { createVeltCodeMirrorStore } from '@veltdev/codemirror-crdt';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';

const store = await createVeltCodeMirrorStore({
  editorId: 'my-doc',
  veltClient: client,
});

const state = EditorState.create({
  doc: store.getYText()?.toString() ?? '',
  extensions: [
    basicSetup,
    yCollab(store.getYText(), store.getAwareness(), {
      undoManager: store.getUndoManager(),
    }),
  ],
});
new EditorView({ state, parent: document.querySelector('#editor') });

// Later: tear down
store.destroy();
```

**Correct (v2):**

```js
import { createCollaboration } from '@veltdev/codemirror-crdt';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';

client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-doc',
    veltClient: client,
    initialContent: 'console.log("Hello!");',
    onError: (err) => console.error(err),
  });

  const { ytext, awareness, undoManager } = manager.getCollaborationPrimitives();

  const state = EditorState.create({
    doc: ytext.toString(),
    extensions: [
      basicSetup,
      yCollab(ytext, awareness, { undoManager }),
    ],
  });
  new EditorView({ state, parent: document.querySelector('#editor') });

  // Subscribe to sync (replaces onSynced callback)
  manager.onSynced((synced) => synced && console.log('Synced!'));
  manager.onStatusChange((status) => console.log('Status:', status));

  // Tear down
  // manager.destroy() cascades to store, provider, undo manager, listeners
});
```

- [ ] All `useVeltCodeMirrorCrdtExtension` imports replaced with `useCollaboration`
- [ ] All `createVeltCodeMirrorStore` / `createVeltCodeMirrorCrdtExtension` calls replaced with `await createCollaboration(...)`
- [ ] `store.getYText()` / `store.getAwareness()` / `store.getUndoManager()` references migrated to `primitives.*` (React) or `manager.getCollaborationPrimitives()` (non-React)
- [ ] `yCollab(...)` is now wired with primitives from the hook return / manager — not from a v1 `store`
- [ ] `store.*` version calls migrated to `manager.*` equivalents (`saveVersion`, `getVersions`, `restoreVersion`)
- [ ] `onConnectionError` callbacks renamed to `onError`
- [ ] `onSynced` one-shot callbacks replaced with `manager.onSynced(...)` subscription or `isSynced` reactive state
- [ ] Non-React flow gated on `client.getVeltInitState().subscribe(...)` before calling `createCollaboration`
- [ ] Old `store.getYDoc` calls replaced with `manager.getDoc()`
- [ ] v1 `store.destroy()` / cleanup function replaced with `manager.destroy()`

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Migration Guide: v1 to v2; ## Legacy API (v1))

---

### 4.4 Test CodeMirror Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test CodeMirror collaboration using different authenticated users in separate browser profiles.

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Testing and Debugging)

---

### 4.5 Use the CollaborationManager API for Status, Versions, and Yjs Internals

**Impact: HIGH (Without using the manager API, you lose access to connection status, sync state, version management, and Yjs escape hatches in v2)**

In v2 of `@veltdev/codemirror-crdt(-react)`, `useCollaboration` (React) and `createCollaboration` (non-React) both surface a `CollaborationManager` instance. The manager is the single entry point for connection status, sync state, version management, and Yjs-level escape hatches. The React hook also returns the Yjs `primitives` (`ytext`, `awareness`, `undoManager`, `doc`) you pass to `yCollab()` from `y-codemirror.next`; non-React callers fetch the same shape via `manager.getCollaborationPrimitives()`.

**Correct (React — read reactive state from the hook):**

```tsx
import { useCollaboration } from '@veltdev/codemirror-crdt-react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';
import { useEffect, useRef } from 'react';

function CodeMirrorEditor() {
  const editorElRef = useRef<HTMLDivElement>(null);

  const { primitives, isLoading, isSynced, status, error, manager } = useCollaboration({
    editorId: 'my-codemirror-editor',
    initialContent: 'console.log("Hello!");',
    onError: (err) => console.error('Collaboration error:', err),
  });

  useEffect(() => {
    if (!primitives?.ytext || !editorElRef.current) return;
    const state = EditorState.create({
      doc: primitives.ytext.toString(),
      extensions: [
        basicSetup,
        yCollab(primitives.ytext, primitives.awareness, {
          undoManager: primitives.undoManager,
        }),
      ],
    });
    const view = new EditorView({ state, parent: editorElRef.current });
    return () => view.destroy();
  }, [primitives]);

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading || !primitives) return <div>Connecting...</div>;

  return (
    <>
      <div>Status: {status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
      <div ref={editorElRef} />
    </>
  );
}
```

**Correct (non-React — subscribe via the manager):**

```js
import { createCollaboration } from '@veltdev/codemirror-crdt';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';

// Gate on Velt readiness before creating the manager
client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-codemirror-editor',
    veltClient: client,
    initialContent: 'console.log("Hello!");',
    onError: (err) => console.error('Collaboration error:', err),
  });

  const { ytext, awareness, undoManager } = manager.getCollaborationPrimitives();

  const state = EditorState.create({
    doc: ytext.toString(),
    extensions: [
      basicSetup,
      yCollab(ytext, awareness, { undoManager }),
    ],
  });
  new EditorView({ state, parent: document.querySelector('#editor') });

  // Subscribe to status / sync — always store the unsubscribe and call it on teardown
  const unsubStatus = manager.onStatusChange((status) => console.log('status', status));
  const unsubSynced = manager.onSynced((synced) => console.log('synced', synced));

  // Read current values at any time
  console.log(manager.status);       // 'connecting' | 'connected' | 'disconnected'
  console.log(manager.synced);       // boolean
  console.log(manager.initialized);  // boolean

  // On teardown
  unsubStatus();
  unsubSynced();
  manager.destroy(); // safe to call multiple times; cascades to store, provider, undo manager, listeners
});
// Save a named snapshot — returns a versionId
const versionId = await manager.saveVersion('Before major edit');

// List versions: [{ versionId, versionName, timestamp }, ...]
const versions = await manager.getVersions();

// Restore by versionId — pushes the restored state to all clients
await manager.restoreVersion(versions[0].versionId);

// Apply a Version object's state locally (no broadcast)
await manager.setStateFromVersion(version);
const doc        = manager.getDoc();           // Y.Doc
const ytext      = manager.getYText();         // Y.Text | null   (non-React)
const text       = manager.getText();          // Y.Text | null   (React)
const provider   = manager.getProvider();      // SyncProvider
const awareness  = manager.getAwareness();     // Awareness (Yjs awareness protocol)
const crdtStore  = manager.getStore();         // Velt CRDT Store<string>
const undoMgr    = manager.getUndoManager();   // Y.UndoManager | null
```

The manager exposes the underlying Yjs primitives for advanced use (custom CodeMirror plugins, debugging, interop with other Yjs tooling). Prefer the manager's high-level methods and the `primitives` returned by the hook first; reach for these only when you actually need Yjs-level control.

**Incorrect (constructing a second Y.Doc and binding it to CodeMirror):**

```js
// WRONG: a separate Y.Doc bypasses the manager's sync provider — edits will not propagate
import * as Y from 'yjs';
const ydoc = new Y.Doc();
const ytext = ydoc.getText('codemirror');
yCollab(ytext, /* no awareness from Velt */ null, {});
// SETUP
const unsubStatus = manager.onStatusChange((s) => updateBadge(s));
const unsubSynced = manager.onSynced((synced) => updateBadge(undefined, synced));

// TEARDOWN — call before manager.destroy() and on component unmount
unsubStatus();
unsubSynced();
manager.destroy();
```

Every `manager.on*` method returns an `Unsubscribe` function. Treat them like event listeners — always pair `subscribe` with `unsubscribe` so listeners do not leak:
In React, the `useCollaboration` hook handles this automatically — use the returned reactive `status` / `isSynced` / `error` values instead of calling `manager.onStatusChange` manually unless you need imperative side effects.

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 3, 4, 5, 10, 11; ## APIs)

---

### 4.6 Use Unique editorId for Each CodeMirror Instance

**Impact: HIGH (Prevents content cross-contamination)**

Each CodeMirror editor must have a unique `editorId`. Reusing IDs causes code from different editors to merge incorrectly.

**Incorrect (same ID for different files):**

```tsx
// file1.tsx
const { primitives } = useCollaboration({ editorId: 'code' });

// file2.tsx
const { primitives } = useCollaboration({ editorId: 'code' });
// Content will merge between files!
```

**Correct (unique ID per file/editor — v2 hook):**

```tsx
import { useCollaboration } from '@veltdev/codemirror-crdt-react';

const { primitives, manager } = useCollaboration({
  editorId: `code-${fileId}`,  // Unique per file
});
```

The same rule applies to the deprecated v1 hook `useVeltCodeMirrorCrdtExtension` and the deprecated non-React `createVeltCodeMirrorStore` — every editor instance, regardless of API version, needs a unique `editorId`.

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Notes > **Unique editorId**)

---

### 4.7 Wire yCollab Extension with the v2 CollaborationPrimitives

**Impact: CRITICAL (Required for text sync and collaborative cursors)**

The `yCollab` extension from `y-codemirror.next` connects CodeMirror to Yjs. You MUST pass the Y.Text, Awareness, and UndoManager produced by the Velt CRDT v2 manager — never a separately constructed `Y.Doc`.

In React, `useCollaboration` returns these as `primitives` (`primitives.ytext`, `primitives.awareness`, `primitives.undoManager`). In non-React, call `manager.getCollaborationPrimitives()` to get the same shape.

**Incorrect (missing yCollab):**

```js
const startState = EditorState.create({
  extensions: [basicSetup],  // No CRDT - won't sync
});
```

**Incorrect (constructing a fresh Y.Doc):**

```js
import * as Y from 'yjs';
const ydoc = new Y.Doc();  // Bypasses the manager's sync provider

const startState = EditorState.create({
  extensions: [
    basicSetup,
    yCollab(ydoc.getText(), null, {}),  // Won't sync with Velt
  ],
});
```

**Correct (React — wire `primitives` from `useCollaboration`):**

```tsx
import { useCollaboration } from '@veltdev/codemirror-crdt-react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';

const { primitives } = useCollaboration({ editorId: 'my-codemirror-editor' });

if (primitives?.ytext) {
  const startState = EditorState.create({
    doc: primitives.ytext.toString(),
    extensions: [
      basicSetup,
      yCollab(
        primitives.ytext,        // Y.Text from the manager
        primitives.awareness,    // Awareness (for cursors)
        { undoManager: primitives.undoManager } // collaborative undo
      ),
    ],
  });
}
```

**Correct (non-React — wire primitives from `manager.getCollaborationPrimitives()`):**

```js
import { createCollaboration } from '@veltdev/codemirror-crdt';

const manager = await createCollaboration({
  editorId: 'my-codemirror-editor',
  veltClient: client,
});

const { ytext, awareness, undoManager } = manager.getCollaborationPrimitives();

const startState = EditorState.create({
  doc: ytext.toString(),
  extensions: [
    basicSetup,
    yCollab(ytext, awareness, { undoManager }),
  ],
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 3; ### CollaborationPrimitives)

---

### 4.8 Use createVeltCodeMirrorStore for Non-React CodeMirror (v1 — DEPRECATED)

**Impact: LOW (v1 API retained for backwards-compatibility only. New integrations must use the v2 createCollaboration entry point (see codemirror-collaboration-manager.md and codemirror-v1-to-v2-migration.md).)**

> **DEPRECATED:** This rule documents the v1 non-React CodeMirror CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `createCollaboration` from `@veltdev/codemirror-crdt`** — see `rules/shared/codemirror/codemirror-collaboration-manager.md` for the canonical v2 pattern (which covers both React and non-React) and `rules/shared/codemirror/codemirror-v1-to-v2-migration.md` for the migration table.

For vanilla JS, Vue, or Angular, the v1 API uses `createVeltCodeMirrorStore` to create the CRDT store.

**Correct (vanilla JS implementation):**

```js
import { initVelt } from '@veltdev/client';
import { createVeltCodeMirrorStore } from '@veltdev/codemirror-crdt';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';

// Step 1: Initialize Velt client
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Authenticate user
await veltClient.setVeltAuthProvider({
  user: { userId: 'user-1', name: 'John Doe' },
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-1' }),
    });
    const { token } = await resp.json();
    return token;
  },
});

// Step 3: Set document
await veltClient.setDocument('my-document-id');

// Step 4: Create CRDT store
const store = await createVeltCodeMirrorStore({
  editorId: 'velt-codemirror-crdt-demo',
  veltClient: veltClient,
});

// Step 5: Create CodeMirror editor
const startState = EditorState.create({
  doc: store.getYText()?.toString() ?? '',
  extensions: [
    basicSetup,
    yCollab(
      store.getYText(),
      store.getAwareness(),
      { undoManager: store.getUndoManager() }
    ),
  ],
});

const view = new EditorView({
  state: startState,
  parent: document.getElementById('editor'),
});

// Cleanup on unmount
view.destroy();
store.destroy();
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Legacy API (v1) > Non-React: createVeltCodeMirrorCrdtExtension() (deprecated))

---

## 5. ReactFlow Integration

**Impact: HIGH**

Collaborative diagram editing with ReactFlow. Covers CRDT-aware handlers for nodes and edges.

### 5.1 Install ReactFlow CRDT Package

**Impact: CRITICAL (Required for ReactFlow collaboration)**

Install the Velt ReactFlow CRDT package for collaborative diagram editing.

**Correct:**

```bash
npm install @veltdev/reactflow-crdt @veltdev/react
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (### Step 1: Install Dependencies)

---

### 5.2 Test ReactFlow Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test ReactFlow collaboration using different authenticated users in separate browser profiles.

**Debug with Console:**

```js
// Check current nodes/edges
window.VeltCrdtStoreMap.get('your-diagram-id').getValue();
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (## Testing and Debugging)

---

### 5.3 Use CRDT Handlers for Node and Edge Changes

**Impact: CRITICAL (Required for changes to sync to collaborators)**

Always use the CRDT-aware handlers from the hook for all changes. Direct state mutations won't sync.

**Incorrect (bypassing CRDT handlers):**

```tsx
const { nodes, onNodesChange } = useVeltReactFlowCrdtExtension({ ... });

// Direct mutation - won't sync
const addNode = () => {
  nodes.push({ id: 'new', data: {}, position: { x: 0, y: 0 } });
};
```

**Correct (using CRDT handlers):**

```tsx
const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
  useVeltReactFlowCrdtExtension({ editorId: 'diagram-1', initialNodes, initialEdges });

// Add node using CRDT handler
const addNode = () => {
  const newNode = {
    id: `node-${Date.now()}`,
    position: { x: 100, y: 100 },
    data: { label: 'New Node' },
  };
  onNodesChange([{ type: 'add', item: newNode }]);
};

// Add edge using CRDT handler
const addEdge = (sourceId: string, targetId: string) => {
  const newEdge = {
    id: `edge-${Date.now()}`,
    source: sourceId,
    target: targetId,
  };
  onEdgesChange([{ type: 'add', item: newEdge }]);
};

// Pass handlers to ReactFlow
return (
  <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onConnect={onConnect}
  />
);
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (## Notes > **Use CRDT handlers**)

---

### 5.4 Use Unique editorId for Each ReactFlow Diagram

**Impact: HIGH (Prevents diagram cross-contamination)**

Each ReactFlow diagram must have a unique `editorId`. Reusing IDs causes nodes/edges from different diagrams to merge incorrectly.

**Incorrect (same ID for different diagrams):**

```tsx
// Page 1
const hook1 = useVeltReactFlowCrdtExtension({ editorId: 'diagram' });

// Page 2 (different diagram)
const hook2 = useVeltReactFlowCrdtExtension({ editorId: 'diagram' });
// Nodes from both will merge!
```

**Correct (unique ID per diagram):**

```tsx
const { nodes, edges, ...handlers } = useVeltReactFlowCrdtExtension({
  editorId: `diagram-${diagramId}`,  // Unique per diagram
  initialNodes,
  initialEdges,
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (## Notes > **Unique editorId**)

---

### 5.5 Use useVeltReactFlowCrdtExtension for Collaborative Diagrams

**Impact: CRITICAL (Required for ReactFlow CRDT)**

Use `useVeltReactFlowCrdtExtension` to get CRDT-synced `nodes`, `edges`, and handlers for ReactFlow.

**Incorrect (not using CRDT-aware state):**

```tsx
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';

function Diagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Local state only - won't sync with collaborators
  return <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} />;
}
```

**Correct (using CRDT hook):**

```tsx
import { Background, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useVeltReactFlowCrdtExtension } from '@veltdev/reactflow-crdt';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', data: { label: 'Start' }, position: { x: 0, y: 0 } }
];
const initialEdges = [];

function CollaborativeDiagram() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useVeltReactFlowCrdtExtension({
      editorId: 'YOUR_EDITOR_ID',
      initialNodes,
      initialEdges,
    });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
    </ReactFlow>
  );
}

// Wrap with ReactFlowProvider
function App() {
  return (
    <ReactFlowProvider>
      <CollaborativeDiagram />
    </ReactFlowProvider>
  );
}
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (### Step 3: Initialize Velt CRDT Extension)

---

## References

- https://docs.velt.dev/realtime-collaboration/crdt/overview
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/array
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/map
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/text
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/xml
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap
- https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote
- https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror
- https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow
- https://docs.velt.dev/get-started/quickstart
- https://docs.yjs.dev/
