---
name: velt-suggestions-best-practices
description: Velt Suggestions best practices for React, Next.js, and web apps. Use when adding suggestion mode (propose-then-review edits by humans or AI agents), suggestion targets, autoCommit or detect-only capture, summaryHtml bodies, accept/reject flows, or the pending/accepted/rejected/stale lifecycle. Triggers on data-velt-suggestion-target, enableSuggestionMode, commitSuggestion, acceptSuggestion, rejectSuggestion, suggestionAccepted, or useSuggestionUtils, even if the user doesn't say 'suggestions'.
license: MIT
metadata:
  author: velt
  version: "1.0.1"
---

# Velt Suggestions Best Practices

Guide for implementing Velt's Suggestions API (Beta): a propose-then-review editing workflow where edits from humans or AI agents are captured as proposals that reviewers accept or reject on the Velt comment dialog. Contains 18 rules across 6 categories.

## When to Apply

Reference these guidelines when:
- Adding suggestion mode to form inputs, tables, or custom components
- Implementing an AI-proposes / human-reviews workflow, in the browser or over REST
- Wiring `data-velt-suggestion-target` attributes to DOM elements
- Choosing between zero-config auto-commit (default since v6.0.0-beta.13), `autoCommit: false`, `onTargetEditCommit`, the `targetEditCommit` event, or manual commits
- Handling accept/reject events and applying accepted changes
- Building custom accept/reject UI with `acceptSuggestion()` / `rejectSuggestion()` (v6.0.9-beta.1)
- Querying suggestions by target or status for custom UI
- Understanding suggestion lifecycle states (pending, accepted, rejected, stale, apply_failed)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core | CRITICAL | `core-` |
| 2 | Targets | CRITICAL | `targets-` |
| 3 | Mode | HIGH | `mode-` |
| 4 | Capture | HIGH | `capture-` |
| 5 | Lifecycle | HIGH | `lifecycle-` |
| 6 | Data | MEDIUM | `data-` |

## Quick Reference

### 1. Core (CRITICAL)
- `core-auth-provider` - `authProvider` object (`user`, `generateToken`, `retryConfig`) on `VeltProvider`, then set the document
- `core-setup-overview` - Comments prerequisite, `SuggestionElement` handle, the five-step pipeline, backfill of `type: 'suggestion'` annotations

### 2. Targets (CRITICAL)
- `targets-define` - stable `data-velt-suggestion-target` IDs, value reading order, commit on `focusout` vs `change`
- `targets-register-getter` - `registerTarget()` getters for multi-input targets that read live values; `unregisterTarget()` cleanup

### 3. Mode (HIGH)
- `mode-enable-disable` - `enableSuggestionMode()` / `disableSuggestionMode()`, not persisted, `autoCommit` cleared on disable
- `mode-state-observation` - `useSuggestionModeState()` / `isSuggestionModeEnabled$()` for toggle UI

### 4. Capture (HIGH)
- `capture-zero-config` - `autoCommit` defaults to `true`; pass `autoCommit: false` for detect-only mode
- `capture-auto-commit` - `onTargetEditCommit` returns `summary` / `summaryHtml` / `metadata` or `null`; always wins over `autoCommit`
- `capture-deferred-commit` - gate commits with the `targetEditCommit` event plus `autoCommit: false`
- `capture-manual` - `startSuggestion()` + `commitSuggestion()` for non-DOM and AI flows; rejection guards
- `capture-summary-html` - `summaryHtml` rich bodies, plain `summary` fallback, DOMPurify sanitizing

### 5. Lifecycle (HIGH)
- `lifecycle-accept-reject` - idempotent `suggestionAccepted` handler on the comment element applies `newValue`
- `lifecycle-resolve-programmatically` - `acceptSuggestion()` / `rejectSuggestion()` and hooks; deprecated `acceptCommentAnnotation()` pair
- `lifecycle-stale-drift` - `suggestionStale`, `driftDetected`, `apply_failed`
- `lifecycle-status-reference` - exact status literals and which element emits each event

### 6. Data (MEDIUM)
- `data-query-suggestions` - `useSuggestions` / `usePendingSuggestion` / `getSuggestions$` with `SuggestionGetSuggestionsFilter`
- `data-types-reference` - `SuggestionData`, `Suggestion<T>` variants, React hooks table
- `data-backend-rest` - REST `type: "suggestion"` with a `suggestion` payload and `agent` block; `agentSuggestions` filter

## Prerequisites

Suggestions require Velt **Comments**: the accept/reject UI renders on the Velt comment dialog. Configure `VeltProvider` with an `authProvider` and set a document, and confirm Comments work before adding Suggestions.

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup-overview.md
rules/shared/capture/capture-zero-config.md
rules/shared/lifecycle/lifecycle-accept-reject.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect and correct code examples (React / Next.js and Other Frameworks)
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` - Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` - Full verbose guide with all rules expanded inline
