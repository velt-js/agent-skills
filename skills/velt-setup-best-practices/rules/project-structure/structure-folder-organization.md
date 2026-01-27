---
title: Organize Velt Files in components/velt
impact: MEDIUM
impactDescription: Consistent folder structure improves maintainability
tags: folder, structure, organization, components, architecture
---

## Organize Velt Files in components/velt

Based on Velt sample applications, organize all Velt-specific components and hooks in a dedicated folder structure. This separates Velt integration from your application logic.

**Incorrect (scattered files):**

```
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

```
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

**Recommended File Contents:**

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

**Folder Purpose Reference:**

| Folder | Purpose |
|--------|---------|
| app/userAuth/ | App-level auth (your auth system) |
| app/document/ | Document ID generation and management |
| app/api/velt/ | Server-side Velt endpoints (JWT) |
| components/velt/ | Velt component wrappers and setup |

**Verification:**
- [ ] All Velt imports are in components/velt/ or page.tsx
- [ ] App auth is separate from Velt auth
- [ ] Document management has dedicated folder
- [ ] API routes for Velt are in app/api/velt/
- [ ] Clear separation between app logic and Velt integration

**Source Pointers:**
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/` - Reference folder structure
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/components/velt/` - Velt components folder
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/app/userAuth/` - Auth folder pattern
