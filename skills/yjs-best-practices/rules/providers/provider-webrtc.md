---
title: Use y-webrtc for Peer-to-Peer Sync Without a Central Server
impact: MEDIUM
impactDescription: WebRTC enables serverless peer-to-peer sync ideal for demos and prototyping but less reliable for production at scale
tags: yjs, webrtc, provider, y-webrtc, peer-to-peer, signaling
---

## Use y-webrtc for Peer-to-Peer Sync Without a Central Server

The `y-webrtc` provider synchronizes Yjs documents directly between browsers using WebRTC data channels. No central server is needed to relay document updates — only a lightweight signaling server brokers the initial peer connection. This makes it excellent for demos, prototyping, and scenarios where you want collaboration without deploying infrastructure.

### Install

```bash
npm install y-webrtc yjs
```

### Basic Setup

```js
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

const ydoc = new Y.Doc()

// Peers that share the same room name will sync automatically
const provider = new WebrtcProvider('my-room-name', ydoc)

// Awareness is included for presence features
const awareness = provider.awareness

awareness.setLocalStateField('user', {
  name: 'Bob',
  color: '#00ff00'
})
```

### Configuration Options

```js
const provider = new WebrtcProvider('my-room-name', ydoc, {
  // Use public signaling servers (default) or specify your own
  signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-us.herokuapp.com'],
  // Optional password to encrypt communication
  password: 'optional-shared-secret',
  // Awareness instance (one is created by default)
  awareness: new awarenessProtocol.Awareness(ydoc),
  // Maximum number of WebRTC connections
  maxConns: 20 + Math.floor(Math.random() * 15),
  // Whether to sync via BroadcastChannel (for same-browser tabs)
  filterBcConns: true
})
```

### When to Use y-webrtc

```js
// Good for:
// - Demos and prototypes
// - Small groups (< 20 peers)
// - Privacy-sensitive apps where data shouldn't pass through a server
// - Offline-first with same-network sync

// Consider y-websocket instead when:
// - You need server-side persistence
// - You have many concurrent users
// - You need guaranteed delivery across NAT boundaries
```

### Cleanup

```js
provider.destroy()
```

## Verification Checklist

- [ ] `y-webrtc` and `yjs` are installed
- [ ] `WebrtcProvider` is created with a room name and Y.Doc
- [ ] Signaling servers are reachable (default public servers or your own)
- [ ] Provider is destroyed on cleanup
- [ ] For production, consider whether WebRTC's peer-to-peer model fits your scale requirements
- [ ] Password is set if document privacy is needed

## Source

- https://docs.yjs.dev/ecosystem/connection-provider/y-webrtc
