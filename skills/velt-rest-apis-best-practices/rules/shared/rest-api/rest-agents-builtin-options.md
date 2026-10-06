---
title: Run Built-in Review Agents by ID with Issue Types and Per-Run Options
impact: MEDIUM-HIGH
impactDescription: Built-in agents cover most review needs without a custom agent; wrong IDs, missing required options, or option keys sent to the wrong agent fail or are ignored
tags: rest, api, agents, built-in, spell-check, broken-links, image-inspector, mobile-inspector, consistency-checker, migration-parity, content-request-list, issueType, focusIssueTypes, userContext
---

## Run Built-in Review Agents by ID with Issue Types and Per-Run Options

Built-in agents are pre-registered in every workspace. Run one by passing its ID as `agentId` (or in `agentIds`) to `/v2/agents/execution/run`; there is nothing to create. Tune a run through `userContext`: each agent reads only its own keys, a key you leave out keeps its default, and a value of the wrong type is ignored.

**Incorrect (display name as the ID, missing required option):**

```json
{
  "data": {
    "agentId": "Proofreader",
    "url": "https://new.example.com/about",
    "organizationId": "org_001",
    "documentId": "doc_001"
  }
}
```

**Correct (built-in IDs, shared `userContext` with each agent's own keys):**

```json
{
  "data": {
    "agentIds": ["spell-check", "broken-links", "migration-parity"],
    "url": "https://new.example.com/about",
    "organizationId": "org_001",
    "documentId": "doc_001",
    "userContext": {
      "brandNames": ["AcmeCloud"],
      "clickTest": false,
      "liveSiteUrl": "old.example.com"
    }
  }
}
```

### Built-in agent IDs

| ID | Reviews |
|----|---------|
| `spell-check` | Proofreader: typos, doubled words, punctuation slips, brand casing, placeholder text. No grammar (use `grammar-check`); `aiConfig` does not apply |
| `grammar-check` | Grammar |
| `broken-links` | Link Checker: links, images, forms, dead buttons, staging links, unlinked contacts, social icons, tab targets |
| `image-inspector` | Broken, blurry, stretched, empty, and missing-alt images; optional bad-crop check |
| `mobile-inspector` | Phone and tablet layout problems; always runs as `"mobile"` |
| `consistency-checker` | Contact details, prices, and names that differ across the site; cross-page casing and visual style mismatches |
| `ai-visibility` | Whether AI answer engines can reach, read, and cite the page |
| `migration-parity` | Content the new page lost compared with the live or old site. Requires `liveSiteUrl` |
| `content-request-list` | One checklist finding per page of content still owed by the client |
| `pii-detection`, `profanity-filter`, `sensitive-data`, `lorem-ipsum` | Content safety and placeholder checks |
| `lighthouse`, `accessibility-checker`, `og-image-checker` | Lighthouse audit, WCAG audit, Open Graph image validation |

Identify agents by ID; display names can change between releases. `/v2/agents/get` with `{ "filter": "defaultOnly" }` lists them, and `essentialDefault: true` marks Velt's recommended default set.

### Issue types and focused rechecks

These agents tag every finding with a fixed `issueType`. Pass some of them in `userContext.focusIssueTypes` to recheck only those issues; the run replaces only the earlier pending suggestions of those types.

| Agent | Issue types |
|-------|-------------|
| `spell-check` | `spelling`, `doubled-word`, `punctuation`, `placeholder`, `brand-casing`, `inconsistent-casing` |
| `broken-links` | `broken-link`, `broken-image`, `dead-button`, `dead-form`, `staging-link`, `malformed-link`, `unlinked-logo`, `unlinked-phone`, `unlinked-email`, `unlinked-contact`, `social-link-mismatch`, `same-tab-link`, `new-tab-internal-link` |
| `image-inspector` | `broken-image`, `empty-image`, `blurry-image`, `stretched-image`, `missing-alt`, `bad-crop` |
| `mobile-inspector` | `desktop-layout-on-phone`, `horizontal-scroll`, `overflowing-element`, `overflowing-text`, `cut-off-button`, `cut-off-text`, `small-tap-target`, `wrapped-button-label`, `hidden-under-sticky-bar`, `broken-mobile-menu`, `missing-on-mobile` |
| `consistency-checker` | `inconsistent-phone`, `inconsistent-address`, `inconsistent-hours`, `inconsistent-email`, `inconsistent-price`, `inconsistent-service-name`, `inconsistent-business-name`, `cross-page-casing`, `style-mismatch`, `missing-hover`, `hover-invisible` |
| `migration-parity` | `missing-bio`, `missing-review`, `missing-faq`, `missing-phone`, `missing-email`, `missing-address`, `missing-list-item`, `missing-page-title`, `missing-main-heading` |
| `content-request-list` | `content-requests` |

To report only broken links, run `broken-links` with `focusIssueTypes: ["broken-link"]`. To stop it checking a category at all, use its options below.

### Per-run options (`userContext` keys)

- **`broken-links`**: `clickTest` (default `true`; `false` means no `dead-button` findings), `pageLinkChecks`, `checkLogo`, `checkContacts`, `checkSocialIcons`, `checkTabTargets`, `checkStagingLinks`, `checkMalformedLinks`, `checkImageUrls`, `checkFormActions`, `checkInternalLinks`, `checkExternalLinks` (all default `true`), `maxLinksToCheck` (default 500, 1 to 1000), `stagingNoindexSignal`, `stagingWords`, `ambiguousStagingWords`, `notStagingWords`, `ignoreOverlaySelectors`, `skipClickLabels`.
- **`spell-check`**: `rulesOnly` (default `false`; sends no page text to the verification model and skips spelling), `acceptedWords`, `brandNames`, `skipChecks` (issue types to skip), `keepAtOrAbove` (default 0.6), `useGuidelines` (default `true`; reads brand terms from the Memory knowledge base), `loremIpsumOnSamePages`.
- **`consistency-checker`**: `consistencyCasingCheck`, `consistencyVisualCheck`, `consistencyExactValues` (default `true`), `consistencyMaxPages` (default 6, max 12), `consistencyMaxCharsPerPage` (default 6000, max 20000).
- **`image-inspector`**: `blurMinNaturalRatio`, `blurHighScale`, `blurMinRenderedWidthPx`, `stretchTolerance`, `stretchMinWidthPx`, `stretchMinHeightPx`, `emptyMinSidePx`, `altMinSidePx`, `maxPerCategory`, `linkCheckerOnSamePages`, `cropCheck` (turns on the bad-crop model check; also enabled by run `aiConfig.modelChecks: ["image-crop"]`, and `cropCheck: false` always wins).
- **`mobile-inspector`**: `phoneWidthPx` (320 to 480, default 375), `minTapTargetPx` (default 24), `maxScreenshots` (0 to 10, default 7), `tabletWidthPx` (600 to 1024 or `0`, default 768), `skipChecks` (`tablet`, `sticky-bar`, `wrapped-label`, `menu`, `missing-on-mobile`).
- **`migration-parity`**: `liveSiteUrl` (**required**; full address or bare domain, must differ from the run's site), `maxFindings` (1 to 20, default 6), `useSitemap` (default `true`). Without a usable `liveSiteUrl` the run returns `INVALID_ARGUMENT`; in an `agentIds` run it appears in `data.failed` while the others start.
- **`content-request-list`**: `includeThreads` (default `true`), `maxItems` (1 to 50, default 25), `minBioWords`, `clientUserIds`, `clientEmailDomains`, `audienceLabel`.

**Duplicate handling between agents.** In one `agentIds` run, `spell-check` + `lorem-ipsum` sets `loremIpsumOnSamePages: true` for you, and a one-page run with `broken-links` + `image-inspector` sets `linkCheckerOnSamePages: true`. When you run these pairs in separate requests, or `image-inspector` with `broken-links` over several pages, set those keys yourself.

Findings with an exact correction carry `suggestedFix` (also on the annotation as `agent.reason.suggestedFix`). `migration-parity` and `content-request-list` also return a per-page `agentResult.report` on Get Execution.

### Fix It Everywhere estimate

`POST /v2/agents/fix-it-everywhere/estimate` estimates how many pages a `fix-it-everywhere` run would touch before you start it. Send `url`, optional `urls`, and `userContext` (`findText` required, 2 to 200 characters; optional `replaceWith`, `editMode` of `replace` / `delete` / `comment`, `matchCase`, `sourcePageUrl`, `sourceText`), plus optional `maxPages` (1 to 20, default 8). The schema is strict: do not send `agentId` or `documentId`. Nothing runs or is billed; `data.estimate` is `null` when no page could be read.

**Verification Checklist:**
- [ ] Built-in agents are referenced by ID (`spell-check`, `broken-links`, ...), never by display name
- [ ] `migration-parity` runs always send `userContext.liveSiteUrl` for a different site
- [ ] Option keys match the agent they target; shared `userContext` in `agentIds` runs is fine because each agent reads only its own keys
- [ ] `focusIssueTypes` values come from the documented issue-type list
- [ ] Separate-request runs of `spell-check`/`lorem-ipsum` or `broken-links`/`image-inspector` set the `*OnSamePages` keys to avoid duplicate findings
- [ ] The bad-crop check is enabled deliberately (`cropCheck: true` or `aiConfig.modelChecks: ["image-crop"]`), since it sends screenshots to a model
- [ ] Fix It Everywhere estimates send only `url`, `urls`, `userContext`, `maxPages`, and `organizationId`

**Source Pointers:**
- https://docs.velt.dev/ai/agents/overview#built-in-agents - "Built-in agents"
- https://docs.velt.dev/ai/agents/overview#issue-types - "Issue types"
- https://docs.velt.dev/ai/agents/overview#per-run-options - "Per-run options"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run - "Run Execution"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/fix-it-everywhere/estimate - "Estimate Fix It Everywhere"
