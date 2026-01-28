---
title: Initialize Velt in Angular, Vue, and HTML
impact: CRITICAL
impactDescription: Required initialization for non-React frameworks
tags: angular, vue, html, vanilla, initvelt, initialization
---

## Initialize Velt in Angular, Vue, and HTML

For Angular, Vue.js, and vanilla HTML applications, use the `initVelt()` function or `Velt.init()` method instead of VeltProvider. Each framework has specific setup requirements.

**Angular Setup:**

**Step 1: Add CUSTOM_ELEMENTS_SCHEMA to Module**

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Required for Velt web components
})
export class AppModule { }
```

**Step 2: Initialize Velt in Component**

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { initVelt } from '@veltdev/client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  client: any;

  async ngOnInit() {
    // Initialize Velt client
    this.client = await initVelt('YOUR_VELT_API_KEY');

    // Authenticate user (see identity rules)
    const user = {
      userId: 'user-123',
      organizationId: 'org-abc',
      name: 'John Doe',
      email: 'john@example.com',
    };
    await this.client.identify(user);

    // Set document (see document rules)
    await this.client.setDocument('my-document-id');
  }
}
```

**Step 3: Use Velt Components in Template**

```html
<!-- app.component.html -->
<div>
  <h1>My Collaborative App</h1>
  <velt-comments></velt-comments>
  <velt-presence></velt-presence>
  <!-- Your app content -->
</div>
```

---

**Vue.js Setup:**

**Step 1: Configure Vue to Ignore Velt Elements**

```javascript
// main.js (Vue 2)
import Vue from 'vue';
import App from './App.vue';

Vue.config.ignoredElements = [/velt-*/];  // Tell Vue to ignore velt-* elements

new Vue({
  render: h => h(App),
}).$mount('#app');
```

```javascript
// main.js (Vue 3)
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('velt-');
app.mount('#app');
```

**Step 2: Initialize Velt in Component**

```vue
<!-- App.vue -->
<script>
import { initVelt } from '@veltdev/client';

export default {
  name: 'App',
  data() {
    return {
      client: null
    }
  },
  async mounted() {
    // Initialize Velt client
    this.client = await initVelt('YOUR_VELT_API_KEY');

    // Authenticate user
    const user = {
      userId: 'user-123',
      organizationId: 'org-abc',
      name: 'John Doe',
      email: 'john@example.com',
    };
    await this.client.identify(user);

    // Set document
    await this.client.setDocument('my-document-id');
  }
}
</script>

<template>
  <div id="app">
    <velt-comments></velt-comments>
    <velt-presence></velt-presence>
    <!-- Your app content -->
  </div>
</template>
```

---

**Vanilla HTML Setup:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Collaborative App</title>
  <script
    type="module"
    src="https://cdn.velt.dev/lib/sdk@latest/velt.js"
    onload="loadVelt()"
  ></script>
  <script>
    async function loadVelt() {
      // Initialize Velt
      await Velt.init("YOUR_VELT_API_KEY");

      // Authenticate user
      const user = {
        userId: "user-123",
        organizationId: "org-abc",
        name: "John Doe",
        email: "john@example.com",
      };
      await Velt.identify(user);

      // Set document
      await Velt.setDocument('my-document-id');
    }
  </script>
</head>
<body>
  <h1>My Collaborative App</h1>
  <velt-comments></velt-comments>
  <velt-presence></velt-presence>
</body>
</html>
```

**Framework Comparison:**

| Framework | Init Method | Component Syntax | Config Required |
|-----------|-------------|------------------|-----------------|
| React/Next.js | VeltProvider | `<VeltComments />` | 'use client' |
| Angular | initVelt() | `<velt-comments>` | CUSTOM_ELEMENTS_SCHEMA |
| Vue | initVelt() | `<velt-comments>` | ignoredElements config |
| HTML | Velt.init() | `<velt-comments>` | None |

**Verification:**
- [ ] Framework-specific configuration applied
- [ ] initVelt() or Velt.init() called before using Velt features
- [ ] Velt web components render without console errors
- [ ] No "unknown element" warnings in browser console

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 4: Initialize Velt" section, Angular tab
- `/docs/get-started/quickstart.mdx` - "Step 4: Initialize Velt" section, Vue.js tab
- `/docs/get-started/quickstart.mdx` - "Step 4: Initialize Velt" section, HTML tab
