# Velt View Analytics Best Practices

**Version 1.0.1**  
Velt  
October 2026

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
   - 1.2 [Read unique view counts with useUniqueViewsByUser / useUniqueViewsByDate or getViewsElement observables](#12-read-unique-view-counts-with-useuniqueviewsbyuser-useuniqueviewsbydate-or-getviewselement-observables)

2. [Wireframe Variables](#2-wireframe-variables) — **MEDIUM**
   - 2.1 [View Analytics wireframe variables — trigger, dialog, and bottom-sheet componentConfig.* bindings](#21-view-analytics-wireframe-variables-trigger-dialog-and-bottom-sheet-componentconfig-bindings)

---

## 1. API

**Impact: HIGH**

Placement of the `<VeltViewAnalytics>` component (and its `<velt-view-analytics>` web-component form), location-scoping props (`type="location"` + `location-id`), and the read-side surface: React hooks (`useUniqueViewsByUser`, `useUniqueViewsByDate`) and the non-React observable form via `client.getViewsElement().get*().subscribe(...)`. Calls out the `getViewsElement` (plural) handle name — `getViewElement` (singular) is a common hallucination and does not exist.

### 1.1 Place the VeltViewAnalytics component; scope to a sub-document with type='location' + location-id

**Impact: HIGH (Single component renders the entire trigger + dialog UX; location props are the only way to scope view counts to a sub-region rather than the whole document)**

The entire feature — the trigger badge, the recent-viewers dialog (desktop), and the bottom sheet (mobile) — is rendered by a single component. Place it wherever you want the badge to appear (usually a toolbar). It does not need to be at the root of the app, but the Velt client must already be initialized (`VeltProvider` wraps your tree).

**Incorrect (location id without the location type):**

```tsx
// BUG: without type="location", the location id is ignored and counts roll up to the whole document
<VeltViewAnalytics location-id="tab-3" />
```

**Correct (React / Next.js): minimal setup:**

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

**Correct (Other Frameworks): minimal setup:**

```html
<div class="toolbar">
  <velt-view-analytics></velt-view-analytics>
</div>
```

#### Scope to a sub-document with `type="location"` + `location-id`

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

#### v6 modular SDK

If you pass `featureAllowList` in the Velt config, include `'views'` (the modular key for View Analytics); otherwise its chunk is not preloaded and the tag renders inert until it loads. `client.preloadViews()` warms it ahead of first use, and calling `getViewsElement()` auto-enables the feature.

**Common pitfalls:**
- DO NOT mount more than one `<VeltViewAnalytics>` instance for the same scope on the same page — duplicates render twice and conflict.
- DO NOT omit `type="location"` if you are passing `location-id` — without `type="location"` the prop is ignored and counts roll up to the whole document.
- DO NOT call `getViewsElement()` (the programmatic handle) before the Velt client is ready — in React, guard on `client` from `useVeltClient()`.

**Verification Checklist:**
- [ ] Exactly one `<VeltViewAnalytics>` per scope is mounted
- [ ] Toolbar placement is inside a tree that's wrapped by `<VeltProvider>` and has a document set
- [ ] Location scoping uses BOTH `type="location"` AND a stable `location-id`
- [ ] The `location-id` value matches the convention used by other Velt features (presence / cursors) on the same sub-region
- [ ] If `featureAllowList` is set, it includes `'views'`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/view-analytics/setup — component placement
- https://docs.velt.dev/async-collaboration/view-analytics/customize-behavior — location props
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadviews — `preloadViews()` and `featureAllowList`

---

### 1.2 Read unique view counts with useUniqueViewsByUser / useUniqueViewsByDate or getViewsElement observables

**Impact: HIGH (The hooks (React) and observables (other frameworks) are the only programmatic surface for view counts; the element hook is useViewsUtils and the handle is getViewsElement (plural))**

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

---

## 2. Wireframe Variables

**Impact: MEDIUM**

Template-variable bindings for the three View Analytics wireframe tags — `<velt-view-analytics-wireframe>` (trigger), `<velt-view-analytics-dialog-wireframe>` (desktop popover), and `<velt-view-analytics-bottom-sheet-wireframe>` (mobile bottom sheet). Uses the **flat-config** access pattern (every read is via `componentConfig.<path>`). Documents the trigger-scope variables (`today`, `todayViewsCount`, `totalUniqueViewsCount`, `treadsVisible`, `customButtonAdded`, `isPhone`) and the dialog/bottom-sheet shared variables (`views`, `usersMap`, `userViews`, `bottomSheetMode`). Calls out the intentional `treadsVisible` (NOT `threadsVisible`) legacy spelling.

### 2.1 View Analytics wireframe variables — trigger, dialog, and bottom-sheet componentConfig.* bindings

**Impact: MEDIUM (The three wireframe tags expose the live data stream behind the default trigger and dialog; binding these is how you build fully custom view-analytics UI without re-subscribing to the hooks)**

View Analytics exposes three wireframe tags. Each receives a `componentConfig.*` data stream and lets you drive content with the three directives: `<velt-data field="...">` for text, `velt-if="{...}"` for conditional rendering, and `velt-class="'cls': {...}"` for class toggling.

This feature uses the **flat-config** access pattern — every variable is referenced via the explicit `componentConfig.<path>` form. Dropping the prefix (`<velt-data field="todayViewsCount" />`) resolves to nothing.

#### Three wireframe tags

```
<velt-view-analytics-wireframe>              The trigger badge. Replaces the default <velt-view-analytics> UI.
<velt-view-analytics-dialog-wireframe>       The desktop popover listing recent viewers.
<velt-view-analytics-bottom-sheet-wireframe> The mobile bottom-sheet variant of the dialog.
```

React equivalents: `VeltViewAnalyticsWireframe`, `VeltViewAnalyticsDialogWireframe`, `VeltViewAnalyticsBottomSheetWireframe`.

#### Spelling gotcha — `treadsVisible` (NOT `threadsVisible`)

The boolean for "dialog is open" is `componentConfig.treadsVisible` — spelled `treads`, a legacy SDK-side spelling. Writing `componentConfig.threadsVisible` resolves to `undefined` silently. Bind dialog open/close styling and conditional dialog rendering on `treadsVisible`.

#### Trigger-scope componentConfig variables

**Trigger variables (`<velt-view-analytics-wireframe>`):**

```
componentConfig.today                  string                        Today's date string (e.g. '2026-05-11').
componentConfig.todayViews             any                           Today's view records.
componentConfig.todayViewsCount        number                        Number of users who viewed today.
componentConfig.totalUniqueViews       Record<string, any>           All unique viewers keyed by userSnippylyId.
componentConfig.totalUniqueViewsCount  number                        Total unique-viewer count.
componentConfig.treadsVisible          boolean                       Dialog is currently open. (NOT threadsVisible.)
componentConfig.customButtonAdded      boolean                       A custom trigger has replaced the default.
componentConfig.isPhone                boolean                       Mobile-layout flag.
```

**Incorrect (misspelled flag and missing prefix):**

```html
<velt-view-analytics-wireframe>
  <!-- BUG: threadsVisible does not exist (it is treadsVisible), and todayViewsCount needs the componentConfig. prefix -->
  <span velt-class="'open': {componentConfig.threadsVisible}"><velt-data field="todayViewsCount"></velt-data></span>
</velt-view-analytics-wireframe>
```

**Correct (React): custom trigger badge:**

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

**Correct (Other Frameworks): custom trigger badge:**

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

#### Dialog / bottom-sheet componentConfig variables

The dialog and bottom-sheet share the same `componentConfig.*` shape — same data, different presentation. They're separate wireframe tags so you can render different markup for desktop vs. mobile.

**Dialog / bottom-sheet variables:**

```
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

#### Don't reach across wireframes

Each wireframe slot only sees its own `componentConfig` scope:
- Trigger-only variables (`todayViewsCount`, `treadsVisible`, etc.) are not visible inside the dialog / bottom-sheet wireframes.
- Dialog/bottom-sheet variables (`userViews`, `usersMap`, `bottomSheetMode`) are not visible inside the trigger wireframe.

If you need a count in the dialog, use `componentConfig.userViews.length` (dialog scope), not `componentConfig.todayViewsCount` (trigger scope).

**Common pitfalls:**
- DO NOT drop the `componentConfig.` prefix — flat-config requires the full path.
- DO NOT spell `componentConfig.threadsVisible` — the correct legacy spelling is `treadsVisible`.
- DO NOT bind dialog-scope variables (`userViews`) inside the trigger wireframe, or vice versa.
- DO NOT use the hooks (`useUniqueViewsByUser`) to power UI inside wireframes — read directly from `componentConfig.*`. The wireframe stream is the right seam.

**Verification Checklist:**
- [ ] All variable reads use the `componentConfig.<path>` form (never bare names)
- [ ] Dialog open/close uses `componentConfig.treadsVisible` (NOT `threadsVisible`)
- [ ] Dialog and bottom-sheet wireframes are gated by `componentConfig.bottomSheetMode` so only one renders at a time
- [ ] Trigger-scope and dialog/bottom-sheet-scope variables are not crossed between wireframes
- [ ] Custom UI built on wireframes does NOT also subscribe via `useUniqueViewsByUser` for the same data

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/view-analytics/wireframe-variables — full variable reference + subcomponent list
- https://docs.velt.dev/ui-customization/template-variables — `velt-data` / `velt-if` / `velt-class` overview

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/view-analytics/overview
- https://docs.velt.dev/async-collaboration/view-analytics/setup
- https://docs.velt.dev/async-collaboration/view-analytics/customize-behavior
- https://docs.velt.dev/ui-customization/features/async/view-analytics/wireframe-variables
- https://docs.velt.dev/api-reference/sdk/api/api-methods#view-analytics
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#view-analytics
