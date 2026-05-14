---
title: Place the VeltViewAnalytics component; scope to a sub-document with type='location' + location-id
impact: HIGH
impactDescription: Single component renders the entire trigger + dialog UX; location props are the only way to scope view counts to a sub-region rather than the whole document
tags: view-analytics, VeltViewAnalytics, velt-view-analytics, setup, location, locationId, type
---

## Place the VeltViewAnalytics component

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

### Scope to a sub-document with `type="location"` + `location-id`

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

**Common pitfalls:**
- DO NOT mount more than one `<VeltViewAnalytics>` instance for the same scope on the same page — duplicates render twice and conflict.
- DO NOT omit `type="location"` if you are passing `location-id` — without `type="location"` the prop is ignored and counts roll up to the whole document.
- DO NOT call `getViewsElement()` (the programmatic handle) before the Velt client is ready — in React, guard on `client` from `useVeltClient()`.

**Verification Checklist:**
- [ ] Exactly one `<VeltViewAnalytics>` per scope is mounted
- [ ] Toolbar placement is inside a tree that's wrapped by `<VeltProvider>` and has a document set
- [ ] Location scoping uses BOTH `type="location"` AND a stable `location-id`
- [ ] The `location-id` value matches the convention used by other Velt features (presence / cursors) on the same sub-region

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/view-analytics/setup — component placement
- https://docs.velt.dev/async-collaboration/view-analytics/customize-behavior — location props
