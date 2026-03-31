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

**Correct (providers set on VeltProvider, setDocuments used):**

```jsx
import { VeltProvider, useSetDocuments } from '@veltdev/react';

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
      <DocumentSetup />
      <YourApp />
    </VeltProvider>
  );
}

function DocumentSetup() {
  const { setDocuments } = useSetDocuments();

  useEffect(() => {
    // Must use setDocuments (plural) for self-hosting
    setDocuments([{
      id: 'your-document-id',
      metadata: { documentName: 'My Document' }
    }]);
  }, [setDocuments]);

  return null;
}
```

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

**Verification:**
- [ ] `dataProviders` prop set on VeltProvider before any auth/identify calls
- [ ] Using `setDocuments` (plural), not `setDocument`
- [ ] Providers defined as stable references (not recreated on every render)
- [ ] Only configuring providers for data types you want to self-host

**Source Pointer:** https://docs.velt.dev/self-host-data/overview; https://docs.velt.dev/self-host-data/comments - Important Notes
