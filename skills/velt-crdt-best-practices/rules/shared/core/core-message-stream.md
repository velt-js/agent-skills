---
title: Use CrdtElement Message Stream for Yjs-Backed Collaborative Editors
impact: HIGH
impactDescription: Enables low-latency Yjs sync and awareness over a single Firebase RTDB channel with built-in encryption and snapshot-based pruning
tags: crdt, yjs, message-stream, sync, awareness, snapshot, realtime, firebase
---

## Use CrdtElement Message Stream for Yjs-Backed Collaborative Editors

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
