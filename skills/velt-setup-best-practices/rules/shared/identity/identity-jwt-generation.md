---
title: Generate JWT Tokens from Backend
impact: CRITICAL
impactDescription: Required for production security; tokens must be server-generated with the v2 generate_token endpoint
tags: jwt, token, backend, api, security, authentication, generate_token, permissions, accessrole, veltdev-node, generateToken
---

## Generate JWT Tokens from Backend

Velt JWT tokens must be generated on your server, never in the browser. Call `POST https://api.velt.dev/v2/auth/generate_token` with your API key and Auth Token (which must remain secret), then return the token to the client's `authProvider.generateToken`. Tokens expire after 48 hours.

**Incorrect (client-side generation, wrong endpoint, wrong body shape):**

```jsx
// WRONG on three counts:
// 1. Auth token exposed in client-side code
// 2. /v2/auth/token/get is not a v2 endpoint (v2 is /v2/auth/generate_token)
// 3. Body not wrapped in `data`, organizationId placed in userProperties
const VELT_AUTH_TOKEN = "bd4d5226...";

const generateToken = async () => {
  const response = await fetch("https://api.velt.dev/v2/auth/token/get", {
    method: "POST",
    headers: { "x-velt-auth-token": VELT_AUTH_TOKEN },
    body: JSON.stringify({ userId, userProperties: { organizationId } }),
  });
};
```

**Correct (server-side token generation):**

**Step 1: Enable JWT and get an Auth Token**

1. In the Velt Console (Dashboard → Config → General), enable the "Require JWT Token" toggle. JWT tokens won't work until this is on.
2. Generate an Auth Token in the Console's "Auth Token" section.
3. Store it in server-side environment variables only.

**Step 2: Create Backend Endpoint (Next.js API Route)**

```typescript
// app/api/velt/token/route.ts
import { NextRequest, NextResponse } from "next/server";

const VELT_API_KEY = process.env.NEXT_PUBLIC_VELT_API_KEY!;
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    // Validate the caller's app session here before issuing a token
    const { userId, organizationId, name, email, isAdmin } = await req.json();

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Missing userId or organizationId' }, { status: 400 });
    }

    if (!VELT_AUTH_TOKEN) {
      return NextResponse.json({ error: 'Server configuration error: missing VELT_AUTH_TOKEN' }, { status: 500 });
    }

    const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-velt-api-key": VELT_API_KEY,
        "x-velt-auth-token": VELT_AUTH_TOKEN,
      },
      // Body must be wrapped in a top-level `data` object.
      // organizationId belongs in permissions.resources[], not userProperties.
      body: JSON.stringify({
        data: {
          userId,
          userProperties: {
            name,
            email,
            isAdmin: typeof isAdmin === "boolean" ? isAdmin : false,
          },
          permissions: {
            resources: [{ type: "organization", id: organizationId }],
          },
        },
      }),
    });

    const json = await response.json();
    const token = json?.result?.data?.token;

    if (!response.ok || !token) {
      return NextResponse.json(
        { error: json?.error?.message || "Failed to generate token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Step 3: Set Environment Variables**

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_VELT_API_KEY=your-api-key-from-console
VELT_AUTH_TOKEN=your-auth-token-from-console
```

**Step 4: Call from Frontend**

```jsx
// In your authProvider.generateToken function
const generateToken = async () => {
  const response = await fetch("/api/velt/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.userId,
      organizationId: user.organizationId,
      name: user.name,
      email: user.email,
    }),
    cache: "no-store",
  });

  const { token } = await response.json();
  return token;
};
```

**Alternative: Node backend SDK (`@veltdev/node` 2.x):**

```typescript
import { VeltSDK } from "@veltdev/node";

// REST API mode: no database block needed
const sdk = VeltSDK.initialize({
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});

const res = await sdk.api.accessControl.generateToken({
  userId: "user-123",
  userProperties: { name: "John Doe", email: "john@example.com", isAdmin: false },
  permissions: {
    resources: [{ type: "organization", id: "org-abc" }],
  },
});
const token = res.result.data.token;
```

`sdk.api.accessControl.generateToken` calls the same `/v2/auth/generate_token` endpoint and returns the raw `{ result: { status, message, data: { token } } }` envelope. The Python SDK (`velt-py`) exposes the same `sdk.api.accessControl.generateToken`.

**Express.js Backend Example:**

```javascript
// server.js
const express = require("express");
const app = express();
app.use(express.json());

const VELT_API_KEY = process.env.VELT_API_KEY;
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN;

app.post("/api/velt/token", async (req, res) => {
  const { userId, organizationId, name, email, isAdmin } = req.body;

  if (!userId || !organizationId) {
    return res.status(400).json({ error: "Missing userId or organizationId" });
  }

  // Validate user authentication here

  const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-velt-api-key": VELT_API_KEY,
      "x-velt-auth-token": VELT_AUTH_TOKEN,
    },
    body: JSON.stringify({
      data: {
        userId,
        userProperties: { name, email, isAdmin: Boolean(isAdmin) },
        permissions: {
          resources: [{ type: "organization", id: organizationId }],
        },
      },
    }),
  });

  const json = await response.json();
  const token = json?.result?.data?.token;

  if (!response.ok || !token) {
    return res.status(500).json({ error: json?.error?.message || "Failed to generate token" });
  }

  res.json({ token });
});
```

**API Request/Response:**

```text
POST https://api.velt.dev/v2/auth/generate_token
Headers:
  Content-Type: application/json
  x-velt-api-key: YOUR_API_KEY
  x-velt-auth-token: YOUR_AUTH_TOKEN

Body:
{
  "data": {
    "userId": "user-123",
    "userProperties": {
      "name": "John Doe",
      "email": "user@example.com",
      "isAdmin": false
    },
    "permissions": {
      "resources": [
        { "type": "organization", "id": "org-abc", "accessRole": "editor" },
        { "type": "document", "id": "doc-456", "organizationId": "org-abc", "accessRole": "viewer" }
      ]
    }
  }
}

Response:
{
  "result": {
    "status": "success",
    "message": "Token generated successfully.",
    "data": { "token": "eyJhbGciOiJS..." }
  }
}
```

**Permissions in the token:**
- `resources[].type`: `"organization"`, `"folder"`, or `"document"`. `organizationId` is required on folder and document resources.
- `accessRole`: `"editor"` (default, read/write) or `"viewer"` (read-only). It can only be set through the token or the v2 Users / Auth Permissions REST APIs; frontend SDK methods cannot change it.
- `expiresAt`: optional Unix timestamp for a temporary grant.
- If you set `isAdmin: true` on the SDK `User`, the token must also carry `isAdmin: true`.

**Verification:**
- [ ] Endpoint is `https://api.velt.dev/v2/auth/generate_token` (POST)
- [ ] Request body is wrapped in `data`, and `organizationId` is a `permissions.resources[]` entry
- [ ] VELT_AUTH_TOKEN is only on the server (not in the client bundle)
- [ ] .env.local is in .gitignore
- [ ] Token endpoint validates the user session before generating a token
- [ ] "Require JWT Token" is enabled in the Console for production

**Source Pointers:**
- `https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens` - JWT Authentication Tokens (Steps 1 to 3)
- `https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token` - Generate Token (body, permissions, 48h expiry)
- `https://docs.velt.dev/backend-sdks/node#generatetoken` - `sdk.api.accessControl.generateToken`
- `https://docs.velt.dev/security/auth-tokens` - Generating Auth Tokens
