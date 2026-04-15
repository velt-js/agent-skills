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

## Available Skills (13 skills, 277 rules)

| Skill | Rules | Use When |
|-------|-------|----------|
| `velt-setup-best-practices` | 24 | Setting up Velt, VeltProvider, authProvider, JWT tokens, document identity |
| `velt-comments-best-practices` | 71 | Comment modes, editor integrations, programmatic APIs, REST endpoints |
| `velt-activity-best-practices` | 11 | Activity feeds, custom logging, audit trails, CRDT debounce |
| `velt-crdt-best-practices` | 44 | CRDT stores, Tiptap/BlockNote/CodeMirror/ReactFlow, real-time sync |
| `velt-notifications-best-practices` | 17 | In-app notifications, email, webhooks, notification preferences |
| `velt-single-editor-mode-best-practices` | 14 | Exclusive editing, editor/viewer roles, access handoff |
| `velt-recorder-best-practices` | 21 | Audio/video/screen recording, playback, transcription |
| `velt-self-hosting-data-best-practices` | 13 | Self-hosting data, data providers, Python SDK (velt-py) |
| `velt-presence-best-practices` | 13 | User presence avatars, online/away/offline status |
| `velt-cursors-best-practices` | 11 | Real-time cursor tracking, avatar mode, element whitelisting |
| `velt-huddle-best-practices` | 10 | Audio/video/screen sharing huddles, flock mode |
| `velt-rest-apis-best-practices` | 9 | REST API v2, JWT token generation, webhooks |
| `velt-proxy-server-best-practices` | 14 | Reverse proxy (nginx), proxyConfig, CSP, SRI integrity |
