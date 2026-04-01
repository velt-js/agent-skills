#!/usr/bin/env node

/**
 * deploy.mjs
 *
 * Deploys plugin-specific skills and rules to Cursor and Claude Code local directories.
 *
 * Both IDEs read skills from their home directories, NOT from plugin directories:
 *   - Cursor:     ~/.cursor/skills/ and ~/.cursor/rules/
 *   - Claude Code: ~/.claude/skills/
 *
 * Agent-skills (velt-*-best-practices) are installed separately via `npx skills add`.
 * This script deploys only plugin-specific skills (install-velt, velt-help) and rules.
 *
 * Source precedence:
 *   1. Sibling plugin repos (../velt-plugin-cursor, ../velt-plugin-claude)
 *   2. Falls back to whichever plugin repo exists
 *
 * Usage:
 *   node scripts/deploy.mjs           # Deploy to both Cursor and Claude
 *   node scripts/deploy.mjs --cursor  # Deploy to Cursor only
 *   node scripts/deploy.mjs --claude  # Deploy to Claude Code only
 */

import { existsSync, cpSync, readdirSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Plugin repos (siblings of agent-skills)
const CURSOR_PLUGIN = resolve(ROOT, "..", "velt-plugin-cursor");
const CLAUDE_PLUGIN = resolve(ROOT, "..", "velt-plugin-claude");

// IDE home directories
const CURSOR_HOME = resolve(homedir(), ".cursor");
const CLAUDE_HOME = resolve(homedir(), ".claude");

// Plugin-specific skills to deploy (not agent-skills — those are installed via npx)
const SKILLS_TO_DEPLOY = [
  "install-velt",
  "velt-help",
];

function deploySkills(sourcePluginDir, targetSkillsDir, ideName) {
  mkdirSync(targetSkillsDir, { recursive: true });
  let count = 0;

  for (const skill of SKILLS_TO_DEPLOY) {
    const src = resolve(sourcePluginDir, "skills", skill, "SKILL.md");
    if (!existsSync(src)) {
      console.warn(`  ⚠ ${skill} — not found in ${sourcePluginDir}/skills/`);
      continue;
    }

    const destDir = resolve(targetSkillsDir, skill);
    mkdirSync(destDir, { recursive: true });
    cpSync(src, resolve(destDir, "SKILL.md"));
    console.log(`  ✓ ${skill}`);
    count++;
  }

  return count;
}

function deployRules(sourcePluginDir, targetRulesDir) {
  const rulesDir = resolve(sourcePluginDir, "rules");
  if (!existsSync(rulesDir)) return 0;

  mkdirSync(targetRulesDir, { recursive: true });
  const rules = readdirSync(rulesDir).filter(f => f.endsWith(".mdc"));
  let count = 0;

  for (const rule of rules) {
    cpSync(resolve(rulesDir, rule), resolve(targetRulesDir, rule));
    console.log(`  ✓ ${rule}`);
    count++;
  }

  return count;
}

function main() {
  const args = process.argv.slice(2);
  const cursorOnly = args.includes("--cursor");
  const claudeOnly = args.includes("--claude");
  const deployBoth = !cursorOnly && !claudeOnly;

  let totalDeployed = 0;

  // Deploy to Cursor
  if (deployBoth || cursorOnly) {
    console.log("[deploy] Cursor — skills");
    if (existsSync(CURSOR_PLUGIN)) {
      totalDeployed += deploySkills(CURSOR_PLUGIN, resolve(CURSOR_HOME, "skills"), "Cursor");
    } else {
      console.warn("  ⚠ velt-plugin-cursor not found, skipping Cursor skills");
    }

    console.log("\n[deploy] Cursor — rules");
    if (existsSync(CURSOR_PLUGIN)) {
      totalDeployed += deployRules(CURSOR_PLUGIN, resolve(CURSOR_HOME, "rules"));
    } else {
      console.warn("  ⚠ velt-plugin-cursor not found, skipping Cursor rules");
    }
    console.log("");
  }

  // Deploy to Claude Code
  if (deployBoth || claudeOnly) {
    console.log("[deploy] Claude Code — skills");
    if (existsSync(CLAUDE_PLUGIN)) {
      totalDeployed += deploySkills(CLAUDE_PLUGIN, resolve(CLAUDE_HOME, "skills"), "Claude");
    } else if (existsSync(CURSOR_PLUGIN)) {
      // Fallback: use Cursor plugin skills (they should be the same)
      console.log("  (using velt-plugin-cursor as source — velt-plugin-claude not found)");
      totalDeployed += deploySkills(CURSOR_PLUGIN, resolve(CLAUDE_HOME, "skills"), "Claude");
    } else {
      console.warn("  ⚠ No plugin repo found, skipping Claude skills");
    }
    console.log("");
  }

  console.log(`[deploy] Done — ${totalDeployed} files deployed.`);
  if (deployBoth || cursorOnly) console.log("[deploy] Restart Cursor to pick up changes.");
  if (deployBoth || claudeOnly) console.log("[deploy] Restart Claude Code to pick up changes.");
}

main();
