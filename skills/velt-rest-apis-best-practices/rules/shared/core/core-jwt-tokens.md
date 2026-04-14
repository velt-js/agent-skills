---
title: Generate JWT Tokens for Frontend User Authentication
impact: CRITICAL
impactDescription: Without server-generated JWT tokens, frontend users cannot authenticate with Velt
tags: jwt, authentication, tokens, security, nextjs, server
---

## Generate JWT Tokens for Frontend User Authentication

JWT tokens authenticate frontend users with the Velt SDK. Generate them server-side to keep your auth token secret. Tokens expire after 48 hours and must be regenerated.

**Endpoint:** `POST https://api.velt.dev/v2/auth/token/get`

**Incorrect (generating token on client — exposes auth token):**

```javascript
// NEVER do this in client-side code
const response = await fetch('https://api.velt.dev/v2/auth/token/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'your_api_key',
    'x-velt-auth-token': 'your_auth_token' // EXPOSED to browser
  },
  body: JSON.stringify({
    data: { userId: 'user_1', apiKey: 'your_api_key', authToken: 'your_auth_token' }
  })
});
```

**Correct (Next.js API route — server-side only):**

```typescript
// app/api/velt-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const response = await fetch('https://api.velt.dev/v2/auth/token/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-velt-api-key': process.env.VELT_API_KEY!,
      'x-velt-auth-token': process.env.VELT_AUTH_TOKEN!
    },
    body: JSON.stringify({
      data: {
        userId: userId,
        apiKey: process.env.VELT_API_KEY!,
        authToken: process.env.VELT_AUTH_TOKEN!,
        userProperties: {
          isAdmin: false,
          organizationId: 'org_123',
          email: 'user@example.com'
        }
      }
    })
  });

  const result = await response.json();
  // result.result.data.token contains the JWT string
  return NextResponse.json({ token: result.result.data.token });
}
```

**Response format:**

```json
{
  "result": {
    "data": {
      "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Correct (client-side token usage and refresh):**

```typescript
// On the frontend — fetch token from YOUR server, not Velt directly
const res = await fetch('/api/velt-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: currentUser.id })
});
const { token } = await res.json();

// Pass token to Velt identify
await client.identify(user, { authToken: token });

// Listen for token expiration (48-hour lifetime)
client.on('token_expired', async () => {
  const refreshRes = await fetch('/api/velt-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser.id })
  });
  const { token: newToken } = await refreshRes.json();
  await client.setAuthToken(newToken);
});
```

**Key points:**

- `authToken` in the request body is your Velt console auth token (same as the header value).
- `userProperties.isAdmin` controls whether the user has admin privileges in Velt features.
- Tokens expire in 48 hours. The frontend SDK emits a `token_expired` event when this happens.
- Never expose `authToken` to client-side code. Always proxy through your own API route.

**Verification:**
- [ ] JWT token generation runs server-side only
- [ ] `VELT_AUTH_TOKEN` is stored in environment variables, not in client bundles
- [ ] Response is parsed correctly: `result.result.data.token`
- [ ] Token expiration handling is implemented on the frontend
- [ ] `userProperties` includes required fields (organizationId, email)

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-apis/auth/get-token` (## Auth > ### Get Token)

---

## Permissions Management

Manage user permissions at the organization, document, or folder level via REST API.

**Add Permissions:**

```bash
curl -X POST https://api.velt.dev/v2/auth/permissions/add \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "userId": "user-123",
      "permissions": {
        "resources": [
          { "type": "organization", "id": "org-abc", "accessRole": "editor" },
          { "type": "document", "id": "doc-456", "accessRole": "viewer" }
        ]
      }
    }
  }'
```

**Get Permissions:**

```bash
curl -X POST https://api.velt.dev/v2/auth/permissions/get \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "userId": "user-123", "organizationId": "org-abc" } }'
```

**Remove Permissions:**

```bash
curl -X POST https://api.velt.dev/v2/auth/permissions/remove \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "userId": "user-123",
      "permissions": {
        "resources": [
          { "type": "document", "id": "doc-456" }
        ]
      }
    }
  }'
```

**Generate Signature:**

```bash
curl -X POST https://api.velt.dev/v2/auth/generate_signature \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "userId": "user-123" } }'
```

**Access Roles:**
- `viewer` — read-only access to the resource
- `editor` — read/write access to the resource

**Resource Types:** `organization`, `document`, `folder`

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-apis/auth/permissions`
