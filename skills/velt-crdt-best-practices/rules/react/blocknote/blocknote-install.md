---
title: Install BlockNote CRDT Packages Correctly
impact: CRITICAL
impactDescription: Missing packages prevent BlockNote collaboration
tags: blocknote, installation, packages, npm
---

## Install BlockNote CRDT Packages Correctly

Install all required BlockNote and Velt CRDT packages. React apps use `@veltdev/blocknote-crdt-react`; other frameworks use `@veltdev/blocknote-crdt`. As of v2, non-React BlockNote is supported.

**Correct (React / Next.js):**

```bash
npm install @veltdev/blocknote-crdt-react @veltdev/blocknote-crdt @veltdev/react @veltdev/types @blocknote/core @blocknote/react @blocknote/mantine yjs
```

**Correct (Other Frameworks - Vue, Angular, vanilla):**

```bash
npm install @veltdev/blocknote-crdt @veltdev/client @blocknote/core yjs
```

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/blocknote-crdt-react` | React hook (`useCollaboration`) for BlockNote CRDT |
| `@veltdev/blocknote-crdt` | Core BlockNote CRDT — exports `createCollaboration` and `CollaborationManager` |
| `@veltdev/react` | Velt React provider (`VeltProvider`, `useVeltClient`) |
| `@veltdev/client` | Velt client (`initVelt`) for non-React apps |
| `@veltdev/types` | TypeScript types (`Velt`, `CollaborationManager`, etc.) |
| `@blocknote/core` | BlockNote editor core |
| `@blocknote/react` | BlockNote React bindings (`useCreateBlockNote`) |
| `@blocknote/mantine` | BlockNote Mantine UI (`BlockNoteView`) |
| `yjs` | CRDT runtime — direct dependency in v2 |

> **v2 note:** As of `@veltdev/blocknote-crdt(-react)` v2, the v1 hook `useVeltBlockNoteCrdtExtension` is deprecated. New integrations should use `useCollaboration` (React) or `createCollaboration` (non-React). Both return a `CollaborationManager` with status, sync state, and first-class version management. See `rules/shared/blocknote/blocknote-collaboration-manager.md` and `rules/shared/blocknote/blocknote-v1-to-v2-migration.md`.

**Verification:**
- [ ] All packages in package.json
- [ ] No peer dependency warnings
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (### Step 1: Install Dependencies)
