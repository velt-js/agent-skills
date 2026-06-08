---
name: velt-node-sdk-best-practices
description: Velt Node SDK (`@veltdev/node`) implementation patterns for Node.js / TypeScript backends. Use whenever the user is writing server-side code that integrates with Velt — initializing `VeltSDK`, calling `sdk.api.*` (REST API services like Organizations, Documents, Comment Annotations, etc.) or `sdk.selfHosting.*` (MongoDB+S3 self-hosted services like Comments, Reactions, Attachments), generating JWT auth tokens for the frontend SDK from Node, configuring MongoDB or AWS S3 for self-hosting, handling the SDK's typed error classes (`VeltSDKError`, `VeltDatabaseError`, `VeltValidationError`, `VeltTokenError`, `VeltApiError`), debugging response-envelope mismatches between the two backends, or shipping Node code that talks to Velt in any way. Triggers on any mention of `@veltdev/node`, `VeltSDK`, `sdk.api`, `sdk.selfHosting`, Velt server-side Node.js, MongoDB-backed Velt storage, or env-var auth (`VELT_API_KEY` / `VELT_AUTH_TOKEN`) — even if the user doesn't say "Node SDK" explicitly.
license: MIT
metadata:
  author: velt
  version: "0.2.0"
---

# Velt Node SDK Best Practices

Implementation guide for `@veltdev/node`. The SDK has two independent backends that share the same `VeltSDK` instance but differ in initialization requirements, lazy-load patterns, and response shapes — most bugs stem from blurring that line.

## When to Apply

- Initializing `VeltSDK.initialize(...)` in a Node service
- Calling any method under `sdk.api.*` or `sdk.selfHosting.*`
- Generating Velt auth tokens server-side (`getToken`) for the frontend
- Configuring MongoDB or AWS S3 for self-hosting
- Catching and discriminating SDK errors
- Debugging "result.success is undefined" / "is not a function" / "cannot find module mongodb" symptoms

## The two-backend mental model

`sdk.api.*` is a thin typed wrapper over the Velt REST API. No database needed; service instances are available synchronously after init.

`sdk.selfHosting.*` is a server-side persistence layer that requires `database` config; service instances are lazy-loaded via `await sdk.selfHosting.getXxx()` and cached.

The two return **different response envelopes** — that's the single highest-impact thing to internalize:

| Backend | Success envelope | Failure |
|---|---|---|
| `sdk.api.*` | `{ result: { status: 'success', message, data, ... } }` | Throws `VeltApiError` |
| `sdk.selfHosting.*` | `{ success: true, statusCode: 200, data }` | `{ success: false, statusCode, error, errorCode }` (or throws `VeltSDKError` subclass) |

## Rule Categories

| Priority | Category | Impact | Prefix |
|---|---|---|---|
| 1 | Initialization & lifecycle | CRITICAL | `init-` |
| 2 | sdk.api.* (REST backend) | HIGH | `api-` |
| 3 | sdk.selfHosting.* (MongoDB + S3) | HIGH | `selfhost-` |
| 4 | Cross-cutting pitfalls | MEDIUM | `pitfalls-` |

## Quick Reference

### 1. Initialization & lifecycle
- `init-dual-mode` — Pick the right `VeltSDK.initialize` shape (REST-only vs self-hosting) and wire `await sdk.close()` on shutdown

### 2. sdk.api.* (REST backend)
- `api-envelope-and-services` — Use the `{ result: { status, data } }` envelope; service-by-service method index for all 17 namespaces; `organizationId` is required on every method

### 3. sdk.selfHosting.* (MongoDB + S3)
- `selfhost-lazy-load-and-services` — Lazy-load with `await sdk.selfHosting.getXxx()`; flat envelope with `success` + `errorCode`; per-service method index for all 7 services
- `selfhost-attachments-positional` — `saveAttachment(request, fileBuffer?, fileName?, mimeType?)` mixes a request object with positional file args; `getAttachment(orgId, attachmentId)` is purely positional

### 4. Cross-cutting pitfalls
- `pitfalls-token-and-envelopes` — `getToken` is positional on both backends; `sdk.selfHosting.token` is a sync property (no `getToken` loader); error classes (`VeltSDKError` + 4 subclasses) discriminate via `instanceof`

## How to Use

Read the relevant rule based on what you're writing. The `pitfalls-token-and-envelopes` rule is worth reading even for unfamiliar tasks — it captures the highest-density "things that silently do the wrong thing".

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules (start here)
- `AGENTS.full.md` — Full verbose guide
