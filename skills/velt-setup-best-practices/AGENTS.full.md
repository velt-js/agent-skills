# Velt Setup Best Practices

**Version 1.3.0**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive setup guide for integrating Velt collaboration SDK into web applications. Covers installation, VeltProvider configuration, user authentication (userId, organizationId, JWT tokens), document initialization (documentId, setDocuments), project folder structure, and debugging patterns. Primary focus on React and Next.js with secondary coverage of Angular, Vue.js, and vanilla HTML. All guidance is evidence-backed from official Velt documentation and sample applications.

---

## Table of Contents

1. [Installation](#1-installation) — **CRITICAL**
   - 1.1 [Install Velt React Packages](#11-install-velt-react-packages)
   - 1.2 [Install Velt AI Tooling for the Editor in Use (Claude Code or Cursor)](#12-install-velt-ai-tooling-for-the-editor-in-use-claude-code-or-cursor)
   - 1.3 [Install Velt Client Package or CDN](#13-install-velt-client-package-or-cdn)

2. [Provider Wiring](#2-provider-wiring) — **CRITICAL**
   - 2.1 [Add 'use client' Directive for Next.js](#21-add-use-client-directive-for-nextjs)
   - 2.2 [Configure VeltProvider with API Key and Auth](#22-configure-veltprovider-with-api-key-and-auth)
   - 2.3 [Initialize Velt in Angular, Vue, and HTML](#23-initialize-velt-in-angular-vue-and-html)

3. [Identity](#3-identity) — **CRITICAL**
   - 3.1 [Configure authProvider on VeltProvider](#31-configure-authprovider-on-veltprovider)
   - 3.2 [Generate JWT Tokens from Backend](#32-generate-jwt-tokens-from-backend)
   - 3.3 [Include organizationId for Access Control](#33-include-organizationid-for-access-control)
   - 3.4 [Structure User Object with Required Fields](#34-structure-user-object-with-required-fields)

4. [Document Identity](#4-document-identity) — **CRITICAL**
   - 4.1 [Attach Custom Page Info to Newly Created Data](#41-attach-custom-page-info-to-newly-created-data)
   - 4.2 [Attach Metadata to Documents](#42-attach-metadata-to-documents)
   - 4.3 [Generate and Manage Document IDs](#43-generate-and-manage-document-ids)
   - 4.4 [Initialize Documents with setDocuments API](#44-initialize-documents-with-setdocuments-api)
   - 4.5 [Use Locations for Sub-Areas Within a Document](#45-use-locations-for-sub-areas-within-a-document)

5. [Config](#5-config) — **HIGH**
   - 5.1 [Call enableFirestorePersistentCache Before Authentication to Enable Offline and Multi-Tab Sync](#51-call-enablefirestorepersistentcache-before-authentication-to-enable-offline-and-multi-tab-sync)
   - 5.2 [Configure API Key from Console](#52-configure-api-key-from-console)
   - 5.3 [Configure Reverse Proxy Routing via proxyConfig](#53-configure-reverse-proxy-routing-via-proxyconfig)
   - 5.4 [Scope Feature Loading with featureAllowList and preload Methods (v6 Modular SDK)](#54-scope-feature-loading-with-featureallowlist-and-preload-methods-v6-modular-sdk)
   - 5.5 [Secure Auth Tokens on Server Side](#55-secure-auth-tokens-on-server-side)
   - 5.6 [Use setUnstyledMode for Headless Styling Instead of Overriding Every Velt Style](#56-use-setunstyledmode-for-headless-styling-instead-of-overriding-every-velt-style)
   - 5.7 [Whitelist Domains in Velt Console](#57-whitelist-domains-in-velt-console)

6. [Project Structure](#6-project-structure) — **MEDIUM**
   - 6.1 [Organize Velt Files in components/velt](#61-organize-velt-files-in-componentsvelt)
   - 6.2 [Separate App Auth from Velt Integration](#62-separate-app-auth-from-velt-integration)

7. [Routing Surfaces](#7-routing-surfaces) — **MEDIUM**
   - 7.1 [Create VeltCollaboration Wrapper Component](#71-create-veltcollaboration-wrapper-component)
   - 7.2 [Place Velt UI Components Correctly](#72-place-velt-ui-components-correctly)

8. [Debugging & Testing](#8-debugging-testing) — **LOW-MEDIUM**
   - 8.1 [Set Up Two-User Testing for Collaboration Features](#81-set-up-two-user-testing-for-collaboration-features)
   - 8.2 [Troubleshoot Common Configuration Errors](#82-troubleshoot-common-configuration-errors)
   - 8.3 [Verify Velt Setup is Correct](#83-verify-velt-setup-is-correct)

9. [Components](#9-components) — **MEDIUM**
   - 9.1 [Add Share & Invite with VeltUserInviteTool](#91-add-share-invite-with-veltuserinvitetool)

---

## 1. Installation

**Impact: CRITICAL**

Package installation for Velt SDK. Without the correct packages installed, no other Velt functionality will work. Covers @veltdev/react for React/Next.js, @veltdev/client for Angular/Vue/vanilla, and the Velt AI tooling (Installation Plugin, Docs MCP, MCP Installer, UI Customization Plugin) for Claude Code and Cursor.

### 1.1 Install Velt React Packages

**Impact: CRITICAL (Required for any Velt functionality in React/Next.js apps)**

The @veltdev/react package is required for React and Next.js applications. It provides the VeltProvider component and all React hooks for Velt functionality.

**Incorrect (missing packages):**

```bash
# Missing required package - Velt features won't work
npm install react react-dom
```

**Correct (with Velt packages):**

```bash
# Install the core Velt React package
npm install @veltdev/react

# Optional: Install TypeScript types for better IDE support
npm install --save-dev @veltdev/types
```

**Package Versions:**

The SDK uses semantic versioning. Install the latest version:

| Package | Purpose |
|---------|---------|
| @veltdev/react | Core React provider and hooks |
| @veltdev/types | TypeScript type definitions (optional) |

Check [console.velt.dev](https://console.velt.dev) or npm for the latest version.

**Using yarn or pnpm:**

```bash
# yarn
yarn add @veltdev/react
yarn add -D @veltdev/types

# pnpm
pnpm add @veltdev/react
pnpm add -D @veltdev/types
```

**Prerequisites:**

- Node.js v14 or higher
- React 16+ (React 19 supported)
- Package manager (npm, yarn, or pnpm)
- Velt account with API key from https://console.velt.dev

**Verification:**
- [ ] @veltdev/react appears in package.json dependencies
- [ ] @veltdev/types appears in package.json devDependencies (if using TypeScript)
- [ ] No npm/yarn errors during installation
- [ ] Can import `{ VeltProvider } from '@veltdev/react'`

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 1: Install Dependencies

---

### 1.2 Install Velt AI Tooling for the Editor in Use (Claude Code or Cursor)

**Impact: MEDIUM (Each Velt plugin has a separate Claude Code and Cursor repository with different install commands; using the wrong one leaves skills, rules, and MCP servers unloaded)**

Velt ships AI tooling for coding agents: the Installation Plugin (skills, rules, a `velt-expert` agent, and the `velt-installer` + `velt-docs` MCP servers), the Velt Docs MCP server, the MCP Installer, and the UI Customization Plugin (`velt-customize`). Each plugin has a separate repository per editor, so match the install path to the editor. Install the Installation Plugin first; the UI Customization Plugin needs Velt already installed and rendering.

**Incorrect (mixing editors):**

```bash
# Cursor plugin repo loaded into Claude Code: Claude Code looks for
# .claude-plugin/plugin.json and guides/velt-rules.md, which this repo does not have
git clone https://github.com/velt-js/velt-plugin-cursor.git
claude --plugin-dir velt-plugin-cursor
```

```text
# Cursor command syntax typed in Claude Code (Claude Code uses /velt-customize:run)
/velt-customize-run <figma-loop-node-url> <app-url>
```

**Correct (Installation Plugin):**

```bash
# Claude Code
git clone https://github.com/velt-js/velt-plugin-claude.git
claude --plugin-dir velt-plugin-claude
```

```bash
# Cursor: clone, then add the repo root in Cursor Settings → Plugins and restart Cursor
git clone https://github.com/velt-js/velt-plugin-cursor.git
# Or, from within Cursor: /plugin marketplace add <path-to-repo>/velt-plugin-cursor
```

Verify in either editor by typing `/velt-help` in the AI chat. Requires Node.js 18+ and a Velt API key.

**Correct (Velt Docs MCP only, endpoint `https://velt.dev/docs/mcp`):**

```bash
# Claude Code
claude mcp add --transport http Velt https://velt.dev/docs/mcp
claude mcp list
```

Cursor: open the Command Palette, run "Open MCP settings", choose **Add custom MCP**, and add to `mcp.json`:

```json
{
  "mcpServers": {
    "Velt": {
      "url": "https://velt.dev/docs/mcp"
    }
  }
}
```

**Correct (MCP Installer only, guided setup with codebase scan):**

```bash
# Claude Code
claude mcp add velt-installer -- npx -y @velt-js/mcp-installer
```

Cursor: add to `.cursor/mcp.json` in your project (or the global config):

```json
{
  "mcpServers": {
    "velt-installer": {
      "command": "npx",
      "args": ["-y", "@velt-js/mcp-installer"]
    }
  }
}
```

**Correct (UI Customization Plugin, Figma design to Velt UI):**

| Step | Claude Code | Cursor |
|------|-------------|--------|
| Install | `/plugin marketplace add velt-js/velt-figma-plugin-claude` then `/plugin install velt-customize@velt-customize`, restart or `/reload-plugins` | `git clone https://github.com/velt-js/velt-figma-plugin-cursor.git`, `cd velt-figma-plugin-cursor`, `npm run all`, fully restart Cursor |
| Figma token | `node "$CLAUDE_PLUGIN_ROOT/scripts/figma-extract.mjs" token set` (run inside Claude Code) | `node scripts/figma-extract.mjs token set` |
| Browser check | Claude in Chrome extension | Cursor's built-in browser plus `npm i -g playwright-core` |
| Run | `/velt-customize:run <figma-loop-node-url> <app-url>` | `/velt-customize-run <figma-loop-node-url> <app-url>` |

Pass the exact app page where Velt renders, with a run-unique `documentId` query param (for example `http://localhost:3000/inline-comments?documentId=my-run-1`). The plugin writes code under `components/velt/ui-customization/`.

**Which tool to use:**

| Scenario | Use |
|----------|-----|
| First Velt setup in Claude Code or Cursor | Installation Plugin |
| Editor without plugin support | MCP Installer + Agent Skills (`npx skills add velt-js/agent-skills`) |
| Question the skills don't cover | Velt Docs MCP |
| Match Velt UI to a Figma design (Velt already working) | UI Customization Plugin |
| No AI agent, Next.js | CLI (`npx @velt-js/add-velt`) |

**Verification:**
- [ ] The plugin repository matches the editor (`velt-plugin-claude` / `velt-figma-plugin-claude` for Claude Code, `velt-plugin-cursor` / `velt-figma-plugin-cursor` for Cursor)
- [ ] `/velt-help` responds with Velt-specific answers after install
- [ ] Docs MCP points at `https://velt.dev/docs/mcp`
- [ ] UI Customization Plugin runs only after Velt's default UI renders in the app

**Source Pointers:**
- `https://docs.velt.dev/get-started/agentic-overview` - Overview ("When to Use What")
- `https://docs.velt.dev/get-started/installation-plugin` - Installation Plugin ("Quickstart", "Troubleshooting")
- `https://docs.velt.dev/get-started/docs-mcp` - Velt Docs MCP ("Setup")
- `https://docs.velt.dev/get-started/mcp-installer` - Velt Installation MCP ("Quickstart")
- `https://docs.velt.dev/get-started/ui-customization-plugin` - UI Customization Plugin ("Quickstart", "Available Commands")

---

### 1.3 Install Velt Client Package or CDN

**Impact: CRITICAL (Required for any Velt functionality in Angular, Vue, or vanilla HTML apps)**

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
<script type="module" src="https://cdn.velt.dev/lib/sdk@latest/velt.js"></script>

<!-- Specific version (recommended for production); replace VERSION with a published SDK version -->
<script type="module" src="https://cdn.velt.dev/lib/sdk@VERSION/velt.js"></script>
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
- `https://docs.velt.dev/get-started/quickstart` - Step 1: Install Dependencies (Angular, Vue.js, HTML tabs)

---

## 2. Provider Wiring

**Impact: CRITICAL**

VeltProvider component setup and initialization. The VeltProvider must wrap your application for any Velt features to function. Includes framework-specific initialization patterns.

### 2.1 Add 'use client' Directive for Next.js

**Impact: CRITICAL (Next.js App Router requires client directive for Velt components)**

Next.js App Router uses Server Components by default. Velt components require client-side JavaScript, so any file containing Velt components must include the `'use client'` directive at the top.

**Incorrect (missing directive):**

```jsx
// app/page.tsx - Error: Velt components can't render in server components
import { VeltProvider, VeltComments } from "@veltdev/react";

export default function Home() {
  return (
    <VeltProvider apiKey="YOUR_KEY">
      <VeltComments />  {/* This will fail */}
    </VeltProvider>
  );
}
```

**Correct (with 'use client'):**

```jsx
// app/page.tsx
"use client";  // MUST be the first line

import { VeltProvider, VeltComments } from "@veltdev/react";

export default function Home() {
  return (
    <VeltProvider apiKey="YOUR_KEY">
      <VeltComments />
    </VeltProvider>
  );
}
```

**Files That Need 'use client':**

Any file that:
- Imports from `@veltdev/react`
- Uses Velt hooks (`useSetDocument`, `useVeltClient`, etc.)
- Contains Velt components (`VeltComments`, `VeltPresence`, etc.)
- Uses React hooks with Velt data

**Recommended Pattern - Keep Layout as Server Component:**

```jsx
// app/layout.tsx - Server Component (no 'use client')
import { AppProviders } from "@/app/userAuth/AppProviders";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

```jsx
// app/userAuth/AppProviders.tsx - Client Component
"use client";

import { AppUserProvider } from "./AppUserContext";

export function AppProviders({ children }) {
  return (
    <AppUserProvider>
      {children}
    </AppUserProvider>
  );
}
```

```jsx
// app/page.tsx - Client Component with VeltProvider
"use client";

import { VeltProvider } from "@veltdev/react";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";

export default function Home() {
  return (
    <VeltProvider apiKey="YOUR_KEY">
      <VeltCollaboration />
      {/* Page content */}
    </VeltProvider>
  );
}
```

**Common Errors Without 'use client':**

- `Error: Cannot read properties of undefined (reading 'createContext')`
- `Error: Hooks can only be called inside the body of a function component`
- `Error: Expected a string or a class/function but got: undefined`

**Verification:**
- [ ] All files importing from @veltdev/react have 'use client' at line 1
- [ ] The 'use client' directive is a string literal, not a comment
- [ ] No Velt imports in Server Components (layout.tsx without directive)
- [ ] Page renders without hydration errors

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 4: Initialize Velt (warning about 'use client' directive)

---

### 2.2 Configure VeltProvider with API Key and Auth

**Impact: CRITICAL (SDK will not function without VeltProvider wrapping the app)**

VeltProvider must wrap your React/Next.js application and be configured with your API key. For production, also configure the authProvider for JWT authentication.

**Incorrect (missing configuration):**

```jsx
// Missing VeltProvider - Velt features won't work
export default function App() {
  return (
    <div>
      <VeltComments />  {/* Error: Velt components need VeltProvider */}
    </div>
  );
}
```

**Incorrect (provider in wrong location):**

```jsx
// Wrong: VeltProvider in layout.tsx (server component in Next.js)
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <VeltProvider apiKey="YOUR_KEY">  {/* Error in Next.js App Router */}
          {children}
        </VeltProvider>
      </body>
    </html>
  );
}
```

**Correct (development setup):**

```jsx
"use client";

import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_VELT_API_KEY">
      <VeltComments />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**Correct (production setup with authProvider):**

```jsx
"use client";

import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  // User from your app's auth system
  const user = {
    userId: "user-123",
    organizationId: "org-abc",
    name: "John Doe",
    email: "john@example.com",
  };

  const authProvider = {
    user,
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      // Fetch JWT from your backend
      const resp = await fetch("/api/velt/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          organizationId: user.organizationId,
        }),
      });
      const { token } = await resp.json();
      return token;
    },
  };

  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={authProvider}
    >
      <VeltComments />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**VeltProvider Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| apiKey | string | Yes | API key from console.velt.dev |
| authProvider | `VeltAuthProvider` | Recommended | User + token generator for production |
| config | `VeltProviderConfig` / `Config` | No | SDK-wide options such as `featureAllowList`, `proxyConfig`, `integrity`, `globalStyles`, `usePrefersColorScheme`, `urlAllowList` |
| dataProviders | object | No | For self-hosting data (comments, notifications, users, etc.) |

The `config` object is the same options object that other frameworks pass as the second argument to `initVelt(apiKey, config)`. `authProvider` and `config` are sibling props; do not nest one inside the other.

**Key Rules:**

1. Place VeltProvider in page component (not layout) for Next.js App Router
2. The file must have `'use client'` directive for Next.js
3. Do not call auth hooks or setDocuments() in the same component that renders VeltProvider; use child components
4. Use child components for authentication and document setup

**Verification:**
- [ ] VeltProvider wraps all Velt components
- [ ] apiKey is set (from console.velt.dev)
- [ ] authProvider configured for production
- [ ] File has 'use client' directive (Next.js App Router)
- [ ] Provider is in page.tsx, not layout.tsx

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 4: Initialize Velt
- `https://docs.velt.dev/api-reference/sdk/models/data-models#config` - Config (`featureAllowList`, `globalStyles`, `usePrefersColorScheme`)
- `https://docs.velt.dev/api-reference/sdk/models/data-models#veltproviderconfig` - VeltProviderConfig (`proxyConfig`, `integrity`)

---

### 2.3 Initialize Velt in Angular, Vue, and HTML

**Impact: CRITICAL (Required initialization for non-React frameworks)**

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
    await this.client.setVeltAuthProvider({
      user,
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
        });
        const { token } = await resp.json();
        return token;
      },
    });

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
    await this.client.setVeltAuthProvider({
      user,
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
        });
        const { token } = await resp.json();
        return token;
      },
    });

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
      await Velt.setVeltAuthProvider({
        user,
        generateToken: async () => {
          const resp = await fetch("/api/velt/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
          });
          const { token } = await resp.json();
          return token;
        },
      });

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

**SDK-wide options:** `initVelt(apiKey, config)` (and `Velt.init(apiKey, config)`) accept the same config object React passes as `VeltProvider`'s `config` prop, for example `{ featureAllowList: ['comment', 'presence'], proxyConfig: { ... } }`.

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
- `https://docs.velt.dev/get-started/quickstart` - Step 4: Initialize Velt (Angular, Vue.js, HTML tabs); Step 5: Authenticate Users
- `https://docs.velt.dev/api-reference/sdk/api/api-methods#initconfig` - initConfig() / get Velt Client

---

## 3. Identity

**Impact: CRITICAL**

User authentication and identity mapping. Velt requires authenticated users with userId and organizationId. Covers user object shape, authProvider configuration, and JWT token generation.

### 3.1 Configure authProvider on VeltProvider

**Impact: CRITICAL (Recommended authentication method; Velt calls generateToken on sign-in and whenever the 48-hour JWT expires)**

The `authProvider` prop on `VeltProvider` is the recommended way to authenticate users. You pass the user plus a `generateToken` function, and Velt calls it automatically during the initial sign-in and whenever the token expires (Velt JWTs expire after 48 hours).

`identify()` / `useIdentify()` still exist, but with them you must pass the JWT yourself and re-authenticate on the `token_expired` error event. Prefer `authProvider` unless you need that manual control.

**Incorrect (identify without token refresh):**

```jsx
"use client";
import { useIdentify } from "@veltdev/react";

function AuthComponent({ user, token }) {
  // Works until the token expires (48h); nothing re-generates it
  useIdentify(user, { authToken: token });
  return null;
}
```

**Correct (authProvider on VeltProvider):**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

export default function App() {
  // User from your app's auth system
  const user = {
    userId: "user-123",
    organizationId: "org-abc",
    name: "John Doe",
    email: "john@example.com",
  };

  const authProvider = {
    // The user object to authenticate
    user,

    // Retry configuration for token generation
    retryConfig: {
      retryCount: 3,
      retryDelay: 1000,  // milliseconds
    },

    // Function to generate JWT token from your backend
    generateToken: async () => {
      const response = await fetch("/api/velt/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          organizationId: user.organizationId,
          email: user.email,
        }),
      });
      const { token } = await response.json();
      return token;  // Return the JWT string
    },
  };

  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={authProvider}
    >
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**authProvider Structure (`VeltAuthProvider`):**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| user | `User` | Yes | User object with `userId` and `organizationId` (plus `name`, `email`, `photoUrl`) |
| generateToken | `() => Promise<string>` | Production | Async function returning a Velt JWT from your backend |
| retryConfig | `{ retryCount?: number, retryDelay?: number }` | No | Retries for token generation (delay in ms) |
| options | `Options` | No | `forceReset`, `throwError`, `authToken` (see below) |

**Useful `options`:**

- `forceReset: true`: Velt preserves the authenticated session in the browser and does not generate a new token until you sign the user out. Set `forceReset` when you changed the user's metadata or default access in the Console and need it applied now.
- `throwError: true`: authentication methods return `null` on failure by default. With `throwError: true` they throw, so you can catch and handle the error.

**Extracting to Custom Hook (Recommended Pattern):**

```jsx
// components/velt/VeltInitializeUser.tsx
"use client";
import { useMemo } from "react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/AppUserContext";

// Call your backend API to generate a JWT token for the user
async function getVeltJwtFromBackend(user: {
  userId: string;
  organizationId: string;
  email?: string;
}) {
  const resp = await fetch("/api/velt/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.userId,
      organizationId: user.organizationId,
      email: user.email,
      isAdmin: false,
    }),
    cache: "no-store",  // Don't cache token requests
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Token API failed: ${err?.error || resp.statusText}`);
  }
  const { token } = await resp.json();
  if (!token) throw new Error("No token in response");
  return token as string;
}

export function useVeltAuthProvider() {
  const { user } = useAppUser();

  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;

    return {
      user,
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        return await getVeltJwtFromBackend({
          userId: user.userId as string,
          organizationId: user.organizationId as string,
          email: user.email,
        });
      },
    };
  }, [user]);

  return { authProvider };
}
```

**Using the Custom Hook:**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";

export default function Home() {
  const { authProvider } = useVeltAuthProvider();

  // Don't render VeltProvider until authProvider is ready
  if (!authProvider) {
    return <div>Loading...</div>;
  }

  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={authProvider}
    >
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**Switching users:** to change the signed-in user in the same tab, call `client.signOutUser()` first, then authenticate the new user. This cleans up the previous session.

**When to Omit generateToken:**

- Development/testing only (the docs allow omitting it during development)
- Prototyping before the backend endpoint exists

For production apps, always implement `generateToken` and enable "Require JWT Token" in the Velt Console.

**Verification:**
- [ ] authProvider includes a user object with `userId` and `organizationId`
- [ ] generateToken fetches the token from your backend (never generated in the browser)
- [ ] Token endpoint validates the user session on the server
- [ ] VeltProvider waits until authProvider is defined
- [ ] If `identify()` is used instead, a `token_expired` handler re-authenticates with a fresh token
- [ ] No token-related errors in browser console

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
- `https://docs.velt.dev/key-concepts/overview#authenticate-a-user` - "Use Auth Provider", "Sign in with force reset", "Sign out a User"
- `https://docs.velt.dev/get-started/advanced#token-refresh` - Token Refresh
- `https://docs.velt.dev/get-started/advanced#error-handling-in-authentication` - Error Handling in Authentication
- `https://docs.velt.dev/api-reference/sdk/models/data-models#veltauthprovider` - VeltAuthProvider

---

### 3.2 Generate JWT Tokens from Backend

**Impact: CRITICAL (Required for production security; tokens must be server-generated with the v2 generate_token endpoint)**

Velt JWT tokens must be generated on your server, never in the browser. Call `POST https://api.velt.dev/v2/auth/generate_token` with your API key and Auth Token (which must remain secret), then return the token to the client's `authProvider.generateToken`. Tokens expire after 48 hours.

**Incorrect (client-side generation, wrong endpoint, wrong body shape):**

```jsx
// WRONG on three counts:
// 1. Auth token exposed in client-side code
// 2. /v2/auth/token/get is not a v2 endpoint (v2 is /v2/auth/generate_token)
// 3. Body not wrapped in `data`, organizationId placed in userProperties
const VELT_AUTH_TOKEN = "bd4d5226...";

const generateToken = async () => {
  const response = await fetch("https://api.velt.dev/v2/auth/token/get", {
    method: "POST",
    headers: { "x-velt-auth-token": VELT_AUTH_TOKEN },
    body: JSON.stringify({ userId, userProperties: { organizationId } }),
  });
};
```

**Correct (server-side token generation):**

**Step 1: Enable JWT and get an Auth Token**

1. In the Velt Console (Dashboard → Config → General), enable the "Require JWT Token" toggle. JWT tokens won't work until this is on.
2. Generate an Auth Token in the Console's "Auth Token" section.
3. Store it in server-side environment variables only.

**Step 2: Create Backend Endpoint (Next.js API Route)**

```typescript
// app/api/velt/token/route.ts
import { NextRequest, NextResponse } from "next/server";

const VELT_API_KEY = process.env.NEXT_PUBLIC_VELT_API_KEY!;
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    // Validate the caller's app session here before issuing a token
    const { userId, organizationId, name, email, isAdmin } = await req.json();

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Missing userId or organizationId' }, { status: 400 });
    }

    if (!VELT_AUTH_TOKEN) {
      return NextResponse.json({ error: 'Server configuration error: missing VELT_AUTH_TOKEN' }, { status: 500 });
    }

    const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-velt-api-key": VELT_API_KEY,
        "x-velt-auth-token": VELT_AUTH_TOKEN,
      },
      // Body must be wrapped in a top-level `data` object.
      // organizationId belongs in permissions.resources[], not userProperties.
      body: JSON.stringify({
        data: {
          userId,
          userProperties: {
            name,
            email,
            isAdmin: typeof isAdmin === "boolean" ? isAdmin : false,
          },
          permissions: {
            resources: [{ type: "organization", id: organizationId }],
          },
        },
      }),
    });

    const json = await response.json();
    const token = json?.result?.data?.token;

    if (!response.ok || !token) {
      return NextResponse.json(
        { error: json?.error?.message || "Failed to generate token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Step 3: Set Environment Variables**

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_VELT_API_KEY=your-api-key-from-console
VELT_AUTH_TOKEN=your-auth-token-from-console
```

**Step 4: Call from Frontend**

```jsx
// In your authProvider.generateToken function
const generateToken = async () => {
  const response = await fetch("/api/velt/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.userId,
      organizationId: user.organizationId,
      name: user.name,
      email: user.email,
    }),
    cache: "no-store",
  });

  const { token } = await response.json();
  return token;
};
```

**Alternative: Node backend SDK (`@veltdev/node` 2.x):**

```typescript
import { VeltSDK } from "@veltdev/node";

// REST API mode: no database block needed
const sdk = VeltSDK.initialize({
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});

const res = await sdk.api.accessControl.generateToken({
  userId: "user-123",
  userProperties: { name: "John Doe", email: "john@example.com", isAdmin: false },
  permissions: {
    resources: [{ type: "organization", id: "org-abc" }],
  },
});
const token = res.result.data.token;
```

`sdk.api.accessControl.generateToken` calls the same `/v2/auth/generate_token` endpoint and returns the raw `{ result: { status, message, data: { token } } }` envelope. The Python SDK (`velt-py`) exposes the same `sdk.api.accessControl.generateToken`.

**Express.js Backend Example:**

```javascript
// server.js
const express = require("express");
const app = express();
app.use(express.json());

const VELT_API_KEY = process.env.VELT_API_KEY;
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN;

app.post("/api/velt/token", async (req, res) => {
  const { userId, organizationId, name, email, isAdmin } = req.body;

  if (!userId || !organizationId) {
    return res.status(400).json({ error: "Missing userId or organizationId" });
  }

  // Validate user authentication here

  const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-velt-api-key": VELT_API_KEY,
      "x-velt-auth-token": VELT_AUTH_TOKEN,
    },
    body: JSON.stringify({
      data: {
        userId,
        userProperties: { name, email, isAdmin: Boolean(isAdmin) },
        permissions: {
          resources: [{ type: "organization", id: organizationId }],
        },
      },
    }),
  });

  const json = await response.json();
  const token = json?.result?.data?.token;

  if (!response.ok || !token) {
    return res.status(500).json({ error: json?.error?.message || "Failed to generate token" });
  }

  res.json({ token });
});
```

**API Request/Response:**

```text
POST https://api.velt.dev/v2/auth/generate_token
Headers:
  Content-Type: application/json
  x-velt-api-key: YOUR_API_KEY
  x-velt-auth-token: YOUR_AUTH_TOKEN

Body:
{
  "data": {
    "userId": "user-123",
    "userProperties": {
      "name": "John Doe",
      "email": "user@example.com",
      "isAdmin": false
    },
    "permissions": {
      "resources": [
        { "type": "organization", "id": "org-abc", "accessRole": "editor" },
        { "type": "document", "id": "doc-456", "organizationId": "org-abc", "accessRole": "viewer" }
      ]
    }
  }
}

Response:
{
  "result": {
    "status": "success",
    "message": "Token generated successfully.",
    "data": { "token": "eyJhbGciOiJS..." }
  }
}
```

**Permissions in the token:**
- `resources[].type`: `"organization"`, `"folder"`, or `"document"`. `organizationId` is required on folder and document resources.
- `accessRole`: `"editor"` (default, read/write) or `"viewer"` (read-only). It can only be set through the token or the v2 Users / Auth Permissions REST APIs; frontend SDK methods cannot change it.
- `expiresAt`: optional Unix timestamp for a temporary grant.
- If you set `isAdmin: true` on the SDK `User`, the token must also carry `isAdmin: true`.

**Verification:**
- [ ] Endpoint is `https://api.velt.dev/v2/auth/generate_token` (POST)
- [ ] Request body is wrapped in `data`, and `organizationId` is a `permissions.resources[]` entry
- [ ] VELT_AUTH_TOKEN is only on the server (not in the client bundle)
- [ ] .env.local is in .gitignore
- [ ] Token endpoint validates the user session before generating a token
- [ ] "Require JWT Token" is enabled in the Console for production

**Source Pointers:**
- `https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens` - JWT Authentication Tokens (Steps 1 to 3)
- `https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token` - Generate Token (body, permissions, 48h expiry)
- `https://docs.velt.dev/backend-sdks/node#generatetoken` - `sdk.api.accessControl.generateToken`
- `https://docs.velt.dev/security/auth-tokens` - Generating Auth Tokens

---

### 3.3 Include organizationId for Access Control

**Impact: CRITICAL (Required for document isolation between organizations/tenants)**

The organizationId field is required in the user object and controls which documents users can access. By default, users can only see documents created within their organization.

**Incorrect (missing organizationId):** `organizationId` is a required field on the `User` object. Without it, access control cannot scope the user's documents.

**Incorrect (hardcoded for all users):**

```jsx
// Same organizationId for all users - no tenant isolation
const user = {
  userId: currentUser.id,
  organizationId: "default",  // All users in same org!
  name: currentUser.name,
  email: currentUser.email,
};
```

**Correct (organization scoped):**

```jsx
// Each organization has its own isolated document space
const user = {
  userId: currentUser.id,
  organizationId: currentUser.organizationId,  // From your auth system
  name: currentUser.name,
  email: currentUser.email,
};

// React (recommended)
<VeltProvider
  apiKey="YOUR_KEY"
  authProvider={{
    user,
    generateToken: async () => {
      const resp = await fetch("/api/velt/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
      });
      const { token } = await resp.json();
      return token;
    },
  }}
>

// Angular/Vue/HTML
await client.setVeltAuthProvider({
  user,
  generateToken: async () => {
    const resp = await fetch("/api/velt/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
});
```

**Multi-Tenant Patterns:**

**Pattern 1: Organization from User Profile**

```jsx
// User has organization membership in your database
async function getUserWithOrg(userId) {
  const user = await db.users.findById(userId);
  const membership = await db.orgMemberships.findByUserId(userId);

  return {
    userId: user.id,
    organizationId: membership.organizationId,
    name: user.name,
    email: user.email,
  };
}
```

**Pattern 2: Organization from URL/Subdomain**

```jsx
// Organization determined by subdomain: acme.yourapp.com
function getOrgFromSubdomain() {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  return subdomain;  // "acme"
}

const user = {
  userId: currentUser.id,
  organizationId: getOrgFromSubdomain(),
  name: currentUser.name,
  email: currentUser.email,
};
```

**Pattern 3: Organization from Route Parameter**

```jsx
// Organization in URL: /org/acme/documents/123
// Next.js App Router
function Page({ params }) {
  const { orgId } = params;

  const user = {
    userId: currentUser.id,
    organizationId: orgId,
    name: currentUser.name,
    email: currentUser.email,
  };
}
```

**Document Isolation Behavior:**

| User Org | Document Org | Can Access? |
|----------|--------------|-------------|
| org-a | org-a | Yes |
| org-a | org-b | No (default) |
| org-b | org-a | No (default) |

**Cross-Organization Access:**

To grant access beyond the user's organization, add resources to the JWT permissions in your token endpoint (`POST /v2/auth/generate_token`). Folder and document resources must include their `organizationId`.

```typescript
// In your JWT token generation endpoint
const body = {
  data: {
    userId,
    userProperties: { name, email, isAdmin: false },
    permissions: {
      resources: [
        { type: "organization", id: organizationId },
        // Cross-org access to one document, read-only
        { type: "document", id: "shared-doc-123", organizationId: "partner-org", accessRole: "viewer" },
      ],
    },
  },
};
```

On the client, subscribe to documents in another organization by passing `organizationId` in the `setDocuments()` options.

**Verification:**
- [ ] organizationId is included in every user object
- [ ] organizationId comes from your auth system (not hardcoded)
- [ ] Different organizations see different documents
- [ ] Console.velt.dev shows correct organization IDs in user list

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
- `https://docs.velt.dev/key-concepts/overview#organizations` - Organizations
- `https://docs.velt.dev/key-concepts/overview#subscribe-to-documents-from-other-organizations` - Subscribe to Documents from Other Organizations
- `https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token` - Generate Token (permissions.resources)

---

### 3.4 Structure User Object with Required Fields

**Impact: CRITICAL (Authentication will fail without correct user object structure)**

The user object passed to Velt authentication must include `userId` and `organizationId`. The quickstart also asks for `name`, `email`, and `photoUrl`: without them Velt shows a random avatar name and image, and email or Slack notifications cannot reach the user.

**Incorrect (missing required fields):**

```jsx
// Missing organizationId - will cause access control issues
const user = {
  userId: "user-123",
  name: "John Doe",
  email: "john@example.com",
};

// Missing userId - authentication will fail
const user = {
  organizationId: "org-abc",
  name: "John Doe",
};
```

**Correct (all required fields):**

```jsx
const user = {
  // Required fields
  userId: "user-123",           // Unique identifier for this user
  organizationId: "org-abc",    // Organization the user belongs to

  // Recommended fields (quickstart user object)
  name: "John Doe",             // Display name for avatars and mentions
  email: "john@example.com",    // Needed for email/Slack notifications
  photoUrl: "https://example.com/avatar.jpg",  // Avatar image URL

  // Optional fields
  color: "#FF6B6B",             // Session color: avatar border, live cursor, selection
  textColor: "#FFFFFF",         // Initial's text color when photoUrl is absent
};
```

**Field Reference:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Unique user identifier (from your auth system) |
| organizationId | string | Yes | Organization the user belongs to, used for access control |
| name | string | Recommended | Display name; defaults to a random avatar name if missing |
| email | string | Recommended | Required for email or Slack notifications about comments and mentions |
| photoUrl | string | Recommended | Avatar image URL; defaults to a random avatar image if missing |
| color | string | No | Hex color for avatar border, live cursor, selection |
| textColor | string | No | Hex color for the initial when `photoUrl` is absent |
| isAdmin | boolean | No | Admin user; the JWT you generate must also set `isAdmin: true` |

Access roles (`viewer` / `editor`) are not set on the frontend `User` object. Assign them per resource in the JWT `permissions.resources[]` or with the v2 Users / Auth Permissions REST APIs.

**Mapping from Common Auth Providers:**

```jsx
// Firebase Auth
const firebaseUser = auth.currentUser;
const user = {
  userId: firebaseUser.uid,
  organizationId: "your-org-id",  // From your database
  name: firebaseUser.displayName,
  email: firebaseUser.email,
  photoUrl: firebaseUser.photoURL,
};

// Auth0
const auth0User = await auth0.getUser();
const user = {
  userId: auth0User.sub,
  organizationId: auth0User['https://your-app.com/org_id'],
  name: auth0User.name,
  email: auth0User.email,
  photoUrl: auth0User.picture,
};

// NextAuth.js
const session = await getSession();
const user = {
  userId: session.user.id,
  organizationId: session.user.organizationId,
  name: session.user.name,
  email: session.user.email,
  photoUrl: session.user.image,
};
```

**Using the User Object:**

```jsx
// React (recommended)
<VeltProvider
  apiKey="YOUR_KEY"
  authProvider={{
    user,
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      const resp = await fetch("/api/velt/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
      });
      const { token } = await resp.json();
      return token;
    },
  }}
>

// Angular/Vue/HTML
await client.setVeltAuthProvider({
  user,
  generateToken: async () => {
    // Fetch JWT from your backend
    const resp = await fetch("/api/velt/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
});
```

**Common Mistakes:**

| Mistake | Issue | Fix |
|---------|-------|-----|
| Using integer IDs | May cause type mismatches | Convert to string: `String(id)` |
| Missing organizationId | Users see all docs | Always include organization scoping |
| Null email | No email/Slack notifications for that user | Pass the real email from your auth system |
| Empty string userId | Auth fails silently | Validate userId before authentication |

**Verification:**
- [ ] userId is a non-empty string
- [ ] organizationId is set for all users
- [ ] name, email, and photoUrl are provided where available
- [ ] photoUrl is a valid URL if provided
- [ ] User object logged to console shows all fields

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
- `https://docs.velt.dev/api-reference/sdk/models/data-models#user` - User

---

## 4. Document Identity

**Impact: CRITICAL**

Document initialization with setDocuments API. Documents define collaborative spaces where users can interact. SDK will not function without calling setDocuments. Covers document IDs, metadata, locations, and custom page info.

### 4.1 Attach Custom Page Info to Newly Created Data

**Impact: MEDIUM (Apps with client-side routing or custom URL schemes otherwise record browser-derived page info on comments, reactions, recordings, presence, and cursors)**

By default Velt derives page info (URL, title, path) from the browser and stamps it onto newly created data: comments, reactions, recordings, presence, and cursors. In apps with client-side routing or custom URL schemes the browser URL may not be the identity you want recorded. `setPageInfo()` opts into supplying your own `PageInfo`; it affects **only newly created data** (existing records are untouched). `clearPageInfo()` reverts to the automatic browser-derived behavior.

**Params:**
- `pageInfo`: `PageInfo` (see [data-models#pageinfo](https://docs.velt.dev/api-reference/sdk/models/data-models#pageinfo))
- `options?`: `{ documentId?: string }` on the SDK signature. `documentId` is reserved for a future per-document scope; the current release applies custom page info globally.

**For React / Next.js:**

**Incorrect (relying on browser-derived URL in a client-side-routed app: created data records the wrong page):**

```jsx
// SPA route is /doc/42 but the browser URL/title may lag or use a hash scheme;
// new comments/reactions get stamped with whatever the browser reports.
<VeltComments />
```

**Correct (stamp your own page info via the hook or the client API):**

```jsx
import { useEffect } from 'react';
import { useSetPageInfo, useClearPageInfo } from '@veltdev/react';

function DocPageInfo({ docId, title }) {
  // Hook: returns memoized callbacks that wait until the client is ready
  const { setPageInfo } = useSetPageInfo();
  const { clearPageInfo } = useClearPageInfo();

  useEffect(() => {
    setPageInfo({ url: `https://app.example.com/doc/${docId}`, title });
    // Revert to automatic browser-derived page info on unmount
    return () => clearPageInfo();
  }, [docId, title]);

  return null;
}

// API Method
client.setPageInfo({ url: 'https://app.example.com/doc/42', title: 'Design Doc' });
client.clearPageInfo();
```

**For HTML/Vanilla JS:**

```js
Velt.setPageInfo({ url: 'https://app.example.com/doc/42', title: 'Design Doc' });

// Revert to automatic browser-derived page info
Velt.clearPageInfo();
```

The SDK signature also accepts `options?.documentId` on `setPageInfo()` / `clearPageInfo()`, but the docs mark it as reserved for a future per-document scope. Do not rely on per-document page-info behavior yet; treat custom page info as global until that scope ships.

**Verification:**
- [ ] `setPageInfo` is called only when you need to override the browser-derived page info (it is opt-in)
- [ ] Callers understand only newly created data is affected; existing comments/reactions/recordings keep their original page info
- [ ] React uses `useSetPageInfo()` / `useClearPageInfo()` (or `client.setPageInfo` / `client.clearPageInfo`); other frameworks use `Velt.setPageInfo` / `Velt.clearPageInfo`
- [ ] `clearPageInfo()` is used to return to automatic behavior rather than passing stale values
- [ ] `options.documentId` is not used as a live per-document scope; it is reserved for future support

**Source Pointers:**
- https://docs.velt.dev/get-started/advanced#set-custom-page-info — "Set Custom Page Info" / "Clear Custom Page Info"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesetpageinfo — useSetPageInfo() / useClearPageInfo()
- https://docs.velt.dev/api-reference/sdk/models/data-models#pageinfo — PageInfo

---

### 4.2 Attach Metadata to Documents

**Impact: MEDIUM-HIGH (Metadata enables document names in UI and custom filtering)**

Document metadata allows you to store additional information like document names, which appear in Velt UI components. Metadata can also be used for filtering and organization.

**Incorrect (no metadata):**

```jsx
// Missing metadata - document name won't appear in UI
setDocuments([{ id: "doc-123" }]);

// In VeltCommentsSidebar, document shows as "doc-123" instead of friendly name
```

**Correct (with metadata):**

```jsx
setDocuments([
  {
    id: "doc-123",
    metadata: {
      documentName: "Q4 Marketing Plan",  // Shown in UI components
    },
  },
]);
```

**Full Metadata Example:**

```jsx
setDocuments([
  {
    id: "project-456",
    metadata: {
      // Standard field - used by Velt UI components
      documentName: "Website Redesign Project",

      // Custom fields - available for filtering/display
      projectType: "design",
      createdBy: "user-123",
      department: "marketing",
      priority: "high",
      createdAt: new Date().toISOString(),
    },
  },
]);
```

**Accessing Metadata:**

```jsx
// React: subscribe via the client (there is no useDocument hook)
import { useEffect, useState } from "react";
import { useVeltClient } from "@veltdev/react";

function DocumentHeader() {
  const { client } = useVeltClient();
  const [documentMetadata, setDocumentMetadata] = useState(null);

  useEffect(() => {
    if (!client) return;
    const subscription = client.getDocumentMetadata().subscribe(setDocumentMetadata);
    return () => subscription?.unsubscribe();
  }, [client]);

  return (
    <div>
      <h1>{documentMetadata?.documentName || "Untitled"}</h1>
      <span>Type: {documentMetadata?.projectType}</span>
    </div>
  );
}
```

```js
// Other frameworks
const subscription = Velt.getDocumentMetadata().subscribe((documentMetadata) => {
  console.log("Current document metadata:", documentMetadata);
});
subscription?.unsubscribe();
```

To read or update metadata for documents that are not currently subscribed, use `fetchDocuments()` and `updateDocuments()`.

**Metadata in Multi-Document Setup:**

```jsx
// Subscribe to multiple documents with different metadata
setDocuments([
  {
    id: "project-main",
    metadata: { documentName: "Main Project", type: "project" },
  },
  {
    id: "project-tasks",
    metadata: { documentName: "Task List", type: "tasks" },
  },
  {
    id: "project-notes",
    metadata: { documentName: "Team Notes", type: "notes" },
  },
]);
```

**Dynamic Metadata from Database:**

```jsx
// Fetch document info from your database
async function loadDocument(docId: string) {
  const doc = await db.documents.findById(docId);

  setDocuments([
    {
      id: docId,
      metadata: {
        documentName: doc.title,
        createdBy: doc.authorId,
        lastModified: doc.updatedAt,
        permissions: doc.permissions,
      },
    },
  ]);
}
```

**Where documentName Appears:**

| Component | Usage |
|-----------|-------|
| VeltCommentsSidebar | Shows document name in header |
| VeltNotificationPanel | References document in notifications |
| Comments API | Included in comment data responses |

**Metadata Best Practices:**

| Practice | Description |
|----------|-------------|
| Always set documentName | Makes UI more user-friendly |
| Use consistent field names | Enables filtering across documents |
| Store only necessary data | Metadata is synced to all users |
| Avoid sensitive information | Metadata is visible to all document users |

**Verification:**
- [ ] documentName is set for all documents
- [ ] Document names appear correctly in Velt UI components
- [ ] Custom metadata fields are readable via `getDocumentMetadata()`
- [ ] Metadata updates reflect in all connected clients

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 6: Initialize Document
- `https://docs.velt.dev/key-concepts/overview#get-document-metadata` - Get Document Metadata
- `https://docs.velt.dev/api-reference/sdk/models/data-models#documentmetadata` - DocumentMetadata
- `https://docs.velt.dev/api-reference/sdk/api/api-methods#updatedocuments` - updateDocuments()

---

### 4.3 Generate and Manage Document IDs

**Impact: CRITICAL (Document ID determines which users see the same collaborative content)**

The document ID uniquely identifies a collaborative space. All users with the same document ID will see the same comments, presence, and collaboration data. Choose a strategy that makes documents shareable.

**Incorrect (random on every page load):**

```jsx
// Wrong: New ID every time - no collaboration possible
const documentId = Math.random().toString(36);

useSetDocument(documentId);  // Each user gets their own space
```

**Incorrect (hardcoded single value):**

```jsx
// Wrong: All users share one document
const documentId = "my-app-document";

useSetDocument(documentId);  // Everyone collaborates on the same doc
```

**Correct (URL-based with persistence):**

```jsx
// app/document/useCurrentDocument.ts
"use client";
import { useState, useEffect, useRef, useMemo } from "react";

interface CurrentDocument {
  documentId: string | null;
  documentName: string;
}

export function useCurrentDocument(): CurrentDocument {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    // 1. Check URL for documentId parameter first (enables sharing)
    const urlParams = new URLSearchParams(window.location.search);
    let docId = urlParams.get("documentId");

    if (docId) {
      // URL has documentId - use it and persist
      setDocumentId(docId);
      localStorage.setItem("app-document-id", docId);
    } else {
      // 2. Check localStorage for existing document
      const stored = localStorage.getItem("app-document-id");
      if (stored) {
        docId = stored;
      } else {
        // 3. Generate new document ID
        docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("app-document-id", docId);
      }

      // Update URL with documentId for shareability
      const newUrl = `${window.location.pathname}?documentId=${docId}`;
      window.history.replaceState({}, "", newUrl);

      setDocumentId(docId);
    }

    isInitialized.current = true;
  }, []);

  return useMemo(
    () => ({
      documentId,
      documentName: "My Collaborative Document",
    }),
    [documentId]
  );
}
```

**Document ID Strategies:**

| Strategy | Use Case | Example |
|----------|----------|---------|
| URL Parameter | Shareable links | `?documentId=doc-abc123` |
| Route Path | Resource-based | `/projects/123/editor` → doc ID: `project-123` |
| Database Record | Persistent docs | Doc ID from your database |
| User-specific | Personal docs | `user-${userId}-draft` |

**Route-Based Pattern (Next.js):**

```jsx
// app/documents/[docId]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useSetDocument } from "@veltdev/react";

export default function DocumentPage() {
  const { docId } = useParams();

  // Document ID comes from URL route
  useSetDocument(docId as string, { documentName: `Document ${docId}` });

  return <div>Document content</div>;
}
```

**Database-Backed Pattern:**

```jsx
// When creating a new document in your app
async function createDocument(name: string) {
  // Create document in your database
  const doc = await db.documents.create({ name });

  // Return the database ID to use as Velt documentId
  return doc.id;  // e.g., "clx123abc..."
}

// When loading a document
function DocumentEditor({ documentId }) {
  useSetDocument(documentId);  // Use your database ID

  return <Editor />;
}
```

**Multi-Document Pattern (Different Surfaces):**

```jsx
// Different document IDs for different collaboration surfaces
function Dashboard() {
  const { projectId } = useParams();

  // Main project document
  useSetDocument(`project-${projectId}`, { documentName: "Project" });

  return (
    <div>
      {/* Comments on main content use project-${projectId} */}
      <ProjectContent />

      {/* Separate document for chat sidebar */}
      <ChatSidebar documentId={`project-${projectId}-chat`} />
    </div>
  );
}
```

**Billing note:** Velt bills on Monthly Active Documents (MADs): a document counts once it receives at least one CRUD operation from a Velt feature in the calendar month. Documents that only initialize (connect without any comment, CRDT, reaction, recorder, or notification write) do not count. Stable, reused document IDs keep MAD counts predictable; random per-load IDs inflate them.

**Verification:**
- [ ] Document ID is deterministic (same users get same ID)
- [ ] Document ID is shareable via URL
- [ ] Multiple tabs with same URL show same collaboration data
- [ ] Different documents have different IDs
- [ ] Document ID persists across page refreshes

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 6: Initialize Document
- `https://docs.velt.dev/key-concepts/overview#documents` - Documents (properties, Monthly Active Documents)

---

### 4.4 Initialize Documents with setDocuments API

**Impact: CRITICAL (SDK will not function without calling setDocuments)**

The setDocuments method initializes collaborative spaces where users can interact. The SDK will NOT work without calling setDocuments - no comments, presence, or other features will function.

**Incorrect (missing setDocuments):**

```jsx
// Missing setDocuments - Velt features won't work
"use client";
import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_KEY" authProvider={authProvider}>
      <VeltComments />  {/* Won't work - no document set */}
      <div>My content</div>
    </VeltProvider>
  );
}
```

**Incorrect (setDocuments in same file as VeltProvider):**

```jsx
// Wrong: Don't call setDocuments in the same component as VeltProvider
"use client";
import { VeltProvider, useVeltClient } from "@veltdev/react";

export default function App() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      client.setDocuments([{ id: "doc-123" }]);  // Won't work - client not ready
    }
  }, [client]);

  return <VeltProvider apiKey="YOUR_KEY">...</VeltProvider>;
}
```

**Correct (separate component):**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { VeltInitializeDocument } from "@/components/velt/VeltInitializeDocument";

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_KEY" authProvider={authProvider}>
      <VeltInitializeDocument />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

```jsx
// components/velt/VeltInitializeDocument.tsx
"use client";
import { useEffect } from "react";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";
import { useCurrentDocument } from "@/app/document/useCurrentDocument";
import { useAppUser } from "@/app/userAuth/useAppUser";

export default function VeltInitializeDocument() {
  const { documentId, documentName } = useCurrentDocument();
  const { user } = useAppUser();

  // Get document setter hook
  const { setDocuments } = useSetDocuments();

  // Wait for Velt user to be authenticated before setting document
  const veltUser = useCurrentUser();

  // Set document in Velt. This is the resource where all Velt collaboration data will be scoped.
  useEffect(() => {
    if (!veltUser || !user || !documentId || !documentName) return;
    setDocuments([
      { id: documentId, metadata: { documentName: documentName } },
    ]);
  }, [veltUser, user, setDocuments, documentId, documentName]);

  return null;
}
```

**Using useSetDocument Hook (Alternative):**

```jsx
import { useSetDocument } from "@veltdev/react";

// Single document shorthand
useSetDocument("my-document-id", { documentName: "My Document" });
```

**setDocuments API Reference:**

```typescript
// Method signature
client.setDocuments(documents: Document[], options?: SetDocumentsRequestOptions): Promise<void>;

// Document shape
interface Document {
  id: string;                  // Unique document identifier
  metadata: {                  // Document metadata (documentName shows in Velt UI)
    documentName?: string;
    [key: string]: any;        // Custom metadata fields
  };
}

// Common SetDocumentsRequestOptions
interface SetDocumentsRequestOptions {
  organizationId?: string;     // Organization for the documents
  folderId?: string;           // Subscribe to documents in this folder
  allDocuments?: boolean;      // With folderId: subscribe to all documents in the folder
  locationId?: string;         // Filter to one location
  rootDocumentId?: string;     // Root document when several are subscribed
  context?: SetDocumentsContext; // Filter comments by Access Context fields
  debounceTime?: number;       // Per-call debounce override (ms)
  optimisticPermissions?: boolean; // false = wait for permission validation
}
```

`folderId` is an **option** (second argument), not a field on each document:

```jsx
// Wrong: folderId inside the document object is not part of the Document type
setDocuments([{ id: "doc-1", folderId: "folder-1", metadata: { documentName: "Doc 1" } }]);

// Correct: pass folderId in options
setDocuments(
  [{ id: "doc-1", metadata: { documentName: "Doc 1" } }],
  { folderId: "folder-1" }
);
```

**Behavior to rely on:**
- Up to 30 documents per call. The first document is the root document; cursors, presence, huddle, and live state sync use the root document, while comments, notifications, recorder, and reactions read and write across all subscribed documents.
- Documents the user cannot access are filtered out instead of failing the whole call. With `folderId` + `allDocuments: true`, up to 50 documents are retrieved.
- Since v6.0.5, an identical repeat call (same documents and options) is ignored, so calling `setDocuments()` on every render does not re-initialize documents or refetch comments. An identical repeat also does not refresh permissions. Calling it with a narrower set re-pins to just those documents.

**Folder context in permissions:** when you set `folderId`, Real-Time Permission Provider requests for `document` resources carry `resource.parentFolderId` (from `setDocuments`, `getNotifications`, and `setNotifications`). Only document requests carry it, and the key is omitted when the document has no folder, so check with `'parentFolderId' in resource`. It is context for your endpoint, never an input to Velt's own access decision.

```typescript
// PermissionQuery.resource shape (received by your Permission Provider)
{
  type: PermissionResourceType;
  id: string;
  source: PermissionSource;
  organizationId: string;
  context?: Context;
  parentFolderId?: string;   // only on document requests whose document has a folder
}
```

**Multiple Documents:**

```jsx
// Subscribe to multiple documents at once
setDocuments([
  { id: "doc-1", metadata: { documentName: "Document 1" } },
  { id: "doc-2", metadata: { documentName: "Document 2" } },
  { id: "doc-3", metadata: { documentName: "Document 3" } },
]);
```

**Angular/Vue/HTML Pattern:**

```javascript
// After initVelt() and setVeltAuthProvider()
await client.setDocuments([
  { id: "unique-document-id", metadata: { documentName: "My Document" } }
]);

// Or for HTML
await Velt.setDocuments([
  { id: "unique-document-id", metadata: { documentName: "My Document" } }
]);
```

**Key Rules:**

1. Call setDocuments AFTER user is authenticated (after authProvider / setVeltAuthProvider)
2. Call setDocuments in a child component, not with VeltProvider
3. Document ID must be consistent for all users collaborating
4. Wait for useCurrentUser to return a value before setting document

**Verification:**
- [ ] setDocuments is called after user authentication
- [ ] setDocuments is in a child component of VeltProvider
- [ ] Document ID is consistent across sessions/users
- [ ] VeltComments or other features show content after setup
- [ ] No "document not found" errors in console
- [ ] `folderId` is passed in the options argument, not inside a document object
- [ ] No more than 30 documents per call

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 6: Initialize Document
- `https://docs.velt.dev/key-concepts/overview#subscribe-to-documents` - Subscribe to Documents (options, 30-document limit, root document)
- `https://docs.velt.dev/key-concepts/overview#subscribe-to-a-folder` - Subscribe to a folder
- `https://docs.velt.dev/api-reference/sdk/api/api-methods#setdocuments` - setDocuments() behavior updates
- `https://docs.velt.dev/api-reference/sdk/models/data-models#setdocumentsrequestoptions` - SetDocumentsRequestOptions
- `https://docs.velt.dev/key-concepts/overview#c-real-time-permission-provider` - Folder context on document requests

---

### 4.5 Use Locations for Sub-Areas Within a Document

**Impact: MEDIUM (Locations partition a document (slides, video timestamps, dashboard filters) so comments and presence group correctly without creating extra documents)**

A location is an optional subspace inside a document. Use it for slides in a deck, timestamps in a video, or filters on a dashboard. Do not create a separate document per sub-area: everyone with access to the document can access all its locations, and access control cannot be set per location. The sidebar groups comments by location automatically.

**Incorrect (one document per slide):**

```jsx
// Splits one presentation into many documents: separate presence, separate access
setDocuments([{ id: `deck-42-slide-${slideIndex}`, metadata: { documentName: `Slide ${slideIndex}` } }]);
```

**Correct (React / Next.js):**

```jsx
import { useEffect } from "react";
import { useSetLocations, useVeltClient } from "@veltdev/react";

function SlideLocation({ slideId, slideTitle }) {
  // Hook
  const { setLocations } = useSetLocations();

  useEffect(() => {
    setLocations([{ id: slideId, locationName: slideTitle }]);
  }, [slideId, slideTitle]);

  return null;
}

// API Method
const { client } = useVeltClient();
await client.setLocations(
  [
    { id: "slide-1", locationName: "Slide 1" },
    { id: "slide-2", locationName: "Slide 2" },
  ],
  { rootLocationId: "slide-2" }
);
```

**Correct (Other Frameworks):**

```js
await Velt.setLocations(
  [
    { id: "slide-1", locationName: "Slide 1" },
    { id: "slide-2", locationName: "Slide 2" },
  ],
  { rootLocationId: "slide-2" }
);

// Append more locations without replacing the current ones
await Velt.setLocations([{ id: "slide-3", locationName: "Slide 3" }], { appendLocation: true });
```

**Location object:**

| Field | Rule |
|-------|------|
| `id` | String or number. Optional when `locationName` is set. An `id` of `0` is valid and takes precedence over `locationName` |
| `locationName` | Non-empty display name shown in components like `VeltCommentsSidebar`. Identifies the location when `id` is omitted |
| custom fields | Any extra keys you need |

**Several locations on one page:** add `data-velt-location-id` to each location's container so new comments attach to the right location.

```html
<div data-velt-location-id="slide-1">...</div>
<div data-velt-location-id="slide-2">...</div>
```

**Cleanup:** `unsetLocationsIds()` with no arguments removes all locations; pass ids to remove specific ones. Since v6.0.0-beta.9, `removeLocations()` with no arguments clears the current location.

**Verification:**
- [ ] Locations are set after the document is set, inside a child of `VeltProvider`
- [ ] Each location has an `id` or a non-empty `locationName`
- [ ] The first location (or `rootLocationId`) is the one features write to by default
- [ ] Multi-location pages use `data-velt-location-id` containers

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#locations - Locations (properties, Subscribe to Locations, Location Boundaries)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setlocations - setLocations()
- https://docs.velt.dev/api-reference/sdk/api/api-methods#removelocations - removeLocations()
- https://docs.velt.dev/get-started/advanced#locations - Locations

---

## 5. Config

**Impact: HIGH**

API keys, environment variables, and SDK-wide configuration. Includes console.velt.dev setup, domain whitelisting, auth token security practices, Firestore persistent cache, proxy routing, unstyled mode, and v6 modular feature loading.

### 5.1 Call enableFirestorePersistentCache Before Authentication to Enable Offline and Multi-Tab Sync

**Impact: HIGH (Enables offline reads and multi-tab sync via Firestore persistent local cache; calling it after sign-in has no effect)**

`enableFirestorePersistentCache()` enables Firestore offline persistence and multi-tab synchronization. Call it before the user is authenticated (before `identify()` / `setVeltAuthProvider()`). Once the user is signed in, enabling it no longer activates offline reads. There is no `VeltProvider` config key for this; it is a client method only.

**Incorrect (called after VeltProvider already authenticated via authProvider):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function MyComponent() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // Wrong: the authProvider prop already signed the user in,
    // so this call comes too late to activate offline reads
    client.enableFirestorePersistentCache({ ha: true });
  }, [client]);
}
```

**Correct (React: enable the cache, then authenticate from a child component):**

When you need the persistent cache in React, do not pass `authProvider` as a prop. Authenticate with `client.setVeltAuthProvider()` from a child component so you control the order.

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from '@veltdev/react';
import { VeltAuthWithCache } from '@/components/velt/VeltAuthWithCache';

export default function Page() {
  return (
    <VeltProvider apiKey="YOUR_VELT_API_KEY">
      <VeltAuthWithCache />
      {/* App content */}
    </VeltProvider>
  );
}
```

```jsx
// components/velt/VeltAuthWithCache.tsx
"use client";
import { useEffect } from 'react';
import { useVeltClient } from '@veltdev/react';
import { useAppUser } from '@/app/userAuth/AppUserContext';

export function VeltAuthWithCache() {
  const { client } = useVeltClient();
  const { user } = useAppUser();

  useEffect(() => {
    if (!client || !user) return;

    // 1. Enable the cache first
    client.enableFirestorePersistentCache({ ha: true });

    // 2. Then authenticate
    client.setVeltAuthProvider({
      user,
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
        });
        const { token } = await resp.json();
        return token;
      },
    });
  }, [client, user]);

  return null;
}
```

**Correct (non-React / vanilla JS):**

```js
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_VELT_API_KEY');

// Call before setting auth provider
client.enableFirestorePersistentCache({ ha: true });

await client.setVeltAuthProvider({
  user,
  generateToken: async () => {
    const resp = await fetch("/api/velt/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
});
```

**Disabling the cache:**

```js
// Revert to the default non-persistent mode
client.disableFirestorePersistentCache({ ha: true });
```

**Method signatures:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `enableFirestorePersistentCache` | `(config?: { ha?: boolean }): void` | Enable Firestore offline persistence and multi-tab synchronization |
| `disableFirestorePersistentCache` | `(config?: { ha?: boolean }): void` | Disable persistence and revert to the default non-persistent mode |

Both are client methods with no React hook. In React, call them on `client` from `useVeltClient()`; in other frameworks, call them on the client returned by `initVelt()` or on the global `Velt`.

**Verification:**
- [ ] `enableFirestorePersistentCache()` runs before `identify()` / `setVeltAuthProvider()`
- [ ] In React, the `authProvider` prop is not used together with a post-mount cache call; auth happens via `client.setVeltAuthProvider()` after enabling the cache
- [ ] No invented `config` key (such as `firestorePersistentCache`) is passed to `VeltProvider`

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/api-methods#enablefirestorepersistentcache - enableFirestorePersistentCache()
- https://docs.velt.dev/api-reference/sdk/api/api-methods#disablefirestorepersistentcache - disableFirestorePersistentCache()
- https://docs.velt.dev/get-started/advanced#error-handling-in-authentication - client.setVeltAuthProvider() from a React component

---

### 5.2 Configure API Key from Console

**Impact: HIGH (API key is required for all Velt functionality)**

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

Velt uses a single API key on the client. There is no public/private key pair: the API key is paired with your allowed domains list (Managed Domains) to restrict where it can be used, so it is safe in client-side code. For backend calls to Velt's REST APIs (including JWT generation), generate a separate Auth Token in the Velt Console and send it as the `x-velt-auth-token` header alongside `x-velt-api-key`. Keep the Auth Token server-side only.

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
- `https://docs.velt.dev/get-started/quickstart` - Step 2: Get Your API Key
- `https://docs.velt.dev/security/auth-tokens` - Generating Auth Tokens

---

### 5.3 Configure Reverse Proxy Routing via proxyConfig

**Impact: HIGH (Routes Velt SDK traffic through your own proxy hosts for enterprise network control; replaces the deprecated apiProxyDomain)**

Use the `proxyConfig` field on the `VeltProvider` `config` prop (React) or the second argument to `initVelt()` (other frameworks) to route Velt SDK traffic through reverse proxies on your own domain. It replaces the deprecated top-level `apiProxyDomain` field. For deploying the proxy servers themselves (Cloudflare Workers, nginx), use the `velt-proxy-server-best-practices` skill.

**Incorrect (deprecated top-level apiProxyDomain field):**

```jsx
// DEPRECATED: use proxyConfig.apiHost instead
<VeltProvider
  apiKey="YOUR_VELT_API_KEY"
  config={{ apiProxyDomain: 'https://proxy.example.com/api' }}
>
  {/* app */}
</VeltProvider>
```

**Correct (React: nested proxyConfig object):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      config={{
        proxyConfig: {
          cdnHost: 'https://cdn-proxy.yourdomain.com',
          apiHost: 'https://api-proxy.yourdomain.com',
          v2DbHost: 'https://v2db-proxy.yourdomain.com',
          v1DbHost: 'https://v1db-proxy.yourdomain.com',
          storageHost: 'https://storage-proxy.yourdomain.com',
          authHost: 'https://auth-proxy.yourdomain.com',
          forceLongPolling: false,
        },
      }}
    >
      {/* app */}
    </VeltProvider>
  );
}
```

**Correct (non-React: Angular, Vue, HTML):**

```typescript
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_VELT_API_KEY', {
  proxyConfig: {
    cdnHost: 'https://cdn-proxy.yourdomain.com',
    apiHost: 'https://api-proxy.yourdomain.com',
    v2DbHost: 'https://v2db-proxy.yourdomain.com',
    v1DbHost: 'https://v1db-proxy.yourdomain.com',
    storageHost: 'https://storage-proxy.yourdomain.com',
    authHost: 'https://auth-proxy.yourdomain.com',
    forceLongPolling: false,
  },
});
```

**ProxyConfig interface (v5.0.2-beta.11+):**

| Field | Type | Upstream it replaces |
|-------|------|----------------------|
| `cdnHost` | `string` | `cdn.velt.dev` (SDK bundle). Velt appends `/lib/sdk@[VERSION]/velt.js` |
| `apiHost` | `string` | `api.velt.dev`. Replaces deprecated `apiProxyDomain` |
| `v2DbHost` | `string` | `firestore.googleapis.com` (persistence database) |
| `v1DbHost` | `string` | `*.firebaseio.com` (ephemeral realtime database). The SDK host-locks RTDB so shard redirects stay on your proxy |
| `storageHost` | `string` | `firebasestorage.googleapis.com` (attachments, recordings) |
| `authHost` | `string` | `identitytoolkit.googleapis.com` + `securetoken.googleapis.com`. Cached in `localStorage` at init so token refreshes on reload go through the proxy |
| `forceLongPolling` | `boolean` | Long-polling instead of WebSockets for the database connections. Default: `false` |

All fields are optional. Configure only the hosts you proxy; omitted fields talk to the default upstream directly. Each proxy must forward requests without modifying headers or content.

Since v6.0.0-beta.7, the boot-time auth request on page reload also routes through `proxyConfig.authHost`. No configuration change is required.

**Subresource Integrity:** `integrity: true` is a sibling of `proxyConfig` in the same config object (default `false`). It lets the browser verify the SDK bundle, which matters most when `cdnHost` points at your proxy.

```jsx
<VeltProvider
  apiKey="YOUR_VELT_API_KEY"
  config={{ integrity: true, proxyConfig: { cdnHost: 'https://cdn-proxy.yourdomain.com' } }}
>
  {/* app */}
</VeltProvider>
```

**Migrating from apiProxyDomain:**

```jsx
// BEFORE: deprecated
<VeltProvider apiKey="YOUR_VELT_API_KEY" config={{ apiProxyDomain: 'https://proxy.example.com/api' }} />

// AFTER: use proxyConfig.apiHost
<VeltProvider apiKey="YOUR_VELT_API_KEY" config={{ proxyConfig: { apiHost: 'https://proxy.example.com/api' } }} />
```

**Verification:**
- [ ] `proxyConfig` is nested under the `config` prop on `VeltProvider` (or the second `initVelt()` argument), not at the top level
- [ ] `apiProxyDomain` replaced with `proxyConfig.apiHost` in all environments
- [ ] `forceLongPolling: true` set only if the reverse proxy does not support WebSocket upgrades
- [ ] Only the hosts being proxied are specified; unused fields are omitted
- [ ] CSP allows your proxy domains (see the proxy server skill)

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server - "Quick start", "Configure each service"
- https://docs.velt.dev/api-reference/sdk/models/data-models#proxyconfig - ProxyConfig
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltproviderconfig - VeltProviderConfig (`integrity`, deprecated `apiProxyDomain`)

---

### 5.4 Scope Feature Loading with featureAllowList and preload Methods (v6 Modular SDK)

**Impact: MEDIUM-HIGH (In the v6 modular SDK, featureAllowList controls which feature chunks preload and which features may run; a missing key leaves tag-only features inert)**

Since v6.0.0-beta.1 each Velt feature is its own lazy chunk. Pass `featureAllowList` at init to preload only the features you use. Omit it to keep the default: every feature chunk preloads in the background. When set, it is also an allow-list: features not listed are suppressed unless something enables them on demand.

**Incorrect (allow-list omits a feature that is rendered):**

```jsx
// VeltNotificationsTool and VeltUserInviteTool are rendered,
// but only comments and presence are allowed
<VeltProvider apiKey="YOUR_VELT_API_KEY" config={{ featureAllowList: ['comment', 'presence'] }}>
  <VeltComments />
  <VeltNotificationsTool />
  <VeltUserInviteTool />
</VeltProvider>
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider, VeltComments, VeltPresence, VeltNotificationsTool } from "@veltdev/react";

export default function Page() {
  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      config={{ featureAllowList: ['comment', 'presence', 'notification'] }}
    >
      <VeltComments />
      <VeltPresence />
      <VeltNotificationsTool />
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```js
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_VELT_API_KEY', {
  featureAllowList: ['comment', 'presence', 'notification'],
});
```

**Warm or load a chunk on demand with `preload*()`:**

```jsx
// React: from a child component of VeltProvider
const { client } = useVeltClient();

const openSidebar = async () => {
  await client.preloadComment();
  client.getCommentElement().openCommentSidebar();
};
```

```js
// Other frameworks
await Velt.preloadUserInvite();
```

**Behavior to rely on:**
- `preload*()` methods (`preloadComment()`, `preloadPresence()`, `preloadNotification()`, `preloadRecorder()`, `preloadCrdt()`, `preloadUserInvite()`, and the rest) return `Promise<void>`, are idempotent, and never throw.
- Calling `getXElement()` or `preloadX()` for a feature omitted from `featureAllowList` auto-enables it.
- Tag-only features `userInvite`, `userRequest`, and `videoPlayer` have no element accessor. Load them via `featureAllowList` or `preloadUserInvite()` / `preloadUserRequest()` / `preloadVideoPlayer()`.
- Feature tags placed before their chunk loads render inert and upgrade in place once the chunk arrives.
- `getXElement()` accessors return immediately; calls made before the chunk loads are queued or bridged, so existing code keeps working.

**Valid `featureAllowList` keys:** `'comment'`, `'cursor'`, `'presence'`, `'huddle'`, `'recorder'`, `'notification'`, `'reaction'`, `'arrow'`, `'tag'`, `'rewriter'`, `'selection'`, `'area'`, `'activity'`, `'views'`, `'userInvite'`, `'userRequest'`, `'videoPlayer'`, `'crdt'`, `'liveStateSync'`. Live Selection uses `'selection'` here, not `'liveSelection'`.

**Verification:**
- [ ] Either `featureAllowList` is omitted (preload everything), or it lists every feature the app renders
- [ ] Tag-only features (`userInvite`, `userRequest`, `videoPlayer`) are allow-listed or preloaded
- [ ] `featureAllowList` is inside the `config` prop (React) or the second `initVelt()` argument, not a top-level prop
- [ ] Keys use the modular names above (for example `'notification'`, not `'notifications'`)

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - Config (`featureAllowList`, valid modular feature keys)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadcomment - Modular SDK / Chunk Preloading
- https://docs.velt.dev/ui-customization/reference/feature-flags - Provider `config` object

---

### 5.5 Secure Auth Tokens on Server Side

**Impact: HIGH (Auth token exposure enables unauthorized JWT generation)**

The Velt Auth Token authorizes backend calls to Velt's REST APIs, including JWT generation. It must NEVER be exposed to the client. Store it in server-side environment variables only and send it as the `x-velt-auth-token` header from your server.

**Incorrect (auth token in client code):**

```jsx
// CRITICAL SECURITY ISSUE: Auth token exposed to browser
"use client";

const VELT_AUTH_TOKEN = "bd4d5226050470b6c658054fcdf1092a";

async function generateToken() {
  // This code runs in the browser - token is visible!
  const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
    method: "POST",
    headers: {
      "x-velt-auth-token": VELT_AUTH_TOKEN,  // Exposed!
    },
  });
}
```

**Incorrect (auth token in public env var):**

```bash
# .env.local - WRONG: NEXT_PUBLIC_ prefix makes it client-accessible
NEXT_PUBLIC_VELT_AUTH_TOKEN=bd4d5226050470b6c658054fcdf1092a
```

**Correct (server-side only):**

```bash
# .env.local - No NEXT_PUBLIC_ prefix = server-only
NEXT_PUBLIC_VELT_API_KEY=your-api-key
VELT_AUTH_TOKEN=your-auth-token-from-console
```

```typescript
// app/api/velt/token/route.ts - Server-side only
import { NextRequest, NextResponse } from "next/server";

// The API key is client-safe; the auth token is only readable on the server
const VELT_API_KEY = process.env.NEXT_PUBLIC_VELT_API_KEY!;
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    // Validate the caller's app session here before issuing a token
    const { userId, organizationId, name, email, isAdmin } = await req.json();

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Missing userId or organizationId' }, { status: 400 });
    }

    if (!VELT_AUTH_TOKEN) {
      return NextResponse.json({ error: 'Server configuration error: missing VELT_AUTH_TOKEN' }, { status: 500 });
    }

    // Body must be wrapped in `data`; organizationId goes in permissions.resources
    const body = {
      data: {
        userId,
        userProperties: {
          name,
          email,
          isAdmin: typeof isAdmin === "boolean" ? isAdmin : false,
        },
        permissions: {
          resources: [{ type: "organization", id: organizationId }],
        },
      },
    };

    const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-velt-api-key": VELT_API_KEY,
        "x-velt-auth-token": VELT_AUTH_TOKEN,  // Safe: server-side only
      },
      body: JSON.stringify(body),
    });

    const json = await response.json();
    const token = json?.result?.data?.token;

    if (!response.ok || !token) {
      return NextResponse.json({ error: json?.error?.message || "Failed to generate token" }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Key vs Token Security:**

| Credential | Client-Safe? | Purpose | Prefix |
|------------|--------------|---------|--------|
| API Key | Yes (restricted by Managed Domains) | Identifies your app | NEXT_PUBLIC_VELT_API_KEY |
| Auth Token | NO | Authorizes REST API calls, generates JWT tokens | VELT_AUTH_TOKEN (no NEXT_PUBLIC_) |

**Environment Variable Naming:**

```bash
# Next.js
VELT_AUTH_TOKEN=secret          # Server-only (correct)
NEXT_PUBLIC_VELT_API_KEY=key    # Client-accessible (OK for API key)

# Vite
VELT_AUTH_TOKEN=secret          # Server-only (correct)
VITE_VELT_API_KEY=key           # Client-accessible (OK for API key)

# Create React App
VELT_AUTH_TOKEN=secret          # Server-only (if using backend)
REACT_APP_VELT_API_KEY=key      # Client-accessible (OK for API key)
```

**Security Checklist:**

| Check | Status |
|-------|--------|
| Auth token not in any NEXT_PUBLIC_ variable | Required |
| Auth token not imported in any client component | Required |
| Auth token only used in API routes/server actions | Required |
| .env files in .gitignore | Required |
| Token endpoint validates user session | Recommended |
| Auth token rotated periodically (auth tokens are long-lived) | Recommended |

**What Happens If Auth Token Is Exposed:**

An attacker with your auth token can:
- Generate JWT tokens for any user
- Impersonate users in your application
- Access/modify collaboration data through the REST APIs
- Potentially cause data breaches

**Verification:**
- [ ] Auth token only in server-side env vars (no NEXT_PUBLIC_)
- [ ] Auth token only used in API routes or server actions
- [ ] .env.local and .env files are in .gitignore
- [ ] Network tab doesn't show auth token in any request from browser
- [ ] Token generation endpoint validates user session

**Source Pointers:**
- `https://docs.velt.dev/security/auth-tokens` - Generating Auth Tokens
- `https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens` - JWT Authentication Tokens (Step 2: Generate Auth Token)
- `https://docs.velt.dev/get-started/quickstart` - Step 2: Get Your API Key (note on API key vs Auth Token)

---

### 5.6 Use setUnstyledMode for Headless Styling Instead of Overriding Every Velt Style

**Impact: MEDIUM (Removes Velt's built-in visual styling in one call while keeping layout and positioning, so custom CSS does not fight default styles)**

When you style Velt components entirely with your own CSS, call `setUnstyledMode(true)` (v6.0.0-beta.10+). It removes Velt's visual styling from styles in the page head and inside shadow roots, including styles injected after the call. By default it keeps layout and positioning styles so components still work. It is reversible at any time.

**Incorrect (fighting every default style with !important overrides):**

```css
/* Brittle: each Velt release can add new visual rules you must override again */
velt-comment-dialog * {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  font-family: inherit !important;
}
```

**Correct (React / Next.js):**

```jsx
"use client";
import { useEffect } from "react";
import { useVeltClient } from "@veltdev/react";

export function VeltHeadlessStyles() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // Remove Velt's visual styling; keep layout/positioning (default)
    client.setUnstyledMode(true);
  }, [client]);

  return null;
}

// Strip everything down to raw browser defaults
// client.setUnstyledMode(true, { keepFunctionalStyles: false });

// Restore all Velt styling
// client.setUnstyledMode(false);
```

**Correct (Other Frameworks):**

```js
Velt.setUnstyledMode(true);
Velt.setUnstyledMode(true, { keepFunctionalStyles: false });
Velt.setUnstyledMode(false);
```

**Params:**

| Param | Type | Description |
|-------|------|-------------|
| `value` | `boolean` | `true` removes Velt's visual styling; `false` restores it |
| `config?` | `{ keepFunctionalStyles?: boolean }` | Default `true` keeps layout and positioning styles. Set `false` to strip to browser defaults |

Returns `void`. There is no React hook; call it on `client` from `useVeltClient()`.

**Related options:**
- `config={{ globalStyles: false }}` on `VeltProvider` stops Velt's global stylesheet from loading at all. Use it only when you own all CSS.
- For theming with `--velt-*` CSS variables or wireframes, follow the UI customization guide instead; unstyled mode is for fully headless styling.

**Verification:**
- [ ] `setUnstyledMode(true)` is called once after the client is available, not on every render
- [ ] `keepFunctionalStyles` left at the default `true` unless you re-implement layout and positioning yourself
- [ ] Your stylesheet reaches Velt elements (shadow DOM off or `injectCustomCss()` for selector-based CSS)

**Source Pointers:**
- https://docs.velt.dev/get-started/advanced#setunstyledmode - setUnstyledMode()
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setunstyledmode - setUnstyledMode() API reference
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - Config (`globalStyles`)
- https://docs.velt.dev/ui-customization/setup - "Choose your shadow DOM strategy"

---

### 5.7 Whitelist Domains in Velt Console

**Impact: HIGH (Requests from non-whitelisted domains will be rejected)**

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
| Preview | *.vercel.app (wildcard subdomain) | `*.vercel.app` |
| Staging | staging.domain.com | `staging.myapp.com` |
| Production | domain.com | `myapp.com` |

**Wildcard Patterns and Automation:**

Wildcard subdomains (for example `*.example.com`) are supported. When you manage many environments (preview deployments, per-tenant subdomains), add, list, and remove allowed domains from your backend with the workspace domain REST APIs. They require your API key and Auth Token, so call them server-side only.

```bash
# Server-side only: requires x-velt-auth-token
curl -X POST https://api.velt.dev/v2/workspace/domains/add \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: $VELT_API_KEY" \
  -H "x-velt-auth-token: $VELT_AUTH_TOKEN" \
  -d '{ "data": { "domains": ["staging.myapp.com", "*.vercel.app"] } }'
```

The API strips the protocol and `www` prefix and stores bare domains. Up to 100 domains per request.

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
- `https://docs.velt.dev/get-started/quickstart` - Step 3: Safelist Your Domain
- `https://docs.velt.dev/api-reference/rest-apis/v2/workspace/add-domain` - Add Domains
- `https://docs.velt.dev/api-reference/rest-apis/v2/workspace/domains-get` - Get Domains
- `https://docs.velt.dev/api-reference/rest-apis/v2/workspace/delete-domain` - Delete Domains

---

## 6. Project Structure

**Impact: MEDIUM**

Recommended folder organization for Velt-related files. Based on patterns observed in official sample applications. Covers separation of app auth from Velt integration.

### 6.1 Organize Velt Files in components/velt

**Impact: MEDIUM (Consistent folder structure improves maintainability)**

Based on Velt sample applications, organize all Velt-specific components and hooks in a dedicated folder structure. This separates Velt integration from your application logic.

**Incorrect (scattered files):**

```
app/
├── page.tsx          # VeltProvider, authProvider, setDocument all here
├── components/
│   ├── Header.tsx    # VeltComments mixed in
│   ├── Sidebar.tsx   # VeltPresence mixed in
│   └── Editor.tsx    # More Velt components
└── utils/
    └── auth.ts       # Velt auth mixed with app auth
```

**Correct (organized structure):**

```
app/
├── layout.tsx                    # Server component - wraps AppProviders
├── page.tsx                      # Client component - wraps VeltProvider
├── userAuth/                     # App-level authentication
│   ├── AppProviders.tsx          # Client wrapper for auth providers
│   ├── AppUserContext.tsx        # App user state management
│   └── useAppUser.ts             # Hook to get current app user
├── document/                     # Document ID management
│   ├── useCurrentDocument.ts     # Hook for document ID generation
│   └── DocumentContext.tsx       # Optional: document state context
└── api/
    └── velt/
        └── token/
            └── route.ts          # JWT token generation endpoint

components/
└── velt/                         # All Velt-specific components
    ├── VeltInitializeUser.tsx    # useVeltAuthProvider hook
    ├── VeltInitializeDocument.tsx # Document setup component
    ├── VeltCollaboration.tsx     # Main collaboration wrapper
    ├── VeltTools.tsx             # Optional: tool buttons
    └── ui-customization/         # ALL Velt UI customization lives here
        ├── VeltCustomization.tsx # The single <VeltWireframe> root (if wireframing)
        ├── VeltCommentDialogWf.tsx # One file per customized surface
        └── styles.css            # ONE stylesheet for all Velt CSS
```

Keep exactly one `<VeltWireframe>` in the whole app (in `VeltCustomization.tsx`). Extra roots merge in an order-dependent way and conflict. For CSS-only or primitives-only customization, a single stylesheet plus the components in `VeltCollaboration.tsx` is enough; adopt the full `ui-customization/` folder when you start wireframing. The Velt UI Customization Plugin also writes its generated code under `components/velt/ui-customization/`.

**Recommended File Contents:**

**app/layout.tsx (Server Component):**
```jsx
import { AppProviders } from "@/app/userAuth/AppProviders";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

**app/userAuth/AppProviders.tsx:**
```jsx
"use client";
import { AppUserProvider } from "./AppUserContext";

export function AppProviders({ children }) {
  return (
    <AppUserProvider>
      {children}
    </AppUserProvider>
  );
}
```

**app/page.tsx:**
```jsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import DocumentCanvas from "@/components/document/DocumentCanvas";

export default function Home() {
  const { authProvider } = useVeltAuthProvider();

  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider
      apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}
      authProvider={authProvider}
    >
      <VeltCollaboration />
      <DocumentCanvas />
    </VeltProvider>
  );
}
```

**components/velt/VeltCollaboration.tsx:**
```jsx
"use client";
import { useEffect } from "react";
import { VeltComments, VeltCommentsSidebar, useVeltClient } from "@veltdev/react";
import { useAppUser } from "@/app/userAuth/AppUserContext";
import VeltInitializeDocument from "./VeltInitializeDocument";
import { VeltCustomization } from "./ui-customization/VeltCustomization";

export function VeltCollaboration() {
  const { isUserLoggedIn } = useAppUser();
  const { client } = useVeltClient();

  useEffect(() => {
    if (isUserLoggedIn === false && client) {
      client.signOutUser();
    }
  }, [isUserLoggedIn, client]);

  const groupConfig = {
    enable: false
  };

  return (
    <>
      <VeltInitializeDocument />
      <VeltComments shadowDom={false} textMode={false} />
      <VeltCommentsSidebar groupConfig={groupConfig} />
      <VeltCustomization />
    </>
  );
}
```

**Folder Purpose Reference:**

| Folder | Purpose |
|--------|---------|
| app/userAuth/ | App-level auth (your auth system) |
| app/document/ | Document ID generation and management |
| app/api/velt/ | Server-side Velt endpoints (JWT) |
| components/velt/ | Velt component wrappers and setup |

**Verification:**
- [ ] All Velt imports are in components/velt/ or page.tsx
- [ ] App auth is separate from Velt auth
- [ ] Document management has dedicated folder
- [ ] API routes for Velt are in app/api/velt/
- [ ] Clear separation between app logic and Velt integration

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Complete setup guide
- `https://docs.velt.dev/ui-customization/setup` - "Set up the folder structure"
- `https://docs.velt.dev/get-started/ui-customization-plugin` - "How It Works" (generated code location)

---

### 6.2 Separate App Auth from Velt Integration

**Impact: MEDIUM (Clean separation enables independent testing and maintenance)**

Keep your application's authentication system separate from Velt integration. Your app owns user authentication; Velt receives user data from your auth system.

**Incorrect (tightly coupled):** Mixing your app's auth provider (Auth0, Firebase, etc.) directly with VeltProvider in a single component makes it hard to test, maintain, or swap auth providers. Keep them separated into layers.

**Correct (separated layers):**

**Layer 1: App Authentication (app/userAuth/)**

```jsx
// app/userAuth/AppUserContext.tsx - Your app's user management
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";  // Or Firebase, NextAuth, etc.

// Your app's user type
interface AppUser {
  userId: string;
  organizationId: string;
  name: string;
  email: string;
  photoUrl?: string;
}

interface AppUserContextType {
  user: AppUser | undefined;
  isUserLoggedIn: boolean | undefined;
  login: () => void;
  logout: () => void;
}

const AppUserContext = createContext<AppUserContextType | undefined>(undefined);

export function AppUserProvider({ children }) {
  const { user: auth0User, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [user, setUser] = useState<AppUser | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      // Transform auth provider user to your app's user format
      setUser({
        userId: auth0User.sub!,
        organizationId: auth0User["https://myapp.com/org_id"] || "default-org",
        name: auth0User.name!,
        email: auth0User.email!,
        photoUrl: auth0User.picture,
      });
    } else {
      setUser(undefined);
    }
  }, [isAuthenticated, auth0User]);

  return (
    <AppUserContext.Provider
      value={{
        user,
        isUserLoggedIn: isAuthenticated,
        login: loginWithRedirect,
        logout: () => logout({ returnTo: window.location.origin }),
      }}
    >
      {children}
    </AppUserContext.Provider>
  );
}

export function useAppUser() {
  const context = useContext(AppUserContext);
  if (!context) throw new Error("useAppUser must be within AppUserProvider");
  return context;
}
```

**Layer 2: Velt Auth Integration (components/velt/)**

```jsx
// components/velt/VeltInitializeUser.tsx - Bridge to Velt
"use client";
import { useMemo } from "react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/useAppUser";

export function useVeltAuthProvider() {
  const { user } = useAppUser();  // Get user from your app's auth

  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;

    return {
      user: {
        userId: user.userId,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
      },
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            organizationId: user.organizationId,
            email: user.email,
          }),
        });
        const { token } = await resp.json();
        return token;
      },
    };
  }, [user]);

  return { authProvider };
}
```

**Layer 3: App Pages (app/)**

```jsx
// app/page.tsx - Compose the layers
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { useAppUser } from "@/app/userAuth/useAppUser";

export default function Home() {
  const { isUserLoggedIn, login } = useAppUser();
  const { authProvider } = useVeltAuthProvider();

  // Show login if not authenticated
  if (!isUserLoggedIn) {
    return <button onClick={login}>Sign In</button>;
  }

  // Wait for Velt auth to be ready
  if (!authProvider) {
    return <div>Loading collaboration...</div>;
  }

  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!} authProvider={authProvider}>
      {/* App content with Velt features */}
    </VeltProvider>
  );
}
```

**Benefits of Separation:**

| Benefit | Description |
|---------|-------------|
| Independent testing | Test app auth without Velt, test Velt with mock users |
| Swap auth providers | Change from Auth0 to Firebase without touching Velt code |
| Clear data flow | User data flows: Auth Provider → AppUser → Velt |
| Easier debugging | Isolate issues to app auth vs Velt integration |

**Data Flow Diagram:**

```
[Auth Provider]     →     [AppUserContext]     →     [VeltAuthProvider]
(Auth0/Firebase)          (Your app's format)        (Velt's format)
     ↓                           ↓                          ↓
   Login                    useAppUser()            VeltProvider
   Logout                   User state              authProvider prop
```

**Verification:**
- [ ] App auth works without Velt being set up
- [ ] Velt auth receives user from useAppUser(), not directly from auth provider
- [ ] Login/logout is handled by app auth, not Velt
- [ ] User format transformation happens in AppUserContext
- [ ] VeltInitializeUser only bridges to Velt API

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
- `https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens` - JWT Authentication Tokens
- `https://docs.velt.dev/ui-customization/setup` - "Set up the folder structure"

---

## 7. Routing Surfaces

**Impact: MEDIUM**

Where and how to mount Velt UI components in your application. Covers the VeltCollaboration wrapper pattern and component placement best practices.

### 7.1 Create VeltCollaboration Wrapper Component

**Impact: MEDIUM (Centralizes Velt component mounting and lifecycle management)**

Create a single VeltCollaboration component that mounts all necessary Velt components and handles lifecycle events like sign-out. This centralizes Velt UI management.

**Incorrect (scattered Velt components):**

```jsx
// Velt components scattered across multiple files
// app/page.tsx
<VeltProvider apiKey="KEY">
  <Header />  {/* Contains VeltPresence */}
  <Sidebar /> {/* Contains VeltCommentsSidebar */}
  <Editor />  {/* Contains VeltComments */}
</VeltProvider>

// No central place to handle sign-out or initialization
```

**Correct (centralized wrapper):**

```jsx
// components/velt/VeltCollaboration.tsx
"use client";
import { useEffect } from "react";
import {
  VeltComments,
  VeltCommentsSidebar,
  useVeltClient,
} from "@veltdev/react";
import { useAppUser } from "@/app/userAuth/AppUserContext";
import VeltInitializeDocument from "./VeltInitializeDocument";
import { VeltCustomization } from "./ui-customization/VeltCustomization";

export function VeltCollaboration() {
  const { isUserLoggedIn } = useAppUser();
  const { client } = useVeltClient();

  // Handle sign-out when user logs out of your app
  useEffect(() => {
    if (isUserLoggedIn === false && client) {
      client.signOutUser();
    }
  }, [isUserLoggedIn, client]);

  const groupConfig = {
    enable: false
  };

  return (
    <>
      {/* Initialize document after user is authenticated */}
      <VeltInitializeDocument />

      {/* Core collaboration components */}
      <VeltComments
        shadowDom={false}
        textMode={false}
      />

      {/* Sidebar for viewing all comments */}
      <VeltCommentsSidebar groupConfig={groupConfig} />

      {/* Custom styling */}
      <VeltCustomization />
    </>
  );
}
```

**Using the Wrapper:**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import DocumentCanvas from "@/components/document/DocumentCanvas";

export default function Home() {
  const { authProvider } = useVeltAuthProvider();

  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider
      apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}
      authProvider={authProvider}
    >
      {/* Single entry point for all Velt components */}
      <VeltCollaboration />

      {/* Your app content */}
      <DocumentCanvas />
    </VeltProvider>
  );
}
```

**Wrapper Responsibilities:**

| Responsibility | Implementation |
|----------------|----------------|
| Document initialization | VeltInitializeDocument component |
| Sign-out handling | useEffect watching isUserLoggedIn |
| Component configuration | Props on VeltComments, VeltPresence, etc. |
| Custom styling | VeltCustomization component |
| Lifecycle cleanup | Automatic via React unmount |

**Conditional Rendering Pattern:**

```jsx
export function VeltCollaboration({ enabled = true }) {
  const { isUserLoggedIn } = useAppUser();
  const { client } = useVeltClient();

  useEffect(() => {
    if (isUserLoggedIn === false && client) {
      client.signOutUser();
    }
  }, [isUserLoggedIn, client]);

  // Optionally disable Velt features
  if (!enabled) return null;

  return (
    <>
      <VeltInitializeDocument />
      <VeltComments shadowDom={false} textMode={false} />
      <VeltCommentsSidebar groupConfig={{ enable: false }} />
      <VeltCustomization />
    </>
  );
}
```

**Extending for Different Pages:**

```jsx
// components/velt/VeltCollaborationEditor.tsx
// Extended version for editor pages with text selection
export function VeltCollaborationEditor() {
  return (
    <>
      <VeltInitializeDocument />
      <VeltComments textMode={true} shadowDom={false} />  {/* Text selection mode */}
      <VeltCommentsSidebar groupConfig={{ enable: false }} />
      <VeltCustomization />
    </>
  );
}

// components/velt/VeltCollaborationDashboard.tsx
// Minimal version for dashboard pages
export function VeltCollaborationDashboard() {
  return (
    <>
      <VeltInitializeDocument />
      <VeltComments shadowDom={false} />
      {/* pageMode is a sidebar prop: enables page-level comments in the sidebar */}
      <VeltCommentsSidebar pageMode={true} groupConfig={{ enable: false }} />
    </>
  );
}
```

**Verification:**
- [ ] All Velt components are mounted in one wrapper
- [ ] Sign-out is handled when user logs out
- [ ] VeltInitializeDocument is included
- [ ] Wrapper is placed inside VeltProvider
- [ ] Component props are configured as needed

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 7: Install Velt Feature Components
- `https://docs.velt.dev/key-concepts/overview#sign-out-a-user` - Sign out a User
- `https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#pagemode` - pageMode

---

### 7.2 Place Velt UI Components Correctly

**Impact: MEDIUM (Correct placement ensures components render and function properly)**

Velt UI components must be placed inside VeltProvider and after user authentication. Component placement affects visibility and functionality.

**Incorrect (outside VeltProvider):**

```jsx
// VeltComments outside provider - won't work
import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  return (
    <div>
      <VeltComments />  {/* Error: Not inside VeltProvider */}
      <VeltProvider apiKey="KEY">
        <Content />
      </VeltProvider>
    </div>
  );
}
```

**Incorrect (auth hooks in same component as VeltProvider):** Do not call auth hooks or document setup hooks in the same component that renders VeltProvider: the provider isn't mounted yet when those hooks run. Use child components for authentication (via `authProvider` prop) and document setup.

**Correct (components in VeltCollaboration wrapper):**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";

export default function App() {
  const { authProvider } = useVeltAuthProvider();

  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider apiKey="KEY" authProvider={authProvider}>
      {/* Velt components inside provider, in child component */}
      <VeltCollaboration />
      <MainContent />
    </VeltProvider>
  );
}
```

```jsx
// components/velt/VeltCollaboration.tsx
"use client";
import { VeltComments, VeltCommentsSidebar, VeltPresence } from "@veltdev/react";
import VeltInitializeDocument from "./VeltInitializeDocument";

export function VeltCollaboration() {
  return (
    <>
      <VeltInitializeDocument />  {/* Sets document ID */}
      <VeltComments />            {/* Comment pins on content */}
      <VeltCommentsSidebar />     {/* Sidebar panel */}
      <VeltPresence />            {/* User avatars */}
    </>
  );
}
```

**Component Placement Guide:**

| Component | Placement | Purpose |
|-----------|-----------|---------|
| VeltComments | Near content area | Enables commenting on page elements |
| VeltCommentsSidebar | App layout (fixed position) | Shows all comments in sidebar |
| VeltPresence | Header or toolbar | Shows active users |
| VeltCommentTool | Toolbar | Button to add comments |
| VeltCursor | Near VeltComments | Shows other users' cursors |

**Layout Example:**

```jsx
function AppLayout() {
  return (
    <div className="app-layout">
      {/* Header with presence */}
      <header className="app-header">
        <Logo />
        <Navigation />
        <VeltPresence />  {/* Shows user avatars in header */}
      </header>

      {/* Main content area with comments */}
      <main className="app-main">
        <VeltComments />  {/* Enables commenting on main content */}
        <PageContent />
      </main>

      {/* Fixed sidebar for comment list */}
      <aside className="app-sidebar">
        <VeltCommentsSidebar />
      </aside>
    </div>
  );
}
```

**Conditional Component Rendering:**

```jsx
function VeltCollaboration({ showSidebar = true, showPresence = true }) {
  return (
    <>
      <VeltInitializeDocument />
      <VeltComments />

      {showSidebar && <VeltCommentsSidebar />}
      {showPresence && <VeltPresence />}
    </>
  );
}

// Usage - editor page with all features
<VeltCollaboration showSidebar={true} showPresence={true} />

// Usage - read-only page with just comments
<VeltCollaboration showSidebar={false} showPresence={false} />
```

**Visibility:** if a Velt component renders but is hidden behind your layout, check stacking context and `z-index` on your own containers first. To restyle Velt components, follow the UI customization setup (CSS variables cross the shadow DOM; class selectors need `shadowDom={false}` or `client.injectCustomCss()`).

**Verification:**
- [ ] All Velt components are inside VeltProvider
- [ ] Velt components are in child components (not same file as VeltProvider)
- [ ] VeltComments is near the content users will comment on
- [ ] VeltCommentsSidebar is in a fixed or sidebar position
- [ ] Components are visible (check your own containers' stacking context if not)

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 7: Install Velt Feature Components; Notes section on child component requirements
- `https://docs.velt.dev/ui-customization/setup` - "Choose your shadow DOM strategy"

---

## 8. Debugging & Testing

**Impact: LOW-MEDIUM**

Setup verification and troubleshooting common configuration errors. Helps identify and fix issues when Velt features don't work as expected.

### 8.1 Set Up Two-User Testing for Collaboration Features

**Impact: MEDIUM (Without two-user testing support, presence, cursors, and CRDT features cannot be verified)**

Collaboration features (presence, cursors, CRDT sync, comments) require at least two users to test. The generated app must have a built-in mechanism for signing in as different users.

**Common pitfall: auto-login bypasses sign-in screen:**

```tsx
// WRONG: Defaults to user-1, sign-in page never renders
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("user") || "user-1"; // Always logs in!
  const found = DEMO_USERS[uid];
  if (found) setUser(found);
}, []);

// CORRECT: Only login via explicit URL param or button click
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("user"); // No default: sign-in page renders
  if (uid) {
    const found = DEMO_USERS[uid];
    if (found) setUser(found);
  }
}, []);
```

**Required sign-in page elements:**

```tsx
if (!isLoggedIn) {
  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => login("user-1")}>Sign in as Alice</button>
      <button onClick={() => login("user-2")}>Sign in as Bob</button>
    </div>
  );
}
```

**Two-user testing workflow:**
1. Open `http://localhost:3000`: verify sign-in page renders (no auto-login)
2. Click "Sign in as Alice": navigate to a document
3. Open a second browser tab at `http://localhost:3000`
4. Click "Sign in as Bob": navigate to the same document
5. Verify both users' presence avatars are visible
6. Type in one tab: verify text appears in the other (CRDT sync)
7. Move cursor in one tab: verify thin caret appears in the other
8. Alternative shortcut: `http://localhost:3000?user=user-2` to skip sign-in

**URL parameter pattern for quick switching:**
- `?user=user-1`: sign in as Alice
- `?user=user-2`: sign in as Bob
- No param: show sign-in page

**Verification:**
- [ ] Sign-in page renders when no user is selected
- [ ] "Sign in as Alice" button works
- [ ] "Sign in as Bob" button exists and works
- [ ] Both users can see each other's presence avatars on same document
- [ ] Cursors appear as thin carets with name labels
- [ ] CRDT text sync works bidirectionally
- [ ] `?user=user-2` URL param logs in directly

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 8: Verify Setup ("To test presence functionality")
- `https://docs.velt.dev/key-concepts/overview#sign-out-a-user` - Sign out a User (switching users in one tab)

---

### 8.2 Troubleshoot Common Configuration Errors

**Impact: LOW-MEDIUM (Quick reference for resolving frequent setup issues)**

This guide covers the most common Velt setup issues and their solutions.

#### Issue 1: "Domain not allowed" Error

**Symptom:**
```
Console: "Domain not allowed. Please add your domain to the safelist."
```

**Cause:** Your current domain is not whitelisted in Velt Console.

**Solution:**
1. Go to https://console.velt.dev
2. Navigate to Settings → Managed Domains
3. Add your domain(s):
   - `localhost:3000` (development)
   - `your-app.com` (production)

```jsx
// Debug: Check current domain
console.log("Add this domain to Velt Console:", window.location.origin);
```

---

#### Issue 2: VeltProvider Not Working in Next.js

**Symptom:**
- Server component errors
- "Cannot read properties of undefined" errors
- Hydration mismatches

**Cause:** Missing `'use client'` directive or VeltProvider in wrong location.

**Solution:**

```jsx
// WRONG: Missing 'use client'
import { VeltProvider } from "@veltdev/react";
export default function Page() {
  return <VeltProvider apiKey="KEY">...</VeltProvider>;
}

// CORRECT: Add 'use client' at the top
"use client";
import { VeltProvider } from "@veltdev/react";
export default function Page() {
  return <VeltProvider apiKey="KEY">...</VeltProvider>;
}
```

Also ensure VeltProvider is in `page.tsx`, not `layout.tsx`.

---

#### Issue 3: Comments Not Appearing

**Symptom:**
- VeltComments renders but no comments show
- Comments created by one user not visible to others

**Cause:** Document ID mismatch or document not set.

**Solution:**

```jsx
// 1. Verify document is being set
useEffect(() => {
  console.log("Setting document:", documentId);  // Should log a value
  if (documentId) {
    setDocuments([{ id: documentId }]);
  }
}, [documentId]);

// 2. Verify same document ID across users
// Both users should see the same documentId in their URL/logs

// 3. Check document is set AFTER user authentication
//    (Since v6.0.5 an identical repeat setDocuments() call is ignored,
//     so calling it again with the same input will not "refresh" anything)
const veltUser = useCurrentUser();
useEffect(() => {
  if (!veltUser) return;  // Wait for auth
  setDocuments([{ id: documentId }]);
}, [veltUser, documentId]);
```

---

#### Issue 4: JWT Token Errors

**Symptom:**
```
Console: "Invalid token" or "Token expired"
Network tab: 401 errors to /api/velt/token
```

**Cause:** Token generation endpoint issues, an invalid auth token, "Require JWT Token" not enabled in the Console, or a request body that is not wrapped in `data` (returns `INVALID_ARGUMENT`). Tokens expire after 48 hours: `authProvider.generateToken` is re-called automatically, but with `identify()` you must handle the `token_expired` error event yourself.

**Solution:**

```typescript
// 1. Check auth token is set on server
// app/api/velt/token/route.ts
const VELT_AUTH_TOKEN = process.env.VELT_AUTH_TOKEN;
console.log("Auth token defined:", !!VELT_AUTH_TOKEN);  // Should be true

// 2. Check the endpoint and body shape (v2: /v2/auth/generate_token)
//    Body must be wrapped in `data`; organizationId goes in permissions.resources
const response = await fetch("https://api.velt.dev/v2/auth/generate_token", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-velt-api-key": process.env.NEXT_PUBLIC_VELT_API_KEY,
    "x-velt-auth-token": process.env.VELT_AUTH_TOKEN,
  },
  body: JSON.stringify({
    data: {
      userId,
      userProperties: { name, email },
      permissions: {
        resources: [{ type: "organization", id: organizationId }],
      },
    },
  }),
});

const json = await response.json();
console.log("Velt API response:", json);  // Should have result.data.token
```

---

#### Issue 5: User Not Authenticated in Velt

**Symptom:**
- `useCurrentUser()` returns null/undefined
- Velt features don't work even though app user is logged in

**Cause:** authProvider not configured correctly or user object missing fields.

**Solution:**

```jsx
// 1. Check authProvider is defined before rendering VeltProvider
const { authProvider } = useVeltAuthProvider();
console.log("authProvider:", authProvider);  // Should not be undefined

if (!authProvider) {
  return <div>Loading...</div>;  // Wait for authProvider
}

return <VeltProvider apiKey="KEY" authProvider={authProvider}>...</VeltProvider>;

// 2. Check user object has the required fields
const user = {
  userId: "...",           // Required - must not be empty
  organizationId: "...",   // Required - must not be empty
  name: "...",             // Recommended: shown on avatars and mentions
  email: "...",            // Recommended: needed for email/Slack notifications
};
console.log("User object:", user);
```

---

#### Issue 6: "Hooks can only be called inside function component"

**Symptom:**
```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**Cause:** Using Velt hooks outside VeltProvider or in wrong context.

**Solution:**

```jsx
// WRONG: Hook outside VeltProvider
function App() {
  const { client } = useVeltClient();  // Error!
  return <VeltProvider apiKey="KEY">...</VeltProvider>;
}

// CORRECT: Hook inside VeltProvider (in child component)
function App() {
  return (
    <VeltProvider apiKey="KEY">
      <ChildComponent />  {/* Hooks work here */}
    </VeltProvider>
  );
}

function ChildComponent() {
  const { client } = useVeltClient();  // Works!
  return <div>...</div>;
}
```

---

#### Issue 7: Multiple VeltProvider Instances

**Symptom:**
- Velt features work inconsistently
- State issues between different parts of app

**Cause:** Multiple VeltProvider components mounted.

**Solution:**

```jsx
// WRONG: Multiple providers
<VeltProvider apiKey="KEY">
  <ComponentA>
    <VeltProvider apiKey="KEY">  {/* Don't nest providers! */}
      <ComponentB />
    </VeltProvider>
  </ComponentA>
</VeltProvider>

// CORRECT: Single provider at app root
<VeltProvider apiKey="KEY">
  <ComponentA>
    <ComponentB />  {/* Same provider context */}
  </ComponentA>
</VeltProvider>
```

---

#### Issue 8: Comments Not Persisting

**Symptom:**
- Comments appear temporarily but disappear on refresh
- Comments not visible to other users

**Cause:** Document ID changes on each page load.

**Solution:**

```jsx
// WRONG: Random document ID
const documentId = Math.random().toString();  // Different every time!

// CORRECT: Consistent document ID
const documentId = searchParams.get("documentId") || localStorage.getItem("docId");
```

See `document-id-generation` rule for proper patterns.

---

#### Issue 9: ENOENT or Module Not Found After SSR Changes

**Symptom:**
```
ENOENT: no such file or directory, open '.next/server/app/...'
Module not found: Can't resolve '...'
```

**Cause:** Stale `.next` build cache after changing import patterns (e.g., adding `next/dynamic` with `ssr: false`, modifying component imports).

**Solution:**
```bash
rm -rf .next
npm run dev
```

Always clear `.next` after modifying SSR patterns or dynamic imports. The old build cache references files at their previous paths, which no longer exist after restructuring imports.

---

#### Quick Diagnostic Checklist

| Issue | Check |
|-------|-------|
| Nothing works | API key valid? Domain whitelisted? |
| Server errors (Next.js) | 'use client' directive present? |
| No comments visible | Document set after auth? Same doc ID? |
| Auth errors | authProvider defined? Token endpoint working? |
| Hooks error | Inside VeltProvider? In child component? |
| Inconsistent state | Only one VeltProvider? |
| Data not persisting | Document ID consistent? |
| ENOENT after import changes | Clear `.next` cache? |

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Debugging; Notes
- `https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token` - Generate Token (body shape, 48h expiry)
- `https://docs.velt.dev/get-started/advanced#token-refresh` - Token Refresh
- `https://docs.velt.dev/api-reference/sdk/api/api-methods#setdocuments` - setDocuments() behavior updates

---

### 8.3 Verify Velt Setup is Correct

**Impact: LOW-MEDIUM (Systematic verification helps identify setup issues early)**

Use this checklist to systematically verify your Velt setup. Check each item in order - issues often cascade from earlier setup problems.

**Setup Verification Checklist:**

#### 1. Installation Verification

```jsx
// Check packages are installed correctly
// In terminal:
npm list @veltdev/react  // Should show the installed version (v6.x for the modular SDK)

// In your code, this import should work:
import { VeltProvider, VeltComments, useVeltClient } from "@veltdev/react";
```

**Verification:**
- [ ] `@veltdev/react` (or `@veltdev/client`) is in package.json
- [ ] No installation errors when running `npm install`
- [ ] Imports work without "module not found" errors

#### 2. API Key Verification

```jsx
// Add temporary logging to verify API key
console.log("Velt API Key:", process.env.NEXT_PUBLIC_VELT_API_KEY);

// Check it's being passed to VeltProvider
<VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY}>
```

**Verification:**
- [ ] API key is defined (not undefined or empty string)
- [ ] API key matches the one in console.velt.dev
- [ ] No "invalid API key" errors in browser console

#### 3. Domain Verification

```jsx
// Check current domain matches whitelisted domains
console.log("Current origin:", window.location.origin);
console.log("Current hostname:", window.location.hostname);
```

**Verification:**
- [ ] Current domain is added to Velt Console's Managed Domains
- [ ] No "domain not allowed" errors in console
- [ ] Both localhost and production domains are whitelisted

#### 4. User Authentication Verification

```jsx
// Add logging in your auth provider hook
export function useVeltAuthProvider() {
  const { user } = useAppUser();

  console.log("App user:", user);  // Should have userId, organizationId, name, email

  const authProvider = useMemo(() => {
    if (!user) {
      console.log("No user - authProvider will be undefined");
      return undefined;
    }
    console.log("Creating authProvider for user:", user.userId);
    return { /* ... */ };
  }, [user]);

  return { authProvider };
}
```

**Verification:**
- [ ] User object has all required fields (userId, organizationId, name, email)
- [ ] authProvider is defined before VeltProvider renders
- [ ] No null/undefined values in user object
- [ ] JWT token endpoint returns valid token (check Network tab)

#### 5. Document Initialization Verification

```jsx
// Add logging in VeltInitializeDocument
export function VeltInitializeDocument() {
  const { documentId, documentName } = useCurrentDocument();
  const veltUser = useCurrentUser();

  console.log("Document ID:", documentId);
  console.log("Velt user ready:", !!veltUser);

  useEffect(() => {
    if (!veltUser || !documentId) {
      console.log("Waiting for:", { veltUser: !!veltUser, documentId });
      return;
    }
    console.log("Setting document:", documentId);
    setDocuments([{ id: documentId, metadata: { documentName } }]);
  }, [veltUser, documentId]);

  return null;
}
```

**Verification:**
- [ ] Document ID is generated and consistent
- [ ] setDocuments is called AFTER user is authenticated
- [ ] Document ID appears in URL (if using URL-based pattern)
- [ ] No "document not found" errors

#### 6. Component Rendering Verification

```jsx
// Temporarily add visible markers
<VeltProvider apiKey="KEY" authProvider={authProvider}>
  <div style={{ background: "lightgreen", padding: "10px" }}>
    VeltProvider is rendering
  </div>
  <VeltCollaboration />
  <Content />
</VeltProvider>
```

**Verification:**
- [ ] VeltProvider wrapper renders (green box visible)
- [ ] VeltComments component appears in React DevTools
- [ ] No React errors in console about Velt components
- [ ] Comments sidebar appears (if VeltCommentsSidebar is used)

#### 7. Use Velt's Built-in Diagnostics

```jsx
// React: inside a child component of VeltProvider
import { useEffect } from "react";
import { useVeltClient, useVeltInitState } from "@veltdev/react";

export function VeltDiagnostics() {
  const { client } = useVeltClient();
  const veltInitState = useVeltInitState(); // true once user AND document are initialized

  useEffect(() => {
    if (!client) return;
    client.fetchDebugInfo().then((info) => console.log("Velt debug info:", info));
    const errorSub = client.on("error").subscribe((error) => console.log("Velt error:", error));
    return () => errorSub?.unsubscribe();
  }, [client]);

  return null;
}
```

```js
// Browser console or other frameworks
await Velt.getMetadata();                    // Currently set organization, document, location
const info = await Velt.fetchDebugInfo();    // SDK version, apiKey, user, organizationId, documentId, ...
Velt.getVeltInitState().subscribe((ready) => console.log("Velt ready:", ready));
```

- `getMetadata()` returns the organization, document, and location you set. An error or `null` means initialization failed.
- `fetchDebugInfo()` (one-time) and `getDebugInfo()` (subscription) return `VeltDebugInfo`. The Velt DevTools Chrome extension shows the same data.
- Subscribe to the `error` event to see `token_expired` and other auth errors.
- `disableLogs()` controls SDK console verbosity; do not suppress logs while debugging setup.

#### 8. Full Setup Debug Component

```jsx
// components/velt/VeltDebug.tsx - Add temporarily to debug
"use client";
import { useVeltClient, useCurrentUser } from "@veltdev/react";
import { useCurrentDocument } from "@/app/document/useCurrentDocument";
import { useAppUser } from "@/app/userAuth/useAppUser";

export function VeltDebug() {
  const { client } = useVeltClient();
  const veltUser = useCurrentUser();
  const { user } = useAppUser();
  const { documentId } = useCurrentDocument();

  return (
    <div style={{ position: "fixed", bottom: 10, right: 10, background: "#fff", padding: 10, border: "1px solid #ccc", fontSize: 12 }}>
      <h4>Velt Debug</h4>
      <p>Client: {client ? "✅ Ready" : "❌ Not ready"}</p>
      <p>App User: {user ? `✅ ${user.name}` : "❌ Not logged in"}</p>
      <p>Velt User: {veltUser ? "✅ Authenticated" : "❌ Not authenticated"}</p>
      <p>Document: {documentId ? `✅ ${documentId}` : "❌ Not set"}</p>
      <p>Org: {user?.organizationId || "N/A"}</p>
    </div>
  );
}
```

**Expected Final State:**

| Item | Expected Value |
|------|----------------|
| Client | Ready |
| App User | Logged in with name |
| Velt User | Authenticated |
| Document | Set with valid ID |

**Verification:**
- [ ] All items show ✅ in debug component
- [ ] Comments can be created and saved
- [ ] Multiple users see the same comments
- [ ] Presence shows other users

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 8: Verify Setup
- `https://docs.velt.dev/get-started/advanced#getveltinitstate` - getVeltInitState()
- `https://docs.velt.dev/get-started/advanced#fetchdebuginfo` - fetchDebugInfo() / getDebugInfo()
- `https://docs.velt.dev/get-started/advanced#event-subscriptions` - Event Subscriptions (`error`, `initUpdate`)

---

## 9. Components

**Impact: MEDIUM**

Drop-in Velt components that complete a basic setup, such as VeltUserInviteTool for share and invite flows. Includes loading tag-only features under the v6 modular SDK.

### 9.1 Add Share & Invite with VeltUserInviteTool

**Impact: MEDIUM (VeltUserInviteTool provides a ready-made invite widget for sharing documents with collaborators; without it, developers build custom invite flows that miss Velt's built-in access control integration)**

`VeltUserInviteTool` is a drop-in widget that lets users invite others to collaborate on the current document. It handles the invite flow (email input, role selection, sending) and integrates with Velt's access control system automatically.

#### Setup

**React / Next.js:**

```jsx
import { VeltUserInviteTool } from '@veltdev/react';

function Toolbar() {
  return (
    <div className="toolbar">
      <VeltUserInviteTool />
    </div>
  );
}
```

**HTML:**

```html
<velt-user-invite-tool></velt-user-invite-tool>
```

Place the component wherever you want the invite button to appear, typically in a toolbar or header alongside other collaboration controls like `VeltPresence` and `VeltSidebarButton`.

#### Load the userInvite Chunk When Using featureAllowList (v6 Modular SDK)

In the v6 modular SDK each feature loads as its own chunk. `userInvite` is a tag-only feature: it has no `getXElement()` accessor that would auto-load it. If you set `featureAllowList`, include `'userInvite'` or call `preloadUserInvite()`, otherwise the tag renders inert.

**Incorrect:**

```jsx
// featureAllowList omits 'userInvite'; nothing loads the invite chunk
<VeltProvider apiKey="YOUR_VELT_API_KEY" config={{ featureAllowList: ['comment', 'presence'] }}>
  <VeltUserInviteTool />
</VeltProvider>
```

**Correct:**

```jsx
// Option 1: allow-list it
<VeltProvider apiKey="YOUR_VELT_API_KEY" config={{ featureAllowList: ['comment', 'presence', 'userInvite'] }}>
  <VeltUserInviteTool />
</VeltProvider>

// Option 2: preload it from a child component
const { client } = useVeltClient();
useEffect(() => {
  client?.preloadUserInvite();
}, [client]);
```

```js
// Other frameworks
await Velt.preloadUserInvite();
```

If you omit `featureAllowList`, all feature chunks preload in the background and no extra step is needed.

#### Customize the Button with Slots

Replace the default invite button with your own template using the `button` slot:

**React:**

```jsx
<VeltUserInviteTool>
  <button slot="button">Share & Invite</button>
</VeltUserInviteTool>
```

**HTML:**

```html
<velt-user-invite-tool>
  <button slot="button">Share & Invite</button>
</velt-user-invite-tool>
```

The slot replaces only the trigger button; the invite dialog UI is still managed by Velt.

#### Style with CSS Parts

The component uses Shadow DOM. Target internal elements with `::part()`:

| Part | Description |
|------|-------------|
| `container` | The invite tool outer container |
| `button-container` | The button wrapper |
| `button-icon` | The SVG icon inside the button |

```css
velt-user-invite-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
}

velt-user-invite-tool::part(button-container) {
  border-radius: 8px;
  background: #2563eb;
  color: white;
}
```

#### Verification

- [ ] `VeltUserInviteTool` is placed inside the VeltProvider tree
- [ ] A document is set via `setDocument()` before the invite tool is used
- [ ] Clicking the button opens the invite dialog
- [ ] Invited users receive access to the document
- [ ] If `featureAllowList` is set, it includes `'userInvite'` (or `preloadUserInvite()` is called)

**Source Pointers:**
- `https://docs.velt.dev/permission-management/share-and-invite/overview` — Feature overview
- `https://docs.velt.dev/permission-management/share-and-invite/setup` — Setup steps
- `https://docs.velt.dev/permission-management/share-and-invite/customize-ui/parts` — CSS parts reference
- `https://docs.velt.dev/permission-management/share-and-invite/customize-ui/slots` — Slot customization
- `https://docs.velt.dev/api-reference/sdk/api/api-methods#preloaduserinvite` — preloadUserInvite() and Modular SDK / Chunk Preloading

---

## References

- https://docs.velt.dev/get-started/quickstart
- https://docs.velt.dev/get-started/advanced
- https://console.velt.dev
- https://docs.velt.dev/api-reference/sdk/api/api-methods
- https://docs.velt.dev/key-concepts/overview
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token
- https://docs.velt.dev/api-reference/sdk/models/data-models
- https://docs.velt.dev/security/proxy-server
- https://docs.velt.dev/get-started/agentic-overview
- https://docs.velt.dev/get-started/installation-plugin
- https://docs.velt.dev/get-started/docs-mcp
- https://docs.velt.dev/get-started/ui-customization-plugin
- https://docs.velt.dev/ui-customization/setup
