---
title: Add 'use client' Directive for Next.js
impact: CRITICAL
impactDescription: Next.js App Router requires client directive for Velt components
tags: nextjs, use client, app router, server components, client components
---

## Add 'use client' Directive for Next.js

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

**Files That Need 'use client':**

Any file that:
- Imports from `@veltdev/react`
- Uses Velt hooks (`useIdentify`, `useSetDocument`, `useVeltClient`, etc.)
- Contains Velt components (`VeltComments`, `VeltPresence`, etc.)
- Uses React hooks with Velt data

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
```

```jsx
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
```

```jsx
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

**Common Errors Without 'use client':**

- `Error: Cannot read properties of undefined (reading 'createContext')`
- `Error: Hooks can only be called inside the body of a function component`
- `Error: Expected a string or a class/function but got: undefined`

**Verification:**
- [ ] All files importing from @veltdev/react have 'use client' at line 1
- [ ] The 'use client' directive is a string literal, not a comment
- [ ] No Velt imports in Server Components (layout.tsx without directive)
- [ ] Page renders without hydration errors

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 4: Initialize Velt (warning about 'use client' directive)
