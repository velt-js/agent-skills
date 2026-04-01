---
title: Enable Single Editor Mode with Auto-Sync and Editor Status UI
impact: CRITICAL
impactDescription: Required for Single Editor Mode to function with live content sync
tags: setup, enableSingleEditorMode, useLiveStateSyncUtils, useVeltInitState, useUserEditorState, useEditor, VeltSingleEditorModePanel, enableAutoSyncState, singleEditorModeContainerIds, data-velt-sync-state, data-velt-sync-access, setUserAsEditor
---

## Enable Single Editor Mode with Auto-Sync and Editor Status UI

Single Editor Mode restricts editing to one user at a time. Other users see content in read-only mode with live sync. The first user to load the page claims the editor role automatically.

**Setup requires changes in two places:**
1. `VeltCollaboration` component — enables SEM, auto-sync, and claims editor role
2. Document page — renders editor status banner and content area with sync attributes

### 1. VeltCollaboration Component

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
```

### 2. Document Page — Editor Status Banner + Synced Content

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

### Common Mistakes — DO NOT

These are the most common mistakes when implementing or debugging SEM. Each one will break SEM:

1. **DO NOT add timeouts or delays to `setUserAsEditor()`** — Use `useVeltInitState()` as the ONLY gate. If `veltInitState` is truthy, Velt is ready. Timeouts (500ms, 1s, etc.) are unreliable and mask the real issue.

2. **DO NOT make `contentEditable` conditional on `isEditor`** — With `customMode: false`, the SDK auto-manages read-only state via `data-velt-sync-access="true"`. Writing `contentEditable={isEditor}` fights the SDK and prevents content sync from working. Always use `contentEditable` (which means `contentEditable={true}`).

3. **DO NOT use `useCurrentUser()` to gate `setUserAsEditor()`** — Use `useVeltInitState()` instead. `useCurrentUser()` tells you about user auth, but `useVeltInitState()` tells you when the ENTIRE Velt system (including document context) is ready.

4. **DO NOT inline `VeltInitializeDocument` into `VeltCollaboration`** — Keep it as a separate child component. Inlining and adding state tracking (`documentReady` flags) creates race conditions. The SDK handles initialization timing internally.

5. **DO NOT gate `VeltInitializeDocument` on `useCurrentUser()`** — `setDocuments()` does not require the user to be initialized. The SDK processes the document context when it's ready.

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
- [ ] `useVeltInitState()` used to wait before claiming editor
- [ ] `setUserAsEditor()` called with all 3 error codes handled
- [ ] `enableAutoSyncState()` called for live content sync
- [ ] `singleEditorModeContainerIds()` scopes SEM to content area
- [ ] `data-velt-sync-access="true"` and `data-velt-sync-state="true"` on content element
- [ ] `DocumentContent` is a child of VeltProvider (not sibling)
- [ ] Editor status banner shows correct state using `useUserEditorState()` + `useEditor()`

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior
