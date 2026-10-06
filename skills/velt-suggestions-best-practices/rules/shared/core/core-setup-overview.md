---
title: Understand the Suggestions pipeline and its Comments prerequisite
impact: CRITICAL
impactDescription: Suggestions are comment annotations with type 'suggestion'; skipping Comments or the apply step means reviewers see nothing or accepted changes never land
tags: suggestions, setup, SuggestionElement, useSuggestionUtils, getSuggestionElement, Comments, prerequisites, pipeline
---

## Understand the Suggestions pipeline and its Comments prerequisite

Suggestion mode turns edits on tagged elements into proposed changes that a reviewer accepts or rejects from the Velt comment dialog. A suggestion is a regular `CommentAnnotation` with `type: 'suggestion'` and a populated `suggestion` field; there is no separate suggestions store. The accept/reject UI renders on the comment dialog, so Velt Comments must already be set up. The feature is in Beta.

**How it works:**

1. You enable suggestion mode. The SDK watches every element tagged with `data-velt-suggestion-target="<targetId>"`, including elements added later.
2. A user focuses a target. The SDK snapshots the current value as `oldValue`.
3. The user commits the edit (blur for text-like inputs, `change` for selects, checkboxes, and radios). If the value changed, the SDK creates a **pending** suggestion. Since v6.0.0-beta.13 this happens automatically by default (`autoCommit: true`).
4. A reviewer accepts or rejects from the comment dialog. The outcome is emitted on the **comment element** as `suggestionAccepted` / `suggestionRejected`.
5. Your app applies the change. The SDK never mutates your data.

**Incorrect (expects the SDK to write the accepted value):**

```jsx
// BUG: no Comments setup and no suggestionAccepted handler.
// Reviewers have no dialog, and accepted values are never written to your state.
enableSuggestionMode();
```

**Correct (get the element once and reuse it):**

```jsx
// React / Next.js
import { useSuggestionUtils } from '@veltdev/react';

const suggestionElement = useSuggestionUtils();
```

```js
// Other Frameworks
const suggestionElement = Velt.getSuggestionElement();
```

In React, the dedicated hooks (`useEnableSuggestionMode`, `useCommitSuggestion`, `useSuggestions`, and others) wrap the element, so you rarely need it directly.

**Properties to remember:**
- Suggestion mode is global for the current user and **not persisted**; a reload returns to normal editing.
- Unchanged values never create suggestions (focus and blur without editing is ignored).
- An annotation marked `type: 'suggestion'` (or `commentType: 'suggestion'`) without a full `suggestion` payload, for example one created over REST, is backfilled to a pending state at render time, so accept and reject still work.
- The suggestion card renders for any `type: 'suggestion'` annotation, human- or agent-authored.

**Verification Checklist:**
- [ ] Velt Comments is set up and renders the comment dialog
- [ ] Targets are tagged, suggestion mode is enabled, and a `suggestionAccepted` handler applies `newValue`
- [ ] The suggestion element comes from `useSuggestionUtils()` (React) or `Velt.getSuggestionElement()`
- [ ] Do not confuse the Suggestions `enableSuggestionMode()` on the suggestion element with the older comment-element `enableSuggestionMode()` listed under Comments in the API reference

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "Overview", "How it works", "Properties"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#getsuggestionelement — `getSuggestionElement()`
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesuggestionutils — `useSuggestionUtils()`
