---
title: Configure Flock Mode (Follow Me)
impact: MEDIUM
impactDescription: Flock mode lets users follow a presenter's navigation through the document
tags: huddle, flock, follow, navigation, VeltHuddle, presenter
---

## Flock Mode — Follow Me Navigation

Flock mode enables a "Follow Me" experience where clicking a user's avatar during a huddle causes your view to follow their navigation. This is useful for presentations, guided walkthroughs, and collaborative reviews where one person leads the group through document sections.

**Why this matters:**

Without flock mode, huddle participants must manually navigate to stay in sync with a presenter. Flock mode automates this, ensuring all followers see exactly what the presenter sees as they move through the document.

**React: Enable via prop**

```jsx
"use client";
import { VeltHuddle } from "@veltdev/react";

function App() {
  return (
    <VeltHuddle flockModeOnAvatarClick={true} />
  );
}
```

**React: Programmatic control via hook**

```jsx
"use client";
import { useHuddleUtils } from "@veltdev/react";

function FlockModeToggle() {
  const huddleElement = useHuddleUtils();

  const enableFlock = () => {
    huddleElement?.enableFlockModeOnAvatarClick();
  };

  const disableFlock = () => {
    huddleElement?.disableFlockModeOnAvatarClick();
  };

  return (
    <div>
      <button onClick={enableFlock}>Enable Follow Mode</button>
      <button onClick={disableFlock}>Disable Follow Mode</button>
    </div>
  );
}
```

**HTML: Flock mode configuration**

```html
<velt-huddle flock-mode-on-avatar-click="true"></velt-huddle>
```

**Key behaviors:**

- When enabled, clicking a participant's avatar in the huddle UI will follow their navigation
- The follower's view automatically scrolls or navigates to match the leader's position
- Any participant can become the leader — simply click their avatar to follow them
- Click your own avatar or use a control to stop following
- Works with document locations and page navigation

**Use cases:**

- Code review walkthroughs where a reviewer guides the team through changes
- Design review sessions where one person navigates the design file
- Onboarding flows where a mentor guides a new user through the interface

**Verification:**
- [ ] `flockModeOnAvatarClick={true}` is set on `VeltHuddle`
- [ ] Clicking a participant's avatar during huddle follows their navigation
- [ ] Followers see the same document section as the leader
- [ ] Following stops when the user clicks their own avatar or navigates independently

**Source Pointers:**
- `https://docs.velt.dev/huddle/customize-behavior` - Huddle flock mode
