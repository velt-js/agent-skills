---
title: Filter Notifications to Current Document Only
impact: MEDIUM
impactDescription: Reduces notification noise by showing only current document notifications
tags: notifications, panel, document, filtering
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

**Verification Checklist:**
- [ ] `enableCurrentDocumentOnly()` called after Velt client is initialized
- [ ] Document ID is set via `setDocument()` before enabling
- [ ] `disableCurrentDocumentOnly()` used when switching back to multi-document view

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - enableCurrentDocumentOnly
