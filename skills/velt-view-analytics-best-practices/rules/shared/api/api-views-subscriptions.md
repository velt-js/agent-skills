---
title: Read unique view counts — useViewsElement, useUniqueViewsByUser, useUniqueViewsByDate hooks + non-React client.getViewsElement().subscribe pattern
impact: HIGH
impactDescription: The hooks (React) and observable (non-React) are the only programmatic surface for view counts; the handle is getViewsElement (plural) — getViewElement (singular) is a common hallucination and does not exist
tags: view-analytics, useViewsElement, useUniqueViewsByUser, useUniqueViewsByDate, getViewsElement, observable, subscribe, locationId, hooks, ViewsByUser, ViewsByDate
---

## Read unique view counts — hooks and observable subscriptions

Two aggregations are exposed: **by user** (one row per viewer) and **by date** (one row per day, useful for trend charts). Both accept an optional `locationId` to scope the read to a sub-region.

In React, prefer the hooks — they handle lifecycle and re-render. Non-React code uses the same data via the observable form on `client.getViewsElement()`. React also exposes a third hook, `useViewsElement()`, that returns the same `ViewsElement` handle without using `useVeltClient()` — useful when you want to call utility methods on the element directly from a component.

**Return types (from the SDK API reference):**

```
client.getViewsElement()                              → ViewsElement
useViewsElement()                                     → ViewsElement
viewsElement.getUniqueViewsByUser(locationId?)        → Observable<ViewsByUser[]>
viewsElement.getUniqueViewsByDate(locationId?)        → Observable<ViewsByDate[]>
useUniqueViewsByUser(locationId?)                     → ViewsByUser[] (or undefined on first render)
useUniqueViewsByDate(locationId?)                     → ViewsByDate[] (or undefined on first render)
```

### Naming gotcha — `getViewsElement` (plural)

The handle is `client.getViewsElement()` — **plural**. `client.getViewElement()` (singular) is a common base-model hallucination and does not exist. Same naming for the methods: `getUniqueViewsByUser` / `getUniqueViewsByDate`.

### React — use the hooks

Three hooks live on `@veltdev/react`. The two data hooks (`useUniqueViewsByUser`, `useUniqueViewsByDate`) accept an optional `locationId` string to scope to a sub-document; omit it to read whole-document counts. The third hook (`useViewsElement`) returns the `ViewsElement` handle for utility methods.

**React — `useViewsElement`:**

```tsx
import { useViewsElement } from '@veltdev/react';

function ViewsPanel() {
  const viewsElement = useViewsElement();   // ViewsElement | undefined on first render

  // Once available, you can call the same methods as client.getViewsElement():
  //   viewsElement?.getUniqueViewsByUser().subscribe(...);
}
```

Use `useViewsElement` when you want the handle inside a React component without threading `useVeltClient()` — e.g., for `subscribe()` calls in effects, or when the data hooks don't fit your data-flow.

**React — `useUniqueViewsByUser`:**

```tsx
import { useUniqueViewsByUser } from '@veltdev/react';

function ViewersCount() {
  const viewsByUser = useUniqueViewsByUser();          // ViewsByUser[] | undefined
  // or: const viewsByUser = useUniqueViewsByUser('tab-3'); // location-scoped

  return <span>{viewsByUser?.length ?? 0} unique viewers</span>;
}
```

**React — `useUniqueViewsByDate`:**

```tsx
import { useUniqueViewsByDate } from '@veltdev/react';

function ViewsTrend() {
  const viewsByDate = useUniqueViewsByDate();         // ViewsByDate[] | undefined
  // or: const viewsByDate = useUniqueViewsByDate('tab-3');

  // viewsByDate is ViewsByDate[] — one entry per day. Null-guard on first render.
  return <ul>{viewsByDate?.map(d => <li key={d.date}>{d.date}: {d.count}</li>)}</ul>;
}
```

Both hooks return `undefined` on the very first render before Velt resolves the data — null-guard with `?.` / `?? 0`.

### Non-React — observable subscription

For non-React frameworks (or framework-agnostic code), subscribe directly. The observable emits whenever views change.

**Non-React — getUniqueViewsByUser observable:**

```js
const viewsElement = client.getViewsElement();   // PLURAL — getViewsElement, not getViewElement

const subscription = viewsElement
  .getUniqueViewsByUser()                        // pass 'your-location-id' to filter
  .subscribe((viewsByUser) => {
    console.log('Unique views by user:', viewsByUser);
  });

// Later — release the subscription:
// subscription?.unsubscribe();
```

**Non-React — getUniqueViewsByDate observable:**

```js
const viewsElement = client.getViewsElement();

const subscription = viewsElement
  .getUniqueViewsByDate('your-location-id')      // optional locationId arg
  .subscribe((viewsByDate) => {
    console.log('Unique views by date:', viewsByDate);
  });

// subscription?.unsubscribe();
```

Manual `subscription?.unsubscribe()` is required for the observable form — only the React hooks auto-clean.

### Custom UI without the default `<VeltViewAnalytics>`

The hooks and the observable read from the Velt client directly — they don't require `<VeltViewAnalytics>` to be rendered. In practice this means you can build a fully custom badge using just the hook output.

**Verify against your setup, though:** the official docs show `<VeltViewAnalytics>` alongside the hook examples without explicitly stating whether mounting it is required for view tracking to *initialize*. If your custom-UI badge consistently shows 0 viewers, mount `<VeltViewAnalytics>` somewhere (it can be visually hidden) and check whether view-tracking starts. Treat the hooks-only path as the default and the hidden-mount fallback as a known recovery for the edge case.

If you want the default trigger to coexist with custom UI (e.g., your own dropdown alongside the badge), see the `wireframe-variables-view-analytics` rule for the wireframe-tag approach — that's the right surface for "custom UI bound to the same state stream".

**Common pitfalls:**
- DO NOT call `client.getViewElement()` (singular) — it does not exist. The correct handle is `client.getViewsElement()`.
- DO NOT forget `subscription?.unsubscribe()` in the non-React form; the React hooks handle this for you.
- DO NOT assume the hook returns a non-undefined value on the first render — guard with `?.length ?? 0`.
- DO NOT mix hook and observable for the same scope on the same component — pick one to keep state in a single place.

**Verification Checklist:**
- [ ] Element handle is `client.getViewsElement()` (plural), never `getViewElement` (singular)
- [ ] React code uses `useUniqueViewsByUser` / `useUniqueViewsByDate` for data, or `useViewsElement` for the handle; non-React code uses the observable + manual unsubscribe
- [ ] Return types are correctly typed as `ViewsByUser[]` / `ViewsByDate[]` (or `Observable<ViewsByUser[]>` / `Observable<ViewsByDate[]>` for the observable form)
- [ ] `locationId` argument matches the `location-id` used on `<VeltViewAnalytics type="location">` if you want hooks and the default trigger to read the same scope
- [ ] First-render `undefined` is null-guarded
- [ ] If a hooks-only setup reports 0 viewers consistently, try mounting a hidden `<VeltViewAnalytics>` as a fallback to verify whether the component is required for tracking to initialize

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/view-analytics/customize-behavior — hooks + observable forms
- https://docs.velt.dev/api-reference/sdk/api/api-methods#view-analytics — `getUniqueViewsByUser()` / `getUniqueViewsByDate()` signatures and return types (`Observable<ViewsByUser[]>` / `Observable<ViewsByDate[]>`)
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#view-analytics — `useViewsElement()` / `useUniqueViewsByUser()` / `useUniqueViewsByDate()` hook signatures
