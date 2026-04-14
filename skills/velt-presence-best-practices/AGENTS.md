# Velt Presence Best Practices
|v1.0.0|Velt|April 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|IMPORTANT: VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook or `client.identify()`. Pattern: `<VeltProvider apiKey={KEY} authProvider={{ user: { userId, organizationId, name, email }, retryConfig: { retryCount: 3, retryDelay: 1000 }, generateToken: async () => { /* fetch from /api/velt/token */ } }}>`. See velt-setup-best-practices for details.
|root: ./rules

## 1. Core Setup — CRITICAL
|shared/core:{core-auth-provider.md,core-setup.md,core-document-setup.md}

## 2. Data Access — HIGH
|shared/data:{data-presence-hooks.md,data-presence-api.md}

## 3. Configuration — HIGH-MEDIUM
|shared/config:{config-inactivity-time.md,config-max-users.md,config-self-visibility.md,config-location-presence.md}

## 4. Cursor — HIGH
|react/cursor:{cursor-setup.md}

## 5. Events — MEDIUM
|shared/events:{events-state-change.md}

## 6. UI & Debugging — MEDIUM-LOW
|shared/ui:{ui-wireframes.md}
|shared/debug:{debug-common-issues.md}
