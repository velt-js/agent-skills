# Velt Activity Best Practices

**Version 1.2.0**  
Velt  
March 2026

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
   - 1.1 [Enable Activity Logs in Velt Console](#11-enable-activity-logs-in-velt-console)
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

Essential setup required for any Velt activity log implementation. Activity Logs must be enabled in the Velt Console before any SDK or REST API calls will work. Includes the VeltActivityLog drop-in UI component for displaying activity feeds.

### 1.1 Enable Activity Logs in Velt Console

**Impact: CRITICAL (Required for activity logs to function)**

**Requires `@veltdev/react@5.0.2-beta.13` or later.** The `useAllActivities` and `useActivityUtils` hooks are not available in earlier versions. If the installed SDK is older, upgrade: `npm install @veltdev/react@5.0.2-beta.13`

Activity Logs are disabled by default. They must be enabled in the Velt Console before any SDK hooks, API subscriptions, or REST API calls will return data.

**Incorrect (using activity APIs without console setup):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  // This will always return null — Activity Logs not enabled in Console
  const activities = useAllActivities();

  return (
    <div>
      {activities?.map(a => <div key={a.id}>{a.displayMessage}</div>)}
    </div>
  );
}
```

**Correct (enable in Console first, then subscribe):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  // Step 1: Enable Activity Logs in Velt Console at
  //   console.velt.dev > Dashboard > Configuration > Activity Logs
  // Step 2: Subscribe to activity feed
  const activities = useAllActivities();

  if (activities === null) return <div>Loading...</div>;
  if (activities.length === 0) return <div>No activity yet</div>;

  return (
    <div>
      {activities.map(a => (
        <div key={a.id}>{a.displayMessage}</div>
      ))}
    </div>
  );
}
```

**For non-React frameworks:**

```js
// After enabling in Console:
const activityElement = Velt.getActivityElement();
activityElement.getAllActivities().subscribe((activities) => {
  if (activities === null) return; // Loading
  console.log('Activities:', activities);
});
```

**VeltProvider with authProvider (required for activity logs to work):**

```jsx
import { VeltProvider } from '@veltdev/react';

// Build authProvider from your app's user context
const authProvider = user ? {
  user: {
    userId: user.userId,
    organizationId: user.organizationId,
    name: user.name,
    email: user.email,
  },
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => {
    const resp = await fetch("/api/velt/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
} : undefined;

<VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!} authProvider={authProvider}>
  {/* Activity log components go here */}
</VeltProvider>
```

Reference: https://docs.velt.dev/async-collaboration/activity/setup - Enable Activity Logs in the Velt Console

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

**Minimal usage (HTML — web component):**

```html
<!-- Always mounted, toggle visibility with CSS -->
<velt-activity-log></velt-activity-log>
```

**Wireframe customization (27 primitives):**

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

```jsx
// WRONG — remounts on every toggle, loses connection
{showPanel && <VeltActivityLog />}

// CORRECT — always mounted, toggle visibility
<div style={{ display: showPanel ? "flex" : "none" }}>
  <VeltActivityLog />
</div>
// WRONG — style prop is ignored, component may not render
<VeltActivityLog style={{ flex: 1 }} />

// CORRECT — wrap in a styled div
<div style={{ flex: 1 }}>
  <VeltActivityLog />
</div>
```

**3. DO NOT pass `style` or `className` as props to `VeltActivityLog`.** It is a Velt web component, not a standard React element. Styling props are silently ignored and can prevent the component from rendering. To control sizing/positioning, wrap it in a `<div>` with your styles:

Reference: https://docs.velt.dev/async-collaboration/activity/customize-ui - VeltActivityLog Component

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

Reference: https://docs.velt.dev/async-collaboration/activity/setup - Create a Custom Activity (Using Hook)

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

Reference: https://docs.velt.dev/async-collaboration/activity/customize-behavior - getAllActivities (Using Hook)

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

Reference: https://docs.velt.dev/async-collaboration/activity/setup - Create a Custom Activity (Using API)

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

Reference: https://docs.velt.dev/async-collaboration/activity/customize-behavior - getAllActivities (Using API)

---

## 3. Configuration

**Impact: MEDIUM**

Configuration options for activity log behavior. Includes CRDT debounce time to control edit batching frequency, immutability toggle for compliance audit trails, and action type constant filtering for type-safe feed scoping.

### 3.1 Configure CRDT Activity Debounce Time

**Impact: MEDIUM (Prevent noisy activity feeds by batching CRDT edits into single records)**

Without debouncing, every CRDT keystroke generates a separate activity record, flooding the activity feed. Use `setActivityDebounceTime()` to batch edits within a time window into a single record.

**Incorrect (no debounce — every keystroke creates an activity record):**

```jsx
// Default behavior: typing "Hello" generates 5 separate activity records
// H → record, e → record, l → record, l → record, o → record
// This floods the activity feed with noise
```

**Correct (debounce CRDT edits into batched records):**

```jsx
import { useVeltClient } from '@veltdev/react';

function EditorSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    // Batch all CRDT edits within 5-second windows into single records
    const crdtElement = client.getCrdtElement();
    crdtElement.setActivityDebounceTime(5000); // 5000ms = 5 seconds
  }, [client]);

  return <YourEditor />;
}
```

**For non-React frameworks:**

```js
const crdtElement = Velt.getCrdtElement();
crdtElement.setActivityDebounceTime(5000); // 5 seconds
```

Reference: https://docs.velt.dev/async-collaboration/activity/overview - CRDT edits, setActivityDebounceTime

---

### 3.2 Enable Immutability for Compliance Audit Trails

**Impact: MEDIUM (Tamper-evident activity records for SOX, SOC 2, HIPAA compliance)**

When immutability is enabled in the Velt Console, activity records become tamper-evident — they cannot be edited or deleted after creation. This is off by default and must be enabled for regulated workflows.

**Incorrect (assuming records are immutable by default):**

```jsx
// Immutability is OFF by default
// These operations will succeed unless immutability is enabled:
await activityElement.updateActivity({ id: 'activity-123', /* changes */ });
await activityElement.deleteActivity({ activityIds: ['activity-123'] });

// If you need an audit trail, records can be tampered with!
```

**Correct (enable immutability in Console for audit trails):**

```jsx
// Step 1: Enable Immutability in Velt Console
//   console.velt.dev > Dashboard > Configuration > Activity Logs > Immutability

// Step 2: Records are now tamper-evident
// Attempting to update or delete will fail:
// - REST API update/delete calls return errors for immutable records
// - SDK update/delete operations are rejected

// Activity records now serve as a compliance audit trail
const activities = useAllActivities({
  documentIds: [documentId],
});

// Each record has immutable: true when immutability is enabled
// activities[0].immutable === true
```

Reference: https://docs.velt.dev/async-collaboration/activity/overview - Immutability

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
    RecorderActivityActionTypes.RECORDING_STARTED,
  ],
});
```

**For non-React frameworks:**

```js
// Import constants from the Velt client SDK
const activityElement = Velt.getActivityElement();
activityElement.getAllActivities({
  featureTypes: ['comment'],
  actionTypes: ['comment.add', 'comment.update'],
}).subscribe((activities) => {
  // Handle activities
});
```

Reference: https://docs.velt.dev/async-collaboration/activity/overview - Activity Log Action Types

---

## 4. REST API

**Impact: LOW-MEDIUM**

Server-side activity log management via REST API. Covers Get, Add, Update, and Delete endpoints for programmatic access from backend services.

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

const { data: activities } = await response.json();
```

**Correct (Add custom activities via REST API):**

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
        id: 'build-789-unique',       // optional: stable ID for idempotency
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

Reference: https://docs.velt.dev/api-reference/rest-apis/v2/activities/get-activities; https://docs.velt.dev/api-reference/rest-apis/v2/activities/add-activities; https://docs.velt.dev/api-reference/rest-apis/v2/activities/update-activities; https://docs.velt.dev/api-reference/rest-apis/v2/activities/delete-activities

---

## 5. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns and verification checklists for Velt activity log integrations.

### 5.1 Debug Common Activity Log Issues

**Impact: LOW-MEDIUM (Quick troubleshooting for frequent activity log integration problems)**

Common issues when integrating Velt Activity Logs and how to resolve them.

**Issue 1: Activities not appearing in feed**

Reference: https://docs.velt.dev/async-collaboration/activity/setup; https://docs.velt.dev/async-collaboration/activity/customize-behavior

---

## 6. Wireframe Variables

**Impact: MEDIUM**

Template variables exposed inside Activity Log wireframe slots and consumed via `<velt-data field="...">`, `velt-if="{var} <op> 'value'"`, and `velt-class="'cls': {var}"`. Covers App State (`user`, `darkMode`), Feature State (`isEnabled`), Data State (`allActivities`, `filteredActivities`, `groupedActivities`, `virtualScrollItems`, `activeFilter`, `availableFilters`), UI State (`isOpen`, `darkMode`, `variant`, `expandedGroups`, `defaultVisibleCount`, `filterDropdownOpen`), loop-scope variables (`dateGroup`, `activity`/`activityRecord`, `filter`/`filterOption`, `isActive`, `isExpanded`, `remainingCount`), the cross-cutting `defaultCondition` / `default-condition` prop, and Angular signal inputs `[componentConfigSignal]` and `[parentLocalUIState]`.

### 6.1 Bind Activity Log Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives dynamic content, conditional rendering, and class toggling inside Activity Log wireframe slots without manual subscriptions)**

The Activity Log wireframe exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing date grouping, filtering, or actor lookups on top of `useAllActivities`. Variables are mapped — reference them by their short name, **never** as `componentConfig.var`.

**Incorrect (rebuilding feed state from `useAllActivities` and conditionally mounting wireframe slots):**

```jsx
import { useAllActivities } from '@veltdev/react';
import VeltActivityLogWireframe from '@veltdev/react/VeltActivityLogWireframe';

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
import VeltActivityLogWireframe from '@veltdev/react/VeltActivityLogWireframe';

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
```

**HTML / web-component equivalent:**

```typescript
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
// On any <velt-activity-log-...-wireframe> in an Angular template
[componentConfigSignal]="config()"     // filtered activities, date groups,
                                       // virtual scroll items, available filters
[parentLocalUIState]="localUI()"       // darkMode, variant, isOpen, etc.
```

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
Every Activity Log primitive accepts one cross-cutting prop, plus two Angular signal inputs for parent-driven state:
| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show a slot you would otherwise hide. |
**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):
The root `<velt-activity-log>` element additionally accepts attributes that map onto config and local UI state slots: `dark-mode`, `variant`, `is-open`, …
Several slots have a built-in visibility predicate. Read them as a reference when debugging "why is nothing rendering":
| Slot | `shouldShow` |
|---|---|
| `activity-log-wireframe` (root) | `isEnabled === true && isOpen === true` |
| `activity-log-loading-wireframe` | `allActivities === null` |
| `activity-log-empty-wireframe` | `filteredActivities !== null && filteredActivities.length === 0` |
| `activity-log-list-show-more-wireframe` | `dateGroup.totalCount > defaultVisibleCount` |
Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.
**1. DO NOT prefix variables with `componentConfig.`** Variables are mapped to short names. `<velt-data field="componentConfig.filteredActivities" />` resolves to nothing — use `<velt-data field="filteredActivities" />`.
**2. DO NOT reference loop-scope variables outside their slot.** `{activity}` is only defined inside `<velt-activity-log-list-item-wireframe>`. Referencing it from the header or the empty slot returns `undefined` silently.
**3. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` *disables* the slot's internal gate (forcing render). `velt-if` *adds* a new gate on top. Combining them inverts the semantics you probably want.

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
import { VeltWireframe, VeltActivityLog } from '@veltdev/react';
import VeltActivityLogWireframe from '@veltdev/react/VeltActivityLogWireframe';

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
<VeltActivityLogWireframe.Loading />
<VeltActivityLogWireframe.Empty />
<velt-activity-log-loading-wireframe></velt-activity-log-loading-wireframe>
<velt-activity-log-empty-wireframe></velt-activity-log-empty-wireframe>
<VeltActivityLog shadowDom={false} />
<velt-activity-log shadow-dom="false"></velt-activity-log>
```

The wireframe exposes 26 named slots under `VeltActivityLogWireframe`. Group them by region — you almost always override one region at a time rather than the whole tree.
| Region | Slots |
|---|---|
| Root | `VeltActivityLogWireframe` |
| Header | `Header`, `Header.Title`, `Header.CloseButton` |
| Header Filter | `Header.Filter`, `Header.Filter.Trigger`, `Header.Filter.Trigger.Icon`, `Header.Filter.Trigger.Label`, `Header.Filter.Content`, `Header.Filter.Content.Item`, `Header.Filter.Content.Item.Icon`, `Header.Filter.Content.Item.Label` |
| List | `List`, `List.DateGroup`, `List.DateGroup.Label`, `List.Item`, `List.ShowMore` |
| List Item | `List.Item.Icon`, `List.Item.Avatar`, `List.Item.Time`, `List.Item.Content`, `List.Item.Content.User`, `List.Item.Content.Action`, `List.Item.Content.Target`, `List.Item.Content.Detail` |
| States | `Loading`, `Empty` |
The header hosts the title, the close button, and the filter dropdown. `Header.Filter.Trigger` is the visible button; `Header.Filter.Content` is the dropdown panel; `Content.Item` is one row inside it (iterated over `availableFilters`).
`List` iterates the activity pipeline. `DateGroup` is the per-day bucket; `Item` is one activity record; `ShowMore` is the "Show N more" affordance shown when a date group exceeds `defaultVisibleCount` (default `5`).
The four `Content.*` slots are the rendered sentence — `User` "edited" `Action` `Target` ("Page 1") `Detail` ("changed 4 fields"). Override them one-at-a-time when you want to restyle a single word without rebuilding the row.
`Loading` renders while `allActivities === null`; `Empty` renders when `filteredActivities !== null && filteredActivities.length === 0`. You do not need to gate them yourself — they have built-in `shouldShow` predicates (see `wireframe-variables-activity-log` for the predicate reference).
Wireframe slots render inside the `VeltActivityLog` shadow root by default. To style them with your own CSS, set `shadowDom={false}` on the host:
**1. DO NOT omit `VeltWireframe`.** Wireframe sub-components must live inside a `<VeltWireframe>` (React) / `<velt-wireframe>` (HTML) block. Rendering `<VeltActivityLogWireframe>` at the top level has no effect — the SDK only scans for slots inside `VeltWireframe`.
**2. DO NOT also render `<VeltActivityLog>` inside the wireframe block.** The wireframe block is the *template*; the host `<VeltActivityLog>` is what actually paints to the screen. Keep them as siblings — the wireframe is hidden (`display:none`) and the host reads its structure.
**3. DO NOT mount and unmount the wireframe on toggle.** The wireframe registers slot definitions with the SDK at mount time; remounting forces re-registration and can blank the live host. Keep it mounted alongside the host (`display:none` toggling is fine for the host, but the wireframe should stay alive).
**4. DO NOT conflate wireframe sub-components with the host's standalone primitives.** `VeltActivityLogHeader` (no `Wireframe` suffix, listed under `core-activity-log-component`) is a standalone web component you can drop into ad-hoc layouts; `VeltActivityLogWireframe.Header` is a *slot definition* the host reads. They share a name family but are not interchangeable.

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/activity/overview
- https://docs.velt.dev/async-collaboration/activity/setup
- https://docs.velt.dev/async-collaboration/activity/customize-behavior
- https://console.velt.dev
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframes
