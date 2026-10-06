# Velt Suggestions Best Practices

**Version 1.0.1**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Suggestions implementation guide covering suggestion targets (data-velt-suggestion-target), suggestion mode (enable/disable), three capture approaches (auto-commit, deferred, manual), accept/reject event handling, suggestion status lifecycle (pending/accepted/rejected/stale/apply_failed), drift detection, and querying suggestions programmatically. Covers the propose-then-review editing workflow for human and AI agent suggestion comments.

---

## Table of Contents

1. [Core](#1-core) — **CRITICAL**
   - 1.1 [Authenticate with the authProvider object on VeltProvider](#11-authenticate-with-the-authprovider-object-on-veltprovider)
   - 1.2 [Understand the Suggestions pipeline and its Comments prerequisite](#12-understand-the-suggestions-pipeline-and-its-comments-prerequisite)

2. [Targets](#2-targets) — **CRITICAL**
   - 2.1 [Register a getter for multi-input targets and read live values](#21-register-a-getter-for-multi-input-targets-and-read-live-values)
   - 2.2 [Tag suggestion targets with a stable data-velt-suggestion-target ID](#22-tag-suggestion-targets-with-a-stable-data-velt-suggestion-target-id)

3. [Mode](#3-mode) — **HIGH**
   - 3.1 [Enable suggestion mode from a toggle and re-enable after reload](#31-enable-suggestion-mode-from-a-toggle-and-re-enable-after-reload)
   - 3.2 [Observe suggestion mode reactively for toggle UI](#32-observe-suggestion-mode-reactively-for-toggle-ui)

4. [Capture](#4-capture) — **HIGH**
   - 4.1 [Create suggestions manually with startSuggestion and commitSuggestion](#41-create-suggestions-manually-with-startsuggestion-and-commitsuggestion)
   - 4.2 [Customize each suggestion with onTargetEditCommit](#42-customize-each-suggestion-with-ontargeteditcommit)
   - 4.3 [Gate commits with the targetEditCommit event and autoCommit false](#43-gate-commits-with-the-targeteditcommit-event-and-autocommit-false)
   - 4.4 [Rely on zero-config auto-commit, or opt out with autoCommit false](#44-rely-on-zero-config-auto-commit-or-opt-out-with-autocommit-false)
   - 4.5 [Render rich suggestion bodies with summaryHtml](#45-render-rich-suggestion-bodies-with-summaryhtml)

5. [Lifecycle](#5-lifecycle) — **HIGH**
   - 5.1 [Apply accepted suggestions from the comment element events](#51-apply-accepted-suggestions-from-the-comment-element-events)
   - 5.2 [Handle stale suggestions, drift, and apply_failed](#52-handle-stale-suggestions-drift-and-applyfailed)
   - 5.3 [Resolve suggestions from your own UI with acceptSuggestion and rejectSuggestion](#53-resolve-suggestions-from-your-own-ui-with-acceptsuggestion-and-rejectsuggestion)
   - 5.4 [Use the suggestion status lifecycle and the two event sources correctly](#54-use-the-suggestion-status-lifecycle-and-the-two-event-sources-correctly)

6. [Data](#6-data) — **MEDIUM**
   - 6.1 [Create and query suggestions from your backend with the comment annotation REST APIs](#61-create-and-query-suggestions-from-your-backend-with-the-comment-annotation-rest-apis)
   - 6.2 [Query suggestions reactively for custom badges and review panels](#62-query-suggestions-reactively-for-custom-badges-and-review-panels)
   - 6.3 [Type against SuggestionData, the Suggestion union, and the hooks table](#63-type-against-suggestiondata-the-suggestion-union-and-the-hooks-table)

---

## 1. Core

**Impact: CRITICAL**

Authentication with the `authProvider` object, the Comments prerequisite, the `SuggestionElement` handle (`useSuggestionUtils()` / `Velt.getSuggestionElement()`), and the enable, snapshot, commit, review, apply pipeline. Suggestions are comment annotations with `type: 'suggestion'`.

### 1.1 Authenticate with the authProvider object on VeltProvider

**Impact: CRITICAL (Suggestions need an authenticated user and a set document; a wrong authProvider shape leaves the SDK unauthenticated and nothing is captured)**

Suggestions run on top of Velt Comments, so the SDK needs an authenticated user and an initialized document before suggestion mode does anything. The recommended path is the `authProvider` **object** on `VeltProvider` (`user`, `generateToken`, optional `retryConfig`), or `Velt.setVeltAuthProvider(...)` outside React. Prefer it over the older `useIdentify()` / `client.identify()` calls in new code.

**Incorrect (callback shape that the SDK does not accept):**

```jsx
// BUG: authProvider is an object, not a callback that receives veltUser
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={async ({ veltUser }) => veltUser({ userId: 'u1', organizationId: 'org-1' })}
>
  <App />
</VeltProvider>
```

**Correct (React / Next.js):**

```jsx
import { VeltProvider } from '@veltdev/react';

const user = {
  userId: 'user-123',
  organizationId: 'org-abc',
  name: 'John Doe',
  email: 'john.doe@example.com',
  photoUrl: 'https://i.pravatar.cc/300',
};

export default function Root() {
  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={{
        user,
        retryConfig: { retryCount: 3, retryDelay: 1000 },
        generateToken: async () => {
          const token = await fetchVeltTokenFromYourBackend();
          return token;
        },
      }}
    >
      <App />
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```js
Velt.setVeltAuthProvider({
  user,
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => fetchVeltTokenFromYourBackend(),
});
```

After authentication, initialize the document (`client.setDocuments([...])` or `useSetDocument(...)`); the SDK does not work until a document is set.

**Verification Checklist:**
- [ ] `authProvider` is an object with `user` (and `generateToken` for production), not a callback
- [ ] `user` includes `userId`, `organizationId`, `name`, `email`, and `photoUrl`
- [ ] A document is set after authentication
- [ ] Comments are set up, because suggestions render on the comment dialog

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart — "Authenticate Users" (`authProvider` on `VeltProvider`, `Velt.setVeltAuthProvider`) and "Initialize Document"
- https://docs.velt.dev/async-collaboration/suggestions/overview — "Overview" (Comments prerequisite)

---

### 1.2 Understand the Suggestions pipeline and its Comments prerequisite

**Impact: CRITICAL (Suggestions are comment annotations with type 'suggestion'; skipping Comments or the apply step means reviewers see nothing or accepted changes never land)**

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

---

## 2. Targets

**Impact: CRITICAL**

Tagging elements with a stable `data-velt-suggestion-target`, how values are read and when edits commit, and registering getters with `registerTarget()` for targets that span several inputs.

### 2.1 Register a getter for multi-input targets and read live values

**Impact: HIGH (A getter that reads saved state instead of the live edit returns the same value twice, so no suggestion is ever created)**

When one target covers several inputs (for example a table row with `qty` and `price`), there is no single `.value` to read. Register a getter that returns the whole object. The SDK calls it on focus to capture `oldValue` and on commit to capture `newValue`, so it must return what the user currently sees.

**Incorrect (getter reads state that only updates after save):**

```jsx
registerTarget({
  targetId: 'row.123',
  // BUG: savedRow only changes after the user saves, so oldValue === newValue
  getter: () => ({ qty: savedRow.qty, price: savedRow.price }),
});
```

**Correct (React / Next.js):**

```jsx
import { useRegisterTarget, useUnregisterTarget } from '@veltdev/react';
import { useEffect } from 'react';

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

**Correct (Other Frameworks):**

```js
suggestionElement.registerTarget({
  targetId: 'row.123',
  getter: () => ({
    qty: Number(document.getElementById('qty-input').value),
    price: Number(document.getElementById('price-input').value),
  }),
});

// Later, to remove the getter:
suggestionElement.unregisterTarget('row.123');
```

Read from the DOM (`input.value`), or for controlled inputs that update state on every keystroke, from that state. `registerTarget()` returns `void`; remove a registration with `unregisterTarget(targetId)`.

**Verification Checklist:**
- [ ] The getter returns live, edit-time values (DOM or per-keystroke state)
- [ ] The getter returns the same shape every time
- [ ] React code unregisters in the `useEffect` cleanup
- [ ] The wrapper element carries the same `data-velt-suggestion-target` as the registered `targetId`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "1. Define Suggestion Targets" (getter Warning and Note)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#registertarget — `registerTarget()` / `unregisterTarget()`

---

### 2.2 Tag suggestion targets with a stable data-velt-suggestion-target ID

**Impact: CRITICAL (An unstable targetId breaks matching between suggestions and elements; untagged elements are never captured)**

A target is any element tagged with `data-velt-suggestion-target="<targetId>"`. The `targetId` is an ID you own and must stay stable across renders, like the ID of the record and field the input edits. If it changes, the SDK cannot match suggestions back to the element.

**Incorrect (random ID on every render):**

```jsx
// BUG: a new ID each render, so pending suggestions never match this input again
<input data-velt-suggestion-target={crypto.randomUUID()} type="number" defaultValue="5" />
```

**Correct (React / Next.js):**

```jsx
<input data-velt-suggestion-target="row.123.qty" type="number" defaultValue="5" />
```

**Correct (Other Frameworks):**

```html
<input data-velt-suggestion-target="row.123.qty" type="number" value="5">
```

**How values are read:** the SDK checks a registered getter first, then the form value (`.value` / `.checked`), then `textContent`. A plain `<input>`, `<textarea>`, `<select>`, or contenteditable needs no `registerTarget` call. Use a getter only when one target spans several inputs (see `targets-register-getter`).

**When an edit commits:**
- Text-like inputs (text, number, date, textarea, contenteditable) commit on `focusout`, so each focus session produces at most one suggestion.
- Dropdowns, checkboxes, and radios commit on `change`.

The SDK installs delegated `focusin` / `change` / `focusout` listeners, so elements added to the DOM later are tracked automatically.

**Verification Checklist:**
- [ ] Every editable element that should produce suggestions has `data-velt-suggestion-target`
- [ ] `targetId` values map to your data model (`row.123.qty`, `field.title`) and never use `Math.random()` or `crypto.randomUUID()`
- [ ] Single primitive inputs do not register a getter unnecessarily

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "1. Define Suggestion Targets" and "Properties"

---

## 3. Mode

**Impact: HIGH**

Turning suggestion mode on and off (`enableSuggestionMode()` / `disableSuggestionMode()`), its non-persisted per-user scope, the `autoCommit` reset on disable, and observing mode state reactively.

### 3.1 Enable suggestion mode from a toggle and re-enable after reload

**Impact: HIGH (Nothing is captured until suggestion mode is on; it resets on reload and disableSuggestionMode() clears the autoCommit opt-out)**

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

---

### 3.2 Observe suggestion mode reactively for toggle UI

**Impact: MEDIUM (A one-time read goes stale when mode changes elsewhere, leaving the toggle out of sync)**

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

---

## 4. Capture

**Impact: HIGH**

The four ways an edit becomes a suggestion: zero-config auto-commit (default since v6.0.0-beta.13) or detect-only with `autoCommit: false`, `onTargetEditCommit`, the gated `targetEditCommit` event, and manual `startSuggestion` / `commitSuggestion`; plus rich `summaryHtml` bodies.

### 4.1 Create suggestions manually with startSuggestion and commitSuggestion

**Impact: HIGH (The only path for non-DOM widgets and AI-proposed changes; commitSuggestion rejects when mode is off, the target is unknown, or the value is unchanged)**

When there is no input for the SDK to watch (a canvas, a custom widget, or an "AI proposes a change" button), create the suggestion yourself. Call `startSuggestion(targetId)` to snapshot the current value as `oldValue`, then `commitSuggestion(config)` with the `newValue`. It resolves to `{ id }`.

**Incorrect (commits without the guards being satisfied):**

```js
// BUG: suggestion mode is off and 'chart.title' is neither tagged nor registered,
// so commitSuggestion rejects and nothing is created.
await suggestionElement.commitSuggestion({ targetId: 'chart.title', newValue: 'Q3 revenue' });
```

**Correct (React / Next.js):**

```jsx
import { useStartSuggestion, useCommitSuggestion } from '@veltdev/react';

function ProposeButton() {
  const { startSuggestion } = useStartSuggestion();
  const { commitSuggestion } = useCommitSuggestion();

  const propose = async () => {
    startSuggestion('row.123'); // snapshot oldValue now
    const { id } = await commitSuggestion({
      targetId: 'row.123',
      newValue: { qty: 7, price: 99 },
      summary: 'Bump qty + price',
      metadata: { source: 'ai-agent' },
    });
    console.log('Created suggestion', id);
  };

  return <button onClick={propose}>Propose change</button>;
}
```

**Correct (Other Frameworks):**

```js
suggestionElement.startSuggestion('row.123');

const { id } = await suggestionElement.commitSuggestion({
  targetId: 'row.123',
  newValue: { qty: 7, price: 99 },
  summary: 'Bump qty + price',
  metadata: { source: 'ai-agent' },
});
```

`commitSuggestion` creates nothing when:
- Suggestion mode is off
- The `targetId` is unknown (not tagged in the DOM and not registered with `registerTarget`)
- `newValue` is identical to the captured `oldValue`

For a server-side agent that has no browser session, create the suggestion over REST instead (see `data-backend-rest`).

**Verification Checklist:**
- [ ] Suggestion mode is enabled before `commitSuggestion`
- [ ] The target is tagged with `data-velt-suggestion-target` or registered with a getter
- [ ] `startSuggestion(targetId)` runs before `commitSuggestion` so `oldValue` is captured
- [ ] The promise rejection is handled

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#3-capture-edits-as-suggestions — "Option 4: Create suggestions manually"
- https://docs.velt.dev/api-reference/sdk/models/data-models#commitsuggestionconfigt — `CommitSuggestionConfig<T>`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#commitsuggestion — `commitSuggestion()`

---

### 4.2 Customize each suggestion with onTargetEditCommit

**Impact: HIGH (The handler controls summary, summaryHtml, and metadata per edit; it always wins over autoCommit, and returning null skips the edit)**

Pass `onTargetEditCommit` when you enable suggestion mode. The SDK calls it with `{ targetId, oldValue, newValue, element }` each time a user finishes an edit. Return an object and the SDK creates the suggestion right away with your `summary`, `summaryHtml`, and `metadata`. Return `null` to skip creating one. The handler always wins over `autoCommit`. `onTargetEditStart` fires when editing begins; it is informational and its return value is reserved.

**Incorrect (expects autoCommit false to block the handler):**

```js
suggestionElement.enableSuggestionMode({
  autoCommit: false, // ignored: onTargetEditCommit is provided
  onTargetEditCommit: ({ targetId, newValue }) => ({ summary: `${targetId} → ${newValue}` }),
});
// BUG: every edit still becomes a suggestion; return null from the handler to skip
```

**Correct (React / Next.js):**

```jsx
import { useEnableSuggestionMode } from '@veltdev/react';

function Toolbar() {
  const { enableSuggestionMode } = useEnableSuggestionMode();

  const startSuggesting = () =>
    enableSuggestionMode({
      onTargetEditStart: ({ targetId, oldValue }) => {
        // Informational: oldValue was just snapshotted
      },
      onTargetEditCommit: ({ targetId, oldValue, newValue }) => {
        if (newValue === '') return null; // skip this edit
        return {
          summary: `${targetId}: ${oldValue} → ${newValue}`,
          metadata: { source: 'inline-edit' },
        };
      },
    });

  return <button onClick={startSuggesting}>Suggest changes</button>;
}
```

**Correct (Other Frameworks):**

```js
suggestionElement.enableSuggestionMode({
  onTargetEditCommit: ({ targetId, oldValue, newValue }) => ({
    summary: `${targetId}: ${oldValue} → ${newValue}`,
    metadata: { source: 'inline-edit' },
  }),
});
```

If a handler commit fails, it no longer blocks a retry: call the `commitSuggestion` function on the `targetEditCommit` event payload to try again. A successful commit is protected against an accidental double commit.

**Verification Checklist:**
- [ ] The handler returns (or resolves to) `{ summary, summaryHtml?, metadata? }`, or `null` to skip the edit
- [ ] Code does not combine `onTargetEditCommit` with `autoCommit: false` expecting detect-only behavior
- [ ] `onTargetEditStart` is used for side effects only

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#3-capture-edits-as-suggestions — "Option 2: Customize each suggestion with `onTargetEditCommit`"
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommitresult — `TargetEditCommitResult`
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommithandlert — `TargetEditCommitHandler<T>`

---

### 4.3 Gate commits with the targetEditCommit event and autoCommit false

**Impact: HIGH (Without autoCommit false the SDK commits first and the event's commitSuggestion becomes a no-op, so validation and confirmation gates silently stop working)**

Use this path when you need to validate a value, ask the user to confirm, or run async logic before a suggestion exists. Enable suggestion mode with `autoCommit: false` and **no** `onTargetEditCommit`, then subscribe to `targetEditCommit` on the suggestion element. The payload carries `details` plus a `commitSuggestion` function already bound to that edit. Call it (optionally overriding `summary`, `summaryHtml`, `metadata`) to create the suggestion, or skip it to discard the edit.

**Incorrect (missing the opt-out):**

```jsx
// BUG: autoCommit defaults to true, so every edit is committed before this effect runs
const commitEvent = useSuggestionEventCallback('targetEditCommit');
useEffect(() => {
  if (commitEvent && isValid(commitEvent.details.newValue)) {
    commitEvent.commitSuggestion({ summary: 'Validated change' });
  }
}, [commitEvent]);
```

**Correct (React / Next.js):**

```jsx
import { useEnableSuggestionMode, useSuggestionEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommitGate() {
  const { enableSuggestionMode } = useEnableSuggestionMode();

  useEffect(() => {
    // Detect-only: without this, the SDK auto-commits before your gate runs.
    enableSuggestionMode({ autoCommit: false });
  }, []);

  const commitEvent = useSuggestionEventCallback('targetEditCommit');

  useEffect(() => {
    if (!commitEvent) return;
    const { details, commitSuggestion } = commitEvent;
    if (isValid(details.newValue)) {
      commitSuggestion({ summary: `Update ${details.targetId}` });
    }
  }, [commitEvent]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
suggestionElement.enableSuggestionMode({ autoCommit: false });

const subscription = suggestionElement
  .on('targetEditCommit')
  .subscribe(({ details, commitSuggestion }) => {
    if (isValid(details.newValue)) {
      commitSuggestion({ summary: `Update ${details.targetId}` });
    }
  });

// On teardown:
subscription?.unsubscribe();
```

The event's `commitSuggestion` returns `Promise<{ id: string }>`. If an earlier auto-commit or handler commit failed, calling it retries; after a successful commit it is a no-op.

**Verification Checklist:**
- [ ] `enableSuggestionMode({ autoCommit: false })` is used, with no `onTargetEditCommit`
- [ ] The subscription is on the suggestion element (`useSuggestionEventCallback` / `suggestionElement.on`), not the comment element
- [ ] Discarded edits simply skip `commitSuggestion`
- [ ] Non-React subscriptions are unsubscribed on teardown

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#3-capture-edits-as-suggestions — "Option 3: Decide per edit with the `targetEditCommit` event"
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommitevent — `TargetEditCommitEvent`
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommitbuilder — `TargetEditCommitBuilder`

---

### 4.4 Rely on zero-config auto-commit, or opt out with autoCommit false

**Impact: CRITICAL (Since v6.0.0-beta.13 a bare enableSuggestionMode() commits every edit; integrations that gate commits themselves must pass autoCommit false or they get duplicate or ungated suggestions)**

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

---

### 4.5 Render rich suggestion bodies with summaryHtml

**Impact: MEDIUM (summaryHtml gives reviewers a formatted diff on the suggestion card; summary stays the plain-text fallback)**

When a suggestion is created, the SDK adds a first comment to its thread; that comment is the body the suggestion card displays. Since v6.0.0-beta.13 you can pass `summaryHtml` alongside `summary` in `commitSuggestion(config)`, in the object returned from `onTargetEditCommit`, or in the overrides passed to the event's `commitSuggestion`. `summaryHtml` becomes the comment's `commentHtml`; `summary` (or the SDK's default diff text) stays in `commentText` as the fallback.

**Incorrect (HTML stuffed into the plain summary):**

```js
await suggestionElement.commitSuggestion({
  targetId: 'price-field',
  newValue: 6000,
  // BUG: summary is escaped and wrapped in <p>, so the tags render as literal text
  summary: '<p>Price: <s>$5,000</s> <b>$6,000</b></p>',
});
```

**Correct (React / Next.js):**

```jsx
import { useCommitSuggestion } from '@veltdev/react';

const { commitSuggestion } = useCommitSuggestion();

await commitSuggestion({
  targetId: 'price-field',
  newValue: 6000,
  summary: 'Price: $5,000 → $6,000',
  summaryHtml: '<p>Price: <s>$5,000</s> <b>$6,000</b></p>',
});
```

**Correct (Other Frameworks):**

```js
await suggestionElement.commitSuggestion({
  targetId: 'price-field',
  newValue: 6000,
  summary: 'Price: $5,000 → $6,000',
  summaryHtml: '<p>Price: <s>$5,000</s> <b>$6,000</b></p>',
});
```

Behavior:
- Only `summary`: `commentHtml` is the HTML-escaped summary wrapped in `<p>`.
- Neither: the SDK renders a default styled diff (old value in red italic, new value in green italic).
- `summaryHtml` is sanitized with DOMPurify at render time: `<script>` tags and event-handler attributes are stripped; inline `style` is kept.

**Verification Checklist:**
- [ ] Rich markup goes in `summaryHtml`, plain text in `summary`
- [ ] A plain `summary` is still provided as the text fallback
- [ ] No reliance on scripts or `onclick` attributes inside `summaryHtml`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#rich-html-summaries-with-summaryhtml — "Rich HTML summaries with `summaryHtml`"
- https://docs.velt.dev/api-reference/sdk/models/data-models#commitsuggestionconfigt — `CommitSuggestionConfig<T>.summaryHtml`
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommitresult — `TargetEditCommitResult.summaryHtml`

---

## 5. Lifecycle

**Impact: HIGH**

Applying accepted changes from `suggestionAccepted` on the comment element, resolving suggestions programmatically with `acceptSuggestion()` / `rejectSuggestion()`, stale and drift handling, and the exact status values and event sources.

### 5.1 Apply accepted suggestions from the comment element events

**Impact: CRITICAL (The SDK never writes accepted values; without an idempotent suggestionAccepted handler on the comment element, approved changes are lost)**

This is the step you cannot skip. When a reviewer clicks **Accept** or **Reject** (or your code calls `acceptSuggestion()` / `rejectSuggestion()`), the SDK updates the suggestion's status but does **not** change your data. Listen for `suggestionAccepted` on the **comment element**, read `commentAnnotation.suggestion.newValue`, and write it to your state or backend.

**Incorrect (wrong element):**

```jsx
// BUG: accept/reject outcomes are emitted on the comment element, not the suggestion element
const accepted = useSuggestionEventCallback('suggestionAccepted');
```

**Correct (React / Next.js):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function ApplyAcceptedSuggestions() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    const suggestion = accepted?.commentAnnotation?.suggestion;
    if (!suggestion) return;
    applyToYourState(suggestion.targetId, suggestion.newValue); // set, never increment
  }, [accepted]);

  useEffect(() => {
    if (rejected?.commentAnnotation) {
      console.log('Rejected:', rejected.rejectReason);
    }
  }, [rejected]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const commentElement = Velt.getCommentElement();

const acceptSub = commentElement.on('suggestionAccepted').subscribe(({ commentAnnotation }) => {
  const suggestion = commentAnnotation?.suggestion;
  applyToYourState(suggestion.targetId, suggestion.newValue);
});

const rejectSub = commentElement.on('suggestionRejected').subscribe(({ rejectReason }) => {
  console.log('Rejected:', rejectReason);
});

// On teardown:
acceptSub?.unsubscribe();
rejectSub?.unsubscribe();
```

**Make the handler idempotent.** It can run more than once (after reconnects, in multiple tabs, and on every client viewing the document). Set the field to `newValue` rather than incrementing it. If the handler throws while applying, the SDK marks the suggestion `apply_failed`.

Payloads: `SuggestionAcceptEvent` has `annotationId`, `commentAnnotation`, `metadata`, `actionUser`; `SuggestionRejectEvent` adds optional `rejectReason`.

**Verification Checklist:**
- [ ] Subscriptions use `useCommentEventCallback` or `commentElement.on()`, not the suggestion element
- [ ] The handler reads `commentAnnotation.suggestion.targetId` and `.newValue`
- [ ] Applying the value is safe to repeat
- [ ] Non-React subscriptions are unsubscribed on teardown

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#4-apply-accepted-suggestions — "4. Apply Accepted Suggestions"
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionacceptevent — `SuggestionAcceptEvent`
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionrejectevent — `SuggestionRejectEvent`

---

### 5.2 Handle stale suggestions, drift, and apply_failed

**Impact: MEDIUM (A suggestion accepted after its target left the page becomes stale instead of accepted; ignoring it leaves reviewers with no feedback)**

If the target DOM node cannot be resolved when a reviewer accepts, the suggestion moves to `stale` instead of `accepted`, and no `suggestionAccepted` event fires for it. Listen for `suggestionStale` on the **suggestion element**. Stale wins over drift: if the node is missing, drift detection is skipped.

**Incorrect (only listens for accepts):**

```jsx
// BUG: accepts on a removed target never reach this handler; the user sees nothing happen
const accepted = useCommentEventCallback('suggestionAccepted');
```

**Correct (React / Next.js):**

```jsx
import { useSuggestionEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function StaleNotice() {
  const staleEvent = useSuggestionEventCallback('suggestionStale');

  useEffect(() => {
    if (staleEvent?.suggestion) {
      notify(`"${staleEvent.suggestion.targetId}" no longer exists, so the change was not applied.`);
    }
  }, [staleEvent]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const subscription = suggestionElement.on('suggestionStale').subscribe(({ suggestion }) => {
  notify(`"${suggestion.targetId}" no longer exists, so the change was not applied.`);
});

// On teardown:
subscription?.unsubscribe();
```

**Drift detection (best-effort):** on accept, if a getter is registered, the SDK compares the live value with `oldValue`. A mismatch sets `driftDetected: true` on the suggestion. v1 only records the flag; there is no confirmation prompt yet. Check `suggestion.driftDetected` in your accept handler if you want to warn before overwriting.

**apply_failed:** if your accept handler throws while applying `newValue`, the SDK marks the suggestion `apply_failed`. It is a status only; there is no dedicated event in v1.

**Verification Checklist:**
- [ ] `suggestionStale` is subscribed on the suggestion element
- [ ] The UI explains stale suggestions to the reviewer
- [ ] The accept handler checks `driftDetected` where overwriting a changed value matters
- [ ] The accept handler catches its own errors to avoid unexpected `apply_failed`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "Properties" (drift and stale) and the Note under "4. Apply Accepted Suggestions"
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionstaleevent — `SuggestionStaleEvent`

---

### 5.3 Resolve suggestions from your own UI with acceptSuggestion and rejectSuggestion

**Impact: HIGH (acceptSuggestion and rejectSuggestion are the only calls that retire a suggestion card; the deprecated acceptCommentAnnotation pair leaves it rendering as a suggestion)**

Since v6.0.9-beta.1 the comment element exposes `acceptSuggestion({ annotationId })` and `rejectSuggestion({ annotationId, reason? })`, the same calls the built-in Accept and Reject buttons make. Both set `suggestion.status` **and** flip `annotation.type` to `'comment'`, which retires the suggestion card into a normal thread, and both emit the existing `suggestionAccepted` / `suggestionRejected` events. They resolve to the event payload, or `null`. React gets `useAcceptSuggestion()` / `useRejectSuggestion()`, and `LazyCommentElement` carries both methods.

**Incorrect (deprecated pair):**

```js
// BUG: deprecated in v6.0.9-beta.1. Writes only the workflow status and never flips
// annotation.type, so the card keeps rendering as a suggestion with an "Accepted" badge.
await commentElement.acceptCommentAnnotation({ annotationId });
```

**Correct (React / Next.js):**

```jsx
// Hook
import { useAcceptSuggestion, useRejectSuggestion } from '@veltdev/react';

const { acceptSuggestion } = useAcceptSuggestion();
const { rejectSuggestion } = useRejectSuggestion();

await acceptSuggestion({ annotationId });
await rejectSuggestion({ annotationId, reason: 'Not applicable' });

// API Method
const commentElement = client.getCommentElement();
await commentElement.acceptSuggestion({ annotationId });
await commentElement.rejectSuggestion({ annotationId, reason: 'Not applicable' });
```

**Correct (Other Frameworks):**

```js
const commentElement = Velt.getCommentElement();

await commentElement.acceptSuggestion({ annotationId });
await commentElement.rejectSuggestion({ annotationId, reason: 'Not applicable' });
```

The request field is `reason`; the emitted `SuggestionRejectEvent` exposes it as `rejectReason`. Your `suggestionAccepted` handler (see `lifecycle-accept-reject`) still applies `newValue`, whether the accept came from the dialog or from these methods. A typical caller is a custom action chip on the suggestion card (the `actions` array on a comment or annotation replaces the built-in Accept/Reject row and emits `commentActionClicked`).

**Verification Checklist:**
- [ ] Custom accept/reject UI calls `acceptSuggestion()` / `rejectSuggestion()`, never `acceptCommentAnnotation()` / `rejectCommentAnnotation()`
- [ ] The reject request passes `reason`, not `rejectReason`
- [ ] React code uses the hooks or `client.getCommentElement()`; other frameworks use `Velt.getCommentElement()`
- [ ] The existing `suggestionAccepted` handler remains the single place that applies `newValue`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#resolve-suggestions-programmatically — "Resolve Suggestions Programmatically"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#acceptsuggestion — `acceptSuggestion()` / `rejectSuggestion()`
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#useacceptsuggestion — `useAcceptSuggestion()` / `useRejectSuggestion()`
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#actions — custom action chips on suggestion cards

---

### 5.4 Use the suggestion status lifecycle and the two event sources correctly

**Impact: HIGH (Status values and event names must match the shipped SDK exactly ('accepted', not 'approved'); subscribing on the wrong element misses events)**

A suggestion moves forward only through these states:

```typescript
type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'stale' | 'apply_failed';
```

| Status | Meaning |
|---|---|
| `pending` | Created and awaiting review |
| `accepted` | A reviewer accepted it; your `suggestionAccepted` handler applies `newValue` |
| `rejected` | A reviewer rejected it (optional `rejectReason`); nothing is applied |
| `stale` | The target DOM node could not be resolved at accept time |
| `apply_failed` | Your accept handler threw while applying; status only, no event in v1 |

**Incorrect (invented status value and wrong element):**

```js
// BUG: the status is 'accepted', not 'approved'; outcomes are emitted on the comment element
suggestionElement.getSuggestions({ status: 'approved' });
suggestionElement.on('suggestionApproved').subscribe(apply);
```

**Correct (subscribe on the element that emits each event):**

```jsx
// React / Next.js
// Hook: suggestion element events
const created = useSuggestionEventCallback('suggestionCreated');
// Hook: comment element events (accept / reject outcomes)
const accepted = useCommentEventCallback('suggestionAccepted');

// API Method
client.getSuggestionElement().on('suggestionCreated').subscribe(handleCreated);
client.getCommentElement().on('suggestionAccepted').subscribe(handleAccepted);
```

```js
// Other Frameworks
Velt.getSuggestionElement().on('suggestionCreated').subscribe(handleCreated);
Velt.getCommentElement().on('suggestionAccepted').subscribe(handleAccepted);
```

| Element | Event | Payload |
|---|---|---|
| Comment element | `suggestionAccepted` | `SuggestionAcceptEvent` (`annotationId`, `commentAnnotation`, `metadata`, `actionUser`) |
| Comment element | `suggestionRejected` | `SuggestionRejectEvent` (adds `rejectReason`) |
| Suggestion element | `suggestionCreated` | `SuggestionCreatedEvent` (`suggestion`) |
| Suggestion element | `suggestionStale` | `SuggestionStaleEvent` (`suggestion`) |
| Suggestion element | `targetEditStart` | `TargetEditStartEvent` (`details`) |
| Suggestion element | `targetEditCommit` | `TargetEditCommitEvent` (`details`, `commitSuggestion`) |

The data-model `SuggestionEventTypesMap` also lists `suggestionApproved` / `suggestionRejected` keys for the suggestion element, but the Suggestions guide documents review outcomes on the comment element. Build accept/reject handling on `suggestionAccepted` / `suggestionRejected` from the comment element.

**Verification Checklist:**
- [ ] Status comparisons use the exact literals above
- [ ] Accept/reject handling subscribes on the comment element
- [ ] Creation, stale, and edit events subscribe on the suggestion element
- [ ] Every `.subscribe()` has a matching `unsubscribe()` on teardown

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#event-subscription — "Event subscription"
- https://docs.velt.dev/async-collaboration/suggestions/overview#lifecycle — "Lifecycle"
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionstatus — `SuggestionStatus`

---

## 6. Data

**Impact: MEDIUM**

Reactive queries (`useSuggestions`, `usePendingSuggestion`, `getSuggestions$`), the `SuggestionData` and `Suggestion<T>` types and hooks table, and backend creation and querying through the v2 Comment Annotations REST APIs.

### 6.1 Create and query suggestions from your backend with the comment annotation REST APIs

**Impact: MEDIUM (Server-side agents have no browser session; REST with type 'suggestion' is how they propose changes, and the server owns suggestion.status)**

Suggestions are stored as comment annotations, so your backend manages them with the v2 Comment Annotations REST APIs. Set the annotation-level `type: "suggestion"`; it is the source of truth for the classification. Attach a `suggestion` object (`targetId`, `targetType`, `oldValue`, `newValue`, `summary`, `driftDetected`, plus any custom fields) so your frontend accept handler can round-trip the change. For agent findings, add an `agent` block to the root comment (`commentData[0]`).

**Incorrect (legacy classification and client-set status):**

```json
{
  "data": {
    "organizationId": "acme-corp",
    "documentId": "design-mockup-v2",
    "commentAnnotations": [
      {
        "commentType": "suggestion",
        "suggestion": { "targetId": "row.123", "newValue": { "x": 305 }, "status": "accepted" },
        "commentData": [{ "commentText": "Bump x", "from": { "userId": "bot" } }]
      }
    ]
  }
}
```

`commentType: "suggestion"` is preserved for backward compatibility but no longer drives classification, and `suggestion.status` is server-owned: a caller-supplied value is dropped and the server stamps `pending`.

**Correct (POST https://api.velt.dev/v2/commentannotations/add):**

```json
{
  "data": {
    "organizationId": "acme-corp",
    "documentId": "design-mockup-v2",
    "commentAnnotations": [
      {
        "type": "suggestion",
        "suggestion": {
          "targetId": "row.123",
          "targetType": "custom",
          "oldValue": { "x": 205 },
          "newValue": { "x": 305 },
          "summary": "row.123: 205 → 305"
        },
        "commentData": [
          {
            "commentText": "Bump x from 205 to 305 to match the spec.",
            "from": { "userId": "spec-bot", "name": "Spec Bot" }
          }
        ]
      }
    ]
  }
}
```

Send it with the `x-velt-api-key` and `x-velt-auth-token` headers. Any `type: "suggestion"` annotation renders the suggestion card (header, diff body, accept/reject actions) in the comment dialog; a human-authored one shows the author's avatar instead of an agent identity. An annotation without a full `suggestion` payload is backfilled to a pending state at render time.

**Querying and cleanup:**
- Get Comment Annotations (v2) with `agentSuggestions: true` returns only fresh (unaccepted) agent suggestions. Only one agent filter may be supplied per request.
- Update Comment Annotations changes annotation-level fields; Delete Comment Annotations removes suggestion threads.

**Verification Checklist:**
- [ ] Requests set annotation-level `type: "suggestion"`, not only `commentType`
- [ ] No `status` is sent inside `suggestion`
- [ ] `targetId` matches the frontend `data-velt-suggestion-target` so the accept handler can apply `newValue`
- [ ] Agent findings put the `agent` block on `commentData[0]`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#backend-apis — "Backend APIs"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations — `type`, `suggestion`, `agent`, examples
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2 — `agentSuggestions` filter
- https://docs.velt.dev/ai/agent-comments — agent findings walkthrough

---

### 6.2 Query suggestions reactively for custom badges and review panels

**Impact: MEDIUM (Reactive queries keep pending counts and review panels in sync without polling)**

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

---

### 6.3 Type against SuggestionData, the Suggestion union, and the hooks table

**Impact: MEDIUM (Narrowing on status and using the shipped hook names avoids runtime undefined fields and invented APIs)**

Suggestions are `CommentAnnotation` objects with `type === 'suggestion'` and a populated `suggestion` field (`SuggestionData`). `Suggestion<T>` is a discriminated union narrowed by `status`.

**Incorrect (reads resolution fields without narrowing):**

```typescript
function resolvedBy(s: Suggestion) {
  return s.resolvedBy.name; // BUG: PendingSuggestion and StaleSuggestion have no resolvedBy
}
```

**Correct (narrow on status first):**

```typescript
function resolvedBy(s: Suggestion): string | undefined {
  if (s.status === 'accepted' || s.status === 'apply_failed' || s.status === 'rejected') {
    return s.resolvedBy.name;
  }
  return undefined;
}
```

#### SuggestionData (on `CommentAnnotation.suggestion`)

| Property | Type | Required | Notes |
|---|---|---|---|
| `annotationId` | `string` | Yes | Parent `CommentAnnotation` ID |
| `targetId` | `string` | Yes | Registered target ID |
| `targetType` | `SuggestionTargetType` | Yes | v1: always `'custom'` |
| `status` | `SuggestionStatus` | Yes | Current lifecycle state |
| `oldValue` / `newValue` | `unknown` | Yes | Snapshot and proposed value |
| `summary` | `string` | No | Plain-text description |
| `metadata` | `Record<string, unknown>` | No | Caller-supplied |
| `driftDetected` | `boolean` | No | Live value changed since snapshot |
| `createdBy` / `createdAt` | `User` / `number` | Yes | Author and creation time (ms) |
| `resolvedBy` / `resolvedAt` | `User` / `number` | No | Set on accept or reject |
| `rejectReason` | `string \| null` | No | Set on reject |

Variants: `PendingSuggestion<T>`, `ApprovedSuggestion<T>` (status `'accepted' | 'apply_failed'`), `RejectedSuggestion<T>`, `StaleSuggestion<T>` (no `resolvedBy` / `resolvedAt`). `CommitSuggestionConfig<T>` and `TargetEditCommitResult` both accept `summary`, `summaryHtml`, and `metadata`. `CommentAnnotationSuggestion` is the comment-side state mutated by `acceptSuggestion()` / `rejectSuggestion()`.

#### React hooks

| Hook | Returns |
|---|---|
| `useSuggestionUtils()` | `SuggestionElement` |
| `useEnableSuggestionMode()` / `useDisableSuggestionMode()` | `{ enableSuggestionMode }` / `{ disableSuggestionMode }` |
| `useSuggestionModeState()` | `boolean` (reactive) |
| `useRegisterTarget()` / `useUnregisterTarget()` | `{ registerTarget }` / `{ unregisterTarget }` |
| `useStartSuggestion()` / `useCommitSuggestion()` | `{ startSuggestion }` / `{ commitSuggestion }` |
| `useSuggestions(filter?)` | `Suggestion[]` (reactive) |
| `usePendingSuggestion(targetId)` | `Suggestion \| null` (reactive) |
| `useSuggestionEventCallback(eventType)` | Latest suggestion-element event payload |
| `useAcceptSuggestion()` / `useRejectSuggestion()` | `{ acceptSuggestion }` / `{ rejectSuggestion }` (comment element) |
| `useCommentEventCallback('suggestionAccepted' \| 'suggestionRejected')` | Latest accept / reject payload |

**Verification Checklist:**
- [ ] Code narrows on `status` before reading `resolvedBy`, `resolvedAt`, or `rejectReason`
- [ ] Hook names match the table exactly (no `useSuggestionElement`, no `useAcceptCommentAnnotation`)
- [ ] `apply_failed` is handled as an `ApprovedSuggestion` variant

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestiondata — `SuggestionData` and the `Suggestions` type section
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentannotationsuggestion — `CommentAnnotationSuggestion`
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesuggestionutils — Suggestions hooks

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/suggestions/overview
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestiondata
