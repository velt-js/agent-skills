# Sections

This file defines all rule categories for velt-setup-best-practices.

---

## 1. Installation (installation/)

**Impact:** CRITICAL
**Description:** Package installation for Velt SDK. Without the correct packages installed, no other Velt functionality will work. Covers @veltdev/react for React/Next.js and @veltdev/client for Angular/Vue/vanilla.

---

## 2. Provider Wiring (provider-wiring/)

**Impact:** CRITICAL
**Description:** VeltProvider component setup and initialization. The VeltProvider must wrap your application for any Velt features to function. Includes framework-specific initialization patterns.

---

## 3. Identity (identity/)

**Impact:** CRITICAL
**Description:** User authentication and identity mapping. Velt requires authenticated users with userId and organizationId. Covers user object shape, authProvider configuration, and JWT token generation.

---

## 4. Document Identity (document-identity/)

**Impact:** CRITICAL
**Description:** Document initialization with setDocuments API. Documents define collaborative spaces where users can interact. SDK will not function without calling setDocument.

---

## 5. Config (config/)

**Impact:** HIGH
**Description:** API keys, environment variables, and security configuration. Includes console.velt.dev setup, domain whitelisting, and auth token security practices.

---

## 6. Project Structure (project-structure/)

**Impact:** MEDIUM
**Description:** Recommended folder organization for Velt-related files. Based on patterns observed in official sample applications. Covers separation of app auth from Velt integration.

---

## 7. Routing Surfaces (routing-surfaces/)

**Impact:** MEDIUM
**Description:** Where and how to mount Velt UI components in your application. Covers the VeltCollaboration wrapper pattern and component placement best practices.

---

## 8. Debugging & Testing (debugging-testing/)

**Impact:** LOW-MEDIUM
**Description:** Setup verification and troubleshooting common configuration errors. Helps identify and fix issues when Velt features don't work as expected.
