---
title: Initialize VeltProvider with API Key
impact: CRITICAL
impactDescription: Required - Comments will not function without provider setup
tags: setup, provider, initialization, api-key, veltprovider
---

## Initialize VeltProvider with API Key

The VeltProvider must wrap your application to enable any Velt collaboration features. Without this setup, no Velt components will render or function.

**Incorrect (missing provider):**

```jsx
// Comments won't work without VeltProvider
import { VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <div>
      <VeltComments />  {/* This will not work */}
    </div>
  );
}
```

**Correct (provider wrapping app):**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_VELT_API_KEY">
      <VeltComments />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**For Next.js (App Router):**

Add `'use client'` directive at the top of files containing Velt components:

```jsx
'use client';

import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_VELT_API_KEY">
      <VeltComments />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**For HTML/Vanilla JS:**

```html
<script type="module" src="https://cdn.velt.dev/lib/sdk@latest/velt.js" onload="loadVelt()"></script>
<script>
  async function loadVelt() {
    await Velt.init("YOUR_VELT_API_KEY");
  }
</script>
<body>
  <velt-comments></velt-comments>
</body>
```

**API Key Setup:**
1. Go to [console.velt.dev](https://console.velt.dev)
2. Create an account and get your API key
3. Add your domain to "Managed Domains" to whitelist it

**Verification Checklist:**
- [ ] VeltProvider wraps the entire app
- [ ] API key is valid and from Velt Console
- [ ] Domain is safelisted in Velt Console
- [ ] Next.js files have `'use client'` directive

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - "Step 4: Initialize Velt"
