# Velt Crdt Best Practices

**Version 2.2.0**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive best practices guide for implementing real-time collaborative editing with Velt CRDT (Yjs). Covers the core CRDT store API, the Tiptap, BlockNote, CodeMirror and ReactFlow integrations, and the multiplayer editor packages for Lexical, ProseMirror, Monaco, Ace, Quill, TinyMCE, CKEditor, SuperDoc, Apryse, Nutrient, SpreadJS, Slate and Draft.js. Each rule includes explanations, incorrect vs. correct code examples, verification checklists, and source pointers to official Velt documentation.

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

6. [Multiplayer Editor Integrations](#6-multiplayer-editor-integrations) — **HIGH**
   - 6.1 [Create the Slate Editor Once and Let the Manager Apply the Slate-Yjs Plugins](#61-create-the-slate-editor-once-and-let-the-manager-apply-the-slate-yjs-plugins)
   - 6.2 [Route Every Draft.js Change Through handleChange() with Ref-Backed EditorState](#62-route-every-draftjs-change-through-handlechange-with-ref-backed-editorstate)
   - 6.3 [Attach the ProseMirror View Before initialize() and Use Velt's Yjs undo/redo](#63-attach-the-prosemirror-view-before-initialize-and-use-velts-yjs-undoredo)
   - 6.4 [Bind Monaco Once, Keep It Uncontrolled, and Style y-monaco Cursors](#64-bind-monaco-once-keep-it-uncontrolled-and-style-y-monaco-cursors)
   - 6.5 [Create CKEditor First, Keep data Uncontrolled, and Forward onAfterDestroy](#65-create-ckeditor-first-keep-data-uncontrolled-and-forward-onafterdestroy)
   - 6.6 [Create the SuperDoc Manager First and Pass Its ydoc and provider to Both Config Slots](#66-create-the-superdoc-manager-first-and-pass-its-ydoc-and-provider-to-both-config-slots)
   - 6.7 [Follow the Shared Lifecycle for Velt Multiplayer Editor Integrations](#67-follow-the-shared-lifecycle-for-velt-multiplayer-editor-integrations)
   - 6.8 [Give Ace a Real Range Factory and Use Collaborative Undo](#68-give-ace-a-real-range-factory-and-use-collaborative-undo)
   - 6.9 [Keep TinyMCE Uncontrolled and Destroy the Manager Before tinymce.remove()](#69-keep-tinymce-uncontrolled-and-destroy-the-manager-before-tinymceremove)
   - 6.10 [Pass GC.Spread.Sheets.Events and Destroy the Manager Before the Workbook](#610-pass-gcspreadsheetsevents-and-destroy-the-manager-before-the-workbook)
   - 6.11 [Pass overlayContainer and Unload Nutrient Only After manager.destroy()](#611-pass-overlaycontainer-and-unload-nutrient-only-after-managerdestroy)
   - 6.12 [Pick the Velt Multiplayer Package and Entry Point That Match Your Editor](#612-pick-the-velt-multiplayer-package-and-entry-point-that-match-your-editor)
   - 6.13 [Register quill-cursors Before new Quill() and Use the Manager's Yjs Undo](#613-register-quill-cursors-before-new-quill-and-use-the-managers-yjs-undo)
   - 6.14 [Set Lexical editorState to null and Use the Manager's Yjs Undo](#614-set-lexical-editorstate-to-null-and-use-the-managers-yjs-undo)
   - 6.15 [Sync Apryse Annotations as XFDF Around an App-Owned WebViewer](#615-sync-apryse-annotations-as-xfdf-around-an-app-owned-webviewer)

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

**Hook Reference:**

| Hook | Returns | Description |
|------|---------|-------------|
| `useCrdtUtils()` | `CrdtElement \| undefined` | Access CrdtElement methods (enableWebhook, disableWebhook, setWebhookDebounceTime, setActivityDebounceTime, message-stream methods) |
| `useCrdtEventCallback(action)` | `CrdtEventTypesMap[action]` | Latest payload for the event, with automatic cleanup. `"updateData"` yields a `CrdtUpdateDataEvent` (null until the first event). |

**Verification Checklist:**
- [ ] `useCrdtUtils()` used instead of `client.getCrdtElement()` in React components
- [ ] `useCrdtEventCallback("updateData")` used instead of manual `crdtElement.on("updateData").subscribe()`
- [ ] Hook null checks performed before calling methods
- [ ] Hooks called inside components wrapped by `VeltProvider`

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usecrdtutils - useCrdtUtils() and useCrdtEventCallback()
- https://docs.velt.dev/api-reference/sdk/api/api-methods#usecrdtutils - CRDT utility methods
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core#step-4-event-subscriptions-optional - Event subscriptions

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

**Hook Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique identifier for the store (v2: renamed to `storeId`) |
| `type` | `'text'` \| `'array'` \| `'map'` \| `'xml'` | Yjs data structure type |
| `initialValue` | T (optional) | Initial value for new stores |
| `debounceMs` | number (optional) | Debounce time for updates |
| `enablePresence` | boolean (optional) | Enable presence tracking (default: true) |

**Hook Returns:**

| Property | Description |
|----------|-------------|
| `value` | Current reactive store value |
| `versions` | Reactive list of all saved versions |
| `store` | Underlying store instance |
| `update` | Function to update the store |
| `saveVersion` | Save a named checkpoint |
| `getVersions` | Get all saved versions (async) |
| `getVersionById` | Fetch a specific version by ID |
| `restoreVersion` | Restore store to a version by ID (convenience method) |
| `setStateFromVersion` | Restore from a version object |

**Verification:**
- [ ] **New code uses v2 `useStore` instead** — see `core-store-v2-api.md`
- [ ] Existing v1 call sites are scheduled for migration — see `core-v1-to-v2-migration.md`
- [ ] Hook is called inside VeltProvider
- [ ] Store `id` is unique per collaborative instance
- [ ] `value` updates when remote peers make changes

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Legacy API (v1) > useVeltCrdtStore() (deprecated))

---

### 1.3 Choose the Correct CRDT Store Type for Your Data

**Impact: CRITICAL (Wrong type causes merge conflicts or data loss)**

Velt CRDT supports four Yjs-backed types: `text`, `array`, `map`, and `xml`. Each has different merge semantics. Using the wrong type causes unexpected behavior on concurrent edits.

**Store Type Reference:**

| Type | Use Case | Yjs Type | Best For |
|------|----------|----------|----------|
| `text` | Plain text | Y.Text | Notes, code, simple text |
| `array` | Ordered lists | Y.Array | Lists, queues, sequences |
| `map` | Key-value objects | Y.Map | Settings, forms, objects |
| `xml` | Rich text / DOM | Y.XmlFragment | Rich editors (Tiptap, BlockNote) |

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

**Verification:**
- [ ] Store type matches data structure semantics
- [ ] Concurrent edits merge as expected
- [ ] Type is consistent across all clients for the same store ID

**Type-specific setup guides:**

Each store type has a dedicated setup page with read/update patterns and Yjs-primitive escape hatches. The full `type` union in v2 is `'text' | 'map' | 'array' | 'xml' | 'xmltext'`.

- Array → `https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/array` (Y.Array)
- Map → `https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/map` (Y.Map)
- Text → `https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/text` (Y.Text)
- XML → `https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/xml` (Y.XmlFragment)

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 3: Choose a store type)

---

### 1.4 Initialize Velt Client Before Creating CRDT Stores

**Impact: CRITICAL (Prevents CRDT store creation failures)**

CRDT stores require a properly initialized Velt client with a document context and an authenticated user. React apps wrap with `VeltProvider` and set the document; other frameworks call `initVelt()`, set the document, identify the user, and wait for `getVeltInitState()` before creating stores.

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
import { VeltProvider, useSetDocument } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
      <CollaborativeEditor />
    </VeltProvider>
  );
}

function CollaborativeEditor() {
  useSetDocument('my-document-id', { documentName: 'My Document' });
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

// Step 2: Set the document scope and authenticate the user
veltClient.setDocument('my-document-id', { documentName: 'My Document' });
await veltClient.identify({ userId: 'user-1', name: 'John Doe', email: 'john@example.com' });

// Step 3: Wait for the SDK, then create the store with veltClient
veltClient.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;
  const store = await createVeltStore({
    id: 'my-store',
    type: 'text',
    veltClient,  // Required - pass the initialized client
  });
});
```

**v6 modular SDK note:** each feature loads as its own chunk. If you pass `featureAllowList` at init, include `'crdt'` so the CRDT chunk preloads (for example `['comment', 'presence', 'crdt']`), or call `await client.preloadCrdt()` before first use. Per the docs, calling `getCrdtElement()` or `preloadCrdt()` for a feature omitted from the list auto-enables it. Omitting `featureAllowList` preloads every chunk, as before.

**Verification:**
- [ ] VeltProvider wraps app at root (React)
- [ ] initVelt() called before createVeltStore (non-React)
- [ ] Document set (`useSetDocument` / `setDocument`) and user authenticated before the store is created
- [ ] Non-React store creation gated on `getVeltInitState()` emitting `true`
- [ ] When `featureAllowList` is used (v6), it includes `'crdt'` or `preloadCrdt()` runs before first use
- [ ] API key is valid and domain is safelisted in Velt Console
- [ ] No console errors about missing Velt client

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core#step-2-initialize-velt-in-your-app - "Step 2: Initialize Velt in your app"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#modular-sdk--chunk-preloading - "Modular SDK / Chunk Preloading" and `preloadCrdt()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `featureAllowList`

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

**Verification:**
- [ ] Package.json contains all required dependencies
- [ ] No peer dependency warnings during install
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Setup > ### Step 1: Install Dependencies)

---

### 1.6 Manage CRDT Store Lifecycle and Cleanup with destroy()

**Impact: MEDIUM (Prevents memory leaks and stale listeners when stores are no longer needed)**

In non-React frameworks, you must manually call `store.destroy()` to clean up resources and listeners when done with a CRDT store. In React, the `useStore` hook handles cleanup automatically on unmount. The store also exposes Yjs-level accessors (`getDoc()`, `getProvider()`, `getText()`, `getXml()`, `getAwareness()`) for advanced integrations.

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

**Yjs-Level Accessors:**

| Method | Returns | Description |
|--------|---------|-------------|
| `store.getDoc()` | `Y.Doc` | Get the underlying Yjs document |
| `store.getProvider()` | `Provider` | Get the provider instance for the store |
| `store.getText()` | `Y.Text \| null` | Get the Y.Text instance (only if store type is `text`) |
| `store.getXml()` | `Y.XmlFragment \| null` | Get the Y.XmlFragment instance (only if store type is `xml`) |
| `store.getAwareness()` | `Awareness` | Get the Awareness instance for cursor/presence tracking (React: prefer `useAwareness(store)`) |

**Verification Checklist:**
- [ ] `store.destroy()` called when store is no longer needed (non-React)
- [ ] React apps use `useStore` for automatic cleanup
- [ ] Yjs accessors used only after store is initialized (non-null)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core#store-methods - destroy(), getDoc(), getProvider(), getText(), getXml(), getAwareness()

---

### 1.7 Migrate Core CRDT Store Integrations from v1 to v2

**Impact: HIGH (v1 useVeltCrdtStore (React) is deprecated; v2 useStore is required for new integrations. Non-React createVeltStore retains its entry-point name but gains new config fields.)**

The v1 React hook `useVeltCrdtStore` (from `@veltdev/crdt-react`) is deprecated and remains exported only for backwards-compatibility (it internally delegates to v2 `useStore` via a wrapper). All new React integrations must use `useStore`. The non-React `createVeltStore` (`@veltdev/crdt`) keeps the same entry-point name but its `StoreConfig` gains new v2 fields (`forceResetInitialContent`, `contentKey`, `userId`, `collection`, `logLevel`). When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

#### React: v1 → v2

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

#### Non-React: v1 → v2

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

#### Migration Checklist

- [ ] All `useVeltCrdtStore` imports replaced with `useStore` from `@veltdev/crdt-react`
- [ ] All `id` config fields renamed to `storeId` (React only)
- [ ] UI now gates on `isLoading` / `error` / `status` before reading `value`
- [ ] `onError` callback wired for production code
- [ ] Awareness reads use `useAwareness(store)` in React (not `store.getAwareness()` directly)
- [ ] `forceResetInitialContent` adopted in template/onboarding flows where v1 had to delete-and-recreate
- [ ] Non-React `createVeltStore` call sites reviewed for opportunistic adoption of new fields (`contentKey`, `logLevel`, etc.)

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Migration Guide: v1 to v2; ## Legacy API (v1))

---

### 1.8 Save Named Version Checkpoints for State Recovery

**Impact: MEDIUM-HIGH (Enables rollback to known good states)**

Use `saveVersion()` to create named checkpoints that can be restored later. Useful for autosave, undo/redo at document level, or user-triggered saves. The full version lifecycle — `saveVersion` → `getVersions` / `getVersionById` → `restoreVersion` (or `setStateFromVersion` for a local-only preview) — is available on every Velt CRDT store: plain stores (`array`, `map`, `text`, `xml`) and the editor integrations built on top of them (Tiptap, BlockNote, CodeMirror, ReactFlow). The multiplayer editor managers (Lexical, Slate, Draft.js, ProseMirror, Quill, TinyMCE, CKEditor, SuperDoc, Monaco, Ace, Apryse, Nutrient, SpreadJS) expose the same `saveVersion` / `getVersions` / `restoreVersion` / `setStateFromVersion` methods on `CollaborationManager`; most of their React hooks also return reactive `versions` plus `saveVersion`, `restoreVersion`, and `refreshVersions()` (Lexical exposes versions through `manager` only).

**When to save versions:**
- On explicit user action ("Save" button)
- At regular intervals (autosave)
- Before destructive operations
- On significant state changes

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

**Version API Reference:**

| Method | Description | Returns |
|--------|-------------|---------|
| `saveVersion(name)` | Create named checkpoint | `Promise<string>` (versionId) |
| `getVersions()` | List all saved versions | `Promise<Version[]>` |
| `getVersionById(id)` | Get specific version | `Promise<Version \| null>` |
| `restoreVersion(id)` | Persistent restore: fetch a version by id and roll the store back to it for all collaborators | `Promise<boolean>` |
| `setStateFromVersion(v)` | Local application only: apply a fetched version's state to the current client (preview / diff view) — does not persist as a restore | `Promise<void>` |

**`restoreVersion` vs `setStateFromVersion`:** these are not interchangeable.

- Reach for `restoreVersion(id)` when the user is committing to a rollback — the store is persistently reset to that snapshot and every connected client sees the change.
- Reach for `setStateFromVersion(version)` when you only want to *show* what a snapshot looks like on the current client (e.g., a "preview this version" panel or diff view). It applies the state locally and does not perform a persistent restore.

Confusing the two leads to either a preview that unexpectedly wipes everyone else's document, or a "Restore" button that silently reverts only the clicking user.

**Verification:**
- [ ] Versions save successfully with meaningful names
- [ ] `getVersions()` returns expected list
- [ ] "Restore" actions use `restoreVersion(id)` and propagate to every connected collaborator
- [ ] Preview / diff UIs use `setStateFromVersion(version)` and do **not** persist for other users
- [ ] The chosen method is consistent whether the store is a plain type (`array`/`map`/`text`/`xml`) or an editor integration manager

**Source Pointers:**
- `https://docs.velt.dev/realtime-collaboration/crdt/setup/core#version-methods` (### Version Methods)
- `https://docs.velt.dev/realtime-collaboration/crdt/overview` — "Version history"
- `https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc` - "Step 5: Version Management (Optional)" (manager and hook version APIs)

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

**Verification Checklist:**
- [ ] Use `.subscribe()` on the Observable returned by `on("updateData")` (not a callback argument)
- [ ] Subscription is cleaned up on component unmount via `subscription.unsubscribe()`
- [ ] Or use `useCrdtEventCallback("updateData")` hook for automatic lifecycle management

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core#crdt-event-subscriptions - on("updateData") event subscription
- https://docs.velt.dev/api-reference/sdk/models/data-models#crdtupdatedataevent - CrdtUpdateDataEvent

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

**Verification:**
- [ ] React: `value` from hook updates when remote peers change data
- [ ] Vanilla: `subscribe()` callback fires on remote changes
- [ ] Unsubscribe called on cleanup to prevent leaks

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core#subscribe` (### Store Methods > #### subscribe())

---

### 1.11 Test Collaboration with Multiple Browser Profiles

**Impact: LOW (Catches sync issues before production)**

Real-time collaboration must be tested with multiple authenticated users. Use different browser profiles to test with separate user identities on the same machine.

**Test Setup:**

1. Open app in Browser Profile A, authenticate as User A
2. Open same app/page in Browser Profile B, authenticate as User B
3. Both users must have the same document context

**What to Verify:**

| Behavior | Expected Result |
|----------|-----------------|
| User A edits | Changes appear for User B |
| User B edits | Changes appear for User A |
| Concurrent edits | Merge without data loss |
| Offline then online | Changes sync on reconnect |

**Incorrect (same user in multiple tabs):**

```
// This doesn't test true multi-user collaboration
Tab 1: User A on document-1
Tab 2: User A on document-1  // Same session, not a real test
```

**Correct (different users in different profiles):**

```
Profile 1 (Chrome): User A (alice@example.com) on document-1
Profile 2 (Chrome Guest): User B (bob@example.com) on document-1
```

**Common Testing Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Cursors not appearing | Same user in both profiles | Use different authenticated users |
| Changes not syncing | Different documentId | Verify both use same document context |
| Editor not loading | API key invalid | Check console for Velt errors |
| Content desynced | Editor history conflict | Disable editor's built-in history |

**Verification:**
- [ ] Two different users authenticated in separate browser profiles
- [ ] Both users see the same document/editorId
- [ ] Edits from User A appear for User B within expected latency
- [ ] Collaboration cursors/carets show correct user info
- [ ] No console errors related to sync

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Testing and Debugging)

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

**Members:**

| Constant Key | String Value |
|--------------|--------------|
| `EDITOR_EDIT` | `'crdt.editor_edit'` |

`EDITOR_EDIT` is the only member listed in the data-models reference.

**Verification Checklist:**
- [ ] `CrdtActivityActionTypes` imported from `@veltdev/react` (React) or `@veltdev/types` (other frameworks)
- [ ] `CrdtActivityActionType` union type used for typed `actionTypes` arrays
- [ ] No raw string literals used for CRDT action type values
- [ ] Activity subscriptions cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#activitysubscribeconfig - ActivitySubscribeConfig
- https://docs.velt.dev/api-reference/sdk/models/data-models#crdtactivityactiontypes - CrdtActivityActionTypes
- https://docs.velt.dev/async-collaboration/activity/overview#activity-log-action-types - Activity Log Action Types

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

**Method Reference:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `getSnapshot` | `(query: CrdtGetSnapshotQuery) => Promise<CrdtSnapshotData \| null>` | Retrieve the latest full-state snapshot as a replay baseline |
| `getMessages` | `(query: CrdtGetMessagesQuery) => Promise<CrdtMessageData[]>` | Fetch messages newer than `afterTs` (Unix ms) for incremental replay |
| `onMessage` | `(query: CrdtOnMessageQuery) => () => void` | Subscribe to real-time incoming messages; returns an unsubscribe function |
| `pushMessage` | `(query: CrdtPushMessageQuery) => Promise<void>` | Push a raw Yjs sync or awareness message to the stream |
| `saveSnapshot` | `(query: CrdtSaveSnapshotQuery) => Promise<void>` | Checkpoint the current Y.Doc state and state vector |
| `pruneMessages` | `(query: CrdtPruneMessagesQuery) => Promise<void>` | Delete messages older than `beforeTs` (Unix ms) to bound storage |

**Data types (from the data-models reference):**

```typescript
interface CrdtGetMessagesQuery { id: string; afterTs?: number; }
interface CrdtOnMessageQuery { id: string; callback: (message: CrdtMessageData) => void; afterTs?: number; }
interface CrdtPruneMessagesQuery { id: string; beforeTs: number; }

interface CrdtMessageData {
  data: number[];        // Raw Yjs message bytes
  yjsClientId: number;   // Yjs client ID of the sender
  timestamp: number;     // Unix timestamp when the message was persisted
}

interface CrdtSnapshotData {
  state?: Uint8Array | number[];   // Encoded Yjs state (Y.encodeStateAsUpdate output)
  vector?: Uint8Array | number[];  // Encoded state vector (Y.encodeStateVector output)
  timestamp?: number;              // Unix timestamp when the snapshot was saved
}

interface CrdtPushMessageQuery {
  id: string;                          // Document or store ID
  data: number[];                      // Raw Yjs message bytes
  yjsClientId: number;                 // ydoc.clientID
  messageType?: 'sync' | 'awareness';  // Defaults to 'sync'
  eventData?: unknown;                 // Optional arbitrary event payload
  type?: string;                       // 'text' | 'map' | 'array' | 'xml' | 'xmltext'
  contentKey?: string;                 // Content key used in Y.Doc shared types
  source?: string;                     // Editor/library identifier, e.g. 'tiptap'
}

interface CrdtSaveSnapshotQuery {
  id: string;
  state: Uint8Array | number[];
  vector: Uint8Array | number[];
  type?: string;
  contentKey?: string;
  source?: string;
}
```

When a Velt multiplayer package exists for your editor (see `editors-choose-package`), use its `CollaborationManager` instead. Reach for the message stream only for a custom Yjs integration that has no Velt package.

**Verification Checklist:**
- [ ] `getSnapshot` called first on load to establish a baseline before `getMessages`
- [ ] `afterTs` passed to `getMessages` uses `snapshot.timestamp ?? 0` (not a hardcoded 0)
- [ ] `onMessage` unsubscribe function is called in the `useEffect` cleanup
- [ ] `pruneMessages` is called after `saveSnapshot`, not before, to avoid data loss

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core#low-level-message-apis - Low-Level Message APIs
- https://docs.velt.dev/api-reference/sdk/api/api-methods#message-stream - CrdtElement message stream API reference
- https://docs.velt.dev/api-reference/sdk/models/data-models#crdtpushmessagequery - CrdtPushMessageQuery

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

**Verification:**
- [ ] Encryption provider set before CRDT operations
- [ ] Data stored in Velt is encrypted
- [ ] Decrypt works correctly for all clients
- [ ] All clients use the same encryption keys/method

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## APIs > ### Custom Encryption)

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

**REST API Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v2/crdt/get` | POST | Retrieve CRDT data. Omit `editorId` to get all editors in a document. |
| `/v2/crdt/add` | POST | Create new CRDT data. Errors with `ALREADY_EXISTS` if `editorId` exists. |
| `/v2/crdt/update` | POST | Replace existing CRDT data. Generates CRDT operations so connected clients pick up the change. |

**Add/Update Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organizationId` | string | Yes | Organization ID |
| `documentId` | string | Yes | Document ID |
| `editorId` | string | Yes | Unique editor instance ID |
| `data` | string / object / array | Yes | Content matching the `type` |
| `type` | string | Yes | `text`, `map`, `array`, or `xml` |
| `contentKey` | string | No | Yjs content key (default: `content`, use `default` for TipTap) |

**Editor integrations: match the store type and content key the package uses:**

The multiplayer editor guides document these store shapes. Writing REST data with a different `type` or `contentKey` creates data the editor never reads.

| Integration | Store type | Content key / notes |
|---|---|---|
| Tiptap | `xml` | `default` |
| Monaco | `text` | `content` |
| ProseMirror | XML fragment | `prosemirror` |
| Draft.js | `xml` | `draftjs`; REST-created content is bridged from the `restContentKey` fragment (default `document-store`) |
| SpreadJS | `map` | `workbook` (whole-workbook snapshot) |
| Nutrient | `map` | `document` (Instant JSON snapshot) |
| Apryse | `map` | `apryse` (XFDF annotation records) |
| Lexical | n/a | REST-written content is not materialized into the Lexical editor; REST reads of browser edits work |

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

**Verification Checklist:**
- [ ] API key and auth token configured
- [ ] Correct organizationId, documentId, and editorId provided
- [ ] Use `/v2/crdt/add` for new editors and `/v2/crdt/update` for existing ones
- [ ] `data` field type matches the `type` field (string for text/xml, object for map, array for array)
- [ ] Response parsed according to your data type (text, map, array, xml)
- [ ] `contentKey` set to `'default'` for TipTap editors, and to the documented key for other editor integrations
- [ ] Lexical documents are not seeded through REST writes

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/get-crdt-data - Get CRDT Data
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/add-crdt-data - Add CRDT Data
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/update-crdt-data - Update CRDT Data
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs#rest-api-compatibility - Draft.js REST API Compatibility
- https://docs.velt.dev/realtime-collaboration/crdt/setup/lexical#limitations - Lexical REST limitation

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

**Parameter Reference:**

| Parameter | Type | Default | Minimum | Description |
|-----------|------|---------|---------|-------------|
| `time` | `number` | `600000` (10 min) | `10000` (10 sec) | Batching window duration in milliseconds |

Values below 10,000 ms (10 seconds) are silently clamped to the enforced minimum.

**Verification Checklist:**
- [ ] `setActivityDebounceTime()` called after Velt client is initialized
- [ ] `time` value is at or above the enforced minimum of 10,000 ms
- [ ] Batching window chosen to match audit trail / write-volume requirements
- [ ] Call placed inside a `useEffect` with `[client]` dependency (React)

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setactivitydebouncetime - setActivityDebounceTime()
- https://docs.velt.dev/async-collaboration/activity/overview#automatic-activity-logging - Automatic Activity Logging (CRDT edit batching)

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

By default, `initialValue` is only applied when the document has no existing remote state. Set `forceResetInitialContent: true` to always overwrite remote state with `initialValue` on initialization.

```tsx
const { value: items } = useStore<Item[]>({
  storeId: 'my-array-store',
  type: 'array',
  initialValue: defaultItems,
  forceResetInitialContent: true,
});
```

**Verification Checklist:**
- [ ] `type: 'array'` is set on the store config (not `'text'` or `'map'`)
- [ ] `Array.isArray(value)` guard is applied before any `.map()` or spread on the reactive value
- [ ] `store.getValue()` is used inside event handlers instead of captured closure values to avoid stale state
- [ ] `store.subscribe()` returns an unsubscribe function that is called on cleanup (non-React only)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/array - Array store setup, read, update, subscribe, and version management
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - Core CRDT setup (Steps 1-2 must be completed first)

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

By default, `initialValue` is only applied when the document has no existing remote state. Set `forceResetInitialContent: true` to always overwrite remote state with `initialValue` on initialization.

```tsx
const { value: entries } = useStore<DataMap>({
  storeId: 'my-map-store',
  type: 'map',
  initialValue: defaultEntries,
  forceResetInitialContent: true,
});
```

**Verification Checklist:**
- [ ] `type: 'map'` is set on the store config (not `'text'` or `'array'`)
- [ ] Object guard (`typeof value === 'object' && !Array.isArray(value)`) is applied before `Object.entries()` or `Object.keys()` on the reactive value
- [ ] `store.getValue()` is used inside event handlers instead of captured closure values to avoid stale state
- [ ] `store.subscribe()` returns an unsubscribe function that is called on cleanup (non-React only)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/map - Map store setup, read, update, subscribe, and version management
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - Core CRDT setup (Steps 1-2 must be completed first)

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

By default, `initialValue` is only applied when the document has no existing remote state. Set `forceResetInitialContent: true` to always overwrite remote state with `initialValue` on initialization.

```tsx
const { value: text } = useStore<string>({
  storeId: 'my-text-store',
  type: 'text',
  initialValue: defaultText,
  forceResetInitialContent: true,
});
```

**Verification Checklist:**
- [ ] `type: 'text'` is set on the store config (not `'map'` or `'array'`)
- [ ] Reactive `value` is coalesced with `?? ''` before binding to a textarea or display element
- [ ] `update()` (React) or `store.update()` (non-React) is called on every input event — not debounced per character unless intentional
- [ ] `store.subscribe()` returns an unsubscribe function that is called on cleanup (non-React only)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/text - Text store setup, read, update, subscribe, and version management
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - Core CRDT setup (Steps 1-2 must be completed first)

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

XML stores do not accept `forceResetInitialContent`. To force-reset, clear the fragment and re-populate inside a Yjs transaction:

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

**Verification Checklist:**
- [ ] `npm i yjs` is installed as a direct dependency alongside the Velt CRDT packages
- [ ] `update()` is never called on an XML store — all mutations go through `store.getXml()` and Yjs APIs
- [ ] Multi-step mutations are wrapped in `store.getDoc().transact(() => { ... })` for atomic batching
- [ ] `store.subscribe()` callback re-reads the `Y.XmlFragment` to rebuild local state (the callback receives no value argument for XML stores)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/xml - XML store setup, Yjs manipulation, subscribe, version management, and force-reset pattern
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - Core CRDT setup (Steps 1-2 must be completed first)

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

**Verification:**
- [ ] All mutations go through `update()`
- [ ] Changes appear for other collaborators
- [ ] No direct value assignment

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core#update` (### Store Methods > #### update())

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
```

#### useStore Signature Reference

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

#### useAwareness Hook (React)

`useAwareness(store)` wraps the Yjs Awareness instance from a store. It is reactive: `remoteStates` updates as peers change their awareness, `setLocalState` is a stable setter.

```tsx
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

`useAwareness` accepts `null` safely — pair it with the `store` return value from `useStore` without a guard.

#### createVeltStore (Non-React) — v2 Config Surface

`createVeltStore` (from `@veltdev/crdt`) is unchanged in entry-point name but the `StoreConfig` accepts the new v2 fields below. Returns `Promise<Store<T> | null>` (resolves to `null` on init failure).

| `StoreConfig<T>` field | Type | Notes |
|---|---|---|
| `id` / `type` / `initialValue` / `veltClient` / `debounceMs` / `enablePresence` | — | Same as v1. |
| `forceResetInitialContent` | `boolean` | **New in v2.** Default `false`. |
| `contentKey` | `string` | **New in v2.** Default `'content'`. |
| `userId` | `string` | **New in v2.** Update attribution. |
| `collection` | `string` | **New in v2.** Document grouping namespace. |
| `logLevel` | `'silent' \| 'error' \| 'warn' \| 'debug'` | **New in v2.** Default `'error'`. |

#### Verification

- [ ] React code uses `useStore` (v2) — not `useVeltCrdtStore` (v1)
- [ ] `storeId` is used instead of `id` in React config
- [ ] UI gates on `isLoading` / `error` reactive fields before reading `value`
- [ ] `onError` callback is wired for production code
- [ ] Awareness state is read via `useAwareness(store)` — not by reaching for `store.getAwareness()` manually in React
- [ ] Non-React code uses the same `createVeltStore` entry point with v2 config fields where needed (`forceResetInitialContent`, `contentKey`, etc.)
- [ ] Subscriptions in non-React always pair `store.subscribe()` with the returned unsubscribe call

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## APIs > React: useStore(), React: useAwareness(), Non-React: createVeltStore(), Store Methods)

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

**VeltCrdtStoreMap API:**

| Method | Returns | Description |
|--------|---------|-------------|
| `get(id?)` | Store \| undefined | Get store by ID, or first store if omitted |
| `getAll()` | { [id]: Store } | Get all registered stores |

**Store Methods (from get()):**

| Method | Description |
|--------|-------------|
| `getValue()` | Current value |
| `subscribe(cb)` | Listen for changes, returns unsubscribe function |

**Verification:**
- [ ] `window.VeltCrdtStoreMap` accessible in console
- [ ] `getAll()` shows expected stores
- [ ] `getValue()` returns current state
- [ ] Subscribe callback fires on changes

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core#debugging` (## Debugging > ### window.VeltCrdtStoreMap); `getAll()` and the registration events are documented in the v4 CRDT core changelog

---

### 1.24 Use Webhooks to Listen for CRDT Data Changes

**Impact: HIGH (Enables server-side reactions to collaborative data changes)**

CRDT stores emit the `crdt.update_data` webhook event so server-side systems can react to collaborative edits. Changes are debounced (default and minimum 5 seconds) to batch rapid edits. The docs disagree on the default state (the webhooks reference says enabled by default, the original v4 release note says disabled by default), so call `enableWebhook()` explicitly when your backend depends on these events.

**Incorrect (no server-side awareness of CRDT changes):**

```typescript
// Server has no way to know when collaborative data changes
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
// Only client-side subscribe() is available
```

**Correct (enabling webhooks for server-side notifications):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

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

**Correct (Other Frameworks):**

```js
const crdtElement = Velt.getCrdtElement();
crdtElement.enableWebhook();
crdtElement.setWebhookDebounceTime(10000); // minimum 5000 ms
```

**Subscribing to `updateData` Events (Client-Side):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

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

**Webhook Methods:**

| Method | Description |
|--------|-------------|
| `enableWebhook()` | Enable webhook notifications for CRDT data changes |
| `disableWebhook()` | Disable webhook notifications |
| `setWebhookDebounceTime(ms)` | Set debounce interval in milliseconds (default: 5000, minimum: 5000) |

**Webhook payload structure (`crdt.update_data`, sent to your webhook URL):**

```json
{
  "event": "crdt.update_data",
  "actionType": "updateData",
  "source": "crdt",
  "platform": "sdk",
  "webhookId": "-OnuSfG_ffGIwNkodE2a",
  "data": {
    "actionUser": { "userId": "michael", "name": "Michael Scott", "organizationId": "org-1" },
    "crdtData": {
      "id": "crdt-array-demo-todos-1",
      "data": [{ "id": "seed-1", "text": "Welcome Todo", "completed": false }],
      "lastUpdatedBy": "michael",
      "sessionId": "tvLupvP0L2jiztlba4P0",
      "lastUpdate": "2026-03-17T06:23:24.514Z"
    },
    "metadata": {
      "apiKey": "YOUR_API_KEY",
      "document": { "documentId": "crdt-array-demo-doc-1", "documentName": "CRDT Array Demo" },
      "organization": { "organizationId": "org-1" }
    }
  }
}
```

`data` follows the `CRDTPayload` model: `crdtData.id` is the editor/store ID and `crdtData.data` is the current value for any store type (array, map, text, xml, or xmltext).

**Verification Checklist:**
- [ ] `enableWebhook()` called after Velt client initialized
- [ ] Webhook endpoint configured in Velt Console
- [ ] Debounce time tuned for your use case (minimum 5000ms)
- [ ] `updateData` event subscription cleaned up on unmount
- [ ] Webhook handler routes on `event === 'crdt.update_data'` and reads `data.crdtData`

**Source Pointers:**
- https://docs.velt.dev/webhooks/advanced#crdt - `crdt.update_data` event and sample payload
- https://docs.velt.dev/api-reference/sdk/models/data-models#crdtpayload - CRDTPayload
- https://docs.velt.dev/api-reference/sdk/api/api-methods#enablewebhook - enableWebhook(), disableWebhook(), setWebhookDebounceTime()

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

**Store Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the store |
| `type` | `'text'` \| `'array'` \| `'map'` \| `'xml'` | Yes | Yjs data structure type |
| `veltClient` | VeltClient | Yes | Initialized Velt client |
| `initialValue` | T | No | Initial value for new stores |
| `debounceMs` | number | No | Debounce time for updates |
| `enablePresence` | boolean | No | Enable presence tracking |

**Verification:**
- [ ] `initVelt()` called before `createVeltStore()`
- [ ] `veltClient` passed to store config
- [ ] User identified via `veltClient.setVeltAuthProvider()`
- [ ] Document set via `veltClient.setDocument()`
- [ ] `store.destroy()` called on cleanup

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core#non-react-createveltstore` (## APIs > ### Non-React: createVeltStore())

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
- BlockNote CRDT components (`@veltdev/blocknote-crdt-react`)
- CodeMirror CRDT components (`@veltdev/codemirror-crdt-react`)
- Any component importing from `@tiptap/*` or `y-prosemirror`

**The editor component itself** should have `'use client'` at the top:
```tsx
// components/velt/TiptapCollabEditor.tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
// ... rest of component
```

**Verification Checklist:**
- [ ] Page files use `next/dynamic` with `ssr: false` to load editor
- [ ] Editor component file has `'use client'` directive
- [ ] No direct imports of Tiptap in server-rendered files
- [ ] App loads without SSR-related runtime errors

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap - Tiptap CRDT Setup

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

**Hook Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `editorId` | string | Unique identifier for this editor |
| `initialContent` | string (optional) | Initial HTML content |
| `debounceMs` | number (optional) | Debounce time for sync |

**Hook Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `VeltCrdt` | Extension \| null | Tiptap extension to add to editor |
| `store` | TiptapStore \| null | Underlying CRDT store |
| `isLoading` | boolean | True until store is ready |

**Next.js SSR Safety:**
In Next.js, the Tiptap editor component must be loaded with `next/dynamic` and `ssr: false`. See the `tiptap-nextjs-ssr` rule for the complete pattern. Direct imports in page components will cause server-side rendering crashes.

**Verification:**
- [ ] `editorId` is unique per editor instance
- [ ] `VeltCrdt` added to extensions array
- [ ] `undoRedo: false` set on StarterKit
- [ ] Connection status shows "Connected"
- [ ] In Next.js: editor loaded via `next/dynamic` with `ssr: false`

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap#legacy-api-v1` (## Legacy API (v1) > React: useVeltTiptapCrdtExtension() (deprecated))

---

### 2.3 Add CSS for Collaboration Cursors in Tiptap

**Impact: CRITICAL (Without this CSS, remote user cursors render as thick full-width blocks instead of thin carets)**

Add CSS styles to make collaboration cursors/carets visible as thin lines. Without styling, cursors appear as thick full-width blocks.

**Which class names to target depends on the integration:**
- **Velt CRDT (`@veltdev/tiptap-crdt-react`)** uses `y-prosemirror` internally, which renders `.ProseMirror-yjs-cursor` elements
- **Tiptap Collaboration Cursor (`@tiptap/extension-collaboration-cursor`)** renders `.collaboration-cursor__caret` elements

Include CSS for **both** patterns to cover all integrations.

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

**Where to add:**
- Global CSS file (e.g., `globals.css`) — recommended
- CSS module imported in editor component
- Styled-components / Emotion styles

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

**Verification:**
- [ ] CSS is loaded in the page (check DevTools → Elements → Styles)
- [ ] Remote user cursors visible as thin carets (not thick blocks)
- [ ] Cursor is 1-2px wide, not full editor width
- [ ] Username labels appear floating above cursors
- [ ] Cursors track remote user positions in real-time
- [ ] Selection highlights are semi-transparent

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 4: Add CSS for Collaboration Cursor)

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

**Why this matters:**
- Tiptap history tracks local changes only
- CRDT tracks all changes (local + remote)
- Both trying to manage undo/redo causes conflicts
- CRDT's Yjs UndoManager handles collaborative undo correctly

**Symptoms of enabled history:**
- Content appears then disappears
- Undo undoes other users' changes
- Editor state becomes inconsistent
- Random content jumps

**Verification:**
- [ ] `StarterKit.configure({ undoRedo: false })` is set
- [ ] Undo/redo works correctly across collaborators
- [ ] No content flashing or jumping

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Notes > **Disable history**: Turn off Tiptap `history` when using collaboration)

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

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/tiptap-crdt-react` | React hook (`useCollaboration`) for Tiptap CRDT |
| `@veltdev/tiptap-crdt` | Core Tiptap CRDT — exports `createCollaboration` and `CollaborationManager` |
| `@veltdev/react` | Velt React provider (`VeltProvider`, `useVeltClient`) |
| `@veltdev/client` | Velt client (`initVelt`) for non-React apps |
| `@veltdev/types` | TypeScript types (`Velt`, `CollaborationManager`, etc.) |
| `@tiptap/core` | Tiptap editor core |
| `@tiptap/starter-kit` | Basic Tiptap extensions |
| `yjs` | CRDT runtime — direct dependency in v2 |

> **v2 note:** As of `@veltdev/tiptap-crdt(-react)` v2, you no longer install `@tiptap/react`, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-cursor`, or `@tiptap/extension-collaboration-caret`. The extension returned by `useCollaboration` / `manager.createExtension()` bundles Yjs binding and remote cursor rendering into a single extension. `yjs` is now a direct dependency you install yourself.

**Verification:**
- [ ] All packages in package.json
- [ ] No peer dependency warnings
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 1: Install Dependencies)

---

### 2.6 Integrate TiptapVeltComments Extension When Using Comments with CRDT

**Impact: CRITICAL (Without the TiptapVeltComments extension in the editor, the app will FREEZE when users try to add comments)**

When both Comments and CRDT features are selected for a Tiptap editor, the `TiptapVeltComments` extension **must** be added to the editor's extensions array. The global `<VeltComments>` component alone is not sufficient — it initializes the comment infrastructure but the editor needs the extension to handle comment creation and rendering. Without it, the app freezes when a user tries to add a comment.

**Required integration (4 parts):**

#### Part 0: Configure VeltComments for editor mode

```tsx
// VeltComments must have textMode={false} and shadowDom={false} when using TipTap —
// the editor extension handles text commenting, not the default text mode.
<VeltComments textMode={false} shadowDom={false} />
```

#### Part 1: Add the extension to the editor

```tsx
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
```

#### Part 2: Render comment highlights

```tsx
const commentAnnotations = useCommentAnnotations();

useEffect(() => {
  if (editor && commentAnnotations?.length) {
    renderComments({ editor, commentAnnotations });
  }
}, [editor, commentAnnotations]);
```

#### Part 3: Add a comment trigger button

```tsx
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

**Verification:**
- [ ] `TiptapVeltComments` is in the editor's extensions array (before the CRDT extension)
- [ ] `useCommentAnnotations()` is called and wired to `renderComments`
- [ ] Comment button calls `addComment({ editor })`
- [ ] Selecting text and clicking comment does NOT freeze the page
- [ ] Comment highlights appear on annotated text

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap`

---

### 2.7 Migrate Tiptap CRDT Integrations from v1 to v2

**Impact: HIGH (v1 APIs (useVeltTiptapCrdtExtension, createVeltTiptapCrdtExtension) are deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points)**

The v1 Tiptap CRDT API (`useVeltTiptapCrdtExtension` for React, `createVeltTiptapCrdtExtension` for non-React) is deprecated and remains exported only for backward compatibility. All new integrations must use the v2 entry points (`useCollaboration` / `createCollaboration`), which return a `CollaborationManager` with reactive status, sync state, and a richer Yjs surface. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

#### React: v1 → v2

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

#### Non-React: v1 → v2

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

#### Migration Checklist

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

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Migration Guide: v1 to v2; ## Legacy API (v1))

---

### 2.8 Test Tiptap Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test Tiptap collaboration by opening the same page with different authenticated users in separate browser profiles.

**Test Procedure:**

1. Open app in Browser Profile A, login as User A
2. Open same page in Browser Profile B, login as User B
3. Both must have same document context (same URL/editorId)

**What to Verify:**

| Test | Expected |
|------|----------|
| User A types | Text appears for User B |
| User B types | Text appears for User A |
| Both type simultaneously | Text merges correctly |
| Check cursors | User A sees User B's cursor |

**Common Issues & Fixes:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Cursors not appearing | Same user in both profiles | Use different users |
| | Missing cursor CSS | Add collaboration cursor styles |
| Editor not loading | Velt not initialized | Check VeltProvider/API key |
| Content desynced | History not disabled | Set `undoRedo: false` (Tiptap v3) |
| Changes not syncing | Different editorId | Verify both use same editorId |

**Debug with Console:**

```js
// Check store state
window.VeltCrdtStoreMap.get('your-editor-id').getValue();

// Monitor changes
window.VeltCrdtStoreMap.get('your-editor-id').subscribe(v => console.log(v));
```

**Verification:**
- [ ] Two different authenticated users
- [ ] Both on same editorId
- [ ] Cursors visible for remote users
- [ ] Text syncs bidirectionally
- [ ] No console errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Testing and Debugging)

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

**Key rules:**
- `initialContent` type is `string | undefined`
- For new documents, omit `initialContent` or pass `undefined`
- For seeding from a backend, convert to HTML string first
- Never pass a raw JSON object — it will display as text
- `initialContent` is applied **exactly once**, only when the document is brand new. To force-overwrite existing remote content (e.g., "reset to template"), pass `forceResetInitialContent: true`.

**Force-reset to template (use sparingly — destroys remote state):**

```tsx
const { extension } = useCollaboration({
  editorId: 'my-tiptap-editor',
  initialContent: '<p>Fresh start!</p>',
  forceResetInitialContent: true,  // Always overwrite remote content on init
});
```

```js
// Non-React equivalent
const manager = await createCollaboration({
  editorId: 'my-document-id',
  veltClient: client,
  initialContent: '<p>Fresh start!</p>',
  forceResetInitialContent: true,
});
```

**Verification:**
- [ ] Editor displays formatted text, not raw JSON
- [ ] Initial content matches expected formatting (headings, paragraphs, etc.)
- [ ] New documents start with empty or default content, not JSON

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap`

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
```

#### Version Management

```js
// Save a named snapshot — returns a versionId
const versionId = await manager.saveVersion('Before major edit');

// List versions: [{ versionId, versionName, timestamp }, ...]
const versions = await manager.getVersions();

// Restore by versionId — pushes the restored state to all clients
await manager.restoreVersion(versions[0].versionId);

// Apply a Version object's state locally (no broadcast)
await manager.setStateFromVersion(version);
```

#### Yjs Escape Hatches

The manager exposes the underlying Yjs primitives for advanced use (custom plugins, debugging, interop with other Yjs tooling). Prefer the manager's high-level methods first; reach for these only when you actually need Yjs-level control.

```js
const doc        = manager.getDoc();         // Y.Doc
const xml        = manager.getXmlFragment(); // Y.XmlFragment | null  (TipTap content root)
const provider   = manager.getProvider();    // SyncProvider
const awareness  = manager.getAwareness();   // Awareness (Yjs awareness protocol)
const crdtStore  = manager.getStore();       // Velt CRDT Store<string>
```

**Incorrect (poking at the editor for Yjs internals):**

```tsx
// WRONG: reach for editor.storage or editor.view to find Y.Doc — undefined behaviour
const ydoc = (editor as any).storage?.collaboration?.document;
```

#### Subscription Lifecycle

Every `manager.on*` method returns an `Unsubscribe` function. Treat them like event listeners — always pair `subscribe` with `unsubscribe` so listeners do not leak:

```js
// SETUP
const unsubStatus = manager.onStatusChange((s) => updateBadge(s));
const unsubSynced = manager.onSynced((synced) => updateBadge(undefined, synced));

// TEARDOWN — call before manager.destroy() and on component unmount
unsubStatus();
unsubSynced();
manager.destroy();
```

In React, the `useCollaboration` hook handles this automatically — use the returned reactive `status` / `isSynced` / `error` values instead of calling `manager.onStatusChange` manually unless you need imperative side effects.

**Signature Reference:**

| Member | Type | Notes |
|---|---|---|
| `createExtension()` | `Extension` | Non-React: get the TipTap extension bundling Yjs binding + cursor rendering. The React hook returns this directly as `extension`. |
| `onStatusChange(cb)` | `(SyncStatus) => Unsubscribe` | `'connecting' \| 'connected' \| 'disconnected'` |
| `onSynced(cb)` | `(boolean) => Unsubscribe` | Fires `true` after initial backend sync. |
| `status` / `synced` / `initialized` | `SyncStatus` / `boolean` / `boolean` | Synchronous reads. |
| `saveVersion(name)` | `Promise<string>` | Returns the new `versionId`. |
| `getVersions()` | `Promise<Version[]>` | `{ versionId, versionName, timestamp }[]`. |
| `restoreVersion(versionId)` | `Promise<boolean>` | Broadcasts restored state to all clients. |
| `setStateFromVersion(v)` | `Promise<void>` | Local-only apply. |
| `getDoc / getXmlFragment / getProvider / getAwareness / getStore` | Yjs / Velt primitives | Escape hatches. |
| `destroy()` | `void` | Idempotent; auto-fires on editor destroy. |

**Verification:**
- [ ] UI reads `status` / `isSynced` from the hook return value (React) or `manager.on*` subscriptions (non-React)
- [ ] Every `manager.on*` subscription has a matching `unsubscribe()` call on teardown (non-React)
- [ ] Version save / restore uses `manager.saveVersion` / `manager.restoreVersion` — not v1 `store.*` calls
- [ ] Yjs internals (`Y.Doc`, `Y.XmlFragment`, `Awareness`) are read via `manager.get*` only when needed
- [ ] `manager.destroy()` is called manually only if the editor is not the lifecycle owner — otherwise rely on the auto-cleanup hook

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 3, 5, 6, 11; ## APIs)

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

**EditorId Naming Strategies:**

| Pattern | Example | Use Case |
|---------|---------|----------|
| Feature + ID | `document-${id}` | Multiple documents |
| Section-based | `${page}-${section}` | Multi-section pages |
| Component-based | `main-editor`, `sidebar-notes` | Single-page apps |

**Verification:**
- [ ] Each editor has a unique `editorId`
- [ ] editorId consistent across page reloads for same editor
- [ ] Content doesn't appear in wrong editors
- [ ] Collaborators on same editorId see each other's changes

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Notes > **Unique editorId**: Use a unique `editorId` per editor instance)

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

**Store Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `getCollabExtension()` | Extension | Tiptap collaboration extension |
| `getStore()` | Store | Underlying CRDT store |
| `getYDoc()` | Y.Doc | Yjs document |
| `getYXml()` | Y.XmlFragment | Yjs XML for rich text |
| `destroy()` | void | Cleanup resources |

**Verification:**
- [ ] `initVelt()` and `setVeltAuthProvider()` called first
- [ ] `veltClient.setDocument()` called
- [ ] `undoRedo: false` in StarterKit config
- [ ] `store.destroy()` called on cleanup

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap#legacy-api-v1` (## Legacy API (v1)); also https://docs.velt.dev/api-reference/sdk/api/api-methods#createvelttiptapstore-deprecated

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

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/blocknote-crdt-react` | React hook (`useCollaboration`) for BlockNote CRDT |
| `@veltdev/blocknote-crdt` | Core BlockNote CRDT — exports `createCollaboration` and `CollaborationManager` |
| `@veltdev/react` | Velt React provider (`VeltProvider`, `useVeltClient`) |
| `@veltdev/client` | Velt client (`initVelt`) for non-React apps |
| `@veltdev/types` | TypeScript types (`Velt`, `CollaborationManager`, etc.) |
| `@blocknote/core` | BlockNote editor core |
| `@blocknote/react` | BlockNote React bindings (`useCreateBlockNote`) |
| `@blocknote/mantine` | BlockNote Mantine UI (`BlockNoteView`) |
| `yjs` | CRDT runtime — direct dependency in v2 |

> **v2 note:** As of `@veltdev/blocknote-crdt(-react)` v2, the v1 hook `useVeltBlockNoteCrdtExtension` is deprecated. New integrations should use `useCollaboration` (React) or `createCollaboration` (non-React). Both return a `CollaborationManager` with status, sync state, and first-class version management. See `rules/shared/blocknote/blocknote-collaboration-manager.md` and `rules/shared/blocknote/blocknote-v1-to-v2-migration.md`.

**Verification:**
- [ ] All packages in package.json
- [ ] No peer dependency warnings
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (### Step 1: Install Dependencies)

---

### 3.2 Test BlockNote Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test BlockNote collaboration using different authenticated users in separate browser profiles.

**Test Procedure:**

1. Open app in Browser Profile A, login as User A
2. Open same page in Browser Profile B, login as User B
3. Both must have same editorId

**What to Verify:**

| Test | Expected |
|------|----------|
| User A types | Text appears for User B |
| Both type simultaneously | Content merges correctly |
| Cursors | Remote user cursors visible |

**Common Issues:**

| Issue | Fix |
|-------|-----|
| Cursors not appearing | Use different authenticated users |
| Editor not loading | Check VeltProvider and API key |
| Content not syncing | Verify same editorId |

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

**Verification:**
- [ ] Two different authenticated users
- [ ] Same editorId on both
- [ ] Text syncs both directions
- [ ] No console errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Testing and Debugging)

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

**EditorId Strategies:**

| Pattern | Example |
|---------|---------|
| Document-based | `doc-${documentId}` |
| Feature-based | `main-editor`, `sidebar` |
| User + doc | `${userId}-${docId}` |

**Verification:**
- [ ] Each editor has unique `editorId`
- [ ] ID consistent across page reloads
- [ ] Content doesn't appear in wrong editors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Notes > **Unique editorId**)

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

**Hook Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `editorId` | string | Unique identifier for this editor |
| `initialContent` | string (optional) | Initial JSON content |
| `debounceMs` | number (optional) | Debounce time for sync |

**Hook Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `collaborationConfig` | object \| null | Config to pass to BlockNote |
| `store` | BlockNoteStore \| null | Underlying CRDT store |
| `isLoading` | boolean | True until store is ready |

**Important:** Use the `key` prop to force re-render when collaborationConfig changes.

**Verification:**
- [ ] `collaborationConfig` passed to `useCreateBlockNote`
- [ ] `key` prop set on `BlockNoteView`
- [ ] Unique `editorId` provided
- [ ] Connection status shows connected

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote#legacy-api-v1` (## Legacy API (v1) > React: useVeltBlockNoteCrdtExtension() (deprecated))

---

### 3.5 Migrate BlockNote CRDT Integrations from v1 to v2

**Impact: HIGH (v1 API (useVeltBlockNoteCrdtExtension) is deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points)**

The v1 BlockNote CRDT API (`useVeltBlockNoteCrdtExtension` for React) is deprecated and remains exported only for backward compatibility — it internally delegates to `useCollaboration` (v2) via a compatibility wrapper. All new integrations must use the v2 entry points (`useCollaboration` for React, `createCollaboration` for non-React), which return a `CollaborationManager` with reactive status, sync state, first-class version methods, and a richer Yjs surface. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

v2 also introduces non-React BlockNote support via `@veltdev/blocknote-crdt` and `createCollaboration`. In v1, only React was supported.

#### React: v1 → v2

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

#### Non-React: v1 → v2

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

#### Migration Checklist

- [ ] All `useVeltBlockNoteCrdtExtension` imports replaced with `useCollaboration`
- [ ] `initialContent` migrated from `JSON.stringify([...])` to a `PartialBlock[]` array
- [ ] `store.*` references migrated to `manager.*` equivalents or the React first-class returns (`saveVersion`, `getVersions`, `restoreVersion`)
- [ ] `store.setStateFromVersion(v)` calls replaced with `manager.restoreVersion(versionId)` (broadcasts) or `manager.setStateFromVersion(v)` (local-only)
- [ ] `onError` callback added; UI reads `response.error` for runtime errors
- [ ] UI wired to reactive `status` / `isSynced` instead of relying on the absence of v1 indicators
- [ ] Non-React BlockNote flow gated on `client.getVeltInitState().subscribe(...)` before calling `createCollaboration`
- [ ] Old `store.getYDoc` / `store.getYXml` / `store.isConnected` calls replaced with `manager.getDoc` / `manager.getXmlFragment` / `manager.status`
- [ ] `manager.destroy()` used in place of v1 implicit cleanup when the editor is not the lifecycle owner

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Migration Guide: v1 to v2; ## Legacy API (v1))

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
```

`initialContent` is applied exactly once — only when the document is brand new. On subsequent loads, the persisted content is used instead. Pass `forceResetInitialContent: true` to always overwrite remote data — this is a development-only flag.

#### Version Management

In React, the hook returns version methods as first-class APIs. In non-React, call them on the manager.

```js
// Save a named snapshot — returns a versionId
const versionId = await manager.saveVersion('Before major edit');

// List versions: [{ versionId, versionName, timestamp }, ...]
const versions = await manager.getVersions();

// Restore by versionId — pushes the restored state to all clients
await manager.restoreVersion(versions[0].versionId);

// Apply a Version object's state locally (no broadcast)
await manager.setStateFromVersion(version);
```

#### Yjs Escape Hatches

The manager exposes the underlying Yjs primitives for advanced use (custom plugins, debugging, interop with other Yjs tooling). Prefer the manager's high-level methods first; reach for these only when you actually need Yjs-level control.

```js
const doc        = manager.getDoc();         // Y.Doc
const xml        = manager.getXmlFragment(); // Y.XmlFragment | null  (BlockNote document-store key)
const provider   = manager.getProvider();    // SyncProvider
const awareness  = manager.getAwareness();   // Awareness (Yjs awareness protocol)
const crdtStore  = manager.getStore();       // Velt CRDT Store<string>
```

**Incorrect (poking at the editor for Yjs internals):**

```tsx
// WRONG: reach into editor internals to find Y.Doc — undefined behaviour
const ydoc = (editor as any)._tiptapEditor?.storage?.collaboration?.document;
```

#### Subscription Lifecycle

Every `manager.on*` method returns an `Unsubscribe` function. Treat them like event listeners — always pair `subscribe` with `unsubscribe` so listeners do not leak:

```js
// SETUP
const unsubStatus = manager.onStatusChange((s) => updateBadge(s));
const unsubSynced = manager.onSynced((synced) => updateBadge(undefined, synced));

// TEARDOWN — call before manager.destroy() and on component unmount
unsubStatus();
unsubSynced();
manager.destroy();
```

In React, the `useCollaboration` hook handles this automatically — use the returned reactive `status` / `isSynced` / `error` values instead of calling `manager.onStatusChange` manually unless you need imperative side effects.

**Signature Reference:**

| Member | Type | Notes |
|---|---|---|
| `getCollaborationConfig(options?)` | `BlockNoteCollaborationConfig \| null` | Pass to `useCreateBlockNote({ collaboration: ... })` or `BlockNoteEditor.create({ collaboration: ... })`. Optional `showCursorLabels: 'activity' \| 'always'`. |
| `onStatusChange(cb)` | `(SyncStatus) => Unsubscribe` | `'connecting' \| 'connected' \| 'disconnected'` |
| `onSynced(cb)` | `(boolean) => Unsubscribe` | Fires `true` after initial backend sync. |
| `status` / `synced` / `initialized` | `SyncStatus` / `boolean` / `boolean` | Synchronous reads. |
| `saveVersion(name)` | `Promise<string>` | Returns the new `versionId` (empty string on failure). |
| `getVersions()` | `Promise<Version[]>` | `{ versionId, versionName, timestamp }[]`. |
| `restoreVersion(versionId)` | `Promise<boolean>` | Broadcasts restored state to all clients. |
| `setStateFromVersion(v)` | `Promise<void>` | Local-only apply. |
| `getDoc / getXmlFragment / getProvider / getAwareness / getStore` | Yjs / Velt primitives | Escape hatches. |
| `destroy()` | `void` | Idempotent; auto-fires on editor destroy or component unmount. |

**Verification:**
- [ ] UI reads `status` / `isSynced` from the hook return value (React) or `manager.on*` subscriptions (non-React)
- [ ] `collaborationConfig` (React) or `manager.getCollaborationConfig()` (non-React) is passed to `useCreateBlockNote` / `BlockNoteEditor.create`
- [ ] Every `manager.on*` subscription has a matching `unsubscribe()` call on teardown (non-React)
- [ ] Version save / restore uses `manager.saveVersion` / `manager.restoreVersion` (or the React first-class returns) — not v1 `store.*` calls
- [ ] Yjs internals (`Y.Doc`, `Y.XmlFragment`, `Awareness`) are read via `manager.get*` only when needed
- [ ] `manager.destroy()` is called manually only if the editor is not the lifecycle owner — otherwise rely on the auto-cleanup hook

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (### Step 3, 4, 5, 10, 11; ## APIs)

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

**Hook Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `store` | CodeMirrorStore \| null | CRDT store with Yjs access |
| `isLoading` | boolean | True until store is ready |

**Store Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `getYText()` | Y.Text \| null | Yjs text for document |
| `getAwareness()` | Awareness | Yjs awareness for cursors |
| `getUndoManager()` | Y.UndoManager | Yjs undo manager |
| `destroy()` | void | Cleanup resources |

**Verification:**
- [ ] `store` used after `isLoading` is false
- [ ] `yCollab` receives store's YText, Awareness, UndoManager
- [ ] EditorView destroyed on cleanup

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Legacy API (v1) > React: useVeltCodeMirrorCrdtExtension() (deprecated))

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

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/codemirror-crdt-react` | React hook (`useCollaboration`) for CodeMirror CRDT |
| `@veltdev/codemirror-crdt` | Core CodeMirror CRDT (`createCollaboration`, `CollaborationManager`) |
| `@veltdev/react` / `@veltdev/client` | Velt SDK (React provider / non-React client) |
| `@veltdev/types` | TypeScript types for the Velt SDK (React projects) |
| `y-codemirror.next` | Yjs CodeMirror bindings (`yCollab`) |
| `yjs` | Yjs CRDT runtime |
| `codemirror` | CodeMirror editor |
| `@codemirror/state` | CodeMirror state |
| `@codemirror/view` | CodeMirror view (React install) |

**Verification:**
- [ ] All packages in package.json
- [ ] `y-codemirror.next` installed for yCollab
- [ ] No peer dependency warnings

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 1: Install Dependencies)

---

### 4.3 Migrate CodeMirror CRDT Integrations from v1 to v2

**Impact: HIGH (v1 APIs (useVeltCodeMirrorCrdtExtension, createVeltCodeMirrorStore / createVeltCodeMirrorCrdtExtension) are deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points)**

The v1 CodeMirror CRDT API (`useVeltCodeMirrorCrdtExtension` for React, `createVeltCodeMirrorStore` / `createVeltCodeMirrorCrdtExtension` for non-React) is deprecated and remains exported only for backward compatibility. All new integrations must use the v2 entry points (`useCollaboration` / `createCollaboration`), which return a `CollaborationManager` with reactive status, sync state, version management, and richer Yjs escape hatches. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

#### React: v1 → v2

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

#### Non-React: v1 → v2

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

#### Migration Checklist

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

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Migration Guide: v1 to v2; ## Legacy API (v1))

---

### 4.4 Test CodeMirror Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test CodeMirror collaboration using different authenticated users in separate browser profiles.

**Test Procedure:**

1. Open app in Browser Profile A, login as User A
2. Open same page in Browser Profile B, login as User B
3. Both must have same editorId

**What to Verify:**

| Test | Expected |
|------|----------|
| User A types code | Code appears for User B |
| Both type simultaneously | Code merges correctly |
| Cursors | Remote user cursors visible |
| Undo | Undoes own changes only |

**Common Issues:**

| Issue | Fix |
|-------|-----|
| Cursors not appearing | Use different authenticated users |
| Editor not loading | Check VeltProvider and API key |
| Content not syncing | Verify same editorId |
| Disconnected session | Check network connectivity |

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

**Verification:**
- [ ] Two different authenticated users
- [ ] Same editorId on both
- [ ] Code syncs both directions
- [ ] Cursors show for remote users

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Testing and Debugging)

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
```

#### Version Management

```js
// Save a named snapshot — returns a versionId
const versionId = await manager.saveVersion('Before major edit');

// List versions: [{ versionId, versionName, timestamp }, ...]
const versions = await manager.getVersions();

// Restore by versionId — pushes the restored state to all clients
await manager.restoreVersion(versions[0].versionId);

// Apply a Version object's state locally (no broadcast)
await manager.setStateFromVersion(version);
```

#### Yjs Escape Hatches

The manager exposes the underlying Yjs primitives for advanced use (custom CodeMirror plugins, debugging, interop with other Yjs tooling). Prefer the manager's high-level methods and the `primitives` returned by the hook first; reach for these only when you actually need Yjs-level control.

```js
const doc        = manager.getDoc();           // Y.Doc
const ytext      = manager.getYText();         // Y.Text | null   (non-React)
const text       = manager.getText();          // Y.Text | null   (React)
const provider   = manager.getProvider();      // SyncProvider
const awareness  = manager.getAwareness();     // Awareness (Yjs awareness protocol)
const crdtStore  = manager.getStore();         // Velt CRDT Store<string>
const undoMgr    = manager.getUndoManager();   // Y.UndoManager | null
```

**Incorrect (constructing a second Y.Doc and binding it to CodeMirror):**

```js
// WRONG: a separate Y.Doc bypasses the manager's sync provider — edits will not propagate
import * as Y from 'yjs';
const ydoc = new Y.Doc();
const ytext = ydoc.getText('codemirror');
yCollab(ytext, /* no awareness from Velt */ null, {});
```

#### Subscription Lifecycle

Every `manager.on*` method returns an `Unsubscribe` function. Treat them like event listeners — always pair `subscribe` with `unsubscribe` so listeners do not leak:

```js
// SETUP
const unsubStatus = manager.onStatusChange((s) => updateBadge(s));
const unsubSynced = manager.onSynced((synced) => updateBadge(undefined, synced));

// TEARDOWN — call before manager.destroy() and on component unmount
unsubStatus();
unsubSynced();
manager.destroy();
```

In React, the `useCollaboration` hook handles this automatically — use the returned reactive `status` / `isSynced` / `error` values instead of calling `manager.onStatusChange` manually unless you need imperative side effects.

**Signature Reference:**

| Member | Type | Notes |
|---|---|---|
| `getCollaborationPrimitives()` | `{ ytext, awareness, undoManager, doc }` | Non-React: fetch the Yjs primitives to pass into `yCollab()`. The React hook returns these directly as `primitives`. |
| `onStatusChange(cb)` | `(SyncStatus) => Unsubscribe` | `'connecting' \| 'connected' \| 'disconnected'` |
| `onSynced(cb)` | `(boolean) => Unsubscribe` | Fires `true` after initial backend sync. |
| `status` / `synced` / `initialized` | `SyncStatus` / `boolean` / `boolean` | Synchronous reads. |
| `saveVersion(name)` | `Promise<string>` | Returns the new `versionId`. |
| `getVersions()` | `Promise<Version[]>` | `{ versionId, versionName, timestamp }[]`. |
| `restoreVersion(versionId)` | `Promise<boolean>` | Broadcasts restored state to all clients. |
| `setStateFromVersion(v)` | `Promise<void>` | Local-only apply. |
| `getDoc / getYText / getText / getProvider / getAwareness / getStore / getUndoManager` | Yjs / Velt primitives | Escape hatches. |
| `destroy()` | `void` | Idempotent; cascades to store, provider, undo manager, listeners. |

**Verification:**
- [ ] UI reads `status` / `isSynced` from the hook return value (React) or `manager.on*` subscriptions (non-React)
- [ ] Every `manager.on*` subscription has a matching `unsubscribe()` call on teardown (non-React)
- [ ] Version save / restore uses `manager.saveVersion` / `manager.restoreVersion` — not v1 `store.*` calls
- [ ] `yCollab()` receives `primitives.ytext` / `primitives.awareness` / `primitives.undoManager` (or the non-React equivalent from `getCollaborationPrimitives()`) — never a separately constructed Y.Doc
- [ ] `manager.destroy()` (or the auto-cleanup on component unmount) is called on teardown

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 3, 4, 5, 10, 11; ## APIs)

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

**EditorId Strategies:**

| Pattern | Example | Use Case |
|---------|---------|----------|
| File-based | `file-${fileId}` | Multi-file editor |
| Tab-based | `tab-${tabId}` | Tabbed editor |
| Path-based | `code-${filePath}` | File browser |

**Verification:**
- [ ] Each editor has unique `editorId`
- [ ] ID consistent across page reloads
- [ ] Code doesn't appear in wrong files

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Notes > **Unique editorId**)

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

**What each primitive provides:**

| Primitive | Source | Purpose |
|---|---|---|
| `ytext` | `primitives.ytext` / `manager.getYText()` | Shared text content (`Y.Text`) bound to the document |
| `awareness` | `primitives.awareness` / `manager.getAwareness()` | Cursor positions, user presence |
| `undoManager` | `primitives.undoManager` / `manager.getUndoManager()` | Collaborative undo/redo (local-only edits) |
| `doc` | `primitives.doc` / `manager.getDoc()` | Underlying `Y.Doc` (advanced) |

**Verification:**
- [ ] `yCollab` in extensions array
- [ ] Uses `primitives.ytext` / `manager.getYText()` — not a freshly constructed `Y.Doc`
- [ ] Awareness passed for cursor support
- [ ] UndoManager passed for collaborative undo

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 3; ### CollaborationPrimitives)

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

**Store Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `editorId` | string | Yes | Unique editor identifier |
| `veltClient` | VeltClient | Yes | Initialized Velt client |
| `initialContent` | string | No | Initial code content |
| `debounceMs` | number | No | Debounce time |

**Verification:**
- [ ] `initVelt()` called first
- [ ] `veltClient.setDocument()` called
- [ ] `yCollab` wired with store's Yjs objects
- [ ] `store.destroy()` called on cleanup

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Legacy API (v1) > Non-React: createVeltCodeMirrorCrdtExtension() (deprecated))

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

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/reactflow-crdt` | React Flow CRDT integration |
| `@veltdev/react` | Velt React provider |
| `@xyflow/react` | React Flow library |

**Note:** ReactFlow CRDT is React-only. Non-React support is not documented.

**Verification:**
- [ ] Packages in package.json
- [ ] No peer dependency warnings
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (### Step 1: Install Dependencies)

---

### 5.2 Test ReactFlow Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test ReactFlow collaboration using different authenticated users in separate browser profiles.

**Test Procedure:**

1. Open app in Browser Profile A, login as User A
2. Open same page in Browser Profile B, login as User B
3. Both must have same editorId

**What to Verify:**

| Test | Expected |
|------|----------|
| User A moves node | Node moves for User B |
| User B creates connection | Edge appears for User A |
| Both edit simultaneously | Changes merge correctly |

**Common Issues:**

| Issue | Fix |
|-------|-----|
| Nodes not syncing | Check editorId matches |
| | Verify Velt client initialized |
| No updates on connect | Use CRDT handlers, not local state |
| Diagram not loading | Check API key and VeltProvider |

**Debug with Console:**

```js
// Check current nodes/edges
window.VeltCrdtStoreMap.get('your-diagram-id').getValue();
```

**Verification:**
- [ ] Two different authenticated users
- [ ] Same editorId on both
- [ ] Node/edge changes sync both directions
- [ ] No console errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (## Testing and Debugging)

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

**Handler Reference:**

| Handler | Purpose | Change Types |
|---------|---------|--------------|
| `onNodesChange` | Node add/update/remove | `add`, `remove`, `position`, `select`, etc. |
| `onEdgesChange` | Edge add/update/remove | `add`, `remove`, `select`, etc. |
| `onConnect` | New connections | Connection object |

**Verification:**
- [ ] All changes go through CRDT handlers
- [ ] No direct mutation of `nodes`/`edges` arrays
- [ ] Changes appear for collaborators

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (## Notes > **Use CRDT handlers**)

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

**EditorId Strategies:**

| Pattern | Example | Use Case |
|---------|---------|----------|
| Document-based | `diagram-${docId}` | Multiple diagrams |
| Feature-based | `main-flow`, `sidebar-flow` | Single-page app |
| Project-based | `project-${id}-flow` | Project management |

**Verification:**
- [ ] Each diagram has unique `editorId`
- [ ] ID consistent across page reloads
- [ ] Nodes don't appear in wrong diagrams

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (## Notes > **Unique editorId**)

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

**Hook Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `editorId` | string | Unique identifier for this diagram |
| `initialNodes` | Node[] | Initial nodes array |
| `initialEdges` | Edge[] | Initial edges array |
| `debounceMs` | number (optional) | Debounce time for sync |

**Hook Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `nodes` | Node[] | CRDT-synced nodes |
| `edges` | Edge[] | CRDT-synced edges |
| `onNodesChange` | function | CRDT-aware node change handler |
| `onEdgesChange` | function | CRDT-aware edge change handler |
| `onConnect` | function | CRDT-aware connection handler |
| `setNodes` | function | Imperative node setter |
| `setEdges` | function | Imperative edge setter |
| `store` | Store \| null | Underlying CRDT store |

**Verification:**
- [ ] Using hook's `nodes`/`edges`, not local state
- [ ] All handlers from hook passed to ReactFlow
- [ ] Wrapped in ReactFlowProvider
- [ ] Unique `editorId` provided

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow#step-3-initialize-velt-crdt-extension` (### Step 3: Initialize Velt CRDT Extension)

---

## 6. Multiplayer Editor Integrations

**Impact: HIGH**

Velt multiplayer packages for Lexical, Slate, Draft.js, ProseMirror, Quill, TinyMCE, CKEditor 5, SuperDoc, Monaco, Ace, Apryse WebViewer, Nutrient, and SpreadJS. Covers the shared CollaborationManager lifecycle, package selection, and each editor's binding, history, cursor, and teardown pitfalls.

### 6.1 Create the Slate Editor Once and Let the Manager Apply the Slate-Yjs Plugins

**Impact: HIGH (Recreating the editor every render tears down collaboration; wrapping withYjs yourself or passing HTML initial content breaks sync and hydration)**

`@veltdev/slate-crdt` (one package with both `useCollaboration()` and `createCollaboration()`) enhances a consumer-owned Slate editor. The manager applies `withYjs`, `withYHistory`, and (unless `enableCursors: false`) `withCursors` before remote data hydrates, backed by a shared `Y.XmlText`. Create the editor once with `useMemo()`, pass Slate `Descendant[]` nodes as `initialContent`, and publish selection changes so remote cursors render.

**Incorrect (editor recreated each render, manual plugins, HTML seed):**

```tsx
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withYjs } from '@slate-yjs/core';
import { useCollaboration } from '@veltdev/slate-crdt';

function Editor() {
  const editor = withYjs(withReact(createEditor()), sharedType); // new editor every render, manual binding
  useCollaboration({
    editorId: 'my-slate-editor',
    editor,
    initialContent: '<p>Hello</p>', // Slate expects Descendant[] nodes, not HTML
  });
}
```

**Correct (React hook):**

```tsx
import { useMemo } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { useDecorateRemoteCursors } from '@slate-yjs/react';
import { useCollaboration } from '@veltdev/slate-crdt';

const INITIAL_CONTENT = [{ type: 'paragraph', children: [{ text: 'Start writing...' }] }];

function CursorEditable({ readOnly }: { readOnly: boolean }) {
  const decorate = useDecorateRemoteCursors({ carets: true });
  return <Editable readOnly={readOnly} decorate={decorate} placeholder="Start typing..." />;
}

export function CollaborativeEditor() {
  const rawEditor = useMemo(() => withReact(createEditor()), []);

  const { manager, isLoading, isSynced, status, error } = useCollaboration({
    editorId: 'my-slate-editor',
    editor: rawEditor,
    initialContent: INITIAL_CONTENT,
    cursorData: { name: 'Ada', color: '#2563eb', colorLight: 'rgba(37, 99, 235, 0.2)' },
    onError: (err) => console.error('Collaboration error:', err),
  });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <div>Status: {status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
      <Slate
        editor={rawEditor}
        initialValue={INITIAL_CONTENT}
        onChange={() => manager?.sendCursorPosition(rawEditor.selection)}
      >
        <CursorEditable readOnly={isLoading} />
      </Slate>
    </>
  );
}
```

**Correct (imperative API, lifecycle managed by your code):**

```tsx
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { createCollaboration } from '@veltdev/slate-crdt';

const editor = withReact(createEditor());
const manager = await createCollaboration({
  editorId: 'my-slate-editor',
  editor,
  veltClient: client, // initialized, user identified, document set
  initialContent: [{ type: 'paragraph', children: [{ text: 'Start writing...' }] }],
});

const enhancedEditor = manager.getEditor(); // editor with YjsEditor, YHistoryEditor, CursorEditor applied

// Cleanup
manager.destroy();
```

#### Slate-specific notes

- `manager.updateCursorData()`, `manager.sendCursorPosition(selection)`, and `manager.getCursorStates()` manage awareness-backed cursors.
- Option passthroughs: `yjsOptions` (to `withYjs`), `undoManagerOptions` (to `withYHistory`), `cursorOptions` (to `withCursors`); `autoConnect: false` leaves the Yjs editor disconnected after initialization.
- The hook destroys the manager on unmount or when `editorId`, editor, or Velt client change, and returns `destroy()` for early teardown.
- `forceResetInitialContent: true` clears shared Slate content for every user; reserve it for deliberate resets.

**Verification Checklist:**
- [ ] `withReact(createEditor())` wrapped in `useMemo()` (created once)
- [ ] No manual `withYjs` / `withYHistory` / `withCursors` wrapping
- [ ] `initialContent` is a valid `Descendant[]`
- [ ] `onChange` publishes `sendCursorPosition(editor.selection)` and `Editable` uses `useDecorateRemoteCursors()`
- [ ] Imperative usage calls `manager.destroy()` on teardown

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/slate - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/slate - "Step 7: Configure Remote Cursors (Optional)"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/slate - "Notes" and "APIs"

---

### 6.2 Route Every Draft.js Change Through handleChange() with Ref-Backed EditorState

**Impact: HIGH (Bypassing handleChange() means local edits never reach the CRDT; a closure-captured getEditorState applies remote snapshots to stale state)**

Draft.js is a controlled editor, so `@veltdev/draftjs-crdt` (one package with `useCollaboration()` and `createCollaboration()`) needs `getEditorState` / `setEditorState` accessors from your app. Keep a ref synchronized with the latest `EditorState`, and pass every `onChange` value (including `RichUtils` results) through `handleChange()` before storing it. Bypassing it keeps the change local.

**Incorrect (bypasses handleChange, stale closure):**

```tsx
const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

useCollaboration({
  editorId: 'my-draftjs-editor',
  getEditorState: () => editorState, // captured once: stale after the first change
  setEditorState,
});

<Editor editorState={editorState} onChange={setEditorState} />; // never reaches the CRDT
```

**Correct (React hook):**

```tsx
import { useCallback, useRef, useState } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useCollaboration } from '@veltdev/draftjs-crdt';

export function CollaborativeEditor() {
  const [editorState, setEditorStateValue] = useState(() => EditorState.createEmpty());
  const editorStateRef = useRef(editorState);

  const setEditorState = useCallback((next: EditorState) => {
    editorStateRef.current = next;
    setEditorStateValue(next);
  }, []);
  const getEditorState = useCallback(() => editorStateRef.current, []);

  const { handleChange, manager, isLoading, isSynced, status, error } = useCollaboration({
    editorId: 'my-draftjs-editor',
    getEditorState,
    setEditorState,
    initialContent: 'Hello Draft.js CRDT!',
    cursorData: { name: 'Ada', color: '#2563eb' },
    onError: (err) => console.error('Collaboration error:', err),
  });

  const onEditorChange = useCallback(
    (next: EditorState) => setEditorState(handleChange(next)),
    [handleChange, setEditorState],
  );
  const toggleBold = () => onEditorChange(RichUtils.toggleInlineStyle(editorStateRef.current, 'BOLD'));

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div>Status: {isLoading ? 'loading' : status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
      <button onClick={toggleBold}>Bold</button>
      <Editor
        editorState={editorState}
        onChange={onEditorChange}
        onFocus={() => manager?.sendCursorPosition()}
        onBlur={() => manager?.sendCursorPosition()}
      />
    </div>
  );
}
```

With the imperative `createCollaboration({ editorId, veltClient, getEditorState, setEditorState })`, call `setEditorState(manager.handleChange(next))` and `manager.destroy()` on teardown (safe to call more than once).

#### Draft.js-specific notes

- Cursor DOM is application-owned: subscribe with `manager.onRemoteCursorsChange((cursors) => ...)` and render the returned `RemoteDraftCursor` data yourself.
- `initialContent` accepts plain text or `RawDraftContentState`. Migrate existing content with `convertToRaw(editorState.getCurrentContent())`, not through HTML.
- Data model: an XML store (key `draftjs`) holding raw-content snapshots. Online edits sync quickly, but two offline users editing the same old snapshot can supersede each other; choose Lexical or Slate when character-level offline merging matters.
- REST-created content is bridged from the `restContentKey` fragment (default `'document-store'`); send Yjs-compatible XML state through the CRDT REST endpoints.
- Do not disable local editing only because the provider is `connecting`.

**Verification Checklist:**
- [ ] `getEditorState` reads from a ref updated by `setEditorState`
- [ ] Every `onChange` and `RichUtils` result passes through `handleChange()`
- [ ] Remote cursors rendered from `onRemoteCursorsChange()` data
- [ ] `initialContent` is plain text or raw Draft JSON, and `forceResetInitialContent` is off for normal loads
- [ ] Product accepts snapshot reconciliation for offline concurrent edits

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs - "Step 4: Preserve the Controlled Editor Pattern"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs - "REST API Compatibility" and "Concurrency and Data Model"

---

### 6.3 Attach the ProseMirror View Before initialize() and Use Velt's Yjs undo/redo

**Impact: HIGH (Initializing before the view is attached drops remote hydration; prosemirror-history or y-prosemirror commands break collaborative undo)**

`@veltdev/prosemirror-crdt` installs Yjs sync, cursor, and undo plugins into a ProseMirror `EditorState`. In direct (Other Frameworks) setups, create the manager with `autoInitialize: false`, build the plugin set, create the state and view, attach the view, and only then call `initialize()`. Otherwise remote updates can arrive before the `EditorView` can receive them.

**Incorrect (auto-initialize, local history, y-prosemirror commands, plugins twice):**

```ts
import { history, undo as pmUndo } from 'prosemirror-history';
import { undo } from 'y-prosemirror';
import { createCollaboration } from '@veltdev/prosemirror-crdt';

const manager = await createCollaboration({ editorId: 'doc', veltClient: client, schema });
// Store already hydrated before any view exists

const pluginsA = manager.createCollaborationPlugins();
const pluginsB = manager.createCollaborationPlugins(); // second plugin set for the same state
const state = EditorState.create({ schema, plugins: [...pluginsA.plugins, history()] });
```

**Correct (Other Frameworks: deferred lifecycle):**

```ts
import { createCollaboration, undo, redo } from '@veltdev/prosemirror-crdt';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';

const manager = await createCollaboration({
  editorId: 'my-prosemirror-doc',
  veltClient: client,
  schema,                       // one schema, created once, compatible across clients
  initialContent: 'Start writing here...',
  autoInitialize: false,        // required for direct setup
});

const collaboration = manager.createCollaborationPlugins({
  plugins: [keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }), keymap(baseKeymap)],
});
const state = EditorState.create({ schema, plugins: collaboration.plugins });
const view = new EditorView(mountElement, { state });

manager.attachEditorView(view);
await manager.initialize(); // last

// Teardown: view first, then the manager
view.destroy();
manager.destroy();
```

**Correct (React / Next.js: drop-in component with module-scope schema):**

```tsx
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import {
  ProseMirrorCrdtEditor,
  createDefaultProseMirrorSchema,
  undo,
  redo,
} from '@veltdev/prosemirror-crdt-react';

const schema = createDefaultProseMirrorSchema(); // never rebuilt per render
const plugins = [keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }), keymap(baseKeymap)];

export function CollaborativeEditor() {
  return (
    <ProseMirrorCrdtEditor
      editorId="my-prosemirror-doc"
      schema={schema}
      plugins={plugins}
      initialContent="Start writing here..."
      cursorData={{ name: 'Ada', color: '#2563eb' }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

The `useCollaboration()` hook returns `mountRef` and `editorView`; pass `editorView` plus `destroyViewOnUnmount: false` to attach an application-owned view (built with `manager.createCollaborationPlugins()` or `manager.createEditorState()`).

#### ProseMirror-specific notes

- Import `undo` / `redo` from the Velt package you use, not from `y-prosemirror`, and never add `prosemirror-history`.
- Schema node and mark names are part of the shared document contract; deploy schema changes as migrations. Invalid JSON in `initialContent` is rejected by the schema.
- `initialContent` accepts plain text or ProseMirror JSON. The shared fragment is stored under the `prosemirror` key.
- Style `.ProseMirror-yjs-cursor` / `.velt-prosemirror-cursor` and their `-label` / selection classes, or pass `disableCursors` to sync without the cursor plugin.
- Deduplicate `yjs`, `y-prosemirror`, and the `prosemirror-*` packages in the bundle.

**Verification Checklist:**
- [ ] Direct setup uses `autoInitialize: false` and calls `initialize()` after `attachEditorView(view)`
- [ ] `createCollaborationPlugins()` is called once per state
- [ ] `undo` / `redo` come from `@veltdev/prosemirror-crdt(-react)`; no `prosemirror-history`
- [ ] Schema created once and compatible across all clients
- [ ] Teardown destroys the `EditorView`, then the manager

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 4: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 5: Add Plugins, Keymaps, and CRDT Undo"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 3: Create a Schema" and "Notes"

---

### 6.4 Bind Monaco Once, Keep It Uncontrolled, and Style y-monaco Cursors

**Impact: HIGH (Controlled value props or a second bindEditor() call desync the shared Y.Text; missing cursor CSS leaves remote carets invisible)**

`@veltdev/monaco-crdt` binds a Monaco model to a shared `Y.Text` through `y-monaco`. The CRDT-backed model owns content, so never pass `value` / `defaultValue` to the React wrapper or seed a direct editor with local text; use `initialContent` instead. Choose exactly one binding path: pass `editor` to `createCollaboration()` (auto-bind) or omit it and call `bindEditor(editor)` once later.

**Incorrect (controlled value and double binding):**

```tsx
// React: value makes Monaco a second content source
<MonacoCrdtEditor editorId="file-1" value={code} onChange={setCode} />;

// Other Frameworks: auto-bound via `editor`, then bound again
const manager = await createCollaboration({ editorId: 'file-1', veltClient: client, editor });
await manager.bindEditor(editor);
```

**Correct (React / Next.js: drop-in component):**

```tsx
import { MonacoCrdtEditor } from '@veltdev/monaco-crdt-react';

export function CollaborativeEditor() {
  return (
    <MonacoCrdtEditor
      editorId="file-1"
      language="typescript"
      height="500px"
      initialContent={'export const greeting = "Hello";\n'}
      cursorData={{ name: 'Ada', color: '#2563eb' }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

With `useCollaboration()`, render `@monaco-editor/react`'s `Editor` and pass `onMount={(editor) => editorRef(editor)}`.

**Correct (Other Frameworks: auto-bind, then manager-first teardown):**

```ts
import * as monaco from 'monaco-editor';
import { createCollaboration } from '@veltdev/monaco-crdt';

const editor = monaco.editor.create(document.getElementById('editor'), { value: '', language: 'typescript' });

const manager = await createCollaboration({
  editorId: 'file-1',
  veltClient: client,
  editor,                                  // auto-binds; do not call bindEditor() too
  initialContent: '// Start writing here\n',
  cursorData: { name: 'Ada', color: '#2563eb' },
});

// Collaboration-aware history
manager.getUndoManager()?.undo();

// Teardown
manager.destroy();
editor.dispose();
```

**Remote cursor CSS (required for visible carets):**

```css
.yRemoteSelection { background-color: rgba(37, 99, 235, 0.2); }
.yRemoteSelectionHead { border-left: 2px solid #2563eb; min-height: 1.2em; }
```

For per-user colors and name labels, read `manager.getAwareness().getStates()` on `change` and inject `.yRemoteSelection-${clientId}` / `.yRemoteSelectionHead-${clientId}` rules, skipping `manager.getDoc().clientID`. Remove the style element and the `change` listener before destroying the manager.

#### Monaco-specific notes

- Monaco needs browser APIs: in Next.js load the editor with `dynamic(() => import('./CollaborativeMonaco'), { ssr: false })` and configure Monaco workers in your bundler.
- Deduplicate `yjs`, `y-protocols`, and `monaco-editor` (for example Vite `resolve.dedupe`). A "Yjs was already imported" warning means two copies are bundled.
- The manager creates a `text` store with content key `content`; the Monaco `language` does not change the shared format.
- `bindEditor(editor, { model, editors, awareness, destroyExisting })` is for shared models across several editor surfaces.

**Verification Checklist:**
- [ ] No `value` / `defaultValue` on the wrapper; direct editors start with `value: ''`
- [ ] Exactly one binding path per manager
- [ ] `.yRemoteSelection` / `.yRemoteSelectionHead` styles present
- [ ] Client-only rendering in SSR frameworks and workers configured
- [ ] `manager.destroy()` runs before `editor.dispose()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 7: Style Remote Cursors"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 13: Client-only Rendering" and "Notes"

---

### 6.5 Create CKEditor First, Keep data Uncontrolled, and Forward onAfterDestroy

**Impact: HIGH (Controlled data overwrites shared HTML; a missing onAfterDestroy leaves a stale manager bound after a watchdog restart)**

`@veltdev/ckeditor-crdt` stores normalized CKEditor HTML in a Yjs XML fragment. The manager owns content, so the drop-in component must not receive `data` or `onReady`, and a self-rendered `CKEditor` must keep `data=""` and never update it from React state. When you render CKEditor yourself, forward `onAfterDestroy` to `editorRef(null)` so the manager releases a destroyed instance.

**Incorrect (controlled data, no release on destroy):**

```tsx
<CKEditor
  editor={ClassicEditor}
  data={htmlFromState}                // overwrites shared HTML on every render
  config={editorConfig}
  onReady={(editor) => editorRef(editor)}
  // missing onAfterDestroy={() => editorRef(null)}
/>;
```

**Correct (React / Next.js: drop-in component):**

```tsx
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Undo } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { CKEditorCrdtEditor } from '@veltdev/ckeditor-crdt-react';

const editorConfig = {
  licenseKey: 'GPL', // use your commercial key when required
  plugins: [Essentials, Paragraph, Bold, Italic, Undo],
  toolbar: ['undo', 'redo', '|', 'bold', 'italic'],
};

export function CollaborativeEditor() {
  return (
    <CKEditorCrdtEditor
      editor={ClassicEditor}
      editorId="project-brief"
      config={editorConfig}
      initialContent="<p>Start writing here...</p>"
      cursorData={{ name: 'Ada', color: '#0f766e' }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

With `useCollaboration()`, render `<CKEditor editor={ClassicEditor} data="" config={editorConfig} onReady={(e) => editorRef(e)} onAfterDestroy={() => editorRef(null)} />`.

**Correct (Other Frameworks):**

```ts
import { createCollaboration } from '@veltdev/ckeditor-crdt';

const editor = await ClassicEditor.create(document.querySelector('#editor'), editorConfig);

const manager = await createCollaboration({
  editorId: 'project-brief',
  veltClient: client,          // initialized, authenticated, document already set
  editor,
  initialContent: '<p>Start writing here...</p>',
  cursorsContainer: document.querySelector('#editor-surface'),
});

// Teardown: manager first, then CKEditor
manager.destroy();
await editor.destroy();
```

#### CKEditor-specific notes

- The React hook waits for Velt initialization, an authenticated user, the CKEditor instance, and `enabled`. It does not wait for document context, so set the document first.
- Include a CKEditor plugin for every toolbar item and provide the correct license key.
- For custom collaboration-aware undo buttons, use `manager.getUndoManager()`; do not trigger CKEditor's native undo and the Yjs undo from the same action.
- The manager registers its fragment observer before the store initializes. Custom integrations must preserve that order or they miss initial server hydration.
- `cursorsContainer: null` keeps awareness without overlay DOM; the hook also returns reactive `remoteCursors`.
- Deduplicate `ckeditor5`, `yjs`, `y-protocols`, and `lib0` in linked or monorepo builds.

**Verification Checklist:**
- [ ] No `data` / `onReady` on `CKEditorCrdtEditor`; hook path keeps `data=""`
- [ ] `onAfterDestroy` forwards `editorRef(null)` on self-rendered editors
- [ ] Document context set before the editor mounts
- [ ] Other Frameworks: `ClassicEditor.create()` resolves before `createCollaboration()`
- [ ] `manager.destroy()` runs before `editor.destroy()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ckeditor - "Step 3: Configure CKEditor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ckeditor - "Step 4: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ckeditor - "Step 13: Enable, Disable, and Cleanup" and "Notes"

---

### 6.6 Create the SuperDoc Manager First and Pass Its ydoc and provider to Both Config Slots

**Impact: HIGH (A separate Y.Doc or a config passed to only one slot breaks DOCX sync; two cursor renderers duplicate labels; wrong teardown order leaks the provider)**

SuperDoc is the one integration where the collaboration manager is created before the editor. Obtain `{ ydoc, provider }` from the hook's `collaboration` value or `manager.getCollaborationConfig()`, and pass that same object to both the collaborative `documents[]` entry and `modules.collaboration`. Teardown is also inverted: destroy SuperDoc while it can still release the manager-owned provider, then destroy the manager.

**Incorrect (own Y.Doc, one config slot, manager destroyed first):**

```ts
import * as Y from 'yjs';

const superdoc = new SuperDoc({
  selector: '#superdoc',
  documents: [{ id: 'contract', type: 'docx' }],          // no ydoc/provider here
  modules: { collaboration: { ydoc: new Y.Doc(), provider } }, // second Y.Doc
});

manager.destroy();  // provider released while SuperDoc still uses it
superdoc.destroy();
```

**Correct (React / Next.js):**

```tsx
import { useEffect, useRef } from 'react';
import { useCollaboration } from '@veltdev/superdoc-crdt-react';
import { SuperDoc } from 'superdoc';
import 'superdoc/style.css';

export function SuperDocEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { collaboration, isLoading, error } = useCollaboration({ editorId: 'contract-2026-06' });

  useEffect(() => {
    if (!collaboration || !containerRef.current) return;
    const superdoc = new SuperDoc({
      selector: containerRef.current,
      superdocId: 'contract-2026-06',
      documentMode: 'editing',
      documents: [{ id: 'contract-2026-06', type: 'docx', ...collaboration }],
      modules: { collaboration },
      layoutEngineOptions: { presence: { enabled: true } },
      user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
      users: [],
      role: 'editor',
    });
    return () => superdoc.destroy?.(); // the hook destroys the manager itself
  }, [collaboration]);

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading || !collaboration) return <div>Connecting...</div>;
  return <div ref={containerRef} className="superdoc-container" />;
}
```

```css
/* React path keeps SuperDoc's presence overlay, so hide the y-prosemirror decorations */
.ProseMirror-yjs-cursor { display: none; }
.ProseMirror-yjs-selection { background: transparent !important; }
```

**Correct (Other Frameworks):**

```ts
import { createCollaboration } from '@veltdev/superdoc-crdt';
import { SuperDoc } from 'superdoc';

const manager = await createCollaboration({ editorId: 'contract-2026-06', veltClient: client });
const collaboration = manager.getCollaborationConfig();
if (!collaboration) {
  manager.destroy(); // the factory can return a degraded manager; check before building SuperDoc
  throw new Error('Collaboration did not initialize');
}

const superdoc = new SuperDoc({
  selector: '#superdoc',
  superdocId: 'contract-2026-06',
  documentMode: 'editing',
  documents: [{ id: 'contract-2026-06', type: 'docx', ydoc: collaboration.ydoc, provider: collaboration.provider }],
  modules: { collaboration: { ydoc: collaboration.ydoc, provider: collaboration.provider } },
  layoutEngineOptions: { presence: { enabled: false } }, // y-prosemirror cursors are the only renderer
  user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
  users: [],
});

// Teardown: SuperDoc first, then the manager
superdoc.destroy();
manager.destroy();
```

#### SuperDoc-specific notes

- Use exactly one cursor renderer: React keeps SuperDoc presence enabled and hides `.ProseMirror-yjs-cursor`; Other Frameworks disable `layoutEngineOptions.presence` and keep the y-prosemirror decorations visible.
- `initialContent` is an application-level marker; SuperDoc receives DOCX data through its own configuration. `forceResetInitialContent` clears the shared state.
- Do not write to SuperDoc's `supereditor` fragment or clear its `parts`, `meta`, or `media` maps. `manager.resetSuperDocState()` clears the document for every user; use it only for deliberate resets.
- Install SuperDoc's peers (`superdoc`, `yjs`, `y-protocols`, `@hocuspocus/provider`, `pdfjs-dist`, `y-prosemirror`, `prosemirror-*`) and keep one copy of `yjs` and `superdoc` in the bundle.

**Verification Checklist:**
- [ ] Manager created before SuperDoc; `getCollaborationConfig()` checked for `null`
- [ ] The same `{ ydoc, provider }` goes into `documents[]` and `modules.collaboration`
- [ ] No application-created `Y.Doc` or provider
- [ ] Exactly one cursor renderer per integration path
- [ ] Teardown destroys SuperDoc, then the manager

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc - "Step 7: Configure Remote Cursors"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc - "Step 12: Cleanup" and "Notes"

---

### 6.7 Follow the Shared Lifecycle for Velt Multiplayer Editor Integrations

**Impact: CRITICAL (Wrong init or teardown order causes missed initial hydration, duplicate bindings, overwritten shared content, and leaked editor listeners)**

Every Velt multiplayer editor package (`@veltdev/<editor>-crdt` plus an optional `@veltdev/<editor>-crdt-react` wrapper) follows one lifecycle: initialize Velt, authenticate the user, set a stable document context, create the editor, create exactly one `CollaborationManager`, and tear down in a defined order. The manager owns the Y.Doc, sync provider, awareness, binding, and Yjs undo manager, so the application must not create its own copies or feed content into the editor from a second source.

**Incorrect (second Y.Doc, controlled content, double binding, wrong teardown):**

```ts
import * as Y from 'yjs';
import { createCollaboration } from '@veltdev/monaco-crdt';

// Created before Velt is ready and before a user is identified
const manager = await createCollaboration({ editorId: 'doc', veltClient: client, editor });

// A second binding path for the same editor: never combine with `editor` above
await manager.bindEditor(editor);

// A separate Y.Doc bypasses Velt sync entirely
const ydoc = new Y.Doc();

// Disposing the editor first leaves the manager holding dead listeners
editor.dispose();
manager.destroy();
```

**Correct (Other Frameworks: ready, authenticated, editor first, one manager, ordered teardown):**

```ts
import { initVelt } from '@veltdev/client';
import { createCollaboration } from '@veltdev/monaco-crdt';

const DOCUMENT_ID = 'shared-file-1';
const client = await initVelt('YOUR_API_KEY');
await client.setDocument(DOCUMENT_ID, { documentName: 'Shared file' });
await client.identify({ userId: 'ada', name: 'Ada', email: 'ada@example.com', organizationId: 'org-1' });

let manager = null;
const initSubscription = client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady || manager) return;
  const editor = createMyEditor(); // the application creates the editor first
  manager = await createCollaboration({
    editorId: DOCUMENT_ID,          // same editorId + document for every collaborator
    veltClient: client,
    editor,                         // binds once during initialization
    initialContent: '// seed for a brand-new document only\n',
    onError: (error) => console.error('Collaboration error:', error),
  });
});

// Teardown: unsubscribe, destroy the manager, then dispose the editor
function teardown(editor) {
  initSubscription.unsubscribe();
  manager?.destroy();
  editor.dispose();
}
```

**Correct (React / Next.js: authenticated provider, document set before the editor mounts):**

```tsx
import { useEffect, useState } from 'react';
import { VeltProvider, useCurrentUser, useSetDocuments } from '@veltdev/react';

function CollaborationScope() {
  const user = useCurrentUser();
  const { setDocuments } = useSetDocuments();
  const [documentReady, setDocumentReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setDocumentReady(false);
      return;
    }
    setDocuments([{ id: 'shared-file-1', metadata: { documentName: 'Shared file' } }]);
    setDocumentReady(true);
  }, [user, setDocuments]);

  // Mount the editor component (which calls the package's useCollaboration hook) only when ready
  return user && documentReady ? <CollaborativeEditor /> : <p>Preparing collaboration...</p>;
}

<VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
  <CollaborationScope />
</VeltProvider>;
```

#### Rules that apply to every editor package

| Concern | Rule |
|---|---|
| Readiness | Create the manager after Velt is initialized and a user is authenticated. Several React hooks (CKEditor, Apryse, Nutrient, Quill) do not wait for document context, so set the document before mounting the editor. |
| Identity | Every collaborator must share the same Velt document and `editorId`. Use different `editorId` values for independent editors. |
| Editor ownership | Create the editor or viewer first (exceptions: SuperDoc creates the manager first; ProseMirror direct setup creates the manager with `autoInitialize: false`). |
| One binding | Passing `editor` / `instance` / `workbook` to the factory or hook binds it. Use `bindEditor()`, `attachEditor()`, `attachInstance()`, or `attachWorkbook()` only on the attach-later path, never both. |
| Uncontrolled content | Do not pass `value`, `defaultValue`, `initialValue`, `data`, or `onEditorChange` style props. The shared Yjs state owns content. |
| Initial content | `initialContent` seeds only a brand-new shared document. `forceResetInitialContent: true` (or `forceReset()`) replaces shared content for every collaborator; use it only for deliberate reset or template flows. |
| History | Use the manager's Yjs-aware undo/redo (`getUndoManager()`, `undo()`/`redo()` helpers, or the package's exported commands). Do not add the editor's native history alongside it. |
| Yjs ownership | Never create a second Y.Doc, provider, or awareness. Use `getDoc()`, `getProvider()`, `getAwareness()`, `getStore()` only as escape hatches. |
| Dependencies | Resolve one copy of `yjs` (and `y-protocols` plus the editor package) in the bundle. |
| Presence | Cursors and selections are awareness state: transient, not persisted, not part of versions. |
| Cleanup (React) | Hooks and drop-in components destroy the manager on unmount; hooks also return `destroy()` and accept `enabled: false` for early teardown. |
| Cleanup (Other Frameworks) | Unsubscribe callbacks, call `manager.destroy()`, then dispose the editor. Exceptions: SuperDoc (destroy SuperDoc, then the manager) and ProseMirror (destroy the `EditorView`, then the manager). |

**Verification Checklist:**
- [ ] Manager is created only after Velt init state is ready and the user is authenticated
- [ ] Document context is set before the collaborative editor mounts
- [ ] Exactly one binding path is used per manager
- [ ] No controlled content props and no extra `Y.Doc` / provider in application code
- [ ] `forceResetInitialContent` is off for normal page loads
- [ ] Every `on*` subscription is unsubscribed and teardown order matches the editor's guide
- [ ] Tested with two different authenticated users in separate browser profiles

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/overview - "Out of box support" editor list and packages
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce - "Step 2: Setup Velt" and "Step 13: Cleanup"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 3: Initialize Collaborative Editor" (one binding path)
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc - "Step 12: Cleanup" (inverse teardown order)
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 15: Enable, Disable, and Cleanup"

---

### 6.8 Give Ace a Real Range Factory and Use Collaborative Undo

**Impact: HIGH (Without an Ace Range factory remote markers do not render; mixing Ace local history with Yjs undo diverges from the shared text)**

`@veltdev/ace-crdt` stores Ace content in one shared `Y.Text`. Remote cursors, selections, and highlights render as Ace markers, which need a real Ace `Range`, so pass a `rangeFactory` built from `ace.require('ace/range').Range` (the documented factory widens a collapsed cursor by one column so the caret stays visible). The shared text is the source of truth: do not pass `value` / `defaultValue`, and drive undo/redo through the manager's Yjs `UndoManager`.

**Incorrect (controlled value, no range factory, double binding):**

```tsx
<AceCrdtEditor documentId="shared-code-file" value={code} />;

const manager = await createCollaboration({ editorId: 'shared-code-file', veltClient: client, editor });
manager.attachEditor(editor); // already attached by `editor` above
editor.undo();                // Ace local history, not the shared history
```

**Correct (React / Next.js):**

```tsx
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/theme-textmate';
import { AceCrdtEditor } from '@veltdev/ace-crdt-react';

const Range = ace.require('ace/range').Range;
const rangeFactory = (start, end) => {
  const visibleEnd = start.row === end.row && start.column === end.column
    ? { row: end.row, column: end.column + 1 }
    : end;
  return new Range(start.row, start.column, visibleEnd.row, visibleEnd.column);
};

export function CollaborativeEditor() {
  return (
    <div className="ace-host">
      <AceCrdtEditor
        documentId="shared-code-file"
        mode="typescript"
        theme="textmate"
        initialContent={'export const greeting = "Hello";\n'}
        cursorData={{ name: 'Ada', color: '#0f766e', colorLight: '#0f766e33' }}
        rangeFactory={rangeFactory}
        onError={(error) => console.error('Ace collaboration:', error)}
      />
    </div>
  );
}
```

**Correct (Other Frameworks):**

```ts
import { createCollaboration } from '@veltdev/ace-crdt';

const manager = await createCollaboration({
  editorId: 'shared-code-file',
  veltClient: client,
  editor,                 // created with ace.edit(host) before this call
  initialContent: '// Start writing here\n',
  cursorData: { name: 'Ada', color: '#0f766e' },
  rangeFactory,
});

const undoManager = manager.getUndoManager();
undoManager?.undo();
manager.flushEditorToStore('undo');

// Teardown: manager, then Ace, then its DOM
manager.destroy();
editor.destroy();
editor.container.remove();
```

#### Ace-specific notes

- Import each `ace-builds/src-noconflict` mode and theme before selecting it, and give the host stable dimensions.
- Do not override the injected marker borders with `border: none`; add only shape rules such as `.ace_marker-layer [class*="velt-ace-remote-marker"] { border-radius: 2px; }`.
- In React, `collaboration.undo()` / `collaboration.redo()` are the collaborative history controls. When Ace is created later, call `collaboration.editorRef(editor)` and `collaboration.editorRef(null)` before replacing it.
- Attach-later (`initializeWithoutEditor: true` + `attachEditor(editor, { rangeFactory })`) replaces passing `editor`; never use both.
- Keep one copy of `@veltdev/crdt`, `yjs`, and `y-protocols` in the bundle.

**Verification Checklist:**
- [ ] `rangeFactory` uses Ace's `Range` constructor
- [ ] No `value` / `defaultValue` on `AceCrdtEditor`
- [ ] One binding path per manager
- [ ] Undo/redo goes through the manager or hook helpers, not Ace's local history
- [ ] Teardown order: `manager.destroy()`, `editor.destroy()`, `editor.container.remove()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ace - "Step 4: Initialize Collaboration"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ace - "Step 9: Configure Collaborative Undo and Redo"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ace - "Step 14: Clean Up" and "Notes"

---

### 6.9 Keep TinyMCE Uncontrolled and Destroy the Manager Before tinymce.remove()

**Impact: HIGH (Controlled content props overwrite shared HTML; removing TinyMCE before manager.destroy() leaves listeners and awareness attached to a dead editor)**

`@veltdev/tinymce-crdt` stores normalized HTML in a Yjs XML fragment and preserves the local selection while applying remote HTML. The CRDT manager is the only content owner: do not pass `value`, `initialValue`, or `onEditorChange`. In Other Frameworks, initialize TinyMCE first, create the manager with the editor instance, and destroy the manager before `tinymce.remove(editor)`.

**Incorrect (controlled TinyMCE with the hook):**

```tsx
import { Editor } from '@tinymce/tinymce-react';
import { useCollaboration } from '@veltdev/tinymce-crdt-react';

const { editorRef } = useCollaboration({ editorId: 'proposal' });

<Editor
  value={html}                 // second content source
  onEditorChange={setHtml}
  onInit={(_e, editor) => editorRef(editor)}
/>;
```

**Correct (React / Next.js: drop-in component or uncontrolled hook):**

```tsx
import { TinyMceCrdtEditor } from '@veltdev/tinymce-crdt-react';

export function CollaborativeEditor() {
  return (
    <TinyMceCrdtEditor
      editorId="proposal"
      initialContent="<p>Start writing here...</p>"
      licenseKey="gpl"
      init={{ height: 500, menubar: false, plugins: 'autolink link lists' }}
      cursorData={{ name: 'Ada', color: '#2563eb' }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

The component forwards normal `@tinymce/tinymce-react` props except `value`, `initialValue`, `onEditorChange`, and `onInit`. With the hook, render `<Editor licenseKey="gpl" onInit={(_e, editor) => editorRef(editor)} init={...} />` and nothing else that sets content.

**Correct (Other Frameworks):**

```ts
import tinymce from 'tinymce/tinymce';
import { createCollaboration } from '@veltdev/tinymce-crdt';

const [editor] = await tinymce.init({ selector: '#editor', inline: true, license_key: 'gpl', plugins: 'autolink link lists' });

const manager = await createCollaboration({
  editorId: 'proposal',
  veltClient: client,
  editor,
  initialContent: '<p>Start writing here...</p>',
  cursorData: { name: 'Ada', color: '#2563eb' },
  onError: (error) => console.error('Collaboration error:', error),
});

// Teardown: manager first, then TinyMCE
manager.destroy();
tinymce.remove(editor);
```

#### TinyMCE-specific notes

- Both inline and iframe modes are supported (omit `inline: true` for iframe mode). Remote cursor overlays work in both.
- Self-hosted builds must import `tinymce/tinymce`, the theme, model, icons, plugins, and skin CSS; otherwise the editor stays blank. Tiny Cloud users pass `apiKey` instead.
- Local edits reach the CRDT after `debounceMs` (default 125 ms).
- `cursorsContainer={null}` keeps awareness active without injected cursor DOM; `manager.onRemoteCursorsChange()` feeds custom cursor UI.
- `manager.getHtml()` / `manager.setHtml(html)` read and replace the shared HTML.

**Verification Checklist:**
- [ ] No `value`, `initialValue`, or `onEditorChange` on any TinyMCE component
- [ ] TinyMCE is initialized before `createCollaboration()`
- [ ] Required self-hosted imports are loaded (or a Tiny Cloud `apiKey` is set)
- [ ] `forceResetInitialContent` is off for normal loads
- [ ] `manager.destroy()` runs before `tinymce.remove(editor)`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce - "Step 3: Load TinyMCE"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce - "Step 4: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce - "Step 13: Cleanup" and "Notes"

---

### 6.10 Pass GC.Spread.Sheets.Events and Destroy the Manager Before the Workbook

**Impact: HIGH (Without the official event constants workbook changes are missed; double attachment or destroying the workbook first leaks handlers and overlays)**

`@veltdev/spreadjs-crdt` serializes the whole SpreadJS workbook (`workbook.toJSON()`) into a Velt map store and applies remote snapshots with `workbook.fromJSON()`. Pass `GC.Spread.Sheets.Events` so cell, range, sheet, and selection changes use the official event names, keep serialization options identical across clients, and destroy the manager before the workbook and its host.

**Incorrect (no events, double attachment, hidden host):**

```ts
// Host is display:none when the workbook is constructed
const workbook = new GC.Spread.Sheets.Workbook(hiddenHost);

const manager = await createCollaboration({ editorId: 'forecast-2026', veltClient: client, workbook });
manager.attachWorkbook(workbook);  // already attached by `workbook` above
workbook.destroy();                // workbook gone before the manager detaches handlers
manager.destroy();
```

**Correct (Other Frameworks):**

```ts
import GC from '@mescius/spread-sheets';
import '@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import { createCollaboration } from '@veltdev/spreadjs-crdt';

GC.Spread.Sheets.LicenseKey = 'YOUR_SPREADJS_LICENSE_KEY';
const host = document.querySelector('#spread-host'); // explicit height, visible
const workbook = new GC.Spread.Sheets.Workbook(host, { sheetCount: 2, tabEditable: true });

const manager = await createCollaboration({
  editorId: 'forecast-2026',
  veltClient: client,
  workbook,
  events: GC.Spread.Sheets.Events,
  initialContent: workbook.toJSON({ includeBindingSource: true }),
  serializationOptions: { includeBindingSource: true },
  deserializationOptions: { doNotRecalculateAfterLoad: false },
});

// Persist immediately after a complex multi-step operation
await manager.flushWorkbookToStore('toolbar-action', true);

// Teardown
manager.clearRemoteSelectionOverlays();
manager.destroy();
workbook.destroy();
host.remove();
```

**Correct (React / Next.js: drop-in component owns the workbook):**

```tsx
import { SpreadJSCrdtWorkbook } from '@veltdev/spreadjs-crdt-react';

export function ForecastWorkbook() {
  return (
    <SpreadJSCrdtWorkbook
      documentId="forecast-2026"
      licenseKey="YOUR_SPREADJS_LICENSE_KEY"
      className="spread-host"
      workbookOptions={{ sheetCount: 2, tabEditable: true }}
      serializationOptions={{ includeBindingSource: true }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

With `useCollaboration({ editorId, workbook, events: GC.Spread.Sheets.Events })` and an application-owned workbook, add `data-spreadjs-host` to the host and call `collaboration.destroy()` before `workbook.destroy()` in cleanup. Only `veltClient`, `editorId`, `workbook`, and `initializeWithoutWorkbook` reinitialize the hook.

#### SpreadJS-specific notes

- Snapshot model: overlapping edits to the same cell resolve to the latest accepted snapshot. There is no cell-operation merge, formula conflict resolution, or locking; add a product-level policy for high-risk concurrent edits.
- Local events are debounced before `toJSON()` (default 120 ms). Test large workbooks with production serialization options.
- `forceResetInitialContent` (at creation) and `forceReset()` (runtime) replace the whole shared workbook.
- Remote selections are awareness only, rendered for the active sheet, and not stored in versions.
- Attach-later (`initializeWithoutWorkbook: true` + `attachWorkbook(workbook, { events, applyRemoteState: true })`) is an alternative path; detach before destroying a replaced workbook.
- The wrapper peer range targets `@mescius/spread-sheets@^19.1.3`; keep one copy of `yjs` and `y-protocols`.

**Verification Checklist:**
- [ ] `events: GC.Spread.Sheets.Events` passed to the factory or hook
- [ ] Workbook host is visible and sized when the workbook is constructed
- [ ] Same `serializationOptions` / `deserializationOptions` on every client
- [ ] One attachment path per workbook
- [ ] Teardown: overlays cleared, `manager.destroy()`, `workbook.destroy()`, host removed

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs - "Step 2: Create the Workbook"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs - "Step 4: Initialize Collaborative Workbook"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs - "Step 9: Configure Serialization" and "Notes"

---

### 6.11 Pass overlayContainer and Unload Nutrient Only After manager.destroy()

**Impact: HIGH (Missing overlayContainer misplaces remote selections; unloading the viewer before the manager or double-attaching it leaks listeners and corrupts Instant JSON sync)**

`@veltdev/nutrient-crdt` synchronizes Nutrient Instant JSON (annotations, comments, form values) as debounced snapshots in a Velt map store; the PDF stays a viewer resource. Load the viewer first, pass its positioned host as `overlayContainer` so remote page-rectangle selections render in the right coordinate context, and unload Nutrient only after the manager has released its listeners and overlays.

**Incorrect (no overlay host, double attach, unload first):**

```ts
const manager = await createCollaboration({ editorId: 'review-123', veltClient: client, instance });
manager.attachInstance(instance);       // already attached by `instance` above
NutrientViewer.unload(host);            // viewer removed while the manager is still bound
manager.destroy();
```

**Correct (React / Next.js):**

```tsx
import { INSTANT_JSON_FORMAT, NutrientCrdtEditor } from '@veltdev/nutrient-crdt-react';

const initialContent = { format: INSTANT_JSON_FORMAT, annotations: [], comments: [], formFieldValues: {} };

export function CollaborativeDocument() {
  return (
    <NutrientCrdtEditor
      documentId="nutrient-review-123"
      document="/documents/contract.pdf"
      licenseKey="YOUR_NUTRIENT_LICENSE_KEY"
      useCDN
      initialContent={initialContent}
      className="nutrient-host"
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

When the application owns the viewer, call `useCollaboration({ editorId, instance, initialContent, overlayContainer: hostRef.current })` and, in cleanup, call `collaboration.destroy()` before `NutrientViewer.unload(host)`. `NutrientCrdtEditor` unloads only viewers it created.

**Correct (Other Frameworks):**

```ts
import NutrientViewer from '@nutrient-sdk/viewer';
import { createCollaboration } from '@veltdev/nutrient-crdt';

const host = document.querySelector('#nutrient-viewer'); // non-zero size, position: relative
const instance = await NutrientViewer.load({ container: host, document: '/documents/contract.pdf', useCDN: true, licenseKey: 'YOUR_NUTRIENT_LICENSE_KEY' });

const manager = await createCollaboration({
  editorId: 'nutrient-review-123',
  veltClient: client,
  instance,                  // binds the viewer; do not call attachInstance() too
  overlayContainer: host,
  initialContent: { format: 'https://pspdfkit.com/instant-json/v1', annotations: [], comments: [], formFieldValues: {} },
});

// Before navigation, wait for the latest local change to persist
await manager.flushInstanceToStore('before-navigation', true);

// Teardown: manager first, then the viewer
manager.destroy();
NutrientViewer.unload(host);
```

#### Nutrient-specific notes

- `initialContent` seeds only a new, empty store; the manager strips `pdfId` before persistence. `forceResetInitialContent` and `forceReset()` replace annotations, comments, and form values for every collaborator.
- Viewer events schedule debounced `exportInstantJSON()` calls (default 120 ms). `manager.getStats().lastFlushReason` helps diagnose missed writes.
- Selections are awareness only and are excluded from Instant JSON and versions; map rectangles through the current page, zoom, and scroll transform.
- The React hook waits for Velt initialization, an authenticated user, and `instance`; set the document before mounting.
- Attach-later (`initializeWithoutInstance: true` + `attachInstance(instance, { applyRemoteState: true })`) is an alternative to passing `instance`, never an extra step.

**Verification Checklist:**
- [ ] Viewer host is positioned, sized, and passed as `overlayContainer`
- [ ] One attachment path per viewer
- [ ] `flushInstanceToStore()` called before navigation when persistence must complete
- [ ] `forceResetInitialContent` is off for normal routing
- [ ] `manager.destroy()` runs before `NutrientViewer.unload(host)`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/nutrient - "Step 4: Initialize Collaboration"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/nutrient - "Step 7: Flush Viewer Changes"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/nutrient - "Step 14: Clean Up" and "Notes"

---

### 6.12 Pick the Velt Multiplayer Package and Entry Point That Match Your Editor

**Impact: HIGH (Wiring a raw Yjs binding or the wrong Velt package skips Velt sync, versions, and presence and breaks REST/webhook data shapes)**

Velt ships a dedicated multiplayer package for each supported editor. Each base package (`@veltdev/<editor>-crdt`) exports `createCollaboration()` for any framework; the React package (`@veltdev/<editor>-crdt-react`) adds a hook and, for most editors, a drop-in component. Slate and Draft.js ship a single package that contains both the React hook and the factory. Use the Core store (`@veltdev/crdt`) only when no dedicated integration exists.

**Incorrect (hand-rolled Yjs binding for an editor Velt already supports):**

```ts
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';

// Bypasses the Velt manager: no Velt sync provider, versions, status, or REST-compatible store
const ydoc = new Y.Doc();
new QuillBinding(ydoc.getText('quill'), quill, someAwareness);
```

**Correct (use the editor's Velt package):**

```ts
import { createCollaboration } from '@veltdev/quill-crdt';

const manager = await createCollaboration({
  editorId: 'shared-quill-doc',
  veltClient: client,
  editor: quill,
});
```

#### Package and entry-point matrix

| Editor | React package | Base package | React entry points | Shared data model |
|---|---|---|---|---|
| Lexical | `@veltdev/lexical-crdt-react` | `@veltdev/lexical-crdt` | `LexicalCollaborationPlugin`, `useLexicalComposerCollaboration()`, `useCollaboration()` (explicit editor) | `Y.XmlText` via `@lexical/yjs` |
| Slate | `@veltdev/slate-crdt` (single package) | same | `useCollaboration()` (alias `useSlateCollaboration`) | `Y.XmlText` via `@slate-yjs/core` |
| Draft.js | `@veltdev/draftjs-crdt` (single package) | same | `useCollaboration()` (alias `useDraftJsCollaboration`) | XML store with raw-content snapshots |
| ProseMirror | `@veltdev/prosemirror-crdt-react` | `@veltdev/prosemirror-crdt` | `ProseMirrorCrdtEditor`, `useCollaboration()` | `Y.XmlFragment` (key `prosemirror`) |
| Quill 2 | `@veltdev/quill-crdt-react` | `@veltdev/quill-crdt` | `QuillCrdtEditor`, `useCollaboration()`, `QuillCrdtProvider` | `Y.Text` Delta via `y-quill` |
| TinyMCE | `@veltdev/tinymce-crdt-react` | `@veltdev/tinymce-crdt` | `TinyMceCrdtEditor`, `useCollaboration()` | Normalized HTML in `Y.XmlFragment` |
| CKEditor 5 | `@veltdev/ckeditor-crdt-react` | `@veltdev/ckeditor-crdt` | `CKEditorCrdtEditor`, `useCollaboration()` | Normalized HTML in `Y.XmlFragment` |
| SuperDoc (DOCX) | `@veltdev/superdoc-crdt-react` | `@veltdev/superdoc-crdt` | `useCollaboration()` (alias `useSuperDocCollaboration`) | XML store; `{ ydoc, provider }` handed to SuperDoc |
| Monaco | `@veltdev/monaco-crdt-react` | `@veltdev/monaco-crdt` | `MonacoCrdtEditor`, `useCollaboration()` | `Y.Text` (text store, key `content`) via `y-monaco` |
| Ace | `@veltdev/ace-crdt-react` | `@veltdev/ace-crdt` | `AceCrdtEditor`, `useCollaboration()`, `AceCrdtProvider` | `Y.Text` (text store) |
| Apryse WebViewer | `@veltdev/apryse-crdt-react` | `@veltdev/apryse-crdt` | `useApryseCrdt()` (aliases `useCollaboration`, `useApryseCollaboration`), `ApryseCrdtProvider` | Map store (key `apryse`) of XFDF annotation records |
| Nutrient Web SDK | `@veltdev/nutrient-crdt-react` | `@veltdev/nutrient-crdt` | `NutrientCrdtEditor`, `useCollaboration()`, `NutrientCrdtProvider` | Map store (key `document`) of Instant JSON snapshots |
| SpreadJS | `@veltdev/spreadjs-crdt-react` | `@veltdev/spreadjs-crdt` | `SpreadJSCrdtWorkbook`, `useCollaboration()`, `SpreadJSCrdtProvider` | Map store (key `workbook`) of workbook JSON snapshots |

Tiptap, BlockNote, CodeMirror, and ReactFlow have their own rule categories in this skill.

#### Merge granularity differs by package

- **Character-level merges:** Lexical, Slate, ProseMirror, Quill, Monaco, Ace (operation-level Yjs bindings).
- **Snapshot reconciliation:** Draft.js (offline edits to the same old snapshot can supersede each other), SpreadJS (whole-workbook snapshots; no cell-level merge or formula conflict resolution), Nutrient (Instant JSON snapshots).
- **Record-level:** Apryse stores one record per annotation with deletion tombstones; the PDF bytes are not synced.

Choose an editor with an operation-level binding (for example Lexical or Slate) when offline character-level merging matters.

**Verification Checklist:**
- [ ] The installed Velt package matches the editor (React package plus base package, or the single Slate/Draft.js package)
- [ ] No hand-written `y-quill`, `y-monaco`, `y-prosemirror`, `@lexical/yjs`, or `@slate-yjs/core` binding sits alongside the Velt manager
- [ ] Product requirements for concurrent edits match the package's merge granularity
- [ ] Core stores (`useStore` / `createVeltStore`) are used only for data without a dedicated integration

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/overview - "Packages at a glance"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs - "Concurrency and Data Model"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs - "Step 9: Configure Serialization"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse - "Step 5: Synchronize Annotations and XFDF"

---

### 6.13 Register quill-cursors Before new Quill() and Use the Manager's Yjs Undo

**Impact: HIGH (Registering cursors after construction hides remote cursors; a standalone Quill history stack or a second QuillBinding diverges from the shared Delta)**

`@veltdev/quill-crdt` connects Quill 2 to one shared `Y.Text` (Delta operations). The base manager owns the only `y-quill` binding, provider, awareness, and Yjs `UndoManager`; `quill-cursors` renders remote cursors. Register `quill-cursors` before any custom `new Quill()` call, keep Quill history local-only (`userOnly: true`), and expose the manager's `undo()` / `redo()` as the user-facing history controls.

**Incorrect (late cursor registration, own binding, Quill history in the toolbar):**

```ts
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { QuillBinding } from 'y-quill';

const quill = new Quill('#quill-editor', { theme: 'snow', modules: { cursors: true } });
Quill.register('modules/cursors', QuillCursors); // too late: remote cursors never render

new QuillBinding(ytext, quill, awareness);        // second binding next to the Velt manager
undoButton.onclick = () => quill.history.undo();  // local stack, not collaborative history
```

**Correct (Other Frameworks):**

```ts
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import 'quill/dist/quill.snow.css';
import { createCollaboration } from '@veltdev/quill-crdt';

Quill.register('modules/cursors', QuillCursors); // before new Quill()

const host = document.querySelector('#quill-editor');
const editor = new Quill(host, {
  theme: 'snow',
  modules: {
    cursors: { transformOnTextChange: true },
    history: { userOnly: true },
    toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]],
  },
});

const manager = await createCollaboration({
  editorId: 'shared-quill-doc',
  veltClient: client,
  editor,                                   // creates the y-quill binding; no attachEditor() too
  initialContent: { ops: [{ insert: 'Collaborative Quill document\n' }] },
  cursorData: { name: 'Ada', color: '#0f766e' },
});

undoButton.onclick = () => manager.undo();
redoButton.onclick = () => manager.redo();

// Teardown
manager.destroy();
host.replaceChildren();
```

**Correct (React / Next.js: drop-in component registers cursors for you):**

```tsx
'use client';
import { QuillCrdtEditor } from '@veltdev/quill-crdt-react';
import 'quill/dist/quill.snow.css';

export function CollaborativeEditor() {
  return (
    <QuillCrdtEditor
      documentId="shared-quill-doc"
      theme="snow"
      modules={{ cursors: { transformOnTextChange: true }, history: { userOnly: true } }}
      cursorData={{ name: 'Ada', color: '#0f766e' }}
      onError={(error) => console.error('Quill collaboration:', error)}
    />
  );
}
```

With `useCollaboration()`, register `quill-cursors` yourself, create Quill in a client-only effect, pass it to `collaboration.editorRef(editor)`, and in cleanup call `collaboration.destroy()` before `collaboration.editorRef(null)` and clearing the host.

#### Quill-specific notes

- `initialContent` accepts plain text or a Quill Delta and applies only to a new document; `forceReset()` / `forceResetInitialContent` replace content for everyone and clear collaborative undo history.
- `highlightRange()` writes a persistent Delta background; awareness selections are transient.
- Do not hide `.ql-cursor` or `.ql-cursor-selection` in application CSS.
- Include every used format in Quill's `formats` allowlist or the formatting is dropped.
- Run `npm ls yjs` and deduplicate `yjs`, `@veltdev/crdt`, and `y-quill`.

**Verification Checklist:**
- [ ] `Quill.register('modules/cursors', QuillCursors)` runs before every custom `new Quill()`
- [ ] No application-created `QuillBinding`, Y.Doc, or provider
- [ ] Undo/redo controls call `manager.undo()` / `manager.redo()` (or the hook helpers)
- [ ] SSR routes mark the editor as a client component
- [ ] `manager.destroy()` runs before removing Quill's DOM

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/quill - "Step 2: Load Styles and Register Cursors"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/quill - "Step 5: Initialize Collaboration"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/quill - "Step 10: Configure Collaborative Undo and Redo" and "Notes"

---

### 6.14 Set Lexical editorState to null and Use the Manager's Yjs Undo

**Impact: HIGH (A composer editorState or Lexical's HistoryPlugin conflicts with the shared Y.XmlText and produces duplicated or reverted content)**

`@veltdev/lexical-crdt-react` and `@veltdev/lexical-crdt` bind Lexical to a shared `Y.XmlText` through the official `@lexical/yjs` binding. Collaboration owns the document state, so the composer must start with `editorState: null`, Lexical's normal history plugin must not be registered, and the manager (not your code) must own the `@lexical/yjs` binding, provider, awareness, and `Y.UndoManager`.

**Incorrect (composer state, HistoryPlugin, manual binding):**

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';

const initialConfig = {
  namespace: 'doc',
  editorState: JSON.stringify(savedState), // conflicts with the shared CRDT document
  onError: console.error,
};

<LexicalComposer initialConfig={initialConfig}>
  <HistoryPlugin /> {/* local history that does not understand remote updates */}
  {/* no Velt collaboration plugin; @lexical/yjs wired by hand elsewhere */}
</LexicalComposer>;
```

**Correct (React / Next.js: plugin or composer hook inside LexicalComposer):**

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerCollaboration } from '@veltdev/lexical-crdt-react';

const initialConfig = {
  namespace: 'my-collab-editor',
  editorState: null, // collaboration owns the state
  theme: {
    collaboration: {
      cursor: 'lexical-collaboration-cursor',
      cursorName: 'lexical-collaboration-cursor-name',
      selection: 'lexical-collaboration-selection',
      selectionBg: 'lexical-collaboration-selection-bg',
    },
  },
  onError: console.error,
};

function CollaborationBridge() {
  const { isLoading, isSynced, status, error } = useLexicalComposerCollaboration({
    editorId: 'my-lexical-editor',
    cursorData: { name: 'Ada', color: '#7c3aed', awarenessData: { userId: 'ada' } },
  });
  if (error) return <div>Error: {error.message}</div>;
  return <div>{isLoading ? 'loading' : status} {isSynced ? '(synced)' : ''}</div>;
}

export function LexicalEditor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <CollaborationBridge />
      <RichTextPlugin
        contentEditable={<ContentEditable className="lexical-editor" />}
        placeholder={<div>Start typing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  );
}
```

Use `<LexicalCollaborationPlugin editorId="..." />` when you do not need reactive state, and `useCollaboration({ editorId, editor })` only when you hold a `LexicalEditor` instance outside the composer.

**Correct (Other Frameworks: create and attach Lexical first):**

```ts
import { createEditor } from 'lexical';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { createCollaboration } from '@veltdev/lexical-crdt';

const editor = createEditor({ namespace: 'my-collab-editor', nodes: [HeadingNode, QuoteNode], onError: console.error });
editor.setRootElement(document.querySelector('#editor'));
const unregisterRichText = registerRichText(editor);

const manager = await createCollaboration({
  editorId: 'my-lexical-editor',
  editor,
  veltClient: client,
  cursorData: { name: 'Ada', color: '#7c3aed' },
  onError: (error) => console.error('Collaboration error:', error),
});

// Collaboration-aware undo/redo
manager.getUndoManager()?.undo();

// Teardown: manager first, then the editor
manager.destroy();
unregisterRichText();
editor.setRootElement(null);
```

#### Lexical-specific notes

- `initialContent` is a stringified serialized Lexical editor state (the React wrapper also accepts plain text). It applies only to a brand-new document unless `forceResetInitialContent` is set.
- Remote carets render through the manager-owned cursor overlay; add the `theme.collaboration` classes and CSS for `.lexical-collaboration-cursor`, `.lexical-collaboration-cursor-name`, `.lexical-collaboration-selection`, and `.lexical-collaboration-selection-bg`.
- The React hooks wait for the Lexical root element, Velt initialization, and an authenticated user.
- Limitation: content written through the CRDT REST API is not materialized into the Lexical editor (browser-to-REST reads work, REST-to-browser does not).
- Keep one copy of `lexical`, every `@lexical/*` package, and `yjs` in the bundle.

**Verification Checklist:**
- [ ] `editorState: null` in the composer config
- [ ] No Lexical `HistoryPlugin`; undo/redo uses `manager.getUndoManager()`
- [ ] Collaboration hook or plugin renders inside `<LexicalComposer>`
- [ ] `cursorData` passed and collaboration theme classes styled
- [ ] Other Frameworks: editor root attached before `createCollaboration()`; `manager.destroy()` runs before the editor is discarded
- [ ] Server-side seeding does not rely on REST writes appearing in Lexical

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/lexical - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/lexical - "Step 8: Style Collaboration Cursors"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/lexical - "Notes" and "Limitations"

---

### 6.15 Sync Apryse Annotations as XFDF Around an App-Owned WebViewer

**Impact: HIGH (Expecting PDF bytes to sync, seeding with non-XFDF content, or disposing WebViewer before the manager breaks annotation collaboration)**

`@veltdev/apryse-crdt` synchronizes Apryse WebViewer annotations, form fields, and XFDF state through a Velt map store; the PDF file itself is not synced and stays an Apryse document input. The application creates WebViewer once (assets, license, `initialDoc`), passes the completed instance to collaboration, and disposes WebViewer only after the manager is destroyed.

**Incorrect (PDF bytes as initial content, new viewer per render, wrong teardown):**

```tsx
const instance = await WebViewer({ path: '/webviewer/lib', initialDoc }, host); // inside render, every time

useApryseCrdt({
  editorId: 'contract',
  instance,
  initialContent: pdfArrayBuffer, // initialContent is an XFDF string, not PDF bytes or text
});

instance.UI.dispose();   // viewer gone while the manager still listens to annotationChanged
collaboration.destroy();
```

**Correct (React / Next.js):**

```tsx
import { useApryseCrdt } from '@veltdev/apryse-crdt-react';

// `instance` comes from a one-time WebViewer({ path, licenseKey, initialDoc }, host) effect
const collaboration = useApryseCrdt({
  editorId: 'apryse-contract-123',
  instance,
  initialXfdf: '<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots /></xfdf>',
  cursorData: { name: 'Ada Lovelace', color: '#2563eb' },
  onError: (error) => console.error('Collaboration error:', error),
});

useEffect(() => {
  return () => {
    collaboration.destroy();            // manager first
    viewerRef.current?.UI?.dispose?.(); // then the application-owned viewer
  };
}, [collaboration.destroy]);
```

**Correct (Other Frameworks):**

```ts
import WebViewer from '@pdftron/webviewer';
import { createCollaboration } from '@veltdev/apryse-crdt';

const instance = await WebViewer({ path: '/webviewer/lib', licenseKey: 'YOUR_APRYSE_LICENSE_KEY', initialDoc: '/documents/contract.pdf' }, host);

const manager = await createCollaboration({
  editorId: 'apryse-contract-123',
  veltClient: client,           // initialized, authenticated, document set
  instance,
  initialXfdf: '<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots /></xfdf>',
  cursorData: { name: 'Ada', color: '#2563eb' },
});

const offAnnotations = manager.onAnnotationsChange((records) => console.log(records));

// Cursors are awareness only: publish page coordinates from your interaction layer
manager.updateCursor({ pageNumber: 1, x: 240, y: 360 });
manager.clearCursor();

// Teardown
offAnnotations();
manager.destroy();
instance.UI?.dispose?.();
```

#### Apryse-specific notes

- Annotation changes are captured from Apryse's `annotationChanged` event; `fieldChanged` triggers a full XFDF snapshot so form values stay together. Deleted annotations remain as tombstone records.
- Use `exportXfdf()`, `setXfdf()` / `importXfdf()`, and `flushAnnotationsToShared()` for imports and explicit snapshots; prefer them over direct `getMap()` mutation.
- Convert pointer positions to Apryse page coordinates before `updateCursor()`; the cursor overlay DOM and CSS are application-owned.
- The React hook waits for Velt initialization, an authenticated user, a non-empty `editorId`, and `instance`; it does not wait for document context.
- Deploy WebViewer's `lib` assets and supply a valid license; the collaboration package ships neither.

**Verification Checklist:**
- [ ] WebViewer is created once per mount and the same instance is passed to collaboration
- [ ] Seed data is XFDF (`initialXfdf` / `initialContent`), not PDF bytes
- [ ] `forceResetInitialContent` is off for normal loads
- [ ] Cursor updates use page coordinates and are throttled
- [ ] `manager.destroy()` (or `collaboration.destroy()`) runs before `UI.dispose()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse - "Step 4: Initialize Collaboration"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse - "Step 5: Synchronize Annotations and XFDF"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse - "Step 9: Publish Remote Cursors (Optional)" and "Notes"

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
- https://docs.velt.dev/realtime-collaboration/crdt/setup/lexical
- https://docs.velt.dev/realtime-collaboration/crdt/setup/slate
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror
- https://docs.velt.dev/realtime-collaboration/crdt/setup/quill
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ckeditor
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ace
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse
- https://docs.velt.dev/realtime-collaboration/crdt/setup/nutrient
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs
- https://docs.velt.dev/webhooks/advanced
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/get-crdt-data
