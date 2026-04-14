# Velt Presence Best Practices

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
   - 1.2 [Add VeltPresence and VeltCursor Components](#12-add-veltpresence-and-veltcursor-components)
   - 1.3 [Scope Presence with setDocuments](#13-scope-presence-with-setdocuments)

2. [Data Access](#2-data-access) -- **HIGH**
   - 2.1 [Use React Hooks for Presence Data](#21-use-react-hooks-for-presence-data)
   - 2.2 [Use Vanilla JS API for Presence Data](#22-use-vanilla-js-api-for-presence-data)

3. [Configuration](#3-configuration) -- **HIGH-MEDIUM**
   - 3.1 [Configure Inactivity Timeout](#31-configure-inactivity-timeout)
   - 3.2 [Set Maximum Visible Users](#32-set-maximum-visible-users)
   - 3.3 [Control Self Visibility](#33-control-self-visibility)
   - 3.4 [Scope Presence to Locations](#34-scope-presence-to-locations)

4. [Cursor](#4-cursor) -- **HIGH**
   - 4.1 [Set Up VeltCursor for Real-Time Cursor Tracking](#41-set-up-veltcursor-for-real-time-cursor-tracking)

5. [Events](#5-events) -- **MEDIUM**
   - 5.1 [Subscribe to User State Change Events](#51-subscribe-to-user-state-change-events)

6. [UI & Debugging](#6-ui--debugging) -- **MEDIUM-LOW**
   - 6.1 [Customize Presence Avatar UI with Wireframes](#61-customize-presence-avatar-ui-with-wireframes)
   - 6.2 [Troubleshoot Common Presence Issues](#62-troubleshoot-common-presence-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns required for any Velt presence implementation. Without these, presence will not function.

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

### 1.2 Add VeltPresence and VeltCursor Components

**Impact: CRITICAL (Core presence rendering)**

`VeltPresence` renders a row of avatars showing who is currently viewing the document. Place it in your toolbar or header area.

```jsx
"use client";
import { VeltPresence, VeltCursor } from "@veltdev/react";

function CollaborativeEditor() {
  return (
    <>
      <header className="toolbar">
        <VeltPresence />
      </header>
      <main className="editor-canvas">
        <VeltCursor />
      </main>
    </>
  );
}
```

HTML equivalent:

```html
<div class="toolbar">
  <velt-presence></velt-presence>
</div>
<div class="editor-canvas">
  <velt-cursor></velt-cursor>
</div>
```

**Placement:** `VeltPresence` in toolbar/header (not scrollable content). `VeltCursor` inside the spatial content area.

---

### 1.3 Scope Presence with setDocuments

**Impact: CRITICAL (Without this, presence shows all users across all documents)**

Call `useSetDocuments` in a child component of `VeltProvider` to scope presence to a specific document.

```jsx
"use client";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";

function DocumentScope({ documentId }) {
  const currentUser = useCurrentUser();
  useSetDocuments(currentUser ? [{ documentId, metadata: {} }] : null);
  return null;
}
```

Common mistakes: calling `useSetDocuments` in the same component as `VeltProvider`, setting documents before authentication, forgetting to update on route changes.

**Verification:**
- `useSetDocuments` called in a child of `VeltProvider`
- Document ID set only after user is authenticated
- Document ID updates on navigation

---

## 2. Data Access

**Impact: HIGH**

Patterns for subscribing to real-time presence data in React and vanilla JS contexts.

### 2.1 Use React Hooks for Presence Data

**Impact: HIGH (Simplest way to subscribe to presence data with automatic cleanup)**

Three hooks: `usePresenceData` for filtered user lists, `usePresenceEventCallback` for state events, `usePresenceUtils` for programmatic control.

```jsx
"use client";
import { usePresenceData } from "@veltdev/react";

function OnlineUsers() {
  const presenceData = usePresenceData({ statuses: ["online"] });

  if (!presenceData?.data) {
    return <div>Loading presence...</div>;
  }

  return (
    <ul>
      {presenceData.data.map((user) => (
        <li key={user.userId}>{user.name}</li>
      ))}
    </ul>
  );
}
```

```jsx
import { usePresenceEventCallback } from "@veltdev/react";

function PresenceLogger() {
  usePresenceEventCallback("userStateChange", (event) => {
    console.log(`${event.user.name} is now ${event.state}`);
  });
  return null;
}
```

```jsx
import { usePresenceUtils } from "@veltdev/react";

function PresenceController() {
  const presenceElement = usePresenceUtils();
  // Use presenceElement.getData(), .on() with manual subscribe/unsubscribe
}
```

**Key:** Always check `presenceData?.data` for null before rendering. Hook cleanup is automatic.

---

### 2.2 Use Vanilla JS API for Presence Data

**Impact: HIGH (Observable-based API for non-React or programmatic contexts)**

Use `Velt.getPresenceElement()` or `client.getPresenceElement()` to get the `PresenceElement` instance.

```js
const presenceElement = Velt.getPresenceElement();

const subscription = presenceElement
  .getData({ statuses: ["online"] })
  .subscribe((response) => {
    console.log("Online users:", response);
  });

// Cleanup
subscription.unsubscribe();
```

```js
const subscription = presenceElement
  .on("userStateChange")
  .subscribe((data) => {
    console.log(`${data.user.name} changed to ${data.state}`);
  });
```

**Key:** Every `.subscribe()` must have a corresponding `.unsubscribe()` on cleanup. Guard against null `presenceElement` before SDK init completes.

---

## 3. Configuration

**Impact: HIGH-MEDIUM**

Props and settings that control presence behavior.

### 3.1 Configure Inactivity Timeout

**Impact: HIGH (Controls when users transition from online to away)**

Set `inactivityTime` on `VeltPresence` to control the idle timeout in milliseconds. Default is 300000 (5 minutes).

```jsx
// User goes "away" after 2 minutes of inactivity
<VeltPresence inactivityTime={120000} />
```

```html
<velt-presence inactivity-time="120000"></velt-presence>
```

Lower values provide faster feedback but may cause flickering for users who pause briefly. Tab focus loss triggers `away` immediately regardless of this setting.

**Verification:**
- `inactivityTime` is set to a value appropriate for your use case
- Tab focus/blur events are not being intercepted by iframes or frameworks

---

### 3.2 Set Maximum Visible Users

**Impact: MEDIUM (Controls avatar overflow behavior)**

Set `maxUsers` to limit how many avatars render before showing a "+N" overflow count.

```jsx
<VeltPresence maxUsers={5} />
```

```html
<velt-presence max-users="5"></velt-presence>
```

This only affects the visible avatar count, not the underlying presence data. Users beyond the limit are still tracked and accessible via `usePresenceData`.

---

### 3.3 Control Self Visibility

**Impact: MEDIUM (Whether the current user sees their own avatar)**

Set the `self` prop to control whether the current user's avatar appears in the presence list.

```jsx
<VeltPresence self={true} />   {/* Show current user */}
<VeltPresence self={false} />  {/* Hide current user (default) */}
```

```html
<velt-presence self="true"></velt-presence>
```

Default is `false` -- the current user does not see their own avatar. Set to `true` for dashboards or admin views where self-presence is useful.

---

### 3.4 Scope Presence to Locations

**Impact: MEDIUM (Show presence per page section or sub-document)**

Use location-based presence to show users within specific sections of a document, such as tabs, panels, or pages within a multi-section app.

```jsx
import { useSetLocation } from "@veltdev/react";

function SectionEditor({ sectionId }) {
  useSetLocation({ id: sectionId });
  return <VeltPresence location={true} />;
}
```

```html
<velt-presence location="true"></velt-presence>
```

When `location={true}`, only users at the same location (set via `useSetLocation` or `client.setLocation`) appear. This enables per-tab or per-panel presence within a single document.

**Verification:**
- `useSetLocation` is called with a unique location ID per section
- `location={true}` is set on `VeltPresence`
- Users in different sections see different presence lists

---

## 4. Cursor

**Impact: HIGH**

Real-time cursor tracking for spatial applications.

### 4.1 Set Up VeltCursor for Real-Time Cursor Tracking

**Impact: HIGH (Essential for canvas, diagram, and whiteboard apps)**

`VeltCursor` renders real-time cursor positions for all active users. Best suited for spatial applications.

```jsx
"use client";
import { VeltPresence, VeltCursor, VeltComments } from "@veltdev/react";

function CollaborativeCanvas() {
  return (
    <>
      <header className="toolbar">
        <VeltPresence />
      </header>
      <main className="canvas-area">
        <VeltCursor />
        <VeltComments />
      </main>
    </>
  );
}
```

**When NOT to use:** Text editors (TipTap, SlateJS, Lexical) -- use CRDT bindings instead. Non-spatial UIs where cursor tracking adds noise.

**Verification:**
- `VeltCursor` is inside `VeltProvider` with valid `authProvider`
- `setDocuments` scopes cursors to the correct document
- For text editors, CRDT bindings are used instead

---

## 5. Events

**Impact: MEDIUM**

Subscribe to presence state transitions for real-time UI updates.

### 5.1 Subscribe to User State Change Events

**Impact: MEDIUM (React to online/away/offline transitions)**

The `userStateChange` event fires when any user transitions between `online`, `away`, and `offline`.

```jsx
"use client";
import { usePresenceEventCallback } from "@veltdev/react";

function StateChangeHandler() {
  usePresenceEventCallback("userStateChange", (event) => {
    switch (event.state) {
      case "online":
        showNotification(`${event.user.name} is back online`);
        break;
      case "away":
        console.log(`${event.user.name} went away`);
        break;
      case "offline":
        triggerAutoSave();
        break;
    }
  });
  return null;
}
```

Vanilla JS:

```js
const subscription = presenceElement
  .on("userStateChange")
  .subscribe((event) => {
    updateStatusBadge(event.user.userId, event.state);
  });
```

**State transitions:**
- `online` -> `away`: Tab loses focus (immediate) or inactivity timeout
- `away` -> `online`: Tab regains focus or user activity
- `online`/`away` -> `offline`: Tab closed, network disconnected, session timeout

**Use cases:** Status indicators, activity logging, auto-save triggers, collaborator notifications.

---

## 6. UI & Debugging

**Impact: MEDIUM-LOW**

Customization and troubleshooting patterns.

### 6.1 Customize Presence Avatar UI with Wireframes

**Impact: MEDIUM (Build custom avatar layouts while preserving real-time sync)**

Use `VeltPresenceWireframe` for avatar list layout and `VeltPresenceTooltipWireframe` for hover tooltips.

```jsx
"use client";
import { VeltPresence, VeltPresenceWireframe } from "@veltdev/react";

function CustomPresence() {
  return (
    <>
      <VeltPresenceWireframe>
        <VeltPresenceWireframe.AvatarList>
          <VeltPresenceWireframe.AvatarList.Item />
          <VeltPresenceWireframe.AvatarRemainingCount />
        </VeltPresenceWireframe.AvatarList>
      </VeltPresenceWireframe>
      <VeltPresence />
    </>
  );
}
```

```jsx
import { VeltPresenceTooltipWireframe } from "@veltdev/react";

<VeltPresenceTooltipWireframe>
  <VeltPresenceTooltipWireframe.Avatar />
  <VeltPresenceTooltipWireframe.StatusContainer>
    <VeltPresenceTooltipWireframe.UserName />
    <VeltPresenceTooltipWireframe.UserActive />
    <VeltPresenceTooltipWireframe.UserInactive />
  </VeltPresenceTooltipWireframe.StatusContainer>
</VeltPresenceTooltipWireframe>
```

HTML equivalents use kebab-case: `velt-presence-wireframe`, `velt-presence-avatar-list-wireframe`, `velt-presence-tooltip-wireframe`, etc.

Set `shadowDom={false}` on `VeltPresence` to apply custom CSS to wireframe internals (only when customizing).

---

### 6.2 Troubleshoot Common Presence Issues

**Impact: LOW-MEDIUM (Quick fixes for common problems)**

**Issue 1: Presence not showing**
- Check `VeltProvider` has valid `apiKey` and `authProvider`
- Check `useSetDocuments` is called with a document ID
- For Next.js, ensure `'use client'` directive is present

**Issue 2: Users stuck on "online"**
- Check `inactivityTime` configuration on `VeltPresence`
- Ensure tab focus/blur events are not blocked by iframes

**Issue 3: All users showing across documents**
- `setDocuments` not called -- presence is not scoped to a document
- Ensure document ID updates on route changes

**Issue 4: Avatar click not working**
- Use `onPresenceUserClick` callback:
```jsx
<VeltPresence onPresenceUserClick={(user) => navigateToUser(user)} />
```

**Issue 5: User count wrong**
- Check `self` prop (default `false` hides current user)
- Check `maxUsers` overflow (only affects visible count, not data)

**Debugging Checklist:**
- `VeltProvider` renders with valid `apiKey` and `authProvider`
- `authProvider.user` has `userId`, `organizationId`, and `name`
- `useSetDocuments` called with a document ID
- `'use client'` directive present in Next.js
- Domain safelisted in Velt Console
- Tested with two browser tabs using different users
- Check browser console for Velt SDK errors
