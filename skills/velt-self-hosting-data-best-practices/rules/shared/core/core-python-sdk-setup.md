---
title: Install and Initialize the Velt Python SDK
impact: CRITICAL
impactDescription: Without proper SDK initialization, all backend operations will fail
tags: python, sdk, setup, initialization, mongodb, s3
---

## Install and Initialize the Velt Python SDK

The `velt-py` package provides server-side access to Velt collaboration features. It requires a MongoDB connection for data storage and optionally supports S3 for attachments.

**Install the package:**

```bash
pip install velt-py
```

**Incorrect (missing required MongoDB config):**

```python
from velt import VeltSdk, VeltSdkConfig

# Missing MongoDB connection — SDK will fail
config = VeltSdkConfig(
    api_key="your_api_key",
    auth_token="your_auth_token"
)
```

**Correct (minimal init with connection string):**

```python
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig

config = VeltSdkConfig(
    api_key="your_api_key",
    auth_token="your_auth_token",
    mongodb=MongoDBConfig(
        connection_string="mongodb+srv://user:pass@cluster.mongodb.net/velt_db"
    )
)

sdk = VeltSdk(config)
```

**Correct (full config with individual MongoDB fields and S3):**

```python
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig, S3Config

config = VeltSdkConfig(
    api_key="your_api_key",
    auth_token="your_auth_token",
    mongodb=MongoDBConfig(
        host="cluster.mongodb.net",
        username="db_user",
        password="db_password",
        auth_database="admin",
        database_name="velt_db"
    ),
    s3=S3Config(
        region="us-east-1",
        access_key="AKIA...",
        secret_key="secret...",
        bucket="velt-attachments"
    )
)

sdk = VeltSdk(config)
```

**Key points:**

- MongoDB config accepts either `connection_string` OR the individual fields (`host`, `username`, `password`, `auth_database`, `database_name`) — never both.
- S3 config is only required if you use attachment features.
- The `api_key` and `auth_token` values come from the Velt console (Configuration > API Key and Configuration > Auth Token).
- Store credentials in environment variables, never hardcode them.

**Correct (production pattern with env vars):**

```python
import os
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig

config = VeltSdkConfig(
    api_key=os.environ["VELT_API_KEY"],
    auth_token=os.environ["VELT_AUTH_TOKEN"],
    mongodb=MongoDBConfig(
        connection_string=os.environ["MONGODB_URI"]
    )
)

sdk = VeltSdk(config)
```

**Verification:**
- [ ] `velt-py` is installed and importable
- [ ] MongoDB connection string or individual fields are provided
- [ ] API key and auth token are set from Velt console
- [ ] Credentials are loaded from environment variables, not hardcoded
- [ ] S3 config is included if attachment features are needed

**Source Pointer:** `https://docs.velt.dev/api-reference/sdk/python/overview` (## Python SDK > ### Installation & Configuration)

---

## Error Codes Reference

All SDK methods return consistent error responses when operations fail:

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

---

## Custom Collection Names

Map Velt data to custom MongoDB collection names if your database has existing naming conventions:

```python
config = VeltSdkConfig(
    database={
        'connection_string': os.environ['MONGODB_URI'],
        'database_name': 'my_app_db',
    },
    collections={
        'comments': 'velt_comment_annotations',
        'reactions': 'velt_reactions',
        'users': 'app_users',
        'attachments': 'velt_attachments',
    },
    api_key=os.environ['VELT_API_KEY'],
    auth_token=os.environ['VELT_AUTH_TOKEN'],
)
```

---

## User Schema Field Mapping

Map your database's user fields to Velt's expected field names:

```python
config = VeltSdkConfig(
    database={
        'connection_string': os.environ['MONGODB_URI'],
        'database_name': 'my_app_db',
    },
    user_schema={
        'userId': '_id',           # Your DB field for user ID
        'name': 'display_name',   # Your DB field for user name
        'email': 'email_address', # Your DB field for email
        'photoUrl': 'avatar_url', # Your DB field for avatar
    },
    api_key=os.environ['VELT_API_KEY'],
    auth_token=os.environ['VELT_AUTH_TOKEN'],
)
```

This mapping ensures the SDK can resolve user data from your existing user collection without requiring schema changes.
