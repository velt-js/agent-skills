---
title: Enable suggestion mode from a toggle and re-enable after reload
impact: HIGH
impactDescription: Nothing is captured until suggestion mode is on; it resets on reload and disableSuggestionMode() clears the autoCommit opt-out
tags: enableSuggestionMode, disableSuggestionMode, useEnableSuggestionMode, useDisableSuggestionMode, toggle, autoCommit, EnableSuggestionModeConfig
---

## Enable suggestion mode from a toggle and re-enable after reload

Suggestion mode applies to the whole page for the current user and is **not persisted**: a reload returns to normal editing until you enable it again. Since v6.0.0-beta.13 a bare `enableSuggestionMode()` call also auto-commits every finished edit on a tagged target (`autoCommit` defaults to `true`). Pass an optional `EnableSuggestionModeConfig` (`onTargetEditStart`, `onTargetEditCommit`, `autoCommit`) to control how edits become suggestions.

**Incorrect (assumes the opt-out survives a disable / re-enable cycle):**

```js
suggestionElement.enableSuggestionMode({ autoCommit: false });
suggestionElement.disableSuggestionMode();
// BUG: disable clears the autoCommit flag, so this call auto-commits again
suggestionElement.enableSuggestionMode();
```

**Correct (React / Next.js):**

```jsx
import {
  useEnableSuggestionMode,
  useDisableSuggestionMode,
  useSuggestionModeState,
} from '@veltdev/react';

function Toolbar() {
  const { enableSuggestionMode } = useEnableSuggestionMode();
  const { disableSuggestionMode } = useDisableSuggestionMode();
  const isSuggesting = useSuggestionModeState();

  return isSuggesting ? (
    <button onClick={() => disableSuggestionMode()}>Back to editing</button>
  ) : (
    <button onClick={() => enableSuggestionMode()}>Suggest changes</button>
  );
}
```

**Correct (Other Frameworks):**

```js
suggestionElement.enableSuggestionMode();

// Later, return targets to normal editing:
suggestionElement.disableSuggestionMode();
```

If your app relies on detect-only mode, pass `{ autoCommit: false }` on **every** `enableSuggestionMode()` call, including after a reload or a disable.

**Verification Checklist:**
- [ ] Suggestion mode is enabled from a user action or on mount when the app needs it after reload
- [ ] Every `enableSuggestionMode()` call passes the same config (handler or `autoCommit: false`) the app depends on
- [ ] Manual `commitSuggestion` calls happen only while suggestion mode is on (it rejects otherwise)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "2. Enable Suggestion Mode" and the `autoCommit` Note under "3. Capture Edits as Suggestions"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#enablesuggestionmode-1 — `enableSuggestionMode()` / `disableSuggestionMode()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#enablesuggestionmodeconfig — `EnableSuggestionModeConfig`
