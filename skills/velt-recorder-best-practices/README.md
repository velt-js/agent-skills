# Velt Recorder Best Practices - Contributor Guide

This skill provides implementation patterns and best practices for Velt's Recorder system covering audio, video, and screen recording.

## Installation

Add this skill to your project from any terminal:

```bash
npx skills add https://github.com/velt-js/agent-skills --skill velt-recorder-best-practices
```

## Updating

Check for and apply skill updates:

```bash
npx skills check      # Check for available updates
npx skills update     # Update all skills to latest versions
```

## Structure

```
velt-recorder-best-practices/
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
    │   ├── config/       # Recording configuration rules
    │   ├── data/         # Data management rules
    │   ├── events/       # Event handling rules
    │   ├── editor/       # Video editor rules
    │   └── ui/           # UI/UX configuration rules
    └── react/
        ├── data/         # React data hooks
        ├── events/       # React event hooks
        └── debug/        # Debug & testing rules
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
| Recording Configuration | `config-` |
| Data Management | `data-` |
| Event Handling | `events-` |
| Video Editor | `editor-` |
| UI/UX Configuration | `ui-` |
| Debugging & Testing | `debug-` |

## Impact Levels

| Level | Description | Examples |
|-------|-------------|----------|
| CRITICAL | Required for feature to function | Component setup, event wiring |
| HIGH | Significant functionality | Type selection, max length, data hooks |
| MEDIUM-HIGH | Important patterns | Quality config, event subscriptions |
| MEDIUM | Enhancement patterns | Editor, PiP, transcription |
| LOW-MEDIUM | Optimization patterns | Countdown, debugging |
| LOW | Edge cases | Button labels |

## Writing Guidelines

1. **Evidence-backed**: every code pattern must come from official docs
2. **Action-oriented titles**: use verbs (e.g., "Enable", "Configure", "Set")
3. **Problem-first**: show incorrect example before correct
4. **Concrete examples**: use real component names and props
5. **Source pointers**: always include links to official documentation

## Source Documentation

All technical claims must be backed by:
- **Primary**: Velt official docs (docs.velt.dev)
- **Secondary**: Velt sample apps and console
