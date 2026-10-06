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

## Available Skills (24 skills, 487 rules)

| Skill | Rules | Use When |
|-------|-------|----------|
| `velt-setup-best-practices` | 30 | SDK installation, VeltProvider, authProvider and JWT tokens, documents and locations, `featureAllowList`, AI tooling (plugins, Docs MCP) for Claude Code and Cursor |
| `velt-comments-best-practices` | 92 | Comment modes, editor integrations, sidebar v1/v2, private comments and visibility, progress and actions, programmatic APIs, REST endpoints |
| `velt-suggestions-best-practices` | 18 | Suggestion mode, capture (auto-commit, deferred, manual), accept/reject, status lifecycle, drift |
| `velt-crdt-best-practices` | 71 | CRDT stores, Tiptap/BlockNote/CodeMirror/ReactFlow, multiplayer packages for Lexical, ProseMirror, Monaco, Ace, Quill, TinyMCE, CKEditor, SuperDoc, Apryse, Nutrient, SpreadJS, Slate, Draft.js |
| `velt-activity-best-practices` | 13 | Activity feeds, custom logging, audit trails, CRDT debounce, activity REST API |
| `velt-notifications-best-practices` | 21 | In-app notifications, user-scoped notifications, email, webhooks, notification preferences |
| `velt-recorder-best-practices` | 25 | Audio/video/screen recording, playback, transcription, lifecycle events |
| `velt-reactions-best-practices` | 3 | Inline emoji reactions, custom reactions, reaction primitives |
| `velt-arrows-best-practices` | 3 | Arrow annotations, allowed elements, styling |
| `velt-area-best-practices` | 3 | Area (rectangle) comments, area toggle, location filtering |
| `velt-view-analytics-best-practices` | 3 | View analytics indicator, `useViewsUtils`, wireframes |
| `velt-presence-best-practices` | 16 | User presence avatars, online/away/offline status, custom presence users |
| `velt-cursors-best-practices` | 13 | Real-time cursor tracking, avatar mode, element whitelisting |
| `velt-huddle-best-practices` | 11 | Audio/video/screen sharing huddles, flock mode, huddle webhooks |
| `velt-single-editor-mode-best-practices` | 15 | Exclusive editing, editor/viewer roles, access handoff, panel wireframe |
| `velt-live-state-sync-best-practices` | 14 | Live state sync, Redux middleware, REST broadcast |
| `velt-rewriter-best-practices` | 9 | AI text rewriter, `askAi`, `replaceText`, AI models |
| `velt-approval-engine-best-practices` | 17 | Review Workflow Builder: definitions, agent/human/notification/webhook nodes, edges, quorum, triggers, executions |
| `velt-chat-sdk-adapter-best-practices` | 14 | Chat SDK adapter for bots in Velt comment threads |
| `velt-rest-apis-best-practices` | 21 | REST API v2, JWT generation, Agents and Memory APIs, webhooks v1/v2 |
| `velt-node-sdk-best-practices` | 9 | `@veltdev/node` 2.x: REST services, self-hosting on MongoDB/PostgreSQL, `generateToken`, `verifyToken` |
| `velt-self-hosting-data-best-practices` | 27 | Partial self-hosting data providers, velt-py 0.2.x, resolver auth, full self-hosting |
| `velt-proxy-server-best-practices` | 15 | Reverse proxy (nginx), proxyConfig, CSP whitelisting, SRI integrity |
| `yjs-best-practices` | 24 | Raw Yjs: Y.Doc, shared types, providers, editor bindings (source only, not bundled in the plugins) |
