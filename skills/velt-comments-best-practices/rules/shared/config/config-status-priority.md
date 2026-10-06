---
title: Configure Comment Status and Priority Levels
impact: MEDIUM
impactDescription: Enable and customize comment status tracking and priority levels
tags: enableStatus, disableStatus, setCustomStatus, updateStatus, resolveCommentAnnotation, enableResolveButton, enablePriority, disablePriority, setCustomPriority, updatePriority, status, priority
---

## Configure Comment Status and Priority Levels

Enable status tracking (open, in progress, resolved) and priority levels (P0-P3) on comment annotations.

**Incorrect (status objects missing required fields, single status):**

```tsx
commentElement.setCustomStatus([
  { id: 'open', name: 'Open', type: 'default' }, // missing color / lightColor; need at least 2 statuses
]);
```

**Correct:**

**Status Configuration:**

```tsx
const commentElement = client.getCommentElement();

// Enable/disable status feature
commentElement.enableStatus();
commentElement.disableStatus();

// Enable quick resolve button on comment dialog
commentElement.enableResolveButton();

// Define custom status values
// Provide at least 2 statuses; each needs id, name, color, lightColor, and type
commentElement.setCustomStatus([
  { id: 'open', name: 'Open', type: 'default', color: '#625df5', lightColor: '#f2f2fe' },
  { id: 'in_progress', name: 'In Progress', type: 'ongoing', color: '#f59e0b', lightColor: '#fffbeb' },
  { id: 'resolved', name: 'Resolved', type: 'terminal', color: '#198f65', lightColor: '#edf6f3' },
]);

// Update annotation status programmatically (returns UpdateStatusEvent)
await commentElement.updateStatus({
  annotationId: 'ann-123',
  status: { id: 'resolved', name: 'Resolved', type: 'terminal', color: '#198f65', lightColor: '#edf6f3' },
});

// Resolve a thread (returns ResolveCommentAnnotationEvent)
await commentElement.resolveCommentAnnotation({ annotationId: 'ann-123' });
```

**Priority Configuration:**

```tsx
// Enable/disable priority feature
commentElement.enablePriority();
commentElement.disablePriority();

// Define custom priority levels
commentElement.setCustomPriority([
  { id: 'critical', name: 'Critical', color: '#dc2626', lightColor: '#fef2f2' },
  { id: 'high', name: 'High', color: '#f59e0b', lightColor: '#fffbeb' },
  { id: 'medium', name: 'Medium', color: '#3b82f6', lightColor: '#eff6ff' },
  { id: 'low', name: 'Low', color: '#6b7280', lightColor: '#f9fafb' },
]);

// Update annotation priority programmatically
await commentElement.updatePriority({
  annotationId: 'ann-123',
  priority: { id: 'high', name: 'High', color: '#f59e0b', lightColor: '#fffbeb' },
});
```

**Or via component props:**

```tsx
// priority defaults to false; customPriority replaces the default P0 / P1 / P2 set
<VeltComments priority={true} customPriority={[{ id: 'low', name: 'Low', color: 'red', lightColor: 'pink' }]} />
```

React hooks: `const { updateStatus } = useUpdateStatus();`, `const { resolveCommentAnnotation } = useResolveCommentAnnotation();`, `const { updatePriority } = useUpdatePriority();`. In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Status type values:**
- `'default'` — initial state (e.g., Open)
- `'ongoing'` — in-progress state (e.g., In Progress, Needs Attention)
- `'terminal'` — final state (e.g., Resolved, Approved, Rejected)

**Key details:**
- Custom statuses replace built-in defaults entirely; define at least 2
- Comments with a `terminal` status are no longer shown on the DOM (unless `showResolvedCommentsOnDom()` is on)
- Status and priority appear in the comment dialog header, sidebar filters, and activity logs
- When you change status through the V2 REST Update Comment Annotations API, also send `statusUpdatedByUserId` (and `resolvedByUserId` for terminal statuses) so authorship is recorded; see `rest-comment-annotations-api.md`

**Verification:**
- [ ] Status types correctly use 'default', 'ongoing', or 'terminal'
- [ ] At least two statuses defined, including one `terminal` status for resolve
- [ ] Every custom status / priority includes `color` and `lightColor`
- [ ] Custom status/priority called before user interaction

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#enablestatus - enableStatus
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setcustomstatus - setCustomStatus
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatestatus - updateStatus
