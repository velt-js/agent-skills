---
name: velt-self-hosting-data-best-practices
description: Velt self-hosting data implementation patterns and best practices for React, Next.js, and web applications. Use when storing sensitive user-generated content (comments, attachments, reactions, recordings, user PII) on your own infrastructure instead of Velt servers, implementing data providers (endpoint-based or function-based), building backend API routes, or debugging data provider events.
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Self-Hosting Data Best Practices

Comprehensive implementation guide for Velt's self-hosting data feature in React and Next.js applications. Contains 12 rules across 6 categories, prioritized by impact to guide automated code generation and integration patterns.

## When to Apply

Reference these guidelines when:
- Storing sensitive user-generated content on your own infrastructure
- Configuring VeltProvider dataProviders prop for comments, attachments, reactions, recordings, or users
- Choosing between endpoint-based (config) and function-based (custom) data providers
- Building backend API routes to handle Velt data provider requests
- Implementing database storage patterns (MongoDB, PostgreSQL) for Velt data
- Uploading attachments to S3 or other object storage via multipart/form-data
- Debugging data provider events with the dataProvider subscription
- Migrating from Velt-hosted storage to self-hosted storage

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Comment Data Provider | HIGH | `comment-` |
| 3 | Attachment Data Provider | HIGH | `attachment-` |
| 4 | Additional Providers | MEDIUM | `provider-` |
| 5 | Backend Implementation | MEDIUM | `backend-` |
| 6 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### 1. Core Setup (CRITICAL)

- `core-provider-setup` — Configure VeltProvider dataProviders prop with correct initialization order
- `core-response-format` — Return the required response shape from all data provider handlers

### 2. Comment Data Provider (HIGH)

- `comment-endpoint-provider` — Use endpoint-based config for comment data provider
- `comment-function-provider` — Use function-based comment data provider for full control

### 3. Attachment Data Provider (HIGH)

- `attachment-multipart-provider` — Handle attachment uploads with multipart/form-data

### 4. Additional Providers (MEDIUM)

- `provider-user-resolver` — Implement read-only user data provider for PII protection
- `provider-reaction-recording` — Configure reaction and recording data providers
- `provider-retry-timeout` — Configure retry policies and timeouts per data provider

### 5. Backend Implementation (MEDIUM)

- `backend-api-routes` — Structure backend API routes for data provider endpoints
- `backend-database-patterns` — Implement database storage with upsert and proper indexing
- `backend-s3-attachments` — Store and delete attachments in S3-compatible object storage

### 6. Debugging (LOW-MEDIUM)

- `debug-data-provider-events` — Monitor data provider events for troubleshooting

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-provider-setup.md
rules/shared/comment/comment-endpoint-provider.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Source pointers to official documentation

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
