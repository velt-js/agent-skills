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
npm install @veltdev/tiptap-crdt-react @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor
```

**Correct (Other Frameworks - Vue, Angular, vanilla):**

```bash
npm install @veltdev/tiptap-crdt @veltdev/client @tiptap/core @tiptap/starter-kit @tiptap/extension-collaboration-caret
```

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/tiptap-crdt-react` | React hook for Tiptap CRDT |
| `@veltdev/tiptap-crdt` | Core Tiptap CRDT (non-React) |
| `@tiptap/react` | Tiptap React bindings |
| `@tiptap/starter-kit` | Basic Tiptap extensions |
| `@tiptap/extension-collaboration` | Yjs collaboration support |
| `@tiptap/extension-collaboration-cursor` | Cursor/caret display |

**Verification:**
- [ ] All packages in package.json
- [ ] No peer dependency warnings
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 1: Install Dependencies)
