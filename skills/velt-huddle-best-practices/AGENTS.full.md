# Velt Huddle Best Practices

**Version 1.1.1**  
Velt  
October 2026

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

Essential setup required for any Velt huddle implementation. Use `authProvider` on `VeltProvider`, mount `VeltHuddle` once at the app root, place `VeltHuddleTool` where the button belongs, include `'huddle'` in `featureAllowList` when set, and scope huddles per document via `setDocuments`.

### 1.1 Add VeltHuddle and VeltHuddleTool Components

**Impact: CRITICAL (Two components required — VeltHuddle at app root and VeltHuddleTool in toolbar)**

Huddle needs two components. `VeltHuddle` renders the huddle UI and participants; add it once at the root of your app inside `VeltProvider`. `VeltHuddleTool` is the button that starts or joins a huddle; place it wherever you want the button, usually the toolbar.

**Incorrect (tool without the root component):**

```jsx
<header className="toolbar">
  <VeltHuddleTool type="all" /> {/* clicking it starts a huddle nobody can see */}
</header>
```

**Correct (React / Next.js):**

```jsx
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
```

**Correct (Other Frameworks):**

```html
<body>
  <velt-huddle></velt-huddle>
  <div class="toolbar">
    <velt-presence></velt-presence>
    <velt-huddle-tool type="all"></velt-huddle-tool>
  </div>
</body>
```

**Modular SDK (v6) note:**

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["huddle", "presence"] }}>
  {/* ... */}
</VeltProvider>
```

---

### 1.2 Scope Huddle with setDocuments

**Impact: CRITICAL (Without a document set after login, the huddle has no document to attach to and users on different pages are not separated)**

Call `setDocuments` (React: the `setDocuments` function returned by `useSetDocuments()`) after the user is authenticated, and update it whenever the user navigates to a different document. Huddle is scoped to the current document, so users viewing "Project Alpha" never see participants from "Project Beta".

**Incorrect (wrong document key, set before login, not reactive to navigation):**

```jsx
// The document key is `id`, not `documentId`, and this runs before the user is authenticated.
const { setDocuments } = useSetDocuments();
setDocuments([{ documentId, metadata: {} }]);
```

**Correct (React / Next.js):**

```jsx
"use client";
import { useEffect } from "react";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";

// Render this as a CHILD of VeltProvider, never in the component that renders VeltProvider
function DocumentScope({ documentId, documentName }) {
  const { setDocuments } = useSetDocuments();
  const veltUser = useCurrentUser();

  useEffect(() => {
    if (!veltUser || !documentId) return; // wait for authentication
    setDocuments([{ id: documentId, metadata: { documentName } }]);
  }, [veltUser, documentId, documentName, setDocuments]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
// After Velt.init() and authentication complete
await Velt.setDocuments([
  { id: "project-alpha", metadata: { documentName: "Project Alpha" } },
]);
```

---

### 1.3 Use authProvider for Authentication

**Impact: CRITICAL (authProvider is the recommended authentication path and the only one with automatic token refresh)**

Authenticate users with the `authProvider` prop on `VeltProvider` (React) or `Velt.setVeltAuthProvider()` (other frameworks). Velt calls your `generateToken` function whenever a token is needed, including on expiry, so the session refreshes itself. The `identify()` method and `useIdentify()` hook still exist, but they require you to refresh tokens yourself; avoid them in new code.

**Incorrect (invented callback names, or identify() with no token refresh):**

```jsx
// getAuthToken / onAuthTokenExpire are NOT part of VeltAuthProvider
<VeltProvider
  apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY}
  authProvider={{ getAuthToken: fetchToken, onAuthTokenExpire: fetchToken }}
>
  {children}
</VeltProvider>

// identify() works, but you must handle token refresh yourself
await client.identify(user, { authToken });
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

function AuthenticatedApp({ user, children }) {
  const authProvider = {
    user: {
      userId: user.id,
      organizationId: user.orgId, // required for access control
      name: user.name,
      email: user.email,
      photoUrl: user.avatarUrl,
    },
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      // Your backend calls POST https://api.velt.dev/v2/auth/generate_token
      const res = await fetch("/api/velt-token", { method: "POST" });
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
```

**Correct (Other Frameworks):**

```js
Velt.setVeltAuthProvider({
  user: { userId: "user-1", organizationId: "org-1", name: "Alice", email: "alice@example.com" },
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => {
    const res = await fetch("/api/velt-token", { method: "POST" });
    const { token } = await res.json();
    return token;
  },
});
```

---

## 2. Configuration

**Impact: HIGH-MEDIUM**

Configuration options for huddle behavior. Set the huddle type explicitly (`audio` / `video` / `all`; screen share is documented as both `screen` and `presentation`), enable or disable ephemeral in-call chat, opt in to flock mode (follow-me) on avatar click, and turn on cursor-mode huddle bubbles.

### 2.1 Configure Cursor Mode for Huddle

**Impact: MEDIUM (Shows a video/audio bubble floating near the user's cursor position)**

Cursor mode displays a small video or audio bubble that floats near each huddle participant's cursor position. This creates a spatial awareness effect where you can see both where a user is pointing and their video/audio feed simultaneously.

**Incorrect (enabling cursor mode without live cursors):**

```jsx
huddleElement?.enableCursorMode(); // no VeltCursor mounted: there is no cursor to attach bubbles to
```

**Correct (React: programmatic control via hook):**

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
```

**Correct (React: VeltCursor mounted once alongside VeltHuddle):**

```jsx
"use client";
import { VeltHuddle, VeltCursor } from "@veltdev/react";

function CollaborativeCanvas() {
  return (
    <>
      <VeltHuddle />
      <VeltCursor />
      <main className="canvas-area">{/* Canvas content */}</main>
    </>
  );
}
```

**Correct (Other Frameworks):**

```js
const huddleElement = Velt.getHuddleElement();
huddleElement.enableCursorMode();
huddleElement.disableCursorMode();
```

---

### 2.2 Configure Ephemeral Chat in Huddle

**Impact: MEDIUM (Chat messages within huddle are ephemeral and not persisted after huddle ends)**

`VeltHuddle` supports an ephemeral chat feature that allows participants to exchange text messages during a huddle session. Chat messages are not persisted after the huddle ends.

**Incorrect (mounting VeltHuddle twice to toggle chat):**

```jsx
<VeltHuddle chat={true} />
<VeltHuddle chat={false} /> {/* shared service flag: the last setter wins */}
```

**Correct (React: enable or disable chat):**

```js
"use client";
import { VeltHuddle } from "@veltdev/react";

function App() {
  return (
    <>
      {/* Mount ONE VeltHuddle. Chat is on by default; pass chat={false} to disable */}
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
const huddleElement = Velt.getHuddleElement();
huddleElement.enableChat();
huddleElement.disableChat();
```

**React: Programmatic control via hook**
**Other Frameworks: Chat configuration**

---

### 2.3 Configure Flock Mode (Follow Me)

**Impact: MEDIUM (Flock mode lets users follow a presenter's navigation through the document)**

Flock mode enables a "Follow Me" experience where clicking a user's avatar during a huddle causes your view to follow their navigation. This is useful for presentations, guided walkthroughs, and collaborative reviews where one person leads the group through document sections.

**Incorrect (expecting avatar clicks to follow without enabling it):**

```jsx
<VeltHuddle /> {/* flockModeOnAvatarClick defaults to false; avatar clicks do nothing special */}
```

**Correct (React: enable via prop):**

```js
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
<!-- Attribute spelling as documented on the huddle Customize Behavior page -->
<velt-huddle flock-mode-onavatar-click="true"></velt-huddle>
// API alternative (avoids attribute-spelling issues)
const huddleElement = Velt.getHuddleElement();
huddleElement.enableFlockModeOnAvatarClick();
huddleElement.disableFlockModeOnAvatarClick();
```

**React: Programmatic control via hook**
**Other Frameworks: Flock mode configuration**

---

### 2.4 Configure VeltHuddleTool Type

**Impact: HIGH (The type prop controls what the first click on the huddle tool starts)**

The `type` prop on `VeltHuddleTool` sets what kind of huddle the first click starts. Always set it explicitly: the huddle feature page lists the default as `all`, while the component behavior reference lists `audio`.

**Incorrect (implicit default):**

```jsx
<VeltHuddleTool /> {/* default is documented as both 'all' and 'audio' */}
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <div className="toolbar">
      <VeltHuddleTool type="all" />
    </div>
  );
}

// Single-purpose buttons
<VeltHuddleTool type="audio" />
<VeltHuddleTool type="video" />
```

**Correct (Other Frameworks):**

```html
<velt-huddle-tool type="all"></velt-huddle-tool>
<velt-huddle-tool type="audio"></velt-huddle-tool>
<velt-huddle-tool type="video"></velt-huddle-tool>
```

---

## 3. Events

**Impact: MEDIUM**

Server-driven huddle webhook events. Covers Basic (v1) payloads (`notificationSource: "huddle"`, `actionType` `created` / `joined`) and Advanced (v2) events (`huddle.create`, `huddle.join` with `HuddlePayload`), plus the handler pattern for routing them through your backend.

### 3.1 Handle Huddle Webhook Events

**Impact: MEDIUM (Server-side webhooks fire when huddles are created or users join)**

Velt sends a webhook when a user creates a huddle or joins one. The payload shape depends on which webhook service you enabled in the Velt Console: Basic (v1) or Advanced (v2, Enterprise). Handle the shape you actually receive.

**Incorrect (no source check, reads fields from the wrong level):**

```javascript
app.post("/webhooks/velt", (req, res) => {
  const { actionType, actionUser } = req.body; // undefined for Advanced (v2) payloads
  if (actionType === "created") notifyTeam(actionUser.name); // also fires for comment events
  res.sendStatus(200);
});
```

**Correct (Basic / v1 payload):**

```javascript
app.post("/webhooks/velt", (req, res) => {
  const body = req.body;
  if (body.notificationSource === "huddle") {
    const { actionType, actionUser, metadata } = body;
    // actionType: "created" | "joined" (the Basic Webhooks table lists the join action as "join")
    if (actionType === "created") {
      notifyTeam(`${actionUser.name} started a huddle on ${metadata.clientDocumentId}`);
    } else if (actionType === "joined" || actionType === "join") {
      trackParticipation(actionUser.userId, metadata.clientDocumentId);
    }
  }
  res.sendStatus(200);
});
```

**Correct (Advanced / v2 payload):**

```javascript
app.post("/webhooks/velt", (req, res) => {
  // Verify the signature first (see Advanced Webhooks: "Verifying webhook signatures")
  const { event, data } = req.body; // WebhookV2Payload; data is a HuddlePayload
  switch (event) {
    case "huddle.create":
      notifyTeam(`${data.actionUser?.name} started a huddle`);
      break;
    case "huddle.join":
      trackParticipation(data.actionUser?.userId, data.metadata);
      break;
  }
  res.sendStatus(200);
});
```

---

## 4. UI Customization

**Impact: MEDIUM**

Customizing the huddle tool through the `button` slot and documented CSS `::part(...)` hooks (`container`, `button-container`, `button-icon`).

### 4.1 Customize Huddle Tool Button

**Impact: MEDIUM (Slots and CSS parts for customizing the huddle tool button)**

`VeltHuddleTool` supports a `button` slot for replacing the default button, and CSS `::part()` hooks for styling the default button inside its shadow DOM. For deeper layout changes, use the huddle wireframes (see `wireframe-variables-huddle`).

**Incorrect (wrong host element, undocumented CSS variable):**

```html
<!-- The slot must be on velt-huddle-tool, not another tool element -->
<velt-user-invite-tool>
  <button slot="button">Huddle</button>
</velt-user-invite-tool>

<style>
  :root { --velt-huddle-z-index: 1000; } /* not a documented Velt variable */
</style>
```

**Correct (React / Next.js: custom button via slot):**

```jsx
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
```

**Correct (Other Frameworks):**

```html
<velt-huddle-tool type="all">
  <button slot="button">Huddle</button>
</velt-huddle-tool>
```

**CSS parts:**

```css
velt-huddle-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
}
```

**CSS variables:** use only variables listed on the Global Styles / CSS variables pages. If a variable is not listed there, it does not exist.

---

## 5. Wireframe Variables

**Impact: MEDIUM**

Template variables exposed inside `<velt-huddle-...-wireframe>` tags and consumed via `<velt-data field="...">`, `velt-if="{var}"`, and `velt-class="'cls': {var}"`. Huddle uses the **flat-config** access pattern — variables are addressed by their explicit `componentConfig.<path>` form. Covers the root `<velt-huddle>` config (`meetingJoined`, `huddleAttendees`, `localStream`, `localStreamState.audio/video/screenSharingState`, `screenSharing`, `remoteStreamsByUserId`, `peerConnectionStateMapByUserId`, …), the `<velt-huddle-tool>` config (`type`, `screenSharingSupported`, `disabled`, `joinedHuddleToolComponentId`, `bannerRemoved`, …), and the per-attendee tile context exposed by `<velt-audio-huddle-user-wireframe>` and `<velt-video-huddle-user-wireframe>` (`attendee`, `stream`, `isLocal`, `color`, `gainVolume`), plus the menu-panel and messages-panel tags.

### 5.1 Bind Huddle Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives dynamic content, conditional rendering, and class toggling inside Huddle wireframe slots without rebuilding state from huddle hooks)**

The Huddle wireframes expose a fixed set of template variables read with three directives — `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Huddle uses the **flat-config** access pattern: variables are addressed by their explicit `componentConfig.<path>` form (not short-name aliases). Each wireframe primitive carries its own `componentConfigSignal` — the root `<velt-huddle>`, the `<velt-huddle-tool>` button, and the per-attendee tiles each expose a different variable set.

**Incorrect (rebuilding huddle state from hooks and conditionally mounting wireframe slots):**

```jsx
import { VeltHuddleWireframe, VeltVideoHuddleUserWireframe } from '@veltdev/react';

// meetingJoined, attendees, currentUser come from app-level state you maintain yourself
function Room({ meetingJoined, attendees, currentUser }) {
  if (!meetingJoined) return null;
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

**Correct (read injected variables via `velt-data` / `velt-if` / `velt-class`; wrap in `VeltWireframe` / `<velt-wireframe style="display:none;">` in your app):**

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
| Tag | Notes |
|---|---|
| `<velt-huddle-tool-wireframe>` | The tool button; reads the Huddle Tool variables above. |
| `<velt-huddle-menu-panel-wireframe>` | In-huddle controls (mute, video, screen, leave); read `componentConfig.localStreamState.*` from the root. |
| `<velt-huddle-messages-panel-wireframe>` | In-huddle chat panel; no extra variables beyond the root config. |
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

Troubleshooting patterns for common huddle issues: connection failures, missing media permissions, attendee state desyncs, and webhook delivery problems.

### 6.1 Troubleshoot Common Huddle Issues

**Impact: LOW-MEDIUM (Quick fixes for common huddle problems)**

This rule covers the most frequently encountered huddle problems and their solutions.

**Incorrect (common misconfigurations):**

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["presence"] }}> {/* 'huddle' missing */}
  <VeltHuddleTool />                                                     {/* no VeltHuddle, implicit type */}
</VeltProvider>
```

**Correct:**

```jsx
<VeltProvider apiKey="API_KEY" authProvider={authProvider} config={{ featureAllowList: ["presence", "huddle"] }}>
  <VeltHuddle />
  <DocumentScope /> {/* calls setDocuments after login */}
  <VeltHuddleTool type="all" />
</VeltProvider>
```

**Issue 1: Huddle not starting**
- Check that `VeltHuddle` is rendered at the root level inside `VeltProvider`
- Check that `VeltHuddleTool` is rendered in the toolbar with a valid `type` prop
- Verify `authProvider` is configured on `VeltProvider` and authentication succeeds
- Ensure the domain is safelisted in the Velt Console
- If `featureAllowList` is set, it must include `'huddle'`
- In Next.js, confirm `"use client"` directive is present on components using Velt
**Issue 2: No audio or video**
- Browser permissions for microphone and camera must be granted
- Check that the browser supports `navigator.mediaDevices.getUserMedia`
- Some browsers block media access on non-HTTPS origins (localhost is an exception)
- Verify no other application has exclusive access to the microphone or camera
- Check browser console for `NotAllowedError` or `NotFoundError` from the MediaDevices API
**Issue 3: Peer-to-peer connection failing**
- `serverFallback` is `true` by default, which routes through a server when peer-to-peer fails; check that it has not been set to `false` (`server-fallback="false"`)
- If peer-to-peer connections consistently fail, check for restrictive corporate firewalls or VPN configurations
- Ensure WebRTC is not blocked by browser extensions or network policies
- The server fallback ensures huddles work even when direct connections cannot be established
**Issue 4: Huddle scoped to wrong users**
- Verify `setDocuments` is called with the correct document ID
- Ensure `useSetDocuments` is called in a child component of `VeltProvider`
- Confirm the document ID updates on route changes
- Huddle uses the root document: with multiple documents, make the one the user is viewing the root
**Issue 5: Chat not visible in huddle**
- Check that `chat={true}` is set on `VeltHuddle` (this is the default)
- If chat was explicitly disabled with `chat={false}`, re-enable it
- Chat is only visible during an active huddle session — it does not appear before a huddle starts
- If chat was disabled with `huddleElement.disableChat()` elsewhere, the last setter wins
**Issue 6: Screen share option missing**
- Screen sharing requires `navigator.mediaDevices.getDisplayMedia`; unsupported browsers hide it (`componentConfig.screenSharingSupported` is `false`)

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/realtime-collaboration/huddle/overview
- https://docs.velt.dev/ui-customization/features/realtime/huddle/wireframe-variables
- https://console.velt.dev
- https://docs.velt.dev/realtime-collaboration/huddle/setup
- https://docs.velt.dev/realtime-collaboration/huddle/customize-behavior
- https://docs.velt.dev/webhooks/basic
- https://docs.velt.dev/webhooks/advanced
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle
