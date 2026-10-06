# Velt Activity Best Practices

**Version 1.2.1**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Activity Logs implementation guide covering real-time activity subscriptions, custom activity creation, CRDT debounce configuration, immutability for compliance audit trails, action type filtering, and REST API management. This skill provides evidence-backed patterns for integrating Velt's activity log system into React, Next.js, and other web applications.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Set Up Activity Logs with an Authenticated User and a Feed Surface](#11-set-up-activity-logs-with-an-authenticated-user-and-a-feed-surface)
   - 1.2 [Use VeltActivityLog Component to Display Activity Feed UI](#12-use-veltactivitylog-component-to-display-activity-feed-ui)

2. [Data Access](#2-data-access) — **HIGH**
   - 2.1 [Use useActivityUtils to Create Custom Activity Records](#21-use-useactivityutils-to-create-custom-activity-records)
   - 2.2 [Use useAllActivities Hook for Real-Time Activity Feeds](#22-use-useallactivities-hook-for-real-time-activity-feeds)
   - 2.3 [Use getActivityElement API to Create Custom Activity Records](#23-use-getactivityelement-api-to-create-custom-activity-records)
   - 2.4 [Use getAllActivities API for Real-Time Activity Subscriptions](#24-use-getallactivities-api-for-real-time-activity-subscriptions)

3. [Configuration](#3-configuration) — **MEDIUM**
   - 3.1 [Configure CRDT Activity Debounce Time](#31-configure-crdt-activity-debounce-time)
   - 3.2 [Enable Immutability for Compliance Audit Trails](#32-enable-immutability-for-compliance-audit-trails)
   - 3.3 [Use Action Type Constants for Type-Safe Activity Filtering](#33-use-action-type-constants-for-type-safe-activity-filtering)

4. [REST API](#4-rest-api) — **LOW-MEDIUM**
   - 4.1 [Use REST APIs for Server-Side Activity Log Management](#41-use-rest-apis-for-server-side-activity-log-management)

5. [Debugging & Testing](#5-debugging-testing) — **LOW-MEDIUM**
   - 5.1 [Debug Common Activity Log Issues](#51-debug-common-activity-log-issues)

6. [Wireframe Variables](#6-wireframe-variables) — **MEDIUM**
   - 6.1 [Bind Activity Log Wireframe Slots Using Template Variables](#61-bind-activity-log-wireframe-slots-using-template-variables)

7. [UI Wireframes](#7-ui-wireframes) — **MEDIUM**
   - 7.1 [Customize Activity Log Layout with Wireframe Sub-Components](#71-customize-activity-log-layout-with-wireframe-sub-components)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup required for any Velt activity log implementation: an authenticated user via authProvider, the VeltActivityLog drop-in UI component or a subscription, and the workspace-level activityServiceConfig (enablement, immutability, triggers) that the REST Add API depends on.

### 1.1 Set Up Activity Logs with an Authenticated User and a Feed Surface

**Impact: CRITICAL (Activity records are scoped to the signed-in user's organization and documents; without auth and a feed surface nothing renders)**

Activity Logs need an authenticated user inside `VeltProvider` and a place to show records: the prebuilt `VeltActivityLog` component or a `useAllActivities()` / `getAllActivities()` subscription. The current setup guide has no Velt Console enable step; you add the component, optionally create custom activities, and subscribe. Velt generates records for Comments, Reactions, Recorder, and CRDT automatically. Activity Logs shipped in the 5.0.2-beta line; use a current SDK.

**Incorrect (no authenticated user, no loading state):**

```jsx
import { VeltProvider, useAllActivities } from '@veltdev/react';

function App() {
  // No authProvider: there is no user/organization to scope activity to
  return (
    <VeltProvider apiKey="API_KEY">
      <ActivityFeed />
    </VeltProvider>
  );
}

function ActivityFeed() {
  const activities = useAllActivities();
  // Crashes while loading: activities is null
  return activities.map((a) => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Correct (authProvider + prebuilt component or hook with null handling):**

```jsx
import { VeltProvider, VeltActivityLog, useAllActivities } from '@veltdev/react';

const authProvider = user ? {
  user: {
    userId: user.userId,
    organizationId: user.organizationId,
    name: user.name,
    email: user.email,
  },
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
} : undefined;

function App() {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      {/* Option 1: prebuilt, filterable timeline grouped by date */}
      <VeltActivityLog />
      {/* Option 2: custom UI from the subscription */}
      <ActivityFeed />
    </VeltProvider>
  );
}

function ActivityFeed() {
  const activities = useAllActivities();
  if (activities === null) return <div>Loading...</div>;
  if (activities.length === 0) return <div>No activity yet</div>;
  return activities.map((a) => <div key={a.id}>{a.displayMessage}</div>);
}
```

**For non-React frameworks:**

```html
<velt-activity-log></velt-activity-log>

<script>
  const activityElement = Velt.getActivityElement();
  const subscription = activityElement.getAllActivities().subscribe((activities) => {
    if (activities === null) return; // Loading
    console.log(activities.map((a) => a.displayMessage));
  });
  // subscription?.unsubscribe();
</script>
```

**Setup Steps:**

1. **Authenticate**: configure `VeltProvider` with `authProvider` (not the deprecated `useIdentify`)
2. **Add the feed**: render `VeltActivityLog` / `<velt-activity-log>` (use `useDummyData` only while prototyping)
3. **Create custom activities (optional)**: `createActivity()` or the Add Activities REST API
4. **Subscribe (optional)**: `useAllActivities()` / `getAllActivities()` when building your own UI

**Workspace-level activity config:** activity logging is also controlled by the workspace `activityServiceConfig` (`isEnabled`, `immutable`, `triggers`), readable and writable with the Get / Update Activity Config workspace REST APIs. If a workspace has activity disabled, `VeltActivityLog` settles to its empty state (SDK 6.0.13+) instead of loading forever, and the Add Activities REST API requires `activityServiceConfig` to be enabled.

**Verification:**
- [ ] `VeltProvider` configured with API key and `authProvider` (not `useIdentify`)
- [ ] `VeltActivityLog` rendered or a subscription created, with the `null` loading state handled
- [ ] Records appear after a comment, reaction, recording, or CRDT edit
- [ ] If the feed stays empty, workspace `activityServiceConfig.isEnabled` checked via Get Activity Config

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/setup - "Add the Activity Log Component", "Create a Custom Activity", "Subscribe to Activities"
- https://docs.velt.dev/async-collaboration/activity/overview - "Automatic Activity Logging"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/activityconfig-update - "Update Activity Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/activityconfig-get - "Get Activity Config"

---

### 1.2 Use VeltActivityLog Component to Display Activity Feed UI

**Impact: HIGH (Drop-in activity feed UI with date grouping, filtering, and wireframe customization)**

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
| `shadowDom` | `boolean` | Not documented | Set `false` so your page CSS reaches the log and its wireframe slots |
| `useDummyData` | `boolean` | `false` | Render sample activities without a backend connection (prototyping only) |
| `variant` | `string` | None | Wireframe variant to render |

HTML attributes are kebab-case: `dark-mode`, `shadow-dom`, `use-dummy-data`, `variant`.

**Wireframe customization:**

Customize the layout with `VeltActivityLogWireframe` inside a `VeltWireframe` block rendered as a sibling of the host component (see `ui-wireframes`). Each sub-component accepts `defaultCondition?: boolean`.

```tsx
import { VeltWireframe, VeltActivityLogWireframe, VeltActivityLog } from '@veltdev/react';

<>
  <VeltWireframe>
    <VeltActivityLogWireframe>
      <VeltActivityLogWireframe.Header>
        <VeltActivityLogWireframe.Header.Title />
        <VeltActivityLogWireframe.Header.Filter />
      </VeltActivityLogWireframe.Header>
      <VeltActivityLogWireframe.Loading />
      <VeltActivityLogWireframe.List>
        <VeltActivityLogWireframe.List.DateGroup>
          <VeltActivityLogWireframe.List.DateGroup.Label />
        </VeltActivityLogWireframe.List.DateGroup>
        <VeltActivityLogWireframe.List.Item>
          <VeltActivityLogWireframe.List.Item.Avatar />
          <VeltActivityLogWireframe.List.Item.Content />
          <VeltActivityLogWireframe.List.Item.Time />
        </VeltActivityLogWireframe.List.Item>
        <VeltActivityLogWireframe.List.ShowMore />
      </VeltActivityLogWireframe.List>
      <VeltActivityLogWireframe.Empty />
    </VeltActivityLogWireframe>
  </VeltWireframe>
  <VeltActivityLog shadowDom={false} />
</>
```

**All 27 standalone primitive components (each accepts `defaultCondition`):**

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

#### Common Mistakes — DO NOT

**1. DO NOT replace `VeltActivityLog` with a custom `useAllActivities()` implementation.** The component handles date grouping, filtering, icons, loading states, and all activity types automatically. If it shows its empty state, usually no activities have been recorded yet for the current scope (or the workspace has activity disabled; see `core-setup`). On SDK builds before 6.0.13 it could also flash "No activities found" right after an organization switch, document switch, or sign-out, or stay on the loading skeleton when the workspace had activity disabled. Do NOT rewrite it as a custom component.

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
- [ ] `VeltProvider` has an authenticated user via `authProvider` (see `core-setup` rule)
- [ ] `useDummyData` used only during development, not in production
- [ ] Wireframe customization references Velt docs for primitive component names

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/setup - "Add the Activity Log Component"
- https://docs.velt.dev/async-collaboration/activity/customize-behavior#usedummydata - "useDummyData"
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-primitives - "Activity Logs Primitives"
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframes - "Activity Logs Wireframes"

---

## 2. Data Access

**Impact: HIGH**

Patterns for subscribing to real-time activity feeds and creating custom activity records. Includes React hooks (useAllActivities, useActivityUtils) and SDK APIs (getAllActivities, createActivity via getActivityElement).

### 2.1 Use useActivityUtils to Create Custom Activity Records

**Impact: HIGH (Emit custom application events into the unified activity feed from React components)**

Use `useActivityUtils()` to access the activity element and call `createActivity()` to push custom events (deployments, status changes, escalations) into the unified activity feed alongside Velt-generated records.

**Incorrect (missing template data for variables):**

```jsx
import { useActivityUtils } from '@veltdev/react';

function DeployButton() {
  const activityElement = useActivityUtils();

  const logDeploy = async () => {
    await activityElement?.createActivity({
      featureType: 'custom',
      actionType: 'custom',
      targetEntityId: 'deploy-123',
      // Template uses {{version}} but no templateData provided — renders raw {{version}}
      displayMessageTemplate: '{{actionUser.name}} deployed {{version}}',
    });
  };

  return <button onClick={logDeploy}>Deploy</button>;
}
```

**Correct (custom activity with template data):**

```jsx
import { useActivityUtils } from '@veltdev/react';

function DeployButton({ version }) {
  const activityElement = useActivityUtils();

  const logDeploy = async () => {
    await activityElement?.createActivity({
      featureType: 'custom',
      actionType: 'custom',
      targetEntityId: 'deploy-123',
      displayMessageTemplate: '{{actionUser.name}} deployed version {{version}}',
      displayMessageTemplateData: {
        version: version  // Must match {{version}} in template
      },
    });
  };

  return <button onClick={logDeploy}>Deploy v{version}</button>;
}
```

**More examples:**

```jsx
// Status change
await activityElement?.createActivity({
  featureType: 'custom',
  actionType: 'custom',
  targetEntityId: 'task-456',
  displayMessageTemplate: '{{actionUser.name}} changed status to {{status}}',
  displayMessageTemplateData: { status: 'In Review' },
});

// User assignment
await activityElement?.createActivity({
  featureType: 'custom',
  actionType: 'custom',
  targetEntityId: 'ticket-789',
  displayMessageTemplate: '{{actionUser.name}} assigned {{assignee}} to this ticket',
  displayMessageTemplateData: { assignee: 'Jane Smith' },
});
```

**CreateActivityData — complete schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `featureType` | `ActivityFeatureType` | Yes | `'comment'` \| `'reaction'` \| `'recorder'` \| `'crdt'` \| `'custom'` |
| `actionType` | `string` | Yes | `'custom'` or a specific action name |
| `targetEntityId` | `string` | Required for `'custom'` | ID of the entity being acted upon; optional for `comment`, `reaction`, `recorder`, `crdt` |
| `targetSubEntityId` | `string \| null` | No | ID of sub-entity within target (e.g., comment within thread) |
| `displayMessageTemplate` | `string` | No | Template with `{{variable}}` placeholders |
| `displayMessageTemplateData` | `Record<string, unknown>` | No | Key-value pairs for template interpolation |
| `id` | `string` | No | Optional record ID for idempotent writes |
| `eventType` | `string` | No | Sub-event type within the action |
| `changes` | `ActivityChanges` | No | Before/after field changes: `{ [key]: { from, to } }` |
| `entityData` | `unknown` | No | Full entity object snapshot at time of action |
| `entityTargetData` | `unknown` | No | Full target entity object snapshot at time of action |
| `actionIcon` | `string` | No | Icon URL or identifier for custom action |

**Template variables:**
- `{{actionUser.name}}` resolves from the acting user; you do not pass it in `displayMessageTemplateData`
- Nested paths work when you pass an object, e.g. `{{assignee.name}}` with `displayMessageTemplateData: { assignee: { name: 'Alice' } }`

**Key details:**
- `createActivity()` returns `Promise<void>` — await it for error handling
- Check `activityElement` is not null before calling (use optional chaining `?.`)
- Every `{{variable}}` in the template must have a matching key in `displayMessageTemplateData` (except built-in variables like `{{actionUser.name}}`)
- Custom activities appear with `featureType: 'custom'` and can be filtered accordingly

**Verification:**
- [ ] `activityElement` null-checked before calling createActivity
- [ ] All template variables have matching keys in displayMessageTemplateData
- [ ] featureType and actionType set appropriately
- [ ] targetEntityId identifies the relevant entity

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/customize-behavior#createactivity - "createActivity"
- https://docs.velt.dev/api-reference/sdk/models/data-models#createactivitydata - "CreateActivityData"

---

### 2.2 Use useAllActivities Hook for Real-Time Activity Feeds

**Impact: HIGH (Real-time activity data in React components without manual subscription management)**

The `useAllActivities` hook returns a reactive array of ActivityRecord objects that updates automatically when new activity occurs. It returns `null` while loading — this must be handled explicitly.

**Incorrect (not handling null loading state):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  const activities = useAllActivities();

  // TypeError: Cannot read properties of null (reading 'map')
  return activities.map(a => <div>{a.displayMessage}</div>);
}
```

**Correct (org-wide feed with null handling):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  // No config = org-wide feed (all documents, all features)
  const activities = useAllActivities();

  if (activities === null) return <div>Loading activities...</div>;
  if (activities.length === 0) return <div>No activity yet</div>;

  return (
    <ul>
      {activities.map(a => (
        <li key={a.id}>
          <span>{a.displayMessage}</span>
          <time>{new Date(a.timestamp).toLocaleString()}</time>
        </li>
      ))}
    </ul>
  );
}
```

**Correct (document-scoped feed with filters):**

```jsx
import { useAllActivities } from '@veltdev/react';

function DocumentActivityFeed({ documentId }) {
  // Filter to a specific document and feature types
  const activities = useAllActivities({
    documentIds: [documentId],
    featureTypes: ['comment', 'reaction'],
  });

  if (activities === null) return <div>Loading...</div>;

  return (
    <ul>
      {activities.map(a => (
        <li key={a.id}>{a.displayMessage}</li>
      ))}
    </ul>
  );
}
```

**Correct (filtered by action types):**

```jsx
import { useAllActivities } from '@veltdev/react';

function CommentActivityFeed() {
  const activities = useAllActivities({
    featureTypes: ['comment'],
    actionTypes: ['commentAdded', 'commentUpdated'],
  });

  if (activities === null) return null;

  return activities.map(a => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Filter options (ActivitySubscribeConfig):**

| Property | Type | Description |
|----------|------|-------------|
| `organizationId` | `string` | Scope feed to specific organization |
| `documentIds` | `string[]` | Filter to specific documents |
| `currentDocumentOnly` | `boolean` | Limit to current document (auto-switches on setDocument) |
| `maxDays` | `number` | Max age in days (default: 30) |
| `featureTypes` | `ActivityFeatureType[]` | Filter by feature: `'comment'`, `'reaction'`, `'recorder'`, `'crdt'`, `'custom'` |
| `excludeFeatureTypes` | `ActivityFeatureType[]` | Exclude specific feature areas |
| `actionTypes` | `string[]` | Filter by action type (use exported constants) |
| `excludeActionTypes` | `string[]` | Exclude specific action types |
| `userIds` | `string[]` | Filter by specific user IDs |
| `excludeUserIds` | `string[]` | Exclude specific user IDs |

**ActivityRecord (returned by useAllActivities):**

```typescript
interface ActivityRecord {
  id: string;                                    // Unique activity log ID
  featureType: ActivityFeatureType;              // 'comment' | 'reaction' | 'recorder' | 'crdt' | 'custom'
  actionType: string;                            // Specific action (use constants from config-action-type-filters rule)
  eventType?: string;                            // Sub-event type within the action
  actionUser: User;                              // User who performed the action
  timestamp: number;                             // Unix timestamp (ms)
  metadata: ActivityMetadata;                    // Document/org context
  targetEntityId?: string;                       // ID of entity this log targets
  targetSubEntityId?: string | null;             // ID of sub-entity within target
  changes?: ActivityChanges;                     // Before/after field changes: { [key]: { from, to } }
  entityData?: unknown;                          // Full entity object at time of action
  entityTargetData?: unknown;                    // Full target entity object at time of action
  displayMessageTemplate?: string;               // Template with {{variable}} placeholders
  displayMessageTemplateData?: Record<string, unknown>; // Data to resolve template
  displayMessage?: string;                       // Resolved human-readable message (computed client-side)
  actionIcon?: string;                           // Icon URL or identifier for action
  immutable?: boolean;                           // Cannot be updated/deleted if true
  isActivityResolverUsed?: boolean;              // True when PII was stripped by resolver
}

interface ActivityChanges {
  [key: string]: { from: unknown | null; to: unknown | null } | undefined;
}
```

**Key details:**
- Returns `null` while loading — always check before rendering
- Returns `[]` when no activities match
- Emits the full activity list on every change (not incremental diffs)
- Hook handles subscription lifecycle automatically — no cleanup needed
- `displayMessage` is the resolved string; `displayMessageTemplate` is the raw template

**Verification:**
- [ ] Null loading state handled (not rendered as empty list)
- [ ] Filters applied to reduce unnecessary data
- [ ] Hook used within a component inside VeltProvider

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/customize-behavior#getallactivities - "getAllActivities" (Using Hook)
- https://docs.velt.dev/api-reference/sdk/models/data-models#activityrecord - "ActivityRecord"

---

### 2.3 Use getActivityElement API to Create Custom Activity Records

**Impact: HIGH (Emit custom application events from any framework into the activity feed)**

For non-React frameworks or API-based usage, access the activity element via `client.getActivityElement()` (React) or `Velt.getActivityElement()` (other frameworks) to call `createActivity()`.

**Incorrect (calling createActivity without awaiting):**

```js
const activityElement = Velt.getActivityElement();

// Not awaiting — errors silently swallowed
activityElement.createActivity({
  featureType: 'custom',
  actionType: 'custom',
  targetEntityId: 'entity-1',
  displayMessageTemplate: '{{actionUser.name}} performed action',
});
```

**Correct (React API path):**

```jsx
import { useVeltClient } from '@veltdev/react';

function EscalationButton({ ticketId }) {
  const { client } = useVeltClient();

  const logEscalation = async () => {
    const activityElement = client.getActivityElement();
    await activityElement.createActivity({
      featureType: 'custom',
      actionType: 'custom',
      targetEntityId: ticketId,
      displayMessageTemplate: '{{actionUser.name}} escalated ticket {{ticketId}}',
      displayMessageTemplateData: { ticketId },
    });
  };

  return <button onClick={logEscalation}>Escalate</button>;
}
```

**Correct (non-React frameworks):**

```js
const activityElement = Velt.getActivityElement();

// Custom featureType — targetEntityId required; id for idempotency
await activityElement.createActivity({
  id: 'deploy-abc123',         // optional — stable ID for deduplication
  featureType: 'custom',
  actionType: 'custom',
  targetEntityId: 'deploy-v2', // required for 'custom' featureType
  displayMessageTemplate: '{{actionUser.name}} deployed version {{version}}',
  displayMessageTemplateData: { version: 'v2.3.1' },
});

// Built-in featureType — targetEntityId is optional
await activityElement.createActivity({
  featureType: 'comment',      // one of: comment | reaction | recorder | crdt | custom
  actionType: 'custom',
  displayMessageTemplate: '{{actionUser.name}} added a comment',
});
```

**Use cases for custom activities:**
- Deployments and releases
- Status transitions (draft → review → approved)
- Escalations and reassignments
- AI agent actions (for traceability and audit)
- Custom application events not covered by Velt features

**Key details:**
- `createActivity()` returns `Promise<void>` — always await for proper error handling
- `featureType` is validated against an enum: `'comment' | 'reaction' | 'recorder' | 'crdt' | 'custom'` — invalid values are rejected
- `targetEntityId` is **required** when `featureType` is `'custom'`; it is **optional** for built-in featureTypes (`comment`, `reaction`, `recorder`, `crdt`)
- `id` (optional) — provide a stable string to make the Firestore write idempotent; if the same ID is submitted twice, only one record is created
- Custom activities merge into the same feed as Velt-generated activities
- In React, prefer `useActivityUtils()` hook for simpler code (see `data-create-custom-hook` rule)

**Verification:**
- [ ] `createActivity()` awaited
- [ ] Template variables have matching keys in displayMessageTemplateData
- [ ] Activity appears in the feed after creation

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/customize-behavior#createactivity - "createActivity"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#createactivity - "createActivity()"

---

### 2.4 Use getAllActivities API for Real-Time Activity Subscriptions

**Impact: HIGH (Framework-agnostic real-time activity feed with subscription cleanup)**

For non-React frameworks or when you need manual subscription control, use `getActivityElement().getAllActivities()` which returns an Observable. Subscriptions must be cleaned up to prevent memory leaks.

**Incorrect (subscription without cleanup):**

```jsx
import { useVeltClient } from '@veltdev/react';

function ActivityFeed() {
  const { client } = useVeltClient();

  useEffect(() => {
    const activityElement = client.getActivityElement();
    // Memory leak — subscription never cleaned up
    activityElement.getAllActivities().subscribe((activities) => {
      console.log(activities);
    });
  }, [client]);
}
```

**Correct (React API with proper cleanup):**

```jsx
import { useVeltClient } from '@veltdev/react';

function ActivityFeed() {
  const { client } = useVeltClient();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const activityElement = client.getActivityElement();
    const subscription = activityElement.getAllActivities().subscribe((data) => {
      if (data === null) return; // Loading
      setActivities(data);
    });

    // Clean up subscription on unmount
    return () => subscription?.unsubscribe();
  }, [client]);

  return activities.map(a => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Correct (with filters):**

```jsx
useEffect(() => {
  const activityElement = client.getActivityElement();
  const subscription = activityElement.getAllActivities({
    documentIds: ['my-document-id'],
    featureTypes: ['comment', 'reaction'],
  }).subscribe((data) => {
    if (data !== null) setActivities(data);
  });

  return () => subscription?.unsubscribe();
}, [client]);
```

**For non-React frameworks (vanilla JS, Vue, Angular):**

```js
const activityElement = Velt.getActivityElement();

// Org-wide subscription
const subscription = activityElement.getAllActivities().subscribe((activities) => {
  if (activities === null) return; // Loading
  renderActivityFeed(activities);
});

// Document-scoped subscription
const subscription = activityElement.getAllActivities({
  documentIds: ['doc-123'],
  featureTypes: ['comment'],
}).subscribe((activities) => {
  if (activities !== null) renderActivityFeed(activities);
});

// Cleanup when done
subscription.unsubscribe();
```

**Key details:**
- `getAllActivities()` returns `Observable<ActivityRecord[] | null>`
- Must call `.subscribe()` — it returns an Observable, not a Promise
- Emits `null` while loading, `[]` when no activities
- Emits the full list on every change
- `ActivityRecord.isActivityResolverUsed?: boolean` — present and `true` when the activity resolver hydrated (re-enriched) this record after stripping PII on write; use this to detect resolver-hydrated records vs. raw records
- In React, prefer `useAllActivities()` hook for simpler code (see `data-subscribe-hook` rule)

**Verification:**
- [ ] Subscription stored in variable for cleanup
- [ ] `.unsubscribe()` called on component unmount or when done
- [ ] Null emissions handled (loading state)
- [ ] Using `getActivityElement()` not `getActivityElement` (must call the function)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/customize-behavior#getallactivities - "getAllActivities"
- https://docs.velt.dev/api-reference/sdk/models/data-models#activitysubscribeconfig - "ActivitySubscribeConfig"

---

## 3. Configuration

**Impact: MEDIUM**

Configuration options for activity log behavior. Includes CRDT debounce time to control edit batching frequency, immutability toggle for compliance audit trails, and action type constant filtering for type-safe feed scoping.

### 3.1 Configure CRDT Activity Debounce Time

**Impact: MEDIUM (Tune how CRDT keystrokes are grouped into activity records; values under the 10-second minimum are ignored)**

CRDT editor keystrokes are batched into a single activity record per debounce window. The default window is 10 minutes, which can make a document timeline too coarse. Use `setActivityDebounceTime()` on the CRDT element to pick a window that matches your timeline. The minimum is 10 seconds (10,000 ms).

**Incorrect (calling it on the wrong element, and below the minimum):**

```jsx
const activityElement = client.getActivityElement();
// ActivityElement has no setActivityDebounceTime method
activityElement.setActivityDebounceTime(5000);

const crdtElement = client.getCrdtElement();
// 5000 ms is below the 10,000 ms minimum
crdtElement.setActivityDebounceTime(5000);
```

**Correct (React / Next.js):**

```jsx
import { useEffect } from 'react';
import { useVeltClient } from '@veltdev/react';

function EditorSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // One activity record per 30-second editing window
    const crdtElement = client.getCrdtElement();
    crdtElement.setActivityDebounceTime(30000);
  }, [client]);

  return <YourEditor />;
}

// Hook alternative: useCrdtUtils() exposes the same method
// const crdtUtils = useCrdtUtils();
// crdtUtils?.setActivityDebounceTime(30000);
```

**Correct (Other Frameworks):**

```js
const crdtElement = Velt.getCrdtElement();
crdtElement.setActivityDebounceTime(30000); // 30 seconds
```

**Key details:**
- Parameter is in **milliseconds**
- **Default: 10 minutes (600,000 ms)**
- **Minimum: 10 seconds (10,000 ms)**. The overview page's `setActivityDebounceTime(5000)` example is below this minimum; use 10,000 ms or more
- Called on the **CRDT element** (`getCrdtElement()` / `useCrdtUtils()`), not the activity element
- All edits within the window are flushed as one activity record (`featureType: 'crdt'`, action `crdt.editor_edit`)
- Lower values give more granular records; higher values give less noise

**Verification:**
- [ ] `setActivityDebounceTime()` called on the CRDT element
- [ ] Value is at least 10,000 ms
- [ ] Activity feed shows batched CRDT entries at the expected cadence

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setactivitydebouncetime - "setActivityDebounceTime()" (default 10 minutes, minimum 10 seconds)
- https://docs.velt.dev/async-collaboration/activity/overview#automatic-activity-logging - "Automatic Activity Logging"

---

### 3.2 Enable Immutability for Compliance Audit Trails

**Impact: MEDIUM (Tamper-evident activity records for SOX, SOC 2, HIPAA compliance)**

When immutability is on, activity records cannot be edited or deleted after creation, giving you a tamper-evident audit trail. Turn it on in the Velt Console, or set `activityServiceConfig.immutable` with the Update Activity Config workspace REST API. Records carry `immutable: true`, and the Update / Delete Activities REST APIs refuse to change them.

**Incorrect (assuming records are immutable and calling SDK methods that do not exist):**

```js
// Immutability is a workspace setting; it is not implied by your code.
// The client ActivityElement only exposes getAllActivities() and createActivity();
// updates and deletes go through the REST API.
await activityElement.updateActivity({ id: 'activity-123' }); // not an SDK method
```

**Correct (turn immutability on for the workspace, server-side):**

```js
// POST https://api.velt.dev/v2/workspace/activityconfig/update
await fetch('https://api.velt.dev/v2/workspace/activityconfig/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN, // API-key-level auth token
  },
  body: JSON.stringify({
    data: {
      activityServiceConfig: { immutable: true }, // deep-merged with the stored config
    },
  }),
});
```

**Correct (treat records as read-only in your app):**

```jsx
const activities = useAllActivities({ documentIds: [documentId] });

// With immutability on, each record reports immutable: true
const locked = activities?.every((a) => a.immutable);
```

**When Immutability is ON:**
- Records cannot be edited or deleted after creation
- Update / Delete Activities REST API calls fail for immutable records

**When Immutability is OFF:**
- Records can be updated or removed through the REST API

**Default to know:** when activity logging is first enabled through the Update Activity Config API (`activityServiceConfig.isEnabled: true` with no stored config), Velt seeds `immutable: true` along with the default comment triggers. Send `immutable: false` in the same request if you need mutable records.

**Use cases:**
- Invoice sign-offs ("who approved what, when")
- Legal document reviews and budget approvals
- Compliance audit trails (SOX, SOC 2, HIPAA)
- AI agent action traceability

**Verification:**
- [ ] Immutability enabled in the Velt Console or via `activityServiceConfig.immutable` for regulated workflows
- [ ] Application code does not plan to update or delete immutable records
- [ ] Get Activity Config confirms the stored `immutable` value

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/overview#immutability - "Immutability"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/activityconfig-update - "Update Activity Config" (`immutable`, defaults on first enable)
- https://docs.velt.dev/api-reference/sdk/models/data-models#activityrecord - "ActivityRecord" (`immutable`)

---

### 3.3 Use Action Type Constants for Type-Safe Activity Filtering

**Impact: MEDIUM (Prevent typos and ensure valid filter values with exported constants)**

Velt exports constant objects for each feature's action types. Use these instead of raw strings to avoid typos, get IDE autocomplete, and ensure filters reference valid action types.

**Incorrect (raw strings prone to typos):**

```jsx
const activities = useAllActivities({
  featureTypes: ['comment'],
  // Typo: 'comment_add' instead of correct value — silently returns no results
  actionTypes: ['comment_add'],
});
```

**Correct (imported constants with autocomplete):**

```jsx
import {
  useAllActivities,
  CommentActivityActionTypes,
  ReactionActivityActionTypes,
} from '@veltdev/react';

function CommentActivityFeed() {
  const activities = useAllActivities({
    featureTypes: ['comment'],
    actionTypes: [
      CommentActivityActionTypes.COMMENT_ADD,
      CommentActivityActionTypes.COMMENT_UPDATE,
      CommentActivityActionTypes.COMMENT_DELETE,
    ],
  });

  if (activities === null) return null;
  return activities.map(a => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Filtering reactions:**

```jsx
import { ReactionActivityActionTypes } from '@veltdev/react';

const activities = useAllActivities({
  featureTypes: ['reaction'],
  actionTypes: [
    ReactionActivityActionTypes.REACTION_ADD,   // 'reaction.add'
    ReactionActivityActionTypes.REACTION_DELETE, // 'reaction.delete'
  ],
});
```

**Filtering across feature types:**

```jsx
import {
  CommentActivityActionTypes,
  RecorderActivityActionTypes,
} from '@veltdev/react';

const activities = useAllActivities({
  featureTypes: ['comment', 'recorder'],
  actionTypes: [
    CommentActivityActionTypes.COMMENT_ADD,
    RecorderActivityActionTypes.RECORDING_ADD,     // 'recording.add'
  ],
});
```

**Available constant objects:**

**CommentActivityActionTypes** (union type: `CommentActivityActionType`):

| Constant | Value | Description |
|----------|-------|-------------|
| `ANNOTATION_ADD` | `'comment_annotation.add'` | Comment annotation added |
| `ANNOTATION_DELETE` | `'comment_annotation.delete'` | Comment annotation deleted |
| `COMMENT_ADD` | `'comment.add'` | Comment added |
| `COMMENT_UPDATE` | `'comment.update'` | Comment updated |
| `COMMENT_DELETE` | `'comment.delete'` | Comment deleted |
| `STATUS_CHANGE` | `'comment_annotation.status_change'` | Status changed |
| `PRIORITY_CHANGE` | `'comment_annotation.priority_change'` | Priority changed |
| `ASSIGN` | `'comment_annotation.assign'` | Assigned |
| `ACCESS_MODE_CHANGE` | `'comment_annotation.access_mode_change'` | Access mode changed |
| `CUSTOM_LIST_CHANGE` | `'comment_annotation.custom_list_change'` | Custom list changed |
| `APPROVE` | `'comment_annotation.approve'` | Approved |
| `ACCEPT` | `'comment.accept'` | Comment accepted |
| `REJECT` | `'comment.reject'` | Comment rejected |
| `REACTION_ADD` | `'comment.reaction_add'` | Reaction added to comment |
| `REACTION_DELETE` | `'comment.reaction_delete'` | Reaction removed from comment |
| `SUBSCRIBE` | `'comment_annotation.subscribe'` | Subscribed to annotation |
| `UNSUBSCRIBE` | `'comment_annotation.unsubscribe'` | Unsubscribed from annotation |

**Other feature constants:**

**RecorderActivityActionTypes** (union type: `RecorderActivityActionType`):

| Constant | Value | Description |
|----------|-------|-------------|
| `RECORDING_ADD` | `'recording.add'` | Recording added |
| `RECORDING_DELETE` | `'recording.delete'` | Recording deleted |

**ReactionActivityActionTypes** (union type: `ReactionActivityActionType`):

| Constant | Value | Description |
|----------|-------|-------------|
| `REACTION_ADD` | `'reaction.add'` | Reaction added |
| `REACTION_DELETE` | `'reaction.delete'` | Reaction removed |

**CrdtActivityActionTypes** (union type: `CrdtActivityActionType`):

| Constant | Value | Description |
|----------|-------|-------------|
| `EDITOR_EDIT` | `'crdt.editor_edit'` | CRDT editor edit occurred |

**For non-React frameworks:**

```js
// Use the string values from the tables above (or the exported constants if your build exposes them)
const activityElement = Velt.getActivityElement();
activityElement.getAllActivities({
  featureTypes: ['comment'],
  actionTypes: ['comment.add', 'comment.update'],
}).subscribe((activities) => {
  // Handle activities
});
```

**Key details:**
- The docs name the constant objects and union types (`CommentActivityActionTypes` / `CommentActivityActionType`, etc.) but do not show an import path; if your package does not export them, use the string values from the tables
- Using constants enables IDE autocomplete and catches typos at compile time
- Combine `featureTypes` and `actionTypes` filters for precise scoping
- Custom activities use `featureType: 'custom'` and any `actionType` string you choose (for example `'custom'` or `'deployed_to_production'`); no constants exist for them
- The Get Activities REST API accepts the same strings in `actionTypes`

**Verification:**
- [ ] Action type constants imported from SDK (not using raw strings)
- [ ] Filters match the intended feature and action types
- [ ] Activity feed returns expected results with filters applied

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/overview#activity-log-action-types - "Activity Log Action Types"
- https://docs.velt.dev/api-reference/sdk/models/data-models#activity-log-action-type-constants - "Activity Log Action Type Constants"

---

## 4. REST API

**Impact: LOW-MEDIUM**

Server-side activity log management via REST API. Covers Get, Add, Update, and Delete endpoints (result.data / result.pageToken responses) for programmatic access from backend services.

### 4.1 Use REST APIs for Server-Side Activity Log Management

**Impact: LOW-MEDIUM (Programmatic server-side access to activity records for backend integrations)**

Four REST API endpoints allow managing activity logs from your backend: Get, Add, Update, and Delete. These require your API key and are independent of the client-side SDK.

**Incorrect (using client SDK for server-side operations):**

```js
// Server-side code should NOT use the client SDK
// The client SDK requires browser context and user authentication
import { Velt } from '@veltdev/client';
// This won't work in a Node.js backend
```

**Correct (Get activities via REST API):**

```js
// GET activities with filters
const response = await fetch('https://api.velt.dev/v2/activities/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': authToken,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',
      documentId: 'doc-456',           // Optional: filter by document
      featureTypes: ['comment'],        // Optional: filter by feature
      pageSize: 50,                     // Optional: pagination
      order: 'desc',                    // Optional: 'asc' or 'desc'
    }
  }),
});

const { result } = await response.json();
const activities = result.data;      // ActivityRecord[]
const nextPage = result.pageToken;   // pass back as pageToken
```

**Correct (Add custom activities via REST API):**

Adding activities requires `activityServiceConfig` to be enabled for the workspace (Velt Console or the Update Activity Config workspace API).

```js
// Add activities from backend (e.g., CI/CD pipeline, cron jobs)
const response = await fetch('https://api.velt.dev/v2/activities/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': authToken,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',
      documentId: 'doc-456',
      activities: [{
        id: 'build-789-unique',       // optional: an existing record with this ID is overwritten
        featureType: 'custom',         // one of: comment | reaction | recorder | crdt | custom
        actionType: 'custom',
        actionUser: { userId: 'system', name: 'CI Bot' },
        targetEntityId: 'build-789',   // required for 'custom'; optional for built-in types
        displayMessageTemplate: '{{actionUser.name}} completed build {{buildId}}',
        displayMessageTemplateData: { buildId: '#789' },
      }]
    }
  }),
});
```

**Correct (Update activities via REST API):**

```js
await fetch('https://api.velt.dev/v2/activities/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': authToken,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',
      activities: [{
        id: 'activity-1',                 // required
        displayMessageTemplate: '{{actionUser.name}} completed build {{buildId}}',
        displayMessageTemplateData: { buildId: '#790' },
      }],
    }
  }),
});
```

**Correct (Delete activities via REST API):**

```js
// Delete by activity IDs
const response = await fetch('https://api.velt.dev/v2/activities/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': authToken,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',
      activityIds: ['activity-1', 'activity-2'],
    }
  }),
});
```

**REST API endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/activities/get` | POST | Retrieve activities with filters and pagination |
| `/v2/activities/add` | POST | Create new activity records server-side |
| `/v2/activities/update` | POST | Update existing records (fails if immutable) |
| `/v2/activities/delete` | POST | Delete records by document, entity, or IDs (fails if immutable) |

**Key details:**
- All endpoints use POST method with JSON body
- Require `x-velt-api-key` and `x-velt-auth-token` headers
- Delete accepts `documentId`, `targetEntityId`, or `activityIds` (at least one required)
- Update and Delete fail for immutable records (see `config-immutability` rule)
- Get filters: `documentId`, `targetEntityId`, `featureTypes`, `actionTypes`, `userId`, `activityIds`; pagination via `pageSize` (default 1000), `pageToken`, and `order` (default `desc`)
- Add requires `organizationId`, `documentId`, and per activity `featureType`, `actionType`, `actionUser`
- Update accepts `changes`, `entityData`, `entityTargetData`, `displayMessageTemplate`, `displayMessageTemplateData`, `actionIcon` per activity `id`
- Set `isActivityResolverUsed: true` on Add when you self-host activity PII with an activity data provider
- `featureType` is validated against `'comment' | 'reaction' | 'recorder' | 'crdt' | 'custom'` — invalid values are rejected by the API
- `targetEntityId` is required in activity objects only when `featureType` is `'custom'`; it is optional for built-in featureTypes
- `id` (optional): provide a stable ID to control the record ID; if a record with that ID already exists it is overwritten

**Verification:**
- [ ] API key stored securely (environment variable, not client-side)
- [ ] Auth token generated server-side
- [ ] Correct endpoint URL and headers
- [ ] Immutability considered before update/delete operations
- [ ] Workspace `activityServiceConfig` enabled before calling Add
- [ ] Response read from `result.data` / `result.pageToken`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/get-activities - "Get Activity Logs"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/add-activities - "Add Activity Logs"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/update-activities - "Update Activity Logs"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/delete-activities - "Delete Activity Logs"

---

## 5. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns and verification checklists for Velt activity log integrations.

### 5.1 Debug Common Activity Log Issues

**Impact: LOW-MEDIUM (Quick troubleshooting for frequent activity log integration problems)**

Common issues when integrating Velt Activity Logs and how to resolve them.

**Issue 1: Activities not appearing in feed**

```jsx
// Check these in order:
// 1. VeltProvider configured with a valid API key and authProvider?
// 2. Filters (documentIds, featureTypes, actionTypes, maxDays default 30) not excluding everything?
// 3. Document set (if using currentDocumentOnly or document filters)?
// 4. Subscription active (not unsubscribed prematurely)?
// 5. Workspace activity enabled? Check activityServiceConfig.isEnabled
//    with the Get Activity Config workspace REST API

// Quick verification:
const activities = useAllActivities();
console.log('Activities state:', activities);
// null = loading, [] = no activities, [...] = has data
```

**Issue 2: useAllActivities returns null indefinitely**

```jsx
// null is the loading state. If it persists:
// 1. Verify VeltProvider wraps the component and the user is authenticated
// 2. Check browser console for Velt SDK errors
// 3. On SDK builds before 6.0.13, VeltActivityLog could spin forever when the
//    workspace had activity disabled; 6.0.13+ settles to the empty state

function ActivityFeed() {
  const activities = useAllActivities();

  // Always handle null state explicitly
  if (activities === null) {
    return <div>Loading activities...</div>;
    // If this persists, check authProvider and workspace activity config
  }

  return activities.map(a => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Issue 3: Observable subscription memory leak**

```jsx
// Incorrect — subscription never cleaned up
useEffect(() => {
  const activityElement = client.getActivityElement();
  activityElement.getAllActivities().subscribe((data) => {
    setActivities(data);
  });
  // Missing cleanup!
}, [client]);

// Correct — store and unsubscribe
useEffect(() => {
  const activityElement = client.getActivityElement();
  const subscription = activityElement.getAllActivities().subscribe((data) => {
    if (data !== null) setActivities(data);
  });
  return () => subscription?.unsubscribe(); // Cleanup
}, [client]);
```

**Issue 4: CRDT edit records too coarse or too frequent**

```jsx
// Default: one CRDT activity record per 10-minute window
// Adjust on the CRDT element (NOT the activity element); minimum 10,000 ms

// Incorrect target:
const activityElement = client.getActivityElement();
// activityElement has no setActivityDebounceTime method

// Correct target:
const crdtElement = client.getCrdtElement();
crdtElement.setActivityDebounceTime(10000); // 10 seconds is the minimum
```

**Issue 5: Custom activity template not rendering correctly**

```jsx
// Template variables must exactly match keys in displayMessageTemplateData

// Incorrect — {{ver}} doesn't match 'version' key
await activityElement?.createActivity({
  displayMessageTemplate: '{{actionUser.name}} deployed {{ver}}',
  displayMessageTemplateData: { version: 'v1.0' }, // Key is 'version' not 'ver'
});
// Result: "John deployed {{ver}}" — variable not interpolated

// Correct — keys match
await activityElement?.createActivity({
  displayMessageTemplate: '{{actionUser.name}} deployed {{version}}',
  displayMessageTemplateData: { version: 'v1.0' },
});
// Result: "John deployed v1.0"
```

**Issue 6: REST API Add endpoint fails**

```js
// Verify:
// 1. activityServiceConfig is enabled for the workspace (Console or
//    POST /v2/workspace/activityconfig/update with { isEnabled: true })
// 2. API key and auth token are correct
// 3. organizationId and documentId are present
// 4. Each activity has featureType, actionType, actionUser
//    (targetEntityId is required only when featureType is 'custom')
```

**Issue 7: "No activities found" flashes after switching organization or document**

```js
// SDK builds before 6.0.13 showed the empty state instead of the loading state
// right after an organization switch, document switch, or sign-out.
// Upgrade to 6.0.13 or later.
```

**Verification checklist:**
- [ ] VeltProvider wrapping components with valid API key and authProvider
- [ ] Workspace activityServiceConfig enabled (required for REST Add)
- [ ] User authenticated via Velt
- [ ] Document ID set for document-scoped feeds
- [ ] Observable subscriptions cleaned up on unmount
- [ ] CRDT debounce, if set, is at least 10,000 ms
- [ ] Template variable names match displayMessageTemplateData keys

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/setup - "Setup"
- https://docs.velt.dev/async-collaboration/activity/customize-behavior#getallactivities - "getAllActivities"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/add-activities - "Add Activity Logs" (activityServiceConfig requirement)
- https://docs.velt.dev/release-notes/version-6/sdk-changelog - 6.0.13 Activity Logs fixes

---

## 6. Wireframe Variables

**Impact: MEDIUM**

Template variables exposed inside Activity Log wireframe slots and consumed via `<velt-data field="...">`, `velt-if="{var} <op> 'value'"`, and `velt-class="'cls': {var}"`. Covers App State (`user`, `darkMode`), Feature State (`isEnabled`), Data State (`allActivities`, `filteredActivities`, `groupedActivities`, `virtualScrollItems`, `activeFilter`, `availableFilters`), UI State (`isOpen`, `darkMode`, `variant`, `expandedGroups`, `defaultVisibleCount`, `filterDropdownOpen`), loop-scope variables (`dateGroup`, `activity`/`activityRecord`, `filter`/`filterOption`, `isActive`, `isExpanded`, `remainingCount`), the cross-cutting `defaultCondition` / `default-condition` prop, and Angular signal inputs `[componentConfigSignal]` and `[parentLocalUIState]`.

### 6.1 Bind Activity Log Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives dynamic content, conditional rendering, and class toggling inside Activity Log wireframe slots without manual subscriptions)**

The Activity Log wireframe exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing date grouping, filtering, or actor lookups on top of `useAllActivities`. Variables are mapped — reference them by their short name, **never** as `componentConfig.var`.

**Incorrect (rebuilding feed state from `useAllActivities` and conditionally mounting wireframe slots):**

```jsx
import { useAllActivities, VeltActivityLogWireframe } from '@veltdev/react';

function ActivityRow({ row }) {
  const activities = useAllActivities();
  const isMine = row.user.userId === currentUser.userId;
  // Reimplements actor lookup, formatting, and visibility gating that the
  // wireframe already exposes via {activity}, {user}, and shouldShow.
  if (!activities) return null;
  return (
    <VeltActivityLogWireframe.List.Item className={isMine ? 'mine' : ''}>
      <span>{row.user.name}</span>
      <span>{row.action}</span>
    </VeltActivityLogWireframe.List.Item>
  );
}
```

**Correct (read the slot's injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltWireframe, VeltActivityLogWireframe, VeltData } from '@veltdev/react';

<VeltWireframe>
<VeltActivityLogWireframe veltIf="{isEnabled} && {isOpen}">
  <VeltActivityLogWireframe.List>
    <VeltActivityLogWireframe.List.Item
      veltClass="'mine': {activity.user.userId} === {user.userId}"
    >
      <VeltActivityLogWireframe.List.Item.Avatar />
      <VeltActivityLogWireframe.List.Item.Content>
        <VeltActivityLogWireframe.List.Item.Content.User />
        <VeltActivityLogWireframe.List.Item.Content.Action />
        <VeltActivityLogWireframe.List.Item.Content.Target />
      </VeltActivityLogWireframe.List.Item.Content>
      <VeltActivityLogWireframe.List.Item.Time />
    </VeltActivityLogWireframe.List.Item>
    <VeltActivityLogWireframe.List.ShowMore veltIf="{remainingCount} > 0">
      <span>Show <VeltData field="remainingCount" /> more</span>
    </VeltActivityLogWireframe.List.ShowMore>
  </VeltActivityLogWireframe.List>
</VeltActivityLogWireframe>
</VeltWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-wireframe style="display:none;">
<velt-activity-log-wireframe velt-if="{isEnabled} && {isOpen}">
  <velt-activity-log-list-wireframe>
    <velt-activity-log-list-item-wireframe
      velt-class="'mine': {activity.user.userId} === {user.userId}">
      <velt-data field="activity.user.name"></velt-data>
      <velt-data field="activity.action"></velt-data>
    </velt-activity-log-list-item-wireframe>
    <velt-activity-log-list-show-more-wireframe velt-if="{remainingCount} > 0">
      <span>Show <velt-data field="remainingCount"></velt-data> more</span>
    </velt-activity-log-list-show-more-wireframe>
  </velt-activity-log-list-wireframe>
</velt-activity-log-wireframe>
</velt-wireframe>
```

#### Variable namespaces

The wireframe injects four namespaces at the root of every slot, plus loop-scoped variables inside iteration primitives.

**App State** — globally resolved identity / theme:

| Variable | Type | Use |
|---|---|---|
| `user` | `User` | Currently identified end-user. Compare to `activity.user.userId` to highlight "mine". |
| `darkMode` | `boolean` | Global dark-mode flag. Pair with `velt-class="'theme-dark': {darkMode}"`. |

**Feature State** — SDK-level capability flag:

| Variable | Type | Use |
|---|---|---|
| `isEnabled` | `boolean` | `true` when Activity Log is enabled in the SDK. Gate the root wireframe with `velt-if="{isEnabled}"`. |

**Data State** — the activity pipeline (raw → filtered → grouped → virtualized):

| Variable | Type | Notes |
|---|---|---|
| `allActivities` | `ActivityRecord[] \| null` | `null` while loading — the loading slot uses this to decide visibility. |
| `filteredActivities` | `ActivityRecord[] \| null` | Result of applying `activeFilter`. Empty state checks `filteredActivities.length === 0`. |
| `groupedActivities` | `ActivityDateGroup[]` | Activities bucketed by calendar date. |
| `virtualScrollItems` | `ActivityScrollItem[]` | Flattened union (`'date-header' \| 'activity' \| 'show-more'`) the virtual scroller iterates. |
| `activeFilter` | `'all' \| ActivityFeatureType` | Selected dropdown value. |
| `availableFilters` | `ActivityFilterOption[]` | All filter rows shown in the dropdown. |

**UI State** — per-instance view toggles:

| Variable | Type | Notes |
|---|---|---|
| `isOpen` | `boolean` | Panel open/closed. |
| `darkMode` | `boolean` | Per-instance dark-mode override (host attribute beats global config). |
| `variant` | `string` | Variant tag from the host attribute. |
| `expandedGroups` | `Set<string>` | Date-group keys that have been expanded past the truncation limit. Internal — read indirectly via `isExpanded` inside `show-more`. |
| `defaultVisibleCount` | `number` | Items per date-group before "Show more" appears. Defaults to `5`. |
| `filterDropdownOpen` | `boolean` | Filter dropdown menu open. |

#### Loop-scope variables (only valid inside iteration slots)

These are injected by the iterating parent; referencing them outside the listed slot returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `dateGroup` | `ActivityDateGroup` | `<velt-activity-log-list-date-group-wireframe>`, its label child, and `<velt-activity-log-list-show-more-wireframe>` |
| `activity` | `ActivityRecord` | `<velt-activity-log-list-item-wireframe>` and all descendants |
| `filter` | `ActivityFilterOption` | `<velt-activity-log-header-filter-content-item-wireframe>`, its icon and label children |
| `isActive` | `boolean` | Same slots as `filter`. `true` when the row matches `activeFilter`. |
| `isExpanded` | `boolean` | `<velt-activity-log-list-show-more-wireframe>` |
| `remainingCount` | `number` | `<velt-activity-log-list-show-more-wireframe>`. Items still hidden in the date-group. |

**Aliases:** `activity` and `activityRecord` resolve to the same record; `filter` and `filterOption` resolve to the same option. Prefer the short form (`activity`, `filter`) — the long form exists for backwards-compatibility.

#### Common props and signal inputs

Every Activity Log primitive accepts one cross-cutting prop, plus two Angular signal inputs for parent-driven state:

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show a slot you would otherwise hide. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-activity-log-...-wireframe> in an Angular template
[componentConfigSignal]="config()"     // filtered activities, date groups,
                                       // virtual scroll items, available filters
[parentLocalUIState]="localUI()"       // darkMode, variant, isOpen, etc.
```

The root `<velt-activity-log>` element additionally accepts attributes that map onto config and local UI state slots: `dark-mode`, `variant`, `is-open`, …

#### `shouldShow` gates worth remembering

Several slots have a built-in visibility predicate. Read them as a reference when debugging "why is nothing rendering":

| Slot | `shouldShow` |
|---|---|
| `activity-log-wireframe` (root) | `isEnabled === true && isOpen === true` |
| `activity-log-loading-wireframe` | `allActivities === null` |
| `activity-log-empty-wireframe` | `filteredActivities !== null && filteredActivities.length === 0` |
| `activity-log-list-show-more-wireframe` | `dateGroup.totalCount > defaultVisibleCount` |

Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.

#### Common mistakes — DO NOT

**1. DO NOT prefix variables with `componentConfig.`** Variables are mapped to short names. `<velt-data field="componentConfig.filteredActivities" />` resolves to nothing — use `<velt-data field="filteredActivities" />`.

**2. DO NOT reference loop-scope variables outside their slot.** `{activity}` is only defined inside `<velt-activity-log-list-item-wireframe>`. Referencing it from the header or the empty slot returns `undefined` silently.

**3. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` *disables* the slot's internal gate (forcing render). `velt-if` *adds* a new gate on top. Combining them inverts the semantics you probably want.

**Verification:**
- [ ] Wireframe slots reference variables by short name, never `componentConfig.var`
- [ ] Loop-scope variables (`activity`, `dateGroup`, `filter`, `isActive`, `isExpanded`, `remainingCount`) are used only inside their owning iteration slot
- [ ] Root wireframe is gated by `velt-if="{isEnabled}"` (and usually `&& {isOpen}`) — not by remounting
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate, not as a generic visibility prop
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not
- [ ] Alias usage (`activity` ↔ `activityRecord`, `filter` ↔ `filterOption`) is consistent across siblings; prefer the short form

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframe-variables — "Activity Logs Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"

---

## 7. UI Wireframes

**Impact: MEDIUM**

Structural sub-component catalog for the `VeltActivityLogWireframe` tree. Enumerates the 26 named slots grouped by region (Root, Header, Header Filter, List, List Item, States) and shows the canonical React and HTML composition for each region. Pairs with `wireframe-variables` — this section answers "what slots exist and how do they nest"; `wireframe-variables` answers "how do I bind data into those slots".

### 7.1 Customize Activity Log Layout with Wireframe Sub-Components

**Impact: MEDIUM (Full structural control over the Activity Log panel — swap, omit, reorder, or restyle any region without rebuilding the feed pipeline)**

Wrap `VeltActivityLogWireframe` in a `VeltWireframe` block to override the default Activity Log layout. The wireframe is a structural catalog of named slots — each sub-component is a placeholder for a piece of the panel (header title, filter dropdown, list item avatar, empty state, etc.). You compose only the regions you want and the SDK fills them with live data. Without it, you would have to rebuild date grouping, filter dropdowns, and virtualization on top of `useAllActivities` by hand. For the variables and conditional directives (`velt-data`, `velt-if`, `velt-class`) that drive the slots, see `wireframe-variables-activity-log`.

**Incorrect (rendering raw subscription state and skipping the wireframe entirely):**

```jsx
import { useAllActivities } from '@veltdev/react';

function CustomActivityFeed() {
  const activities = useAllActivities();
  // Reimplements date grouping, filtering, empty/loading states, and
  // virtual scrolling that the wireframe slots already provide.
  return (
    <ul>
      {activities?.map(a => <li key={a.id}>{a.displayMessage}</li>)}
    </ul>
  );
}
```

**Correct (compose the wireframe tree inside `VeltWireframe`):**

```jsx
import { VeltWireframe, VeltActivityLog, VeltActivityLogWireframe } from '@veltdev/react';

function CustomActivityLog() {
  return (
    <>
      <VeltWireframe>
        <VeltActivityLogWireframe>
          <VeltActivityLogWireframe.Header />
          <VeltActivityLogWireframe.Loading />
          <VeltActivityLogWireframe.List />
          <VeltActivityLogWireframe.Empty />
        </VeltActivityLogWireframe>
      </VeltWireframe>
      <VeltActivityLog shadowDom={false} />
    </>
  );
}
```

**For HTML / Vanilla JS:**

```html
<velt-wireframe style="display:none;">
  <velt-activity-log-wireframe>
    <velt-activity-log-header-wireframe></velt-activity-log-header-wireframe>
    <velt-activity-log-loading-wireframe></velt-activity-log-loading-wireframe>
    <velt-activity-log-list-wireframe></velt-activity-log-list-wireframe>
    <velt-activity-log-empty-wireframe></velt-activity-log-empty-wireframe>
  </velt-activity-log-wireframe>
</velt-wireframe>
<velt-activity-log></velt-activity-log>
```

#### Sub-component catalog (grouped by region)

The wireframe exposes 26 named slots under `VeltActivityLogWireframe`. Group them by region — you almost always override one region at a time rather than the whole tree.

| Region | Slots |
|---|---|
| Root | `VeltActivityLogWireframe` |
| Header | `Header`, `Header.Title`, `Header.CloseButton` |
| Header Filter | `Header.Filter`, `Header.Filter.Trigger`, `Header.Filter.Trigger.Icon`, `Header.Filter.Trigger.Label`, `Header.Filter.Content`, `Header.Filter.Content.Item`, `Header.Filter.Content.Item.Icon`, `Header.Filter.Content.Item.Label` |
| List | `List`, `List.DateGroup`, `List.DateGroup.Label`, `List.Item`, `List.ShowMore` |
| List Item | `List.Item.Icon`, `List.Item.Avatar`, `List.Item.Time`, `List.Item.Content`, `List.Item.Content.User`, `List.Item.Content.Action`, `List.Item.Content.Target`, `List.Item.Content.Detail` |
| States | `Loading`, `Empty` |

#### Header region

The header hosts the title, the close button, and the filter dropdown. `Header.Filter.Trigger` is the visible button; `Header.Filter.Content` is the dropdown panel; `Content.Item` is one row inside it (iterated over `availableFilters`).

```jsx
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
```

```html
<velt-activity-log-header-wireframe>
  <velt-activity-log-header-title-wireframe></velt-activity-log-header-title-wireframe>
  <velt-activity-log-header-close-button-wireframe></velt-activity-log-header-close-button-wireframe>
  <velt-activity-log-header-filter-wireframe>
    <velt-activity-log-header-filter-trigger-wireframe>
      <velt-activity-log-header-filter-trigger-icon-wireframe></velt-activity-log-header-filter-trigger-icon-wireframe>
      <velt-activity-log-header-filter-trigger-label-wireframe></velt-activity-log-header-filter-trigger-label-wireframe>
    </velt-activity-log-header-filter-trigger-wireframe>
    <velt-activity-log-header-filter-content-wireframe>
      <velt-activity-log-header-filter-content-item-wireframe>
        <velt-activity-log-header-filter-content-item-icon-wireframe></velt-activity-log-header-filter-content-item-icon-wireframe>
        <velt-activity-log-header-filter-content-item-label-wireframe></velt-activity-log-header-filter-content-item-label-wireframe>
      </velt-activity-log-header-filter-content-item-wireframe>
    </velt-activity-log-header-filter-content-wireframe>
  </velt-activity-log-header-filter-wireframe>
</velt-activity-log-header-wireframe>
```

#### List region — date groups, items, show-more

`List` iterates the activity pipeline. `DateGroup` is the per-day bucket; `Item` is one activity record; `ShowMore` is the "Show N more" affordance shown when a date group exceeds `defaultVisibleCount` (default `5`).

```jsx
<VeltActivityLogWireframe.List>
  <VeltActivityLogWireframe.List.DateGroup>
    <VeltActivityLogWireframe.List.DateGroup.Label />
  </VeltActivityLogWireframe.List.DateGroup>
  <VeltActivityLogWireframe.List.Item>
    <VeltActivityLogWireframe.List.Item.Icon />
    <VeltActivityLogWireframe.List.Item.Avatar />
    <VeltActivityLogWireframe.List.Item.Content>
      <VeltActivityLogWireframe.List.Item.Content.User />
      <VeltActivityLogWireframe.List.Item.Content.Action />
      <VeltActivityLogWireframe.List.Item.Content.Target />
      <VeltActivityLogWireframe.List.Item.Content.Detail />
    </VeltActivityLogWireframe.List.Item.Content>
    <VeltActivityLogWireframe.List.Item.Time />
  </VeltActivityLogWireframe.List.Item>
  <VeltActivityLogWireframe.List.ShowMore />
</VeltActivityLogWireframe.List>
```

```html
<velt-activity-log-list-wireframe>
  <velt-activity-log-list-date-group-wireframe>
    <velt-activity-log-list-date-group-label-wireframe></velt-activity-log-list-date-group-label-wireframe>
  </velt-activity-log-list-date-group-wireframe>
  <velt-activity-log-list-item-wireframe>
    <velt-activity-log-list-item-icon-wireframe></velt-activity-log-list-item-icon-wireframe>
    <velt-activity-log-list-item-avatar-wireframe></velt-activity-log-list-item-avatar-wireframe>
    <velt-activity-log-list-item-content-wireframe>
      <velt-activity-log-list-item-content-user-wireframe></velt-activity-log-list-item-content-user-wireframe>
      <velt-activity-log-list-item-content-action-wireframe></velt-activity-log-list-item-content-action-wireframe>
      <velt-activity-log-list-item-content-target-wireframe></velt-activity-log-list-item-content-target-wireframe>
      <velt-activity-log-list-item-content-detail-wireframe></velt-activity-log-list-item-content-detail-wireframe>
    </velt-activity-log-list-item-content-wireframe>
    <velt-activity-log-list-item-time-wireframe></velt-activity-log-list-item-time-wireframe>
  </velt-activity-log-list-item-wireframe>
  <velt-activity-log-list-show-more-wireframe></velt-activity-log-list-show-more-wireframe>
</velt-activity-log-list-wireframe>
```

The four `Content.*` slots are the rendered sentence — `User` "edited" `Action` `Target` ("Page 1") `Detail` ("changed 4 fields"). Override them one-at-a-time when you want to restyle a single word without rebuilding the row.

#### Loading and Empty states

`Loading` renders while `allActivities === null`; `Empty` renders when `filteredActivities !== null && filteredActivities.length === 0`. You do not need to gate them yourself — they have built-in `shouldShow` predicates (see `wireframe-variables-activity-log` for the predicate reference).

```jsx
<VeltActivityLogWireframe.Loading />
<VeltActivityLogWireframe.Empty />
```

```html
<velt-activity-log-loading-wireframe></velt-activity-log-loading-wireframe>
<velt-activity-log-empty-wireframe></velt-activity-log-empty-wireframe>
```

#### Disable Shadow DOM for CSS access

Wireframe slots render inside the `VeltActivityLog` shadow root by default. To style them with your own CSS, set `shadowDom={false}` on the host:

```jsx
<VeltActivityLog shadowDom={false} />
```

```html
<velt-activity-log shadow-dom="false"></velt-activity-log>
```

#### Common Mistakes — DO NOT

**1. DO NOT omit `VeltWireframe`.** Wireframe sub-components must live inside a `<VeltWireframe>` (React) / `<velt-wireframe>` (HTML) block. Rendering `<VeltActivityLogWireframe>` at the top level has no effect — the SDK only scans for slots inside `VeltWireframe`.

**2. DO NOT also render `<VeltActivityLog>` inside the wireframe block.** The wireframe block is the *template*; the host `<VeltActivityLog>` is what actually paints to the screen. Keep them as siblings — the wireframe is hidden (`display:none`) and the host reads its structure.

**3. DO NOT mount and unmount the wireframe on toggle.** The wireframe registers slot definitions with the SDK at mount time; remounting forces re-registration and can blank the live host. Keep it mounted alongside the host (`display:none` toggling is fine for the host, but the wireframe should stay alive).

**4. DO NOT conflate wireframe sub-components with the host's standalone primitives.** `VeltActivityLogHeader` (no `Wireframe` suffix, listed under `core-activity-log-component`) is a standalone web component you can drop into ad-hoc layouts; `VeltActivityLogWireframe.Header` is a *slot definition* the host reads. They share a name family but are not interchangeable.

**Verification:**
- [ ] `VeltWireframe` wraps the `VeltActivityLogWireframe` tree
- [ ] Wireframe block and `VeltActivityLog` host are siblings, both rendered (not one-inside-the-other)
- [ ] Sub-component nesting matches the documented tree (e.g., `List.Item.Content.User` lives inside `List.Item.Content` inside `List.Item` inside `List`)
- [ ] `shadowDom={false}` (React) / `shadow-dom="false"` (HTML) is set on the host when applying custom CSS
- [ ] Slot content uses `velt-data` / `velt-if` / `velt-class` for dynamic bindings, not custom `useAllActivities` re-implementations (see `wireframe-variables-activity-log`)
- [ ] HTML tags use the kebab-case `<velt-activity-log-...-wireframe>` form, not the React dotted form

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframes — "Activity Logs Wireframes"
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframe-variables — "Activity Logs Wireframe Variables"

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/activity/overview
- https://docs.velt.dev/async-collaboration/activity/setup
- https://docs.velt.dev/async-collaboration/activity/customize-behavior
- https://console.velt.dev
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframes
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/get-activities
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/activityconfig-update
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-primitives
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setactivitydebouncetime
