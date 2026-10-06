---
name: velt-view-analytics-best-practices
description: "Best practices for Velt View Analytics, the who-viewed-this-document indicator with a count badge, recent-viewers dialog, and per-user or per-date view data. Use when adding VeltViewAnalytics, scoping it with type=location and location-id, reading views with useUniqueViewsByUser / useUniqueViewsByDate, useViewsUtils, or getViewsElement observables, or customizing view-analytics wireframes (todayViewsCount, treadsVisible). Triggers on document view counts or recent viewers, even without the word Velt."
license: MIT
metadata:
  author: velt
  version: "1.0.1"
---

# Velt View Analytics Best Practices

Implementation guide for the Velt View Analytics feature — a "who viewed this document today" indicator with a trigger badge, a recent-viewers dialog (desktop) and bottom sheet (mobile), and observable / hook APIs for aggregating views by user or by date.

## When to Apply

Reference these guidelines when:
- Placing `<VeltViewAnalytics>` (or `<velt-view-analytics>`) in your toolbar
- Scoping to a sub-document with `type="location"` + `location-id`
- Reading unique-view counts from React (`useUniqueViewsByUser`, `useUniqueViewsByDate` hooks; `useViewsUtils()` for the element) or non-React (`Velt.getViewsElement().get*().subscribe(...)`) code
- Including `'views'` in a v6 `featureAllowList`
- Building a fully custom trigger badge / viewer list using the wireframe tags (`<velt-view-analytics-wireframe>`, `<velt-view-analytics-dialog-wireframe>`, `<velt-view-analytics-bottom-sheet-wireframe>`)
- Reading `componentConfig.*` template variables (`todayViewsCount`, `totalUniqueViewsCount`, `treadsVisible`, `userViews`, `bottomSheetMode`, etc.)

For general SDK setup, see `velt-setup-best-practices` for `VeltProvider`, auth, and document identity.

## Naming gotcha — `getViewsElement` (plural) and `useViewsUtils`

The element handle is **`client.getViewsElement()`** (plural) — not `getViewElement` (singular). Calling `getViewElement()` is a common hallucination from base models; it does not exist. In React, the element hook is **`useViewsUtils()`**; `useViewsElement` is not exported by `@veltdev/react` (the docs corrected this name in August 2026).

## `treadsVisible` (intentional spelling)

The wireframe-variable name for "dialog is open" is **`componentConfig.treadsVisible`** — spelled `treads` (not `threads`). This is an SDK-side legacy spelling; using `threadsVisible` returns undefined silently. Bind dialog open/close styling on `treadsVisible`.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | API | HIGH | `api-` |
| 2 | Wireframe Variables | MEDIUM | `wireframe-variables-` |

## Quick Reference

### API (HIGH)
- `api-setup` — `<VeltViewAnalytics>` placement; `type="location"` + `location-id` props for location-scoped trigger; `featureAllowList` key `'views'`
- `api-views-subscriptions` — React hooks (`useViewsUtils` for the handle; `useUniqueViewsByUser` / `useUniqueViewsByDate` for data) and non-React observable form (`client.getViewsElement().get*().subscribe`); canonical return types (`Observable<ViewsByUser[]>` / `Observable<ViewsByDate[]>`); optional `locationId` filter; subscription cleanup

### Wireframe Variables (MEDIUM)
- `wireframe-variables-view-analytics` — three wireframe tags (trigger / dialog / bottom-sheet); full `componentConfig.*` reference for each scope; `treadsVisible` spelling; flat-config access pattern (always use `componentConfig.<path>`)

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/api/api-setup.md
rules/shared/api/api-views-subscriptions.md
rules/shared/wireframe-variables/wireframe-variables-view-analytics.md
```

Each rule contains:
- Why it matters
- React / Next.js + Other Frameworks code samples
- Common pitfalls
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
