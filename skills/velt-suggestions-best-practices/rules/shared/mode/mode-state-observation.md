---
title: Observe suggestion mode reactively for toggle UI
impact: MEDIUM
impactDescription: A one-time read goes stale when mode changes elsewhere, leaving the toggle out of sync
tags: useSuggestionModeState, isSuggestionModeEnabled, isSuggestionModeEnabled$, reactive, toggle UI
---

## Observe suggestion mode reactively for toggle UI

To show the current mode (for example, highlighting a "Suggesting" toggle), subscribe to it instead of reading it once. React gets a boolean hook; other frameworks get a synchronous read plus an observable.

**Incorrect (reads once on mount):**

```jsx
const [isSuggesting] = useState(() => client.getSuggestionElement().isSuggestionModeEnabled());
// BUG: never updates when suggestion mode is enabled or disabled later
```

**Correct (React / Next.js):**

```jsx
import { useSuggestionModeState } from '@veltdev/react';

function SuggestionBadge() {
  const isSuggesting = useSuggestionModeState(); // boolean, updates reactively
  return <span>{isSuggesting ? 'Suggesting' : 'Editing'}</span>;
}
```

**Correct (Other Frameworks):**

```js
// Synchronous read
const isSuggesting = suggestionElement.isSuggestionModeEnabled();

// Reactive stream
const subscription = suggestionElement.isSuggestionModeEnabled$().subscribe((isEnabled) => {
  toggleButton.classList.toggle('active', isEnabled);
});

// On teardown:
subscription?.unsubscribe();
```

**Verification Checklist:**
- [ ] React UI uses `useSuggestionModeState()`
- [ ] Non-React UI subscribes to `isSuggestionModeEnabled$()` and unsubscribes on teardown
- [ ] No polling of `isSuggestionModeEnabled()`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "2. Enable Suggestion Mode"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#issuggestionmodeenabled — `isSuggestionModeEnabled()` / `isSuggestionModeEnabled$()`
