---
title: Prefer Past-Tense Event Aliases commentToolClicked and sidebarButtonClicked in New Code
impact: LOW
impactDescription: Write consistent event subscriptions using the canonical past-tense naming convention that aligns with all other Velt events — both old and new names fire simultaneously so migration is non-breaking
tags: commentToolClicked, sidebarButtonClicked, commentToolClick, sidebarButtonClick, event, CommentToolClickedEvent, SidebarButtonClickedEvent, useCommentEventCallback, subscribe, naming convention
---

## Prefer Past-Tense Event Aliases commentToolClicked and sidebarButtonClicked in New Code

Velt v5.0.2-beta.2 introduced `commentToolClicked` and `sidebarButtonClicked` as past-tense aliases for the original `commentToolClick` and `sidebarButtonClick` events. Both old and new names fire simultaneously — use the past-tense aliases in all new code to align with the consistent naming convention used across all other Velt events.

**Incorrect (using present-tense event names in new code — still works but not the canonical pattern):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function InteractionListeners() {
  // Present-tense names still fire, but past-tense aliases are the canonical form.
  const toolClickEvent = useCommentEventCallback('commentToolClick');
  const sidebarClickEvent = useCommentEventCallback('sidebarButtonClick');

  useEffect(() => {
    if (toolClickEvent) {
      console.log('Comment tool clicked:', toolClickEvent);
    }
  }, [toolClickEvent]);

  return null;
}
```

**Correct (React — use past-tense aliases):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommentToolClickedListener() {
  const toolClickedEvent = useCommentEventCallback('commentToolClicked');
  const sidebarClickedEvent = useCommentEventCallback('sidebarButtonClicked');

  useEffect(() => {
    if (toolClickedEvent) {
      console.log('Comment tool clicked:', toolClickedEvent);
    }
  }, [toolClickedEvent]);

  useEffect(() => {
    if (sidebarClickedEvent) {
      console.log('Sidebar button clicked:', sidebarClickedEvent);
    }
  }, [sidebarClickedEvent]);

  return null;
}
```

**Correct (HTML / Other Frameworks — subscribe via commentElement):**

```typescript
const commentElement = Velt.getCommentElement();

const sub1 = commentElement.on('commentToolClicked').subscribe((event) => {
  console.log('Comment tool clicked:', event);
});

const sub2 = commentElement.on('sidebarButtonClicked').subscribe((event) => {
  console.log('Sidebar button clicked:', event);
});

// Clean up subscriptions when no longer needed
sub1.unsubscribe();
sub2.unsubscribe();
```

**Event Alias Reference:**

| Past-Tense (canonical, new code) | Present-Tense (legacy, still works) | Type |
|----------------------------------|--------------------------------------|------|
| `commentToolClicked` | `commentToolClick` | `CommentToolClickedEvent extends CommentToolClickEvent` |
| `sidebarButtonClicked` | `sidebarButtonClick` | `SidebarButtonClickedEvent extends SidebarButtonClickEvent` |

<!-- TODO (v5.0.2-beta.2): Verify exact payload fields for CommentToolClickEvent and SidebarButtonClickEvent. Release note documents the type names and alias relationship but does not enumerate individual payload fields. Refer to https://docs.velt.dev/api-reference/sdk/models/data-models for the full field listing of the parent types. -->

**Key Behaviors:**

- `commentToolClicked` and `sidebarButtonClicked` are past-tense aliases introduced in v5.0.2-beta.2. Both names fire simultaneously when the corresponding UI element is clicked — subscribing to either name receives the same event.
- `CommentToolClickedEvent` extends `CommentToolClickEvent`; `SidebarButtonClickedEvent` extends `SidebarButtonClickEvent`. Payload fields match the parent types — refer to the data-models documentation for the full field listing.
- Migration from the present-tense names is non-breaking. Existing subscriptions on `commentToolClick` or `sidebarButtonClick` continue to work without modification.
- In React, use `useCommentEventCallback` with a `useEffect` that depends on the returned event value.
- In non-React frameworks, always call `.unsubscribe()` on each subscription to avoid memory leaks.

**Verification Checklist:**
- [ ] New code subscribes to `commentToolClicked` and `sidebarButtonClicked` (past-tense), not the present-tense originals
- [ ] React usage uses `useCommentEventCallback('commentToolClicked')` / `useCommentEventCallback('sidebarButtonClicked')` with separate `useEffect` hooks for each event
- [ ] Non-React usage calls `.unsubscribe()` on each subscription when the listener is destroyed
- [ ] Payload field access is validated against the data-models documentation for `CommentToolClickEvent` / `SidebarButtonClickEvent`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/events - `commentToolClicked` and `sidebarButtonClicked` event reference
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
- https://docs.velt.dev/api-reference/sdk/api/elements/comment-element - `commentElement.on()` subscription pattern
- https://docs.velt.dev/api-reference/sdk/models/data-models - Parent type payload field details
