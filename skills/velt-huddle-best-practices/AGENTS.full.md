# Velt Huddle Best Practices

**Version 1.0.0**  
Velt  
April 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

> **IMPORTANT:** Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.

> **IMPORTANT:** VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook or `client.identify()`. See velt-setup-best-practices for details.

---

## Table of Contents

1. [Core Setup](#1-core-setup) -- **CRITICAL**
   - 1.1 [Use authProvider for Authentication](#11-use-authprovider-for-authentication)
   - 1.2 [Add VeltHuddle and VeltHuddleTool Components](#12-add-velthuddle-and-velthuddletool-components)
   - 1.3 [Scope Huddle with setDocuments](#13-scope-huddle-with-setdocuments)

2. [Configuration](#2-configuration) -- **HIGH-MEDIUM**
   - 2.1 [Configure VeltHuddleTool Type](#21-configure-velthuddletool-type)
   - 2.2 [Configure Ephemeral Chat in Huddle](#22-configure-ephemeral-chat-in-huddle)
   - 2.3 [Configure Flock Mode (Follow Me)](#23-configure-flock-mode-follow-me)
   - 2.4 [Configure Cursor Mode for Huddle](#24-configure-cursor-mode-for-huddle)

3. [Events](#3-events) -- **MEDIUM**
   - 3.1 [Handle Huddle Webhook Events](#31-handle-huddle-webhook-events)

4. [UI & Debugging](#4-ui--debugging) -- **MEDIUM-LOW**
   - 4.1 [Customize Huddle Tool Button](#41-customize-huddle-tool-button)
   - 4.2 [Troubleshoot Common Huddle Issues](#42-troubleshoot-common-huddle-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns required for any Velt huddle implementation. Without these, huddle will not function.

### 1.1 Use authProvider for Authentication

**Impact: CRITICAL (Required -- SDK will not work without user authentication)**

Always authenticate users via the `authProvider` prop on `VeltProvider`. The older `useIdentify` hook and `client.identify()` method are deprecated and must not be used.

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

function AuthenticatedApp({ children }) {
  const authProvider = {
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
  };

  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      {children}
    </VeltProvider>
  );
}
```

Alternatively, use `useVeltAuthProvider` in a child component for dynamic setup.

**Verification:**
- `authProvider` prop is set on `VeltProvider`
- No imports of `useIdentify` anywhere in the codebase
- No calls to `client.identify()` anywhere in the codebase
- `getAuthToken` returns a valid JWT from your backend

---

### 1.2 Add VeltHuddle and VeltHuddleTool Components

**Impact: CRITICAL (Two components required for huddle to function)**

`VeltHuddle` renders the huddle UI and participant list -- place it inside `VeltProvider` at the root level. `VeltHuddleTool` is the button users click to start or join a huddle -- place it in your toolbar alongside `VeltPresence`.

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

HTML equivalent:

```html
<velt-huddle></velt-huddle>
<div class="toolbar">
  <velt-presence></velt-presence>
  <velt-huddle-tool type="all"></velt-huddle-tool>
</div>
```

**Placement:** `VeltHuddle` at root level inside `VeltProvider`. `VeltHuddleTool` in toolbar/header. `type="all"` enables audio, video, and screen sharing options via dropdown. `VeltHuddle` has no visual output until a huddle is active.

---

### 1.3 Scope Huddle with setDocuments

**Impact: CRITICAL (Without this, huddle is scoped to root document across all pages)**

Call `useSetDocuments` in a child component of `VeltProvider` to scope the huddle to a specific document.

```jsx
"use client";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";

function DocumentScope({ documentId }) {
  const currentUser = useCurrentUser();
  useSetDocuments(currentUser ? [{ documentId, metadata: {} }] : null);
  return null;
}
```

Full layout with document scoping:

```jsx
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

Common mistakes: calling `useSetDocuments` in the same component as `VeltProvider`, setting documents before authentication, forgetting to update on route changes.

**Verification:**
- `useSetDocuments` called in a child of `VeltProvider`
- Document ID set only after user is authenticated
- Document ID updates on navigation

---

## 2. Configuration

**Impact: HIGH-MEDIUM**

Props and settings that control huddle behavior.

### 2.1 Configure VeltHuddleTool Type

**Impact: HIGH (Controls which huddle options are available to users)**

The `type` prop on `VeltHuddleTool` controls which options are presented. Available values:

- `'all'` -- Dropdown with audio, video, and screen sharing options (recommended default)
- `'audio'` -- Audio huddle button only
- `'video'` -- Video huddle button only
- `'screen'` -- Screen sharing button only

```jsx
<VeltHuddleTool type="all" />
<VeltHuddleTool type="audio" />
<VeltHuddleTool type="video" />
<VeltHuddleTool type="screen" />
```

```html
<velt-huddle-tool type="all"></velt-huddle-tool>
<velt-huddle-tool type="audio"></velt-huddle-tool>
```

You can render multiple `VeltHuddleTool` components with different types for separate buttons instead of the dropdown.

---

### 2.2 Configure Ephemeral Chat in Huddle

**Impact: MEDIUM (Chat messages within huddle are ephemeral)**

`VeltHuddle` supports ephemeral chat during huddle sessions. Messages are not persisted after the huddle ends.

```jsx
<VeltHuddle chat={true} />   {/* Enabled (default) */}
<VeltHuddle chat={false} />  {/* Disabled */}
```

Programmatic control:

```jsx
"use client";
import { useHuddleUtils } from "@veltdev/react";

function HuddleChatToggle() {
  const huddleElement = useHuddleUtils();

  const enableChat = () => huddleElement?.enableChat();
  const disableChat = () => huddleElement?.disableChat();

  return (
    <div>
      <button onClick={enableChat}>Enable Chat</button>
      <button onClick={disableChat}>Disable Chat</button>
    </div>
  );
}
```

HTML: `<velt-huddle chat="true"></velt-huddle>`

**Key:** Chat is enabled by default. Messages are ephemeral -- not stored after huddle ends. Use `useHuddleUtils()` to get the `HuddleElement` for programmatic control.

---

### 2.3 Configure Flock Mode (Follow Me)

**Impact: MEDIUM (Follow a presenter's navigation through the document)**

Flock mode enables a "Follow Me" experience where clicking a user's avatar during a huddle causes your view to follow their navigation.

```jsx
<VeltHuddle flockModeOnAvatarClick={true} />
```

Programmatic control:

```jsx
"use client";
import { useHuddleUtils } from "@veltdev/react";

function FlockModeToggle() {
  const huddleElement = useHuddleUtils();

  const enableFlock = () => huddleElement?.enableFlockModeOnAvatarClick();
  const disableFlock = () => huddleElement?.disableFlockModeOnAvatarClick();

  return (
    <div>
      <button onClick={enableFlock}>Enable Follow Mode</button>
      <button onClick={disableFlock}>Disable Follow Mode</button>
    </div>
  );
}
```

HTML: `<velt-huddle flock-mode-on-avatar-click="true"></velt-huddle>`

**Use cases:** Code review walkthroughs, design review sessions, onboarding flows. Any participant can become the leader by having others click their avatar.

---

### 2.4 Configure Cursor Mode for Huddle

**Impact: MEDIUM (Video/audio bubble floating near the user's cursor)**

Cursor mode displays a small video or audio bubble near each huddle participant's cursor position. Requires `VeltCursor` to be active for cursor tracking.

```jsx
"use client";
import { useHuddleUtils } from "@veltdev/react";

function CursorModeToggle() {
  const huddleElement = useHuddleUtils();

  const enableCursorMode = () => huddleElement?.enableCursorMode();
  const disableCursorMode = () => huddleElement?.disableCursorMode();

  return (
    <div>
      <button onClick={enableCursorMode}>Enable Cursor Bubbles</button>
      <button onClick={disableCursorMode}>Disable Cursor Bubbles</button>
    </div>
  );
}
```

Ensure `VeltCursor` is active:

```jsx
"use client";
import { VeltHuddle, VeltCursor } from "@veltdev/react";

function CollaborativeCanvas() {
  return (
    <>
      <VeltHuddle />
      <main className="canvas-area">
        <VeltCursor />
      </main>
    </>
  );
}
```

**Key:** Without `VeltCursor`, the SDK has no cursor position data to attach bubbles to. Best suited for canvas, whiteboard, and spatial applications.

---

## 3. Events

**Impact: MEDIUM**

Server-side event handling for huddle activity.

### 3.1 Handle Huddle Webhook Events

**Impact: MEDIUM (Server-side webhooks fire when huddles are created or users join)**

Two event types: `created` (new huddle started) and `joined` (user joins existing huddle). Configure webhook endpoints in the Velt Console.

Payload structure:

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

Server handler:

```javascript
app.post("/webhooks/velt-huddle", (req, res) => {
  const { actionType, actionUser, metadata } = req.body;

  switch (actionType) {
    case "created":
      console.log(`${actionUser.name} started a huddle on ${metadata.clientDocumentId}`);
      break;
    case "joined":
      console.log(`${actionUser.name} joined a huddle on ${metadata.clientDocumentId}`);
      break;
  }

  res.status(200).json({ received: true });
});
```

**Configuration:** Velt Console > Webhooks > Add endpoint URL > Select huddle events > Save.

---

## 4. UI & Debugging

**Impact: MEDIUM-LOW**

Customization and troubleshooting patterns.

### 4.1 Customize Huddle Tool Button

**Impact: MEDIUM (Slots, CSS parts, and CSS variables for customizing huddle UI)**

Custom button via slot:

```jsx
<VeltHuddleTool type="all">
  <button slot="button">Start Call</button>
</VeltHuddleTool>
```

HTML: `<velt-huddle-tool type="all"><button slot="button">Start Call</button></velt-huddle-tool>`

CSS Parts:

```css
velt-huddle-tool::part(container) {
  border-radius: 8px;
}

velt-huddle-tool::part(button-container) {
  padding: 4px 8px;
}

velt-huddle-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
}
```

CSS variable for z-index:

```css
:root {
  --velt-huddle-z-index: 1000;
}
```

Use `slot="button"` to replace button content. Use CSS parts for styling adjustments. `--velt-huddle-z-index` controls the huddle overlay stacking order.

---

### 4.2 Troubleshoot Common Huddle Issues

**Impact: LOW-MEDIUM (Quick fixes for common problems)**

**Issue 1: Huddle not starting**
- Check `VeltHuddle` at root + `VeltHuddleTool` in toolbar + `authProvider` on `VeltProvider`
- Ensure domain is safelisted in Velt Console
- In Next.js, confirm `"use client"` directive is present

**Issue 2: No audio or video**
- Browser permissions for microphone/camera must be granted
- Check `navigator.mediaDevices.getUserMedia` support
- Non-HTTPS origins block media access (except localhost)
- Check for `NotAllowedError` or `NotFoundError` in console

**Issue 3: Peer-to-peer connection failing**
- `serverFallback={true}` (default) ensures fallback through server when P2P fails
- Check for restrictive firewalls, VPNs, or browser extensions blocking WebRTC

**Issue 4: Huddle scoped to wrong users**
- Verify `setDocuments` is called with correct document ID
- Ensure document ID updates on route changes
- Without `setDocuments`, defaults to root document (all users across all pages)

**Issue 5: Chat not visible in huddle**
- Check `chat={true}` on `VeltHuddle` (default)
- Chat only visible during active huddle session
- Adjust `--velt-huddle-z-index` if chat panel is hidden behind other UI

**Debugging Checklist:**
- `VeltProvider` renders with valid `apiKey` and `authProvider`
- `VeltHuddle` is at root level inside `VeltProvider`
- `VeltHuddleTool` is in toolbar with `type` prop set
- `useSetDocuments` called with correct document ID after authentication
- `"use client"` directive present in Next.js
- Domain safelisted in Velt Console
- Browser microphone/camera permissions granted
- Tested with two browser tabs using different users
- Check browser console for Velt SDK errors
