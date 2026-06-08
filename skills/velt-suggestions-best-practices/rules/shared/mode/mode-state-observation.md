---
title: Observe Suggestion Mode State Reactively
impact: MEDIUM
tags: useSuggestionModeState, isSuggestionModeEnabled, reactive, toggle UI
---

## Observe Suggestion Mode State

To reactively reflect suggestion mode in your UI (e.g., highlight a "Suggesting" toggle), observe the state rather than reading it once.

**React / Next.js:**
```jsx
import { useSuggestionModeState } from '@veltdev/react';

function SuggestionToggle() {
  const isSuggesting = useSuggestionModeState(); // boolean, updates reactively

  return (
    <div className={isSuggesting ? 'suggesting-active' : ''}>
      {isSuggesting ? 'Suggestion mode ON' : 'Normal editing'}
    </div>
  );
}
```

**Other Frameworks:**
```js
// Synchronous read
const isSuggesting = suggestionElement.isSuggestionModeEnabled();

// Reactive stream
suggestionElement.isSuggestionModeEnabled$().subscribe((isEnabled) => {
  toggleUI.classList.toggle('active', isEnabled);
});
```

### Key Points

- Use the reactive hook/stream to keep UI in sync — don't poll or read once on mount
- `useSuggestionModeState()` returns a boolean that updates automatically
