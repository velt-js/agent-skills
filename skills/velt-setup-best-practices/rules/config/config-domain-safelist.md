---
title: Whitelist Domains in Velt Console
impact: HIGH
impactDescription: Requests from non-whitelisted domains will be rejected
tags: domains, safelist, whitelist, console, cors, security
---

## Whitelist Domains in Velt Console

Velt requires you to whitelist the domains where your app runs. Requests from non-whitelisted domains will be rejected for security.

**Incorrect (domain not whitelisted):**

```
Console Error: "Domain not allowed. Please add your domain to the safelist."

The app is running on https://myapp.com but that domain
is not added to Velt Console's Managed Domains list.
```

**Correct (domain whitelisted):**

1. Go to https://console.velt.dev
2. Navigate to Settings → Managed Domains (or similar)
3. Add your domain(s):
   - `localhost:3000` (development)
   - `myapp.com` (production)
   - `staging.myapp.com` (staging)

**Domains to Add:**

| Environment | Domain Pattern | Example |
|-------------|----------------|---------|
| Development | localhost:PORT | `localhost:3000` |
| Preview | *.vercel.app | `my-app-*.vercel.app` |
| Staging | staging.domain.com | `staging.myapp.com` |
| Production | domain.com | `myapp.com` |

**Wildcard Patterns:**

Some platforms generate dynamic preview URLs. Check if Velt Console supports wildcards:

```
# If supported:
*.vercel.app
*.netlify.app
*.railway.app

# If not supported, add specific URLs as needed:
my-app-abc123.vercel.app
my-app-def456.vercel.app
```

**Development Setup:**

For local development, ensure `localhost:3000` (or your dev server port) is whitelisted:

```
localhost:3000
localhost:3001
127.0.0.1:3000
```

**Next.js Preview Deployments:**

For Vercel preview deployments, you may need to whitelist the preview URL pattern or add specific preview URLs:

```jsx
// Check current hostname matches a whitelisted domain
if (typeof window !== "undefined") {
  console.log("Current hostname:", window.location.hostname);
}
```

**Debugging Domain Issues:**

```jsx
// Add this temporarily to debug domain issues
useEffect(() => {
  console.log("Current origin:", window.location.origin);
  console.log("Hostname:", window.location.hostname);
  console.log("Port:", window.location.port);
}, []);
```

**Common Errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Domain not allowed" | Domain not in safelist | Add domain in Console |
| "CORS error" | Possible domain mismatch | Verify exact domain/port |
| Silent failure | Wrong API key for environment | Check API key matches project |

**Verification:**
- [ ] All deployment domains are added to Velt Console
- [ ] localhost:PORT is added for development
- [ ] No domain-related errors in browser console
- [ ] Velt features work in both dev and production
- [ ] Preview/staging domains are whitelisted

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 3: Safelist Your Domain" section
