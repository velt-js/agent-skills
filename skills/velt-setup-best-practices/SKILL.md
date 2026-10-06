---
name: velt-setup-best-practices
description: Velt SDK setup for React, Next.js, Angular, Vue, and HTML. Use when installing Velt, configuring VeltProvider or initVelt, authenticating users with authProvider and backend JWTs (generate_token), setting documents and locations with setDocuments, configuring featureAllowList, proxyConfig, or setUnstyledMode, adding VeltUserInviteTool, installing the Velt AI plugins or Docs MCP in Claude Code or Cursor, or debugging setup. Triggers on any Velt setup task, even if the user doesn't say "setup".
license: MIT
metadata:
  author: velt
  version: "1.3.0"
---

# Velt Setup Best Practices

Comprehensive setup guide for Velt collaboration SDK. Contains 30 rules across 9 categories covering installation (including AI tooling for Claude Code and Cursor), provider wiring, authentication, document setup, SDK-wide configuration, and project organization.

## When to Apply

Reference these guidelines when:
- Setting up Velt in a new React, Next.js, Angular, Vue, or HTML project
- Installing the Velt Installation Plugin, Docs MCP, MCP Installer, or UI Customization Plugin in Claude Code or Cursor
- Configuring VeltProvider, `initVelt()`, API keys, and allowed domains
- Implementing user authentication with Velt (userId, organizationId, authProvider)
- Generating JWT tokens on the backend (`/v2/auth/generate_token` or `@veltdev/node`)
- Initializing documents and locations with setDocuments / setLocations
- Configuring `featureAllowList` (v6 modular SDK), `proxyConfig`, `setUnstyledMode`, or the Firestore persistent cache
- Organizing Velt-related files in your project

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Installation | CRITICAL | `install-` |
| 2 | Provider Wiring | CRITICAL | `provider-` |
| 3 | Identity | CRITICAL | `identity-` |
| 4 | Document Identity | CRITICAL | `document-` |
| 5 | Config | HIGH | `config-` |
| 6 | Project Structure | MEDIUM | `structure-` |
| 7 | Routing Surfaces | MEDIUM | `surface-` |
| 8 | Debugging & Testing | LOW-MEDIUM | `debug-` |
| 9 | Components | MEDIUM | `component-` |

## Quick Reference

### 1. Installation (CRITICAL)

- `install-react-packages` - Install @veltdev/react (and optional @veltdev/types) for React/Next.js
- `install-vanilla-packages` - Install @veltdev/client or the CDN script for Angular, Vue, HTML
- `install-ai-agent-tooling` - Install the Velt Installation Plugin, Docs MCP, MCP Installer, or UI Customization Plugin with the right commands for Claude Code vs Cursor

### 2. Provider Wiring (CRITICAL)

- `provider-velt-provider-setup` - Wrap the app in VeltProvider with apiKey, authProvider, and config
- `provider-client-directive` - Add 'use client' to Next.js files that use Velt
- `provider-framework-init` - Initialize with initVelt() / Velt.init() in Angular, Vue, HTML

### 3. Identity (CRITICAL)

- `identity-auth-provider` - Authenticate with the authProvider prop (auto token refresh, forceReset, throwError)
- `identity-user-object-shape` - Required userId and organizationId plus recommended name, email, photoUrl
- `identity-organization-id` - Scope users with organizationId; cross-org access via JWT permissions
- `identity-jwt-generation` - Generate JWTs server-side with POST /v2/auth/generate_token or sdk.api.accessControl.generateToken

### 4. Document Identity (CRITICAL)

- `document-set-document` - Call setDocuments after auth in a child component; folderId is an option; identical repeats are ignored
- `document-id-generation` - Use stable, shareable document IDs
- `document-metadata` - Set documentName metadata; read it with getDocumentMetadata()
- `document-set-locations` - Use setLocations for sub-areas inside a document
- `document-page-info` - Override browser-derived page info with setPageInfo / clearPageInfo

### 5. Config (HIGH)

- `config-api-key` - Get the API key from the Velt Console; single client key restricted by allowed domains
- `config-auth-token-security` - Keep the Auth Token server-side only
- `config-domain-safelist` - Add domains in the Console or via the workspace domain REST APIs
- `config-feature-allow-list` - Scope v6 modular loading with featureAllowList and preload*() methods
- `config-firestore-persistent-cache` - Enable the Firestore persistent cache before authentication
- `config-proxy-config` - Route SDK traffic through proxies with proxyConfig (replaces apiProxyDomain)
- `config-unstyled-mode` - Use setUnstyledMode for headless styling

### 6. Project Structure (MEDIUM)

- `structure-folder-organization` - Keep Velt code in components/velt and customization in components/velt/ui-customization
- `structure-separation-of-concerns` - Separate app auth from Velt integration

### 7. Routing Surfaces (MEDIUM)

- `surface-collaboration-wrapper` - Mount Velt components and sign-out handling in one VeltCollaboration wrapper
- `surface-component-placement` - Place Velt components inside VeltProvider, in child components

### 8. Debugging & Testing (LOW-MEDIUM)

- `debug-common-issues` - Troubleshoot common configuration errors
- `debug-setup-verification` - Verify setup step by step with getMetadata, getVeltInitState, fetchDebugInfo
- `debug-multi-user-testing` - Test collaboration with two users

### 9. Components (MEDIUM)

- `component-user-invite` - Add VeltUserInviteTool; allow-list or preload userInvite under featureAllowList

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/react/installation/install-react-packages.md
rules/react/provider-wiring/provider-velt-provider-setup.md
rules/shared/_sections.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
