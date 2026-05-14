# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Concepts (concepts)

**Impact:** HIGH
**Description:** The workflow model — what a definition is, how nodes (`agent` / `human` / `webhook`) connect via edges, how groups model parallel quorum, how the three `onQuorumMet` policies (`waitAll` / `cancelOnQuorum` / `joinOnQuorum`) drive fan-out, the deterministic stepId formats, and the execution/step status flows. Read this before any REST rule — the endpoint payloads carry these shapes verbatim.

---

## 2. REST Endpoints (rest)

**Impact:** HIGH
**Description:** The 14 POST endpoints under `/v2/workflow/*`. Split by resource: **foundations** (auth headers, request/response envelope, canonical error codes, schema-validation messages); **definitions** (5 endpoints + full 16-rule linter reference); **executions** (5 endpoints — dispatch with `idempotencyKey` + webhook config; cancel; getEvents with `sinceSeq`); **steps** (4 endpoints; admin-only `/steps/cancel` and `/steps/resolve`); **object-views** (TypeScript interfaces for `ExecutionView`, `StepView`, `DefinitionView`, `ApprovalEventView`, and the human/`joinOnQuorum` payload shapes).

---

## 3. Webhooks (webhooks)

**Impact:** HIGH
**Description:** Inbound webhook delivery — required HMAC-SHA256 signature verification on the raw bytes (not re-serialized JSON), the three `x-velt-*` headers, the full payload field shape, the event catalog with `data` highlights per event type, the retry schedule (immediate → +2s → +8s → +32s → +2min → +8min → DLQ), the at-least-once delivery contract with idempotency on `(executionId, seq)`, the cancellation reason vocabulary, and missed-event recovery via `/executions/getEvents?sinceSeq=N`.
