# Velt Huddle Best Practices

**Version 1.1.0**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Huddle implementation guide covering real-time audio, video, and screen-sharing huddle rooms in React, Next.js, and web applications. Patterns include VeltHuddle + VeltHuddleTool setup, document-scoped huddles, huddle-type selection (audio / video / screen / all), ephemeral in-call chat, flock mode (follow-me), cursor-mode huddle bubbles, server-side webhook handling for huddle created / joined events, and UI customization through wireframes, CSS parts, and template variables exposed on the huddle root, the huddle tool, and per-attendee tiles.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Add VeltHuddle and VeltHuddleTool Components](#11-add-velthuddle-and-velthuddletool-components)
   - 1.2 [Scope Huddle with setDocuments](#12-scope-huddle-with-setdocuments)
   - 1.3 [Use authProvider for Authentication](#13-use-authprovider-for-authentication)

2. [Configuration](#2-configuration) — **HIGH-MEDIUM**
   - 2.1 [Configure Cursor Mode for Huddle](#21-configure-cursor-mode-for-huddle)
   - 2.2 [Configure Ephemeral Chat in Huddle](#22-configure-ephemeral-chat-in-huddle)
   - 2.3 [Configure Flock Mode (Follow Me)](#23-configure-flock-mode-follow-me)
   - 2.4 [Configure VeltHuddleTool Type](#24-configure-velthuddletool-type)

3. [Events](#3-events) — **MEDIUM**
   - 3.1 [Handle Huddle Webhook Events](#31-handle-huddle-webhook-events)

4. [UI Customization](#4-ui-customization) — **MEDIUM**
   - 4.1 [Customize Huddle Tool Button](#41-customize-huddle-tool-button)

5. [Wireframe Variables](#5-wireframe-variables) — **MEDIUM**
   - 5.1 [Bind Huddle Wireframe Slots Using Template Variables](#51-bind-huddle-wireframe-slots-using-template-variables)

6. [Debugging](#6-debugging) — **LOW-MEDIUM**
   - 6.1 [Troubleshoot Common Huddle Issues](#61-troubleshoot-common-huddle-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup required for any Velt huddle implementation. Use `authProvider` on `VeltProvider` (never call `identify()` directly), mount `VeltHuddle` at the app root, place `VeltHuddleTool` in the toolbar, and scope huddles per document via `setDocuments` / `VeltDocumentProvider`.

### 1.1 Add VeltHuddle and VeltHuddleTool Components

**Impact: CRITICAL (Two components required — VeltHuddle at app root and VeltHuddleTool in toolbar)**

Huddle requires two components working together. `VeltHuddle` renders the huddle UI and participant list — place it inside `VeltProvider` at the root level. `VeltHuddleTool` is the button users click to start or join a huddle — place it in your toolbar alongside `VeltPresence`.

**Why this matters:**

```html
"use client";
import { VeltProvider, VeltHuddle, VeltHuddleTool, VeltPresence } from "@veltdev/react";

function App({ children, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltHuddle />
      <header className="toolbar">
        <VeltPresence />
        <VeltHuddleTool type="all" />
      </header>
      <main>{children}</main>
    </VeltProvider>
  );
}
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <div className="toolbar">
      {/* type="all" shows dropdown with audio, video, and screen options */}
      <VeltHuddleTool type="all" />
    </div>
  );
}
<!-- Place at app root inside Velt-initialized container -->
<velt-huddle></velt-huddle>

<!-- Place in toolbar -->
<div class="toolbar">
  <velt-presence></velt-presence>
  <velt-huddle-tool type="all"></velt-huddle-tool>
</div>
```

**React: VeltHuddleTool with specific type**
**HTML: Basic huddle setup**

---

### 1.2 Scope Huddle with setDocuments

**Impact: CRITICAL (Without setDocuments, huddle is scoped to root document across all pages)**

You must call `setDocuments` (or use the `useSetDocuments` hook) to scope the huddle to a specific document. Without it, the huddle is scoped to the root document, meaning all users across all pages of your application will be in the same huddle context.

**Important rules:**

```jsx
"use client";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";

function DocumentScope({ documentId }) {
  const currentUser = useCurrentUser();

  useSetDocuments(
    currentUser ? [{ documentId, metadata: {} }] : null
  );

  return null;
}
"use client";
import { VeltProvider, VeltHuddle, VeltHuddleTool, VeltPresence } from "@veltdev/react";

function App({ documentId, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltHuddle />
      <DocumentScope documentId={documentId} />
      <header>
        <VeltPresence />
        <VeltHuddleTool type="all" />
      </header>
      <main>{/* Document content */}</main>
    </VeltProvider>
  );
}
```

**React: Full layout with document scoping and huddle**

**HTML / Vanilla JS:**

```javascript
const client = await Velt.init("YOUR_API_KEY");
// After authentication completes:
client.setDocuments([{ documentId: "project-alpha", metadata: {} }]);
```

---

### 1.3 Use authProvider for Authentication

**Impact: CRITICAL (authProvider is the only supported authentication method for Velt)**

Always authenticate users via the `authProvider` prop on `VeltProvider`. The older `useIdentify` hook and `client.identify()` method are deprecated and must not be used. They lack automatic token refresh, built-in error handling, and retry logic that `authProvider` provides out of the box.

**Why this matters:**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

function AuthenticatedApp({ children }) {
  const authProvider = {
    getAuthToken: async () => {
      // Fetch a fresh JWT from your backend
      const res = await fetch("/api/velt-token");
      const { token } = await res.json();
      return token;
    },
    onAuthTokenExpire: async () => {
      // Called automatically when token expires — return a new one
      const res = await fetch("/api/velt-token");
      const { token } = await res.json();
      return token;
    },
  };

  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      {children}
    </VeltProvider>
  );
}
"use client";
import { useVeltAuthProvider } from "@veltdev/react";

function AuthSetup() {
  useVeltAuthProvider({
    getAuthToken: async () => {
      const res = await fetch("/api/velt-token");
      const { token } = await res.json();
      return token;
    },
    onAuthTokenExpire: async () => {
      const res = await fetch("/api/velt-token");
      const { token } = await res.json();
      return token;
    },
  });

  return null;
}
```

**Correct: useVeltAuthProvider hook pattern**
If you need to set up the auth provider dynamically in a child component, use the `useVeltAuthProvider` hook:

---

## 2. Configuration

**Impact: HIGH-MEDIUM**

Configuration options for huddle behavior. Select huddle type (`audio` / `video` / `screen` / `all`), enable or disable ephemeral in-call chat, opt in to flock mode (follow-me) on avatar click, and turn on cursor-mode huddle bubbles for cursor-anchored calls.

### 2.1 Configure Cursor Mode for Huddle

**Impact: MEDIUM (Shows a video/audio bubble floating near the user's cursor position)**

Cursor mode displays a small video or audio bubble that floats near each huddle participant's cursor position. This creates a spatial awareness effect where you can see both where a user is pointing and their video/audio feed simultaneously.

**Why this matters:**

```jsx
"use client";
import { useHuddleUtils } from "@veltdev/react";

function CursorModeToggle() {
  const huddleElement = useHuddleUtils();

  const enableCursorMode = () => {
    huddleElement?.enableCursorMode();
  };

  const disableCursorMode = () => {
    huddleElement?.disableCursorMode();
  };

  return (
    <div>
      <button onClick={enableCursorMode}>Enable Cursor Bubbles</button>
      <button onClick={disableCursorMode}>Disable Cursor Bubbles</button>
    </div>
  );
}
"use client";
import { VeltHuddle, VeltCursor } from "@veltdev/react";

function CollaborativeCanvas() {
  return (
    <>
      <VeltHuddle />
      <main className="canvas-area">
        <VeltCursor />
        {/* Canvas content */}
      </main>
    </>
  );
}
```

**React: Ensure VeltCursor is also active**

---

### 2.2 Configure Ephemeral Chat in Huddle

**Impact: MEDIUM (Chat messages within huddle are ephemeral and not persisted after huddle ends)**

`VeltHuddle` supports an ephemeral chat feature that allows participants to exchange text messages during a huddle session. Chat messages are not persisted after the huddle ends.

**Why this matters:**

```html
"use client";
import { VeltHuddle } from "@veltdev/react";

function App() {
  return (
    <>
      {/* Chat enabled (default behavior) */}
      <VeltHuddle chat={true} />

      {/* Chat disabled */}
      <VeltHuddle chat={false} />
    </>
  );
}
"use client";
import { useHuddleUtils } from "@veltdev/react";

function HuddleChatToggle() {
  const huddleElement = useHuddleUtils();

  const enableChat = () => {
    huddleElement?.enableChat();
  };

  const disableChat = () => {
    huddleElement?.disableChat();
  };

  return (
    <div>
      <button onClick={enableChat}>Enable Chat</button>
      <button onClick={disableChat}>Disable Chat</button>
    </div>
  );
}
<!-- Chat enabled (default) -->
<velt-huddle chat="true"></velt-huddle>

<!-- Chat disabled -->
<velt-huddle chat="false"></velt-huddle>
```

**React: Programmatic control via hook**
**HTML: Chat configuration**

---

### 2.3 Configure Flock Mode (Follow Me)

**Impact: MEDIUM (Flock mode lets users follow a presenter's navigation through the document)**

Flock mode enables a "Follow Me" experience where clicking a user's avatar during a huddle causes your view to follow their navigation. This is useful for presentations, guided walkthroughs, and collaborative reviews where one person leads the group through document sections.

**Why this matters:**

```html
"use client";
import { VeltHuddle } from "@veltdev/react";

function App() {
  return (
    <VeltHuddle flockModeOnAvatarClick={true} />
  );
}
"use client";
import { useHuddleUtils } from "@veltdev/react";

function FlockModeToggle() {
  const huddleElement = useHuddleUtils();

  const enableFlock = () => {
    huddleElement?.enableFlockModeOnAvatarClick();
  };

  const disableFlock = () => {
    huddleElement?.disableFlockModeOnAvatarClick();
  };

  return (
    <div>
      <button onClick={enableFlock}>Enable Follow Mode</button>
      <button onClick={disableFlock}>Disable Follow Mode</button>
    </div>
  );
}
<velt-huddle flock-mode-on-avatar-click="true"></velt-huddle>
```

**React: Programmatic control via hook**
**HTML: Flock mode configuration**

---

### 2.4 Configure VeltHuddleTool Type

**Impact: HIGH (The type prop controls which huddle options are available to users)**

The `type` prop on `VeltHuddleTool` controls which huddle options are presented to users. Available values are `'audio'`, `'video'`, `'screen'`, and `'all'`.

**Type options:**

```html
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <div className="toolbar">
      {/* Dropdown with all options */}
      <VeltHuddleTool type="all" />
    </div>
  );
}
// Audio-only huddle button
<VeltHuddleTool type="audio" />

// Video-only huddle button
<VeltHuddleTool type="video" />

// Screen share-only button
<VeltHuddleTool type="screen" />
<velt-huddle-tool type="all"></velt-huddle-tool>
<velt-huddle-tool type="audio"></velt-huddle-tool>
<velt-huddle-tool type="video"></velt-huddle-tool>
<velt-huddle-tool type="screen"></velt-huddle-tool>
```

**HTML: Type examples**

---

## 3. Events

**Impact: MEDIUM**

Server-driven huddle webhook events. Covers `huddle.created` and `huddle.joined` payloads and the verification / handler pattern for routing them through your backend.

### 3.1 Handle Huddle Webhook Events

**Impact: MEDIUM (Server-side webhooks fire when huddles are created or users join)**

Velt fires webhook events when huddle actions occur. Two event types are available: `created` (a new huddle is started) and `joined` (a user joins an existing huddle). Configure webhook endpoints in the Velt Console to receive these events on your server.

**Webhook payload structure:**

```json
{
  "actionType": "created",
  "actionUser": {
    "email": "user@example.com",
    "name": "Alice",
    "userId": "user-123"
  },
  "metadata": {
    "apiKey": "YOUR_API_KEY",
    "clientDocumentId": "project-alpha",
    "pageInfo": {
      "baseUrl": "https://app.example.com",
      "path": "/projects/alpha",
      "title": "Project Alpha"
    },
    "locations": []
  }
}
```

**Server-side handler example (Node.js/Express):**

```javascript
app.post("/webhooks/velt-huddle", (req, res) => {
  const { actionType, actionUser, metadata } = req.body;

  switch (actionType) {
    case "created":
      console.log(`${actionUser.name} started a huddle on ${metadata.clientDocumentId}`);
      // Log to analytics, notify team, start recording
      break;
    case "joined":
      console.log(`${actionUser.name} joined a huddle on ${metadata.clientDocumentId}`);
      // Update activity feed, track participation
      break;
  }

  res.status(200).json({ received: true });
});
```

---

## 4. UI Customization

**Impact: MEDIUM**

Customizing the huddle UI through slots, CSS `::part(...)` hooks, and custom button templates on `VeltHuddleTool`.

### 4.1 Customize Huddle Tool Button

**Impact: MEDIUM (Slots, CSS parts, and CSS variables for customizing huddle UI)**

`VeltHuddleTool` supports customization via slots for replacing the default button content, CSS parts for styling internal elements, and CSS variables for layout control.

**Why this matters:**

```html
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltHuddleTool type="all">
      <button slot="button">Start Call</button>
    </VeltHuddleTool>
  );
}
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltHuddleTool type="all">
      <button slot="button" className="custom-huddle-btn">
        <PhoneIcon />
        <span>Huddle</span>
      </button>
    </VeltHuddleTool>
  );
}
<velt-huddle-tool type="all">
  <button slot="button">Start Call</button>
</velt-huddle-tool>
```

**React: Custom button with icon**
**HTML: Custom button via slot**

**CSS Parts for styling:**

```css
/* Style the outer container */
velt-huddle-tool::part(container) {
  border-radius: 8px;
}

/* Style the button container */
velt-huddle-tool::part(button-container) {
  padding: 4px 8px;
}

/* Style the button icon */
velt-huddle-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--brand-primary);
}
```

**CSS Variable for z-index:**

```css
:root {
  --velt-huddle-z-index: 1000;
}
```

This controls the stacking order of the huddle overlay UI. Increase this value if the huddle panel renders behind other elements like modals or drawers.

---

## 5. Wireframe Variables

**Impact: MEDIUM**

Template variables exposed inside `<velt-huddle-...-wireframe>` tags and consumed via `<velt-data field="...">`, `velt-if="{var}"`, and `velt-class="'cls': {var}"`. Huddle uses the **flat-config** access pattern — variables are addressed by their explicit `componentConfig.<path>` form. Covers the root `<velt-huddle>` config (`meetingJoined`, `huddleAttendees`, `localStream`, `localStreamState.audio/video/screenSharingState`, `screenSharing`, `remoteStreamsByUserId`, `peerConnectionStateMapByUserId`, …), the `<velt-huddle-tool>` config (`type`, `screenSharingSupported`, `disabled`, `joinedHuddleToolComponentId`, `bannerRemoved`, …), and the per-attendee tile context exposed by `<velt-audio-huddle-user-wireframe>` and `<velt-video-huddle-user-wireframe>` (`attendee`, `stream`, `isLocal`, `color`, `gainVolume`).

### 5.1 Bind Huddle Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives dynamic content, conditional rendering, and class toggling inside Huddle wireframe slots without rebuilding state from huddle hooks)**

The Huddle wireframes expose a fixed set of template variables read with three directives — `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Huddle uses the **flat-config** access pattern: variables are addressed by their explicit `componentConfig.<path>` form (not short-name aliases). Each wireframe primitive carries its own `componentConfigSignal` — the root `<velt-huddle>`, the `<velt-huddle-tool>` button, and the per-attendee tiles each expose a different variable set.

**Incorrect (rebuilding huddle state from hooks and conditionally mounting wireframe slots):**

```jsx
import { useHuddleState } from '@veltdev/react';
import { VeltHuddleWireframe, VeltVideoHuddleUserWireframe } from '@veltdev/react';

function Room({ attendees }) {
  const huddle = useHuddleState();
  if (!huddle?.meetingJoined) return null;
  // Reimplements the meetingJoined gate and the per-attendee tile context
  // that the wireframe already exposes via componentConfig.
  return (
    <VeltHuddleWireframe>
      {attendees.map((a) => (
        <VeltVideoHuddleUserWireframe key={a.userId}>
          <div className={a.userId === currentUser.id ? 'mine' : ''}>
            <span>{a.name}</span>
          </div>
        </VeltVideoHuddleUserWireframe>
      ))}
    </VeltHuddleWireframe>
  );
}
```

**Correct (read injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
<VeltHuddleToolWireframe>
  <button
    className="my-huddle-trigger"
    velt-class="'is-disabled': {componentConfig.disabled}, 'is-active': {componentConfig.meetingJoined}">
    <span velt-if="!{componentConfig.meetingJoined}">Join huddle</span>
    <span velt-if="{componentConfig.meetingJoined}">Leave huddle</span>
  </button>
</VeltHuddleToolWireframe>

<VeltHuddleWireframe velt-if="{componentConfig.meetingJoined}">
  <VeltVideoHuddleUserWireframe>
    <div className="my-tile" velt-class="'is-local': {componentConfig.isLocal}">
      <video />
      <span><velt-data field="componentConfig.attendee.name" /></span>
    </div>
  </VeltVideoHuddleUserWireframe>
  <VeltScreenSharingHuddleWireframe velt-if="{componentConfig.screenSharing.stream}">
    <video />
    <span><velt-data field="componentConfig.screenSharing.attendee.name" /> is sharing</span>
  </VeltScreenSharingHuddleWireframe>
  <VeltHuddleMenuPanelWireframe />
</VeltHuddleWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-huddle-wireframe velt-if="{componentConfig.meetingJoined}">
  <velt-video-huddle-user-wireframe>
    <div class="my-tile" velt-class="'is-local': {componentConfig.isLocal}">
      <video></video>
      <span><velt-data field="componentConfig.attendee.name"></velt-data></span>
    </div>
  </velt-video-huddle-user-wireframe>
  <velt-screen-sharing-huddle-wireframe velt-if="{componentConfig.screenSharing.stream}">
    <video></video>
  </velt-screen-sharing-huddle-wireframe>
  <velt-huddle-menu-panel-wireframe></velt-huddle-menu-panel-wireframe>
</velt-huddle-wireframe>
```

| Variable | Type | Use |
|---|---|---|
| `componentConfig.user` | `User \| null` | Identified end-user. |
| `componentConfig.meetingJoined` | `boolean` | Local user is in a huddle. Gate the room with `velt-if`. |
| `componentConfig.isDragging` | `boolean` | Floating panel is being dragged. |
| `componentConfig.huddleAttendees` | `Attendee[]` | Active attendees — read `.length` for the count. |
| `componentConfig.localStream` | `MediaStream \| null` | Local media stream. |
| `componentConfig.localStreamState.audioState` | `boolean` | Local mic on. |
| `componentConfig.localStreamState.videoState` | `boolean` | Local camera on. |
| `componentConfig.localStreamState.screenSharingState` | `boolean` | Local screen-share on. |
| `componentConfig.localScreenSharingStream` | `MediaStream \| null` | Local screen-share stream. |
| `componentConfig.screenSharing` | `{ attendee?, stream? } \| null` | Active remote screen-share (if any). |
| `componentConfig.huddleCursorAvailableByAttendeeId` | `Record<string, boolean>` | Per-attendee cursor-stream availability. |
| `componentConfig.videoStateEnabledInPastByUserId` | `Record<string, boolean>` | Whether each user has ever enabled video. |
| `componentConfig.peerConnectionStateMapByUserId` | `Record<string, string>` | WebRTC peer-connection state per user. |
| `componentConfig.remoteStreamsByUserId` | `Record<string, Record<string, MediaStream>>` | Internal — not user-addressable. |
| Variable | Type | Use |
|---|---|---|
| `componentConfig.type` | `'audio' \| 'video' \| 'presentation' \| 'all'` | Controls the tool exposes. |
| `componentConfig.screenSharingSupported` | `boolean` | Browser supports screen-share. |
| `componentConfig.disabled` | `boolean` | Tool disabled by host config. |
| `componentConfig.meetingJoined` | `boolean` | Local user is in a huddle. |
| `componentConfig.joinedHuddleToolComponentId` | `string \| null` | Id of the tool that owns the active huddle. |
| `componentConfig.user` | `User \| null` | Identified end-user. |
| `componentConfig.huddleAttendees` | `Attendee[]` | Active attendees. |
| `componentConfig.isFirstComponent` | `boolean` | True only on the first instance on the page. |
| `componentConfig.bannerRemoved` | `boolean` | User dismissed the join banner. |
| `componentConfig.positions` | `any` | Internal — drives inline floating-position style. |
Resolvable only inside `<velt-audio-huddle-user-wireframe>` and `<velt-video-huddle-user-wireframe>`:
| Variable | Type | Use |
|---|---|---|
| `componentConfig.attendee` | `Attendee` | This tile's attendee record. |
| `componentConfig.stream` | `MediaStream` | This attendee's stream. |
| `componentConfig.isLocal` | `boolean` | True on the local user's tile. |
| `componentConfig.color` | `string` | Accent colour — internal style driver. |
| `componentConfig.gainVolume` | `number` | Audio gain driving the speaking-ring animation. |
The screen-share viewer (`<velt-screen-sharing-huddle-wireframe>`) reads `componentConfig.screenSharing.stream` and `componentConfig.screenSharing.attendee` from the **root** config, not from a per-tile context.
| Slot | Built-in gate |
|---|---|
| `<velt-huddle-wireframe>` (root) | Renders when `componentConfig.meetingJoined === true`. |
| `<velt-screen-sharing-huddle-wireframe>` | Renders when `componentConfig.screenSharing.stream` is truthy. |
**1. DO NOT drop the `componentConfig.` prefix.** Huddle uses the flat-config access pattern — `<velt-data field="meetingJoined" />` resolves to nothing. Use `<velt-data field="componentConfig.meetingJoined" />`.
**2. DO NOT reference per-attendee variables outside a tile.** `componentConfig.attendee`, `.stream`, `.isLocal`, `.color`, and `.gainVolume` are only defined inside `<velt-audio-huddle-user-wireframe>` / `<velt-video-huddle-user-wireframe>`. Referencing them from the root or the menu panel returns `undefined` silently.
**3. DO NOT confuse `componentConfig.screenSharing` (root) with a per-tile variable.** Read the active remote share from the root config inside the screen-share viewer slot.

---

## 6. Debugging

**Impact: LOW-MEDIUM**

Troubleshooting patterns for common huddle issues — connection failures, missing media permissions, attendee state desyncs, and webhook delivery problems.

### 6.1 Troubleshoot Common Huddle Issues

**Impact: LOW-MEDIUM (Quick fixes for common huddle problems)**

This rule covers the most frequently encountered huddle problems and their solutions.

**Issue 1: Huddle not starting**

- Check that `VeltHuddle` is rendered at the root level inside `VeltProvider`
- Check that `VeltHuddleTool` is rendered in the toolbar with a valid `type` prop
- Verify `authProvider` is configured on `VeltProvider` and authentication succeeds
- Ensure the domain is safelisted in the Velt Console
- In Next.js, confirm `"use client"` directive is present on components using Velt

**Issue 2: No audio or video**

- Browser permissions for microphone and camera must be granted
- Check that the browser supports `navigator.mediaDevices.getUserMedia`
- Some browsers block media access on non-HTTPS origins (localhost is an exception)
- Verify no other application has exclusive access to the microphone or camera
- Check browser console for `NotAllowedError` or `NotFoundError` from the MediaDevices API

**Issue 3: Peer-to-peer connection failing**

- Velt uses `serverFallback={true}` by default, which routes through a server when peer-to-peer fails
- If peer-to-peer connections consistently fail, check for restrictive corporate firewalls or VPN configurations
- Ensure WebRTC is not blocked by browser extensions or network policies
- The server fallback ensures huddles work even when direct connections cannot be established

**Issue 4: Huddle scoped to wrong users**

- Verify `setDocuments` is called with the correct document ID
- Ensure `useSetDocuments` is called in a child component of `VeltProvider`
- Confirm the document ID updates on route changes
- Without `setDocuments`, huddle defaults to root document scope (all users across all pages)

**Issue 5: Chat not visible in huddle**

- Check that `chat={true}` is set on `VeltHuddle` (this is the default)
- If chat was explicitly disabled with `chat={false}`, re-enable it
- Chat is only visible during an active huddle session — it does not appear before a huddle starts
- Verify the chat panel is not hidden behind other UI elements (adjust `--velt-huddle-z-index`)

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/realtime-collaboration/huddle/overview
- https://docs.velt.dev/ui-customization/features/realtime/huddle/wireframe-variables
- https://console.velt.dev
