---
title: Save Named Version Checkpoints for State Recovery
impact: MEDIUM-HIGH
impactDescription: Enables rollback to known good states
tags: version, checkpoint, saveVersion, history
---

## Save Named Version Checkpoints for State Recovery

Use `saveVersion()` to create named checkpoints that can be restored later. Useful for autosave, undo/redo at document level, or user-triggered saves. The full version lifecycle — `saveVersion` → `getVersions` / `getVersionById` → `restoreVersion` (or `setStateFromVersion` for a local-only preview) — is available on every Velt CRDT store: plain stores (`array`, `map`, `text`, `xml`) and the editor integrations built on top of them (Tiptap, BlockNote, CodeMirror, ReactFlow).

**When to save versions:**
- On explicit user action ("Save" button)
- At regular intervals (autosave)
- Before destructive operations
- On significant state changes

**Correct (React - saving versions):**

```tsx
import { useStore } from '@veltdev/crdt-react';

function Editor() {
  const { saveVersion, getVersions, setStateFromVersion } =
    useStore<string>({ storeId: 'my-collab-note', type: 'text' });

  async function handleSave() {
    const versionId = await saveVersion('User checkpoint');
    console.log('Saved version:', versionId);
  }

  async function handleRestore() {
    const versions = await getVersions();
    if (versions.length === 0) return;
    const latest = versions[0];
    await setStateFromVersion(latest);
  }

  return (
    <div>
      <button onClick={handleSave}>Save Version</button>
      <button onClick={handleRestore}>Restore Latest</button>
    </div>
  );
}
```

**Correct (Vanilla JS):**

```ts
const store = await createVeltStore<string>({
  id: 'doc',
  type: 'text',
  veltClient,
});

// Save a version
const versionId = await store.saveVersion('Initial checkpoint');

// Get all versions
const versions = await store.getVersions();

// Restore from version
const fetched = await store.getVersionById(versionId);
if (fetched) {
  await store.setStateFromVersion(fetched);
}
```

**Version API Reference:**

| Method | Description | Returns |
|--------|-------------|---------|
| `saveVersion(name)` | Create named checkpoint | `Promise<string>` (versionId) |
| `getVersions()` | List all saved versions | `Promise<Version[]>` |
| `getVersionById(id)` | Get specific version | `Promise<Version \| null>` |
| `restoreVersion(id)` | Persistent restore: fetch a version by id and roll the store back to it for all collaborators | `Promise<boolean>` |
| `setStateFromVersion(v)` | Local application only: apply a fetched version's state to the current client (preview / diff view) — does not persist as a restore | `Promise<void>` |

**`restoreVersion` vs `setStateFromVersion`:** these are not interchangeable.

- Reach for `restoreVersion(id)` when the user is committing to a rollback — the store is persistently reset to that snapshot and every connected client sees the change.
- Reach for `setStateFromVersion(version)` when you only want to *show* what a snapshot looks like on the current client (e.g., a "preview this version" panel or diff view). It applies the state locally and does not perform a persistent restore.

Confusing the two leads to either a preview that unexpectedly wipes everyone else's document, or a "Restore" button that silently reverts only the clicking user.

**Verification:**
- [ ] Versions save successfully with meaningful names
- [ ] `getVersions()` returns expected list
- [ ] "Restore" actions use `restoreVersion(id)` and propagate to every connected collaborator
- [ ] Preview / diff UIs use `setStateFromVersion(version)` and do **not** persist for other users
- [ ] The chosen method is consistent whether the store is a plain type (`array`/`map`/`text`/`xml`) or an editor integration (Tiptap, BlockNote, CodeMirror, ReactFlow)

**Source Pointers:**
- `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 6: Save and restore versions)
- `https://docs.velt.dev/realtime-collaboration/crdt/overview` — "Version history"
