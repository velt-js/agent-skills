---
title: Attach Custom Page Info to Newly Created Data
impact: MEDIUM
impactDescription: Apps with client-side routing or custom URL schemes otherwise record browser-derived page info on comments, reactions, recordings, presence, and cursors
tags: setPageInfo, clearPageInfo, useSetPageInfo, useClearPageInfo, pageInfo, page-info, client-side-routing
---

## Attach Custom Page Info to Newly Created Data

By default Velt derives page info (URL, title, path) from the browser and stamps it onto newly created data — comments, reactions, recordings, presence, and cursors. In apps with client-side routing or custom URL schemes the browser URL may not be the identity you want recorded. `setPageInfo()` opts into supplying your own `PageInfo`; it affects **only newly created data** (existing records are untouched). `clearPageInfo()` reverts to the automatic browser-derived behavior.

**Params:**
- `pageInfo`: `PageInfo` (see [data-models#pageinfo](https://docs.velt.dev/api-reference/sdk/models/data-models#pageinfo))
- `options?`: `{ documentId?: string }` on the SDK signature. `documentId` is reserved for a future per-document scope; the current release applies custom page info globally.

**For React / Next.js:**

**Incorrect (relying on browser-derived URL in a client-side-routed app — created data records the wrong page):**

```jsx
// SPA route is /doc/42 but the browser URL/title may lag or use a hash scheme;
// new comments/reactions get stamped with whatever the browser reports.
<VeltComments />
```

**Correct (stamp your own page info via the hook or the client API):**

```jsx
import { useSetPageInfo, useClearPageInfo } from '@veltdev/react';

const { setPageInfo } = useSetPageInfo();
setPageInfo({ url: 'https://app.example.com/doc/42', title: 'Design Doc' });

// Or via the client API
client.setPageInfo({ url: 'https://app.example.com/doc/42', title: 'Design Doc' });

// Revert to automatic browser-derived page info
const { clearPageInfo } = useClearPageInfo();
clearPageInfo();
```

**For HTML/Vanilla JS:**

```js
Velt.setPageInfo({ url: 'https://app.example.com/doc/42', title: 'Design Doc' });

// Revert to automatic browser-derived page info
Velt.clearPageInfo();
```

The SDK signature also accepts `options?.documentId` on `setPageInfo()` / `clearPageInfo()`, but the docs mark it as reserved for a future per-document scope. Do not rely on per-document page-info behavior yet; treat custom page info as global until that scope ships.

**Verification:**
- [ ] `setPageInfo` is called only when you need to override the browser-derived page info (it is opt-in)
- [ ] Callers understand only newly created data is affected — existing comments/reactions/recordings keep their original page info
- [ ] React uses `useSetPageInfo()` / `useClearPageInfo()` (or `client.setPageInfo` / `client.clearPageInfo`); other frameworks use `Velt.setPageInfo` / `Velt.clearPageInfo`
- [ ] `clearPageInfo()` is used to return to automatic behavior rather than passing stale values
- [ ] `options.documentId` is not used as a live per-document scope; it is reserved for future support

**Source Pointers:**
- https://docs.velt.dev/get-started/advanced — "Set Custom Page Info" / "Clear Custom Page Info"
