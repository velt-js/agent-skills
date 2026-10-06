---
title: Use the Approval Engine Skill for Review Workflow Builder REST APIs
impact: MEDIUM
impactDescription: Pointer rule; full Approval Engine (Review Workflow Builder) REST and webhook coverage lives in velt-approval-engine-best-practices
tags: approval-engine, review-workflow-builder, workflow, pointer, moved
---

## Use the Approval Engine Skill for Review Workflow Builder REST APIs

The Approval Engine REST API, documented as the Review Workflow Builder (the 14 `/v2/workflow/*` endpoints for definitions, executions, and steps, plus webhook delivery, quorum policies, and idempotency guidance), lives in its own skill.

**Incorrect (guessing workflow endpoints from this skill):**

```bash
# No such endpoint family in this skill; the paths and payloads are documented elsewhere.
POST https://api.velt.dev/v2/approvals/create
```

**Correct (load the dedicated skill):**

```text
Use velt-approval-engine-best-practices for /v2/workflow/* definitions, executions, steps, and their webhook events.
```

The Approval Engine has its own concept surface (workflow DAGs, quorum policies, edge expressions, webhook signature contract). Keeping it separate keeps this skill focused on Comments, Users, Documents, Notifications, Agents, Memory, and webhooks. Its webhook event types (`execution.*`, `step.*`, `group.quorum-met`, `loop.*`) arrive through advanced webhooks (see `webhooks-advanced`).

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/overview - "Review Workflow Builder (Beta)"
- https://docs.velt.dev/webhooks/advanced#review-workflow-builder - "Review Workflow Builder" webhook events
