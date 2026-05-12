# CONTRIBUTING.md

Thank you for contributing to Velt Agent Skills! Here's how to get started:

[1. Getting Started](#getting-started) | [2. Auto-sync from docs](#auto-sync-from-docs) |
[3. Issues](#issues) | [4. Pull Requests](#pull-requests) |
[5. Contributing New Rules](#contributing-new-rules) |
[6. Creating a New Skill](#creating-a-new-skill)

## Getting Started

To ensure a positive and inclusive environment, please be respectful and
constructive in all contributions.

## Auto-sync from docs

Skills in this repo are **automatically updated** by the [`docs-sync-skills`](https://github.com/velt-js/docs/blob/main/.github/workflows/docs-sync-skills.yml) workflow whenever a docs change merges to `main`. The pipeline opens a PR labeled `skills-sync` (look for the `skills-sync` label in PRs) and assigns reviewers per `.github/CODEOWNERS`.

**What this means for contributors:**

- **Don't manually re-sync** prose, prop names, or API URLs that should come from docs. The pipeline does this. If a skill rule is out of date with docs, the right fix is to update the docs (`velt-js/docs`) and let the next pipeline run sync it.
- **Direct edits to `rules/**` are still welcome** for things the pipeline can't do well: improving example quality, fixing nuance, restructuring an explanation, fixing typos in skill prose. Just open a normal PR — the auto-sync PR will rebase or merge cleanly with yours.
- **Reviewing bot PRs:** treat `skills-sync`-labeled PRs like any other PR. Reject if a rule's prose got worse; the bot can't always tell when it's degrading quality. CODEOWNERS will request your review when relevant skills change.
- **Watch out for:** `metadata.json.abstract` changes (should be very rare from the bot; CI rejects unless labeled `manual-skill-rewrite`); `references` reordering (the bot only appends); `AGENTS.md` changes without rule changes (CI catches this).

The pipeline files separate issues labeled `new-skill-proposal` when docs add features that have no skill counterpart. These are human decisions — review and either create the skill manually, extend an existing skill, or close as out-of-scope.

## Issues

If you find a typo, have a suggestion for a new skill/rule, or want to improve
existing skills/rules, please create an Issue.

- Please search existing Issues before creating a new one.
- Please include a clear description of the problem or suggestion.
- Tag your issue appropriately (e.g., `bug`, `question`, `enhancement`,
  `new-rule`, `new-skill`, `documentation`).

## Pull Requests

We actively welcome your Pull Requests! Here's what to keep in mind:

- If you're fixing an Issue, make sure someone else hasn't already created a PR
  for it. Link your PR to the related Issue(s).
- We will always try to accept the first viable PR that resolves the Issue.
- If you're new, we encourage you to take a look at issues tagged with
  `good first issue`.
- If you're proposing a significant new skill or major changes, please open a
  Discussion first to gather feedback before investing time in implementation.

### Pre-Flight Checks

Before submitting your PR, please run these checks:

```bash
npm run validate  # Check rule format and structure
npm run build     # Generate AGENTS.md from rules
```

Both commands must complete successfully.

## Contributing New Rules

To add a rule to an existing skill:

1. Navigate to `skills/{skill-name}/rules/{category}/`
2. Copy `../_template.md` to `{prefix}-{your-rule-name}.md`
3. Fill in the frontmatter (title, impact, impactDescription, tags)
4. Write explanation and examples (Incorrect/Correct)
5. Add verification checklist and source pointer
6. Run validation and build:

```bash
npm run validate
npm run build
```

## Creating a New Skill

To create an entirely new skill:

### 1. Create the directory structure

```bash
mkdir -p skills/my-skill/rules
```

### 2. Create metadata.json

```json
{
  "version": "1.0.0",
  "organization": "Your Org",
  "date": "January 2026",
  "abstract": "Brief description of this skill."
}
```

### 3. Create SKILL.md

```markdown
---
name: my-skill
description: One sentence describing when to use this skill.
---

# My Skill

Description and category tables.
```

### 4. Create rules/_sections.md

```markdown
## 1. First Category (first/)

**Impact:** HIGH
**Description:** What this category covers.

**Rules:**
- `first-example-rule` - Description

## 2. Second Category (second/)

**Impact:** MEDIUM
**Description:** What this category covers.
```

### 5. Create category folders and rule files

```bash
mkdir skills/my-skill/rules/first
# Create rules/first/first-example-rule.md
```

Name files as `{prefix}-{rule-name}.md` where prefix matches the category.

### 6. Build

```bash
npm run build
```

The build system auto-discovers skills. No configuration needed.

## Questions or Feedback?

- Open an Issue for bugs or suggestions
- Check existing Issues before creating new ones

## License

By contributing to this repository, you agree that your contributions will be
licensed under the MIT License.
