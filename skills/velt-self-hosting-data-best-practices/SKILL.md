---
name: velt-self-hosting-data-best-practices
description: Velt self-hosting patterns. Partial self-hosting keeps comments, attachments, reactions, recordings, notifications, activity, and user PII on your infrastructure through VeltProvider dataProviders (endpoint or function based), with backend routes, resolver auth, and the velt-py Python SDK on MongoDB or PostgreSQL. Also distinguishes full self-hosting (the whole Velt stack on your own GCP project) and its config.selfHosted wiring. Use for data providers, resolvers, or self-hosted Velt.
license: MIT
metadata:
  author: velt
  version: "1.1.0"
---

# Velt Self-Hosting Data Best Practices

Comprehensive implementation guide for Velt self-hosting. Most rules cover **partial self-hosting** (data providers that keep user content and PII on your infrastructure while Velt runs the backend); the Full Self-Hosting category covers running the entire Velt stack in your own cloud project. Contains 27 rules across 9 categories, prioritized by impact to guide automated code generation and integration patterns.

## When to Apply

Reference these guidelines when:
- Storing sensitive user-generated content on your own infrastructure
- Configuring VeltProvider `dataProviders` (or `Velt.setDataProviders`) for comments, attachments, reactions, recordings, notifications, activity, anonymous users, or users
- Choosing between endpoint-based (config) and function-based (custom) data providers
- Building and authenticating backend API routes that handle Velt data provider requests
- Implementing database storage patterns (MongoDB, PostgreSQL) for Velt data, by hand or with the `velt-py` Python SDK
- Uploading attachments to S3 or other object storage via multipart/form-data
- Debugging data provider events with the dataProvider subscription
- Deciding between partial and full self-hosting, or wiring an app to a full self-hosted deployment with `config.selfHosted`

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Comment Data Provider | HIGH | `comment-` |
| 3 | Attachment Data Provider | HIGH | `attachment-` |
| 4 | Additional Providers | MEDIUM | `provider-` |
| 5 | Backend Implementation | MEDIUM | `backend-` |
| 6 | Data Types | MEDIUM | `data-` |
| 7 | Python SDK | HIGH | `python-` |
| 8 | Debugging | LOW-MEDIUM | `debug-` |
| 9 | Full Self-Hosting | HIGH | `full-` |

## Quick Reference

### 1. Core Setup (CRITICAL)

- `core-provider-setup` - Configure VeltProvider dataProviders prop with correct initialization order and provider keys (`recorder`, not `recording`)
- `core-response-format` - Return the required response shape from all data provider handlers
- `core-auth-provider` - Use authProvider on VeltProvider with dataProviders; never call identify()
- `core-python-sdk-setup` - Install `velt-py` with the right extra (`[mongodb]` / `[postgres]`) and initialize REST-only or self-hosting

### 2. Comment Data Provider (HIGH)

- `comment-endpoint-provider` - Use endpoint-based config for the comment data provider, with async `headers` and `credentials`
- `comment-function-provider` - Use function-based comment data provider for full control; opt into non-core save events with `additionalSaveEvents`

### 3. Attachment Data Provider (HIGH)

- `attachment-multipart-provider` - Handle attachment uploads with multipart/form-data

### 4. Additional Providers (MEDIUM)

- `provider-user-resolver` - Implement read-only user data provider for PII protection (function vs endpoint contracts differ)
- `provider-reaction-recording` - Configure reaction and recorder data providers and their request shapes
- `provider-recorder` - Self-host recording data and media files
- `provider-notification` - Self-host notification data for custom notifications
- `provider-activity` - Self-host activity log data; `fieldsToRemove` applies to all feature types
- `provider-retry-timeout` - Configure retry policies and timeouts per data provider; `additionalFields` vs `fieldsToRemove` support matrix

### 5. Backend Implementation (MEDIUM)

- `backend-api-routes` - Structure backend API routes for data provider endpoints with the correct body shapes
- `backend-verify-resolver-auth` - Authenticate resolver endpoints with `sdk.selfHosting.verifyToken` (Node or Python) before touching data
- `backend-database-patterns` - Implement database storage with upsert and proper indexing
- `backend-s3-attachments` - Store and delete attachments in S3-compatible object storage

### 6. Data Types (MEDIUM)

- `data-types-reference` - Self-hosting provider interfaces, config, and request/response type reference (the SDK to backend contract)

### 7. Python SDK (HIGH)

- `python-rest-api-backend` - Use sdk.api.* for REST API operations without a database: documented services, Python method names, `filter_unknown_fields`, agent filters, workflow edges
- `python-comments` - Comments CRUD via sdk.selfHosting.comments with `from_dict` and pass-through responses
- `python-attachments` - Attachment upload (multipart) and delete via sdk.selfHosting.attachments with S3
- `python-users-reactions` - Users (`getUsers`, `resolveUserIdsByEmail`) and reactions via sdk.selfHosting, and the v0.1.12 `user` to `from_` rename
- `python-frameworks` - Django, Flask, and FastAPI integration patterns
- `python-token` - Generate frontend auth tokens via sdk.api.accessControl.generateToken

### 8. Debugging (LOW-MEDIUM)

- `debug-data-provider-events` - Monitor data provider events for troubleshooting

### 9. Full Self-Hosting (HIGH)

- `full-vs-partial-self-hosting` - Pick partial (data providers) or full (whole stack on your GCP project) self-hosting first; key full self-hosting constraints
- `full-selfhosted-sdk-config` - Wire the app with the generated `selfHosted` config, `strict: true`, `proxyDomain`, and a pinned `version`

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-provider-setup.md
rules/shared/comment/comment-endpoint-provider.md
rules/shared/full/full-vs-partial-self-hosting.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Source pointers to official documentation

## Compiled Documents

- `AGENTS.md` - Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` - Full verbose guide with all rules expanded inline
