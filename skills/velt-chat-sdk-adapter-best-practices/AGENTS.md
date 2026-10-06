# Velt Chat Sdk Adapter Best Practices
|v1.0.1|Velt|October 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|root: ./rules

## 1. Core — CRITICAL
|shared/core:{core-adapter-creation.md,core-setup-overview.md}

## 2. Webhook — CRITICAL
|shared/webhook:{webhook-required-events.md,webhook-route-setup.md,webhook-version-config.md}

## 3. Events — HIGH
|shared/events:{events-on-subscribed-message.md,events-on-reaction.md,events-on-new-mention.md}

## 4. Users — HIGH
|shared/users:{users-bot-config.md,users-resolve-pattern.md}

## 5. Reactions — MEDIUM
|shared/reactions:{reactions-read-only.md,reactions-write-self-hosted.md}

## 6. Deployment — MEDIUM
|shared/deployment:{deployment-env-vars.md,deployment-dev-tunnel.md}
