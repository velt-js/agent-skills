---
title: Enable and Disable Suggestion Mode
impact: HIGH
tags: enableSuggestionMode, disableSuggestionMode, toggle, suggestion mode
---

## Enable and Disable Suggestion Mode

Enabling suggestion mode activates the capture pipeline. It's global for the current user and not persisted — a page reload returns to normal editing until you enable it again.

**React / Next.js:**
```jsx
import { useEnableSuggestionMode, useDisableSuggestionMode } from '@veltdev/react';

function Toolbar() {
  const { enableSuggestionMode } = useEnableSuggestionMode();
  const { disableSuggestionMode } = useDisableSuggestionMode();

  return (
    <>
      <button onClick={() => enableSuggestionMode()}>Suggest changes</button>
      <button onClick={() => disableSuggestionMode()}>Back to editing</button>
    </>
  );
}
```

**Other Frameworks:**
```js
suggestionElement.enableSuggestionMode();
suggestionElement.disableSuggestionMode();
```

### Passing Configuration

`enableSuggestionMode` accepts an optional `EnableSuggestionModeConfig` to hook into the capture flow (auto-commit via `onTargetEditCommit`). See the capture rules for details.

```jsx
enableSuggestionMode({
  onTargetEditCommit: ({ targetId, oldValue, newValue }) => {
    return { summary: `${targetId}: ${oldValue} → ${newValue}` };
  },
});
```

### Key Points

- Suggestion mode is not persisted across page reloads — re-enable it on mount if needed
- When suggestion mode is off, `commitSuggestion` rejects — always check mode state before manual commits
