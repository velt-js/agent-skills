---
title: Initialize Document Context for Comments
impact: CRITICAL
impactDescription: Required - SDK will not work without document initialization
tags: document, setup, setdocument, context, initialization
---

## Initialize Document Context for Comments

A Document represents a shared collaborative space. You must call `setDocument` or `setDocuments` to define the context where comments will be stored and retrieved.

**Incorrect (missing document setup):**

```jsx
// Comments won't be associated with any document
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={...}>
      <VeltComments />  {/* No document context */}
    </VeltProvider>
  );
}
```

**Correct (using useVeltClient):**

```jsx
import { useEffect } from 'react';
import { VeltProvider, VeltComments, useVeltClient } from '@veltdev/react';

function DocumentSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      client.setDocuments([
        {
          id: 'unique-document-id',
          metadata: { documentName: 'My Document' }
        }
      ]);
    }
  }, [client]);

  return null;
}

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={...}>
      <DocumentSetup />
      <VeltComments />
    </VeltProvider>
  );
}
```

**Correct (with SetDocumentsRequestOptions — v5.0.2-beta.10):**

```jsx
import { useEffect } from 'react';
import { VeltProvider, VeltComments, useVeltClient } from '@veltdev/react';

function DocumentSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      client.setDocuments(
        [{ id: 'unique-document-id', metadata: { documentName: 'My Document' } }],
        {
          debounceTime: 1000,          // Override global 5000ms debounce for this call
          optimisticPermissions: false // Await permission validation before returning
        }
      );
    }
  }, [client]);

  return null;
}
```

**`SetDocumentsRequestOptions` fields:**

<!-- TODO (v5.0.2-beta.10): Verify exact type and default value of debounceTime and precise semantics of optimisticPermissions against the API reference once released. Release note text: "SetDocumentsRequestOptions — New debounceTime and optimisticPermissions fields". -->

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `locationId` | string | No | Scopes documents to a specific location |
| `rootDocumentId` | string | No | Sets a root document for hierarchical contexts |
| `context` | SetDocumentsContext | No | Additional context passed with the document set |
| `debounceTime` | number | No | Per-call debounce window in ms (default: 5000). Overrides the global debounce for this call only. |
| `optimisticPermissions` | boolean | No | When `false`, awaits server permission validation before returning permitted documents. When `true` (default), applies permissions optimistically. |

**Correct (using useSetDocument hook):**

```jsx
import { VeltProvider, VeltComments, useSetDocument } from '@veltdev/react';

function DocumentComponent() {
  useSetDocument('my-document-id', { documentName: 'My Collaborative Document' });

  return (
    <div>
      <VeltComments />
      {/* Document content */}
    </div>
  );
}
```

**For HTML/Vanilla JS:**

```javascript
async function loadVelt() {
  await Velt.init("YOUR_VELT_API_KEY");

  // Set document after authentication
  Velt.setDocuments([
    { id: 'unique-document-id', metadata: { documentName: 'Document Name' } }
  ]);
}
```

**Document ID Best Practices:**
- Use unique, stable identifiers (e.g., database record IDs)
- Keep IDs consistent across sessions for the same content
- Different document IDs create separate comment contexts

**Verification Checklist:**
- [ ] Document is set after user authentication
- [ ] Document ID is unique and stable
- [ ] setDocuments or useSetDocument is called
- [ ] Metadata includes descriptive documentName

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - "Step 6: Initialize Document"
