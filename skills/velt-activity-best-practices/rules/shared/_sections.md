# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup required for any Velt activity log implementation. Activity Logs must be enabled in the Velt Console before any SDK or REST API calls will work. Includes the VeltActivityLog drop-in UI component for displaying activity feeds.

---

## 2. Data Access (data)

**Impact:** HIGH
**Description:** Patterns for subscribing to real-time activity feeds and creating custom activity records. Includes React hooks (useAllActivities, useActivityUtils) and SDK APIs (getAllActivities, createActivity via getActivityElement).

---

## 3. Configuration (config)

**Impact:** MEDIUM
**Description:** Configuration options for activity log behavior. Includes CRDT debounce time to control edit batching frequency, immutability toggle for compliance audit trails, and action type constant filtering for type-safe feed scoping.

---

## 4. REST API (rest)

**Impact:** LOW-MEDIUM
**Description:** Server-side activity log management via REST API. Covers Get, Add, Update, and Delete endpoints for programmatic access from backend services.

---

## 5. Debugging & Testing (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns and verification checklists for Velt activity log integrations.

---

## 6. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template variables exposed inside Activity Log wireframe slots and consumed via `<velt-data field="...">`, `velt-if="{var} <op> 'value'"`, and `velt-class="'cls': {var}"`. Covers App State (`user`, `darkMode`), Feature State (`isEnabled`), Data State (`allActivities`, `filteredActivities`, `groupedActivities`, `virtualScrollItems`, `activeFilter`, `availableFilters`), UI State (`isOpen`, `darkMode`, `variant`, `expandedGroups`, `defaultVisibleCount`, `filterDropdownOpen`), loop-scope variables (`dateGroup`, `activity`/`activityRecord`, `filter`/`filterOption`, `isActive`, `isExpanded`, `remainingCount`), the cross-cutting `defaultCondition` / `default-condition` prop, and Angular signal inputs `[componentConfigSignal]` and `[parentLocalUIState]`.

---

## 7. UI Wireframes (ui)

**Impact:** MEDIUM
**Description:** Structural sub-component catalog for the `VeltActivityLogWireframe` tree. Enumerates the 26 named slots grouped by region (Root, Header, Header Filter, List, List Item, States) and shows the canonical React and HTML composition for each region. Pairs with `wireframe-variables` — this section answers "what slots exist and how do they nest"; `wireframe-variables` answers "how do I bind data into those slots".
