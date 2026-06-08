---
title: Suggestions Setup Overview and Prerequisites
impact: CRITICAL
tags: suggestions, setup, SuggestionElement, useSuggestionUtils, Comments, prerequisites
---

## Suggestions Setup Overview

The Suggestions API adds a propose-then-review workflow to any input or component. Edits are captured as proposals (backed by `CommentAnnotation` with `type: 'suggestion'`) that reviewers accept or reject from the comment dialog.

### Prerequisites

Suggestions require Velt **Comments** to be set up because the accept/reject UI renders on the comment dialog. Ensure Comments are working before adding Suggestions.

### Getting the SuggestionElement

All suggestion methods live on the `SuggestionElement` singleton. Get it once and reuse it:

**React / Next.js:**
```jsx
import { useSuggestionUtils } from '@veltdev/react';

const suggestionElement = useSuggestionUtils();
```

**Other Frameworks:**
```js
const suggestionElement = Velt.getSuggestionElement();
```

### The Four-Step Pipeline

1. **Define targets** — tag DOM elements with `data-velt-suggestion-target="<targetId>"`
2. **Enable suggestion mode** — activates the capture pipeline for the current user
3. **Capture edits** — choose auto-commit, deferred commit, or manual commit
4. **Apply accepted changes** — your handler writes `newValue` to your state when a reviewer accepts

The SDK never mutates your data — it captures intent and orchestrates review. Applying the accepted change is your code's responsibility.

### How Commit Works

The commit signal depends on input type:
- **Text-like inputs** (text, number, date, textarea, contenteditable): commit on `focusout` — each focus session produces at most one suggestion
- **Atomic inputs** (select, checkbox, radio): commit on `change` — the selection itself is the intent

The SDK captures intent, not keystrokes.
