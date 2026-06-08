---
title: Define Suggestion Targets with data-velt-suggestion-target
impact: CRITICAL
tags: targets, data-velt-suggestion-target, targetId, DOM
---

## Define Suggestion Targets

A target is any element tagged with `data-velt-suggestion-target="<targetId>"`. The `targetId` must be a stable, app-owned identifier — use the same ID you use in your own state, not a random UUID (which changes across re-renders and breaks matching).

**React / Next.js:**
```jsx
<input data-velt-suggestion-target="row.123.qty" type="number" defaultValue="5" />
```

**Other Frameworks:**
```html
<input data-velt-suggestion-target="row.123.qty" type="number" value="5">
```

### targetId Patterns

Use dot-notation or similar stable identifiers that map to your data model:
- `row.123.qty` — a specific field in a specific row
- `cell.orderId.status` — a specific cell in a table
- `field.title` — a document-level field

### When You Don't Need a Getter

For a single primitive input (`<input>`, `<textarea>`, `<select>`, contenteditable), the SDK reads the value automatically via `.value` / `.checked` / `textContent`. No `registerTarget` call is needed.

### When You Need a Getter

When one target represents a complex value (an object spanning several controls — e.g., a table row with `qty` and `price`), there is no single `.value` to read. Register a getter so the SDK can snapshot and diff the whole object. See the `targets-register-getter` rule.

### Key Points

- The SDK installs delegated `focusin`/`change`/`focusout` listeners, so elements added to the DOM later are automatically tracked
- `targetId` must be stable across re-renders — never use `Math.random()` or `crypto.randomUUID()`
- One suggestion per focus session for text-like inputs; one per change event for atomic inputs
