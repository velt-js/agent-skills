---
title: Install Tiptap CRDT Packages Correctly
impact: CRITICAL
impactDescription: Missing packages prevent Tiptap collaboration
tags: tiptap, installation, packages, npm
---

## Install Tiptap CRDT Packages Correctly

Install all required Tiptap and Velt CRDT packages. React apps use `@veltdev/tiptap-crdt-react`; other frameworks use `@veltdev/tiptap-crdt`.

**Correct (React / Next.js):**

```bash
npm install @veltdev/tiptap-crdt-react @veltdev/tiptap-crdt @veltdev/react @veltdev/types @tiptap/core @tiptap/starter-kit yjs
```

**Correct (Other Frameworks - Vue, Angular, vanilla):**

```bash
npm install @veltdev/tiptap-crdt @veltdev/client @tiptap/core @tiptap/starter-kit yjs
```

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/tiptap-crdt-react` | React hook (`useCollaboration`) for Tiptap CRDT |
| `@veltdev/tiptap-crdt` | Core Tiptap CRDT — exports `createCollaboration` and `CollaborationManager` |
| `@veltdev/react` | Velt React provider (`VeltProvider`, `useVeltClient`) |
| `@veltdev/client` | Velt client (`initVelt`) for non-React apps |
| `@veltdev/types` | TypeScript types (`Velt`, `CollaborationManager`, etc.) |
| `@tiptap/core` | Tiptap editor core |
| `@tiptap/starter-kit` | Basic Tiptap extensions |
| `yjs` | CRDT runtime — direct dependency in v2 |

> **v2 note:** As of `@veltdev/tiptap-crdt(-react)` v2, you no longer install `@tiptap/react`, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-cursor`, or `@tiptap/extension-collaboration-caret`. The extension returned by `useCollaboration` / `manager.createExtension()` bundles Yjs binding and remote cursor rendering into a single extension. `yjs` is now a direct dependency you install yourself.

**Verification:**
- [ ] All packages in package.json
- [ ] No peer dependency warnings
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 1: Install Dependencies)
