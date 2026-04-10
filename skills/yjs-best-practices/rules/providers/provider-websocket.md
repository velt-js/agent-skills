---
title: Use y-websocket for Client-Server Real-Time Sync
impact: HIGH
impactDescription: WebSocket provides reliable client-server sync with built-in awareness, reconnection, and scalability for production deployments
tags: yjs, websocket, provider, y-websocket, sync, awareness, server
---

## Use y-websocket for Client-Server Real-Time Sync

The `y-websocket` provider is the most common way to synchronize Yjs documents across clients. It connects to a central WebSocket server that relays updates between peers, handles reconnection automatically, and includes the awareness protocol for presence features like cursors and user names.

Choose y-websocket when you need a reliable, production-ready sync layer with a central server you control.

### Install

```bash
npm install y-websocket yjs
```

### Client Setup

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const ydoc = new Y.Doc()

// Connect to a WebSocket server with a room name
const provider = new WebsocketProvider(
  'ws://localhost:1234',  // server URL
  'my-room-name',         // room name — clients in the same room sync together
  ydoc
)

// Access awareness for presence (cursors, user info)
const awareness = provider.awareness

// Set local user presence
awareness.setLocalStateField('user', {
  name: 'Alice',
  color: '#ff0000'
})

// Listen for connection status
provider.on('status', (event) => {
  console.log('Connection status:', event.status) // 'connected' or 'disconnected'
})

// Listen for sync completion
provider.on('sync', (isSynced) => {
  if (isSynced) {
    console.log('Document synced with server')
  }
})
```

### Server Setup (Quick Start)

```bash
# Run the built-in y-websocket server on port 1234
npx y-websocket
```

### Custom Server

```js
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

const wss = new WebSocketServer({ port: 1234 })

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})

console.log('y-websocket server running on ws://localhost:1234')
```

### Cleanup on Unmount

```js
// Disconnect the provider when no longer needed
provider.disconnect()
// Or destroy it entirely (also destroys awareness)
provider.destroy()
```

## Verification Checklist

- [ ] `y-websocket` and `yjs` are installed
- [ ] `WebsocketProvider` is created with server URL, room name, and Y.Doc
- [ ] Provider is destroyed or disconnected on component unmount / cleanup
- [ ] Awareness is accessed via `provider.awareness` (not created separately)
- [ ] Server is running (either `npx y-websocket` or custom server)
- [ ] Connection status is monitored via `provider.on('status', ...)`

## Source

- https://docs.yjs.dev/ecosystem/connection-provider/y-websocket
