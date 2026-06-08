# Velt Chat Sdk Adapter Best Practices

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

Velt Chat SDK Adapter implementation guide covering bot integration with Velt comment threads via the @veltdev/chat-sdk-adapter package. Covers createVeltAdapter configuration, webhook route setup (Next.js App Router), webhook version handling (v1 Basic vs v2 Advanced/Svix), event handlers (onNewMention, onSubscribedMessage, onReaction), user resolution patterns, reaction read/write capabilities, and deployment patterns for Vercel and other Node.js platforms.

---

## Table of Contents

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/ai/chat-sdk-adapter
- https://chat-sdk.dev
