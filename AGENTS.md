# AGENTS.md

Guidance for AI coding agents working with this repository.

## Repository Structure

```
skills/
  {skill-name}/
    metadata.json         # Required: skill metadata
    SKILL.md              # Required: skill manifest
    AGENTS.md             # Generated: compiled rules
    README.md             # Required: contributor guide
    rules/
      _sections.md        # Required: section definitions
      _template.md        # Required: rule template
      {category}/         # Category folders
        {prefix}-{name}.md  # Rule files
```

## Commands

```bash
npm run build                    # Build all skills
npm run build -- {skill-name}    # Build specific skill
npm run validate                 # Validate all skills
npm run validate -- {skill-name} # Validate specific skill
```

## Creating a New Skill

1. Create directory: `mkdir -p skills/{name}/rules`
2. Add `metadata.json` with version, organization, abstract
3. Add `SKILL.md` with frontmatter and content
4. Add `README.md` with contributor guide
5. Add `rules/_sections.md` defining sections
6. Add `rules/_template.md` with rule template
7. Add category folders and rule files: `{category}/{prefix}-{rule-name}.md`
8. Run `npm run build`

## Rule File Format

```markdown
---
title: Action-Oriented Title
impact: CRITICAL|HIGH|MEDIUM-HIGH|MEDIUM|LOW-MEDIUM|LOW
impactDescription: Quantified benefit
tags: keywords
---

## Title

1-2 sentence explanation.

**Incorrect:**
\`\`\`typescript
// bad example
\`\`\`

**Correct:**
\`\`\`typescript
// good example
\`\`\`

**Verification:**
- [ ] Checklist item 1
- [ ] Checklist item 2

**Source Pointer:** `/docs/path/to/file.mdx` (section name)
```

## Impact Levels

| Level       | Improvement                   | Use For                                                    |
| ----------- | ----------------------------- | ---------------------------------------------------------- |
| CRITICAL    | 10-100x or prevents failure   | Security vulnerabilities, data loss, breaking changes      |
| HIGH        | 5-20x or major quality gain   | Architecture decisions, core functionality, scalability    |
| MEDIUM-HIGH | 2-5x or significant benefit   | Design patterns, common anti-patterns, reliability         |
| MEDIUM      | 1.5-3x or noticeable gain     | Optimization, best practices, maintainability              |
| LOW-MEDIUM  | 1.2-2x or minor benefit       | Configuration, tooling, code organization                  |
| LOW         | Incremental or edge cases     | Advanced techniques, rare scenarios, polish                |

## Available Skills

### velt-comments-best-practices

Velt Comments implementation patterns and best practices for React, Next.js, and web applications. Contains 33 rules across 9 categories.

**Use when:**
- Adding collaborative commenting to a React/Next.js application
- Implementing comment modes (Freestyle, Popover, Stream, Text, Page, Inline)
- Integrating comments with rich text editors (TipTap, SlateJS, Lexical)
- Adding comments to media players or charts
- Building custom comment interfaces with standalone components

**Categories covered:**
- Core Setup (Critical)
- Comment Modes (High)
- Standalone Components (Medium-High)
- Comment Surfaces (Medium-High)
- UI Customization (Medium)

### velt-notifications-best-practices

Velt Notifications implementation patterns and best practices for React, Next.js, and web applications. Contains 11 rules across 8 categories.

**Use when:**
- Adding in-app notifications to a React/Next.js application
- Setting up VeltNotificationsTool and VeltNotificationsPanel
- Configuring notification tabs and delivery channels
- Accessing notification data via hooks or REST APIs
- Setting up email notifications or webhook integrations

**Categories covered:**
- Core Setup (Critical)
- Panel Configuration (High)
- Data Access (High)
- Settings Management (Medium-High)
- Delivery Channels (Medium)

### velt-crdt-best-practices

Velt CRDT (Yjs) collaborative editing best practices for real-time applications. Contains 33 rules across 5 categories.

**Use when:**
- Setting up Velt client and CRDT stores
- Integrating with editors like Tiptap, BlockNote, CodeMirror, or ReactFlow
- Implementing real-time synchronization
- Debugging collaboration issues

**Categories covered:**
- Core CRDT (Critical)
- Tiptap Integration (Critical)
- BlockNote Integration (High)
- CodeMirror Integration (High)
- ReactFlow Integration (High)
