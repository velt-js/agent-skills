# Velt Activity Logs Best Practices - Contributor Guide

This skill provides implementation patterns and best practices for Velt's Activity Logs system covering real-time activity feeds, custom events, and audit trails.

## Installation

Add this skill to your project from any terminal:

```bash
npx skills add https://github.com/velt-js/agent-skills --skill velt-activity-best-practices
```

## Updating

Check for and apply skill updates:

```bash
npx skills check      # Check for available updates
npx skills update     # Update all skills to latest versions
```

## Structure

```
velt-activity-best-practices/
├── SKILL.md          # Agent-facing manifest with triggers
├── README.md         # This file
├── metadata.json     # Version, org, abstract, references
├── AGENTS.md         # [GENERATED] Compressed index
├── AGENTS.full.md    # [GENERATED] Full verbose guide
└── rules/
    ├── shared/
    │   ├── _template.md  # Rule creation template
    │   ├── _sections.md  # Section/category definitions
    │   ├── core/         # Core setup rules
    │   ├── data/         # Data access rules (API)
    │   ├── config/       # Configuration rules
    │   ├── rest/         # REST API rules
    │   └── debug/        # Debug & testing rules
    └── react/
        └── data/         # Data access rules (hooks)
```

## Quick Start

```bash
# Validate rule files
npm run validate

# Build AGENTS.md and AGENTS.full.md
npm run build
```

## Creating a New Rule

1. **Choose the appropriate category folder** based on the rule's purpose
2. **Copy the template**: `cp rules/shared/_template.md rules/shared/{category}/{prefix}-{name}.md`
3. **Fill in the content** following the template structure
4. **Add source pointers** to Velt documentation
5. **Validate and build**

## File Naming Convention

- **Format**: `{prefix}-{descriptive-name}.md`
- **All lowercase with hyphens (kebab-case)**

### Prefixes by Category

| Category | Prefix |
|----------|--------|
| Core Setup | `core-` |
| Data Access | `data-` |
| Configuration | `config-` |
| REST API | `rest-` |
| Debugging & Testing | `debug-` |

## Impact Levels

| Level | Description | Examples |
|-------|-------------|----------|
| CRITICAL | Required for feature to function | Console enable |
| HIGH | Core functionality | Activity subscriptions, custom events |
| MEDIUM | Enhancement patterns | Debounce, immutability, type-safe filters |
| LOW-MEDIUM | Supplemental patterns | REST API, debugging |

## Writing Guidelines

1. **Evidence-backed**: every code pattern must come from official docs
2. **Action-oriented titles**: use verbs (e.g., "Enable", "Configure", "Use")
3. **Problem-first**: show incorrect example before correct
4. **Concrete examples**: use real hook names and API methods
5. **Source pointers**: always include links to official documentation

## Source Documentation

All technical claims must be backed by:
- **Primary**: Velt official docs (docs.velt.dev)
- **Secondary**: Velt sample apps and console
