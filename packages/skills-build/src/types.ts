export type ImpactLevel =
	| "CRITICAL"
	| "HIGH"
	| "MEDIUM-HIGH"
	| "MEDIUM"
	| "LOW-MEDIUM"
	| "LOW";

export interface CodeExample {
	label: string;
	description?: string;
	code: string;
	language?: string;
	additionalText?: string;
}

export interface Rule {
	id: string;
	title: string;
	section: number;
	category: string;
	impact: ImpactLevel;
	impactDescription?: string;
	explanation: string;
	examples: CodeExample[];
	references?: string[];
	tags?: string[];
}

export interface Section {
	number: number;
	title: string;
	folder: string;
	impact: ImpactLevel;
	description: string;
}

export interface Metadata {
	version: string;
	organization: string;
	date: string;
	abstract: string;
	references: string[];
	categories?: {
		name: string;
		folder: string;
		impact: string;
		rules: number;
	}[];
}

export interface ParseResult {
	success: boolean;
	rule?: Rule;
	errors: string[];
	warnings: string[];
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}
