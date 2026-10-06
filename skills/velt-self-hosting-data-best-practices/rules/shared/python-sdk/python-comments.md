---
title: Comments CRUD Operations via Python SDK
impact: HIGH
impactDescription: Re-shaping the frontend payload or the SDK response breaks the data provider contract and silently loses comments
tags: python, comments, crud, self-hosting, from_dict, GetCommentResolverRequest, SaveCommentResolverRequest, DeleteCommentResolverRequest, CommentResolverSaveEvent, targetComment
---

## Comments CRUD Operations via Python SDK

`sdk.selfHosting.comments` exposes `getComments`, `saveComments`, and `deleteComment`. The pattern is always the same: parse the raw JSON body the Velt frontend sent into the typed request with `from_dict`, pass it to the SDK, and return the SDK's response dict to the client unchanged (with its `statusCode` as the HTTP status).

**Incorrect (raw dict to the SDK, hand-built fields, re-wrapped response):**

```python
def get_comments(request):
    body = request.json
    # WRONG: methods take typed request objects, not raw dicts
    result = sdk.selfHosting.comments.getComments(body)
    # WRONG: re-wrapping drops `success` / `statusCode`, which the frontend data provider requires
    return {'comments': result['data']}
```

**Correct (get, save, delete):**

```python
from velt_py import GetCommentResolverRequest, SaveCommentResolverRequest, DeleteCommentResolverRequest

def get_comments(body: dict) -> dict:
    return sdk.selfHosting.comments.getComments(GetCommentResolverRequest.from_dict(body))

def save_comments(body: dict) -> dict:
    save_request = SaveCommentResolverRequest.from_dict(body)
    # Since v0.1.14: event may be a ResolverActions member, a CommentResolverSaveEvent member
    # (when the frontend opted in via additionalSaveEvents), or a raw string.
    # save_request.targetComment is request context only; saveComments never persists it.
    return sdk.selfHosting.comments.saveComments(save_request)

def delete_comment(body: dict) -> dict:
    return sdk.selfHosting.comments.deleteComment(DeleteCommentResolverRequest.from_dict(body))
```

**Response format.** `VeltSelfHostingResponse` is a plain dict with camelCase keys:

```python
{'success': True, 'statusCode': 200, 'data': {...}}
{'success': False, 'statusCode': 400, 'error': '...', 'errorCode': 'INVALID_INPUT'}  # or NOT_FOUND / INTERNAL_ERROR
```

Use dict access (`result['success']`, `result.get('statusCode', 200)`), not attribute access.

**Data models you may touch in custom handlers** (`from velt_py.models import PartialCommentAnnotation, PartialComment, PartialTargetTextRange, BaseMetadata`):
- `PartialCommentAnnotation.from_` is the author (wire key `from`; Python keyword workaround). `assignedTo`, `targetTextRange`, and `resolvedByUserId` are typed fields since v0.1.10.
- `resolvedByUserId` is tri-state: `UNSET` (from `velt_py.models.comment`) means the field was absent and is not written; `None` means the frontend unresolved the annotation and `null` is written.
- `BaseMetadata` keeps `sdkVersion` and `documentMetadata` since v0.1.10.

**Imports:**

```python
from velt_py import (
    GetCommentResolverRequest, SaveCommentResolverRequest, DeleteCommentResolverRequest,
    GetReactionResolverRequest, SaveReactionResolverRequest, DeleteReactionResolverRequest,
    GetUserResolverRequest,
    SaveAttachmentResolverRequest, DeleteAttachmentResolverRequest,
    CommentResolverSaveEvent,
)
from velt_py.models.user import ResolveUserIdsByEmailRequest
```

| Request type | SDK method |
|---|---|
| `GetCommentResolverRequest` | `sdk.selfHosting.comments.getComments()` |
| `SaveCommentResolverRequest` | `sdk.selfHosting.comments.saveComments()` |
| `DeleteCommentResolverRequest` | `sdk.selfHosting.comments.deleteComment()` |
| `GetReactionResolverRequest` | `sdk.selfHosting.reactions.getReactions()` |
| `SaveReactionResolverRequest` | `sdk.selfHosting.reactions.saveReactions()` |
| `DeleteReactionResolverRequest` | `sdk.selfHosting.reactions.deleteReaction()` |
| `GetUserResolverRequest` | `sdk.selfHosting.users.getUsers()` |
| `ResolveUserIdsByEmailRequest` | `sdk.selfHosting.users.resolveUserIdsByEmail()` |
| `SaveAttachmentResolverRequest` | `sdk.selfHosting.attachments.saveAttachment()` |
| `DeleteAttachmentResolverRequest` | `sdk.selfHosting.attachments.deleteAttachment()` |

**Verification:**
- [ ] Every handler builds its request with `<RequestType>.from_dict(body)` from the unmodified frontend body
- [ ] The SDK response dict is returned as-is, with `statusCode` as the HTTP status
- [ ] Save handlers do not persist `targetComment`, and tolerate `event` values beyond `ResolverActions`
- [ ] Custom code distinguishes `UNSET` from `None` for `resolvedByUserId`
- [ ] Every route authenticates the caller first (see `backend-verify-resolver-auth`)

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#comments - "Comments"
- https://docs.velt.dev/backend-sdks/python#data-models - "Data Models" (PartialCommentAnnotation, UNSET Sentinel, SaveCommentResolverRequest)
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltselfhostingresponse - "VeltSelfHostingResponse"
