---
title: Install Velt AI Tooling for the Editor in Use (Claude Code or Cursor)
impact: MEDIUM
impactDescription: Each Velt plugin has a separate Claude Code and Cursor repository with different install commands; using the wrong one leaves skills, rules, and MCP servers unloaded
tags: ai, plugin, installation-plugin, velt-plugin-claude, velt-plugin-cursor, mcp, docs-mcp, velt-docs, mcp-installer, ui-customization-plugin, velt-customize, claude-code, cursor, agent-skills
---

## Install Velt AI Tooling for the Editor in Use (Claude Code or Cursor)

Velt ships AI tooling for coding agents: the Installation Plugin (skills, rules, a `velt-expert` agent, and the `velt-installer` + `velt-docs` MCP servers), the Velt Docs MCP server, the MCP Installer, and the UI Customization Plugin (`velt-customize`). Each plugin has a separate repository per editor, so match the install path to the editor. Install the Installation Plugin first; the UI Customization Plugin needs Velt already installed and rendering.

**Incorrect (mixing editors):**

```bash
# Cursor plugin repo loaded into Claude Code: Claude Code looks for
# .claude-plugin/plugin.json and guides/velt-rules.md, which this repo does not have
git clone https://github.com/velt-js/velt-plugin-cursor.git
claude --plugin-dir velt-plugin-cursor
```

```text
# Cursor command syntax typed in Claude Code (Claude Code uses /velt-customize:run)
/velt-customize-run <figma-loop-node-url> <app-url>
```

**Correct (Installation Plugin):**

```bash
# Claude Code
git clone https://github.com/velt-js/velt-plugin-claude.git
claude --plugin-dir velt-plugin-claude
```

```bash
# Cursor: clone, then add the repo root in Cursor Settings → Plugins and restart Cursor
git clone https://github.com/velt-js/velt-plugin-cursor.git
# Or, from within Cursor: /plugin marketplace add <path-to-repo>/velt-plugin-cursor
```

Verify in either editor by typing `/velt-help` in the AI chat. Requires Node.js 18+ and a Velt API key.

**Correct (Velt Docs MCP only, endpoint `https://velt.dev/docs/mcp`):**

```bash
# Claude Code
claude mcp add --transport http Velt https://velt.dev/docs/mcp
claude mcp list
```

Cursor: open the Command Palette, run "Open MCP settings", choose **Add custom MCP**, and add to `mcp.json`:

```json
{
  "mcpServers": {
    "Velt": {
      "url": "https://velt.dev/docs/mcp"
    }
  }
}
```

**Correct (MCP Installer only, guided setup with codebase scan):**

```bash
# Claude Code
claude mcp add velt-installer -- npx -y @velt-js/mcp-installer
```

Cursor: add to `.cursor/mcp.json` in your project (or the global config):

```json
{
  "mcpServers": {
    "velt-installer": {
      "command": "npx",
      "args": ["-y", "@velt-js/mcp-installer"]
    }
  }
}
```

**Correct (UI Customization Plugin, Figma design to Velt UI):**

| Step | Claude Code | Cursor |
|------|-------------|--------|
| Install | `/plugin marketplace add velt-js/velt-figma-plugin-claude` then `/plugin install velt-customize@velt-customize`, restart or `/reload-plugins` | `git clone https://github.com/velt-js/velt-figma-plugin-cursor.git`, `cd velt-figma-plugin-cursor`, `npm run all`, fully restart Cursor |
| Figma token | `node "$CLAUDE_PLUGIN_ROOT/scripts/figma-extract.mjs" token set` (run inside Claude Code) | `node scripts/figma-extract.mjs token set` |
| Browser check | Claude in Chrome extension | Cursor's built-in browser plus `npm i -g playwright-core` |
| Run | `/velt-customize:run <figma-loop-node-url> <app-url>` | `/velt-customize-run <figma-loop-node-url> <app-url>` |

Pass the exact app page where Velt renders, with a run-unique `documentId` query param (for example `http://localhost:3000/inline-comments?documentId=my-run-1`). The plugin writes code under `components/velt/ui-customization/`.

**Which tool to use:**

| Scenario | Use |
|----------|-----|
| First Velt setup in Claude Code or Cursor | Installation Plugin |
| Editor without plugin support | MCP Installer + Agent Skills (`npx skills add velt-js/agent-skills`) |
| Question the skills don't cover | Velt Docs MCP |
| Match Velt UI to a Figma design (Velt already working) | UI Customization Plugin |
| No AI agent, Next.js | CLI (`npx @velt-js/add-velt`) |

**Verification:**
- [ ] The plugin repository matches the editor (`velt-plugin-claude` / `velt-figma-plugin-claude` for Claude Code, `velt-plugin-cursor` / `velt-figma-plugin-cursor` for Cursor)
- [ ] `/velt-help` responds with Velt-specific answers after install
- [ ] Docs MCP points at `https://velt.dev/docs/mcp`
- [ ] UI Customization Plugin runs only after Velt's default UI renders in the app

**Source Pointers:**
- `https://docs.velt.dev/get-started/agentic-overview` - Overview ("When to Use What")
- `https://docs.velt.dev/get-started/installation-plugin` - Installation Plugin ("Quickstart", "Troubleshooting")
- `https://docs.velt.dev/get-started/docs-mcp` - Velt Docs MCP ("Setup")
- `https://docs.velt.dev/get-started/mcp-installer` - Velt Installation MCP ("Quickstart")
- `https://docs.velt.dev/get-started/ui-customization-plugin` - UI Customization Plugin ("Quickstart", "Available Commands")
