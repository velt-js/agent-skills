# Velt Notifications Best Practices

**Version 1.0.0**  
Velt  
January 2026

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

3. [Data Access](#3-data-access) — **HIGH**
   - 3.1 [Use React Hooks to Access Notification Data](#31-use-react-hooks-to-access-notification-data)
   - 3.2 [Use REST APIs for Server-Side Notification Management](#32-use-rest-apis-for-server-side-notification-management)

4. [Settings Management](#4-settings-management) — **MEDIUM-HIGH**
   - 4.1 [Configure Notification Delivery Channels](#41-configure-notification-delivery-channels)

5. [Notification Triggers](#5-notification-triggers) — **MEDIUM**
   - 5.1 [Create Custom Notifications via REST API](#51-create-custom-notifications-via-rest-api)

6. [Delivery Channels](#6-delivery-channels) — **MEDIUM**
   - 6.1 [Integrate with External Services via Webhooks](#61-integrate-with-external-services-via-webhooks)
   - 6.2 [Set Up Email Notifications with SendGrid](#62-set-up-email-notifications-with-sendgrid)

7. [UI Customization](#7-ui-customization) — **MEDIUM**
   - 7.1 [Customize Notification Components with Wireframes](#71-customize-notification-components-with-wireframes)

8. [Debugging & Testing](#8-debugging-testing) — **LOW-MEDIUM**
   - 8.1 [Debug Common Notification Issues](#81-debug-common-notification-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns required for any Velt notifications implementation. Includes enabling notifications in the console and adding VeltNotificationsTool.

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
        <VeltNotificationsTool />
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

Reference: https://docs.velt.dev/async-collaboration/notifications/setup - Enable Feature in Console, Add Notification Tool

---

## 2. Panel Configuration

**Impact: HIGH**

Configuration options for the notifications panel. Includes tab setup (forYou, all, documents, people), panel open modes (popover, sidebar), and display options.

### 2.1 Configure Notification Panel Tabs

**Impact: HIGH (Customize which notification categories users see)**

The notification panel has four tabs: forYou, all, documents, and people. Use `tabConfig` to rename, enable/disable, or reorder these tabs.

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

Reference: https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Tab Configuration

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

```html
// Control how many notifications load initially (v4.7.1+)
<VeltNotificationsTool pageSize={20} />
<!-- HTML variant -->
<velt-notifications-tool page-size="20"></velt-notifications-tool>
```

Reference: https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Panel Open Mode, Actions

---

## 3. Data Access

**Impact: HIGH**

Patterns for accessing notification data. Includes React hooks (useNotificationsData, useUnreadNotificationsCount), SDK APIs, and REST API endpoints.

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

**SDK API Alternative:**

```jsx
import { useVeltClient } from '@veltdev/react';

function NotificationData() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const notificationElement = client.getNotificationElement();

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
  }, [client]);
}
```

Reference: https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Data, Events

---

### 3.2 Use REST APIs for Server-Side Notification Management

**Impact: HIGH (Programmatic access to notifications from backend services)**

Use Velt's REST APIs to get, update, or create notifications from your backend. Requires API key and auth token.

**Incorrect (client-side only approach):**

```jsx
// Wrong: No backend notification management
// Can't send notifications from server events
```

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
      documentId: 'your-doc-id',      // Optional: filter by document
      userId: 'user-id',               // Optional: filter by user
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

Reference: https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-notifications-v2 - Get Notifications API

---

## 4. Settings Management

**Impact: MEDIUM-HIGH**

User notification preference management. Includes channel configuration (Inbox, Email, Slack), settings UI layout, and mute options.

### 4.1 Configure Notification Delivery Channels

**Impact: MEDIUM-HIGH (Set up where users receive notifications (Inbox, Email, Slack, etc.))**

Configure which channels users can receive notifications through. Default channels are Inbox (ALL) and Email (MINE). Users can customize their preferences.

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

**Managing Settings Programmatically:**

```jsx
import { useNotificationSettings } from '@veltdev/react';

function SettingsManager() {
  const settings = useNotificationSettings();

  // Current user settings: { inbox: 'ALL', email: 'MINE', ... }
  console.log('Current settings:', settings);

  return null;
}

// Or via API
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
// Change settings display from accordion (default) to dropdown
<VeltNotificationsTool settingsLayout="dropdown" />

// Or via API
notificationElement.setSettingsLayout('dropdown'); // 'accordion' or 'dropdown'
```

**Enable/Disable Settings Panel:**

```jsx
const notificationElement = client.getNotificationElement();

// Hide settings gear icon
notificationElement.disableSettings();

// Show settings gear icon
notificationElement.enableSettings();
```

Reference: https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Settings, setSettingsInitialConfig

---

## 5. Notification Triggers

**Impact: MEDIUM**

How notifications are generated. Includes automatic triggers from comments/@mentions and custom notification creation via REST API.

### 5.1 Create Custom Notifications via REST API

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

      // Who to notify
      notifyUsers: [
        { userId: 'user-456', email: 'jane@example.com' },
        { userId: 'user-789', email: 'bob@example.com' }
      ],

      // Or notify all users on document
      notifyAll: false,

      // Check document access before notifying
      verifyUserPermissions: true
    }
  })
});
```

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

Reference: https://docs.velt.dev/api-reference/rest-apis/v2/notifications/add-notifications - Add Notifications API

---

## 6. Delivery Channels

**Impact: MEDIUM**

Notification delivery methods. Includes in-app inbox, email via SendGrid, and webhook integrations for external services.

### 6.1 Integrate with External Services via Webhooks

**Impact: MEDIUM (Forward notifications to Slack, Linear, or custom services)**

Use webhooks to forward Velt notifications to external services like Slack, Linear, or your own backend.

**Incorrect (no webhook integration):**

```jsx
// Notifications only in-app
// No external service integration
```

**Webhook Payload Structure:**

```javascript
// Your webhook endpoint receives:
{
  "event": "notification.created",
  "data": {
    "id": "notification-id",
    "organizationId": "org-id",
    "documentId": "doc-id",
    "actionUser": {
      "userId": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "displayHeadlineMessageTemplate": "{actionUser} mentioned you",
    "displayBodyMessage": "Check this out!",
    "notifyUsers": ["user-456"],
    "timestamp": 1722409519944,
    "notificationSource": "comment",  // or "custom"
    "notificationSourceData": {
      // Comment annotation or custom data
    }
  }
}
// Your webhook handler
app.post('/webhooks/velt', async (req, res) => {
  const { event, data } = req.body;

  // Verify webhook signature (recommended)
  const signature = req.headers['x-velt-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }

  if (event === 'notification.created') {
    // Forward to Slack
    await fetch('https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${data.actionUser.name}: ${data.displayHeadlineMessageTemplate}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${data.actionUser.name}* mentioned someone\n${data.displayBodyMessage}`
            }
          }
        ]
      })
    });
  }

  res.status(200).send('OK');
});
// Create Linear issue from notification
app.post('/webhooks/velt', async (req, res) => {
  const { event, data } = req.body;

  if (event === 'notification.created' && data.notificationSource === 'comment') {
    await linearClient.issueCreate({
      title: `Comment from ${data.actionUser.name}`,
      description: data.displayBodyMessage,
      teamId: 'your-team-id'
    });
  }

  res.status(200).send('OK');
});
```

**Example: Slack Integration**
**Example: Linear Integration**

**Add Channel to Settings:**

```jsx
// Let users control Slack notifications
notificationElement.setSettingsInitialConfig([
  {
    id: 'slack',
    name: 'Slack',
    enable: true,
    default: 'MINE',
    values: [
      { id: 'ALL', name: 'All Updates' },
      { id: 'MINE', name: 'Mentions Only' },
      { id: 'NONE', name: 'None' }
    ]
  }
]);
```

Reference: https://docs.velt.dev/webhooks/basic - Webhook setup

---

### 6.2 Set Up Email Notifications with SendGrid

**Impact: MEDIUM (Deliver notifications via email for @mentions and replies)**

Velt uses SendGrid for email notification delivery. Email notifications are triggered by @mentions and comment replies by default.

**Incorrect (expecting automatic email without setup):**

```jsx
// Email notifications won't work without SendGrid configuration
<VeltNotificationsTool />
```

**Email Template Data (for customization):**

```javascript
{
  // Comment data
  firstComment: { /* first comment in thread */ },
  latestComment: { /* most recent comment */ },
  prevComment: { /* previous comment in thread */ },

  // User data
  fromUser: { /* user who triggered notification */ },

  // Context
  commentAnnotation: { /* full annotation object */ },
  actionType: 'mention' | 'reply',
  documentMetadata: { /* document info */ }
}
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

Reference: https://docs.velt.dev/async-collaboration/comments/notifications - Email section

---

## 7. UI Customization

**Impact: MEDIUM**

Visual customization patterns for notification components. Includes wireframe components for panel, tool, and content list customization.

### 7.1 Customize Notification Components with Wireframes

**Impact: MEDIUM (Full control over notification panel and tool appearance)**

Use Velt wireframe components to customize the structure and appearance of the notifications tool and panel.

**Incorrect (only using default styling):**

```jsx
// Default appearance, no customization
<VeltNotificationsTool />
```

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

```jsx
// Use different variants for tool and panel
<VeltNotificationsTool
  variant="custom-tool"
  panelVariant="custom-panel"
/>
```

Reference: https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel - Panel wireframes

---

## 8. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns and verification checklists for Velt notification integrations.

### 8.1 Debug Common Notification Issues

**Impact: LOW-MEDIUM (Troubleshoot notification problems quickly)**

Common problems and solutions when implementing Velt notifications.

**Issue 1: Notifications not appearing**

**Solution:**

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
// Problem: Badge shows stale count
const count = useUnreadNotificationsCount();
// count is undefined or doesn't change
```

**Issue 2: Unread count not updating**

**Solution:**

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

```javascript
// Problem: REST API returns success but notification not visible
const response = await fetch('https://api.velt.dev/v2/notifications/add', ...);
// Returns success but notification doesn't show
```

**Solution:**

```jsx
// Problem: User settings reset on page refresh
```

**Solution:**

```jsx
// Problem: Clicking notification doesn't do anything
```

**Solution:**

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

**Debug Logging:**

```jsx
// Enable verbose logging
<VeltProvider apiKey="API_KEY" debug={true}>
```

Reference: https://docs.velt.dev/async-collaboration/notifications/setup - Setup requirements

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/notifications/overview
- https://docs.velt.dev/async-collaboration/notifications/setup
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel
- https://console.velt.dev
