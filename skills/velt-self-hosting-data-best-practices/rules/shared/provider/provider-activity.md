---
title: Self-Host Activity Log Data for Custom Activities
impact: MEDIUM
impactDescription: Route activity log PII, entity snapshots, and custom fields through your own infrastructure
tags: activity, ActivityAnnotationDataProvider, get, save, self-hosting, audit-log, isActivityResolverUsed
---

## Self-Host Activity Log Data for Custom Activities

The activity data provider handles PII for activity log records — comment text embedded in change history, feature-specific entity snapshots (e.g., PR titles, deployment metadata), and arbitrary custom fields. The SDK strips configured fields before writing to Velt and re-hydrates them on read via your `get` handler.

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
  fieldsToRemove?: string[]; // Extra fields to strip beyond defaults
}
```

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

**Compatibility:** Currently only compatible with the `setDocuments` method. Providers must be set before `identify()` is called.

**Storage-boundary contract (what persists where):**

When the activity resolver is active, the SDK strips entity snapshots and display templates before persisting on Velt; your `save` handler receives the stripped fields and stores them in your backend. On read, the SDK merges your `get` response back into the activity record. Only this minimal identifier shape stays on Velt:

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
| `entityData` | No | Yes |
| `entityTargetData` | No | Yes |
| `displayMessageTemplate` | No | Yes |
| `displayMessageTemplateData` | No | Yes |
| Custom fields listed in `config.fieldsToRemove` | No | Yes |

Stored-on-Velt example (everything the SDK retains when the resolver is active):

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

Entity snapshots (`entityData`, `entityTargetData`), display message templates and their data, and any fields listed in `config.fieldsToRemove` are NOT stored on Velt — they live exclusively on your database and are merged back via `get` at render time.

**Key details:**
- `get` and `save` only — there is no `delete` on the activity resolver
- `fieldsToRemove` extends the default strip list with extra custom field names (e.g., `['customSensitiveField']`)
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
- **`fieldsToRemove` applies to `featureType === 'custom'` only.** Built-in feature types (`comment`, `reaction`, `recorder`, `crdt`) ignore it — you cannot use `fieldsToRemove` to peel extra fields off a built-in activity record.
- **Append-only: no `delete`.** `ActivityAnnotationDataProvider` has no delete member by design.

**Incorrect (assuming `fieldsToRemove` strips a field on every activity, including built-in ones):**

```tsx
const activityDataProvider: ActivityAnnotationDataProvider = {
  get: async (req) => ({ data: await db.getActivity(req), success: true, statusCode: 200 }),
  save: async (req) => ({ data: undefined, success: true, statusCode: 200 }),
  config: {
    // BUG: This only applies to featureType === 'custom'. A 'comment' activity carrying internalTicketId
    // will still write internalTicketId to Velt.
    fieldsToRemove: ['internalTicketId'],
  },
};
```

**Correct (treat `fieldsToRemove` as a custom-only knob; rely on per-feature resolvers for built-in entity PII):**

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
    // Applies only when featureType === 'custom'. Comment/recorder/reaction activities are handled
    // by their feature resolvers, not by fieldsToRemove.
    fieldsToRemove: ['customSensitiveField'],
  },
};
```

**Verification:**
- [ ] `get` returns `Record<string, PartialActivityRecord>` with `entityData`, `entityTargetData`, and display templates hydrated from your DB
- [ ] `save` persists stripped fields to your DB and returns `ResolverResponse<undefined>`
- [ ] Provider set before `identify()` is called
- [ ] Customer DB stores entity snapshots, display templates, template data, and any `fieldsToRemove` fields; Velt stores only minimal identifiers, action metadata, resolver flag, and `targetEntityId`
- [ ] UI gates a loading skeleton on `isActivityResolverUsed === true`
- [ ] `fieldsToRemove` is treated as `featureType === 'custom'`-only; built-in feature types do not strip extra fields through it
- [ ] `displayMessage` is never persisted — only the template and template data are stored

**Source Pointer:** https://docs.velt.dev/self-host-data/activity ("Sample Data"); https://docs.velt.dev/self-host-data/field-inventory - "Activity strip rules"
