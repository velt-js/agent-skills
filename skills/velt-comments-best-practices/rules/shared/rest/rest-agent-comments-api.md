---
title: REST API — Agent Comment Annotations (Create, Read, Filter)
impact: HIGH
impactDescription: Let AI agents leave comments via REST API with the agent block, and read them back with agent-specific filters
tags: agent, agentSource, agentId, agentType, executionId, agentName, agent-comments, rest, api, suggestion, external, velt, custom, built-in, agentSuggestions, agentComments, reason, severity, suggestedFix, findingType, confidence
---

## REST API — Agent Comment Annotations (Create, Read, Filter)

Agent comments let AI agents participate in collaboration by leaving findings via the Add Comment Annotations REST API. The server stamps `sourceType: "agent"` on the annotation and renders it with Accept/Reject buttons in the Velt UI. Any agent that can make an HTTP request can do this — a built-in Velt agent, a custom agent created via the Review Agents API (`POST /v2/agents/create`, owned by `velt-rest-apis-best-practices`), or an external agent running in your own framework.

### Creating agent annotations

Attach an `agent` object to `commentData[0]` (the root comment). Set the annotation `type` to `"suggestion"` so the finding renders as a reviewable agent suggestion rather than a regular comment.

**The `agent` block:**

| Field | Required | Description |
|-------|----------|-------------|
| `agentSource` | Yes | Origin of the agent: `"velt"` or `"external"` |
| `agentId` | Yes | The agent's ID. Must be non-empty. Verified server-side for `velt` agents; opaque (never validated) for `external` agents. |
| `agentName` | Required for `external` | Display name for the agent. For `velt` agents, the name is resolved server-side. |
| `executionId` | No | Execution / run ID for this agent invocation. Used to query all findings from a single run. |
| `url` | No | Page URL associated with the finding. |
| `reason` | Yes | Finding details object — `title`, `description`, `severity`, `findingType`, `confidence`, `suggestedFix`, etc. Custom fields are preserved. |

**Correct (external agent leaving a finding via REST):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/add
const response = await fetch('https://api.velt.dev/v2/commentannotations/add', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      commentAnnotations: [
        {
          type: 'suggestion',
          commentData: [
            {
              commentText: 'This button has insufficient color contrast.',
              from: { userId: 'a11y-bot' },
              agent: {
                agentSource: 'external',
                agentName: 'Accessibility Bot',
                agentId: 'a11y-bot',
                executionId: 'run_8f21',
                url: 'https://example.com/design-mockup-v2',
                reason: {
                  title: 'Low color contrast',
                  description: 'Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.',
                  severity: 'high',
                  findingType: 'pin',
                },
              },
            },
          ],
        },
      ],
    },
  }),
});
```

**Correct (Python — external agent):**

```python
import os
import requests

response = requests.post(
    "https://api.velt.dev/v2/commentannotations/add",
    headers={
        "x-velt-api-key": os.environ["VELT_API_KEY"],
        "x-velt-auth-token": os.environ["VELT_AUTH_TOKEN"],
        "Content-Type": "application/json",
    },
    json={
        "data": {
            "organizationId": "acme-corp",
            "documentId": "design-mockup-v2",
            "commentAnnotations": [
                {
                    "type": "suggestion",
                    "commentData": [
                        {
                            "commentText": "This button has insufficient color contrast.",
                            "from": {"userId": "a11y-bot"},
                            "agent": {
                                "agentSource": "external",
                                "agentName": "Accessibility Bot",
                                "agentId": "a11y-bot",
                                "executionId": "run_8f21",
                                "url": "https://example.com/design-mockup-v2",
                                "reason": {
                                    "title": "Low color contrast",
                                    "description": "Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.",
                                    "severity": "high",
                                    "findingType": "pin",
                                },
                            },
                        }
                    ],
                }
            ],
        }
    },
)
```

Attaching the `agent` block to the root comment marks the whole annotation as agent-authored: the server stamps `sourceType: "agent"` on both the comment and the annotation, and generates the annotation-level `agent` block (the `CommentAnnotationAgent` type from `data-types-reference`). Attaching an `agent` block to a reply instead (see "Replying as an agent" below) marks only that individual comment as agent-authored — the parent annotation is not reclassified. The finding renders in Velt as a suggestion with Accept and Reject buttons on the comment dialog.

### The `reason` object

`reason` carries the finding's details. Three fields are required; the remaining ten are optional. Any extra custom fields beyond this list are preserved by the server.

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | Yes | string | Short finding title — a quick label for the issue (e.g. `"Low color contrast"`). |
| `description` | Yes | string | Fuller explanation of what the agent found. |
| `severity` | Yes | string | One of `critical`, `high`, `medium`, `low`, `info`. |
| `findingId` | No | string | Your own unique ID for the finding, useful for dedup / tracking. |
| `findingType` | No | string | What kind of target the finding is on. One of `text`, `pin`, `page`. |
| `issueType` | No | string | Custom classification you define for your own taxonomy (e.g. `"accessibility"`). |
| `confidence` | No | number | How confident the agent is. Integer 0–100. |
| `suggestion` | No | string | Suggested change in plain text — **human-readable prose** (e.g. `"Darken the button background to at least #1A1A1A."`). |
| `suggestedFix` | No | string | **The concrete literal replacement value** to apply (e.g. for a spelling correction, just `"Welcome"` — the corrected word itself, not a sentence about it). |
| `htmlSnippet` | No | string | The relevant chunk of HTML where the issue lives. |
| `htmlSelector` | No | string | CSS / HTML selector pointing to the finding's location. |
| `source` | No | string | Where the triggering rule came from. One of `instructions`, `knowledge`. |
| `knowledgeSection` | No | string | Which knowledge section fired (pairs with `source: "knowledge"`). |

**Do not conflate `suggestion` and `suggestedFix`.** `suggestion` is prose meant for a human reviewer to read in the comment; `suggestedFix` is the literal replacement value your code would apply on Accept. For a spelling fix, `suggestion` might read `"Did you mean 'Welcome'?"` while `suggestedFix` is just `"Welcome"`.

**Correct (fully-populated `reason`):**

```json
"reason": {
  "title": "Low color contrast",
  "description": "Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.",
  "severity": "high",
  "findingId": "finding_a11y_0427",
  "findingType": "pin",
  "issueType": "accessibility",
  "confidence": 92,
  "suggestion": "Darken the button background to at least #1A1A1A.",
  "suggestedFix": "#1A1A1A",
  "htmlSnippet": "<button class='cta'>Buy now</button>",
  "htmlSelector": ".cta-primary > button",
  "source": "knowledge",
  "knowledgeSection": "brand-guidelines/accessibility"
}
```

### Replying as an agent

An agent can also post a reply into an existing thread. Use the Add Comments API (`POST /v2/comments/add`, base contract in `rest-comments-api`) and attach an `agent` block to the reply comment — same shape as when creating the root comment.

Annotation-level fields such as `type` are set **only when the annotation is created**. They are **not accepted** on the Add Comments endpoint — the reply inherits its parent annotation's type. Sending `type` here is a common contract error; the field is silently ignored.

**Correct (external agent replying to an existing thread):**

```javascript
// POST https://api.velt.dev/v2/comments/add
const response = await fetch('https://api.velt.dev/v2/comments/add', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      annotationId: 'annotation_abc123',
      commentData: [
        {
          commentText: 'Follow-up: contrast is now 2.7:1 — still below WCAG AA.',
          from: { userId: 'a11y-bot' },
          agent: {
            agentSource: 'external',
            agentName: 'Accessibility Bot',
            agentId: 'a11y-bot',
            executionId: 'run_9c02',
            reason: {
              title: 'Low color contrast (follow-up)',
              description: 'Ratio moved from 2.1:1 to 2.7:1 after the last commit.',
              severity: 'high',
            },
          },
        },
      ],
    },
  }),
});
```

### Reading agent annotations back

Use the Get Comment Annotations API with agent-specific filters to fetch whole agent-authored threads. Only one agent filter may be supplied per request.

| Filter | Description |
|--------|-------------|
| `agentId` | Annotations created by a specific agent. |
| `executionId` | Annotations from a specific agent run. |
| `agentType` | Annotations of a given agent type: `"built-in"`, `"custom"`, or `"external"`. |
| `agentSource` | `"velt"` or `"external"`. |
| `agentSuggestions` | When `true`, returns only fresh (unaccepted) agent suggestions. |
| `agentComments` | When `true`, returns all agent annotations regardless of status. |

**Correct (fetch all findings from a specific agent run):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/get
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      executionId: 'run_8f21',
    },
  }),
});
```

Agent annotations in the response carry `type: "suggestion"` and `sourceType: "agent"` at the annotation root, an annotation-root `agent` block (`CommentAnnotationAgent`), and an `agent` block on each agent-authored comment (`comments[].agent`).

**Correct (fetch only pending agent suggestions):**

```javascript
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      agentSuggestions: true,
    },
  }),
});
```

**Correct (fetch all annotations from external agents):**

```javascript
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      agentSource: 'external',
    },
  }),
});
```

The Get Comment Annotations API requires the **advanced queries** option to be enabled in the Velt Console and the v4+ series of the Velt SDK. Confirm the current prerequisite against the API reference before assuming this still applies.

To fetch **individual comments within a specific annotation** (rather than whole threads), use the Get Comments API (`POST /v2/comments/get`) instead — see `rest-comments-api` for the base contract. Get Comment Annotations returns the thread with its full `comments[]` payload; Get Comments is the tool for pulling a single comment out of an existing thread by id.

### Updating agent annotations and comments

Agent comments are updated through the same endpoints as any other comment — the split is by scope:

- **Annotation-level fields** (status, assignee, location, resolved state, etc.) go through the Update Comment Annotations API (`POST /v2/commentannotations/update`). See `rest-comment-annotations-api` for the base contract.
- **Individual comment content** within the thread goes through the Update Comments API (`POST /v2/comments/update`). See `rest-comments-api`.

There is no agent-specific update endpoint; the `agent` block on the comment is carried through unchanged.

### Deleting agent annotations and comments

Two scopes, same split:

- **Whole-thread deletion** goes through the Delete Comment Annotations API (`POST /v2/commentannotations/delete`). Filter by `annotationIds` for specific threads, or by the agent's `userIds` — this is the idiomatic pattern for **purging every annotation a given agent created** (e.g. wiping a bot's findings before a re-run). See `rest-comment-annotations-api`.
- **Single-comment deletion** within a thread goes through the Delete Comments API (`POST /v2/comments/delete`). See `rest-comments-api`.

### Handling accept/reject on the client

Agent findings render with Accept and Reject buttons. Subscribe to `suggestionAccepted` and `suggestionRejected` on the comment element to apply the change to your own data or trigger follow-up logic. The SDK records the outcome and persists the suggestion status — applying the actual change is your code's responsibility.

**Correct (React — subscribe to agent suggestion events):**

```tsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

export function AgentSuggestionListener() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    if (!accepted) return;
    // accepted.commentAnnotation contains the full agent finding
    console.log('Suggestion accepted', accepted.commentAnnotation);
  }, [accepted]);

  useEffect(() => {
    if (!rejected) return;
    // rejected.rejectReason contains the reviewer's reason (if provided)
    console.log('Suggestion rejected', rejected.rejectReason);
  }, [rejected]);

  return null;
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```javascript
const commentElement = Velt.getCommentElement();

commentElement.on('suggestionAccepted').subscribe(({ commentAnnotation }) => {
  console.log('Suggestion accepted', commentAnnotation);
});

commentElement.on('suggestionRejected').subscribe(({ commentAnnotation, rejectReason }) => {
  console.log('Suggestion rejected', rejectReason);
});
```

### UI rendering

Annotations created with `sourceType: "agent"` render with an agent-identity header (agent name + avatar from the `agent` block) instead of the standard human-author header. Because the annotation `type` is `"suggestion"`, the comment dialog shows Accept and Reject buttons.

To build a custom agent suggestion UI, use the standalone `VeltCommentDialogAgentSuggestion*` primitives (not the wireframe pattern). Wrap them in a `VeltCommentDialogContextWrapper` with `annotationId`:

```tsx
import {
  VeltCommentDialogContextWrapper,
  VeltCommentDialogAgentSuggestionBody,
  VeltCommentDialogAgentSuggestionActions,
  VeltCommentDialogAgentSuggestionActionsActionAccept,
  VeltCommentDialogAgentSuggestionActionsActionReject,
  VeltCommentDialogAgentSuggestionBanner,
} from '@veltdev/react';

function AgentFindingCard({ annotationId }: { annotationId: string }) {
  return (
    <VeltCommentDialogContextWrapper annotationId={annotationId}>
      <VeltCommentDialogAgentSuggestionBody />
      <VeltCommentDialogAgentSuggestionActions>
        <VeltCommentDialogAgentSuggestionActionsActionAccept />
        <VeltCommentDialogAgentSuggestionActionsActionReject />
      </VeltCommentDialogAgentSuggestionActions>
      <VeltCommentDialogAgentSuggestionBanner />
    </VeltCommentDialogContextWrapper>
  );
}
```

The full 21-component hierarchy and all props are documented in `ui-agent-suggestion-primitives`.

**Verification:**
- [ ] `agent` block is on `commentData[0]` (the root comment) when creating a thread, or on the reply comment when replying via `/v2/comments/add` — not on the annotation wrapper
- [ ] `agentSource` is set — `"external"` for your own agents, `"velt"` for built-in agents or custom agents created via the Review Agents API
- [ ] `agentId` is set to a non-empty string for **both** `velt` and `external` agents (required regardless of `agentSource`)
- [ ] `agentName` is provided when `agentSource` is `"external"` (server cannot resolve it)
- [ ] Annotation `type` is `"suggestion"` when **creating** so Accept/Reject buttons render — do **not** send `type` on the Add Comments (`/v2/comments/add`) reply endpoint; it is ignored
- [ ] `reason` object is provided with all three required fields (`title`, `description`, `severity`)
- [ ] `severity` is one of `critical`, `high`, `medium`, `low`, `info`
- [ ] `suggestion` is human-readable prose; `suggestedFix` is the literal replacement value (not conflated)
- [ ] `findingType`, if set, is one of `text`, `pin`, `page`
- [ ] `source`, if set, is `instructions` or `knowledge` (and `knowledgeSection` is set when `source` is `knowledge`)
- [ ] Only one agent filter is used per Get request (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, or `agentComments`)
- [ ] `agentType`, if used, is one of `"built-in"`, `"custom"`, or `"external"`
- [ ] Updates route by scope — annotation-level fields via Update Comment Annotations, per-comment content via Update Comments
- [ ] Deletes route by scope — whole threads via Delete Comment Annotations (use the agent's `userIds` to purge everything one agent created), single comments via Delete Comments
- [ ] Individual-comment reads use Get Comments (`/v2/comments/get`); whole-thread reads use Get Comment Annotations
- [ ] Client-side `suggestionAccepted`/`suggestionRejected` handlers apply changes to your data (the SDK only persists the status)

**Source Pointer:** https://docs.velt.dev/ai/agent-comments
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/update-comment-annotations
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/delete-comment-annotations
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/add-comments
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/delete-comments
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/agents/create
