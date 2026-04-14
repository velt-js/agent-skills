# Velt REST APIs Best Practices
|v1.0.0|Velt|April 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|IMPORTANT: All Velt REST API v2 calls require two headers: `x-velt-api-key` (your API key) and `x-velt-auth-token` (auth token from Velt console). Base URL: `https://api.velt.dev/v2`. All endpoints use POST method.
|root: ./rules

## 1. Core Setup — CRITICAL
|shared/core:{core-rest-api-auth.md,core-jwt-tokens.md}

## 2. REST API — HIGH-MEDIUM
|shared/rest-api:{rest-comments.md,rest-users.md,rest-documents-orgs.md,rest-notifications.md,rest-activities-crdt.md}

## 3. Webhooks — HIGH-MEDIUM
|shared/webhooks:{webhooks-basic.md,webhooks-advanced.md}

## 4. Debugging — LOW-MEDIUM
|shared/debug:{debug-common-issues.md}
