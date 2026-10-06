---
title: Create and query suggestions from your backend with the comment annotation REST APIs
impact: MEDIUM
impactDescription: Server-side agents have no browser session; REST with type 'suggestion' is how they propose changes, and the server owns suggestion.status
tags: REST, backend, add-comment-annotations, type suggestion, suggestion payload, agent, agentSuggestions, commentType, get-comment-annotations, AI agent
---

## Create and query suggestions from your backend with the comment annotation REST APIs

Suggestions are stored as comment annotations, so your backend manages them with the v2 Comment Annotations REST APIs. Set the annotation-level `type: "suggestion"`; it is the source of truth for the classification. Attach a `suggestion` object (`targetId`, `targetType`, `oldValue`, `newValue`, `summary`, `driftDetected`, plus any custom fields) so your frontend accept handler can round-trip the change. For agent findings, add an `agent` block to the root comment (`commentData[0]`).

**Incorrect (legacy classification and client-set status):**

```json
{
  "data": {
    "organizationId": "acme-corp",
    "documentId": "design-mockup-v2",
    "commentAnnotations": [
      {
        "commentType": "suggestion",
        "suggestion": { "targetId": "row.123", "newValue": { "x": 305 }, "status": "accepted" },
        "commentData": [{ "commentText": "Bump x", "from": { "userId": "bot" } }]
      }
    ]
  }
}
```

`commentType: "suggestion"` is preserved for backward compatibility but no longer drives classification, and `suggestion.status` is server-owned: a caller-supplied value is dropped and the server stamps `pending`.

**Correct (POST https://api.velt.dev/v2/commentannotations/add):**

```json
{
  "data": {
    "organizationId": "acme-corp",
    "documentId": "design-mockup-v2",
    "commentAnnotations": [
      {
        "type": "suggestion",
        "suggestion": {
          "targetId": "row.123",
          "targetType": "custom",
          "oldValue": { "x": 205 },
          "newValue": { "x": 305 },
          "summary": "row.123: 205 → 305"
        },
        "commentData": [
          {
            "commentText": "Bump x from 205 to 305 to match the spec.",
            "from": { "userId": "spec-bot", "name": "Spec Bot" }
          }
        ]
      }
    ]
  }
}
```

Send it with the `x-velt-api-key` and `x-velt-auth-token` headers. Any `type: "suggestion"` annotation renders the suggestion card (header, diff body, accept/reject actions) in the comment dialog; a human-authored one shows the author's avatar instead of an agent identity. An annotation without a full `suggestion` payload is backfilled to a pending state at render time.

**Querying and cleanup:**
- Get Comment Annotations (v2) with `agentSuggestions: true` returns only fresh (unaccepted) agent suggestions. Only one agent filter may be supplied per request.
- Update Comment Annotations changes annotation-level fields; Delete Comment Annotations removes suggestion threads.

**Verification Checklist:**
- [ ] Requests set annotation-level `type: "suggestion"`, not only `commentType`
- [ ] No `status` is sent inside `suggestion`
- [ ] `targetId` matches the frontend `data-velt-suggestion-target` so the accept handler can apply `newValue`
- [ ] Agent findings put the `agent` block on `commentData[0]`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#backend-apis — "Backend APIs"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations — `type`, `suggestion`, `agent`, examples
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2 — `agentSuggestions` filter
- https://docs.velt.dev/ai/agent-comments — agent findings walkthrough
