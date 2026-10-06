# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Concepts (concepts)

**Impact:** HIGH
**Description:** The workflow model (documented as the Review Workflow Builder): definitions of nodes, edges, groups, and triggers; the four node types (`agent` with `url`/`urlPath` and `aiConfig`, `human` with mandatory reviewers and a required reject edge, `notification`, sync/async `webhook`); edge `on` roles (`approve`, `reject`, `always`, `exhausted`, `custom` with JSON-AST `when`), reject loop-backs and derived `compiled.loops`, SLA breach routing; group quorum and the `waitAll` / `cancelOnQuorum` / `joinOnQuorum` policies and group edge sources; triggers (`inboundWebhook`, `schedule`, `appTrigger`) that dispatch runs; lifecycles, step IDs, scope, versioning, and tenant partitioning. Read this before any REST rule.

---

## 2. REST Endpoints (rest)

**Impact:** HIGH
**Description:** The 14 enveloped POST endpoints under `/v2/workflow/*`: foundations (headers, `data`/`result`/`error` envelope, error codes, linter failures parsed from `error.message`, schema messages); definitions (create, update as a full replace with `ifVersion`, get with `compiled`, list with `pageSize`/`cursor`, soft or purge delete, 19 linter codes plus edge-contract rules); executions (dispatch with `idempotencyKey` and webhook pair, get, list, no-op cancel on terminal runs, `getEvents` with `sinceSeq`); steps (`recordReviewerDecision` with `recorded`/`rejectionReason`, unavailable `recordAgentResolution`, `cancel`, action-based `resolve`); and the object reference (`ExecutionView`, `StepView`, `DefinitionView`, `CompiledGraph`, `ApprovalEventView`, step outputs).

---

## 3. Webhooks (webhooks)

**Impact:** HIGH
**Description:** Outbound delivery (`webhooks-delivery`): `webhookConfig` on the definition versus the per-dispatch `webhookUrl` + `webhookSecret` override, HMAC-SHA256 verification on raw bytes, the `x-velt-*` headers, the 12-event catalog with per-node-type `data`, retry schedule to dead-letter, and idempotency on `(executionId, seq)`. Inbound trigger (`webhooks-inbound-handler`): the raw-JSON `/v2/workflow/webhook-inbound/trigger` endpoint with per-trigger secrets, `velt`/`github`/`vercel`/`custom` signature presets, `allowedEvents`, idempotency headers, the 1 MB limit, and no built-in rate limiting or payload URL screening.

---

## 4. Patterns (patterns)

**Impact:** MEDIUM-HIGH
**Description:** Guidance from the Patterns page: which construct to pick for each review requirement, rejection strategies (loop-back with exhausted route, forward reject, group-source rewind) and the anti-patterns that are rejected or misbehave, and how to copy and update definitions safely given full-replace updates, write-only `webhookConfig`, inherited triggers, and versioning without history or rollback.
