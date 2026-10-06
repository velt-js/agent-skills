---
title: Create the SuperDoc Manager First and Pass Its ydoc and provider to Both Config Slots
impact: HIGH
impactDescription: A separate Y.Doc or a config passed to only one slot breaks DOCX sync; two cursor renderers duplicate labels; wrong teardown order leaks the provider
tags: crdt, superdoc, superdoc-crdt, docx, useCollaboration, createCollaboration, getCollaborationConfig, modules.collaboration, layoutEngineOptions, resetSuperDocState
---

## Create the SuperDoc Manager First and Pass Its ydoc and provider to Both Config Slots

SuperDoc is the one integration where the collaboration manager is created before the editor. Obtain `{ ydoc, provider }` from the hook's `collaboration` value or `manager.getCollaborationConfig()`, and pass that same object to both the collaborative `documents[]` entry and `modules.collaboration`. Teardown is also inverted: destroy SuperDoc while it can still release the manager-owned provider, then destroy the manager.

**Incorrect (own Y.Doc, one config slot, manager destroyed first):**

```ts
import * as Y from 'yjs';

const superdoc = new SuperDoc({
  selector: '#superdoc',
  documents: [{ id: 'contract', type: 'docx' }],          // no ydoc/provider here
  modules: { collaboration: { ydoc: new Y.Doc(), provider } }, // second Y.Doc
});

manager.destroy();  // provider released while SuperDoc still uses it
superdoc.destroy();
```

**Correct (React / Next.js):**

```tsx
import { useEffect, useRef } from 'react';
import { useCollaboration } from '@veltdev/superdoc-crdt-react';
import { SuperDoc } from 'superdoc';
import 'superdoc/style.css';

export function SuperDocEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { collaboration, isLoading, error } = useCollaboration({ editorId: 'contract-2026-06' });

  useEffect(() => {
    if (!collaboration || !containerRef.current) return;
    const superdoc = new SuperDoc({
      selector: containerRef.current,
      superdocId: 'contract-2026-06',
      documentMode: 'editing',
      documents: [{ id: 'contract-2026-06', type: 'docx', ...collaboration }],
      modules: { collaboration },
      layoutEngineOptions: { presence: { enabled: true } },
      user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
      users: [],
      role: 'editor',
    });
    return () => superdoc.destroy?.(); // the hook destroys the manager itself
  }, [collaboration]);

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading || !collaboration) return <div>Connecting...</div>;
  return <div ref={containerRef} className="superdoc-container" />;
}
```

```css
/* React path keeps SuperDoc's presence overlay, so hide the y-prosemirror decorations */
.ProseMirror-yjs-cursor { display: none; }
.ProseMirror-yjs-selection { background: transparent !important; }
```

**Correct (Other Frameworks):**

```ts
import { createCollaboration } from '@veltdev/superdoc-crdt';
import { SuperDoc } from 'superdoc';

const manager = await createCollaboration({ editorId: 'contract-2026-06', veltClient: client });
const collaboration = manager.getCollaborationConfig();
if (!collaboration) {
  manager.destroy(); // the factory can return a degraded manager; check before building SuperDoc
  throw new Error('Collaboration did not initialize');
}

const superdoc = new SuperDoc({
  selector: '#superdoc',
  superdocId: 'contract-2026-06',
  documentMode: 'editing',
  documents: [{ id: 'contract-2026-06', type: 'docx', ydoc: collaboration.ydoc, provider: collaboration.provider }],
  modules: { collaboration: { ydoc: collaboration.ydoc, provider: collaboration.provider } },
  layoutEngineOptions: { presence: { enabled: false } }, // y-prosemirror cursors are the only renderer
  user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
  users: [],
});

// Teardown: SuperDoc first, then the manager
superdoc.destroy();
manager.destroy();
```

### SuperDoc-specific notes

- Use exactly one cursor renderer: React keeps SuperDoc presence enabled and hides `.ProseMirror-yjs-cursor`; Other Frameworks disable `layoutEngineOptions.presence` and keep the y-prosemirror decorations visible.
- `initialContent` is an application-level marker; SuperDoc receives DOCX data through its own configuration. `forceResetInitialContent` clears the shared state.
- Do not write to SuperDoc's `supereditor` fragment or clear its `parts`, `meta`, or `media` maps. `manager.resetSuperDocState()` clears the document for every user; use it only for deliberate resets.
- Install SuperDoc's peers (`superdoc`, `yjs`, `y-protocols`, `@hocuspocus/provider`, `pdfjs-dist`, `y-prosemirror`, `prosemirror-*`) and keep one copy of `yjs` and `superdoc` in the bundle.

**Verification Checklist:**
- [ ] Manager created before SuperDoc; `getCollaborationConfig()` checked for `null`
- [ ] The same `{ ydoc, provider }` goes into `documents[]` and `modules.collaboration`
- [ ] No application-created `Y.Doc` or provider
- [ ] Exactly one cursor renderer per integration path
- [ ] Teardown destroys SuperDoc, then the manager

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc - "Step 7: Configure Remote Cursors"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc - "Step 12: Cleanup" and "Notes"
