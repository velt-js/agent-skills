# Velt Agent Skills

Agent Skills to help developers using AI agents with Velt. Agent Skills are
folders of instructions, scripts, and resources that agents like Claude Code,
Cursor, Github Copilot, etc... can discover and use to do things more accurately
and efficiently.

The skills in this repo follow the [Agent Skills](https://agentskills.io/)
format.

## Installation

```bash
npx skills add velt-js/agent-skills
```

## Available Skills

<details>
<summary><strong>velt-comments-best-practices</strong></summary>

Velt Comments implementation patterns and best practices for React, Next.js, and web applications.
Contains 33 rules across 9 categories, prioritized by impact.

**Use when:**

- Adding collaborative commenting to a React/Next.js application
- Implementing comment modes (Freestyle, Popover, Stream, Text, Page, Inline)
- Integrating comments with rich text editors (TipTap, SlateJS, Lexical)
- Adding comments to media players (Video, Lottie) or charts (Highcharts, ChartJS, Nivo)
- Building custom comment interfaces with standalone components

**Categories covered:**

- Core Setup (Critical)
- Comment Modes (High)
- Standalone Components (Medium-High)
- Comment Surfaces (Medium-High)
- UI Customization (Medium)

</details>

<details>
<summary><strong>velt-notifications-best-practices</strong></summary>

Velt Notifications implementation patterns and best practices for React, Next.js, and web applications.
Contains 11 rules across 8 categories, prioritized by impact.

**Use when:**

- Adding in-app notifications to a React/Next.js application
- Setting up VeltNotificationsTool and VeltNotificationsPanel
- Configuring notification tabs and delivery channels
- Accessing notification data via hooks or REST APIs
- Setting up email notifications with SendGrid or webhook integrations

**Categories covered:**

- Core Setup (Critical)
- Panel Configuration (High)
- Data Access (High)
- Settings Management (Medium-High)
- Delivery Channels (Medium)

</details>

<details>
<summary><strong>velt-crdt-best-practices</strong></summary>

Velt CRDT (Yjs) collaborative editing best practices for real-time applications.
Contains 33 rules across 5 categories, prioritized by impact.

**Use when:**

- Setting up Velt client and CRDT stores
- Integrating with editors (Tiptap, BlockNote, CodeMirror, ReactFlow)
- Implementing real-time synchronization
- Managing version history and checkpoints
- Debugging collaboration issues

**Categories covered:**

- Core CRDT (Critical)
- Tiptap Integration (Critical)
- BlockNote Integration (High)
- CodeMirror Integration (High)
- ReactFlow Integration (High)

</details>

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
