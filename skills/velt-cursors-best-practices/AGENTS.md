# Velt Cursors Best Practices
|v1.0.0|Velt|April 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|IMPORTANT: VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook or `client.identify()`. Pattern: `<VeltProvider apiKey={KEY} authProvider={{ user: { userId, organizationId, name, email }, retryConfig: { retryCount: 3, retryDelay: 1000 }, generateToken: async () => { /* fetch from /api/velt/token */ } }}>`. See velt-setup-best-practices for details.
|root: ./rules

## 1. Core Setup — CRITICAL
|shared/core:{core-auth-provider.md,core-setup.md,core-document-setup.md}

## 2. Data Access — HIGH
|shared/data:{data-cursor-hooks.md,data-cursor-api.md}

## 3. Configuration — HIGH-MEDIUM
|shared/config:{config-allowed-elements.md,config-avatar-mode.md,config-inactivity-time.md}

## 4. Events — MEDIUM
|shared/events:{events-cursor-change.md}

## 5. UI Customization — MEDIUM
|shared/ui:{ui-wireframes.md}

## 6. Debugging — LOW-MEDIUM
|shared/debug:{debug-common-issues.md}
