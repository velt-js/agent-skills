---
title: View Analytics wireframe variables — trigger, dialog, and bottom-sheet componentConfig.* bindings
impact: MEDIUM
impactDescription: The three wireframe tags expose the live data stream behind the default trigger and dialog; binding these is how you build fully custom view-analytics UI without re-subscribing to the hooks
tags: view-analytics, wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, treadsVisible, todayViewsCount, totalUniqueViewsCount, userViews, bottomSheetMode, isPhone
---

## View Analytics wireframe variables — trigger, dialog, and bottom-sheet

View Analytics exposes three wireframe tags. Each receives a `componentConfig.*` data stream and lets you drive content with the three directives: `<velt-data field="...">` for text, `velt-if="{...}"` for conditional rendering, and `velt-class="'cls': {...}"` for class toggling.

This feature uses the **flat-config** access pattern — every variable is referenced via the explicit `componentConfig.<path>` form. Dropping the prefix (`<velt-data field="todayViewsCount" />`) resolves to nothing.

### Three wireframe tags

```
<velt-view-analytics-wireframe>              The trigger badge. Replaces the default <velt-view-analytics> UI.
<velt-view-analytics-dialog-wireframe>       The desktop popover listing recent viewers.
<velt-view-analytics-bottom-sheet-wireframe> The mobile bottom-sheet variant of the dialog.
```

React equivalents: `VeltViewAnalyticsWireframe`, `VeltViewAnalyticsDialogWireframe`, `VeltViewAnalyticsBottomSheetWireframe`.

### Spelling gotcha — `treadsVisible` (NOT `threadsVisible`)

The boolean for "dialog is open" is `componentConfig.treadsVisible` — spelled `treads`, a legacy SDK-side spelling. Writing `componentConfig.threadsVisible` resolves to `undefined` silently. Bind dialog open/close styling and conditional dialog rendering on `treadsVisible`.

### Trigger-scope componentConfig variables

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

### Dialog / bottom-sheet componentConfig variables

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

### Don't reach across wireframes

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
