---
title: Comments CRUD Operations via Python SDK
impact: HIGH
impactDescription: Incorrect request types or response handling causes silent data loss or failed queries
tags: python, comments, crud, self-hosting
---

## Comments CRUD Operations via Python SDK

The Python SDK provides methods to get, save, and delete comments through the `sdk.selfHosting.comments` namespace. Each method requires its own request type.

**Incorrect (passing raw dicts instead of request objects):**

```python
# This will fail — methods require typed request objects
comments = sdk.selfHosting.comments.getComments({
    "organizationId": "org_123",
    "documentId": "doc_456"
})
```

**Correct (get comments):**

```python
from velt import GetCommentResolverRequest

request = GetCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456"
)

response = sdk.selfHosting.comments.getComments(request)

if response.success:
    comments = response.data
    print(f"Retrieved {len(comments)} comments")
else:
    print(f"Error {response.error_code}: {response.error}")
```

**Correct (save comments):**

```python
from velt import SaveCommentResolverRequest

request = SaveCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comments=[
        {
            "commentId": "comment_1",
            "body": "This needs review",
            "userId": "user_789",
            "timestamp": 1700000000000
        }
    ]
)

response = sdk.selfHosting.comments.saveComments(request)

if response.success:
    print(f"Saved successfully, status: {response.status_code}")
```

**Correct (delete comment):**

```python
from velt import DeleteCommentResolverRequest

request = DeleteCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_id="comment_1"
)

response = sdk.selfHosting.comments.deleteComment(request)

if response.success:
    print("Comment deleted")
```

**Response format:**

```python
# Success response
# response.success == True
# response.status_code == 200
# response.data == [...]  (for get) or confirmation (for save/delete)

# Error response
# response.success == False
# response.error == "Comment not found"
# response.error_code == 404
```

**Key points:**

- Always import the correct request type: `GetCommentResolverRequest`, `SaveCommentResolverRequest`, `DeleteCommentResolverRequest`.
- `organization_id` and `document_id` are required for all comment operations.
- Check `response.success` before accessing `response.data` — failed requests populate `response.error` and `response.error_code` instead.
- The save method accepts a list of comments, allowing batch operations.

**Verification:**
- [ ] Request types are imported from `velt`
- [ ] Typed request objects are used, not raw dicts
- [ ] `organization_id` and `document_id` are provided
- [ ] Response `success` field is checked before accessing `data`
- [ ] Error responses are handled with `error` and `error_code`

**Source Pointer:** `https://docs.velt.dev/api-reference/sdk/python/comments` (## Python SDK > ### Comments)

---

## All Request Type Imports

Every SDK method uses a typed request object. Import from the `velt` package:

```python
from velt import (
    # Comments
    GetCommentResolverRequest,
    SaveCommentResolverRequest,
    DeleteCommentResolverRequest,
    # Reactions
    GetReactionResolverRequest,
    SaveReactionResolverRequest,
    DeleteReactionResolverRequest,
    # Users
    GetUserResolverRequest,
    # Attachments
    SaveAttachmentResolverRequest,
    DeleteAttachmentResolverRequest,
)
```

| Module | Request Type | SDK Method |
|--------|-------------|------------|
| Comments | `GetCommentResolverRequest` | `sdk.selfHosting.comments.getComments()` |
| Comments | `SaveCommentResolverRequest` | `sdk.selfHosting.comments.saveComments()` |
| Comments | `DeleteCommentResolverRequest` | `sdk.selfHosting.comments.deleteComment()` |
| Reactions | `GetReactionResolverRequest` | `sdk.selfHosting.reactions.getReactions()` |
| Reactions | `SaveReactionResolverRequest` | `sdk.selfHosting.reactions.saveReactions()` |
| Reactions | `DeleteReactionResolverRequest` | `sdk.selfHosting.reactions.deleteReaction()` |
| Users | `GetUserResolverRequest` | `sdk.selfHosting.users.getUsers()` |
| Attachments | `SaveAttachmentResolverRequest` | `sdk.selfHosting.attachments.saveAttachment()` |
| Attachments | `DeleteAttachmentResolverRequest` | `sdk.selfHosting.attachments.deleteAttachment()` |
