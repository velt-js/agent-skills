---
title: Troubleshoot Common Presence Issues
impact: LOW-MEDIUM
impactDescription: Quick fixes for common presence setup and runtime problems
tags: debugging, troubleshooting, presence, issues, fixes, featureAllowList
---

## Troubleshoot Common Presence Issues

Common issues and solutions when integrating Velt Presence.

**Incorrect (several common mistakes together):**

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["comment"] }}> {/* 'presence' missing */}
  <VeltPresence />                                   {/* no authProvider, no document set */}
</VeltProvider>
```

**Correct:** authenticate, set the document, and allow the feature (details per issue below).

**Issue 1: Presence not showing**

**Symptoms:** `VeltPresence` renders nothing, no avatars appear.

**Solutions:**
```jsx
// 1. VeltProvider wraps all Velt components and authenticates the user
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={{
    user: { userId: "user-1", organizationId: "org-1", name: "Alice" },
    generateToken: async () => fetchToken(),
  }}
>
  <DocumentScope /> {/* calls setDocuments after login */}
  <VeltPresence />
</VeltProvider>

// 2. Set the document from a child component of VeltProvider
const { setDocuments } = useSetDocuments();
setDocuments([{ id: "my-document-id", metadata: { documentName: "My Doc" } }]);

// 3. v6 modular SDK: if featureAllowList is set, it must include 'presence'
<VeltProvider apiKey="YOUR_API_KEY" config={{ featureAllowList: ["presence", "comment"] }} />

// 4. For Next.js, add 'use client' at the top of files that use Velt components
```

Anonymous users never see presence; the feature requires an identified user.

**Issue 2: Users stuck on "online" (never go away/offline)**

**Solutions:**
```jsx
// inactivityTime is in milliseconds (default 300000 = 5 min)
<VeltPresence inactivityTime={60000} offlineInactivityTime={600000} />
// offlineInactivityTime smaller than inactivityTime is rejected and ignored.
// Frameworks or iframes that swallow focus/visibility events can delay 'away'.
```

**Issue 3: Users from other pages appear in the presence list**

**Solutions:**
```jsx
// Update the document on every route change; presence uses the root (first) document
const { setDocuments } = useSetDocuments();
useEffect(() => {
  if (veltUser) setDocuments([{ id: docId }]);
}, [veltUser, docId, setDocuments]);
```

**Issue 4: Avatar click does nothing**

**Solutions:**
```jsx
<VeltPresence onPresenceUserClick={(user) => navigateToUserLocation(user)} />
// Clicking an avatar only starts following when flockMode={true}
```

**Issue 5: User count looks wrong**

**Solutions:**
```jsx
// self defaults to true: the current user IS included and counts toward maxUsers
<VeltPresence self={false} /> {/* exclude yourself */}

// maxUsers (default 5) caps visible avatars; extra users go into "+N"
<VeltPresence maxUsers={5} />
// maxUsers does not change presence data returned by getData / usePresenceData.

// locationId / location filter the list to one location
```

### Debugging Verification Checklist

- [ ] `VeltProvider` renders with a valid `apiKey` and `authProvider`
- [ ] `authProvider.user` has `userId`, `organizationId`, and `name`
- [ ] `setDocuments` (via `useSetDocuments()` or `Velt.setDocuments`) is called with `{ id }`
- [ ] `featureAllowList`, if set, includes `'presence'`
- [ ] `'use client'` is present in Next.js components using Velt
- [ ] Domain is safelisted in the Velt Console
- [ ] Tested with two browsers and two different users
- [ ] `inactivityTime` / `offlineInactivityTime` are in milliseconds and ordered correctly
- [ ] `self` and `maxUsers` match the expected count

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/setup - "Presence Setup"
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior - "Customize Behavior"
- https://docs.velt.dev/ui-customization/features/realtime/presence - "Limitations"
- https://docs.velt.dev/key-concepts/overview#subscribe-to-documents - "Subscribe to Documents"
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `Config.featureAllowList`
