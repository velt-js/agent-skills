# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup patterns required for any Velt comments implementation. Includes provider initialization, document configuration, and user authentication.

---

## 2. Comment Modes (mode)

**Impact:** HIGH
**Description:** Different comment presentation and interaction modes for various use cases. Includes Freestyle, Popover, Stream, Text, Page, Inline, rich text editor integrations, media player comments, and chart comments.

---

## 3. Standalone Components (standalone)

**Impact:** MEDIUM-HIGH
**Description:** Individual comment components for building custom implementations. Includes Comment Pin, Comment Thread, and Comment Composer for DIY comment interfaces.

---

## 4. Comment Surfaces (surface)

**Impact:** MEDIUM-HIGH
**Description:** Navigation and display surfaces for comments. Includes the Comments Sidebar and related toggle components.

---

## 5. UI Customization (ui)

**Impact:** MEDIUM
**Description:** Visual customization patterns for comment components. Includes dialog customization, bubble styling, and wireframe component usage.

---

## 6. Data Model (data)

**Impact:** MEDIUM
**Description:** Patterns for working with comment data structures. Includes custom metadata, comment annotations, and filtering/grouping.

---

## 7. Debugging & Testing (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns and verification checklists for Velt integrations.

---

## 8. Moderation & Permissions (permissions)

**Impact:** LOW
**Description:** Access control and moderation features for comments. Includes comment visibility control (private mode), per-annotation visibility updates, and post-persist event handling.

**Rules:**
- `permissions-private-mode` - Control global comment visibility with enablePrivateMode/disablePrivateMode and update per-annotation visibility with updateVisibility
- `permissions-comment-saved-event` - Subscribe to the commentSaved event for reliable post-persist side-effects (webhooks, analytics, external sync)

---

## 9. Attachments & Reactions (attach)

**Impact:** MEDIUM
**Description:** File attachment control and emoji reaction features. Includes attachment download behavior, click interception events, and CSS state classes for attachment loading and edit-mode states.
