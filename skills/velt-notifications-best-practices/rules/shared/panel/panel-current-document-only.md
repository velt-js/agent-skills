---
title: Filter Notifications to Current Document Only
impact: MEDIUM
impactDescription: Reduces notification noise by showing only current document notifications
tags: notifications, panel, document, filtering, documentId, primitives
---

## Filter Notifications to Current Document Only

By default, the notification panel shows notifications from the 15 most recently active documents accessible to the current user. Use `enableCurrentDocumentOnly()` to restrict the panel to notifications from the current document only.

**Incorrect (no document filtering when only current doc matters):**

```jsx
// Shows notifications from all recent documents — too noisy for single-document views
<VeltNotificationsTool />
```

**Correct (React / Next.js — using useNotificationUtils hook):**

```jsx
import { useNotificationUtils } from '@veltdev/react';
import { useEffect } from 'react';

function DocumentNotifications() {
  const notificationElement = useNotificationUtils();

  useEffect(() => {
    if (!notificationElement) return;

    // Show only notifications from the current document
    notificationElement.enableCurrentDocumentOnly();

    // To restore default behavior (show all recent documents):
    // notificationElement.disableCurrentDocumentOnly();
  }, [notificationElement]);

  return <VeltNotificationsTool />;
}
```

**Correct (React / Next.js — using API):**

```jsx
import { useVeltClient } from '@veltdev/react';

function DocumentNotifications() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const notificationElement = client.getNotificationElement();
    notificationElement.enableCurrentDocumentOnly();
  }, [client]);
}
```

**Correct (Other Frameworks):**

```jsx
const notificationElement = Velt.getNotificationElement();
notificationElement.enableCurrentDocumentOnly();

// To restore default:
notificationElement.disableCurrentDocumentOnly();
```

**Primitive-Level Document Scoping (`documentId`):**

When building a custom panel out of primitives instead of `VeltNotificationsTool`, pass `documentId` to `VeltNotificationsPanelContentList` and `VeltNotificationsPanelContentLoadMore` to render and paginate notifications for a single document from `notificationsByDocumentId`. This scopes the list/load-more to that document without flipping the global `enableCurrentDocumentOnly()` switch.

```jsx
import {
  VeltNotificationsPanelContentList,
  VeltNotificationsPanelContentLoadMore,
} from '@veltdev/react';

<VeltNotificationsPanelContentList documentId="doc-123" />
<VeltNotificationsPanelContentLoadMore documentId="doc-123" />
```

```html
<velt-notifications-panel-content-list document-id="doc-123"></velt-notifications-panel-content-list>
<velt-notifications-panel-content-load-more document-id="doc-123"></velt-notifications-panel-content-load-more>
```

`documentId` is ignored when `notifications` is bound directly to the list primitive.

**Verification Checklist:**
- [ ] `enableCurrentDocumentOnly()` called after Velt client is initialized
- [ ] Document ID is set via `setDocument()` before enabling
- [ ] `disableCurrentDocumentOnly()` used when switching back to multi-document view
- [ ] When using primitives, the same `documentId` is passed to both the list and the matching load-more so pagination stays scoped to that document

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - enableCurrentDocumentOnly
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/primitives - VeltNotificationsPanelContentList, VeltNotificationsPanelContentLoadMore
