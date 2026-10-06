---
title: Enable Immutability for Compliance Audit Trails
impact: MEDIUM
impactDescription: Tamper-evident activity records for SOX, SOC 2, HIPAA compliance
tags: immutability, audit, compliance, console, immutable, activityServiceConfig, SOX, SOC2, HIPAA
---

## Enable Immutability for Compliance Audit Trails

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
