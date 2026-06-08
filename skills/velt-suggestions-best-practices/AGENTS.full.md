# Velt Suggestions Best Practices — Full Guide
|v1.0.0|Velt|June 2026

IMPORTANT: Always use `authProvider` on `<VeltProvider>` for authentication. Never use `useIdentify()` or `client.identify()`:
```jsx
<VeltProvider apiKey="YOUR_API_KEY" authProvider={async ({ veltUser }) => {
  const user = await getAuthenticatedUser();
  veltUser({ userId: user.uid, name: user.displayName, email: user.email, photoUrl: user.photoURL, organizationId: 'your-org-id' });
}}>
```

---

## 1. Core — CRITICAL

### 1.1 Use authProvider for Authentication — Never useIdentify

Authentication must use the `authProvider` callback on `VeltProvider`. The deprecated `useIdentify` hook and `client.identify()` method must never be used.

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  const authProvider = async ({ veltUser }) => {
    const user = await getAuthenticatedUser();
    veltUser({
      userId: user.uid,
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
      organizationId: 'your-org-id',
    });
  };

  return (
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
      <YourApp />
    </VeltProvider>
  );
}
```

### 1.2 Suggestions Setup Overview and Prerequisites

The Suggestions API adds a propose-then-review workflow to any input or component. Edits are captured as proposals (backed by `CommentAnnotation` with `type: 'suggestion'`) that reviewers accept or reject from the comment dialog.

**Prerequisites:** Suggestions require Velt Comments to be set up because the accept/reject UI renders on the comment dialog.

**Getting the SuggestionElement:**

```jsx
import { useSuggestionUtils } from '@veltdev/react';
const suggestionElement = useSuggestionUtils();
```

**The Four-Step Pipeline:**
1. Define targets — tag DOM elements with `data-velt-suggestion-target="<targetId>"`
2. Enable suggestion mode — activates the capture pipeline for the current user
3. Capture edits — choose auto-commit, deferred commit, or manual commit
4. Apply accepted changes — your handler writes `newValue` to your state when a reviewer accepts

The SDK never mutates your data — it captures intent and orchestrates review. Applying the accepted change is your code's responsibility.

**How Commit Works:**
- Text-like inputs (text, number, date, textarea, contenteditable): commit on `focusout`
- Atomic inputs (select, checkbox, radio): commit on `change`

---

## 2. Targets — CRITICAL

### 2.1 Define Suggestion Targets

A target is any element tagged with `data-velt-suggestion-target="<targetId>"`. The `targetId` must be a stable, app-owned identifier.

```jsx
<input data-velt-suggestion-target="row.123.qty" type="number" defaultValue="5" />
```

Use dot-notation or similar stable identifiers: `row.123.qty`, `cell.orderId.status`, `field.title`.

For a single primitive input, the SDK reads the value automatically. No `registerTarget` call is needed.

When one target represents a complex value (an object spanning several controls), register a getter — see next rule.

- The SDK installs delegated listeners, so elements added to the DOM later are automatically tracked
- `targetId` must be stable across re-renders — never use `Math.random()` or `crypto.randomUUID()`

### 2.2 Register Getters for Complex Targets

When a target represents a complex value spanning multiple controls, register a getter:

```jsx
import { useRegisterTarget, useUnregisterTarget } from '@veltdev/react';

function EditableRow() {
  const { registerTarget } = useRegisterTarget();
  const { unregisterTarget } = useUnregisterTarget();

  useEffect(() => {
    registerTarget({
      targetId: 'row.123',
      getter: () => ({
        qty: Number(document.getElementById('qty-input').value),
        price: Number(document.getElementById('price-input').value),
      }),
    });
    return () => unregisterTarget('row.123');
  }, []);

  return (
    <div data-velt-suggestion-target="row.123">
      <input id="qty-input" type="number" defaultValue="5" />
      <input id="price-input" type="number" defaultValue="99" />
    </div>
  );
}
```

**The getter must read live edit-time state.** If your getter reads from app state that only updates after commit, both reads return the same value and no suggestion is ever created. Read from the live DOM (`input.value`).

---

## 3. Mode — HIGH

### 3.1 Enable and Disable Suggestion Mode

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

Suggestion mode is not persisted across page reloads. `enableSuggestionMode` accepts optional config (e.g., `onTargetEditCommit` for auto-commit).

### 3.2 Observe Suggestion Mode State

```jsx
import { useSuggestionModeState } from '@veltdev/react';

function SuggestionToggle() {
  const isSuggesting = useSuggestionModeState();
  return <div>{isSuggesting ? 'Suggestion mode ON' : 'Normal editing'}</div>;
}
```

Use the reactive hook to keep UI in sync — don't poll or read once on mount.

---

## 4. Capture — HIGH

Three mutually exclusive approaches per edit:

### 4.1 Auto-Commit with onTargetEditCommit (Simplest)

```jsx
enableSuggestionMode({
  onTargetEditCommit: ({ targetId, oldValue, newValue }) => {
    return { summary: `${targetId}: ${oldValue} → ${newValue}` };
  },
});
```

Return an object to auto-create the suggestion; return `null` to skip.

### 4.2 Deferred Commit with targetEditCommit Event

```jsx
const commitEvent = useSuggestionEventCallback('targetEditCommit');

useEffect(() => {
  if (!commitEvent) return;
  const { details, commitSuggestion } = commitEvent;
  if (isValid(details.newValue)) {
    commitSuggestion({ summary: `Update ${details.targetId}` });
  }
}, [commitEvent]);
```

Use when you need validation or confirmation before creating the suggestion.

### 4.3 Manual with startSuggestion / commitSuggestion

```jsx
const { startSuggestion } = useStartSuggestion();
const { commitSuggestion } = useCommitSuggestion();

const propose = async () => {
  startSuggestion('row.123');
  const { id } = await commitSuggestion({
    targetId: 'row.123',
    newValue: { qty: 7, price: 99 },
    summary: 'Bump qty + price',
    metadata: { source: 'ai-agent' },
  });
};
```

This is the approach for AI-proposes-human-reviews workflows.

Guards: `commitSuggestion` rejects when suggestion mode is off, `targetId` is unknown, or `newValue` equals the snapshot.

---

## 5. Lifecycle — HIGH

### 5.1 Handle Accept and Reject Events

Accept/reject buttons live on the comment dialog, so subscribe on the **comment element** (not SuggestionElement):

```jsx
import { useCommentEventCallback } from '@veltdev/react';

function ApplyAcceptedSuggestions() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    const suggestion = accepted?.commentAnnotation?.suggestion;
    if (!suggestion) return;
    applyToYourState(suggestion.targetId, suggestion.newValue);
  }, [accepted]);

  useEffect(() => {
    if (rejected?.commentAnnotation) {
      console.log('Rejected:', rejected.rejectReason);
    }
  }, [rejected]);

  return null;
}
```

**Make your accept handler idempotent** — it can fire more than once across reconnects/tabs/clients.

### 5.2 Status Lifecycle

| Status | Meaning |
|--------|---------|
| `pending` | Created and awaiting review |
| `accepted` | Reviewer accepted; your handler applies `newValue` |
| `rejected` | Reviewer rejected (optional `rejectReason`) |
| `stale` | Target DOM node couldn't be resolved at accept time |
| `apply_failed` | Your accept handler threw while applying |

**Two event sources:**
- Comment element: `suggestionAccepted`, `suggestionRejected`
- SuggestionElement: `suggestionCreated`, `suggestionStale`, `targetEditStart`, `targetEditCommit`

### 5.3 Stale and Drift Detection

- Stale: target DOM node missing at accept time → status becomes `stale`
- Drift: getter registered + live value ≠ `oldValue` at accept time → `driftDetected: true`
- `apply_failed`: accept handler throws → status recorded (no v1 event)

---

## 6. Data — MEDIUM

### 6.1 Query Suggestions

```jsx
import { useSuggestions, usePendingSuggestion } from '@veltdev/react';

const all = useSuggestions();
const pendingForRow = useSuggestions({ targetId: 'row.123', status: 'pending' });
const pending = usePendingSuggestion('row.123');
```

Filter by `targetId` and/or `status`. Both optional.

### 6.2 Data Types Reference

Suggestions are stored as `CommentAnnotation` with `type === 'suggestion'` and a populated `suggestion` field (`SuggestionData`).

Key fields: `annotationId`, `targetId`, `targetType`, `status`, `oldValue`, `newValue`, `summary`, `metadata`, `driftDetected`, `createdBy`, `createdAt`, `resolvedBy`, `resolvedAt`, `rejectReason`.

```typescript
type Suggestion<T = unknown> =
  | PendingSuggestion<T>
  | ApprovedSuggestion<T>
  | RejectedSuggestion<T>
  | StaleSuggestion<T>;
```

**React Hooks:** `useSuggestionUtils`, `useEnableSuggestionMode`, `useDisableSuggestionMode`, `useSuggestionModeState`, `useRegisterTarget`, `useUnregisterTarget`, `useStartSuggestion`, `useCommitSuggestion`, `useSuggestions`, `usePendingSuggestion`, `useSuggestionEventCallback`, `useCommentEventCallback`.
