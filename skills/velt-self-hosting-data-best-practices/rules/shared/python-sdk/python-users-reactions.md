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
from velt_py import GetUserResolverRequest

request = GetUserResolverRequest(
    organization_id="org_123"
)

response = sdk.selfHosting.users.getUsers(request)

# response is a plain dict with camelCase keys
if response['success']:
    users = response['data']
    for user in users:
        print(f"User: {user['userId']} - {user['email']}")
else:
    print(f"Error: {response['error']}")
```

**Correct (get reactions):**

```python
from velt_py import GetReactionResolverRequest

request = GetReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456"
)

response = sdk.selfHosting.reactions.getReactions(request)

if response['success']:
    reactions = response['data']
    print(f"Found {len(reactions)} reactions")
```

**Correct (save reactions):**

```python
from velt_py import SaveReactionResolverRequest

request = SaveReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    reactions=[
        {
            "reactionId": "reaction_1",
            "emoji": "thumbsup",
            "userId": "user_789"
        }
    ]
)

response = sdk.selfHosting.reactions.saveReactions(request)

if response['success']:
    print("Reactions saved")
```

**Correct (delete reaction):**

```python
from velt_py import DeleteReactionResolverRequest

request = DeleteReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    reaction_id="reaction_1"
)

response = sdk.selfHosting.reactions.deleteReaction(request)

if response['success']:
    print("Reaction deleted")
```

**Available request type imports:**

```python
from velt_py import (
    GetUserResolverRequest,
    GetReactionResolverRequest,
    SaveReactionResolverRequest,
    DeleteReactionResolverRequest
)
```

**Key points:**

- All methods require typed request objects, not raw dictionaries.
- `getUsers` only needs `organization_id`. Reaction methods need `organization_id` and `document_id` — there is no `comment_id` field on any reaction request type.
- `saveReactions` accepts a `reactions` list for batch operations.
- `deleteReaction` requires `reaction_id` only (no `comment_id`).
- `VeltSelfHostingResponse` is a plain Python dict — use `response['success']`, `response['data']`, `response['errorCode']` (not attribute access).
- Always check `response['success']` before accessing `response['data']`.

**Verification:**
- [ ] Request types are imported from `velt_py`
- [ ] Typed request objects are passed, not raw dicts
- [ ] Reaction requests use `organization_id` and `document_id` only (no `comment_id`)
- [ ] Response is accessed as a dict: `response['success']`, `response['data']`, `response['errorCode']`
- [ ] Error handling uses `response['error']` and `response['errorCode']`

**Source Pointer:** `https://docs.velt.dev/api-reference/sdk/python/users` (## Python SDK > ### Users & Reactions)
