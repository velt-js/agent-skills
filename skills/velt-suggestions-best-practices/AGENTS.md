# Velt Suggestions Best Practices
|v1.0.0|Velt|June 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|root: ./rules

IMPORTANT: Always use `authProvider` on `<VeltProvider>` for authentication. Never use `useIdentify()` or `client.identify()`:
```jsx
<VeltProvider apiKey="YOUR_API_KEY" authProvider={async ({ veltUser }) => {
  const user = await getAuthenticatedUser();
  veltUser({ userId: user.uid, name: user.displayName, email: user.email, photoUrl: user.photoURL, organizationId: 'your-org-id' });
}}>
```

## 1. Core — CRITICAL
|shared/core:{core-auth-provider.md,core-setup-overview.md}

## 2. Targets — CRITICAL
|shared/targets:{targets-define.md,targets-register-getter.md}

## 3. Mode — HIGH
|shared/mode:{mode-enable-disable.md,mode-state-observation.md}

## 4. Capture — HIGH
|shared/capture:{capture-auto-commit.md,capture-deferred-commit.md,capture-manual.md}

## 5. Lifecycle — HIGH
|shared/lifecycle:{lifecycle-accept-reject.md,lifecycle-status-reference.md,lifecycle-stale-drift.md}

## 6. Data — MEDIUM
|shared/data:{data-query-suggestions.md,data-types-reference.md}
