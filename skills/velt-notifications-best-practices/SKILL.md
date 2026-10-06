---
name: velt-notifications-best-practices
description: Velt Notifications implementation patterns and best practices for React, Next.js, and web applications. Use when adding in-app notifications, notification panels, email notifications via SendGrid, webhook integrations (private-comment visibility), user preference management, cross-organization feeds (enableCrossOrganization), user-scoped For You notifications (enableUserScopedNotifications), self-hosted custom notifications, or binding Notifications Panel/Tool wireframe variables.
license: MIT
metadata:
  author: velt
  version: "1.2.1"
---

# Velt Notifications Best Practices

Comprehensive implementation guide for Velt's notification system in React and Next.js applications. Contains 21 rules across 10 categories, prioritized by impact to guide automated code generation and integration patterns.

## When to Apply

Reference these guidelines when:
- Adding in-app notifications to a React/Next.js application
- Setting up the VeltNotificationsTool and VeltNotificationsPanel
- Configuring notification tabs (For You, All, Documents, People)
- Accessing notification data via hooks or REST APIs
- Managing user notification preferences and channels
- Reading or writing per-user notification config via REST API (document-level or org-level)
- Setting up email notifications with SendGrid
- Creating custom notifications via REST API
- Integrating with external services via webhooks
- Configuring notification delay and batching to reduce noise
- Keeping unread notifications visible in the For You tab with `enableUserScopedNotifications`
- Self-hosting custom notification content with a `NotificationDataProvider`
- Handling notifications for private comments (visibility filtering, `accessDeniedUsers`)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Panel Configuration | HIGH | `panel-` |
| 3 | Data Access | HIGH | `data-` |
| 4 | Settings Management | MEDIUM-HIGH | `settings-` |
| 5 | Configuration | MEDIUM | `config-` |
| 6 | Notification Triggers | MEDIUM | `triggers-` |
| 7 | Delivery Channels | MEDIUM | `delivery-` |
| 8 | UI Customization | MEDIUM | `ui-` |
| 9 | Wireframe Variables | MEDIUM | `wireframe-variables-` |
| 10 | Debugging & Testing | LOW-MEDIUM | `debug-` |

## Quick Reference

### 1. Core Setup (CRITICAL)

- `core-setup` — Enable notifications in the Console, add VeltNotificationsTool, component props and shared-service flags

### 2. Panel Configuration (HIGH)

- `panel-tabs` — Configure notification panel tabs (forYou, documents, all) and primitive `listType`
- `panel-display` — Control panel open mode (popover vs sidebar), embedded panel, pageSize
- `panel-current-document-only` — Restrict notifications to the current document; primitive `documentId` scoping

### 3. Data Access (HIGH)

- `data-hooks` — Use React hooks to access notification data
- `data-rest-api` — Use REST APIs for server-side get, update, and delete (visibility-filtered reads)
- `data-notification-data-provider` — Self-host custom notification content with a NotificationDataProvider (function or endpoint based); applies only to notificationSource === 'custom'
- `data-notification-actions` — Mark notifications as read and handle click events

### 4. Settings Management (MEDIUM-HIGH)

- `settings-channels` — Configure notification delivery channels and settings UI
- `settings-config-rest-api` — Read (userId) and write (userIds) per-user notification config at document or org level via REST API

### 5. Configuration (MEDIUM)

- `config-cross-organization` — Cross-organization notifications: enableCrossOrganization/disableCrossOrganization, CrossOrganizationConfig, getCrossOrganizationConfig$()
- `config-user-scoped-notifications` — enableUserScopedNotifications/disableUserScopedNotifications, UserScopedNotificationsConfig `limit`, For You and unread count outside the recently-active-documents window

### 6. Notification Triggers (MEDIUM)

- `triggers-custom` — Create custom notifications via REST API (notifyAll defaults to true; resolver-eligible writes)
- `triggers-self-notifications` — Enable or disable notifications for the user's own actions

### 7. Delivery Channels (MEDIUM)

- `delivery-email` — Set up email notifications with SendGrid
- `delivery-webhooks` — Forward basic/advanced webhook payloads, honor per-user preferences, drop accessDeniedUsers for private comments
- `delivery-delay-batching` — Configure opt-in server-side delay and batching pipeline (Console or workspace REST)

### 8. UI Customization (MEDIUM)

- `ui-wireframes` — Customize notification components with wireframes

### 9. Wireframe Variables (MEDIUM)

- `wireframe-variables-notifications-panel` — Bind Notifications Panel wireframe slots using template variables (tabs, settings, per-row unread, empty-state)
- `wireframe-variables-notifications-tool` — Bind Notifications Tool wireframe slots using template variables (bell icon swap, unread badge, panel-open active state)

### 10. Debugging & Testing (LOW-MEDIUM)

- `debug-common-issues` — Common issues and solutions

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup.md
rules/shared/panel/panel-tabs.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Source pointers to official documentation

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
