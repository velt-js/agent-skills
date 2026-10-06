# Velt Cursors Best Practices

**Version 1.1.2**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive guide for Velt's real-time cursor tracking feature — rendering collaborative cursor pointers showing where each remote user is on the page. Covers setup (VeltCursor mounted once at the app root and confined with allowedElementIds, authProvider over identify(), per-document scoping via setDocuments), configuration (allowed-elements whitelisting, avatar mode, inactivity timeout), data access (useCursorUsers / useCursorUtils hooks plus the getCursorElement Observable and getOnlineUsersOnCurrentDocument), cursor change events (onCursorUserChange), wireframe UI customization (Arrow / Avatar / Default / Huddle pointer variants), the flat-config template-variable surface on `<velt-cursor>` and per-user `<velt-cursor-pointer-wireframe>` (componentConfig.cursorUsers, componentConfig.showAvatar, componentConfig.showAudio, componentConfig.showVideo, componentConfig.selfCursorPointer, huddle-on-cursor flags, helper functions), and debugging cursors that don't appear or track incorrectly. All guidance is evidence-backed from official Velt documentation.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Add VeltCursor Once Near the App Root](#11-add-veltcursor-once-near-the-app-root)
   - 1.2 [Scope Cursors with setDocuments](#12-scope-cursors-with-setdocuments)
   - 1.3 [Use authProvider for Authentication](#13-use-authprovider-for-authentication)

2. [Data Access](#2-data-access) — **HIGH**
   - 2.1 [Use React Hooks for Cursor Data](#21-use-react-hooks-for-cursor-data)
   - 2.2 [Use the CursorElement API for Cursor Data](#22-use-the-cursorelement-api-for-cursor-data)

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
   - 6.2 [Bind Live Selection Wireframe Slots Using componentConfig Template Variables](#62-bind-live-selection-wireframe-slots-using-componentconfig-template-variables)

7. [Debugging](#7-debugging) — **LOW-MEDIUM**
   - 7.1 [Troubleshoot Common Cursor Issues](#71-troubleshoot-common-cursor-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup required for any Velt Cursors implementation. Use `authProvider` on `VeltProvider`, mount a single `<VeltCursor />` near the app root (confine it with `allowedElementIds`, not placement), include `'cursor'` in `featureAllowList` when set, and scope cursors per document via `setDocuments`. Get these wrong and no cursors render, or they show on the wrong document.

### 1.1 Add VeltCursor Once Near the App Root

**Impact: CRITICAL (VeltCursor is Velt-positioned and mount-once; extra instances are inert and placement does not confine cursors)**

`VeltCursor` renders the live cursors of other users on the same document and location. Add it once, at the root of your app inside `VeltProvider`. Velt positions every remote cursor as an overlay and adapts it to each viewer's screen size and content. To limit cursors to a region (a canvas, not the toolbar), use `allowedElementIds`, not placement.

**Why this matters:**

Only the first `velt-cursor` element in the DOM subscribes to the live-cursor stream; additional instances are inert. Mounting `VeltCursor` inside a container does not confine cursors to it.

**Incorrect (one cursor per container, expecting placement to scope cursors):**

```jsx
<aside className="toolbar"><VeltCursor /></aside>
<main className="canvas"><VeltCursor /></main>
{/* Second instance does nothing; cursors still show over the toolbar */}
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider, VeltCursor, VeltPresence } from "@veltdev/react";

export default function App({ authProvider, children }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltCursor allowedElementIds={JSON.stringify(["canvas"])} />
      <header className="toolbar">
        <VeltPresence />
      </header>
      <main id="canvas">{children}</main>
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```html
<body>
  <velt-cursor allowed-element-ids='["canvas"]'></velt-cursor>
  <header class="toolbar"><velt-presence></velt-presence></header>
  <main id="canvas"></main>
</body>
```

**Modular SDK (v6) note:**

If you pass `featureAllowList` in the init config, include `'cursor'`; otherwise `VeltCursor` can be suppressed. Calling `getCursorElement()` or `preloadCursor()` auto-enables an omitted feature, but listing it is the reliable fix.

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["cursor", "presence"] }}>
  {/* ... */}
</VeltProvider>
```

**Placement guidelines:**

- Mount exactly one `VeltCursor`, near the root
- Use `allowedElementIds` to confine cursors to collaborative regions
- `VeltCursor` needs no props for basic usage
- Cursors require an identified (non-anonymous) user; your own cursor is not shown back to you
- Best for canvas apps, whiteboards, design tools, and ReactFlow diagrams; text editors use CRDT carets instead

**Verification:**
- [ ] Exactly one `VeltCursor` / `<velt-cursor>` is mounted, inside `VeltProvider`
- [ ] `allowedElementIds` (stringified on the component) is set when cursors should stay in one region
- [ ] `featureAllowList`, if set, includes `'cursor'`
- [ ] Two different users on the same document see each other's cursors
- [ ] `'use client'` directive is present in Next.js components

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#allowedelementids - "allowedElementIds"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "VeltCursor" (positioning, mount-once)
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`

---

### 1.2 Scope Cursors with setDocuments

**Impact: CRITICAL (Without a document set after login, cursors has no document to attach to and users on different pages are not separated)**

Call `setDocuments` (React: the `setDocuments` function returned by `useSetDocuments()`) after the user is authenticated, and update it whenever the user navigates to a different document. Cursors is scoped to the current document, so users viewing "Canvas A" never see cursors of users "Canvas B".

**Why this matters:**

You can subscribe to up to 30 documents at once, but realtime features like cursors default to the **root document** (the first entry, or `rootDocumentId` in options). Pass the document the user is actually viewing first, or set `rootDocumentId`.

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
  { id: "canvas-a", metadata: { documentName: "Canvas A" } },
]);
```

**Common mistakes to avoid:**

- Calling `useSetDocuments` in the same component that renders `VeltProvider` (the hook needs the provider as a parent)
- Using `documentId` as the key inside the document object (the key is `id`)
- Setting the document before the user is authenticated
- Forgetting to update the document on route changes, which leaves cursors attached to the previous document
- Passing several documents and expecting cursors to span all of them (it uses the root document only)

**Verification:**
- [ ] `setDocuments` is called from a child component of `VeltProvider` (or via `Velt.setDocuments`)
- [ ] Document objects use `{ id, metadata }`
- [ ] The document is set only after `useCurrentUser()` returns a user
- [ ] The document updates when the user navigates
- [ ] With multiple documents, the one the user is viewing is the root document

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#subscribe-to-documents - "Subscribe to Documents"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesetdocuments - `useSetDocuments()`
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"

---

### 1.3 Use authProvider for Authentication

**Impact: CRITICAL (authProvider is the recommended authentication path and the only one with automatic token refresh)**

Authenticate users with the `authProvider` prop on `VeltProvider` (React) or `Velt.setVeltAuthProvider()` (other frameworks). Velt calls your `generateToken` function whenever a token is needed, including on expiry, so the session refreshes itself. The `identify()` method and `useIdentify()` hook still exist, but they require you to refresh tokens yourself; avoid them in new code.

**Why this matters:**

Cursors only works for an authenticated user. With `identify()` and no manual refresh, remote cursors stop rendering when the session expires; cursors never render for unauthenticated users.

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

## 2. Data Access

**Impact: HIGH**

Patterns for reading cursor state. Includes the React hooks `useCursorUsers` and `useCursorUtils`, plus `getCursorElement()` and `getOnlineUsersOnCurrentDocument()` outside React. Positions live in `CursorUser.position` (`top` / `left`).

### 2.1 Use React Hooks for Cursor Data

**Impact: HIGH (Access cursor user data and programmatic control via React hooks)**

Use `useCursorUsers()` to get online users with cursors (the hook form of `getOnlineUsersOnCurrentDocument()`), and `useCursorUtils()` to get the `CursorElement` for programmatic configuration.

**Why this matters:**

Hooks manage the subscription for you. Read positions from `user.position` (`top` / `left`), and configure behavior only through documented methods (`setInactivityTime`, `allowedElementIds`).

**Incorrect (invented fields and methods):**

```jsx
const cursorUsers = useCursorUsers();
const cursorElement = useCursorUtils();
cursorElement?.enableAvatarMode(); // not documented; use <VeltCursor avatarMode={true} />
cursorUsers?.map((u) => `${u.x},${u.y}`); // no x / y fields
```

**Correct (useCursorUsers):**

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
          {user.name}: top {user.position?.top}, left {user.position?.left}
        </li>
      ))}
    </ul>
  );
}
```

**Correct (useCursorUtils):**

```jsx
"use client";
import { useEffect } from "react";
import { useCursorUtils } from "@veltdev/react";

function CursorController() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (!cursorElement) return;
    cursorElement.setInactivityTime(60000);
    cursorElement.allowedElementIds(["canvas"]); // plain array in the API
  }, [cursorElement]);

  return null;
}
```

**Key points:**

- `useCursorUsers()` returns the online users with cursors, or `null` before data loads
- `useCursorUtils()` returns the `CursorElement` (may be `null` initially)
- Both hooks must run inside a component rendered within `VeltProvider`
- Avatar mode is a component prop (`avatarMode`), not a hook or API call

**Verification:**
- [ ] Hooks are called inside a child of `VeltProvider`
- [ ] Null checks are in place for both hook return values
- [ ] Positions are read from `position.top` / `position.left`
- [ ] Only documented `CursorElement` methods are called

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usecursorusers - `useCursorUsers()`
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usecursorutils - `useCursorUtils()`
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior - "Customize Behavior"

---

### 2.2 Use the CursorElement API for Cursor Data

**Impact: HIGH (Access cursor data and control via getCursorElement and observables)**

Get the `CursorElement` with `client.getCursorElement()` (React) or `Velt.getCursorElement()` (other frameworks). `getOnlineUsersOnCurrentDocument()` returns an Observable of `CursorUser[]` for all online users (active or inactive) on the current document.

**Why this matters:**

Cursor coordinates live in `user.position` (`{ top, left }` in the viewer's screen space), not in `x` / `y` fields. The only documented configuration methods on `CursorElement` are `setInactivityTime()` and `allowedElementIds()`.

**Incorrect (invented fields and methods):**

```js
const cursorElement = Velt.getCursorElement();
cursorElement.enableAvatarMode(); // not a documented CursorElement method; use the avatarMode prop
cursorElement.getOnlineUsersOnCurrentDocument().subscribe((users) => {
  users.forEach((u) => console.log(u.x, u.y)); // undefined: there is no x / y
});
```

**Correct:**

```js
const cursorElement = Velt.getCursorElement();

// Configuration
cursorElement.allowedElementIds(["canvas-area"]); // plain array in the API
cursorElement.setInactivityTime(60000); // milliseconds

// Data
const subscription = cursorElement.getOnlineUsersOnCurrentDocument().subscribe((cursorUsers) => {
  (cursorUsers || []).forEach((user) => {
    const { top, left } = user.position || {};
    console.log(`${user.name} (${user.onlineStatus}) at top=${top}, left=${left}`);
  });
});

// On page unload / component destroy
subscription?.unsubscribe();
```

**`CursorUser` fields you will use:**

| Field | Notes |
|---|---|
| `userId`, `name`, `email`, `photoUrl` | Identity |
| `color` | Session color used on the cursor and avatar border |
| `onlineStatus` | `active`, `inactive`, or `offline` |
| `position` | `CursorPosition`: `top`, `left`, optional `parentScaleX`, `parentScaleY`, `transformContext` |
| `location`, `locationId` | Location within the document |

**Key points:**

- The Observable emits `CursorUser[] | null`; guard against `null`
- `getLiveCursorsOnCurrentDocument()` is deprecated; use `getOnlineUsersOnCurrentDocument()`
- Always `.unsubscribe()` on cleanup
- In React, prefer `useCursorUsers()` and `useCursorUtils()`

**Verification:**
- [ ] `getCursorElement()` is called after Velt is initialized
- [ ] Positions are read from `user.position.top` / `user.position.left`
- [ ] Only documented methods are called (`setInactivityTime`, `allowedElementIds`, `getOnlineUsersOnCurrentDocument`)
- [ ] `.unsubscribe()` is called on cleanup

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#getonlineusersoncurrentdocument - "getOnlineUsersOnCurrentDocument"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#cursors - "Cursors" API methods
- https://docs.velt.dev/api-reference/sdk/models/data-models#cursoruser - `CursorUser`
- https://docs.velt.dev/api-reference/sdk/models/data-models#cursorposition - `CursorPosition`

---

## 3. Configuration

**Impact: HIGH-MEDIUM**

Behavior toggles for the cursor pointer. Restrict cursor visibility to specific DOM elements (`allowedElementIds`), switch between the default name-label pointer and avatar mode (`avatarMode` prop), and set the inactivity timeout that hides idle remote cursors explicitly.

### 3.1 Configure Cursor Inactivity Timeout

**Impact: MEDIUM (Control how long idle cursors stay visible; set it explicitly because the docs list two different defaults)**

`inactivityTime` (milliseconds) controls how long a remote user's cursor stays visible after their last movement; after that the cursor is hidden. A user who unfocuses their tab is marked inactive immediately.

**Why this matters:**

Stale cursors mislead collaborators into thinking someone is still working in an area. The cursors feature page states a 5-minute default, while the API and component references list a 2-minute service baseline. Set the value explicitly so behavior does not depend on which default applies.

**Incorrect (relying on the default, or passing minutes):**

```jsx
<VeltCursor />                 {/* default differs between doc pages */}
<VeltCursor inactivityTime={5} /> {/* 5 ms, not 5 minutes */}
```

**Correct (React / Next.js):**

```jsx
<VeltCursor inactivityTime={60000} /> {/* 1 minute, good for whiteboards */}

// Or via API
const cursorElement = client.getCursorElement();
cursorElement.setInactivityTime(60000);
```

**Correct (Other Frameworks):**

```html
<velt-cursor inactivity-time="300000"></velt-cursor>
```

```javascript
const cursorElement = Velt.getCursorElement();
cursorElement.setInactivityTime(300000);
```

**Key points:**

- Value is in milliseconds; non-numeric values are rejected
- Lower values (30000 to 60000) suit fast-paced canvas collaboration
- Higher values (300000+) suit document-style apps where users read more than they move
- Tab unfocus marks the user inactive immediately, regardless of `inactivityTime`

**Verification:**
- [ ] `inactivityTime` is set explicitly, in milliseconds
- [ ] Idle cursors disappear after the configured duration
- [ ] Active cursors remain visible during interaction

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#setinactivitytime - "setInactivityTime"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `inactivityTime` (cursor service baseline)
- https://docs.velt.dev/ui-customization/reference/apis - `CursorElement.setInactivityTime`

---

### 3.2 Restrict Cursor Display to Specific DOM Elements

**Impact: HIGH (Control which areas show cursors using allowedElementIds)**

Use `allowedElementIds` to limit cursor display to specific DOM elements. This prevents cursors from appearing in toolbars, sidebars, or other non-collaborative areas.

**Why this matters:**

By default, cursors appear everywhere within the document scope. In apps with toolbars, sidebars, and panels alongside a canvas, you want cursors only on the collaborative surface. Without restriction, cursor movement in the toolbar creates visual noise and confusion.

**GOTCHA: allowedElementIds takes a JSON string, not an array.**

The documented contract for the component prop is a stringified JSON array (`JSON.stringify([...])`). The API method takes a plain array.

**Incorrect (plain array on the component):**

```jsx
<VeltCursor allowedElementIds={["canvas-area"]} />
```

**Correct (React: stringified array on the single root VeltCursor):**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasWithCursors() {
  return (
    <>
      <VeltCursor allowedElementIds={JSON.stringify(["canvas-area"])} />
      <div id="toolbar">{/* No cursors here */}</div>
      <div id="canvas-area">{/* Cursors only appear while hovering this element */}</div>
    </>
  );
}
```

**React: Multiple allowed elements**

```jsx
<VeltCursor allowedElementIds={JSON.stringify(["canvas-area", "sidebar-panel"])} />
```

**HTML: Restrict cursors**

```html
<velt-cursor allowed-element-ids='["canvas-area"]'></velt-cursor>
```

**API: Programmatic configuration**

```jsx
"use client";
import { useEffect } from "react";
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

**Other Frameworks:**

```javascript
const cursorElement = Velt.getCursorElement();
cursorElement.allowedElementIds(["canvas-area"]);
```

**Key points:**

- The component prop takes `JSON.stringify([...])` (the documented contract)
- When unset or empty, cursors render anywhere on the page
- The API method accepts a regular JavaScript array
- Element IDs must match actual DOM element `id` attributes
- Multiple IDs can be specified to allow cursors in several areas
- Use this when your app has distinct collaborative vs. non-collaborative zones

**Verification:**
- [ ] `allowedElementIds` is passed as `JSON.stringify([...])` on the component (not a plain array)
- [ ] Target element IDs exist in the DOM
- [ ] Cursors appear only within the specified elements
- [ ] Cursors do not appear in toolbar, sidebar, or other excluded areas
- [ ] Tested with multiple users to confirm restriction works for all cursors

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#allowedelementids - "allowedElementIds"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `allowedElementIds` behavior

---

### 3.3 Show User Avatar Next to Cursor

**Impact: MEDIUM (Display user avatar floating beside cursor instead of name label)**

Use `avatarMode` to show a user's avatar image floating next to their cursor instead of the default name label. This provides a more visual and compact way to identify collaborators.

**Why this matters:**

In dense collaborative environments with many users, name labels can overlap and clutter the canvas. Avatar mode provides a compact circular image that is easier to scan visually, especially when users have profile photos set up.

**Incorrect (calling undocumented API methods):**

```javascript
// enableAvatarMode() / disableAvatarMode() are not documented CursorElement methods
Velt.getCursorElement().enableAvatarMode();
```

**Correct (React):**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasWithAvatarCursors() {
  return (
    <>
      <VeltCursor avatarMode={true} /> {/* single root-level instance */}
      <main className="canvas">{/* Canvas content */}</main>
    </>
  );
}
```

**Correct (Other Frameworks):**

```html
<velt-cursor avatar-mode="true"></velt-cursor>
```

**Key points:**

- Avatar mode replaces the default name label with the user's profile image
- Default is `false` (name label)
- If the avatar image fails to load, the cursor falls back to an initials avatar
- Can be combined with other cursor props like `allowedElementIds`
- Avatar mode is cosmetic; it does not change which cursors show or where
- Configure it with the `avatarMode` prop / `avatar-mode` attribute (no documented API method)

**Verification:**
- [ ] `avatarMode={true}` is set on `VeltCursor`
- [ ] User avatars display correctly next to cursors
- [ ] Users without avatars show a reasonable fallback
- [ ] Avatar does not overlap or obscure content

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#avatarmode - "avatarMode"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `avatarMode` default

---

## 4. Events

**Impact: MEDIUM**

Subscription patterns for cursor position and user changes. Covers `onCursorUserChange` (not the deprecated `onCursorUsersChanged`) on the component and the `onCursorUserChange` DOM event.

### 4.1 Subscribe to Cursor User Change Events

**Impact: MEDIUM (React to cursor user changes via callback props or event listeners)**

Use `onCursorUserChange` to react when the list of users with active cursors changes. This fires when users join, leave, move, or go inactive.

**Why this matters:**

Cursor change events let you build features on top of cursor data: activity logs, user following, cursor-aware layouts, or custom presence indicators tied to cursor movement rather than just document presence.

**Incorrect (deprecated alias and nonexistent coordinates):**

```jsx
<VeltCursor onCursorUsersChanged={(users) => users.map((u) => [u.x, u.y])} />
```

**Correct (React: onCursorUserChange callback):**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";
import { useCallback } from "react";

function CursorTracker() {
  const handleCursorChange = useCallback((users) => {
    // users is CursorUser[] with position and user data
    console.log("Active cursor users:", users.length);
    users.forEach((user) => {
      console.log(`${user.name} at (${user.position?.left}, ${user.position?.top})`);
    });
  }, []);

  // Single root-level VeltCursor; only the first instance emits this callback
  return <VeltCursor onCursorUserChange={(users) => handleCursorChange(users)} />;
}
```

**React: Update state from cursor changes**

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
      <VeltCursor onCursorUserChange={handleChange} />
    </div>
  );
}
```

**HTML: Event listener**

```html
<velt-cursor></velt-cursor>

<script>
  const cursorTag = document.querySelector("velt-cursor");
  cursorTag.addEventListener("onCursorUserChange", (event) => {
    const users = event.detail;
    users.forEach((user) => {
      console.log(`${user.name} at (${user.position?.left}, ${user.position?.top})`);
    });
  });
</script>
```

**Key points:**

- The callback receives `CursorUser[]`; coordinates are in `position.top` / `position.left`
- `onCursorUsersChanged` is a deprecated alias that fires at the same time; use `onCursorUserChange`
- Only the first (subscribing) `VeltCursor` instance emits this event
- Fires on: user joins document, user leaves, cursor moves, user goes inactive
- In React, wrap handlers in `useCallback` to avoid unnecessary re-renders
- In HTML, use `addEventListener` on the `velt-cursor` element
- Event detail contains the full array of current cursor users (not just the changed user)

**Verification:**
- [ ] `onCursorUserChange` callback is set on `VeltCursor`
- [ ] Callback fires when users join or leave the document
- [ ] Callback reads `position.top` / `position.left`, not `x` / `y`
- [ ] `onCursorUserChange` is used, not the deprecated `onCursorUsersChanged`
- [ ] No stale closures in React (handler wrapped in `useCallback`)
- [ ] HTML event listener is cleaned up on page unload if needed

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#oncursoruserchange - "onCursorUserChange"
- https://docs.velt.dev/api-reference/sdk/models/data-models#cursoruser - `CursorUser`
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - deprecated `onCursorUsersChanged` alias

---

## 5. UI Wireframes

**Impact: MEDIUM**

Structural wireframe variants for the cursor pointer (Arrow, Avatar, Default, and Huddle audio + video) inside `VeltWireframe`, and the `<velt-cursor-pointer-wireframe>` child tag catalog (default, default-name, default-comment, avatar, audio-huddle, audio-huddle-avatar, audio-huddle-audio, video-huddle).

### 5.1 Customize Cursor Pointer with Wireframes

**Impact: MEDIUM (Build custom cursor visuals using VeltCursorPointerWireframe sub-components)**

Use `VeltCursorPointerWireframe` and its sub-components to customize each remote cursor. There are five variants: Arrow, Avatar, Default (Name, Comment), AudioHuddle (Avatar, Audio), and VideoHuddle. Wrap wireframes in `VeltWireframe` (React) or `<velt-wireframe style="display:none;">` (HTML).

**Why this matters:**

Only the per-user pointer is wireframable; the root `<velt-cursor>` is not. `VeltCursor` has no `shadowDom` prop (its shadow DOM is always on), so style it through wireframes and CSS variables, not deep selectors.

**Incorrect (no wrapper, shadowDom prop on VeltCursor):**

```jsx
<VeltCursorPointerWireframe>
  <VeltCursorPointerWireframe.Arrow />
</VeltCursorPointerWireframe>
<VeltCursor shadowDom={false} /> {/* no such prop on VeltCursor */}
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltWireframe, VeltCursorPointerWireframe } from "@veltdev/react";

function CursorWireframes() {
  return (
    <VeltWireframe>
      <VeltCursorPointerWireframe>
        <VeltCursorPointerWireframe.Arrow />
        <VeltCursorPointerWireframe.Avatar />
        <VeltCursorPointerWireframe.Default>
          <VeltCursorPointerWireframe.Default.Name />
          <VeltCursorPointerWireframe.Default.Comment />
        </VeltCursorPointerWireframe.Default>
        <VeltCursorPointerWireframe.AudioHuddle>
          <VeltCursorPointerWireframe.AudioHuddle.Avatar />
          <VeltCursorPointerWireframe.AudioHuddle.Audio />
        </VeltCursorPointerWireframe.AudioHuddle>
        <VeltCursorPointerWireframe.VideoHuddle />
      </VeltCursorPointerWireframe>
    </VeltWireframe>
  );
}

// Render <CursorWireframes /> once inside VeltProvider alongside a single <VeltCursor />.
```

**Correct (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <velt-cursor-pointer-wireframe>
    <velt-cursor-pointer-arrow-wireframe></velt-cursor-pointer-arrow-wireframe>
    <velt-cursor-pointer-avatar-wireframe></velt-cursor-pointer-avatar-wireframe>
    <velt-cursor-pointer-default-wireframe>
      <velt-cursor-pointer-default-name-wireframe></velt-cursor-pointer-default-name-wireframe>
      <velt-cursor-pointer-default-comment-wireframe></velt-cursor-pointer-default-comment-wireframe>
    </velt-cursor-pointer-default-wireframe>
    <velt-cursor-pointer-audio-huddle-wireframe>
      <velt-cursor-pointer-audio-huddle-avatar-wireframe></velt-cursor-pointer-audio-huddle-avatar-wireframe>
      <velt-cursor-pointer-audio-huddle-audio-wireframe></velt-cursor-pointer-audio-huddle-audio-wireframe>
    </velt-cursor-pointer-audio-huddle-wireframe>
    <velt-cursor-pointer-video-huddle-wireframe></velt-cursor-pointer-video-huddle-wireframe>
  </velt-cursor-pointer-wireframe>
</velt-wireframe>

<velt-cursor></velt-cursor>
```

**Wireframe variants:**

- **Arrow**: the pointer glyph (use this to change the cursor icon)
- **Avatar**: avatar bubble next to the cursor (avatar mode)
- **Default**: container for the name label (**Name**) and an inline comment label (**Comment**)
- **AudioHuddle**: audio-huddle pointer with **Avatar** and **Audio** (speaking indicator)
- **VideoHuddle**: video-huddle pointer with a live video tile

**Limitations:**

- There is no live-cursor image prop; `pin-cursor-image` belongs to `VeltComments` (comment placement), not live cursors
- The root `<velt-cursor>` has no wireframe; only the per-user pointer does
- Your own cursor is hidden in normal use; `selfCursorPointer` renders only in huddle-on-cursor mode
- Requires an identified (non-anonymous) user

**Verification:**
- [ ] Wireframes are inside `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] Sub-components are nested as documented (e.g. `Default.Name` inside `Default`)
- [ ] No `shadowDom` prop is passed to `VeltCursor`
- [ ] Custom cursor renders with real-time positioning for a second user

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/cursors - "VeltCursorPointerWireframe", "Limitations"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "VeltCursor" (always shadow-DOM isolated)
- https://docs.velt.dev/ui-customization/overview - "UI Customization Concepts"

---

## 6. Wireframe Variables

**Impact: MEDIUM**

Template variables exposed inside the Cursors and Live Selection wireframe trees and consumed via `<velt-data field="componentConfig.<path>">`, `velt-if="{componentConfig.<path>}"`, and `velt-class="'cls': {componentConfig.<path>}"`. Both features use the **flat-config** access pattern — variables are addressed via the explicit `componentConfig.<path>` form (not short names). Covers root `<velt-cursor>` state (`user`, `cursorUsers`, `currentCursorUser`, `huddleOnCursorMode`, `huddleJoined`, `huddleOnCursorModeByAttendeeId`, `attendeesByUserId`, `remoteStreamsByUserId`, `localStream`, `isFirstComponent`), per-user `<velt-cursor-pointer-wireframe>` state (`cursorUser`, `selfCursorPointer`, `showDefault`, `showAvatar`, `showAudio`, `showVideo`, `stream`, `gainVolume`, `lightenedColor`, `variant`), the three cursor helper functions (`onImageLoadError`, `getGainAnimationBorderStyle`, `getTextColor`), root props (`darkMode`, `variant`), the deeply-nested `<velt-cursor-pointer-...-wireframe>` child tag catalog, and the `<velt-selection-element-portal-wireframe>` Live Selection slot (`position`, `userIndicatorPosition`, `userIndicatorType`, `overlayPosition`, `selections`) including the `UserIndicatorPosition` / `UserIndicatorType` enums and the `CursorPosition` / `Selection` data-model types.

### 6.1 Bind Cursors Wireframe Slots Using componentConfig Template Variables

**Impact: MEDIUM (Drives dynamic pointer content, conditional rendering, and class toggling inside Cursors wireframe slots without manual subscriptions)**

The Cursors wireframe exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Live Cursors uses the **flat-config** access pattern: variables are addressed via the explicit `componentConfig.<path>` form, **not** short names. The orchestrating `<velt-cursor>` element is not itself wireframed — only the per-user `<velt-cursor-pointer-wireframe>` is customizable, and its `componentConfig` is **per-user** (one instance per remote cursor).

Do not rebuild pointer state from `useCursorUsers` or use short-name variable lookups. The wireframe already supplies each pointer's data via `componentConfig.<path>`.

**Incorrect (short names and root variables inside the per-user pointer):**

```jsx
<VeltCursorPointerWireframe>
  <VeltData field="cursorUser.name" />            {/* missing componentConfig. prefix */}
  <VeltData field="componentConfig.cursorUsers" /> {/* root-only, undefined here */}
</VeltCursorPointerWireframe>
```

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

#### Root `<velt-cursor>` variables (full remote-cursor list + local user)

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

#### Per-user `<velt-cursor-pointer-wireframe>` variables

The pointer's `componentConfigSignal` is **per-user** — it carries data for one specific cursor.

| Variable | Type | Use |
|---|---|---|
| `componentConfig.cursorUser` | `CursorUser` | The user this pointer represents (`name`, `color`, `textColor`, `photoUrl`, `userId`). |
| `componentConfig.selfCursorPointer` | `boolean` | True when this pointer is the local user. Your own pointer renders only in huddle-on-cursor mode. |
| `componentConfig.showDefault` | `boolean` | Default arrow icon should render. |
| `componentConfig.showAvatar` | `boolean` | Avatar bubble should render. |
| `componentConfig.showAudio` | `boolean` | Audio indicator (huddle mode) should render. |
| `componentConfig.showVideo` | `boolean` | Video tile (huddle mode) should render. |
| `componentConfig.stream` | `MediaStream \| undefined` | Audio / video stream when available. |
| `componentConfig.gainVolume` | `number` | Audio gain for the animated speaking ring. |
| `componentConfig.lightenedColor` | `string` | Internal — used to compute inline ring style. |
| `componentConfig.variant` | `string` | Wireframe variant id. |

#### Helper functions (callable from wireframe markup)

| Function | Returns | Use |
|---|---|---|
| `componentConfig.onImageLoadError()` | — | Call from your custom `<img onerror>` — falls back to initials avatar. |
| `componentConfig.getGainAnimationBorderStyle()` | `string` | Inline `border-color: ...` for the speaking-ring animation. |
| `componentConfig.getTextColor()` | `string` | Contrast-correct text colour for the user's name label. |

#### Root props (`<velt-cursor>`)

| React Prop | HTML Attribute | Type | Default | Use |
|---|---|---|---|---|
| `darkMode` | `dark-mode` | `boolean` | `false` | Force dark-mode rendering. |
| `variant` | `variant` | `string` | — | Wireframe variant id. |

The per-user `<velt-cursor-pointer-wireframe>` accepts no additional public props — its config is supplied by the cursor service for each remote user.

#### Deeply-nested cursor-pointer child tags

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

#### Common mistakes — DO NOT

**1. DO NOT drop the `componentConfig.` prefix.** Cursors is flat-config. `<velt-data field="cursorUser.name" />` resolves to nothing — use `<velt-data field="componentConfig.cursorUser.name" />`.

**2. DO NOT try to wireframe the root `<velt-cursor>`.** It has no `<velt-cursor-wireframe>` registration. Customize the per-user pointer via `<velt-cursor-pointer-wireframe>` instead.

**3. DO NOT mix root and per-user variables in the same slot.** Inside `<velt-cursor-pointer-wireframe>`, `componentConfig` is per-user — `componentConfig.cursorUsers` (root, plural) is not defined; use `componentConfig.cursorUser` (per-user, singular).

**4. DO NOT gate both default and huddle variants without checking `showDefault` / `showAudio` / `showVideo`.** These flags are mutually exclusive in practice; without them you render overlapping pointers.

**Verification:**
- [ ] All variable references use the `componentConfig.<path>` form (flat-config), never short names
- [ ] Root variables (`componentConfig.cursorUsers`, `componentConfig.user`, huddle-mode flags) are read on `<velt-cursor>` host, not inside the per-user pointer
- [ ] Per-user variables (`componentConfig.cursorUser`, `componentConfig.selfCursorPointer`, `componentConfig.show*`) are read only inside `<velt-cursor-pointer-wireframe>` and its child tags
- [ ] Default vs. avatar vs. audio-huddle vs. video-huddle variants are gated by their respective `componentConfig.show*` flags
- [ ] Helper functions (`onImageLoadError`, `getGainAnimationBorderStyle`, `getTextColor`) are called as functions, not read as data

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/cursors-wireframe-variables — "Cursors Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- https://docs.velt.dev/ui-customization/features/realtime/cursors - "Limitations"

---

### 6.2 Bind Live Selection Wireframe Slots Using componentConfig Template Variables

**Impact: MEDIUM (Drives the remote-user selection indicator's dynamic content, conditional rendering, and class toggling without manual subscriptions)**

Document the Live Selection runtime model and CSS-based customization approach until wireframe-tag support ships.

**Important:** Live Selection does **not** currently expose a `<velt-...-wireframe>` tag. `velt-data` / `velt-if` / `velt-class` interpolation is not yet available on this feature. Until wireframe-tag registration ships, customize Live Selection through CSS targeting `<velt-selection-element-portal>`. The variables below document the runtime model for reference.

The **Live Selection** feature renders a floating "user X is selecting this" indicator anchored to a remote user's current selection range. Once wireframe-tag interpolation ships, Live Selection will use the **flat-config** access pattern — every variable addressed via the explicit `componentConfig.<path>` form, never short names.

- **Wireframe (HTML):** No direct wireframe slot — per-element visual customization is not currently exposed via a dedicated `*-wireframe` tag.
- **Wireframe (React):** No direct wireframe slot.

Use CSS to customize Live Selection appearance until wireframe-tag support ships. Disable the default styling and target the dynamic classes:

```js
const selectionElement = Velt.getSelectionElement(); // React: client.getSelectionElement()
selectionElement.disableDefaultStyling();
```

```css
/* Added to an element while a remote user is on it */
.velt-live-selection-on-element {
  outline: 2px solid var(--velt-color);
  outline-offset: -2px;
}
/* Added to a text node while a remote user has it selected */
.velt-live-selection-on-text {
  background: rgba(255, 200, 0, 0.3);
}
```

#### Runtime model variables (reference only, not bindable yet)

| Variable | Type | Use |
|---|---|---|
| `componentConfig.position` | `CursorPosition \| null` | Selection bounding-rect (`top`, `left`, `right`, `bottom`). Internal — used to compute inline style. |
| `componentConfig.userIndicatorPosition` | `UserIndicatorPosition` | Where the indicator is anchored relative to the selection range. |
| `componentConfig.userIndicatorType` | `UserIndicatorType` | What to render: `'avatar'` or `'label'`. |
| `componentConfig.overlayPosition` | `{ originX, originY, overlayX, overlayY }` | CDK overlay anchoring config. Internal. |
| `componentConfig.selections` | `Selection[]` | Active remote selections. Each entry has `user` plus selection-range data. |

#### Type Reference

Types referenced by the variables above (see [data-models.mdx](/api-reference/sdk/models/data-models)):

| Type | Shape | Notes |
|---|---|---|
| `UserIndicatorPosition` | `'start' \| 'end'` | Anchor edge of the indicator relative to the selection. Set globally with `setUserIndicatorPosition()`. |
| `UserIndicatorType` | `'avatar' \| 'label'` | What to show in the indicator. Set globally with `setUserIndicatorType()`. |
| `CursorPosition` | `{ top, left, ... }` | Selection position shape, shared with cursor positioning. |
| `Selection` | `{ user, type, targetElement, targetTextRange, pageInfo, timestamp }` | Remote-selection record. `type` is `'focus' \| 'click' \| 'selection'`. |
| `User` | See data-models | Identified end-user (used by `componentConfig.selections.<i>.user`). |

#### Subcomponent

| Tag | Public element | Notes |
|---|---|---|
| `<velt-selection-element-portal>` | `<velt-selection-element-portal>` | The floating user-indicator (avatar / name / colour bar). No direct `*-wireframe` tag currently registered. |

#### Common mistakes — DO NOT

**1. DO NOT use `<velt-selection-element-portal-wireframe>`.** No wireframe tag is registered for Live Selection. Attempting to use it will have no effect.

**2. DO NOT try to use `velt-data` / `velt-if` / `velt-class` on the selection indicator.** These directives require a registered wireframe tag to inject variables. Use CSS on `<velt-selection-element-portal>` instead.

**3. DO NOT drop the `componentConfig.` prefix** if/when wireframe tag support ships. Live Selection uses flat-config — once available, all variable reads will require the full path.

**Verification:**
- [ ] Live Selection appearance is customized through CSS (`.velt-live-selection-on-element`, `.velt-live-selection-on-text`) after `disableDefaultStyling()` when needed
- [ ] No `<velt-selection-element-portal-wireframe>` usage (tag not registered)
- [ ] `velt-data` / `velt-if` / `velt-class` are NOT used on this feature until wireframe-tag support is confirmed

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/live-selection-wireframe-variables — "Live Selection Wireframe Variables"
- https://docs.velt.dev/ui-customization/features/realtime/live-selection - "Enable/Disable Default Styling"
- https://docs.velt.dev/api-reference/sdk/models/data-models#userindicatortype - `UserIndicatorPosition`, `UserIndicatorType`, `CursorPosition`, `Selection`
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"

---

## 7. Debugging

**Impact: LOW-MEDIUM**

Troubleshooting patterns for cursors that don't render, don't track the right element, or leak across documents.

### 7.1 Troubleshoot Common Cursor Issues

**Impact: LOW-MEDIUM (Quick fixes for frequent cursor problems)**

A checklist of frequent problems and their solutions when working with Velt Cursors.

**Incorrect (common misconfigurations in one place):**

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["comment"] }}> {/* 'cursor' missing */}
  <section><VeltCursor allowedElementIds={["canvas"]} /></section>          {/* plain array */}
  <section><VeltCursor /></section>                                         {/* second instance is inert */}
</VeltProvider>
```

**Correct:**

```jsx
<VeltProvider apiKey="API_KEY" authProvider={authProvider} config={{ featureAllowList: ["comment", "cursor"] }}>
  <VeltCursor allowedElementIds={JSON.stringify(["canvas"])} inactivityTime={120000} />
  <DocumentScope /> {/* calls setDocuments after login */}
  <main id="canvas">{/* ... */}</main>
</VeltProvider>
```

**Issue 1: Cursors not showing**

- `VeltProvider` has a valid `apiKey` and `authProvider` (with `user` and `generateToken`)
- The user is identified; anonymous users don't get live cursors
- `setDocuments` is called after login, from a child of `VeltProvider`
- `featureAllowList`, if set, includes `'cursor'`
- Only one `VeltCursor` is mounted (extra instances are inert)
- Your own cursor is never rendered back to you; test with two browsers and two users
- Domain is safelisted in the Velt Console; Next.js files have `'use client'`

**Issue 2: Cursors from other documents**

- Update the document on every route change
- Cursors use the root document; with multiple documents, make the viewed one the root

**Issue 3: Cursors appear over toolbars or sidebars**

- Use `allowedElementIds` (component: `JSON.stringify([...])`; API: plain array)
- Check that the target `id` attributes exist in the DOM (case-sensitive)
- Moving `VeltCursor` into a container does not confine cursors

**Issue 4: Cursors disappear too quickly or linger**

- Set `inactivityTime` explicitly in milliseconds (doc pages list both 5-minute and 2-minute defaults)
- Tab unfocus marks the user inactive immediately; this is expected

**Issue 5: Cursors render behind other UI**

- Raise `--velt-cursor-z-index` (default `2147483647`) or lower the competing element's z-index

**Verification:**
- [ ] One `VeltCursor` inside `VeltProvider`, with valid auth
- [ ] `setDocuments` called after login and on navigation
- [ ] `featureAllowList` includes `'cursor'` when set
- [ ] `allowedElementIds` uses `JSON.stringify` on the component
- [ ] Tested with two browsers and two different users

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior - "Customize Behavior"
- https://docs.velt.dev/ui-customization/features/realtime/cursors - "Limitations"
- https://docs.velt.dev/ui-customization/reference/css-variables - "Z-index"
- https://docs.velt.dev/key-concepts/overview#subscribe-to-documents - "Subscribe to Documents"

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/realtime-collaboration/cursors/overview
- https://docs.velt.dev/ui-customization/features/realtime/cursors
- https://docs.velt.dev/ui-customization/features/realtime/cursors-wireframe-variables
- https://docs.velt.dev/ui-customization/template-variables
- https://docs.velt.dev/ui-customization/features/realtime/live-selection-wireframe-variables
- https://console.velt.dev
- https://docs.velt.dev/realtime-collaboration/cursors/setup
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions
- https://docs.velt.dev/ui-customization/features/realtime/live-selection
