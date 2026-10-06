---
title: Scope Feature Loading with featureAllowList and preload Methods (v6 Modular SDK)
impact: MEDIUM-HIGH
impactDescription: In the v6 modular SDK, featureAllowList controls which feature chunks preload and which features may run; a missing key leaves tag-only features inert
tags: featureAllowList, modular sdk, preload, preloadComment, preloadUserInvite, chunk, lazy loading, v6, config, initVelt
---

## Scope Feature Loading with featureAllowList and preload Methods (v6 Modular SDK)

Since v6.0.0-beta.1 each Velt feature is its own lazy chunk. Pass `featureAllowList` at init to preload only the features you use. Omit it to keep the default: every feature chunk preloads in the background. When set, it is also an allow-list: features not listed are suppressed unless something enables them on demand.

**Incorrect (allow-list omits a feature that is rendered):**

```jsx
// VeltNotificationsTool and VeltUserInviteTool are rendered,
// but only comments and presence are allowed
<VeltProvider apiKey="YOUR_VELT_API_KEY" config={{ featureAllowList: ['comment', 'presence'] }}>
  <VeltComments />
  <VeltNotificationsTool />
  <VeltUserInviteTool />
</VeltProvider>
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider, VeltComments, VeltPresence, VeltNotificationsTool } from "@veltdev/react";

export default function Page() {
  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      config={{ featureAllowList: ['comment', 'presence', 'notification'] }}
    >
      <VeltComments />
      <VeltPresence />
      <VeltNotificationsTool />
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```js
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_VELT_API_KEY', {
  featureAllowList: ['comment', 'presence', 'notification'],
});
```

**Warm or load a chunk on demand with `preload*()`:**

```jsx
// React: from a child component of VeltProvider
const { client } = useVeltClient();

const openSidebar = async () => {
  await client.preloadComment();
  client.getCommentElement().openCommentSidebar();
};
```

```js
// Other frameworks
await Velt.preloadUserInvite();
```

**Behavior to rely on:**
- `preload*()` methods (`preloadComment()`, `preloadPresence()`, `preloadNotification()`, `preloadRecorder()`, `preloadCrdt()`, `preloadUserInvite()`, and the rest) return `Promise<void>`, are idempotent, and never throw.
- Calling `getXElement()` or `preloadX()` for a feature omitted from `featureAllowList` auto-enables it.
- Tag-only features `userInvite`, `userRequest`, and `videoPlayer` have no element accessor. Load them via `featureAllowList` or `preloadUserInvite()` / `preloadUserRequest()` / `preloadVideoPlayer()`.
- Feature tags placed before their chunk loads render inert and upgrade in place once the chunk arrives.
- `getXElement()` accessors return immediately; calls made before the chunk loads are queued or bridged, so existing code keeps working.

**Valid `featureAllowList` keys:** `'comment'`, `'cursor'`, `'presence'`, `'huddle'`, `'recorder'`, `'notification'`, `'reaction'`, `'arrow'`, `'tag'`, `'rewriter'`, `'selection'`, `'area'`, `'activity'`, `'views'`, `'userInvite'`, `'userRequest'`, `'videoPlayer'`, `'crdt'`, `'liveStateSync'`. Live Selection uses `'selection'` here, not `'liveSelection'`.

**Verification:**
- [ ] Either `featureAllowList` is omitted (preload everything), or it lists every feature the app renders
- [ ] Tag-only features (`userInvite`, `userRequest`, `videoPlayer`) are allow-listed or preloaded
- [ ] `featureAllowList` is inside the `config` prop (React) or the second `initVelt()` argument, not a top-level prop
- [ ] Keys use the modular names above (for example `'notification'`, not `'notifications'`)

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - Config (`featureAllowList`, valid modular feature keys)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadcomment - Modular SDK / Chunk Preloading
- https://docs.velt.dev/ui-customization/reference/feature-flags - Provider `config` object
