---
title: Use the Awareness Protocol for Ephemeral Presence State
impact: HIGH
impactDescription: Without awareness, users cannot see each other's cursors, selections, or online status — collaboration feels broken
tags: yjs, awareness, presence, cursor, user-state, ephemeral
---

## Use the Awareness Protocol for Ephemeral Presence State

The Awareness protocol is a CRDT for non-persistent, ephemeral state shared across peers. Unlike the Y.Doc which persists document content, awareness state is automatically cleaned up when a peer disconnects. It is used for presence features: cursor positions, user names and colors, online/offline status, and any other transient information.

Most providers (y-websocket, y-webrtc) create an awareness instance automatically, accessible via `provider.awareness`.

### Setting Local State

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:1234', 'room', ydoc)
const awareness = provider.awareness

// Set a single field on local state
awareness.setLocalStateField('user', {
  name: 'Alice',
  color: '#ff0000',
  colorLight: '#ff000033',
})

// Set cursor position (editor bindings do this automatically)
awareness.setLocalStateField('cursor', {
  anchor: { type: ytext, index: 5 },
  head: { type: ytext, index: 10 },
})

// Set the entire local state at once
awareness.setLocalState({
  user: { name: 'Alice', color: '#ff0000' },
  cursor: null,
  isTyping: true,
})

// Remove local state (signals "going offline" to peers)
awareness.setLocalState(null)
```

### Listening for Changes

```js
// Fires when any peer's awareness state changes
awareness.on('change', ({ added, updated, removed }, origin) => {
  // added: array of clientIDs that were added
  // updated: array of clientIDs that were updated
  // removed: array of clientIDs that were removed

  const allStates = awareness.getStates()
  // allStates is a Map<number, object> — clientID to state

  allStates.forEach((state, clientID) => {
    if (state.user) {
      console.log(`${state.user.name} is connected`)
    }
  })
})
```

### Getting All Peer States

```js
// Get all awareness states as a Map<clientID, state>
const states = awareness.getStates()

// Get the local client ID
const localClientID = ydoc.clientID

// Iterate over remote peers
states.forEach((state, clientID) => {
  if (clientID !== localClientID && state.user) {
    console.log(`Remote user: ${state.user.name}`)
  }
})
```

### Convention: Editor Bindings

```js
// Editor bindings (y-prosemirror, y-codemirror.next, y-quill, y-monaco)
// read these fields by convention:
//
//   state.user.name     — displayed next to cursor
//   state.user.color    — cursor/caret color
//   state.user.colorLight — selection highlight color
//
// Cursor position is managed by the binding itself — you only need to set 'user'.

awareness.setLocalStateField('user', {
  name: 'Alice',
  color: '#ff0000',
  colorLight: '#ff000033',
})
```

### Custom Ephemeral State

```js
// You can store any ephemeral data in awareness
awareness.setLocalStateField('status', 'viewing')
awareness.setLocalStateField('selectedElement', 'node-42')
awareness.setLocalStateField('viewport', { x: 100, y: 200, zoom: 1.5 })
```

### Auto-Cleanup

```js
// Awareness automatically removes a peer's state when:
// - The peer disconnects from the provider
// - The peer calls awareness.setLocalState(null)
// - A timeout elapses without receiving updates from the peer
//
// No manual cleanup is needed for remote peers.
```

## Verification Checklist

- [ ] Awareness is accessed from the provider (`provider.awareness`), not created manually
- [ ] Local user info is set with `setLocalStateField('user', { name, color })`
- [ ] `awareness.on('change', ...)` is used to react to presence updates
- [ ] `awareness.getStates()` is used to read all peer states
- [ ] Awareness state is not used for persistent data (it is ephemeral)
- [ ] `setLocalState(null)` is called if explicit "go offline" behavior is needed

## Source

- https://docs.yjs.dev/api/about-awareness
