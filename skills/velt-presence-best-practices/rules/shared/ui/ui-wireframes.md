---
title: Customize Presence Avatar UI with Wireframes
impact: MEDIUM
impactDescription: Build fully custom presence avatar layouts using wireframe building blocks
tags: wireframe, customization, ui, avatars, tooltip, shadowDom, VeltPresenceWireframe
---

## Customize Presence Avatar UI with Wireframes

Velt provides wireframe components for complete control over presence avatar rendering. Use `VeltPresenceWireframe` for the avatar list layout and `VeltPresenceTooltipWireframe` for hover tooltips. These wireframes preserve all real-time functionality while letting you define custom structure and styling.

**Why this matters:**

Default presence avatars work for most apps, but design systems often require custom avatar shapes, tooltip layouts, or overflow indicators. Wireframes let you customize without losing real-time sync.

**React: VeltPresenceWireframe**

```jsx
"use client";
import {
  VeltPresence,
  VeltPresenceWireframe,
} from "@veltdev/react";

function CustomPresence() {
  return (
    <>
      {/* Define the wireframe template */}
      <VeltPresenceWireframe>
        <VeltPresenceWireframe.AvatarList>
          <VeltPresenceWireframe.AvatarList.Item />
          <VeltPresenceWireframe.AvatarRemainingCount />
        </VeltPresenceWireframe.AvatarList>
      </VeltPresenceWireframe>

      {/* Render the presence component (picks up wireframe) */}
      <VeltPresence />
    </>
  );
}
```

**React: VeltPresenceTooltipWireframe**

```jsx
"use client";
import {
  VeltPresence,
  VeltPresenceTooltipWireframe,
} from "@veltdev/react";

function CustomTooltipPresence() {
  return (
    <>
      <VeltPresenceTooltipWireframe>
        <VeltPresenceTooltipWireframe.Avatar />
        <VeltPresenceTooltipWireframe.StatusContainer>
          <VeltPresenceTooltipWireframe.UserName />
          <VeltPresenceTooltipWireframe.UserActive />
          <VeltPresenceTooltipWireframe.UserInactive />
        </VeltPresenceTooltipWireframe.StatusContainer>
      </VeltPresenceTooltipWireframe>

      <VeltPresence />
    </>
  );
}
```

**HTML equivalents**

```html
<!-- Avatar list wireframe -->
<velt-presence-wireframe>
  <velt-presence-avatar-list-wireframe>
    <velt-presence-avatar-list-item-wireframe></velt-presence-avatar-list-item-wireframe>
    <velt-presence-avatar-remaining-count-wireframe></velt-presence-avatar-remaining-count-wireframe>
  </velt-presence-avatar-list-wireframe>
</velt-presence-wireframe>

<!-- Tooltip wireframe -->
<velt-presence-tooltip-wireframe>
  <velt-presence-tooltip-avatar-wireframe></velt-presence-tooltip-avatar-wireframe>
  <velt-presence-tooltip-status-container-wireframe>
    <velt-presence-tooltip-user-name-wireframe></velt-presence-tooltip-user-name-wireframe>
    <velt-presence-tooltip-user-active-wireframe></velt-presence-tooltip-user-active-wireframe>
    <velt-presence-tooltip-user-inactive-wireframe></velt-presence-tooltip-user-inactive-wireframe>
  </velt-presence-tooltip-status-container-wireframe>
</velt-presence-tooltip-wireframe>

<velt-presence></velt-presence>
```

**Disable Shadow DOM for custom CSS**

When customizing wireframes, set `shadowDom={false}` on `VeltPresence` to allow your CSS to reach internal elements:

```jsx
<VeltPresence shadowDom={false} />
```

Only disable Shadow DOM when you need to apply custom styles to wireframe elements. The default Shadow DOM encapsulation prevents style leaking, which is desirable in most cases.

**Key patterns:**

- Wireframe components define the template; `VeltPresence` renders it
- Place wireframe definitions before or alongside `VeltPresence`
- `AvatarRemainingCount` shows the "+N" overflow indicator
- `UserActive` and `UserInactive` in the tooltip render conditionally based on user state
- Set `shadowDom={false}` only when applying custom CSS to wireframe internals

### Verification Checklist

- [ ] Wireframe is defined in the same component tree as `VeltPresence`
- [ ] `shadowDom={false}` is set on `VeltPresence` only if custom CSS is needed
- [ ] HTML element names use kebab-case with `-wireframe` suffix
- [ ] React component names use PascalCase with dot notation
- [ ] Tested with multiple users to verify overflow count renders correctly

> **Source:** Velt Presence UI Customization -- Wireframe components, Shadow DOM configuration
