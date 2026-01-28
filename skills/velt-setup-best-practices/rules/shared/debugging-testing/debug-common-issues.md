---
title: Troubleshoot Common Configuration Errors
impact: LOW-MEDIUM
impactDescription: Quick reference for resolving frequent setup issues
tags: troubleshooting, errors, debugging, common issues, fixes
---

## Troubleshoot Common Configuration Errors

This guide covers the most common Velt setup issues and their solutions.

### Issue 1: "Domain not allowed" Error

**Symptom:**
```
Console: "Domain not allowed. Please add your domain to the safelist."
```

**Cause:** Your current domain is not whitelisted in Velt Console.

**Solution:**
1. Go to https://console.velt.dev
2. Navigate to Settings → Managed Domains
3. Add your domain(s):
   - `localhost:3000` (development)
   - `your-app.com` (production)

```jsx
// Debug: Check current domain
console.log("Add this domain to Velt Console:", window.location.origin);
```

---

### Issue 2: VeltProvider Not Working in Next.js

**Symptom:**
- Server component errors
- "Cannot read properties of undefined" errors
- Hydration mismatches

**Cause:** Missing `'use client'` directive or VeltProvider in wrong location.

**Solution:**

```jsx
// WRONG: Missing 'use client'
import { VeltProvider } from "@veltdev/react";
export default function Page() {
  return <VeltProvider apiKey="KEY">...</VeltProvider>;
}

// CORRECT: Add 'use client' at the top
"use client";
import { VeltProvider } from "@veltdev/react";
export default function Page() {
  return <VeltProvider apiKey="KEY">...</VeltProvider>;
}
```

Also ensure VeltProvider is in `page.tsx`, not `layout.tsx`.

---

### Issue 3: Comments Not Appearing

**Symptom:**
- VeltComments renders but no comments show
- Comments created by one user not visible to others

**Cause:** Document ID mismatch or document not set.

**Solution:**

```jsx
// 1. Verify document is being set
useEffect(() => {
  console.log("Setting document:", documentId);  // Should log a value
  if (documentId) {
    setDocuments([{ id: documentId }]);
  }
}, [documentId]);

// 2. Verify same document ID across users
// Both users should see the same documentId in their URL/logs

// 3. Check document is set AFTER user authentication
const veltUser = useCurrentUser();
useEffect(() => {
  if (!veltUser) return;  // Wait for auth
  setDocuments([{ id: documentId }]);
}, [veltUser, documentId]);
```

---

### Issue 4: JWT Token Errors

**Symptom:**
```
Console: "Invalid token" or "Token expired"
Network tab: 401 errors to /api/velt/token
```

**Cause:** Token generation endpoint issues or invalid auth token.

**Solution:**

```typescript
// 1. Check auth token is set on server
// app/api/velt/token/route.ts
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN;
console.log("Auth token defined:", !!VELT_AUTH_TOKEN);  // Should be true

// 2. Check API response format
const response = await fetch("https://api.velt.dev/v2/auth/token/get", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-velt-api-key": process.env.NEXT_PUBLIC_VELT_API_KEY,
    "x-velt-auth-token": process.env.VELT_AUTH_TOKEN,
  },
  body: JSON.stringify({
    data: {
      userId,
      userProperties: {
        organizationId,
        ...(email ? { email } : {}),
      },
    },
  }),
});

const json = await response.json();
console.log("Velt API response:", json);  // Should have result.data.token
```

---

### Issue 5: User Not Authenticated in Velt

**Symptom:**
- `useCurrentUser()` returns null/undefined
- Velt features don't work even though app user is logged in

**Cause:** authProvider not configured correctly or user object missing fields.

**Solution:**

```jsx
// 1. Check authProvider is defined before rendering VeltProvider
const { authProvider } = useVeltAuthProvider();
console.log("authProvider:", authProvider);  // Should not be undefined

if (!authProvider) {
  return <div>Loading...</div>;  // Wait for authProvider
}

return <VeltProvider apiKey="KEY" authProvider={authProvider}>...</VeltProvider>;

// 2. Check user object has all required fields
const user = {
  userId: "...",           // Required - must not be empty
  organizationId: "...",   // Required - must not be empty
  name: "...",             // Required
  email: "...",            // Required
};
console.log("User object:", user);
```

---

### Issue 6: "Hooks can only be called inside function component"

**Symptom:**
```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**Cause:** Using Velt hooks outside VeltProvider or in wrong context.

**Solution:**

```jsx
// WRONG: Hook outside VeltProvider
function App() {
  const { client } = useVeltClient();  // Error!
  return <VeltProvider apiKey="KEY">...</VeltProvider>;
}

// CORRECT: Hook inside VeltProvider (in child component)
function App() {
  return (
    <VeltProvider apiKey="KEY">
      <ChildComponent />  {/* Hooks work here */}
    </VeltProvider>
  );
}

function ChildComponent() {
  const { client } = useVeltClient();  // Works!
  return <div>...</div>;
}
```

---

### Issue 7: Multiple VeltProvider Instances

**Symptom:**
- Velt features work inconsistently
- State issues between different parts of app

**Cause:** Multiple VeltProvider components mounted.

**Solution:**

```jsx
// WRONG: Multiple providers
<VeltProvider apiKey="KEY">
  <ComponentA>
    <VeltProvider apiKey="KEY">  {/* Don't nest providers! */}
      <ComponentB />
    </VeltProvider>
  </ComponentA>
</VeltProvider>

// CORRECT: Single provider at app root
<VeltProvider apiKey="KEY">
  <ComponentA>
    <ComponentB />  {/* Same provider context */}
  </ComponentA>
</VeltProvider>
```

---

### Issue 8: Comments Not Persisting

**Symptom:**
- Comments appear temporarily but disappear on refresh
- Comments not visible to other users

**Cause:** Document ID changes on each page load.

**Solution:**

```jsx
// WRONG: Random document ID
const documentId = Math.random().toString();  // Different every time!

// CORRECT: Consistent document ID
const documentId = searchParams.get("documentId") || localStorage.getItem("docId");
```

See `document-id-generation` rule for proper patterns.

---

### Quick Diagnostic Checklist

| Issue | Check |
|-------|-------|
| Nothing works | API key valid? Domain whitelisted? |
| Server errors (Next.js) | 'use client' directive present? |
| No comments visible | Document set after auth? Same doc ID? |
| Auth errors | authProvider defined? Token endpoint working? |
| Hooks error | Inside VeltProvider? In child component? |
| Inconsistent state | Only one VeltProvider? |
| Data not persisting | Document ID consistent? |

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Setup requirements
