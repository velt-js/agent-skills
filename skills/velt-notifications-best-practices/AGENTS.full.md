# Velt Notifications Best Practices

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

Comprehensive Velt Notifications implementation guide covering in-app notifications, email delivery, webhook integrations, and user preference management. This skill provides evidence-backed patterns for integrating Velt's notification system into React, Next.js, and other web applications. Covers notification panel setup, tab configuration, data access hooks and APIs, settings management, custom notification triggers, and delivery channel routing.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Enable Notifications and Add VeltNotificationsTool](#11-enable-notifications-and-add-veltnotificationstool)

2. [Panel Configuration](#2-panel-configuration) — **HIGH**
   - 2.1 [Configure Notification Panel Tabs](#21-configure-notification-panel-tabs)
   - 2.2 [Control Notification Panel Display Mode](#22-control-notification-panel-display-mode)
   - 2.3 [Filter Notifications to Current Document Only](#23-filter-notifications-to-current-document-only)

3. [Data Access](#3-data-access) — **HIGH**
   - 3.1 [Use React Hooks to Access Notification Data](#31-use-react-hooks-to-access-notification-data)
   - 3.2 [Use Notification Actions to Manage Read State and Click Handling](#32-use-notification-actions-to-manage-read-state-and-click-handling)
   - 3.3 [Use NotificationDataProvider to Fetch and Delete Notifications from Your Own Backend](#33-use-notificationdataprovider-to-fetch-and-delete-notifications-from-your-own-backend)
   - 3.4 [Use REST APIs for Server-Side Notification Management](#34-use-rest-apis-for-server-side-notification-management)

4. [Settings Management](#4-settings-management) — **MEDIUM-HIGH**
   - 4.1 [Configure Notification Delivery Channels](#41-configure-notification-delivery-channels)
   - 4.2 [Manage Per-User Notification Config via REST API](#42-manage-per-user-notification-config-via-rest-api)

5. [Configuration](#5-configuration) — **MEDIUM**
   - 5.1 [Configure Cross-Organization Notifications for Multi-Org Users](#51-configure-cross-organization-notifications-for-multi-org-users)
   - 5.2 [Enable User-Scoped Notifications So Unread Items Stay in the For You Tab](#52-enable-user-scoped-notifications-so-unread-items-stay-in-the-for-you-tab)

6. [Notification Triggers](#6-notification-triggers) — **MEDIUM**
   - 6.1 [Create Custom Notifications via REST API](#61-create-custom-notifications-via-rest-api)
   - 6.2 [Enable Self-Notifications for Own Actions](#62-enable-self-notifications-for-own-actions)

7. [Delivery Channels](#7-delivery-channels) — **MEDIUM**
   - 7.1 [Configure Notification Delay and Batching Pipeline](#71-configure-notification-delay-and-batching-pipeline)
   - 7.2 [Forward Notifications to External Services via Webhooks](#72-forward-notifications-to-external-services-via-webhooks)
   - 7.3 [Set Up Email Notifications with SendGrid](#73-set-up-email-notifications-with-sendgrid)

8. [UI Customization](#8-ui-customization) — **MEDIUM**
   - 8.1 [Customize Notification Components with Wireframes](#81-customize-notification-components-with-wireframes)

9. [Wireframe Variables](#9-wireframe-variables) — **MEDIUM**
   - 9.1 [Bind Notifications Panel Wireframe Slots Using Template Variables](#91-bind-notifications-panel-wireframe-slots-using-template-variables)
   - 9.2 [Bind Notifications Tool Wireframe Slots Using Template Variables](#92-bind-notifications-tool-wireframe-slots-using-template-variables)

10. [Debugging & Testing](#10-debugging-testing) — **LOW-MEDIUM**
   - 10.1 [Debug Common Notification Issues](#101-debug-common-notification-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns required for any Velt notifications implementation. Includes enabling notifications in the console, adding VeltNotificationsTool, and the component props (most feature toggles are shared across the tool and panel).

### 1.1 Enable Notifications and Add VeltNotificationsTool

**Impact: CRITICAL (Required for notifications to function)**

Notifications must be enabled in the Velt Console before adding the VeltNotificationsTool component. The tool provides the bell icon that opens the notification panel.

**Incorrect (missing console setup or tool component):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      {/* Missing VeltNotificationsTool - users won't see notifications */}
      <YourApp />
    </VeltProvider>
  );
}
```

**Correct (console enabled + tool component added):**

```jsx
import { VeltProvider, VeltNotificationsTool } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      {/* Step 1: Enable Notifications in Console at console.velt.dev */}
      {/* Step 2: Add VeltNotificationsTool in your toolbar */}
      <div className="toolbar">
        <VeltNotificationsTool shadowDom={false} />
      </div>
      <YourApp />
    </VeltProvider>
  );
}
```

**For HTML:**

```html
<velt-notifications-tool></velt-notifications-tool>
```

**Setup Steps:**

1. **Enable in Console**: Open the [Notifications section](https://console.velt.dev/dashboard/config/notification) under Configurations in the Velt Console and enable Notifications. Notifications do not work until this is on.
2. **Add Tool Component**: Place `VeltNotificationsTool` in your app's toolbar/header
3. **Embed Panel (optional)**: Use `VeltNotificationsPanel` for a dedicated page or section. The tool adds and removes its own panel automatically, so only embed the panel when you want it permanently visible.

**Component Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabConfig` | `object` | All tabs enabled | Rename or disable tabs (`forYou`, `documents`, `all`) |
| `panelOpenMode` | `'popover' \| 'sidebar'` | `'popover'` | How the tool opens its panel |
| `pageSize` | `number` | `5` | Notifications per tab page in the panel; only positive numbers are accepted |
| `maxDays` | `number` | `15` | Max age in days of fetched notifications (tool prop; also `setMaxDays()`) |
| `settings` | `boolean` | `false` | Show the settings gear (also enable settings in the Console) |
| `selfNotifications` | `boolean` | `false` | Include the user's own actions |
| `considerAllNotifications` | `boolean` | `false` | Tool only. Unread badge counts all tabs instead of only For You |
| `readNotificationsOnForYouTab` | `boolean` | `false` | Keep read notifications in the For You tab |
| `enableSettingsAtOrganizationLevel` | `boolean` | `false` | Settings apply to all documents in the organization instead of per document |
| `enableCrossOrganization` | `boolean \| object \| string` | off | Merge For You notifications from the user's other organizations |
| `enableUserScopedNotifications` | `boolean \| object \| string` | off | Fetch the user's newest notifications directly (see `config-user-scoped-notifications`) |
| `settingsLayout` | `'accordion' \| 'dropdown'` | `'accordion'` | Settings UI layout |
| `darkMode` | `boolean` | `false` | Dark mode |
| `shadowDom` | `boolean` | `true` | Component shadow DOM |
| `panelShadowDom` | `boolean` | `true` | Tool only. Shadow DOM of the panel the tool opens (set `false` for custom CSS) |
| `variant` | `string` | None | Wireframe variant for the component |
| `panelVariant` | `string` | None | Tool only. Wireframe variant for the panel the tool opens |
| `onNotificationClick` | `callback` | None | Notification click handler |

**Shared vs per-instance props:** `settings`, `selfNotifications`, `readNotificationsOnForYouTab`, `enableCrossOrganization`, `enableUserScopedNotifications`, `enableSettingsAtOrganizationLevel`, and `maxDays` write to a shared notification service. Setting one on either the tool or the panel changes the data for both, so configure each in one place. `tabConfig`, `pageSize`, `panelOpenMode`, `settingsLayout`, `variant`, and `shadowDom` stay scoped to the component they are set on.

**Default Behavior:**

- "For You" tab fetches the latest 50 notifications
- "Document" and "All" tabs fetch up to 15 notifications for each of the 15 most recently active documents the user can access (use `config-user-scoped-notifications` to keep unread items from older documents visible)
- Notifications older than 15 days are not fetched (configurable via `maxDays` / `setMaxDays`)
- Notifications are only generated and fetched for documents the user has access to; a notification for a private comment only reaches users who can see that comment

**Verification:**
- [ ] Notifications enabled in Velt Console
- [ ] VeltNotificationsTool added to app
- [ ] Tool appears in UI (bell icon)
- [ ] Clicking tool opens notification panel

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/setup - "Enable Notifications in the Velt Console", "Add the Notifications Tool component"
- https://docs.velt.dev/async-collaboration/notifications/overview#default-configuration - "Default Configuration"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - per-prop defaults and shared-service behavior

---

## 2. Panel Configuration

**Impact: HIGH**

Configuration options for the notifications panel. Includes tab setup (forYou, all, documents), panel open modes (popover, sidebar), display options, and document filtering.

### 2.1 Configure Notification Panel Tabs

**Impact: HIGH (Customize which notification categories users see)**

The notification panel has three tabs: forYou, all, and documents. Use `tabConfig` to rename, enable/disable, or reorder these tabs.

**Incorrect (using wrong config structure):**

```jsx
// Wrong: trying to pass tab config as separate props
<VeltNotificationsTool
  forYouTab={false}
  allTab={true}
/>
```

**Correct (using tabConfig prop):**

```jsx
import { VeltNotificationsTool } from '@veltdev/react';

<VeltNotificationsTool
  tabConfig={{
    "forYou": {
      name: 'Mentions',      // Custom display name
      enable: true           // Show this tab
    },
    "documents": {
      name: 'By Document',
      enable: true
    },
    "all": {
      name: 'All Activity',
      enable: false          // Hide this tab
    }
  }}
/>
```

**Available Tabs:**

By default, all three tabs are enabled.

| Tab Key | Description | Default |
|---------|-------------|---------|
| `forYou` | Notifications where user is directly involved (@mentions, replies) | Enabled |
| `all` | All notifications grouped by document | Enabled |
| `documents` | Notifications organized by document | Enabled |

**Notes:**
- A tab stays enabled unless its entry sets `enable: false`, so omitting a key leaves that tab on.
- If you disable `forYou`, the initially selected tab falls back to `documents`, then `all`.
- The customize-behavior page documents the three keys above. The behaviors reference also lists a `people` key (same `{ name, enable }` shape) for the People tab, which has a `TabPeople` wireframe. Only rely on `people` if your installed SDK accepts it.

**For HTML:**

```html
<velt-notifications-tool
  tab-config='{"forYou":{"name":"Mentions","enable":true},"all":{"name":"Activity","enable":true},"documents":{"name":"Docs","enable":true}}'>
</velt-notifications-tool>
```

**API Method Alternative:**

```jsx
import { useVeltClient } from '@veltdev/react';

function ConfigureNotifications() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      const notificationElement = client.getNotificationElement();
      notificationElement.setTabConfig({
        "forYou": { name: 'Mentions', enable: true },
        "documents": { name: 'Documents', enable: false },
        "all": { name: 'All', enable: true }
      });
    }
  }, [client]);
}
```

**Primitive-Level Feed Selection (`listType`):**

When building a custom panel out of primitives instead of `VeltNotificationsTool`, use the `listType` prop on `VeltNotificationsPanelContentList` and `VeltNotificationsPanelContentLoadMore` to choose which feed each primitive renders or paginates from the shared context. Valid values: `'all'` (default) and `'for-you'`.

```jsx
import {
  VeltNotificationsPanelContentList,
  VeltNotificationsPanelContentLoadMore,
} from '@veltdev/react';

// Render the "For You" feed in a custom panel
<VeltNotificationsPanelContentList listType="for-you" />
<VeltNotificationsPanelContentLoadMore listType="for-you" />
```

**For HTML:**

```html
<velt-notifications-panel-content-list list-type="for-you"></velt-notifications-panel-content-list>
<velt-notifications-panel-content-load-more list-type="for-you"></velt-notifications-panel-content-load-more>
```

`listType` is ignored when `notifications` is bound directly to the list primitive.

**Verification:**
- [ ] tabConfig object uses correct tab keys
- [ ] Each tab has name and enable properties
- [ ] Disabled tabs do not appear in panel
- [ ] When using primitives, `listType` matches the intended feed (`'all'` vs `'for-you'`) on both the list and the load-more button

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#settabconfig - "setTabConfig"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - "tabConfig" (enable-unless-false rule, default-tab fallback)
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/primitives - VeltNotificationsPanelContentList, VeltNotificationsPanelContentLoadMore

---

### 2.2 Control Notification Panel Display Mode

**Impact: HIGH (Choose between popover and sidebar panel layouts)**

The notification panel can open as a popover (default) or sidebar. You can also embed it directly in your page layout.

**Incorrect (not specifying display preference):**

```jsx
// Default popover may not fit your layout
<VeltNotificationsTool />
```

**Correct (specifying panel open mode):**

```jsx
import { VeltNotificationsTool } from '@veltdev/react';

// Option 1: Popover mode (default)
<VeltNotificationsTool panelOpenMode="popover" />

// Option 2: Sidebar mode - slides in from side
<VeltNotificationsTool panelOpenMode="sidebar" />
```

In `sidebar` mode the panel keeps all fetched notifications in the session list, so the list stays stable as a persistent column; `popover` keeps the leaner open-on-demand set.

**Embedded Panel (no tool button):**

```jsx
import { VeltNotificationsPanel } from '@veltdev/react';

function NotificationsSidebar() {
  return (
    <div className="sidebar">
      {/* Panel embedded directly in layout */}
      <VeltNotificationsPanel />
    </div>
  );
}
```

**Programmatic Panel Control:**

```jsx
import { useVeltClient } from '@veltdev/react';

function NotificationControls() {
  const { client } = useVeltClient();

  const openPanel = () => {
    const notificationElement = client?.getNotificationElement();
    notificationElement?.openNotificationsPanel();
  };

  const closePanel = () => {
    const notificationElement = client?.getNotificationElement();
    notificationElement?.closeNotificationsPanel();
  };

  return (
    <>
      <button onClick={openPanel}>Open Notifications</button>
      <button onClick={closePanel}>Close Notifications</button>
    </>
  );
}
```

`openNotificationsPanel()` / `closeNotificationsPanel()` do not work when you have embedded `VeltNotificationsPanel` directly in your layout; they control the panel opened by `VeltNotificationsTool`.

**Using Hook for Panel Control:**

```jsx
import { useNotificationUtils } from '@veltdev/react';

function NotificationButton() {
  const notificationElement = useNotificationUtils();

  return (
    <button onClick={() => notificationElement.openNotificationsPanel()}>
      View Notifications
    </button>
  );
}
```

**For HTML:**

```html
<!-- Popover mode -->
<velt-notifications-tool panel-open-mode="popover"></velt-notifications-tool>

<!-- Sidebar mode -->
<velt-notifications-tool panel-open-mode="sidebar"></velt-notifications-tool>

<!-- Embedded panel -->
<velt-notifications-panel></velt-notifications-panel>
```

**Controlling Initial Load Count:**

```jsx
// Notifications shown per tab page (default: 5); "Load more" pages in steps of this size
<VeltNotificationsTool pageSize={20} />
<VeltNotificationsPanel pageSize={20} />
```

**For HTML:**

```html
<velt-notifications-tool page-size="20"></velt-notifications-tool>
```

**Verification:**
- [ ] Panel mode matches application layout needs
- [ ] Embedded panels have proper container styling
- [ ] Programmatic controls work as expected
- [ ] pageSize set if default load count needs adjustment

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#panelopenmode - "panelOpenMode"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#opennotificationspanel - "openNotificationsPanel"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#pagesize - "pageSize"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - "panelOpenMode", "pageSize" defaults

---

### 2.3 Filter Notifications to Current Document Only

**Impact: MEDIUM (Reduces notification noise by showing only current document notifications)**

By default, the notification panel shows notifications from the 15 most recently active documents accessible to the current user. Use `enableCurrentDocumentOnly()` to restrict the panel to notifications from the current document only.

**Incorrect (no document filtering when only current doc matters):**

```jsx
// Shows notifications from all recent documents — too noisy for single-document views
<VeltNotificationsTool />
```

**Correct (React / Next.js — using useNotificationUtils hook):**

```jsx
import { useNotificationUtils } from '@veltdev/react';
import { useEffect } from 'react';

function DocumentNotifications() {
  const notificationElement = useNotificationUtils();

  useEffect(() => {
    if (!notificationElement) return;

    // Show only notifications from the current document
    notificationElement.enableCurrentDocumentOnly();

    // To restore default behavior (show all recent documents):
    // notificationElement.disableCurrentDocumentOnly();
  }, [notificationElement]);

  return <VeltNotificationsTool />;
}
```

**Correct (React / Next.js — using API):**

```jsx
import { useVeltClient } from '@veltdev/react';

function DocumentNotifications() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const notificationElement = client.getNotificationElement();
    notificationElement.enableCurrentDocumentOnly();
  }, [client]);
}
```

**Correct (Other Frameworks):**

```jsx
const notificationElement = Velt.getNotificationElement();
notificationElement.enableCurrentDocumentOnly();

// To restore default:
notificationElement.disableCurrentDocumentOnly();
```

**Primitive-Level Document Scoping (`documentId`):**

When building a custom panel out of primitives instead of `VeltNotificationsTool`, pass `documentId` to `VeltNotificationsPanelContentList` and `VeltNotificationsPanelContentLoadMore` to render and paginate notifications for a single document from `notificationsByDocumentId`. This scopes the list/load-more to that document without flipping the global `enableCurrentDocumentOnly()` switch.

```jsx
import {
  VeltNotificationsPanelContentList,
  VeltNotificationsPanelContentLoadMore,
} from '@veltdev/react';

<VeltNotificationsPanelContentList documentId="doc-123" />
<VeltNotificationsPanelContentLoadMore documentId="doc-123" />
```

**For HTML:**

```html
<velt-notifications-panel-content-list document-id="doc-123"></velt-notifications-panel-content-list>
<velt-notifications-panel-content-load-more document-id="doc-123"></velt-notifications-panel-content-load-more>
```

`documentId` is ignored when `notifications` is bound directly to the list primitive.

**Verification Checklist:**
- [ ] `enableCurrentDocumentOnly()` called after Velt client is initialized
- [ ] Document ID is set via `setDocument()` before enabling
- [ ] `disableCurrentDocumentOnly()` used when switching back to multi-document view
- [ ] When using primitives, the same `documentId` is passed to both the list and the matching load-more so pagination stays scoped to that document

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - enableCurrentDocumentOnly
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/primitives - VeltNotificationsPanelContentList, VeltNotificationsPanelContentLoadMore

---

## 3. Data Access

**Impact: HIGH**

Patterns for accessing notification data. Includes React hooks (useNotificationsData, useUnreadNotificationsCount), SDK APIs, REST API endpoints, and the NotificationDataProvider resolver for fetching and deleting custom notifications from your own backend.

### 3.1 Use React Hooks to Access Notification Data

**Impact: HIGH (Real-time access to notification data in React components)**

Velt provides React hooks for accessing notification data reactively. Use these for custom notification displays or badges.

**Incorrect (polling or manual fetching):**

```jsx
// Wrong: Manually fetching notifications
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetchNotifications();
    setNotifications(data);
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

**Correct (using Velt hooks):**

```jsx
import {
  useNotificationsData,
  useUnreadNotificationsCount
} from '@veltdev/react';

function NotificationBadge() {
  // Get all notification data
  const notificationData = useNotificationsData();

  // Get data for specific tab
  const forYouData = useNotificationsData({ type: 'forYou' });
  const allData = useNotificationsData({ type: 'all' });

  // Get unread counts
  const unreadCount = useUnreadNotificationsCount();
  // Returns: { forYou: number, all: number }

  return (
    <div className="notification-badge">
      <span className="count">{unreadCount?.forYou || 0}</span>
      <span>unread notifications</span>
    </div>
  );
}
```

**Available Hooks:**

| Hook | Returns | Description |
|------|---------|-------------|
| `useNotificationsData()` | `Notification[]` | All notifications |
| `useNotificationsData({ type: 'forYou' })` | `Notification[]` | Filtered by tab type |
| `useUnreadNotificationsCount()` | `{ forYou: number, all: number }` | Unread counts |
| `useNotificationUtils()` | Utility functions | Panel control methods |
| `useNotificationEventCallback('settingsUpdated')` | Settings event | Fires when user updates settings |

**Handling Notification Click Events:**

```jsx
import { VeltNotificationsTool, VeltNotificationsPanel } from '@veltdev/react';

function NotificationHandler() {
  // Handle notification clicks via component prop
  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    // Navigate to the relevant content
    router.push(`/document/${notification.documentId}`);
  };

  return (
    <VeltNotificationsTool
      onNotificationClick={handleNotificationClick}
    />
    // Or for embedded panel:
    // <VeltNotificationsPanel onNotificationClick={handleNotificationClick} />
  );
}
```

**Handling Settings Update Events:**

```jsx
import { useNotificationEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function SettingsHandler() {
  // Hook is specifically for settings update events
  const settingsUpdatedEvent = useNotificationEventCallback('settingsUpdated');

  useEffect(() => {
    console.log('Settings updated:', settingsUpdatedEvent);
  }, [settingsUpdatedEvent]);

  return null;
}
```

**SDK API Alternative (using `useNotificationUtils()`):**

```jsx
import { useNotificationUtils } from '@veltdev/react';

function NotificationData() {
  const notificationElement = useNotificationUtils();

  useEffect(() => {
    if (!notificationElement) return;

    // Subscribe to notifications
    const subscription = notificationElement
      .getNotificationsData()
      .subscribe((notifications) => {
        console.log('Notifications:', notifications);
      });

    // Subscribe to unread count
    const countSub = notificationElement
      .getUnreadNotificationsCount()
      .subscribe((count) => {
        console.log('Unread:', count);
      });

    return () => {
      subscription.unsubscribe();
      countSub.unsubscribe();
    };
  }, [notificationElement]);
}
```

**Notification Model:**

```typescript
interface Notification {
  id: string;                          // Unique notification ID
  notificationSource: string;          // 'comment', 'huddle', 'crdt', 'custom'
  actionType?: string;                 // e.g., 'added'
  isUnread?: boolean;                  // Read/unread state
  actionUser?: User;                   // User who triggered the notification
  timestamp?: number;                  // Unix timestamp
  displayHeadlineMessage?: string;     // Resolved headline text
  displayBodyMessage?: string;         // Body text
  displayHeadlineMessageTemplate?: string;  // Template with {variables}
  displayHeadlineMessageTemplateData?: object; // Template variable values
  forYou?: boolean;                    // Appears in For You tab
  targetAnnotationId?: string;         // Related annotation ID
  notificationSourceData?: any;        // Custom data from source
  metadata?: NotificationMetadata;     // Document/org context
  notifyUsers?: Record<string, boolean>;       // Users by email hash
  notifyUsersByUserId?: Record<string, boolean>; // Users by user ID hash
  isNotificationResolverUsed?: boolean; // True when resolver handled PII
}
```

**SettingsUpdatedEvent:**

```typescript
interface SettingsUpdatedEvent {
  settings: NotificationSettingsConfig; // Updated channel settings
  isMutedAll: boolean;                  // True if all channels muted
}
```

**GetNotificationsDataQuery:**

```typescript
interface GetNotificationsDataQuery {
  type?: 'all' | 'forYou' | 'documents'; // Filter by tab type
}
```

**NotificationMetadata:**

```typescript
interface NotificationMetadata {
  apiKey?: string;                     // Velt API key
  organizationId?: string;             // Organization ID
  clientOrganizationId?: string;       // Client-side org ID
  documentId?: string;                 // Document ID
  clientDocumentId?: string;           // Client-side document ID
  locationId?: number;                 // Location within document
  location?: Location;                 // Location object
  folderId?: string;                   // Folder ID
  veltFolderId?: string;               // Velt folder ID
  documentMetadata?: object;           // Custom document metadata
  organizationMetadata?: object;       // Custom org metadata
  sdkVersion?: string | null;          // SDK version that created notification
}
```

**Notification Sources:**

| Source | Description | Triggered by |
|--------|-------------|-------------|
| `'comment'` | Comment-related notifications | Adding comments, @mentions, replies |
| `'huddle'` | Huddle/call notifications | Starting or joining huddles |
| `'crdt'` | CRDT editing notifications | Collaborative editing events |
| `'custom'` | Custom notifications | REST API `/v2/notifications/add` — routed through Notification Resolver if configured |

**Verification:**
- [ ] Hooks imported from @veltdev/react
- [ ] Component re-renders when data changes
- [ ] Type parameter used correctly for filtered data

**Source Pointer:** https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Data, Events

---

### 3.2 Use Notification Actions to Manage Read State and Click Handling

**Impact: MEDIUM-HIGH (Enables programmatic control over notification read state and custom click handlers)**

Velt provides APIs to mark individual or all notifications as read and to handle notification click events. Use these to build custom notification workflows, navigation on click, and read-state management.

**Incorrect (no read-state management or click handling):**

```jsx
// Notifications pile up with no way to mark them as read
// No custom action when user clicks a notification
<VeltNotificationsTool />
```

**Correct (mark single notification as read):**

```jsx
import { useVeltClient } from '@veltdev/react';

function MarkAsRead({ notificationId }) {
  const { client } = useVeltClient();

  const handleMarkRead = () => {
    const notificationElement = client?.getNotificationElement();
    notificationElement?.markNotificationAsReadById(notificationId);
  };

  return <button onClick={handleMarkRead}>Mark Read</button>;
}
```

**Correct (mark all notifications as read):**

```jsx
const notificationElement = client.getNotificationElement();

// Mark all notifications as read across all tabs
notificationElement.setAllNotificationsAsRead();

// Mark only "For You" tab as read
notificationElement.setAllNotificationsAsRead({ tabId: 'for-you' });

// Mark "All" or "Document" tab as read (equivalent to marking all)
notificationElement.setAllNotificationsAsRead({ tabId: 'all' });
notificationElement.setAllNotificationsAsRead({ tabId: 'document' });
```

**Correct (handle notification click events):**

```jsx
import { VeltNotificationsTool, VeltNotificationsPanel } from '@veltdev/react';

function NotificationPanel() {
  const onNotificationClickEvent = (notification) => {
    console.log('Notification clicked:', notification);
    // Navigate to the relevant part of the app
    // e.g., router.push(`/doc/${notification.documentId}`)
  };

  // Listen via Tool or Panel — but not both
  return (
    <VeltNotificationsTool
      onNotificationClick={(notification) => onNotificationClickEvent(notification)}
    />
  );
}
```

**Correct (Other Frameworks — click event):**

```html
<script>
const notificationsTool = document.querySelector('velt-notifications-tool');
notificationsTool?.addEventListener('onNotificationClick', (event) => {
  console.log('Notification clicked:', event.detail);
});
</script>
```

**API Reference:**

| Method | Description |
|--------|-------------|
| `markNotificationAsReadById(notificationId)` | Mark a single notification as read in all tabs |
| `setAllNotificationsAsRead()` | Mark all notifications as read across all tabs |
| `setAllNotificationsAsRead({ tabId })` | Mark notifications as read for a specific tab (`for-you`, `all`, `document`) |
| `onNotificationClick` (prop) | Callback fired when a notification is clicked; receives a `Notification` object |

**Verification Checklist:**
- [ ] `markNotificationAsReadById` called with a valid notification ID
- [ ] `onNotificationClick` listener set on either Tool or Panel, not both
- [ ] Click handler implements navigation or custom action as needed
- [ ] `setAllNotificationsAsRead` uses correct `tabId` values

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Actions (markNotificationAsReadById, setAllNotificationsAsRead, onNotificationClick)

---

### 3.3 Use NotificationDataProvider to Fetch and Delete Notifications from Your Own Backend

**Impact: HIGH (Routes custom notification data through your backend resolver instead of Velt's storage, enabling full control over notification PII and lifecycle)**

Register a `NotificationDataProvider` as `dataProviders.notification` (the `VeltProvider` `dataProviders` prop in React, `Velt.setDataProviders()` elsewhere) so Velt calls your `get` and `delete` handlers instead of storing notification content on its servers. Only notifications with `notificationSource === 'custom'` are routed through this resolver. The resolution pipeline runs notification → user → comment, and enriched notifications carry `isNotificationResolverUsed: true`.

**Incorrect (wrong response shape, provider set too late):**

```jsx
// Registered after identify(), and returns { status, data: [] }.
// ResolverResponse needs success + statusCode, and data keyed by notificationId.
client.setDataProviders({
  notification: {
    get: async ({ organizationId, notificationIds }) => {
      const rows = await myBackend.fetchNotifications(organizationId, notificationIds);
      return { status: 200, data: rows };
    },
  },
});
```

**Correct (React / Next.js, function-based provider on VeltProvider):**

```jsx
import { VeltProvider } from '@veltdev/react';

const notificationDataProvider = {
  // request: { organizationId, notificationIds }
  get: async (request) => {
    const response = await fetch('/api/velt/notifications/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    // Must resolve to ResolverResponse<Record<notificationId, PartialNotification>>:
    // { success: true, statusCode: 200, data: { 'custom-notif-001': { notificationId: 'custom-notif-001', ... } } }
    return await response.json();
  },
  // request: { notificationId, organizationId }
  delete: async (request) => {
    const response = await fetch('/api/velt/notifications/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return await response.json(); // { success: true, statusCode: 200 }
  },
  config: {
    resolveTimeout: 5000,
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 3, retryDelay: 2000 },
  },
};

<VeltProvider apiKey="YOUR_API_KEY" dataProviders={{ notification: notificationDataProvider }}>
  {/* app */}
</VeltProvider>
```

**Correct (Other Frameworks, endpoint-based provider):**

```js
// Let the SDK POST the request body to your endpoints
const notificationDataProvider = {
  config: {
    getConfig: {
      url: 'https://your-backend.com/api/velt/notifications/get',
      headers: { Authorization: 'Bearer YOUR_TOKEN' },
    },
    deleteConfig: {
      url: 'https://your-backend.com/api/velt/notifications/delete',
      headers: { Authorization: 'Bearer YOUR_TOKEN' },
    },
    resolveTimeout: 5000,
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 3, retryDelay: 2000 },
  },
};

// Call before Velt.identify()
Velt.setDataProviders({ notification: notificationDataProvider });
```

**NotificationDataProvider:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `get` | `(request: GetNotificationResolverRequest) => Promise<ResolverResponse<Record<string, PartialNotification>>>` | No | Fetch notification PII. Request: `{ organizationId, notificationIds }`. |
| `delete` | `(request: DeleteNotificationResolverRequest) => Promise<ResolverResponse<undefined>>` | No | Delete notification PII. Request: `{ notificationId, organizationId }`. |
| `config` | `NotificationResolverConfig` | No | `resolveTimeout` (ms), `getRetryConfig`, `deleteRetryConfig` (`RetryConfig`: `retryCount`, `retryDelay`, `revertOnFailure`), `getConfig` / `deleteConfig` (`ResolverEndpointConfig`: `url`, `headers`, optional `credentials`). |

`PartialNotification` requires `notificationId` and may carry `displayHeadlineMessageTemplate`, `displayHeadlineMessageTemplateData`, `displayBodyMessage`, `displayBodyMessageTemplate`, `displayBodyMessageTemplateData`, `notificationSourceData`, and custom fields.

**Key Constraints:**
- Set data providers before calling `identify` (or before `authProvider` signs the user in).
- Every handler response must include `success` (boolean) and `statusCode` (`200` for success, e.g. `500` for errors) so Velt can handle errors and retries.
- Only `notificationSource === 'custom'` notifications call your provider. Write them via the Add Notifications REST API with `notificationSource: 'custom'` and `isNotificationResolverUsed: true`, omitting `displayHeadlineMessageTemplate` / `displayBodyMessage` (see `triggers-custom`).
- Velt stores only routing identifiers (`notificationId`, `actionUser`, hashed `notifyUsers` / `notifyUsersByUserId`), `notificationSource`, and the `isNotificationResolverUsed` flag.
- If `get` fails, the notification renders without enriched PII and is retried if retries are configured.
- Function-based and endpoint-based approaches can be combined. `headers` may also be an async function resolved per request.
- Debug with `client.on('dataProvider')` (React) / `Velt.on('dataProvider')` and unsubscribe when done.

**Verification Checklist:**
- [ ] Provider registered before `identify` / sign-in
- [ ] `get` returns `{ success: true, statusCode: 200, data: { [notificationId]: PartialNotification } }`
- [ ] `delete` returns `{ success: true, statusCode: 200 }` on success
- [ ] Custom notifications are written with `notificationSource: 'custom'` and `isNotificationResolverUsed: true`
- [ ] `resolveTimeout` and retry configs tuned for your backend latency

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/notifications - "Notifications" self-hosting (function and endpoint providers, resolver-eligible writes)
- https://docs.velt.dev/api-reference/sdk/models/data-models#notificationdataprovider - "NotificationDataProvider"
- https://docs.velt.dev/api-reference/sdk/models/data-models#resolverresponse - "ResolverResponse"
- https://docs.velt.dev/api-reference/sdk/models/data-models#notification - "Notification" (`isNotificationResolverUsed`)

---

### 3.4 Use REST APIs for Server-Side Notification Management

**Impact: HIGH (Programmatic access to notifications from backend services)**

Use Velt's REST APIs to get, update, or create notifications from your backend. Requires API key and auth token.

**Incorrect (client-side only approach):**

```jsx
// Wrong: No backend notification management
// Can't send notifications from server events
```

**Correct (using REST API from backend):**

**Get Notifications:**

```javascript
// POST https://api.velt.dev/v2/notifications/get

const response = await fetch('https://api.velt.dev/v2/notifications/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      documentId: 'your-doc-id',      // Pass documentId or userId (or both)
      userId: 'user-id',
      pageSize: 20,                    // Default: 1000
      order: 'desc'                    // 'asc' or 'desc'
    }
  })
});

const { result } = await response.json();
// result.data contains notification array
// result.pageToken for pagination
```

**Update Notifications (Mark as Read):**

```javascript
// POST https://api.velt.dev/v2/notifications/update

const response = await fetch('https://api.velt.dev/v2/notifications/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      documentId: 'your-doc-id',
      notifications: [
        {
          id: 'notification-id',
          readByUserIds: ['user-1', 'user-2'],  // Mark read for these users
          persistReadForUsers: true              // Keep in "For You" tab
        }
      ]
    }
  })
});
```

**Query Options:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationId` | string | Required. Your organization ID |
| `documentId` | string | Filter by document. Pass this or `userId` |
| `userId` | string | Filter by user. Pass this or `documentId` |
| `locationId` | string | Optional. Filter by location |
| `notificationIds` | string[] | Optional. Get specific notifications (max 30) |
| `pageSize` | number | Items per page (default: 1000) |
| `pageToken` | string | For pagination |
| `order` | string | 'asc' or 'desc' (default: 'desc') |

**Response Structure:**

```json
{
  "result": {
    "status": "success",
    "message": "Notification(s) retrieved successfully.",
    "data": [
      {
        "id": "notificationId",
        "notificationSource": "custom",
        "actionUser": { "userId": "...", "name": "...", "email": "..." },
        "displayHeadlineMessageTemplate": "...",
        "displayBodyMessage": "...",
        "timestamp": 1722409519944
      }
    ],
    "pageToken": "nextPageToken"
  }
}
```

**Visibility filtering:** Get results are filtered by comment visibility. A notification for a private comment is returned only for users who can see that comment, on top of any Access Context filtering. The Node and Python backend SDKs apply the same filter. Custom notifications are unaffected.

**Delete Notifications:**

```javascript
// POST https://api.velt.dev/v2/notifications/delete

const response = await fetch('https://api.velt.dev/v2/notifications/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      documentId: 'your-doc-id',             // Optional: delete all for document
      notificationIds: ['notif-1', 'notif-2'] // Optional: delete specific IDs
      // Also accepts userId and locationId
    }
  })
});
```

Combine `organizationId` with `documentId`, `userId`, `locationId`, and/or `notificationIds` to scope the delete (see the documented request combinations).

**Prerequisites (Get Notifications):**
- Enable the advanced queries option in the [Velt Console](https://console.velt.dev/dashboard/config/appconfig)
- Run SDK v4 or later
- Generate an auth token for API access

**Update options:** each entry in `notifications` takes `id` plus any of `actionUser`, `displayHeadlineMessageTemplate`, `displayHeadlineMessageTemplateData`, `displayBodyMessage`, `notificationSourceData`, `readByUserIds`, and `persistReadForUsers`. Set `verifyUserPermissions: true` on the request to only update for users with document access.

**Verification:**
- [ ] Advanced Queries enabled in console
- [ ] API key and auth token configured
- [ ] Correct endpoint URL used
- [ ] Required headers included

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-notifications-v2 - "Get Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/update-notifications - "Update Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/delete-notifications - "Delete Notifications"
- https://docs.velt.dev/async-collaboration/notifications/overview#notifications-for-private-comments - "Notifications for Private Comments"

---

## 4. Settings Management

**Impact: MEDIUM-HIGH**

User notification preference management. Includes channel configuration (Inbox, Email, Slack), settings UI layout, mute options, and server-side getConfig/setConfig REST API for reading and writing per-user preferences at document or org level.

### 4.1 Configure Notification Delivery Channels

**Impact: MEDIUM-HIGH (Set up where users receive notifications (Inbox, Email, Slack, etc.))**

Configure which channels users can receive notifications through. Default channels are Inbox (ALL) and Email (MINE). Users can customize their preferences. Settings are off by default: first enable the settings feature in the [Velt Console](https://console.velt.dev/dashboard/config/notification), then turn on the `settings` prop (or `enableSettings()`). Custom channels such as Slack only appear in the UI; you deliver to them yourself from webhooks.

**Incorrect (no channel configuration):**

```jsx
// Missing channel config - users get defaults only
<VeltNotificationsTool />
```

**Correct (configuring notification channels):**

```jsx
import { useVeltClient } from '@veltdev/react';

function NotificationSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const notificationElement = client.getNotificationElement();

    // Configure available channels and defaults
    notificationElement.setSettingsInitialConfig([
      {
        id: 'inbox',
        name: 'Inbox',
        enable: true,
        default: 'ALL',         // Default selection for new users
        values: [
          { id: 'ALL', name: 'All Updates' },
          { id: 'MINE', name: 'Mentions Only' },
          { id: 'NONE', name: 'None' }
        ]
      },
      {
        id: 'email',
        name: 'Email',
        enable: true,
        default: 'MINE',        // Only email on mentions
        values: [
          { id: 'ALL', name: 'All Updates' },
          { id: 'MINE', name: 'Mentions Only' },
          { id: 'NONE', name: 'None' }
        ]
      },
      {
        id: 'slack',
        name: 'Slack',
        enable: true,           // Enable Slack channel
        default: 'MINE',
        values: [
          { id: 'ALL', name: 'All Updates' },
          { id: 'MINE', name: 'Mentions Only' },
          { id: 'NONE', name: 'None' }
        ]
      }
    ]);
  }, [client]);

  return <VeltNotificationsTool />;
}
```

**Channel Value Options:**

| Value | Description |
|-------|-------------|
| `ALL` | Receive all notifications |
| `MINE` | Only notifications where user is directly involved (@mentions, replies) |
| `NONE` | Do not receive notifications on this channel |

**Managing Settings Programmatically:**

```jsx
import { useNotificationSettings } from '@veltdev/react';

function SettingsManager() {
  // useNotificationSettings returns { setSettingsInitialConfig, setSettings, settings }
  const { setSettingsInitialConfig, setSettings, settings } = useNotificationSettings();

  // settings: current user settings (initially null, updates when fetched)
  console.log('Current settings:', settings);

  // Update specific channel
  const updateEmailSetting = () => {
    setSettings({
      email: 'NONE'  // Disable email notifications
    });
  };

  return null;
}

// Or via API using useNotificationUtils
function UpdateSettings() {
  const { client } = useVeltClient();

  const updateEmailSetting = () => {
    const notificationElement = client?.getNotificationElement();

    // Update specific channel
    notificationElement?.setSettings({
      email: 'NONE'  // Disable email notifications
    });
  };

  const muteAll = () => {
    const notificationElement = client?.getNotificationElement();
    notificationElement?.muteAllNotifications();
  };
}
```

**Settings UI Layout:**

```jsx
// Change settings display from accordion (default) to dropdown using component prop
<VeltNotificationsTool settingsLayout="dropdown" />
<VeltNotificationsPanel settingsLayout="dropdown" />
```

**Enable/Disable Settings Panel:**

```jsx
const notificationElement = client.getNotificationElement();

// Hide settings gear icon
notificationElement.disableSettings();

// Show settings gear icon
notificationElement.enableSettings();
```

**Organization-Level Settings:**

By default, settings apply to the current user on the current document (with multiple documents or folders, they apply to the root document). Organization-level mode applies the user's settings to all documents in the organization.

```jsx
// Settings apply to all documents in the organization
notificationElement.enableSettingsAtOrganizationLevel();

// Revert to per-document settings
notificationElement.disableSettingsAtOrganizationLevel();

// Or via component prop:
<VeltNotificationsTool enableSettingsAtOrganizationLevel={true} />
```

**Read Notifications on For You Tab:**

```jsx
// By default, read notifications are hidden in the For You tab.
// Enable to show them:
notificationElement.enableReadNotificationsOnForYouTab();

// Disable again:
notificationElement.disableReadNotificationsOnForYouTab();

// Or via component prop:
<VeltNotificationsTool readNotificationsOnForYouTab={true} />
```

**Verification:**
- [ ] Settings feature enabled in the Velt Console and `settings` prop / `enableSettings()` turned on
- [ ] setSettingsInitialConfig called before user interaction
- [ ] Each channel has id, name, enable, default, and values
- [ ] Default values are valid (ALL, MINE, or NONE)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#setsettingsinitialconfig - "setSettingsInitialConfig"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enablesettings - "enableSettings"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enablesettingsatorganizationlevel - "enableSettingsAtOrganizationLevel"
- https://docs.velt.dev/async-collaboration/notifications/setup - "(optional) Enable Notification Settings for Users"

---

### 4.2 Manage Per-User Notification Config via REST API

**Impact: MEDIUM-HIGH (Read and write per-user notification preferences at document or org level from your server)**

Use the Get Config and Set Config REST endpoints to read and write users' notification channel preferences from your server. Both support document-level config (scoped to specific documents) and org-level config (the user's default for all documents). Get Config takes a single `userId`; Set Config takes a `userIds` array. Both require the notification settings feature to be enabled in the [Velt Console](https://console.velt.dev/dashboard/config/notification). Available on v1 and v2 REST APIs.

**Incorrect (singular userId on Set Config, empty documentIds, missing auth token):**

```javascript
await fetch('https://api.velt.dev/v2/notifications/config/set', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-velt-api-key': 'YOUR_API_KEY' },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userId: 'user-123',       // Set Config expects userIds: string[]
      documentIds: [],          // Omit documentIds for an org-level default
      config: { inbox: 'ALL', email: 'MINE' }
    }
  })
});
```

**Correct (use getOrganizationConfig flag and omit documentIds for org-level operations):**

```javascript
// GET CONFIG — Document-level
const docConfigResponse = await fetch('https://api.velt.dev/v2/notifications/config/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userId: 'user-123',
      documentIds: ['doc-id-1', 'doc-id-2']
    }
  })
});

// GET CONFIG — Org-level (set getOrganizationConfig: true; documentIds not required)
const orgConfigResponse = await fetch('https://api.velt.dev/v2/notifications/config/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userId: 'user-123',
      getOrganizationConfig: true
    }
  })
});

// SET CONFIG — Document-level
const setDocResponse = await fetch('https://api.velt.dev/v2/notifications/config/set', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userIds: ['user-123'],
      documentIds: ['doc-id-1'],
      config: { inbox: 'MINE', email: 'NONE' }
    }
  })
});

// SET CONFIG — Org-level default (omit documentIds entirely)
// When documentIds is omitted, config is stored as the user's default for all documents
const setOrgResponse = await fetch('https://api.velt.dev/v2/notifications/config/set', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userIds: ['user-123'],
      config: { inbox: 'ALL', email: 'MINE' }
    }
  })
});
```

**Parameter Reference:**

| Parameter | Type | Required | Endpoint | Description |
|-----------|------|----------|----------|-------------|
| `organizationId` | string | Yes | Both | Your organization ID. |
| `userId` | string | Yes (getConfig) | getConfig | The user whose config is read. |
| `userIds` | string[] | Yes (setConfig) | setConfig | The users whose config is set. |
| `documentIds` | string[] | No | Both | Document IDs to scope the operation (max 30 on getConfig). When omitted on `setConfig`, config is applied at org level. Not required on `getConfig` when `getOrganizationConfig` is true. |
| `getOrganizationConfig` | boolean | No | getConfig only | When true, fetches the org-level config for the user. `documentIds` is not required in this mode. |
| `config` | NotificationChannelConfig | Yes (setConfig) | setConfig | Channel preference map. Keys are channel IDs (`inbox`, `email`, etc.), values are `'ALL'` \| `'MINE'` \| `'NONE'`. |

**NotificationChannelConfig type:** `Record<string, 'ALL' | 'MINE' | 'NONE'>` — maps a channel ID to the user's preference for that channel.

**Endpoint URLs:**

```
POST https://api.velt.dev/v1/notifications/config/get
POST https://api.velt.dev/v2/notifications/config/get
POST https://api.velt.dev/v1/notifications/config/set
POST https://api.velt.dev/v2/notifications/config/set
```

**Verification:**
- [ ] `getOrganizationConfig: true` used (not `documentIds: []`) when fetching org-level config
- [ ] `documentIds` omitted (not set to `[]`) when applying org-level default via setConfig
- [ ] `config` object uses valid values: `'ALL'`, `'MINE'`, or `'NONE'` per channel
- [ ] Set Config sends `userIds` (array); Get Config sends `userId` (string)
- [ ] Auth headers (`x-velt-api-key` and `x-velt-auth-token`) included on all requests

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-config - "Get Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/set-config - "Set Config"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enablesettingsatorganizationlevel - "enableSettingsAtOrganizationLevel"

---

## 5. Configuration

**Impact: MEDIUM**

Opt-in data-scope configuration for the notifications feed. Includes cross-organization "For You" merging (enableCrossOrganization / CrossOrganizationConfig) and the user-scoped "For You" fetch (enableUserScopedNotifications / UserScopedNotificationsConfig) that keeps unread notifications visible outside the recently-active-documents window.

### 5.1 Configure Cross-Organization Notifications for Multi-Org Users

**Impact: MEDIUM (Without cross-organization configuration, users who belong to multiple organizations only see notifications from the current org in the "For You" tab)**

When users belong to multiple organizations, the notification panel's "For You" tab shows only current-org notifications by default. The cross-organization feature merges notifications from other orgs the user belongs to into the "For You" feed.

**Key constraints:**
- This is opt-in — default behavior is unchanged unless explicitly enabled
- Only the "For You" feed is supported. The `'all'` feed value in `CrossOrganizationConfig.feeds` is silently ignored with a warning
- The current organization is always excluded from cross-org results (it's already shown by default)

**Incorrect (expecting other orgs' notifications without opting in):**

```jsx
// Default: For You only shows notifications from the current organization
<VeltNotificationsTool />
```

**Correct (opt in once, from one place):**

```jsx
<VeltNotificationsTool enableCrossOrganization={true} />
```

#### React: Enable via Props

The `enableCrossOrganization` prop works on both `VeltNotificationsTool` and `VeltNotificationsPanel`. It accepts `boolean`, a `CrossOrganizationConfig` object, or a JSON config string.

```jsx
{/* Enable with defaults — pulls from all orgs the user belongs to */}
<VeltNotificationsTool enableCrossOrganization={true} />
<VeltNotificationsPanel enableCrossOrganization={true} />

{/* Enable with specific org allowlist */}
<VeltNotificationsTool enableCrossOrganization={{
    organizationIds: ['org-1', 'org-2'],
}} />
<VeltNotificationsPanel enableCrossOrganization={{
    organizationIds: ['org-1', 'org-2'],
}} />
```

#### React: Enable/Disable via API

```jsx
const notificationElement = useNotificationUtils();

// Enable with defaults
notificationElement.enableCrossOrganization();

// Enable with config
notificationElement.enableCrossOrganization({
    organizationIds: ['org-1', 'org-2'],
});

// Disable
notificationElement.disableCrossOrganization();

// Equivalent: passing { enabled: false } routes to disable
// notificationElement.enableCrossOrganization({ enabled: false });

// Read current config
const config = notificationElement.getCrossOrganizationConfig();

// Subscribe to config changes
const subscription = notificationElement.getCrossOrganizationConfig$().subscribe((config) => {
    console.log('Cross-org config:', config);
});

// Clean up when done
subscription?.unsubscribe();
```

#### HTML: Enable via Attributes

```html
<!-- Enable with defaults -->
<velt-notifications-tool enable-cross-organization="true"></velt-notifications-tool>
<velt-notifications-panel enable-cross-organization="true"></velt-notifications-panel>

<!-- Enable with config (JSON string) -->
<velt-notifications-tool enable-cross-organization='{"organizationIds":["org-1","org-2"]}'>
</velt-notifications-tool>
```

#### CrossOrganizationConfig Fields

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `enabled` | `boolean` | `true` | Set to `false` to disable (equivalent to `disableCrossOrganization()`) |
| `organizationIds` | `string[]` | None | Allowlist; when omitted, all indexed orgs are eligible |
| `excludeOrganizationIds` | `string[]` | None | Additional orgs to exclude. Current org always excluded |
| `feeds` | `('forYou' \| 'all')[]` | None | Only `'forYou'` is supported; `'all'` is ignored with a warning |

**Equivalences:** Passing `{ enabled: false }` to `enableCrossOrganization()` is the same as calling `disableCrossOrganization()`. Passing `null` or calling without arguments opts in with all defaults.

**Shared setting:** `enableCrossOrganization` is a shared notification-service flag. Setting it on `VeltNotificationsTool`, on `VeltNotificationsPanel`, or through the API changes the feed for both components, and the last write wins. Configure it in one place.

**Interaction with user-scoped notifications:** If you also enable `enableUserScopedNotifications`, user-scoped notifications outrank cross-organization ones on ID collision in the "All" tab. Cross-organization "For You" behavior is otherwise unchanged (see `config-user-scoped-notifications`).

#### Verification

- [ ] `enableCrossOrganization` is configured from one place (tool prop, panel prop, or API), since it is a shared flag
- [ ] "For You" tab shows notifications from other orgs the user belongs to
- [ ] Current org notifications are not duplicated
- [ ] `enableCrossOrganization({ enabled: false })` reverts to single-org behavior

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enablecrossorganization - "enableCrossOrganization"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#getcrossorganizationconfig - "getCrossOrganizationConfig"
- https://docs.velt.dev/api-reference/sdk/models/data-models#crossorganizationconfig - "CrossOrganizationConfig"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - "enableCrossOrganization" (global via the shared service)

---

### 5.2 Enable User-Scoped Notifications So Unread Items Stay in the For You Tab

**Impact: MEDIUM (Without it, unread notifications on documents outside the org's 15 most recently active documents vanish from the For You tab and the unread badge)**

By default the "For You" tab and the unread count are built from the organization's 15 most recently active documents. An unread notification on a document outside that window is not fetched, so it disappears from the tab and the badge until that document becomes active again. Opt in to `enableUserScopedNotifications` to also fetch the signed-in user's newest notifications for the current organization directly, independent of that window.

**Incorrect (relying on the default window in a busy organization):**

```jsx
// Default: For You + unread count come only from the 15 most recently active documents.
// A user with an unread @mention on an older document sees no badge and no row for it.
<VeltNotificationsTool />
```

**Correct (React / Next.js, using props):**

```jsx
import { VeltNotificationsTool } from '@veltdev/react';

// Enable with the default limit of 25
<VeltNotificationsTool enableUserScopedNotifications={true} />

// Or enable with a custom limit (clamped to [1, 200])
<VeltNotificationsTool enableUserScopedNotifications={{ limit: 60 }} />
```

**Correct (React / Next.js, using the API):**

```jsx
import { useEffect } from 'react';
import { useNotificationUtils } from '@veltdev/react';

function UserScopedNotificationsSetup() {
  const notificationElement = useNotificationUtils();

  useEffect(() => {
    if (!notificationElement) return;
    // Safe to call before identify()/setDocument(); it latches until the first full fetch
    notificationElement.enableUserScopedNotifications({ limit: 60 });
  }, [notificationElement]);

  return null;
}

// Turn it back off (keeps the configured limit):
// notificationElement.disableUserScopedNotifications();
```

**Correct (Other Frameworks):**

```html
<!-- Default limit of 25 -->
<velt-notifications-tool enable-user-scoped-notifications="true"></velt-notifications-tool>

<!-- Custom limit as a JSON string -->
<velt-notifications-panel enable-user-scoped-notifications='{"limit":60}'></velt-notifications-panel>

<script>
  const notificationElement = Velt.getNotificationElement();
  notificationElement.enableUserScopedNotifications({ limit: 60 });
  // notificationElement.disableUserScopedNotifications();
</script>
```

**UserScopedNotificationsConfig:**

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `enabled` | `boolean` | `true` | `false` disables (same as `disableUserScopedNotifications()`) and keeps the configured `limit`. |
| `limit` | `number` | `25` | Max user-scoped notifications fetched. Clamped to `[1, 200]`; non-numeric, non-finite, or values below `1` fall back to `25`. |

Passing `null` or no argument to `enableUserScopedNotifications()` opts in with all defaults. The prop accepts a `boolean`, a `UserScopedNotificationsConfig` object, or a JSON string; the HTML attribute accepts `"true"` / `"false"` or a JSON string.

**Behavior to know:**
- Default is off. The setting is shared: the prop on `VeltNotificationsTool`, the prop on `VeltNotificationsPanel`, and the API all write the same flag, so the last write wins. Drive it from one place.
- The fetch runs on full fetches only and is suppressed under `enableCurrentDocumentOnly()`; the narrower scope wins.
- Results merge into the "For You" store (deduped by `notificationId`) and additively into the "All" tab. In "All", document notifications win on ID collision, and user-scoped notifications outrank cross-organization ones.
- Switching organization or document clears the stores; the next full fetch re-applies the setting, so nothing carries across organizations.
- The first load after opting in at a busy organization can surface previously invisible unread notifications in one batch. The unread count is capped at `limit`.
- Requires matching backend support. Against an older backend it falls back to the windowed behavior instead of failing.
- `enableUserScopedNotifications({ enabled: false })` enabled the feature instead of disabling it before SDK 6.0.9; on older builds call `disableUserScopedNotifications()`. The `enableUserScopedNotifications` prop / attribute requires 6.0.9 or later; the API methods shipped in 6.0.8.

**Verification Checklist:**
- [ ] Enabled from exactly one place (tool prop, panel prop, or API), not several with different values
- [ ] `limit` set to a value in `[1, 200]` if the default of 25 is too small
- [ ] Not combined with `enableCurrentDocumentOnly()` when the goal is an org-wide For You feed
- [ ] Unread badge and For You tab show notifications for documents outside the recently active window
- [ ] Disabling uses `disableUserScopedNotifications()` (or `{ enabled: false }` on 6.0.9+)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enableuserscopednotifications - "enableUserScopedNotifications"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#disableuserscopednotifications - "disableUserScopedNotifications"
- https://docs.velt.dev/api-reference/sdk/models/data-models#userscopednotificationsconfig - "UserScopedNotificationsConfig"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - "enableUserScopedNotifications" (shared service flag, last write wins)

---

## 6. Notification Triggers

**Impact: MEDIUM**

How notifications are generated. Includes automatic triggers from comments/@mentions, custom notification creation via REST API, and self-notification control.

### 6.1 Create Custom Notifications via REST API

**Impact: MEDIUM (Send notifications from backend for custom application events)**

Use the REST API to create custom notifications for application-specific events (task completions, status changes, etc.).

**Incorrect (only relying on automatic notifications):**

```jsx
// Only comment-based notifications
// No custom event notifications
```

**Correct (creating custom notifications via API):**

```javascript
// POST https://api.velt.dev/v2/notifications/add

const response = await fetch('https://api.velt.dev/v2/notifications/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      documentId: 'your-doc-id',

      // User who triggered the action
      actionUser: {
        userId: 'user-123',
        name: 'John Doe',
        email: 'john@example.com'
      },

      // Notification content with template variables
      displayHeadlineMessageTemplate: '{actionUser} completed task "{taskName}"',
      displayHeadlineMessageTemplateData: {
        actionUser: { userId: 'user-123', name: 'John Doe' },
        taskName: 'Review PR #42'
      },

      // Optional body message
      displayBodyMessage: 'The task has been marked as complete.',

      // Who to notify (required)
      notifyUsers: [
        { userId: 'user-456', email: 'jane@example.com' },
        { userId: 'user-789', email: 'bob@example.com' }
      ],

      // notifyAll defaults to true (everyone in the organization).
      // Set false to notify only notifyUsers.
      notifyAll: false,

      // Optional: your own ID (only _ and - special characters) to prevent duplicates
      notificationId: 'task-42-completed',

      // Check document access before notifying
      verifyUserPermissions: true
    }
  })
});
```

**Correct (resolver write-side — structural data only, PII omitted):**

```javascript
// POST https://api.velt.dev/v2/notifications/add
// When isNotificationResolverUsed: true, displayHeadlineMessageTemplate
// and displayBodyMessage are not required — the resolver supplies them at read time.

const response = await fetch('https://api.velt.dev/v2/notifications/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-abc',
      documentId: 'doc-789',
      notificationSource: 'custom',
      isNotificationResolverUsed: true,
      actionUser: { userId: 'user-123' },
      notifyUsers: [{ userId: 'user-456', email: 'recipient@example.com' }],
      notifyAll: false
      // displayHeadlineMessageTemplate and displayBodyMessage omitted
    }
  })
});
```

**Template Variables:**

Use curly braces `{variableName}` in templates. Built-in variables:
- `{actionUser}` - User who took the action
- `{recipientUser}` - User receiving the notification

Custom variables can be any string value in `displayHeadlineMessageTemplateData`.

**Notification Options:**

| Field | Type | Description |
|-------|------|-------------|
| `organizationId` | string | Required. Your organization |
| `documentId` | string | Required. Document context |
| `actionUser` | User | Required. Who triggered the notification |
| `displayHeadlineMessageTemplate` | string | Main message with variables. Optional when `isNotificationResolverUsed: true` |
| `displayHeadlineMessageTemplateData` | object | Variable values |
| `displayBodyMessage` | string | Secondary message text. Optional when `isNotificationResolverUsed: true` |
| `notifyUsers` | User[] | Required. Users to notify |
| `notifyAll` | boolean | Default `true`: notifies all users in the organization. Set `false` to notify only `notifyUsers` |
| `verifyUserPermissions` | boolean | Only create notifications for users with access to the document (default: false) |
| `notificationId` | string | Optional custom ID (only `_` and `-` special characters); Velt generates one if omitted |
| `createOrganization` / `createDocument` | boolean | Create the organization / document first if it does not exist |
| `notificationSourceData` | object | Custom data stored with the notification and returned in the click callback |
| `context` | Context | `{ access: { ... } }` key-value pairs for Access Context filtering |
| `isNotificationResolverUsed` | boolean | Optional. When `true`, marks this notification as resolver-eligible. `displayHeadlineMessageTemplate` and `displayBodyMessage` are not required; the notification resolver supplies PII content at read time via the registered data provider |
| `notificationSource` | string | Optional. Must be `'custom'` for resolver routing. Only custom-source notifications are routed through the resolver pipeline |

**Example Use Cases:**

```javascript
// Task completed
{
  displayHeadlineMessageTemplate: '{actionUser} completed "{taskName}"',
  displayBodyMessage: 'All checklist items have been marked done.'
}

// Document shared
{
  displayHeadlineMessageTemplate: '{actionUser} shared "{documentName}" with you',
  displayBodyMessage: 'You now have edit access.'
}

// Status changed
{
  displayHeadlineMessageTemplate: '{actionUser} changed status to "{newStatus}"',
  displayBodyMessage: 'Previously: {oldStatus}'
}
```

**Response:**

```json
{
  "result": {
    "status": "success",
    "message": "Notification added successfully.",
    "data": {
      "id": "notification-id-123"
    }
  }
}
```

Custom notifications carry no comment, so the private-comment visibility filter does not apply to them.

**Verification:**
- [ ] API key and auth token configured
- [ ] Required fields (organizationId, documentId, actionUser, notifyUsers) provided
- [ ] `notifyAll: false` set when only `notifyUsers` should be notified (it defaults to `true`)
- [ ] Template variables match templateData keys
- [ ] Resolver-backed writes set both `notificationSource: 'custom'` and `isNotificationResolverUsed: true`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/add-notifications - "Add Notifications"
- https://docs.velt.dev/self-hosting/partial/notifications#writing-resolver-eligible-notifications - "Writing Resolver-Eligible Notifications"

---

### 6.2 Enable Self-Notifications for Own Actions

**Impact: MEDIUM (Controls whether users receive notifications for their own actions)**

By default, Velt excludes notifications where the current user is the action user. Enable self-notifications if users need to see confirmations of their own actions (e.g., audit trails, confirmation flows).

**Incorrect (expecting self-notifications without enabling them):**

```jsx
// Default behavior: user does NOT receive notifications for their own actions
<VeltNotificationsTool />
// User comments on a thread — no notification generated for themselves
```

**Correct (React / Next.js — using props):**

```jsx
import { VeltNotificationsTool, VeltNotificationsPanel } from '@veltdev/react';

// Enable via prop on the tool or panel
<VeltNotificationsTool selfNotifications={true} />
<VeltNotificationsPanel selfNotifications={true} />
```

**Correct (React / Next.js — using API):**

```jsx
import { useNotificationUtils } from '@veltdev/react';
import { useEffect } from 'react';

function SelfNotificationSetup() {
  const notificationElement = useNotificationUtils();

  useEffect(() => {
    if (!notificationElement) return;

    // Enable self notifications
    notificationElement.enableSelfNotifications();

    // To disable:
    // notificationElement.disableSelfNotifications();
  }, [notificationElement]);
}
```

**Correct (Other Frameworks — using attributes):**

```html
<velt-notifications-tool self-notifications="true"></velt-notifications-tool>
<velt-notifications-panel self-notifications="true"></velt-notifications-panel>
```

**Correct (Other Frameworks — using API):**

```jsx
const notificationElement = Velt.getNotificationElement();
notificationElement.enableSelfNotifications();

// To disable:
notificationElement.disableSelfNotifications();
```

**Verification Checklist:**
- [ ] Self-notifications explicitly enabled if users need to see their own actions
- [ ] Disabled by default for typical use cases to reduce noise
- [ ] Consistent setting across Tool and Panel components

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - enableSelfNotifications

---

## 7. Delivery Channels

**Impact: MEDIUM**

Notification delivery methods. Includes in-app inbox, email via SendGrid, basic and advanced webhook payloads (per-user notification config, private-comment `visibility` and `accessDeniedUsers`), and the opt-in server-side delay and batching pipeline.

### 7.1 Configure Notification Delay and Batching Pipeline

**Impact: MEDIUM (Reduce notification noise by holding, suppress-if-seen, and batching before delivery)**

An opt-in, server-side pipeline lets you hold notifications during a configurable window, suppress delivery if the recipient has already seen the activity, and batch high-activity documents or users. You configure it as the workspace's `notificationServiceConfig`, either in the [Velt Console](https://console.velt.dev/dashboard/config/notification) (API key notification settings) or with the Update Notification Config workspace REST API. It applies to all documents. Webhooks and workflow triggers are never affected; they always fire immediately.

**Incorrect (expecting delay/batching without workspace config):**

```javascript
// No notificationServiceConfig set on the workspace
// Notifications deliver immediately with no delay or batching
```

**Correct (configure notificationServiceConfig on your workspace):**

```javascript
// Server-side; the body is deep-merged with the stored config
await fetch('https://api.velt.dev/v2/workspace/notificationconfig/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN, // API-key-level auth token
  },
  body: JSON.stringify({
    data: {
      useNotificationService: true,
      notificationServiceConfig: {
        delayConfig: { isEnabled: true, delaySeconds: 30 },
        batchConfig: {
          document: { isEnabled: true, batchWindowSeconds: 300, maxActivities: 20 },
          user: { isEnabled: true, batchWindowSeconds: 300, maxActivities: 20 },
        },
      },
    },
  }),
});
```

**Config Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `delayConfig.isEnabled` | boolean | Master toggle for the delay step. |
| `delayConfig.delaySeconds` | number | Seconds to hold a notification. Integer `10` to `15552000` (6 months). |
| `batchConfig.document.isEnabled` | boolean | Toggle document-level batching. |
| `batchConfig.document.batchWindowSeconds` | number | Accumulation window per document. Integer `10` to `604800` (1 week). |
| `batchConfig.document.maxActivities` | number | Flush once this many activities accumulate. Integer `2` to `50`. |
| `batchConfig.user.isEnabled` | boolean | Toggle user-level batching. |
| `batchConfig.user.batchWindowSeconds` | number | Accumulation window per recipient. Integer `10` to `604800`. |
| `batchConfig.user.maxActivities` | number | Flush once this many activities accumulate. Integer `2` to `50`. |

**Pipeline Order:**

When both `delayConfig` and `batchConfig` are enabled, the stages chain in this order:

1. **Delay** — Hold the notification for `delaySeconds`.
2. **Seen check** — If the recipient views the comment during the delay window, suppress the notification (suppress-if-seen semantics).
3. **Batch** — Accumulate surviving notifications within `batchWindowSeconds` or until `maxActivities` is reached.
4. **Deliver** — Send the batched digest to the recipient.

Each stage is independent: you can enable delay only, batching only, or both. Document-level and user-level batching also operate independently of each other.

Out-of-range values are rejected with `INVALID_ARGUMENT`. Enabling the service for the first time (`useNotificationService: true`) seeds the default `comment` and `huddle` triggers but leaves delay and batching off until you set them. Read the current values with the Get Notification Config workspace API.

**Important:** This pipeline is server-side only and opt-in. Webhooks and workflow triggers always fire immediately, regardless of any delay or batch configuration.

**Verification:**
- [ ] `notificationServiceConfig` set at the workspace level (Console or `/v2/workspace/notificationconfig/update`), not per document
- [ ] Numeric fields are integers within the documented ranges
- [ ] `delayConfig.isEnabled` and `batchConfig.*.isEnabled` toggled as needed
- [ ] Pipeline order understood: delay → seen check → batch → deliver
- [ ] Webhook endpoints confirmed as unaffected by this config

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#batching-and-delay-configuration - "Batching and Delay Configuration"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/notificationconfig-update - "Update Notification Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/notificationconfig-get - "Get Notification Config"

---

### 7.2 Forward Notifications to External Services via Webhooks

**Impact: MEDIUM (Correct payload parsing, per-user preference routing, and private-comment filtering when forwarding notifications to Slack, Linear, or your backend)**

Velt webhooks deliver comment, huddle, CRDT (and, on advanced webhooks, recorder) events to your endpoint so you can fan notifications out to Slack, Linear, email, or custom channels. There is no `notification.created` event. Basic (V1) webhooks send a flat payload keyed by `actionType`; advanced (V2, Enterprise) webhooks send `{ event, source, data }`. When users have notification settings, the payload also carries their per-user channel preferences, and private-comment events carry `visibility` (plus `accessDeniedUsers` on basic webhooks) so you never forward a private comment to someone who cannot see it.

**Incorrect (invented event name, ignoring preferences and visibility):**

```javascript
app.post('/webhooks/velt', async (req, res) => {
  const { event, data } = req.body;
  if (event === 'notification.created') {   // No such event
    await postToSlack(data.notifyUsers);    // Ignores channel prefs and accessDeniedUsers
  }
  res.status(200).send('OK');
});
```

**Correct (basic webhooks: Comments action types):**

```javascript
// Basic webhooks: enable under Configurations > Webhook Service in the Velt Console.
// Optional auth token arrives as "Authorization: Basic YOUR_AUTH_TOKEN".
app.post('/webhooks/velt', async (req, res) => {
  if (req.headers.authorization !== `Basic ${process.env.VELT_WEBHOOK_TOKEN}`) {
    return res.status(401).send('Unauthorized');
  }

  const payload = req.body; // Base64-decode / decrypt first if you enabled encoding or encryption
  const { actionType, notificationSource, commentAnnotation, actionUser, metadata } = payload;

  if (notificationSource === 'comment' && ['newlyAdded', 'added'].includes(actionType)) {
    // Exactly one of these is present when users have notification settings
    const prefs =
      payload.usersOrganizationNotificationsConfig ||
      payload.usersDocumentNotificationsConfig ||
      {};
    // Private comment: drop users who cannot see it
    const denied = new Set(payload.accessDeniedUsers ?? []);

    const recipients = Object.entries(prefs)
      .filter(([userId, channels]) => !denied.has(userId) && channels.slack !== 'NONE')
      .map(([userId]) => userId);

    await notifySlack(recipients, {
      from: actionUser?.name,
      document: metadata?.documentName,
      annotationId: commentAnnotation?.annotationId,
    });
  }

  res.status(200).send('OK');
});
```

**Correct (advanced webhooks: `event` + `data`, signed with Svix-style headers):**

```javascript
// Verify webhook-id, webhook-timestamp, webhook-signature against the raw body first
app.post('/webhooks/velt-advanced', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!verifyVeltSignature(req.headers, req.body)) return res.status(401).end();

  const { event, source, data, usersOrganizationNotificationsConfig } = JSON.parse(req.body);

  if (event === 'comment.add') {
    // Private comments carry data.visibility; treat it as informational only
    const visibility = data.visibility; // undefined for public comments
    await enqueueFanOut({ data, visibility, prefs: usersOrganizationNotificationsConfig });
  }

  res.status(200).end(); // Respond with 2xx within 15 seconds; queue heavy work
});
```

**Event names:**

| Webhook type | Field | Comment values (examples) |
|---|---|---|
| Basic (V1) | `actionType` + `notificationSource` | `newlyAdded`, `added`, `updated`, `deleted`, `assigned`, `statusChanged`, `priorityChanged`, `accessModeChanged`, `reactionAdded`, `subscribed`, ... Huddle: `created`, `join`. CRDT: `updateData`. |
| Advanced (V2) | `event` | `comment_annotation.add`, `comment_annotation.assign`, `comment_annotation.status_change`, `comment.add`, `comment.update`, `comment.delete`, `comment.reaction_add`, `huddle.create`, `huddle.join`, `crdt.update_data`, `recorder.done`, ... |

**Per-user notification preferences:** if you configured notification settings, each payload includes exactly one of `usersOrganizationNotificationsConfig` (org-level settings) or `usersDocumentNotificationsConfig` (document-level settings): a map of `userId` to `{ [channelId]: 'ALL' | 'MINE' | 'NONE' }`. Use it to honor custom channels (Slack, Linear) you added with `setSettingsInitialConfig()`.

**Private comments:**
- Velt sends comment notifications for a private comment only to users who can see it, on every channel, including the delete notification.
- Private-comment payloads carry a `visibility` object: `type` (`'public' | 'organizationPrivate' | 'restricted'`), `userIds`, `organizationIds`, `organizationId`. Public comments and pre-existing notifications have no `visibility` key.
- Basic webhooks also list `accessDeniedUsers` (client user IDs denied by your Permission Provider or by the comment's visibility). Drop those users from your own fan-out.
- Treat `visibility` and `accessDeniedUsers` as informational. Velt re-verifies visibility server-side; never use them to widen who you forward to.

**Delay and batching carve-out:** webhooks and workflow triggers always fire immediately. The opt-in delay and batching pipeline (`delivery-delay-batching`) never holds them.

**Verification:**
- [ ] Handler keys off `actionType` / `notificationSource` (basic) or `event` (advanced); no `notification.created`
- [ ] Basic webhook `Authorization: Basic <token>` checked, or advanced webhook signature verified on the raw body
- [ ] Encoded (Base64) or encrypted payloads decoded before parsing, if enabled
- [ ] Recipients filtered by `usersOrganizationNotificationsConfig` OR `usersDocumentNotificationsConfig` (only one is present)
- [ ] `accessDeniedUsers` removed from fan-out; `visibility` never used to add recipients
- [ ] Endpoint returns 2xx quickly (advanced webhooks fail after 15 seconds)

**Source Pointers:**
- https://docs.velt.dev/webhooks/basic - "Basic Webhooks" (setup, auth token, payload schema, list of action types)
- https://docs.velt.dev/webhooks/basic#comment-visibility - "Comment Visibility" (`visibility`, `accessDeniedUsers`)
- https://docs.velt.dev/webhooks/advanced - "Advanced Webhooks" (events, signature verification)
- https://docs.velt.dev/webhooks/advanced#comment-visibility - "Comment Visibility"
- https://docs.velt.dev/async-collaboration/notifications/overview#notifications-for-private-comments - "Notifications for Private Comments"

---

### 7.3 Set Up Email Notifications with SendGrid

**Impact: MEDIUM (Deliver notifications via email for @mentions and replies)**

Velt can send email notifications through your SendGrid account when a user is @mentioned in a comment or someone replies to their comment. For any other email provider, trigger emails yourself from webhooks. A notification for a private comment is only emailed to users who can see that comment.

**Incorrect (expecting automatic email without setup):**

```jsx
// Email notifications won't work without SendGrid configuration
<VeltNotificationsTool />
```

**Correct (configure SendGrid in Velt Console):**

**Setup Steps:**

1. **Get SendGrid credentials**: a SendGrid API key and a SendGrid Email Template ID for the Comments feature
2. **Configure in Velt Console**: open Configurations > [Email Service](https://console.velt.dev/dashboard/config/email) and enter the API key, Template ID, and 'From' email address
3. **Whitelist the sender**: the 'From' address must be whitelisted in your SendGrid account, or sending fails
4. **Enable Email Channel**: keep the `email` channel enabled in notification settings

**Email Trigger Events:**

| Event | Triggers Email |
|-------|---------------|
| @mention in comment | Yes |
| Reply to user's comment | Yes |
| New comment (no mention) | No (unless user has ALL setting) |

**Email Template Data (for customization):**

When customizing email templates, these fields are available:

```javascript
// Fields Velt sends to your SendGrid template
const templateFields = {
  firstComment: {},        // Comment: only commentId, commentText, from
  latestComment: {},       // Comment that prompted the email
  prevComment: {},         // Comment before latestComment
  commentsCount: '1',      // Total comments in the annotation
  commentsCountMoreThanThree: '0',
  fromUser: {},            // Action user (User)
  commentAnnotation: {},   // CommentAnnotation without `comments`
  actionType: 'newlyAdded', // Same values as the basic webhook action types
  documentMetadata: {},    // DocumentMetadata
};
// Older fields (message, messageFromName, name, fromEmail, photoUrl, pageUrl,
// pageTitle, deviceInfo, subject) are still sent but will be deprecated.
```

**User Email Settings:**

```jsx
// Configure default email behavior for new users
notificationElement.setSettingsInitialConfig([
  {
    id: 'email',
    name: 'Email',
    enable: true,
    default: 'MINE',  // Only email on direct mentions/replies
    values: [
      { id: 'ALL', name: 'All Updates' },
      { id: 'MINE', name: 'Mentions & Replies' },
      { id: 'NONE', name: 'Never' }
    ]
  }
]);
```

**User Can Update Settings:**

```jsx
// Users can change their email preferences
const notificationElement = client.getNotificationElement();
notificationElement.setSettings({
  email: 'NONE'  // Disable email notifications
});
```

**Verification:**
- [ ] SendGrid API key and Template ID added under Email Service in the Velt Console
- [ ] 'From' email whitelisted in SendGrid
- [ ] Email channel enabled in settings config
- [ ] Test email received after @mention

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/notifications#email-notifications - "Email notifications" (SendGrid Integration, Email Template Data)
- https://docs.velt.dev/async-collaboration/notifications/overview#notifications-for-private-comments - "Notifications for Private Comments"

---

## 8. UI Customization

**Impact: MEDIUM**

Visual customization patterns for notification components. Includes wireframe components for panel, tool, and content list customization.

### 8.1 Customize Notification Components with Wireframes

**Impact: MEDIUM (Full control over notification panel and tool appearance)**

Use Velt wireframe components to customize the structure and appearance of the notifications tool and panel.

**Incorrect (only using default styling):**

```jsx
// Default appearance, no customization
<VeltNotificationsTool />
```

**Correct (using wireframe components):**

**Customize Notifications Tool:**

```jsx
import { VeltWireframe, VeltNotificationsToolWireframe } from '@veltdev/react';

function CustomNotificationsTool() {
  return (
    <VeltWireframe>
      <VeltNotificationsToolWireframe>
        <VeltNotificationsToolWireframe.Icon />
        <VeltNotificationsToolWireframe.UnreadIcon />
        <VeltNotificationsToolWireframe.UnreadCount />
        <VeltNotificationsToolWireframe.Label />
      </VeltNotificationsToolWireframe>
    </VeltWireframe>
  );
}
```

**Customize Notifications Panel:**

```jsx
import { VeltWireframe, VeltNotificationsPanelWireframe } from '@veltdev/react';

function CustomNotificationsPanel() {
  return (
    <VeltWireframe>
      <VeltNotificationsPanelWireframe>
        <VeltNotificationsPanelWireframe.Title />
        <VeltNotificationsPanelWireframe.ReadAllButton />
        <VeltNotificationsPanelWireframe.SettingsButton />
        <VeltNotificationsPanelWireframe.Header />
        <VeltNotificationsPanelWireframe.Content />
        <VeltNotificationsPanelWireframe.Settings />
      </VeltNotificationsPanelWireframe>
    </VeltWireframe>
  );
}
```

**Panel Header Tabs:**

```jsx
<VeltNotificationsPanelWireframe.Header>
  <VeltNotificationsPanelWireframe.Header.TabForYou />
  <VeltNotificationsPanelWireframe.Header.TabAll />
  <VeltNotificationsPanelWireframe.Header.TabDocuments />
  <VeltNotificationsPanelWireframe.Header.TabPeople />
</VeltNotificationsPanelWireframe.Header>
```

**Panel Content List:**

```jsx
<VeltNotificationsPanelWireframe.Content.List>
  <VeltNotificationsPanelWireframe.Content.List.Item>
    <VeltNotificationsPanelWireframe.Content.List.Item.Avatar />
    <VeltNotificationsPanelWireframe.Content.List.Item.Unread />
    <VeltNotificationsPanelWireframe.Content.List.Item.Headline />
    <VeltNotificationsPanelWireframe.Content.List.Item.Body />
    <VeltNotificationsPanelWireframe.Content.List.Item.FileName />
    <VeltNotificationsPanelWireframe.Content.List.Item.Time />
  </VeltNotificationsPanelWireframe.Content.List.Item>
</VeltNotificationsPanelWireframe.Content.List>
```

**For HTML:**

```html
<velt-wireframe style="display:none;">
  <velt-notifications-tool-wireframe>
    <velt-notifications-tool-icon-wireframe></velt-notifications-tool-icon-wireframe>
    <velt-notifications-tool-unread-count-wireframe></velt-notifications-tool-unread-count-wireframe>
  </velt-notifications-tool-wireframe>
</velt-wireframe>
```

**Disable Shadow DOM for CSS Access:**

```jsx
// Disable shadow DOM to apply custom CSS
<VeltNotificationsTool shadowDom={false} panelShadowDom={false} />
<VeltNotificationsPanel shadowDom={false} />
```

**Dark Mode:**

```jsx
<VeltNotificationsTool darkMode={true} />
<VeltNotificationsPanel darkMode={true} />
```

**Variants:**

A `variant` selects a wireframe registered as `velt-notifications-tool-wireframe---<variant>` (tool) or `velt-notifications-panel-wireframe---<variant>` (panel). An unmatched variant silently falls back to the default markup.

```jsx
// Use different variants for tool and panel
<VeltNotificationsTool
  variant="custom-tool"
  panelVariant="custom-panel"
/>
```

**Available Wireframe Components:**

| Component | Purpose |
|-----------|---------|
| `VeltNotificationsToolWireframe` | Bell icon button |
| `VeltNotificationsPanelWireframe` | Full panel container |
| `.Header` | Tab header area |
| `.Content` | Notification list area |
| `.Content.List.Item` | Individual notification |
| `.Settings` | Settings panel |

**Verification:**
- [ ] VeltWireframe wraps customizations
- [ ] Wireframe components match desired structure
- [ ] shadowDom disabled if using custom CSS
- [ ] All subcomponents properly nested

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/wireframes - "Notifications Panel Wireframes"
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-tool/wireframes - "Notifications Tool Wireframes" (Variant)
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/primitives - "Notifications Panel Primitives"

---

## 9. Wireframe Variables

**Impact: MEDIUM**

Template-variable binding layer for Notifications Panel and Notifications Tool wireframes. Documents the `velt-data` / `velt-if` / `velt-class` directives, the variable namespaces (Data State, UI State, Feature State, Loop-scope), `defaultCondition` / Angular signal inputs, and `shouldShow` gates exposed by each wireframe slot. Sits on top of the structural catalog in `ui/ui-wireframes.md`.

### 9.1 Bind Notifications Panel Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives tab selection, settings open/close, per-row unread styling, and empty-state rendering inside Notifications Panel wireframes without re-subscribing to notification state)**

The Notifications Panel wireframe family (`<velt-notifications-panel-...-wireframe>` / `<VeltNotificationsPanelWireframe.*>`) exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing tab tracking, unread counting, or settings open/close state on top of `useNotificationsData` / `useUnreadNotificationsCount`. Variables are mapped — reference them by their short name, **never** as `componentConfig.var`.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top of that structure.

Do not rebuild tab/unread/empty state from hooks and conditionally mount slots. The panel already exposes `selectedTab`, `TABS`, `unreadNotificationsForYou`, and `isAllRead` as injected variables.

**Correct (read the injected variables via `velt-data` / `velt-if` / `velt-class` — a minimal panel with title bar and content area):**

```jsx
import { VeltWireframe, VeltNotificationsPanelWireframe } from '@veltdev/react';

<VeltWireframe>
  <VeltNotificationsPanelWireframe>
    <VeltNotificationsPanelWireframe.Header>
      <div className="my-panel__title">
        <VeltNotificationsPanelWireframe.Title />
        <VeltNotificationsPanelWireframe.ReadAllButton />
        <VeltNotificationsPanelWireframe.SettingsButton />
        <VeltNotificationsPanelWireframe.CloseButton />
      </div>
    </VeltNotificationsPanelWireframe.Header>
    <VeltNotificationsPanelWireframe.Content />
  </VeltNotificationsPanelWireframe>
</VeltWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-wireframe style="display:none;">
  <velt-notifications-panel-wireframe>
    <velt-notifications-panel-header-wireframe>
      <div class="my-panel__title">
        <velt-notifications-panel-title-wireframe></velt-notifications-panel-title-wireframe>
        <velt-notifications-panel-read-all-button-wireframe></velt-notifications-panel-read-all-button-wireframe>
        <velt-notifications-panel-settings-button-wireframe></velt-notifications-panel-settings-button-wireframe>
        <velt-notifications-panel-close-button-wireframe></velt-notifications-panel-close-button-wireframe>
      </div>
    </velt-notifications-panel-header-wireframe>
    <velt-notifications-panel-content-wireframe></velt-notifications-panel-content-wireframe>
  </velt-notifications-panel-wireframe>
</velt-wireframe>
```

#### Variable namespaces

The Notifications Panel injects four namespaces into every slot.

**Data State** — per-feature data (the four groupings, settings tree, current document):

| Variable | Type | Notes |
|---|---|---|
| `notificationsForYouInSession` | `Notification[] \| null` | Notifications matched to the current user (drives the For-you tab). |
| `notificationsInSession` | `Notification[] \| null` | All in-session notifications (combined feed). |
| `notificationsByUserMap` | `Record<string, { user: User; notifications: Notification[] }>` | Grouped by user email. Bracket-lookup: `{notificationsByUserMap[notification.from.email].notifications.length}`. |
| `notificationsByDocumentId` | `{ documentId: string; notifications: Notification[] }[] \| null` | Grouped by document. |
| `notificationsByDate` | `{ date: string; displayName: string; notifications: Notification[] }[] \| null` | Grouped by date bucket (drives the All tab). |
| `currentDocumentName` | `string` | Display name of the current document. |
| `unreadNotificationsForYou` | `number` | Unread-count badge for the For-you tab. Also exposed by the notifications-tool. |
| `settingsConfig` | `NotificationInitialSettingsConfig[]` | Settings-tree configuration. |
| `settingsSelectedOption` | `Record<string, NotificationConfigValue>` | Selected option keyed by setting id — bracket-lookup: `{settingsSelectedOption[setting.id]}`. |

**UI State** — per-instance flags driven by the panel:

| Variable | Type | Notes |
|---|---|---|
| `selectedTab` | `'forYou' \| 'people' \| 'documents' \| 'all'` | Active tab id. Compare against `TABS.*`. |
| `TABS` | `{ ForYou; People; Documents; All }` | Constant tab-id map. Use for comparisons (`{selectedTab} === {TABS.ForYou}`). |
| `tabConfig` | `NotificationTabConfig \| null` | Per-tab visibility flags. |
| `tabPage` | `{ forYou; people; documents; all }` | Pagination cursor per tab. |
| `pageSize` | `number` | Default `5`. |
| `tabCount` | `number` | Number of visible tabs. |
| `panelOpenMode` | `'popover' \| 'sidebar' \| ...` | Layout mode. |
| `notificationsPanelVisible` | `boolean` | Panel is open. Also exposed by the notifications-tool. |
| `settingsOpen` | `boolean` | Settings view is open. |
| `settingsAccordionExpanded` | `Record<string, boolean>` | Per-accordion expanded state, bracket-lookup by id. |
| `settingsMutedAll` | `boolean` | Master "mute all" toggle. |
| `settingsItemRecentlyClosed` | `boolean` | Triggers the close animation. |
| `settingsLayout` | `'accordion' \| ...` | Settings UI layout. |
| `usersExpanded` | `Record<string, boolean>` | Per-user accordion state, bracket-lookup by email. |
| `documentExpanded` | `Record<string, boolean>` | Per-document accordion state, bracket-lookup by id. |
| `shadowDom` | `boolean` | Shadow-DOM wrapping flag (host attribute). |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag from the host element. |

**Feature State** — capability flags toggled via SDK config:

| Variable | Type | Notes |
|---|---|---|
| `settingsEnabled` | `boolean` | Settings view is available. Gate the settings button with `velt-if="{settingsEnabled}"`. |

**Loop-scope variables** — only resolvable inside the iteration primitive noted under "Available in":

| Variable | Type | Available in |
|---|---|---|
| `notification` | `Notification` | `<velt-notifications-panel-content-list-wireframe>` and descendants |
| `notifications` | `Notification[]` | `*-content-list`, `*-content-load-more` |
| `isLoadMoreVisible` | `boolean` | `*-content-load-more` |
| `isAllRead` | `boolean` | `*-content-all-read-container` |
| `user`, `userNotifications` | `User`, `Notification[]` | People-tab list-item descendants |
| `documentId`, `documentName`, `documentNotifications` | `string`, `string`, `Notification[]` | Documents-tab list-item descendants |
| `dateGroup` | `{ date; displayName; notifications }` | All-tab list-item descendants |
| `setting`, `option` | `NotificationInitialSettingsConfig`, `NotificationConfigValue` | Settings accordion descendants |

#### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show a slot you would otherwise hide (e.g. render the settings button even when `settingsEnabled` is false). |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-notifications-panel-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // notifications groupings, tabConfig,
                                         // settingsConfig, settingsSelectedOption
[parentLocalUIState]="localUI()"         // darkMode, variant
```

#### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `notifications-panel-settings-button-wireframe` | `settingsEnabled === true` |
| `notifications-panel-settings-wireframe` | `settingsOpen === true` (additionally `settingsEnabled === true` to render the trigger) |
| `notifications-panel-header-tab-for-you-wireframe` (and `-people`, `-documents`, `-all`) | `tabConfig.<tabId>` is truthy. `selected` modifier applied when `selectedTab === TABS.<TabId>`. |
| `notifications-panel-skeleton-wireframe` | Parent renders while `isLoading === true`. |
| `notifications-panel-content-load-more-wireframe` | `isLoadMoreVisible === true` |
| `notifications-panel-content-all-read-container-wireframe` | `isAllRead === true` |
| `notifications-panel-content-for-you` / `-people` / `-documents` / `-all` | Each gated on `selectedTab` matching its tab id. |

Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.

#### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`** Variables are mapped to short names. `<velt-data field="componentConfig.unreadNotificationsForYou" />` resolves to nothing — use `<velt-data field="unreadNotificationsForYou" />`.

**2. DO NOT compare `selectedTab` to a string literal — compare to `TABS.*`.** Use `'{selectedTab} === {TABS.ForYou}'`, not `'{selectedTab} === "forYou"'`. The `TABS` map is the canonical comparison surface.

**3. DO NOT bracket-lookup the wrong key.** `settingsAccordionExpanded` is keyed by setting id, `usersExpanded` by email, `documentExpanded` by document id, `settingsSelectedOption` by setting id. Mismatched keys silently resolve to `undefined`.

**4. DO NOT use loop-scope variables outside their iteration primitive.** `notification`, `user`, `documentId`, `setting`, `option` only exist inside the descendants of the iteration tag that injects them. Reading `notification.title` at the panel root resolves to nothing.

**5. DO NOT mix `defaultCondition` with `velt-if` for the same gate.** `defaultCondition={false}` disables the slot's internal `shouldShow`. `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**6. DO NOT bind to `shadowDom` from inside the wireframe to *enable* shadow-DOM.** Shadow-DOM is set via the host attributes `shadow-dom="true"` / `panel-shadow-dom="true"` on `<velt-notifications-panel>` (or on the linked `<velt-notifications-tool>`). The variable only reports the current state.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name (not `componentConfig.var`)
- [ ] Tab comparisons use `{TABS.<TabId>}`, never raw string literals
- [ ] Bracket-lookup keys match each map's documented key (id vs email vs documentId)
- [ ] Loop-scope variables (`notification`, `user`, `setting`, `option`, …) are only read inside their iteration primitive
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate, never combined with `velt-if` for the same condition
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not
- [ ] Settings button is gated with `velt-if="{settingsEnabled}"`; settings view body is gated with `velt-if="{settingsOpen}"`

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/wireframe-variables — "Notifications Panel Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `wireframe-variables/wireframe-variables-notifications-tool.md` (linked tool — shares `componentConfigSignal`)

---

### 9.2 Bind Notifications Tool Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives the bell icon swap, unread-count badge, and panel-open active state inside the Notifications Tool wireframe without re-subscribing to unread state)**

The Notifications Tool wireframe family (`<velt-notifications-tool-...-wireframe>` / `<VeltNotificationsToolWireframe.*>`) powers the bell-icon trigger that opens the linked Notifications Panel. It exposes a small set of tool-specific variables on top of the shared panel context. Read them with `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling.

The tool shares its `componentConfigSignal` with the linked panel. Every variable in `wireframe-variables/wireframe-variables-notifications-panel.md` also resolves inside tool slots — only the **tool-specific** entries below are unique to this rule. For structural tag composition, see `ui/ui-wireframes.md`.

**Incorrect (rebuilding unread / panel-open state from hooks):**

```jsx
import { useUnreadNotificationsCount } from '@veltdev/react';
import { VeltNotificationsToolWireframe } from '@veltdev/react';

function Bell({ panelOpen }) {
  const unread = useUnreadNotificationsCount();
  return (
    <VeltNotificationsToolWireframe className={panelOpen ? 'panel-open' : ''}>
      {unread > 0 ? <UnreadBellIcon /> : <BellIcon />}
      {unread > 0 && <span className="badge">{unread}</span>}
    </VeltNotificationsToolWireframe>
  );
}
```

**Correct (read the injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltWireframe, VeltNotificationsToolWireframe } from '@veltdev/react';

<VeltWireframe>
  <VeltNotificationsToolWireframe veltClass="'panel-open': {notificationsPanelVisible}">
    <button className="my-bell">
      <VeltNotificationsToolWireframe.Icon />
      <VeltNotificationsToolWireframe.UnreadIcon />
      <VeltNotificationsToolWireframe.Label />
      <VeltNotificationsToolWireframe.UnreadCount />
    </button>
  </VeltNotificationsToolWireframe>
</VeltWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-wireframe style="display:none;">
  <velt-notifications-tool-wireframe>
    <button class="my-bell" velt-class="'panel-open': {notificationsPanelVisible}">
      <velt-notifications-tool-icon-wireframe></velt-notifications-tool-icon-wireframe>
      <velt-notifications-tool-unread-icon-wireframe></velt-notifications-tool-unread-icon-wireframe>
      <velt-notifications-tool-label-wireframe></velt-notifications-tool-label-wireframe>
      <velt-notifications-tool-unread-count-wireframe></velt-notifications-tool-unread-count-wireframe>
    </button>
  </velt-notifications-tool-wireframe>
</velt-wireframe>
```

#### Variable namespaces

**Data State** — drives the bell icon, the unread badge, and the active-state styling:

| Variable | Type | Notes |
|---|---|---|
| `unreadNotificationsForYou` | `Notification[]` | Unread notifications list (note: as an array here — the panel exposes `unreadNotificationsForYou` as a `number`). Length drives the count badge. |

**UI State** — per-instance flags driven by the tool:

| Variable | Type | Notes |
|---|---|---|
| `notificationsPanelVisible` | `boolean` | Linked panel is currently open. Drives the `active` / `panel-open` modifier on the trigger. |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag set on the host element. |

The `componentConfigSignal` also exposes `tabConfig`, `shadowDom`, `panelShadowDom`, `considerAllNotifications`, `template`, and `settingsLayout`. These are set on the public element as kebab-case attributes (see "Public attributes" below) — inside a wireframe they still resolve as bare names.

#### Public attributes on the root element

The root `<velt-notifications-tool>` element inherits the same `defaultCondition` prop as the panel and additionally accepts these public attributes that flow through to the linked panel:

| React Prop | HTML Attribute | Type | Default | Description |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the slot renders regardless of its internal `shouldShow` gate. |
| `considerAllNotifications` | `consider-all-notifications` | `boolean \| "true" \| "false"` | `false` | Count all notifications, not just unread. |
| `shadowDom` | `shadow-dom` | `boolean \| "true" \| "false"` | `true` | Wrap the tool in Shadow DOM. |
| `panelShadowDom` | `panel-shadow-dom` | `boolean \| "true" \| "false"` | `true` | Wrap the linked panel in Shadow DOM. |
| `settingsLayout` | `settings-layout` | `'accordion' \| ...` | `'accordion'` | Forwarded to the linked panel. |
| `variant` | `variant` | `string` | — | Wireframe variant id. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-notifications-tool-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // shared with the linked panel
[parentLocalUIState]="localUI()"         // darkMode, variant
```

#### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `notifications-tool-icon-wireframe` | Parent gates this on `unreadNotificationsForYou.length === 0`. |
| `notifications-tool-unread-icon-wireframe` | Parent gates this on `unreadNotificationsForYou.length > 0`. |
| `notifications-tool-unread-count-wireframe` | `unreadNotificationsForYou.length > 0` |

The `notifications-tool-label-wireframe` is always rendered (no gate) — wrap it in your own `velt-if` if you want to hide the "Notifications" label in compact mode.

#### Common mistakes — DO NOT

**1. DO NOT call `.length` on `unreadNotificationsForYou` inside the *panel* wireframe.** Inside the panel, `unreadNotificationsForYou` is already a `number` — use `{unreadNotificationsForYou} > 0`. Inside the tool, it's an `Notification[]` — use `{unreadNotificationsForYou.length} > 0`. The same short name resolves to different shapes across the two wireframes.

**2. DO NOT mount `<...-icon-wireframe>` and `<...-unread-icon-wireframe>` without `velt-if` gates.** They will both render simultaneously. The parent's `shouldShow` is informational, not enforced when you compose the slots yourself — gate explicitly with `velt-if="{unreadNotificationsForYou.length} === 0"` and `velt-if="{unreadNotificationsForYou.length} > 0"`.

**3. DO NOT set `shadow-dom` / `panel-shadow-dom` from inside a wireframe slot.** These are *host attributes* on `<velt-notifications-tool>`. Inside the wireframe, `shadowDom` is read-only.

**4. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.unreadNotificationsForYou.length" />` resolves to nothing.

**5. DO NOT duplicate panel variables in your tool template if you only need them in one place.** The tool shares `componentConfigSignal` with the linked panel. Read panel variables (e.g. `selectedTab`, `settingsOpen`) directly inside tool slots without re-wiring.

**Verification:**
- [ ] `unreadNotificationsForYou.length` is used inside the tool (array), `unreadNotificationsForYou` directly inside the panel (number)
- [ ] Both icon slots have explicit `velt-if` gates that don't overlap
- [ ] Public attributes (`shadow-dom`, `panel-shadow-dom`, `consider-all-notifications`, `settings-layout`, `variant`) are set on the host `<velt-notifications-tool>` element, not inside wireframe slots
- [ ] Wireframe slots reference mapped variables by short name (not `componentConfig.var`)
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-tool/wireframe-variables — "Notifications Tool Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `wireframe-variables/wireframe-variables-notifications-panel.md` (linked panel — shares `componentConfigSignal`)

---

## 10. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns and verification checklists for Velt notification integrations.

### 10.1 Debug Common Notification Issues

**Impact: LOW-MEDIUM (Troubleshoot notification problems quickly)**

Common problems and solutions when implementing Velt notifications.

**Issue 1: Notifications not appearing**

```jsx
// Problem: Tool added but no notifications show
<VeltNotificationsTool />
```

**Solution:**
1. Verify notifications enabled in [Velt Console](https://console.velt.dev)
2. Check user is authenticated with `authProvider`
3. Confirm document is set with `setDocument()`
4. Check browser console for errors

```jsx
// Verify setup
import { useVeltClient } from '@veltdev/react';

function DebugNotifications() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      console.log('Velt client initialized');

      // Check if notifications element exists
      const notifElement = client.getNotificationElement();
      console.log('Notification element:', notifElement);
    }
  }, [client]);
}
```

**Issue 2: Unread count not updating**

```jsx
// Problem: Badge shows stale count
const count = useUnreadNotificationsCount();
// count is undefined or doesn't change
```

**Solution:**
- Ensure hook is used within VeltProvider
- Verify document context is set
- Check if user has any notifications

```jsx
// Debug unread count
function DebugUnreadCount() {
  const unreadCount = useUnreadNotificationsCount();

  useEffect(() => {
    console.log('Unread count updated:', unreadCount);
  }, [unreadCount]);

  return <div>ForYou: {unreadCount?.forYou}, All: {unreadCount?.all}</div>;
}
```

**Issue 3: Email notifications not sending**

**Checklist:**
- [ ] SendGrid API key configured in Velt Console
- [ ] Sender email verified in SendGrid
- [ ] User has email preference set to ALL or MINE
- [ ] User email is valid in authProvider user object
- [ ] Comment contains @mention (for MINE setting)

**Issue 4: Custom notifications not appearing**

```javascript
// Problem: REST API returns success but notification not visible
const response = await fetch('https://api.velt.dev/v2/notifications/add', ...);
// Returns success but notification doesn't show
```

**Solution:**
- Verify `notifyUsers` contains valid user IDs
- Check `organizationId` and `documentId` match current context
- Ensure user is on the correct document
- Wait for real-time sync (may take a few seconds)

**Issue 5: Settings not persisting**

```jsx
// Problem: User settings reset on page refresh
```

**Solution:**
- `setSettingsInitialConfig` only sets defaults for new users
- Use `setSettings` to update existing user preferences
- Check if user ID is consistent across sessions

**Issue 6: Notification click not navigating**

```jsx
// Problem: Clicking notification doesn't do anything
```

**Solution:**
Use the `onNotificationClick` prop on the component:

```jsx
import { VeltNotificationsTool } from '@veltdev/react';

function NotificationNavigation() {
  const handleNotificationClick = (notification) => {
    // Navigate to document
    if (notification.documentId) {
      router.push(`/documents/${notification.documentId}`);
    }

    // Or use custom data
    if (notification.notificationSourceData?.url) {
      router.push(notification.notificationSourceData.url);
    }
  };

  return (
    <VeltNotificationsTool
      onNotificationClick={handleNotificationClick}
    />
  );
}
```

**Issue 7: Unread notification missing from For You tab and badge**

```jsx
// Problem: user has an unread @mention, but the badge shows 0
<VeltNotificationsTool />
```

**Solution:**
- By default, For You and the unread count come from the organization's 15 most recently active documents. Notifications on older documents are not fetched.
- Opt in to the user-scoped fetch (SDK 6.0.8+ API, 6.0.9+ prop):

```jsx
<VeltNotificationsTool enableUserScopedNotifications={true} />
```

- `enableCurrentDocumentOnly()` suppresses the user-scoped fetch, so turn it off for org-wide feeds.

**Issue 8: Panel or tool stuck on the loading skeleton**

**Solution:**
- If the tool or panel mounts after notification data has already resolved (for example, rendered after `identify()` completes), SDK builds before 6.0.13 can stay on the skeleton. Upgrade to 6.0.13 or later.

**Issue 9: A user does not get a notification for a private comment**

**Solution:**
- Expected behavior. A notification for a private comment only reaches the comment author and users or organizations named in its visibility, on every channel (panel tabs, webhooks, email). No redacted placeholder is sent, and Access Context filtering still applies on top. No integration change is required.

**Verification:**
- [ ] Velt Console: Notifications feature enabled
- [ ] VeltProvider: API key correct
- [ ] User: authProvider configured with valid user object
- [ ] Document: `setDocument()` called with document ID
- [ ] Network: No CORS or auth errors in console
- [ ] Hooks: Used within VeltProvider context
- [ ] Email: SendGrid configured (for email notifications)

**Debug Logging:**

```jsx
// Enable verbose logging
<VeltProvider apiKey="API_KEY" debug={true}>
```

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/setup - "Setup"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enableuserscopednotifications - "enableUserScopedNotifications"
- https://docs.velt.dev/async-collaboration/notifications/overview#notifications-for-private-comments - "Notifications for Private Comments"
- https://docs.velt.dev/release-notes/version-6/sdk-changelog - 6.0.13 loading-skeleton fix

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/notifications/overview
- https://docs.velt.dev/async-collaboration/notifications/setup
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/wireframes
- https://console.velt.dev
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-tool/wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/primitives
- https://docs.velt.dev/self-hosting/partial/notifications
- https://docs.velt.dev/webhooks/basic
- https://docs.velt.dev/webhooks/advanced
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-notifications-v2
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/notificationconfig-update
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications
