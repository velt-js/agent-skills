---
title: Use type:'xml' Store with Yjs APIs — Never Call update()
impact: CRITICAL
impactDescription: XML stores do NOT support the update() method — calling it is a no-op or causes errors; all mutations must go through store.getXml() (Y.XmlFragment) and Yjs APIs directly, and the yjs package must be installed separately
tags: crdt, core, useStore, xml, Y.XmlFragment, Y.XmlElement, getXml, getDoc, transact, createVeltStore, yjs
---

## Use type:'xml' Store with Yjs APIs — Never Call update()

An XML store is backed by Yjs `Y.XmlFragment` and is the correct type for tree-shaped collaborative data (outline editors, structured documents, or any DOM-like hierarchy). Unlike `text`, `map`, and `array` stores, **the XML store does not use `update()`**. All mutations must go through Yjs APIs directly via `store.getXml()`.

The `xml` type also requires the `yjs` package as a direct dependency — install it with `npm i yjs` in addition to the Velt CRDT packages.

Do not call `update()` on an XML store — it is not supported and will not propagate mutations. Do not use `type: 'xml'` for plain text or flat key-value data; use `type: 'text'` or `type: 'map'` instead.

**Correct (React — useStore with type:'xml', mutations via store.getXml()):**

```tsx
import { useStore } from '@veltdev/crdt-react';
import * as Y from 'yjs'; // requires: npm i yjs
import { useEffect, useRef, useState } from 'react';

interface TreeNode {
  id: string;
  text: string;
  children: TreeNode[];
}

function CollaborativeOutline() {
  const xmlRef = useRef<Y.XmlFragment | null>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);

  // useStore returns store, isLoading, error — there is no update() for xml stores
  const { store, isLoading, error } = useStore<string>({
    storeId: 'my-xml-store',
    type: 'xml',
  });

  useEffect(() => {
    if (!store) return;

    // Get the raw Y.XmlFragment — all mutations go through this object
    const xml = store.getXml() as unknown as Y.XmlFragment | null;
    if (!xml) return;
    xmlRef.current = xml;

    // Populate with initial content if the document is empty
    // Wrap mutations in doc.transact() for atomic batching
    if (xml.length === 0) {
      const doc = store.getDoc();
      doc.transact(() => {
        const el = new Y.XmlElement('node');
        el.setAttribute('id', 'root-1');
        el.setAttribute('text', 'Getting Started');
        xml.insert(0, [el]);
      });
    }

    // Seed React state with the current tree
    setNodes(xmlFragmentToNodes(xml));

    // Subscribe to all future changes (local and remote)
    const unsub = store.subscribe(() => {
      if (xmlRef.current) {
        setNodes(xmlFragmentToNodes(xmlRef.current));
      }
    });

    return () => unsub();
  }, [store]);

  // Mutate via Yjs APIs — setAttribute is fine-grained and merges better than replacement
  const updateNodeText = (nodeId: string, newText: string) => {
    const xml = xmlRef.current;
    if (!xml) return;
    const el = findElementById(xml, nodeId);
    if (el) el.setAttribute('text', newText);
  };

  // Add a child node inside a transaction for atomicity
  const addNode = (text: string) => {
    const xml = xmlRef.current;
    if (!xml || !store) return;
    const doc = store.getDoc();
    doc.transact(() => {
      const el = new Y.XmlElement('node');
      el.setAttribute('id', crypto.randomUUID());
      el.setAttribute('text', text);
      xml.insert(xml.length, [el]);
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.id}>
          <input
            value={node.text}
            onChange={(e) => updateNodeText(node.id, e.target.value)}
          />
        </li>
      ))}
    </ul>
  );
}

// Helper: convert Y.XmlFragment to a plain-object tree
function xmlFragmentToNodes(container: Y.XmlFragment | Y.XmlElement): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (let i = 0; i < container.length; i++) {
    const child = container.get(i);
    if (child instanceof Y.XmlElement && child.nodeName === 'node') {
      nodes.push({
        id: child.getAttribute('id') || '',
        text: child.getAttribute('text') || '',
        children: xmlFragmentToNodes(child),
      });
    }
  }
  return nodes;
}

// Helper: find a Y.XmlElement by 'id' attribute (recursive)
function findElementById(
  container: Y.XmlFragment | Y.XmlElement,
  id: string
): Y.XmlElement | null {
  for (let i = 0; i < container.length; i++) {
    const child = container.get(i);
    if (child instanceof Y.XmlElement) {
      if (child.getAttribute('id') === id) return child;
      const found = findElementById(child, id);
      if (found) return found;
    }
  }
  return null;
}
```

**Correct (non-React — createVeltStore with type:'xml'):**

```js
import { createVeltStore } from '@veltdev/crdt';
import * as Y from 'yjs'; // requires: npm i yjs

async function initStore(veltClient) {
  const store = await createVeltStore({
    id: 'my-xml-store',
    type: 'xml',
    // No initialValue — seed via Yjs APIs after checking xml.length === 0
    veltClient,
  });
  if (!store) return;

  const xml = store.getXml();
  if (!xml) return;

  // Populate with initial content if the document is empty
  if (xml.length === 0) {
    const doc = store.getDoc();
    doc.transact(() => {
      const el = new Y.XmlElement('node');
      el.setAttribute('id', 'root-1');
      el.setAttribute('text', 'Getting Started');
      xml.insert(0, [el]);
    });
  }

  // Seed the UI
  renderTree(xml);

  // Subscribe to all future changes (local and remote)
  const unsubscribe = store.subscribe(() => {
    renderTree(xml);
  });

  return unsubscribe;
}
```

**Force-resetting XML initial content:**

XML stores do not accept `forceResetInitialContent`. To force-reset, clear the fragment and re-populate inside a Yjs transaction:

```tsx
const xml = store.getXml() as unknown as Y.XmlFragment | null;
if (!xml || !store) return;

const doc = store.getDoc();
doc.transact(() => {
  // Delete all existing content, then re-populate
  if (xml.length > 0) xml.delete(0, xml.length);
  populateInitialContent(xml);
});
```

**Verification Checklist:**
- [ ] `npm i yjs` is installed as a direct dependency alongside the Velt CRDT packages
- [ ] `update()` is never called on an XML store — all mutations go through `store.getXml()` and Yjs APIs
- [ ] Multi-step mutations are wrapped in `store.getDoc().transact(() => { ... })` for atomic batching
- [ ] `store.subscribe()` callback re-reads the `Y.XmlFragment` to rebuild local state (the callback receives no value argument for XML stores)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/xml - XML store setup, Yjs manipulation, subscribe, version management, and force-reset pattern
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - Core CRDT setup (Steps 1-2 must be completed first)
