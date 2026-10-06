---
title: Type responses against ExecutionView, StepView, DefinitionView with compiled, ApprovalEventView, and step output shapes
impact: MEDIUM
impactDescription: Exact field shapes returned by the read endpoints and embedded in step outputs; StepView.nodeType now has four values and DefinitionView carries a read-only compiled block
tags: approval-engine, types, ExecutionView, StepView, DefinitionView, CompiledGraph, CompiledForwardEdge, CompiledLoopRegion, ApprovalEventView, output, aggregatorStatus, groupOutputs, joinOnQuorum, agent-output, webhook-output
---

## Type responses against ExecutionView, StepView, DefinitionView with compiled, ApprovalEventView, and step output shapes

These interfaces are the canonical shapes from the docs' Object reference. Type client code against them rather than hand-rolled guesses; in particular, branch on `StepView.nodeType` (four values) before reading `output`.

**Incorrect:**

```typescript
interface StepView { nodeType: 'agent' | 'human'; status: string; output: any } // misses notification and webhook
const graph = expandGroupsAndRoles(definition.edges, definition.groups);        // re-implements the compiler; read definition.compiled
```

**Correct:**

```typescript
interface ExecutionView {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;             // epoch ms
  completedAt: number | null;
  cancelledAt: number | null;
  definitionId: string;
  definitionVersion: number;     // pinned at dispatch
  correlationId: string;
  idempotencyKey: string;
  failureReason: { code: string; message: string } | null;
  steps: StepView[];             // [] in /executions/list items
}

interface StepView {
  stepId: string;
  nodeId: string;
  nodeType: 'agent' | 'human' | 'notification' | 'webhook';
  status: 'pending' | 'running' | 'waiting' | 'completed' | 'failed' | 'skipped' | 'cancelled' | 'breached';
  groupId: string | null;
  startedAt: number | null;
  completedAt: number | null;
  output: Record<string, unknown>;
  error: { code: string; message: string } | null;
}

interface DefinitionView {
  definitionId: string;
  name: string;
  description: string | null;
  version: number;
  scope: { level: 'apiKey' | 'organization' | 'document'; organizationId: string | null; documentId: string | null };
  nodes: NodeView[];
  edges: EdgeView[];             // exactly as authored
  groups: ParallelGroupDef[] | null;
  compiled: CompiledGraph;       // read-only, server-derived
  triggers: WorkflowTriggerConfig[] | null;
  tags: string[] | null;
  custom: Record<string, unknown> | null;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'tombstoned';
  // webhookConfig is write-only and never returned
}

type JsonAst = Record<string, unknown>;

interface CompiledGraph {
  forwardEdges: CompiledForwardEdge[];
  loops: CompiledLoopRegion[];
}

interface CompiledForwardEdge {
  from: string;
  to: string;
  role: 'approve' | 'reject' | 'always' | 'exhausted' | 'custom';
  when: JsonAst | null;          // null for always
  fromGroupId?: string;
  toGroupId?: string;
}

interface CompiledLoopRegion {
  loopId: string;
  entryNodeId: string;
  bodyNodeIds: string[];
  maxIterations: number;
  onExhausted: { routeToNodeId: string } | null;
}

interface ApprovalEventView {
  eventId: string;
  seq: number;                   // monotonic per execution
  type: string;                  // external event type, see webhooks-delivery
  stepId: string | null;
  timestamp: number;             // epoch ms
  correlationId: string;
  data?: Record<string, unknown>;
}
```

**Human step `output` (after resume):**

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

**Other step outputs (documented keys)**
- Agent: `agentExecutionStatus`, `agentResultsSummary`, `resolvedUrl`, `agentDurationMs`, and `decision` (`approve` when the agent passed).
- Webhook (on success): `httpStatus`, allowlisted `responseHeaders`, `responseJson` (JSON responses), `responseText` (up to 64 KB).
- Loop entry step input on iteration N+1: `{ iteration, loopId, previousAttempts[] }` (see `concepts-edge-model`).
- Steps completed via `/steps/resolve`: `overriddenAt` is added.

**`joinOnQuorum` successor input:**

```typescript
{
  groupOutputs: Record<string /* memberNodeId */, Record<string, unknown>>;
  groupId: string;
  quorum: number;
  totalApproved: number;
}
```

`decision` / `approved` are what `on: "approve"` / `on: "reject"` edges and quorum counting key off. A step's `{ code, message }` error lives on `StepView.error`, not in event `data`.

**Verification Checklist:**
- [ ] `StepView.nodeType` handling covers `agent`, `human`, `notification`, and `webhook`
- [ ] Graph rendering uses `compiled.forwardEdges` / `compiled.loops`, not a client-side compiler
- [ ] Code never expects `webhookConfig` on a `DefinitionView`
- [ ] `ApprovalEventView.timestamp` is treated as epoch ms
- [ ] Step failure detail is read from `steps[].error` via `/executions/get`
- [ ] `joinOnQuorum` successors read `input.groupOutputs[memberNodeId]`

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#object-reference — interfaces, human step output, `joinOnQuorum` input
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/get-definition#the-compiled-block — `compiled` fields
- https://docs.velt.dev/ai/approval-engine/customize-behavior#agent-nodes — agent output keys
- https://docs.velt.dev/ai/approval-engine/customize-behavior#webhook-nodes — webhook output keys
