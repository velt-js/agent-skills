---
title: Install Velt React Packages
impact: CRITICAL
impactDescription: Required for any Velt functionality in React/Next.js apps
tags: installation, react, nextjs, npm, packages
---

## Install Velt React Packages

The @veltdev/react package is required for React and Next.js applications. It provides the VeltProvider component and all React hooks for Velt functionality.

**Incorrect (missing packages):**

```bash
# Missing required package - Velt features won't work
npm install react react-dom
```

**Correct (with Velt packages):**

```bash
# Install the core Velt React package
npm install @veltdev/react

# Optional: Install TypeScript types for better IDE support
npm install --save-dev @veltdev/types
```

**Package Versions:**

The SDK uses semantic versioning. Install the latest version:

| Package | Purpose |
|---------|---------|
| @veltdev/react | Core React provider and hooks |
| @veltdev/types | TypeScript type definitions (optional) |

Check [console.velt.dev](https://console.velt.dev) or npm for the latest version.

**Using yarn or pnpm:**

```bash
# yarn
yarn add @veltdev/react
yarn add -D @veltdev/types

# pnpm
pnpm add @veltdev/react
pnpm add -D @veltdev/types
```

**Prerequisites:**

- Node.js v14 or higher
- React 16+ (React 19 supported)
- Package manager (npm, yarn, or pnpm)
- Velt account with API key from https://console.velt.dev

**Verification:**
- [ ] @veltdev/react appears in package.json dependencies
- [ ] @veltdev/types appears in package.json devDependencies (if using TypeScript)
- [ ] No npm/yarn errors during installation
- [ ] Can import `{ VeltProvider } from '@veltdev/react'`

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 1: Install Dependencies
