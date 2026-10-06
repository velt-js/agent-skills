---
title: Programmatic Composer Control — Submit, Clear, Read State
impact: HIGH
impactDescription: Control the comment composer programmatically
tags: submitComment, clearComposer, getComposerData, targetComposerElementId, composerTextChange, composer
---

## Programmatic Composer Control — Submit, Clear, Read State

Submit, clear, or read a composer without user interaction. All three methods target one composer through `targetComposerElementId`, which must match the `targetComposerElementId` prop on `VeltCommentComposer` or `VeltCommentDialogComposer`. Calling them without it does not reach your composer.

**Incorrect (no target id):**

```jsx
commentElement.clearComposer();                 // which composer?
const data = commentElement.getComposerData();  // requires { targetComposerElementId }
```

**Correct:**

```jsx
import { VeltCommentComposer, useVeltClient } from '@veltdev/react';

function CustomSubmitForm() {
  const { client } = useVeltClient();
  const commentElement = client?.getCommentElement(); // or useCommentUtils()

  return (
    <>
      <VeltCommentComposer targetComposerElementId="composer-1" />
      <button onClick={() => commentElement?.submitComment({ targetComposerElementId: 'composer-1' })}>
        Submit
      </button>
      <button onClick={() => commentElement?.clearComposer({ targetComposerElementId: 'composer-1' })}>
        Clear
      </button>
      <button
        onClick={() => {
          // Same shape as the composerTextChange event
          const data = commentElement?.getComposerData({ targetComposerElementId: 'composer-1' });
          console.log(data);
        }}
      >
        Inspect
      </button>
    </>
  );
}
```

```html
<velt-comment-composer target-composer-element-id="composer-1"></velt-comment-composer>
<script>
  const commentElement = Velt.getCommentElement();
  commentElement.submitComment({ targetComposerElementId: 'composer-1' });
</script>
```

**Key details:**
- `clearComposer()` resets text, attachments, recordings, tagged users, assignments, and custom lists for that composer.
- `getComposerData()` returns a `ComposerTextChangeEvent` synchronously; subscribe to `composerTextChange` for live updates.
- To pre-fill files, use `setComposerFileAttachments({ files, annotationId?, targetElementId? })` (see `config-attachments.md`).

**Verification:**
- [ ] `targetComposerElementId` matches between the component and each API call
- [ ] `clearComposer()` and `getComposerData()` receive `{ targetComposerElementId }`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#submitcomment - submitComment
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#clearcomposer - clearComposer
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#getcomposerdata - getComposerData
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-composer/customize-behavior - Comment Composer
