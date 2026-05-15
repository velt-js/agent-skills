---
title: Bind Notifications Panel Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives tab selection, settings open/close, per-row unread styling, and empty-state rendering inside Notifications Panel wireframes without re-subscribing to notification state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, notifications-panel, panel, settings
---

## Bind Notifications Panel Wireframe Slots Using Template Variables

The Notifications Panel wireframe family (`<velt-notifications-panel-...-wireframe>` / `<VeltNotificationsPanelWireframe.*>`) exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing tab tracking, unread counting, or settings open/close state on top of `useNotificationsData` / `useUnreadNotificationsCount`. Variables are mapped — reference them by their short name, **never** as `componentConfig.var`.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top of that structure.

Do not rebuild tab/unread/empty state from hooks and conditionally mount slots. The panel already exposes `selectedTab`, `TABS`, `unreadNotificationsForYou`, and `isAllRead` as injected variables.

**Correct (read the injected variables via `velt-data` / `velt-if` / `velt-class` — a minimal panel with title bar and content area):**

```jsx
import { VeltNotificationsPanelWireframe } from '@veltdev/react';

<VeltWireframe>
  <VeltNotificationsPanelWireframe>
    <VeltNotificationsPanelWireframe.Header>
      <div className="my-panel__title">
        <VeltNotificationsPanelWireframe.Title />
        <VeltNotificationsPanelWireframe.ReadAllButton />
        <VeltNotificationsPanelWireframe.SettingsButton />
        <VeltNotificationsPanelWireframe.CloseButton />
      </div>
    </VeltNotificationsPanelWireframe.Header>
    <VeltNotificationsPanelWireframe.Content />
  </VeltNotificationsPanelWireframe>
</VeltWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-wireframe>
  <velt-notifications-panel-wireframe>
    <velt-notifications-panel-header-wireframe>
      <div class="my-panel__title">
        <velt-notifications-panel-title-wireframe></velt-notifications-panel-title-wireframe>
        <velt-notifications-panel-read-all-button-wireframe></velt-notifications-panel-read-all-button-wireframe>
        <velt-notifications-panel-settings-button-wireframe></velt-notifications-panel-settings-button-wireframe>
        <velt-notifications-panel-close-button-wireframe></velt-notifications-panel-close-button-wireframe>
      </div>
    </velt-notifications-panel-header-wireframe>
    <velt-notifications-panel-content-wireframe></velt-notifications-panel-content-wireframe>
  </velt-notifications-panel-wireframe>
</velt-wireframe>
```

### Variable namespaces

The Notifications Panel injects four namespaces into every slot.

**Data State** — per-feature data (the four groupings, settings tree, current document):

| Variable | Type | Notes |
|---|---|---|
| `notificationsForYouInSession` | `Notification[] \| null` | Notifications matched to the current user (drives the For-you tab). |
| `notificationsInSession` | `Notification[] \| null` | All in-session notifications (combined feed). |
| `notificationsByUserMap` | `Record<string, { user: User; notifications: Notification[] }>` | Grouped by user email. Bracket-lookup: `{notificationsByUserMap[notification.from.email].notifications.length}`. |
| `notificationsByDocumentId` | `{ documentId: string; notifications: Notification[] }[] \| null` | Grouped by document. |
| `notificationsByDate` | `{ date: string; displayName: string; notifications: Notification[] }[] \| null` | Grouped by date bucket (drives the All tab). |
| `currentDocumentName` | `string` | Display name of the current document. |
| `unreadNotificationsForYou` | `number` | Unread-count badge for the For-you tab. Also exposed by the notifications-tool. |
| `settingsConfig` | `NotificationInitialSettingsConfig[]` | Settings-tree configuration. |
| `settingsSelectedOption` | `Record<string, NotificationConfigValue>` | Selected option keyed by setting id — bracket-lookup: `{settingsSelectedOption[setting.id]}`. |

**UI State** — per-instance flags driven by the panel:

| Variable | Type | Notes |
|---|---|---|
| `selectedTab` | `'forYou' \| 'people' \| 'documents' \| 'all'` | Active tab id. Compare against `TABS.*`. |
| `TABS` | `{ ForYou; People; Documents; All }` | Constant tab-id map. Use for comparisons (`{selectedTab} === {TABS.ForYou}`). |
| `tabConfig` | `NotificationTabConfig \| null` | Per-tab visibility flags. |
| `tabPage` | `{ forYou; people; documents; all }` | Pagination cursor per tab. |
| `pageSize` | `number` | Default `5`. |
| `tabCount` | `number` | Number of visible tabs. |
| `panelOpenMode` | `'popover' \| 'sidebar' \| ...` | Layout mode. |
| `notificationsPanelVisible` | `boolean` | Panel is open. Also exposed by the notifications-tool. |
| `settingsOpen` | `boolean` | Settings view is open. |
| `settingsAccordionExpanded` | `Record<string, boolean>` | Per-accordion expanded state, bracket-lookup by id. |
| `settingsMutedAll` | `boolean` | Master "mute all" toggle. |
| `settingsItemRecentlyClosed` | `boolean` | Triggers the close animation. |
| `settingsLayout` | `'accordion' \| ...` | Settings UI layout. |
| `usersExpanded` | `Record<string, boolean>` | Per-user accordion state, bracket-lookup by email. |
| `documentExpanded` | `Record<string, boolean>` | Per-document accordion state, bracket-lookup by id. |
| `shadowDom` | `boolean` | Shadow-DOM wrapping flag (host attribute). |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag from the host element. |

**Feature State** — capability flags toggled via SDK config:

| Variable | Type | Notes |
|---|---|---|
| `settingsEnabled` | `boolean` | Settings view is available. Gate the settings button with `velt-if="{settingsEnabled}"`. |

**Loop-scope variables** — only resolvable inside the iteration primitive noted under "Available in":

| Variable | Type | Available in |
|---|---|---|
| `notification` | `Notification` | `<velt-notifications-panel-content-list-wireframe>` and descendants |
| `notifications` | `Notification[]` | `*-content-list`, `*-content-load-more` |
| `isLoadMoreVisible` | `boolean` | `*-content-load-more` |
| `isAllRead` | `boolean` | `*-content-all-read-container` |
| `user`, `userNotifications` | `User`, `Notification[]` | People-tab list-item descendants |
| `documentId`, `documentName`, `documentNotifications` | `string`, `string`, `Notification[]` | Documents-tab list-item descendants |
| `dateGroup` | `{ date; displayName; notifications }` | All-tab list-item descendants |
| `setting`, `option` | `NotificationInitialSettingsConfig`, `NotificationConfigValue` | Settings accordion descendants |

### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show a slot you would otherwise hide (e.g. render the settings button even when `settingsEnabled` is false). |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-notifications-panel-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // notifications groupings, tabConfig,
                                         // settingsConfig, settingsSelectedOption
[parentLocalUIState]="localUI()"         // darkMode, variant
```

### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `notifications-panel-settings-button-wireframe` | `settingsEnabled === true` |
| `notifications-panel-settings-wireframe` | `settingsOpen === true` (additionally `settingsEnabled === true` to render the trigger) |
| `notifications-panel-header-tab-for-you-wireframe` (and `-people`, `-documents`, `-all`) | `tabConfig.<tabId>` is truthy. `selected` modifier applied when `selectedTab === TABS.<TabId>`. |
| `notifications-panel-skeleton-wireframe` | Parent renders while `isLoading === true`. |
| `notifications-panel-content-load-more-wireframe` | `isLoadMoreVisible === true` |
| `notifications-panel-content-all-read-container-wireframe` | `isAllRead === true` |
| `notifications-panel-content-for-you` / `-people` / `-documents` / `-all` | Each gated on `selectedTab` matching its tab id. |

Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.

### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`** Variables are mapped to short names. `<velt-data field="componentConfig.unreadNotificationsForYou" />` resolves to nothing — use `<velt-data field="unreadNotificationsForYou" />`.

**2. DO NOT compare `selectedTab` to a string literal — compare to `TABS.*`.** Use `'{selectedTab} === {TABS.ForYou}'`, not `'{selectedTab} === "forYou"'`. The `TABS` map is the canonical comparison surface.

**3. DO NOT bracket-lookup the wrong key.** `settingsAccordionExpanded` is keyed by setting id, `usersExpanded` by email, `documentExpanded` by document id, `settingsSelectedOption` by setting id. Mismatched keys silently resolve to `undefined`.

**4. DO NOT use loop-scope variables outside their iteration primitive.** `notification`, `user`, `documentId`, `setting`, `option` only exist inside the descendants of the iteration tag that injects them. Reading `notification.title` at the panel root resolves to nothing.

**5. DO NOT mix `defaultCondition` with `velt-if` for the same gate.** `defaultCondition={false}` disables the slot's internal `shouldShow`. `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**6. DO NOT bind to `shadowDom` from inside the wireframe to *enable* shadow-DOM.** Shadow-DOM is set via the host attributes `shadow-dom="true"` / `panel-shadow-dom="true"` on `<velt-notifications-panel>` (or on the linked `<velt-notifications-tool>`). The variable only reports the current state.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name (not `componentConfig.var`)
- [ ] Tab comparisons use `{TABS.<TabId>}`, never raw string literals
- [ ] Bracket-lookup keys match each map's documented key (id vs email vs documentId)
- [ ] Loop-scope variables (`notification`, `user`, `setting`, `option`, …) are only read inside their iteration primitive
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate, never combined with `velt-if` for the same condition
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not
- [ ] Settings button is gated with `velt-if="{settingsEnabled}"`; settings view body is gated with `velt-if="{settingsOpen}"`

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/notifications/notifications-panel/wireframe-variables — "Notifications Panel Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `wireframe-variables/wireframe-variables-notifications-tool.md` (linked tool — shares `componentConfigSignal`)
