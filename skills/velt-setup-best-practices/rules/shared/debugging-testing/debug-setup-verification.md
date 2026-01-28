---
title: Verify Velt Setup is Correct
impact: LOW-MEDIUM
impactDescription: Systematic verification helps identify setup issues early
tags: verification, debugging, testing, checklist, setup
---

## Verify Velt Setup is Correct

Use this checklist to systematically verify your Velt setup. Check each item in order - issues often cascade from earlier setup problems.

**Setup Verification Checklist:**

### 1. Installation Verification

```jsx
// Check packages are installed correctly
// In terminal:
npm list @veltdev/react  // Should show version ^4.x.x

// In your code, this import should work:
import { VeltProvider, VeltComments, useVeltClient } from "@veltdev/react";
```

**Verification:**
- [ ] `@veltdev/react` (or `@veltdev/client`) is in package.json
- [ ] No installation errors when running `npm install`
- [ ] Imports work without "module not found" errors

### 2. API Key Verification

```jsx
// Add temporary logging to verify API key
console.log("Velt API Key:", process.env.NEXT_PUBLIC_VELT_API_KEY);

// Check it's being passed to VeltProvider
<VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY}>
```

**Verification:**
- [ ] API key is defined (not undefined or empty string)
- [ ] API key matches the one in console.velt.dev
- [ ] No "invalid API key" errors in browser console

### 3. Domain Verification

```jsx
// Check current domain matches whitelisted domains
console.log("Current origin:", window.location.origin);
console.log("Current hostname:", window.location.hostname);
```

**Verification:**
- [ ] Current domain is added to Velt Console's Managed Domains
- [ ] No "domain not allowed" errors in console
- [ ] Both localhost and production domains are whitelisted

### 4. User Authentication Verification

```jsx
// Add logging in your auth provider hook
export function useVeltAuthProvider() {
  const { user } = useAppUser();

  console.log("App user:", user);  // Should have userId, organizationId, name, email

  const authProvider = useMemo(() => {
    if (!user) {
      console.log("No user - authProvider will be undefined");
      return undefined;
    }
    console.log("Creating authProvider for user:", user.userId);
    return { /* ... */ };
  }, [user]);

  return { authProvider };
}
```

**Verification:**
- [ ] User object has all required fields (userId, organizationId, name, email)
- [ ] authProvider is defined before VeltProvider renders
- [ ] No null/undefined values in user object
- [ ] JWT token endpoint returns valid token (check Network tab)

### 5. Document Initialization Verification

```jsx
// Add logging in VeltInitializeDocument
export function VeltInitializeDocument() {
  const { documentId, documentName } = useCurrentDocument();
  const veltUser = useCurrentUser();

  console.log("Document ID:", documentId);
  console.log("Velt user ready:", !!veltUser);

  useEffect(() => {
    if (!veltUser || !documentId) {
      console.log("Waiting for:", { veltUser: !!veltUser, documentId });
      return;
    }
    console.log("Setting document:", documentId);
    setDocuments([{ id: documentId, metadata: { documentName } }]);
  }, [veltUser, documentId]);

  return null;
}
```

**Verification:**
- [ ] Document ID is generated and consistent
- [ ] setDocuments is called AFTER user is authenticated
- [ ] Document ID appears in URL (if using URL-based pattern)
- [ ] No "document not found" errors

### 6. Component Rendering Verification

```jsx
// Temporarily add visible markers
<VeltProvider apiKey="KEY" authProvider={authProvider}>
  <div style={{ background: "lightgreen", padding: "10px" }}>
    VeltProvider is rendering
  </div>
  <VeltCollaboration />
  <Content />
</VeltProvider>
```

**Verification:**
- [ ] VeltProvider wrapper renders (green box visible)
- [ ] VeltComments component appears in React DevTools
- [ ] No React errors in console about Velt components
- [ ] Comments sidebar appears (if VeltCommentsSidebar is used)

### 7. Full Setup Debug Component

```jsx
// components/velt/VeltDebug.tsx - Add temporarily to debug
"use client";
import { useVeltClient, useCurrentUser } from "@veltdev/react";
import { useCurrentDocument } from "@/app/document/useCurrentDocument";
import { useAppUser } from "@/app/userAuth/useAppUser";

export function VeltDebug() {
  const { client } = useVeltClient();
  const veltUser = useCurrentUser();
  const { user } = useAppUser();
  const { documentId } = useCurrentDocument();

  return (
    <div style={{ position: "fixed", bottom: 10, right: 10, background: "#fff", padding: 10, border: "1px solid #ccc", fontSize: 12 }}>
      <h4>Velt Debug</h4>
      <p>Client: {client ? "✅ Ready" : "❌ Not ready"}</p>
      <p>App User: {user ? `✅ ${user.name}` : "❌ Not logged in"}</p>
      <p>Velt User: {veltUser ? "✅ Authenticated" : "❌ Not authenticated"}</p>
      <p>Document: {documentId ? `✅ ${documentId}` : "❌ Not set"}</p>
      <p>Org: {user?.organizationId || "N/A"}</p>
    </div>
  );
}
```

**Expected Final State:**

| Item | Expected Value |
|------|----------------|
| Client | Ready |
| App User | Logged in with name |
| Velt User | Authenticated |
| Document | Set with valid ID |

**Verification:**
- [ ] All items show ✅ in debug component
- [ ] Comments can be created and saved
- [ ] Multiple users see the same comments
- [ ] Presence shows other users

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Setup steps to verify
