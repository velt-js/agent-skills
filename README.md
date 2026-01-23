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
