# Velt Setup Best Practices

Comprehensive setup guide for integrating Velt collaboration SDK into React, Next.js, Angular, Vue.js, and vanilla HTML applications.

## Installation

```bash
npx skills add https://github.com/anthropics/agent-skills/tree/main/skills/velt-setup-best-practices
```

## Updating

```bash
npx skills check velt-setup-best-practices   # Check for updates
npx skills update velt-setup-best-practices  # Install updates
```

## Structure

```
velt-setup-best-practices/
├── SKILL.md              # Agent-facing manifest
├── README.md             # This file
├── metadata.json         # Version and references
├── AGENTS.md             # [GENERATED] Compiled reference
├── 00_analysis/          # Format analysis
├── 01_plan/              # Taxonomy planning
├── 02_structure/         # Structure proposals
└── rules/
    ├── _template.md      # Rule template
    ├── _sections.md      # Section definitions
    ├── installation/     # Package installation
    ├── provider-wiring/  # VeltProvider setup
    ├── identity/         # User authentication
    ├── document-identity/# Document initialization
    ├── config/           # API keys and env vars
    ├── project-structure/# Folder organization
    ├── routing-surfaces/ # Component placement
    └── debugging-testing/# Troubleshooting
```

## Quick Start

```bash
npm run validate  # Validate all rule files
npm run build     # Generate AGENTS.md
```

## Creating a New Rule

1. Copy `rules/shared/_template.md` to the appropriate category folder
2. Rename using pattern: `{prefix}-{descriptive-name}.md`
3. Fill in the YAML frontmatter and markdown content
4. Add Source Pointers to docs or sample apps
5. Run `npm run validate` and `npm run build`

## Rule File Structure

```yaml
---
title: Action-Oriented Title
impact: CRITICAL|HIGH|MEDIUM-HIGH|MEDIUM|LOW-MEDIUM|LOW
impactDescription: Quantified benefit or requirement
tags: comma, separated, keywords
---

## Title

Brief explanation of why this matters (1-2 sentences).

**Incorrect (describe the problem):**

\`\`\`jsx
// Bad example with comments explaining the issue
\`\`\`

**Correct (describe the solution):**

\`\`\`jsx
// Good example with comments explaining why it works
\`\`\`

**Verification:**
- [ ] Check item 1
- [ ] Check item 2

**Source Pointers:**
- `/docs/path/to/file.mdx` - "Section Heading"
- `/sample-apps/apps/react/path` - Pattern name
```

## File Naming Convention

- Files starting with `_` are special (templates, sections)
- Rules use format: `{prefix}-{descriptive-name}.md`
- Prefix must match category (e.g., `install-`, `provider-`, `identity-`)

## Prefixes by Category

| Category | Prefix | Impact |
|----------|--------|--------|
| installation | install- | CRITICAL |
| provider-wiring | provider- | CRITICAL |
| identity | identity- | CRITICAL |
| document-identity | document- | CRITICAL |
| config | config- | HIGH |
| project-structure | structure- | MEDIUM |
| routing-surfaces | surface- | MEDIUM |
| debugging-testing | debug- | LOW-MEDIUM |

## Impact Levels

| Level | Description |
|-------|-------------|
| CRITICAL | SDK will not function without this |
| HIGH | Important for security or correctness |
| MEDIUM-HIGH | Significant best practice |
| MEDIUM | Recommended organizational pattern |
| LOW-MEDIUM | Helpful for debugging/optimization |
| LOW | Edge cases or advanced patterns |

## Source Documentation

**Primary:**
- `/docs/get-started/quickstart.mdx` - Core setup steps
- `/docs/get-started/advanced.mdx` - JWT auth, locations

**Secondary:**
- `/sample-apps/apps/react/` - Real implementation patterns
- `https://console.velt.dev` - API keys, domain config

## Writing Guidelines

1. **Evidence-backed**: Every claim must have a Source Pointer
2. **Action-oriented**: Titles start with verbs (Configure, Initialize, Use)
3. **Problem-first**: Show incorrect pattern before correct
4. **Concrete**: Include complete, runnable code examples
5. **Framework-aware**: Primary React/Next.js, secondary Angular/Vue/HTML

## Review Checklist

- [ ] Title is action-oriented and clear
- [ ] Impact level is appropriate for the rule
- [ ] Incorrect example shows the anti-pattern
- [ ] Correct example is complete and runnable
- [ ] Source Pointers reference actual docs or sample apps
- [ ] Code includes `'use client'` for Next.js when needed
- [ ] Verification checklist helps validate implementation
- [ ] Tags are relevant and lowercase

## Contributing

1. Fork the repository
2. Create a branch for your changes
3. Follow the rule file structure exactly
4. Test with `npm run validate`
5. Submit a pull request with Source Pointers

---

**Maintained by:** Velt
**License:** MIT
