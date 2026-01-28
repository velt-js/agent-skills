---
title: Integrate Comments with Lexical Editor
impact: HIGH
impactDescription: Text comments in Lexical rich text editor with CommentNode
tags: lexical, editor, rich-text, text-comments, comment-node
---

## Integrate Comments with Lexical Editor

Add collaborative text comments to Lexical editor using Velt's Lexical extension. Users can select text and add comments that integrate with Lexical's node system.

**Incorrect (using default text mode):**

```jsx
// Default text mode doesn't integrate with Lexical properly
<VeltComments textMode={true} />
<LexicalComposer ... />
```

**Correct (with Lexical extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/lexical-velt-comments @veltdev/client lexical
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Register CommentNode in editor config**
```jsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { CommentNode } from '@veltdev/lexical-velt-comments';

const initialConfig = {
  namespace: 'MyEditor',
  nodes: [CommentNode],  // Register Velt comment node
  onError: console.error,
};

function Editor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* plugins */}
    </LexicalComposer>
  );
}
```

**Step 4: Add comment functionality**
```jsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { addComment, renderComments } from '@veltdev/lexical-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

function CommentPlugin() {
  const [editor] = useLexicalComposerContext();
  const commentAnnotations = useCommentAnnotations();

  // Render comments when annotations change
  useEffect(() => {
    if (editor && commentAnnotations?.length) {
      renderComments({ editor, commentAnnotations });
    }
  }, [editor, commentAnnotations]);

  const handleAddComment = () => {
    if (editor) {
      addComment({ editor });
    }
  };

  return (
    <button onMouseDown={(e) => {
      e.preventDefault();
      handleAddComment();
    }}>
      Add Comment
    </button>
  );
}
```

**Key Functions:**
- `CommentNode` - Node type to register with Lexical
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `exportJSONWithoutComments(editor)` - Export clean editor state

**Export Editor State Without Comments:**
```jsx
import { exportJSONWithoutComments } from '@veltdev/lexical-velt-comments';

// Store clean state without comment nodes
const cleanState = exportJSONWithoutComments(editor);
```

**Style Commented Text:**
```css
velt-comment-text[comment-available="true"] {
  background-color: #ffff00;
}
```

**Verification Checklist:**
- [ ] @veltdev/lexical-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] CommentNode registered in editor config
- [ ] renderComments called on annotation changes
- [ ] Comment button triggers addComment

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/lexical - Complete setup
