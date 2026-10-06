# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Foundational requirements for every server-side Velt integration. Covers the REST auth contract (API-key-level `x-velt-api-key` + `x-velt-auth-token` vs. workspace-level `x-velt-workspace-id` + `x-velt-workspace-auth-token`, the `{ data }` request wrapper, and the `result` / `error` response envelope) and JWT generation with `/v2/auth/generate_token` (permissions resources, `accessRole`, 48h expiry, `authProvider` refresh) plus the permissions endpoints. Get these wrong and every subsequent call fails.

---

## 2. REST API Endpoints (rest-api)

**Impact:** HIGH
**Description:** CRUD patterns for the Velt REST API v2 surface: comment annotations and comments, notifications and per-user notification config, users and GDPR data operations, organizations / documents / folders / user groups / domains (with per-item `code` partial-failure handling), activity logs / CRDT data / live state, workspace and API key provisioning (production keys, data residency regions), advanced webhook management, review agents (CRUD and versions, async executions with page lists and multi-agent runs, built-in agents and per-run options, groups and prompt tools), and Memory (search / ask / suggest / judgments, knowledge ingestion, insights and alerts), plus the Approval Engine pointer. All endpoints are POST under `https://api.velt.dev/v2`; endpoint paths and payload shapes are verbatim.

---

## 3. Webhooks (webhooks)

**Impact:** MEDIUM
**Description:** Inbound webhook handling for comment, huddle, CRDT, recorder, and workflow events. Covers basic webhooks (`Basic` auth token header, action types, base64 encoding, RSA-wrapped AES payload encryption, private-comment `accessDeniedUsers`) and advanced Svix webhooks (dot-notation event types, HMAC-SHA256 signature verification, retries, transformations). Payload shape is versioned; never silently upgrade a basic example to the advanced format.

---

## 4. Debugging (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting for common backend integration failures: mismatched auth header pairs, missing advanced-queries prerequisite, bulk document partial failures, expired JWT tokens, agent status misreads, Memory response-shape and scoping mistakes, and webhooks that never arrive.
