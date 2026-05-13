---
title: Install CodeMirror CRDT Packages
impact: CRITICAL
impactDescription: Required for CodeMirror collaboration
tags: codemirror, installation, packages, npm
---

## Install CodeMirror CRDT Packages

Install the Velt CodeMirror CRDT packages plus `y-codemirror.next` for Yjs integration.

**Correct (React / Next.js):**

```bash
npm install @veltdev/codemirror-crdt-react @veltdev/codemirror-crdt @veltdev/react @veltdev/types codemirror @codemirror/state @codemirror/view y-codemirror.next yjs
```

**Correct (Other Frameworks):**

```bash
npm install @veltdev/codemirror-crdt @veltdev/client codemirror @codemirror/state y-codemirror.next yjs
```

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/codemirror-crdt-react` | React hook (`useCollaboration`) for CodeMirror CRDT |
| `@veltdev/codemirror-crdt` | Core CodeMirror CRDT (`createCollaboration`, `CollaborationManager`) |
| `@veltdev/react` / `@veltdev/client` | Velt SDK (React provider / non-React client) |
| `@veltdev/types` | TypeScript types for the Velt SDK (React projects) |
| `y-codemirror.next` | Yjs CodeMirror bindings (`yCollab`) |
| `yjs` | Yjs CRDT runtime |
| `codemirror` | CodeMirror editor |
| `@codemirror/state` | CodeMirror state |
| `@codemirror/view` | CodeMirror view (React install) |

**Verification:**
- [ ] All packages in package.json
- [ ] `y-codemirror.next` installed for yCollab
- [ ] No peer dependency warnings

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 1: Install Dependencies)
