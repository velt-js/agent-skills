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

## 6. Debugging (debug)

**Impact:** LOW-MEDIUM
**Description:** Monitoring and troubleshooting data provider events using the SDK subscription API.
