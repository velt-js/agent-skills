---
title: Configure VeltProvider dataProviders Prop Before Calling identify
impact: CRITICAL
impactDescription: Required for self-hosted data to function
tags: setup, dataProviders, VeltProvider, initialization, ordering, setDocuments, identify
---

## Configure VeltProvider dataProviders Prop Before Calling identify

The `dataProviders` prop on `<VeltProvider>` is the entry point for all self-hosting data configuration. Data providers must be registered before user authentication, and self-hosting only works with `setDocuments` (plural), not `setDocument`.

**Incorrect (wrong initialization order or method):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  // Data providers set AFTER identify — data flows to Velt servers instead
  return (
    <VeltProvider apiKey="YOUR_API_KEY">
      <AuthComponent /> {/* identify() called here */}
      <DataProviderSetup /> {/* Too late — providers missed */}
    </VeltProvider>
  );
}

// Also wrong: using setDocument (singular) instead of setDocuments
client.setDocument('doc-id'); // NOT compatible with self-hosting
```

**Correct (providers set on VeltProvider, using existing VeltInitializeDocument):**

```jsx
import { VeltProvider } from '@veltdev/react';
import VeltInitializeDocument from './VeltInitializeDocument';

// Define providers as stable references (outside component or useMemo)
const dataProviders = {
  comment: commentDataProvider,
  attachment: attachmentDataProvider,
  reaction: reactionDataProvider,
  recording: recordingDataProvider,
  user: userDataProvider,
};

function App() {
  return (
    // Data providers set BEFORE any identify/auth calls
    <VeltProvider apiKey="YOUR_API_KEY" dataProviders={dataProviders}>
      <AuthComponent />
      <VeltInitializeDocument documentId={docId} />
      <YourApp />
    </VeltProvider>
  );
}
```

**IMPORTANT:** Use the existing `VeltInitializeDocument` component from the setup skill for document identity. Do NOT create a custom `DocumentSetup` component — the existing one handles the `setDocuments` lifecycle correctly and avoids infinite render loops. The document shape is `{ id: string, metadata: { documentName: string } }` — NOT `{ documentId, documentName }`.

**Available provider keys:**

| Key | Data Type | Methods |
|-----|-----------|---------|
| `comment` | Comment content | get, save, delete |
| `attachment` | File attachments | save, delete |
| `reaction` | Emoji reactions | get, save, delete |
| `recording` | Recording annotations | get, save, delete |
| `user` | User PII (name, email, photo) | get only |

**Key constraints:**
- Data providers must be set **before** `identify()` is called
- Self-hosting only works with `setDocuments` (plural), **not** `setDocument` (singular)
- Each provider key is optional — only configure the data types you want to self-host
- Define providers as module-level constants or `useMemo` to avoid unnecessary re-renders

### Complete VeltProvider Wiring for Self-Hosting

This is how VeltProvider should look in the document page when self-hosting is enabled. The `dataProviders` prop MUST be set BEFORE the user is identified:

```tsx
"use client";

import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import {
  commentDataProvider,
  userDataProvider,
  attachmentDataProvider,
  reactionDataProvider,
} from "@/components/velt/VeltDataProviders";

const VELT_API_KEY = process.env.NEXT_PUBLIC_VELT_API_KEY!;

export default function DocumentPage() {
  const { authProvider } = useVeltAuthProvider();

  return (
    <VeltProvider
      apiKey={VELT_API_KEY}
      authProvider={authProvider}
      dataProviders={{
        comment: commentDataProvider,
        user: userDataProvider,
        attachment: attachmentDataProvider,
        reaction: reactionDataProvider,
      }}
    >
      <VeltCollaboration documentId={docId} />
      {/* Your page content */}
    </VeltProvider>
  );
}
```

**The `VeltDataProviders.ts` file** must export each provider with function-based resolvers. Each resolver calls your API routes and returns `{ data, success, statusCode }`. See the `comment-function-provider`, `attachment-multipart-provider`, `provider-user-resolver`, and `provider-reaction-recording` rules for complete implementations.

**The API routes** follow the pattern `app/api/velt/{provider}/{operation}/route.ts` — see the `backend-api-routes` rule. Each route calls your database store and returns the standard response format.

**The database store** (`app/api/velt/store.ts`) handles PostgreSQL connection pooling, table initialization, and UPSERT operations — see the `backend-database-patterns` rule.

**Verification:**
- [ ] `dataProviders` prop set on VeltProvider before any auth/identify calls
- [ ] Using `setDocuments` (plural), not `setDocument`
- [ ] Providers defined as stable references (not recreated on every render)
- [ ] Only configuring providers for data types you want to self-host
- [ ] `VeltDataProviders.ts` exports all 4 providers (comment, user, attachment, reaction)
- [ ] All provider functions return `{ data, success, statusCode }` format
- [ ] API routes exist for all provider operations
- [ ] Database store uses UPSERT semantics (ON CONFLICT DO UPDATE)
- [ ] `DATABASE_URL` environment variable set in `.env.local`

**Source Pointer:** https://docs.velt.dev/self-host-data/overview; https://docs.velt.dev/self-host-data/comments - Important Notes
