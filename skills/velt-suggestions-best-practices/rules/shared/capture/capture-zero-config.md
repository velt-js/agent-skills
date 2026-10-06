---
title: Rely on zero-config auto-commit, or opt out with autoCommit false
impact: CRITICAL
impactDescription: Since v6.0.0-beta.13 a bare enableSuggestionMode() commits every edit; integrations that gate commits themselves must pass autoCommit false or they get duplicate or ungated suggestions
tags: autoCommit, enableSuggestionMode, zero-config, detect-only, EnableSuggestionModeConfig, default summary
---

## Rely on zero-config auto-commit, or opt out with autoCommit false

`EnableSuggestionModeConfig.autoCommit` defaults to `true`. With no handler, every finished edit on a tagged target becomes a pending suggestion using the SDK's default styled before/after diff. This is the simplest setup. Pass `autoCommit: false` for **detect-only mode**: the `targetEditCommit` event still fires, but nothing is created until you call the `commitSuggestion` function on the event payload. `autoCommit` is ignored when you pass `onTargetEditCommit`.

**Incorrect (pre-v6.0.0-beta.13 gating pattern without the opt-out):**

```js
// BUG: autoCommit defaults to true, so the SDK commits before this gate runs
// and the event's commitSuggestion becomes a no-op for that edit.
suggestionElement.enableSuggestionMode();
suggestionElement.on('targetEditCommit').subscribe(({ details, commitSuggestion }) => {
  if (isValid(details.newValue)) commitSuggestion({ summary: `Update ${details.targetId}` });
});
```

**Correct (React / Next.js):**

```jsx
import { useEnableSuggestionMode } from '@veltdev/react';

const { enableSuggestionMode } = useEnableSuggestionMode();

// Zero-config: edits on tagged targets auto-commit as suggestions.
enableSuggestionMode();

// Detect-only: events fire, nothing commits until you call
// commitSuggestion on the targetEditCommit payload.
enableSuggestionMode({ autoCommit: false });
```

**Correct (Other Frameworks):**

```js
// Zero-config
suggestionElement.enableSuggestionMode();

// Detect-only
suggestionElement.enableSuggestionMode({ autoCommit: false });
```

Pick exactly one capture path per target: zero-config auto-commit, `onTargetEditCommit` (`capture-auto-commit`), the gated `targetEditCommit` event (`capture-deferred-commit`), or manual `startSuggestion` / `commitSuggestion` (`capture-manual`). `disableSuggestionMode()` clears the flag, so a later bare `enableSuggestionMode()` auto-commits again.

**Verification Checklist:**
- [ ] Apps that validate or confirm edits before committing pass `autoCommit: false` and no `onTargetEditCommit`
- [ ] Apps that want the default diff summary call `enableSuggestionMode()` with no handler
- [ ] `autoCommit: false` is passed again after every disable or reload

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#3-capture-edits-as-suggestions — "Option 1: Zero-config auto-commit (default)"
- https://docs.velt.dev/api-reference/sdk/models/data-models#enablesuggestionmodeconfig — `autoCommit`
- https://docs.velt.dev/release-notes/version-6/sdk-changelog — 6.0.0-beta.13 Suggestions entry (auto-commit by default)
