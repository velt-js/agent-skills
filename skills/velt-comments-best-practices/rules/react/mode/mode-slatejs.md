---
title: Integrate Comments with SlateJS Editor
impact: HIGH
impactDescription: Text comments in SlateJS rich text editor with custom elements
tags: slatejs, slate, editor, rich-text, text-comments
---

## Integrate Comments with SlateJS Editor

Add collaborative text comments to SlateJS editor using Velt's SlateJS extension. Users can select text and add comments that integrate with Slate's document model.

**Incorrect (using default text mode):**

```jsx
// Default text mode doesn't integrate with SlateJS properly
<VeltComments textMode={true} />
<Slate ... />
```

**Correct (with SlateJS extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/slate-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Configure editor with extension**
```jsx
import { createEditor } from 'slate';
import { withReact, Slate, Editable, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import { withVeltComments, addComment, renderComments, SlateVeltComment } from '@veltdev/slate-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

// Create editor with Velt extension
const editor = withVeltComments(
  withReact(withHistory(createEditor())),
  { HistoryEditor: SlateHistoryEditor }
);
```

**Step 4: Register custom type**
```typescript
import type { VeltCommentsElement } from '@veltdev/slate-velt-comments';

type CustomElement = VeltCommentsElement;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
```

**Step 5: Render comments and add button**
```jsx
function SlateEditor() {
  const editor = useSlate();
  const commentAnnotations = useCommentAnnotations();

  // Render comments when annotations change
  useEffect(() => {
    if (editor && commentAnnotations) {
      renderComments({ editor, commentAnnotations });
    }
  }, [commentAnnotations, editor]);

  const handleAddComment = () => {
    addComment({ editor });
  };

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <button onMouseDown={(e) => {
        e.preventDefault();
        handleAddComment();
      }}>
        Comment
      </button>
      <Editable renderElement={renderElement} />
    </Slate>
  );
}

// Render Velt comment elements
const renderElement = (props) => {
  if (props.element.type === 'veltComment') {
    return <SlateVeltComment {...props} element={props.element} />;
  }
  return <p {...props.attributes}>{props.children}</p>;
};
```

**Key Functions:**
- `withVeltComments(editor, options)` - Augment editor with Velt support
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `SlateVeltComment` - Component to render comment elements

**Style Commented Text:**
```css
velt-comment-text[comment-available="true"] {
  background-color: #ffff00;
}
```

**Verification Checklist:**
- [ ] @veltdev/slate-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] withVeltComments wraps editor creation
- [ ] VeltCommentsElement type registered
- [ ] renderComments called on annotation changes

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/slatejs.mdx` - Complete setup
- `/sample-apps/apps/react/comments/text-editors/slatejs/slatejs-comments-demo/` - Working demo
