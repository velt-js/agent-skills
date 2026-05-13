# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup patterns for enabling self-hosted data storage with Velt. Includes VeltProvider dataProviders prop configuration, initialization ordering constraints, setDocuments compatibility requirement, and the mandatory response format for all provider handlers.

---

## 2. Comment Data Provider (comment)

**Impact:** HIGH
**Description:** Two approaches for routing comment CRUD operations through your own infrastructure. The endpoint-based approach provides URL configs and lets the SDK handle HTTP requests with automatic retry. The function-based approach gives full control via resolver functions for custom data flow logic.

---

## 3. Attachment Data Provider (attachment)

**Impact:** HIGH
**Description:** Attachment uploads use multipart/form-data encoding, not JSON. This is the critical difference from all other data providers. Covers both endpoint-based and function-based approaches for attachment save and delete operations.

---

## 4. Additional Providers (provider)

**Impact:** MEDIUM
**Description:** User, reaction, and recording data providers. User provider is read-only (get only) for PII protection. Reaction and recording providers support full CRUD following the same pattern as comments. All providers share retry and timeout configuration options.

---

## 5. Backend Implementation (backend)

**Impact:** MEDIUM
**Description:** Server-side patterns for handling data provider requests. Covers API route structure, database storage with upsert operations and indexing, and S3-compatible object storage for attachments.

---

## 6. Data Types (data)

**Impact:** MEDIUM
**Description:** Reference for the TypeScript shapes a data provider hands to / receives from the SDK — comment payloads, attachment uploads, reaction records, recording metadata, user contacts. Documents the contract between the SDK and your backend so provider responses don't drift from the SDK's expected shapes.

---

## 7. Python SDK (python-sdk)

**Impact:** HIGH
**Description:** Patterns for implementing data-provider backends in Python using the `velt-py` SDK. Covers the `sdk.api.*` REST API backend (no database required), comments / attachments / users / reactions self-hosting handlers, framework integrations (FastAPI / Flask / Django), and the same response-format contract the JS SDK enforces. Use when your provider backend is Python rather than Node.

**Rules:**
- `python-rest-api-backend` — Use sdk.api.* for REST API operations without a database
- `python-comments` — Comments CRUD via sdk.selfHosting.comments
- `python-attachments` — Attachment upload and delete via sdk.selfHosting.attachments with S3
- `python-users-reactions` — Users and reactions management via sdk.selfHosting.users/reactions
- `python-frameworks` — Django, Flask, and FastAPI integration patterns

---

## 8. Debugging (debug)

**Impact:** LOW-MEDIUM
**Description:** Monitoring and troubleshooting data provider events using the SDK subscription API.
