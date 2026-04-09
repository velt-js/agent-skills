---
title: Programmatic Composer Control — Submit, Clear, Read State
impact: HIGH
impactDescription: Control the comment composer programmatically
tags: submitComment, clearComposer, getComposerData, composer
---

## Programmatic Composer Control — Submit, Clear, Read State

Use these methods to control the comment composer without user interaction — submit comments programmatically, clear the composer, or read its current state.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Submit the current composer content
commentElement.submitComment({
  targetComposerElementId: 'composer-1', // Matches the VeltCommentComposer's targetComposerElementId prop
});

// Clear the composer (reset to empty)
commentElement.clearComposer();

// Read current composer state
const composerData = commentElement.getComposerData();
// Returns: { text, html, attachments, taggedUsers, ... }
```

**Usage with VeltCommentComposer:**

```tsx
import { VeltCommentComposer } from '@veltdev/react';

function CustomSubmitForm() {
  const { client } = useVeltClient();

  const handleSubmit = () => {
    const commentElement = client?.getCommentElement();
    commentElement?.submitComment({ targetComposerElementId: 'my-composer' });
  };

  return (
    <>
      <VeltCommentComposer targetComposerElementId="my-composer" />
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={() => client?.getCommentElement()?.clearComposer()}>
        Clear
      </button>
    </>
  );
}
```

**Key details:**
- `targetComposerElementId` must match between `VeltCommentComposer` prop and `submitComment()` call
- `clearComposer()` clears all composers on the page
- `getComposerData()` returns the current state synchronously

**Verification:**
- [ ] targetComposerElementId matches between component and API call
- [ ] Composer clears after submission
- [ ] getComposerData returns expected structure

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Composer
