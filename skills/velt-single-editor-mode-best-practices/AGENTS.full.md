# Velt Single Editor Mode Best Practices

**Version 1.1.0**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Single Editor Mode implementation guide covering exclusive editing access control, editor state management, access request flows, element-level sync control, timeout configuration, event subscriptions, and heartbeat presence detection. This skill provides evidence-backed patterns for integrating Velt's Single Editor Mode into React, Next.js, and other web applications. Covers enableSingleEditorMode, setUserAsEditor with error handling, editor/viewer access request workflows, container scoping, data-velt-sync-access attributes, auto-sync text elements, timeout transfer behavior, and all 7 SEM event types.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Enable Single Editor Mode with Auto-Sync and Editor Status UI](#11-enable-single-editor-mode-with-auto-sync-and-editor-status-ui)

2. [Editor State Management](#2-editor-state-management) — **CRITICAL**
   - 2.1 [Use React Hooks for Editor State](#21-use-react-hooks-for-editor-state)
   - 2.2 [Set User as Editor with Error Handling](#22-set-user-as-editor-with-error-handling)
   - 2.3 [Subscribe to Editor State and Identity via API](#23-subscribe-to-editor-state-and-identity-via-api)

3. [Access Request Flow](#3-access-request-flow) — **HIGH**
   - 3.1 [Use useEditorAccessRequestHandler for React Access Flow](#31-use-useeditoraccessrequesthandler-for-react-access-flow)
   - 3.2 [Handle Editor Access Requests via API](#32-handle-editor-access-requests-via-api)
   - 3.3 [Request and Cancel Editor Access as Viewer](#33-request-and-cancel-editor-access-as-viewer)

4. [Element Control](#4-element-control) — **HIGH**
   - 4.1 [Apply Sync Access Attributes to Native HTML Elements Only](#41-apply-sync-access-attributes-to-native-html-elements-only)
   - 4.2 [Scope Single Editor Mode to Specific Containers and Enable Auto-Sync](#42-scope-single-editor-mode-to-specific-containers-and-enable-auto-sync)

5. [Timeout Configuration](#5-timeout-configuration) — **MEDIUM**
   - 5.1 [Use useEditorAccessTimer for React Timeout UI](#51-use-useeditoraccesstimer-for-react-timeout-ui)
   - 5.2 [Configure Editor Access Timeout and Transfer Behavior](#52-configure-editor-access-timeout-and-transfer-behavior)

6. [Event Handling](#6-event-handling) — **MEDIUM**
   - 6.1 [Use useLiveStateSyncEventCallback for React Event Subscriptions](#61-use-uselivestatesynceventcallback-for-react-event-subscriptions)
   - 6.2 [Subscribe to Single Editor Mode Events via API](#62-subscribe-to-single-editor-mode-events-via-api)

7. [Debugging & Testing](#7-debugging-testing) — **LOW-MEDIUM**
   - 7.1 [Debug Common Single Editor Mode Issues](#71-debug-common-single-editor-mode-issues)

8. [UI Customization](#8-ui-customization) — **MEDIUM**
   - 8.1 [Customize the Single Editor Mode Panel with Wireframes](#81-customize-the-single-editor-mode-panel-with-wireframes)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup for enabling Single Editor Mode. Includes initializing via useLiveStateSyncUtils() or Velt.getLiveStateSyncElement(), enabling the mode with config options (customMode, singleTabEditor) after useVeltInitState() is true, embedding the VeltSingleEditorModePanel, enabling the default UI, and listing liveStateSync in featureAllowList when set.

### 1.1 Enable Single Editor Mode with Auto-Sync and Editor Status UI

**Impact: CRITICAL (Required for Single Editor Mode to function with live content sync)**

Single Editor Mode restricts editing to one user at a time. Other users see content in read-only mode with live sync. Enable it only after the user and document are initialized (`useVeltInitState()` returns `true` once both are set). In the example below, the first user to load the page claims the editor role; the docs recommend calling `setUserAsEditor()` on an explicit action (for example, when the user starts typing), so pick the trigger that fits your UX.

**Setup requires changes in two places:**
1. `VeltCollaboration` component — enables SEM, auto-sync, and claims editor role
2. Document page — renders editor status banner and content area with sync attributes

#### 1. VeltCollaboration Component

Add SEM setup, auto-sync, container scoping, and auto-claim editor role:

```tsx
"use client";

import { useEffect } from "react";
import {
  VeltComments,
  VeltCommentTool,
  VeltCursor,
  VeltPresence,
  VeltNotificationsTool,
  VeltSingleEditorModePanel,
  useLiveStateSyncUtils,
  useVeltInitState,
} from "@veltdev/react";
import VeltInitializeDocument from "./VeltInitializeDocument";

interface VeltCollaborationProps {
  documentId: string;
  documentName?: string;
}

export function VeltCollaboration({ documentId, documentName }: VeltCollaborationProps) {
  const liveStateSyncElement = useLiveStateSyncUtils();
  const veltInitState = useVeltInitState();

  // Enable Single Editor Mode once the user and document are initialized
  useEffect(() => {
    if (!liveStateSyncElement || !veltInitState) return;
    liveStateSyncElement.enableSingleEditorMode({
      customMode: false,
      singleTabEditor: true,
    });
    liveStateSyncElement.enableDefaultSingleEditorUI();
    // Scope SEM to only the document content area — viewers can still click nav, toolbar, comments
    liveStateSyncElement.singleEditorModeContainerIds(['document-content']);
    // Auto-sync text content between users
    liveStateSyncElement.enableAutoSyncState();

    return () => {
      liveStateSyncElement.disableSingleEditorMode();
    };
  }, [liveStateSyncElement, veltInitState]);

  // Claim editor role once Velt is fully initialized
  useEffect(() => {
    if (!veltInitState || !liveStateSyncElement) return;

    const claimEditor = async () => {
      const result = await liveStateSyncElement.setUserAsEditor();
      if (result?.error) {
        switch (result.error.code) {
          case 'same_user_editor_current_tab':
            console.log('[SEM] Already editing on this tab');
            break;
          case 'same_user_editor_different_tab':
            console.log('[SEM] Already editing on another tab, switching here');
            liveStateSyncElement.editCurrentTab();
            break;
          case 'another_user_editor':
            console.log('[SEM] Another user is currently editing');
            break;
        }
      } else {
        console.log('[SEM] Successfully claimed editor role');
      }
    };

    claimEditor();
  }, [veltInitState, liveStateSyncElement]);

  return (
    <>
      <VeltInitializeDocument documentId={documentId} documentName={documentName} />
      <VeltComments shadowDom={false} />
      <VeltCursor />
      <VeltSingleEditorModePanel shadowDom={false} />

      {/* Toolbar */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50, display: "flex", alignItems: "center", gap: 8 }}>
        <VeltPresence flockMode={false} />
        <VeltNotificationsTool />
        <VeltCommentTool />
      </div>
    </>
  );
}
```

#### 2. Document Page — Editor Status Banner + Synced Content

The document content MUST be in a child component of VeltProvider so hooks can access context:

```tsx
"use client";

import { VeltProvider, useUserEditorState, useEditor } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";

function DocumentContent({ doc, docId, userName, orgId }: {
  doc: { title: string; content: string };
  docId: string;
  userName?: string;
  orgId?: string;
}) {
  const editorState = useUserEditorState();
  const editor = useEditor();
  const isEditor = editorState?.isEditor ?? false;
  const isEditorOnCurrentTab = editorState?.isEditorOnCurrentTab ?? false;

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px" }}>
      {/* Editor status banner */}
      <div style={{
        padding: "8px 16px",
        marginBottom: 16,
        borderRadius: 6,
        background: isEditor ? "#dcfce7" : "#fef3c7",
        color: isEditor ? "#166534" : "#92400e",
        fontSize: 13,
      }}>
        {isEditor
          ? isEditorOnCurrentTab
            ? "You are the editor"
            : "You are editing on another tab"
          : editor
            ? `${editor.name} is currently editing`
            : "Waiting for editor assignment..."}
      </div>

      {/* Document content — synced between users */}
      <article
        id="document-content"
        contentEditable
        suppressContentEditableWarning
        data-velt-sync-access="true"
        data-velt-sync-state="true"
        style={{ minHeight: 400, padding: 24, border: "1px solid #e5e7eb", borderRadius: 8, lineHeight: 1.8, fontSize: 15, outline: "none" }}
      >
        <p>{doc.content}</p>
      </article>
    </main>
  );
}

export default function DocumentPage() {
  // ... useParams, useAppUser, useVeltAuthProvider setup ...
  return (
    <VeltProvider apiKey={VELT_API_KEY} authProvider={authProvider}>
      <VeltCollaboration documentId={docId} documentName={doc.title} />
      <DocumentContent doc={doc} docId={docId} userName={user?.name} orgId={user?.organizationId} />
    </VeltProvider>
  );
}
```

**Critical attributes on the content element:**
- `id="document-content"` — unique ID required for sync and container scoping. MUST match the ID passed to `singleEditorModeContainerIds()` in VeltCollaboration
- `contentEditable` — ALWAYS set to `true`. NEVER make this conditional on `isEditor`. With `customMode: false`, the Velt SDK auto-manages read-only state for viewers via `data-velt-sync-access`. If you toggle `contentEditable` yourself, you fight the SDK and break sync.
- `suppressContentEditableWarning` — suppresses React warning for `contentEditable` with children
- `data-velt-sync-access="true"` — tells the SDK to control read-only state on this element. Viewers automatically get read-only; editor gets editable. This is how SEM enforces exclusive editing WITHOUT conditional `contentEditable`.
- `data-velt-sync-state="true"` — auto-syncs content between users via Velt backend

#### Common Mistakes — DO NOT

These are the most common mistakes when implementing or debugging SEM. Each one will break SEM:

1. **DO NOT add timeouts or delays to `setUserAsEditor()`** — Use `useVeltInitState()` as the ONLY gate. If `veltInitState` is truthy, Velt is ready. Timeouts (500ms, 1s, etc.) are unreliable and mask the real issue.

2. **DO NOT make `contentEditable` conditional on `isEditor`** — With `customMode: false`, the SDK auto-manages read-only state via `data-velt-sync-access="true"`. Writing `contentEditable={isEditor}` fights the SDK and prevents content sync from working. Always use `contentEditable` (which means `contentEditable={true}`).

3. **DO NOT use `useCurrentUser()` to gate `setUserAsEditor()`** — Use `useVeltInitState()` instead. `useCurrentUser()` tells you about user auth, but `useVeltInitState()` tells you when the ENTIRE Velt system (including document context) is ready.

4. **DO NOT inline `VeltInitializeDocument` into `VeltCollaboration`** — Keep it as a separate child component. Inlining and adding state tracking (`documentReady` flags) creates race conditions. The SDK handles initialization timing internally.

5. **DO NOT enable SEM or claim the editor role before Velt is initialized.** The docs require the user and document to be set first; `useVeltInitState()` returning `true` is that signal.

6. **DO NOT leave `'liveStateSync'` out of `featureAllowList`.** Single Editor Mode lives on the Live State Sync element. In the v6 modular SDK, if you pass `featureAllowList`, list `'liveStateSync'` so its chunk preloads (calling `getLiveStateSyncElement()` auto-enables an omitted feature, but listing it avoids an on-demand load).

**If SEM isn't working after implementation:** Re-read this rule file and diff your code against the code examples above line-by-line. The code examples are the canonical implementation — do not deviate from them.

**How it works:**
- First user loads the page → `setUserAsEditor()` claims editor role → green banner "You are the editor" → can edit content
- Second user loads → `setUserAsEditor()` returns `another_user_editor` → yellow banner "[Name] is currently editing" → content is read-only but synced live
- `enableAutoSyncState()` + `data-velt-sync-state="true"` = when editor types, viewers see changes in real-time
- `singleEditorModeContainerIds(['document-content'])` = only the article is locked for viewers; navigation, toolbar, and comments stay interactive

**Testing:**
- Open `?user=user-1` (Alice) → should claim editor, green banner
- Open `?user=user-2` (Bob) → should see "Alice Johnson is currently editing", yellow banner
- Alice types → Bob sees changes in real-time
- Bob cannot edit the content area but can click nav and comments

**Verification:**
- [ ] `useVeltInitState()` gates both `enableSingleEditorMode()` and `setUserAsEditor()`
- [ ] `featureAllowList`, if set, includes `'liveStateSync'`
- [ ] `setUserAsEditor()` called with all 3 error codes handled
- [ ] `enableAutoSyncState()` called for live content sync
- [ ] `singleEditorModeContainerIds()` scopes SEM to content area
- [ ] `data-velt-sync-access="true"` and `data-velt-sync-state="true"` on content element
- [ ] `DocumentContent` is a child of VeltProvider (not sibling)
- [ ] Editor status banner shows correct state using `useUserEditorState()` + `useEditor()`

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup (Steps 2 to 4, Notes); https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior; https://docs.velt.dev/get-started/advanced#getveltinitstate (user and document initialized); https://docs.velt.dev/api-reference/sdk/models/data-models#config (`featureAllowList`)

---

## 2. Editor State Management

**Impact: CRITICAL**

Patterns for setting the editor, reading editor status, and handling tab locking. Includes setUserAsEditor() with error handling, isUserEditor() and getEditor() Observables, useUserEditorState() and useEditor() hooks, and editCurrentTab() for multi-tab scenarios.

### 2.1 Use React Hooks for Editor State

**Impact: CRITICAL (Declarative editor state access with automatic cleanup in React)**

Use `useUserEditorState()` and `useEditor()` hooks for declarative editor state access in React components. These handle subscription lifecycle automatically.

**Incorrect (manual Observable subscription in React):**

```jsx
function EditorStatus() {
  const { client } = useVeltClient();
  const [isEditor, setIsEditor] = useState(false);

  // Manual subscription — requires cleanup, error-prone
  useEffect(() => {
    const sub = client.getLiveStateSyncElement().isUserEditor().subscribe((access) => {
      setIsEditor(access?.isEditor ?? false);
    });
    return () => sub?.unsubscribe();
  }, [client]);
}
```

**Correct (React hooks):**

```jsx
import {
  useUserEditorState,
  useEditor,
  useLiveStateSyncUtils
} from '@veltdev/react';

function EditorStatus() {
  const { isEditor, isEditorOnCurrentTab } = useUserEditorState();
  const editor = useEditor();
  const liveStateSyncElement = useLiveStateSyncUtils();

  // Tab locking: user is editor but on a different tab
  if (isEditor && !isEditorOnCurrentTab) {
    return (
      <div>
        <p>You are editing in another tab</p>
        <button onClick={() => liveStateSyncElement.editCurrentTab()}>
          Edit on this tab
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>Role: {isEditor ? 'Editor' : 'Viewer'}</p>
      {editor && <p>Current editor: {editor.name}</p>}
      {!isEditor && (
        <button onClick={() => liveStateSyncElement.setUserAsEditor()}>
          Start Editing
        </button>
      )}
    </div>
  );
}
```

**Available hooks:**

| Hook | Returns | Description |
|------|---------|-------------|
| `useUserEditorState()` | `{ isEditor, isEditorOnCurrentTab }` | Current user's editor status |
| `useEditor()` | `User` object or null | Current editor's identity (name, email, userId, photoUrl) |
| `useLiveStateSyncUtils()` | LiveStateSyncElement | API access for imperative methods |

**Key patterns:**
- `isEditor && !isEditorOnCurrentTab` — user is editor but on a different tab, show "Edit on this tab" button
- `!isEditor` — user is a viewer, show "Start Editing" or "Request Access" button
- `editor?.name` — display who is currently editing to all users

**Verification:**
- [ ] Using hooks instead of manual Observable subscriptions
- [ ] Tab locking UX implemented (isEditor && !isEditorOnCurrentTab)
- [ ] Viewer UX provides path to request or take editor access
- [ ] Hooks used within components inside VeltProvider

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Step 4, Step 6; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isUserEditor, getEditor

---

### 2.2 Set User as Editor with Error Handling

**Impact: CRITICAL (Required to assign editing rights and handle conflicts)**

`setUserAsEditor()` returns a Promise with an optional error object. Handle all 3 error codes to provide clear UX feedback when editor assignment fails.

**Incorrect (not handling errors):**

```jsx
const liveStateSyncElement = useLiveStateSyncUtils();

// Fire-and-forget — no error handling
const handleEdit = () => {
  liveStateSyncElement.setUserAsEditor();
};
```

**Correct (full error handling):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function EditButton() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  const handleStartEditing = async () => {
    const result = await liveStateSyncElement.setUserAsEditor();

    if (result?.error) {
      switch (result.error.code) {
        case 'same_user_editor_current_tab':
          // User is already the editor on this tab — no action needed
          console.log('You are already editing on this tab');
          break;
        case 'same_user_editor_different_tab':
          // User is editor on another tab — offer to switch
          console.log('You are editing in another tab');
          // Call editCurrentTab() to move editing here
          liveStateSyncElement.editCurrentTab();
          break;
        case 'another_user_editor':
          // Someone else is editing — must request access
          console.log('Another user is currently editing');
          break;
      }
    } else {
      console.log('You are now the editor');
    }
  };

  return <button onClick={handleStartEditing}>Start Editing</button>;
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

const result = await liveStateSyncElement.setUserAsEditor();
if (result?.error) {
  console.log('Error:', result.error.code, result.error.message);
}
```

**Error codes:**

| Code | Meaning | Suggested Action |
|------|---------|------------------|
| `same_user_editor_current_tab` | Already editing on this tab | No action needed |
| `same_user_editor_different_tab` | Editing on another tab | Call `editCurrentTab()` to switch |
| `another_user_editor` | Different user is editing | Offer `requestEditorAccess()` |

**Key details:**
- Always `await` the result — the Promise resolves to `{ error?: ErrorEvent }` or void
- The docs recommend calling it on an explicit user action (button click, start typing). If you auto-claim on load instead (see `core-setup`), gate it on `useVeltInitState()` and expect `another_user_editor` for everyone after the first user
- Use `editCurrentTab()` to move editing to the current tab when the user is editor on a different tab

**Verification:**
- [ ] `setUserAsEditor()` awaited
- [ ] All 3 error codes handled with appropriate UX
- [ ] `editCurrentTab()` called for `same_user_editor_different_tab` scenario
- [ ] Called on explicit user interaction, or gated on `useVeltInitState()` when auto-claiming

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior#setuseraseditor - setUserAsEditor, Error handling, editCurrentTab; https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Step 3: Set the editor

---

### 2.3 Subscribe to Editor State and Identity via API

**Impact: HIGH (Framework-agnostic editor state tracking with proper cleanup)**

Use `isUserEditor()` and `getEditor()` Observables for real-time editor state tracking in non-React contexts or when you need manual subscription control. Handle null and undefined return values correctly.

**Incorrect (not handling null/undefined states):**

```jsx
const liveStateSyncElement = client.getLiveStateSyncElement();

// Not handling null (loading) or undefined (no editors)
liveStateSyncElement.isUserEditor().subscribe((access) => {
  // TypeError when access is null or undefined
  const role = access.isEditor ? 'Editor' : 'Viewer';
});
```

**Correct (full state handling with cleanup):**

```jsx
import { useVeltClient } from '@veltdev/react';

function EditorStatus() {
  const { client } = useVeltClient();
  const [editorState, setEditorState] = useState(null);
  const [currentEditor, setCurrentEditor] = useState(null);

  useEffect(() => {
    const liveStateSyncElement = client.getLiveStateSyncElement();

    // Subscribe to editor access state
    const stateSub = liveStateSyncElement.isUserEditor().subscribe((access) => {
      if (access === null) return;       // State not available yet
      if (access === undefined) {        // No editors in Single Editor Mode
        setEditorState({ isEditor: false, isEditorOnCurrentTab: false });
        return;
      }
      setEditorState(access); // { isEditor, isEditorOnCurrentTab }
    });

    // Subscribe to current editor identity
    const editorSub = liveStateSyncElement.getEditor().subscribe((user) => {
      setCurrentEditor(user); // { name, email, userId, photoUrl }
    });

    return () => {
      stateSub?.unsubscribe();
      editorSub?.unsubscribe();
    };
  }, [client]);

  return (
    <div>
      <p>Role: {editorState?.isEditor ? 'Editor' : 'Viewer'}</p>
      {currentEditor && <p>Current editor: {currentEditor.name}</p>}
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

const sub = liveStateSyncElement.isUserEditor().subscribe((access) => {
  if (access === null) return;      // Loading
  if (access === undefined) return; // No editors
  updateUI(access.isEditor, access.isEditorOnCurrentTab);
});

const editorSub = liveStateSyncElement.getEditor().subscribe((user) => {
  if (user) showEditorBadge(user.name, user.photoUrl);
});

// Cleanup
sub.unsubscribe();
editorSub.unsubscribe();
```

**Return values for `isUserEditor()`:**

| Value | Meaning |
|-------|---------|
| `null` | State not available yet (loading) |
| `undefined` | No current editors in Single Editor Mode |
| `{ isEditor, isEditorOnCurrentTab }` | User's editor access state |

**Key details:**
- In React, prefer `useUserEditorState()` and `useEditor()` hooks (see `state-hooks` rule)
- Both Observables emit reactively on every change
- Must unsubscribe on cleanup to prevent memory leaks

**Verification:**
- [ ] Null and undefined return values handled separately
- [ ] Subscriptions cleaned up on unmount
- [ ] Editor identity displayed to all users (not just the editor)

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isUserEditor, getEditor

---

## 3. Access Request Flow

**Impact: HIGH**

Editor-side and viewer-side access handoff workflow. Editor receives requests via isEditorAccessRequested() and responds with acceptEditorAccessRequest() or rejectEditorAccessRequest(). Viewer initiates via requestEditorAccess() and cancels via cancelEditorAccessRequest().

### 3.1 Use useEditorAccessRequestHandler for React Access Flow

**Impact: HIGH (Declarative access request handling for the editor side in React)**

In React, use `useEditorAccessRequestHandler()` on the editor side instead of manually subscribing to `isEditorAccessRequested()`. Combine with `useLiveStateSyncUtils()` for accept/reject actions.

**Incorrect (manual subscription in React):**

```jsx
function EditorHandler() {
  const { client } = useVeltClient();

  useEffect(() => {
    const sub = client.getLiveStateSyncElement()
      .isEditorAccessRequested()
      .subscribe((data) => {
        // Manual cleanup needed, error-prone
      });
    return () => sub?.unsubscribe();
  }, [client]);
}
```

**Correct (hook-based editor-side handling):**

```jsx
import {
  useEditorAccessRequestHandler,
  useLiveStateSyncUtils,
  useUserEditorState
} from '@veltdev/react';

function EditorAccessPanel() {
  const editorAccessRequested = useEditorAccessRequestHandler();
  const liveStateSyncElement = useLiveStateSyncUtils();
  const { isEditor } = useUserEditorState();

  // Only show to the current editor when there is an active request
  if (!isEditor || !editorAccessRequested) return null;

  return (
    <div className="access-request-banner">
      <p>{editorAccessRequested.requestedBy.name} wants to edit</p>
      <button onClick={() => liveStateSyncElement.acceptEditorAccessRequest()}>
        Accept
      </button>
      <button onClick={() => liveStateSyncElement.rejectEditorAccessRequest()}>
        Reject
      </button>
    </div>
  );
}
```

**Key details:**
- `useEditorAccessRequestHandler()` returns `EditorRequest | null`
  - `null` — no active request, user is not editor, or request was canceled
  - `EditorRequest` — `{ requestStatus: 'requested', requestedBy: User }`
- Accept/reject methods are on the LiveStateSyncElement, not on the hook return value
- The viewer side still uses the API Observable pattern (`requestEditorAccess().subscribe()`) — no dedicated viewer hook exists
- After accepting, the requester becomes editor and the current editor becomes viewer

**Verification:**
- [ ] Using hook instead of manual Observable subscription
- [ ] Null check before rendering request UI
- [ ] Accept/reject wired to `liveStateSyncElement` methods
- [ ] Only displayed when user is editor (`isEditor === true`)

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Step 5; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isEditorAccessRequested

---

### 3.2 Handle Editor Access Requests via API

**Impact: HIGH (Enable editors to accept or reject access requests from viewers)**

When a viewer requests editor access, the current editor receives the request via `isEditorAccessRequested()`. The editor must respond with `acceptEditorAccessRequest()` or `rejectEditorAccessRequest()`.

**Incorrect (not subscribing to incoming requests):**

```jsx
// Editor has no way to see or respond to access requests
// Viewers are stuck waiting indefinitely
```

**Correct (editor-side request handling via API):**

```jsx
import { useVeltClient } from '@veltdev/react';

function EditorRequestHandler() {
  const { client } = useVeltClient();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const liveStateSyncElement = client.getLiveStateSyncElement();

    const sub = liveStateSyncElement.isEditorAccessRequested().subscribe((data) => {
      if (data === null) {
        // No active request, or user is not the editor, or request was canceled
        setRequest(null);
        return;
      }
      // Active request from a viewer
      setRequest(data); // { requestStatus: 'requested', requestedBy: User }
    });

    return () => sub?.unsubscribe();
  }, [client]);

  const handleAccept = () => {
    const liveStateSyncElement = client.getLiveStateSyncElement();
    liveStateSyncElement.acceptEditorAccessRequest();
  };

  const handleReject = () => {
    const liveStateSyncElement = client.getLiveStateSyncElement();
    liveStateSyncElement.rejectEditorAccessRequest();
  };

  if (!request) return null;

  return (
    <div>
      <p>{request.requestedBy.name} wants to edit</p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleReject}>Reject</button>
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.isEditorAccessRequested().subscribe((data) => {
  if (data === null) return;
  showRequestBanner(data.requestedBy.name);
});

// On user action:
liveStateSyncElement.acceptEditorAccessRequest();
// or
liveStateSyncElement.rejectEditorAccessRequest();
```

**Key details:**
- `isEditorAccessRequested()` returns `null` when: user is not the editor, no active request, or request was canceled
- The `EditorRequest` object contains `requestStatus` ('requested') and `requestedBy` (User with name, email, userId, photoUrl)
- After accepting, the requester becomes the new editor and the current editor becomes a viewer
- In React, prefer `useEditorAccessRequestHandler()` hook (see `access-hooks` rule)

**Verification:**
- [ ] Subscribed to incoming access requests
- [ ] Null state handled (no request or not editor)
- [ ] Accept and reject buttons wired to correct methods
- [ ] Subscription cleaned up on unmount

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isEditorAccessRequested, acceptEditorAccessRequest, rejectEditorAccessRequest

---

### 3.3 Request and Cancel Editor Access as Viewer

**Impact: HIGH (Enable viewers to request editing access from the current editor)**

Viewers use `requestEditorAccess()` to request editing rights. The method returns an Observable that emits the request status: `null` (pending), `true` (accepted), or `false` (rejected).

**Incorrect (not subscribing to the Observable result):**

```jsx
const liveStateSyncElement = useLiveStateSyncUtils();

// Fire-and-forget — no way to know if request was accepted or rejected
liveStateSyncElement.requestEditorAccess();
```

**Correct (subscribing to request status):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function ViewerAccessRequest() {
  const liveStateSyncElement = useLiveStateSyncUtils();
  const [requestStatus, setRequestStatus] = useState(null);
  const subscriptionRef = useRef(null);

  const handleRequest = () => {
    subscriptionRef.current = liveStateSyncElement
      .requestEditorAccess()
      .subscribe((status) => {
        if (status === null) {
          setRequestStatus('pending');
        } else if (status === true) {
          setRequestStatus('accepted');
          // User is now the editor
        } else {
          setRequestStatus('rejected');
        }
      });
  };

  const handleCancel = () => {
    liveStateSyncElement.cancelEditorAccessRequest();
    subscriptionRef.current?.unsubscribe();
    setRequestStatus(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => subscriptionRef.current?.unsubscribe();
  }, []);

  return (
    <div>
      {requestStatus === null && (
        <button onClick={handleRequest}>Request Edit Access</button>
      )}
      {requestStatus === 'pending' && (
        <div>
          <p>Waiting for editor to respond...</p>
          <button onClick={handleCancel}>Cancel Request</button>
        </div>
      )}
      {requestStatus === 'accepted' && <p>You are now the editor</p>}
      {requestStatus === 'rejected' && (
        <div>
          <p>Request was rejected</p>
          <button onClick={() => setRequestStatus(null)}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

const subscription = liveStateSyncElement.requestEditorAccess().subscribe((status) => {
  if (status === null) showPendingUI();
  else if (status === true) showEditorUI();
  else showRejectedUI();
});

// Cancel the request
liveStateSyncElement.cancelEditorAccessRequest();
subscription.unsubscribe();
```

**Observable return values:**

| Value | Meaning |
|-------|---------|
| `null` | Request is pending — waiting for editor response |
| `true` | Request accepted — user is now the editor |
| `false` | Request rejected by the editor |

**Key details:**
- `requestEditorAccess()` returns an Observable — must call `.subscribe()`
- Store the subscription reference for cleanup and cancellation
- `cancelEditorAccessRequest()` cancels the pending request (editor sees request disappear)
- No dedicated React hook exists for viewer-side requests — use the API Observable pattern even in React

**Verification:**
- [ ] Observable subscribed to (not fire-and-forget)
- [ ] All 3 states handled (null/pending, true/accepted, false/rejected)
- [ ] Cancel button available while request is pending
- [ ] Subscription cleaned up on unmount

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - requestEditorAccess, cancelEditorAccessRequest

---

## 4. Element Control

**Impact: HIGH**

Fine-grained control over which DOM elements are governed by Single Editor Mode. Includes singleEditorModeContainerIds() for container scoping, data-velt-sync-access attributes for native HTML elements, and enableAutoSyncState() for text element syncing.

### 4.1 Apply Sync Access Attributes to Native HTML Elements Only

**Impact: HIGH (Prevent broken element control when using customMode)**

Fine-tune which elements Single Editor Mode controls with `data-velt-sync-access` and `data-velt-sync-access-disabled`. The attributes work in both modes, and are **required** with `customMode: true` because the SDK then no longer makes elements read-only on its own. They only work on **native HTML elements**, not React components.

**Incorrect (attributes on React components):**

```jsx
// data-velt-sync-access does NOT work on React components
<MyButton data-velt-sync-access="true">Edit</MyButton>
<CustomInput data-velt-sync-access="true" />
```

**Correct (attributes on native HTML elements):**

```jsx
// Enable sync access on native elements
<div data-velt-sync-access="true">
  <input type="text" placeholder="Controlled by SEM" />
  <button>Save</button>
</div>

// Exclude specific elements from SEM control
<div data-velt-sync-access="true">
  <input type="text" placeholder="Controlled" />
  <button data-velt-sync-access-disabled="true">
    Always clickable (e.g., help button)
  </button>
</div>
```

**Wrapping React components for SEM control:**

```jsx
// Wrap React components in native elements to apply the attribute
<div data-velt-sync-access="true">
  <MyButton>Edit</MyButton>  {/* Now controlled via parent div */}
</div>

// Or exclude a React component from control
<div data-velt-sync-access="true">
  <div data-velt-sync-access-disabled="true">
    <HelpWidget />  {/* Always interactive */}
  </div>
</div>
```

**Custom mode:**

```jsx
// With customMode: true the SDK won't auto-manage read-only state,
// so every element you want locked for viewers needs data-velt-sync-access="true"
liveStateSyncElement.enableSingleEditorMode({
  customMode: true,
});
```

**Attributes:**

| Attribute | Purpose |
|-----------|---------|
| `data-velt-sync-access="true"` | Element is controlled by SEM (disabled for viewers) |
| `data-velt-sync-access-disabled="true"` | Element is excluded from SEM (always interactive) |

**Key details:**
- Both attributes only work on **native HTML elements** (div, button, input, etc.)
- With `customMode: false` (default) the SDK manages read-only state and the attributes refine it; with `customMode: true` you must mark controlled elements yourself
- Give elements with sync attributes an `id` for more robust syncing
- Use `data-velt-sync-access-disabled` to exclude elements like help buttons, navigation, or always-on controls
- Wrap React components in native elements if you need SEM control over them

**Verification:**
- [ ] Attributes applied only to native HTML elements, not React components
- [ ] With `customMode: true`, every element that viewers must not edit has `data-velt-sync-access="true"`
- [ ] Elements that should always be interactive have `data-velt-sync-access-disabled`
- [ ] React components wrapped in native elements when SEM control needed

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Fine tune elements control; https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Notes

---

### 4.2 Scope Single Editor Mode to Specific Containers and Enable Auto-Sync

**Impact: HIGH (Control which areas of the page are governed by Single Editor Mode)**

By default, Single Editor Mode applies to the entire DOM. Use `singleEditorModeContainerIds()` to restrict it to specific containers. Use `enableAutoSyncState()` with `data-velt-sync-state` to auto-sync text element contents.

**Incorrect (applying SEM to entire DOM when only editor area needs it):**

```jsx
const liveStateSyncElement = useLiveStateSyncUtils();

useEffect(() => {
  // Entire DOM is read-only for viewers — navigation, toolbars, etc. all disabled
  liveStateSyncElement.enableSingleEditorMode();
}, [liveStateSyncElement]);
```

**Correct (scoped to specific containers):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function App() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  useEffect(() => {
    liveStateSyncElement.enableSingleEditorMode();

    // Only apply SEM to these container IDs
    liveStateSyncElement.singleEditorModeContainerIds(['editor', 'rightPanel']);
  }, [liveStateSyncElement]);

  return (
    <div>
      <nav>Always interactive for all users</nav>
      <div id="editor">Only editable by the editor</div>
      <div id="rightPanel">Only editable by the editor</div>
      <footer>Always interactive for all users</footer>
    </div>
  );
}
```

**Auto-sync text elements:**

```jsx
function App() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  useEffect(() => {
    liveStateSyncElement.enableSingleEditorMode();
    // Enable auto-sync for text elements
    liveStateSyncElement.enableAutoSyncState();
  }, [liveStateSyncElement]);

  return (
    <div>
      {/* Each synced element needs a unique id */}
      <input id="titleInput" data-velt-sync-state="true" />
      <textarea id="descriptionArea" data-velt-sync-state="true" />
      <div id="richEditor" contentEditable data-velt-sync-state="true" />
    </div>
  );
}
```

**Supported auto-sync elements:**
- `<input>` — text inputs
- `<textarea>` — multi-line text areas
- ContentEditable `<div>` — rich text areas

**Key details:**
- `singleEditorModeContainerIds()` accepts an array of HTML element IDs
- Elements outside the specified containers remain interactive for all users
- `enableAutoSyncState()` must be called before using `data-velt-sync-state` attribute
- Each synced element must have a **unique `id`** attribute for proper sync tracking
- Container scoping and auto-sync can be used together

**Verification:**
- [ ] Container IDs match actual DOM element IDs
- [ ] Navigation and shared controls are outside scoped containers
- [ ] Auto-sync elements have unique `id` attributes
- [ ] `enableAutoSyncState()` called before using `data-velt-sync-state`

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - singleEditorModeContainerIds, Auto-Sync Text Elements

---

## 5. Timeout Configuration

**Impact: MEDIUM**

Automatic editor access timeout and transfer behavior. Includes setEditorAccessTimeout(), enableEditorAccessTransferOnTimeOut(), getEditorAccessTimer() Observable, and the useEditorAccessTimer() hook.

### 5.1 Use useEditorAccessTimer for React Timeout UI

**Impact: MEDIUM (Declarative countdown UI for editor access timeout in React)**

Use `useEditorAccessTimer()` in React instead of manually subscribing to `getEditorAccessTimer()`. The hook returns the timer state reactively for building countdown UIs.

**Incorrect (manual subscription in React):**

```jsx
function Countdown() {
  const { client } = useVeltClient();

  useEffect(() => {
    const sub = client.getLiveStateSyncElement()
      .getEditorAccessTimer()
      .subscribe((timer) => { /* ... */ });
    return () => sub?.unsubscribe();
  }, [client]);
}
```

**Correct (hook-based countdown):**

```jsx
import { useEditorAccessTimer } from '@veltdev/react';

function AccessTimeoutCountdown() {
  const editorAccessTimer = useEditorAccessTimer();

  useEffect(() => {
    if (editorAccessTimer?.state === 'completed') {
      // Handle timeout completion (access may have been transferred)
      console.log('Timeout reached');
    }
  }, [editorAccessTimer]);

  if (!editorAccessTimer || editorAccessTimer.state === 'idle') return null;

  return (
    <div>
      {editorAccessTimer.state === 'inProgress' && (
        <div className="countdown">
          <p>Respond to access request</p>
          <span>{editorAccessTimer.durationLeft}s remaining</span>
        </div>
      )}
      {editorAccessTimer.state === 'completed' && (
        <p>Time expired</p>
      )}
    </div>
  );
}
```

**Key details:**
- Returns `EditorAccessTimer` with `state` ('idle' | 'inProgress' | 'completed') and `durationLeft` (seconds)
- Updates reactively as the countdown progresses
- Use `useEffect` watching the timer to handle the `completed` state
- Combine with `useEditorAccessRequestHandler()` for a complete editor-side timeout + request UI

**Verification:**
- [ ] Using hook instead of manual Observable subscription
- [ ] All 3 timer states handled (idle, inProgress, completed)
- [ ] Countdown displayed during inProgress state
- [ ] Completion handled in useEffect

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - getEditorAccessTimer

---

### 5.2 Configure Editor Access Timeout and Transfer Behavior

**Impact: MEDIUM (Automatic timeout and editor transfer for unresponsive editors)**

When a viewer requests editor access, the editor has a configurable time window to respond. If the timeout expires, access can auto-transfer to the requester.

**Incorrect (using default 5-second timeout for complex workflows):**

```jsx
// Default timeout is 5 seconds — too short for many real-world scenarios
// Editor may not see the request in time before auto-transfer happens
```

**Correct (custom timeout with timer tracking):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function TimeoutConfig() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  useEffect(() => {
    // Set a longer timeout for complex editing workflows
    liveStateSyncElement.setEditorAccessTimeout(15); // 15 seconds

    // Enable auto-transfer on timeout (enabled by default)
    liveStateSyncElement.enableEditorAccessTransferOnTimeOut();
  }, [liveStateSyncElement]);
}
```

**Tracking timer state via API:**

```jsx
import { useVeltClient } from '@veltdev/react';

function TimeoutCountdown() {
  const { client } = useVeltClient();
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const liveStateSyncElement = client.getLiveStateSyncElement();

    const sub = liveStateSyncElement.getEditorAccessTimer().subscribe((timerData) => {
      setTimer(timerData); // { state, durationLeft }
    });

    return () => sub?.unsubscribe();
  }, [client]);

  if (!timer || timer.state === 'idle') return null;

  return (
    <div>
      {timer.state === 'inProgress' && (
        <p>Time remaining: {timer.durationLeft}s</p>
      )}
      {timer.state === 'completed' && (
        <p>Timeout reached — access transferred</p>
      )}
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.setEditorAccessTimeout(15);
liveStateSyncElement.enableEditorAccessTransferOnTimeOut();

liveStateSyncElement.getEditorAccessTimer().subscribe((timer) => {
  // timer.state: 'idle' | 'inProgress' | 'completed'
  // timer.durationLeft: seconds remaining
});
```

**EditorAccessTimer states:**

| State | Meaning |
|-------|---------|
| `'idle'` | No active timeout (no pending request) |
| `'inProgress'` | Countdown active, show remaining time |
| `'completed'` | Timeout reached, access may have been transferred |

**Key details:**
- Default timeout is **5 seconds**; the value is in **seconds** per the Customize Behavior page (`setEditorAccessTimeout(15)` = 15 s). The API Methods reference says milliseconds; verify in your SDK version and keep the unit consistent with your countdown UI (`durationLeft` is in seconds)
- `enableEditorAccessTransferOnTimeOut()` is enabled by default — when timeout expires, editor access auto-transfers to the requester
- Call `disableEditorAccessTransferOnTimeOut()` if you want the request to simply expire without transfer
- In React, prefer `useEditorAccessTimer()` hook (see `timeout-hooks` rule)

**Verification:**
- [ ] Timeout duration appropriate for the workflow (not too short)
- [ ] Auto-transfer behavior matches desired UX
- [ ] Timer state tracked for countdown UI
- [ ] Subscription cleaned up on unmount

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - setEditorAccessTimeout, enableEditorAccessTransferOnTimeOut, getEditorAccessTimer

---

## 6. Event Handling

**Impact: MEDIUM**

Subscription patterns for 7 Single Editor Mode event types covering access requests, role assignments, and multi-tab detection via liveStateSyncElement.on() API and useLiveStateSyncEventCallback() hook.

### 6.1 Use useLiveStateSyncEventCallback for React Event Subscriptions

**Impact: MEDIUM (Declarative event handling with automatic cleanup in React)**

In React, use `useLiveStateSyncEventCallback()` for declarative event subscriptions instead of manually calling `.on().subscribe()`.

**Incorrect (manual subscription in React):**

```jsx
function EventHandler() {
  const { client } = useVeltClient();

  useEffect(() => {
    const sub = client.getLiveStateSyncElement()
      .on('editorAssigned')
      .subscribe((event) => { /* ... */ });
    return () => sub?.unsubscribe();
  }, [client]);
}
```

**Correct (hook-based event subscriptions):**

```jsx
import { useLiveStateSyncEventCallback } from '@veltdev/react';

function SingleEditorEvents() {
  // One hook call per event type
  const accessRequested = useLiveStateSyncEventCallback('accessRequested');
  const accessAccepted = useLiveStateSyncEventCallback('accessAccepted');
  const editorAssigned = useLiveStateSyncEventCallback('editorAssigned');
  const differentTab = useLiveStateSyncEventCallback('editorOnDifferentTabDetected');

  useEffect(() => {
    if (accessRequested) {
      console.log('Someone requested access:', accessRequested);
    }
  }, [accessRequested]);

  useEffect(() => {
    if (accessAccepted) {
      console.log('Access request accepted:', accessAccepted);
    }
  }, [accessAccepted]);

  useEffect(() => {
    if (editorAssigned) {
      console.log('Editor assigned:', editorAssigned);
    }
  }, [editorAssigned]);

  useEffect(() => {
    if (differentTab) {
      console.log('Editor on different tab:', differentTab);
    }
  }, [differentTab]);

  return null; // Event handler component
}
```

**Supported event types:**
`accessRequested`, `accessRequestCanceled`, `accessAccepted`, `accessRejected`, `editorAssigned`, `viewerAssigned`, `editorOnDifferentTabDetected`

**Key details:**
- Each event type needs a separate hook call
- Hook returns event data or null (no event yet)
- React to changes via `useEffect` with the return value as a dependency
- Handles subscription lifecycle and cleanup automatically

**Verification:**
- [ ] Using hook instead of manual `.on().subscribe()` in React
- [ ] Each event type has its own hook call and useEffect handler
- [ ] Hook used within component inside VeltProvider

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Event Subscription (Using Hooks)

---

### 6.2 Subscribe to Single Editor Mode Events via API

**Impact: MEDIUM (React to access requests, role assignments, and tab changes)**

Single Editor Mode emits 7 event types covering access requests, role assignments, and multi-tab detection. Use `liveStateSyncElement.on('eventType').subscribe()` for framework-agnostic event handling.

**Incorrect (only subscribing to assignment events):**

```jsx
// Missing access request and tab events — incomplete UX
liveStateSyncElement.on('editorAssigned').subscribe((event) => {
  showNotification('New editor assigned');
});
```

**Correct (comprehensive event handling):**

```jsx
const liveStateSyncElement = client.getLiveStateSyncElement();

// Editor-side events
liveStateSyncElement.on('accessRequested').subscribe((event) => {
  console.log('Access requested by:', event);
});

liveStateSyncElement.on('accessRequestCanceled').subscribe((event) => {
  console.log('Access request canceled:', event);
});

// Viewer-side events
liveStateSyncElement.on('accessAccepted').subscribe((event) => {
  console.log('Your request was accepted:', event);
});

liveStateSyncElement.on('accessRejected').subscribe((event) => {
  console.log('Your request was rejected:', event);
});

// Role assignment events
liveStateSyncElement.on('editorAssigned').subscribe((event) => {
  console.log('Editor assigned:', event);
});

liveStateSyncElement.on('viewerAssigned').subscribe((event) => {
  console.log('Viewer assigned:', event);
});

// Multi-tab event
liveStateSyncElement.on('editorOnDifferentTabDetected').subscribe((event) => {
  console.log('Editor opened document in another tab:', event);
});
```

**Complete event reference:**

| Category | Event | Description | Event Object |
|----------|-------|-------------|--------------|
| Editor | `accessRequested` | Viewer requests access | AccessRequestEvent |
| Editor | `accessRequestCanceled` | Viewer cancels their request | AccessRequestEvent |
| Viewer | `accessAccepted` | Editor accepted the request | AccessRequestEvent |
| Viewer | `accessRejected` | Editor rejected the request | AccessRequestEvent |
| Assignment | `editorAssigned` | User becomes the editor | SEMEvent |
| Assignment | `viewerAssigned` | User becomes a viewer | SEMEvent |
| Tab | `editorOnDifferentTabDetected` | Editor opened same document in another tab | SEMEvent |

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.on('editorAssigned').subscribe((event) => {
  updateRoleUI('editor');
});
```

**Key details:**
- In React, prefer `useLiveStateSyncEventCallback()` hook (see `events-hooks` rule)
- Each `.on()` call returns an Observable — must call `.subscribe()`
- Store subscription references for cleanup (`.unsubscribe()`)
- `editorOnDifferentTabDetected` fires when the editor opens the same document in a second browser tab

**Verification:**
- [ ] Relevant events subscribed to for UX needs
- [ ] Subscriptions cleaned up on unmount
- [ ] Multi-tab event handled when `singleTabEditor: true`

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Event Subscription

---

## 7. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns for Single Editor Mode integrations. Covers heartbeat configuration, updateUserPresence() fallback, resetUserAccess(), element attribute issues, and multi-user testing.

### 7.1 Debug Common Single Editor Mode Issues

**Impact: LOW-MEDIUM (Quick troubleshooting for frequent Single Editor Mode problems)**

Common issues when integrating Velt Single Editor Mode and how to resolve them.

**Issue 0: Nothing happens at all (v6 modular SDK)**

```jsx
// If featureAllowList is set, list liveStateSync so its chunk preloads
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["liveStateSync", "presence"] }} />
```

**Issue 1: Default UI panel not visible**

```jsx
// Ensure BOTH are done:
// 1. Call enableDefaultSingleEditorUI()
liveStateSyncElement.enableDefaultSingleEditorUI();

// 2. Render the panel component
<VeltSingleEditorModePanel shadowDom={false} />

// If building custom UI, call disableDefaultSingleEditorUI() instead
```

**Issue 2: Elements not becoming read-only for viewers**

```jsx
// If using customMode: true, SDK does NOT auto-manage read-only state
// You must use data attributes on NATIVE HTML elements:

// Wrong — attributes on React components do nothing:
<MyButton data-velt-sync-access="true">Edit</MyButton>

// Correct — attributes on native elements:
<button data-velt-sync-access="true">Edit</button>

// Or wrap React components:
<div data-velt-sync-access="true">
  <MyButton>Edit</MyButton>
</div>

// If customMode: false (default), SDK auto-manages read-only state
```

**Issue 3: Editor can edit in multiple tabs**

```jsx
// Verify singleTabEditor is true (default):
liveStateSyncElement.enableSingleEditorMode({
  singleTabEditor: true,
});

// When user is editor on another tab, prompt to switch:
const { isEditor, isEditorOnCurrentTab } = useUserEditorState();
if (isEditor && !isEditorOnCurrentTab) {
  // Show "Edit on this tab" button
  liveStateSyncElement.editCurrentTab();
}
```

**Issue 4: Heartbeat must be disabled BEFORE enabling SEM**

```jsx
// Incorrect order — disabling after enable has no effect:
liveStateSyncElement.enableSingleEditorMode();
liveStateSyncElement.disableHeartbeat(); // Too late

// Correct order:
liveStateSyncElement.disableHeartbeat();
liveStateSyncElement.enableSingleEditorMode();
```

**Issue 5: Ambiguous editor presence detection**

```jsx
// Use updateUserPresence() as a fallback for presence detection
liveStateSyncElement.updateUserPresence({
  sameUserPresentOnTab: false,
  differentUserPresentOnTab: true,
  userIds: ['user-2']
});
```

**Issue 6: Stuck editor state**

```jsx
// Reset editor access for all users
liveStateSyncElement.resetUserAccess();
// This clears the current editor and allows any user to take over
```

**Issue 7: Both users show as "viewer" (no one becomes editor)**

The most common cause is `setUserAsEditor()` firing before Velt is fully initialized.

```jsx
// WRONG — using useCurrentUser() or timeouts to gate setUserAsEditor:
const veltUser = useCurrentUser();
useEffect(() => {
  if (!veltUser) return;
  setTimeout(() => {
    liveStateSyncElement.setUserAsEditor(); // Unreliable — Velt may not be ready
  }, 500);
}, [veltUser]);

// CORRECT — use useVeltInitState() as the ONLY gate:
const veltInitState = useVeltInitState();
useEffect(() => {
  if (!veltInitState || !liveStateSyncElement) return;
  const claimEditor = async () => {
    const result = await liveStateSyncElement.setUserAsEditor();
    if (result?.error) {
      // Handle all 3 error codes — see core-setup rule
    }
  };
  claimEditor();
}, [veltInitState, liveStateSyncElement]);
```

**Issue 8: Both users can edit despite one being a viewer**

The content element has `contentEditable` but the SDK isn't controlling read-only state.

```jsx
// WRONG — making contentEditable conditional on isEditor:
<article contentEditable={isEditor}>  // Fights the SDK, breaks sync

// CORRECT — contentEditable is ALWAYS true, SDK manages read-only:
<article
  id="document-content"
  contentEditable                    // Always true
  data-velt-sync-access="true"      // SDK controls read-only for viewers
  data-velt-sync-state="true"       // SDK syncs content between users
>

// Also verify these are called in VeltCollaboration:
// - enableSingleEditorMode({ customMode: false }) — customMode MUST be false
// - singleEditorModeContainerIds(['document-content']) — ID must match
// - enableAutoSyncState()
```

**Testing checklist:**
1. Open the same document as 2 different users in separate browser profiles
2. Verify only one user can edit at a time
3. Test access request flow (request → accept/reject)
4. Test timeout behavior (default 5 seconds)
5. Test multi-tab behavior with `singleTabEditor: true`
6. Verify scoped containers work (elements outside scope remain interactive)

**Verification:**
- [ ] VeltProvider configured with API key and user authenticated
- [ ] Document ID set via Velt setup
- [ ] `enableSingleEditorMode()` called with explicit config
- [ ] Default UI enabled or custom UI implemented
- [ ] `data-velt-sync-access` attributes on native HTML elements only
- [ ] Heartbeat disabled before SEM if disabling is needed
- [ ] Tested with multiple users in separate browser profiles

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Testing and Debugging, Notes; https://docs.velt.dev/api-reference/sdk/models/data-models#config - featureAllowList; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Heartbeat, Presence Heartbeat, resetUserAccess

---

## 8. UI Customization

**Impact: MEDIUM**

Customizing the default Single Editor Mode panel with VeltSingleEditorModePanelWireframe (ViewerText, EditorText, Countdown, EditHere, AcceptRequest, RejectRequest, RequestAccess, CancelRequest) inside VeltWireframe, plus the panel's shadowDom, darkMode, and variant props.

### 8.1 Customize the Single Editor Mode Panel with Wireframes

**Impact: MEDIUM (Restyle or rearrange the default editor/viewer panel without rebuilding the access-request flow)**

The default panel (`VeltSingleEditorModePanel` / `<velt-single-editor-mode-panel>`) shows the user's editor or viewer status, access requests, the request countdown, and accept/reject controls. To change its look or layout, define a `VeltSingleEditorModePanelWireframe` inside `VeltWireframe` instead of rebuilding the flow with the APIs.

**Why this matters:**

A custom panel built from scratch must re-implement request, cancel, accept, reject, countdown, and "edit here" states. The wireframe keeps that logic and lets you change only the markup and styling.

**Incorrect (wireframe outside the wrapper, styling the shadow DOM from outside):**

```jsx
<VeltSingleEditorModePanelWireframe>
  <VeltSingleEditorModePanelWireframe.RequestAccess />
</VeltSingleEditorModePanelWireframe>
<VeltSingleEditorModePanel /> {/* shadowDom defaults to true; your CSS cannot reach inside */}
```

**Correct (React / Next.js):**

```jsx
"use client";
import {
  VeltWireframe,
  VeltSingleEditorModePanel,
  VeltSingleEditorModePanelWireframe,
} from "@veltdev/react";

function SingleEditorPanel() {
  return (
    <>
      <VeltWireframe>
        <VeltSingleEditorModePanelWireframe>
          <VeltSingleEditorModePanelWireframe.ViewerText />
          <VeltSingleEditorModePanelWireframe.EditorText />
          <VeltSingleEditorModePanelWireframe.Countdown />
          {/* Editor sees this when editing in a different tab */}
          <VeltSingleEditorModePanelWireframe.EditHere />
          {/* Editor sees these when a viewer requests access */}
          <VeltSingleEditorModePanelWireframe.AcceptRequest />
          <VeltSingleEditorModePanelWireframe.RejectRequest />
          {/* Viewer sees this by default */}
          <VeltSingleEditorModePanelWireframe.RequestAccess />
          {/* Viewer sees this after requesting access */}
          <VeltSingleEditorModePanelWireframe.CancelRequest />
        </VeltSingleEditorModePanelWireframe>
      </VeltWireframe>

      <VeltSingleEditorModePanel shadowDom={false} darkMode={false} />
    </>
  );
}
```

**Correct (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <velt-single-editor-mode-panel-wireframe>
    <velt-single-editor-mode-panel-viewer-text-wireframe></velt-single-editor-mode-panel-viewer-text-wireframe>
    <velt-single-editor-mode-panel-editor-text-wireframe></velt-single-editor-mode-panel-editor-text-wireframe>
    <velt-single-editor-mode-panel-countdown-wireframe></velt-single-editor-mode-panel-countdown-wireframe>
    <velt-single-editor-mode-panel-edit-here-wireframe></velt-single-editor-mode-panel-edit-here-wireframe>
    <velt-single-editor-mode-panel-accept-request-wireframe></velt-single-editor-mode-panel-accept-request-wireframe>
    <velt-single-editor-mode-panel-reject-request-wireframe></velt-single-editor-mode-panel-reject-request-wireframe>
    <velt-single-editor-mode-panel-request-access-wireframe></velt-single-editor-mode-panel-request-access-wireframe>
    <velt-single-editor-mode-panel-cancel-request-wireframe></velt-single-editor-mode-panel-cancel-request-wireframe>
  </velt-single-editor-mode-panel-wireframe>
</velt-wireframe>

<velt-single-editor-mode-panel shadow-dom="false"></velt-single-editor-mode-panel>
```

**Panel props:**

| React prop | HTML attribute | Default | Use |
|---|---|---|---|
| `shadowDom` | `shadow-dom` | `true` | Set `false` to style the panel with your own CSS |
| `darkMode` | `dark-mode` | `false` | Dark theme |
| `variant` | `variant` | none | Use a named wireframe variant (`variant="custom-ui"`) |

**Key details:**

- Show the panel with `enableDefaultSingleEditorUI()` (enabled by default) and/or by rendering the panel component
- Only build fully custom UI (with `disableDefaultSingleEditorUI()` plus the editor/viewer APIs) when the wireframe cannot express your design
- Omit a sub-component from the wireframe to hide that part of the panel

**Verification:**
- [ ] Wireframe is inside `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] `VeltSingleEditorModePanel` is rendered (or the default UI is enabled)
- [ ] `shadowDom={false}` is set when applying custom CSS
- [ ] Viewer request, editor accept/reject, countdown, and "edit here" states were tested with two users and two tabs

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/single-editor-mode - "VeltSingleEditorModePanelWireframe", "Styling", "Variants"
- https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior#enabledefaultsingleeditorui - "enableDefaultSingleEditorUI"
- https://docs.velt.dev/ui-customization/wireframes/layout-customization#create-custom-variants - "Create Custom Variants"

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/realtime-collaboration/single-editor-mode/overview
- https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup
- https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior
- https://console.velt.dev
- https://docs.velt.dev/ui-customization/features/realtime/single-editor-mode
