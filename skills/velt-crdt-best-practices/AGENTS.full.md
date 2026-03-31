# Velt Crdt Best Practices

**Version 2.0.0**  
Velt  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive best practices guide for implementing real-time collaborative editing with Velt CRDT (Yjs). Contains 33 rules across 5 categories: Core CRDT (11 rules), Tiptap (7 rules), BlockNote (4 rules), CodeMirror (6 rules), and ReactFlow (5 rules). Each rule includes explanations, incorrect vs. correct code examples, verification checklists, and source pointers to official Velt documentation.

---

## Table of Contents

1. [Core CRDT](#1-core-crdt) — **CRITICAL**
   - 1.1 [Use useCrdtUtils() and useCrdtEventCallback() Hooks for CRDT Operations](#11-use-usecrdtutils-and-usecrdteventcallback-hooks-for-crdt-operations)
   - 1.2 [Use useVeltCrdtStore Hook for React CRDT Stores](#12-use-useveltcrdtstore-hook-for-react-crdt-stores)
   - 1.3 [Choose the Correct CRDT Store Type for Your Data](#13-choose-the-correct-crdt-store-type-for-your-data)
   - 1.4 [Initialize Velt Client Before Creating CRDT Stores](#14-initialize-velt-client-before-creating-crdt-stores)
   - 1.5 [Install Correct CRDT Packages for Your Framework](#15-install-correct-crdt-packages-for-your-framework)
   - 1.6 [Manage CRDT Store Lifecycle and Cleanup with destroy()](#16-manage-crdt-store-lifecycle-and-cleanup-with-destroy)
   - 1.7 [Save Named Version Checkpoints for State Recovery](#17-save-named-version-checkpoints-for-state-recovery)
   - 1.8 [Subscribe to CRDT updateData Events with Observable Pattern](#18-subscribe-to-crdt-updatedata-events-with-observable-pattern)
   - 1.9 [Subscribe to Store Changes for Remote Updates](#19-subscribe-to-store-changes-for-remote-updates)
   - 1.10 [Test Collaboration with Multiple Browser Profiles](#110-test-collaboration-with-multiple-browser-profiles)
   - 1.11 [Use CrdtActivityActionTypes for Type-Safe Activity Filtering](#111-use-crdtactivityactiontypes-for-type-safe-activity-filtering)
   - 1.12 [Use CrdtElement Message Stream for Yjs-Backed Collaborative Editors](#112-use-crdtelement-message-stream-for-yjs-backed-collaborative-editors)
   - 1.13 [Use Custom Encryption Provider for Sensitive Data](#113-use-custom-encryption-provider-for-sensitive-data)
   - 1.14 [Use REST APIs to Manage CRDT Data Server-Side](#114-use-rest-apis-to-manage-crdt-data-server-side)
   - 1.15 [Use setActivityDebounceTime() to Control CRDT Activity Flush Frequency](#115-use-setactivitydebouncetime-to-control-crdt-activity-flush-frequency)
   - 1.16 [Use update() Method to Modify Store Values](#116-use-update-method-to-modify-store-values)
   - 1.17 [Use VeltCrdtStoreMap for Runtime Debugging](#117-use-veltcrdtstoremap-for-runtime-debugging)
   - 1.18 [Use Webhooks to Listen for CRDT Data Changes](#118-use-webhooks-to-listen-for-crdt-data-changes)
   - 1.19 [Use createVeltStore for Non-React CRDT Stores](#119-use-createveltstore-for-non-react-crdt-stores)

2. [Tiptap Integration](#2-tiptap-integration) — **CRITICAL**
   - 2.1 [Load Tiptap Editor with SSR Disabled in Next.js](#21-load-tiptap-editor-with-ssr-disabled-in-nextjs)
   - 2.2 [Use useVeltTiptapCrdtExtension Hook for React Tiptap](#22-use-usevelttiptapcrdtextension-hook-for-react-tiptap)
   - 2.3 [Add CSS for Collaboration Cursors in Tiptap](#23-add-css-for-collaboration-cursors-in-tiptap)
   - 2.4 [Disable Tiptap History When Using CRDT](#24-disable-tiptap-history-when-using-crdt)
   - 2.5 [Install Tiptap CRDT Packages Correctly](#25-install-tiptap-crdt-packages-correctly)
   - 2.6 [Integrate TiptapVeltComments Extension When Using Comments with CRDT](#26-integrate-tiptapveltcomments-extension-when-using-comments-with-crdt)
   - 2.7 [Test Tiptap Collaboration with Multiple Users](#27-test-tiptap-collaboration-with-multiple-users)
   - 2.8 [Use HTML String Format for Tiptap CRDT Initial Content](#28-use-html-string-format-for-tiptap-crdt-initial-content)
   - 2.9 [Use Unique editorId for Each Tiptap Instance](#29-use-unique-editorid-for-each-tiptap-instance)
   - 2.10 [Use createVeltTipTapStore for Non-React Tiptap](#210-use-createvelttiptapstore-for-non-react-tiptap)

3. [BlockNote Integration](#3-blocknote-integration) — **HIGH**
   - 3.1 [Install BlockNote CRDT Package](#31-install-blocknote-crdt-package)
   - 3.2 [Test BlockNote Collaboration with Multiple Users](#32-test-blocknote-collaboration-with-multiple-users)
   - 3.3 [Use Unique editorId for Each BlockNote Instance](#33-use-unique-editorid-for-each-blocknote-instance)
   - 3.4 [Use useVeltBlockNoteCrdtExtension for BlockNote Collaboration](#34-use-useveltblocknotecrdtextension-for-blocknote-collaboration)

4. [CodeMirror Integration](#4-codemirror-integration) — **HIGH**
   - 4.1 [Use useVeltCodeMirrorCrdtExtension for React CodeMirror](#41-use-useveltcodemirrorcrdtextension-for-react-codemirror)
   - 4.2 [Install CodeMirror CRDT Packages](#42-install-codemirror-crdt-packages)
   - 4.3 [Test CodeMirror Collaboration with Multiple Users](#43-test-codemirror-collaboration-with-multiple-users)
   - 4.4 [Use Unique editorId for Each CodeMirror Instance](#44-use-unique-editorid-for-each-codemirror-instance)
   - 4.5 [Wire yCollab Extension with Store's Yjs Objects](#45-wire-ycollab-extension-with-stores-yjs-objects)
   - 4.6 [Use createVeltCodeMirrorStore for Non-React CodeMirror](#46-use-createveltcodemirrorstore-for-non-react-codemirror)

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

### 1.2 Use useVeltCrdtStore Hook for React CRDT Stores

**Impact: CRITICAL (Provides reactive store with automatic cleanup)**

In React, use `useVeltCrdtStore` for automatic lifecycle management. The hook handles subscriptions, updates, and cleanup on unmount.

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

**Correct (useVeltCrdtStore hook):**

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

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 3: Initialize a CRDT store > React / Next.js)

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
  initialValue: JSON.stringify({ theme: 'dark', fontSize: 14 }),
});
```

**Correct (map type for object data):**

```ts
// Map type properly merges concurrent key-value updates
const store = await createVeltStore<{ theme: string; fontSize: number }>({
  id: 'settings',
  type: 'map',
  initialValue: { theme: 'dark', fontSize: 14 },
});
```

**Correct (text type for collaborative text):**

```tsx
const { value, update } = useVeltCrdtStore<string>({
  id: 'note',
  type: 'text',
  initialValue: '',
});

return <textarea value={value ?? ''} onChange={(e) => update(e.target.value)} />;
```

**Correct (array type for lists):**

```tsx
const { value, update } = useVeltCrdtStore<string[]>({
  id: 'todo-list',
  type: 'array',
  initialValue: [],
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (type: 'text', // 'array' | 'map' | 'text' | 'xml')

---

### 1.4 Initialize Velt Client Before Creating CRDT Stores

**Impact: CRITICAL (Prevents CRDT store creation failures)**

CRDT stores require a properly initialized Velt client. React apps must wrap with `VeltProvider`; other frameworks must call `initVelt()` before creating stores.

**Incorrect (store created without Velt initialization):**

```tsx
// React - missing VeltProvider
function App() {
  // This will fail - no Velt client available
  const { store } = useVeltCrdtStore({ id: 'note', type: 'text' });
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
  const { store } = useVeltCrdtStore({ id: 'note', type: 'text' });
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

In non-React frameworks, you must manually call `store.destroy()` to clean up resources and listeners when done with a CRDT store. In React, the `useVeltCrdtStore` hook handles cleanup automatically on unmount. The store also exposes Yjs-level accessors (`getDoc()`, `getProvider()`, `getText()`, `getXml()`) for advanced integrations.

**Incorrect (no cleanup in non-React frameworks):**

```typescript
// Store is never destroyed — listeners and connections remain active
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
// Component or page unmounts without cleanup
```

**Correct (React / Next.js — automatic cleanup via hook):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  // Cleanup happens automatically when component unmounts
  const { store, value } = useVeltCrdtStore<string>({
    id: 'my-collab-note',
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

### 1.7 Save Named Version Checkpoints for State Recovery

**Impact: MEDIUM-HIGH (Enables rollback to known good states)**

Use `saveVersion()` to create named checkpoints that can be restored later. Useful for autosave, undo/redo at document level, or user-triggered saves.

**Correct (React - saving versions):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  const { saveVersion, getVersions, setStateFromVersion } =
    useVeltCrdtStore<string>({ id: 'my-collab-note', type: 'text' });

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

### 1.8 Subscribe to CRDT updateData Events with Observable Pattern

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

---

### 1.9 Subscribe to Store Changes for Remote Updates

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
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  const { value } = useVeltCrdtStore<string>({ id: 'my-collab-note', type: 'text' });

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

### 1.10 Test Collaboration with Multiple Browser Profiles

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

### 1.11 Use CrdtActivityActionTypes for Type-Safe Activity Filtering

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

### 1.12 Use CrdtElement Message Stream for Yjs-Backed Collaborative Editors

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

---

### 1.13 Use Custom Encryption Provider for Sensitive Data

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

### 1.14 Use REST APIs to Manage CRDT Data Server-Side

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

---

### 1.15 Use setActivityDebounceTime() to Control CRDT Activity Flush Frequency

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

### 1.16 Use update() Method to Modify Store Values

**Impact: HIGH (Ensures changes sync to all collaborators)**

Always use the store's `update()` method to modify values. Direct mutation bypasses CRDT synchronization and won't propagate to other users.

**Incorrect (direct mutation - won't sync):**

```tsx
function Editor() {
  const { value } = useVeltCrdtStore<string>({ id: 'note', type: 'text' });

  const handleChange = (e) => {
    // Direct assignment - other users won't see this
    value = e.target.value;
  };

  return <input onChange={handleChange} />;
}
```

**Correct (React - using update from hook):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  const { value, update } = useVeltCrdtStore<string>({
    id: 'my-collab-note',
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

### 1.17 Use VeltCrdtStoreMap for Runtime Debugging

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

### 1.18 Use Webhooks to Listen for CRDT Data Changes

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

---

### 1.19 Use createVeltStore for Non-React CRDT Stores

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

### 2.2 Use useVeltTiptapCrdtExtension Hook for React Tiptap

**Impact: CRITICAL (Required for Tiptap collaboration in React)**

In React, use `useVeltTiptapCrdtExtension` to get the `VeltCrdt` extension for Tiptap. Pass it to `useEditor` extensions array.

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
const editor = useEditor({
  extensions: [
    StarterKit,  // history enabled by default!
    ...(VeltCrdt ? [VeltCrdt] : []),
  ],
});
// Undo/redo will conflict with CRDT, causing desync
```

**Correct (history explicitly disabled):**

```tsx
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      undoRedo: false,  // CRITICAL: Disable history (Tiptap v3 uses undoRedo)
    }),
    ...(VeltCrdt ? [VeltCrdt] : []),
  ],
  content: '',
}, [VeltCrdt]);
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Notes > **Disable history**: Turn off Tiptap `history` when using collaboration)

---

### 2.5 Install Tiptap CRDT Packages Correctly

**Impact: CRITICAL (Missing packages prevent Tiptap collaboration)**

Install all required Tiptap and Velt CRDT packages. React apps use `@veltdev/tiptap-crdt-react`; other frameworks use `@veltdev/tiptap-crdt`.

**Correct (React / Next.js):**

```bash
npm install @veltdev/tiptap-crdt-react @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor
```

**Correct (Other Frameworks - Vue, Angular, vanilla):**

```bash
npm install @veltdev/tiptap-crdt @veltdev/client @tiptap/core @tiptap/starter-kit @tiptap/extension-collaboration-caret
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 1: Install Dependencies)

---

### 2.6 Integrate TiptapVeltComments Extension When Using Comments with CRDT

**Impact: CRITICAL (Without the TiptapVeltComments extension in the editor, the app will FREEZE when users try to add comments)**

When both Comments and CRDT features are selected for a Tiptap editor, the `TiptapVeltComments` extension **must** be added to the editor's extensions array. The global `<VeltComments>` component alone is not sufficient — it initializes the comment infrastructure but the editor needs the extension to handle comment creation and rendering. Without it, the app freezes when a user tries to add a comment.

**Required integration (3 parts):**

```tsx
import { TiptapVeltComments, triggerAddComment, highlightComments } from "@veltdev/tiptap-velt-comments";
import { useCommentAnnotations } from "@veltdev/react";

const editor = useEditor({
  extensions: [
    StarterKit.configure({ undoRedo: false }),
    TiptapVeltComments,              // MUST be before CRDT extension
    ...(VeltCrdt ? [VeltCrdt] : []), // CRDT extension last
  ],
  immediatelyRender: false,
}, [VeltCrdt]);
const commentAnnotations = useCommentAnnotations();

useEffect(() => {
  if (editor && commentAnnotations?.length) {
    highlightComments(editor, commentAnnotations);
  }
}, [editor, commentAnnotations]);
<button onClick={() => triggerAddComment(editor)}>💬 Comment</button>
```

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

### 2.7 Test Tiptap Collaboration with Multiple Users

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

### 2.8 Use HTML String Format for Tiptap CRDT Initial Content

**Impact: HIGH (Passing JSON objects as initialContent renders raw JSON text in the editor instead of formatted content)**

The `initialContent` parameter of `useVeltTiptapCrdtExtension` accepts an **HTML string**, not a JSON object. Passing a JSON object will render raw JSON text in the editor.

**Incorrect (JSON object — renders as raw text):**

```tsx
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'my-editor',
  // WRONG: This renders as literal JSON text in the editor
  initialContent: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] },
});
```

**Correct (HTML string):**

```tsx
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'my-editor',
  // CORRECT: HTML string renders as formatted content
  initialContent: '<p>Hello world</p>',
});
```

**Correct (no initial content — let CRDT handle it):**

```tsx
const { VeltCrdt } = useVeltTiptapCrdtExtension({
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

const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'my-editor',
  initialContent: veltInitialContent,
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap`

---

### 2.9 Use Unique editorId for Each Tiptap Instance

**Impact: HIGH (Prevents content cross-contamination)**

Each Tiptap editor must have a unique `editorId`. If you have multiple editors in your app (or across pages), reusing the same ID causes content to merge incorrectly.

**Incorrect (same editorId for different editors):**

```tsx
// Page 1: Document editor
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'editor',  // Generic ID
});

// Page 2: Notes sidebar
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'editor',  // Same ID - content will merge!
});
```

**Correct (unique editorId per logical editor):**

```tsx
// Page 1: Document editor
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: `document-${documentId}`,  // Unique per document
});

// Page 2: Notes sidebar
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: `notes-${documentId}`,  // Different namespace
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Notes > **Unique editorId**: Use a unique `editorId` per editor instance)

---

### 2.10 Use createVeltTipTapStore for Non-React Tiptap

**Impact: CRITICAL (Required for Tiptap collaboration in Vue/Angular/vanilla)**

For Vue, Angular, or vanilla JS, use `createVeltTipTapStore` to create the CRDT store, then get the collaboration extension.

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

Block-based collaborative editing with BlockNote. React-only support currently.

### 3.1 Install BlockNote CRDT Package

**Impact: CRITICAL (Required for BlockNote collaboration)**

Install the Velt BlockNote CRDT package. Currently only React is supported.

**Correct (React / Next.js):**

```bash
npm install @veltdev/blocknote-crdt-react
```

**Note:** Non-React framework support is not yet documented. Check Velt docs for updates.

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
const { collaborationConfig } = useVeltBlockNoteCrdtExtension({
  editorId: 'editor',  // Will conflict with other editors
});
```

**Correct (unique ID per editor):**

```tsx
const { collaborationConfig } = useVeltBlockNoteCrdtExtension({
  editorId: `blocknote-${documentId}`,  // Unique per document
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Notes > **Unique editorId**)

---

### 3.4 Use useVeltBlockNoteCrdtExtension for BlockNote Collaboration

**Impact: CRITICAL (Required for BlockNote CRDT in React)**

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

## 4. CodeMirror Integration

**Impact: HIGH**

Collaborative code editing with CodeMirror. Covers yCollab wiring and both React and vanilla setups.

### 4.1 Use useVeltCodeMirrorCrdtExtension for React CodeMirror

**Impact: CRITICAL (Required for CodeMirror CRDT in React)**

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

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 3: Initialize Velt CRDT Extension > React / Next.js)

---

### 4.2 Install CodeMirror CRDT Packages

**Impact: CRITICAL (Required for CodeMirror collaboration)**

Install the Velt CodeMirror CRDT packages plus `y-codemirror.next` for Yjs integration.

**Correct (React / Next.js):**

```bash
npm install @veltdev/codemirror-crdt-react @veltdev/react
```

**Correct (Other Frameworks):**

```bash
npm install @veltdev/codemirror-crdt @veltdev/client y-codemirror.next
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 1: Install Dependencies)

---

### 4.3 Test CodeMirror Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test CodeMirror collaboration using different authenticated users in separate browser profiles.

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Testing and Debugging)

---

### 4.4 Use Unique editorId for Each CodeMirror Instance

**Impact: HIGH (Prevents content cross-contamination)**

Each CodeMirror editor must have a unique `editorId`. Reusing IDs causes code from different editors to merge incorrectly.

**Incorrect (same ID for different files):**

```tsx
// file1.tsx
const { store } = useVeltCodeMirrorCrdtExtension({ editorId: 'code' });

// file2.tsx
const { store } = useVeltCodeMirrorCrdtExtension({ editorId: 'code' });
// Content will merge between files!
```

**Correct (unique ID per file/editor):**

```tsx
const { store } = useVeltCodeMirrorCrdtExtension({
  editorId: `code-${fileId}`,  // Unique per file
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Notes > **Unique editorId**)

---

### 4.5 Wire yCollab Extension with Store's Yjs Objects

**Impact: CRITICAL (Required for text sync and collaborative cursors)**

The `yCollab` extension from `y-codemirror.next` connects CodeMirror to Yjs. You MUST pass the store's YText, Awareness, and UndoManager.

**Incorrect (missing yCollab):**

```js
const startState = EditorState.create({
  extensions: [basicSetup],  // No CRDT - won't sync
});
```

**Incorrect (wrong Yjs objects):**

```js
import * as Y from 'yjs';
const ydoc = new Y.Doc();  // Creating new doc instead of using store's

const startState = EditorState.create({
  extensions: [
    basicSetup,
    yCollab(ydoc.getText(), ...),  // Wrong - won't sync with Velt
  ],
});
```

**Correct (using store's Yjs objects):**

```js
const startState = EditorState.create({
  doc: store.getYText()?.toString() ?? '',
  extensions: [
    basicSetup,
    yCollab(
      store.getYText()!,        // Store's Y.Text
      store.getAwareness(),     // Store's Awareness (for cursors)
      { undoManager: store.getUndoManager() }  // Store's UndoManager
    ),
  ],
});
```

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Notes > **Use yCollab**: Pass the store's Yjs text, awareness, and undo manager)

---

### 4.6 Use createVeltCodeMirrorStore for Non-React CodeMirror

**Impact: CRITICAL (Required for CodeMirror CRDT in vanilla JS)**

For vanilla JS, Vue, or Angular, use `createVeltCodeMirrorStore` to create the CRDT store.

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

Reference: `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 3: Initialize Velt CRDT Extension > Other Frameworks)

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
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap
- https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote
- https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror
- https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow
- https://docs.velt.dev/get-started/quickstart
- https://docs.yjs.dev/
