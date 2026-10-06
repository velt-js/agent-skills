---
title: Copy and update definitions safely and keep version history in source control
impact: MEDIUM-HIGH
impactDescription: There is no duplicate endpoint, no readable version history, and no rollback; copies inherit triggers (double runs) and lose webhookConfig, and get-edit-update round trips clear webhookConfig
tags: approval-engine, patterns, duplicate, copy, update, versioning, ifVersion, rollback, source-control, webhookConfig, write-only, triggers, strip-nulls, server-owned-fields
---

## Copy and update definitions safely and keep version history in source control

A definition supports create, update, delete, get, and list; copying is manual, and versioning protects concurrent edits and in-flight runs but gives you no history API and no rollback. Treat your own source control as the system of record and the API as the deployment target.

**Incorrect (copy by re-posting the read response):**

```javascript
const original = await workflowApi('definitions/get', { definitionId: 'marketing-page-approval' }, creds);
await workflowApi('definitions/create', { ...original, definitionId: 'marketing-page-approval-eu' }, creds);
```

Server-owned fields (`version`, `createdAt`, `updatedAt`, `status`, `compiled`) and explicit `null`s fail with `INVALID_ARGUMENT`. Even once stripped, the copy keeps the original's triggers (a nightly schedule now fires twice) and has no `webhookConfig`, because get never returns it.

**Correct:**

```javascript
const original = await workflowApi('definitions/get', { definitionId: 'marketing-page-approval' }, creds);

const { version, createdAt, updatedAt, status, compiled, triggers, ...authored } = original;
const stripNulls = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null));

const copy = stripNulls({
  ...authored,
  scope: stripNulls(authored.scope),
  definitionId: 'marketing-page-approval-eu',
  name: 'Marketing page approval (EU)',
  // triggers dropped on purpose; re-add with fresh triggerId values if the copy needs them
  webhookConfig: { url: 'https://hooks.acme.com/velt/eu', secret: process.env.EU_WEBHOOK_SECRET },
});

await workflowApi('definitions/create', copy, creds); // starts at version 1
```

**Copying checklist (four steps):** fetch with get; change `definitionId` (two active definitions cannot share one) and `name`; strip the five server-owned fields and every `null` (`description`, `groups`, `triggers`, `tags`, `custom`, `scope.organizationId`, `scope.documentId`); POST to create. `edges` and `scope` round-trip exactly, so routing cannot change silently.

**Updating:** update is a full replace with required `ifVersion`. Re-send `scope` (omitting it resets to `apiKey`), `triggers` (replaced wholesale), and `webhookConfig` (write-only; a get, edit, update round trip clears it otherwise).

**What versioning gives you**
- `ifVersion` conflicts fail with `FAILED_PRECONDITION` (`Version conflict: expected 4, current 5`) instead of overwriting a coworker's edit.
- Runs pin the version current at dispatch and finish on it; only new runs see the new version.
- Delete and recreate restarts the counter at `version: 1`.

**What it does not give you:** no endpoint lists or reads old versions, no rollback (resubmit your own copy of the old content as a new version), no draft vs live distinction, and no way to dispatch a specific version (new runs always get the latest).

**Verification Checklist:**
- [ ] Definitions live in source control; the API is only the deployment target
- [ ] Copies change `definitionId` and `name`, strip server-owned fields and nulls, and handle `triggers` deliberately
- [ ] Copies and updates re-send `webhookConfig` with its secret when one is needed
- [ ] Updates re-send `scope` and the full `triggers` array with `ifVersion`
- [ ] Rollback is done by resubmitting stored content, not by expecting an API

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/patterns#duplicating-a-workflow — four-step copy, triggers warning, `webhookConfig` write-only
- https://docs.velt.dev/ai/approval-engine/patterns#versioning-and-what-it-does-not-do — versioning guarantees and gaps
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/update-definition — full-replace semantics
