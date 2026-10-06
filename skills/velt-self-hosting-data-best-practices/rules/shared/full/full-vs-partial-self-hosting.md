---
title: Choose Partial or Full Self-Hosting Before Writing Any Code
impact: HIGH
impactDescription: Partial and full self-hosting share a name but are different products; picking the wrong one means building data providers nobody needs or an infrastructure project nobody asked for
tags: full-self-hosting, partial-self-hosting, data-providers, gcp, firebase, terraform, umbrella-manifest, deployment-profile, aws, azure, closed-beta
---

## Choose Partial or Full Self-Hosting Before Writing Any Code

Velt uses "self-hosting" for two different things. **Partial self-hosting** keeps Velt's managed backend and moves only user content and PII into your storage through data providers (every other rule in this skill). **Full self-hosting** runs the entire Velt stack (backend, admin console, and SDK files) in a cloud project you own, with no runtime requests to Velt-owned hosts.

| | Partial self-hosting | Full self-hosting |
|---|---|---|
| What moves to you | User content and PII, through data providers | Backend, console, SDK hosting, and all data |
| Who runs the backend | Velt | You, on your own GCP project |
| What you set up | `dataProviders` callbacks or endpoints in your app | GCP project, Terraform, Firebase, console host, CDN |
| Requests to Velt hosts | Yes, for the collaboration backend | None |
| App-side config | `dataProviders` on `VeltProvider` (or `Velt.setDataProviders`) | `config.selfHosted` + `proxyDomain` + pinned `version` |

**Incorrect (mixing the two):**

```jsx
// WRONG: "We need zero requests to velt.dev" solved with data providers.
// Partial self-hosting still uses Velt's backend; this app keeps calling Velt hosts.
<VeltProvider apiKey="KEY" dataProviders={{ comment: commentDataProvider }}>
```

**Correct (pick by requirement):**

```jsx
// Requirement: comment text and user PII must not be stored by Velt.
// -> Partial self-hosting: register data providers; Velt keeps structural, non-PII data.
<VeltProvider apiKey="KEY" authProvider={authProvider} dataProviders={dataProviders}>

// Requirement: no Velt-operated component in the runtime path at all.
// -> Full self-hosting: deploy the stack into your GCP project, then pass the generated config.
<VeltProvider apiKey="KEY_FROM_YOUR_DEPLOYMENT" config={{ proxyDomain, version, selfHosted }}>
```

**Full self-hosting constraints to state up front:**
- Generally available on **GCP + Firebase only**. AWS and Azure are in closed beta (Azure added in v6.0.13); access is granted case by case.
- Deployment is agent-driven: hand an AI coding agent the GCP Install guide and Reference pages, plus your inputs (`PROJECT_ID`, `REGION`, `PROFILE`, `OPT_IN_MODULES`, owner email, console and CDN origins). Do not invent your own procedure or bake component versions into runbooks; pins come from the signed umbrella manifest (`velt-selfhost-manifest`) at run time.
- Five human steps remain: link billing, create the Google OAuth client, sign off the image scan, add DNS (custom domains only), and do the first console sign-in.
- Gemini and Anthropic API keys are required even on the `core` profile; placeholders pass install and then fail at runtime.
- Keep `velt-selfhost-state.json` after every phase so a fresh session can resume. Upgrades are deltas run from the Upgrade guide, not reinstalls.
- Features follow the deployment profile (`core`, `core+recording`, `core+ai+agents`, `full`, plus opt-in modules); features whose modules are not deployed are gated in the console and inert in the SDK.

This skill does not reproduce the install or upgrade runbooks. Point the user, or their agent, at the docs pages below.

**Verification:**
- [ ] The requirement (PII off Velt vs zero Velt runtime dependency) was identified before choosing an approach
- [ ] Partial self-hosting work uses `dataProviders` and the rules in this skill; full self-hosting work follows the GCP Install guide
- [ ] Full self-hosting plans assume GCP + Firebase unless the team has AWS or Azure closed-beta access
- [ ] Real Gemini and Anthropic keys and the five human steps are planned for

**Source Pointers:**
- https://docs.velt.dev/self-hosting/full/overview - "Full vs partial self-hosting", "Limitations", "Supported clouds"
- https://docs.velt.dev/self-hosting/full/gcp/overview - "Get Started on GCP"
- https://docs.velt.dev/self-hosting/full/gcp/install - "Install guide"
- https://docs.velt.dev/self-hosting/full/gcp/upgrade - "Upgrade guide"
- https://docs.velt.dev/self-hosting/partial/overview - "Partial self-hosting overview"
