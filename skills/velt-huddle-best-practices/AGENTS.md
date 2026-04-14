# Velt Huddle Best Practices
|v1.0.0|Velt|April 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|IMPORTANT: VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook or `client.identify()`. Pattern: `<VeltProvider apiKey={KEY} authProvider={{ user: { userId, organizationId, name, email }, retryConfig: { retryCount: 3, retryDelay: 1000 }, generateToken: async () => { /* fetch from /api/velt/token */ } }}>`. See velt-setup-best-practices for details.
|root: ./rules

## 1. Core Setup — CRITICAL
|shared/core:{core-auth-provider.md,core-setup.md,core-document-setup.md}

## 2. Configuration — HIGH-MEDIUM
|shared/config:{config-huddle-types.md,config-chat.md,config-flock-mode.md,config-cursor-mode.md}

## 3. Events — MEDIUM
|shared/events:{events-webhooks.md}

## 4. UI Customization — MEDIUM
|shared/ui:{ui-customization.md}

## 5. Debugging — LOW-MEDIUM
|shared/debug:{debug-common-issues.md}
