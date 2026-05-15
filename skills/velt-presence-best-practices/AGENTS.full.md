# Velt Presence Best Practices

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

Comprehensive Velt Presence implementation guide covering user-presence avatars, online/away/offline status, real-time cursor tracking, inactivity timeout configuration, location-based filtering, presence data subscriptions, and wireframe-variable customization. This skill provides evidence-backed patterns for integrating Velt Presence into React, Next.js, and other web applications. Covers VeltPresence, VeltCursor, authProvider-based identity, document scoping, presence hooks and vanilla-JS APIs, state-change events, and the VeltPresenceWireframe template-variable binding layer.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Add VeltPresence and VeltCursor Components](#11-add-veltpresence-and-veltcursor-components)
   - 1.2 [Scope Presence with setDocuments](#12-scope-presence-with-setdocuments)
   - 1.3 [Use authProvider for Authentication](#13-use-authprovider-for-authentication)

2. [Data Access](#2-data-access) — **HIGH**
   - 2.1 [Use React Hooks for Presence Data](#21-use-react-hooks-for-presence-data)
   - 2.2 [Use Vanilla JS API for Presence Data](#22-use-vanilla-js-api-for-presence-data)

3. [Configuration](#3-configuration) — **HIGH-MEDIUM**
   - 3.1 [Configure Inactivity and Offline Timeouts](#31-configure-inactivity-and-offline-timeouts)
   - 3.2 [Control Avatar Overflow with maxUsers](#32-control-avatar-overflow-with-maxusers)
   - 3.3 [Control Current User Visibility in Presence](#33-control-current-user-visibility-in-presence)
   - 3.4 [Filter Presence by Location within a Document](#34-filter-presence-by-location-within-a-document)

4. [Cursor](#4-cursor) — **HIGH**
   - 4.1 [Set Up VeltCursor for Real-Time Cursor Tracking](#41-set-up-veltcursor-for-real-time-cursor-tracking)

5. [Events](#5-events) — **MEDIUM**
   - 5.1 [Subscribe to User State Change Events](#51-subscribe-to-user-state-change-events)

6. [UI Customization](#6-ui-customization) — **MEDIUM-LOW**
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

`VeltPresence` renders a row of avatars showing who is currently viewing the document. It works out of the box with no props required for basic usage. Place it in your toolbar or header area, separate from the main content region.

`VeltCursor` enables real-time cursor tracking so users can see each other's mouse positions. It is covered in detail in a separate rule and is most relevant for canvas or spatial apps.

**Why this matters:**

```html
"use client";
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <div className="toolbar">
      <h1>Document Title</h1>
      <VeltPresence />
    </div>
  );
}
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
        {/* Your editor content */}
      </main>
    </>
  );
}
<div class="toolbar">
  <h1>Document Title</h1>
  <velt-presence></velt-presence>
</div>
<div class="toolbar">
  <velt-presence></velt-presence>
</div>
<div class="editor-canvas">
  <velt-cursor></velt-cursor>
</div>
```

**React: With VeltCursor for cursor tracking**
**HTML: Basic presence setup**
**HTML: With cursor tracking**

---

### 1.2 Scope Presence with setDocuments

**Impact: CRITICAL (Without setDocuments, presence shows users across all documents)**

You must call `setDocuments` (or use the `useSetDocuments` hook) to scope presence to a specific document. Without it, presence will show every active user across your entire application, regardless of which document they are viewing.

**Important rules:**

```jsx
"use client";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";
import { useEffect } from "react";

function DocumentScope({ documentId }) {
  const currentUser = useCurrentUser();

  useSetDocuments(
    currentUser ? [{ documentId, metadata: {} }] : null
  );

  return null;
}
"use client";
import { VeltProvider } from "@veltdev/react";
import { VeltPresence } from "@veltdev/react";

function App({ documentId, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <DocumentScope documentId={documentId} />
      <header>
        <VeltPresence />
      </header>
      <main>{/* Document content */}</main>
    </VeltProvider>
  );
}
```

**React: Full layout with document scoping**

**HTML / Vanilla JS:**

```javascript
const client = await Velt.init("YOUR_API_KEY");
// After authentication completes:
client.setDocuments([{ documentId: "invoice-42", metadata: {} }]);
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

Patterns for reading presence state. Covers React hooks (`usePresenceData`, `usePresenceEventCallback`) and the vanilla-JS API surface (`getPresenceElement`, `getData`, `on`).

### 2.1 Use React Hooks for Presence Data

**Impact: HIGH (React hooks provide the simplest way to subscribe to real-time presence data with automatic cleanup)**

Velt provides three React hooks for presence data: `usePresenceData` for subscribing to filtered presence user lists, `usePresenceEventCallback` for listening to state change events, and `usePresenceUtils` for programmatic control via `PresenceElement`.

**Why this matters:**

```jsx
"use client";
import { usePresenceData } from "@veltdev/react";

function OnlineUsers() {
  // Filter to only online users; returns { data: PresenceUser[] | null }
  const presenceData = usePresenceData({ statuses: ["online"] });

  // Always handle null (loading/initializing state)
  if (!presenceData?.data) {
    return <div>Loading presence...</div>;
  }

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
"use client";
import { usePresenceEventCallback } from "@veltdev/react";

function PresenceLogger() {
  usePresenceEventCallback("userStateChange", (event) => {
    // event: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    console.log(`${event.user.name} is now ${event.state}`);
  });

  return null;
}
"use client";
import { usePresenceUtils } from "@veltdev/react";
import { useEffect } from "react";

function PresenceController() {
  const presenceElement = usePresenceUtils();

  useEffect(() => {
    if (!presenceElement) return;

    // Use PresenceElement methods directly
    const subscription = presenceElement
      .getData({ statuses: ["online", "away"] })
      .subscribe((response) => {
        console.log("Presence users:", response);
      });

    return () => subscription.unsubscribe();
  }, [presenceElement]);

  return null;
}
```

**usePresenceEventCallback -- subscribe to state change events**
**usePresenceUtils -- access PresenceElement for programmatic control**

---

### 2.2 Use Vanilla JS API for Presence Data

**Impact: HIGH (Observable-based API for presence data access in non-React or programmatic contexts)**

For non-React applications or programmatic access, use `Velt.getPresenceElement()` (or `client.getPresenceElement()`) to obtain the `PresenceElement` instance. All data methods return Observables that require `.subscribe()` and manual `.unsubscribe()` for cleanup.

**Why this matters:**

```html
// From the global Velt object
const presenceElement = Velt.getPresenceElement();

// Or from the client instance
const presenceElement = client.getPresenceElement();
const presenceElement = Velt.getPresenceElement();

// Subscribe to online users only
const subscription = presenceElement
  .getData({ statuses: ["online"] })
  .subscribe((response) => {
    // response: PresenceUser[]
    console.log("Online users:", response);
    updateUI(response);
  });

// IMPORTANT: Clean up when done (e.g., on page unload or component destroy)
// subscription.unsubscribe();
const presenceElement = Velt.getPresenceElement();

const subscription = presenceElement
  .on("userStateChange")
  .subscribe((data) => {
    // data: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    console.log(`${data.user.name} changed to ${data.state}`);
  });

// Clean up
// subscription.unsubscribe();
<script>
  let presenceSubscription = null;

  function initPresence() {
    const presenceElement = Velt.getPresenceElement();
    if (!presenceElement) return;

    presenceSubscription = presenceElement
      .getData({ statuses: ["online", "away"] })
      .subscribe((users) => {
        const container = document.getElementById("presence-list");
        container.innerHTML = users
          .map((u) => `<span class="avatar">${u.name}</span>`)
          .join("");
      });
  }

  function cleanup() {
    if (presenceSubscription) {
      presenceSubscription.unsubscribe();
      presenceSubscription = null;
    }
  }

  window.addEventListener("beforeunload", cleanup);
</script>
```

**Subscribe to filtered presence data**
**Subscribe to state change events**
**Full lifecycle example (vanilla JS)**

---

## 3. Configuration

**Impact: HIGH-MEDIUM**

Behavior knobs for the Presence component. Covers away/offline inactivity timeouts, avatar overflow (`maxUsers`), self-visibility (include/exclude current user), and location-based filtering.

### 3.1 Configure Inactivity and Offline Timeouts

**Impact: HIGH (Controls when users appear as away or offline in presence)**

Velt tracks user activity and automatically transitions presence status based on idle time and tab focus. You can customize these thresholds to match your application's needs.

**Why this matters:**

```javascript
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence
      inactivityTime={30000}
      offlineInactivityTime={600000}
    />
  );
}
<velt-presence
  inactivity-time="30000"
  offline-inactivity-time="600000"
></velt-presence>
const presenceElement = client.getPresenceElement();
presenceElement.setInactivityTime(30000);
presenceElement.setOfflineInactivityTime(600000);
```

**HTML: Configure via attributes**
**API: Configure programmatically**

---

### 3.2 Control Avatar Overflow with maxUsers

**Impact: MEDIUM (Limits displayed avatars and shows overflow count badge)**

When many users are present in a document, showing all avatars can overwhelm your toolbar layout. The `maxUsers` prop limits the visible avatars and displays an overflow count badge (e.g., "+5") for the remaining users.

**Why this matters:**

```javascript
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence maxUsers={3} />
  );
}
<velt-presence max-users="3"></velt-presence>
const presenceElement = client.getPresenceElement();
presenceElement.setMaxUsers(3);
```

This displays 3 avatar icons plus a "+N" badge showing how many additional users are present.
**HTML: Set max-users attribute**
**API: Set programmatically**

---

### 3.3 Control Current User Visibility in Presence

**Impact: MEDIUM (Include or exclude the current user from the presence avatar list)**

By default, `VeltPresence` includes the current user's avatar in the presence list. You can hide it with the `self` prop when your UI already displays the current user's identity elsewhere (e.g., a profile menu or account badge).

**Why this matters:**

```javascript
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence self={false} />
  );
}
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence self={true} />
  );
}
<velt-presence self="false"></velt-presence>
const presenceElement = client.getPresenceElement();

// Hide current user from presence
presenceElement.disableSelf();

// Show current user in presence
presenceElement.enableSelf();
```

**React: Show current user (default behavior)**
**HTML: Hide current user**
**API: Toggle programmatically**

---

### 3.4 Filter Presence by Location within a Document

**Impact: MEDIUM (Show presence scoped to a specific section or area of a document)**

In multi-section documents, you can scope presence to a specific section using the `locationId` prop. This shows only the users who are active in that particular area, rather than everyone viewing the document.

**Why this matters:**

```html
import { VeltPresence } from "@veltdev/react";

function SectionHeader({ sectionId, title }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <VeltPresence locationId={sectionId} />
    </div>
  );
}
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
<div class="section-header">
  <h2>Introduction</h2>
  <velt-presence location-id="section-intro"></velt-presence>
</div>

<div class="section-header">
  <h2>Analysis</h2>
  <velt-presence location-id="section-analysis"></velt-presence>
</div>
```

**React: Multiple sections with independent presence**
**HTML: Presence scoped to a location**

---

## 4. Cursor

**Impact: HIGH**

Real-time cursor tracking on canvas, page, or whitelisted elements via the VeltCursor component.

### 4.1 Set Up VeltCursor for Real-Time Cursor Tracking

**Impact: HIGH (Real-time cursor sharing for canvas, diagram, and spatial applications)**

`VeltCursor` renders real-time cursor positions for all active users in the document. It is best suited for canvas, diagram, and spatial applications where mouse position conveys intent -- such as ReactFlow, whiteboards, and image editors.

**Why this matters:**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasEditor() {
  return (
    <div className="canvas-container">
      <VeltCursor />
      {/* Your canvas content */}
    </div>
  );
}
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
        {/* ReactFlow, Konva, Fabric.js, etc. */}
      </main>
    </>
  );
}
"use client";
import { VeltPresence, VeltCursor } from "@veltdev/react";
import ReactFlow from "reactflow";

function FlowEditor({ nodes, edges }) {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <VeltPresence />
      <VeltCursor />
      <ReactFlow nodes={nodes} edges={edges} fitView />
    </div>
  );
}
```

**Place alongside VeltPresence and VeltComments**
**ReactFlow integration**

---

## 5. Events

**Impact: MEDIUM**

Subscription patterns for presence lifecycle events — covers user online/away/offline state-change subscriptions, including paired setup and teardown.

### 5.1 Subscribe to User State Change Events

**Impact: MEDIUM (React to user online/away/offline transitions for status indicators, logging, and auto-save triggers)**

Velt emits a `userStateChange` event whenever a user transitions between `online`, `away`, and `offline` states. Use this to build status indicators, activity logs, or trigger auto-save when collaborators leave.

**Why this matters:**

```js
"use client";
import { usePresenceEventCallback } from "@veltdev/react";

function StateChangeHandler() {
  usePresenceEventCallback("userStateChange", (event) => {
    // event shape: PresenceUserStateChangeEvent
    // { user: PresenceUser, state: 'online' | 'away' | 'offline' }

    switch (event.state) {
      case "online":
        showNotification(`${event.user.name} is back online`);
        break;
      case "away":
        // Tab focus loss immediately triggers 'away'
        console.log(`${event.user.name} went away`);
        break;
      case "offline":
        triggerAutoSave();
        logActivity(`${event.user.name} left the document`);
        break;
    }
  });

  return null;
}
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

**Vanilla JS: presenceElement.on()**

---

## 6. UI Customization

**Impact: MEDIUM-LOW**

Visual customization of the Presence avatar list, tooltip, and overflow badge via VeltPresenceWireframe.

### 6.1 Customize Presence Avatar UI with Wireframes

**Impact: MEDIUM (Build fully custom presence avatar layouts using wireframe building blocks)**

Velt provides wireframe components for complete control over presence avatar rendering. Use `VeltPresenceWireframe` for the avatar list layout and `VeltPresenceTooltipWireframe` for hover tooltips. These wireframes preserve all real-time functionality while letting you define custom structure and styling.

**Why this matters:**

```jsx
"use client";
import {
  VeltPresence,
  VeltPresenceWireframe,
} from "@veltdev/react";

function CustomPresence() {
  return (
    <>
      {/* Define the wireframe template */}
      <VeltPresenceWireframe>
        <VeltPresenceWireframe.AvatarList>
          <VeltPresenceWireframe.AvatarList.Item />
          <VeltPresenceWireframe.AvatarRemainingCount />
        </VeltPresenceWireframe.AvatarList>
      </VeltPresenceWireframe>

      {/* Render the presence component (picks up wireframe) */}
      <VeltPresence />
    </>
  );
}
"use client";
import {
  VeltPresence,
  VeltPresenceTooltipWireframe,
} from "@veltdev/react";

function CustomTooltipPresence() {
  return (
    <>
      <VeltPresenceTooltipWireframe>
        <VeltPresenceTooltipWireframe.Avatar />
        <VeltPresenceTooltipWireframe.StatusContainer>
          <VeltPresenceTooltipWireframe.UserName />
          <VeltPresenceTooltipWireframe.UserActive />
          <VeltPresenceTooltipWireframe.UserInactive />
        </VeltPresenceTooltipWireframe.StatusContainer>
      </VeltPresenceTooltipWireframe>

      <VeltPresence />
    </>
  );
}
<!-- Avatar list wireframe -->
<velt-presence-wireframe>
  <velt-presence-avatar-list-wireframe>
    <velt-presence-avatar-list-item-wireframe></velt-presence-avatar-list-item-wireframe>
    <velt-presence-avatar-remaining-count-wireframe></velt-presence-avatar-remaining-count-wireframe>
  </velt-presence-avatar-list-wireframe>
</velt-presence-wireframe>

<!-- Tooltip wireframe -->
<velt-presence-tooltip-wireframe>
  <velt-presence-tooltip-avatar-wireframe></velt-presence-tooltip-avatar-wireframe>
  <velt-presence-tooltip-status-container-wireframe>
    <velt-presence-tooltip-user-name-wireframe></velt-presence-tooltip-user-name-wireframe>
    <velt-presence-tooltip-user-active-wireframe></velt-presence-tooltip-user-active-wireframe>
    <velt-presence-tooltip-user-inactive-wireframe></velt-presence-tooltip-user-inactive-wireframe>
  </velt-presence-tooltip-status-container-wireframe>
</velt-presence-tooltip-wireframe>

<velt-presence></velt-presence>
<VeltPresence shadowDom={false} />
```

**React: VeltPresenceTooltipWireframe**
**HTML equivalents**
**Disable Shadow DOM for custom CSS**
When customizing wireframes, set `shadowDom={false}` on `VeltPresence` to allow your CSS to reach internal elements:
Only disable Shadow DOM when you need to apply custom styles to wireframe elements. The default Shadow DOM encapsulation prevents style leaking, which is desirable in most cases.

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

**Correct (let the wireframe iterate, read `componentConfig.user` per row, gate overflow with `filteredPresenceUsers.length > maxUsers`):**

```jsx
<VeltWireframe>
  <VeltPresenceWireframe>
    <VeltPresenceWireframe.AvatarList />
    <VeltPresenceWireframe.AvatarRemainingCount />
  </VeltPresenceWireframe>
</VeltWireframe>
```

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
These resolve **only** inside the iteration or tooltip tag that owns them — but still via the `componentConfig.<path>` form.
| Variable | Type | Available in | Notes |
|---|---|---|---|
| `componentConfig.user` | `PresenceUser` | `<velt-presence-avatar-list-item-wireframe>`, `<velt-presence-tooltip-wireframe>` and tooltip child tags | Per-row / hovered user. |
| `componentConfig.isActive` | `boolean` | Tooltip context | `true` when the hovered user is currently active. Branch active/inactive slots with `velt-if`. |
| `componentConfig.lastActiveAt` | `number` | Tooltip context | Unix timestamp the user was last active. |
| Wireframe tag (HTML) | React component | Notes |
|---|---|---|
| `<velt-presence-wireframe>` | `<VeltPresenceWireframe />` | Root — hosts every other tag. No extra variables. |
| `<velt-presence-avatar-list-wireframe>` | `<VeltPresenceWireframe.AvatarList />` | List container — iterates `componentConfig.filteredPresenceUsers`. |
| `<velt-presence-avatar-list-item-wireframe>` | `<VeltPresenceWireframe.AvatarListItem />` | Per-user avatar — `componentConfig.user` rebinds to the iteration's `PresenceUser`. |
| `<velt-presence-avatar-remaining-count-wireframe>` | `<VeltPresenceWireframe.AvatarRemainingCount />` | "+N" overflow badge. `shouldShow` requires `filteredPresenceUsers.length > maxUsers`. |
| `<velt-presence-tooltip-wireframe>` | `<VeltPresenceTooltipWireframe />` | Hover tooltip — exposes `user`, `isActive`, `lastActiveAt`. Composes the five child tags below. |
| `<velt-presence-tooltip-avatar-wireframe>` | — | Hovered user's avatar — bind `componentConfig.user.photoUrl`. |
| `<velt-presence-tooltip-status-container-wireframe>` | — | Wrapper for the active/inactive status row. |
| `<velt-presence-tooltip-user-name-wireframe>` | — | Hovered user's name — bind `componentConfig.user.name`. |
| `<velt-presence-tooltip-user-active-wireframe>` | `<VeltPresenceWireframe.Tooltip.UserActive>` | Renders when `componentConfig.isActive` is true. |
| `<velt-presence-tooltip-user-inactive-wireframe>` | `<VeltPresenceWireframe.Tooltip.UserInactive>` | Renders when `componentConfig.isActive` is false — show relative `lastActiveAt` here. |
**1. DO NOT bare-name presence state.** This family is flat-config — `<velt-data field="filteredPresenceUsers.length" />` resolves to nothing. Always use `componentConfig.filteredPresenceUsers.length`.
**2. DO NOT subscribe to `usePresenceData` to render the list manually.** The wireframe already iterates `componentConfig.filteredPresenceUsers` and applies max-users overflow. Hooks are for reading state alongside the wireframe, not for replacing it.
**3. DO NOT bind `isActive` / `lastActiveAt` outside a tooltip tag.** The tooltip iteration context only exists inside `<velt-presence-tooltip-wireframe>` and its descendants.
**4. DO NOT render both `tooltip-user-active` and `tooltip-user-inactive` unconditionally.** Each must be gated with `velt-if="{componentConfig.isActive}"` and `velt-if="!{componentConfig.isActive}"` respectively — otherwise both render simultaneously.

---

## 8. Debugging

**Impact: LOW-MEDIUM**

Troubleshooting patterns for presence-not-showing, stale-state, and identity-mismatch issues.

### 8.1 Troubleshoot Common Presence Issues

**Impact: LOW-MEDIUM (Quick fixes for common presence setup and runtime problems)**

Common issues and solutions when integrating Velt Presence.

**Issue 1: Presence not showing**

**Solutions:**

```jsx
// 1. Ensure VeltProvider wraps all Velt components with authProvider
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={{
    user: { userId: "user-1", organizationId: "org-1", name: "Alice" },
    generateToken: async () => fetchToken(),
  }}
>
  <VeltPresence />  {/* Must be inside provider */}
</VeltProvider>

// 2. Ensure setDocuments is called to scope presence
import { useSetDocuments } from "@veltdev/react";
useSetDocuments([{ id: "my-document-id" }]);

// 3. For Next.js, add 'use client' directive at top of file
```

**Issue 2: Users stuck on "online" (never go away/offline)**
**Symptoms:** User avatars show as online even after they leave or go idle.

**Solutions:**

```jsx
// Check inactivityTime configuration
<VeltPresence inactivityTime={300000} />
// Default: 5 minutes (300000ms). Set lower for faster away detection.

// Ensure tab focus/blur events are not being intercepted
// Some frameworks or iframes can block visibility change events.
// Test in a standalone page first.
```

**Issue 3: All users showing across all documents**
**Symptoms:** Users from other documents appear in your presence list.

**Solutions:**

```jsx
// setDocuments MUST be called to scope presence to a specific document
import { useSetDocuments } from "@veltdev/react";

function DocumentPage({ docId }) {
  // This scopes presence (and comments, cursors) to this document
  useSetDocuments([{ id: docId }]);

  return <VeltPresence />;
}
```

**Issue 4: Avatar click not working**
**Symptoms:** Clicking on a presence avatar does nothing.

**Solutions:**

```jsx
// Use onPresenceUserClick callback
<VeltPresence
  onPresenceUserClick={(user) => {
    console.log("Clicked user:", user);
    navigateToUserLocation(user);
  }}
/>
```

**Issue 5: User count is wrong**
**Symptoms:** Fewer or more users shown than expected.

**Solutions:**

```jsx
// Check the 'self' prop -- controls whether current user appears
<VeltPresence self={true} />   {/* Include self in avatar list */}
<VeltPresence self={false} />  {/* Exclude self (default) */}

// Check maxUsers -- limits visible avatars before overflow
<VeltPresence maxUsers={5} />
// Remaining users appear as "+N" count. This does not affect
// the actual presence data, only the visible avatar count.
```

- [ ] `VeltProvider` renders with valid `apiKey` and `authProvider`
- [ ] `authProvider.user` has `userId`, `organizationId`, and `name`
- [ ] `useSetDocuments` (or `client.setDocuments`) is called with a document ID
- [ ] `'use client'` directive present in Next.js components using Velt
- [ ] Domain is safelisted in the Velt Console
- [ ] Test with two browser tabs using different user identities
- [ ] Check browser console for Velt SDK errors
- [ ] `inactivityTime` is set to an appropriate value for your use case
- [ ] `self` prop matches your expected behavior (show/hide current user)
- [ ] `maxUsers` is not set too low (hiding users you expect to see)
> **Source:** Velt Presence Troubleshooting -- common integration issues and configuration checks

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/realtime-collaboration/presence/overview
- https://docs.velt.dev/realtime-collaboration/presence/setup
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior
- https://docs.velt.dev/ui-customization/features/realtime/presence-wireframe-variables
- https://console.velt.dev
