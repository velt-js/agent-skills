---
title: Troubleshoot Common Presence Issues
impact: LOW-MEDIUM
impactDescription: Quick fixes for common presence setup and runtime problems
tags: debugging, troubleshooting, presence, issues, fixes
---

## Troubleshoot Common Presence Issues

Common issues and solutions when integrating Velt Presence.

**Issue 1: Presence not showing**

**Symptoms:** `VeltPresence` renders nothing, no avatars appear.

**Solutions:**
```jsx
// 1. Ensure VeltProvider wraps all Velt components with authProvider
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={{
    user: { userId: "user-1", organizationId: "org-1", name: "Alice" },
    generateToken: async () => fetchToken(),
  }}
>
  <VeltPresence />  {/* Must be inside provider */}
</VeltProvider>

// 2. Ensure setDocuments is called to scope presence
import { useSetDocuments } from "@veltdev/react";
useSetDocuments([{ id: "my-document-id" }]);

// 3. For Next.js, add 'use client' directive at top of file
```

**Issue 2: Users stuck on "online" (never go away/offline)**

**Symptoms:** User avatars show as online even after they leave or go idle.

**Solutions:**
```jsx
// Check inactivityTime configuration
<VeltPresence inactivityTime={300000} />
// Default: 5 minutes (300000ms). Set lower for faster away detection.

// Ensure tab focus/blur events are not being intercepted
// Some frameworks or iframes can block visibility change events.
// Test in a standalone page first.
```

**Issue 3: All users showing across all documents**

**Symptoms:** Users from other documents appear in your presence list.

**Solutions:**
```jsx
// setDocuments MUST be called to scope presence to a specific document
import { useSetDocuments } from "@veltdev/react";

function DocumentPage({ docId }) {
  // This scopes presence (and comments, cursors) to this document
  useSetDocuments([{ id: docId }]);

  return <VeltPresence />;
}
```

**Issue 4: Avatar click not working**

**Symptoms:** Clicking on a presence avatar does nothing.

**Solutions:**
```jsx
// Use onPresenceUserClick callback
<VeltPresence
  onPresenceUserClick={(user) => {
    console.log("Clicked user:", user);
    navigateToUserLocation(user);
  }}
/>
```

**Issue 5: User count is wrong**

**Symptoms:** Fewer or more users shown than expected.

**Solutions:**
```jsx
// Check the 'self' prop -- controls whether current user appears
<VeltPresence self={true} />   {/* Include self in avatar list */}
<VeltPresence self={false} />  {/* Exclude self (default) */}

// Check maxUsers -- limits visible avatars before overflow
<VeltPresence maxUsers={5} />
// Remaining users appear as "+N" count. This does not affect
// the actual presence data, only the visible avatar count.
```

### Debugging Verification Checklist

- [ ] `VeltProvider` renders with valid `apiKey` and `authProvider`
- [ ] `authProvider.user` has `userId`, `organizationId`, and `name`
- [ ] `useSetDocuments` (or `client.setDocuments`) is called with a document ID
- [ ] `'use client'` directive present in Next.js components using Velt
- [ ] Domain is safelisted in the Velt Console
- [ ] Test with two browser tabs using different user identities
- [ ] Check browser console for Velt SDK errors
- [ ] `inactivityTime` is set to an appropriate value for your use case
- [ ] `self` prop matches your expected behavior (show/hide current user)
- [ ] `maxUsers` is not set too low (hiding users you expect to see)

> **Source:** Velt Presence Troubleshooting -- common integration issues and configuration checks
