---
title: Customize Notification Components with Wireframes
impact: MEDIUM
impactDescription: Full control over notification panel and tool appearance
tags: wireframes, customization, ui, panel, tool, styling
---

## Customize Notification Components with Wireframes

Use Velt wireframe components to customize the structure and appearance of the notifications tool and panel.

**Incorrect (only using default styling):**

```jsx
// Default appearance, no customization
<VeltNotificationsTool />
```

**Correct (using wireframe components):**

**Customize Notifications Tool:**

```jsx
import { VeltWireframe, VeltNotificationsToolWireframe } from '@veltdev/react';

function CustomNotificationsTool() {
  return (
    <VeltWireframe>
      <VeltNotificationsToolWireframe>
        <VeltNotificationsToolWireframe.Icon />
        <VeltNotificationsToolWireframe.UnreadIcon />
        <VeltNotificationsToolWireframe.UnreadCount />
        <VeltNotificationsToolWireframe.Label />
      </VeltNotificationsToolWireframe>
    </VeltWireframe>
  );
}
```

**Customize Notifications Panel:**

```jsx
import { VeltWireframe, VeltNotificationsPanelWireframe } from '@veltdev/react';

function CustomNotificationsPanel() {
  return (
    <VeltWireframe>
      <VeltNotificationsPanelWireframe>
        <VeltNotificationsPanelWireframe.Title />
        <VeltNotificationsPanelWireframe.ReadAllButton />
        <VeltNotificationsPanelWireframe.SettingsButton />
        <VeltNotificationsPanelWireframe.Header />
        <VeltNotificationsPanelWireframe.Content />
        <VeltNotificationsPanelWireframe.Settings />
      </VeltNotificationsPanelWireframe>
    </VeltWireframe>
  );
}
```

**Panel Header Tabs:**

```jsx
<VeltNotificationsPanelWireframe.Header>
  <VeltNotificationsPanelWireframe.Header.TabForYou />
  <VeltNotificationsPanelWireframe.Header.TabAll />
  <VeltNotificationsPanelWireframe.Header.TabDocuments />
  <VeltNotificationsPanelWireframe.Header.TabPeople />
</VeltNotificationsPanelWireframe.Header>
```

**Panel Content List:**

```jsx
<VeltNotificationsPanelWireframe.Content.List>
  <VeltNotificationsPanelWireframe.Content.List.Item>
    <VeltNotificationsPanelWireframe.Content.List.Item.Avatar />
    <VeltNotificationsPanelWireframe.Content.List.Item.Unread />
    <VeltNotificationsPanelWireframe.Content.List.Item.Headline />
    <VeltNotificationsPanelWireframe.Content.List.Item.Body />
    <VeltNotificationsPanelWireframe.Content.List.Item.FileName />
    <VeltNotificationsPanelWireframe.Content.List.Item.Time />
  </VeltNotificationsPanelWireframe.Content.List.Item>
</VeltNotificationsPanelWireframe.Content.List>
```

**For HTML:**

```html
<velt-wireframe style="display:none;">
  <velt-notifications-tool-wireframe>
    <velt-notifications-tool-icon-wireframe></velt-notifications-tool-icon-wireframe>
    <velt-notifications-tool-unread-count-wireframe></velt-notifications-tool-unread-count-wireframe>
  </velt-notifications-tool-wireframe>
</velt-wireframe>
```

**Disable Shadow DOM for CSS Access:**

```jsx
// Disable shadow DOM to apply custom CSS
<VeltNotificationsTool shadowDom={false} panelShadowDom={false} />
<VeltNotificationsPanel shadowDom={false} />
```

**Dark Mode:**

```jsx
<VeltNotificationsTool darkMode={true} />
<VeltNotificationsPanel darkMode={true} />
```

**Variants:**

```jsx
// Use different variants for tool and panel
<VeltNotificationsTool
  variant="custom-tool"
  panelVariant="custom-panel"
/>
```

**Available Wireframe Components:**

| Component | Purpose |
|-----------|---------|
| `VeltNotificationsToolWireframe` | Bell icon button |
| `VeltNotificationsPanelWireframe` | Full panel container |
| `.Header` | Tab header area |
| `.Content` | Notification list area |
| `.Content.List.Item` | Individual notification |
| `.Settings` | Settings panel |

**Verification:**
- [ ] VeltWireframe wraps customizations
- [ ] Wireframe components match desired structure
- [ ] shadowDom disabled if using custom CSS
- [ ] All subcomponents properly nested

**Source Pointer:** `/docs/ui-customization/features/async/notifications/notifications-panel.mdx` (Panel wireframes)
