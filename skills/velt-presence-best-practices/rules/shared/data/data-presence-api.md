---
title: Use Vanilla JS API for Presence Data
impact: HIGH
impactDescription: Observable-based API for presence data access in non-React or programmatic contexts
tags: presence, api, vanilla-js, observable, subscribe, getPresenceElement, data
---

## Use Vanilla JS API for Presence Data

For non-React applications or programmatic access, use `Velt.getPresenceElement()` (or `client.getPresenceElement()`) to obtain the `PresenceElement` instance. All data methods return Observables that require `.subscribe()` and manual `.unsubscribe()` for cleanup.

**Why this matters:**

The vanilla JS API works in any JavaScript environment -- Angular, Vue, vanilla HTML, or server-triggered logic. The Observable pattern ensures you receive real-time updates as users join, leave, or change state.

**Get PresenceElement**

```js
// From the global Velt object
const presenceElement = Velt.getPresenceElement();

// Or from the client instance
const presenceElement = client.getPresenceElement();
```

**Subscribe to filtered presence data**

```js
const presenceElement = Velt.getPresenceElement();

// Subscribe to online users only
const subscription = presenceElement
  .getData({ statuses: ["online"] })
  .subscribe((response) => {
    // response: PresenceUser[]
    console.log("Online users:", response);
    updateUI(response);
  });

// IMPORTANT: Clean up when done (e.g., on page unload or component destroy)
// subscription.unsubscribe();
```

**Subscribe to state change events**

```js
const presenceElement = Velt.getPresenceElement();

const subscription = presenceElement
  .on("userStateChange")
  .subscribe((data) => {
    // data: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    console.log(`${data.user.name} changed to ${data.state}`);
  });

// Clean up
// subscription.unsubscribe();
```

**Full lifecycle example (vanilla JS)**

```html
<script>
  let presenceSubscription = null;

  function initPresence() {
    const presenceElement = Velt.getPresenceElement();
    if (!presenceElement) return;

    presenceSubscription = presenceElement
      .getData({ statuses: ["online", "away"] })
      .subscribe((users) => {
        const container = document.getElementById("presence-list");
        container.innerHTML = users
          .map((u) => `<span class="avatar">${u.name}</span>`)
          .join("");
      });
  }

  function cleanup() {
    if (presenceSubscription) {
      presenceSubscription.unsubscribe();
      presenceSubscription = null;
    }
  }

  window.addEventListener("beforeunload", cleanup);
</script>
```

**Key patterns:**

- `.getData()` and `.on()` return Observables -- always call `.subscribe()`
- Store the subscription reference and call `.unsubscribe()` on cleanup
- Pass `{ statuses: ['online'] }` to `.getData()` to filter by state
- `presenceElement` may be `null` if called before SDK initialization -- guard accordingly
- `.on('userStateChange')` emits on every state transition for any user in the document

### Verification Checklist

- [ ] `VeltProvider` (or `Velt.init()`) has been initialized with a valid API key
- [ ] `authProvider` has authenticated the user (via VeltProvider prop or `client.setVeltAuthProvider()`)
- [ ] `setDocuments` has been called to scope presence
- [ ] Every `.subscribe()` has a corresponding `.unsubscribe()` on cleanup
- [ ] Guard against `null` when calling `getPresenceElement()` before init completes

> **Source:** Velt Presence Vanilla JS API -- `getPresenceElement()`, `.getData()`, `.on()`
