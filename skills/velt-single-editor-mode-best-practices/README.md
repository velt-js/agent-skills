# Velt Single Editor Mode Best Practices - Contributor Guide

This skill provides implementation patterns and best practices for Velt's Single Editor Mode covering exclusive editing access, access request flows, and element-level sync control.

## Installation

```bash
npx skills add https://github.com/velt-js/agent-skills --skill velt-single-editor-mode-best-practices
```

## Updating

```bash
npx skills check
npx skills update
```

## Structure

```
velt-single-editor-mode-best-practices/
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
    │   ├── state/        # Editor state management rules
    │   ├── access/       # Access request flow rules
    │   ├── elements/     # Element control rules
    │   ├── timeout/      # Timeout configuration rules
    │   ├── events/       # Event handling rules
    │   └── debug/        # Debug & testing rules
    └── react/
        ├── state/        # React editor state hooks
        ├── access/       # React access request hooks
        ├── timeout/      # React timeout hooks
        └── events/       # React event hooks
```

## Quick Start

```bash
npm run validate
npm run build
```

## File Naming Convention

| Category | Prefix |
|----------|--------|
| Core Setup | `core-` |
| Editor State Management | `state-` |
| Access Request Flow | `access-` |
| Element Control | `elements-` |
| Timeout Configuration | `timeout-` |
| Event Handling | `events-` |
| Debugging & Testing | `debug-` |

## Source Documentation

All technical claims must be backed by:
- **Primary**: Velt official docs (docs.velt.dev)
- **Secondary**: Velt sample apps and console
