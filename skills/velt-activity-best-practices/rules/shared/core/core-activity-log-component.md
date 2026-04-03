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

**Correct (React — drop-in component with props):**

```jsx
import { VeltActivityLog } from '@veltdev/react';

function ActivitySidebar() {
  return (
    <VeltActivityLog
      darkMode={false}
      useDummyData={false}
      variant="sidebar"
    />
  );
}
```

**Correct (HTML — web component):**

```html
<!-- Basic usage -->
<velt-activity-log></velt-activity-log>

<!-- With dummy data for development -->
<velt-activity-log use-dummy-data="true"></velt-activity-log>
```

**Component props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `darkMode` | `boolean` | `false` | Enable dark mode styling |
| `shadowDom` | `boolean` | `false` | Render inside a shadow DOM |
| `useDummyData` | `boolean` | `false` | Show placeholder data for development/testing |
| `variant` | `string` | `undefined` | Layout variant (e.g. `"sidebar"`); consult docs for available values |

**Wireframe customization:**

The component supports full structural customization via `VeltActivityLogWireframe` / `<velt-activity-log-wireframe>`. It exposes 27 standalone primitive components, each accepting a `defaultCondition` prop to control render conditions. Exact primitive names and hierarchy are not enumerated in this rule — refer to the Velt docs for the complete wireframe API.

<!-- TODO (v5.0.2-beta.10): Verify the full list of 27 wireframe primitive component names and the accepted variant values. Release note confirms 27 primitives and wireframe support but does not enumerate them. See https://docs.velt.dev/async-collaboration/activity/customize-ui for the complete wireframe primitive reference. -->

**Verification:**
- [ ] `VeltActivityLog` imported from `'@veltdev/react'` (React) or used as `<velt-activity-log>` (HTML)
- [ ] Activity Logs enabled in Velt Console (see `core-setup` rule)
- [ ] `useDummyData` used only during development, not in production
- [ ] Wireframe customization references Velt docs for primitive component names

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/customize-ui - VeltActivityLog Component
