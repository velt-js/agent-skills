---
title: Use HTML String Format for Tiptap CRDT Initial Content
impact: HIGH
impactDescription: Passing JSON objects as initialContent renders raw JSON text in the editor instead of formatted content
tags: tiptap, crdt, initialContent, html, format
---

## Use HTML String Format for Tiptap CRDT Initial Content

The `initialContent` parameter of `useVeltTiptapCrdtExtension` accepts an **HTML string**, not a JSON object. Passing a JSON object will render raw JSON text in the editor.

**Incorrect (JSON object — renders as raw text):**

```tsx
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'my-editor',
  // WRONG: This renders as literal JSON text in the editor
  initialContent: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] },
});
```

**Correct (HTML string):**

```tsx
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'my-editor',
  // CORRECT: HTML string renders as formatted content
  initialContent: '<p>Hello world</p>',
});
```

**Correct (no initial content — let CRDT handle it):**

```tsx
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'my-editor',
  // CORRECT: Omit initialContent for new documents — CRDT manages content
});
```

**If your backend returns ProseMirror JSON, convert to HTML first:**

```tsx
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';

const veltInitialContent = useMemo(() => {
  if (!backendContent) return undefined;
  if (typeof backendContent === 'string') return backendContent; // Already HTML
  // Convert ProseMirror JSON to HTML
  return generateHTML(backendContent, [StarterKit]);
}, [backendContent]);

const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'my-editor',
  initialContent: veltInitialContent,
});
```

**Key rules:**
- `initialContent` type is `string | undefined`
- For new documents, omit `initialContent` or pass `undefined`
- For seeding from a backend, convert to HTML string first
- Never pass a raw JSON object — it will display as text

**Verification:**
- [ ] Editor displays formatted text, not raw JSON
- [ ] Initial content matches expected formatting (headings, paragraphs, etc.)
- [ ] New documents start with empty or default content, not JSON

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap`
