---
title: Install and Initialize the Velt Python SDK
impact: CRITICAL
impactDescription: A missing database extra fails at initialize(), and a database block on a REST-only service is unnecessary
tags: python, sdk, setup, initialization, velt-py, extras, mongodb, postgresql, s3, collections, user_schema, exceptions
---

## Install and Initialize the Velt Python SDK

The `velt-py` package exposes two independent backends: `sdk.selfHosting.*` stores Velt data in your own MongoDB or PostgreSQL (plus S3 for attachments), and `sdk.api.*` calls Velt's REST APIs with no database. Since 0.2.0 the core install carries no database driver; install the extra for the database you self-host on.

The entry point is always `VeltSDK.initialize({...})` with a config dict. The old class-based `VeltSdk(VeltSdkConfig(...))` pattern does not exist.

**Install:**

```bash
pip install velt-py                # REST API backend only
pip install 'velt-py[mongodb]'     # + self-hosting on MongoDB (MongoDB 6+)
pip install 'velt-py[postgres]'    # + self-hosting on PostgreSQL (PostgreSQL 14+)
pip install 'velt-py[auth]'        # optional: built-in JWT/JWKS path of verifyToken
```

**Incorrect (0.1.x habits):**

```python
# requirements.txt
velt-py            # WRONG for MongoDB self-hosting on 0.2.x: pymongo is no longer installed.
                   # initialize() fails with: MongoDB support requires: pip install "velt-py[mongodb]"
```

**Correct (REST API only, no database):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
})
# All sdk.api.* services are available. Calling a self-hosting resolver on this
# instance returns a clear error saying a 'database' block is required.
```

**Correct (self-hosting on MongoDB or PostgreSQL, plus S3):**

```python
import os
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'database': {
        # MongoDB (default type): connection string, or host/username/password/auth_database/database_name
        'connection_string': os.environ['VELT_MONGODB_URI'],
        # PostgreSQL instead:
        # 'type': 'postgresql',
        # 'connection_string': 'postgresql://user:pass@host:5432/velt',
        # 'sslmode': 'verify-full', 'sslrootcert': '/path/to/ca.pem',  # for any non-local database
    },
    'aws': {  # only needed for attachments
        'bucket_name': os.environ['AWS_S3_BUCKET'],
        'region': os.environ.get('AWS_REGION', 'us-east-1'),
        'access_key_id': os.environ['AWS_ACCESS_KEY_ID'],
        'secret_access_key': os.environ['AWS_SECRET_ACCESS_KEY'],
    },
    'apiKey': os.environ['VELT_API_KEY'],
    'authToken': os.environ['VELT_AUTH_TOKEN'],
})
```

**Environment variables.** `VELT_API_KEY` and `VELT_AUTH_TOKEN` can replace `apiKey` / `authToken`; `VELT_WORKSPACE_ID` and `VELT_WORKSPACE_AUTH_TOKEN` scope workspace operations.

**PostgreSQL notes.** Every `sdk.selfHosting.*` method behaves the same on both backends. Each collection is a table with one JSONB `data` column. With `manage_schema: True` (default) the SDK creates the schema, tables, and indexes on first connection, so the role needs `CREATE`; for locked-down roles set `'manage_schema': False` and apply DDL from `velt_py.database.connection.postgres_schema_sql(Config({...}))`. The default `sslmode: prefer` never verifies the certificate. Multi-process servers (gunicorn, uWSGI) open one pool per worker; under uWSGI use `--enable-threads`. `database_name` overrides the database in the connection string; `pool_min_size` / `pool_max_size` apply to both backends. The SDK does not migrate data between MongoDB and PostgreSQL.

**Custom collection (table) names and user field mapping:**

```python
sdk = VeltSDK.initialize({
    'database': {'connection_string': os.environ['VELT_MONGODB_URI']},
    'collections': {
        'comments': 'comment_annotations',    # defaults shown
        'reactions': 'reaction_annotations',
        'attachments': 'attachments',
        'users': 'users',
    },
    'user_schema': {
        'userId': '_id',            # your DB field for user ID
        'name': 'display_name',
        'email': 'email_address',
        'photoUrl': 'avatar_url',
        # also: 'color', 'textColor', 'isAdmin', 'initial'
    },
})
```

**Error handling.** `sdk.selfHosting.*` returns `{'success': False, 'statusCode': 400 | 404 | 500, 'error': '...', 'errorCode': 'INVALID_INPUT' | 'NOT_FOUND' | 'INTERNAL_ERROR'}` on failure. `sdk.api.*` returns a dict with either `result` or `error`, and raises typed exceptions that all extend `VeltSDKError`:

| Exception | When raised |
|-----------|-------------|
| `VeltSDKError` | Base class for any SDK-level error |
| `VeltValidationError` | SDK-level validation such as missing required config; `sdk.api.*` does not validate request payloads locally |
| `VeltTokenError` | Token generation or authentication failure |
| `VeltApiError` | REST API errors (network failures, unexpected responses) |

```python
from velt_py.exceptions import VeltSDKError, VeltValidationError, VeltTokenError, VeltApiError

try:
    result = sdk.api.organizations.getOrganizations(request)
except VeltApiError as e:
    print(f'API error: {e.message}')
except VeltSDKError as e:
    print(f'SDK error: {e.message}')
```

**Verification:**
- [ ] `velt-py[mongodb]` or `velt-py[postgres]` is in requirements whenever a `database` block is configured
- [ ] `VeltSDK.initialize({...})` is called once with a config dict (not `VeltSdk(VeltSdkConfig(...))`)
- [ ] REST-only services omit the `database` block
- [ ] `aws` uses `bucket_name`, `region`, `access_key_id`, `secret_access_key` and is present when attachments are self-hosted
- [ ] Remote PostgreSQL uses `sslmode: 'verify-full'` with `sslrootcert`
- [ ] Credentials come from environment variables or a secret store

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#installation - "Installation", "Upgrading from 0.1.x"
- https://docs.velt.dev/backend-sdks/python#self-hosting-configuration - Database, AWS, Collections, User Schema
- https://docs.velt.dev/backend-sdks/python#error-handling - "Error Handling"
- https://docs.velt.dev/release-notes/version-5/velt-py-changelog - "v0.2.0"
