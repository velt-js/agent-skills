---
title: Approval Engine REST API — moved to its own skill
impact: MEDIUM
impactDescription: Pointer rule — full Approval Engine REST + webhook coverage now lives in velt-approval-engine-best-practices
tags: approval-engine, workflow, pointer, moved
---

## Approval Engine REST API — moved to its own skill

The Approval Engine REST API (all 14 `/v2/workflow/*` endpoints — definitions, executions, steps — plus webhook delivery, quorum policies, and idempotency guidance) now lives in its own skill:

**Use `velt-approval-engine-best-practices` instead.**

Why split: the Approval Engine has its own concept surface (workflow DAGs, quorum policies, edge expression language, webhook signature contract) that's heavier than a CRUD API. Pulling it into a dedicated skill keeps general REST-API context (Comments, Users, Documents, Notifications) lighter when you're not working on workflows, and gives the Approval Engine room to grow as its frontend SDK surface lands.

**Source Pointers:**
- velt-approval-engine-best-practices — dedicated skill for the Approval Engine
- https://docs.velt.dev/ai/approval-engine/overview — feature overview
