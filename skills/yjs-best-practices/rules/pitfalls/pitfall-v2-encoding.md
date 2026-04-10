---
title: Understand V2 Update Encoding Trade-Offs Before Enabling
impact: MEDIUM
impactDescription: V2 encoding is ~10x more efficient but experimental and requires all clients to use the same version
tags: yjs, v2, encoding, useV2Encoding, experimental, update, performance
---

## Understand V2 Update Encoding Trade-Offs Before Enabling

Yjs supports an experimental V2 update encoding format that produces significantly smaller updates — roughly 10x more efficient than the default V1 encoding. This can meaningfully reduce bandwidth and storage costs for high-traffic collaborative applications. However, V2 encoding is still marked experimental and carries strict compatibility requirements.

The critical constraint: all clients and servers in a collaboration room must use the same encoding version. If one client sends V2-encoded updates to a peer expecting V1, the peer will fail to decode them. This means you cannot incrementally roll out V2 encoding — it must be an all-or-nothing switch across your entire deployment.

V2 encoding also applies to persistence. If you store updates in a database using V2 encoding, you must decode them with V2 APIs. Mixing V1 and V2 stored updates requires explicit conversion.

**Correct — enabling V2 encoding on Y.Doc:**

```js
import * as Y from 'yjs'

// Enable V2 encoding for this document
const ydoc = new Y.Doc()

// Use V2-specific encoding/decoding functions
const update = Y.encodeStateAsUpdateV2(ydoc)
const stateVector = Y.encodeStateVectorV2(ydoc)

// Apply a V2-encoded update
Y.applyUpdateV2(ydoc, remoteUpdate)

// Merge multiple V2 updates
const merged = Y.mergeUpdatesV2([update1, update2, update3])

// Diff using V2 state vectors
const diff = Y.diffUpdateV2(update, stateVector)
```

**Correct — converting between V1 and V2:**

```js
// Convert V1 update to V2
const v2Update = Y.convertUpdateFormatV1ToV2(v1Update)

// Convert V2 update back to V1
const v1Update = Y.convertUpdateFormatV2ToV1(v2Update)
```

**Correct — using V2 with providers (custom provider example):**

```js
const ydoc = new Y.Doc()

// When sending updates, use V2 encoding
ydoc.on('updateV2', (update, origin) => {
  // update is already V2-encoded
  if (origin !== 'remote') {
    sendToServer(update) // Send V2 update to peers
  }
})

// When receiving updates, apply with V2 decoder
function onRemoteUpdate(v2Update) {
  Y.applyUpdateV2(ydoc, v2Update, 'remote')
}
```

**Key considerations before enabling V2:**

| Factor | Detail |
|---|---|
| Efficiency | ~10x smaller updates compared to V1 |
| Compatibility | ALL clients and servers must use V2 — no mixing |
| Stability | Still marked experimental — API may change |
| Persistence | Stored updates must use matching V2 encode/decode functions |
| Migration | Use `convertUpdateFormatV1ToV2` for existing stored data |

**Verification:**
- [ ] If V2 encoding is used, ALL clients in the room use V2 functions (`applyUpdateV2`, `encodeStateAsUpdateV2`)
- [ ] Server-side persistence uses matching V2 encode/decode functions
- [ ] No mixing of V1 and V2 updates in the same sync channel
- [ ] Existing stored data has been migrated using `convertUpdateFormatV1ToV2` if switching from V1
- [ ] V2 encoding has been tested thoroughly in staging before production deployment
- [ ] Rollback plan exists in case V2 issues are discovered post-deployment

**Source:** https://docs.yjs.dev/api/document-updates#update-v2-api
