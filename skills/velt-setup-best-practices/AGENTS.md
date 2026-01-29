# Velt Setup Best Practices

**Version 1.0.0**  
Velt  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive setup guide for integrating Velt collaboration SDK into web applications. Covers installation, VeltProvider configuration, user authentication (userId, organizationId, JWT tokens), document initialization (documentId, setDocuments), project folder structure, and debugging patterns. Primary focus on React and Next.js with secondary coverage of Angular, Vue.js, and vanilla HTML. All guidance is evidence-backed from official Velt documentation and sample applications.

---

## Table of Contents

1. [Installation](#1-installation) — **CRITICAL**
   - 1.1 [Install Velt React Packages](#11-install-velt-react-packages)
   - 1.2 [Install Velt Client Package or CDN](#12-install-velt-client-package-or-cdn)

2. [Provider Wiring](#2-provider-wiring) — **CRITICAL**
   - 2.1 [Add 'use client' Directive for Next.js](#21-add-use-client-directive-for-nextjs)
   - 2.2 [Configure VeltProvider with API Key and Auth](#22-configure-veltprovider-with-api-key-and-auth)
   - 2.3 [Initialize Velt in Angular, Vue, and HTML](#23-initialize-velt-in-angular-vue-and-html)

3. [Identity](#3-identity) — **CRITICAL**
   - 3.1 [Configure authProvider on VeltProvider](#31-configure-authprovider-on-veltprovider)
   - 3.2 [Generate JWT Tokens from Backend](#32-generate-jwt-tokens-from-backend)
   - 3.3 [Include organizationId for Access Control](#33-include-organizationid-for-access-control)
   - 3.4 [Structure User Object with Required Fields](#34-structure-user-object-with-required-fields)

4. [Document Identity](#4-document-identity) — **CRITICAL**
   - 4.1 [Attach Metadata to Documents](#41-attach-metadata-to-documents)
   - 4.2 [Generate and Manage Document IDs](#42-generate-and-manage-document-ids)
   - 4.3 [Initialize Documents with setDocuments API](#43-initialize-documents-with-setdocuments-api)

5. [Config](#5-config) — **HIGH**
   - 5.1 [Configure API Key from Console](#51-configure-api-key-from-console)
   - 5.2 [Secure Auth Tokens on Server Side](#52-secure-auth-tokens-on-server-side)
   - 5.3 [Whitelist Domains in Velt Console](#53-whitelist-domains-in-velt-console)

6. [Project Structure](#6-project-structure) — **MEDIUM**
   - 6.1 [Organize Velt Files in components/velt](#61-organize-velt-files-in-componentsvelt)
   - 6.2 [Separate App Auth from Velt Integration](#62-separate-app-auth-from-velt-integration)

7. [Routing Surfaces](#7-routing-surfaces) — **MEDIUM**
   - 7.1 [Create VeltCollaboration Wrapper Component](#71-create-veltcollaboration-wrapper-component)
   - 7.2 [Place Velt UI Components Correctly](#72-place-velt-ui-components-correctly)

8. [Debugging & Testing](#8-debugging-testing) — **LOW-MEDIUM**
   - 8.1 [Troubleshoot Common Configuration Errors](#81-troubleshoot-common-configuration-errors)
   - 8.2 [Verify Velt Setup is Correct](#82-verify-velt-setup-is-correct)

---

## 1. Installation

**Impact: CRITICAL**

Package installation for Velt SDK. Without the correct packages installed, no other Velt functionality will work. Covers @veltdev/react for React/Next.js and @veltdev/client for Angular/Vue/vanilla.

### 1.1 Install Velt React Packages

**Impact: CRITICAL (Required for any Velt functionality in React/Next.js apps)**

The @veltdev/react package is required for React and Next.js applications. It provides the VeltProvider component and all React hooks for Velt functionality.

**Incorrect (missing packages):**

```bash
# Missing required package - Velt features won't work
npm install react react-dom
```

**Correct (with Velt packages):**

```bash
# Install the core Velt React package
npm install @veltdev/react

# Optional: Install TypeScript types for better IDE support
npm install --save-dev @veltdev/types
```

**Using yarn or pnpm:**

```bash
# yarn
yarn add @veltdev/react
yarn add -D @veltdev/types

# pnpm
pnpm add @veltdev/react
pnpm add -D @veltdev/types
```

---

### 1.2 Install Velt Client Package or CDN

**Impact: CRITICAL (Required for any Velt functionality in Angular, Vue, or vanilla HTML apps)**

For Angular, Vue.js, and vanilla HTML applications, use @veltdev/client (npm) or the CDN script. React/Next.js apps should use @veltdev/react instead.

**Incorrect (using wrong package):**

```bash
# Wrong: @veltdev/react is for React only
npm install @veltdev/react  # Don't use this for Angular/Vue/HTML
```

**Correct (Angular/Vue - npm):**

```bash
# Install the client package for Angular or Vue
npm install @veltdev/client

# Optional: TypeScript types
npm install --save-dev @veltdev/types
```

**Correct (Vanilla HTML - CDN):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
  <!-- Load Velt SDK from CDN -->
  <script
    type="module"
    src="https://cdn.velt.dev/lib/sdk@latest/velt.js"
    onload="loadVelt()"
  ></script>
  <script>
    async function loadVelt() {
      // Velt is now available globally
      await Velt.init("YOUR_VELT_API_KEY");
    }
  </script>
</head>
<body>
  <!-- Your app content -->
</body>
</html>
```

**CDN URL Options:**

```html
<!-- Latest version (recommended for development) -->
<script src="https://cdn.velt.dev/lib/sdk@latest/velt.js"></script>

<!-- Specific version (recommended for production) -->
<script src="https://cdn.velt.dev/lib/sdk@4.6.10/velt.js"></script>
```

---

## 2. Provider Wiring

**Impact: CRITICAL**

VeltProvider component setup and initialization. The VeltProvider must wrap your application for any Velt features to function. Includes framework-specific initialization patterns.

### 2.1 Add 'use client' Directive for Next.js

**Impact: CRITICAL (Next.js App Router requires client directive for Velt components)**

Next.js App Router uses Server Components by default. Velt components require client-side JavaScript, so any file containing Velt components must include the `'use client'` directive at the top.

**Incorrect (missing directive):**

```jsx
// app/page.tsx - Error: Velt components can't render in server components
import { VeltProvider, VeltComments } from "@veltdev/react";

export default function Home() {
  return (
    <VeltProvider apiKey="YOUR_KEY">
      <VeltComments />  {/* This will fail */}
    </VeltProvider>
  );
}
```

**Correct (with 'use client'):**

```jsx
// app/page.tsx
"use client";  // MUST be the first line

import { VeltProvider, VeltComments } from "@veltdev/react";

export default function Home() {
  return (
    <VeltProvider apiKey="YOUR_KEY">
      <VeltComments />
    </VeltProvider>
  );
}
```

**Recommended Pattern - Keep Layout as Server Component:**

```jsx
// app/layout.tsx - Server Component (no 'use client')
import { AppProviders } from "@/app/userAuth/AppProviders";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
// app/userAuth/AppProviders.tsx - Client Component
"use client";

import { AppUserProvider } from "./AppUserContext";

export function AppProviders({ children }) {
  return (
    <AppUserProvider>
      {children}
    </AppUserProvider>
  );
}
// app/page.tsx - Client Component with VeltProvider
"use client";

import { VeltProvider } from "@veltdev/react";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";

export default function Home() {
  return (
    <VeltProvider apiKey="YOUR_KEY">
      <VeltCollaboration />
      {/* Page content */}
    </VeltProvider>
  );
}
```

---

### 2.2 Configure VeltProvider with API Key and Auth

**Impact: CRITICAL (SDK will not function without VeltProvider wrapping the app)**

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

---

### 2.3 Initialize Velt in Angular, Vue, and HTML

**Impact: CRITICAL (Required initialization for non-React frameworks)**

For Angular, Vue.js, and vanilla HTML applications, use the `initVelt()` function or `Velt.init()` method instead of VeltProvider. Each framework has specific setup requirements.

**Angular Setup:**

```html
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Required for Velt web components
})
export class AppModule { }
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { initVelt } from '@veltdev/client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  client: any;

  async ngOnInit() {
    // Initialize Velt client
    this.client = await initVelt('YOUR_VELT_API_KEY');

    // Authenticate user (see identity rules)
    const user = {
      userId: 'user-123',
      organizationId: 'org-abc',
      name: 'John Doe',
      email: 'john@example.com',
    };
    await this.client.identify(user);

    // Set document (see document rules)
    await this.client.setDocument('my-document-id');
  }
}
<!-- app.component.html -->
<div>
  <h1>My Collaborative App</h1>
  <velt-comments></velt-comments>
  <velt-presence></velt-presence>
  <!-- Your app content -->
</div>
```

**Step 2: Initialize Velt in Component**
**Step 3: Use Velt Components in Template**
---

**Vue.js Setup:**

```vue
// main.js (Vue 2)
import Vue from 'vue';
import App from './App.vue';

Vue.config.ignoredElements = [/velt-*/];  // Tell Vue to ignore velt-* elements

new Vue({
  render: h => h(App),
}).$mount('#app');
// main.js (Vue 3)
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('velt-');
app.mount('#app');
<!-- App.vue -->
<script>
import { initVelt } from '@veltdev/client';

export default {
  name: 'App',
  data() {
    return {
      client: null
    }
  },
  async mounted() {
    // Initialize Velt client
    this.client = await initVelt('YOUR_VELT_API_KEY');

    // Authenticate user
    const user = {
      userId: 'user-123',
      organizationId: 'org-abc',
      name: 'John Doe',
      email: 'john@example.com',
    };
    await this.client.identify(user);

    // Set document
    await this.client.setDocument('my-document-id');
  }
}
</script>

<template>
  <div id="app">
    <velt-comments></velt-comments>
    <velt-presence></velt-presence>
    <!-- Your app content -->
  </div>
</template>
```

**Step 2: Initialize Velt in Component**
---

**Vanilla HTML Setup:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Collaborative App</title>
  <script
    type="module"
    src="https://cdn.velt.dev/lib/sdk@latest/velt.js"
    onload="loadVelt()"
  ></script>
  <script>
    async function loadVelt() {
      // Initialize Velt
      await Velt.init("YOUR_VELT_API_KEY");

      // Authenticate user
      const user = {
        userId: "user-123",
        organizationId: "org-abc",
        name: "John Doe",
        email: "john@example.com",
      };
      await Velt.identify(user);

      // Set document
      await Velt.setDocument('my-document-id');
    }
  </script>
</head>
<body>
  <h1>My Collaborative App</h1>
  <velt-comments></velt-comments>
  <velt-presence></velt-presence>
</body>
</html>
```

---

## 3. Identity

**Impact: CRITICAL**

User authentication and identity mapping. Velt requires authenticated users with userId and organizationId. Covers user object shape, authProvider configuration, and JWT token generation.

### 3.1 Configure authProvider on VeltProvider

**Impact: CRITICAL (Recommended authentication method for production apps)**

The authProvider prop on VeltProvider is the recommended way to authenticate users. It provides automatic token refresh and proper error handling for production applications.

**Incorrect (development-only approach):**

```jsx
// Using useIdentify without tokens - OK for dev, insecure for prod
"use client";
import { VeltProvider, useIdentify } from "@veltdev/react";

function AuthComponent() {
  const user = { userId: "123", organizationId: "org", name: "John", email: "j@e.com" };
  useIdentify(user);  // No JWT token - development only
  return null;
}

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_KEY">
      <AuthComponent />
    </VeltProvider>
  );
}
```

**Correct (production with authProvider):**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

export default function App() {
  // User from your app's auth system
  const user = {
    userId: "user-123",
    organizationId: "org-abc",
    name: "John Doe",
    email: "john@example.com",
  };

  const authProvider = {
    // The user object to authenticate
    user,

    // Retry configuration for token generation
    retryConfig: {
      retryCount: 3,
      retryDelay: 1000,  // milliseconds
    },

    // Function to generate JWT token from your backend
    generateToken: async () => {
      const response = await fetch("/api/velt/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          organizationId: user.organizationId,
          email: user.email,
        }),
      });
      const { token } = await response.json();
      return token;  // Return the JWT string
    },
  };

  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={authProvider}
    >
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**Extracting to Custom Hook (Recommended Pattern):**

```jsx
// components/velt/VeltInitializeUser.tsx
"use client";
import { useMemo } from "react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/AppUserContext";

// Call your backend API to generate a JWT token for the user
async function getVeltJwtFromBackend(user: {
  userId: string;
  organizationId: string;
  email?: string;
}) {
  const resp = await fetch("/api/velt/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.userId,
      organizationId: user.organizationId,
      email: user.email,
      isAdmin: false,
    }),
    cache: "no-store",  // Don't cache token requests
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Token API failed: ${err?.error || resp.statusText}`);
  }
  const { token } = await resp.json();
  if (!token) throw new Error("No token in response");
  return token as string;
}

export function useVeltAuthProvider() {
  const { user } = useAppUser();

  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;

    return {
      user,
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        return await getVeltJwtFromBackend({
          userId: user.userId as string,
          organizationId: user.organizationId as string,
          email: user.email,
        });
      },
    };
  }, [user]);

  return { authProvider };
}
```

**Using the Custom Hook:**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";

export default function Home() {
  const { authProvider } = useVeltAuthProvider();

  // Don't render VeltProvider until authProvider is ready
  if (!authProvider) {
    return <div>Loading...</div>;
  }

  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={authProvider}
    >
      {/* Your app content */}
    </VeltProvider>
  );
}
```

---

### 3.2 Generate JWT Tokens from Backend

**Impact: CRITICAL (Required for production security - tokens must be server-generated)**

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

```jsx
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
# .env.local (never commit this file)
VELT_API_KEY=your-api-key-from-console
VELT_AUTH_TOKEN=your-auth-token-from-console
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

**Step 2: Set Environment Variables**
**Step 3: Call from Frontend**

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

---

### 3.3 Include organizationId for Access Control

**Impact: CRITICAL (Required for document isolation between organizations/tenants)**

The organizationId field is required in the user object and controls which documents users can access. By default, users can only see documents created within their organization.

**Incorrect (missing organizationId):**

```jsx
// Missing organizationId - users may see documents from other orgs
const user = {
  userId: "user-123",
  name: "John Doe",
  email: "john@example.com",
  // organizationId missing!
};

await client.identify(user);  // Access control won't work properly
```

**Incorrect (hardcoded for all users):**

```jsx
// Same organizationId for all users - no tenant isolation
const user = {
  userId: currentUser.id,
  organizationId: "default",  // All users in same org!
  name: currentUser.name,
  email: currentUser.email,
};
```

**Correct (organization scoped):**

```jsx
// Each organization has its own isolated document space
const user = {
  userId: currentUser.id,
  organizationId: currentUser.organizationId,  // From your auth system
  name: currentUser.name,
  email: currentUser.email,
};

await client.identify(user);
```

**Multi-Tenant Patterns:**

```jsx
// User has organization membership in your database
async function getUserWithOrg(userId) {
  const user = await db.users.findById(userId);
  const membership = await db.orgMemberships.findByUserId(userId);

  return {
    userId: user.id,
    organizationId: membership.organizationId,
    name: user.name,
    email: user.email,
  };
}
// Organization determined by subdomain: acme.yourapp.com
function getOrgFromSubdomain() {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  return subdomain;  // "acme"
}

const user = {
  userId: currentUser.id,
  organizationId: getOrgFromSubdomain(),
  name: currentUser.name,
  email: currentUser.email,
};
// Organization in URL: /org/acme/documents/123
// Next.js App Router
function Page({ params }) {
  const { orgId } = params;

  const user = {
    userId: currentUser.id,
    organizationId: orgId,
    name: currentUser.name,
    email: currentUser.email,
  };
}
```

**Pattern 2: Organization from URL/Subdomain**
**Pattern 3: Organization from Route Parameter**

**Cross-Organization Access:**

```typescript
// In your JWT token generation endpoint
const body = {
  userId,
  userProperties: {
    isAdmin: false,
  },
  permissions: {
    resources: [
      { type: "organization", id: organizationId },
      // Add cross-org access if needed
      { type: "document", id: "shared-doc-123" },
    ],
  },
};
```

---

### 3.4 Structure User Object with Required Fields

**Impact: CRITICAL (Authentication will fail without correct user object structure)**

The user object passed to Velt's identify method must include specific required fields. Missing or incorrect fields will cause authentication failures.

**Incorrect (missing required fields):**

```jsx
// Missing organizationId - will cause access control issues
const user = {
  userId: "user-123",
  name: "John Doe",
  email: "john@example.com",
};

// Missing userId - authentication will fail
const user = {
  organizationId: "org-abc",
  name: "John Doe",
};
```

**Correct (all required fields):**

```jsx
const user = {
  // Required fields
  userId: "user-123",           // Unique identifier for this user
  organizationId: "org-abc",    // Organization/workspace scope
  name: "John Doe",             // Display name for avatars and mentions
  email: "john@example.com",    // Email for notifications

  // Optional fields
  photoUrl: "https://example.com/avatar.jpg",  // Avatar image URL
  color: "#FF6B6B",             // Custom avatar background color
  textColor: "#FFFFFF",         // Custom avatar text color
};
```

**Mapping from Common Auth Providers:**

```jsx
// Firebase Auth
const firebaseUser = auth.currentUser;
const user = {
  userId: firebaseUser.uid,
  organizationId: "your-org-id",  // From your database
  name: firebaseUser.displayName,
  email: firebaseUser.email,
  photoUrl: firebaseUser.photoURL,
};

// Auth0
const auth0User = await auth0.getUser();
const user = {
  userId: auth0User.sub,
  organizationId: auth0User['https://your-app.com/org_id'],
  name: auth0User.name,
  email: auth0User.email,
  photoUrl: auth0User.picture,
};

// NextAuth.js
const session = await getSession();
const user = {
  userId: session.user.id,
  organizationId: session.user.organizationId,
  name: session.user.name,
  email: session.user.email,
  photoUrl: session.user.image,
};
```

**Using the User Object:**

```jsx
// React with authProvider (recommended)
<VeltProvider
  apiKey="YOUR_KEY"
  authProvider={{
    user,
    generateToken: async () => { /* ... */ },
  }}
>

// React with useIdentify hook
import { useIdentify } from '@veltdev/react';
useIdentify(user);

// Angular/Vue/HTML
await client.identify(user);
```

---

## 4. Document Identity

**Impact: CRITICAL**

Document initialization with setDocuments API. Documents define collaborative spaces where users can interact. SDK will not function without calling setDocument.

### 4.1 Attach Metadata to Documents

**Impact: MEDIUM-HIGH (Metadata enables document names in UI and custom filtering)**

Document metadata allows you to store additional information like document names, which appear in Velt UI components. Metadata can also be used for filtering and organization.

**Incorrect (no metadata):**

```jsx
// Missing metadata - document name won't appear in UI
setDocuments([{ id: "doc-123" }]);

// In VeltCommentsSidebar, document shows as "doc-123" instead of friendly name
```

**Correct (with metadata):**

```jsx
setDocuments([
  {
    id: "doc-123",
    metadata: {
      documentName: "Q4 Marketing Plan",  // Shown in UI components
    },
  },
]);
```

**Full Metadata Example:**

```jsx
setDocuments([
  {
    id: "project-456",
    metadata: {
      // Standard field - used by Velt UI components
      documentName: "Website Redesign Project",

      // Custom fields - available for filtering/display
      projectType: "design",
      createdBy: "user-123",
      department: "marketing",
      priority: "high",
      createdAt: new Date().toISOString(),
    },
  },
]);
```

**Accessing Metadata:**

```jsx
// Access document metadata in your app
import { useDocument } from "@veltdev/react";

function DocumentHeader() {
  const document = useDocument();

  return (
    <div>
      <h1>{document?.metadata?.documentName || "Untitled"}</h1>
      <span>Type: {document?.metadata?.projectType}</span>
    </div>
  );
}
```

**Metadata in Multi-Document Setup:**

```jsx
// Subscribe to multiple documents with different metadata
setDocuments([
  {
    id: "project-main",
    metadata: { documentName: "Main Project", type: "project" },
  },
  {
    id: "project-tasks",
    metadata: { documentName: "Task List", type: "tasks" },
  },
  {
    id: "project-notes",
    metadata: { documentName: "Team Notes", type: "notes" },
  },
]);
```

**Dynamic Metadata from Database:**

```jsx
// Fetch document info from your database
async function loadDocument(docId: string) {
  const doc = await db.documents.findById(docId);

  setDocuments([
    {
      id: docId,
      metadata: {
        documentName: doc.title,
        createdBy: doc.authorId,
        lastModified: doc.updatedAt,
        permissions: doc.permissions,
      },
    },
  ]);
}
```

---

### 4.2 Generate and Manage Document IDs

**Impact: CRITICAL (Document ID determines which users see the same collaborative content)**

The document ID uniquely identifies a collaborative space. All users with the same document ID will see the same comments, presence, and collaboration data. Choose a strategy that makes documents shareable.

**Incorrect (random on every page load):**

```jsx
// Wrong: New ID every time - no collaboration possible
const documentId = Math.random().toString(36);

useSetDocument(documentId);  // Each user gets their own space
```

**Incorrect (hardcoded single value):**

```jsx
// Wrong: All users share one document
const documentId = "my-app-document";

useSetDocument(documentId);  // Everyone collaborates on the same doc
```

**Correct (URL-based with persistence):**

```jsx
// app/document/useCurrentDocument.ts
"use client";
import { useState, useEffect, useRef, useMemo } from "react";

interface CurrentDocument {
  documentId: string | null;
  documentName: string;
}

export function useCurrentDocument(): CurrentDocument {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    // 1. Check URL for documentId parameter first (enables sharing)
    const urlParams = new URLSearchParams(window.location.search);
    let docId = urlParams.get("documentId");

    if (docId) {
      // URL has documentId - use it and persist
      setDocumentId(docId);
      localStorage.setItem("app-document-id", docId);
    } else {
      // 2. Check localStorage for existing document
      const stored = localStorage.getItem("app-document-id");
      if (stored) {
        docId = stored;
      } else {
        // 3. Generate new document ID
        docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("app-document-id", docId);
      }

      // Update URL with documentId for shareability
      const newUrl = `${window.location.pathname}?documentId=${docId}`;
      window.history.replaceState({}, "", newUrl);

      setDocumentId(docId);
    }

    isInitialized.current = true;
  }, []);

  return useMemo(
    () => ({
      documentId,
      documentName: "My Collaborative Document",
    }),
    [documentId]
  );
}
```

**Route-Based Pattern (Next.js):**

```jsx
// app/documents/[docId]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useSetDocument } from "@veltdev/react";

export default function DocumentPage() {
  const { docId } = useParams();

  // Document ID comes from URL route
  useSetDocument(docId as string, { documentName: `Document ${docId}` });

  return <div>Document content</div>;
}
```

**Database-Backed Pattern:**

```jsx
// When creating a new document in your app
async function createDocument(name: string) {
  // Create document in your database
  const doc = await db.documents.create({ name });

  // Return the database ID to use as Velt documentId
  return doc.id;  // e.g., "clx123abc..."
}

// When loading a document
function DocumentEditor({ documentId }) {
  useSetDocument(documentId);  // Use your database ID

  return <Editor />;
}
```

**Multi-Document Pattern (Different Surfaces):**

```jsx
// Different document IDs for different collaboration surfaces
function Dashboard() {
  const { projectId } = useParams();

  // Main project document
  useSetDocument(`project-${projectId}`, { documentName: "Project" });

  return (
    <div>
      {/* Comments on main content use project-${projectId} */}
      <ProjectContent />

      {/* Separate document for chat sidebar */}
      <ChatSidebar documentId={`project-${projectId}-chat`} />
    </div>
  );
}
```

---

### 4.3 Initialize Documents with setDocuments API

**Impact: CRITICAL (SDK will not function without calling setDocuments)**

The setDocuments method initializes collaborative spaces where users can interact. The SDK will NOT work without calling setDocuments - no comments, presence, or other features will function.

**Incorrect (missing setDocuments):**

```jsx
// Missing setDocuments - Velt features won't work
"use client";
import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_KEY" authProvider={authProvider}>
      <VeltComments />  {/* Won't work - no document set */}
      <div>My content</div>
    </VeltProvider>
  );
}
```

**Incorrect (setDocuments in same file as VeltProvider):**

```jsx
// Wrong: Don't call setDocuments in the same component as VeltProvider
"use client";
import { VeltProvider, useVeltClient } from "@veltdev/react";

export default function App() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      client.setDocuments([{ id: "doc-123" }]);  // Won't work - client not ready
    }
  }, [client]);

  return <VeltProvider apiKey="YOUR_KEY">...</VeltProvider>;
}
```

**Correct (separate component):**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { VeltInitializeDocument } from "@/components/velt/VeltInitializeDocument";

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_KEY" authProvider={authProvider}>
      <VeltInitializeDocument />
      {/* Your app content */}
    </VeltProvider>
  );
}
// components/velt/VeltInitializeDocument.tsx
"use client";
import { useEffect } from "react";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";
import { useCurrentDocument } from "@/app/document/useCurrentDocument";
import { useAppUser } from "@/app/userAuth/useAppUser";

export default function VeltInitializeDocument() {
  const { documentId, documentName } = useCurrentDocument();
  const { user } = useAppUser();

  // Get document setter hook
  const { setDocuments } = useSetDocuments();

  // Wait for Velt user to be authenticated before setting document
  const veltUser = useCurrentUser();

  // Set document in Velt. This is the resource where all Velt collaboration data will be scoped.
  useEffect(() => {
    if (!veltUser || !user || !documentId || !documentName) return;
    setDocuments([
      { id: documentId, metadata: { documentName: documentName } },
    ]);
  }, [veltUser, user, setDocuments, documentId, documentName]);

  return null;
}
```

**Using useSetDocument Hook (Alternative):**

```jsx
import { useSetDocument } from "@veltdev/react";

// Single document shorthand
useSetDocument("my-document-id", { documentName: "My Document" });
```

**setDocuments API Reference:**

```typescript
// Method signature
client.setDocuments(documents: DocumentConfig[]): void;

// DocumentConfig shape
interface DocumentConfig {
  id: string;              // Required: unique document identifier
  metadata?: {             // Optional: document metadata
    documentName?: string;
    [key: string]: any;    // Custom metadata fields
  };
}
```

**Multiple Documents:**

```jsx
// Subscribe to multiple documents at once
setDocuments([
  { id: "doc-1", metadata: { documentName: "Document 1" } },
  { id: "doc-2", metadata: { documentName: "Document 2" } },
  { id: "doc-3", metadata: { documentName: "Document 3" } },
]);
```

**Angular/Vue/HTML Pattern:**

```javascript
// After initVelt() and identify()
await client.setDocuments([
  { id: "unique-document-id", metadata: { documentName: "My Document" } }
]);

// Or for HTML
await Velt.setDocuments([
  { id: "unique-document-id", metadata: { documentName: "My Document" } }
]);
```

---

## 5. Config

**Impact: HIGH**

API keys, environment variables, and security configuration. Includes console.velt.dev setup, domain whitelisting, and auth token security practices.

### 5.1 Configure API Key from Console

**Impact: HIGH (API key is required for all Velt functionality)**

Your Velt API key is required to initialize the SDK. Get it from console.velt.dev and configure it in VeltProvider or initVelt().

**Incorrect (missing or invalid API key):**

```jsx
// Missing API key - SDK won't initialize
<VeltProvider>
  <App />
</VeltProvider>

// Invalid/expired API key
<VeltProvider apiKey="invalid-key-here">
  <App />
</VeltProvider>
```

**Correct (with valid API key):**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

// API key from console.velt.dev
const VELT_API_KEY = "YOUR_VELT_API_KEY";

export default function App() {
  return (
    <VeltProvider apiKey={VELT_API_KEY}>
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**Environment Variable Pattern (Recommended):**

```bash
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";

export default function App() {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}>
      {/* Your app content */}
    </VeltProvider>
  );
}
# .env.local
NEXT_PUBLIC_VELT_API_KEY=your-api-key-from-console
```

**Angular/Vue/HTML:**

```html
// Angular/Vue with @veltdev/client
import { initVelt } from "@veltdev/client";

const client = await initVelt("YOUR_VELT_API_KEY");
<!-- HTML with CDN -->
<script>
async function loadVelt() {
  await Velt.init("YOUR_VELT_API_KEY");
}
</script>
```

**Multiple Environments:**

```bash
# .env.development
NEXT_PUBLIC_VELT_API_KEY=dev-api-key

# .env.production
NEXT_PUBLIC_VELT_API_KEY=prod-api-key
```

---

### 5.2 Secure Auth Tokens on Server Side

**Impact: HIGH (Auth token exposure enables unauthorized JWT generation)**

The Velt Auth Token is used to generate JWT tokens and must NEVER be exposed to the client. Store it in server-side environment variables only.

**Incorrect (auth token in client code):**

```jsx
// CRITICAL SECURITY ISSUE: Auth token exposed to browser
"use client";

const VELT_AUTH_TOKEN = "bd4d5226050470b6c658054fcdf1092a";

async function generateToken() {
  // This code runs in the browser - token is visible!
  const response = await fetch("https://api.velt.dev/v2/auth/token/get", {
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

```typescript
# .env.local - No NEXT_PUBLIC_ prefix = server-only
VELT_API_KEY=your-api-key
VELT_AUTH_TOKEN=your-auth-token-from-console
// app/api/velt/token/route.ts - Server-side only
import { NextRequest, NextResponse } from "next/server";

// These are only accessible on the server
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

    const body = {
      data: {
        userId,
        userProperties: {
          organizationId,
          ...(typeof isAdmin === 'boolean' ? { isAdmin } : {}),
          ...(email ? { email } : {}),
        },
      },
    };

    const response = await fetch("https://api.velt.dev/v2/auth/token/get", {
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

---

### 5.3 Whitelist Domains in Velt Console

**Impact: HIGH (Requests from non-whitelisted domains will be rejected)**

Velt requires you to whitelist the domains where your app runs. Requests from non-whitelisted domains will be rejected for security.

**Incorrect (domain not whitelisted):**

```typescript
Console Error: "Domain not allowed. Please add your domain to the safelist."

The app is running on https://myapp.com but that domain
is not added to Velt Console's Managed Domains list.
```

**Wildcard Patterns:**

```typescript
# If supported:
*.vercel.app
*.netlify.app
*.railway.app

# If not supported, add specific URLs as needed:
my-app-abc123.vercel.app
my-app-def456.vercel.app
```

**Development Setup:**

```typescript
localhost:3000
localhost:3001
127.0.0.1:3000
```

**Next.js Preview Deployments:**

```jsx
// Check current hostname matches a whitelisted domain
if (typeof window !== "undefined") {
  console.log("Current hostname:", window.location.hostname);
}
```

**Debugging Domain Issues:**

```jsx
// Add this temporarily to debug domain issues
useEffect(() => {
  console.log("Current origin:", window.location.origin);
  console.log("Hostname:", window.location.hostname);
  console.log("Port:", window.location.port);
}, []);
```

---

## 6. Project Structure

**Impact: MEDIUM**

Recommended folder organization for Velt-related files. Based on patterns observed in official sample applications. Covers separation of app auth from Velt integration.

### 6.1 Organize Velt Files in components/velt

**Impact: MEDIUM (Consistent folder structure improves maintainability)**

Based on Velt sample applications, organize all Velt-specific components and hooks in a dedicated folder structure. This separates Velt integration from your application logic.

**Incorrect (scattered files):**

```typescript
app/
├── page.tsx          # VeltProvider, identify, setDocument all here
├── components/
│   ├── Header.tsx    # VeltComments mixed in
│   ├── Sidebar.tsx   # VeltPresence mixed in
│   └── Editor.tsx    # More Velt components
└── utils/
    └── auth.ts       # Velt auth mixed with app auth
```

**Correct (organized structure):**

```typescript
app/
├── layout.tsx                    # Server component - wraps AppProviders
├── page.tsx                      # Client component - wraps VeltProvider
├── userAuth/                     # App-level authentication
│   ├── AppProviders.tsx          # Client wrapper for auth providers
│   ├── AppUserContext.tsx        # App user state management
│   └── useAppUser.ts             # Hook to get current app user
├── document/                     # Document ID management
│   ├── useCurrentDocument.ts     # Hook for document ID generation
│   └── DocumentContext.tsx       # Optional: document state context
└── api/
    └── velt/
        └── token/
            └── route.ts          # JWT token generation endpoint

components/
└── velt/                         # All Velt-specific components
    ├── VeltInitializeUser.tsx    # useVeltAuthProvider hook
    ├── VeltInitializeDocument.tsx # Document setup component
    ├── VeltCollaboration.tsx     # Main collaboration wrapper
    ├── VeltTools.tsx             # Optional: tool buttons
    └── ui-customization/
        ├── VeltCustomization.tsx # CSS variable customization
        └── styles.css            # Velt component styling
```

**app/layout.tsx (Server Component):**

```jsx
import { AppProviders } from "@/app/userAuth/AppProviders";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

**app/userAuth/AppProviders.tsx:**

```jsx
"use client";
import { AppUserProvider } from "./AppUserContext";

export function AppProviders({ children }) {
  return (
    <AppUserProvider>
      {children}
    </AppUserProvider>
  );
}
```

**app/page.tsx:**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import DocumentCanvas from "@/components/document/DocumentCanvas";

export default function Home() {
  const { authProvider } = useVeltAuthProvider();

  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider
      apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}
      authProvider={authProvider}
    >
      <VeltCollaboration />
      <DocumentCanvas />
    </VeltProvider>
  );
}
```

**components/velt/VeltCollaboration.tsx:**

```jsx
"use client";
import { useEffect } from "react";
import { VeltComments, VeltCommentsSidebar, useVeltClient } from "@veltdev/react";
import { useAppUser } from "@/app/userAuth/AppUserContext";
import VeltInitializeDocument from "./VeltInitializeDocument";
import { VeltCustomization } from "./ui-customization/VeltCustomization";

export function VeltCollaboration() {
  const { isUserLoggedIn } = useAppUser();
  const { client } = useVeltClient();

  useEffect(() => {
    if (isUserLoggedIn === false && client) {
      client.signOutUser();
    }
  }, [isUserLoggedIn, client]);

  const groupConfig = {
    enable: false
  };

  return (
    <>
      <VeltInitializeDocument />
      <VeltComments shadowDom={false} textMode={false} />
      <VeltCommentsSidebar groupConfig={groupConfig} />
      <VeltCustomization />
    </>
  );
}
```

---

### 6.2 Separate App Auth from Velt Integration

**Impact: MEDIUM (Clean separation enables independent testing and maintenance)**

Keep your application's authentication system separate from Velt integration. Your app owns user authentication; Velt receives user data from your auth system.

**Incorrect (tightly coupled):**

```jsx
// Everything mixed together - hard to maintain
"use client";
import { VeltProvider, useIdentify } from "@veltdev/react";
import { useAuth0 } from "@auth0/auth0-react";

export default function App() {
  const { user, isAuthenticated } = useAuth0();

  // Velt identity directly coupled to Auth0
  useIdentify(isAuthenticated ? {
    userId: user.sub,
    organizationId: user.org_id,
    name: user.name,
    email: user.email,
  } : null);

  return (
    <VeltProvider apiKey="KEY">
      {/* Everything else */}
    </VeltProvider>
  );
}
```

**Correct (separated layers):**

```jsx
// app/userAuth/AppUserContext.tsx - Your app's user management
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";  // Or Firebase, NextAuth, etc.

// Your app's user type
interface AppUser {
  userId: string;
  organizationId: string;
  name: string;
  email: string;
  photoUrl?: string;
}

interface AppUserContextType {
  user: AppUser | undefined;
  isUserLoggedIn: boolean | undefined;
  login: () => void;
  logout: () => void;
}

const AppUserContext = createContext<AppUserContextType | undefined>(undefined);

export function AppUserProvider({ children }) {
  const { user: auth0User, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [user, setUser] = useState<AppUser | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      // Transform auth provider user to your app's user format
      setUser({
        userId: auth0User.sub!,
        organizationId: auth0User["https://myapp.com/org_id"] || "default-org",
        name: auth0User.name!,
        email: auth0User.email!,
        photoUrl: auth0User.picture,
      });
    } else {
      setUser(undefined);
    }
  }, [isAuthenticated, auth0User]);

  return (
    <AppUserContext.Provider
      value={{
        user,
        isUserLoggedIn: isAuthenticated,
        login: loginWithRedirect,
        logout: () => logout({ returnTo: window.location.origin }),
      }}
    >
      {children}
    </AppUserContext.Provider>
  );
}

export function useAppUser() {
  const context = useContext(AppUserContext);
  if (!context) throw new Error("useAppUser must be within AppUserProvider");
  return context;
}
// components/velt/VeltInitializeUser.tsx - Bridge to Velt
"use client";
import { useMemo } from "react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/useAppUser";

export function useVeltAuthProvider() {
  const { user } = useAppUser();  // Get user from your app's auth

  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;

    return {
      user: {
        userId: user.userId,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
      },
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            organizationId: user.organizationId,
            email: user.email,
          }),
        });
        const { token } = await resp.json();
        return token;
      },
    };
  }, [user]);

  return { authProvider };
}
// app/page.tsx - Compose the layers
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { useAppUser } from "@/app/userAuth/useAppUser";

export default function Home() {
  const { isUserLoggedIn, login } = useAppUser();
  const { authProvider } = useVeltAuthProvider();

  // Show login if not authenticated
  if (!isUserLoggedIn) {
    return <button onClick={login}>Sign In</button>;
  }

  // Wait for Velt auth to be ready
  if (!authProvider) {
    return <div>Loading collaboration...</div>;
  }

  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!} authProvider={authProvider}>
      {/* App content with Velt features */}
    </VeltProvider>
  );
}
```

**Layer 2: Velt Auth Integration (components/velt/)**
**Layer 3: App Pages (app/)**

**Data Flow Diagram:**

```typescript
[Auth Provider]     →     [AppUserContext]     →     [VeltAuthProvider]
(Auth0/Firebase)          (Your app's format)        (Velt's format)
     ↓                           ↓                          ↓
   Login                    useAppUser()            VeltProvider
   Logout                   User state              authProvider prop
```

---

## 7. Routing Surfaces

**Impact: MEDIUM**

Where and how to mount Velt UI components in your application. Covers the VeltCollaboration wrapper pattern and component placement best practices.

### 7.1 Create VeltCollaboration Wrapper Component

**Impact: MEDIUM (Centralizes Velt component mounting and lifecycle management)**

Create a single VeltCollaboration component that mounts all necessary Velt components and handles lifecycle events like sign-out. This centralizes Velt UI management.

**Incorrect (scattered Velt components):**

```jsx
// Velt components scattered across multiple files
// app/page.tsx
<VeltProvider apiKey="KEY">
  <Header />  {/* Contains VeltPresence */}
  <Sidebar /> {/* Contains VeltCommentsSidebar */}
  <Editor />  {/* Contains VeltComments */}
</VeltProvider>

// No central place to handle sign-out or initialization
```

**Correct (centralized wrapper):**

```jsx
// components/velt/VeltCollaboration.tsx
"use client";
import { useEffect } from "react";
import {
  VeltComments,
  VeltCommentsSidebar,
  useVeltClient,
} from "@veltdev/react";
import { useAppUser } from "@/app/userAuth/AppUserContext";
import VeltInitializeDocument from "./VeltInitializeDocument";
import { VeltCustomization } from "./ui-customization/VeltCustomization";

export function VeltCollaboration() {
  const { isUserLoggedIn } = useAppUser();
  const { client } = useVeltClient();

  // Handle sign-out when user logs out of your app
  useEffect(() => {
    if (isUserLoggedIn === false && client) {
      client.signOutUser();
    }
  }, [isUserLoggedIn, client]);

  const groupConfig = {
    enable: false
  };

  return (
    <>
      {/* Initialize document after user is authenticated */}
      <VeltInitializeDocument />

      {/* Core collaboration components */}
      <VeltComments
        shadowDom={false}
        textMode={false}
      />

      {/* Sidebar for viewing all comments */}
      <VeltCommentsSidebar groupConfig={groupConfig} />

      {/* Custom styling */}
      <VeltCustomization />
    </>
  );
}
```

**Using the Wrapper:**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import DocumentCanvas from "@/components/document/DocumentCanvas";

export default function Home() {
  const { authProvider } = useVeltAuthProvider();

  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider
      apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}
      authProvider={authProvider}
    >
      {/* Single entry point for all Velt components */}
      <VeltCollaboration />

      {/* Your app content */}
      <DocumentCanvas />
    </VeltProvider>
  );
}
```

**Conditional Rendering Pattern:**

```jsx
export function VeltCollaboration({ enabled = true }) {
  const { isUserLoggedIn } = useAppUser();
  const { client } = useVeltClient();

  useEffect(() => {
    if (isUserLoggedIn === false && client) {
      client.signOutUser();
    }
  }, [isUserLoggedIn, client]);

  // Optionally disable Velt features
  if (!enabled) return null;

  return (
    <>
      <VeltInitializeDocument />
      <VeltComments shadowDom={false} textMode={false} />
      <VeltCommentsSidebar groupConfig={{ enable: false }} />
      <VeltCustomization />
    </>
  );
}
```

**Extending for Different Pages:**

```jsx
// components/velt/VeltCollaborationEditor.tsx
// Extended version for editor pages with text selection
export function VeltCollaborationEditor() {
  return (
    <>
      <VeltInitializeDocument />
      <VeltComments textMode={true} shadowDom={false} />  {/* Text selection mode */}
      <VeltCommentsSidebar groupConfig={{ enable: false }} />
      <VeltCustomization />
    </>
  );
}

// components/velt/VeltCollaborationDashboard.tsx
// Minimal version for dashboard pages
export function VeltCollaborationDashboard() {
  return (
    <>
      <VeltInitializeDocument />
      <VeltComments pageMode={true} shadowDom={false} />  {/* Page-level comments only */}
      <VeltCommentsSidebar groupConfig={{ enable: false }} />
    </>
  );
}
```

---

### 7.2 Place Velt UI Components Correctly

**Impact: MEDIUM (Correct placement ensures components render and function properly)**

Velt UI components must be placed inside VeltProvider and after user authentication. Component placement affects visibility and functionality.

**Incorrect (outside VeltProvider):**

```jsx
// VeltComments outside provider - won't work
import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  return (
    <div>
      <VeltComments />  {/* Error: Not inside VeltProvider */}
      <VeltProvider apiKey="KEY">
        <Content />
      </VeltProvider>
    </div>
  );
}
```

**Incorrect (in same file as VeltProvider without separation):**

```jsx
// Calling identify in same component as VeltProvider
"use client";
import { VeltProvider, useIdentify, VeltComments } from "@veltdev/react";

export default function App() {
  useIdentify(user);  // Won't work - provider not mounted yet

  return (
    <VeltProvider apiKey="KEY">
      <VeltComments />
    </VeltProvider>
  );
}
```

**Correct (components in VeltCollaboration wrapper):**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";

export default function App() {
  const { authProvider } = useVeltAuthProvider();

  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider apiKey="KEY" authProvider={authProvider}>
      {/* Velt components inside provider, in child component */}
      <VeltCollaboration />
      <MainContent />
    </VeltProvider>
  );
}
// components/velt/VeltCollaboration.tsx
"use client";
import { VeltComments, VeltCommentsSidebar, VeltPresence } from "@veltdev/react";
import VeltInitializeDocument from "./VeltInitializeDocument";

export function VeltCollaboration() {
  return (
    <>
      <VeltInitializeDocument />  {/* Sets document ID */}
      <VeltComments />            {/* Comment pins on content */}
      <VeltCommentsSidebar />     {/* Sidebar panel */}
      <VeltPresence />            {/* User avatars */}
    </>
  );
}
```

**Layout Example:**

```jsx
function AppLayout() {
  return (
    <div className="app-layout">
      {/* Header with presence */}
      <header className="app-header">
        <Logo />
        <Navigation />
        <VeltPresence />  {/* Shows user avatars in header */}
      </header>

      {/* Main content area with comments */}
      <main className="app-main">
        <VeltComments />  {/* Enables commenting on main content */}
        <PageContent />
      </main>

      {/* Fixed sidebar for comment list */}
      <aside className="app-sidebar">
        <VeltCommentsSidebar />
      </aside>
    </div>
  );
}
```

**Conditional Component Rendering:**

```jsx
function VeltCollaboration({ showSidebar = true, showPresence = true }) {
  return (
    <>
      <VeltInitializeDocument />
      <VeltComments />

      {showSidebar && <VeltCommentsSidebar />}
      {showPresence && <VeltPresence />}
    </>
  );
}

// Usage - editor page with all features
<VeltCollaboration showSidebar={true} showPresence={true} />

// Usage - read-only page with just comments
<VeltCollaboration showSidebar={false} showPresence={false} />
```

**Z-Index Considerations:**

```css
/* Ensure Velt components are above your content */
.velt-comments-sidebar {
  z-index: 1000;
}

/* Or use Velt's CSS variables */
:root {
  --velt-sidebar-z-index: 1000;
}
```

---

## 8. Debugging & Testing

**Impact: LOW-MEDIUM**

Setup verification and troubleshooting common configuration errors. Helps identify and fix issues when Velt features don't work as expected.

### 8.1 Troubleshoot Common Configuration Errors

**Impact: LOW-MEDIUM (Quick reference for resolving frequent setup issues)**

This guide covers the most common Velt setup issues and their solutions.

### Issue 1: "Domain not allowed" Error

**Symptom:**

```typescript
Console: "Domain not allowed. Please add your domain to the safelist."
```

**Cause:** Your current domain is not whitelisted in Velt Console.

**Solution:**

```jsx
// Debug: Check current domain
console.log("Add this domain to Velt Console:", window.location.origin);
```

---

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

**Symptom:**

```typescript
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

**Symptom:**

```typescript
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

**Solution:**

```jsx
// WRONG: Random document ID
const documentId = Math.random().toString();  // Different every time!

// CORRECT: Consistent document ID
const documentId = searchParams.get("documentId") || localStorage.getItem("docId");
```

See `document-id-generation` rule for proper patterns.
---
| Issue | Check |
|-------|-------|
| Nothing works | API key valid? Domain whitelisted? |
| Server errors (Next.js) | 'use client' directive present? |
| No comments visible | Document set after auth? Same doc ID? |
| Auth errors | authProvider defined? Token endpoint working? |
| Hooks error | Inside VeltProvider? In child component? |
| Inconsistent state | Only one VeltProvider? |
| Data not persisting | Document ID consistent? |

---

### 8.2 Verify Velt Setup is Correct

**Impact: LOW-MEDIUM (Systematic verification helps identify setup issues early)**

Use this checklist to systematically verify your Velt setup. Check each item in order - issues often cascade from earlier setup problems.

**Setup Verification Checklist:**

```jsx
// Check packages are installed correctly
// In terminal:
npm list @veltdev/react  // Should show version ^4.x.x

// In your code, this import should work:
import { VeltProvider, VeltComments, useVeltClient } from "@veltdev/react";
```

**Verification:**

```jsx
// Add temporary logging to verify API key
console.log("Velt API Key:", process.env.NEXT_PUBLIC_VELT_API_KEY);

// Check it's being passed to VeltProvider
<VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY}>
```

**Verification:**

```jsx
// Check current domain matches whitelisted domains
console.log("Current origin:", window.location.origin);
console.log("Current hostname:", window.location.hostname);
```

**Verification:**

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

---

## References

- https://docs.velt.dev/get-started/quickstart
- https://docs.velt.dev/get-started/advanced
- https://console.velt.dev
