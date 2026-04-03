# Velt Single Editor Mode Best Practices

**Version 1.0.0**  
Velt  
March 2026

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

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup for enabling Single Editor Mode. Includes initializing via useLiveStateSyncUtils() or Velt.getLiveStateSyncElement(), enabling the mode with config options (customMode, singleTabEditor), embedding the VeltSingleEditorModePanel, and enabling the default UI.

### 1.1 Enable Single Editor Mode with Auto-Sync and Editor Status UI

**Impact: CRITICAL (Required for Single Editor Mode to function with live content sync)**

Single Editor Mode restricts editing to one user at a time. Other users see content in read-only mode with live sync. The first user to load the page claims the editor role automatically.

**Setup requires changes in two places:**

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

  // Enable Single Editor Mode with auto-sync and container scoping
  useEffect(() => {
    if (!liveStateSyncElement) return;
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
  }, [liveStateSyncElement]);

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

The document content MUST be in a child component of VeltProvider so hooks can access context:

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Step 4, Step 6; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isUserEditor, getEditor

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - setUserAsEditor, editCurrentTab

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isUserEditor, getEditor

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Step 5; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isEditorAccessRequested

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - isEditorAccessRequested, acceptEditorAccessRequest, rejectEditorAccessRequest

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - requestEditorAccess, cancelEditorAccessRequest

---

## 4. Element Control

**Impact: HIGH**

Fine-grained control over which DOM elements are governed by Single Editor Mode. Includes singleEditorModeContainerIds() for container scoping, data-velt-sync-access attributes for native HTML elements, and enableAutoSyncState() for text element syncing.

### 4.1 Apply Sync Access Attributes to Native HTML Elements Only

**Impact: HIGH (Prevent broken element control when using customMode)**

When using `customMode: true`, fine-tune which elements are controlled by Single Editor Mode using `data-velt-sync-access` and `data-velt-sync-access-disabled` attributes. These attributes only work on **native HTML elements**, not React components.

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

**Setup requirement:**

```jsx
// customMode must be true for manual element control
liveStateSyncElement.enableSingleEditorMode({
  customMode: true,  // SDK won't auto-manage read-only state
});
```

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Fine tune elements control; https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Notes

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - singleEditorModeContainerIds, Auto-Sync Text Elements

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - getEditorAccessTimer

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - setEditorAccessTimeout, enableEditorAccessTransferOnTimeOut, getEditorAccessTimer

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

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Event Subscription (Using Hooks)

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

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.on('editorAssigned').subscribe((event) => {
  updateRoleUI('editor');
});
```

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Event Subscription

---

## 7. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns for Single Editor Mode integrations. Covers heartbeat configuration, updateUserPresence() fallback, resetUserAccess(), element attribute issues, and multi-user testing.

### 7.1 Debug Common Single Editor Mode Issues

**Impact: LOW-MEDIUM (Quick troubleshooting for frequent Single Editor Mode problems)**

Common issues when integrating Velt Single Editor Mode and how to resolve them.

**Issue 1: Default UI panel not visible**

Reference: https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Testing and Debugging, Notes; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Heartbeat, Presence Heartbeat, resetUserAccess

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/realtime-collaboration/single-editor-mode/overview
- https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup
- https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior
- https://console.velt.dev
