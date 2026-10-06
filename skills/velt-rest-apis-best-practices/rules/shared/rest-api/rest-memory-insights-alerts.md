---
title: Read Memory Insights and Manage Alerts with Their Real Limits
impact: LOW-MEDIUM
impactDescription: Insight endpoints return capped counts and nullable results, and alert config is stored but not applied; misreading them shows wrong numbers or broken settings
tags: rest, api, memory, profiles, patterns, stats, alerts, dismiss, action, alert-config
---

## Read Memory Insights and Manage Alerts with Their Real Limits

Memory derives reviewer profiles, decision patterns, stats, and alerts from accumulated judgments. These endpoints return their payload directly on `result`, often with caps, nulls, or Velt-internal ids. Treat them as approximate dashboards, not exact ledgers.

**Incorrect (profile without a target, capped stat shown as exact):**

```javascript
const profile = (await veltPost('/v2/memory/profiles/get', {})).result;   // null: no targetUserId
const { totalActivities } = (await veltPost('/v2/memory/stats/get', {})).result;
render(`${totalActivities} reviews`);                                       // 10000 means "at least 10000"
```

**Correct (send `targetUserId`, handle null, label capped counts):**

```javascript
// veltPost(path, data): server-side POST to https://api.velt.dev with { data } and the API-key-level headers
const profile = (await veltPost('/v2/memory/profiles/get', { targetUserId: 'u_sarah' })).result;
if (!profile) renderEmpty('Not enough review history yet');

const stats = (await veltPost('/v2/memory/stats/get', {})).result;
const fmt = (n, cap) => (n >= cap ? `${cap}+` : `${n}`);
render(`${fmt(stats.totalActivities, 10000)} reviews, ${fmt(stats.totalPatterns, 100)} patterns`);
```

### Insights

- **`profiles/get`**: always send `targetUserId`; the reviewer is not inferred from the auth token. Returns `null` when no profile exists. `avgReviewTimeSeconds` is always `0`. `orgBreakdown` is keyed by Velt's internal organization id; match on `clientOrganizationId` to map back to your id.
- **`patterns/get`** (`{ "data": {} }`): up to 100 patterns, most recently updated first, no paging. `scope` is `apiKey` or `org`, and `organizationId` is internal. Rows with `confidence` below 0.1, or `category` of `no-data` / `uncategorized`, are untagged activity counts that `ask` does not reason from. Optional `enforcementRate`, `uniqueReviewers`, `topSourceRecordIds`.
- **`stats/get`** (`{ "data": {} }`): `totalActivities` caps at 10000, `totalProfiles` at 500, `totalPatterns` at 100; `totalKnowledgeSources` is exact.

### Alerts

```bash
POST https://api.velt.dev/v2/memory/alerts/list    { "data": {} }
# -> result: [ up to 50 active alerts: { id, alertType, severity, title, description, evidence, suggestedAction?, actionUrl?, status, createdAt, dedupKey? } ]

POST https://api.velt.dev/v2/memory/alerts/dismiss { "data": { "alertId": "alert_1", "user": { "uid": "user_1" } } }
POST https://api.velt.dev/v2/memory/alerts/action  { "data": { "alertId": "alert_1" } }
# -> result: { success: true }

POST https://api.velt.dev/v2/memory/alerts/config/update
{ "data": { "config": { "enabled": true, "maxAlertsPerWeek": 3, "severityThreshold": "medium", "enabledAlertTypes": ["anomaly"] } } }
POST https://api.velt.dev/v2/memory/alerts/config/get { "data": {} }
```

- `alertType` is `anomaly`, `configuration_drift`, `emerging_standard`, or `standards_drift`; `evidence.metric` names the trend (`approvalRate`, `volume`, `staleReferences`, `enforcementRate`, `violationRate`). `severity` is `high`, `medium`, or `low`.
- Dismissed and actioned alerts leave the list. Actioned alerts cannot be restored. Omitting `user` on dismiss stores `dismissedBy` as an empty string.
- An unknown `alertId` on dismiss or action returns `INTERNAL` (HTTP 500), not `NOT_FOUND`.
- Alert config values are **stored and returned but not applied** to alert generation today. Alerts are capped at 3 per rolling 7 days per workspace whatever you configure. Unknown keys and alert types are stored as sent.

**Verification Checklist:**
- [ ] `profiles/get` always sends `targetUserId` and handles a `null` result
- [ ] Capped stats (`totalActivities`, `totalProfiles`, `totalPatterns`) are displayed as lower bounds at their cap
- [ ] Internal `organizationId` values on patterns and profiles are not compared with your own ids
- [ ] Low-confidence or `no-data` / `uncategorized` patterns are not presented as findings
- [ ] Dismiss and action callers validate `alertId` first, since unknown ids return `INTERNAL`
- [ ] UI copy does not promise that alert config changes alert generation

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/profiles/get - "Get Reviewer Profile"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/patterns/get - "Get Patterns"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/stats/get - "Get Stats"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/list - "List Alerts"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/dismiss - "Dismiss Alert"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/action - "Mark Alert Actioned"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/config/get - "Get Alert Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/config/update - "Update Alert Config"
