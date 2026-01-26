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
**Description:** Configuration options for the notifications panel. Includes tab setup (forYou, all, documents, people), panel open modes (popover, sidebar), and display options.

---

## 3. Data Access (data)

**Impact:** HIGH
**Description:** Patterns for accessing notification data. Includes React hooks (useNotificationsData, useUnreadNotificationsCount), SDK APIs, and REST API endpoints.

---

## 4. Settings Management (settings)

**Impact:** MEDIUM-HIGH
**Description:** User notification preference management. Includes channel configuration (Inbox, Email, Slack), settings UI layout, and mute options.

---

## 5. Notification Triggers (triggers)

**Impact:** MEDIUM
**Description:** How notifications are generated. Includes automatic triggers from comments/@mentions and custom notification creation via REST API.

---

## 6. Delivery Channels (delivery)

**Impact:** MEDIUM
**Description:** Notification delivery methods. Includes in-app inbox, email via SendGrid, and webhook integrations for external services.

---

## 7. UI Customization (ui)

**Impact:** MEDIUM
**Description:** Visual customization patterns for notification components. Includes wireframe components for panel, tool, and content list customization.

---

## 8. Debugging & Testing (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns and verification checklists for Velt notification integrations.
