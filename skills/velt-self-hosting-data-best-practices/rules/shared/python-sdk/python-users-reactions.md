---
title: Users and Reactions Management via Python SDK
impact: MEDIUM
impactDescription: Incorrect request types prevent user lookups and reaction sync
tags: python, users, reactions, self-hosting
---

## Users and Reactions Management via Python SDK

The Python SDK provides methods to manage users and reactions through `sdk.selfHosting.users` and `sdk.selfHosting.reactions`. Each operation uses a typed request object.

**Incorrect (missing request type imports):**

```python
# This will throw an error — request types are required
users = sdk.selfHosting.users.getUsers({
    "organizationId": "org_123"
})
```

**Correct (get users):**

```python
from velt import GetUserResolverRequest

request = GetUserResolverRequest(
    organization_id="org_123"
)

response = sdk.selfHosting.users.getUsers(request)

if response.success:
    users = response.data
    for user in users:
        print(f"User: {user['userId']} - {user['email']}")
else:
    print(f"Error: {response.error}")
```

**Correct (get reactions):**

```python
from velt import GetReactionResolverRequest

request = GetReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_id="comment_1"
)

response = sdk.selfHosting.reactions.getReactions(request)

if response.success:
    reactions = response.data
    print(f"Found {len(reactions)} reactions")
```

**Correct (save reactions):**

```python
from velt import SaveReactionResolverRequest

request = SaveReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_id="comment_1",
    reactions=[
        {
            "reactionId": "reaction_1",
            "emoji": "thumbsup",
            "userId": "user_789",
            "timestamp": 1700000000000
        }
    ]
)

response = sdk.selfHosting.reactions.saveReactions(request)

if response.success:
    print("Reactions saved")
```

**Correct (delete reaction):**

```python
from velt import DeleteReactionResolverRequest

request = DeleteReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_id="comment_1",
    reaction_id="reaction_1"
)

response = sdk.selfHosting.reactions.deleteReaction(request)

if response.success:
    print("Reaction deleted")
```

**Available request type imports:**

```python
from velt import (
    GetUserResolverRequest,
    GetReactionResolverRequest,
    SaveReactionResolverRequest,
    DeleteReactionResolverRequest
)
```

**Key points:**

- All methods require typed request objects, not raw dictionaries.
- `getUsers` only needs `organization_id`. Reaction methods need `organization_id`, `document_id`, and `comment_id`.
- `saveReactions` accepts a list for batch operations.
- Always check `response.success` before accessing `response.data`.

**Verification:**
- [ ] Request types are imported from `velt`
- [ ] Typed request objects are passed, not raw dicts
- [ ] Required fields (`organization_id`, `document_id`, `comment_id`) are provided
- [ ] Response `success` is checked before accessing `data`
- [ ] Error handling covers `response.error` and `response.error_code`

**Source Pointer:** `https://docs.velt.dev/api-reference/sdk/python/users` (## Python SDK > ### Users & Reactions)
