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

---

## PartialReactionAnnotation Model (v0.1.12)

`PartialReactionAnnotation` is the Python dataclass that resolvers emit when handing a reaction-annotation payload to your DB. Import it from `velt_py.models.reaction`. Starting in **v0.1.12**, the reaction-author field is `from_` (wire key `from`), replacing the former `user` field — aligning with the velt-sdk contract and `PartialCommentAnnotation`.

```python
from velt_py.models.reaction import PartialReactionAnnotation
from velt_py.models.user import PartialUser

@dataclass
class PartialReactionAnnotation:
    annotationId: str
    metadata: Optional[BaseMetadata] = None
    icon: Optional[str] = None
    from_: Optional[PartialUser] = None             # 'from' on the wire; from_ avoids the Python keyword. Replaces the former 'user' field.
    extra_fields: Optional[Dict[str, Any]] = None   # Catch-all for customer-configured custom keys.
```

**Field notes:**

- `from_` — Python alias for the JSON key `from` (reserved keyword); serialized as `from`. Replaces the former `user` field (renamed in v0.1.12 to match the velt-sdk contract and the comment models).
- `icon` — the emoji code carried in the partial payload (e.g. `'+1'`).
- `extra_fields` — catch-all because the frontend contract includes `[key: string]: any` for customer-configured custom keys.

---

## v0.1.12 Rename: `user` → `from_` (Wire: `from`) on PartialReactionAnnotation

In v0.1.12 the reaction-author field on `PartialReactionAnnotation` was renamed from `user` to `from_`. The wire key on the serialized document is now `from` (matching `PartialCommentAnnotation`). Construction with `user=` no longer works — call sites must pass `from_=`. Reads remain backward-compatible: `from_dict()` accepts either the canonical `from` key or the legacy `user` key (`from` wins when both are present) and populates `from_`. `to_dict()` always emits `from`. No data migration is required for reaction documents already stored under `user`.

**Incorrect (v0.1.11-style construction; breaks on v0.1.12):**

```python
from velt_py.models.reaction import PartialReactionAnnotation
from velt_py.models.user import PartialUser

# `user=` is no longer a valid constructor kwarg in v0.1.12 — raises TypeError
ann = PartialReactionAnnotation(
    annotationId='r-1',
    icon='+1',
    user=PartialUser(userId='u-1'),
)
ann.to_dict()  # would have emitted {'user': {...}} pre-v0.1.12
```

**Correct (v0.1.12 — use `from_=`, serializes as `from`):**

```python
from velt_py.models.reaction import PartialReactionAnnotation
from velt_py.models.user import PartialUser

ann = PartialReactionAnnotation(
    annotationId='r-1',
    icon='+1',
    from_=PartialUser(userId='u-1'),
)
ann.to_dict()['from']  # {'userId': 'u-1'}  — serialized as `from`
```

**Correct (backward-compatible reads — legacy `user` documents still resolve):**

```python
# Legacy document stored under the old `user` key still resolves:
ann = PartialReactionAnnotation.from_dict({
    'annotationId': 'r-1',
    'icon': '+1',
    'user': {'userId': 'u-legacy'},
})
ann.from_.userId         # 'u-legacy'
ann.to_dict()['from']    # {'userId': 'u-legacy'}  (re-serialized as `from`)
```

**Key points:**

- Construction: only `from_=` works on v0.1.12. `user=` raises `TypeError`.
- Serialization (`to_dict()`): always emits `from`. Existing readers that key off `user` must be updated when they ingest newly-written documents.
- Deserialization (`from_dict()`): accepts both `from` and `user`. `from` wins when both are present. This is the back-compat hatch for documents already in your DB — no migration required.
- Attribute access: the field is exposed in Python as `from_` (with the trailing underscore), because `from` is a Python keyword.
- The rename aligns `PartialReactionAnnotation` with `PartialCommentAnnotation`, where the author field has long been `from_` / wire `from`.

**Verification:**
- [ ] All `PartialReactionAnnotation(...)` constructors use `from_=`, not `user=`
- [ ] Any consumer that reads `ann.user` is updated to read `ann.from_`
- [ ] Any consumer that reads `to_dict()['user']` is updated to read `to_dict()['from']`
- [ ] `from_dict()` paths are left as-is — they already accept the legacy `user` key
- [ ] `velt-py` is pinned to `>= 0.1.12`

**Source Pointer:** `https://docs.velt.dev/backend-sdks/python` (### `PartialReactionAnnotation`)
