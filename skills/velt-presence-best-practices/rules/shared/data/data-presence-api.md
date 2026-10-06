---
title: Use the PresenceElement API for Presence Data
impact: HIGH
impactDescription: Observable-based API for presence data access in non-React or programmatic contexts
tags: presence, api, vanilla-js, observable, subscribe, getPresenceElement, getData, GetPresenceDataResponse, onPresenceUserChange
---

## Use the PresenceElement API for Presence Data

Get the `PresenceElement` with `client.getPresenceElement()` (React) or `Velt.getPresenceElement()` (other frameworks). `getData()` and `on()` return Observables: call `.subscribe()` and keep the subscription so you can `.unsubscribe()` on cleanup.

**Why this matters:**

`getData()` emits a `GetPresenceDataResponse` object, not an array. Treating the emission as `PresenceUser[]` is the most common bug: `response.map` throws and the UI never renders.

**Incorrect (treating the response as an array):**

```js
presenceElement.getData({ statuses: ["online"] }).subscribe((users) => {
  users.forEach((u) => console.log(u.name)); // TypeError: users.forEach is not a function
});
```

**Correct (read `response.data`, which is `PresenceUser[] | null`):**

```js
const presenceElement = Velt.getPresenceElement();

const subscription = presenceElement
  .getData({ statuses: ["online", "away"] })
  .subscribe((response) => {
    if (!response?.data) return; // null while loading
    renderAvatars(response.data);
  });

// On page unload / component destroy
subscription?.unsubscribe();
```

**Query options (`PresenceRequestQuery`, all optional):**

| Field | Type | Use |
|---|---|---|
| `statuses` | `string[]` | Filter by `'online'`, `'away'`, `'offline'` |
| `documentId` | `string` | Query a specific document instead of the current one |
| `organizationId` | `string` | Query a specific organization |

Call `getData()` with no query to get all users.

**Subscribe to state change events:**

```js
const subscription = Velt.getPresenceElement()
  .on("userStateChange")
  .subscribe((event) => {
    // PresenceUserStateChangeEvent: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    console.log(`${event.user.name} is now ${event.state}`);
  });

subscription?.unsubscribe();
```

**Callback alternative on the component:**

`onPresenceUserChange` fires with the filtered `PresenceUser[]` (after `location` / `locationId` filtering) on load and on every change. The older `onUsersChanged` is a deprecated alias.

```jsx
<VeltPresence onPresenceUserChange={(presenceUsers) => setUsers(presenceUsers)} />
```

**Key patterns:**

- `getData()` and `on()` return Observables; always `.subscribe()` and `.unsubscribe()`
- Read `response.data`; it is `null` while loading
- `getOnlineUsersOnCurrentDocument()` on the presence element is deprecated; use `getData()`
- In React, prefer `usePresenceData()` and `usePresenceEventCallback()` (see `data-presence-hooks`)

### Verification Checklist

- [ ] Velt is initialized and the user is authenticated (`authProvider` / `setVeltAuthProvider`)
- [ ] `setDocuments` has been called to scope presence
- [ ] Subscribers read `response.data`, with a `null` check
- [ ] Every `.subscribe()` has a matching `.unsubscribe()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#getdata - "getData"
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#on - "Event Subscription"
- https://docs.velt.dev/api-reference/sdk/models/data-models#getpresencedataresponse - `GetPresenceDataResponse`
- https://docs.velt.dev/api-reference/sdk/models/data-models#presencerequestquery - `PresenceRequestQuery`
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `onPresenceUserChange` behavior
