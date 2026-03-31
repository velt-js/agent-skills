# Velt Self-Hosting Data Best Practices - Contributor Guide

This skill provides implementation patterns for storing Velt collaboration data on your own infrastructure.

## Installation

```bash
npx skills add https://github.com/velt-js/agent-skills --skill velt-self-hosting-data-best-practices
```

## Structure

```
velt-self-hosting-data-best-practices/
├── SKILL.md / README.md / metadata.json
├── AGENTS.md / AGENTS.full.md    # [GENERATED]
└── rules/shared/
    ├── _template.md / _sections.md
    ├── core/         # Core setup rules
    ├── comment/      # Comment data provider rules
    ├── attachment/   # Attachment data provider rules
    ├── provider/     # Additional provider rules
    ├── backend/      # Backend implementation rules
    └── debug/        # Debugging rules
```

## Prefixes

| Category | Prefix |
|----------|--------|
| Core Setup | `core-` |
| Comment Data Provider | `comment-` |
| Attachment Data Provider | `attachment-` |
| Additional Providers | `provider-` |
| Backend Implementation | `backend-` |
| Debugging | `debug-` |

## Source Documentation

- **Primary**: Velt official docs (docs.velt.dev/self-host-data)
- **Secondary**: Velt sample apps and console
