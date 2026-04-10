---
title: Avoid Duplicate Yjs Imports (CJS/ESM Split)
impact: HIGH
impactDescription: Importing Yjs twice creates two separate Y instances that cannot sync — changes are silently lost
tags: yjs, import, CJS, ESM, duplicate, bundler, webpack, vite, resolutions, overrides
---

## Avoid Duplicate Yjs Imports (CJS/ESM Split)

One of the most common and hardest-to-diagnose Yjs issues occurs when your bundle includes two separate copies of the `yjs` package. This typically happens when one dependency pulls in the CommonJS build and another pulls in the ESM build. Because each copy has its own internal type registry, shared types created by one copy are unrecognized by the other. Documents appear to work locally but changes never propagate between peers.

Symptoms of duplicate Yjs imports:
- Changes made in one editor do not appear in another, even though the provider reports connected status
- `instanceof` checks fail (e.g., `value instanceof Y.Map` returns `false` for a value that is clearly a Y.Map)
- Errors like "Unexpected case" or "Unknown content type" in the console
- State vectors diverge between clients that should be in sync

The root cause is almost always multiple versions or multiple builds of `yjs` in the dependency tree. Fix this by forcing a single resolution at the package manager level, and optionally with bundler aliases.

**Correct — force single Yjs version via package manager resolutions:**

```jsonc
// package.json — npm (v8.3+) overrides
{
  "overrides": {
    "yjs": "13.6.18"
  }
}
```

```jsonc
// package.json — yarn resolutions
{
  "resolutions": {
    "yjs": "13.6.18"
  }
}
```

```jsonc
// package.json — pnpm overrides
{
  "pnpm": {
    "overrides": {
      "yjs": "13.6.18"
    }
  }
}
```

**Correct — bundler aliases to deduplicate at build time:**

```js
// webpack.config.js
const path = require('path')

module.exports = {
  resolve: {
    alias: {
      yjs: path.resolve(__dirname, 'node_modules/yjs')
    }
  }
}
```

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    dedupe: ['yjs']
  }
})
```

**Correct — diagnosing the problem:**

```bash
# Check how many copies of yjs are installed
npm ls yjs

# If you see multiple versions in the tree, apply overrides above
# After changing overrides, reinstall:
rm -rf node_modules package-lock.json
npm install
```

**Verification:**
- [ ] `npm ls yjs` (or equivalent) shows exactly one copy of yjs in the dependency tree
- [ ] Package manager overrides/resolutions pin yjs to a single version
- [ ] Bundler config includes alias or dedupe for yjs if using webpack or vite
- [ ] No "Unexpected case" or "Unknown content type" errors in the console
- [ ] Changes propagate correctly between two browser tabs in the same room

**Source:** https://docs.yjs.dev/tutorials/pitfalls#yjs-is-imported-twice
