# Velt Chat SDK Adapter Best Practices
|v1.0.0|Velt|June 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|root: ./rules

IMPORTANT: The Chat SDK Adapter is server-side only — it runs in API routes (Next.js, Express), NOT in the browser. There is no VeltProvider or authProvider involved. The adapter authenticates via VELT_API_KEY and auto-generates auth tokens.

## 1. Core — CRITICAL
|shared/core:{core-setup-overview.md,core-adapter-creation.md}

## 2. Webhook — CRITICAL
|shared/webhook:{webhook-route-setup.md,webhook-version-config.md,webhook-required-events.md}

## 3. Events — HIGH
|shared/events:{events-on-new-mention.md,events-on-subscribed-message.md,events-on-reaction.md}

## 4. Users — HIGH
|shared/users:{users-resolve-pattern.md,users-bot-config.md}

## 5. Reactions — MEDIUM
|shared/reactions:{reactions-read-only.md,reactions-write-self-hosted.md}

## 6. Deployment — MEDIUM
|shared/deployment:{deployment-env-vars.md,deployment-dev-tunnel.md}
