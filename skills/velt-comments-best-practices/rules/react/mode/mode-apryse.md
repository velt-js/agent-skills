---
title: Integrate Comments with Apryse WebViewer
impact: HIGH
impactDescription: PDF and DOCX text comments in Apryse WebViewer with durable anchors and cleanup
tags: apryse, webviewer, pdf, docx, text-comments, editor
---

## Integrate Comments with Apryse WebViewer

Use `@veltdev/apryse-velt-comments` when adding Velt text comments to Apryse WebViewer documents. The integration attaches to one WebViewer instance, renders existing Velt annotations back into Apryse, and stores durable text anchors that survive document edits and viewer/docxEditor mode switches.

**Incorrect (using default text comments without the Apryse extension):**

```jsx
// Default text mode cannot render selections inside the Apryse canvas.
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={true} />
  <div ref={viewerRef} />
</VeltProvider>
```

**Correct (React / Next.js with the Apryse extension):**

**Step 1: Install both packages**

```bash
npm install @veltdev/apryse-velt-comments @pdftron/webviewer
```

`@pdftron/webviewer` is a peer dependency. Copy its `public/core` and `public/ui` runtime folders into your app's public assets, then point WebViewer's `path` option at that location.

**Step 2: Mount Velt comments with default text mode disabled**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Dynamically create WebViewer and attach the Velt extension**

```jsx
import { useEffect, useRef, useState } from 'react';
import { useCommentAnnotations } from '@veltdev/react';
import {
  ApryseVeltComments,
  addComment,
  renderComments,
} from '@veltdev/apryse-velt-comments';

function ApryseEditor() {
  const viewerRef = useRef(null);
  const instanceRef = useRef(null);
  const extensionRef = useRef(null);
  const [instance, setInstance] = useState(null);
  const annotations = useCommentAnnotations();

  useEffect(() => {
    if (!viewerRef.current || instanceRef.current) return;
    let cancelled = false;

    import('@pdftron/webviewer').then(({ default: WebViewer }) => {
      if (cancelled) return;
      WebViewer(
        {
          path: 'lib/webviewer',
          licenseKey: 'YOUR_APRYSE_LICENSE_KEY',
          initialDoc: '/your-document.docx',
          initialMode: 'docxEditor',
        },
        viewerRef.current,
      ).then((webViewerInstance) => {
        if (cancelled) return;
        instanceRef.current = webViewerInstance;
        extensionRef.current = ApryseVeltComments
          .configure({ editorId: 'contract-viewer' })
          .attach(webViewerInstance);
        setInstance(webViewerInstance);
      });
    });

    return () => {
      cancelled = true;
      extensionRef.current?.detach();
      extensionRef.current = null;
      instanceRef.current = null;
      setInstance(null);
    };
  }, []);

  useEffect(() => {
    if (instance && annotations) {
      renderComments({ instance, commentAnnotations: annotations });
    }
  }, [instance, annotations]);

  return (
    <>
      <button
        onClick={async () => {
          if (!instance) return;
          const result = await addComment({ instance });
          if (!result) {
            console.warn('Select text in the WebViewer before adding a comment.');
          }
        }}
      >
        Add Comment
      </button>
      <div ref={viewerRef} style={{ width: '100%', height: '100vh' }} />
    </>
  );
}
```

**Key APIs:**

| API | Purpose |
|-----|---------|
| `ApryseVeltComments.configure({ editorId }).attach(instance)` | Attach Velt comment handling to one WebViewer instance. |
| `addComment({ instance })` | Create a Velt annotation from the current Apryse text selection. Returns `null` when nothing is selected or the SDK is not loaded. |
| `renderComments({ instance, commentAnnotations })` | Re-render Velt annotations as Apryse text highlights. |
| `AttachedExtension.detach()` | Remove Apryse listeners and clear per-instance caches during cleanup. |

**Important details:**
- Import `@pdftron/webviewer` dynamically in browser-only code; WebViewer touches the DOM.
- Clicking a host-page button does not clear Apryse's canvas selection, so no selection-preservation `mousedown` workaround is needed.
- Set `editorId` when the page hosts multiple WebViewer instances; `renderComments()` only paints annotations whose stored editor id matches.
- The library stores `annotation.context.textEditorConfig` with `editorId`, selected `text`, `pageNumber`, and `occurrence`; physical positions are re-derived at render time.
- If the WebViewer loads a new document in the same instance, keep the extension attached. It listens for Apryse document lifecycle events and re-syncs highlights.

**Style Apryse highlights:**

```css
velt-comment-text .velt-apryse-highlight {
  background-color: rgba(60, 130, 246, 0.30) !important;
  border-bottom: 2px solid rgba(60, 130, 246, 0.95) !important;
}

velt-comment-text:hover .velt-apryse-highlight {
  background-color: rgba(60, 130, 246, 0.50) !important;
}
```

**Verification Checklist:**
- [ ] `@veltdev/apryse-velt-comments` and `@pdftron/webviewer` are installed
- [ ] WebViewer runtime assets are copied to a public HTTP path used by `WebViewer({ path })`
- [ ] `VeltComments` is mounted with `textMode={false}`
- [ ] `ApryseVeltComments.configure(...).attach(instance)` runs once per WebViewer instance
- [ ] `renderComments({ instance, commentAnnotations })` runs when annotations change
- [ ] `extension.detach()` runs on unmount
- [ ] Multi-viewer pages set stable `editorId` values

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/apryse - "Apryse Setup"
- https://docs.velt.dev/api-reference/sdk/models/data-models#apryseveltcommentsconfig - "ApryseVeltCommentsConfig"
- https://docs.velt.dev/api-reference/sdk/models/data-models#addcommentargs - "AddCommentArgs"
- https://docs.velt.dev/api-reference/sdk/models/data-models#attachedextension - "AttachedExtension"
