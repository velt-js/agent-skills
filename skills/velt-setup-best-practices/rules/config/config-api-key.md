---
title: Configure API Key from Console
impact: HIGH
impactDescription: API key is required for all Velt functionality
tags: apikey, console, configuration, veltprovider
---

## Configure API Key from Console

Your Velt API key is required to initialize the SDK. Get it from console.velt.dev and configure it in VeltProvider or initVelt().

**Incorrect (missing or invalid API key):**

```jsx
// Missing API key - SDK won't initialize
<VeltProvider>
  <App />
</VeltProvider>

// Invalid/expired API key
<VeltProvider apiKey="invalid-key-here">
  <App />
</VeltProvider>
```

**Correct (with valid API key):**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

// API key from console.velt.dev
const VELT_API_KEY = "YOUR_VELT_API_KEY";

export default function App() {
  return (
    <VeltProvider apiKey={VELT_API_KEY}>
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**Getting Your API Key:**

1. Go to https://console.velt.dev
2. Create an account or sign in
3. Navigate to your project dashboard
4. Copy the API key from the dashboard

**Environment Variable Pattern (Recommended):**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";

export default function App() {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}>
      {/* Your app content */}
    </VeltProvider>
  );
}
```

```bash
# .env.local
NEXT_PUBLIC_VELT_API_KEY=your-api-key-from-console
```

**Angular/Vue/HTML:**

```javascript
// Angular/Vue with @veltdev/client
import { initVelt } from "@veltdev/client";

const client = await initVelt("YOUR_VELT_API_KEY");
```

```html
<!-- HTML with CDN -->
<script>
async function loadVelt() {
  await Velt.init("YOUR_VELT_API_KEY");
}
</script>
```

**API Key Security Notes:**

| Key Type | Storage | Exposure |
|----------|---------|----------|
| API Key | Client-side OK | Visible in browser (intended) |
| Auth Token | Server-side only | Never expose to client |

The API key is safe to include in client-side code - it identifies your app but doesn't grant admin access. The Auth Token (used for JWT generation) must remain server-side only.

**Multiple Environments:**

```bash
# .env.development
NEXT_PUBLIC_VELT_API_KEY=dev-api-key

# .env.production
NEXT_PUBLIC_VELT_API_KEY=prod-api-key
```

**Verification:**
- [ ] API key is from console.velt.dev for your project
- [ ] VeltProvider has apiKey prop set
- [ ] No "invalid API key" errors in console
- [ ] Velt components render without errors
- [ ] API key uses environment variable in production

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 2: Get Your API Key" section
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/app/page.tsx` - API key configuration pattern
