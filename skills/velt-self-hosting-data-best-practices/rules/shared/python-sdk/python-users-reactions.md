---
title: Users and Reactions Management via Python SDK
impact: MEDIUM
impactDescription: Incorrect request types prevent user lookups and reaction sync
tags: python, users, reactions, self-hosting, from_dict, resolveUserIdsByEmail, ResolveUserIdsByEmailRequest, PartialReactionAnnotation, from_
---

## Users and Reactions Management via Python SDK

`sdk.selfHosting.users` exposes `getUsers` and `resolveUserIdsByEmail`; `sdk.selfHosting.reactions` exposes `getReactions`, `saveReactions`, and `deleteReaction`. As with comments, parse the frontend body with `from_dict`, call the SDK, and return its response dict unchanged.

**Incorrect (raw dicts and re-wrapped responses):**

```python
# WRONG: methods take typed request objects built from the frontend body
users = sdk.selfHosting.users.getUsers({"organizationId": "org_123"})

# WRONG: re-shaping the SDK response drops success/statusCode that the frontend expects
result = sdk.selfHosting.reactions.getReactions(GetReactionResolverRequest.from_dict(body))
return {"reactions": result["data"]}
```

**Correct:**

```python
from velt_py import (
    GetUserResolverRequest,
    GetReactionResolverRequest, SaveReactionResolverRequest, DeleteReactionResolverRequest,
)
from velt_py.models.user import ResolveUserIdsByEmailRequest

def get_users(body: dict) -> dict:
    return sdk.selfHosting.users.getUsers(GetUserResolverRequest.from_dict(body))

def resolve_user_ids_by_email(body: dict) -> dict:
    # Backs the frontend anonymousUser data provider.
    # data is {email: userId}; unmatched emails are absent, repeats de-duplicated,
    # blank or None entries dropped, and user_schema mappings honored.
    return sdk.selfHosting.users.resolveUserIdsByEmail(ResolveUserIdsByEmailRequest.from_dict(body))

def get_reactions(body: dict) -> dict:
    return sdk.selfHosting.reactions.getReactions(GetReactionResolverRequest.from_dict(body))

def save_reactions(body: dict) -> dict:
    return sdk.selfHosting.reactions.saveReactions(SaveReactionResolverRequest.from_dict(body))

def delete_reaction(body: dict) -> dict:
    return sdk.selfHosting.reactions.deleteReaction(DeleteReactionResolverRequest.from_dict(body))
```

**Key points:**

- Users are read-only through the SDK resolvers; seed your users collection (or table) yourself, using the field names mapped in `user_schema`.
- `resolveUserIdsByEmail` is new in v0.1.15; `ResolveUserIdsByEmailRequest` lives in `velt_py.models.user`.
- `VeltSelfHostingResponse` is a plain dict: use `response['success']`, `response['data']`, `response['errorCode']`.
- Return the SDK response to the client as-is so the frontend receives `success`, `statusCode`, and `data`.

**Verification:**
- [ ] Request objects are built with `from_dict(body)` from the unmodified frontend body
- [ ] The anonymous-user provider endpoint calls `resolveUserIdsByEmail`
- [ ] Responses are returned unchanged, with `statusCode` as the HTTP status
- [ ] Reaction code uses `from_` (wire key `from`), never `user` (see below)

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#users - "Users" (getUsers, resolveUserIdsByEmail)
- https://docs.velt.dev/backend-sdks/python#reactions - "Reactions"

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

**Source Pointer:** https://docs.velt.dev/backend-sdks/python#partialreactionannotation - "PartialReactionAnnotation"
