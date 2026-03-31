---
title: Control Comment Visibility with Private Mode and Per-Annotation Updates
impact: LOW
impactDescription: Prevent unintended comment exposure by restricting visibility globally or per annotation to organization members or specific users
tags: private, visibility, private-mode, enablePrivateMode, disablePrivateMode, updateVisibility, CommentVisibilityType, organizationPrivate, restricted, permissions
---

## Control Comment Visibility with Private Mode and Per-Annotation Updates

> **Prerequisite:** Before using any visibility API (`enablePrivateMode`, `updateVisibility`, visibility options), you must first **enable** the visibility feature in [Velt Console](https://console.velt.dev/dashboard/config/appconfig). Without this, visibility API calls will have no effect.

Use `enablePrivateMode()` to set a global visibility default for all new comments in a session, and `updateVisibility()` to change the visibility of a specific existing annotation. Without explicit visibility control, all new comments are public by default.

> **Breaking Change (v5.0.1-beta.4):** `CommentVisibilityType` string literal values were renamed. `'organization'` is now `'organizationPrivate'` and `'self'` is now `'restricted'`. Passing the old values will silently apply incorrect visibility. See the Breaking Change section below.

**Incorrect (no visibility control — all new comments visible to everyone):**

```jsx
// No private mode set — every new comment is public by default.
const { client } = useVeltClient();
useEffect(() => {
  if (!client) return;
  const commentElement = client.getCommentElement();
  // Missing: commentElement.enablePrivateMode(...)
}, [client]);
```

**Correct (React — enable global private mode for organization members):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function PrivateModeController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Restrict all new comments to members of the same organization
    commentElement.enablePrivateMode({ type: 'organizationPrivate' });

    // organizationId is auto-resolved from the authenticated user — no need to pass it manually.

    return () => {
      // Revert to default public visibility on unmount
      commentElement.disablePrivateMode();
    };
  }, [client]);

  return null;
}
```

**Correct (React — restrict new comments to specific users only):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function RestrictedModeController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Restrict all new comments to user-a and user-b only.
    // The current user is always auto-appended to userIds — even when an explicit list is provided.
    commentElement.enablePrivateMode({
      type: 'restricted',
      userIds: ['user-a', 'user-b'],
    });

    return () => commentElement.disablePrivateMode();
  }, [client]);

  return null;
}
```

**Correct (React — update visibility of a specific existing annotation):**

```jsx
import { useVeltClient } from '@veltdev/react';

function VisibilityUpdater({ annotationId }: { annotationId: string }) {
  const { client } = useVeltClient();

  const makeOrgPrivate = () => {
    if (!client) return;
    const commentElement = client.getCommentElement();
    commentElement.updateVisibility({
      annotationId,
      type: 'organizationPrivate',
      // organizationId is optional — auto-resolved from authenticated user
    });
  };

  const restrictToUsers = () => {
    if (!client) return;
    const commentElement = client.getCommentElement();
    commentElement.updateVisibility({
      annotationId,
      type: 'restricted',
      userIds: ['user-a'],
    });
  };

  return (
    <>
      <button onClick={makeOrgPrivate}>Make org-private</button>
      <button onClick={restrictToUsers}>Restrict to user-a</button>
    </>
  );
}
```

**Correct (HTML / Other Frameworks — global private mode):**

```typescript
// Global private mode: organization members only
const commentElement = Velt.getCommentElement();
commentElement.enablePrivateMode({ type: 'organizationPrivate' });

// Restrict new comments to specific users
commentElement.enablePrivateMode({
  type: 'restricted',
  userIds: ['user-a', 'user-b'],
});

// Revert to default public visibility
commentElement.disablePrivateMode();
```

**Correct (HTML / Other Frameworks — per-annotation visibility update):**

```typescript
const commentElement = Velt.getCommentElement();

// Update a specific annotation to organization-private
commentElement.updateVisibility({
  annotationId: 'annotation-123',
  type: 'organizationPrivate',
});

// Update a specific annotation to restricted visibility
commentElement.updateVisibility({
  annotationId: 'annotation-123',
  type: 'restricted',
  userIds: ['user-a'],
});
```

**Correct (React — set visibility at comment creation time):**

```jsx
import { useVeltClient } from '@veltdev/react';

function CreateRestrictedComment() {
  const { client } = useVeltClient();

  const addComment = () => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Set visibility at creation time — no post-creation updateVisibility() call needed.
    commentElement.addComment({
      annotationId: 'annotation-id',
      comment: { text: 'Visible only to selected users' },
      visibility: {
        type: 'restricted',
        userIds: ['user1', 'user2'],
      },
    });
  };

  return <button onClick={addComment}>Add restricted comment</button>;
}
```

**Correct (HTML / Other Frameworks — set visibility at comment creation time):**

```typescript
const commentElement = Velt.getCommentElement();

// Set visibility at creation time — no post-creation updateVisibility() call needed.
commentElement.addComment({
  annotationId: 'annotation-id',
  comment: { text: 'Visible only to selected users' },
  visibility: {
    type: 'restricted',
    userIds: ['user1', 'user2'],
  },
});
```

**API Reference:**

| Method | Signature | Description |
|---|---|---|
| `enablePrivateMode` | `enablePrivateMode(config: PrivateModeConfig): void` | Sets global visibility for all new comments. |
| `disablePrivateMode` | `disablePrivateMode(): void` | Reverts all new comments to default public visibility. |
| `updateVisibility` | `updateVisibility(config: CommentVisibilityConfig): void` | Updates visibility of a specific annotation by ID. |
| `addComment` | `addComment(request: AddCommentRequest): void` | Creates a comment; accepts optional `visibility` to set `CommentVisibilityConfig` at creation time. |

**Type Definitions:**

```typescript
type CommentVisibilityType = 'public' | 'organizationPrivate' | 'restricted';

interface CommentVisibilityConfig {
  type: CommentVisibilityType;
  annotationId?: string;   // Required for updateVisibility(); unused in enablePrivateMode()
  organizationId?: string; // Auto-resolved from authenticated user when omitted
  userIds?: string[];      // Current user always auto-appended for 'restricted' type, even when list is explicitly provided
}

// PrivateModeConfig omits annotationId and organizationId (auto-resolved)
type PrivateModeConfig = Omit<CommentVisibilityConfig, 'annotationId' | 'organizationId'>;

interface AddCommentRequest {
  annotationId?: string;
  comment?: { text?: string; [key: string]: unknown };
  visibility?: CommentVisibilityConfig; // Optional: set visibility at creation time (v5.0.2-beta.4+)
  [key: string]: unknown;
}
```

**Key Behaviors:**

- `enablePrivateMode()` applies to all **new** comments created after the call. It does not retroactively change existing annotations.
- `disablePrivateMode()` resets the global default to `'public'` for subsequent new comments.
- For `'organizationPrivate'` type, `organizationId` is auto-resolved from the authenticated user; no need to pass it explicitly.
- For `'restricted'` type, the current user is **always** auto-appended to `userIds` — even when an explicit `userIds` list is provided. If the current user is not in the list, they are automatically included. Do not assume passing `userIds: ['user-b']` restricts the comment to only `user-b`.
- `updateVisibility()` requires `annotationId` and changes only that specific annotation.
- `addComment()` accepts an optional `visibility: CommentVisibilityConfig` field (v5.0.2-beta.4+) to set visibility at creation time, eliminating a separate `updateVisibility()` call when visibility is known upfront.

---

## Breaking Change: CommentVisibilityType Value Renames (v5.0.1-beta.4)

The string literal values of `CommentVisibilityType` were renamed in v5.0.1-beta.4. Passing the old values will **silently** apply incorrect (or no) visibility — there is no runtime error.

**Before (v5.0.1-beta.3 and earlier — now broken):**

```typescript
// WRONG — 'organization' and 'self' are no longer valid values
commentElement.updateVisibility({ annotationId: 'a1', type: 'organization' }); // WRONG
commentElement.updateVisibility({ annotationId: 'a1', type: 'self' });         // WRONG
commentElement.enablePrivateMode({ type: 'organization' });                    // WRONG
```

**After (v5.0.1-beta.4+ — correct values):**

```typescript
// CORRECT — use 'organizationPrivate' and 'restricted'
commentElement.updateVisibility({ annotationId: 'a1', type: 'organizationPrivate' }); // CORRECT
commentElement.updateVisibility({ annotationId: 'a1', type: 'restricted' });          // CORRECT
commentElement.enablePrivateMode({ type: 'organizationPrivate' });                    // CORRECT
```

**Migration Checklist:**
- [ ] Search codebase for `type: 'organization'` passed to `updateVisibility()` or `enablePrivateMode()` — replace with `'organizationPrivate'`
- [ ] Search codebase for `type: 'self'` passed to `updateVisibility()` or `enablePrivateMode()` — replace with `'restricted'`
- [ ] Audit any serialized `CommentVisibilityType` values stored in databases or localStorage

**Verification Checklist:**
- [ ] Visibility feature is enabled in [Velt Console](https://console.velt.dev/dashboard/config/appconfig) before using any visibility API
- [ ] `enablePrivateMode()` called before the user creates any new comments in the session
- [ ] `disablePrivateMode()` called in cleanup (e.g., `useEffect` return) to avoid leaking visibility state across routes
- [ ] `CommentVisibilityType` values use the new names: `'public'`, `'organizationPrivate'`, `'restricted'`
- [ ] `updateVisibility()` includes a valid `annotationId` for per-annotation changes

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/visibility - Comment visibility and private mode API
- https://docs.velt.dev/api-reference/sdk/api/elements/comment-element - `commentElement` method reference
