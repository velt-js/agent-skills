---
title: Configure the PostgreSQL self-hosting backend safely
impact: HIGH
impactDescription: The default sslmode connects without TLS in Node, and a locked-down role without CREATE fails schema setup at first connection
tags: postgresql, pg, database.type, sslmode, sslrootcert, manage_schema, postgresSchemaSql, schema, collections, pool_min_size, pool_max_size, pool_timeout, JSONB, DatabaseAdapter
---

## Configure the PostgreSQL self-hosting backend safely

`@veltdev/node` 2.0.0 added PostgreSQL as a second self-hosting backend. Set `database.type: 'postgresql'` and install `pg`; every `sdk.selfHosting.*` method then behaves as it does on MongoDB. The traps are TLS defaults, schema permissions, and per-process pools.

**Incorrect (remote database with defaults, app role without CREATE):**

```ts
const sdk = VeltSDK.initialize({
  database: {
    type: 'postgresql',
    connection_string: 'postgresql://app:secret@db.example.com:5432/velt',
    // sslmode defaults to 'prefer', which in Node connects WITHOUT TLS,
    // because node-postgres cannot fall back from TLS to plaintext.
    // manage_schema defaults to true: the first connection runs CREATE statements,
    // which fails if the role has no CREATE privilege on the schema.
  },
});
```

**Correct (verified TLS; schema applied by a migration role):**

```ts
import { VeltSDK, Config, postgresSchemaSql } from '@veltdev/node';

const database = {
  type: 'postgresql' as const,
  connection_string: 'postgresql://app:secret@db.example.com:5432/velt',
  sslmode: 'verify-full',          // libpq names: disable | allow | prefer | require | verify-ca | verify-full
  sslrootcert: '/etc/ssl/velt-ca.pem',
  schema: 'velt',                  // PostgreSQL schema that holds the tables (default 'public')
  manage_schema: false,            // the app role cannot create tables
  pool_max_size: 10,
  pool_timeout: 10,                // seconds a query waits for a pooled connection
};

// One-off, in a migration job: print the DDL for this exact config and run it as a migration role.
console.log(postgresSchemaSql(new Config({ database })));

// Application:
const sdk = VeltSDK.initialize({
  database,
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});
```

**How storage works:**
- One table per collection (`comment_annotations`, `reaction_annotations`, `recorder_annotations`, `notifications`, `activities`, `attachments`, `users`), each with a single JSONB `data` column plus expression indexes on the fields the SDK queries. The `collections` option renames these tables.
- With `manage_schema: true` (default) the SDK creates the schema, tables, and indexes on first connection; the role needs `CREATE` on the schema. Concurrent starts coordinate through a per-schema advisory lock; a process that waits more than 60 seconds skips setup and logs a warning.
- `schema` is unrelated to `user_schema` (which maps user fields).
- `require` encrypts without verifying the certificate (it verifies the CA when `sslrootcert` is set); `verify-ca` and `verify-full` verify it. An unknown `sslmode` fails at `initialize()`.
- Each process opens its own pool, so Node `cluster`, PM2, or several containers open one pool per worker. Size `pool_max_size` against the server's connection limit.
- The SDK does not migrate data between MongoDB and PostgreSQL.

**Direct database access.** `await sdk.selfHosting.database` resolves to the connected `DatabaseAdapter` (`MongoDBAdapter` or `PostgresAdapter`) with `find`, `findOne`, `insertOne`, `updateOne`, `updateMany`, `deleteOne`, and `deleteMany`. Use it for a readiness check or to seed data the resolvers do not write, such as users. Pass collection names as configured in `collections`. On PostgreSQL the adapter supports only the operators the SDK uses: equality, `$in`, `$nin`, `$eq`, `$ne`, `$exists`, and top-level `$and` / `$or`.

```ts
const db = await sdk.selfHosting.database;
await db.insertOne('users', { userId: 'user-1', name: 'John Doe', email: 'john@example.com' });
```

**Verification:**
- [ ] `pg` is installed and `database.type` is `'postgresql'`
- [ ] Any database not on the same host uses `sslmode: 'verify-full'` with `sslrootcert`
- [ ] Either the role has `CREATE` on the schema, or `manage_schema: false` and the `postgresSchemaSql()` output was applied by a migration role
- [ ] `pool_max_size` times the number of worker processes fits the server's connection limit
- [ ] `sdk.selfHosting.database` queries on PostgreSQL use only the supported operators

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#self-hosting-configuration - "Database" (PostgreSQL tab, "How PostgreSQL storage works")
- https://docs.velt.dev/backend-sdks/node#self-hosting-backend - "`sdk.selfHosting.database`"
- https://docs.velt.dev/release-notes/version-5/velt-node-changelog - "2.0.0"
