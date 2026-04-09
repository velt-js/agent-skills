---
title: Configure Comment Status and Priority Levels
impact: MEDIUM
impactDescription: Enable and customize comment status tracking and priority levels
tags: enableStatus, disableStatus, setCustomStatus, updateStatus, resolveCommentAnnotation, enableResolveButton, enablePriority, disablePriority, setCustomPriority, updatePriority, status, priority
---

## Configure Comment Status and Priority Levels

Enable status tracking (open, in progress, resolved) and priority levels (P0-P3) on comment annotations.

**Status Configuration:**

```tsx
const commentElement = client.getCommentElement();

// Enable/disable status feature
commentElement.enableStatus();
commentElement.disableStatus();

// Enable quick resolve button on comment dialog
commentElement.enableResolveButton();

// Define custom status values
commentElement.setCustomStatus([
  { id: 'open', name: 'Open', type: 'default', color: '#3b82f6' },
  { id: 'in_progress', name: 'In Progress', type: 'ongoing', color: '#f59e0b' },
  { id: 'needs_attention', name: 'Needs Attention', type: 'ongoing', color: '#ef4444' },
  { id: 'resolved', name: 'Resolved', type: 'terminal', color: '#22c55e' },
  { id: 'approved', name: 'Approved', type: 'terminal', color: '#10b981' },
  { id: 'rejected', name: 'Rejected', type: 'terminal', color: '#dc2626' },
]);

// Update annotation status programmatically
commentElement.updateStatus({
  annotationId: 'ann-123',
  status: { id: 'resolved', name: 'Resolved', type: 'terminal' },
});

// Mark as resolved (shortcut)
commentElement.resolveCommentAnnotation({ annotationId: 'ann-123' });
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
commentElement.updatePriority({
  annotationId: 'ann-123',
  priority: { id: 'high', name: 'High' },
});
```

**Or via component props:**

```tsx
// Enable priority on VeltComments
<VeltComments priority={true} />
```

**Status type values:**
- `'default'` — initial state (e.g., Open)
- `'ongoing'` — in-progress state (e.g., In Progress, Needs Attention)
- `'terminal'` — final state (e.g., Resolved, Approved, Rejected)

**Key details:**
- Custom statuses replace built-in defaults entirely
- `resolveCommentAnnotation()` is a shortcut that sets status to the first terminal status
- Status and priority appear in comment dialog header, sidebar filters, and activity logs
- Status changes trigger `STATUS_CHANGE` activity; priority changes trigger `PRIORITY_CHANGE`

**Verification:**
- [ ] Status types correctly use 'default', 'ongoing', or 'terminal'
- [ ] At least one terminal status defined for resolve functionality
- [ ] Custom status/priority called before user interaction

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Status, Priority
