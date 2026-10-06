---
name: velt-rest-apis-best-practices
description: "Velt REST API v2 and webhook best practices for server-side integration. Use when calling Velt REST endpoints, generating JWT tokens, managing users/documents/organizations/notifications, provisioning API keys, running review agents (/v2/agents), querying Memory (/v2/memory), or handling basic and Svix webhooks. Triggers on x-velt-api-key, generate_token, agent executions, memory search/ask, or webhook signatures. For velt-py self-hosting, see velt-self-hosting-data-best-practices."
license: MIT
metadata:
  author: velt
  version: "1.0.10"
---

# Velt REST APIs Best Practices

Comprehensive guide for the Velt REST API v2, JWT authentication, review agents, Memory, and webhooks. Contains 21 rules across 4 categories covering core setup, REST API endpoints, webhook handling, and debugging.

## When to Apply

Reference these guidelines when:
- Calling Velt REST API v2 endpoints from your backend
- Generating JWT tokens for frontend user authentication, or managing permissions
- Managing users, documents, organizations, folders, notifications, activities, or CRDT data server-side
- Provisioning workspaces and API keys (testing vs. production, data residency regions)
- Creating and running review agents, or reading their executions and findings
- Searching or asking Memory, or ingesting knowledge sources
- Handling Velt webhooks (basic or advanced) and verifying signatures
- Implementing GDPR data export or deletion

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | REST API Endpoints | HIGH | `rest-` |
| 3 | Webhooks | MEDIUM | `webhooks-` |
| 4 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### Core Setup (CRITICAL)
- `core-rest-api-auth` - API-key-level vs. workspace-level header pairs, POST + `{ data }` wrapper, response envelope
- `core-jwt-tokens` - `/v2/auth/generate_token` body shape, `authProvider` refresh, permissions add/get/remove, `generate_signature`

### REST API Endpoints (HIGH)
- `rest-comments` - Comment annotation and comment CRUD (`commentAnnotations[]`, `commentData[]`, `updatedData`), agent filters, GET shapes
- `rest-users` - Add/get/update/delete users with request-level scope and `accessRole`, GDPR export and async deletion
- `rest-documents-orgs` - Organizations, documents, folders, user groups, access types, migration, allowed domains
- `rest-documents-partial-failures` - Per-item `code` on bulk document endpoints; v2 500 vs. v1 200 behavior
- `rest-notifications` - Add/get/update/delete notifications, `notifyAll`, resolver mode, per-user config
- `rest-activities-crdt` - Activity logs (`activities[]`, `featureType`), CRDT editor data, live state broadcast
- `rest-workspace-apikey` - Create workspaces and API keys: testing vs. gated production keys, regions, auth tokens, app config
- `rest-advanced-webhooks` - Manage advanced webhooks: config enable, endpoint CRUD, signing-secret retrieval
- `rest-agents` - Agent create/get/update/delete, config blocks, version update merge rules, redacted secrets, versions list/restore
- `rest-agents-execution` - Async runs, statuses, page lists (`urls`), multi-agent `agentIds` runs, run-scope keys, per-run `aiConfig`, list/count
- `rest-agents-builtin-options` - Built-in agent IDs, issue types, per-run `userContext` options, Fix It Everywhere estimate
- `rest-agents-groups-tools` - Agent groups and system groups, prompt tools, config resolve, extract, analytics
- `rest-memory` - Memory search, ask, suggest, and judgments query: scoping, decision values, response shape
- `rest-memory-knowledge` - Knowledge ingest (inline and by reference), status polling, search, rules, update, delete, rate limits
- `rest-memory-insights-alerts` - Reviewer profiles, patterns, stats, and alerts with their caps and quirks
- `rest-approval-engine` - Pointer: Approval Engine (Review Workflow Builder) lives in `velt-approval-engine-best-practices`

### Webhooks (MEDIUM)
- `webhooks-basic` - Basic webhook setup, action types, `Basic` auth header, encoding and encryption, `accessDeniedUsers`
- `webhooks-advanced` - Advanced (Svix) event types, signature verification, retries, transformations

### Debugging (LOW-MEDIUM)
- `debug-common-issues` - Troubleshooting auth, prerequisites, partial failures, agent and Memory misreads, missing webhooks

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-rest-api-auth.md
rules/shared/rest-api/rest-agents-execution.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect example with explanation
- Correct example with explanation
- Source pointers to official documentation

## Compiled Documents

- `AGENTS.md` - Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` - Full verbose guide with all rules expanded inline
