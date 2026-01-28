---
title: Choose the Correct CRDT Store Type for Your Data
impact: CRITICAL
impactDescription: Wrong type causes merge conflicts or data loss
tags: store, type, text, array, map, xml, yjs
---

## Choose the Correct CRDT Store Type for Your Data

Velt CRDT supports four Yjs-backed types: `text`, `array`, `map`, and `xml`. Each has different merge semantics. Using the wrong type causes unexpected behavior on concurrent edits.

**Store Type Reference:**

| Type | Use Case | Yjs Type | Best For |
|------|----------|----------|----------|
| `text` | Plain text | Y.Text | Notes, code, simple text |
| `array` | Ordered lists | Y.Array | Lists, queues, sequences |
| `map` | Key-value objects | Y.Map | Settings, forms, objects |
| `xml` | Rich text / DOM | Y.XmlFragment | Rich editors (Tiptap, BlockNote) |

**Incorrect (text type for object data):**

```ts
// Using text for JSON object - will cause merge issues
const store = await createVeltStore({
  id: 'settings',
  type: 'text',
  initialValue: JSON.stringify({ theme: 'dark', fontSize: 14 }),
});
```

**Correct (map type for object data):**

```ts
// Map type properly merges concurrent key-value updates
const store = await createVeltStore<{ theme: string; fontSize: number }>({
  id: 'settings',
  type: 'map',
  initialValue: { theme: 'dark', fontSize: 14 },
});
```

**Correct (text type for collaborative text):**

```tsx
const { value, update } = useVeltCrdtStore<string>({
  id: 'note',
  type: 'text',
  initialValue: '',
});

return <textarea value={value ?? ''} onChange={(e) => update(e.target.value)} />;
```

**Correct (array type for lists):**

```tsx
const { value, update } = useVeltCrdtStore<string[]>({
  id: 'todo-list',
  type: 'array',
  initialValue: [],
});
```

**Verification:**
- [ ] Store type matches data structure semantics
- [ ] Concurrent edits merge as expected
- [ ] Type is consistent across all clients for the same store ID

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/core.mdx` (type: 'text', // 'array' | 'map' | 'text' | 'xml')
