# Velt Rewriter Best Practices

**Version 1.0.0**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Rewriter implementation guide covering the AI text-rewriter primitive, programmatic control of the default selection toolbar, and type-safe AI model selection via the AiModel union type on RewriterAskAiRequest. Provides patterns for integrating Velt's Rewriter into React, Next.js, and other web applications.

---

## Table of Contents

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/rewriter/overview
- https://docs.velt.dev/async-collaboration/rewriter/api-reference
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraskairequest
- https://console.velt.dev
