# Velt Notifications Best Practices
|v1.0.0|Velt|January 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|IMPORTANT: VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook or pass `user` directly. Pattern: `<VeltProvider apiKey={KEY} authProvider={{ user: { userId, organizationId, name, email }, retryConfig: { retryCount: 3, retryDelay: 1000 }, generateToken: async () => { /* fetch from /api/velt/token */ } }}>`. Always set `shadowDom={false}` on VeltNotificationsTool and VeltNotificationsPanel for CSS styling access.
|root: ./rules

## 1. Core Setup — CRITICAL
|shared/core:{core-setup.md}

## 2. Panel Configuration — HIGH
|shared/panel:{panel-tabs.md,panel-display.md,panel-current-document-only.md}

## 3. Data Access — HIGH
|react/data:{data-hooks.md}
|shared/data:{data-notification-actions.md,data-notification-data-provider.md,data-rest-api.md}

## 4. Settings Management — MEDIUM-HIGH
|react/settings:{settings-channels.md}
|shared/settings:{settings-config-rest-api.md}

## 5. Notification Triggers — MEDIUM
|shared/triggers:{triggers-custom.md,triggers-self-notifications.md}

## 6. Delivery Channels — MEDIUM
|shared/delivery:{delivery-delay-batching.md,delivery-webhooks.md,delivery-email.md}

## 7. UI Customization — MEDIUM
|shared/ui:{ui-wireframes.md}

## 8. Debugging & Testing — LOW-MEDIUM
|react/debug:{debug-common-issues.md}
