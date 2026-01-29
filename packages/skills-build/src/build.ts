import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import {
	discoverSkills,
	getSkillPaths,
	type SkillPaths,
	validateSkillExists,
} from "./config.js";
import { parseRuleFile } from "./parser.js";
import type { Metadata, Rule, Section, SourceGroup } from "./types.js";

/** Priority order for source groups: react first, then shared, then non-react */
const SOURCE_GROUP_PRIORITY: Record<SourceGroup, number> = {
	react: 0,
	shared: 1,
	"non-react": 2,
};

/** Valid source group directory names */
const SOURCE_GROUPS: SourceGroup[] = ["react", "shared", "non-react"];
import { validateRuleFile } from "./validate.js";

/**
 * Parse section definitions from _sections.md
 * Looks in rules/shared/_sections.md first, falls back to rules/_sections.md
 * Supports folder-based format: ## 1. Category Name (folder/)
 */
function parseSections(rulesDir: string): Section[] {
	const sharedSectionsFile = join(rulesDir, "shared", "_sections.md");
	const legacySectionsFile = join(rulesDir, "_sections.md");
	const sectionsFile = existsSync(sharedSectionsFile) ? sharedSectionsFile : legacySectionsFile;
	if (!existsSync(sectionsFile)) {
		console.warn("Warning: _sections.md not found, using empty sections");
		return [];
	}

	const content = readFileSync(sectionsFile, "utf-8");
	const sections: Section[] = [];

	// Match format with folder in parentheses:
	// ## 1. Core CRDT (core/)
	// **Impact:** CRITICAL
	// **Description:** Description text
	const sectionMatches = content.matchAll(
		/##\s+(\d+)\.\s+([^\n(]+)\s*\(([\w-]+)\/?\)\s*\n+\*\*Impact:\*\*\s*(\w+(?:-\w+)?)\s*\n+\*\*Description:\*\*\s*([^\n]+)/g,
	);

	for (const match of sectionMatches) {
		sections.push({
			number: parseInt(match[1], 10),
			title: match[2].trim(),
			folder: match[3].trim(),
			impact: match[4].trim() as Section["impact"],
			description: match[5].trim(),
		});
	}

	return sections;
}

/**
 * Load metadata from metadata.json
 */
function loadMetadata(metadataFile: string, skillName: string): Metadata {
	if (!existsSync(metadataFile)) {
		return {
			version: "1.0.0",
			organization: "Velt",
			date: new Date().toLocaleDateString("en-US", {
				month: "long",
				year: "numeric",
			}),
			abstract: `${skillName} guide for developers.`,
			references: [],
		};
	}

	return JSON.parse(readFileSync(metadataFile, "utf-8"));
}

/**
 * Generate anchor from title
 */
function toAnchor(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-");
}

/**
 * Convert skill name to title (e.g., "velt-crdt-best-practices" -> "Velt Crdt Best Practices")
 */
function skillNameToTitle(skillName: string): string {
	return skillName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Generate SECTION_MAP from parsed sections (folder -> section number)
 */
export function generateSectionMap(
	sections: Section[],
): Record<string, number> {
	const map: Record<string, number> = {};
	for (const section of sections) {
		map[section.folder] = section.number;
	}
	return map;
}

/**
 * Get all rule files from category subdirectories.
 * Searches in react/, shared/, and non-react/ source group directories.
 * Falls back to flat structure (rules/{folder}/) for backward compatibility.
 */
function getRuleFilesFromCategories(rulesDir: string, sections: Section[]): string[] {
	const ruleFiles: string[] = [];

	for (const section of sections) {
		let found = false;

		// Search in source group subdirectories (react/, shared/, non-react/)
		for (const group of SOURCE_GROUPS) {
			const categoryDir = join(rulesDir, group, section.folder);
			if (!existsSync(categoryDir)) continue;

			found = true;
			const files = readdirSync(categoryDir)
				.filter((f) => f.endsWith(".md") && !f.startsWith("_"))
				.map((f) => join(categoryDir, f));

			ruleFiles.push(...files);
		}

		// Fallback: check flat structure (rules/{folder}/)
		if (!found) {
			const categoryDir = join(rulesDir, section.folder);
			if (existsSync(categoryDir)) {
				const files = readdirSync(categoryDir)
					.filter((f) => f.endsWith(".md") && !f.startsWith("_"))
					.map((f) => join(categoryDir, f));

				ruleFiles.push(...files);
			} else {
				console.warn(`  Warning: Category folder not found: ${section.folder}/`);
			}
		}
	}

	return ruleFiles;
}

/**
 * Determine the source group from a rule file's path relative to the rules directory.
 */
function getSourceGroup(filePath: string, rulesDir: string): SourceGroup {
	const rel = relative(rulesDir, filePath);
	const firstDir = rel.split("/")[0];
	if (firstDir === "react" || firstDir === "non-react" || firstDir === "shared") {
		return firstDir as SourceGroup;
	}
	// Flat structure defaults to shared
	return "shared";
}

/**
 * Build compressed pipe-delimited index for AGENTS.md
 * Points to individual rule files on disk for on-demand reading.
 */
function buildCompressedIndex(
	paths: SkillPaths,
	metadata: Metadata,
	sections: Section[],
	rulesBySection: Map<number, Rule[]>,
	skillTitle: string,
): string {
	const output: string[] = [];

	// Compact header
	output.push(`# ${skillTitle}`);
	output.push(`|v${metadata.version}|${metadata.organization}|${metadata.date}`);
	output.push(`|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any ${metadata.organization} tasks.`);
	output.push(`|root: ./rules`);
	output.push("");

	// Sections with rule file references
	for (const section of sections) {
		const sectionRules = rulesBySection.get(section.number) || [];

		output.push(`## ${section.number}. ${section.title} — ${section.impact}`);

		if (sectionRules.length === 0) {
			continue;
		}

		// Group rules by sourceGroup within this section
		const rulesByGroup = new Map<SourceGroup, Rule[]>();
		for (const rule of sectionRules) {
			const group = rulesByGroup.get(rule.sourceGroup) || [];
			group.push(rule);
			rulesByGroup.set(rule.sourceGroup, group);
		}

		// Output each group's rules on one line
		for (const group of SOURCE_GROUPS) {
			const groupRules = rulesByGroup.get(group);
			if (!groupRules || groupRules.length === 0) continue;

			const fileNames = groupRules.map((rule) => basename(rule.filePath));
			output.push(`|${group}/${section.folder}:{${fileNames.join(",")}}`);
		}

		output.push("");
	}

	return output.join("\n");
}

/**
 * Build AGENTS.md (compressed index) and AGENTS.full.md (verbose) for a specific skill
 */
function buildSkill(paths: SkillPaths): void {
	console.log(`[${paths.name}] Building AGENTS.md...`);

	// Load metadata and sections
	const metadata = loadMetadata(paths.metadataFile, paths.name);
	const sections = parseSections(paths.rulesDir);
	const sectionMap = generateSectionMap(sections);
	const skillTitle = skillNameToTitle(paths.name);

	// Check if rules directory exists
	if (!existsSync(paths.rulesDir)) {
		console.log(`  No rules directory found. Generating empty AGENTS.md.`);
		writeFileSync(
			paths.agentsOutput,
			`# ${skillTitle}\n\nNo rules defined yet.\n`,
		);
		writeFileSync(
			paths.agentsFullOutput,
			`# ${skillTitle}\n\nNo rules defined yet.\n`,
		);
		return;
	}

	// Get all rule files from category subdirectories
	const ruleFiles = getRuleFilesFromCategories(paths.rulesDir, sections);

	if (ruleFiles.length === 0) {
		console.log(`  No rule files found. Generating empty AGENTS.md.`);
	}

	// Parse and validate all rules
	const rules: Rule[] = [];

	for (const file of ruleFiles) {
		const validation = validateRuleFile(file, sectionMap);
		if (!validation.valid) {
			console.error(`  Skipping invalid file ${basename(file)}:`);
			for (const e of validation.errors) {
				console.error(`    - ${e}`);
			}
			continue;
		}

		const result = parseRuleFile(file, sectionMap);
		if (result.success && result.rule) {
			result.rule.sourceGroup = getSourceGroup(file, paths.rulesDir);
			result.rule.filePath = file;
			rules.push(result.rule);
		}
	}

	// Group rules by section and assign IDs
	const rulesBySection = new Map<number, Rule[]>();

	for (const rule of rules) {
		const sectionRules = rulesBySection.get(rule.section) || [];
		sectionRules.push(rule);
		rulesBySection.set(rule.section, sectionRules);
	}

	// Sort rules within each section: react first, then shared, then non-react; alphabetical within each group
	for (const [sectionNum, sectionRules] of rulesBySection) {
		sectionRules.sort((a, b) => {
			const groupDiff = SOURCE_GROUP_PRIORITY[a.sourceGroup] - SOURCE_GROUP_PRIORITY[b.sourceGroup];
			if (groupDiff !== 0) return groupDiff;
			return a.title.localeCompare(b.title);
		});
		sectionRules.forEach((rule, index) => {
			rule.id = `${sectionNum}.${index + 1}`;
		});
	}

	// Generate compressed index (AGENTS.md)
	const compressedOutput = buildCompressedIndex(paths, metadata, sections, rulesBySection, skillTitle);
	writeFileSync(paths.agentsOutput, compressedOutput);
	console.log(`  Generated: ${paths.agentsOutput} (compressed index)`);

	// Generate full verbose output (AGENTS.full.md)
	const output: string[] = [];

	// Header (with trailing spaces for line breaks to match reference format)
	output.push(`# ${skillTitle}\n`);
	output.push(`**Version ${metadata.version}**  `);
	output.push(`${metadata.organization}  `);
	output.push(`${metadata.date}\n`);
	output.push("> **Note:**  ");
	output.push("> This document is mainly for agents and LLMs to follow when maintaining,  ");
	output.push("> generating, or refactoring codebases. Humans may also find it useful,  ");
	output.push("> but guidance here is optimized for automation and consistency by  ");
	output.push("> AI-assisted workflows.\n");
	output.push("---\n");

	// Abstract
	output.push("## Abstract\n");
	output.push(`${metadata.abstract}\n`);
	output.push("---\n");

	// Table of Contents
	output.push("## Table of Contents\n");

	for (const section of sections) {
		const sectionRules = rulesBySection.get(section.number) || [];
		output.push(
			`${section.number}. [${section.title}](#${toAnchor(`${section.number}-${section.title}`)}) — **${section.impact}**`,
		);

		for (const rule of sectionRules) {
			output.push(
				`   - ${rule.id} [${rule.title}](#${toAnchor(`${rule.id}-${rule.title}`)})`,
			);
		}

		output.push("");
	}

	output.push("---\n");

	// Sections and Rules
	for (const section of sections) {
		const sectionRules = rulesBySection.get(section.number) || [];

		output.push(`## ${section.number}. ${section.title}\n`);
		output.push(`**Impact: ${section.impact}**\n`);
		output.push(`${section.description}\n`);

		if (sectionRules.length === 0) {
			output.push(
				"*No rules defined yet. See rules/_template.md for creating new rules.*\n",
			);
		}

		for (const rule of sectionRules) {
			output.push(`### ${rule.id} ${rule.title}\n`);

			if (rule.impactDescription) {
				output.push(`**Impact: ${rule.impact} (${rule.impactDescription})**\n`);
			} else {
				output.push(`**Impact: ${rule.impact}**\n`);
			}

			output.push(`${rule.explanation}\n`);

			for (const example of rule.examples) {
				if (example.description) {
					output.push(`**${example.label} (${example.description}):**\n`);
				} else {
					output.push(`**${example.label}:**\n`);
				}

				output.push(`\`\`\`${example.language || "typescript"}`);
				output.push(example.code);
				output.push("```\n");

				if (example.additionalText) {
					output.push(`${example.additionalText}\n`);
				}
			}

			if (rule.references && rule.references.length > 0) {
				if (rule.references.length === 1) {
					output.push(`Reference: ${rule.references[0]}\n`);
				} else {
					output.push("References:");
					for (const ref of rule.references) {
						output.push(`- ${ref}`);
					}
					output.push("");
				}
			}

			output.push("---\n");
		}
	}

	// References section
	if (metadata.references && metadata.references.length > 0) {
		output.push("## References\n");
		for (const ref of metadata.references) {
			output.push(`- ${ref}`);
		}
		output.push("");
	}

	// Write full verbose output
	writeFileSync(paths.agentsFullOutput, output.join("\n"));
	console.log(`  Generated: ${paths.agentsFullOutput} (full verbose)`);
	console.log(`  Total rules: ${rules.length}`);
}

// Run build when executed directly
const isMainModule =
	process.argv[1]?.endsWith("build.ts") ||
	process.argv[1]?.endsWith("build.js");

if (isMainModule) {
	const targetSkill = process.argv[2];

	if (targetSkill) {
		// Build specific skill
		if (!validateSkillExists(targetSkill)) {
			console.error(`Error: Skill "${targetSkill}" not found in skills/`);
			const available = discoverSkills();
			if (available.length > 0) {
				console.error(`Available skills: ${available.join(", ")}`);
			}
			process.exit(1);
		}
		buildSkill(getSkillPaths(targetSkill));
	} else {
		// Build all skills
		const skills = discoverSkills();
		if (skills.length === 0) {
			console.log("No skills found in skills/ directory.");
			process.exit(0);
		}

		console.log(`Found ${skills.length} skill(s): ${skills.join(", ")}\n`);
		for (const skill of skills) {
			buildSkill(getSkillPaths(skill));
			console.log("");
		}
	}

	console.log("Done!");
}

export { buildSkill, parseSections };
