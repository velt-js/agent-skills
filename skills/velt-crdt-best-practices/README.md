# Velt CRDT Best Practices - Contributor Guide

This repository contains Velt CRDT (Yjs) best practice rules for AI agents and LLMs.

## Installation

Add this skill to your project from any terminal:

```bash
npx skills add https://github.com/velt-js/agent-skills --skill velt-crdt-best-practices
```

## Quick Start

```bash
# From repository root
npm install

# Validate existing rules
npm run validate

# Build AGENTS.md
npm run build
```

## Repository Structure

```
skills/velt-crdt-best-practices/
├── SKILL.md              # Agent-facing skill manifest
├── AGENTS.md             # [Generated] Compiled rules document
├── README.md             # This file
├── metadata.json         # Version and metadata
└── rules/
    ├── _sections.md      # Section/category definitions
    ├── _template.md      # Rule template
    ├── core/             # Core CRDT rules (11 rules)
    │   ├── core-install.md
    │   ├── core-velt-init.md
    │   ├── core-store-create-react.md
    │   ├── core-store-create-vanilla.md
    │   ├── core-store-types.md
    │   ├── core-store-subscribe.md
    │   ├── core-store-update.md
    │   ├── core-version-save.md
    │   ├── core-encryption.md
    │   ├── core-debug-storemap.md
    │   └── core-debug-testing.md
    ├── tiptap/           # Tiptap integration (7 rules)
    │   ├── tiptap-install.md
    │   ├── tiptap-setup-react.md
    │   ├── tiptap-setup-vanilla.md
    │   ├── tiptap-disable-history.md
    │   ├── tiptap-editor-id.md
    │   ├── tiptap-cursor-css.md
    │   └── tiptap-testing.md
    ├── blocknote/        # BlockNote integration (4 rules)
    │   ├── blocknote-install.md
    │   ├── blocknote-setup-react.md
    │   ├── blocknote-editor-id.md
    │   └── blocknote-testing.md
    ├── codemirror/       # CodeMirror integration (6 rules)
    │   ├── codemirror-install.md
    │   ├── codemirror-setup-react.md
    │   ├── codemirror-setup-vanilla.md
    │   ├── codemirror-ycollab.md
    │   ├── codemirror-editor-id.md
    │   └── codemirror-testing.md
    └── reactflow/        # ReactFlow integration (5 rules)
        ├── reactflow-install.md
        ├── reactflow-setup-react.md
        ├── reactflow-handlers.md
        ├── reactflow-editor-id.md
        └── reactflow-testing.md
```

## Creating a New Rule

1. **Choose a category folder** based on the integration:
   - `core/` - Framework-agnostic CRDT fundamentals
   - `tiptap/` - Tiptap rich text editor
   - `blocknote/` - BlockNote block editor
   - `codemirror/` - CodeMirror code editor
   - `reactflow/` - ReactFlow diagrams

2. **Copy the template**:
   ```bash
   cp rules/_template.md rules/core/core-new-rule.md
   ```

3. **Fill in the content** following the template structure

4. **Update _sections.md** to include the new rule

5. **Validate and build**:
   ```bash
   npm run validate
   npm run build
   ```

## Rule File Structure

```markdown
---
title: Action-Oriented Title
impact: CRITICAL|HIGH|MEDIUM-HIGH|MEDIUM|LOW-MEDIUM|LOW
impactDescription: Quantified benefit
tags: keywords
---

## Title

1-2 sentence explanation.

**Incorrect (description):**

\`\`\`typescript
// bad example
\`\`\`

**Correct (description):**

\`\`\`typescript
// good example
\`\`\`

**Verification:**
- [ ] Checklist item 1
- [ ] Checklist item 2

**Source Pointer:** `/docs/path/to/file.mdx` (section name)
```

## Impact Levels

| Level | Use For |
|-------|---------|
| CRITICAL | Foundation that prevents app from working |
| HIGH | Primary functionality and integrations |
| MEDIUM-HIGH | Enhanced features, state management |
| MEDIUM | Security, optimization patterns |
| LOW-MEDIUM | Backend integration, configuration |
| LOW | Debugging, testing, edge cases |

## Source Pointers

All rules must include source pointers to Velt documentation:

- Core: `/docs/realtime-collaboration/crdt/setup/core.mdx`
- Tiptap: `/docs/realtime-collaboration/crdt/setup/tiptap.mdx`
- BlockNote: `/docs/realtime-collaboration/crdt/setup/blocknote.mdx`
- CodeMirror: `/docs/realtime-collaboration/crdt/setup/codemirror.mdx`
- ReactFlow: `/docs/realtime-collaboration/crdt/setup/reactflow.mdx`
- Quickstart: `/docs/get-started/quickstart.mdx`

## License

MIT
