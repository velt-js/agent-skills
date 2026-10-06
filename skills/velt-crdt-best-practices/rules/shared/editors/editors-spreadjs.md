---
title: Pass GC.Spread.Sheets.Events and Destroy the Manager Before the Workbook
impact: HIGH
impactDescription: Without the official event constants workbook changes are missed; double attachment or destroying the workbook first leaks handlers and overlays
tags: crdt, spreadjs, mescius, spreadjs-crdt, SpreadJSCrdtWorkbook, useCollaboration, createCollaboration, attachWorkbook, serializationOptions, snapshot
---

## Pass GC.Spread.Sheets.Events and Destroy the Manager Before the Workbook

`@veltdev/spreadjs-crdt` serializes the whole SpreadJS workbook (`workbook.toJSON()`) into a Velt map store and applies remote snapshots with `workbook.fromJSON()`. Pass `GC.Spread.Sheets.Events` so cell, range, sheet, and selection changes use the official event names, keep serialization options identical across clients, and destroy the manager before the workbook and its host.

**Incorrect (no events, double attachment, hidden host):**

```ts
// Host is display:none when the workbook is constructed
const workbook = new GC.Spread.Sheets.Workbook(hiddenHost);

const manager = await createCollaboration({ editorId: 'forecast-2026', veltClient: client, workbook });
manager.attachWorkbook(workbook);  // already attached by `workbook` above
workbook.destroy();                // workbook gone before the manager detaches handlers
manager.destroy();
```

**Correct (Other Frameworks):**

```ts
import GC from '@mescius/spread-sheets';
import '@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import { createCollaboration } from '@veltdev/spreadjs-crdt';

GC.Spread.Sheets.LicenseKey = 'YOUR_SPREADJS_LICENSE_KEY';
const host = document.querySelector('#spread-host'); // explicit height, visible
const workbook = new GC.Spread.Sheets.Workbook(host, { sheetCount: 2, tabEditable: true });

const manager = await createCollaboration({
  editorId: 'forecast-2026',
  veltClient: client,
  workbook,
  events: GC.Spread.Sheets.Events,
  initialContent: workbook.toJSON({ includeBindingSource: true }),
  serializationOptions: { includeBindingSource: true },
  deserializationOptions: { doNotRecalculateAfterLoad: false },
});

// Persist immediately after a complex multi-step operation
await manager.flushWorkbookToStore('toolbar-action', true);

// Teardown
manager.clearRemoteSelectionOverlays();
manager.destroy();
workbook.destroy();
host.remove();
```

**Correct (React / Next.js: drop-in component owns the workbook):**

```tsx
import { SpreadJSCrdtWorkbook } from '@veltdev/spreadjs-crdt-react';

export function ForecastWorkbook() {
  return (
    <SpreadJSCrdtWorkbook
      documentId="forecast-2026"
      licenseKey="YOUR_SPREADJS_LICENSE_KEY"
      className="spread-host"
      workbookOptions={{ sheetCount: 2, tabEditable: true }}
      serializationOptions={{ includeBindingSource: true }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

With `useCollaboration({ editorId, workbook, events: GC.Spread.Sheets.Events })` and an application-owned workbook, add `data-spreadjs-host` to the host and call `collaboration.destroy()` before `workbook.destroy()` in cleanup. Only `veltClient`, `editorId`, `workbook`, and `initializeWithoutWorkbook` reinitialize the hook.

### SpreadJS-specific notes

- Snapshot model: overlapping edits to the same cell resolve to the latest accepted snapshot. There is no cell-operation merge, formula conflict resolution, or locking; add a product-level policy for high-risk concurrent edits.
- Local events are debounced before `toJSON()` (default 120 ms). Test large workbooks with production serialization options.
- `forceResetInitialContent` (at creation) and `forceReset()` (runtime) replace the whole shared workbook.
- Remote selections are awareness only, rendered for the active sheet, and not stored in versions.
- Attach-later (`initializeWithoutWorkbook: true` + `attachWorkbook(workbook, { events, applyRemoteState: true })`) is an alternative path; detach before destroying a replaced workbook.
- The wrapper peer range targets `@mescius/spread-sheets@^19.1.3`; keep one copy of `yjs` and `y-protocols`.

**Verification Checklist:**
- [ ] `events: GC.Spread.Sheets.Events` passed to the factory or hook
- [ ] Workbook host is visible and sized when the workbook is constructed
- [ ] Same `serializationOptions` / `deserializationOptions` on every client
- [ ] One attachment path per workbook
- [ ] Teardown: overlays cleared, `manager.destroy()`, `workbook.destroy()`, host removed

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs - "Step 2: Create the Workbook"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs - "Step 4: Initialize Collaborative Workbook"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs - "Step 9: Configure Serialization" and "Notes"
