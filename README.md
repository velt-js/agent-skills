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
| **velt-setup-best-practices** | 24 | SDK installation, VeltProvider, authProvider, JWT tokens, document identity |
| **velt-comments-best-practices** | 71 | Comment modes (Freestyle, Popover, Stream, Text, Page, Inline), editor integrations (TipTap, SlateJS, Lexical), programmatic APIs, REST endpoints |
| **velt-activity-best-practices** | 11 | Real-time activity feeds, custom activity logging, audit trails, CRDT debounce |
| **velt-crdt-best-practices** | 44 | CRDT stores, Tiptap/BlockNote/CodeMirror/ReactFlow integrations, real-time sync |
| **velt-notifications-best-practices** | 17 | In-app notifications, email (SendGrid), webhooks, notification preferences |
| **velt-single-editor-mode-best-practices** | 14 | Exclusive editing, editor/viewer roles, access request handoff, timeout transfer |
| **velt-recorder-best-practices** | 21 | Audio/video/screen recording, playback, transcription, lifecycle events |
| **velt-self-hosting-data-best-practices** | 13 | Self-hosting user data, data providers, Python SDK (velt-py), backend API routes |
| **velt-presence-best-practices** | 13 | User presence avatars, online/away/offline status, inactivity timeouts |
| **velt-cursors-best-practices** | 11 | Real-time cursor tracking, avatar mode, element whitelisting, cursor callbacks |
| **velt-huddle-best-practices** | 10 | Audio/video/screen sharing huddles, flock mode, ephemeral chat, webhooks |
| **velt-rest-apis-best-practices** | 9 | REST API v2 endpoints, JWT token generation, webhooks v1/v2 |
| **velt-proxy-server-best-practices** | 14 | Reverse proxy (nginx) setup, proxyConfig, CSP whitelisting, SRI integrity |
| **Total** | **277** | |

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
