---
title: Use isAnnotationPrivate() for Unified Visibility Routing
impact: MEDIUM
impactDescription: Without the shared isAnnotationPrivate() utility, privacy checks miss annotations using the new visibilityConfig field and only detect legacy iam.accessMode
tags: isAnnotationPrivate, visibility, visibilityConfig, iam.accessMode, restricted, organizationPrivate, private, privacy, routing
---

## Use isAnnotationPrivate() for Unified Visibility Routing

Velt has two mechanisms for marking comments as private: the legacy `iam.accessMode === 'private'` field and the newer `visibilityConfig.type` field (which can be `'restricted'` or `'organizationPrivate'`). The SDK's shared `isAnnotationPrivate()` utility checks both, so you should always route through it rather than checking a single field.

**Incorrect (only checking legacy field):**

```jsx
// Wrong: misses annotations set via updateVisibility({ type: 'restricted' })
const isPrivate = annotation.iam?.accessMode === 'private';
```

**Correct (use isAnnotationPrivate which checks both paths):**

The SDK's internal `isAnnotationPrivate()` returns `true` when any of these conditions holds:
- `annotation.iam.accessMode === 'private'` (legacy)
- `annotation.visibilityConfig.type === 'restricted'`
- `annotation.visibilityConfig.type === 'organizationPrivate'`

This utility is used internally by these primitive components:
- `VeltCommentDialogOptionsDropdownContentMakePrivate` — auto-suppressed when `featureState.visibilityOptions === true`
- `VeltCommentDialogOptionsDropdownContentMakePrivateEnable` — shown when `isAnnotationPrivate()` returns `false`
- `VeltCommentDialogOptionsDropdownContentMakePrivateDisable` — shown when `isAnnotationPrivate()` returns `true`
- `VeltCommentDialogPrivateBadge` — auto-suppressed when visibility options are active

**How to set visibility:**

```jsx
const commentElement = client.getCommentElement();

// Per-annotation: make restricted to specific users
commentElement.updateVisibility({
  annotationId: 'ann-123',
  type: 'restricted',
  userIds: ['user-1', 'user-2']
});

// Per-annotation: organization-private
commentElement.updateVisibility({
  annotationId: 'ann-123',
  type: 'organizationPrivate',
  organizationId: 'org-123'
});

// Per-annotation: public
commentElement.updateVisibility({
  annotationId: 'ann-123',
  type: 'public'
});

// Global default for all new comments in session
commentElement.enablePrivateMode({ type: 'restricted', userIds: ['user-1'] });

// Revert to public default
commentElement.disablePrivateMode();
```

**Visibility options UI (let users choose before submitting):**

```jsx
<VeltComments visibilityOptions={true} />
```

This shows a visibility banner on the composer letting users pick `public`, `organization-private`, `restricted-self`, or `restricted` before submitting.

**Listen for visibility selection:**

```jsx
const event = useCommentEventCallback('visibilityOptionClicked');
useEffect(() => {
  if (event) {
    console.log('User selected visibility:', event);
  }
}, [event]);
```

**Set visibility at comment creation time (programmatic):**

```jsx
const { addComment } = useAddComment();
await addComment({
  annotationId: 'ANNOTATION_ID',
  comment: { commentText: 'Private note', commentHtml: '<p>Private note</p>' },
  visibility: { type: 'restricted', userIds: ['user-1'] }
});
```

**Two enum systems:** The API methods use `CommentVisibilityConfig` with 3 values (`'public'`, `'organizationPrivate'`, `'restricted'`). The UI wireframes use `CommentVisibilityOption` with 4 values (`'restrictedSelf'`, `'restrictedSelectedPeople'`, `'organizationPrivate'`, `'public'`). The API's single `'restricted'` value covers both "self-only" and "selected people" — distinguished by whether `userIds` is provided.
