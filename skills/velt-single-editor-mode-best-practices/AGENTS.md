# Velt Single Editor Mode Best Practices
|v1.0.0|Velt|March 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|IMPORTANT: VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook. Pattern: `<VeltProvider apiKey={KEY} authProvider={{ user: { userId, organizationId, name, email }, retryConfig: { retryCount: 3, retryDelay: 1000 }, generateToken: async () => { /* fetch from /api/velt/token */ } }}>`. See velt-setup-best-practices for details.
|root: ./rules

## 1. Core Setup — CRITICAL
|shared/core:{core-setup.md}

## 2. Editor State Management — CRITICAL
|react/state:{state-hooks.md}
|shared/state:{state-set-user-editor.md,state-editor-api.md}

## 3. Access Request Flow — HIGH
|react/access:{access-hooks.md}
|shared/access:{access-editor-side.md,access-viewer-side.md}

## 4. Element Control — HIGH
|shared/elements:{elements-sync-attributes.md,elements-container-scope.md}

## 5. Timeout Configuration — MEDIUM
|react/timeout:{timeout-hooks.md}
|shared/timeout:{timeout-config.md}

## 6. Event Handling — MEDIUM
|react/events:{events-hooks.md}
|shared/events:{events-subscribe.md}

## 7. Debugging & Testing — LOW-MEDIUM
|shared/debug:{debug-common-issues.md}
