# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. API Methods (api)

**Impact:** HIGH
**Description:** Programmatic control of the `RewriterElement` — the entry point for the AI text-rewriter primitive. Covers the feature toggle (`enableRewriter` / `disableRewriter`), the default-toolbar toggle (`enableDefaultUI` / `disableDefaultUI`), the `textSelected` event subscription that drives the pipeline, the multi-provider `askAi` call (auto-routed by model prefix), and the two terminal actions `replaceText` (DOM swap) and `addComment` (anchored annotation).

---

## 2. Patterns (patterns)

**Impact:** HIGH
**Description:** End-to-end pipeline guidance — how the individual API methods compose into the canonical Rewriter flow (enable → subscribe → askAi → replaceText / addComment). Captures the event-threading rules (`event.text` for prompt input, full `event` for DOM-anchored actions) and the React `useEffect` lifecycle for subscriptions.

---

## 3. Types (types)

**Impact:** MEDIUM
**Description:** TypeScript type contracts for the rewriter, including the open `AiModel` union over OpenAI, Anthropic, and Gemini model identifiers (with the `(string & NonNullable<unknown>)` escape hatch for forward-compatibility with unenumerated model strings).

---

## 4. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template-variable bindings for the Rewriter wireframe family (`<velt-rewriter-text-portal-wireframe>`, `<velt-rewriter-dialog-wireframe>`, `<velt-rewriter-bottom-sheet-wireframe>`, `<velt-rewriters-container-wireframe>`). Uses the **flat-config** access pattern — variables are referenced via `componentConfig.<path>`. Each primitive carries its own `componentConfigSignal` exposing loading state, option list, selection index, and annotation drill-down for building custom rewriter UIs that coexist with `disableDefaultUI()`.
