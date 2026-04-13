# Velt Recorder Best Practices
|v1.0.0|Velt|March 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|IMPORTANT: VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook. Pattern: `<VeltProvider apiKey={KEY} authProvider={{ user: { userId, organizationId, name, email }, retryConfig: { retryCount: 3, retryDelay: 1000 }, generateToken: async () => { /* fetch from /api/velt/token */ } }}>`. See velt-setup-best-practices for details.
|root: ./rules

## 1. Core Setup — CRITICAL
|shared/core:{core-auth-provider.md,core-setup.md,core-webhooks.md,core-permissions.md}

## 2. Recording Configuration — HIGH
|shared/config:{config-quality-encoding.md,config-picture-in-picture.md,config-type-and-mode.md,config-max-length.md}

## 3. Data Management — HIGH
|react/data:{data-hooks.md}
|shared/data:{data-delete-download.md,data-fetch-subscribe.md,data-rest-api.md,data-types-reference.md}

## 4. Event Handling — MEDIUM-HIGH
|react/events:{events-hooks.md}
|shared/events:{events-lifecycle.md}

## 5. Video Editor — MEDIUM
|shared/editor:{editor-standalone.md,editor-enable-configure.md}

## 6. UI/UX Configuration — MEDIUM
|shared/ui:{ui-control-panel-mode.md,ui-ai-transcription.md,ui-playback-options.md,ui-countdown-settings.md,ui-wireframes.md}

## 7. Debugging & Testing — LOW-MEDIUM
|react/debug:{debug-common-issues.md}
