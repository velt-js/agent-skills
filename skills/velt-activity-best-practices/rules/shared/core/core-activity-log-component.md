---
title: Use VeltActivityLog Component to Display Activity Feed UI
impact: HIGH
impactDescription: Drop-in activity feed UI with date grouping, filtering, and wireframe customization
tags: VeltActivityLog, velt-activity-log, component, darkMode, shadowDom, useDummyData, variant, wireframe
---

## Use VeltActivityLog Component to Display Activity Feed UI

The `VeltActivityLog` / `<velt-activity-log>` component renders a prebuilt activity feed that groups entries by calendar date, supports filtering by feature type, and displays loading and empty states. Without it, you must build all feed UI from scratch using raw subscription data.

**Incorrect (rendering raw subscription data without the component):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  const activities = useAllActivities();
  // No date grouping, no loading state, no empty state
  return (
    <ul>
      {activities?.map(a => <li key={a.id}>{a.displayMessage}</li>)}
    </ul>
  );
}
```

**Correct (complete toggleable Activity Log panel in a VeltCollaboration component):**

```tsx
"use client";

import { useState } from "react";
import { VeltActivityLog } from "@veltdev/react";

// Place this inside your VeltCollaboration component alongside other Velt features.
// The activity panel is always mounted but hidden when closed — this keeps the
// web component's backend connection alive so activities load instantly on open.

export function ActivityLogPanel() {
  const [activityOpen, setActivityOpen] = useState(false);

  return (
    <>
      {/* Toggle button — place in your toolbar or document header */}
      <button
        onClick={() => setActivityOpen(!activityOpen)}
        style={{
          padding: "6px 14px",
          fontSize: 13,
          border: "1px solid var(--border, #e0e0e0)",
          borderRadius: 20,
          background: activityOpen ? "var(--primary, #2563eb)" : "transparent",
          color: activityOpen ? "#fff" : "var(--text, #111)",
          cursor: "pointer",
        }}
      >
        {activityOpen ? "Hide Activity Log" : "View Activity Log"}
      </button>

      {/* Activity panel — ALWAYS mounted, toggle with display: none */}
      <div
        style={{
          display: activityOpen ? "flex" : "none",
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          zIndex: 40,
          flexDirection: "column",
          borderLeft: "1px solid var(--border, #e0e0e0)",
          background: "var(--bg, #fff)",
          boxShadow: "0 0 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border, #e0e0e0)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Activity Log</span>
          <button
            onClick={() => setActivityOpen(false)}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}
          >
            &times;
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <VeltActivityLog shadowDom={false} />
        </div>
      </div>
    </>
  );
}
```

**Key points about this pattern:**
- `shadowDom={false}` lets your CSS styles apply to the activity log (nearly always needed for custom styling)
- The panel div uses `display: activityOpen ? "flex" : "none"` — NOT conditional rendering
- `VeltActivityLog` has NO `style` or `className` props — wrapped in a styled `<div>` instead
- The toggle button can go in the toolbar or the document page header
- The panel is positioned `fixed` on the right side, overlaying the content

**Minimal usage (HTML — web component):**

```html
<!-- Always mounted, toggle visibility with CSS -->
<velt-activity-log></velt-activity-log>
```

**Component props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `darkMode` | `boolean` | `false` | Enable dark mode styling |
| `shadowDom` | `boolean` | `false` | Render inside a shadow DOM |
| `useDummyData` | `boolean` | `false` | Show placeholder data for development/testing |
| `variant` | `string` | `undefined` | Layout variant (e.g. `"sidebar"`); consult docs for available values |

**Wireframe customization (27 primitives):**

Customize the entire layout using `VeltActivityLogWireframe`. Each sub-component accepts `defaultCondition?: boolean` to control visibility.

```tsx
import VeltActivityLogWireframe from '@veltdev/react/VeltActivityLogWireframe';

<VeltActivityLog>
  <VeltActivityLogWireframe>
    <VeltActivityLogWireframe.Header>
      <VeltActivityLogWireframe.Header.Title />
      <VeltActivityLogWireframe.Header.CloseButton />
      <VeltActivityLogWireframe.Header.Filter>
        <VeltActivityLogWireframe.Header.Filter.Trigger>
          <VeltActivityLogWireframe.Header.Filter.Trigger.Icon />
          <VeltActivityLogWireframe.Header.Filter.Trigger.Label />
        </VeltActivityLogWireframe.Header.Filter.Trigger>
        <VeltActivityLogWireframe.Header.Filter.Content>
          <VeltActivityLogWireframe.Header.Filter.Content.Item>
            <VeltActivityLogWireframe.Header.Filter.Content.Item.Icon />
            <VeltActivityLogWireframe.Header.Filter.Content.Item.Label />
          </VeltActivityLogWireframe.Header.Filter.Content.Item>
        </VeltActivityLogWireframe.Header.Filter.Content>
      </VeltActivityLogWireframe.Header.Filter>
    </VeltActivityLogWireframe.Header>
    <VeltActivityLogWireframe.Loading />
    <VeltActivityLogWireframe.List>
      <VeltActivityLogWireframe.List.DateGroup>
        <VeltActivityLogWireframe.List.DateGroup.Label />
      </VeltActivityLogWireframe.List.DateGroup>
      <VeltActivityLogWireframe.List.Item>
        <VeltActivityLogWireframe.List.Item.Icon />
        <VeltActivityLogWireframe.List.Item.Avatar />
        <VeltActivityLogWireframe.List.Item.Time />
        <VeltActivityLogWireframe.List.Item.Content>
          <VeltActivityLogWireframe.List.Item.Content.User />
          <VeltActivityLogWireframe.List.Item.Content.Action />
          <VeltActivityLogWireframe.List.Item.Content.Target />
          <VeltActivityLogWireframe.List.Item.Content.Detail />
        </VeltActivityLogWireframe.List.Item.Content>
      </VeltActivityLogWireframe.List.Item>
      <VeltActivityLogWireframe.List.ShowMore />
    </VeltActivityLogWireframe.List>
    <VeltActivityLogWireframe.Empty />
  </VeltActivityLogWireframe>
</VeltActivityLog>
```

**All 27 standalone primitive components:**

| React | HTML |
|-------|------|
| `VeltActivityLog` | `velt-activity-log` |
| `VeltActivityLogHeader` | `velt-activity-log-header` |
| `VeltActivityLogHeaderTitle` | `velt-activity-log-header-title` |
| `VeltActivityLogHeaderCloseButton` | `velt-activity-log-header-close-button` |
| `VeltActivityLogHeaderFilter` | `velt-activity-log-header-filter` |
| `VeltActivityLogHeaderFilterTrigger` | `velt-activity-log-header-filter-trigger` |
| `VeltActivityLogHeaderFilterTriggerIcon` | `velt-activity-log-header-filter-trigger-icon` |
| `VeltActivityLogHeaderFilterTriggerLabel` | `velt-activity-log-header-filter-trigger-label` |
| `VeltActivityLogHeaderFilterContent` | `velt-activity-log-header-filter-content` |
| `VeltActivityLogHeaderFilterContentItem` | `velt-activity-log-header-filter-content-item` |
| `VeltActivityLogHeaderFilterContentItemIcon` | `velt-activity-log-header-filter-content-item-icon` |
| `VeltActivityLogHeaderFilterContentItemLabel` | `velt-activity-log-header-filter-content-item-label` |
| `VeltActivityLogLoading` | `velt-activity-log-loading` |
| `VeltActivityLogEmpty` | `velt-activity-log-empty` |
| `VeltActivityLogList` | `velt-activity-log-list` |
| `VeltActivityLogListDateGroup` | `velt-activity-log-list-date-group` |
| `VeltActivityLogListDateGroupLabel` | `velt-activity-log-list-date-group-label` |
| `VeltActivityLogListItem` | `velt-activity-log-list-item` |
| `VeltActivityLogListItemIcon` | `velt-activity-log-list-item-icon` |
| `VeltActivityLogListItemAvatar` | `velt-activity-log-list-item-avatar` |
| `VeltActivityLogListItemTime` | `velt-activity-log-list-item-time` |
| `VeltActivityLogListItemContent` | `velt-activity-log-list-item-content` |
| `VeltActivityLogListItemContentUser` | `velt-activity-log-list-item-content-user` |
| `VeltActivityLogListItemContentAction` | `velt-activity-log-list-item-content-action` |
| `VeltActivityLogListItemContentTarget` | `velt-activity-log-list-item-content-target` |
| `VeltActivityLogListItemContentDetail` | `velt-activity-log-list-item-content-detail` |
| `VeltActivityLogListShowMore` | `velt-activity-log-list-show-more` |

### Common Mistakes — DO NOT

**1. DO NOT replace `VeltActivityLog` with a custom `useAllActivities()` implementation.** The component handles date grouping, filtering, icons, loading states, and all activity types automatically. If it appears empty or shows a loading skeleton, that is NORMAL — it means either Activity Logs aren't enabled in the Console yet or no activities have been recorded on this document. Do NOT rewrite it as a custom component.

**2. DO NOT conditionally render `VeltActivityLog` with `{show && <VeltActivityLog />}`.** The component is a web component that needs to stay mounted to maintain its connection to the Velt backend. Mounting and unmounting it on toggle causes it to re-initialize each time, showing a loading state. Instead, always render it and toggle visibility with `display: none`:

```jsx
// WRONG — remounts on every toggle, loses connection
{showPanel && <VeltActivityLog />}

// CORRECT — always mounted, toggle visibility
<div style={{ display: showPanel ? "flex" : "none" }}>
  <VeltActivityLog />
</div>
```

**3. DO NOT pass `style` or `className` as props to `VeltActivityLog`.** It is a Velt web component, not a standard React element. Styling props are silently ignored and can prevent the component from rendering. To control sizing/positioning, wrap it in a `<div>` with your styles:

```jsx
// WRONG — style prop is ignored, component may not render
<VeltActivityLog style={{ flex: 1 }} />

// CORRECT — wrap in a styled div
<div style={{ flex: 1 }}>
  <VeltActivityLog />
</div>
```

**Verification:**
- [ ] `VeltActivityLog` imported from `'@veltdev/react'` (React) or used as `<velt-activity-log>` (HTML)
- [ ] NO `style` or `className` props passed directly to `VeltActivityLog`
- [ ] Component is always mounted (use `display: none` to hide, NOT conditional rendering)
- [ ] Activity Logs enabled in Velt Console (see `core-setup` rule)
- [ ] `useDummyData` used only during development, not in production
- [ ] Wireframe customization references Velt docs for primitive component names

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/customize-ui - VeltActivityLog Component
