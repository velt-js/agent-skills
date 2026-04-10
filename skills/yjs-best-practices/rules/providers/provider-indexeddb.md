---
title: Use y-indexeddb for Offline Persistence in the Browser
impact: HIGH
impactDescription: Without IndexedDB persistence, all local document state is lost on page reload, forcing a full re-sync from the server
tags: yjs, indexeddb, provider, y-indexeddb, offline, persistence, browser
---

## Use y-indexeddb for Offline Persistence in the Browser

The `y-indexeddb` provider persists a Yjs document to the browser's IndexedDB. When the user reloads the page or returns later, the document loads instantly from local storage instead of waiting for a full network sync. Combine it with a network provider (like y-websocket) for a seamless offline-first experience.

### Install

```bash
npm install y-indexeddb yjs
```

### Basic Setup

```js
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

const ydoc = new Y.Doc()

// Persist the document under a unique name in IndexedDB
const persistence = new IndexeddbPersistence('my-document-id', ydoc)

// Fires when the locally stored data has been loaded into the Y.Doc
persistence.on('synced', () => {
  console.log('Content loaded from IndexedDB')
})
```

### Combine with a Network Provider

```js
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { WebsocketProvider } from 'y-websocket'

const ydoc = new Y.Doc()

// Local persistence — loads cached data immediately
const indexeddbProvider = new IndexeddbPersistence('my-document-id', ydoc)

// Network sync — connects to other peers
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc)

// Local data loads first, then network updates merge in automatically.
// Yjs merge is commutative — order doesn't matter.
indexeddbProvider.on('synced', () => {
  console.log('Local data loaded, network sync will merge in updates')
})
```

### Clear Stored Data

```js
// Remove persisted data for this document
await persistence.clearData()
```

### Cleanup

```js
// Destroy the persistence provider when done
persistence.destroy()
```

## Verification Checklist

- [ ] `y-indexeddb` and `yjs` are installed
- [ ] `IndexeddbPersistence` is created with a unique document name and Y.Doc
- [ ] The `synced` event is handled to know when local data has loaded
- [ ] A network provider is also used alongside IndexedDB for remote sync
- [ ] Document name is unique per document (not shared across unrelated documents)
- [ ] Persistence is destroyed on cleanup

## Source

- https://docs.yjs.dev/ecosystem/database-provider/y-indexeddb
