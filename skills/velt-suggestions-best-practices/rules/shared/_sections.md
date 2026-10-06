# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core (core)

**Impact:** CRITICAL
**Description:** Authentication with the `authProvider` object, the Comments prerequisite, the `SuggestionElement` handle (`useSuggestionUtils()` / `Velt.getSuggestionElement()`), and the enable, snapshot, commit, review, apply pipeline. Suggestions are comment annotations with `type: 'suggestion'`.

---

## 2. Targets (targets)

**Impact:** CRITICAL
**Description:** Tagging elements with a stable `data-velt-suggestion-target`, how values are read and when edits commit, and registering getters with `registerTarget()` for targets that span several inputs.

---

## 3. Mode (mode)

**Impact:** HIGH
**Description:** Turning suggestion mode on and off (`enableSuggestionMode()` / `disableSuggestionMode()`), its non-persisted per-user scope, the `autoCommit` reset on disable, and observing mode state reactively.

---

## 4. Capture (capture)

**Impact:** HIGH
**Description:** The four ways an edit becomes a suggestion: zero-config auto-commit (default since v6.0.0-beta.13) or detect-only with `autoCommit: false`, `onTargetEditCommit`, the gated `targetEditCommit` event, and manual `startSuggestion` / `commitSuggestion`; plus rich `summaryHtml` bodies.

---

## 5. Lifecycle (lifecycle)

**Impact:** HIGH
**Description:** Applying accepted changes from `suggestionAccepted` on the comment element, resolving suggestions programmatically with `acceptSuggestion()` / `rejectSuggestion()`, stale and drift handling, and the exact status values and event sources.

---

## 6. Data (data)

**Impact:** MEDIUM
**Description:** Reactive queries (`useSuggestions`, `usePendingSuggestion`, `getSuggestions$`), the `SuggestionData` and `Suggestion<T>` types and hooks table, and backend creation and querying through the v2 Comment Annotations REST APIs.
