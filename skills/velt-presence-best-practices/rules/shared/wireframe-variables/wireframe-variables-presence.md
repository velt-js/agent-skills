---
title: Bind Presence Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives the active-user avatar list, overflow badge, and hover tooltip inside Presence wireframes without re-implementing presence-data subscriptions on top of the component
tags: wireframe, template-variables, velt-data, velt-if, velt-class, presence, avatar-list, tooltip
---

## Bind Presence Wireframe Slots Using Template Variables

The Presence primitive renders the active-user avatar list inside `<velt-presence>` / `<VeltPresence>`. Variables are available inside any `<velt-presence-...-wireframe>` tag via the standard `<velt-data field="...">` / `velt-if="{...}"` / `velt-class="'cls': {...}"` directives.

This family uses the **flat-config** access pattern — every variable is referenced via the explicit `componentConfig.<path>` form. There are no bare-name loop variables; the per-user iteration context inside avatar-list-item and tooltip tags is also exposed as `componentConfig.user` / `componentConfig.isActive` / `componentConfig.lastActiveAt`.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top.

Do not subscribe to presence data and re-render the list yourself. The wireframe already iterates `componentConfig.filteredPresenceUsers` and applies max-users overflow.

**Correct (let the wireframe iterate, read `componentConfig.user` per row, gate overflow with `filteredPresenceUsers.length > maxUsers`):**

```jsx
<VeltWireframe>
  <VeltPresenceWireframe>
    <VeltPresenceWireframe.AvatarList />
    <VeltPresenceWireframe.AvatarRemainingCount />
  </VeltPresenceWireframe>
</VeltWireframe>
```

### Component Config (root state)

Available inside every Presence primitive. **Always read via the full `componentConfig.<path>` form.**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.filteredPresenceUsers` | `PresenceUser[]` | Active users after filters — drives the avatar list. `.length` powers the overflow gate. |
| `componentConfig.user` | `User` | Currently identified end-user (root scope). Inside avatar-list-item and tooltip tags, this rebinds to the iteration's `PresenceUser`. |
| `componentConfig.maxUsers` | `number` | Max avatars before collapsing into "+N" (default `5`). |
| `componentConfig.variant` | `string` | Per-instance variant tag. |
| `componentConfig.shadowDom` | `boolean` | Shadow-DOM rendering enabled (host-config — set via element attribute). |
| `componentConfig.tooltipContent` | `TemplateRef<any>` | Internal — programmatic tooltip override only, not used in wireframes. |
| `componentConfig.trackById` | `Function` | Internal list-tracking function. |
| `componentConfig.showTooltip` | `Function` | Hover-in handler — wire to `(mouseenter)` on a custom avatar. |
| `componentConfig.closeTooltip` | `Function` | Hover-out handler. |
| `componentConfig.onPresenceUserClick` | `Function` | Avatar click handler — wire from custom avatar markup. |

### Context-Specific Variables (per-iteration / tooltip scope)

These resolve **only** inside the iteration or tooltip tag that owns them — but still via the `componentConfig.<path>` form.

| Variable | Type | Available in | Notes |
|---|---|---|---|
| `componentConfig.user` | `PresenceUser` | `<velt-presence-avatar-list-item-wireframe>`, `<velt-presence-tooltip-wireframe>` and tooltip child tags | Per-row / hovered user. |
| `componentConfig.isActive` | `boolean` | Tooltip context | `true` when the hovered user is currently active. Branch active/inactive slots with `velt-if`. |
| `componentConfig.lastActiveAt` | `number` | Tooltip context | Unix timestamp the user was last active. |

### Wireframe tags

| Wireframe tag (HTML) | React component | Notes |
|---|---|---|
| `<velt-presence-wireframe>` | `<VeltPresenceWireframe />` | Root — hosts every other tag. No extra variables. |
| `<velt-presence-avatar-list-wireframe>` | `<VeltPresenceWireframe.AvatarList />` | List container — iterates `componentConfig.filteredPresenceUsers`. |
| `<velt-presence-avatar-list-item-wireframe>` | `<VeltPresenceWireframe.AvatarListItem />` | Per-user avatar — `componentConfig.user` rebinds to the iteration's `PresenceUser`. |
| `<velt-presence-avatar-remaining-count-wireframe>` | `<VeltPresenceWireframe.AvatarRemainingCount />` | "+N" overflow badge. `shouldShow` requires `filteredPresenceUsers.length > maxUsers`. |
| `<velt-presence-tooltip-wireframe>` | `<VeltPresenceTooltipWireframe />` | Hover tooltip — exposes `user`, `isActive`, `lastActiveAt`. Composes the five child tags below. |
| `<velt-presence-tooltip-avatar-wireframe>` | — | Hovered user's avatar — bind `componentConfig.user.photoUrl`. |
| `<velt-presence-tooltip-status-container-wireframe>` | — | Wrapper for the active/inactive status row. |
| `<velt-presence-tooltip-user-name-wireframe>` | — | Hovered user's name — bind `componentConfig.user.name`. |
| `<velt-presence-tooltip-user-active-wireframe>` | `<VeltPresenceWireframe.Tooltip.UserActive>` | Renders when `componentConfig.isActive` is true. |
| `<velt-presence-tooltip-user-inactive-wireframe>` | `<VeltPresenceWireframe.Tooltip.UserInactive>` | Renders when `componentConfig.isActive` is false — show relative `lastActiveAt` here. |

### Common mistakes — DO NOT

**1. DO NOT bare-name presence state.** This family is flat-config — `<velt-data field="filteredPresenceUsers.length" />` resolves to nothing. Always use `componentConfig.filteredPresenceUsers.length`.

**2. DO NOT subscribe to `usePresenceData` to render the list manually.** The wireframe already iterates `componentConfig.filteredPresenceUsers` and applies max-users overflow. Hooks are for reading state alongside the wireframe, not for replacing it.

**3. DO NOT bind `isActive` / `lastActiveAt` outside a tooltip tag.** The tooltip iteration context only exists inside `<velt-presence-tooltip-wireframe>` and its descendants.

**4. DO NOT render both `tooltip-user-active` and `tooltip-user-inactive` unconditionally.** Each must be gated with `velt-if="{componentConfig.isActive}"` and `velt-if="!{componentConfig.isActive}"` respectively — otherwise both render simultaneously.

**Verification:**
- [ ] All state is read via `componentConfig.<path>` (no bare names)
- [ ] Avatar-list iteration uses `componentConfig.user` inside `<velt-presence-avatar-list-item-wireframe>`
- [ ] Overflow badge is gated by `filteredPresenceUsers.length > maxUsers`
- [ ] Tooltip active/inactive slots are mutually exclusive via `velt-if` on `componentConfig.isActive`
- [ ] `componentConfig.onPresenceUserClick` is wired from custom avatar markup when overriding the click target

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/presence-wireframe-variables — "Presence Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural Presence wireframe catalog), `core/core-setup.md` (VeltPresence component setup)
