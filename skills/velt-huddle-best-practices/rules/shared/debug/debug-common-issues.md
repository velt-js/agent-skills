---
title: Troubleshoot Common Huddle Issues
impact: LOW-MEDIUM
impactDescription: Quick fixes for common huddle problems
tags: huddle, debug, troubleshooting, common-issues, permissions
---

## Troubleshoot Common Huddle Issues

This rule covers the most frequently encountered huddle problems and their solutions.

**Issue 1: Huddle not starting**

- Check that `VeltHuddle` is rendered at the root level inside `VeltProvider`
- Check that `VeltHuddleTool` is rendered in the toolbar with a valid `type` prop
- Verify `authProvider` is configured on `VeltProvider` and authentication succeeds
- Ensure the domain is safelisted in the Velt Console
- In Next.js, confirm `"use client"` directive is present on components using Velt

**Issue 2: No audio or video**

- Browser permissions for microphone and camera must be granted
- Check that the browser supports `navigator.mediaDevices.getUserMedia`
- Some browsers block media access on non-HTTPS origins (localhost is an exception)
- Verify no other application has exclusive access to the microphone or camera
- Check browser console for `NotAllowedError` or `NotFoundError` from the MediaDevices API

**Issue 3: Peer-to-peer connection failing**

- Velt uses `serverFallback={true}` by default, which routes through a server when peer-to-peer fails
- If peer-to-peer connections consistently fail, check for restrictive corporate firewalls or VPN configurations
- Ensure WebRTC is not blocked by browser extensions or network policies
- The server fallback ensures huddles work even when direct connections cannot be established

**Issue 4: Huddle scoped to wrong users**

- Verify `setDocuments` is called with the correct document ID
- Ensure `useSetDocuments` is called in a child component of `VeltProvider`
- Confirm the document ID updates on route changes
- Without `setDocuments`, huddle defaults to root document scope (all users across all pages)

**Issue 5: Chat not visible in huddle**

- Check that `chat={true}` is set on `VeltHuddle` (this is the default)
- If chat was explicitly disabled with `chat={false}`, re-enable it
- Chat is only visible during an active huddle session — it does not appear before a huddle starts
- Verify the chat panel is not hidden behind other UI elements (adjust `--velt-huddle-z-index`)

**Debugging checklist:**

- [ ] `VeltProvider` renders with valid `apiKey` and `authProvider`
- [ ] `VeltHuddle` is at the root level inside `VeltProvider`
- [ ] `VeltHuddleTool` is in the toolbar with `type` prop set
- [ ] `useSetDocuments` is called with correct document ID after authentication
- [ ] `"use client"` directive is present in Next.js
- [ ] Domain is safelisted in Velt Console
- [ ] Browser microphone/camera permissions are granted
- [ ] No browser extensions blocking WebRTC
- [ ] Tested with two browser tabs using different users
- [ ] Check browser console for Velt SDK errors

**Source Pointers:**
- `https://docs.velt.dev/huddle/setup` - Huddle setup guide
- `https://docs.velt.dev/huddle/customize-behavior` - Huddle behavior options
