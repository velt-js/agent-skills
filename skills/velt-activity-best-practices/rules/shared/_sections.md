# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup required for any Velt activity log implementation. Activity Logs must be enabled in the Velt Console before any SDK or REST API calls will work.

---

## 2. Data Access (data)

**Impact:** HIGH
**Description:** Patterns for subscribing to real-time activity feeds and creating custom activity records. Includes React hooks (useAllActivities, useActivityUtils) and SDK APIs (getAllActivities, createActivity via getActivityElement).

---

## 3. Configuration (config)

**Impact:** MEDIUM
**Description:** Configuration options for activity log behavior. Includes CRDT debounce time to control edit batching frequency, immutability toggle for compliance audit trails, and action type constant filtering for type-safe feed scoping.

---

## 4. REST API (rest)

**Impact:** LOW-MEDIUM
**Description:** Server-side activity log management via REST API. Covers Get, Add, Update, and Delete endpoints for programmatic access from backend services.

---

## 5. Debugging & Testing (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns and verification checklists for Velt activity log integrations.
