# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Foundational requirements for every server-side Velt integration. Covers JWT token generation for frontend authentication (signing key, 48h expiry, refresh flow) and the mandatory REST API auth contract — every request must include both `x-velt-api-key` and `x-velt-auth-token` headers. Get these wrong and every subsequent call fails.

---

## 2. REST API Endpoints (rest-api)

**Impact:** HIGH
**Description:** CRUD patterns for the Velt REST API v2 surface — comment annotations and comments, notifications and notification config, users (add / get / update / delete plus GDPR data operations), documents / organizations / folders, activity logs / CRDT documents, and the Approval Engine (14 `/v2/workflow/` endpoints covering definitions, executions, and steps). All endpoints are POST and use the `https://api.velt.dev/v2` base URL; endpoint identity is verbatim (path and version prefix matter). Includes request and response shape guidance, including the GET response envelope (annotation-level fields, expanded `reactionAnnotations` objects vs. `reactionAnnotationIds`, timestamp formats), idempotency guidance for execution dispatch, and webhook signature verification patterns.

---

## 3. Webhooks (webhooks)

**Impact:** MEDIUM
**Description:** Inbound webhook event handlers for comment events, huddle events, and CRDT updates. Covers v1 webhook setup (basic) and v2 / Svix enterprise webhooks (advanced) with retries, transformations, and signature verification. Payload shape is versioned — never silently upgrade a v1 example to v2 prose.

---

## 4. Debugging (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting for common backend integration failures — missing or swapped auth headers, expired JWT tokens, wrong endpoint version prefix, webhook signature mismatch, and response-shape drift after API updates.
