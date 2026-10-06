# Velt CRDT Best Practices - Contributor Guide

This repository contains Velt CRDT (Yjs) best practice rules for AI agents and LLMs.

## Installation

Add this skill to your project from any terminal:

```bash
npx skills add https://github.com/velt-js/agent-skills --skill velt-crdt-best-practices
```

## Updating

Check for and apply skill updates:

```bash
npx skills check      # Check for available updates
npx skills update     # Update all skills to latest versions
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
├── AGENTS.full.md        # [Generated] Full verbose guide
├── README.md             # This file
├── metadata.json         # Version and metadata
└── rules/
    ├── shared/           # Framework-agnostic rules (plus _sections.md and _template.md)
    │   ├── core/         # Core CRDT stores, versions, webhooks, REST, message stream
    │   ├── tiptap/       # Tiptap integration
    │   ├── blocknote/    # BlockNote integration
    │   ├── codemirror/   # CodeMirror integration
    │   └── editors/      # Multiplayer packages for Lexical, ProseMirror, Quill, TinyMCE, CKEditor, SuperDoc, Monaco, Ace, Apryse, Nutrient, SpreadJS
    ├── react/            # React-only rules (core hooks, v1 hooks, ReactFlow, Slate, Draft.js)
    └── non-react/        # Non-React-only rules (v1 factories, createVeltStore)
```

## Creating a New Rule

1. **Choose a category folder** based on the integration:
   - `core/` - Framework-agnostic CRDT fundamentals
   - `tiptap/` - Tiptap rich text editor
   - `blocknote/` - BlockNote block editor
   - `codemirror/` - CodeMirror code editor
   - `reactflow/` - ReactFlow diagrams
   - `editors/` - Velt multiplayer packages for Lexical, Slate, Draft.js, ProseMirror, Quill, TinyMCE, CKEditor, SuperDoc, Monaco, Ace, Apryse, Nutrient, SpreadJS

2. **Copy the template**:
   ```bash
   cp rules/shared/_template.md rules/shared/core/core-new-rule.md
   ```

3. **Fill in the content** following the template structure

4. **Update rules/shared/_sections.md** and the SKILL.md Quick Reference to include the new rule

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

**Source Pointers:**
- https://docs.velt.dev/... - "section name"
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

- Core: https://docs.velt.dev/realtime-collaboration/crdt/setup/core
- Tiptap: https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap
- BlockNote: https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote
- CodeMirror: https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror
- ReactFlow: https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow
- Multiplayer editors: https://docs.velt.dev/realtime-collaboration/crdt/overview (links to the Lexical, Slate, Draft.js, ProseMirror, Quill, TinyMCE, CKEditor, SuperDoc, Monaco, Ace, Apryse, Nutrient, and SpreadJS guides)
- Quickstart: https://docs.velt.dev/get-started/quickstart

## License

MIT
