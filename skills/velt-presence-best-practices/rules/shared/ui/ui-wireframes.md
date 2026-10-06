---
title: Customize Presence Avatar UI with Wireframes
impact: MEDIUM
impactDescription: Build fully custom presence avatar layouts using wireframe building blocks
tags: wireframe, customization, ui, avatars, tooltip, shadowDom, VeltWireframe, VeltPresenceWireframe, VeltPresenceTooltipWireframe
---

## Customize Presence Avatar UI with Wireframes

Use `VeltPresenceWireframe` for the avatar list and `VeltPresenceTooltipWireframe` for the hover tooltip. Wireframes are templates: always wrap them in `VeltWireframe` (React) or `<velt-wireframe style="display:none;">` (HTML) so they never render on their own. Real-time behavior stays intact.

**Why this matters:**

Wireframes placed outside the wrapper render as visible markup or are ignored. Design systems often need custom avatar shapes, tooltips, or overflow badges; wireframes give you that without re-implementing presence subscriptions.

**Incorrect (no wrapper, wrong nesting):**

```jsx
<VeltPresenceWireframe>
  <VeltPresenceWireframe.AvatarList.Item /> {/* Item must be inside AvatarList */}
</VeltPresenceWireframe>
<VeltPresence />
```

**Correct (React / Next.js):**

```jsx
"use client";
import {
  VeltWireframe,
  VeltPresenceWireframe,
  VeltPresenceTooltipWireframe,
} from "@veltdev/react";

function PresenceWireframes() {
  return (
    <VeltWireframe>
      <VeltPresenceWireframe>
        <VeltPresenceWireframe.AvatarList>
          <VeltPresenceWireframe.AvatarList.Item />
        </VeltPresenceWireframe.AvatarList>
        <VeltPresenceWireframe.AvatarRemainingCount />
      </VeltPresenceWireframe>

      <VeltPresenceTooltipWireframe>
        <VeltPresenceTooltipWireframe.Avatar />
        <VeltPresenceTooltipWireframe.StatusContainer>
          <VeltPresenceTooltipWireframe.UserName />
          <VeltPresenceTooltipWireframe.UserActive />
          <VeltPresenceTooltipWireframe.UserInactive />
        </VeltPresenceTooltipWireframe.StatusContainer>
      </VeltPresenceTooltipWireframe>
    </VeltWireframe>
  );
}

// Render <PresenceWireframes /> once inside VeltProvider, and <VeltPresence /> where avatars should appear.
```

**Correct (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <velt-presence-wireframe>
    <velt-presence-avatar-list-wireframe>
      <velt-presence-avatar-list-item-wireframe></velt-presence-avatar-list-item-wireframe>
    </velt-presence-avatar-list-wireframe>
    <velt-presence-avatar-remaining-count-wireframe></velt-presence-avatar-remaining-count-wireframe>
  </velt-presence-wireframe>

  <velt-presence-tooltip-wireframe>
    <velt-presence-tooltip-avatar-wireframe></velt-presence-tooltip-avatar-wireframe>
    <velt-presence-tooltip-status-container-wireframe>
      <velt-presence-tooltip-user-name-wireframe></velt-presence-tooltip-user-name-wireframe>
      <velt-presence-tooltip-user-active-wireframe></velt-presence-tooltip-user-active-wireframe>
      <velt-presence-tooltip-user-inactive-wireframe></velt-presence-tooltip-user-inactive-wireframe>
    </velt-presence-tooltip-status-container-wireframe>
  </velt-presence-tooltip-wireframe>
</velt-wireframe>

<velt-presence></velt-presence>
```

**Disable Shadow DOM for custom CSS:**

```jsx
<VeltPresence shadowDom={false} />
```

```html
<velt-presence shadow-dom="false"></velt-presence>
```

**Key patterns and limitations:**

- `AvatarRemainingCount` ("+N") renders only when the user count exceeds `maxUsers`
- Tooltip slots are status-gated: `UserActive` renders only for `online` users, `UserInactive` only for `away` users, and neither renders for `offline`
- Use `variant` on `VeltPresence` to switch to a named wireframe variant
- Shadow DOM is on by default; disable it only when you need selector CSS on internals

### Verification Checklist

- [ ] All presence wireframes are inside `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] `AvatarList.Item` is nested inside `AvatarList`
- [ ] HTML wireframe tags are kebab-case and not self-closing
- [ ] `shadowDom={false}` is set only when custom CSS needs to reach internals
- [ ] Tested with more users than `maxUsers` to check the overflow badge

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/presence - "VeltPresenceWireframe", "VeltPresenceTooltipWireframe", "Styling", "Limitations"
- https://docs.velt.dev/ui-customization/overview - "UI Customization Concepts"
