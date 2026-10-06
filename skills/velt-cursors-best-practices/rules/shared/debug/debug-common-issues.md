---
title: Troubleshoot Common Cursor Issues
impact: LOW-MEDIUM
impactDescription: Quick fixes for frequent cursor problems
tags: debug, troubleshooting, common-issues, cursor-problems, fixes, featureAllowList, z-index
---

## Troubleshoot Common Cursor Issues

A checklist of frequent problems and their solutions when working with Velt Cursors.

**Incorrect (common misconfigurations in one place):**

```jsx
<VeltProvider apiKey="API_KEY" config={{ featureAllowList: ["comment"] }}> {/* 'cursor' missing */}
  <section><VeltCursor allowedElementIds={["canvas"]} /></section>          {/* plain array */}
  <section><VeltCursor /></section>                                         {/* second instance is inert */}
</VeltProvider>
```

**Correct:**

```jsx
<VeltProvider apiKey="API_KEY" authProvider={authProvider} config={{ featureAllowList: ["comment", "cursor"] }}>
  <VeltCursor allowedElementIds={JSON.stringify(["canvas"])} inactivityTime={120000} />
  <DocumentScope /> {/* calls setDocuments after login */}
  <main id="canvas">{/* ... */}</main>
</VeltProvider>
```

**Issue 1: Cursors not showing**

- `VeltProvider` has a valid `apiKey` and `authProvider` (with `user` and `generateToken`)
- The user is identified; anonymous users don't get live cursors
- `setDocuments` is called after login, from a child of `VeltProvider`
- `featureAllowList`, if set, includes `'cursor'`
- Only one `VeltCursor` is mounted (extra instances are inert)
- Your own cursor is never rendered back to you; test with two browsers and two users
- Domain is safelisted in the Velt Console; Next.js files have `'use client'`

**Issue 2: Cursors from other documents**

- Update the document on every route change
- Cursors use the root document; with multiple documents, make the viewed one the root

**Issue 3: Cursors appear over toolbars or sidebars**

- Use `allowedElementIds` (component: `JSON.stringify([...])`; API: plain array)
- Check that the target `id` attributes exist in the DOM (case-sensitive)
- Moving `VeltCursor` into a container does not confine cursors

**Issue 4: Cursors disappear too quickly or linger**

- Set `inactivityTime` explicitly in milliseconds (doc pages list both 5-minute and 2-minute defaults)
- Tab unfocus marks the user inactive immediately; this is expected

**Issue 5: Cursors render behind other UI**

- Raise `--velt-cursor-z-index` (default `2147483647`) or lower the competing element's z-index

**Verification:**
- [ ] One `VeltCursor` inside `VeltProvider`, with valid auth
- [ ] `setDocuments` called after login and on navigation
- [ ] `featureAllowList` includes `'cursor'` when set
- [ ] `allowedElementIds` uses `JSON.stringify` on the component
- [ ] Tested with two browsers and two different users

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior - "Customize Behavior"
- https://docs.velt.dev/ui-customization/features/realtime/cursors - "Limitations"
- https://docs.velt.dev/ui-customization/reference/css-variables - "Z-index"
- https://docs.velt.dev/key-concepts/overview#subscribe-to-documents - "Subscribe to Documents"
