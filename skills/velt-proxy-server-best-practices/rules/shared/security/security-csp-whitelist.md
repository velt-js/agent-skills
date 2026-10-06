---
title: Content Security Policy (CSP) Whitelisting for Velt
impact: HIGH
impactDescription: Without these CSP entries the browser blocks Velt requests; proxy domains must be added too
tags: CSP, Content-Security-Policy, whitelist, script-src, connect-src, img-src, media-src
---

## Content Security Policy (CSP) Whitelisting

If your app has a Content Security Policy, whitelist these domains for Velt to function. When using a proxy, also whitelist your proxy domains in addition to (or instead of) these defaults.

**Incorrect (connect-src without WebSocket entries):**

```text
Content-Security-Policy: connect-src 'self' *.velt.dev *.googleapis.com
# Realtime WebSocket connections to wss://*.firebaseio.com are blocked
```

**Correct:** include every directive below.

### Required CSP Directives

**script-src** (SDK scripts and API calls):
```
*.velt.dev
*.api.velt.dev
*.firebaseio.com
*.googleapis.com
wss://*.firebaseio.com
wss://*.firebasedatabase.app
```

**connect-src** (network connections):
```
*.velt.dev
*.api.velt.dev
*.firebaseio.com
*.googleapis.com
wss://*.firebaseio.com
wss://*.firebasedatabase.app
```

**img-src** (user avatars, attachments):
```
storage.googleapis.com
firebasestorage.googleapis.com
```

**media-src** (recordings, audio/video):
```
storage.googleapis.com
firebasestorage.googleapis.com
```

### When Using a Proxy

If you're proxying all traffic through your own domain, you can replace the third-party domains with your proxy domains. For example, if all proxy subdomains are under `*.yourdomain.com`:

```
script-src: *.yourdomain.com;
connect-src: *.yourdomain.com wss://*.yourdomain.com;
img-src: *.yourdomain.com;
media-src: *.yourdomain.com;
```

If you're only proxying some services, include both your proxy domains and the default Velt domains for the un-proxied services.

### Key Points

- Without these CSP entries, the browser blocks Velt SDK requests; check the browser console for CSP violation reports
- The `wss://` entries are needed for WebSocket connections to the ephemeral database; omit them only if you're using `forceLongPolling: true`
- When proxying storage, update `img-src` and `media-src` to include your storage proxy domain

**Source Pointers:**
- https://docs.velt.dev/security/content-security-policy — Whitelisting Rules for Content Security Policy (CSP)
