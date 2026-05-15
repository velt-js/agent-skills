---
title: Object reference — ExecutionView, StepView, DefinitionView, ApprovalEventView, and the human / joinOnQuorum payload shapes
impact: MEDIUM
impactDescription: The exact field shapes returned by /executions/get, /definitions/get, /executions/getEvents, and embedded in step outputs — needed for typing client code against responses
tags: approval-engine, types, ExecutionView, StepView, DefinitionView, ApprovalEventView, output, input, aggregatorStatus, groupOutputs, joinOnQuorum
---

## Object reference — view types returned by Approval Engine reads

These TypeScript interfaces describe the canonical shapes returned from the read endpoints. They're stable for v1 and safe to type against in client code.

**`ExecutionView` — returned by `/executions/get` and embedded in `/executions/list`:**

```typescript
interface ExecutionView {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;             // epoch ms
  completedAt: number | null;
  cancelledAt: number | null;
  definitionId: string;
  definitionVersion: number;     // pinned at dispatch — updates to the definition don't change this
  correlationId: string;
  idempotencyKey: string;
  failureReason: { code: string; message: string } | null;
  steps: StepView[];
}
```

**`StepView` — one entry per scheduled or completed step:**

```typescript
interface StepView {
  stepId: string;
  nodeId: string;
  nodeType: 'agent' | 'human';
  status: 'pending' | 'running' | 'waiting' | 'completed' | 'failed' | 'skipped' | 'cancelled' | 'breached';
  groupId: string | null;
  startedAt: number | null;
  completedAt: number | null;
  output: Record<string, unknown>;
  error: { code: string; message: string } | null;
}
```

**`DefinitionView` — returned by `/definitions/get` and embedded in `/definitions/list`:**

```typescript
interface DefinitionView {
  definitionId: string;
  name: string;
  description: string | null;
  version: number;
  scope: {
    level: 'apiKey' | 'organization' | 'document';
    organizationId: string | null;
    documentId: string | null;
  };
  nodes: NodeView[];
  edges: EdgeView[];
  groups: ParallelGroupDef[] | null;
  triggers: WorkflowTriggerConfig[] | null;
  tags: string[] | null;
  custom: Record<string, unknown> | null;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'tombstoned';
}
```

**`ApprovalEventView` — returned by `/executions/getEvents`:**

```typescript
interface ApprovalEventView {
  eventId: string;
  seq: number;             // monotonic per-execution
  type: string;            // external event type — see webhooks-delivery for catalog
  stepId: string | null;
  timestamp: number;       // epoch ms
  correlationId: string;
  data?: Record<string, unknown>;
}
```

This shape differs slightly from the webhook payload (webhook deliveries also include `executionId`, `definitionId`, `status`, and use ISO 8601 strings for `timestamp` — see `webhooks-delivery`).

**Human step output (after resume):**

When a `human` step transitions to `completed`, its `output` is the aggregator rollup:

```typescript
{
  reviewers: Array<{ userId: string; mandatory: boolean }>;
  reviewerIds: string[];
  reviewerEmails: string[];
  commentBody: string | null;
  aggregatorStatus: 'resolved' | 'rejected';
  approveCount: number;
  rejectCount: number;
  totalResponses: number;
  mandatoryCount: number;
  mandatoryApproveCount: number;
  decision: 'approve' | 'reject';
  approved: boolean;
  resumedAt: number;
  resumeKey: string;
}
```

`decision` and `approved` are what edge `when` expressions and quorum policies key off — e.g. an edge `when: "output.decision == 'reject'"` will fire only on a human-step rejection.

**`joinOnQuorum` group successor input:**

When a group uses `onQuorumMet: "joinOnQuorum"` and fires its single downstream step, the synthetic step's `input` is:

```typescript
{
  groupOutputs: Record<string /* memberNodeId */, Record<string, unknown> /* member's output */>;
  groupId: string;
  quorum: number;
  totalApproved: number;
}
```

This is how a group-owned downstream step sees each member's per-step output without duplicating itself per member.

**Verification Checklist:**
- [ ] Client code types `/executions/get` responses against `ExecutionView` (not a hand-rolled interface)
- [ ] `StepView.nodeType` is treated as the discriminator for output-shape branching
- [ ] Code that reads a human step's `output.decision` knows it's `'approve' \| 'reject'`, not a free string
- [ ] `joinOnQuorum` successor handlers read from `input.groupOutputs[memberNodeId]`, not from a per-step output

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior — Object reference section
