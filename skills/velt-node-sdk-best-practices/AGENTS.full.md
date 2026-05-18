# Velt Node Sdk Best Practices

**Version 0.1.0**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Lean v0.1.0 draft. Implementation guide for the Velt Node SDK (@veltdev/node) covering its two backends — sdk.api.* (REST API, 17 services) and sdk.selfHosting.* (MongoDB + S3 self-hosted, 7 services + token) — with emphasis on the highest-impact differentiation: the two response envelopes, the lazy-load pattern for self-hosting services, the positional-arg surprise on getToken/getAttachment/saveAttachment, and the typed error class hierarchy. To be expanded based on eval results.

---

## Table of Contents

1. [Initialization & lifecycle](#1-initialization-lifecycle) — **CRITICAL**
   - 1.1 [Initialize VeltSDK in the right mode and wire shutdown](#11-initialize-veltsdk-in-the-right-mode-and-wire-shutdown)

4. [Cross-cutting pitfalls](#4-cross-cutting-pitfalls) — **MEDIUM**
   - 4.1 [getToken is positional, token service is sync, errors are typed classes](#41-gettoken-is-positional-token-service-is-sync-errors-are-typed-classes)

---

## 1. Initialization & lifecycle

**Impact: CRITICAL**

`VeltSDK.initialize(...)` shape (REST-only vs full self-hosting with `database`), env-var auth (`VELT_API_KEY` / `VELT_AUTH_TOKEN` / `VELT_WORKSPACE_*` / `AWS_*`), peer-dep requirements (`mongodb ^6` for self-hosting, `@aws-sdk/client-s3 ^3` for S3 attachments), Node 18+ runtime, and the `await sdk.close()` shutdown contract that releases the MongoDB pool. Get this wrong and either methods throw at runtime or pools leak across serverless cold starts.

### 1.1 Initialize VeltSDK in the right mode and wire shutdown

**Impact: CRITICAL (Wrong init mode → `sdk.selfHosting.*` methods throw at call time; missing shutdown → MongoDB pool leaks across serverless restarts)**

`VeltSDK.initialize()` has two valid shapes. Picking the wrong one isn't a compile error — it shows up later as runtime failures.

**Install** — `@veltdev/node` alone is enough for REST-only. Add `mongodb ^6` if you'll call any `sdk.selfHosting.*` method, and `@aws-sdk/client-s3 ^3` if any `saveAttachment` call will pass a file buffer. Node.js 18+.

Reference: `backend-sdks/node.mdx` (Installation; Quick Start → Initialize/Shutdown; Configuration → Environment Variables)

---

## 4. Cross-cutting pitfalls

**Impact: MEDIUM**

The traps that don't fit cleanly into one backend: `getToken` is positional on both backends; `sdk.selfHosting.token` is a synchronous property (no loader); typed error class discrimination via `instanceof`; envelope-confusion symptoms (`result.success is undefined` etc).

### 4.1 getToken is positional, token service is sync, errors are typed classes

**Impact: MEDIUM-HIGH (Wrong getToken shape returns undefined token; wrong envelope check silently misreads results; untyped catch loses structured error info)**

Three cross-cutting traps that come up across both backends.

### 1. `getToken` is positional on BOTH backends

Signature: `getToken(organizationId: string, userId: string, email?: string, isAdmin?: boolean)`.

Reference: `backend-sdks/node.mdx` (Self-Hosting Backend → Token; REST API Backend → Token; Error Handling)

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/backend-sdks/node
- https://docs.velt.dev/api-reference/sdk/models/data-models
- https://www.npmjs.com/package/@veltdev/node
