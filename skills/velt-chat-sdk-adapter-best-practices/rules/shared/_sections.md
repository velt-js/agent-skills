# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core (core)

**Impact:** CRITICAL
**Description:** Installing `@veltdev/chat-sdk-adapter`, `chat`, and a state adapter; the lazily created server-side `getChat()` singleton; and `createVeltAdapter` options (`botUserId`, `botUserName`, `organizationId`, `resolveUsers`, `webhookVersion`, `webhookSecret`, `selfHostingConfig`) with env-var fallbacks.

---

## 2. Webhook (webhook)

**Impact:** CRITICAL
**Description:** The webhook route on the Node.js runtime with `waitUntil`, the four events to enable in the Webhook Service, and matching `webhookVersion` (Advanced v2 HMAC vs Basic v1) to the configured secret.

---

## 3. Events (events)

**Impact:** HIGH
**Description:** `onNewMention` with `thread.subscribe()` and `thread.post()` (including streamed AI replies), `onSubscribedMessage` with `isMention` filtering, and `onReaction`.

---

## 4. Users (users)

**Impact:** HIGH
**Description:** A stable, unique `botUserId` and matching `botUserName` to avoid reply loops, and index-aligned `resolveUsers` results.

---

## 5. Reactions (reactions)

**Impact:** MEDIUM
**Description:** Reading reactions on any plan, and writing them only through `selfHostingConfig.reactionsService` backed by the `@veltdev/node` self-hosted reactions service.

---

## 6. Deployment (deployment)

**Impact:** MEDIUM
**Description:** Public tunnels for development, production webhook URLs, persistent state, and environment variables (`VELT_API_KEY`, `VELT_WEBHOOK_SECRET`, `VELT_ORGANIZATION_ID`, optional `VELT_AUTH_TOKEN`).
