---
name: velt-rest-apis-best-practices
description: "Velt REST API v2 and webhook best practices for server-side integration. Use when calling Velt REST API v2 endpoints, generating JWT tokens for frontend authentication, handling Velt webhooks (comment events, huddle events, CRDT updates), managing users/documents/organizations via REST, or implementing server-side Velt operations. Triggers on any task involving Velt REST API, JWT token generation for Velt, Velt webhooks, x-velt-api-key headers, or server-side comment/notification/activity management — even if the user doesn't explicitly say 'REST API'. For the Python SDK (velt-py) for self-hosting, see velt-self-hosting-data-best-practices instead."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt REST APIs Best Practices

Comprehensive guide for Velt REST API v2, JWT authentication, and webhooks. Contains 14 rules across 5 categories covering setup, Python SDK modules, REST API endpoints, webhook handling, and debugging.

## When to Apply

Reference these guidelines when:
- Setting up the Velt Python SDK (velt-py) with Django, Flask, or FastAPI
- Calling Velt REST API v2 endpoints from your backend
- Generating JWT tokens for frontend user authentication
- Handling Velt webhook events (comments, huddles, CRDT)
- Managing users, documents, organizations, or folders server-side
- Building backend routes for self-hosted Velt data
- Implementing GDPR data export or deletion

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Python SDK | HIGH-MEDIUM | `python-` |
| 3 | REST API | HIGH-MEDIUM | `rest-` |
| 4 | Webhooks | HIGH-MEDIUM | `webhooks-` |
| 5 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### Core Setup (CRITICAL)
- `core-python-sdk-setup` — Install velt-py, initialize with MongoDB/S3 config
- `core-rest-api-auth` — x-velt-api-key + x-velt-auth-token headers for all REST calls
- `core-jwt-tokens` — Generate JWT tokens for frontend auth, 48h expiry, refresh flow

### Python SDK (HIGH-MEDIUM)
- `python-comments` — getComments, saveComments, deleteComment via SDK
- `python-attachments` — S3 upload/delete for file attachments
- `python-users-reactions` — getUsers, reactions CRUD
- `python-frameworks` — Django, Flask, FastAPI integration examples

### REST API (HIGH-MEDIUM)
- `rest-comments` — Comment annotation + comment CRUD endpoints
- `rest-users` — Add/get/update/delete users, GDPR data operations
- `rest-documents-orgs` — Document, organization, folder management
- `rest-notifications` — Notification add/get/update/delete + config
- `rest-activities-crdt` — Activity logs + CRDT data endpoints

### Webhooks (HIGH-MEDIUM)
- `webhooks-basic` — v1 setup, event types, payload format, security
- `webhooks-advanced` — v2/Svix enterprise webhooks, retries, transformations

### Debugging (LOW-MEDIUM)
- `debug-common-issues` — Troubleshooting backend integration issues

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
