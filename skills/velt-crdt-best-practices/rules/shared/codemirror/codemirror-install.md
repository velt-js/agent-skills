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
npm install @veltdev/codemirror-crdt-react @veltdev/react
```

**Correct (Other Frameworks):**

```bash
npm install @veltdev/codemirror-crdt @veltdev/client y-codemirror.next
```

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/codemirror-crdt-react` | React hook for CodeMirror CRDT |
| `@veltdev/codemirror-crdt` | Core CodeMirror CRDT (non-React) |
| `y-codemirror.next` | Yjs CodeMirror bindings |
| `codemirror` | CodeMirror editor |
| `@codemirror/state` | CodeMirror state |

**Verification:**
- [ ] All packages in package.json
- [ ] `y-codemirror.next` installed for yCollab
- [ ] No peer dependency warnings

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 1: Install Dependencies)
