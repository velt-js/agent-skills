---
title: Install Velt Client Package or CDN
impact: CRITICAL
impactDescription: Required for any Velt functionality in Angular, Vue, or vanilla HTML apps
tags: installation, angular, vue, html, vanilla, cdn, npm
---

## Install Velt Client Package or CDN

For Angular, Vue.js, and vanilla HTML applications, use @veltdev/client (npm) or the CDN script. React/Next.js apps should use @veltdev/react instead.

**Incorrect (using wrong package):**

```bash
# Wrong: @veltdev/react is for React only
npm install @veltdev/react  # Don't use this for Angular/Vue/HTML
```

**Correct (Angular/Vue - npm):**

```bash
# Install the client package for Angular or Vue
npm install @veltdev/client

# Optional: TypeScript types
npm install --save-dev @veltdev/types
```

**Correct (Vanilla HTML - CDN):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
  <!-- Load Velt SDK from CDN -->
  <script
    type="module"
    src="https://cdn.velt.dev/lib/sdk@latest/velt.js"
    onload="loadVelt()"
  ></script>
  <script>
    async function loadVelt() {
      // Velt is now available globally
      await Velt.init("YOUR_VELT_API_KEY");
    }
  </script>
</head>
<body>
  <!-- Your app content -->
</body>
</html>
```

**Framework-Specific Notes:**

| Framework | Package | Initialization |
|-----------|---------|----------------|
| Angular | @veltdev/client | `initVelt()` in ngOnInit |
| Vue.js | @veltdev/client | `initVelt()` in mounted() |
| HTML | CDN | `Velt.init()` in onload callback |

**CDN URL Options:**

```html
<!-- Latest version (recommended for development) -->
<script src="https://cdn.velt.dev/lib/sdk@latest/velt.js"></script>

<!-- Specific version (recommended for production) -->
<script src="https://cdn.velt.dev/lib/sdk@4.6.10/velt.js"></script>
```

**Prerequisites:**

- Node.js v14+ (for npm installation)
- Angular 12+, Vue 2+, or any HTML/JS setup
- Velt account with API key from https://console.velt.dev

**Verification:**
- [ ] @veltdev/client in package.json OR CDN script in HTML head
- [ ] Can import `initVelt` from '@veltdev/client' (npm) OR access `Velt` global (CDN)
- [ ] No console errors on page load

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 1: Install Dependencies" section (Angular, Vue.js, HTML tabs)
- `/docs/get-started/quickstart.mdx` - "HTML" tab with CDN script pattern
