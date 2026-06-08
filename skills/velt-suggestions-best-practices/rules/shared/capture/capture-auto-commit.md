---
title: Auto-Commit Suggestions with onTargetEditCommit
impact: HIGH
tags: onTargetEditCommit, auto-commit, enableSuggestionMode, summary, metadata
---

## Auto-Commit with onTargetEditCommit (Simplest)

Provide `onTargetEditCommit` in the enable config. Return an object with `summary` and optional `metadata`, and the SDK immediately creates the suggestion. This is the default path most apps want.

**React / Next.js:**
```jsx
import { useEnableSuggestionMode } from '@veltdev/react';

function Toolbar() {
  const { enableSuggestionMode } = useEnableSuggestionMode();

  const startSuggesting = () => {
    enableSuggestionMode({
      onTargetEditStart: ({ targetId, oldValue }) => {
        // Informational: user started editing targetId
      },
      onTargetEditCommit: ({ targetId, oldValue, newValue }) => {
        return {
          summary: `${targetId}: ${oldValue} → ${newValue}`,
          metadata: { source: 'inline-edit' },
        };
      },
    });
  };

  return <button onClick={startSuggesting}>Suggest changes</button>;
}
```

**Other Frameworks:**
```js
suggestionElement.enableSuggestionMode({
  onTargetEditCommit: ({ targetId, oldValue, newValue }) => {
    return {
      summary: `${targetId}: ${oldValue} → ${newValue}`,
      metadata: { source: 'inline-edit' },
    };
  },
});
```

### Key Points

- Return an object to auto-create the suggestion; return `null` to skip and handle it yourself
- `onTargetEditStart` is informational in v1 — its return value is reserved for future use
- The three capture approaches (auto-commit, deferred, manual) are mutually exclusive per edit
