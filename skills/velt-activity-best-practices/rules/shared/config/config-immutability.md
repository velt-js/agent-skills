---
title: Enable Immutability for Compliance Audit Trails
impact: MEDIUM
impactDescription: Tamper-evident activity records for SOX, SOC 2, HIPAA compliance
tags: immutability, audit, compliance, console, immutable, SOX, SOC2, HIPAA
---

## Enable Immutability for Compliance Audit Trails

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

**When Immutability is ON:**
- Records cannot be edited after creation
- Records cannot be deleted
- REST API update/delete calls fail for immutable records
- Suitable for regulated workflows

**When Immutability is OFF (default):**
- Records can be updated via SDK and REST API
- Records can be deleted via SDK and REST API
- Standard behavior for non-regulated use cases

**Use cases for immutability:**
- Invoice sign-offs ("who approved what, when")
- Legal document reviews
- Budget approval workflows
- Compliance audit trails (SOX, SOC 2, HIPAA)
- AI agent action traceability

**Verification:**
- [ ] Immutability enabled in Velt Console for regulated workflows
- [ ] Application code does not attempt to update/delete records when immutability is on
- [ ] Audit trail requirements reviewed with compliance team

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/overview - Immutability
