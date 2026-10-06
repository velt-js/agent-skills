---
title: Combine Private Comments with Access Context as Two Independent Checks
impact: MEDIUM
impactDescription: Prevents leaking private comments to viewers who share an Access Context, and avoids comments loading for the wrong users because of a reserved field name
tags: private-comments, visibility, access-context, setContextProvider, addContext, updateContext, enablePrivateMode, updateVisibility, isContextEnabled, accessFields, organizationPrivate, reserved, permissions
---

## Combine Private Comments with Access Context as Two Independent Checks

Comments have two independent scoping systems that can be set on the same comment. **Visibility** (`updateVisibility()`, `enablePrivateMode()`, the composer visibility banner; stored as `visibilityConfig`) controls who may see a comment. **Access Context** (`context.access` set via `addContext()`, `setContextProvider()`, or a component `context` prop, enforced with `isContextEnabled: true` on your Permission Provider) partitions comments by custom metadata. A viewer must pass both checks. Treating context as a permission, or visibility as a partition, leads to comments showing up for the wrong users.

**Incorrect (relying on context to hide a private comment, reserved field name):**

```jsx
const commentElement = client.getCommentElement();

// Context is a data partition, not a permission: everyone allowed in widgetId 2 can still
// see public comments there, and private comments need their own visibility.
// 'organizationPrivate' is reserved: Velt reads it as a visibility setting.
commentElement.setContextProvider(() => ({
  access: { widgetId: 2, organizationPrivate: 'acme' },
}));
```

**Correct (React / Next.js):**

```jsx
import { useEffect } from 'react';
import { useSetContextProvider, useVeltClient } from '@veltdev/react';

function PrivateWidgetComments() {
  const { client } = useVeltClient();
  // Hook
  const { setContextProvider } = useSetContextProvider();

  useEffect(() => {
    if (setContextProvider) {
      // Partition: attach an Access Context to every new comment
      setContextProvider(() => ({ access: { widgetId: 2 } }));
    }
  }, [setContextProvider]);

  useEffect(() => {
    if (!client) return;
    // API Method (permission): restrict every new comment to the current organization
    const commentElement = client.getCommentElement();
    commentElement.enablePrivateMode({ type: 'organizationPrivate' });
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const commentElement = Velt.getCommentElement();
commentElement.setContextProvider(() => ({ access: { widgetId: 2 } }));
commentElement.enablePrivateMode({ type: 'organizationPrivate' });
```

**Updating context without losing visibility:**

```js
// Merge access keys: adding a key keeps the others, null deletes a key,
// removing the last key returns the comment to its default context.
commentElement.updateContext('ANNOTATION_ID', { access: { widgetId: 3, region: null } }, { merge: true });
```

**How the two settings behave together:**
- Making a comment private keeps its Access Context, and updating Access Context (even clearing `access` with `null`) keeps its visibility.
- You can edit a private comment while Access Context is enabled.
- A private comment appears only under its own Access Context, for everyone including the author, and reaches only the users its visibility allows.
- Comments created with context from `setContextProvider()` or a component `context` prop (`VeltCommentTool`, `VeltCommentComposer`) load right away and survive reloads, the same as `addContext()`.
- Turning a loaded comment private removes it from other viewers immediately; turning it public again keeps it loadable when Access Context is off.
- Reactions, recordings, and area annotations on a private comment do not inherit its Access Context, and viewers who cannot see the parent do not receive them.
- The write gate checks the **acting** user (not the comment author); admins are exempt so moderation works. An empty access field list grants access.
- Notifications follow visibility: users who cannot see a private comment get no notification, on any channel. Comment webhooks for private comments carry a `visibility` object (`type`, `userIds`, `organizationIds`, `organizationId`); public comments carry none. Basic (V1) webhooks also include `accessDeniedUsers`. Use it to filter downstream fan-out.
- Inside `context.accessFields`, the prefixes `__velt_private_self:` and `organizationPrivate:` are reserved for visibility. Never name an Access Context field `organizationPrivate`; Velt does not block it at runtime.

**Prerequisites:**
- Enable **Private Comments** in the Velt Console. Without it, visibility choices do not filter the audience.
- Set `isContextEnabled: true` on your Permission Provider to enforce Access Context.

**Verification Checklist:**
- [ ] Private Comments enabled in the Velt Console
- [ ] Permission Provider sets `isContextEnabled: true` when Access Context must be enforced
- [ ] Visibility is set separately from context; context is never used as the only privacy control
- [ ] No Access Context field is named `organizationPrivate`
- [ ] `updateContext()` uses `{ merge: true }` when other access keys must be kept

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#private-comments-with-access-context - Private comments with Access Context
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatecontext - updateContext
- https://docs.velt.dev/key-concepts/overview#d-set-feature-level-permissions-using-access-context - Access Context permissions
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#notifications-for-private-comments - Notifications for private comments
- https://docs.velt.dev/webhooks/advanced#comment-visibility - Comment visibility on webhooks
