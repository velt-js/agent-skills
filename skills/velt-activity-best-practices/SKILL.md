---
name: velt-activity-best-practices
description: Velt Activity Logs implementation patterns and best practices for React, Next.js, and web applications. Use when adding real-time activity feeds, custom activity logging, audit trails, CRDT debounce configuration, or server-side activity management via REST API.
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Activity Logs Best Practices

Comprehensive implementation guide for Velt's activity log system in React and Next.js applications. Contains 10 rules across 5 categories, prioritized by impact to guide automated code generation and integration patterns.

## When to Apply

Reference these guidelines when:
- Adding real-time activity feeds to a React/Next.js application
- Subscribing to collaboration events via useAllActivities or getAllActivities
- Creating custom activity records for non-Velt events
- Configuring CRDT activity debounce to reduce feed noise
- Enabling immutability for compliance audit trails
- Filtering activities by feature type or action type
- Managing activity records server-side via REST API
- Debugging activity log issues (records not appearing, null loading states)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Data Access | HIGH | `data-` |
| 3 | Configuration | MEDIUM | `config-` |
| 4 | REST API | LOW-MEDIUM | `rest-` |
| 5 | Debugging & Testing | LOW-MEDIUM | `debug-` |

## Quick Reference

### 1. Core Setup (CRITICAL)

- `core-setup` — Enable Activity Logs in Velt Console

### 2. Data Access (HIGH)

- `data-subscribe-hook` — Use useAllActivities hook for real-time activity feeds (React)
- `data-subscribe-api` — Use getAllActivities API for real-time activity subscriptions
- `data-create-custom-hook` — Use useActivityUtils to create custom activities (React)
- `data-create-custom-api` — Use getActivityElement API to create custom activities

### 3. Configuration (MEDIUM)

- `config-debounce` — Configure CRDT activity debounce time
- `config-immutability` — Enable immutability for audit trails
- `config-action-type-filters` — Use action type constants for type-safe filtering

### 4. REST API (LOW-MEDIUM)

- `rest-api` — Use REST APIs for server-side activity management

### 5. Debugging & Testing (LOW-MEDIUM)

- `debug-common-issues` — Debug common activity log issues

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup.md
rules/react/data/data-subscribe-hook.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Source pointers to official documentation

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
