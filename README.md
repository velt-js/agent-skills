# Velt Agent Skills

Implementation rules and best practices for AI agents working with the Velt collaboration SDK. These skills are the **canonical source of truth** for Velt integration patterns — the [Velt Cursor plugin](https://github.com/velt-js/velt-plugin) and [MCP Installer](https://www.npmjs.com/package/@velt-js/mcp-installer) reference these rules by name.

Skills follow the [Agent Skills](https://agentskills.io/) format and work with Claude Code, Cursor, GitHub Copilot, and other AI agents.

## Installation

```bash
npx skills add velt-js/agent-skills
```

> **Recommended when using the Velt plugin.** The plugin's embedded rules are concise summaries; these skills provide the full detailed patterns with code examples, verification checklists, and troubleshooting guides.

## Available Skills

| Skill | Rules | Description |
|-------|-------|-------------|
| **velt-setup-best-practices** | 30 | SDK installation, VeltProvider, authProvider and JWT tokens, documents and locations, `featureAllowList`, AI tooling (plugins, Docs MCP) for Claude Code and Cursor |
| **velt-comments-best-practices** | 92 | Comment modes, editor integrations, sidebar v1/v2, private comments and visibility, progress and actions, programmatic APIs, REST endpoints |
| **velt-suggestions-best-practices** | 18 | Suggestion mode, capture (auto-commit, deferred, manual), accept/reject, status lifecycle, drift |
| **velt-crdt-best-practices** | 71 | CRDT stores, Tiptap/BlockNote/CodeMirror/ReactFlow, multiplayer packages for Lexical, ProseMirror, Monaco, Ace, Quill, TinyMCE, CKEditor, SuperDoc, Apryse, Nutrient, SpreadJS, Slate, Draft.js |
| **velt-activity-best-practices** | 13 | Activity feeds, custom logging, audit trails, CRDT debounce, activity REST API |
| **velt-notifications-best-practices** | 21 | In-app notifications, user-scoped notifications, email, webhooks, notification preferences |
| **velt-recorder-best-practices** | 25 | Audio/video/screen recording, playback, transcription, lifecycle events |
| **velt-reactions-best-practices** | 3 | Inline emoji reactions, custom reactions, reaction primitives |
| **velt-arrows-best-practices** | 3 | Arrow annotations, allowed elements, styling |
| **velt-area-best-practices** | 3 | Area (rectangle) comments, area toggle, location filtering |
| **velt-view-analytics-best-practices** | 3 | View analytics indicator, `useViewsUtils`, wireframes |
| **velt-presence-best-practices** | 16 | User presence avatars, online/away/offline status, custom presence users |
| **velt-cursors-best-practices** | 13 | Real-time cursor tracking, avatar mode, element whitelisting |
| **velt-huddle-best-practices** | 11 | Audio/video/screen sharing huddles, flock mode, huddle webhooks |
| **velt-single-editor-mode-best-practices** | 15 | Exclusive editing, editor/viewer roles, access handoff, panel wireframe |
| **velt-live-state-sync-best-practices** | 14 | Live state sync, Redux middleware, REST broadcast |
| **velt-rewriter-best-practices** | 9 | AI text rewriter, `askAi`, `replaceText`, AI models |
| **velt-approval-engine-best-practices** | 17 | Review Workflow Builder: definitions, agent/human/notification/webhook nodes, edges, quorum, triggers, executions |
| **velt-chat-sdk-adapter-best-practices** | 14 | Chat SDK adapter for bots in Velt comment threads |
| **velt-rest-apis-best-practices** | 21 | REST API v2, JWT generation, Agents and Memory APIs, webhooks v1/v2 |
| **velt-node-sdk-best-practices** | 9 | `@veltdev/node` 2.x: REST services, self-hosting on MongoDB/PostgreSQL, `generateToken`, `verifyToken` |
| **velt-self-hosting-data-best-practices** | 27 | Partial self-hosting data providers, velt-py 0.2.x, resolver auth, full self-hosting |
| **velt-proxy-server-best-practices** | 15 | Reverse proxy (nginx), proxyConfig, CSP whitelisting, SRI integrity |
| **yjs-best-practices** | 24 | Raw Yjs: Y.Doc, shared types, providers, editor bindings (source only, not bundled in the plugins) |
| **Total** | **487** | |

## Usage

Skills are automatically available once installed. The agent will use them when
relevant tasks are detected.

**Examples:**

```
Set up Velt CRDT for my Tiptap editor
```

```
Help me debug why my collaborative cursors aren't showing
```

```
Implement version history for my collaborative document
```

## Skill Structure

Each skill contains:

- `SKILL.md` - Instructions for the agent
- `AGENTS.md` - Compiled rules document (generated)
- `README.md` - Contributor guide
- `rules/` - Individual rule files organized by category
- `metadata.json` - Version and metadata

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new rules or
skills.

## License

MIT
