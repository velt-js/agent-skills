---
title: Install BlockNote CRDT Package
impact: CRITICAL
impactDescription: Required for BlockNote collaboration
tags: blocknote, installation, packages, npm
---

## Install BlockNote CRDT Package

Install the Velt BlockNote CRDT package. Currently only React is supported.

**Correct (React / Next.js):**

```bash
npm install @veltdev/blocknote-crdt-react
```

**Note:** Non-React framework support is not yet documented. Check Velt docs for updates.

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/blocknote-crdt-react` | React hook for BlockNote CRDT |
| `@blocknote/react` | BlockNote React bindings |
| `@blocknote/mantine` | BlockNote Mantine UI |
| `@blocknote/core` | BlockNote core (fonts, etc.) |

**Verification:**
- [ ] Package in package.json
- [ ] No peer dependency warnings
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (### Step 1: Install Dependencies)
