---
title: Load Tiptap Editor with SSR Disabled in Next.js
impact: CRITICAL
impactDescription: Without this, the app will crash with g.catch or window/document errors on first load
tags: tiptap, nextjs, ssr, dynamic-import, crdt
---

## Load Tiptap Editor with SSR Disabled in Next.js

Tiptap, y-prosemirror, and @veltdev/tiptap-velt-comments use browser-only APIs (DOM, window, document). In Next.js, these packages cause server-side rendering crashes if imported normally. The editor component must be loaded with `next/dynamic` and `ssr: false`.

**Incorrect (direct import — causes SSR crash):**

```tsx
// app/dashboard/[docId]/page.tsx
'use client';
import { TiptapCollabEditor } from '@/components/velt/TiptapCollabEditor';

export default function DocumentPage() {
  // ❌ This will crash with "g.catch is not a function" or similar SSR errors
  return <TiptapCollabEditor documentId="doc-1" />;
}
```

**Correct (dynamic import with SSR disabled):**

```tsx
// app/dashboard/[docId]/page.tsx
'use client';
import dynamic from 'next/dynamic';

const TiptapCollabEditor = dynamic(
  () => import('@/components/velt/TiptapCollabEditor').then(m => ({ default: m.TiptapCollabEditor })),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

export default function DocumentPage() {
  // ✅ Editor only loads in the browser, no SSR crash
  return <TiptapCollabEditor documentId="doc-1" />;
}
```

**This also applies to:**
- BlockNote CRDT components (`@veltdev/blocknote-crdt-react`)
- CodeMirror CRDT components (`@veltdev/codemirror-crdt-react`)
- Any component importing from `@tiptap/*` or `y-prosemirror`

**The editor component itself** should have `'use client'` at the top:
```tsx
// components/velt/TiptapCollabEditor.tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
// ... rest of component
```

**Verification Checklist:**
- [ ] Page files use `next/dynamic` with `ssr: false` to load editor
- [ ] Editor component file has `'use client'` directive
- [ ] No direct imports of Tiptap in server-rendered files
- [ ] App loads without SSR-related runtime errors

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap - Tiptap CRDT Setup
