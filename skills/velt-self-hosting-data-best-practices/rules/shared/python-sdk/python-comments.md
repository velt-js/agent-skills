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
from velt_py import GetCommentResolverRequest

request = GetCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456"
)

response = sdk.selfHosting.comments.getComments(request)

# response is a plain dict with camelCase keys
if response['success']:
    comments = response['data']
    print(f"Retrieved {len(comments)} comments")
else:
    print(f"Error {response['errorCode']}: {response['error']}")
```

**Correct (save comments):**

```python
from velt_py import SaveCommentResolverRequest

request = SaveCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_annotations=[
        {
            "annotationId": "annotation_1",
            "commentData": [
                {
                    "commentText": "This needs review",
                    "from": {"userId": "user_789"}
                }
            ]
        }
    ]
)

response = sdk.selfHosting.comments.saveComments(request)

if response['success']:
    print(f"Saved successfully, status: {response.get('statusCode', 200)}")
```

**Correct (delete comment):**

```python
from velt_py import DeleteCommentResolverRequest

request = DeleteCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    annotation_id="annotation_1",
    comment_id=1
)

response = sdk.selfHosting.comments.deleteComment(request)

if response['success']:
    print("Comment deleted")
```

**Response format:**

```python
# VeltSelfHostingResponse is a plain Python dict with camelCase keys

# Success
response = {'success': True, 'statusCode': 200, 'data': {...}}

# Error
response = {'success': False, 'statusCode': 500, 'error': 'Comment not found', 'errorCode': 'INTERNAL_ERROR'}

# Access pattern
if response['success']:
    data = response['data']
else:
    print(f"Error {response['errorCode']}: {response['error']}")

# Safe optional field access
status = response.get('statusCode', 200)
```

**Key points:**

- Always import the correct request type: `GetCommentResolverRequest`, `SaveCommentResolverRequest`, `DeleteCommentResolverRequest`.
- `organization_id` and `document_id` are required for all comment operations.
- `SaveCommentResolverRequest` takes `comment_annotations` (list[dict]), not `comments`.
- `DeleteCommentResolverRequest` requires both `annotation_id` (str) and `comment_id` (int).
- `VeltSelfHostingResponse` is a plain Python dict — use `response['success']`, `response['data']`, `response['errorCode']` (not attribute access).
- Check `response['success']` before accessing `response['data']` — failed requests populate `response['error']` and `response['errorCode']` instead.

**Verification:**
- [ ] Request types are imported from `velt_py`
- [ ] Typed request objects are used, not raw dicts
- [ ] `organization_id` and `document_id` are provided
- [ ] `SaveCommentResolverRequest` uses `comment_annotations=`, not `comments=`
- [ ] `DeleteCommentResolverRequest` includes both `annotation_id` (str) and `comment_id` (int)
- [ ] Response is accessed as a dict: `response['success']`, `response['data']`, `response['errorCode']`

**Source Pointer:** `https://docs.velt.dev/api-reference/sdk/python/comments` (## Python SDK > ### Comments)

---

## All Request Type Imports

Every SDK method uses a typed request object. Import from the `velt` package:

```python
from velt_py import (
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
