---
title: Query suggestions reactively for custom badges and review panels
impact: MEDIUM
impactDescription: Reactive queries keep pending counts and review panels in sync without polling
tags: useSuggestions, usePendingSuggestion, getSuggestions, getSuggestions$, getPendingSuggestion$, filter, status, targetId, SuggestionGetSuggestionsFilter
---

## Query suggestions reactively for custom badges and review panels

Beyond the built-in accept/reject buttons, you can render your own indicators: a "1 pending change" badge on a row, a review panel, or a toolbar count. Query with an optional `SuggestionGetSuggestionsFilter` (`targetId`, `status`), or read the newest pending suggestion for one target.

**Incorrect (one-time snapshot used as live UI):**

```jsx
const pending = client.getSuggestionElement().getSuggestions({ status: 'pending' });
// BUG: a synchronous snapshot; the badge never updates as suggestions are created or resolved
return <span>{pending.length} pending</span>;
```

**Correct (React / Next.js):**

```jsx
import { useSuggestions, usePendingSuggestion } from '@veltdev/react';

function RowBadge() {
  const pendingForRow = useSuggestions({ targetId: 'row.123', status: 'pending' });
  const newest = usePendingSuggestion('row.123'); // newest pending suggestion, or null

  if (!pendingForRow?.length) return null;
  return <span title={newest?.summary}>{pendingForRow.length} pending</span>;
}
```

**Correct (Other Frameworks):**

```js
// Synchronous snapshot (fine for one-off checks)
const pending = suggestionElement.getSuggestions({ status: 'pending' });

// Reactive streams for UI
const listSub = suggestionElement.getSuggestions$({ targetId: 'row.123' }).subscribe((list) => {
  renderBadge(list.length);
});
const pendingSub = suggestionElement.getPendingSuggestion$('row.123').subscribe((s) => {
  highlightTarget('row.123', !!s);
});

// On teardown:
listSub?.unsubscribe();
pendingSub?.unsubscribe();
```

Both filter fields are optional; omit the filter to get every suggestion. `status` takes `'pending' | 'accepted' | 'rejected' | 'stale' | 'apply_failed'`.

**Verification Checklist:**
- [ ] Live UI uses `useSuggestions` / `usePendingSuggestion` or the `$` observables
- [ ] Filters use exact `SuggestionStatus` literals
- [ ] Non-React subscriptions are unsubscribed on teardown

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "5. Get Suggestions"
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestiongetsuggestionsfilter — `SuggestionGetSuggestionsFilter`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#getsuggestions — `getSuggestions()` / `getSuggestions$()` / `getPendingSuggestion$()`
