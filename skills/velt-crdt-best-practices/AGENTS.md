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
   - 1.1 [Choose the Correct CRDT Store Type for Your Data](#11-choose-the-correct-crdt-store-type-for-your-data)
   - 1.2 [Initialize Velt Client Before Creating CRDT Stores](#12-initialize-velt-client-before-creating-crdt-stores)
   - 1.3 [Install Correct CRDT Packages for Your Framework](#13-install-correct-crdt-packages-for-your-framework)
   - 1.4 [Save Named Version Checkpoints for State Recovery](#14-save-named-version-checkpoints-for-state-recovery)
   - 1.5 [Subscribe to Store Changes for Remote Updates](#15-subscribe-to-store-changes-for-remote-updates)
   - 1.6 [Test Collaboration with Multiple Browser Profiles](#16-test-collaboration-with-multiple-browser-profiles)
   - 1.7 [Use createVeltStore for Non-React CRDT Stores](#17-use-createveltstore-for-non-react-crdt-stores)
   - 1.8 [Use Custom Encryption Provider for Sensitive Data](#18-use-custom-encryption-provider-for-sensitive-data)
   - 1.9 [Use update() Method to Modify Store Values](#19-use-update-method-to-modify-store-values)
   - 1.10 [Use useVeltCrdtStore Hook for React CRDT Stores](#110-use-useveltcrdtstore-hook-for-react-crdt-stores)
   - 1.11 [Use VeltCrdtStoreMap for Runtime Debugging](#111-use-veltcrdtstoremap-for-runtime-debugging)

2. [Tiptap Integration](#2-tiptap-integration) — **CRITICAL**
   - 2.1 [Add CSS for Collaboration Cursors in Tiptap](#21-add-css-for-collaboration-cursors-in-tiptap)
   - 2.2 [Disable Tiptap History When Using CRDT](#22-disable-tiptap-history-when-using-crdt)
   - 2.3 [Install Tiptap CRDT Packages Correctly](#23-install-tiptap-crdt-packages-correctly)
   - 2.4 [Test Tiptap Collaboration with Multiple Users](#24-test-tiptap-collaboration-with-multiple-users)
   - 2.5 [Use createVeltTipTapStore for Non-React Tiptap](#25-use-createvelttiptapstore-for-non-react-tiptap)
   - 2.6 [Use Unique editorId for Each Tiptap Instance](#26-use-unique-editorid-for-each-tiptap-instance)
   - 2.7 [Use useVeltTiptapCrdtExtension Hook for React Tiptap](#27-use-usevelttiptapcrdtextension-hook-for-react-tiptap)

3. [BlockNote Integration](#3-blocknote-integration) — **HIGH**
   - 3.1 [Install BlockNote CRDT Package](#31-install-blocknote-crdt-package)
   - 3.2 [Test BlockNote Collaboration with Multiple Users](#32-test-blocknote-collaboration-with-multiple-users)
   - 3.3 [Use Unique editorId for Each BlockNote Instance](#33-use-unique-editorid-for-each-blocknote-instance)
   - 3.4 [Use useVeltBlockNoteCrdtExtension for BlockNote Collaboration](#34-use-useveltblocknotecrdtextension-for-blocknote-collaboration)

4. [CodeMirror Integration](#4-codemirror-integration) — **HIGH**
   - 4.1 [Install CodeMirror CRDT Packages](#41-install-codemirror-crdt-packages)
   - 4.2 [Test CodeMirror Collaboration with Multiple Users](#42-test-codemirror-collaboration-with-multiple-users)
   - 4.3 [Use createVeltCodeMirrorStore for Non-React CodeMirror](#43-use-createveltcodemirrorstore-for-non-react-codemirror)
   - 4.4 [Use Unique editorId for Each CodeMirror Instance](#44-use-unique-editorid-for-each-codemirror-instance)
   - 4.5 [Use useVeltCodeMirrorCrdtExtension for React CodeMirror](#45-use-useveltcodemirrorcrdtextension-for-react-codemirror)
   - 4.6 [Wire yCollab Extension with Store's Yjs Objects](#46-wire-ycollab-extension-with-stores-yjs-objects)

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

### 1.1 Choose the Correct CRDT Store Type for Your Data

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (type: 'text', // 'array' | 'map' | 'text' | 'xml')

---

### 1.2 Initialize Velt Client Before Creating CRDT Stores

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 2: Initialize Velt in your app)

---

### 1.3 Install Correct CRDT Packages for Your Framework

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (## Setup > ### Step 1: Install Dependencies)

---

### 1.4 Save Named Version Checkpoints for State Recovery

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 6: Save and restore versions)

---

### 1.5 Subscribe to Store Changes for Remote Updates

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 5: Listen for changes)

---

### 1.6 Test Collaboration with Multiple Browser Profiles

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

Reference: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (## Testing and Debugging)

---

### 1.7 Use createVeltStore for Non-React CRDT Stores

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
await veltClient.identify({ userId: 'user-1', name: 'John' });

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 3: Initialize a CRDT store > Other Frameworks)

---

### 1.8 Use Custom Encryption Provider for Sensitive Data

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (## APIs > ### Custom Encryption)

---

### 1.9 Use update() Method to Modify Store Values

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 4: Set or update the store value)

---

### 1.10 Use useVeltCrdtStore Hook for React CRDT Stores

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 3: Initialize a CRDT store > React / Next.js)

---

### 1.11 Use VeltCrdtStoreMap for Runtime Debugging

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

Reference: `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Debugging > #### window.VeltCrdtStoreMap)

---

## 2. Tiptap Integration

**Impact: CRITICAL**

Rich text collaborative editing with Tiptap. Covers installation, setup, history conflict, cursor styling, and testing.

### 2.1 Add CSS for Collaboration Cursors in Tiptap

**Impact: MEDIUM (Makes remote user cursors visible)**

Add CSS styles to make collaboration cursors/carets visible. Without styling, you won't see where other users are typing.

**Required CSS:**

```css
/* Collaboration cursor styling */
.collaboration-cursor__caret,
.collaboration-carets__caret {
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

/* Username label above the caret */
.collaboration-cursor__label,
.collaboration-carets__label {
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

**Optional: Custom cursor colors per user:**

```css
/* Override with user-specific colors */
.collaboration-cursor__caret[data-user-id="user-1"] {
  border-color: #3b82f6;
}
.collaboration-cursor__label[data-user-id="user-1"] {
  background-color: #3b82f6;
  color: white;
}
```

Reference: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (### Step 4: Add CSS for Collaboration Cursor)

---

### 2.2 Disable Tiptap History When Using CRDT

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
      history: false,  // CRITICAL: Disable history
    }),
    ...(VeltCrdt ? [VeltCrdt] : []),
  ],
  content: '',
}, [VeltCrdt]);
```

Reference: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (## Notes > **Disable history**: Turn off Tiptap `history` when using collaboration)

---

### 2.3 Install Tiptap CRDT Packages Correctly

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

Reference: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (### Step 1: Install Dependencies)

---

### 2.4 Test Tiptap Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test Tiptap collaboration by opening the same page with different authenticated users in separate browser profiles.

**Debug with Console:**

```js
// Check store state
window.VeltCrdtStoreMap.get('your-editor-id').getValue();

// Monitor changes
window.VeltCrdtStoreMap.get('your-editor-id').subscribe(v => console.log(v));
```

Reference: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (## Testing and Debugging)

---

### 2.5 Use createVeltTipTapStore for Non-React Tiptap

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
await veltClient.identify(user);

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
    StarterKit.configure({ history: false }),  // Disable history!
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

Reference: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (### Step 3: Initialize Velt CRDT Extension > Other Frameworks)

---

### 2.6 Use Unique editorId for Each Tiptap Instance

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

Reference: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (## Notes > **Unique editorId**: Use a unique `editorId` per editor instance)

---

### 2.7 Use useVeltTiptapCrdtExtension Hook for React Tiptap

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
        history: false,  // IMPORTANT: Disable history
      }),
      ...(VeltCrdt ? [VeltCrdt] : []),
    ],
    content: '',
  }, [VeltCrdt]);

  return <EditorContent editor={editor} />;
}
```

Reference: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (### Step 3: Initialize Velt CRDT Extension > React / Next.js)

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

Reference: `/docs/realtime-collaboration/crdt/setup/blocknote.mdx` (### Step 1: Install Dependencies)

---

### 3.2 Test BlockNote Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test BlockNote collaboration using different authenticated users in separate browser profiles.

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

Reference: `/docs/realtime-collaboration/crdt/setup/blocknote.mdx` (## Testing and Debugging)

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

Reference: `/docs/realtime-collaboration/crdt/setup/blocknote.mdx` (## Notes > **Unique editorId**)

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

Reference: `/docs/realtime-collaboration/crdt/setup/blocknote.mdx` (### Step 3: Initialize Velt CRDT Extension)

---

## 4. CodeMirror Integration

**Impact: HIGH**

Collaborative code editing with CodeMirror. Covers yCollab wiring and both React and vanilla setups.

### 4.1 Install CodeMirror CRDT Packages

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

Reference: `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (### Step 1: Install Dependencies)

---

### 4.2 Test CodeMirror Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test CodeMirror collaboration using different authenticated users in separate browser profiles.

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

Reference: `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (## Testing and Debugging)

---

### 4.3 Use createVeltCodeMirrorStore for Non-React CodeMirror

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
await veltClient.identify({ userId: 'user-1', name: 'John Doe' });

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

Reference: `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (### Step 3: Initialize Velt CRDT Extension > Other Frameworks)

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

Reference: `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (## Notes > **Unique editorId**)

---

### 4.5 Use useVeltCodeMirrorCrdtExtension for React CodeMirror

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

Reference: `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (### Step 3: Initialize Velt CRDT Extension > React / Next.js)

---

### 4.6 Wire yCollab Extension with Store's Yjs Objects

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

Reference: `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (## Notes > **Use yCollab**: Pass the store's Yjs text, awareness, and undo manager)

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

Reference: `/docs/realtime-collaboration/crdt/setup/reactflow.mdx` (### Step 1: Install Dependencies)

---

### 5.2 Test ReactFlow Collaboration with Multiple Users

**Impact: LOW (Validates collaboration works correctly)**

Test ReactFlow collaboration using different authenticated users in separate browser profiles.

**Debug with Console:**

```js
// Check current nodes/edges
window.VeltCrdtStoreMap.get('your-diagram-id').getValue();
```

Reference: `/docs/realtime-collaboration/crdt/setup/reactflow.mdx` (## Testing and Debugging)

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

Reference: `/docs/realtime-collaboration/crdt/setup/reactflow.mdx` (## Notes > **Use CRDT handlers**)

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

Reference: `/docs/realtime-collaboration/crdt/setup/reactflow.mdx` (## Notes > **Unique editorId**)

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

Reference: `/docs/realtime-collaboration/crdt/setup/reactflow.mdx` (### Step 3: Initialize Velt CRDT Extension)

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
