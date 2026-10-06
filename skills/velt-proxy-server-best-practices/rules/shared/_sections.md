# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core (core)

**Impact:** CRITICAL
**Description:** Foundational concepts for the Velt proxy-server setup. Covers when and why to put a reverse proxy in front of Velt, the six service hosts the SDK talks to (`cdnHost`, `apiHost`, `v1DbHost`, `v2DbHost`, `storageHost`, `authHost`) and their upstreams, and authenticating with the `authProvider` object (`user` + `generateToken`) alongside `proxyConfig`.

---

## 2. SDK Config (sdk-config)

**Impact:** CRITICAL
**Description:** The `proxyConfig` SDK-side configuration object that points Velt at your proxy hosts. Includes the React / Next.js form (`proxyConfig` inside the `config` prop on `VeltProvider`), the non-React form (`proxyConfig` field on `initVelt()`), and the Subresource Integrity (SRI) hash check for verifying the proxied SDK bundle.

---

## 3. Server Setup (server-setup)

**Impact:** HIGH
**Description:** Reverse-proxy deployment on Cloudflare Workers (one Worker per service) and nginx, based on the `velt-js/velt-proxy-server` recipes. Covers the auth host (path-based `securetoken` / `identitytoolkit` routing), the persistence DB host (`firestore.googleapis.com`), the ephemeral DB host (WebSocket, `?ns=` dynamic upstream, host-lock), the storage host (`firebasestorage.googleapis.com`), and generic passthroughs for the CDN and API hosts.

---

## 4. Security (security)

**Impact:** HIGH
**Description:** Content Security Policy (CSP) whitelist directives required for Velt traffic, and the `forceLongPolling` fallback for environments where the ephemeral-DB proxy can't pass WebSocket upgrade requests.

---

## 5. Debugging (debugging)

**Impact:** MEDIUM
**Description:** Verification checklist for confirming a proxy setup is routing all six hosts correctly, plus common-issue diagnostics for proxy failures.
