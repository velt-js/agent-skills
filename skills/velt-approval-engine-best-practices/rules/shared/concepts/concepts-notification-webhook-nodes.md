---
title: Use notification nodes for email or Slack and webhook nodes for sync or async calls to your API
impact: MEDIUM-HIGH
impactDescription: Webhook nodes are a live step type with sync and async modes; treating them as deferred, or completing async steps without the callback token, leaves runs parked in waiting
tags: approval-engine, notification-node, webhook-node, email, slack, bodyTemplate, subjectTemplate, slackTarget, slack-blocks, templating, sync, async, callback, x-velt-callback-token, authMode, hmac, token, webhookAuth, expectedStatusCodes, requireNonEmptyOutput
---

## Use notification nodes for email or Slack and webhook nodes for sync or async calls to your API

Two node types let a workflow talk to the outside world without extra cloud functions. A `notification` node sends an email or Slack message built from the previous step's output. A `webhook` node calls your HTTPS endpoint as a workflow step, either waiting for the response (`sync`) or parking until your system calls back (`async`). Both run today; the old "webhook node is deferred" guidance no longer applies.

**Incorrect:**

```json
[
  {
    "nodeId": "notify",
    "type": "notification",
    "config": { "channel": "email", "format": "slack-blocks", "bodyTemplate": "Decision: ${input.decision}" }
  },
  {
    "nodeId": "erp-sync",
    "type": "webhook",
    "config": { "url": "http://10.0.0.5/hook", "authMode": "token", "requestHeaders": { "x-velt-signature": "x" } }
  }
]
```

Email without `recipients`, `slack-blocks` on email, `${...}` instead of `{{...}}` interpolation, a non-https private URL, `authMode: "token"` without `authTokenHeader`, and a reserved `x-velt-*` header.

**Correct:**

```json
[
  {
    "nodeId": "notify-stakeholders",
    "type": "notification",
    "config": {
      "channel": "email",
      "recipients": ["lead@acme.dev", "pm@acme.dev"],
      "subjectTemplate": "Approval {{input.decision}} for {{execution.triggerContext.page.title}}",
      "bodyTemplate": "Findings: {{input.agentResultsSummary.summary}}",
      "format": "text"
    }
  },
  {
    "nodeId": "erp-sync",
    "type": "webhook",
    "config": {
      "url": "https://erp.acme.com/hooks/approval",
      "mode": "async",
      "authMode": "token",
      "authTokenHeader": "x-erp-token",
      "timeoutMs": 15000
    }
  }
]
```

For `authMode: "token"`, pass the token at dispatch time in `triggerContext.webhookAuth["erp-sync"]` so the secret never lives in the definition.

**Notification node `config`**

| Field | Notes |
|---|---|
| `channel` | Required. `email` or `slack`. |
| `bodyTemplate` | Required. 1 to 16000 chars, `{{dot.path}}` interpolation. |
| `recipients` | Required for `email`. 1 to 50 addresses. |
| `subjectTemplate` | Email subject, up to 2000 chars. |
| `slackTarget` | Required for `slack`. Channel id (such as `C0123`) or an `https` incoming-webhook URL. |
| `format` | `text` (default), `html`, or `slack-blocks` (Slack only; the rendered body must be a JSON array of Block Kit blocks). |

Templating is dot-path substitution only, with no code execution. Missing tokens render empty; objects and arrays are JSON-stringified. Roots: `input.*` (previous step's output), `execution.*` (`executionId`, `definitionId`, `correlationId`, `triggerContext`), `step.*` (this step's metadata).

Delivery: email goes through your workspace's SendGrid configuration; delivering to at least one recipient completes the step, none fails and retries. Slack to a channel id needs a workspace bot token. Slack config errors (`channel_not_found`, `invalid_auth`) are terminal; 5xx, network errors, and `rate_limited` are retried.

**Webhook node `config`**

| Field | Notes |
|---|---|
| `url` | Required. `https` only, host-allowlisted, up to 2000 chars. |
| `mode` | `sync` (default) or `async`. |
| `method` | `GET` or `POST` (default). |
| `authMode` | `hmac` (default), `token`, or `none`. |
| `authTokenHeader` | Required when `authMode: "token"`. |
| `timeoutMs` | 1000 to 60000. Default 10000. |
| `expectedStatusCodes` | Up to 20 codes treated as success instead of 2xx. |
| `bodyTemplate` | `envelope` (default), `pass-through`, or `none` (`none` requires `method: "GET"`). |
| `requestHeaders` | Extra headers. `x-velt-*` and reserved names are rejected. |

- **`sync`:** 2xx (or a listed `expectedStatusCodes` value) completes the step. 4xx fails it terminally. 5xx, timeout, or network error fails it with retry budget remaining. Set node-level `requireNonEmptyOutput: true` to fail on an empty body (`webhook-node-empty-response`).
- **`async`:** the engine posts, then parks the step in `waiting`. The `envelope` body carries `callback.url`, `callback.token`, `callback.tokenHeader`; `pass-through` nests them as `_velt.callbackUrl`, `_velt.callbackToken`, `_velt.callbackTokenHeader`. Complete the step by POSTing to the callback URL with the token in `x-velt-callback-token` and a body of `{ "status": "completed" | "failed", "output"?: {}, "error"?: {} }`. Async mode needs a `webhookSecret` on the execution to sign the callback token.
- **`hmac`:** the engine signs the outbound body with the execution's `webhookSecret` in `x-velt-signature` (verify it the same way as outbound event deliveries, see `webhooks-delivery`).
- **Output:** `httpStatus`, allowlisted `responseHeaders`, `responseJson` for JSON responses, and `responseText` capped at 64 KB.

**Async callback from your system (Node.js):**

```javascript
// payload is the envelope body the engine POSTed to your webhook node URL
await fetch(payload.callback.url, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-velt-callback-token': payload.callback.token,
  },
  body: JSON.stringify({ status: 'completed', output: { erpRecordId: 'PO-1042' } }),
});
```

**Verification Checklist:**
- [ ] Email notifications set `recipients`; Slack notifications set `slackTarget`; `slack-blocks` only on Slack
- [ ] Templates use `{{input.*}}`, `{{execution.*}}`, or `{{step.*}}` paths only
- [ ] Webhook node URLs are `https` and not private, loopback, link-local, or `*.internal`
- [ ] `authMode: "token"` sets `authTokenHeader`, and dispatch passes `triggerContext.webhookAuth[<nodeId>]`
- [ ] Async webhook nodes run on executions that have a `webhookSecret` (dispatch pair or `webhookConfig`)
- [ ] Your async receiver calls back with `x-velt-callback-token` and a `status` of `completed` or `failed`
- [ ] `requestHeaders` contains no `x-velt-*` or reserved header names

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#notification-nodes — fields, templating, delivery notes
- https://docs.velt.dev/ai/approval-engine/customize-behavior#webhook-nodes — sync and async modes, callback contract, auth modes, output
- https://docs.velt.dev/ai/approval-engine/customize-behavior#schema-validation-messages — notification and webhook node messages
