---
title: Self-Host Activity Log Data for Custom Activities
impact: MEDIUM
impactDescription: Route activity log PII, entity snapshots, and custom fields through your own infrastructure
tags: activity, ActivityAnnotationDataProvider, get, save, getConfig, saveConfig, endpoint-based, function-based, self-hosting, audit-log, isActivityResolverUsed
---

## Self-Host Activity Log Data for Custom Activities

The activity data provider handles PII for activity log records — comment text embedded in change history, feature-specific entity snapshots (e.g., PR titles, deployment metadata), and arbitrary custom fields. The SDK strips configured fields before writing to Velt and re-hydrates them on read via your `get` handler.

Both `get` and `save` can be supplied as either a **callback function** (`get` / `save`) **or** a **config endpoint URL** (`getConfig` / `saveConfig`). Each method is valid as long as one of the two forms is set; the modes can be mixed (e.g., function `get` with endpoint `saveConfig`). See [[provider-retry-timeout]] for the retry/timeout knobs shared across all providers.

**ActivityAnnotationDataProvider interface:**

```typescript
interface ActivityAnnotationDataProvider {
  get?: (request: GetActivityResolverRequest) => Promise<ResolverResponse<Record<string, PartialActivityRecord>>>;
  save?: (request: SaveActivityResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface GetActivityResolverRequest {
  organizationId: string;
  activityIds?: string[];
  documentIds?: string[];
}

interface SaveActivityResolverRequest {
  activity: Record<string, PartialActivityRecord>;
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface ResolverConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;         // Retry behavior for `get`
  saveRetryConfig?: RetryConfig;        // Retry behavior for `save` (supports `revertOnFailure`)
  getConfig?: ResolverEndpointConfig;   // Endpoint URL + headers for fetching activity PII
  saveConfig?: ResolverEndpointConfig;  // Endpoint URL + headers for saving stripped activity PII
  fieldsToRemove?: string[];            // Top-level keys moved to your DB (all feature types)
}

interface ResolverEndpointConfig {
  url: string;
  headers?: Record<string, string>;
}
```

Note: activity is **append-only**, so there is no `delete` / `deleteConfig`.

**Function-based example:**

```tsx
const activityDataProvider: ActivityAnnotationDataProvider = {
  get: async (request) => {
    const response = await fetch('/api/velt/activity/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return await response.json();
  },
  save: async (request) => {
    const response = await fetch('/api/velt/activity/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return await response.json();
  },
  config: {
    resolveTimeout: 60000,
    fieldsToRemove: ['customSensitiveField'],
  },
};

// Wire into VeltProvider (or via client.setDataProviders / Velt.setDataProviders)
<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  activity: activityDataProvider,
}}>
```

**Endpoint-based example** (SDK performs the POST for you; pair `getConfig` and/or `saveConfig` with retry/timeout/`fieldsToRemove` on the same `config` object):

```tsx
const activityResolverConfig = {
  getConfig: {
    url: 'https://your-backend.com/api/velt/activity/get',
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  },
  saveConfig: {
    url: 'https://your-backend.com/api/velt/activity/save',
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  },
  resolveTimeout: 60000,
  getRetryConfig: { retryCount: 3, retryDelay: 2000 },
  saveRetryConfig: { retryCount: 3, retryDelay: 2000, revertOnFailure: true },
  fieldsToRemove: ['customSensitiveField']
};

const activityDataProvider = {
  config: activityResolverConfig
};

<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  activity: activityDataProvider,
}}>
```

The SDK POSTs the same `GetActivityResolverRequest` / `SaveActivityResolverRequest` bodies the function-based handlers would receive, and expects the same `ResolverResponse` shape back. Do not modify the endpoint URLs — copy them verbatim into your config. `saveRetryConfig.revertOnFailure: true` rolls back the optimistic cache update when the save retries are exhausted.

**Compatibility:** Currently only compatible with the `setDocuments` method. Providers must be set before `identify()` is called.

**Storage-boundary contract (what persists where):**

When the activity resolver is active, the SDK strips PII before persisting on Velt (feature-aware for built-in types, `fieldsToRemove` keys for all types); your `save` handler receives the stripped fields and stores them in your backend. On read, the SDK merges your `get` response back into the activity record.

| Field | Stored on Velt | Stored on your DB |
|-------|----------------|-------------------|
| `id` | Yes (routing) | Yes (primary key) |
| `featureType` | Yes | — |
| `actionType` | Yes | — |
| `actionUser` | Yes (userId only) | — |
| `timestamp` | Yes | — |
| `metadata` | Yes (apiKey, internal/client doc + org IDs) | Yes (apiKey, documentId, organizationId) |
| `targetEntityId` | Yes | — |
| `isActivityResolverUsed` | Yes (boolean flag) | — |
| `immutable` | Yes (boolean flag) | — |
| `entityData` | No for `custom` activities when listed in `fieldsToRemove`; built-in types keep the object with PII fields removed | Yes (stripped PII) |
| `entityTargetData` | Same as `entityData` | Yes (stripped PII) |
| `displayMessageTemplate` | No when listed in `fieldsToRemove` | Yes when moved |
| `displayMessageTemplateData` | No when listed in `fieldsToRemove` (user objects inside are reduced to `{ userId }` when the `user` provider is active) | Yes when moved |
| Custom fields listed in `config.fieldsToRemove` | No | Yes |

Stored-on-Velt example for a `custom` activity (everything the SDK retains when the resolver is active):

```json
{
  "id": "activityId",
  "featureType": "custom",
  "actionType": "deployment.triggered",
  "actionUser": { "userId": "user-1" },
  "timestamp": 1773241980379,
  "metadata": {
    "apiKey": "API_KEY",
    "documentId": "INTERNAL_DOC_ID",
    "organizationId": "INTERNAL_ORG_ID",
    "clientDocumentId": "DOCUMENT_ID",
    "clientOrganizationId": "ORGANIZATION_ID"
  },
  "targetEntityId": "pr-123",
  "isActivityResolverUsed": true,
  "immutable": false
}
```

This `custom` sample assumes `entityData`, `entityTargetData`, `displayMessageTemplate`, and `displayMessageTemplateData` are listed in `config.fieldsToRemove`; that is why those whole fields live only on your database and are merged back via `get` at render time. A custom activity has no automatic field-level strip, so anything you do not list stays on Velt. For built-in feature types (`comment`, `reaction`, `recorder`), Velt keeps the `entityData` / `entityTargetData` objects and removes only the PII fields inside them (see the strip rules below).

**Key details:**
- `get` and `save` only — there is no `delete` on the activity resolver (and no `deleteConfig`)
- Each method has two equivalent forms: callback (`get` / `save`) or endpoint config (`getConfig` / `saveConfig`). At least one form per method is required; the two forms can be mixed per-method
- `fieldsToRemove` moves the listed top-level keys wholesale to your DB for every feature type (`comment`, `reaction`, `recorder`, `custom`), on top of the automatic strip. Values are matched on `!== undefined`, so `0`, `false`, and `""` are moved too
- `saveRetryConfig.revertOnFailure: true` reverts the optimistic cache update when the save ultimately fails after retries — set this on the activity resolver to avoid leaving stale PII in the UI when your backend rejects a write
- `isActivityResolverUsed: true` on `ActivityRecord` means PII has been stripped; use it to gate a loading skeleton while `get` is in flight
- The `metadata` block contains both Velt-internal IDs (`documentId`, `organizationId`) and your client-facing IDs (`clientDocumentId`, `clientOrganizationId`) — both shapes live on Velt
- Use a longer `resolveTimeout` (30–60s) than for comments since activity feeds can fan out across many records

### Activity strip rules

Activity is append-only (no `delete`) and the strip is multi-feature: a single `ActivityRecord` can carry comment PII *and* reaction/recorder PII *and* custom-template PII at once. The rules differ by `featureType` and depend on which sibling resolvers are wired.

- **`displayMessage` is always recomputed on the client** from the template + values — stored in **neither DB**. Do not persist a rendered string; the template + data are the source of truth.
- **User reduction** (`actionUser`, users in `changes`, users in `displayMessageTemplateData`) happens **only when the `user` provider is active**. Without the user provider these stay as full `User` objects on Velt.
- **`changes['commentText']` is never sent to Velt** (→ your DB) **only** when the **activity** resolver is active. If only the *comment* resolver is active (and not the activity resolver), `commentText` is preserved on Velt — this is deliberate, to avoid unrestorable loss of audit text.
- **Reaction / recorder `entityData` PII reaches your DB only when both** the activity resolver **and** the matching feature resolver are active. With activity alone, those entity snapshots stay on Velt; with the feature resolver alone, they flow through its own store.
- **Comment `entityData` / `entityTargetData` PII is handled by the comment resolver's own store**, not duplicated here.
- **`fieldsToRemove` applies to all feature types.** Since v6.0.0-beta.2, listed top-level keys are moved wholesale to your DB for `comment`, `reaction`, `recorder`, and `custom` activities. For built-in types it runs on top of the feature-aware partial strip; for `custom` it is the only stripping that happens (there is no automatic field-level strip for custom activities). Listing `entityData` or `entityTargetData` moves the entire field.
- **Append-only: no `delete`.** `ActivityAnnotationDataProvider` has no delete member by design.

**Incorrect (assuming a custom activity's PII is stripped automatically, or listing structural keys):**

```tsx
const activityDataProvider: ActivityAnnotationDataProvider = {
  get: async (req) => ({ data: await db.getActivity(req), success: true, statusCode: 200 }),
  save: async (req) => ({ data: undefined, success: true, statusCode: 200 }),
  config: {
    // BUG 1: custom activities get no automatic field-level strip. Without listing
    // 'entityData', a custom activity's entityData (PR titles, deploy metadata) stays on Velt.
    // BUG 2: 'featureType' and 'targetEntityId' are structural; removing them breaks querying.
    fieldsToRemove: ['featureType', 'targetEntityId'],
  },
};
```

**Correct (list only your own top-level keys; built-in entity PII is stripped by the feature-aware rules):**

```tsx
const activityDataProvider: ActivityAnnotationDataProvider = {
  get: async (req) => {
    // Your DB returns: { id, metadata?, changes?, entityData?, entityTargetData?, displayMessageTemplateData?, [customFields] }
    const partials = await db.getActivity(req);
    return { data: partials, success: true, statusCode: 200 };
  },
  save: async (req) => {
    // req.activity[id] only contains keys that were stripped — fields not in the partial are still on Velt.
    await db.upsertActivityPII(req.activity);
    return { data: undefined, success: true, statusCode: 200 };
  },
  config: {
    resolveTimeout: 60000,
    // Applies to every feature type. For custom activities this is the only stripping that happens,
    // so list entityData here if a custom activity's snapshot is sensitive.
    fieldsToRemove: ['customSensitiveField', 'entityData'],
  },
};
```

**Verification:**
- [ ] `get` (or `getConfig.url`) returns `Record<string, PartialActivityRecord>` with `entityData`, `entityTargetData`, and display templates hydrated from your DB
- [ ] `save` (or `saveConfig.url`) persists stripped fields to your DB and returns `ResolverResponse<undefined>`
- [ ] Each of `get` / `save` has exactly one of: callback function OR endpoint config — never both for the same method
- [ ] Endpoint URLs are copied verbatim from your backend; the SDK posts the same `GetActivityResolverRequest` / `SaveActivityResolverRequest` body the callback would receive
- [ ] No `delete` / `deleteConfig` is configured — activity is append-only
- [ ] `saveRetryConfig.revertOnFailure` set to `true` if you want optimistic cache updates rolled back when save retries are exhausted
- [ ] Provider set before `identify()` is called
- [ ] Customer DB stores entity snapshots, display templates, template data, and any `fieldsToRemove` fields; Velt stores only minimal identifiers, action metadata, resolver flag, and `targetEntityId`
- [ ] UI gates a loading skeleton on `isActivityResolverUsed === true`
- [ ] `fieldsToRemove` lists only your own top-level keys (never `id`, `featureType`, `actionType`, `targetEntityId`, `metadata`, or resolver flags) and covers custom-activity snapshots that must leave Velt
- [ ] `displayMessage` is never persisted — only the template and template data are stored

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/activity - "What gets stripped", "Implementation Approaches", "Sample Data"
- https://docs.velt.dev/self-hosting/partial/field-inventory - "Activity strip rules"
- https://docs.velt.dev/self-hosting/partial/overview - "Excluding & extending fields"
