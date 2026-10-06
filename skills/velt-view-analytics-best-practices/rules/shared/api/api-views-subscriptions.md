---
title: Read unique view counts with useUniqueViewsByUser / useUniqueViewsByDate or getViewsElement observables
impact: HIGH
impactDescription: The hooks (React) and observables (other frameworks) are the only programmatic surface for view counts; the element hook is useViewsUtils and the handle is getViewsElement (plural)
tags: view-analytics, useViewsUtils, useUniqueViewsByUser, useUniqueViewsByDate, getViewsElement, getUniqueViewsByUser, getUniqueViewsByDate, observable, subscribe, locationId, ViewsByUser, ViewsByDate
---

## Read unique view counts with useUniqueViewsByUser / useUniqueViewsByDate or getViewsElement observables

Two aggregations exist: **by user** (one entry per viewer) and **by date** (one entry per day). Both take an optional `locationId` to scope the read to a sub-document. In React, prefer the data hooks; they handle subscription lifecycle. To get the `ViewsElement` itself in React, use `useViewsUtils()`. Other frameworks subscribe to the observables on `getViewsElement()` and unsubscribe manually.

```
client.getViewsElement() / Velt.getViewsElement()   → ViewsElement
useViewsUtils()                                     → ViewsElement
viewsElement.getUniqueViewsByUser(locationId?)      → Observable<ViewsByUser[]>
viewsElement.getUniqueViewsByDate(locationId?)      → Observable<ViewsByDate[]>
useUniqueViewsByUser(locationId?)                   → ViewsByUser[] (null-guard before data arrives)
useUniqueViewsByDate(locationId?)                   → ViewsByDate[] (null-guard before data arrives)
```

**Incorrect (hook and handle names that are not exported):**

```tsx
// BUG: @veltdev/react does not export useViewsElement (the hook is useViewsUtils),
// and the client method is getViewsElement (plural), not getViewElement.
const viewsElement = useViewsElement();
const sameElement = client.getViewElement();
```

**Correct (React / Next.js): data hooks:**

```tsx
import { useUniqueViewsByUser, useUniqueViewsByDate } from '@veltdev/react';

function ViewersCount() {
  const viewsByUser = useUniqueViewsByUser();                     // whole document
  const viewsForTab = useUniqueViewsByUser('tab-3');              // location-scoped
  const viewsByDate = useUniqueViewsByDate();

  return <span>{viewsByUser?.length ?? 0} unique viewers</span>;
}
```

**Correct (React / Next.js): element via hook or client:**

```tsx
import { useViewsUtils, useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function ViewsLogger() {
  // Hook
  const viewsElement = useViewsUtils();
  // API Method (equivalent)
  const { client } = useVeltClient();

  useEffect(() => {
    const element = viewsElement ?? client?.getViewsElement();
    if (!element) return;
    const subscription = element.getUniqueViewsByDate().subscribe((viewsByDate) => {
      console.log('Unique views by date:', viewsByDate);
    });
    return () => subscription?.unsubscribe();
  }, [viewsElement, client]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const viewsElement = Velt.getViewsElement();

const byUser = viewsElement.getUniqueViewsByUser().subscribe((viewsByUser) => {
  console.log('Unique views by user:', viewsByUser);
});

const byDateForTab = viewsElement.getUniqueViewsByDate('tab-3').subscribe((viewsByDate) => {
  console.log('Unique views by date for tab-3:', viewsByDate);
});

// When done:
byUser?.unsubscribe();
byDateForTab?.unsubscribe();
```

The docs show `<VeltViewAnalytics>` next to the hook examples. If a hooks-only custom badge always reports zero viewers, confirm that `<VeltViewAnalytics>` is mounted for that scope.

**Verification Checklist:**
- [ ] React element access uses `useViewsUtils()` or `client.getViewsElement()`, never `useViewsElement` or `getViewElement`
- [ ] Data reads use `useUniqueViewsByUser` / `useUniqueViewsByDate` in React, or the observables elsewhere
- [ ] Observable subscriptions are unsubscribed on teardown
- [ ] The `locationId` passed to hooks matches the `location-id` on `<VeltViewAnalytics type="location">` when both should show the same scope
- [ ] Results are null-guarded before data arrives

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/view-analytics/customize-behavior — "getUniqueViewsByUser" and "getUniqueViewsByDate"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#view-analytics — return types `Observable<ViewsByUser[]>` / `Observable<ViewsByDate[]>`
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#view-analytics — `useViewsUtils()` / `useUniqueViewsByUser()` / `useUniqueViewsByDate()`
