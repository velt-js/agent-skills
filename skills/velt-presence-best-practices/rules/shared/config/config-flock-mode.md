---
title: Configure Flock Mode (Follow Me) for Shared Navigation Sessions
impact: HIGH
impactDescription: Flock mode lets one user lead a shared navigation session where followers' screens mirror the leader's clicks, scrolls, and page navigations
tags: flock-mode, follow-me, flockMode, enableFlockMode, startFollowingUser, stopFollowingUser, defaultFlockNavigation, onNavigate, presence
---

## Configure Flock Mode (Follow Me) for Shared Navigation Sessions

Flock mode is Velt's "follow along" feature (similar to Figma's). One user is the leader, and whatever they do — clicking, scrolling, navigating — happens automatically on every follower's screen.

**How it works:**

Flock mode is an extension of VeltPresence. When enabled, clicking on a user's presence avatar starts a follow session with that user as the leader. All followers' viewports sync to the leader's actions until the session ends.

### Enable Flock Mode

**React: Enable on VeltPresence**

```jsx
<VeltPresence flockMode={true} />
```

**API: Enable programmatically**

```jsx
const presenceElement = client.getPresenceElement();
presenceElement.enableFlockMode();
```

Once enabled, users click on any presence avatar to start following that user.

### Programmatic Follow Control

Use `startFollowingUser()` and `stopFollowingUser()` when you need to trigger follow sessions from custom UI (buttons, menus) rather than avatar clicks.

```jsx
const presenceElement = client.getPresenceElement();

// Start following a specific user
presenceElement.startFollowingUser(userId);

// Stop following — removes current user from the session.
// If no followers remain, the session is destroyed.
presenceElement.stopFollowingUser();
```

### Custom Navigation with onNavigate

**Incorrect (relying on default navigation in a SPA):**

Velt's default flock navigation uses `window.location.href`, which causes full page reloads in single-page apps. In React/Next.js apps with client-side routing, this breaks the SPA experience — state is lost, components remount, and transitions are jarring.

**Correct (use onNavigate callback with your router):**

```jsx
import { useNavigate } from 'react-router-dom';

function Toolbar() {
  const navigate = useNavigate();

  return (
    <VeltPresence
      flockMode={true}
      defaultFlockNavigation={false}
      onNavigate={(pageInfo) => navigate(pageInfo.path)}
    />
  );
}
```

When you provide an `onNavigate` callback, set `defaultFlockNavigation={false}` to disable Velt's built-in `window.location.href` navigation. The callback receives a `PageInfo` object with a `path` property matching the leader's current route.

**Next.js App Router example:**

```jsx
'use client';
import { useRouter } from 'next/navigation';

function Toolbar() {
  const router = useRouter();

  return (
    <VeltPresence
      flockMode={true}
      defaultFlockNavigation={false}
      onNavigate={(pageInfo) => router.push(pageInfo.path)}
    />
  );
}
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flockMode` | `boolean` | `false` | Enable flock mode globally on this presence instance |
| `defaultFlockNavigation` | `boolean` | `true` | Use built-in `window.location.href` navigation. Set to `false` when using `onNavigate` |
| `onNavigate` | `(pageInfo: PageInfo) => void` | - | Callback fired when the leader navigates. Use with your app's router |

### HTML Usage

```html
<velt-presence flock-mode="true"></velt-presence>

<!-- Disable default navigation for custom handling -->
<velt-presence
  flock-mode="true"
  disable-flock-navigation="true"
></velt-presence>
```

Note: the HTML attribute for disabling default navigation is `disable-flock-navigation`, while the React prop is `defaultFlockNavigation={false}` — they express the same setting with inverted polarity.

### Verification

- [ ] `flockMode={true}` is set on VeltPresence
- [ ] Clicking a user's avatar starts following them
- [ ] `defaultFlockNavigation={false}` is set when using `onNavigate`
- [ ] `onNavigate` uses your app's router (not `window.location.href`)
- [ ] `stopFollowingUser()` properly ends the session
- [ ] Test with two browsers: follower's screen mirrors leader's navigation

**Source Pointers:**
- `https://docs.velt.dev/realtime-collaboration/flock-mode/overview` — Feature overview
- `https://docs.velt.dev/realtime-collaboration/flock-mode/setup` — Setup steps
- `https://docs.velt.dev/realtime-collaboration/flock-mode/customize-behavior` — API reference for all flock mode props
