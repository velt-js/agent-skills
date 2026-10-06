---
title: Sync Apryse Annotations as XFDF Around an App-Owned WebViewer
impact: HIGH
impactDescription: Expecting PDF bytes to sync, seeding with non-XFDF content, or disposing WebViewer before the manager breaks annotation collaboration
tags: crdt, apryse, webviewer, pdftron, apryse-crdt, useApryseCrdt, ApryseCrdtProvider, createCollaboration, xfdf, annotations, updateCursor
---

## Sync Apryse Annotations as XFDF Around an App-Owned WebViewer

`@veltdev/apryse-crdt` synchronizes Apryse WebViewer annotations, form fields, and XFDF state through a Velt map store; the PDF file itself is not synced and stays an Apryse document input. The application creates WebViewer once (assets, license, `initialDoc`), passes the completed instance to collaboration, and disposes WebViewer only after the manager is destroyed.

**Incorrect (PDF bytes as initial content, new viewer per render, wrong teardown):**

```tsx
const instance = await WebViewer({ path: '/webviewer/lib', initialDoc }, host); // inside render, every time

useApryseCrdt({
  editorId: 'contract',
  instance,
  initialContent: pdfArrayBuffer, // initialContent is an XFDF string, not PDF bytes or text
});

instance.UI.dispose();   // viewer gone while the manager still listens to annotationChanged
collaboration.destroy();
```

**Correct (React / Next.js):**

```tsx
import { useApryseCrdt } from '@veltdev/apryse-crdt-react';

// `instance` comes from a one-time WebViewer({ path, licenseKey, initialDoc }, host) effect
const collaboration = useApryseCrdt({
  editorId: 'apryse-contract-123',
  instance,
  initialXfdf: '<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots /></xfdf>',
  cursorData: { name: 'Ada Lovelace', color: '#2563eb' },
  onError: (error) => console.error('Collaboration error:', error),
});

useEffect(() => {
  return () => {
    collaboration.destroy();            // manager first
    viewerRef.current?.UI?.dispose?.(); // then the application-owned viewer
  };
}, [collaboration.destroy]);
```

**Correct (Other Frameworks):**

```ts
import WebViewer from '@pdftron/webviewer';
import { createCollaboration } from '@veltdev/apryse-crdt';

const instance = await WebViewer({ path: '/webviewer/lib', licenseKey: 'YOUR_APRYSE_LICENSE_KEY', initialDoc: '/documents/contract.pdf' }, host);

const manager = await createCollaboration({
  editorId: 'apryse-contract-123',
  veltClient: client,           // initialized, authenticated, document set
  instance,
  initialXfdf: '<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots /></xfdf>',
  cursorData: { name: 'Ada', color: '#2563eb' },
});

const offAnnotations = manager.onAnnotationsChange((records) => console.log(records));

// Cursors are awareness only: publish page coordinates from your interaction layer
manager.updateCursor({ pageNumber: 1, x: 240, y: 360 });
manager.clearCursor();

// Teardown
offAnnotations();
manager.destroy();
instance.UI?.dispose?.();
```

### Apryse-specific notes

- Annotation changes are captured from Apryse's `annotationChanged` event; `fieldChanged` triggers a full XFDF snapshot so form values stay together. Deleted annotations remain as tombstone records.
- Use `exportXfdf()`, `setXfdf()` / `importXfdf()`, and `flushAnnotationsToShared()` for imports and explicit snapshots; prefer them over direct `getMap()` mutation.
- Convert pointer positions to Apryse page coordinates before `updateCursor()`; the cursor overlay DOM and CSS are application-owned.
- The React hook waits for Velt initialization, an authenticated user, a non-empty `editorId`, and `instance`; it does not wait for document context.
- Deploy WebViewer's `lib` assets and supply a valid license; the collaboration package ships neither.

**Verification Checklist:**
- [ ] WebViewer is created once per mount and the same instance is passed to collaboration
- [ ] Seed data is XFDF (`initialXfdf` / `initialContent`), not PDF bytes
- [ ] `forceResetInitialContent` is off for normal loads
- [ ] Cursor updates use page coordinates and are throttled
- [ ] `manager.destroy()` (or `collaboration.destroy()`) runs before `UI.dispose()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse - "Step 4: Initialize Collaboration"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse - "Step 5: Synchronize Annotations and XFDF"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse - "Step 9: Publish Remote Cursors (Optional)" and "Notes"
