# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core (core)

**Impact:** CRITICAL
**Description:** Foundational concepts for the Velt proxy-server setup. Covers when and why to put a reverse proxy in front of Velt, the six service hosts the SDK talks to (`cdnHost`, `apiHost`, `v1DbHost`, `v2DbHost`, `storageHost`, `authHost`), and the authentication requirement that VeltProvider's `authProvider` prop is used for identity (not the deprecated `useIdentify` hook).

---

## 2. SDK Config (sdk-config)

**Impact:** CRITICAL
**Description:** The `proxyConfig` SDK-side configuration object that points Velt at your proxy hosts. Includes the React / Next.js form (`proxyConfig` prop on `VeltProvider`), the non-React form (`proxyConfig` field on `initVelt()`), and the Subresource Integrity (SRI) hash check for verifying the proxied SDK bundle.

---

## 3. Server Setup (server-setup)

**Impact:** HIGH
**Description:** Per-host nginx reverse-proxy configurations. Covers the CDN host (static SDK delivery), the API host (REST traffic), the persistence DB host (Firestore proxy), the ephemeral DB host (WebSocket + host-lock for realtime), the storage host (Firebase Storage / S3-compat), and the auth host (`identitytoolkit` + `securetoken`).

---

## 4. Security (security)

**Impact:** HIGH
**Description:** Content Security Policy (CSP) whitelist directives required for Velt traffic, and the `forceLongPolling` fallback for environments where the ephemeral-DB proxy can't pass WebSocket upgrade requests.

---

## 5. Debugging (debugging)

**Impact:** MEDIUM
**Description:** Verification checklist for confirming a proxy setup is routing all six hosts correctly, plus common-issue diagnostics for proxy failures.
