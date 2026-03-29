# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup patterns required for any Velt notifications implementation. Includes enabling notifications in the console and adding VeltNotificationsTool.

---

## 2. Panel Configuration (panel)

**Impact:** HIGH
**Description:** Configuration options for the notifications panel. Includes tab setup (forYou, all, documents), panel open modes (popover, sidebar), display options, and document filtering.

**Rules:**
- `panel-tabs` - Configure notification panel tabs (forYou, all, documents)
- `panel-display` - Control panel display mode (popover, sidebar, embedded)
- `panel-current-document-only` - Filter notifications to current document only

---

## 3. Data Access (data)

**Impact:** HIGH
**Description:** Patterns for accessing notification data. Includes React hooks (useNotificationsData, useUnreadNotificationsCount), SDK APIs, REST API endpoints, and the NotificationDataProvider resolver for fetching and deleting custom notifications from your own backend.

**Rules:**
- `data-hooks` - Use React hooks to access notification data
- `data-rest-api` - Use REST APIs for server-side notification management
- `data-notification-data-provider` - Register NotificationDataProvider on VeltDataProvider to route custom notification fetch and delete operations through your own backend resolver; applies only to notificationSource === 'custom' notifications
- `data-notification-actions` - Mark notifications as read and handle click events

---

## 4. Settings Management (settings)

**Impact:** MEDIUM-HIGH
**Description:** User notification preference management. Includes channel configuration (Inbox, Email, Slack), settings UI layout, mute options, and server-side getConfig/setConfig REST API for reading and writing per-user preferences at document or org level.

---

## 5. Notification Triggers (triggers)

**Impact:** MEDIUM
**Description:** How notifications are generated. Includes automatic triggers from comments/@mentions, custom notification creation via REST API, and self-notification control.

**Rules:**
- `triggers-custom` - Custom notification creation via REST API
- `triggers-self-notifications` - Enable or disable self-notifications for own actions

---

## 6. Delivery Channels (delivery)

**Impact:** MEDIUM
**Description:** Notification delivery methods. Includes in-app inbox, email via SendGrid, webhook integrations for external services, and the opt-in server-side delay and batching pipeline.

---

## 7. UI Customization (ui)

**Impact:** MEDIUM
**Description:** Visual customization patterns for notification components. Includes wireframe components for panel, tool, and content list customization.

---

## 8. Debugging & Testing (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns and verification checklists for Velt notification integrations.
