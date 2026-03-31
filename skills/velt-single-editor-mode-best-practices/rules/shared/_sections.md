# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup for enabling Single Editor Mode. Includes initializing via useLiveStateSyncUtils() or Velt.getLiveStateSyncElement(), enabling the mode with config options (customMode, singleTabEditor), embedding the VeltSingleEditorModePanel, and enabling the default UI.

---

## 2. Editor State Management (state)

**Impact:** CRITICAL
**Description:** Patterns for setting the editor, reading editor status, and handling tab locking. Includes setUserAsEditor() with error handling, isUserEditor() and getEditor() Observables, useUserEditorState() and useEditor() hooks, and editCurrentTab() for multi-tab scenarios.

---

## 3. Access Request Flow (access)

**Impact:** HIGH
**Description:** Editor-side and viewer-side access handoff workflow. Editor receives requests via isEditorAccessRequested() and responds with acceptEditorAccessRequest() or rejectEditorAccessRequest(). Viewer initiates via requestEditorAccess() and cancels via cancelEditorAccessRequest().

---

## 4. Element Control (elements)

**Impact:** HIGH
**Description:** Fine-grained control over which DOM elements are governed by Single Editor Mode. Includes singleEditorModeContainerIds() for container scoping, data-velt-sync-access attributes for native HTML elements, and enableAutoSyncState() for text element syncing.

---

## 5. Timeout Configuration (timeout)

**Impact:** MEDIUM
**Description:** Automatic editor access timeout and transfer behavior. Includes setEditorAccessTimeout(), enableEditorAccessTransferOnTimeOut(), getEditorAccessTimer() Observable, and the useEditorAccessTimer() hook.

---

## 6. Event Handling (events)

**Impact:** MEDIUM
**Description:** Subscription patterns for 7 Single Editor Mode event types covering access requests, role assignments, and multi-tab detection via liveStateSyncElement.on() API and useLiveStateSyncEventCallback() hook.

---

## 7. Debugging & Testing (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns for Single Editor Mode integrations. Covers heartbeat configuration, updateUserPresence() fallback, resetUserAccess(), element attribute issues, and multi-user testing.
