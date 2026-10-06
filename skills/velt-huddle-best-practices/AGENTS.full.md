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

**Why this matters:**

Without `VeltHuddle`, no huddle UI renders even if the tool button is present. Without `VeltHuddleTool`, users have no way to start a huddle.

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

If you pass `featureAllowList` in the init config, include `'huddle'`; otherwise the huddle components can be suppressed. Calling `getHuddleElement()` or `preloadHuddle()` auto-enables an omitted feature and warms its chunk, but listing it is the reliable fix.

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["huddle", "presence"] }}>
  {/* ... */}
</VeltProvider>
```

**Runtime behavior to know:**

- `VeltHuddle` shows nothing until a user joins; media starts only after joining through the tool
- If a huddle is already running, clicking the tool joins it with the existing huddle's type
- A user who was in a huddle rejoins automatically after a page reload
- Set `type` explicitly; the docs disagree on its default (see `config-huddle-types`)

**Verification:**
- [ ] `VeltHuddle` is rendered once at the root inside `VeltProvider`
- [ ] `VeltHuddleTool` is rendered where users expect the button
- [ ] `type` is set explicitly on `VeltHuddleTool`
- [ ] `featureAllowList`, if set, includes `'huddle'`
- [ ] Two different users on the same document can join the same huddle

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/huddle/setup - "Huddle Setup"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltHuddle", "VeltHuddleTool (sibling)"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadhuddle - `preloadHuddle()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`

---

### 1.2 Scope Huddle with setDocuments

**Impact: CRITICAL (Without a document set after login, the huddle has no document to attach to and users on different pages are not separated)**

Call `setDocuments` (React: the `setDocuments` function returned by `useSetDocuments()`) after the user is authenticated, and update it whenever the user navigates to a different document. Huddle is scoped to the current document, so users viewing "Project Alpha" never see participants from "Project Beta".

**Why this matters:**

You can subscribe to up to 30 documents at once, but realtime features like the huddle default to the **root document** (the first entry, or `rootDocumentId` in options). Pass the document the user is actually viewing first, or set `rootDocumentId`.

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

**Common mistakes to avoid:**

- Calling `useSetDocuments` in the same component that renders `VeltProvider` (the hook needs the provider as a parent)
- Using `documentId` as the key inside the document object (the key is `id`)
- Setting the document before the user is authenticated
- Forgetting to update the document on route changes, which leaves the huddle attached to the previous document
- Passing several documents and expecting the huddle to span all of them (it uses the root document only)

**Verification:**
- [ ] `setDocuments` is called from a child component of `VeltProvider` (or via `Velt.setDocuments`)
- [ ] Document objects use `{ id, metadata }`
- [ ] The document is set only after `useCurrentUser()` returns a user
- [ ] The document updates when the user navigates
- [ ] With multiple documents, the one the user is viewing is the root document

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#subscribe-to-documents - "Subscribe to Documents"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesetdocuments - `useSetDocuments()`
- https://docs.velt.dev/realtime-collaboration/huddle/setup - "Huddle Setup"

---

### 1.3 Use authProvider for Authentication

**Impact: CRITICAL (authProvider is the recommended authentication path and the only one with automatic token refresh)**

Authenticate users with the `authProvider` prop on `VeltProvider` (React) or `Velt.setVeltAuthProvider()` (other frameworks). Velt calls your `generateToken` function whenever a token is needed, including on expiry, so the session refreshes itself. The `identify()` method and `useIdentify()` hook still exist, but they require you to refresh tokens yourself; avoid them in new code.

**Why this matters:**

Huddle only works for an authenticated user. With `identify()` and no manual refresh, the huddle cannot be joined when the session expires; huddles require an authenticated user to connect.

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

**Key details:**
- `VeltAuthProvider` fields: `user` (required), `generateToken`, `retryConfig` (`retryCount`, `retryDelay`), `options` (`authToken`, `forceReset`)
- `generateToken` can be omitted during local development, but provide it in production for security and automatic refresh
- Generate the JWT on your server; never ship your Velt auth token to the browser
- Include `organizationId` in the user object

**Verification:**
- [ ] `authProvider` prop is set on `VeltProvider` (or `Velt.setVeltAuthProvider()` is called)
- [ ] `authProvider.user` includes `userId`, `organizationId`, and `name`
- [ ] `generateToken` returns a Velt JWT from your backend
- [ ] No `getAuthToken` / `onAuthTokenExpire` keys (they do not exist)
- [ ] No `identify()` / `useIdentify()` calls unless you also implement token refresh

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#authenticate-a-user - "Authenticate a User"
- https://docs.velt.dev/get-started/quickstart - "Step 5: Authenticate Users"
- https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens - "JWT Authentication Tokens"
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltauthprovider - `VeltAuthProvider`

---

## 2. Configuration

**Impact: HIGH-MEDIUM**

Configuration options for huddle behavior. Set the huddle type explicitly (`audio` / `video` / `all`; screen share is documented as both `screen` and `presentation`), enable or disable ephemeral in-call chat, opt in to flock mode (follow-me) on avatar click, and turn on cursor-mode huddle bubbles.

### 2.1 Configure Cursor Mode for Huddle

**Impact: MEDIUM (Shows a video/audio bubble floating near the user's cursor position)**

Cursor mode displays a small video or audio bubble that floats near each huddle participant's cursor position. This creates a spatial awareness effect where you can see both where a user is pointing and their video/audio feed simultaneously.

**Why this matters:**

In spatial applications like whiteboards, design tools, or canvas-based editors, cursor mode bridges the gap between communication and spatial context. Users can point at specific elements while discussing them, making remote collaboration feel more natural.

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

**Key requirements:**

- `VeltCursor` must be mounted (once, near the root) for cursor tracking to work
- Cursor mode attaches the huddle bubble to each participant's tracked cursor
- Without `VeltCursor`, the SDK has no cursor position data to attach bubbles to
- Best suited for canvas, whiteboard, and spatial applications

**Key behaviors:**

- When enabled, each huddle participant's video/audio feed appears as a small bubble near their cursor
- The bubble follows the cursor in real time
- Provides spatial context for discussions — users can see what others are pointing at
- Customize the bubble with the `AudioHuddle` / `VideoHuddle` cursor pointer wireframes; per-attendee state is `Attendee.huddleOnCursorMode`
- `enableCursorMode()` / `disableCursorMode()` are listed in the `HuddleElement` API reference; the huddle feature page does not document them

**Verification:**
- [ ] One `VeltCursor` is mounted
- [ ] `huddleElement.enableCursorMode()` is called when cursor bubbles are desired
- [ ] Huddle participant bubbles appear near cursor positions during active huddle
- [ ] Bubbles follow cursor movement in real time

**Source Pointers:**
- https://docs.velt.dev/ui-customization/reference/apis - "Huddle: client.getHuddleElement()" (`enableCursorMode`, `disableCursorMode`)
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/ui-customization/features/realtime/cursors - "AudioHuddle", "VideoHuddle" pointer wireframes

---

### 2.2 Configure Ephemeral Chat in Huddle

**Impact: MEDIUM (Chat messages within huddle are ephemeral and not persisted after huddle ends)**

`VeltHuddle` supports an ephemeral chat feature that allows participants to exchange text messages during a huddle session. Chat messages are not persisted after the huddle ends.

**Why this matters:**

Ephemeral chat provides a lightweight communication channel during huddles for sharing links, code snippets, or notes without leaving the huddle context. Understanding that messages are ephemeral prevents users from relying on huddle chat for persistent information.

**Incorrect (mounting VeltHuddle twice to toggle chat):**

```jsx
<VeltHuddle chat={true} />
<VeltHuddle chat={false} /> {/* shared service flag: the last setter wins */}
```

**Correct (React: enable or disable chat):**

```jsx
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
```

**React: Programmatic control via hook**

```jsx
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
```

**Other Frameworks: Chat configuration**

```html
<!-- Chat enabled (default) -->
<velt-huddle chat="true"></velt-huddle>

<!-- Chat disabled -->
<velt-huddle chat="false"></velt-huddle>
```

```js
const huddleElement = Velt.getHuddleElement();
huddleElement.enableChat();
huddleElement.disableChat();
```

**Key behaviors:**

- Chat is enabled by default (`chat={true}`)
- Messages are ephemeral — they are not stored or retrievable after the huddle session ends
- Chat is only visible to active huddle participants
- Use `useHuddleUtils()` (or `client.getHuddleElement()`) to get the `HuddleElement` for programmatic control
- The setting is backed by a shared huddle-service flag: if two places set it, the last setter wins
- The chat panel is customizable via the `<velt-huddle-messages-panel-wireframe>` tag

**Verification:**
- [ ] `chat` prop is set on `VeltHuddle` as intended
- [ ] Chat messages appear for all huddle participants during active session
- [ ] Messages are not persisted after the huddle ends
- [ ] Programmatic enable/disable works via `huddleElement`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/huddle/customize-behavior#chat - "chat"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltHuddle" (`chat` default)

---

### 2.3 Configure Flock Mode (Follow Me)

**Impact: MEDIUM (Flock mode lets users follow a presenter's navigation through the document)**

Flock mode enables a "Follow Me" experience where clicking a user's avatar during a huddle causes your view to follow their navigation. This is useful for presentations, guided walkthroughs, and collaborative reviews where one person leads the group through document sections.

**Why this matters:**

Without flock mode, huddle participants must manually navigate to stay in sync with a presenter. Flock mode automates this, ensuring all followers see exactly what the presenter sees as they move through the document.

**Incorrect (expecting avatar clicks to follow without enabling it):**

```jsx
<VeltHuddle /> {/* flockModeOnAvatarClick defaults to false; avatar clicks do nothing special */}
```

**Correct (React: enable via prop):**

```jsx
"use client";
import { VeltHuddle } from "@veltdev/react";

function App() {
  return (
    <VeltHuddle flockModeOnAvatarClick={true} />
  );
}
```

**React: Programmatic control via hook**

```jsx
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
```

**Other Frameworks: Flock mode configuration**

```html
<!-- Attribute spelling as documented on the huddle Customize Behavior page -->
<velt-huddle flock-mode-onavatar-click="true"></velt-huddle>
```

```js
// API alternative (avoids attribute-spelling issues)
const huddleElement = Velt.getHuddleElement();
huddleElement.enableFlockModeOnAvatarClick();
huddleElement.disableFlockModeOnAvatarClick();
```

**Key behaviors:**

- When enabled, clicking a participant's avatar in the huddle UI will follow their navigation
- The follower's view automatically scrolls or navigates to match the leader's position
- Any participant can become the leader — simply click their avatar to follow them
- Default is `false`
- To stop following, call `stopFollowingUser()` on the presence element (see the flock mode docs)
- For SPA routing of followers, configure `onNavigate` / `defaultFlockNavigation` on `VeltPresence` (see `velt-presence-best-practices`)

**Use cases:**

- Code review walkthroughs where a reviewer guides the team through changes
- Design review sessions where one person navigates the design file
- Onboarding flows where a mentor guides a new user through the interface

**Verification:**
- [ ] `flockModeOnAvatarClick={true}` is set on `VeltHuddle`
- [ ] Clicking a participant's avatar during huddle follows their navigation
- [ ] Followers see the same document section as the leader
- [ ] Following can be stopped (e.g. a button calling `stopFollowingUser()`)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/huddle/customize-behavior#flockmodeonavatarclick - "flockModeOnAvatarClick"
- https://docs.velt.dev/realtime-collaboration/flock-mode/customize-behavior#stopfollowinguser - "stopFollowingUser()"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltHuddle" (`flockModeOnAvatarClick` default)

---

### 2.4 Configure VeltHuddleTool Type

**Impact: HIGH (The type prop controls what the first click on the huddle tool starts)**

The `type` prop on `VeltHuddleTool` sets what kind of huddle the first click starts. Always set it explicitly: the huddle feature page lists the default as `all`, while the component behavior reference lists `audio`.

**Why this matters:**

Relying on the default gives different behavior depending on which doc you trust. A code review tool may only need audio, while a design tool needs video and screen sharing.

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

**Type values:**

| Value | What the first click starts |
|---|---|
| `'audio'` | Audio-only huddle |
| `'video'` | Audio + video huddle |
| `'all'` | All options |
| `'screen'` / `'presentation'` | Audio + screen share. The feature page names this `screen`; the component reference and `componentConfig.type` name it `presentation`. Verify against your SDK version before relying on it. |

**Key details:**

- If a huddle is already running, clicking any huddle tool joins it with the existing huddle's type
- Screen sharing requires browser support for `navigator.mediaDevices.getDisplayMedia`; the tool exposes `componentConfig.screenSharingSupported` for wireframes
- `darkMode` on `VeltHuddleTool` toggles the dark theme
- You can render several `VeltHuddleTool` buttons with different types

**Verification:**
- [ ] `type` is set explicitly on every `VeltHuddleTool`
- [ ] The offered huddle options match the intended experience
- [ ] `VeltHuddle` is mounted at the root for the tool to work
- [ ] Microphone, camera, and screen permissions are handled for the chosen type

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/huddle/customize-behavior#type - "type"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltHuddleTool (sibling)"
- https://docs.velt.dev/ui-customization/features/realtime/huddle/wireframe-variables - `componentConfig.type`

---

## 3. Events

**Impact: MEDIUM**

Server-driven huddle webhook events. Covers Basic (v1) payloads (`notificationSource: "huddle"`, `actionType` `created` / `joined`) and Advanced (v2) events (`huddle.create`, `huddle.join` with `HuddlePayload`), plus the handler pattern for routing them through your backend.

### 3.1 Handle Huddle Webhook Events

**Impact: MEDIUM (Server-side webhooks fire when huddles are created or users join)**

Velt sends a webhook when a user creates a huddle or joins one. The payload shape depends on which webhook service you enabled in the Velt Console: Basic (v1) or Advanced (v2, Enterprise). Handle the shape you actually receive.

**Why this matters:**

Basic webhooks identify huddle events with `notificationSource: "huddle"` and `actionType`. Advanced webhooks use `event` names (`huddle.create`, `huddle.join`) and nest the details under `data`. A handler written for one shape silently ignores the other.

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

**Basic (v1) huddle payload fields:**

| Field | Notes |
|---|---|
| `actionType` | `created` or `joined` |
| `notificationSource` | `"huddle"` |
| `actionUser` | User who created or joined |
| `metadata` | `apiKey`, `clientDocumentId`, `documentId`, `pageInfo`, and `locations` when set |
| `platform` | `"sdk"` |

**Key behaviors:**

- Enable webhooks in the Velt Console (Configurations > Webhook Service) and add your endpoint URL
- Return a 2xx response quickly; Advanced webhooks expect it within 15 seconds
- Basic webhooks can carry an optional auth token in the `Authorization` header (`Basic YOUR_AUTH_TOKEN`); payloads may be Base64-encoded or encrypted if you enabled those options
- Advanced webhook triggers for huddles are controlled by the workspace `triggers.huddle` config (`HuddleTrigger`)

**Verification:**
- [ ] Handler checks `notificationSource === "huddle"` (v1) or `event` starts with `huddle.` (v2)
- [ ] Both create and join events are handled
- [ ] Advanced webhooks verify signatures before processing
- [ ] Endpoint returns 2xx promptly
- [ ] Encoded or encrypted payloads are decoded when those options are enabled

**Source Pointers:**
- https://docs.velt.dev/webhooks/basic#huddle-events - "Huddle Events"
- https://docs.velt.dev/webhooks/advanced#huddle - "Huddle" event types
- https://docs.velt.dev/api-reference/sdk/models/data-models#huddlepayload - `HuddlePayload`
- https://docs.velt.dev/api-reference/sdk/models/data-models#webhookv2payload - `WebhookV2Payload`

---

## 4. UI Customization

**Impact: MEDIUM**

Customizing the huddle tool through the `button` slot and documented CSS `::part(...)` hooks (`container`, `button-container`, `button-icon`).

### 4.1 Customize Huddle Tool Button

**Impact: MEDIUM (Slots and CSS parts for customizing the huddle tool button)**

`VeltHuddleTool` supports a `button` slot for replacing the default button, and CSS `::part()` hooks for styling the default button inside its shadow DOM. For deeper layout changes, use the huddle wireframes (see `wireframe-variables-huddle`).

**Why this matters:**

Default components may not match your design system. The slot keeps all huddle behavior while letting you render your own button. Invented CSS variable names silently do nothing, so use only documented parts and variables.

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

| Part | Targets |
|---|---|
| `container` | Tool container |
| `button-container` | Button container |
| `button-icon` | Button SVG icon |

```css
velt-huddle-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
}
```

**CSS variables:** use only variables listed on the Global Styles / CSS variables pages. If a variable is not listed there, it does not exist.

**Customization guidelines:**

- Use `slot="button"` to replace the button content while keeping huddle functionality
- Use CSS parts to adjust the default button without replacing it
- Use `darkMode` on `VeltHuddleTool` for the dark theme
- Use huddle wireframes (`<velt-huddle-tool-wireframe>`, `<velt-huddle-wireframe>`) to restructure the tool or room

**Verification:**
- [ ] The slot is placed inside `VeltHuddleTool` / `<velt-huddle-tool>`
- [ ] Clicking the custom button still starts or joins a huddle
- [ ] CSS parts used are `container`, `button-container`, or `button-icon`
- [ ] No undocumented CSS variables are used

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/huddle/slots - "Slots"
- https://docs.velt.dev/ui-customization/features/realtime/huddle/parts - "Parts"
- https://docs.velt.dev/ui-customization/features/realtime/huddle/variables - "Variables"
- https://docs.velt.dev/global-styles/global-styles - "Global Styles"

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

#### Root `<velt-huddle>` variables

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

#### `<velt-huddle-tool>` variables

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

#### Per-attendee tile context

Resolvable only inside `<velt-audio-huddle-user-wireframe>` and `<velt-video-huddle-user-wireframe>`:

| Variable | Type | Use |
|---|---|---|
| `componentConfig.attendee` | `Attendee` | This tile's attendee record. |
| `componentConfig.stream` | `MediaStream` | This attendee's stream. |
| `componentConfig.isLocal` | `boolean` | True on the local user's tile. |
| `componentConfig.color` | `string` | Accent colour — internal style driver. |
| `componentConfig.gainVolume` | `number` | Audio gain driving the speaking-ring animation. |

The screen-share viewer (`<velt-screen-sharing-huddle-wireframe>`) reads `componentConfig.screenSharing.stream` and `componentConfig.screenSharing.attendee` from the **root** config, not from a per-tile context.

#### Other wireframe tags

| Tag | Notes |
|---|---|
| `<velt-huddle-tool-wireframe>` | The tool button; reads the Huddle Tool variables above. |
| `<velt-huddle-menu-panel-wireframe>` | In-huddle controls (mute, video, screen, leave); read `componentConfig.localStreamState.*` from the root. |
| `<velt-huddle-messages-panel-wireframe>` | In-huddle chat panel; no extra variables beyond the root config. |

#### `shouldShow` gates worth remembering

| Slot | Built-in gate |
|---|---|
| `<velt-huddle-wireframe>` (root) | Renders when `componentConfig.meetingJoined === true`. |
| `<velt-screen-sharing-huddle-wireframe>` | Renders when `componentConfig.screenSharing.stream` is truthy. |

#### Common mistakes — DO NOT

**1. DO NOT drop the `componentConfig.` prefix.** Huddle uses the flat-config access pattern — `<velt-data field="meetingJoined" />` resolves to nothing. Use `<velt-data field="componentConfig.meetingJoined" />`.

**2. DO NOT reference per-attendee variables outside a tile.** `componentConfig.attendee`, `.stream`, `.isLocal`, `.color`, and `.gainVolume` are only defined inside `<velt-audio-huddle-user-wireframe>` / `<velt-video-huddle-user-wireframe>`. Referencing them from the root or the menu panel returns `undefined` silently.

**3. DO NOT confuse `componentConfig.screenSharing` (root) with a per-tile variable.** Read the active remote share from the root config inside the screen-share viewer slot.

**Verification:**
- [ ] All wireframe variables use the explicit `componentConfig.<path>` prefix
- [ ] Per-attendee context (`componentConfig.attendee`, `.stream`, `.isLocal`, `.color`, `.gainVolume`) is only used inside an audio- or video-huddle-user wireframe
- [ ] Root room is gated by `velt-if="{componentConfig.meetingJoined}"` — not by conditionally mounting the wireframe from a hook
- [ ] Screen-share viewer reads `componentConfig.screenSharing.stream` from the **root** config, not a per-tile alias
- [ ] Huddle-tool template uses `componentConfig.disabled`, `componentConfig.meetingJoined`, and `componentConfig.type` from its own scope

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/huddle/wireframe-variables — "Huddle Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"

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

**Debugging checklist:**

- [ ] `VeltProvider` renders with valid `apiKey` and `authProvider`
- [ ] `VeltHuddle` is at the root level inside `VeltProvider`
- [ ] `VeltHuddleTool` is in the toolbar with `type` prop set
- [ ] `setDocuments` (from `useSetDocuments()` or `Velt.setDocuments`) is called with the correct `{ id }` after authentication
- [ ] `featureAllowList`, if set, includes `'huddle'`
- [ ] `"use client"` directive is present in Next.js
- [ ] Domain is safelisted in Velt Console
- [ ] Browser microphone/camera permissions are granted
- [ ] No browser extensions blocking WebRTC
- [ ] Tested with two browser tabs using different users
- [ ] Check browser console for Velt SDK errors

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/huddle/setup - "Huddle Setup"
- https://docs.velt.dev/realtime-collaboration/huddle/customize-behavior#serverfallback - "serverFallback"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltHuddle" defaults
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`

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
