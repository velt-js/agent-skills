---
title: Generate JWT Tokens from Backend
impact: CRITICAL
impactDescription: Required for production security - tokens must be server-generated
tags: jwt, token, backend, api, security, authentication
---

## Generate JWT Tokens from Backend

JWT tokens for Velt must be generated on your server, not in the browser. This requires calling the Velt token API with your auth token (which must remain secret).

**Incorrect (client-side token generation):**

```jsx
// WRONG: Auth token exposed in client-side code
const VELT_AUTH_TOKEN = "bd4d5226...";  // Never do this!

const generateToken = async () => {
  const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
    headers: {
      "x-velt-auth-token": VELT_AUTH_TOKEN,  // Exposed to users!
    },
  });
};
```

**Correct (server-side token generation):**

**Step 1: Create Backend Endpoint (Next.js API Route)**

```typescript
// app/api/velt/token/route.ts
import { NextRequest, NextResponse } from "next/server";

// These should be environment variables
const VELT_API_KEY = process.env.NEXT_PUBLIC_VELT_API_KEY!;
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    const { userId, organizationId, email, isAdmin } = await req.json();

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Missing userId or organizationId' }, { status: 400 });
    }

    if (!VELT_AUTH_TOKEN) {
      return NextResponse.json({ error: 'Server configuration error: missing VELT_AUTH_TOKEN' }, { status: 500 });
    }

    // Body structure with data wrapper (required by Velt API)
    const body = {
      data: {
        userId,
        userProperties: {
          organizationId,
          ...(typeof isAdmin === "boolean" ? { isAdmin } : {}),
          ...(email ? { email } : {}),
        },
      },
    };

    const response = await fetch("https://api.velt.dev/v2/auth/token/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-velt-api-key": VELT_API_KEY,
        "x-velt-auth-token": VELT_AUTH_TOKEN,
      },
      body: JSON.stringify(body),
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

**Step 2: Set Environment Variables**

```bash
# .env.local (never commit this file)
VELT_API_KEY=your-api-key-from-console
VELT_AUTH_TOKEN=your-auth-token-from-console
```

**Step 3: Call from Frontend**

```jsx
// In your authProvider.generateToken function
const generateToken = async () => {
  const response = await fetch("/api/velt/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.userId,
      organizationId: user.organizationId,
      email: user.email,
    }),
    cache: "no-store",
  });

  const { token } = await response.json();
  return token;
};
```

**Express.js Backend Example:**

```javascript
// server.js
const express = require("express");
const app = express();

const VELT_API_KEY = process.env.VELT_API_KEY;
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN;

app.post("/api/velt/token", async (req, res) => {
  const { userId, organizationId, email, isAdmin } = req.body;

  if (!userId || !organizationId) {
    return res.status(400).json({ error: "Missing userId or organizationId" });
  }

  // Validate user authentication here

  const response = await fetch("https://api.velt.dev/v2/auth/token/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-velt-api-key": VELT_API_KEY,
      "x-velt-auth-token": VELT_AUTH_TOKEN,
    },
    body: JSON.stringify({
      data: {
        userId,
        userProperties: {
          organizationId,
          ...(email ? { email } : {}),
          ...(typeof isAdmin === "boolean" ? { isAdmin } : {}),
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

**Getting the Auth Token:**

1. Go to https://console.velt.dev
2. Navigate to Dashboard → Config → General
3. Enable "Require JWT Token" toggle
4. Copy the Auth Token from the "Auth Token" section
5. Store securely in server-side environment variables

**API Request/Response:**

```typescript
// Request to Velt API
POST https://api.velt.dev/v2/auth/token/get
Headers:
  Content-Type: application/json
  x-velt-api-key: YOUR_API_KEY
  x-velt-auth-token: YOUR_AUTH_TOKEN

Body:
{
  "data": {
    "userId": "user-123",
    "userProperties": {
      "organizationId": "org-abc",
      "email": "user@example.com",
      "isAdmin": false
    }
  }
}

// Response
{
  "result": {
    "data": {
      "token": "eyJhbGciOiJS..."
    }
  }
}
```

**Verification:**
- [ ] VELT_AUTH_TOKEN is only on server (not in client bundle)
- [ ] .env.local is in .gitignore
- [ ] Token endpoint validates user session before generating token
- [ ] API returns valid JWT token
- [ ] No auth token visible in browser network tab

**Source Pointers:**
- `https://docs.velt.dev/get-started/advanced` - JWT Authentication Tokens
