---
title: Show a Visibility Banner in the Comment Composer for Multi-Level Visibility Selection
impact: LOW
impactDescription: Let users choose from four visibility levels before submitting a comment, and react to that choice via the visibilityOptionClicked event
tags: visibility, visibilityOptions, enableVisibilityOptions, disableVisibilityOptions, visibilityOptionClicked, VisibilityOptionClickedEvent, CommentVisibilityOptionType, CommentVisibilityOption, public, restrictedSelf, restrictedSelectedPeople, organizationPrivate, permissions, useCommentEventCallback
---

## Show a Visibility Banner in the Comment Composer for Multi-Level Visibility Selection

Enable `visibilityOptions` to render a persistent visibility banner below the comment composer that lets users choose from four visibility levels — `public`, `organizationPrivate`, `restrictedSelf`, and `restrictedSelectedPeople` — before submitting. The feature is off by default; without enabling it, users have no in-UI way to set visibility at comment-creation time.

> **Breaking Change (v5.0.2-beta.4):** `visibilityOptionDropdown` prop has been renamed to `visibilityOptions` / `visibility-options`. The API methods `enableVisibilityOptionDropdown()` / `disableVisibilityOptionDropdown()` have been renamed to `enableVisibilityOptions()` / `disableVisibilityOptions()`. The `VisibilityOptionClickedEvent.visibility` type has widened from `'public' | 'private'` to `CommentVisibilityOptionType` (`'personal' | 'selected-people' | 'org-users' | 'public'`). Replace all `'private'` comparisons with `'personal'`.

> **Breaking Change (v5.0.2-beta.5):** `CommentVisibilityOptionType` values have been renamed to align with the new `CommentVisibilityOption` enum. Replace `'personal'` → `'restrictedSelf'`, `'selected-people'` → `'restrictedSelectedPeople'`, `'org-users'` → `'organizationPrivate'`. The `'public'` value is unchanged.

**Incorrect (no visibility choice for users — visibility banner is hidden by default):**

```jsx
// visibilityOptions defaults to false — the banner is not rendered.
// Users cannot choose visibility from the composer.
<VeltComments />
```

**Correct (React — enable via prop):**

```jsx
import { VeltComments } from '@veltdev/react';

function App() {
  return (
    // Renders the four-option visibility banner below the comment composer.
    <VeltComments visibilityOptions={true} />
  );
}
```

**Correct (React — enable/disable programmatically):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function VisibilityOptionsController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Show the visibility banner in the composer.
    commentElement.enableVisibilityOptions();

    return () => {
      // Hide the banner on unmount.
      commentElement.disableVisibilityOptions();
    };
  }, [client]);

  return null;
}
```

**Correct (React — subscribe to the visibilityOptionClicked event):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function VisibilityOptionListener() {
  const visibilityEvent = useCommentEventCallback('visibilityOptionClicked');

  useEffect(() => {
    if (!visibilityEvent) return;

    // One of: 'public' | 'organizationPrivate' | 'restrictedSelf' | 'restrictedSelectedPeople'
    console.log('Visibility selected:', visibilityEvent.visibility);
    console.log('Annotation ID:', visibilityEvent.annotationId);
    console.log('Full annotation:', visibilityEvent.commentAnnotation);

    // users is populated when visibility === 'restrictedSelectedPeople'
    if (visibilityEvent.visibility === 'restrictedSelectedPeople') {
      console.log('Selected users:', visibilityEvent.users);
    }
  }, [visibilityEvent]);

  return null;
}
```

**Correct (HTML / Other Frameworks — enable/disable programmatically):**

```typescript
const commentElement = Velt.getCommentElement();

// Show the visibility banner in the composer.
commentElement.enableVisibilityOptions();

// Hide the banner when no longer needed.
commentElement.disableVisibilityOptions();
```

**Correct (HTML / Other Frameworks — subscribe to the visibilityOptionClicked event):**

```typescript
const commentElement = Velt.getCommentElement();

const subscription = commentElement.on('visibilityOptionClicked').subscribe((event) => {
  // One of: 'public' | 'organizationPrivate' | 'restrictedSelf' | 'restrictedSelectedPeople'
  console.log('Visibility selected:', event.visibility);
  console.log('Annotation ID:', event.annotationId);
  // event.users is populated when event.visibility === 'restrictedSelectedPeople'
});

// Clean up subscription when no longer needed.
subscription.unsubscribe();
```

**`CommentVisibilityOptionType` and `VisibilityOptionClickedEvent` Interfaces:**

```typescript
// Added in v5.0.2-beta.5 — enum backing the type union
export declare enum CommentVisibilityOption {
  RESTRICTED_SELF = "restrictedSelf",
  RESTRICTED_SELECTED_PEOPLE = "restrictedSelectedPeople",
  ORGANIZATION_PRIVATE = "organizationPrivate",
  PUBLIC = "public"
}

// Template-literal type derived from the enum
export type CommentVisibilityOptionType = `${CommentVisibilityOption}`;
// = 'restrictedSelf' | 'restrictedSelectedPeople' | 'organizationPrivate' | 'public'

interface VisibilityOptionClickedEvent {
  annotationId: string;                    // ID of the comment annotation
  commentAnnotation: CommentAnnotation;    // Full annotation object
  visibility: CommentVisibilityOptionType; // The visibility option the user selected
  users?: User[];                          // Populated when visibility === 'restrictedSelectedPeople'
  metadata?: VeltEventMetadata;            // Optional event metadata (timestamp, source, etc.)
}
```

**API Reference:**

| API | Type | Signature | Description |
|-----|------|-----------|-------------|
| `visibilityOptions` | prop | `boolean` (default: `false`) | Show or hide the visibility banner in the comment composer. |
| `enableVisibilityOptions` | method | `enableVisibilityOptions(): void` | Programmatically show the visibility banner. |
| `disableVisibilityOptions` | method | `disableVisibilityOptions(): void` | Programmatically hide the visibility banner. |
| `visibilityOptionClicked` | event | `VisibilityOptionClickedEvent` | Fires when the user selects a visibility option from the banner. |

**Key Behaviors:**

- The visibility banner is hidden by default (`visibilityOptions={false}`). It must be explicitly enabled via the prop or `enableVisibilityOptions()`.
- The `visibilityOptionClicked` event fires each time the user selects an option — not on submission.
- When `visibility === 'restrictedSelectedPeople'`, the event includes a `users` array with the selected user objects. For other visibility types, `users` is `undefined`.
- In React, `useCommentEventCallback('visibilityOptionClicked')` returns the latest event; use it inside a `useEffect` that depends on the returned value.
- In non-React frameworks, always call `.unsubscribe()` to avoid memory leaks when the listener is no longer needed.
- The UI surface is a persistent banner below the composer (replaces the previous two-option dropdown). Customize it via `VeltCommentDialogWireframe.VisibilityBanner.*`.

**Migration Checklist (from v5.0.2-beta.3 and earlier):**
- [ ] Replace `visibilityOptionDropdown={true}` with `visibilityOptions={true}` on `<VeltComments>`
- [ ] Replace `visibility-option-dropdown="true"` with `visibility-options="true"` on `<velt-comments>`
- [ ] Replace `enableVisibilityOptionDropdown()` with `enableVisibilityOptions()`
- [ ] Replace `disableVisibilityOptionDropdown()` with `disableVisibilityOptions()`
- [ ] Replace `visibility === 'private'` checks with `visibility === 'personal'`
- [ ] Update `VisibilityOptionClickedEvent.visibility` type references from `'public' | 'private'` to `CommentVisibilityOptionType`

**Migration Checklist (from v5.0.2-beta.4 and earlier — v5.0.2-beta.5 rename):**
- [ ] Replace `visibility === 'personal'` checks with `visibility === 'restrictedSelf'`
- [ ] Replace `visibility === 'selected-people'` checks with `visibility === 'restrictedSelectedPeople'`
- [ ] Replace `visibility === 'org-users'` checks with `visibility === 'organizationPrivate'`
- [ ] Update `CommentVisibilityOptionType` references to the new template-literal form: `'restrictedSelf' | 'restrictedSelectedPeople' | 'organizationPrivate' | 'public'`

**Verification Checklist:**
- [ ] `visibilityOptions={true}` set on `<VeltComments>` or `enableVisibilityOptions()` called programmatically before the user opens the composer
- [ ] `disableVisibilityOptions()` called in cleanup (e.g., `useEffect` return) if enabled programmatically
- [ ] `visibilityOptionClicked` listener uses `useCommentEventCallback` in React or `.on(...).subscribe(...)` in other frameworks
- [ ] Non-React subscriptions call `.unsubscribe()` when the listener is destroyed

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/visibility - Comment visibility options and banner
- https://docs.velt.dev/api-reference/sdk/api/elements/comment-element - `commentElement` method reference
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
