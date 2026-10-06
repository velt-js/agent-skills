# Velt Presence Best Practices

**Version 1.2.1**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive Velt Presence implementation guide covering user-presence avatars, online/away/offline status, real-time cursor tracking, inactivity timeout configuration, location-based filtering, presence data subscriptions, and wireframe-variable customization. This skill provides evidence-backed patterns for integrating Velt Presence into React, Next.js, and other web applications. Covers VeltPresence, VeltCursor, authProvider-based identity, document scoping, presence hooks and vanilla-JS APIs, state-change events, and the VeltPresenceWireframe template-variable binding layer.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Add VeltPresence and VeltCursor Components](#11-add-veltpresence-and-veltcursor-components)
   - 1.2 [Scope Presence with setDocuments](#12-scope-presence-with-setdocuments)
   - 1.3 [Use authProvider for Authentication](#13-use-authprovider-for-authentication)

2. [Data Access](#2-data-access) — **HIGH**
   - 2.1 [Add AI Agents and Bots to Presence with addUser / removeUser](#21-add-ai-agents-and-bots-to-presence-with-adduser-removeuser)
   - 2.2 [Use React Hooks for Presence Data](#22-use-react-hooks-for-presence-data)
   - 2.3 [Use the PresenceElement API for Presence Data](#23-use-the-presenceelement-api-for-presence-data)

3. [Configuration](#3-configuration) — **HIGH-MEDIUM**
   - 3.1 [Configure Flock Mode (Follow Me) for Shared Navigation Sessions](#31-configure-flock-mode-follow-me-for-shared-navigation-sessions)
   - 3.2 [Configure Inactivity and Offline Timeouts](#32-configure-inactivity-and-offline-timeouts)
   - 3.3 [Control Avatar Overflow with maxUsers](#33-control-avatar-overflow-with-maxusers)
   - 3.4 [Control Current User Visibility in Presence](#34-control-current-user-visibility-in-presence)
   - 3.5 [Filter Presence by Location within a Document](#35-filter-presence-by-location-within-a-document)

4. [Cursor](#4-cursor) — **HIGH**
   - 4.1 [Set Up VeltCursor for Real-Time Cursor Tracking](#41-set-up-veltcursor-for-real-time-cursor-tracking)

5. [Events](#5-events) — **MEDIUM**
   - 5.1 [Subscribe to User State Change Events](#51-subscribe-to-user-state-change-events)

6. [UI Customization](#6-ui-customization) — **MEDIUM**
   - 6.1 [Customize Presence Avatar UI with Wireframes](#61-customize-presence-avatar-ui-with-wireframes)

7. [Wireframe Variables](#7-wireframe-variables) — **MEDIUM**
   - 7.1 [Bind Presence Wireframe Slots Using Template Variables](#71-bind-presence-wireframe-slots-using-template-variables)

8. [Debugging](#8-debugging) — **LOW-MEDIUM**
   - 8.1 [Troubleshoot Common Presence Issues](#81-troubleshoot-common-presence-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns for any Velt Presence implementation. Covers authProvider on VeltProvider (never identify()), adding the VeltPresence component, and establishing document context for presence scoping.

### 1.1 Add VeltPresence and VeltCursor Components

**Impact: CRITICAL (VeltPresence shows user avatars and VeltCursor enables cursor tracking)**

`VeltPresence` renders a row of avatars for users who are online on the same document. It needs no props for basic usage. It is statically placed: it renders exactly where you mount it, so put it in your toolbar or header.

`VeltCursor` is different: it is Velt-positioned. Mount it once near the app root and Velt paints every remote cursor as an overlay. See the `cursor-setup` rule.

**Why this matters:**

Without presence indicators, users cannot tell who else is active in the same document. This leads to conflicting edits and duplicated work.

**Incorrect (presence inside scrolling content, cursor mounted per section):**

```jsx
<main className="scroll-area">
  <VeltPresence /> {/* scrolls away with the content */}
  <section><VeltCursor /></section>
  <section><VeltCursor /></section> {/* only the first velt-cursor subscribes; the rest are inert */}
</main>
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider, VeltPresence, VeltCursor } from "@veltdev/react";

function App({ authProvider, children }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltCursor /> {/* once, near the root */}
      <header className="toolbar">
        <h1>Document Title</h1>
        <VeltPresence />
      </header>
      <main>{children}</main>
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```html
<body>
  <velt-cursor></velt-cursor>
  <div class="toolbar">
    <h1>Document Title</h1>
    <velt-presence></velt-presence>
  </div>
</body>
```

**Modular SDK (v6) note:**

If you pass `featureAllowList` in the init config, only the listed features are allowed to run and preload. Include `'presence'` (and `'cursor'` if you use `VeltCursor`); otherwise the components can be suppressed. Calling `getPresenceElement()` or `preloadPresence()` auto-enables an omitted feature, but listing it is the reliable fix.

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["presence", "cursor", "comment"] }}>
  {/* ... */}
</VeltProvider>
```

**Placement guidelines:**

- Place `VeltPresence` in the toolbar, header, or navigation bar, not inside scrollable content
- Mount `VeltCursor` once near the root; use `allowedElementIds` to confine cursors to a region
- Presence requires an identified (non-anonymous) user
- Test by opening the page in two browsers with two different users

**Verification:**
- [ ] `VeltPresence` is rendered inside `VeltProvider`
- [ ] Presence avatars appear in the toolbar or header area
- [ ] Two different users on the same document see each other's avatars
- [ ] `VeltCursor` is mounted once (if cursor tracking is needed)
- [ ] `featureAllowList`, if set, includes `'presence'` (and `'cursor'`)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/setup - "Presence Setup"
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "Presence, Cursors & Reactions" (positioning and mount-once behavior)
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`

---

### 1.2 Scope Presence with setDocuments

**Impact: CRITICAL (Without a document set after login, presence has no document to attach to and users on different pages are not separated)**

Call `setDocuments` (React: the `setDocuments` function returned by `useSetDocuments()`) after the user is authenticated, and update it whenever the user navigates to a different document. Presence is scoped to the current document, so users viewing "Invoice #42" never see avatars of users "Invoice #99".

**Why this matters:**

You can subscribe to up to 30 documents at once, but realtime features like presence default to the **root document** (the first entry, or `rootDocumentId` in options). Pass the document the user is actually viewing first, or set `rootDocumentId`.

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
  { id: "invoice-42", metadata: { documentName: "Invoice #42" } },
]);
```

**Common mistakes to avoid:**

- Calling `useSetDocuments` in the same component that renders `VeltProvider` (the hook needs the provider as a parent)
- Using `documentId` as the key inside the document object (the key is `id`)
- Setting the document before the user is authenticated
- Forgetting to update the document on route changes, which leaves presence attached to the previous document
- Passing several documents and expecting presence to span all of them (it uses the root document only)

**Verification:**
- [ ] `setDocuments` is called from a child component of `VeltProvider` (or via `Velt.setDocuments`)
- [ ] Document objects use `{ id, metadata }`
- [ ] The document is set only after `useCurrentUser()` returns a user
- [ ] The document updates when the user navigates
- [ ] With multiple documents, the one the user is viewing is the root document

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#subscribe-to-documents - "Subscribe to Documents"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesetdocuments - `useSetDocuments()`
- https://docs.velt.dev/realtime-collaboration/presence/setup - "Presence Setup"

---

### 1.3 Use authProvider for Authentication

**Impact: CRITICAL (authProvider is the recommended authentication path and the only one with automatic token refresh)**

Authenticate users with the `authProvider` prop on `VeltProvider` (React) or `Velt.setVeltAuthProvider()` (other frameworks). Velt calls your `generateToken` function whenever a token is needed, including on expiry, so the session refreshes itself. The `identify()` method and `useIdentify()` hook still exist, but they require you to refresh tokens yourself; avoid them in new code.

**Why this matters:**

Presence only works for an authenticated user. With `identify()` and no manual refresh, presence avatars disappear or show stale users when the session expires.

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

Patterns for reading and writing presence state. Covers React hooks (`usePresenceData`, `usePresenceEventCallback`, `usePresenceUtils`), the `PresenceElement` API (`getData` returning `GetPresenceDataResponse`, `on`), and custom participants via `addUser` / `removeUser` and the Presence REST APIs.

### 2.1 Add AI Agents and Bots to Presence with addUser / removeUser

**Impact: MEDIUM (Show non-human participants (AI agents, bots, system accounts) in the presence list without faking authenticated sessions)**

Use `presenceElement.addUser()` to show a custom participant, such as an AI agent working on the document, in the presence list. Remove it with `removeUser()` when the work ends. For server-driven agents, use the Presence REST APIs instead.

**Why this matters:**

Authenticating a second Velt session for a bot is wrong: it consumes a user, needs a token, and leaves stale presence when the process dies. `addUser` adds a presence record for the current document directly. `localOnly: true` keeps it on the current client only.

**Incorrect (opening a hidden session to impersonate the agent):**

```jsx
// Do not authenticate a fake user just to make an avatar appear
await client.identify({ userId: "ai-agent-1", name: "AI Assistant", organizationId: "org-1" });
```

**Correct (React / Next.js):**

```jsx
const presenceElement = client.getPresenceElement();

// Persisted for everyone on the current document
presenceElement.addUser({ user: { userId: "ai-agent-1", name: "AI Assistant" } });

// Visible only to the current user (not persisted)
presenceElement.addUser({ user: { userId: "local-bot", name: "Local Bot" }, localOnly: true });

// Remove when done; match the localOnly flag used when adding
presenceElement.removeUser({ user: { userId: "ai-agent-1" } });
presenceElement.removeUser({ user: { userId: "local-bot" }, localOnly: true });
```

**Correct (Other Frameworks):**

```js
const presenceElement = Velt.getPresenceElement();
presenceElement.addUser({ user: { userId: "ai-agent-1", name: "AI Assistant" } });
presenceElement.removeUser({ user: { userId: "ai-agent-1" } });
```

**Server side (Presence REST APIs):**

```bash
curl -X POST https://api.velt.dev/v2/presence/add \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"organizationId":"org-1","documentId":"doc-1","users":[{"userId":"ai-agent-1","name":"AI Editor","status":"online"}]}}'
```

Use `POST /v2/presence/update` to change name, email, or status and `POST /v2/presence/delete` to remove users.

**Key details:**

- Params: `{ user: Partial<PresenceUser>, localOnly?: boolean }`; `localOnly` defaults to `false`
- Returns `void`
- `PresenceUser.initial` (avatar initial) defaults to the first character of `name`, uppercased, for users added with `addUser`
- Custom users appear in `getData()` / `usePresenceData()` results and in the `VeltPresence` avatar row
- Always remove server-added users when the agent finishes, or they stay in the list

**Verification:**
- [ ] Custom participants use `addUser`, not a second authenticated session
- [ ] `removeUser` is called with the same `localOnly` value used in `addUser`
- [ ] Server-driven agents use the Presence REST APIs with `organizationId` and `documentId`
- [ ] Agents are removed (client or REST) when their work ends

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#adduser - "addUser()"
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#removeuser - "removeUser()"
- https://docs.velt.dev/api-reference/rest-apis/v2/presence/add-presence - "Add Presence"
- https://docs.velt.dev/api-reference/rest-apis/v2/presence/update-presence - "Update Presence"
- https://docs.velt.dev/api-reference/rest-apis/v2/presence/delete-presence - "Delete Presence"
- https://docs.velt.dev/api-reference/sdk/models/data-models#presenceuser - `PresenceUser`

---

### 2.2 Use React Hooks for Presence Data

**Impact: HIGH (React hooks provide the simplest way to subscribe to real-time presence data with automatic cleanup)**

Velt provides three presence hooks: `usePresenceData` (filtered presence users), `usePresenceEventCallback` (latest presence event), and `usePresenceUtils` (the `PresenceElement` for imperative calls). The hooks manage subscription cleanup for you.

**Why this matters:**

`usePresenceEventCallback` does **not** take a callback. It returns the latest event object, which you react to in `useEffect`. Passing a function as the second argument does nothing.

**Incorrect (callback-style usage):**

```jsx
// The second argument is ignored; nothing is logged
usePresenceEventCallback("userStateChange", (event) => {
  console.log(event.user.name, event.state);
});
```

**Correct (usePresenceEventCallback returns the event):**

```jsx
"use client";
import { useEffect } from "react";
import { usePresenceEventCallback } from "@veltdev/react";

function PresenceLogger() {
  const userStateChangeEvent = usePresenceEventCallback("userStateChange");

  useEffect(() => {
    if (!userStateChangeEvent) return;
    // { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    console.log(`${userStateChangeEvent.user.name} is now ${userStateChangeEvent.state}`);
  }, [userStateChangeEvent]);

  return null;
}
```

**Correct (usePresenceData returns `{ data: PresenceUser[] | null }`):**

```jsx
"use client";
import { usePresenceData } from "@veltdev/react";

function OnlineUsers() {
  const presenceData = usePresenceData({ statuses: ["online"] }); // omit the query for all users

  if (!presenceData?.data) return <div>Loading presence...</div>;

  return (
    <ul>
      {presenceData.data.map((user) => (
        <li key={user.userId}>
          <img src={user.photoUrl} alt={user.name} />
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

**Correct (usePresenceUtils for imperative calls):**

```jsx
"use client";
import { useEffect } from "react";
import { usePresenceUtils } from "@veltdev/react";

function PresenceController() {
  const presenceElement = usePresenceUtils();

  useEffect(() => {
    if (!presenceElement) return;
    presenceElement.setInactivityTime(60000);
  }, [presenceElement]);

  return null;
}
```

**Heartbeat (optional):** `useHeartbeat()` (API: `client.getHeartbeat()`) returns `{ data: Heartbeat[] | null }` for the current user, or for any user when you pass `{ userId }`. Use it to monitor active sessions.

**Key patterns:**

- `usePresenceData` returns `{ data }`; `data` is `null` while loading
- `usePresenceEventCallback(eventType)` returns the latest event; handle it in `useEffect`
- `usePresenceUtils()` may return `null` before init; guard it
- Hooks must run in a component rendered inside `VeltProvider`

#### Verification Checklist

- [ ] Component is inside `VeltProvider` with a valid `authProvider`
- [ ] `setDocuments` has been called to scope presence to a document
- [ ] Null check exists before reading `presenceData.data`
- [ ] `usePresenceEventCallback` is used with one argument and handled in `useEffect`
- [ ] Manual subscriptions made through `usePresenceUtils()` are cleaned up

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#getdata - "getData" (Using Hook)
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#on - "Event Subscription" (Using Hook)
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usepresenceeventcallback - `usePresenceEventCallback()`
- https://docs.velt.dev/realtime-collaboration/presence/overview#heartbeat-monitoring - "Heartbeat Monitoring"

---

### 2.3 Use the PresenceElement API for Presence Data

**Impact: HIGH (Observable-based API for presence data access in non-React or programmatic contexts)**

Get the `PresenceElement` with `client.getPresenceElement()` (React) or `Velt.getPresenceElement()` (other frameworks). `getData()` and `on()` return Observables: call `.subscribe()` and keep the subscription so you can `.unsubscribe()` on cleanup.

**Why this matters:**

`getData()` emits a `GetPresenceDataResponse` object, not an array. Treating the emission as `PresenceUser[]` is the most common bug: `response.map` throws and the UI never renders.

**Incorrect (treating the response as an array):**

```js
presenceElement.getData({ statuses: ["online"] }).subscribe((users) => {
  users.forEach((u) => console.log(u.name)); // TypeError: users.forEach is not a function
});
```

**Correct (read `response.data`, which is `PresenceUser[] | null`):**

```js
const presenceElement = Velt.getPresenceElement();

const subscription = presenceElement
  .getData({ statuses: ["online", "away"] })
  .subscribe((response) => {
    if (!response?.data) return; // null while loading
    renderAvatars(response.data);
  });

// On page unload / component destroy
subscription?.unsubscribe();
```

**Query options (`PresenceRequestQuery`, all optional):**

| Field | Type | Use |
|---|---|---|
| `statuses` | `string[]` | Filter by `'online'`, `'away'`, `'offline'` |
| `documentId` | `string` | Query a specific document instead of the current one |
| `organizationId` | `string` | Query a specific organization |

Call `getData()` with no query to get all users.

**Subscribe to state change events:**

```js
const subscription = Velt.getPresenceElement()
  .on("userStateChange")
  .subscribe((event) => {
    // PresenceUserStateChangeEvent: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    console.log(`${event.user.name} is now ${event.state}`);
  });

subscription?.unsubscribe();
```

**Callback alternative on the component:**

`onPresenceUserChange` fires with the filtered `PresenceUser[]` (after `location` / `locationId` filtering) on load and on every change. The older `onUsersChanged` is a deprecated alias.

```jsx
<VeltPresence onPresenceUserChange={(presenceUsers) => setUsers(presenceUsers)} />
```

**Key patterns:**

- `getData()` and `on()` return Observables; always `.subscribe()` and `.unsubscribe()`
- Read `response.data`; it is `null` while loading
- `getOnlineUsersOnCurrentDocument()` on the presence element is deprecated; use `getData()`
- In React, prefer `usePresenceData()` and `usePresenceEventCallback()` (see `data-presence-hooks`)

#### Verification Checklist

- [ ] Velt is initialized and the user is authenticated (`authProvider` / `setVeltAuthProvider`)
- [ ] `setDocuments` has been called to scope presence
- [ ] Subscribers read `response.data`, with a `null` check
- [ ] Every `.subscribe()` has a matching `.unsubscribe()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#getdata - "getData"
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#on - "Event Subscription"
- https://docs.velt.dev/api-reference/sdk/models/data-models#getpresencedataresponse - `GetPresenceDataResponse`
- https://docs.velt.dev/api-reference/sdk/models/data-models#presencerequestquery - `PresenceRequestQuery`
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `onPresenceUserChange` behavior

---

## 3. Configuration

**Impact: HIGH-MEDIUM**

Behavior knobs for the Presence component. Covers away/offline inactivity timeouts, avatar overflow (`maxUsers`), self-visibility (include/exclude current user), location-based filtering, and flock mode (follow me).

### 3.1 Configure Flock Mode (Follow Me) for Shared Navigation Sessions

**Impact: HIGH (Flock mode lets one user lead a shared navigation session where followers' screens mirror the leader's clicks, scrolls, and page navigations)**

Flock mode is Velt's "follow along" feature (similar to Figma's). One user is the leader, and whatever they do — clicking, scrolling, navigating — happens automatically on every follower's screen.

**How it works:**

Flock mode is an extension of VeltPresence. When enabled, clicking on a user's presence avatar starts a follow session with that user as the leader. All followers' viewports sync to the leader's actions until the session ends.

#### Enable Flock Mode

**React: Enable on VeltPresence**

```jsx
<VeltPresence flockMode={true} />
```

**API: Enable programmatically**

```jsx
const presenceElement = client.getPresenceElement();
presenceElement.enableFlockMode();
```

Once enabled, users click on any presence avatar to start following that user.

#### Programmatic Follow Control

Use `startFollowingUser()` and `stopFollowingUser()` when you need to trigger follow sessions from custom UI (buttons, menus) rather than avatar clicks.

```jsx
const presenceElement = client.getPresenceElement();

// Start following a specific user (the leader's userId)
presenceElement.startFollowingUser(userId);

// Stop following — removes current user from the session.
// If no followers remain, the session is destroyed.
presenceElement.stopFollowingUser();
```

The API reference also lists a second `name` argument (the leader's display name) for `startFollowingUser`; the feature page shows only `userId`.

`enableFlockMode()` accepts optional `FlockOptions` (`useHistoryAPI`, `onNavigate`, `disableDefaultNavigation`, `darkMode`) if you prefer configuring flock mode through the API instead of props.

#### Custom Navigation with onNavigate

**Incorrect (relying on default navigation in a SPA):**

Velt's default flock navigation uses `window.location.href`, which causes full page reloads in single-page apps. In React/Next.js apps with client-side routing, this breaks the SPA experience: state is lost, components remount, and transitions are jarring.

```jsx
// Followers hard-reload on every leader navigation
<VeltPresence flockMode={true} />
```

**Correct (use onNavigate callback with your router):**

```jsx
import { useNavigate } from 'react-router-dom';

function Toolbar() {
  const navigate = useNavigate();

  return (
    <VeltPresence
      flockMode={true}
      defaultFlockNavigation={false}
      onNavigate={(pageInfo) => navigate(pageInfo.path)}
    />
  );
}
```

When you provide an `onNavigate` callback, set `defaultFlockNavigation={false}` to disable Velt's built-in `window.location.href` navigation. The callback receives a `PageInfo` object with a `path` property matching the leader's current route.

**Next.js App Router example:**

```jsx
'use client';
import { useRouter } from 'next/navigation';

function Toolbar() {
  const router = useRouter();

  return (
    <VeltPresence
      flockMode={true}
      defaultFlockNavigation={false}
      onNavigate={(pageInfo) => router.push(pageInfo.path)}
    />
  );
}
```

#### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flockMode` | `boolean` | `false` | Enable flock mode globally on this presence instance |
| `defaultFlockNavigation` | `boolean` | `true` | Use built-in `window.location.href` navigation. Set to `false` when using `onNavigate` |
| `onNavigate` | `(pageInfo: PageInfo) => void` | - | Callback fired when the leader navigates. Use with your app's router |

**Other Frameworks (listen for the `onNavigate` event on the element):**

```js
const presenceDOMElement = document.querySelector("velt-presence");
presenceDOMElement.addEventListener("onNavigate", (event) => {
  myRouter.navigate(event.detail.path); // event.detail is the PageInfo
});
```

#### HTML Usage

```html
<velt-presence flock-mode="true"></velt-presence>

<!-- Disable default navigation for custom handling -->
<velt-presence
  flock-mode="true"
  disable-flock-navigation="true"
></velt-presence>
```

Note: the HTML attribute for disabling default navigation is `disable-flock-navigation`, while the React prop is `defaultFlockNavigation={false}`. They write the same underlying flag with inverted polarity. The React `disableFlockNavigation` prop is a deprecated alias; don't pass both, because the last one wins.

**Interactions:**

- `onNavigate` and `defaultFlockNavigation` only take effect while flock mode is on
- With flock mode on, clicking another user's avatar fires `onPresenceUserClick` **and** makes that user the leader; with it off, the click only fires `onPresenceUserClick`

#### Verification

- [ ] `flockMode={true}` is set on VeltPresence
- [ ] Clicking a user's avatar starts following them
- [ ] `defaultFlockNavigation={false}` is set when using `onNavigate`
- [ ] `onNavigate` uses your app's router (not `window.location.href`)
- [ ] `stopFollowingUser()` properly ends the session
- [ ] Test with two browsers: follower's screen mirrors leader's navigation

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/flock-mode/overview - "Flock Mode Overview"
- https://docs.velt.dev/realtime-collaboration/flock-mode/setup - "Flock Mode Setup"
- https://docs.velt.dev/realtime-collaboration/flock-mode/customize-behavior - "flockMode", "onNavigate", "defaultFlockNavigation", "startFollowingUser()", "stopFollowingUser()"
- https://docs.velt.dev/api-reference/sdk/models/data-models#flockoptions - `FlockOptions`
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - flock prop interactions

---

### 3.2 Configure Inactivity and Offline Timeouts

**Impact: HIGH (Controls when users appear as away or offline in presence)**

Velt moves a user from online to away after `inactivityTime` without mouse or keyboard activity, and to offline after `offlineInactivityTime`. Both values are in **milliseconds**.

**How presence status transitions work:**

| Event | Effect | Default |
|-------|--------|---------|
| No mouse or keyboard activity | `onlineStatus` becomes `'away'`, `isUserIdle` becomes `true` | `inactivityTime`: 300000 ms (5 min) |
| Still inactive, or connection lost | `onlineStatus` becomes `'offline'` | `offlineInactivityTime`: 600000 ms (10 min) |
| Tab loses focus | `onlineStatus` becomes `'away'`, `isTabAway` becomes `true` | Immediate |

**Incorrect (offline threshold shorter than away threshold, or minutes instead of ms):**

```jsx
// offlineInactivityTime < inactivityTime is rejected and ignored
<VeltPresence inactivityTime={600000} offlineInactivityTime={120000} />

// 5 is read as 5 milliseconds, not 5 minutes
<VeltPresence inactivityTime={5} />
```

**Correct (React / Next.js):**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return <VeltPresence inactivityTime={30000} offlineInactivityTime={600000} />;
}

// Or via API
const presenceElement = client.getPresenceElement();
presenceElement.setInactivityTime(30000);
```

**Correct (Other Frameworks):**

```html
<velt-presence inactivity-time="30000" offline-inactivity-time="600000"></velt-presence>
```

```js
const presenceElement = Velt.getPresenceElement();
presenceElement.setInactivityTime(30000);
```

**Recommended values by app type:**

| App Type | inactivityTime | offlineInactivityTime |
|----------|---------------|----------------------|
| Real-time canvas/whiteboard | 30000 (30s) | 120000 (2 min) |
| Document editor | 300000 (5 min) | 600000 (10 min) |
| Dashboard/viewer | 600000 (10 min) | 1800000 (30 min) |

**Key details:**

- `offlineInactivityTime` must be greater than or equal to `inactivityTime`; a smaller value is rejected (logged) and ignored
- `setInactivityTime()` is the documented API method; set `offlineInactivityTime` through the prop or attribute
- Tab blur sets `away` immediately, regardless of `inactivityTime`
- Losing the internet connection also marks the user offline

**Verification:**
- [ ] Both values are in milliseconds
- [ ] `offlineInactivityTime` >= `inactivityTime`
- [ ] Away status appears at the expected time when a user stops interacting
- [ ] Switching tabs immediately shows the user as away

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#inactivitytime - "inactivityTime"
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#offlineinactivitytime - "offlineInactivityTime"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "VeltPresence" prop behavior

---

### 3.3 Control Avatar Overflow with maxUsers

**Impact: MEDIUM (Limits displayed avatars and shows overflow count badge)**

When many users are present in a document, showing all avatars can overwhelm your toolbar layout. The `maxUsers` prop limits the visible avatars and displays an overflow count badge (e.g., "+5") for the remaining users.

**Why this matters:**

In collaborative apps with large teams, 20+ avatars in a row will break your layout and provide no useful information at a glance. Capping visible avatars keeps the UI clean while still communicating the total number of active users.

**React: Set maxUsers**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence maxUsers={3} />
  );
}
```

This displays 3 avatar icons plus a "+N" badge showing how many additional users are present.

**HTML: Set max-users attribute**

```html
<velt-presence max-users="3"></velt-presence>
```

**Choosing the right value:**

| Context | Recommended maxUsers |
|---------|---------------------|
| Narrow toolbar or mobile | 3 |
| Standard desktop header | 5 |
| Wide collaboration bar | 8-10 |

The default is `5`. Non-numeric values are rejected and the default holds. When `self` is `true` (the default), the current user counts toward the cap.

**Overflow badge behavior:**

The "+N" badge renders only when the filtered user count is greater than `maxUsers`. If `maxUsers` is 3 and there are 8 active users, the badge shows "+5". `maxUsers` only affects rendering; presence data (`getData`, `usePresenceData`) still returns every user.

**Incorrect (relying on an undocumented API method):**

```javascript
// setMaxUsers() is not a documented PresenceElement method; use the prop/attribute
presenceElement.setMaxUsers(3);
```

**Verification:**
- [ ] `maxUsers` is set on `VeltPresence` or `<velt-presence>`
- [ ] Only the specified number of avatars renders in the toolbar
- [ ] An overflow count badge appears when active users exceed `maxUsers`
- [ ] Layout does not break when many users are present simultaneously
- [ ] No calls to `setMaxUsers()` (configure via `maxUsers` / `max-users`)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#maxusers - "maxUsers"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `maxUsers` default and overflow behavior

---

### 3.4 Control Current User Visibility in Presence

**Impact: MEDIUM (Include or exclude the current user from the presence avatar list)**

By default, `VeltPresence` includes the current user's avatar in the presence list. You can hide it with the `self` prop when your UI already displays the current user's identity elsewhere (e.g., a profile menu or account badge).

**Why this matters:**

Showing the current user in presence is redundant when their identity is already visible in the header or navigation. Hiding it frees up an avatar slot for other collaborators and reduces visual clutter. Conversely, in apps where the toolbar is the only identity indicator, keeping it visible ensures the user knows they are connected.

**Incorrect (assuming the current user is excluded by default):**

```jsx
// self defaults to true: your own avatar shows and takes one of the maxUsers slots
<VeltPresence maxUsers={3} />
```

**Correct (React: hide current user):**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence self={false} />
  );
}
```

**React: Show current user (default behavior)**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence self={true} />
  );
}
```

**HTML: Hide current user**

```html
<velt-presence self="false"></velt-presence>
```

**API: Toggle programmatically** (React: `client.getPresenceElement()`, other frameworks: `Velt.getPresenceElement()`)

```javascript
const presenceElement = Velt.getPresenceElement();

// Hide current user from presence
presenceElement.disableSelf();

// Show current user in presence
presenceElement.enableSelf();
```

**When to hide the current user:**

- Your app has a profile avatar or account menu in the header
- You use `maxUsers` and want to maximize slots for other collaborators
- The presence bar is in a shared toolbar where self-representation is redundant

**When to keep the current user visible:**

- The presence bar is the only indicator that the user is connected
- Users need confirmation that their session is active
- The app has no other profile or identity UI

**Default:** `self={true}`: the current user is shown in the presence list and counts toward `maxUsers`. This default surprises many teams; set `self={false}` for an "others online" pattern.

**Verification:**
- [ ] `self` prop is set intentionally based on your UI design
- [ ] When `self={false}`, the current user's avatar does not appear in presence
- [ ] When `self={true}`, the current user's avatar is included
- [ ] The `maxUsers` overflow count adjusts correctly based on self visibility

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#self - "self"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `self` default and interaction with `maxUsers`

---

### 3.5 Filter Presence by Location within a Document

**Impact: MEDIUM (Show presence scoped to a specific section or area of a document)**

In multi-section documents, you can scope presence to a specific section using the `locationId` prop. This shows only the users who are active in that particular area, rather than everyone viewing the document.

**Why this matters:**

In apps with distinct sections — such as a spreadsheet with multiple sheets, a slide deck with individual slides, or a document with chapters — global document presence is too coarse. Users need to know who is working in the same section to avoid conflicts and coordinate edits effectively.

**Incorrect (location set on the component, but users never get a location):**

```jsx
// No setLocations() anywhere in the app: no user matches, so the list stays empty
<VeltPresence locationId="section-intro" />
```

**Correct (React: presence scoped to a location):**

```jsx
import { VeltPresence } from "@veltdev/react";

function SectionHeader({ sectionId, title }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <VeltPresence locationId={sectionId} />
    </div>
  );
}
```

**React: Multiple sections with independent presence**

```jsx
import { VeltPresence } from "@veltdev/react";

function MultiSectionDocument() {
  return (
    <div>
      <section>
        <div className="section-toolbar">
          <h2>Introduction</h2>
          <VeltPresence locationId="section-intro" />
        </div>
        {/* Section content */}
      </section>

      <section>
        <div className="section-toolbar">
          <h2>Analysis</h2>
          <VeltPresence locationId="section-analysis" />
        </div>
        {/* Section content */}
      </section>
    </div>
  );
}
```

**HTML: Presence scoped to a location**

```html
<div class="section-header">
  <h2>Introduction</h2>
  <velt-presence location-id="section-intro"></velt-presence>
</div>

<div class="section-header">
  <h2>Analysis</h2>
  <velt-presence location-id="section-analysis"></velt-presence>
</div>
```

**Use cases for location-scoped presence:**

| App Type | Location ID Strategy |
|----------|---------------------|
| Spreadsheet | Sheet name or tab ID (`sheet-1`, `sheet-2`) |
| Slide deck | Slide index or ID (`slide-0`, `slide-5`) |
| Multi-chapter document | Chapter or section ID (`chapter-intro`) |
| Kanban board | Column or card ID (`column-in-progress`) |

**How it works:**

`VeltPresence` filters its avatar list to users whose current location matches. Users get a location when your app calls `setLocations` (or `useSetLocations`) as they move between sections, so set locations for every user, not only the viewer.

```jsx
// React: set the location the user is currently in
const { setLocations } = useSetLocations();
setLocations([{ id: "section-analysis", locationName: "Analysis" }]);
```

```js
// Other Frameworks
await Velt.setLocations([{ id: "section-analysis", locationName: "Analysis" }]);
```

You can also pass a full `location` object instead of `locationId`. If both are set, `locationId` wins. A `VeltPresence` with neither still shows all users on the document, so you can combine a global presence bar in the header with per-section indicators.

**Verification:**
- [ ] `locationId` is set on each section's `VeltPresence` component
- [ ] Each section shows only users active in that specific location
- [ ] Location IDs are stable and unique within the document
- [ ] Global presence (no `locationId`) still works in the main header if needed
- [ ] Users navigating between sections update presence in real time
- [ ] Your app calls `setLocations` so each user's current location is known
- [ ] Only one of `locationId` / `location` is passed (`locationId` takes precedence)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#locationid - "locationId"
- https://docs.velt.dev/key-concepts/overview#subscribe-to-locations - "Subscribe to Locations"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `location` / `locationId` precedence

---

## 4. Cursor

**Impact: HIGH**

Real-time cursor tracking via the VeltCursor component, mounted once near the app root and confined with `allowedElementIds`.

### 4.1 Set Up VeltCursor for Real-Time Cursor Tracking

**Impact: HIGH (Real-time cursor sharing for canvas, diagram, and spatial applications)**

`VeltCursor` renders the live cursors of other users on the same document and location. It is best suited for canvas, diagram, and spatial applications (ReactFlow, whiteboards, image editors). Mount it once near the app root; Velt positions every remote cursor itself. For full cursor configuration, see the `velt-cursors-best-practices` skill.

**Why this matters:**

In spatial applications, cursor position is the main signal of what a collaborator is focused on. Velt adapts cursors to different screen sizes and content, so you do not position cursors yourself.

**Incorrect (one VeltCursor per container to "scope" cursors):**

```jsx
<div className="canvas-a"><VeltCursor /></div>
<div className="canvas-b"><VeltCursor /></div>
{/* Only the first velt-cursor in the DOM subscribes and renders; the second is inert.
    Placement does not confine cursors to the container. */}
```

**Correct (mount once, confine with allowedElementIds):**

```jsx
"use client";
import { VeltProvider, VeltPresence, VeltCursor } from "@veltdev/react";
import ReactFlow from "reactflow";

function FlowEditor({ nodes, edges, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltCursor allowedElementIds={JSON.stringify(["flow-canvas"])} />
      <header className="toolbar">
        <VeltPresence />
      </header>
      <div id="flow-canvas" style={{ width: "100%", height: "100vh" }}>
        <ReactFlow nodes={nodes} edges={edges} fitView />
      </div>
    </VeltProvider>
  );
}
```

**Other Frameworks:**

```html
<body>
  <velt-cursor allowed-element-ids='["flow-canvas"]'></velt-cursor>
  <div id="flow-canvas"></div>
</body>
```

**When NOT to use VeltCursor:**

- **Text editors (TipTap, Lexical, CodeMirror, BlockNote, etc.):** text carets come from the editor's CRDT collaboration binding, not `VeltCursor`. `VeltCursor` shows mouse pointers, not text carets. See `velt-crdt-best-practices`.
- **Non-spatial UIs:** in forms and lists, mouse cursors add noise without useful information.

**Key patterns:**

- Mount `VeltCursor` once; duplicate instances are inert
- `allowedElementIds` takes a JSON-stringified array on the component; the API method `allowedElementIds([...])` takes a plain array
- Cursors are scoped to the root document set by `setDocuments`
- Cursors show the user's name by default; set `avatarMode={true}` to show avatars
- Your own cursor is not rendered back to you

#### Verification Checklist

- [ ] `VeltCursor` is inside `VeltProvider` with a valid `authProvider`
- [ ] `setDocuments` has been called to scope cursors to the correct document
- [ ] Only one `VeltCursor` is mounted
- [ ] `allowedElementIds` is used (stringified) when cursors should be limited to a region
- [ ] For text editors, CRDT bindings are used instead of `VeltCursor`
- [ ] Tested with two browsers and two different users

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#allowedelementids - "allowedElementIds"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "VeltCursor" default behaviors

---

## 5. Events

**Impact: MEDIUM**

Subscription patterns for presence lifecycle events. Covers user online/away/offline state-change subscriptions, including paired setup and teardown.

### 5.1 Subscribe to User State Change Events

**Impact: MEDIUM (React to user online/away/offline transitions for status indicators, logging, and auto-save triggers)**

Velt emits a `userStateChange` event whenever a user transitions between `online`, `away`, and `offline` states. Use this to build status indicators, activity logs, or trigger auto-save when collaborators leave.

**Why this matters:**

Knowing when users change state lets you build responsive UIs -- show "User X went away" banners, log activity for audit trails, or auto-save unsaved changes when the last active user leaves.

**Incorrect (passing a callback to the hook):**

```jsx
// usePresenceEventCallback takes only the event type; this callback never runs
usePresenceEventCallback("userStateChange", (event) => triggerAutoSave());
```

**Correct (React: the hook returns the latest event):**

```jsx
"use client";
import { useEffect } from "react";
import { usePresenceEventCallback } from "@veltdev/react";

function StateChangeHandler() {
  const event = usePresenceEventCallback("userStateChange");

  useEffect(() => {
    if (!event) return;
    // PresenceUserStateChangeEvent: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    switch (event.state) {
      case "online":
        showNotification(`${event.user.name} is back online`);
        break;
      case "away":
        console.log(`${event.user.name} went away`); // tab blur triggers 'away' immediately
        break;
      case "offline":
        triggerAutoSave();
        break;
    }
  }, [event]);

  return null;
}
```

**Correct (React: API method):**

```jsx
const presenceElement = client.getPresenceElement();
const subscription = presenceElement.on("userStateChange").subscribe((event) => {
  console.log("userStateChange", event);
});
// cleanup
subscription?.unsubscribe();
```

**Correct (Other Frameworks):**

```js
const presenceElement = Velt.getPresenceElement();

const subscription = presenceElement
  .on("userStateChange")
  .subscribe((event) => {
    // Same event shape: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    updateStatusBadge(event.user.userId, event.state);

    if (event.state === "offline") {
      logUserDeparture(event.user);
    }
  });

// Cleanup when done
// subscription.unsubscribe();
```

**State transition behavior:**

| Transition | Trigger |
|---|---|
| `online` -> `away` | Tab loses focus (immediate), or inactivity timeout reached |
| `away` -> `online` | Tab regains focus, or user activity detected |
| `online`/`away` -> `offline` | `offlineInactivityTime` reached, or the user loses their connection |

**Common use cases:**

- **Status indicators:** Update avatar badges or user list entries in real time
- **Activity logging:** Record when users join/leave for audit trails
- **Auto-save triggers:** Save document state when the last editor goes offline
- **Notifications:** Show toast messages when collaborators arrive or leave

**Key patterns:**

- The React hook cleans up on unmount; react to its return value in `useEffect`
- Tab focus loss triggers `away` immediately (not after a timeout)
- `inactivityTime` config controls the idle timeout for the online-to-away transition when the tab is focused
- Events fire for all users in the same document scope (set by `setDocuments`)

#### Verification Checklist

- [ ] Component is inside `<VeltProvider>` with valid `authProvider`
- [ ] `setDocuments` has been called to scope presence to the correct document
- [ ] Event handler does not assume any particular transition order
- [ ] Vanilla JS subscriptions have cleanup via `.unsubscribe()`
- [ ] No heavy synchronous work inside the callback (use async for API calls)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#on - "Event Subscription"
- https://docs.velt.dev/api-reference/sdk/models/data-models#presenceuserstatechangeevent - `PresenceUserStateChangeEvent`

---

## 6. UI Customization

**Impact: MEDIUM**

Visual customization of the Presence avatar list, tooltip, and overflow badge via VeltPresenceWireframe and VeltPresenceTooltipWireframe inside VeltWireframe.

### 6.1 Customize Presence Avatar UI with Wireframes

**Impact: MEDIUM (Build fully custom presence avatar layouts using wireframe building blocks)**

Use `VeltPresenceWireframe` for the avatar list and `VeltPresenceTooltipWireframe` for the hover tooltip. Wireframes are templates: always wrap them in `VeltWireframe` (React) or `<velt-wireframe style="display:none;">` (HTML) so they never render on their own. Real-time behavior stays intact.

**Why this matters:**

Wireframes placed outside the wrapper render as visible markup or are ignored. Design systems often need custom avatar shapes, tooltips, or overflow badges; wireframes give you that without re-implementing presence subscriptions.

**Incorrect (no wrapper, wrong nesting):**

```jsx
<VeltPresenceWireframe>
  <VeltPresenceWireframe.AvatarList.Item /> {/* Item must be inside AvatarList */}
</VeltPresenceWireframe>
<VeltPresence />
```

**Correct (React / Next.js):**

```jsx
"use client";
import {
  VeltWireframe,
  VeltPresenceWireframe,
  VeltPresenceTooltipWireframe,
} from "@veltdev/react";

function PresenceWireframes() {
  return (
    <VeltWireframe>
      <VeltPresenceWireframe>
        <VeltPresenceWireframe.AvatarList>
          <VeltPresenceWireframe.AvatarList.Item />
        </VeltPresenceWireframe.AvatarList>
        <VeltPresenceWireframe.AvatarRemainingCount />
      </VeltPresenceWireframe>

      <VeltPresenceTooltipWireframe>
        <VeltPresenceTooltipWireframe.Avatar />
        <VeltPresenceTooltipWireframe.StatusContainer>
          <VeltPresenceTooltipWireframe.UserName />
          <VeltPresenceTooltipWireframe.UserActive />
          <VeltPresenceTooltipWireframe.UserInactive />
        </VeltPresenceTooltipWireframe.StatusContainer>
      </VeltPresenceTooltipWireframe>
    </VeltWireframe>
  );
}

// Render <PresenceWireframes /> once inside VeltProvider, and <VeltPresence /> where avatars should appear.
```

**Correct (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <velt-presence-wireframe>
    <velt-presence-avatar-list-wireframe>
      <velt-presence-avatar-list-item-wireframe></velt-presence-avatar-list-item-wireframe>
    </velt-presence-avatar-list-wireframe>
    <velt-presence-avatar-remaining-count-wireframe></velt-presence-avatar-remaining-count-wireframe>
  </velt-presence-wireframe>

  <velt-presence-tooltip-wireframe>
    <velt-presence-tooltip-avatar-wireframe></velt-presence-tooltip-avatar-wireframe>
    <velt-presence-tooltip-status-container-wireframe>
      <velt-presence-tooltip-user-name-wireframe></velt-presence-tooltip-user-name-wireframe>
      <velt-presence-tooltip-user-active-wireframe></velt-presence-tooltip-user-active-wireframe>
      <velt-presence-tooltip-user-inactive-wireframe></velt-presence-tooltip-user-inactive-wireframe>
    </velt-presence-tooltip-status-container-wireframe>
  </velt-presence-tooltip-wireframe>
</velt-wireframe>

<velt-presence></velt-presence>
```

**Disable Shadow DOM for custom CSS:**

```jsx
<VeltPresence shadowDom={false} />
```

```html
<velt-presence shadow-dom="false"></velt-presence>
```

**Key patterns and limitations:**

- `AvatarRemainingCount` ("+N") renders only when the user count exceeds `maxUsers`
- Tooltip slots are status-gated: `UserActive` renders only for `online` users, `UserInactive` only for `away` users, and neither renders for `offline`
- Use `variant` on `VeltPresence` to switch to a named wireframe variant
- Shadow DOM is on by default; disable it only when you need selector CSS on internals

#### Verification Checklist

- [ ] All presence wireframes are inside `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] `AvatarList.Item` is nested inside `AvatarList`
- [ ] HTML wireframe tags are kebab-case and not self-closing
- [ ] `shadowDom={false}` is set only when custom CSS needs to reach internals
- [ ] Tested with more users than `maxUsers` to check the overflow badge

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/presence - "VeltPresenceWireframe", "VeltPresenceTooltipWireframe", "Styling", "Limitations"
- https://docs.velt.dev/ui-customization/overview - "UI Customization Concepts"

---

## 7. Wireframe Variables

**Impact: MEDIUM**

Template-variable binding inside `<velt-presence-...-wireframe>` tags. Documents the flat-config `componentConfig.<path>` access pattern and per-tooltip iteration context (`user`, `isActive`, `lastActiveAt`) used by `velt-data` / `velt-if` / `velt-class` directives.

### 7.1 Bind Presence Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives the active-user avatar list, overflow badge, and hover tooltip inside Presence wireframes without re-implementing presence-data subscriptions on top of the component)**

The Presence primitive renders the active-user avatar list inside `<velt-presence>` / `<VeltPresence>`. Variables are available inside any `<velt-presence-...-wireframe>` tag via the standard `<velt-data field="...">` / `velt-if="{...}"` / `velt-class="'cls': {...}"` directives.

This family uses the **flat-config** access pattern — every variable is referenced via the explicit `componentConfig.<path>` form. There are no bare-name loop variables; the per-user iteration context inside avatar-list-item and tooltip tags is also exposed as `componentConfig.user` / `componentConfig.isActive` / `componentConfig.lastActiveAt`.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top.

Do not subscribe to presence data and re-render the list yourself. The wireframe already iterates `componentConfig.filteredPresenceUsers` and applies max-users overflow.

**Incorrect (bare names, rebuilding the list from hooks):**

```jsx
const presence = usePresenceData();
<VeltWireframe>
  <VeltPresenceWireframe>
    {presence?.data?.map((u) => <span key={u.userId}>{u.name}</span>)}
    <velt-data field="filteredPresenceUsers.length" /> {/* resolves to nothing */}
  </VeltPresenceWireframe>
</VeltWireframe>
```

**Correct (let the wireframe iterate, read `componentConfig.user` per row, gate overflow with `filteredPresenceUsers.length > maxUsers`):**

```jsx
<VeltWireframe>
  <VeltPresenceWireframe>
    <VeltPresenceWireframe.AvatarList />
    <VeltPresenceWireframe.AvatarRemainingCount />
  </VeltPresenceWireframe>
</VeltWireframe>
```

#### Component Config (root state)

Available inside every Presence primitive. **Always read via the full `componentConfig.<path>` form.**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.filteredPresenceUsers` | `PresenceUser[]` | Active users after filters — drives the avatar list. `.length` powers the overflow gate. |
| `componentConfig.user` | `User` | Currently identified end-user (root scope). Inside avatar-list-item and tooltip tags, this rebinds to the iteration's `PresenceUser`. |
| `componentConfig.maxUsers` | `number` | Max avatars before collapsing into "+N" (default `5`). |
| `componentConfig.variant` | `string` | Per-instance variant tag. |
| `componentConfig.shadowDom` | `boolean` | Shadow-DOM rendering enabled (host-config — set via element attribute). |
| `componentConfig.tooltipContent` | `TemplateRef<any>` | Internal — programmatic tooltip override only, not used in wireframes. |
| `componentConfig.trackById` | `Function` | Internal list-tracking function. |
| `componentConfig.showTooltip` | `Function` | Hover-in handler — wire to `(mouseenter)` on a custom avatar. |
| `componentConfig.closeTooltip` | `Function` | Hover-out handler. |
| `componentConfig.onPresenceUserClick` | `Function` | Avatar click handler — wire from custom avatar markup. |

#### Context-Specific Variables (per-iteration / tooltip scope)

These resolve **only** inside the iteration or tooltip tag that owns them — but still via the `componentConfig.<path>` form.

| Variable | Type | Available in | Notes |
|---|---|---|---|
| `componentConfig.user` | `PresenceUser` | `<velt-presence-avatar-list-item-wireframe>`, `<velt-presence-tooltip-wireframe>` and tooltip child tags | Per-row / hovered user. |
| `componentConfig.isActive` | `boolean` | Tooltip context | `true` when the hovered user is currently active. Branch active/inactive slots with `velt-if`. |
| `componentConfig.lastActiveAt` | `number` | Tooltip context | Unix timestamp the user was last active. |

#### Wireframe tags

| Wireframe tag (HTML) | React component | Notes |
|---|---|---|
| `<velt-presence-wireframe>` | `<VeltPresenceWireframe />` | Root — hosts every other tag. No extra variables. |
| `<velt-presence-avatar-list-wireframe>` | `<VeltPresenceWireframe.AvatarList />` | List container — iterates `componentConfig.filteredPresenceUsers`. |
| `<velt-presence-avatar-list-item-wireframe>` | `<VeltPresenceWireframe.AvatarList.Item />` | Per-user avatar — `componentConfig.user` rebinds to the iteration's `PresenceUser`. |
| `<velt-presence-avatar-remaining-count-wireframe>` | `<VeltPresenceWireframe.AvatarRemainingCount />` | "+N" overflow badge. `shouldShow` requires `filteredPresenceUsers.length > maxUsers`. |
| `<velt-presence-tooltip-wireframe>` | `<VeltPresenceTooltipWireframe />` | Hover tooltip — exposes `user`, `isActive`, `lastActiveAt`. Composes the five child tags below. |
| `<velt-presence-tooltip-avatar-wireframe>` | `<VeltPresenceTooltipWireframe.Avatar />` | Hovered user's avatar — bind `componentConfig.user.photoUrl`. |
| `<velt-presence-tooltip-status-container-wireframe>` | `<VeltPresenceTooltipWireframe.StatusContainer />` | Wrapper for the active/inactive status row. |
| `<velt-presence-tooltip-user-name-wireframe>` | `<VeltPresenceTooltipWireframe.UserName />` | Hovered user's name — bind `componentConfig.user.name`. |
| `<velt-presence-tooltip-user-active-wireframe>` | `<VeltPresenceTooltipWireframe.UserActive />` | Built-in gate: renders only for `online` users. |
| `<velt-presence-tooltip-user-inactive-wireframe>` | `<VeltPresenceTooltipWireframe.UserInactive />` | Built-in gate: renders only for `away` users. Show relative `lastActiveAt` here. |

#### Common mistakes — DO NOT

**1. DO NOT bare-name presence state.** This family is flat-config — `<velt-data field="filteredPresenceUsers.length" />` resolves to nothing. Always use `componentConfig.filteredPresenceUsers.length`.

**2. DO NOT subscribe to `usePresenceData` to render the list manually.** The wireframe already iterates `componentConfig.filteredPresenceUsers` and applies max-users overflow. Hooks are for reading state alongside the wireframe, not for replacing it.

**3. DO NOT bind `isActive` / `lastActiveAt` outside a tooltip tag.** The tooltip iteration context only exists inside `<velt-presence-tooltip-wireframe>` and its descendants.

**4. DO NOT expect a tooltip status slot for offline users.** `tooltip-user-active` renders only for `online` users and `tooltip-user-inactive` only for `away` users; neither renders for `offline`. Inside custom tooltip markup you can still branch with `velt-if="{componentConfig.isActive}"` / `velt-if="!{componentConfig.isActive}"`.

**5. DO NOT forget the wrapper.** Wireframes must sit inside `<VeltWireframe>` (React) or `<velt-wireframe style="display:none;">` (HTML).

**Verification:**
- [ ] All state is read via `componentConfig.<path>` (no bare names)
- [ ] Avatar-list iteration uses `componentConfig.user` inside `<velt-presence-avatar-list-item-wireframe>`
- [ ] Overflow badge is gated by `filteredPresenceUsers.length > maxUsers`
- [ ] Tooltip status UI accounts for the built-in gating (`online` / `away` only)
- [ ] `componentConfig.onPresenceUserClick` is wired from custom avatar markup when overriding the click target

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/presence-wireframe-variables — "Presence Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- https://docs.velt.dev/ui-customization/features/realtime/presence - "Limitations"
- Cross-reference: `ui/ui-wireframes.md` (structural Presence wireframe catalog), `core/core-setup.md` (VeltPresence component setup)

---

## 8. Debugging

**Impact: LOW-MEDIUM**

Troubleshooting patterns for presence-not-showing, stale-state, and identity-mismatch issues.

### 8.1 Troubleshoot Common Presence Issues

**Impact: LOW-MEDIUM (Quick fixes for common presence setup and runtime problems)**

Common issues and solutions when integrating Velt Presence.

**Incorrect (several common mistakes together):**

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["comment"] }}> {/* 'presence' missing */}
  <VeltPresence />                                   {/* no authProvider, no document set */}
</VeltProvider>
```

**Correct:** authenticate, set the document, and allow the feature (details per issue below).

**Issue 1: Presence not showing**

**Symptoms:** `VeltPresence` renders nothing, no avatars appear.

**Solutions:**
```jsx
// 1. VeltProvider wraps all Velt components and authenticates the user
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={{
    user: { userId: "user-1", organizationId: "org-1", name: "Alice" },
    generateToken: async () => fetchToken(),
  }}
>
  <DocumentScope /> {/* calls setDocuments after login */}
  <VeltPresence />
</VeltProvider>

// 2. Set the document from a child component of VeltProvider
const { setDocuments } = useSetDocuments();
setDocuments([{ id: "my-document-id", metadata: { documentName: "My Doc" } }]);

// 3. v6 modular SDK: if featureAllowList is set, it must include 'presence'
<VeltProvider apiKey="YOUR_API_KEY" config={{ featureAllowList: ["presence", "comment"] }} />

// 4. For Next.js, add 'use client' at the top of files that use Velt components
```

Anonymous users never see presence; the feature requires an identified user.

**Issue 2: Users stuck on "online" (never go away/offline)**

**Solutions:**
```jsx
// inactivityTime is in milliseconds (default 300000 = 5 min)
<VeltPresence inactivityTime={60000} offlineInactivityTime={600000} />
// offlineInactivityTime smaller than inactivityTime is rejected and ignored.
// Frameworks or iframes that swallow focus/visibility events can delay 'away'.
```

**Issue 3: Users from other pages appear in the presence list**

**Solutions:**
```jsx
// Update the document on every route change; presence uses the root (first) document
const { setDocuments } = useSetDocuments();
useEffect(() => {
  if (veltUser) setDocuments([{ id: docId }]);
}, [veltUser, docId, setDocuments]);
```

**Issue 4: Avatar click does nothing**

**Solutions:**
```jsx
<VeltPresence onPresenceUserClick={(user) => navigateToUserLocation(user)} />
// Clicking an avatar only starts following when flockMode={true}
```

**Issue 5: User count looks wrong**

**Solutions:**
```jsx
// self defaults to true: the current user IS included and counts toward maxUsers
<VeltPresence self={false} /> {/* exclude yourself */}

// maxUsers (default 5) caps visible avatars; extra users go into "+N"
<VeltPresence maxUsers={5} />
// maxUsers does not change presence data returned by getData / usePresenceData.

// locationId / location filter the list to one location
```

#### Debugging Verification Checklist

- [ ] `VeltProvider` renders with a valid `apiKey` and `authProvider`
- [ ] `authProvider.user` has `userId`, `organizationId`, and `name`
- [ ] `setDocuments` (via `useSetDocuments()` or `Velt.setDocuments`) is called with `{ id }`
- [ ] `featureAllowList`, if set, includes `'presence'`
- [ ] `'use client'` is present in Next.js components using Velt
- [ ] Domain is safelisted in the Velt Console
- [ ] Tested with two browsers and two different users
- [ ] `inactivityTime` / `offlineInactivityTime` are in milliseconds and ordered correctly
- [ ] `self` and `maxUsers` match the expected count

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/setup - "Presence Setup"
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior - "Customize Behavior"
- https://docs.velt.dev/ui-customization/features/realtime/presence - "Limitations"
- https://docs.velt.dev/key-concepts/overview#subscribe-to-documents - "Subscribe to Documents"
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/realtime-collaboration/presence/overview
- https://docs.velt.dev/realtime-collaboration/presence/setup
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior
- https://docs.velt.dev/ui-customization/features/realtime/presence-wireframe-variables
- https://console.velt.dev
- https://docs.velt.dev/realtime-collaboration/flock-mode/customize-behavior
- https://docs.velt.dev/ui-customization/features/realtime/presence
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions
- https://docs.velt.dev/api-reference/rest-apis/v2/presence/add-presence
