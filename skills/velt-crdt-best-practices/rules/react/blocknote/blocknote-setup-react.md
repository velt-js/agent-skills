---
title: Use useVeltBlockNoteCrdtExtension for BlockNote Collaboration (v1 — DEPRECATED)
impact: LOW
impactDescription: v1 API retained for backwards-compatibility only. New integrations must use the v2 useCollaboration hook (see blocknote-collaboration-manager.md and blocknote-v1-to-v2-migration.md).
tags: blocknote, react, hook, useVeltBlockNoteCrdtExtension, deprecated, v1
---

## Use useVeltBlockNoteCrdtExtension for BlockNote Collaboration (v1 — DEPRECATED)

> **DEPRECATED:** This rule documents the v1 React BlockNote CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `useCollaboration` from `@veltdev/blocknote-crdt-react`** — see `rules/shared/blocknote/blocknote-collaboration-manager.md` for the canonical v2 pattern and `rules/shared/blocknote/blocknote-v1-to-v2-migration.md` for the migration table.

Use `useVeltBlockNoteCrdtExtension` to get the `collaborationConfig` for BlockNote. Pass it to `useCreateBlockNote`.

**Incorrect (missing collaboration config):**

```tsx
const editor = useCreateBlockNote({});
// No collaboration - won't sync
```

**Correct (with collaborationConfig):**

```tsx
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { useVeltBlockNoteCrdtExtension } from '@veltdev/blocknote-crdt-react';

function CollaborativeEditor() {
  const { collaborationConfig, isLoading } = useVeltBlockNoteCrdtExtension({
    editorId: 'YOUR_EDITOR_ID',
    initialContent: JSON.stringify([{ type: 'paragraph', content: '' }]),
  });

  const editor = useCreateBlockNote({
    collaboration: collaborationConfig,
  }, [collaborationConfig]);

  return (
    <BlockNoteView
      editor={editor}
      key={collaborationConfig ? 'collab-on' : 'collab-off'}
    />
  );
}
```

**Hook Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `editorId` | string | Unique identifier for this editor |
| `initialContent` | string (optional) | Initial JSON content |
| `debounceMs` | number (optional) | Debounce time for sync |

**Hook Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `collaborationConfig` | object \| null | Config to pass to BlockNote |
| `store` | BlockNoteStore \| null | Underlying CRDT store |
| `isLoading` | boolean | True until store is ready |

**Important:** Use the `key` prop to force re-render when collaborationConfig changes.

**Verification:**
- [ ] `collaborationConfig` passed to `useCreateBlockNote`
- [ ] `key` prop set on `BlockNoteView`
- [ ] Unique `editorId` provided
- [ ] Connection status shows connected

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (### Step 3: Initialize Velt CRDT Extension)
