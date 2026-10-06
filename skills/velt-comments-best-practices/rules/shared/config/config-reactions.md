---
title: Configure Emoji Reactions on Comments
impact: MEDIUM
impactDescription: Enable and customize emoji reactions for comment feedback
tags: enableReactions, disableReactions, setCustomReactions, addReaction, deleteReaction, toggleReaction, useAddReaction, useToggleReaction, reactions, emoji
---

## Configure Emoji Reactions on Comments

Reactions are enabled by default. `setCustomReactions()` takes a **map keyed by reaction ID**, and the add / delete / toggle methods take a nested `reaction` object. Passing an array of emoji or a top-level `reactionId` does not work.

**Incorrect (array of reactions, flat reactionId):**

```jsx
commentElement.setCustomReactions([{ id: 'thumbsup', emoji: '👍' }]);
commentElement.toggleReaction({ annotationId: 'ann-123', commentId: 1, reactionId: 'thumbsup' });
```

**Correct (map of custom reactions, nested reaction object):**

```jsx
const commentElement = client.getCommentElement();

commentElement.enableReactions();   // default true
commentElement.disableReactions();

// Keys are reaction IDs; each value has either `emoji` or `url`
commentElement.setCustomReactions({
  fire: { emoji: '🔥' },
  party: { emoji: '🎉' },
  ship: { url: 'https://example.com/ship.svg' },
});

// Add / delete / toggle on a specific comment (commentId is a number)
await commentElement.addReaction({
  annotationId: 'ANNOTATION_ID',
  commentId: 384399,
  reaction: { reactionId: 'fire', customReaction: { emoji: '🔥' } },
});

await commentElement.deleteReaction({
  annotationId: 'ANNOTATION_ID',
  commentId: 384399,
  reaction: { reactionId: 'fire' },
});

await commentElement.toggleReaction({
  annotationId: 'ANNOTATION_ID',
  commentId: 384399,
  reaction: { reactionId: 'fire' },
});
```

**React hooks:**

```jsx
const { addReaction } = useAddReaction();
const { deleteReaction } = useDeleteReaction();
const { toggleReaction } = useToggleReaction();
await toggleReaction({ annotationId: 'ANNOTATION_ID', commentId: 384399, reaction: { reactionId: 'fire' } });
```

In Other Frameworks, call the same methods on `Velt.getCommentElement()`. The `addReaction`, `deleteReaction`, and `toggleReaction` events are available on `commentElement.on(...)`.

**Key details:**
- `setCustomReactions()` replaces the default reaction set.
- Each method resolves to its event object, or `null`.
- Reactions on private comments stay visible only to people who can read the parent comment, and they do not inherit the parent's Access Context.

**Verification:**
- [ ] `setCustomReactions()` receives an object map, not an array
- [ ] add / delete / toggle pass `reaction: { reactionId }`
- [ ] `commentId` is a number; `annotationId` is a string

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#reactions - Reactions
- https://docs.velt.dev/api-reference/sdk/models/data-models#togglereactionrequest - ToggleReactionRequest
