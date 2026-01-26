# Velt Comments Best Practices - Contributor Guide

This skill provides implementation patterns and best practices for Velt's collaborative comments feature.

## Installation

Add this skill to your project from any terminal:

```bash
npx skills add https://github.com/velt-js/agent-skills --skill velt-comments-best-practices
```

## Updating

Check for and apply skill updates:

```bash
npx skills check      # Check for available updates
npx skills update     # Update all skills to latest versions
```

## Structure

```
velt-comments-best-practices/
├── SKILL.md          # Agent-facing manifest with triggers
├── README.md         # This file
├── metadata.json     # Version, org, abstract, references
├── AGENTS.md         # [GENERATED] Compiled full document
└── rules/            # Individual rule files
    ├── _template.md  # Rule creation template
    ├── _sections.md  # Section/category definitions
    ├── core/         # Core setup rules
    ├── mode/         # Comment mode rules
    ├── standalone/   # Standalone component rules
    ├── surface/      # Comment surface rules
    ├── ui/           # UI customization rules
    ├── data/         # Data model rules
    ├── debug/        # Debug & testing rules
    ├── permissions/  # Access control rules
    └── attach/       # Attachments & reactions rules
```

## Quick Start

```bash
# Validate rule files
npm run validate

# Build AGENTS.md
npm run build
```

## Creating a New Rule

1. **Choose the appropriate category folder** based on the rule's purpose
2. **Copy the template**: `cp rules/_template.md rules/{category}/{prefix}-{name}.md`
3. **Fill in the content** following the template structure
4. **Add source pointers** to Velt documentation
5. **Validate and build**

## Rule File Structure

```markdown
---
title: Action-Oriented Title
impact: CRITICAL|HIGH|MEDIUM-HIGH|MEDIUM|LOW-MEDIUM|LOW
impactDescription: Quantified benefit (e.g., "Required for comments to function")
tags: comma, separated, keywords
---

## Rule Title

Brief explanation (1-2 sentences).

**Incorrect (problem description):**

```jsx
// Bad pattern
```

**Correct (solution description):**

```jsx
// Good pattern
```

Additional context or variations.

**Source Pointers:**
- `/docs/path/to/file.mdx` - Section heading
```

## File Naming Convention

- **Format**: `{prefix}-{descriptive-name}.md`
- **Examples**: `core-provider-setup.md`, `mode-freestyle.md`, `ui-comment-dialog.md`
- **All lowercase with hyphens (kebab-case)**

### Prefixes by Category

| Category | Prefix |
|----------|--------|
| Core Setup | `core-` |
| Comment Modes | `mode-` |
| Standalone Components | `standalone-` |
| Comment Surfaces | `surface-` |
| UI Customization | `ui-` |
| Data Model | `data-` |
| Debugging & Testing | `debug-` |
| Moderation & Permissions | `permissions-` |
| Attachments & Reactions | `attach-` |

## Impact Levels

| Level | Description | Examples |
|-------|-------------|----------|
| CRITICAL | Required for feature to function | Provider setup, authentication |
| HIGH | Significant functionality | Comment modes, major features |
| MEDIUM-HIGH | Important patterns | Standalone components, surfaces |
| MEDIUM | Enhancement patterns | UI customization, data handling |
| LOW-MEDIUM | Optimization patterns | Debugging, testing |
| LOW | Edge cases | Advanced features, rare scenarios |

## Source Documentation

All technical claims must be backed by:
- **Primary**: `/Users/yoenzhang/Downloads/docs` (Velt official docs)
- **Secondary**: `/Users/yoenzhang/Downloads/sample-apps/apps/react/comments` (Working demos)

Include source pointers in every rule file.

## Writing Guidelines

1. **Evidence-backed**: Every code pattern must come from docs or demos
2. **Action-oriented titles**: Use verbs (e.g., "Use Popover Mode for Table Cells")
3. **Problem-first structure**: Show incorrect pattern before correct
4. **Concrete examples**: Use real component names and props
5. **Source pointers**: Always include file paths and section references

## Review Checklist

- [ ] Title is action-oriented
- [ ] Impact level is accurate
- [ ] Explanation is 1-2 sentences
- [ ] Includes Incorrect code example
- [ ] Includes Correct code example
- [ ] Code uses actual Velt component names
- [ ] Props match documentation
- [ ] Source pointers are included
- [ ] Frontmatter YAML is valid

## Contributing

1. Check existing rules to avoid duplication
2. Follow the template structure exactly
3. Include source pointers to Velt docs
4. Test code examples when possible
5. Submit for review
