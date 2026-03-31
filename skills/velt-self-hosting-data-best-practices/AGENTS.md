# Velt Self Hosting Data Best Practices
|v1.0.0|Velt|March 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|root: ./rules

## 1. Core Setup — CRITICAL
|shared/core:{core-provider-setup.md,core-response-format.md}

## 2. Comment Data Provider — HIGH
|shared/comment:{comment-endpoint-provider.md,comment-function-provider.md}

## 3. Attachment Data Provider — HIGH
|shared/attachment:{attachment-multipart-provider.md}

## 4. Additional Providers — MEDIUM
|shared/provider:{provider-reaction-recording.md,provider-retry-timeout.md,provider-user-resolver.md}

## 5. Backend Implementation — MEDIUM
|shared/backend:{backend-database-patterns.md,backend-s3-attachments.md,backend-api-routes.md}

## 6. Debugging — LOW-MEDIUM
|shared/debug:{debug-data-provider-events.md}
