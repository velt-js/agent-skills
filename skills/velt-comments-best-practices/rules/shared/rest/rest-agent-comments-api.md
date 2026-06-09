---
title: REST API — Agent Comment Annotations (Create, Read, Filter)
impact: HIGH
impactDescription: Let AI agents leave comments via REST API with the agent block, and read them back with agent-specific filters
tags: agent, agentSource, agentId, executionId, agentName, agent-comments, rest, api, suggestion, external, velt, built-in, custom, agentSuggestions, agentComments, agentType
---

## REST API — Agent Comment Annotations (Create, Read, Filter)

Agent comments let AI agents participate in collaboration by leaving findings via the Add Comment Annotations REST API. The server stamps `sourceType: "agent"` on the annotation and renders it with Accept/Reject buttons in the Velt UI. Any agent that can make an HTTP request can do this — a built-in Velt agent, a custom agent registered in the Console, or an external agent running in your own framework.

### Creating agent annotations

Attach an `agent` object to `commentData[0]` (the root comment). Set the annotation `type` to `"suggestion"` so the finding renders as a reviewable agent suggestion rather than a regular comment.

**The `agent` block:**

| Field | Required | Description |
|-------|----------|-------------|
| `agentSource` | Yes | Origin of the agent: `"velt"` or `"external"` |
| `agentId` | Required for `velt`, optional for `external` | A built-in agent (e.g. `spell-check`) or custom agent ID. Opaque (never validated) for `external` agents. |
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

The server stamps `sourceType: "agent"` on both the comment and the annotation, and generates the annotation-level `agent` block (the `CommentAnnotationAgent` type from `data-types-reference`). The finding renders in Velt as a suggestion with Accept and Reject buttons on the comment dialog.

### Reading agent annotations back

Use the Get Comment Annotations API with agent-specific filters. Only one agent filter may be supplied per request.

| Filter | Description |
|--------|-------------|
| `agentId` | Annotations created by a specific agent. |
| `executionId` | Annotations from a specific agent run. |
| `agentType` | `"built-in"`, `"custom"`, or `"external"`. |
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

The Get Comment Annotations API requires the **advanced queries** option to be enabled in the Velt Console and the v4+ series of the Velt SDK.

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
- [ ] `agent` block is on `commentData[0]` (the root comment), not on the annotation wrapper
- [ ] `agentSource` is set — `"external"` for your own agents, `"velt"` for built-in/custom agents
- [ ] `agentName` is provided when `agentSource` is `"external"` (server cannot resolve it)
- [ ] Annotation `type` is `"suggestion"` so Accept/Reject buttons render
- [ ] `reason` object is provided with at least a `title` and `description`
- [ ] Only one agent filter is used per Get request (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, or `agentComments`)
- [ ] Client-side `suggestionAccepted`/`suggestionRejected` handlers apply changes to your data (the SDK only persists the status)

**Source Pointer:** https://docs.velt.dev/ai/agent-comments
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations
**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2
