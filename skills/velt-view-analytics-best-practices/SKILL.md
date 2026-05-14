---
name: velt-view-analytics-best-practices
description: "Best practices for Velt View Analytics — the 'who viewed this document today' indicator with a count badge, recent-viewers dialog, and date- or user-aggregated subscriptions. Use whenever the user is adding the VeltViewAnalytics component, scoping it to a sub-document via type='location' + location-id, reading unique-view counts via the React hooks (useUniqueViewsByUser / useUniqueViewsByDate) or the non-React observable form (client.getViewsElement().getUniqueViewsByUser/ByDate().subscribe), building a custom trigger or viewer-list overlay via the velt-view-analytics-wireframe / velt-view-analytics-dialog-wireframe / velt-view-analytics-bottom-sheet-wireframe tags, or binding componentConfig.* template variables (todayViewsCount, totalUniqueViewsCount, treadsVisible, userViews, bottomSheetMode). Trigger on any task involving Velt View Analytics, document view counts, recent-viewers lists, viewers-by-date trends, view aggregation, or VeltViewAnalytics customization — even when the user does not explicitly say 'Velt' or 'view analytics'."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt View Analytics Best Practices

Implementation guide for the Velt View Analytics feature — a "who viewed this document today" indicator with a trigger badge, a recent-viewers dialog (desktop) and bottom sheet (mobile), and observable / hook APIs for aggregating views by user or by date.

## When to Apply

Reference these guidelines when:
- Placing `<VeltViewAnalytics>` (or `<velt-view-analytics>`) in your toolbar
- Scoping to a sub-document with `type="location"` + `location-id`
- Reading unique-view counts from React (`useUniqueViewsByUser`, `useUniqueViewsByDate` hooks) or non-React (`client.getViewsElement().get*().subscribe(...)`) code
- Building a fully custom trigger badge / viewer list using the wireframe tags (`<velt-view-analytics-wireframe>`, `<velt-view-analytics-dialog-wireframe>`, `<velt-view-analytics-bottom-sheet-wireframe>`)
- Reading `componentConfig.*` template variables (`todayViewsCount`, `totalUniqueViewsCount`, `treadsVisible`, `userViews`, `bottomSheetMode`, etc.)

For general SDK setup, see `velt-setup-best-practices` for `VeltProvider`, auth, and document identity.

## Naming gotcha — `getViewsElement` (plural)

The element handle is **`client.getViewsElement()`** (plural) — not `getViewElement` (singular). Calling `getViewElement()` is a common hallucination from base models; it does not exist. The plural form is consistent with the hook/observable names (`getUniqueViewsByUser`, `getUniqueViewsByDate`).

## `treadsVisible` (intentional spelling)

The wireframe-variable name for "dialog is open" is **`componentConfig.treadsVisible`** — spelled `treads` (not `threads`). This is an SDK-side legacy spelling; using `threadsVisible` returns undefined silently. Bind dialog open/close styling on `treadsVisible`.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | API | HIGH | `api-` |
| 2 | Wireframe Variables | MEDIUM | `wireframe-variables-` |

## Quick Reference

### API (HIGH)
- `api-setup` — `<VeltViewAnalytics>` placement; `type="location"` + `location-id` props for location-scoped trigger
- `api-views-subscriptions` — React hooks (`useViewsElement` for the handle; `useUniqueViewsByUser` / `useUniqueViewsByDate` for data) and non-React observable form (`client.getViewsElement().get*().subscribe`); canonical return types (`Observable<ViewsByUser[]>` / `Observable<ViewsByDate[]>`); optional `locationId` filter; subscription cleanup

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
