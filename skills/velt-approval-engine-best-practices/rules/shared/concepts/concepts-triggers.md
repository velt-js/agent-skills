---
title: Start runs from triggers (inbound webhook, cron schedule, GitHub or Vercel app) instead of your own dispatcher
impact: HIGH
impactDescription: Triggers now dispatch runs themselves; also dispatching from your own cron or webhook handler doubles every run
tags: approval-engine, triggers, triggerId, inboundWebhook, schedule, cron, timezone, payloadTemplate, appTrigger, github-app, vercel-integration, installationRef, repoFilter, projectFilter, allowedEvents, payloadFilters, APPROVAL_APP_TRIGGER_EXCLUSIVE, scope-inheritance
---

## Start runs from triggers (inbound webhook, cron schedule, GitHub or Vercel app) instead of your own dispatcher

A `triggers[]` entry on a definition makes the engine start runs for you, with no `/executions/dispatch` call. Triggers used to be descriptive metadata only; they now dispatch, so a cron job or webhook relay you built earlier must be removed when you add the equivalent trigger.

**Incorrect:**

```json
{
  "triggers": [
    {
      "triggerId": "nightly-audit",
      "schedule": { "cron": "0 2 * * *" },
      "inboundWebhook": { "authMode": "bearer", "secret": "short", "provider": "github" }
    }
  ]
}
```

One entry declares two mechanisms (`APPROVAL_APP_TRIGGER_EXCLUSIVE`), the schedule is missing the required `timezone` and `enabled`, the secret is under 16 chars, and `provider: "github"` requires `authMode: "hmac"`.

**Correct:**

```json
{
  "triggers": [
    {
      "triggerId": "nightly-audit",
      "schedule": { "cron": "0 2 * * *", "timezone": "America/Los_Angeles", "enabled": true, "payloadTemplate": { "source": "nightly" } }
    },
    {
      "triggerId": "gh-deploy-review",
      "appTrigger": { "provider": "github", "installationRef": "41234567", "repoFilter": ["acme/website"], "allowedEvents": ["push", "pull_request"] }
    }
  ]
}
```

**Trigger entry fields:** `triggerId` (required, 1 to 128 chars, also the idempotency-key prefix), `eventName` (optional label, up to 128 chars), `filters` (free-form), and at most one of `inboundWebhook`, `schedule`, `appTrigger`. A definition holds up to 50 entries.

**Scope is always inherited.** A triggered run carries the owning definition's `scope`: an organization- or document-scoped definition fires runs with the same `organizationId` / `documentId`. IDs inside a webhook body never set a run's scope.

**`schedule` (cron)**

| Field | Notes |
|---|---|
| `cron` | Required. Standard 5-field expression, validated at write time. |
| `timezone` | Required. IANA zone such as `America/Los_Angeles`. DST handled. |
| `enabled` | Required. Only enabled schedules fire; `false` removes the schedule. |
| `payloadTemplate` | Static object merged into `triggerContext` under `schedule.payload`. |

The run's `triggerContext.schedule` is `{ triggerId, scheduledAt, payload }`. A schedule fires at most once per instant, and missed runs are not replayed. Updating `triggers` replaces the stored array.

**`appTrigger` (GitHub App or Vercel Integration):** connect the installation once from the Velt dashboard to get an `installationRef` (GitHub `installation.id` or Vercel `configuration.id`), then reference it. No per-repo webhook or secret.

| Field | Notes |
|---|---|
| `provider` | Required. `github` or `vercel`. |
| `installationRef` | Required. 1 to 256 chars; must already be connected or `FAILED_PRECONDITION`. |
| `repoFilter` | GitHub `org/repo` allowlist, up to 200. |
| `projectFilter` | Vercel project id or name allowlist, up to 200. |
| `allowedEvents` | 1 to 50 names such as `push` or `deployment.succeeded`. |
| `payloadFilters` | Up to 20 `{ path, in }` entries; every filter must match. |

Deliveries are deduplicated on the provider's delivery id. App triggers require a Superflow-platform workspace; elsewhere create fails with `FAILED_PRECONDITION` (`APPROVAL_APP_PLATFORM_NOT_SUPPORTED`).

**`inboundWebhook`:** exposes the definition at `POST /v2/workflow/webhook-inbound/trigger` for external systems. See `webhooks-inbound-handler` for the contract.

**Copying a definition copies its triggers.** A duplicated definition with the same `schedule` runs twice a night; drop or rename triggers on copies (see `patterns-copy-update-versioning`).

**Verification Checklist:**
- [ ] Each trigger entry declares exactly one of `inboundWebhook`, `schedule`, `appTrigger`
- [ ] `schedule` has `cron`, `timezone`, and `enabled`
- [ ] `appTrigger.installationRef` is connected to the workspace before the definition is created
- [ ] No external cron job or relay also dispatches the same definition
- [ ] Triggered runs rely on the definition `scope` for `organizationId` / `documentId`
- [ ] Copies of a definition do not keep the original's triggers unchanged

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#triggers — trigger fields and scope inheritance
- https://docs.velt.dev/ai/approval-engine/customize-behavior#scheduled-cron-trigger — schedule fields
- https://docs.velt.dev/ai/approval-engine/customize-behavior#app-trigger — GitHub App and Vercel Integration
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/update-definition — triggers replace on update
