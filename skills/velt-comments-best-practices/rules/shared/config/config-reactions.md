---
title: Configure Emoji Reactions on Comments
impact: MEDIUM
impactDescription: Enable and customize emoji reactions for comment feedback
tags: enableReactions, disableReactions, setCustomReactions, addReaction, deleteReaction, toggleReaction, reactions, emoji
---

## Configure Emoji Reactions on Comments

Enable emoji reactions on comments for quick feedback without full replies.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Enable/disable reactions
commentElement.enableReactions();
commentElement.disableReactions();

// Define custom emoji list (replaces defaults)
commentElement.setCustomReactions([
  { id: 'thumbsup', emoji: '👍', label: 'Like' },
  { id: 'heart', emoji: '❤️', label: 'Love' },
  { id: 'check', emoji: '✅', label: 'Done' },
  { id: 'eyes', emoji: '👀', label: 'Looking' },
  { id: 'rocket', emoji: '🚀', label: 'Ship it' },
]);

// Add reaction programmatically
commentElement.addReaction({
  annotationId: 'ann-123',
  commentId: 1,
  reactionId: 'thumbsup',
});

// Remove reaction
commentElement.deleteReaction({
  annotationId: 'ann-123',
  commentId: 1,
  reactionId: 'thumbsup',
});

// Toggle reaction (add if missing, remove if exists)
commentElement.toggleReaction({
  annotationId: 'ann-123',
  commentId: 1,
  reactionId: 'thumbsup',
});
```

**Key details:**
- Reactions are stored in `comment.reactionAnnotations[]`
- `setCustomReactions()` replaces the default emoji set entirely
- Reaction changes trigger `REACTION_ADD` / `REACTION_DELETE` activity types
- `toggleReaction()` is the most common pattern — handles both add and remove

**Verification:**
- [ ] Reactions enabled before use
- [ ] Custom reactions called before UI renders
- [ ] annotationId and commentId are correct types (string and number)

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Reactions
