---
title: Initialize VeltSDK in the right mode and wire shutdown
impact: CRITICAL
impactDescription: A database block without its driver fails at initialize(); no database block makes every sdk.selfHosting.* call throw; missing shutdown leaks the connection pool
tags: VeltSDK.initialize, dual-mode, rest-only, env-vars, apiKey, authToken, database, database.type, mongodb, postgresql, pg, sdk.close, SIGTERM, peer-deps, VeltDatabaseError
---

## Initialize VeltSDK in the right mode and wire shutdown

`VeltSDK.initialize()` has two valid shapes. Since `@veltdev/node` 2.0.0 the `database` block is optional, and the SDK checks its driver at startup, so picking the wrong shape fails either at `initialize()` or at the first `sdk.selfHosting.*` call.

**Install.** The core package carries no database driver. `mongodb` and `pg` are optional peer dependencies; install only the one you self-host on. Node.js 18+.

```bash
npm install @veltdev/node                 # REST API backend only
npm install @veltdev/node mongodb         # + self-hosting on MongoDB (MongoDB 6+, mongodb ^6)
npm install @veltdev/node pg              # + self-hosting on PostgreSQL (PostgreSQL 14+, pg ^8.16)
npm install @aws-sdk/client-s3            # only if attachments go to S3
npm install jose@^5                       # only for the built-in JWT/JWKS verifyToken path
```

**Incorrect (1.x habits that break on 2.x):**

```ts
// WRONG: a placeholder database block "just to satisfy initialize()" when you only call sdk.api.*.
// On 2.x the driver is checked at initialize(): without `mongodb` installed this throws
// "MongoDB support requires 'npm install mongodb'".
const sdk = VeltSDK.initialize({
  database: { host: 'localhost:27017', database_name: 'unused' },
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});

// WRONG: a database type the SDK does not know. Throws at initialize().
VeltSDK.initialize({ database: { type: 'mysql', connection_string: '...' } });
```

**Correct (REST-only, no database block):**

```ts
import { VeltSDK } from '@veltdev/node';

const sdk = VeltSDK.initialize({
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});

const result = await sdk.api.organizations.getOrganizations({ organizationIds: ['org-123'] });
```

On an SDK initialized without `database`, every `sdk.selfHosting.*` method throws a `VeltDatabaseError` saying a `database` block is required.

**Correct (self-hosting on MongoDB or PostgreSQL):**

```ts
const sdk = VeltSDK.initialize({
  database: {
    // MongoDB is the default type. A connection string alone is enough;
    // the database name comes from its path.
    connection_string: 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db',

    // PostgreSQL instead:
    // type: 'postgresql',
    // connection_string: 'postgresql://user:pass@host:5432/velt',
  },
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});
```

- `type` is `'mongodb'` (default) or `'postgresql'`. Every `sdk.selfHosting.*` method behaves the same on both. See `selfhost-postgresql-backend` for PostgreSQL-only options.
- MongoDB also accepts individual fields (`host`, `username`, `password`, `auth_database`, `database_name`, optional `use_srv`). `database_name` overrides the database named in `connection_string` on both backends.
- `pool_min_size` (default 1) and `pool_max_size` (default 5) apply to both backends and are validated at `initialize()`.

**Environment variables.** `VELT_API_KEY` and `VELT_AUTH_TOKEN` can replace `apiKey` / `authToken` in the config object. `VELT_WORKSPACE_ID` and `VELT_WORKSPACE_AUTH_TOKEN` scope workspace operations. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`, and `AWS_S3_ENDPOINT_URL` (MinIO or another custom endpoint) configure S3 attachments. Prefer env vars in production.

**Shutdown.** Call `await sdk.close()` when the process exits to release the database connection pool. Initialize the SDK once at module scope, not per request. A second SDK instance pointed at a different database throws at its first `sdk.selfHosting.*` call unless the first instance was closed with `await sdk.close()`.

```ts
process.on('SIGTERM', async () => {
  await sdk.close();
  process.exit(0);
});
```

Both ES module (`import { VeltSDK } from '@veltdev/node'`) and CommonJS (`require('@veltdev/node')`) entry points ship; on 2.0.0 the ESM import loads on every supported Node version, including Node 18 and Node 20 before 20.19.

**Verification:**
- [ ] REST-only services initialize without a `database` block (no placeholder config)
- [ ] `database` is present whenever any `sdk.selfHosting.*` call exists, and its driver (`mongodb` or `pg`) is in `dependencies`
- [ ] `database.type` is omitted (MongoDB) or exactly `'postgresql'`
- [ ] `apiKey` and `authToken` come from env vars or a secret store in production
- [ ] `await sdk.close()` runs on shutdown, and only one SDK instance per database is kept alive
- [ ] `@aws-sdk/client-s3` is installed if any attachment upload goes to S3

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#installation - "Installation" and "Upgrading from 1.x"
- https://docs.velt.dev/backend-sdks/node#quick-start - "Initialize the SDK", "Shutdown"
- https://docs.velt.dev/backend-sdks/node#self-hosting-configuration - "Database"
- https://docs.velt.dev/release-notes/version-5/velt-node-changelog - "2.0.0"
