# Velt Suggestions Best Practices

**Version 1.0.0**  
Velt  
June 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Suggestions implementation guide covering suggestion targets (data-velt-suggestion-target), suggestion mode (enable/disable), three capture approaches (auto-commit, deferred, manual), accept/reject event handling, suggestion status lifecycle (pending/accepted/rejected/stale/apply_failed), drift detection, and querying suggestions programmatically. Covers the propose-then-review editing workflow for human and AI agent suggestion comments.

---

## Table of Contents

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/suggestions/overview
