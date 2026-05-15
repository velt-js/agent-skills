---
title: Bind Notifications Tool Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives the bell icon swap, unread-count badge, and panel-open active state inside the Notifications Tool wireframe without re-subscribing to unread state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, notifications-tool, bell-icon, unread-count
---

## Bind Notifications Tool Wireframe Slots Using Template Variables

The Notifications Tool wireframe family (`<velt-notifications-tool-...-wireframe>` / `<VeltNotificationsToolWireframe.*>`) powers the bell-icon trigger that opens the linked Notifications Panel. It exposes a small set of tool-specific variables on top of the shared panel context. Read them with `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling.

The tool shares its `componentConfigSignal` with the linked panel. Every variable in `wireframe-variables/wireframe-variables-notifications-panel.md` also resolves inside tool slots — only the **tool-specific** entries below are unique to this rule. For structural tag composition, see `ui/ui-wireframes.md`.

**Incorrect (rebuilding unread / panel-open state from hooks):**

```jsx
import { useUnreadNotificationsCount } from '@veltdev/react';
import { VeltNotificationsToolWireframe } from '@veltdev/react';

function Bell({ panelOpen }) {
  const unread = useUnreadNotificationsCount();
  return (
    <VeltNotificationsToolWireframe className={panelOpen ? 'panel-open' : ''}>
      {unread > 0 ? <UnreadBellIcon /> : <BellIcon />}
      {unread > 0 && <span className="badge">{unread}</span>}
    </VeltNotificationsToolWireframe>
  );
}
```

**Correct (read the injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltNotificationsToolWireframe } from '@veltdev/react';

<VeltWireframe>
  <VeltNotificationsToolWireframe veltClass="'panel-open': {notificationsPanelVisible}">
    <button className="my-bell">
      <VeltNotificationsToolWireframe.Icon />
      <VeltNotificationsToolWireframe.UnreadIcon />
      <VeltNotificationsToolWireframe.Label />
      <VeltNotificationsToolWireframe.UnreadCount />
    </button>
  </VeltNotificationsToolWireframe>
</VeltWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-wireframe>
  <velt-notifications-tool-wireframe>
    <button class="my-bell" velt-class="'panel-open': {notificationsPanelVisible}">
      <velt-notifications-tool-icon-wireframe></velt-notifications-tool-icon-wireframe>
      <velt-notifications-tool-unread-icon-wireframe></velt-notifications-tool-unread-icon-wireframe>
      <velt-notifications-tool-label-wireframe></velt-notifications-tool-label-wireframe>
      <velt-notifications-tool-unread-count-wireframe></velt-notifications-tool-unread-count-wireframe>
    </button>
  </velt-notifications-tool-wireframe>
</velt-wireframe>
```

### Variable namespaces

**Data State** — drives the bell icon, the unread badge, and the active-state styling:

| Variable | Type | Notes |
|---|---|---|
| `unreadNotificationsForYou` | `Notification[]` | Unread notifications list (note: as an array here — the panel exposes `unreadNotificationsForYou` as a `number`). Length drives the count badge. |

**UI State** — per-instance flags driven by the tool:

| Variable | Type | Notes |
|---|---|---|
| `notificationsPanelVisible` | `boolean` | Linked panel is currently open. Drives the `active` / `panel-open` modifier on the trigger. |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag set on the host element. |

The `componentConfigSignal` also exposes `tabConfig`, `shadowDom`, `panelShadowDom`, `considerAllNotifications`, `template`, and `settingsLayout`. These are set on the public element as kebab-case attributes (see "Public attributes" below) — inside a wireframe they still resolve as bare names.

### Public attributes on the root element

The root `<velt-notifications-tool>` element inherits the same `defaultCondition` prop as the panel and additionally accepts these public attributes that flow through to the linked panel:

| React Prop | HTML Attribute | Type | Default | Description |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the slot renders regardless of its internal `shouldShow` gate. |
| `considerAllNotifications` | `consider-all-notifications` | `boolean \| "true" \| "false"` | `false` | Count all notifications, not just unread. |
| `shadowDom` | `shadow-dom` | `boolean \| "true" \| "false"` | `true` | Wrap the tool in Shadow DOM. |
| `panelShadowDom` | `panel-shadow-dom` | `boolean \| "true" \| "false"` | `true` | Wrap the linked panel in Shadow DOM. |
| `settingsLayout` | `settings-layout` | `'accordion' \| ...` | `'accordion'` | Forwarded to the linked panel. |
| `variant` | `variant` | `string` | — | Wireframe variant id. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-notifications-tool-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // shared with the linked panel
[parentLocalUIState]="localUI()"         // darkMode, variant
```

### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `notifications-tool-icon-wireframe` | Parent gates this on `unreadNotificationsForYou.length === 0`. |
| `notifications-tool-unread-icon-wireframe` | Parent gates this on `unreadNotificationsForYou.length > 0`. |
| `notifications-tool-unread-count-wireframe` | `unreadNotificationsForYou.length > 0` |

The `notifications-tool-label-wireframe` is always rendered (no gate) — wrap it in your own `velt-if` if you want to hide the "Notifications" label in compact mode.

### Common mistakes — DO NOT

**1. DO NOT call `.length` on `unreadNotificationsForYou` inside the *panel* wireframe.** Inside the panel, `unreadNotificationsForYou` is already a `number` — use `{unreadNotificationsForYou} > 0`. Inside the tool, it's an `Notification[]` — use `{unreadNotificationsForYou.length} > 0`. The same short name resolves to different shapes across the two wireframes.

**2. DO NOT mount `<...-icon-wireframe>` and `<...-unread-icon-wireframe>` without `velt-if` gates.** They will both render simultaneously. The parent's `shouldShow` is informational, not enforced when you compose the slots yourself — gate explicitly with `velt-if="{unreadNotificationsForYou.length} === 0"` and `velt-if="{unreadNotificationsForYou.length} > 0"`.

**3. DO NOT set `shadow-dom` / `panel-shadow-dom` from inside a wireframe slot.** These are *host attributes* on `<velt-notifications-tool>`. Inside the wireframe, `shadowDom` is read-only.

**4. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.unreadNotificationsForYou.length" />` resolves to nothing.

**5. DO NOT duplicate panel variables in your tool template if you only need them in one place.** The tool shares `componentConfigSignal` with the linked panel. Read panel variables (e.g. `selectedTab`, `settingsOpen`) directly inside tool slots without re-wiring.

**Verification:**
- [ ] `unreadNotificationsForYou.length` is used inside the tool (array), `unreadNotificationsForYou` directly inside the panel (number)
- [ ] Both icon slots have explicit `velt-if` gates that don't overlap
- [ ] Public attributes (`shadow-dom`, `panel-shadow-dom`, `consider-all-notifications`, `settings-layout`, `variant`) are set on the host `<velt-notifications-tool>` element, not inside wireframe slots
- [ ] Wireframe slots reference mapped variables by short name (not `componentConfig.var`)
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-tool/wireframe-variables — "Notifications Tool Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `wireframe-variables/wireframe-variables-notifications-panel.md` (linked panel — shares `componentConfigSignal`)
