---
title: Configure VeltProvider with API Key and Auth
impact: CRITICAL
impactDescription: SDK will not function without VeltProvider wrapping the app
tags: provider, veltprovider, apikey, authprovider, react, nextjs
---

## Configure VeltProvider with API Key and Auth

VeltProvider must wrap your React/Next.js application and be configured with your API key. For production, also configure the authProvider for JWT authentication.

**Incorrect (missing configuration):**

```jsx
// Missing VeltProvider - Velt features won't work
export default function App() {
  return (
    <div>
      <VeltComments />  {/* Error: Velt components need VeltProvider */}
    </div>
  );
}
```

**Incorrect (provider in wrong location):**

```jsx
// Wrong: VeltProvider in layout.tsx (server component in Next.js)
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <VeltProvider apiKey="YOUR_KEY">  {/* Error in Next.js App Router */}
          {children}
        </VeltProvider>
      </body>
    </html>
  );
}
```

**Correct (development setup):**

```jsx
"use client";

import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_VELT_API_KEY">
      <VeltComments />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**Correct (production setup with authProvider):**

```jsx
"use client";

import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  // User from your app's auth system
  const user = {
    userId: "user-123",
    organizationId: "org-abc",
    name: "John Doe",
    email: "john@example.com",
  };

  const authProvider = {
    user,
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      // Fetch JWT from your backend
      const resp = await fetch("/api/velt/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          organizationId: user.organizationId,
        }),
      });
      const { token } = await resp.json();
      return token;
    },
  };

  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={authProvider}
    >
      <VeltComments />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**VeltProvider Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| apiKey | string | Yes | API key from console.velt.dev |
| authProvider | object | Recommended | User + token generator for production |
| dataProviders | object | No | For self-hosting comment data |

**Key Rules:**

1. Place VeltProvider in page component (not layout) for Next.js App Router
2. The file must have `'use client'` directive for Next.js
3. Do not call identify() or setDocument() in the same file as VeltProvider
4. Use child components for authentication and document setup

**Verification:**
- [ ] VeltProvider wraps all Velt components
- [ ] apiKey is set (from console.velt.dev)
- [ ] authProvider configured for production
- [ ] File has 'use client' directive (Next.js App Router)
- [ ] Provider is in page.tsx, not layout.tsx

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 4: Initialize Velt" section
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/app/page.tsx` - VeltProvider placement pattern
