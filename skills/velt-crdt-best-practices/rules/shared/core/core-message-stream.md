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
| `getSnapshot` | `(query: { id: string }) => Promise<{ state: Uint8Array; timestamp: number; vector: Uint8Array } \| null>` | Retrieve the latest full-state snapshot as a replay baseline |
| `getMessages` | `(query: { id: string; afterTs: number }) => Promise<Array<{ data: number[] }>>` | Fetch all messages newer than `afterTs` (Unix ms) for incremental replay |
| `onMessage` | `(query: { id: string; callback: (msg: { data: number[] }) => void }) => () => void` | Subscribe to real-time incoming messages; returns an unsubscribe function |
| `pushMessage` | `(query: { id: string; data: number[]; yjsClientId: number; messageType: 'sync' \| 'awareness'; source?: string }) => Promise<void>` | Push a lib0-encoded sync or awareness update to the stream |
| `saveSnapshot` | `(query: { id: string; state: Uint8Array; vector: Uint8Array; source?: string }) => Promise<void>` | Checkpoint the current Y.Doc state and vector clock |
| `pruneMessages` | `(query: { id: string; beforeTs: number }) => Promise<void>` | Delete messages older than `beforeTs` (Unix ms) to bound storage |

**Verification Checklist:**
- [ ] `getSnapshot` called first on load to establish a baseline before `getMessages`
- [ ] `afterTs` passed to `getMessages` uses `snapshot.timestamp ?? 0` (not a hardcoded 0)
- [ ] `onMessage` unsubscribe function is called in the `useEffect` cleanup
- [ ] `pruneMessages` is called after `saveSnapshot`, not before, to avoid data loss

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - CRDT Core Setup
- https://docs.velt.dev/realtime-collaboration/crdt/api-reference - CrdtElement API Reference
