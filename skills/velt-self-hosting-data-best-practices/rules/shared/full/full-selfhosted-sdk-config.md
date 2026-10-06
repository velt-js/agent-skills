---
title: Wire the App to a Full Self-Hosted Deployment with config.selfHosted
impact: HIGH
impactDescription: Without selfHosted the SDK served from your CDN still sends data to Velt SaaS; a wrong CDN path or missing CORS stops the SDK from loading
tags: full-self-hosting, selfHosted, strict, deploymentProfile, enabledModules, proxyDomain, version, cdn, cors, csp, velt-selfhosted-config.json, firebaseConfig, initVelt, dataRegions
---

## Wire the App to a Full Self-Hosted Deployment with config.selfHosted

Serving the SDK from your CDN only moves code. Runtime still defaults to Velt SaaS endpoints until you pass `selfHosted`. The install generates `velt-selfhosted-config.json` (Phase 5.1): public URLs, the web-app `firebaseConfig`, and the module list, with no secrets. Import it; do not hand-type endpoint URLs.

**Incorrect:**

```tsx
<VeltProvider
  apiKey="..."
  config={{
    proxyDomain: 'https://static.acme.com/lib/sdk@6.0.0', // WRONG: origin only; the SDK adds the path
    // WRONG: no version and no selfHosted, so data still goes to Velt SaaS
  }}
>
```

```json
{ "strict": false, "deploymentProfile": ["core", "ai"] }
```

(Wrong: `strict` is off and the module list was typed by hand instead of copied from `enabledModules`.)

**Correct:**

```tsx
import selfHosted from './velt-selfhosted-config.json';

<VeltProvider
  apiKey="<production key from install Phase 3>"
  config={{
    proxyDomain: 'https://static.acme.com', // origin only; path stays /lib/sdk@<version>/velt.js
    version: '6.0.0',                       // must match the hosted folder (the manifest's tested SDK version)
    selfHosted,                             // generated in install Phase 5.1
  }}
>
```

Vanilla and Vue use `initVelt(apiKey, { proxyDomain, version, selfHosted })`.

**`selfHosted` semantics:**

| Field | Behavior |
|---|---|
| `strict: true` | Endpoints you did not inject resolve to an inert `velt://self-hosted-disabled/<name>` sentinel (zero egress). Required for full self-hosting. |
| `strict: false` / omitted | Unspecified endpoints fall back to Velt SaaS defaults. Not acceptable for full self-hosting. |
| `deploymentProfile` | Must equal Terraform's resolved `enabledModules` from `velt-deployment-profile.json`, copied verbatim, never re-derived. Endpoints for absent modules stay inert. |
| `cloudFunction.*` | Absolute Cloud Run base URLs; module-gated keys appear only when provisioned. |
| `firebaseConfig` | Use the Terraform-emitted web app config, not the console-patched copy whose `authDomain` points at the console host. |
| `dataRegions` | Optional. Mirror it verbatim only if tfvars set it; omitted and `[]` are different fleets. |

**CDN rules that break production if violated:**
1. Path is exactly `/lib/sdk@<version>/velt.js` (the `@` is literal), with all chunks flat in that directory.
2. Every `.js` file sends `Access-Control-Allow-Origin` (your app origin or `*`). Missing CORS is the most common failure.
3. CSP allows your CDN in `script-src`; remove `cdn.velt.dev` after cutover.

**Definition of done:** console sign-in as a seeded admin works; the app loads `velt.js` and its chunks from your CDN and `window.Velt.version` matches the pin; a new comment appears in the console data browser; a Network audit of the app and console shows no requests to `velt.dev` or other Velt-owned hosts.

**Verification:**
- [ ] `selfHosted` is imported from the generated `velt-selfhosted-config.json`
- [ ] `selfHosted.strict` is `true` and `deploymentProfile` equals the resolved `enabledModules`
- [ ] `proxyDomain` is an origin only and `version` matches the folder on the CDN
- [ ] CDN path, CORS, and CSP rules above hold
- [ ] The Network audit shows zero requests to Velt-owned hosts

**Source Pointers:**
- https://docs.velt.dev/self-hosting/full/gcp/overview - "Wire your app", "Confirm it is done", "Troubleshooting"
- https://docs.velt.dev/self-hosting/full/gcp/reference#sdk-selfhosted-config - "SDK selfHosted config"
- https://docs.velt.dev/self-hosting/full/gcp/reference#deployment-profiles - "Deployment profiles"
