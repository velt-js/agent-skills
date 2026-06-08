---
name: velt-suggestions-best-practices
description: Velt Suggestions implementation patterns and best practices for React, Next.js, and web applications. Use when adding suggestion mode (propose-then-review workflow), AI agent suggestion comments, accept/reject flows, suggestion targets on form inputs or custom components, suggestion status lifecycle (pending/accepted/rejected/stale), drift detection, or querying suggestions programmatically. Triggers on any task involving Velt suggestions, suggestion mode, data-velt-suggestion-target, SuggestionElement, useSuggestionUtils, enableSuggestionMode, commitSuggestion, suggestionAccepted, suggestionRejected, or building a propose-and-review editing workflow — even if the user doesn't explicitly say 'suggestions'.
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Suggestions Best Practices

Comprehensive guide for implementing Velt's Suggestions API — a propose-then-review editing workflow where edits (from humans or AI agents) are captured as proposals that reviewers accept or reject. Contains 14 rules across 6 categories.

## When to Apply

Reference these guidelines when:
- Adding suggestion mode to form inputs, tables, or custom components
- Implementing an AI-proposes / human-reviews workflow
- Wiring `data-velt-suggestion-target` attributes to DOM elements
- Handling accept/reject events and applying accepted changes
- Querying suggestions by target or status for custom UI
- Understanding suggestion lifecycle states (pending → accepted/rejected/stale)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core | CRITICAL | `core-` |
| 2 | Targets | CRITICAL | `targets-` |
| 3 | Mode | HIGH | `mode-` |
| 4 | Capture | HIGH | `capture-` |
| 5 | Lifecycle | HIGH | `lifecycle-` |
| 6 | Data | MEDIUM | `data-` |

## Prerequisites

Suggestions require Velt **Comments** to be set up — the accept/reject UI renders on the Velt comment dialog. Ensure `VeltProvider` is configured with `authProvider` and Comments are working before adding Suggestions.

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
