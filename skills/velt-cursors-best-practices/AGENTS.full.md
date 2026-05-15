# Velt Cursors Best Practices

**Version 1.1.1**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive guide for Velt's real-time cursor tracking feature — rendering collaborative cursor pointers showing where each remote user is on the page. Covers setup (VeltCursor placement inside the content area, authProvider over identify(), per-document scoping via setDocuments), configuration (allowed-elements whitelisting, avatar mode, inactivity timeout), data access (useCursorUsers / useCursorUtils hooks plus the getCursorElement Observable and getOnlineUsersOnCurrentDocument), cursor change events (onCursorUserChange), wireframe UI customization (Arrow / Avatar / Default / Huddle pointer variants), the flat-config template-variable surface on `<velt-cursor>` and per-user `<velt-cursor-pointer-wireframe>` (componentConfig.cursorUsers, componentConfig.showAvatar, componentConfig.showAudio, componentConfig.showVideo, componentConfig.selfCursorPointer, huddle-on-cursor flags, helper functions), and debugging cursors that don't appear or track incorrectly. All guidance is evidence-backed from official Velt documentation.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Add VeltCursor Component for Real-Time Cursor Tracking](#11-add-veltcursor-component-for-real-time-cursor-tracking)
   - 1.2 [Scope Cursors with setDocuments](#12-scope-cursors-with-setdocuments)
   - 1.3 [Use authProvider for Authentication](#13-use-authprovider-for-authentication)

2. [Data Access](#2-data-access) — **HIGH**
   - 2.1 [Use React Hooks for Cursor Data](#21-use-react-hooks-for-cursor-data)
   - 2.2 [Use Vanilla JS API for Cursor Data](#22-use-vanilla-js-api-for-cursor-data)

3. [Configuration](#3-configuration) — **HIGH-MEDIUM**
   - 3.1 [Configure Cursor Inactivity Timeout](#31-configure-cursor-inactivity-timeout)
   - 3.2 [Restrict Cursor Display to Specific DOM Elements](#32-restrict-cursor-display-to-specific-dom-elements)
   - 3.3 [Show User Avatar Next to Cursor](#33-show-user-avatar-next-to-cursor)

4. [Events](#4-events) — **MEDIUM**
   - 4.1 [Subscribe to Cursor User Change Events](#41-subscribe-to-cursor-user-change-events)

5. [UI Wireframes](#5-ui-wireframes) — **MEDIUM**
   - 5.1 [Customize Cursor Pointer with Wireframes](#51-customize-cursor-pointer-with-wireframes)

6. [Wireframe Variables](#6-wireframe-variables) — **MEDIUM**
   - 6.1 [Bind Cursors Wireframe Slots Using componentConfig Template Variables](#61-bind-cursors-wireframe-slots-using-componentconfig-template-variables)

7. [Debugging](#7-debugging) — **LOW-MEDIUM**
   - 7.1 [Troubleshoot Common Cursor Issues](#71-troubleshoot-common-cursor-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup required for any Velt Cursors implementation. Use `authProvider` on `VeltProvider` (never `identify()`), mount `<VeltCursor />` inside the content area you want tracked (not in a toolbar), and scope cursors per document via `setDocuments`. Get these wrong and no cursors render — or they leak across documents.

### 1.1 Add VeltCursor Component for Real-Time Cursor Tracking

**Impact: CRITICAL (VeltCursor must be placed inside the collaborative content area, not in the toolbar)**

`VeltCursor` enables real-time cursor tracking so users can see each other's mouse positions. Place it inside the collaborative content area where users interact spatially -- not in the toolbar or header (that is where `VeltPresence` goes).

**Why this matters:**

```html
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasArea() {
  return (
    <main className="canvas-container">
      <VeltCursor />
      {/* Your collaborative content here */}
    </main>
  );
}
"use client";
import { VeltPresence, VeltCursor } from "@veltdev/react";

function CollaborativeApp() {
  return (
    <>
      <header className="toolbar">
        <h1>My Whiteboard</h1>
        <VeltPresence />
      </header>
      <main className="canvas">
        <VeltCursor />
        {/* Canvas content, ReactFlow, design surface */}
      </main>
    </>
  );
}
<div class="canvas-container">
  <velt-cursor></velt-cursor>
  <!-- Your collaborative content here -->
</div>
<header class="toolbar">
  <velt-presence></velt-presence>
</header>
<main class="canvas">
  <velt-cursor></velt-cursor>
</main>
```

**React: Full layout with presence in toolbar and cursor in canvas**
**HTML: Basic cursor setup**
**HTML: Full layout**

---

### 1.2 Scope Cursors with setDocuments

**Impact: CRITICAL (Without setDocuments, cursors from ALL documents appear together)**

You must call `setDocuments` (or use the `useSetDocuments` hook) to scope cursors to a specific document. Without it, cursors from every active user across your entire application will appear, regardless of which document they are viewing.

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
import { VeltProvider, VeltCursor } from "@veltdev/react";

function App({ documentId, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <DocumentScope documentId={documentId} />
      <main className="canvas">
        <VeltCursor />
        {/* Canvas content */}
      </main>
    </VeltProvider>
  );
}
```

**React: Full layout with document scoping and cursors**

**HTML / Vanilla JS:**

```javascript
const client = await Velt.init("YOUR_API_KEY");
// After authentication completes:
client.setDocuments([{ documentId: "canvas-42", metadata: {} }]);
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

## 2. Data Access

**Impact: HIGH**

Patterns for reading cursor state. Includes the React hooks `useCursorUsers` and `useCursorUtils`, plus the SDK-level `getCursorElement()` Observable surface and `getOnlineUsersOnCurrentDocument()` for active-user lookup outside of React.

### 2.1 Use React Hooks for Cursor Data

**Impact: HIGH (Access cursor user data and programmatic control via React hooks)**

Use `useCursorUsers()` to get the list of online users with active cursors, and `useCursorUtils()` to get the `CursorElement` for programmatic control.

**Why this matters:**

```jsx
"use client";
import { useCursorUsers } from "@veltdev/react";

function OnlineCursorUsers() {
  const cursorUsers = useCursorUsers();

  if (!cursorUsers || cursorUsers.length === 0) {
    return <p>No other users on this document</p>;
  }

  return (
    <ul>
      {cursorUsers.map((user) => (
        <li key={user.userId}>
          {user.name} — position: ({user.x}, {user.y})
        </li>
      ))}
    </ul>
  );
}
"use client";
import { useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorController() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      // Configure cursor behavior programmatically
      cursorElement.enableAvatarMode();
      cursorElement.setInactivityTime(60000);
      cursorElement.allowedElementIds(["canvas"]);
    }
  }, [cursorElement]);

  return null;
}
```

**useCursorUtils: Programmatic cursor control**

**Combining both hooks:**

```jsx
"use client";
import { useCursorUsers, useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorDashboard() {
  const cursorUsers = useCursorUsers();
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.allowedElementIds(["main-canvas"]);
    }
  }, [cursorElement]);

  return (
    <div className="cursor-dashboard">
      <p>{cursorUsers?.length ?? 0} users with active cursors</p>
    </div>
  );
}
```

---

### 2.2 Use Vanilla JS API for Cursor Data

**Impact: HIGH (Access cursor data and control via getCursorElement and observables)**

Use `getCursorElement()` from the Velt client to access cursor configuration and `getOnlineUsersOnCurrentDocument()` to observe cursor users. These APIs use RxJS-style observables that require explicit subscription and cleanup.

**Get the CursorElement:**

```javascript
const client = await Velt.init("YOUR_API_KEY");
const cursorElement = client.getCursorElement();
```

**Subscribe to online users with cursors:**

```javascript
const cursorElement = client.getCursorElement();

const subscription = cursorElement.getOnlineUsersOnCurrentDocument().subscribe((users) => {
  // users is CursorUser[] with position data
  users.forEach((user) => {
    console.log(`${user.name} at (${user.x}, ${user.y})`);
  });
});

// IMPORTANT: Clean up when done to prevent memory leaks
// e.g., on component destroy or page unload
subscription.unsubscribe();
```

**Configure cursor behavior:**

```javascript
const cursorElement = client.getCursorElement();

// Restrict to specific elements
cursorElement.allowedElementIds(["canvas-area"]);

// Enable avatar mode
cursorElement.enableAvatarMode();

// Set inactivity timeout
cursorElement.setInactivityTime(60000);
```

**Full example with cleanup:**

```javascript
class CursorManager {
  constructor(client) {
    this.cursorElement = client.getCursorElement();
    this.subscription = null;
  }

  init() {
    this.cursorElement.allowedElementIds(["canvas"]);
    this.cursorElement.setInactivityTime(120000);

    this.subscription = this.cursorElement
      .getOnlineUsersOnCurrentDocument()
      .subscribe((users) => {
        this.updateUserList(users);
      });
  }

  updateUserList(users) {
    const container = document.getElementById("user-list");
    container.innerHTML = users
      .map((u) => `<span>${u.name}</span>`)
      .join("");
  }

  destroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

---

## 3. Configuration

**Impact: HIGH-MEDIUM**

Behavior toggles for the cursor pointer. Restrict cursor visibility to specific DOM elements (`allowedElementIds`), switch between the default name-label pointer and avatar mode, and tune the inactivity timeout that hides idle remote cursors.

### 3.1 Configure Cursor Inactivity Timeout

**Impact: MEDIUM (Control how long before idle cursors disappear (default 5 minutes))**

Set `inactivityTime` to control how long (in milliseconds) a user's cursor remains visible after they stop moving it. The default is 300000ms (5 minutes). When a user's tab loses focus, their cursor is hidden immediately regardless of this setting.

**Why this matters:**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function Canvas() {
  return (
    <main className="canvas">
      <VeltCursor inactivityTime={300000} />
      {/* 5 minutes (default). Set lower for fast-paced collaboration. */}
    </main>
  );
}
<VeltCursor inactivityTime={60000} />
{/* 1 minute — good for whiteboards and design tools */}
<velt-cursor inactivity-time="300000"></velt-cursor>
"use client";
import { useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorConfig() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.setInactivityTime(60000);
    }
  }, [cursorElement]);

  return null;
}
```

**React: Shorter timeout for real-time canvas apps**
**HTML: Set inactivity time**
**API: Programmatic configuration**

**Vanilla JS:**

```javascript
const cursorElement = client.getCursorElement();
cursorElement.setInactivityTime(60000);
```

---

### 3.2 Restrict Cursor Display to Specific DOM Elements

**Impact: HIGH (Control which areas show cursors using allowedElementIds)**

Use `allowedElementIds` to limit cursor display to specific DOM elements. This prevents cursors from appearing in toolbars, sidebars, or other non-collaborative areas.

**Why this matters:**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasWithCursors() {
  return (
    <div>
      <div id="toolbar">
        {/* No cursors here */}
      </div>
      <div id="canvas-area">
        <VeltCursor allowedElementIds={JSON.stringify(["canvas-area"])} />
        {/* Cursors only appear within this div */}
      </div>
    </div>
  );
}
<VeltCursor allowedElementIds={JSON.stringify(["canvas-area", "sidebar-panel"])} />
<velt-cursor allowed-element-ids='["canvas-area"]'></velt-cursor>
"use client";
import { useCursorUtils } from "@veltdev/react";

function CursorConfig() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.allowedElementIds(["canvas-area"]);
    }
  }, [cursorElement]);

  return null;
}
```

**React: Multiple allowed elements**
**HTML: Restrict cursors**
**API: Programmatic configuration**

**Vanilla JS:**

```javascript
const cursorElement = client.getCursorElement();
cursorElement.allowedElementIds(["canvas-area"]);
```

---

### 3.3 Show User Avatar Next to Cursor

**Impact: MEDIUM (Display user avatar floating beside cursor instead of name label)**

Use `avatarMode` to show a user's avatar image floating next to their cursor instead of the default name label. This provides a more visual and compact way to identify collaborators.

**Why this matters:**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasWithAvatarCursors() {
  return (
    <main className="canvas">
      <VeltCursor avatarMode={true} />
      {/* Canvas content */}
    </main>
  );
}
<velt-cursor avatar-mode="true"></velt-cursor>
"use client";
import { useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorConfig() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.enableAvatarMode();
    }
  }, [cursorElement]);

  return null;
}
```

**HTML: Enable avatar mode**
**API: Programmatic toggle**

**Vanilla JS:**

```javascript
const cursorElement = client.getCursorElement();
cursorElement.enableAvatarMode();
// To disable: cursorElement.disableAvatarMode();
```

---

## 4. Events

**Impact: MEDIUM**

Subscription patterns for cursor position and user changes. Covers `onCursorUserChange` (and its unsubscribe pair) so listener lifecycles are matched.

### 4.1 Subscribe to Cursor User Change Events

**Impact: MEDIUM (React to cursor user changes via callback props or event listeners)**

Use `onCursorUserChange` to react when the list of users with active cursors changes. This fires when users join, leave, move, or go inactive.

**Why this matters:**

```html
"use client";
import { VeltCursor } from "@veltdev/react";
import { useCallback } from "react";

function CursorTracker() {
  const handleCursorChange = useCallback((users) => {
    // users is CursorUser[] with position and user data
    console.log("Active cursor users:", users.length);
    users.forEach((user) => {
      console.log(`${user.name} at (${user.x}, ${user.y})`);
    });
  }, []);

  return (
    <main className="canvas">
      <VeltCursor onCursorUserChange={(users) => handleCursorChange(users)} />
      {/* Canvas content */}
    </main>
  );
}
"use client";
import { VeltCursor } from "@veltdev/react";
import { useState, useCallback } from "react";

function CursorAwareCanvas() {
  const [activeUsers, setActiveUsers] = useState([]);

  const handleChange = useCallback((users) => {
    setActiveUsers(users || []);
  }, []);

  return (
    <div>
      <p>{activeUsers.length} users with active cursors</p>
      <main className="canvas">
        <VeltCursor onCursorUserChange={handleChange} />
      </main>
    </div>
  );
}
<velt-cursor></velt-cursor>

<script>
  const cursorElement = document.querySelector("velt-cursor");
  cursorElement.addEventListener("onCursorUserChange", (event) => {
    const users = event.detail;
    users.forEach((user) => {
      console.log(`${user.name} at (${user.x}, ${user.y})`);
    });
  });
</script>
```

**React: Update state from cursor changes**
**HTML: Event listener**

---

## 5. UI Wireframes

**Impact: MEDIUM**

Structural wireframe variants for the cursor pointer — Arrow, Avatar, Default, and Huddle (audio + video) — and the `<velt-cursor-pointer-wireframe>` child tag catalog (default, default-name, default-comment, avatar, audio-huddle, audio-huddle-avatar, audio-huddle-audio, video-huddle).

### 5.1 Customize Cursor Pointer with Wireframes

**Impact: MEDIUM (Build custom cursor visuals using VeltCursorPointerWireframe sub-components)**

Use `VeltCursorPointerWireframe` and its sub-components to customize the visual appearance of cursors. There are 5 variants: Arrow, Avatar, Default (Name/Comment), AudioHuddle, and VideoHuddle.

**Why this matters:**

```html
"use client";
import {
  VeltCursor,
  VeltCursorPointerWireframe,
} from "@veltdev/react";

function CustomCursor() {
  return (
    <>
      <VeltCursorPointerWireframe>
        <VeltCursorPointerWireframe.Arrow />
        <VeltCursorPointerWireframe.Avatar />
        <VeltCursorPointerWireframe.Default>
          <VeltCursorPointerWireframe.Default.Name />
          <VeltCursorPointerWireframe.Default.Comment />
        </VeltCursorPointerWireframe.Default>
        <VeltCursorPointerWireframe.AudioHuddle />
        <VeltCursorPointerWireframe.VideoHuddle />
      </VeltCursorPointerWireframe>
      <VeltCursor />
    </>
  );
}
"use client";
import { VeltCursor, VeltCursorPointerWireframe } from "@veltdev/react";

function MinimalCursor() {
  return (
    <>
      <VeltCursorPointerWireframe>
        <VeltCursorPointerWireframe.Arrow />
        <VeltCursorPointerWireframe.Default>
          <VeltCursorPointerWireframe.Default.Name />
        </VeltCursorPointerWireframe.Default>
      </VeltCursorPointerWireframe>
      <VeltCursor />
    </>
  );
}
<velt-cursor-pointer-wireframe>
  <velt-cursor-pointer-arrow-wireframe></velt-cursor-pointer-arrow-wireframe>
  <velt-cursor-pointer-avatar-wireframe></velt-cursor-pointer-avatar-wireframe>
  <velt-cursor-pointer-default-wireframe>
    <velt-cursor-pointer-default-name-wireframe></velt-cursor-pointer-default-name-wireframe>
    <velt-cursor-pointer-default-comment-wireframe></velt-cursor-pointer-default-comment-wireframe>
  </velt-cursor-pointer-default-wireframe>
  <velt-cursor-pointer-audio-huddle-wireframe></velt-cursor-pointer-audio-huddle-wireframe>
  <velt-cursor-pointer-video-huddle-wireframe></velt-cursor-pointer-video-huddle-wireframe>
</velt-cursor-pointer-wireframe>

<velt-cursor></velt-cursor>
```

**React: Minimal cursor (arrow + name only)**
**HTML: Wireframe equivalents**

**Styling wireframes:**

```jsx
<VeltCursor shadowDom={false} />
```

---

## 6. Wireframe Variables

**Impact: MEDIUM**

Template variables exposed inside the Cursors and Live Selection wireframe trees and consumed via `<velt-data field="componentConfig.<path>">`, `velt-if="{componentConfig.<path>}"`, and `velt-class="'cls': {componentConfig.<path>}"`. Both features use the **flat-config** access pattern — variables are addressed via the explicit `componentConfig.<path>` form (not short names). Covers root `<velt-cursor>` state (`user`, `cursorUsers`, `currentCursorUser`, `huddleOnCursorMode`, `huddleJoined`, `huddleOnCursorModeByAttendeeId`, `attendeesByUserId`, `remoteStreamsByUserId`, `localStream`, `isFirstComponent`), per-user `<velt-cursor-pointer-wireframe>` state (`cursorUser`, `selfCursorPointer`, `showDefault`, `showAvatar`, `showAudio`, `showVideo`, `stream`, `gainVolume`, `lightenedColor`, `variant`), the three cursor helper functions (`onImageLoadError`, `getGainAnimationBorderStyle`, `getTextColor`), root props (`darkMode`, `variant`), the deeply-nested `<velt-cursor-pointer-...-wireframe>` child tag catalog, and the `<velt-selection-element-portal-wireframe>` Live Selection slot (`position`, `userIndicatorPosition`, `userIndicatorType`, `overlayPosition`, `selections`) including the `UserIndicatorPosition` / `UserIndicatorType` enums and the `CursorPosition` / `Selection` data-model types.

### 6.1 Bind Cursors Wireframe Slots Using componentConfig Template Variables

**Impact: MEDIUM (Drives dynamic pointer content, conditional rendering, and class toggling inside Cursors wireframe slots without manual subscriptions)**

The Cursors wireframe exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Live Cursors uses the **flat-config** access pattern: variables are addressed via the explicit `componentConfig.<path>` form, **not** short names. The orchestrating `<velt-cursor>` element is not itself wireframed — only the per-user `<velt-cursor-pointer-wireframe>` is customizable, and its `componentConfig` is **per-user** (one instance per remote cursor).

Do not rebuild pointer state from `useCursorUsers` or use short-name variable lookups. The wireframe already supplies each pointer's data via `componentConfig.<path>`.

**Correct (read the per-user `componentConfig` via `VeltData` / `velt-if` / `velt-class`):**

```jsx
<VeltCursorPointerWireframe>
  <div className="my-cursor" style={{ background: '{componentConfig.cursorUser.color}' }}>
    <span className="my-cursor__name" style={{ color: '{componentConfig.getTextColor()}' }}>
      <VeltData field="componentConfig.cursorUser.name" />
    </span>
  </div>
</VeltCursorPointerWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-cursor-pointer-wireframe>
  <div class="my-cursor" [style.background]="'{componentConfig.cursorUser.color}'">
    <span class="my-cursor__name" [style.color]="'{componentConfig.getTextColor()}'">
      {{ '{componentConfig.cursorUser.name}' }}
    </span>
  </div>
</velt-cursor-pointer-wireframe>
```

| Variable | Type | Use |
|---|---|---|
| `componentConfig.user` | `User` | Currently identified end-user. |
| `componentConfig.cursorUsers` | `CursorUser[]` | Remote users — one entry per pointer. |
| `componentConfig.currentCursorUser` | `CursorUser` | The current iteration cursor user. |
| `componentConfig.huddleOnCursorMode` | `boolean` | Global huddle-on-cursor mode active. |
| `componentConfig.huddleJoined` | `boolean` | Local user has joined a huddle. |
| `componentConfig.huddleOnCursorModeByAttendeeId` | `Record<string, boolean>` | Per-attendee huddle flag. |
| `componentConfig.attendeesByUserId` | `Record<string, Attendee>` | Remote attendees keyed by user id. |
| `componentConfig.remoteStreamsByUserId` | `Record<string, Record<string, MediaStream>>` | Internal — not user-addressable. |
| `componentConfig.localStream` | `MediaStream \| undefined` | Local media stream when in a huddle. |
| `componentConfig.isFirstComponent` | `boolean` | True only on the first instance on the page. |
The pointer's `componentConfigSignal` is **per-user** — it carries data for one specific cursor.
| Variable | Type | Use |
|---|---|---|
| `componentConfig.cursorUser` | `CursorUser` | The user this pointer represents (`name`, `color`, `textColor`, `photoUrl`, `userId`). |
| `componentConfig.selfCursorPointer` | `boolean` | True when this pointer is the local user (production normally hides). |
| `componentConfig.showDefault` | `boolean` | Default arrow icon should render. |
| `componentConfig.showAvatar` | `boolean` | Avatar bubble should render. |
| `componentConfig.showAudio` | `boolean` | Audio indicator (huddle mode) should render. |
| `componentConfig.showVideo` | `boolean` | Video tile (huddle mode) should render. |
| `componentConfig.stream` | `MediaStream \| undefined` | Audio / video stream when available. |
| `componentConfig.gainVolume` | `number` | Audio gain for the animated speaking ring. |
| `componentConfig.lightenedColor` | `string` | Internal — used to compute inline ring style. |
| `componentConfig.variant` | `string` | Wireframe variant id. |
| Function | Returns | Use |
|---|---|---|
| `componentConfig.onImageLoadError()` | — | Call from your custom `<img onerror>` — falls back to initials avatar. |
| `componentConfig.getGainAnimationBorderStyle()` | `string` | Inline `border-color: ...` for the speaking-ring animation. |
| `componentConfig.getTextColor()` | `string` | Contrast-correct text colour for the user's name label. |
| React Prop | HTML Attribute | Type | Default | Use |
|---|---|---|---|---|
| `darkMode` | `dark-mode` | `boolean` | `false` | Force dark-mode rendering. |
| `variant` | `variant` | `string` | — | Wireframe variant id. |
The per-user `<velt-cursor-pointer-wireframe>` accepts no additional public props — its config is supplied by the cursor service for each remote user.
Each registered as `<velt-cursor-pointer-...-wireframe>` and resolves the per-user `componentConfig`:
| Tag | Notes |
|---|---|
| `<velt-cursor-pointer-arrow-wireframe>` | Arrow-icon part of the pointer. |
| `<velt-cursor-pointer-default-wireframe>` | Default (non-huddle) pointer surround. |
| `<velt-cursor-pointer-default-name-wireframe>` | Name pill on the default pointer. |
| `<velt-cursor-pointer-default-comment-wireframe>` | Inline comment label next to the pointer. |
| `<velt-cursor-pointer-avatar-wireframe>` | User avatar bubble. |
| `<velt-cursor-pointer-audio-huddle-wireframe>` | Audio-huddle pointer variant (speaking ring). |
| `<velt-cursor-pointer-audio-huddle-avatar-wireframe>` | Audio-huddle avatar. |
| `<velt-cursor-pointer-audio-huddle-audio-wireframe>` | Waveform / VU indicator. |
| `<velt-cursor-pointer-video-huddle-wireframe>` | Video-huddle pointer variant. |
**1. DO NOT drop the `componentConfig.` prefix.** Cursors is flat-config. `<velt-data field="cursorUser.name" />` resolves to nothing — use `<velt-data field="componentConfig.cursorUser.name" />`.
**2. DO NOT try to wireframe the root `<velt-cursor>`.** It has no `<velt-cursor-wireframe>` registration. Customize the per-user pointer via `<velt-cursor-pointer-wireframe>` instead.
**3. DO NOT mix root and per-user variables in the same slot.** Inside `<velt-cursor-pointer-wireframe>`, `componentConfig` is per-user — `componentConfig.cursorUsers` (root, plural) is not defined; use `componentConfig.cursorUser` (per-user, singular).
**4. DO NOT gate both default and huddle variants without checking `showDefault` / `showAudio` / `showVideo`.** These flags are mutually exclusive in practice; without them you render overlapping pointers.

---

## 7. Debugging

**Impact: LOW-MEDIUM**

Troubleshooting patterns for cursors that don't render, don't track the right element, or leak across documents.

### 7.1 Troubleshoot Common Cursor Issues

**Impact: LOW-MEDIUM (Quick fixes for frequent cursor problems)**

A checklist of frequent problems and their solutions when working with Velt Cursors.

**Issue 1: Cursors not showing**

Check the following in order:
- `VeltProvider` has valid `apiKey` and `authProvider` props
- `authProvider.getAuthToken` returns a valid JWT
- `useSetDocuments` is called with a document ID in a child of `VeltProvider`
- `VeltCursor` is rendered inside the component tree (within `VeltProvider`)
- For Next.js, ensure `'use client'` directive is present on cursor components
- Domain is safelisted in the Velt Console
- Test with two browser tabs using different users

**Issue 2: Cursors showing from other documents (cross-document leakage)**

- `setDocuments` is not called or is called with a stale document ID
- Ensure document ID updates on route changes
- Verify `useSetDocuments` waits for `useCurrentUser` to return a valid user before setting documents

**Issue 3: Cursors appearing in wrong areas (toolbar, sidebar)**

- Use `allowedElementIds` to restrict cursors to the collaborative content area
- Ensure the target element `id` attributes exist in the DOM
- Remember: the component prop takes a JSON string (`JSON.stringify([...])`) not a plain array

**Issue 4: Cursor disappears too quickly**

- Check `inactivityTime` setting (default is 300000ms / 5 minutes)
- Tab unfocus hides cursors immediately -- this is expected behavior
- Increase `inactivityTime` for document-style apps where users read more than they interact
- Example: `<VeltCursor inactivityTime={600000} />` for 10-minute timeout

**Issue 5: allowedElementIds not working**

- The component prop must receive a JSON string, not a JavaScript array
- Correct: `allowedElementIds={JSON.stringify(["canvas-id"])}`
- The API method accepts a regular array: `cursorElement.allowedElementIds(["canvas-id"])`
- Verify the element IDs match actual DOM `id` attributes (case-sensitive)
- Ensure the elements are rendered in the DOM before cursor initialization

**Debugging checklist:**

```typescript
1. VeltProvider renders with valid apiKey and authProvider
2. authProvider.getAuthToken returns a JWT
3. useSetDocuments called with document ID (in child component)
4. useCurrentUser returns a valid user before setDocuments
5. VeltCursor is rendered inside VeltProvider tree
6. 'use client' directive present (Next.js)
7. Domain safelisted in Velt Console
8. allowedElementIds uses JSON.stringify (if set)
9. Target element IDs exist in DOM
10. Tested with two browser tabs / different users
11. Check browser console for Velt SDK errors
```

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/realtime/cursors/overview
- https://docs.velt.dev/ui-customization/features/realtime/cursors
- https://docs.velt.dev/ui-customization/features/realtime/cursors-wireframe-variables
- https://docs.velt.dev/ui-customization/template-variables
- https://docs.velt.dev/ui-customization/features/realtime/live-selection-wireframe-variables
- https://console.velt.dev
