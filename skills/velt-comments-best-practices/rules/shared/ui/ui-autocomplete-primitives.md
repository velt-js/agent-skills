---
title: Use Standalone Autocomplete Primitives for Custom Autocomplete UIs
impact: MEDIUM
impactDescription: Build fully custom autocomplete UIs without requiring the full VeltAutocomplete panel, using independently importable primitive components
tags: autocomplete, primitives, VeltAutocompleteOption, VeltAutocompleteChip, VeltAutocompleteEmpty, VeltAutocompleteEmptyWireframe, VeltAutocompletePanel, customization, ui, multiSelect, selectedFirstOrdering, readOnly, inline, contacts, defaultCondition, hideInput, enableOnFocus, position
---

## Use Standalone Autocomplete Primitives for Custom Autocomplete UIs

Velt provides 13 standalone autocomplete primitive components that are independently importable and render their corresponding HTML custom elements without requiring the full `<VeltAutocomplete>` panel. Use these primitives to build fully custom autocomplete UIs; use `VeltAutocompleteEmptyWireframe` to customize the empty state.

**Incorrect (using the full panel when only a subset of primitives is needed):**

```jsx
// Importing the full autocomplete panel forces all sub-components to render together.
// Use primitives individually when you need custom layout or partial rendering.
import { VeltAutocomplete } from '@veltdev/react';
```

**Correct (React — import and use primitives independently):**

```jsx
import {
  VeltAutocompleteOption,
  VeltAutocompleteOptionIcon,
  VeltAutocompleteOptionName,
  VeltAutocompleteOptionDescription,
  VeltAutocompleteOptionErrorIcon,
  VeltAutocompleteGroupOption,
  VeltAutocompleteTool,
  VeltAutocompleteEmpty,
  VeltAutocompleteChip,
  VeltAutocompleteChipTooltip,
  VeltAutocompleteChipTooltipIcon,
  VeltAutocompleteChipTooltipName,
  VeltAutocompleteChipTooltipDescription,
} from '@veltdev/react';

// Render a custom chip with tooltip
function CustomChip({ user }) {
  return (
    <VeltAutocompleteChip
      type="user"
      email={user.email}
      userId={user.userId}
      userObject={user}
    >
      <VeltAutocompleteChipTooltip>
        <VeltAutocompleteChipTooltipIcon />
        <VeltAutocompleteChipTooltipName />
        <VeltAutocompleteChipTooltipDescription />
      </VeltAutocompleteChipTooltip>
    </VeltAutocompleteChip>
  );
}

// Render a custom option row
function CustomOption({ user }) {
  return (
    <VeltAutocompleteOption userId={user.userId} userObject={user}>
      <VeltAutocompleteOptionIcon />
      <VeltAutocompleteOptionName />
      <VeltAutocompleteOptionDescription field="email" />
      <VeltAutocompleteOptionErrorIcon />
    </VeltAutocompleteOption>
  );
}
```

**Correct (React — customize the empty state via wireframe):**

```jsx
import { VeltWireframe, VeltAutocompleteEmptyWireframe } from '@veltdev/react';

// Wrap in VeltWireframe so Velt picks up the custom template
<VeltWireframe>
  <VeltAutocompleteEmptyWireframe>
    <div className="my-empty-state">No results found</div>
  </VeltAutocompleteEmptyWireframe>
</VeltWireframe>
```

**Correct (HTML — primitive custom elements):**

```html
<!-- Each primitive renders as its own custom element -->
<velt-autocomplete-option>
  <velt-autocomplete-option-icon></velt-autocomplete-option-icon>
  <velt-autocomplete-option-name></velt-autocomplete-option-name>
  <velt-autocomplete-option-description></velt-autocomplete-option-description>
  <velt-autocomplete-option-error-icon></velt-autocomplete-option-error-icon>
</velt-autocomplete-option>

<velt-autocomplete-chip>
  <velt-autocomplete-chip-tooltip>
    <velt-autocomplete-chip-tooltip-icon></velt-autocomplete-chip-tooltip-icon>
    <velt-autocomplete-chip-tooltip-name></velt-autocomplete-chip-tooltip-name>
    <velt-autocomplete-chip-tooltip-description></velt-autocomplete-chip-tooltip-description>
  </velt-autocomplete-chip-tooltip>
</velt-autocomplete-chip>

<!-- Empty state wireframe -->
<velt-autocomplete-empty-wireframe>
  <div class="my-empty-state">No results found</div>
</velt-autocomplete-empty-wireframe>
```

**Primitive Component Reference (v5.0.2-beta.5+):**

| React | HTML | Key Props |
|-------|------|-----------|
| `VeltAutocompleteOption` | `velt-autocomplete-option` | `userObject`, `userId` |
| `VeltAutocompleteOptionIcon` | `velt-autocomplete-option-icon` | — |
| `VeltAutocompleteOptionName` | `velt-autocomplete-option-name` | — |
| `VeltAutocompleteOptionDescription` | `velt-autocomplete-option-description` | `field` |
| `VeltAutocompleteOptionErrorIcon` | `velt-autocomplete-option-error-icon` | — |
| `VeltAutocompleteGroupOption` | `velt-autocomplete-group-option` | — |
| `VeltAutocompleteTool` | `velt-autocomplete-tool` | — |
| `VeltAutocompleteEmpty` | `velt-autocomplete-empty` | — |
| `VeltAutocompleteChip` | `velt-autocomplete-chip` | `type`, `email`, `userObject`, `userId` |
| `VeltAutocompleteChipTooltip` | `velt-autocomplete-chip-tooltip` | — |
| `VeltAutocompleteChipTooltipIcon` | `velt-autocomplete-chip-tooltip-icon` | — |
| `VeltAutocompleteChipTooltipName` | `velt-autocomplete-chip-tooltip-name` | — |
| `VeltAutocompleteChipTooltipDescription` | `velt-autocomplete-chip-tooltip-description` | — |

**`VeltAutocomplete` Panel Props (v5.0.2-beta.5+):**

These props are added to the parent `<VeltAutocomplete>` / `<velt-autocomplete>` panel component when using the full panel:

| React Prop | HTML Attribute | Type | Description |
|------------|---------------|------|-------------|
| `multiSelect` | `multi-select` | `boolean` | Allows selecting multiple contacts |
| `selectedFirstOrdering` | `selected-first-ordering` | `boolean` | Shows selected items first in the list |
| `readOnly` | `read-only` | `boolean` | Disables user interaction |
| `inline` | `inline` | `boolean` | Renders autocomplete inline rather than as a floating panel |
| `contacts` | *(React only)* | `User[]` | Overrides the default contact list with a custom array |

```jsx
// React — configure the autocomplete panel
<VeltAutocomplete
  multiSelect={true}
  selectedFirstOrdering={true}
  contacts={myContactList}
/>
```

```html
<!-- HTML — configure the autocomplete panel (contacts has no HTML attribute) -->
<velt-autocomplete
  multi-select="true"
  selected-first-ordering="true"
></velt-autocomplete>
```

<!-- TODO (v5.0.2-beta.5): Verify default values for readOnly and inline props on VeltAutocomplete. Release note confirms the prop names and types but does not specify default values. -->

**`VeltAutocompletePanel` — standalone panel (v5.0.2-beta.11+):**

Use `VeltAutocompletePanel` when you need an autocomplete panel that is not tied to a text-input @-mention (e.g. an inline user picker, assignee selector, or standalone contact chooser). It accepts all of the `VeltAutocomplete` panel props plus `type`, `hideInput`, `placeholder`, `enableOnFocus`, `position`, and `defaultCondition`.

```jsx
// React — inline user picker that always renders
<VeltAutocompletePanel
  type="contact"
  multiSelect={true}
  selectedFirstOrdering={true}
  inline={true}
  defaultCondition={false}
/>
```

```html
<!-- HTML — same shape, kebab-case attrs -->
<velt-autocomplete-panel
  type="contact"
  multi-select="true"
  selected-first-ordering="true"
  inline="true"
  default-condition="false">
</velt-autocomplete-panel>
```

| React Prop | HTML Attribute | Type | Default | Description |
|------------|---------------|------|---------|-------------|
| `type` | `type` | `'contact' \| 'generic'` | `'contact'` | Type of options the panel renders |
| `hideInput` | `hide-input` | `boolean` | `false` | Hides the search input |
| `placeholder` | `placeholder` | `string` | — | Placeholder text for the search input |
| `multiSelect` | `multi-select` | `boolean` | `false` | Allows selecting multiple contacts |
| `selectedFirstOrdering` | `selected-first-ordering` | `boolean` | `false` | Shows selected items first in the list |
| `readOnly` | `read-only` | `boolean` | `false` | Disables user interaction |
| `inline` | `inline` | `boolean` | `false` | Renders the panel inline |
| `enableOnFocus` | `enable-on-focus` | `boolean` | `false` | Opens the panel when the input receives focus |
| `position` | `position` | `'above' \| 'below' \| 'auto' \| string` | `'auto'` | Position of the panel relative to its anchor |
| `defaultCondition` | `default-condition` | `boolean` | `true` | When `false`, the component always renders regardless of internal state |

**Verification Checklist:**
- [ ] Primitives imported from `'@veltdev/react'` individually (not from the full panel import path)
- [ ] `VeltAutocompleteEmptyWireframe` is wrapped inside `<VeltWireframe>` when customizing the empty state
- [ ] `VeltAutocompleteOptionDescription` uses the `field` prop to specify which user field to display
- [ ] HTML custom elements use separate opening and closing tags (not self-closing)
- [ ] When using `VeltAutocompletePanel` standalone, pick `VeltAutocompletePanel` (not `VeltAutocomplete`) for inline pickers that are not tied to a text-input @-mention

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Autocomplete and dialog customization
- https://docs.velt.dev/api-reference/sdk/models/data-models - User model reference for `userObject` and `contacts` types
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives - VeltAutocompletePanel standalone primitive reference
