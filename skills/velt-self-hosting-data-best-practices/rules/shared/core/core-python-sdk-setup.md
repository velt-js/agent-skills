---
title: Install and Initialize the Velt Python SDK
impact: CRITICAL
impactDescription: Without proper SDK initialization, all backend operations will fail
tags: python, sdk, setup, initialization, mongodb, s3
---

## Install and Initialize the Velt Python SDK

The `velt-py` package provides two independent backends: `sdk.selfHosting.*` for self-hosting Velt data in your own MongoDB + S3, and `sdk.api.*` for calling Velt's REST APIs directly with no database required. MongoDB config is only needed for `sdk.selfHosting.*`.

Do not use the old class-based `VeltSdk(VeltSdkConfig(...))` pattern — it no longer exists. The correct entry point is always `VeltSDK.initialize({...})` with a config dict.

**Install the package:**

```bash
pip install velt-py
```

**Correct (REST API only — no database needed):**

```python
from velt_py import VeltSDK

# Minimal config for sdk.api.* services only
sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN'
})

# All sdk.api.* services are now available
result = sdk.api.organizations.getOrganizations(...)
```

**Correct (self-hosting with MongoDB connection string):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'connection_string': 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db'
    }
})
```

**Correct (self-hosting with individual MongoDB fields and S3):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'host': 'localhost:27017',
        'username': 'db_user',
        'password': 'db_password',
        'auth_database': 'admin',
        'database_name': 'velt-db'
    },
    'aws': {
        'bucket_name': 'velt-attachments',
        'region': 'us-east-1',
        'access_key_id': 'AKIA...',
        'secret_access_key': 'secret...'
    }
})
```

**Correct (production pattern using environment variables):**

```python
import os
from velt_py import VeltSDK

# The SDK reads VELT_API_KEY and VELT_AUTH_TOKEN automatically from the environment.
# Pass an empty dict (or omit apiKey/authToken) when env vars are set.
sdk = VeltSDK.initialize({})
```

**Environment variable support:**

The SDK reads the following environment variables automatically:

| Variable | Config key equivalent | Purpose |
|----------|-----------------------|---------|
| `VELT_API_KEY` | `apiKey` | Velt API key for authenticating REST API calls |
| `VELT_AUTH_TOKEN` | `authToken` | Velt auth token for authenticating REST API calls |
| `VELT_WORKSPACE_ID` | — | Default workspace ID for workspace-scoped operations |
| `VELT_WORKSPACE_AUTH_TOKEN` | — | Auth token scoped to a specific workspace |

**Key points:**

- `database` config is optional — only required when using `sdk.selfHosting.*`.
- `sdk.api.*` works with just `apiKey` and `authToken` (or the equivalent env vars).
- MongoDB config accepts either `connection_string` OR the individual fields (`host`, `username`, `password`, `auth_database`, `database_name`) — never both.
- `aws` config is only required if you use attachment features with `sdk.selfHosting.*`.
- Store credentials in environment variables, never hardcode them.

**Verification:**
- [ ] `velt-py` is installed and importable
- [ ] `VeltSDK.initialize({...})` is called with a config dict (not `VeltSdk(VeltSdkConfig(...))`)
- [ ] `database` config is included only when using `sdk.selfHosting.*`
- [ ] API key and auth token are loaded from environment variables or passed in the config dict
- [ ] `aws` config is included if `sdk.selfHosting.attachments.*` is used

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python - Velt Python SDK overview and quick start

---

## Error Codes Reference

All `sdk.selfHosting.*` methods return consistent error responses when operations fail:

```python
# Error response format
{
    'success': False,
    'statusCode': 400,       # or 500, 404
    'error': 'Description of what went wrong',
    'errorCode': 'INVALID_INPUT'   # or INTERNAL_ERROR, NOT_FOUND
}
```

| Error Code | Status Code | Description |
|------------|-------------|-------------|
| `INVALID_INPUT` | 400 | Malformed request data — check required fields |
| `NOT_FOUND` | 404 | Resource not found — verify IDs |
| `INTERNAL_ERROR` | 500 | Server-side error — retry or contact support |

**Python exception classes for `sdk.api.*`:**

The SDK raises typed exceptions for `sdk.api.*` calls. All exceptions extend `VeltSDKError`.

| Exception | When raised |
|-----------|-------------|
| `VeltSDKError` | Base class; catch for any SDK-level error |
| `VeltValidationError` | SDK-level validation (e.g., missing required config); `sdk.api.*` methods do not validate request payloads locally |
| `VeltTokenError` | Token generation or authentication failure |
| `VeltApiError` | REST API errors (network failures, unexpected responses) |

**Correct (exception handling for sdk.api.* calls):**

```python
from velt_py import VeltSDK
from velt_py.exceptions import VeltSDKError, VeltValidationError, VeltTokenError, VeltApiError

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN'
})

try:
    result = sdk.api.organizations.getOrganizations(...)
except VeltValidationError as e:
    # Request dataclass had invalid or missing fields
    print('Validation error:', e)
except VeltTokenError as e:
    # apiKey or authToken is invalid or expired
    print('Auth error:', e)
except VeltApiError as e:
    # Velt API returned a non-2xx response
    print('API error:', e)
except VeltSDKError as e:
    # Catch-all for any other SDK error
    print('SDK error:', e)
```

---

## Custom Collection Names

Map Velt data to custom MongoDB collection names if your database has existing naming conventions:

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'connection_string': 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db',
    },
    'collections': {
        'comments': 'velt_comment_annotations',
        'reactions': 'velt_reactions',
        'users': 'app_users',
        'attachments': 'velt_attachments',
    }
})
```

---

## User Schema Field Mapping

Map your database's user fields to Velt's expected field names:

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'connection_string': 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db',
    },
    'user_schema': {
        'userId': '_id',           # Your DB field for user ID
        'name': 'display_name',   # Your DB field for user name
        'email': 'email_address', # Your DB field for email
        'photoUrl': 'avatar_url', # Your DB field for avatar
    }
})
```

This mapping ensures the SDK can resolve user data from your existing user collection without requiring schema changes.
