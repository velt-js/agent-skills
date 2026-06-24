# Velt Node Sdk Best Practices
|v0.2.3|Velt|June 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|root: ./rules

## 1. Initialization & lifecycle — CRITICAL
|shared/init:{init-dual-mode.md}

## 2. sdk.api.* REST backend — HIGH
|shared/api:{api-field-allowlist.md,api-envelope-and-services.md}

## 3. sdk.selfHosting.* MongoDB + S3 — HIGH
|shared/selfhost:{selfhost-lazy-load-and-services.md,selfhost-attachments-positional.md}

## 4. Data models — HIGH
|shared/models:{models-comment-annotation.md}

## 5. Cross-cutting pitfalls — MEDIUM
|shared/pitfalls:{pitfalls-token-and-envelopes.md}
