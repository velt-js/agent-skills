---
title: Secure Auth Tokens on Server Side
impact: HIGH
impactDescription: Auth token exposure enables unauthorized JWT generation
tags: authtoken, security, serverside, environment, jwt, x-velt-auth-token, generate_token
---

## Secure Auth Tokens on Server Side

The Velt Auth Token authorizes backend calls to Velt's REST APIs, including JWT generation. It must NEVER be exposed to the client. Store it in server-side environment variables only and send it as the `x-velt-auth-token` header from your server.

**Incorrect (auth token in client code):**

```jsx
// CRITICAL SECURITY ISSUE: Auth token exposed to browser
"use client";

const VELT_AUTH_TOKEN = "bd4d5226050470b6c658054fcdf1092a";

async function generateToken() {
  // This code runs in the browser - token is visible!
  const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
    method: "POST",
    headers: {
      "x-velt-auth-token": VELT_AUTH_TOKEN,  // Exposed!
    },
  });
}
```

**Incorrect (auth token in public env var):**

```bash
# .env.local - WRONG: NEXT_PUBLIC_ prefix makes it client-accessible
NEXT_PUBLIC_VELT_AUTH_TOKEN=bd4d5226050470b6c658054fcdf1092a
```

**Correct (server-side only):**

```bash
# .env.local - No NEXT_PUBLIC_ prefix = server-only
NEXT_PUBLIC_VELT_API_KEY=your-api-key
VELT_AUTH_TOKEN=your-auth-token-from-console
```

```typescript
// app/api/velt/token/route.ts - Server-side only
import { NextRequest, NextResponse } from "next/server";

// The API key is client-safe; the auth token is only readable on the server
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

    // Body must be wrapped in `data`; organizationId goes in permissions.resources
    const body = {
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
    };

    const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-velt-api-key": VELT_API_KEY,
        "x-velt-auth-token": VELT_AUTH_TOKEN,  // Safe: server-side only
      },
      body: JSON.stringify(body),
    });

    const json = await response.json();
    const token = json?.result?.data?.token;

    if (!response.ok || !token) {
      return NextResponse.json({ error: json?.error?.message || "Failed to generate token" }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Key vs Token Security:**

| Credential | Client-Safe? | Purpose | Prefix |
|------------|--------------|---------|--------|
| API Key | Yes (restricted by Managed Domains) | Identifies your app | NEXT_PUBLIC_VELT_API_KEY |
| Auth Token | NO | Authorizes REST API calls, generates JWT tokens | VELT_AUTH_TOKEN (no NEXT_PUBLIC_) |

**Environment Variable Naming:**

```bash
# Next.js
VELT_AUTH_TOKEN=secret          # Server-only (correct)
NEXT_PUBLIC_VELT_API_KEY=key    # Client-accessible (OK for API key)

# Vite
VELT_AUTH_TOKEN=secret          # Server-only (correct)
VITE_VELT_API_KEY=key           # Client-accessible (OK for API key)

# Create React App
VELT_AUTH_TOKEN=secret          # Server-only (if using backend)
REACT_APP_VELT_API_KEY=key      # Client-accessible (OK for API key)
```

**Security Checklist:**

| Check | Status |
|-------|--------|
| Auth token not in any NEXT_PUBLIC_ variable | Required |
| Auth token not imported in any client component | Required |
| Auth token only used in API routes/server actions | Required |
| .env files in .gitignore | Required |
| Token endpoint validates user session | Recommended |
| Auth token rotated periodically (auth tokens are long-lived) | Recommended |

**What Happens If Auth Token Is Exposed:**

An attacker with your auth token can:
- Generate JWT tokens for any user
- Impersonate users in your application
- Access/modify collaboration data through the REST APIs
- Potentially cause data breaches

**Verification:**
- [ ] Auth token only in server-side env vars (no NEXT_PUBLIC_)
- [ ] Auth token only used in API routes or server actions
- [ ] .env.local and .env files are in .gitignore
- [ ] Network tab doesn't show auth token in any request from browser
- [ ] Token generation endpoint validates user session

**Source Pointers:**
- `https://docs.velt.dev/security/auth-tokens` - Generating Auth Tokens
- `https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens` - JWT Authentication Tokens (Step 2: Generate Auth Token)
- `https://docs.velt.dev/get-started/quickstart` - Step 2: Get Your API Key (note on API key vs Auth Token)
