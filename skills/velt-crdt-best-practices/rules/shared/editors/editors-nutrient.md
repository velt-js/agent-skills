---
title: Pass overlayContainer and Unload Nutrient Only After manager.destroy()
impact: HIGH
impactDescription: Missing overlayContainer misplaces remote selections; unloading the viewer before the manager or double-attaching it leaks listeners and corrupts Instant JSON sync
tags: crdt, nutrient, pspdfkit, nutrient-crdt, NutrientCrdtEditor, useCollaboration, createCollaboration, overlayContainer, instant-json, flushInstanceToStore
---

## Pass overlayContainer and Unload Nutrient Only After manager.destroy()

`@veltdev/nutrient-crdt` synchronizes Nutrient Instant JSON (annotations, comments, form values) as debounced snapshots in a Velt map store; the PDF stays a viewer resource. Load the viewer first, pass its positioned host as `overlayContainer` so remote page-rectangle selections render in the right coordinate context, and unload Nutrient only after the manager has released its listeners and overlays.

**Incorrect (no overlay host, double attach, unload first):**

```ts
const manager = await createCollaboration({ editorId: 'review-123', veltClient: client, instance });
manager.attachInstance(instance);       // already attached by `instance` above
NutrientViewer.unload(host);            // viewer removed while the manager is still bound
manager.destroy();
```

**Correct (React / Next.js):**

```tsx
import { INSTANT_JSON_FORMAT, NutrientCrdtEditor } from '@veltdev/nutrient-crdt-react';

const initialContent = { format: INSTANT_JSON_FORMAT, annotations: [], comments: [], formFieldValues: {} };

export function CollaborativeDocument() {
  return (
    <NutrientCrdtEditor
      documentId="nutrient-review-123"
      document="/documents/contract.pdf"
      licenseKey="YOUR_NUTRIENT_LICENSE_KEY"
      useCDN
      initialContent={initialContent}
      className="nutrient-host"
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

When the application owns the viewer, call `useCollaboration({ editorId, instance, initialContent, overlayContainer: hostRef.current })` and, in cleanup, call `collaboration.destroy()` before `NutrientViewer.unload(host)`. `NutrientCrdtEditor` unloads only viewers it created.

**Correct (Other Frameworks):**

```ts
import NutrientViewer from '@nutrient-sdk/viewer';
import { createCollaboration } from '@veltdev/nutrient-crdt';

const host = document.querySelector('#nutrient-viewer'); // non-zero size, position: relative
const instance = await NutrientViewer.load({ container: host, document: '/documents/contract.pdf', useCDN: true, licenseKey: 'YOUR_NUTRIENT_LICENSE_KEY' });

const manager = await createCollaboration({
  editorId: 'nutrient-review-123',
  veltClient: client,
  instance,                  // binds the viewer; do not call attachInstance() too
  overlayContainer: host,
  initialContent: { format: 'https://pspdfkit.com/instant-json/v1', annotations: [], comments: [], formFieldValues: {} },
});

// Before navigation, wait for the latest local change to persist
await manager.flushInstanceToStore('before-navigation', true);

// Teardown: manager first, then the viewer
manager.destroy();
NutrientViewer.unload(host);
```

### Nutrient-specific notes

- `initialContent` seeds only a new, empty store; the manager strips `pdfId` before persistence. `forceResetInitialContent` and `forceReset()` replace annotations, comments, and form values for every collaborator.
- Viewer events schedule debounced `exportInstantJSON()` calls (default 120 ms). `manager.getStats().lastFlushReason` helps diagnose missed writes.
- Selections are awareness only and are excluded from Instant JSON and versions; map rectangles through the current page, zoom, and scroll transform.
- The React hook waits for Velt initialization, an authenticated user, and `instance`; set the document before mounting.
- Attach-later (`initializeWithoutInstance: true` + `attachInstance(instance, { applyRemoteState: true })`) is an alternative to passing `instance`, never an extra step.

**Verification Checklist:**
- [ ] Viewer host is positioned, sized, and passed as `overlayContainer`
- [ ] One attachment path per viewer
- [ ] `flushInstanceToStore()` called before navigation when persistence must complete
- [ ] `forceResetInitialContent` is off for normal routing
- [ ] `manager.destroy()` runs before `NutrientViewer.unload(host)`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/nutrient - "Step 4: Initialize Collaboration"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/nutrient - "Step 7: Flush Viewer Changes"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/nutrient - "Step 14: Clean Up" and "Notes"
