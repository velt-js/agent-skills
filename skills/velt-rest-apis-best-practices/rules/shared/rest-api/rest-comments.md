---
title: Comment Annotations and Comments CRUD via REST API
impact: HIGH
impactDescription: Comments are the most-used collaboration primitive; wrong payload shapes are rejected or silently write the wrong data
tags: rest, api, comments, annotations, crud, commentData, updatedData, agent, suggestions
---

## Comment Annotations and Comments CRUD via REST API

The comment REST endpoints live under `https://api.velt.dev/v2/commentannotations/*`. All are `POST` with the API-key-level headers (`x-velt-api-key`, `x-velt-auth-token`). Annotations (threads) are created with a `commentAnnotations[]` array whose items carry `commentData[]`; updates use `updatedData`. For the full comments feature (frontend APIs, agent-authoring guidance, progress rows, action chips), see `velt-comments-best-practices`.

**Incorrect (invented payload keys: `annotation`, `comments`, `commenterId`):**

```json
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotation": {
      "comments": [{ "commentText": "This needs review", "commenterId": "user-1" }]
    }
  }
}
```

**Correct (`commentAnnotations[]` with `commentData[]` and a `from` user):**

```bash
POST https://api.velt.dev/v2/commentannotations/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "commentAnnotations": [
      {
        "location": { "id": "section-2", "locationName": "Pricing" },
        "targetElement": { "elementId": "pricing-table", "targetText": "Pro plan", "occurrence": 1 },
        "commentData": [
          {
            "commentText": "This needs review",
            "commentHtml": "<p>This needs review</p>",
            "from": { "userId": "user-1", "name": "Alice", "email": "alice@example.com" },
            "triggerNotification": true
          }
        ]
      }
    ]
  }
}
```

### Comment annotation endpoints

```bash
# Get annotations (requires advanced queries enabled in the Console)
POST https://api.velt.dev/v2/commentannotations/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationIds": ["ann-789"], "pageSize": 50 } }

# Update annotations: filters select annotations, updatedData holds the change
POST https://api.velt.dev/v2/commentannotations/update
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationIds": ["ann-789"],
    "updatedData": { "status": { "id": "inprogress", "name": "In Progress", "type": "ongoing" } }
} }

# Delete annotations (documentId required; narrow with annotationIds, locationIds, userIds)
POST https://api.velt.dev/v2/commentannotations/delete
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationIds": ["ann-789"] } }

# Count annotations for a user across documents
POST https://api.velt.dev/v2/commentannotations/count/get
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"], "userId": "user-1", "statusIds": ["OPEN", "IN_PROGRESS"] } }
```

- `get` filters include `documentIds` + `groupByDocumentId`, `locationIds`, `folderId`, `annotationIds`, `userIds`, `mentionedUserIds`, `resolvedBy`, `statusIds`, created/updated time ranges, `order`, and `pageSize` / `pageToken`. Agent filters (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, `agentComments`) are one per request.
- On `update`, `annotationIds` / `locationIds` / `userIds` are optional filters on top of the document. Without them the update targets the document's annotations, so always narrow it to the threads you mean to change.

**Delete comment annotations: agent filters (AND-combined):**

`/v2/commentannotations/delete` accepts three agent-scoped filters: `agentId` (annotations authored by a specific agent), `agentSuggestions: true` (still-pending suggestions only; accepted suggestions are never matched), and `agentUrls` (annotations stamped for any of the listed page URLs). Unlike the one-per-request agent filters on Get Comment Annotations, these three are **AND-combined** on delete, and they also intersect with `annotationIds` when both are supplied.

```bash
# Delete only the spell-check agent's still-pending suggestions on named pages.
POST https://api.velt.dev/v2/commentannotations/delete

{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "agentId": "spell-check",
    "agentSuggestions": true,
    "agentUrls": ["https://example.com/pricing"]
  }
}
```

Scope collapses as filters drop:

- `{ agentId, agentSuggestions, agentUrls }`: one agent's still-pending suggestions on those pages only.
- `{ agentSuggestions: true }` alone: all still-pending suggestions on the document.
- `{ agentId }` alone: all of that agent's annotations on the document.
- `{ agentUrls }` alone: all agent annotations stamped for those pages.

Annotations created before URL stamping existed are never matched by `agentUrls`.

**Preconditions and error modes for agent filters:**

- **Advanced queries must be enabled on the workspace** to use any of `agentId` / `agentSuggestions` / `agentUrls`. Without it, the request fails with `NOT_FOUND` (`Advanced queries are not enabled...`) rather than widening the delete to the whole document.
- If none of the supplied `agentUrls` resolves to a valid page (blank strings or fragment-only URLs), the request fails with `INVALID_ARGUMENT`. Sanitize `agentUrls` before dispatch.

Review agents run through `/v2/agents/execution/run` already replace their own pending suggestions on re-run (see `rest-agents-execution`); use these delete filters for manual cleanup.

### Individual comment endpoints

These operate on comments inside one existing annotation (`annotationId`, singular). Comment IDs are numbers.

```bash
# Add comments to an annotation
POST https://api.velt.dev/v2/commentannotations/comments/add
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationId": "ann-789",
    "commentData": [
      { "commentText": "Agreed, let's fix this", "from": { "userId": "user-2", "name": "Bob" } }
    ]
} }

# Get comments of an annotation
POST https://api.velt.dev/v2/commentannotations/comments/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789", "commentIds": [153783] } }

# Update comments: commentIds + updatedData
POST https://api.velt.dev/v2/commentannotations/comments/update
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationId": "ann-789",
    "commentIds": [153783],
    "updatedData": { "commentText": "Updated text", "commentHtml": "<p>Updated text</p>" }
} }

# Delete comments
POST https://api.velt.dev/v2/commentannotations/comments/delete
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789", "commentIds": [153783] } }
```

**Key points:**

- Every endpoint is `POST`; there are no GET, PUT, or DELETE HTTP methods.
- `organizationId` and `documentId` are present on every comment request (`delete` lists `organizationId` as optional, but send it).
- Annotation-level operations use `annotationIds` (array) or the `commentAnnotations[]` array on add; comment-level operations use `annotationId` (singular) plus numeric `commentIds`.
- `createOrganization` / `createDocument` on add create missing containers; `verifyUserPermissions` limits writes to users with document access.
- `commentData[]` also accepts `progress`, `actions`, `triggerNotification`, `taggedUserContacts`, and `context`; see `velt-comments-best-practices` for those.

### Agent block on comment annotations

Both `/v2/commentannotations/add` (via the root `commentData[0]`) and `/v2/commentannotations/comments/add` accept an `agent` block that marks a comment as agent-authored. When the block is attached, the server stamps `sourceType: "agent"` on the comment; when attached to the root comment on `/v2/commentannotations/add`, the server also generates the annotation-level agent block and stamps `sourceType: "agent"` on the annotation.

**Required fields inside `agent`:**

- `agentSource`: must be `"velt"` or `"external"`.
- `agentId`: must be non-empty **for both sources**. When `agentSource` is `"velt"`, it is a built-in agent like `spell-check` or a custom agent ID that is verified server-side, and **unknown IDs return `NOT_FOUND`** instead of being silently accepted. When `agentSource` is `"external"`, it is your own opaque identifier, never validated against any registry, even if the string happens to collide with a real Velt agent name. Both `/v2/commentannotations/add` and `/v2/commentannotations/comments/add` share this validation contract.
- `reason`: finding details object. `reason.title`, `reason.description`, and `reason.severity` (one of `critical`, `high`, `medium`, `low`, `info`) are all required.

**Conditionally required:** `agentName` must be supplied when `agentSource` is `"external"` (it is the only source of truth for an external agent's display name). It is not used for `velt` agents, which resolve their name server-side.

**Incorrect:** Omitting `agentId` for an external-agent finding (the request is rejected because `agentId` is required regardless of source):

```json
{
  "agent": {
    "agentSource": "external",
    "agentName": "Accessibility Bot",
    "reason": {
      "title": "Low color contrast",
      "description": "Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.",
      "severity": "high"
    }
  }
}
```

**Correct:** Supply `agentId` on every agent block. For `external`, also supply `agentName`:

```bash
POST https://api.velt.dev/v2/commentannotations/add

{
  "data": {
    "organizationId": "acme-corp",
    "documentId": "design-mockup-v2",
    "commentAnnotations": [
      {
        "type": "suggestion",
        "commentData": [
          {
            "commentText": "This button has insufficient color contrast.",
            "from": { "userId": "a11y-bot" },
            "agent": {
              "agentSource": "external",
              "agentId": "a11y-bot",
              "agentName": "Accessibility Bot",
              "reason": {
                "title": "Low color contrast",
                "description": "Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.",
                "severity": "high",
                "findingType": "pin"
              }
            }
          }
        ]
      }
    ]
  }
}
```

For a Velt built-in or verified custom agent, drop `agentName` and set `agentSource: "velt"`:

```bash
POST https://api.velt.dev/v2/commentannotations/comments/add

{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "annotationId": "yourAnnotationId",
    "commentData": [
      {
        "commentText": "I fixed the spelling. Please re-review.",
        "from": { "userId": "spell-check", "name": "Spell Check Agent" },
        "agent": {
          "agentSource": "velt",
          "agentId": "spell-check",
          "executionId": "exec_124",
          "reason": {
            "title": "Spelling corrected",
            "description": "Updated 'Welcom' to 'Welcome'.",
            "severity": "info",
            "findingType": "text"
          }
        }
      }
    ]
  }
}
```

**Key points:**

- `agentId` is required on every agent block; the previous "optional for external" allowance is gone. Backfill any prior client that omitted it for `external` findings.
- `agentName` is required only when `agentSource` is `"external"`; do not send it for `velt` agents.
- Setting `type: "suggestion"` at the annotation level plus an `agent` block on `commentData[0]` is the canonical shape for an agent finding. The annotation-level `type` is the source of truth for the suggestion classification; the legacy `commentType: "suggestion"` no longer drives it.
- `reason` is required, and inside it `title`, `description`, and `severity` are required.

### GET Response Shapes

The `/commentannotations/get` and `/commentannotations/comments/get` endpoints return more data than older docs suggested. Bind your consumers to the current shape, not the older one.

**Top-level annotation envelope (returned for each annotation):**

```json
{
  "annotationId": "yourAnnotationId",
  "annotationNumber": 2,
  "annotationIndex": 1,
  "type": "comment",
  "createdAt": 1777973713421,
  "lastUpdated": 1777978714209,
  "hasDraftComments": false,
  "locationId": 5509827173770816,
  "location": {
    "version": { "id": "v1", "name": "Version 1" }
  },
  "context": {
    "access": { "default": "velt" },
    "accessFields": ["default:velt"]
  },
  "visibilityConfig": { "type": "public" },
  "metadata": {
    "apiKey": "yourApiKey",
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "sdkVersion": "5.0.2-beta.45"
  },
  "recorders": [],
  "status": { "id": "OPEN", "name": "Open" },
  "from": { "userId": "user123" },
  "comments": [ /* see below */ ]
}
```

Newly-surfaced fields consumers will see at the annotation level: `annotationId`, `annotationNumber`, `annotationIndex`, `hasDraftComments`, `locationId`, `location`, `context.access`, `context.accessFields`, `visibilityConfig`, `metadata`, `recorders`.

**`reactionAnnotationIds` vs. `reactionAnnotations`: both are returned, with different shapes:**

`reactionAnnotationIds` is a flat array of strings (bare IDs). `reactionAnnotations` is a parallel array of full reaction objects. Pick the one matching your consumer.

**Incorrect:** Treating `reactionAnnotations` as a bare ID array (it changed shape: it is now an array of objects, not strings).

```typescript
// WRONG: older shape, no longer accurate
const ids: string[] = comment.reactionAnnotations; // type error at runtime
```

**Correct:** Each entry in `reactionAnnotations` is a full reaction object:

```json
{
  "annotationId": "reactionAnnotationId1",
  "type": "reaction",
  "icon": "RAISED_HANDS",
  "commentAnnotationId": "yourAnnotationId",
  "locationId": 5509827173770816,
  "location": { "version": { "id": "v1", "name": "Version 1" } },
  "context": {
    "access": { "default": "velt" },
    "accessFields": ["default:velt"]
  },
  "lastUpdated": 1777978712656,
  "fromUsers": [
    {
      "lastUpdated": 1777978709472,
      "from": { "userId": "user123", "name": "John Doe", "email": "john.doe@example.com" }
    }
  ]
}
```

If you only need IDs (e.g. to fan out a follow-up fetch), read `reactionAnnotationIds`. If you need icon, who reacted (`fromUsers`), or when (`lastUpdated`), read `reactionAnnotations`.

**Response field notes (per the docs page):**

- `viewedBy` is **not** currently returned by `/commentannotations/get` or `/commentannotations/comments/get`. Do not depend on it being present.
- Annotation and reaction timestamps are **milliseconds since epoch** (e.g. `1777973713421`). On individual comments the docs state ISO 8601, and the documented sample shows a numeric `createdAt` next to an ISO `lastUpdated` (`"2026-05-05T09:35:15.048Z"`). Accept both a number and an ISO string when parsing comment timestamps.
- `hasDraftComments` is a boolean indicating whether the annotation contains any draft comments.
- `context.access` / `context.accessFields` are access-control metadata (e.g. `{ "default": "velt" }`).
- Legacy `from` keys (`userSnippylyId`, `clientOrganizationId`, `clientGroupId`) are gone from documented example payloads on both `/v2/commentannotations/get` and `/v2/commentannotations/comments/get` (and from every nested `from` block, including reaction `fromUsers[].from`). Do not parse or depend on them; use `userId`, `organizationId`, and `groupId` on the `from` object instead.

**Key points:**

- Annotation-level envelope now exposes `annotationId`, `annotationNumber`, `annotationIndex`, `hasDraftComments`, `locationId`, `location`, `context.*`, `visibilityConfig`, `metadata`, `recorders` directly.
- `reactionAnnotationIds` (strings) and `reactionAnnotations` (objects) are both returned; they are different shapes, not aliases.
- The `null` sentinel inside `data` indicates a requested ID that did not exist; check for it before dereferencing.
- Mixed timestamp formats: ms-epoch on annotations/reactions; comment timestamps can be ISO 8601 strings, so parse both forms.
- `from` blocks no longer include `userSnippylyId`, `clientOrganizationId`, or `clientGroupId`; use `userId`, `organizationId`, `groupId`.

**Verification Checklist:**
- [ ] Using POST method for all endpoints, with both `x-velt-api-key` and `x-velt-auth-token` headers
- [ ] Add requests send `commentAnnotations[]` with `commentData[]` items that carry a `from` user (no `annotation`, `comments`, or `commenterId` keys)
- [ ] Update requests send changes in `updatedData` and narrow the target with `annotationIds` (or `commentIds` for comments)
- [ ] `organizationId` and `documentId` are present in every request body
- [ ] Annotation IDs use the correct singular/plural form per endpoint; comment IDs are numbers
- [ ] Advanced queries are enabled before calling `/v2/commentannotations/get`
- [ ] Consumer binds to `reactionAnnotationIds` (strings) or `reactionAnnotations` (objects), not both interchangeably
- [ ] Timestamp parsing accepts ms-epoch numbers and ISO 8601 strings
- [ ] `null` entries inside `result.data` are handled (missing IDs)
- [ ] No code depends on `viewedBy` being present on GET responses
- [ ] Every `agent` block includes a non-empty `agentId`, for both `velt` and `external` sources
- [ ] `agentName` is present whenever `agentSource` is `"external"`
- [ ] `reason.title`, `reason.description`, and `reason.severity` are set on every agent block
- [ ] `agentSource: "velt"` callers handle `NOT_FOUND` on unknown `agentId` values; `agentSource: "external"` callers understand `agentId` is never validated
- [ ] Delete requests that use `agentId` / `agentSuggestions` / `agentUrls` gate on workspace advanced queries (else the call fails `NOT_FOUND` rather than widening the delete)
- [ ] `agentUrls` on delete requests are sanitized; blank or fragment-only URLs trigger `INVALID_ARGUMENT`
- [ ] Consumers of `from` blocks do not read `userSnippylyId`, `clientOrganizationId`, or `clientGroupId`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations - "Add Comment Annotations"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2 - "Get Comment Annotations"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/update-comment-annotations - "Update Comment Annotations"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/delete-comment-annotations - "Delete Comment Annotations"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-count - "Get Comment Annotations Count"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/add-comments - "Add Comments"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments - "Get Comments"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments - "Update Comments"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/delete-comments - "Delete Comments"
