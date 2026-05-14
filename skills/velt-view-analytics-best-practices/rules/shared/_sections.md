# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. API (api)

**Impact:** HIGH
**Description:** Placement of the `<VeltViewAnalytics>` component (and its `<velt-view-analytics>` web-component form), location-scoping props (`type="location"` + `location-id`), and the read-side surface: React hooks (`useUniqueViewsByUser`, `useUniqueViewsByDate`) and the non-React observable form via `client.getViewsElement().get*().subscribe(...)`. Calls out the `getViewsElement` (plural) handle name — `getViewElement` (singular) is a common hallucination and does not exist.

---

## 2. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template-variable bindings for the three View Analytics wireframe tags — `<velt-view-analytics-wireframe>` (trigger), `<velt-view-analytics-dialog-wireframe>` (desktop popover), and `<velt-view-analytics-bottom-sheet-wireframe>` (mobile bottom sheet). Uses the **flat-config** access pattern (every read is via `componentConfig.<path>`). Documents the trigger-scope variables (`today`, `todayViewsCount`, `totalUniqueViewsCount`, `treadsVisible`, `customButtonAdded`, `isPhone`) and the dialog/bottom-sheet shared variables (`views`, `usersMap`, `userViews`, `bottomSheetMode`). Calls out the intentional `treadsVisible` (NOT `threadsVisible`) legacy spelling.
