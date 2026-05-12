# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. API Methods (api)

**Impact:** HIGH
**Description:** Programmatic control of the `RewriterElement` — the entry point for the AI text-rewriter primitive. Covers methods that toggle the default selection toolbar without disabling the feature (events still fire when the toolbar is hidden), enabling fully custom rewriter UIs.

---

## 2. Types (types)

**Impact:** MEDIUM
**Description:** TypeScript type contracts for the rewriter, including the open `AiModel` union over OpenAI, Anthropic, and Gemini model identifiers (with the `(string & NonNullable<unknown>)` escape hatch for forward-compatibility with unenumerated model strings).

---

## 3. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template-variable bindings for the Rewriter wireframe family (`<velt-rewriter-text-portal-wireframe>`, `<velt-rewriter-dialog-wireframe>`, `<velt-rewriter-bottom-sheet-wireframe>`, `<velt-rewriters-container-wireframe>`). Uses the **flat-config** access pattern — variables are referenced via `componentConfig.<path>`. Each primitive carries its own `componentConfigSignal` exposing loading state, option list, selection index, and annotation drill-down for building custom rewriter UIs that coexist with `disableDefaultUI()`.
