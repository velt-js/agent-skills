---
title: Install Correct CRDT Packages for Your Framework
impact: CRITICAL
impactDescription: Missing packages prevent CRDT from working
tags: installation, packages, npm, setup
---

## Install Correct CRDT Packages for Your Framework

Install the appropriate Velt CRDT packages based on your framework. React apps need the hook wrapper; other frameworks use the core library directly.

**Incorrect (missing required packages):**

```bash
# Missing @veltdev/crdt - won't work
npm install @veltdev/crdt-react
```

**Correct (React / Next.js):**

```bash
npm install @veltdev/crdt-react @veltdev/crdt @veltdev/react
```

**Correct (Other Frameworks - Vue, Angular, vanilla JS):**

```bash
npm install @veltdev/crdt @veltdev/client
```

**Verification:**
- [ ] Package.json contains all required dependencies
- [ ] No peer dependency warnings during install
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Setup > ### Step 1: Install Dependencies)
