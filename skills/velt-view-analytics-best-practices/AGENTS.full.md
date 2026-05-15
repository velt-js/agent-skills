# Velt View Analytics Best Practices

**Version 1.0.0**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt View Analytics implementation guide — the 'viewed today' indicator with trigger badge and recent-viewers dialog. Covers VeltViewAnalytics component placement, location-scoped triggers, React hooks (useUniqueViewsByUser / useUniqueViewsByDate), the non-React client.getViewsElement().get*().subscribe pattern, and the three wireframe tags (velt-view-analytics-wireframe / -dialog-wireframe / -bottom-sheet-wireframe) plus their componentConfig.* template variables.

---

## Table of Contents

1. [API](#1-api) — **HIGH**
   - 1.1 [Place the VeltViewAnalytics component; scope to a sub-document with type='location' + location-id](#11-place-the-veltviewanalytics-component-scope-to-a-sub-document-with-typelocation-location-id)
   - 1.2 [Read unique view counts — useViewsElement, useUniqueViewsByUser, useUniqueViewsByDate hooks + non-React client.getViewsElement().subscribe pattern](#12-read-unique-view-counts-useviewselement-useuniqueviewsbyuser-useuniqueviewsbydate-hooks-non-react-clientgetviewselementsubscribe-pattern)

2. [Wireframe Variables](#2-wireframe-variables) — **MEDIUM**
   - 2.1 [View Analytics wireframe variables — trigger, dialog, and bottom-sheet componentConfig.* bindings](#21-view-analytics-wireframe-variables-trigger-dialog-and-bottom-sheet-componentconfig-bindings)

---

## 1. API

**Impact: HIGH**

Placement of the `<VeltViewAnalytics>` component (and its `<velt-view-analytics>` web-component form), location-scoping props (`type="location"` + `location-id`), and the read-side surface: React hooks (`useUniqueViewsByUser`, `useUniqueViewsByDate`) and the non-React observable form via `client.getViewsElement().get*().subscribe(...)`. Calls out the `getViewsElement` (plural) handle name — `getViewElement` (singular) is a common hallucination and does not exist.

### 1.1 Place the VeltViewAnalytics component; scope to a sub-document with type='location' + location-id

**Impact: HIGH (Single component renders the entire trigger + dialog UX; location props are the only way to scope view counts to a sub-region rather than the whole document)**

The entire feature — the trigger badge, the recent-viewers dialog (desktop), and the bottom sheet (mobile) — is rendered by a single component. Place it wherever you want the badge to appear (usually a toolbar). It does not need to be at the root of the app, but the Velt client must already be initialized (`VeltProvider` wraps your tree).

**Minimal setup (React / Next.js):**

```tsx
import { VeltViewAnalytics } from '@veltdev/react';

export function Toolbar() {
  return (
    <div className="toolbar">
      <VeltViewAnalytics />
    </div>
  );
}
```

**Minimal setup (Other Frameworks):**

```html
<div class="toolbar">
  <velt-view-analytics></velt-view-analytics>
</div>
```

By default, the trigger counts views against the **whole document** (the document id you set via `useSetDocument` / `setDocuments`). To scope the count to a sub-region of the document — e.g., a single tab in a multi-tab document — pass `type="location"` plus a `location-id` (or `locationId` in React JSX) string that identifies the sub-region.

**Location-scoped trigger (React / Next.js):**

```tsx
<VeltViewAnalytics type="location" location-id="tab-3" />
```

The `location-id` value should match the id you use elsewhere when scoping presence / cursors / etc. to the same sub-region. Both views (the badge count) and the recent-viewers dialog will then reflect only viewers who hit that location.

**Location-scoped trigger (Other Frameworks):**

```html
<velt-view-analytics
  type="location"
  location-id="tab-3">
</velt-view-analytics>
```

---

### 1.2 Read unique view counts — useViewsElement, useUniqueViewsByUser, useUniqueViewsByDate hooks + non-React client.getViewsElement().subscribe pattern

**Impact: HIGH (The hooks (React) and observable (non-React) are the only programmatic surface for view counts; the handle is getViewsElement (plural) — getViewElement (singular) is a common hallucination and does not exist)**

Two aggregations are exposed: **by user** (one row per viewer) and **by date** (one row per day, useful for trend charts). Both accept an optional `locationId` to scope the read to a sub-region.

In React, prefer the hooks — they handle lifecycle and re-render. Non-React code uses the same data via the observable form on `client.getViewsElement()`. React also exposes a third hook, `useViewsElement()`, that returns the same `ViewsElement` handle without using `useVeltClient()` — useful when you want to call utility methods on the element directly from a component.

**Return types (from the SDK API reference):**

```typescript
client.getViewsElement()                              → ViewsElement
useViewsElement()                                     → ViewsElement
viewsElement.getUniqueViewsByUser(locationId?)        → Observable<ViewsByUser[]>
viewsElement.getUniqueViewsByDate(locationId?)        → Observable<ViewsByDate[]>
useUniqueViewsByUser(locationId?)                     → ViewsByUser[] (or undefined on first render)
useUniqueViewsByDate(locationId?)                     → ViewsByDate[] (or undefined on first render)
```

The handle is `client.getViewsElement()` — **plural**. `client.getViewElement()` (singular) is a common base-model hallucination and does not exist. Same naming for the methods: `getUniqueViewsByUser` / `getUniqueViewsByDate`.
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
The hooks and the observable read from the Velt client directly — they don't require `<VeltViewAnalytics>` to be rendered. In practice this means you can build a fully custom badge using just the hook output.
**Verify against your setup, though:** the official docs show `<VeltViewAnalytics>` alongside the hook examples without explicitly stating whether mounting it is required for view tracking to *initialize*. If your custom-UI badge consistently shows 0 viewers, mount `<VeltViewAnalytics>` somewhere (it can be visually hidden) and check whether view-tracking starts. Treat the hooks-only path as the default and the hidden-mount fallback as a known recovery for the edge case.
If you want the default trigger to coexist with custom UI (e.g., your own dropdown alongside the badge), see the `wireframe-variables-view-analytics` rule for the wireframe-tag approach — that's the right surface for "custom UI bound to the same state stream".

---

## 2. Wireframe Variables

**Impact: MEDIUM**

Template-variable bindings for the three View Analytics wireframe tags — `<velt-view-analytics-wireframe>` (trigger), `<velt-view-analytics-dialog-wireframe>` (desktop popover), and `<velt-view-analytics-bottom-sheet-wireframe>` (mobile bottom sheet). Uses the **flat-config** access pattern (every read is via `componentConfig.<path>`). Documents the trigger-scope variables (`today`, `todayViewsCount`, `totalUniqueViewsCount`, `treadsVisible`, `customButtonAdded`, `isPhone`) and the dialog/bottom-sheet shared variables (`views`, `usersMap`, `userViews`, `bottomSheetMode`). Calls out the intentional `treadsVisible` (NOT `threadsVisible`) legacy spelling.

### 2.1 View Analytics wireframe variables — trigger, dialog, and bottom-sheet componentConfig.* bindings

**Impact: MEDIUM (The three wireframe tags expose the live data stream behind the default trigger and dialog; binding these is how you build fully custom view-analytics UI without re-subscribing to the hooks)**

View Analytics exposes three wireframe tags. Each receives a `componentConfig.*` data stream and lets you drive content with the three directives: `<velt-data field="...">` for text, `velt-if="{...}"` for conditional rendering, and `velt-class="'cls': {...}"` for class toggling.

This feature uses the **flat-config** access pattern — every variable is referenced via the explicit `componentConfig.<path>` form. Dropping the prefix (`<velt-data field="todayViewsCount" />`) resolves to nothing.

### Three wireframe tags

**Trigger variables (`<velt-view-analytics-wireframe>`):**

```typescript
componentConfig.today                  string                        Today's date string (e.g. '2026-05-11').
componentConfig.todayViews             any                           Today's view records.
componentConfig.todayViewsCount        number                        Number of users who viewed today.
componentConfig.totalUniqueViews       Record<string, any>           All unique viewers keyed by userSnippylyId.
componentConfig.totalUniqueViewsCount  number                        Total unique-viewer count.
componentConfig.treadsVisible          boolean                       Dialog is currently open. (NOT threadsVisible.)
componentConfig.customButtonAdded      boolean                       A custom trigger has replaced the default.
componentConfig.isPhone                boolean                       Mobile-layout flag.
```

**Custom trigger badge (React):**

```tsx
import { VeltViewAnalyticsWireframe } from '@veltdev/react';

<VeltViewAnalyticsWireframe>
  <button
    className="my-trigger"
    veltClass="'is-open': {componentConfig.treadsVisible}">
    <span>Viewed today</span>
    <span className="my-trigger__count">
      <VeltData field="componentConfig.todayViewsCount" />
    </span>
  </button>
</VeltViewAnalyticsWireframe>
```

**Custom trigger badge (Other Frameworks):**

```html
<velt-view-analytics-wireframe>
  <button class="my-trigger"
          velt-class="'is-open': {componentConfig.treadsVisible}, 'is-phone': {componentConfig.isPhone}">
    <span>Viewed today</span>
    <span velt-if="{componentConfig.todayViewsCount} > 0">
      <velt-data field="componentConfig.todayViewsCount"></velt-data>
    </span>
  </button>
</velt-view-analytics-wireframe>
```

The dialog and bottom-sheet share the same `componentConfig.*` shape — same data, different presentation. They're separate wireframe tags so you can render different markup for desktop vs. mobile.

**Dialog / bottom-sheet variables:**

```typescript
componentConfig.views            Views                                          All views by date.
componentConfig.usersMap         Record<userSnippylyId, User>                  Viewers keyed by user id.
componentConfig.userViews        { user: User; timestamp: number }[]            Sorted user-view list.
componentConfig.bottomSheetMode  boolean                                        Bottom-sheet variant is active (mobile).
```

`componentConfig.userViews` is sorted most-recent-first. Index into it (`componentConfig.userViews.0.user.name`) or use `.length` for the count.

**Custom viewer-list dialog (React):**

```tsx
import { VeltViewAnalyticsDialogWireframe } from '@veltdev/react';

<VeltViewAnalyticsDialogWireframe
  veltIf="{componentConfig.treadsVisible} && !{componentConfig.bottomSheetMode}">
  <header>
    <strong><VeltData field="componentConfig.userViews.length" /></strong> recent viewers
  </header>
  <ul className="my-viewer-list">
    <li>
      <VeltData field="componentConfig.userViews.0.user.name" />
      <time><VeltData field="componentConfig.userViews.0.timestamp" /></time>
    </li>
  </ul>
</VeltViewAnalyticsDialogWireframe>
```

**Custom bottom-sheet (mobile):**

```tsx
import { VeltViewAnalyticsBottomSheetWireframe } from '@veltdev/react';

<VeltViewAnalyticsBottomSheetWireframe
  veltIf="{componentConfig.treadsVisible} && {componentConfig.bottomSheetMode}">
  <header>Viewers today</header>
  <ul>
    <li>
      <VeltData field="componentConfig.userViews.0.user.name" />
    </li>
  </ul>
</VeltViewAnalyticsBottomSheetWireframe>
```

The `<velt-view-analytics-bottom-sheet>` primitive's built-in `shouldShow` is gated on `componentConfig.bottomSheetMode === true`. In practice, gate the dialog on `velt-if="{componentConfig.treadsVisible} && !{componentConfig.bottomSheetMode}"` and the bottom sheet on `velt-if="{componentConfig.treadsVisible} && {componentConfig.bottomSheetMode}"` so only one renders at a time.
Each wireframe slot only sees its own `componentConfig` scope:
- Trigger-only variables (`todayViewsCount`, `treadsVisible`, etc.) are not visible inside the dialog / bottom-sheet wireframes.
- Dialog/bottom-sheet variables (`userViews`, `usersMap`, `bottomSheetMode`) are not visible inside the trigger wireframe.
If you need a count in the dialog, use `componentConfig.userViews.length` (dialog scope), not `componentConfig.todayViewsCount` (trigger scope).

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/view-analytics/overview
- https://docs.velt.dev/async-collaboration/view-analytics/setup
- https://docs.velt.dev/async-collaboration/view-analytics/customize-behavior
- https://docs.velt.dev/ui-customization/features/async/view-analytics/wireframe-variables
- https://docs.velt.dev/api-reference/sdk/api/api-methods#view-analytics
