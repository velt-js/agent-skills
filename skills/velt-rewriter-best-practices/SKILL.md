---
name: velt-rewriter-best-practices
description: "Best practices for the Velt Rewriter, the AI text rewriter that lets users select text and apply AI rewrites or anchor AI comments. Use when calling enableRewriter, subscribing to textSelected, calling askAi (provider routed by model prefix), replaceText, or addComment, toggling the default toolbar, using useAIRewriterUtils, building custom rewriter wireframes, or debugging a rewriter that does nothing inside TipTap or ProseMirror editors. Triggers on AI rewrite or selection-toolbar AI features."
license: MIT
metadata:
  author: velt
  version: "1.2.1"
---

# Velt Rewriter Best Practices

Implementation guide for the Velt Rewriter — an AI text-rewriter primitive that lets users select text and apply AI-generated rewrites or anchor AI-assisted comments. Covers the full client-side pipeline (`enableRewriter` → `on('textSelected')` → `askAi` → `replaceText` / `addComment`), the default-toolbar toggle, AI model typing, and wireframe-driven custom UI.

## When to Apply

Reference these guidelines when:
- Adding AI text-rewrite functionality to a React, Next.js, or web application
- Wiring the canonical Rewriter pipeline (enable → subscribe → generate → apply)
- Calling `askAi` and picking a model — Velt auto-routes the provider from the model prefix
- Replacing DOM text in-place after AI generation (`replaceText`)
- Anchoring AI suggestions as Velt comments on the selected text range (`addComment`)
- Controlling whether Velt's built-in selection toolbar shows (`enableDefaultUI` / `disableDefaultUI`)
- Building a custom Rewriter UI on top of the wireframe primitives (`componentConfig.*` bindings)
- Typing against `RewriterAskAiRequest`, `RewriterReplaceTextRequest`, `RewriterAddCommentRequest`, or `AiModel`
- Debugging a Rewriter that does nothing inside TipTap or another ProseMirror-based editor (since v6.0.16-beta.1, `textSelected` does not fire there and `replaceText()` returns `success: false`)
- Getting the element in React with the `useAIRewriterUtils()` hook

For server-side AI generation via the Velt Python SDK (`sdk.api.rewriter.askAi`), see the `velt-self-hosting-data-best-practices` skill — that path is documented there and is not duplicated here.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | API Methods | HIGH | `api-` |
| 2 | Patterns | HIGH | `patterns-` |
| 3 | Types | MEDIUM | `types-` |
| 4 | Wireframe Variables | MEDIUM | `wireframe-variables-` |

## Quick Reference

### API Methods (HIGH)
- `api-enable-rewriter` — `enableRewriter()` / `disableRewriter()` (feature toggle; distinct from toolbar toggle); `useAIRewriterUtils()` hook; `featureAllowList` key `'rewriter'`
- `api-on-text-selected` — `on('textSelected').subscribe()` and the `TextSelectedEvent` that drives the pipeline; does not fire inside TipTap / ProseMirror editors
- `api-ask-ai` — `askAi()` multi-provider AI generation, auto-routed from model prefix; custom LLM keys via Velt Console
- `api-replace-text` — `replaceText()` for in-place DOM replacement using event-anchor metadata; returns `success: false` inside TipTap / ProseMirror editors
- `api-add-comment` — `addComment()` to anchor a Velt comment annotation to the selected text range
- `api-default-ui-toggle` — `enableDefaultUI()` / `disableDefaultUI()` (toolbar visibility; events keep firing)

### Patterns (HIGH)
- `patterns-end-to-end-flow` — the canonical four-step pipeline and event-threading rules

### Types (MEDIUM)
- `types-ai-model` — `AiModel` union on `RewriterAskAiRequest.model`

### Wireframe Variables (MEDIUM)
- `wireframe-variables-rewriter` — `componentConfig.*` bindings for text-portal, dialog, and bottom-sheet primitives

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/api/api-enable-rewriter.md
rules/shared/api/api-on-text-selected.md
rules/shared/api/api-ask-ai.md
rules/shared/api/api-replace-text.md
rules/shared/api/api-add-comment.md
rules/shared/api/api-default-ui-toggle.md
rules/shared/patterns/patterns-end-to-end-flow.md
rules/shared/types/types-ai-model.md
rules/shared/wireframe-variables/wireframe-variables-rewriter.md
```

Each rule file contains:
- Brief explanation of why it matters
- Correct code example with explanation (React / Next.js + Other Frameworks)
- Common pitfalls and what NOT to do
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
