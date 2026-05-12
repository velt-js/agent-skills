---
name: velt-rewriter-best-practices
description: "Best practices for the Velt Rewriter — the AI text-rewriter primitive that places rewriting suggestions on a target text range with AI-generated rewrite options. Use when adding AI rewriter features, customizing the rewriter dialog / bottom-sheet, or selecting AI models."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Rewriter Best Practices

Implementation guide for the Velt Rewriter feature — an AI text-rewriter primitive that surfaces AI-generated rewrite suggestions on selected text ranges. Contains 2 rules covering the default UI toggle API and the AI model type system.

## When to Apply

Reference these guidelines when:
- Adding AI rewriter functionality to your application
- Controlling whether the default Rewriter selection toolbar appears
- Building a custom Rewriter UI using your own components
- Selecting or configuring AI models for rewrite requests
- Typing against `RewriterAskAiRequest` in TypeScript

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | API Methods | HIGH | `api-` |
| 2 | Types | MEDIUM | `types-` |

## Quick Reference

### API Methods (HIGH)
- `api-default-ui-toggle` — enableDefaultUI() / disableDefaultUI() on RewriterElement

### Types (MEDIUM)
- `types-ai-model` — AiModel union type on RewriterAskAiRequest.model

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/api/api-default-ui-toggle.md
rules/shared/types/types-ai-model.md
```

Each rule file contains:
- Brief explanation of why it matters
- Correct code example with explanation
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
