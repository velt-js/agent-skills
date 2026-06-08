---
title: Query Suggestions for Custom UI
impact: MEDIUM
tags: useSuggestions, usePendingSuggestion, getSuggestions, filter, status, targetId
---

## Query Suggestions for Custom UI

Beyond the built-in accept/reject buttons, you can query suggestions reactively to build custom indicators (e.g., "1 pending change" badge, custom review panel, count in toolbar).

**React / Next.js:**
```jsx
import { useSuggestions, usePendingSuggestion } from '@veltdev/react';

function SuggestionBadge() {
  // All suggestions, or filter by target / status
  const all = useSuggestions();
  const pendingForRow = useSuggestions({ targetId: 'row.123', status: 'pending' });

  // The newest pending suggestion for one target (or null)
  const pending = usePendingSuggestion('row.123');

  return (
    <div>
      {pendingForRow?.length > 0 && (
        <span className="badge">{pendingForRow.length} pending</span>
      )}
    </div>
  );
}
```

**Other Frameworks:**
```js
// Synchronous snapshot
const pending = suggestionElement.getSuggestions({ status: 'pending' });

// Reactive stream
suggestionElement.getSuggestions$({ targetId: 'row.123' }).subscribe((list) => {
  renderBadge(list.length);
});

// Newest pending for a single target
suggestionElement.getPendingSuggestion$('row.123').subscribe((s) => {
  highlightTarget('row.123', !!s);
});
```

### Filter Options

The `SuggestionGetSuggestionsFilter` supports:
- `targetId` — filter by specific target
- `status` — filter by `'pending'` | `'accepted'` | `'rejected'` | `'stale'` | `'apply_failed'`

Both fields are optional. Omit the filter to get all suggestions.
