---
title: Save Named Version Checkpoints for State Recovery
impact: MEDIUM-HIGH
impactDescription: Enables rollback to known good states
tags: version, checkpoint, saveVersion, history
---

## Save Named Version Checkpoints for State Recovery

Use `saveVersion()` to create named checkpoints that can be restored later. Useful for autosave, undo/redo at document level, or user-triggered saves.

**When to save versions:**
- On explicit user action ("Save" button)
- At regular intervals (autosave)
- Before destructive operations
- On significant state changes

**Correct (React - saving versions):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  const { saveVersion, getVersions, setStateFromVersion } =
    useVeltCrdtStore<string>({ id: 'my-collab-note', type: 'text' });

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
| `setStateFromVersion(v)` | Restore state from version | `Promise<void>` |
| `restoreVersion(id)` | Fetch + restore in one call (React) | `Promise<boolean>` |

**Verification:**
- [ ] Versions save successfully with meaningful names
- [ ] `getVersions()` returns expected list
- [ ] `setStateFromVersion()` restores state correctly
- [ ] All collaborators see restored state

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 6: Save and restore versions)
