---
title: Use HTML String Format for Tiptap CRDT Initial Content
impact: HIGH
impactDescription: Passing JSON objects as initialContent renders raw JSON text in the editor instead of formatted content
tags: tiptap, crdt, initialContent, html, format
---

## Use HTML String Format for Tiptap CRDT Initial Content

The `initialContent` parameter of `useCollaboration` (v2) — and the deprecated `useVeltTiptapCrdtExtension` (v1) — accepts an **HTML string**, not a JSON object. Passing a JSON object will render raw JSON text in the editor.

**Incorrect (JSON object — renders as raw text):**

```tsx
const { extension } = useCollaboration({
  editorId: 'my-editor',
  // WRONG: This renders as literal JSON text in the editor
  initialContent: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] },
});
```

**Correct (HTML string):**

```tsx
const { extension } = useCollaboration({
  editorId: 'my-editor',
  // CORRECT: HTML string renders as formatted content
  initialContent: '<p>Hello world</p>',
});
```

**Correct (no initial content — let CRDT handle it):**

```tsx
const { extension } = useCollaboration({
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

const { extension } = useCollaboration({
  editorId: 'my-editor',
  initialContent: veltInitialContent,
});
```

**Key rules:**
- `initialContent` type is `string | undefined`
- For new documents, omit `initialContent` or pass `undefined`
- For seeding from a backend, convert to HTML string first
- Never pass a raw JSON object — it will display as text
- `initialContent` is applied **exactly once**, only when the document is brand new. To force-overwrite existing remote content (e.g., "reset to template"), pass `forceResetInitialContent: true`.

**Force-reset to template (use sparingly — destroys remote state):**

```tsx
const { extension } = useCollaboration({
  editorId: 'my-tiptap-editor',
  initialContent: '<p>Fresh start!</p>',
  forceResetInitialContent: true,  // Always overwrite remote content on init
});
```

```js
// Non-React equivalent
const manager = await createCollaboration({
  editorId: 'my-document-id',
  veltClient: client,
  initialContent: '<p>Fresh start!</p>',
  forceResetInitialContent: true,
});
```

**Verification:**
- [ ] Editor displays formatted text, not raw JSON
- [ ] Initial content matches expected formatting (headings, paragraphs, etc.)
- [ ] New documents start with empty or default content, not JSON

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap`
