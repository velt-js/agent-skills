---
name: velt-rest-apis-best-practices
description: "Velt REST API v2 and webhook best practices for server-side integration. Use when calling Velt REST API v2 endpoints, generating JWT tokens for frontend authentication, handling Velt webhooks (comment events, huddle events, CRDT updates), managing users/documents/organizations via REST, or implementing server-side Velt operations. Triggers on any task involving Velt REST API, JWT token generation for Velt, Velt webhooks, x-velt-api-key headers, or server-side comment/notification/activity management — even if the user doesn't explicitly say 'REST API'. For the Python SDK (velt-py) for self-hosting, see velt-self-hosting-data-best-practices instead."
license: MIT
metadata:
  author: velt
  version: "1.0.1"
---

# Velt REST APIs Best Practices

Comprehensive guide for Velt REST API v2, JWT authentication, and webhooks. Contains 10 rules across 4 categories covering core setup, REST API endpoints, webhook handling, and debugging.

## When to Apply

Reference these guidelines when:
- Calling Velt REST API v2 endpoints from your backend
- Generating JWT tokens for frontend user authentication
- Handling Velt webhook events (comments, huddles, CRDT)
- Managing users, documents, organizations, or folders server-side
- Implementing GDPR data export or deletion

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | REST API | HIGH | `rest-` |
| 3 | Webhooks | MEDIUM | `webhooks-` |
| 4 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### Core Setup (CRITICAL)
- `core-rest-api-auth` — x-velt-api-key + x-velt-auth-token headers for all REST calls
- `core-jwt-tokens` — Generate JWT tokens for frontend auth, 48h expiry, refresh flow

### REST API (HIGH)
- `rest-comments` — Comment annotation + comment CRUD endpoints
- `rest-users` — Add/get/update/delete users, GDPR data operations
- `rest-documents-orgs` — Document, organization, folder management
- `rest-notifications` — Notification add/get/update/delete + config
- `rest-activities-crdt` — Activity logs + CRDT data endpoints
- `rest-approval-engine` — pointer (Approval Engine is now its own skill: see `velt-approval-engine-best-practices`)

### Webhooks (MEDIUM)
- `webhooks-basic` — v1 setup, event types, payload format, security
- `webhooks-advanced` — v2/Svix enterprise webhooks, retries, transformations

### Debugging (LOW-MEDIUM)
- `debug-common-issues` — Troubleshooting backend integration issues

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
