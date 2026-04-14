# Velt Cursors Best Practices

**Version 1.0.0**  
Velt  
April 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

> **IMPORTANT:** Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.

> **IMPORTANT:** VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook or `client.identify()`. Pattern: `<VeltProvider apiKey={KEY} authProvider={{ user: { userId, organizationId, name, email }, retryConfig: { retryCount: 3, retryDelay: 1000 }, generateToken: async () => { /* fetch from /api/velt/token */ } }}>`. See velt-setup-best-practices for details.

---

## Table of Contents

1. [Core Setup](#1-core-setup) -- **CRITICAL**
   - 1.1 [Use authProvider for Authentication](#11-use-authprovider-for-authentication)
   - 1.2 [Add VeltCursor Component](#12-add-veltcursor-component)
   - 1.3 [Scope Cursors with setDocuments](#13-scope-cursors-with-setdocuments)

2. [Data Access](#2-data-access) -- **HIGH**
   - 2.1 [Use React Hooks for Cursor Data](#21-use-react-hooks-for-cursor-data)
   - 2.2 [Use Vanilla JS API for Cursor Data](#22-use-vanilla-js-api-for-cursor-data)

3. [Configuration](#3-configuration) -- **HIGH-MEDIUM**
   - 3.1 [Restrict Cursor Display to Specific Elements](#31-restrict-cursor-display-to-specific-elements)
   - 3.2 [Show User Avatar Next to Cursor](#32-show-user-avatar-next-to-cursor)
   - 3.3 [Configure Inactivity Timeout](#33-configure-inactivity-timeout)

4. [Events](#4-events) -- **MEDIUM**
   - 4.1 [Subscribe to Cursor User Change Events](#41-subscribe-to-cursor-user-change-events)

5. [UI Customization](#5-ui-customization) -- **MEDIUM**
   - 5.1 [Customize Cursor Pointer with Wireframes](#51-customize-cursor-pointer-with-wireframes)

6. [Debugging](#6-debugging) -- **LOW-MEDIUM**
   - 6.1 [Troubleshoot Common Cursor Issues](#61-troubleshoot-common-cursor-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns required for any Velt cursor implementation. Without these, cursors will not function.

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

Alternatively, use `useVeltAuthProvider` in a child component for dynamic setup:

```jsx
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

**Verification:**
- `authProvider` prop is set on `VeltProvider`
- No imports of `useIdentify` anywhere in the codebase
- No calls to `client.identify()` anywhere in the codebase
- `getAuthToken` returns a valid JWT from your backend

---

### 1.2 Add VeltCursor Component

**Impact: CRITICAL (Core cursor rendering -- place in content area, not toolbar)**

`VeltCursor` enables real-time cursor tracking. Place it inside the collaborative content area where users interact spatially -- not in the toolbar (that is where `VeltPresence` goes). Works with default config (no props needed for basic usage). Best for canvas apps, whiteboards, design tools, ReactFlow diagrams.

```jsx
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
```

HTML equivalent:

```html
<header class="toolbar">
  <velt-presence></velt-presence>
</header>
<main class="canvas">
  <velt-cursor></velt-cursor>
</main>
```

**Placement guidelines:**
- `VeltCursor` goes in the content area (canvas, whiteboard, editor)
- `VeltPresence` goes in the toolbar or header
- No props required for basic usage
- Requires `VeltProvider` as ancestor and authenticated user

**Verification:**
- `VeltCursor` rendered inside the content area (not toolbar)
- `VeltPresence` in toolbar/header, separate from cursor area
- Multiple users see each other's cursors
- `'use client'` directive present in Next.js

---

### 1.3 Scope Cursors with setDocuments

**Impact: CRITICAL (Without this, cursors from ALL documents appear)**

You must call `setDocuments` to scope cursors to a specific document. Without it, cursors from every active user across your entire application will appear.

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
```

Full layout with document scoping:

```jsx
"use client";
import { VeltProvider, VeltCursor } from "@veltdev/react";

function App({ documentId, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <DocumentScope documentId={documentId} />
      <main className="canvas">
        <VeltCursor />
      </main>
    </VeltProvider>
  );
}
```

Vanilla JS:

```javascript
const client = await Velt.init("YOUR_API_KEY");
client.setDocuments([{ documentId: "canvas-42", metadata: {} }]);
```

**Important rules:**
- Call `useSetDocuments` in a child of `VeltProvider`, never the same component
- Wait for `useCurrentUser` before setting documents
- Update document ID on route changes

**Verification:**
- `useSetDocuments` called in child of `VeltProvider`
- Document ID set only after user is authenticated
- Cursors only show users on the same document

---

## 2. Data Access

**Impact: HIGH**

Patterns for accessing cursor user data in React and vanilla JS.

### 2.1 Use React Hooks for Cursor Data

**Impact: HIGH (Reactive cursor data without manual subscriptions)**

Use `useCursorUsers()` for online users with cursors and `useCursorUtils()` for programmatic control.

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
```

```jsx
"use client";
import { useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorController() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.enableAvatarMode();
      cursorElement.setInactivityTime(60000);
      cursorElement.allowedElementIds(["canvas"]);
    }
  }, [cursorElement]);

  return null;
}
```

**Key points:**
- `useCursorUsers()` returns `User[]` or `null` -- always null-check
- `useCursorUtils()` returns `CursorElement` for programmatic control
- Both require being inside a `VeltProvider` child
- Prefer hooks over `client.getCursorElement()` in React

---

### 2.2 Use Vanilla JS API for Cursor Data

**Impact: HIGH (Observable-based cursor data for non-React apps)**

Use `getCursorElement()` from the client and `getOnlineUsersOnCurrentDocument()` which returns an observable.

```javascript
const client = await Velt.init("YOUR_API_KEY");
const cursorElement = client.getCursorElement();

const subscription = cursorElement.getOnlineUsersOnCurrentDocument().subscribe((users) => {
  users.forEach((user) => {
    console.log(`${user.name} at (${user.x}, ${user.y})`);
  });
});

// IMPORTANT: Clean up to prevent memory leaks
subscription.unsubscribe();
```

Configuration via API:

```javascript
const cursorElement = client.getCursorElement();
cursorElement.allowedElementIds(["canvas-area"]);
cursorElement.enableAvatarMode();
cursorElement.setInactivityTime(60000);
```

**Key points:**
- `getOnlineUsersOnCurrentDocument()` returns `Observable<CursorUser[]>`
- Must call `.subscribe()` -- the observable is lazy
- Always `.unsubscribe()` on cleanup
- In React, prefer hooks instead

---

## 3. Configuration

**Impact: HIGH-MEDIUM**

Fine-tune cursor behavior for your specific use case.

### 3.1 Restrict Cursor Display to Specific Elements

**Impact: HIGH (Control which areas show cursors)**

Use `allowedElementIds` to limit cursors to specific DOM elements. Prevents cursors from appearing in toolbars or sidebars.

**GOTCHA: The component prop takes a JSON string, not a JavaScript array.**

```jsx
<VeltCursor allowedElementIds={JSON.stringify(["canvas-area"])} />
```

```html
<velt-cursor allowed-element-ids='["canvas-area"]'></velt-cursor>
```

API (accepts a regular array):

```javascript
const cursorElement = client.getCursorElement();
cursorElement.allowedElementIds(["canvas-area"]);
```

React hook pattern:

```jsx
"use client";
import { useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

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

**Key points:**
- Component prop: `JSON.stringify([...])` -- passing a plain array silently fails
- API method: accepts a regular JavaScript array
- Element IDs must match DOM `id` attributes (case-sensitive)
- Multiple IDs supported for multi-zone collaboration

**Verification:**
- `allowedElementIds` uses `JSON.stringify()` on the component
- Target element IDs exist in the DOM
- Cursors appear only in specified elements

---

### 3.2 Show User Avatar Next to Cursor

**Impact: MEDIUM (Visual identification with avatar instead of name label)**

```jsx
<VeltCursor avatarMode={true} />
```

```html
<velt-cursor avatar-mode="true"></velt-cursor>
```

API:

```javascript
cursorElement.enableAvatarMode();
// To disable: cursorElement.disableAvatarMode();
```

Compact circular avatar replaces the name label. Falls back to initials if no avatar is set.

---

### 3.3 Configure Inactivity Timeout

**Impact: MEDIUM (Default 300000ms / 5 minutes. Tab unfocus = immediate hide.)**

```jsx
<VeltCursor inactivityTime={300000} />
```

```html
<velt-cursor inactivity-time="300000"></velt-cursor>
```

API:

```javascript
cursorElement.setInactivityTime(60000); // 1 minute for fast-paced apps
```

**Guidelines:**
- 30000-60000ms: Fast-paced canvas/whiteboard collaboration
- 300000ms (default): Standard document editing
- Tab unfocus hides cursor immediately regardless of this setting
- Value is in milliseconds

---

## 4. Events

**Impact: MEDIUM**

React to cursor changes for custom functionality.

### 4.1 Subscribe to Cursor User Change Events

**Impact: MEDIUM (Build features on top of cursor data)**

React callback:

```jsx
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
```

HTML event listener:

```html
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

**Key points:**
- Receives `CursorUser[]` with `userId`, `name`, `x`, `y`, and metadata
- Fires on join, leave, move, and inactivity transitions
- Returns full array of current cursor users (not just the changed user)
- Wrap React handlers in `useCallback`

---

## 5. UI Customization

**Impact: MEDIUM**

Customize cursor appearance while preserving real-time sync.

### 5.1 Customize Cursor Pointer with Wireframes

**Impact: MEDIUM (Custom cursor visuals with 5 variants)**

Use `VeltCursorPointerWireframe` with sub-components for Arrow, Avatar, Default (Name/Comment), AudioHuddle, and VideoHuddle.

```jsx
"use client";
import { VeltCursor, VeltCursorPointerWireframe } from "@veltdev/react";

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
```

Minimal (arrow + name only):

```jsx
<VeltCursorPointerWireframe>
  <VeltCursorPointerWireframe.Arrow />
  <VeltCursorPointerWireframe.Default>
    <VeltCursorPointerWireframe.Default.Name />
  </VeltCursorPointerWireframe.Default>
</VeltCursorPointerWireframe>
<VeltCursor />
```

HTML equivalents:

```html
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

**Key points:**
- Wireframe must be alongside `VeltCursor` in the component tree
- Omit sub-components to hide them
- Set `shadowDom={false}` on `VeltCursor` to apply custom CSS to wireframe internals
- Use CSS for colors, sizes, spacing; wireframes control structure/layout

---

## 6. Debugging

**Impact: LOW-MEDIUM**

Common cursor problems and their solutions.

### 6.1 Troubleshoot Common Cursor Issues

**Issue 1: Cursors not showing**
- Check `VeltProvider` has valid `apiKey` and `authProvider`
- Check `useSetDocuments` is called with a document ID
- Verify `VeltCursor` is rendered inside `VeltProvider` tree
- For Next.js, ensure `'use client'` directive is present
- Domain safelisted in Velt Console

**Issue 2: Cursors showing from other documents**
- `setDocuments` not called or stale document ID
- Ensure document ID updates on route changes
- Verify `useSetDocuments` waits for `useCurrentUser`

**Issue 3: Cursors appearing in wrong areas**
- Use `allowedElementIds` to restrict to the canvas
- Ensure target element IDs exist in DOM

**Issue 4: Cursor disappears too quickly**
- Check `inactivityTime` (default 300000ms / 5 min)
- Tab unfocus hides immediately (expected)
- Increase for reading-heavy apps

**Issue 5: allowedElementIds not working**
- Component prop must be JSON string: `JSON.stringify(["id"])`
- API method accepts regular array: `cursorElement.allowedElementIds(["id"])`
- Element IDs are case-sensitive

**Debugging checklist:**
1. `VeltProvider` with valid `apiKey` and `authProvider`
2. `authProvider.getAuthToken` returns JWT
3. `useSetDocuments` called in child component with document ID
4. `useCurrentUser` returns valid user before `setDocuments`
5. `VeltCursor` rendered inside `VeltProvider` tree
6. `'use client'` directive present (Next.js)
7. Domain safelisted in Velt Console
8. `allowedElementIds` uses `JSON.stringify` (if set)
9. Target element IDs exist in DOM
10. Tested with two tabs / different users
11. Browser console checked for Velt SDK errors
