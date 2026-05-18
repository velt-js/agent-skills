---
title: Initialize VeltSDK in the right mode and wire shutdown
impact: CRITICAL
impactDescription: Wrong init mode → `sdk.selfHosting.*` methods throw at call time; missing shutdown → MongoDB pool leaks across serverless restarts
tags: VeltSDK.initialize, dual-mode, env-vars, apiKey, authToken, database, sdk.close, SIGTERM, mongodb, peer-deps
---

## Initialize VeltSDK in the right mode and wire shutdown

`VeltSDK.initialize()` has two valid shapes. Picking the wrong one isn't a compile error — it shows up later as runtime failures.

**Install** — `@veltdev/node` alone is enough for REST-only. Add `mongodb ^6` if you'll call any `sdk.selfHosting.*` method, and `@aws-sdk/client-s3 ^3` if any `saveAttachment` call will pass a file buffer. Node.js 18+.

```bash
npm install @veltdev/node
npm install mongodb              # only if using sdk.selfHosting.*
npm install @aws-sdk/client-s3   # only if uploading attachments to S3
```

**REST-only init** (no MongoDB needed — just `sdk.api.*`):

```ts
import { VeltSDK } from '@veltdev/node';

const sdk = VeltSDK.initialize({
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});
```

**Full self-hosting init** (required for `sdk.selfHosting.*`):

```ts
const sdk = VeltSDK.initialize({
  database: {
    connection_string: 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db',
    // Or host/username/password/auth_database/database_name; connection_string takes precedence.
  },
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});
```

The `database` section is the toggle: include it = `sdk.selfHosting.*` works AND a MongoDB pool opens. Omit it = `sdk.selfHosting.*` throws at call time.

**Env vars override config keys.** `VELT_API_KEY`, `VELT_AUTH_TOKEN`, `VELT_WORKSPACE_ID`, `VELT_WORKSPACE_AUTH_TOKEN`, and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_S3_BUCKET_NAME` / `AWS_S3_ENDPOINT_URL`. Prefer env vars in production.

**Shutdown — always wire `await sdk.close()`** when `database` is configured. The MongoDB connection pool stays open for the lifetime of the SDK instance; without a shutdown hook, pools leak across serverless restarts and eventually exhaust your cluster's connection limit.

```ts
process.on('SIGTERM', async () => {
  await sdk.close();
  process.exit(0);
});
```

Initialize the SDK once at module scope, not per-request. In Next.js API routes / Vercel Functions, the platform recycles workers — still wire SIGTERM for clean local-dev shutdowns.

**Verification:**
- [ ] `database` is included if any `sdk.selfHosting.*` call exists in the codebase
- [ ] `database` is omitted (or you accept the wasted pool) if only `sdk.api.*` is used
- [ ] `apiKey` + `authToken` come from env vars in production
- [ ] `await sdk.close()` is wired to SIGTERM whenever `database` is configured
- [ ] `mongodb` and `@aws-sdk/client-s3` are in `dependencies` if the relevant code path runs

**Source Pointer:** `backend-sdks/node.mdx` (Installation; Quick Start → Initialize/Shutdown; Configuration → Environment Variables)
