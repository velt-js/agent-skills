---
title: Tag suggestion targets with a stable data-velt-suggestion-target ID
impact: CRITICAL
impactDescription: An unstable targetId breaks matching between suggestions and elements; untagged elements are never captured
tags: targets, data-velt-suggestion-target, targetId, DOM, focusin, focusout, change
---

## Tag suggestion targets with a stable data-velt-suggestion-target ID

A target is any element tagged with `data-velt-suggestion-target="<targetId>"`. The `targetId` is an ID you own and must stay stable across renders, like the ID of the record and field the input edits. If it changes, the SDK cannot match suggestions back to the element.

**Incorrect (random ID on every render):**

```jsx
// BUG: a new ID each render, so pending suggestions never match this input again
<input data-velt-suggestion-target={crypto.randomUUID()} type="number" defaultValue="5" />
```

**Correct (React / Next.js):**

```jsx
<input data-velt-suggestion-target="row.123.qty" type="number" defaultValue="5" />
```

**Correct (Other Frameworks):**

```html
<input data-velt-suggestion-target="row.123.qty" type="number" value="5">
```

**How values are read:** the SDK checks a registered getter first, then the form value (`.value` / `.checked`), then `textContent`. A plain `<input>`, `<textarea>`, `<select>`, or contenteditable needs no `registerTarget` call. Use a getter only when one target spans several inputs (see `targets-register-getter`).

**When an edit commits:**
- Text-like inputs (text, number, date, textarea, contenteditable) commit on `focusout`, so each focus session produces at most one suggestion.
- Dropdowns, checkboxes, and radios commit on `change`.

The SDK installs delegated `focusin` / `change` / `focusout` listeners, so elements added to the DOM later are tracked automatically.

**Verification Checklist:**
- [ ] Every editable element that should produce suggestions has `data-velt-suggestion-target`
- [ ] `targetId` values map to your data model (`row.123.qty`, `field.title`) and never use `Math.random()` or `crypto.randomUUID()`
- [ ] Single primitive inputs do not register a getter unnecessarily

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "1. Define Suggestion Targets" and "Properties"
