---
title: Configure agent nodes with url or urlPath, aiConfig, and a downstream human node instead of blocking
impact: HIGH
impactDescription: An agent node without url/urlPath is rejected at create time, blocking agents fail every run, and an unpaired aiConfig model pin can be silently dropped
tags: approval-engine, agent-node, agentId, url, urlPath, aiConfig, provider, model, defaultModels, maxToolTurns, __mock__, blocking, agent-blocking-not-supported, agent-url-unresolved, pollIntervalMs, agentMaxRuntimeMs, userContextMapping, crossPageExecute, maxUrlsToProcess, agents
---

## Configure agent nodes with url or urlPath, aiConfig, and a downstream human node instead of blocking

An `agent` node starts a run of a Velt agent (a built-in or custom agent from the Agents feature) against a URL, parks in `waiting` while the agent runs, and resumes on its own when the agent finishes. It must know which URL to review, and it can pin the AI provider and model for every run it starts through `aiConfig`.

**Incorrect:**

```json
{
  "nodeId": "brand-check",
  "type": "agent",
  "config": {
    "agentId": "brand-agent-v1",
    "blocking": true,
    "resolutionPolicy": { "kind": "allResolved" },
    "aiConfig": { "model": "claude-sonnet-5", "temperature": 0.2 }
  }
}
```

No `url` or `urlPath` (rejected with the message `agent node requires either a static "url" or a "urlPath"`), `blocking: true` passes schema validation but every run fails with `agent-blocking-not-supported`, and `aiConfig` rejects the unknown `temperature` key.

**Correct:**

```json
{
  "nodeId": "brand-check",
  "type": "agent",
  "config": {
    "agentId": "brand-agent-v1",
    "urlPath": "documentUrl",
    "aiConfig": { "provider": "claude", "model": "claude-sonnet-5" }
  },
  "slaMs": 3600000
}
```

Dispatch with `"triggerContext": { "documentUrl": "https://app.acme.com/docs/123" }` so `urlPath` resolves.

**Agent node `config` fields**

| Field | Notes |
|---|---|
| `agentId` | Required. Built-in or custom agent id. `__mock__` is reserved: it returns a synthetic pass, for demos and tests only. |
| `url` | Fixed absolute URL, up to 2000 chars. Wins when both `url` and `urlPath` are set. |
| `urlPath` | Dot-path into `triggerContext`, up to 500 chars. A value with no scheme is normalized to `https://` (for example Vercel's `payload.deployment.url`). |
| `crossPageExecute` | Let the agent crawl beyond the seed URL. Default `false`. |
| `maxUrlsToProcess` | Cap on URLs crawled per run, up to 500. |
| `userContextMapping` | `{ field: dotPath }` map that builds the agent's `userContext` from `triggerContext`. |
| `promptOverride` | Up to 8000 chars. |
| `inputMapping` | Extra step inputs passed to the agent. |
| `pollIntervalMs` | 5000 to 60000. How often the engine checks the agent's status. Default 15000. |
| `agentMaxRuntimeMs` | Hard ceiling, up to 24 hours. Default 10 minutes. |
| `aiConfig` | AI provider and model for every agent run this node starts. Same fields and rules as `aiConfig` on the Agents Run Execution endpoint. |

You must set `url` or `urlPath`. If `urlPath` resolves to nothing at run time and no static `url` is set, the step fails with `agent-url-unresolved`.

**`aiConfig` on the node**
- Applies to every run the node starts, including scheduled and triggered runs. Omit it to use the provider and model the platform resolves for the agent.
- Takes `provider`, `model`, `defaultModels`, and `maxToolTurns`, with the same validation as Run Execution: at least one field set, unknown keys rejected, models limited to the allowlist. An invalid value fails create or update with `INVALID_ARGUMENT`.
- Send `provider` alongside `model` (or use `defaultModels`). On Run Execution, a `model` without `provider` only passes a weaker check and is silently dropped if it does not match the provider the agent resolves to.
- If the allowlist later stops accepting a saved value, the step drops it and the run uses the platform default. The step does not fail, so do not rely on `aiConfig` to guarantee a model; check the agent execution if it matters.

**Outputs and routing:** the step output carries `agentExecutionStatus`, `agentResultsSummary`, `resolvedUrl`, `agentDurationMs`, and `decision: "approve"` when the agent passed. Route on any of them with an `on: "custom"` predicate. When the agent run does not pass, the step ends `failed` (an `on: "always"` edge fires on `failed`). A completed agent step with `decision: "approve"` counts toward group quorum (see `concepts-groups-quorum`).

**Organization and document:** agent nodes use the dispatch-level `organizationId` and `documentId` when they call the agent. Pass them on `/executions/dispatch` when agent findings should land in a specific organization or document; they are not validated against the definition's `scope` and are not returned by any read endpoint.

**`__mock__`:** completes inline and emits `step.completed` data `{ agentId, synthetic, decision }` instead of the production agent shape, so a webhook receiver tested only against `__mock__` sees different `data` keys in production. Swap to a real `agentId` before going live.

**Human sign-off on agent findings:** blocking agents (and therefore `/steps/recordAgentResolution`) are not available in beta. Put a `human` node downstream of the agent node instead.

**Relationship to the Agents feature:** `agentId` refers to agents documented under AI Agents. The agents themselves (built-in ids, custom agents, Run Execution, `aiConfig` allowlist) are covered by the `rest-agents` rule in `velt-rest-apis-best-practices`; this skill covers only how a workflow node invokes them.

**Verification Checklist:**
- [ ] Every agent node sets `url` or `urlPath`, and `urlPath` matches a key you pass in `triggerContext`
- [ ] No `blocking: true` / `resolutionPolicy` on agent nodes; human review goes in a downstream `human` node
- [ ] `aiConfig` has at least one of `provider`, `model`, `defaultModels`, `maxToolTurns` and no other keys
- [ ] `model` is paired with `provider`, or `defaultModels` is used
- [ ] `agentMaxRuntimeMs` is set when agents may run longer than the 10 minute default (max 24 hours)
- [ ] `__mock__` agent ids are replaced before production, and webhook receivers handle the production `step.completed` data shape
- [ ] Dispatch passes `organizationId` / `documentId` when agent findings must target a specific organization or document

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#agent-nodes — agent node fields, `aiConfig`, URL rules, output, blocking warning
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run — `aiConfig` validation and allowed models
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/dispatch-execution — dispatch `organizationId` / `documentId`
- https://docs.velt.dev/ai/approval-engine/customize-behavior#event-reference — `__mock__` event data
- https://docs.velt.dev/ai/agents/overview — the agents that `agent` nodes run
