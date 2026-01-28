---
title: Create VeltCollaboration Wrapper Component
impact: MEDIUM
impactDescription: Centralizes Velt component mounting and lifecycle management
tags: wrapper, component, collaboration, veltcomments, lifecycle
---

## Create VeltCollaboration Wrapper Component

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

**Wrapper Responsibilities:**

| Responsibility | Implementation |
|----------------|----------------|
| Document initialization | VeltInitializeDocument component |
| Sign-out handling | useEffect watching isUserLoggedIn |
| Component configuration | Props on VeltComments, VeltPresence, etc. |
| Custom styling | VeltCustomization component |
| Lifecycle cleanup | Automatic via React unmount |

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

**Verification:**
- [ ] All Velt components are mounted in one wrapper
- [ ] Sign-out is handled when user logs out
- [ ] VeltInitializeDocument is included
- [ ] Wrapper is placed inside VeltProvider
- [ ] Component props are configured as needed

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 4: Initialize Velt
