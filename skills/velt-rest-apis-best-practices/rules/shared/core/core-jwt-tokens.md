---
title: Generate JWT Tokens Server-Side with /v2/auth/generate_token
impact: CRITICAL
impactDescription: A wrong endpoint, body shape, or client-side call breaks frontend authentication or leaks the auth token
tags: jwt, authentication, tokens, security, generate_token, permissions, accessRole, authProvider, token_expired, nextjs, server
---

## Generate JWT Tokens Server-Side with /v2/auth/generate_token

JWT tokens authenticate frontend users with the Velt SDK. Generate them on your server with `POST https://api.velt.dev/v2/auth/generate_token`, authenticated with the `x-velt-api-key` and `x-velt-auth-token` headers. Tokens expire after 48 hours. Turn on **Require JWT Token** in the Velt Console (or `requireJwtToken: true` via `/v2/workspace/apikeyconfig/update`) to enforce them.

**Incorrect (legacy body shape, organization in `userProperties`, called from the browser):**

```javascript
// Runs in the browser: exposes the auth token.
// Puts apiKey/authToken in the body and organizationId in userProperties.
const response = await fetch('https://api.velt.dev/v2/auth/generate_token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      userId: 'user_1',
      apiKey: 'your_api_key',
      authToken: 'your_auth_token',
      userProperties: { organizationId: 'org_123' }
    }
  })
});
```

**Correct (Next.js route handler, server-side only):**

```typescript
// app/api/velt-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, name, email, organizationId } = await req.json();

  const response = await fetch('https://api.velt.dev/v2/auth/generate_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-velt-api-key': process.env.VELT_API_KEY!,
      'x-velt-auth-token': process.env.VELT_AUTH_TOKEN!
    },
    body: JSON.stringify({
      data: {
        userId,
        userProperties: { name, email, isAdmin: false },
        permissions: {
          resources: [
            { type: 'organization', id: organizationId, accessRole: 'editor' },
            { type: 'document', id: 'doc_456', organizationId, accessRole: 'viewer' }
          ]
        }
      }
    })
  });

  const json = await response.json();
  // { result: { status: 'success', message, data: { token } } }
  return NextResponse.json({ token: json?.result?.data?.token });
}
```

**Request body (`data`):**

| Field | Required | Notes |
|-------|----------|-------|
| `userId` | Yes | Your user's ID |
| `userProperties.name` | Yes | Display name |
| `userProperties.email` | Yes | Email |
| `userProperties.isAdmin` | No | Default `false`. Sets the user as a Velt admin |
| `permissions.resources[]` | Yes | `{ type: 'organization' \| 'folder' \| 'document', id, organizationId?, accessRole?, expiresAt? }` |

- `organizationId` belongs in `permissions.resources[]` as a `type: 'organization'` entry, never in `userProperties`.
- `organizationId` is required on `document` and `folder` resources.
- `accessRole` is `viewer` or `editor` (default `editor`). It can only be set through the v2 Users and Auth Permissions REST APIs, never from frontend SDK methods.
- Posting the body without the top-level `data` wrapper returns `INVALID_ARGUMENT`.

**Correct (frontend: let the auth provider refresh tokens):**

```jsx
// React: Velt calls generateToken on sign-in and whenever the token expires.
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={{
    user,
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      const res = await fetch('/api/velt-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, name: user.name, email: user.email, organizationId: user.organizationId })
      });
      const { token } = await res.json();
      return token;
    }
  }}
>
  {children}
</VeltProvider>
```

```javascript
// Other frameworks
Velt.setVeltAuthProvider({
  user,
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => (await (await fetch('/api/velt-token', { method: 'POST' })).json()).token
});
```

**Correct (frontend: `identify()` users must handle `token_expired` themselves):**

```javascript
// Other frameworks: subscribe to the error event and re-identify with a fresh token.
const subscription = Velt.on('error').subscribe(async (error) => {
  if (error?.code === 'token_expired') {
    const { token } = await (await fetch('/api/velt-token', { method: 'POST' })).json();
    await Velt.identify(user, { authToken: token });
  }
});
// Later: subscription?.unsubscribe();
```

In React, read the same event with `useVeltEventCallback('error')` and re-identify when `code === 'token_expired'`. With an auth provider, refresh is automatic and no listener is needed.

### Permissions endpoints

Grant, read, and revoke resource access server-side. All are `POST` with the API-key-level header pair.

```bash
# Add permissions: note the nested "user" object
POST https://api.velt.dev/v2/auth/permissions/add
{ "data": {
    "user": { "userId": "user-123" },
    "permissions": { "resources": [
      { "type": "organization", "id": "org-abc", "accessRole": "editor" },
      { "type": "document", "id": "doc-456", "organizationId": "org-abc", "accessRole": "viewer", "expiresAt": 1728902400 }
    ] }
} }

# Get permissions: organizationId + userIds (plus optional documentIds / folderIds)
POST https://api.velt.dev/v2/auth/permissions/get
{ "data": { "organizationId": "org-abc", "userIds": ["user-123"], "documentIds": ["doc-456"] } }

# Remove permissions: top-level userId
POST https://api.velt.dev/v2/auth/permissions/remove
{ "data": {
    "userId": "user-123",
    "permissions": { "resources": [ { "type": "document", "id": "doc-456", "organizationId": "org-abc" } ] }
} }

# Sign Permission Provider responses (backend only)
POST https://api.velt.dev/v2/auth/generate_signature
{ "data": { "permissions": [
    { "userId": "user-123", "resourceId": "doc-456", "type": "document", "hasAccess": true, "accessRole": "viewer", "expiresAt": 1759745729823 }
] } }
# -> { "result": { "data": { "signature": "..." } } }
```

- `expiresAt` is **Unix seconds** on `permissions/add` and `generate_token` resources, but **milliseconds** on `generate_signature`.
- `permissions/get` returns `result.data[userId]` with `organization`, `folders`, `documents` maps of `{ accessRole, accessType, expiresAt?, error?, errorCode? }`, plus `context.accessFields` when Access Context is used.
- `generate_signature` is for the real-time Permission Provider: sign your permission decisions before returning them to Velt.

**Verification Checklist:**
- [ ] Token generation calls `https://api.velt.dev/v2/auth/generate_token` from the server, with `x-velt-api-key` and `x-velt-auth-token` headers (no `apiKey`/`authToken` in the body)
- [ ] Body is wrapped in `data` and includes `userId`, `userProperties.name`, `userProperties.email`, and `permissions.resources[]`
- [ ] `organizationId` is sent as a `type: 'organization'` resource, not in `userProperties`
- [ ] Token is read from `result.data.token`
- [ ] Frontend uses `authProvider` / `setVeltAuthProvider` with `generateToken`, or listens for the `error` event with `code === 'token_expired'` when using `identify()`
- [ ] `permissions/add` uses `user.userId`; `permissions/remove` uses top-level `userId`; `permissions/get` uses `organizationId` + `userIds`
- [ ] `expiresAt` units match the endpoint (seconds on add/generate_token, milliseconds on generate_signature)

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token - "Generate Token"
- https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens - "JWT Authentication Tokens"
- https://docs.velt.dev/get-started/advanced#token-refresh - "Token Refresh"
- https://docs.velt.dev/key-concepts/overview#access-control - "Access Control"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/add-permissions - "Add Permissions"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/get-permissions - "Get Permissions"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/remove-permissions - "Remove Permissions"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-signature - "Generate Signature"
