---
title: Bind Autocomplete Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives the @-mention picker — option rows, group rows, chips, empty state — inside Autocomplete wireframes without re-implementing search / filtering on top of the composer
tags: wireframe, template-variables, velt-data, velt-if, velt-class, autocomplete, mentions, comment-dialog, composer
---

## Bind Autocomplete Wireframe Slots Using Template Variables

The Autocomplete primitive is the @-mention picker rendered inside `<velt-autocomplete-panel>` / `<velt-autocomplete-tool>`, mounted by composers — most prominently the Comment Dialog Composer. Variables are available inside any `<velt-autocomplete-...-wireframe>` tag via the standard `<velt-data field="...">` / `velt-if="{...}"` / `velt-class="'cls': {...}"` directives.

Unlike the Comment Bubble / Comment Dialog families, Autocomplete uses the **flat-config** access pattern — panel-level state is referenced with the explicit `componentConfig.<path>` form. Only the per-row iteration variables (`option`, `chip`) resolve as bare names.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top.

Do not filter or group the mention list yourself using `useContacts`. The panel already produces `componentConfig.flattenedItems` with the correct ordering and grouping applied. Reimplementing flattening breaks the virtual-scroll contract and produces stale results.

**Correct (let the wireframe iterate, read `option` / `chip` per row, gate empty-state with `componentConfig.flattenedItems.length`):**

```jsx
import {
  VeltAutocompletePanelWireframe,
  VeltAutocompleteOptionWireframe,
  VeltAutocompleteGroupOptionWireframe,
  VeltAutocompleteEmptyWireframe,
} from '@veltdev/react';

<VeltAutocompletePanelWireframe>
  <VeltAutocompleteOptionWireframe>
    <div className="my-option" veltClass="'is-group': {option.group}">
      <img className="my-option__avatar" />
      <strong><VeltData field="option.name" /></strong>
      <span><VeltData field="option.email" /></span>
    </div>
  </VeltAutocompleteOptionWireframe>

  <VeltAutocompleteGroupOptionWireframe veltIf="{componentConfig.customGroupsEnabled}">
    <div className="my-group">
      <VeltData field="option.group.name" />
      (<VeltData field="option.group.userCount" />)
    </div>
  </VeltAutocompleteGroupOptionWireframe>

  <VeltAutocompleteEmptyWireframe>
    <p>No matches.</p>
  </VeltAutocompleteEmptyWireframe>
</VeltAutocompletePanelWireframe>
```

### Component Config (panel-level state)

Available inside every Autocomplete primitive. **Always read via the full `componentConfig.<path>` form.**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.flattenedItems` | `FlattenedItem[]` | Visible options after grouping / filtering. `length === 0` drives the empty-state gate. |
| `componentConfig.newUserContact` | `SelectorDataListItem \| undefined` | In-progress new-contact entry. |
| `componentConfig.newUserContactError` | `string \| undefined` | Validation error for the new-contact entry. Gate the error slot with `velt-if="{componentConfig.newUserContactError}"`. |
| `componentConfig.customAutocompleteSearch` | `boolean` | Custom-search mode active. |
| `componentConfig.variant` | `string` | Per-instance variant tag. |
| `componentConfig.contactsWithoutGroup` | `SelectorDataListItem[]` | Contacts not assigned to any group. |
| `componentConfig.groups` | `GroupData[]` | Available mention groups. |
| `componentConfig.expandMentionGroups` | `boolean` | Render group rows as expanded. |
| `componentConfig.showMentionGroupsFirst` | `boolean` | Group rows render above contact rows. |
| `componentConfig.showMentionGroupsOnly` | `boolean` | Only group rows render. |
| `componentConfig.customGroupsEnabled` | `boolean` | Custom-groups feature enabled. Gates `<velt-autocomplete-group-option-wireframe>`. |
| `componentConfig.onOptionClick` | `Function` | Click handler for a custom option — wire this from your custom option markup. |
| `componentConfig.trackByFlattenedItem` | `Function` | Internal virtual-scroll track-by. |
| `componentConfig.autoCompleteScrollConfig.itemSize` | `number` | Internal virtual-scroll item-size config. |

### Context-Specific Variables (loop scope)

These resolve as **bare names** — only inside the iteration tag that owns them.

| Variable | Type | Available in | Notes |
|---|---|---|---|
| `option` | `SelectorDataListItem` | `<velt-autocomplete-option-wireframe>`, `<velt-autocomplete-group-option-wireframe>`, and their child tags | Current row. |
| `option.user` | `User` | Same as above | Set when the option represents a user. |
| `option.group` | `GroupData` | Same as above | Set when the option represents a group. Use `velt-class="'is-group': {option.group}"` to branch. |
| `chip` | `AutocompleteChipConfig` | `<velt-autocomplete-chip-wireframe>` and its tooltip child tags | Inline chip in the composer. |

### Wireframe tags

| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-autocomplete-panel-wireframe>` | `<VeltAutocompletePanelWireframe>` | Root menu — hosts every other tag. No extra variables at the panel level. |
| `<velt-autocomplete-empty-wireframe>` | `<VeltAutocompleteEmptyWireframe>` | Empty-state. `shouldShow` requires `componentConfig.flattenedItems.length === 0`. |
| `<velt-autocomplete-option-wireframe>` | `<VeltAutocompleteOptionWireframe>` | Option row. Composes `*-option-name` / `*-option-description` / `*-option-icon` / `*-option-error-icon`. |
| `<velt-autocomplete-group-option-wireframe>` | `<VeltAutocompleteGroupOptionWireframe>` | Group-of-users row — only when `customGroupsEnabled` is true or mention groups are present. |
| `<velt-autocomplete-chip-wireframe>` | `<VeltAutocompleteChipWireframe>` | Inline chip in the contenteditable composer. Composes `*-chip-tooltip` / `*-chip-tooltip-name` / `*-chip-tooltip-description` / `*-chip-tooltip-icon`. |
| `<velt-autocomplete-panel-search-icon-wireframe>` | — | Magnifying-glass icon in the panel's search input. |

The `<velt-autocomplete-tool>` trigger button itself has **no** `<velt-autocomplete-tool-wireframe>` registration — its appearance is controlled by the parent composer's wireframe (e.g. the comment-dialog composer-action-button).

**Option child tags** (resolve parent `option` context):

| Tag | Bind |
|---|---|
| `<velt-autocomplete-option-name-wireframe>` | `<velt-data field="option.name" />` |
| `<velt-autocomplete-option-description-wireframe>` | `<velt-data field="option.email" />` |
| `<velt-autocomplete-option-icon-wireframe>` | `<velt-data field="option.user.photoUrl" />` |
| `<velt-autocomplete-option-error-icon-wireframe>` | `velt-if="{option.invalid}"` |

**Chip tooltip tags** (resolve parent `chip` context): `*-chip-tooltip-wireframe`, `*-chip-tooltip-name-wireframe`, `*-chip-tooltip-description-wireframe`, `*-chip-tooltip-icon-wireframe` — bind `chip.name` / `chip.description` / `chip.icon`.

### Common mistakes — DO NOT

**1. DO NOT bare-name panel-level state.** This family uses flat-config access. `<velt-data field="flattenedItems.length" />` resolves to nothing — use `<velt-data field="componentConfig.flattenedItems.length" />`. The bare-name exception is the loop-scope variables `option` and `chip`.

**2. DO NOT re-implement filtering / grouping over `useContacts`.** The panel already produces `componentConfig.flattenedItems`. Read it; don't rebuild it.

**3. DO NOT nest `<velt-autocomplete-group-option-wireframe>` inside `<velt-autocomplete-option-wireframe>`.** They are sibling iteration roots — the panel decides which to render based on `option.group` / `customGroupsEnabled`.

**4. DO NOT bind `chip.*` outside a chip wireframe.** The `chip` iteration context only exists inside `<velt-autocomplete-chip-wireframe>` and its tooltip descendants.

**Verification:**
- [ ] Panel-level state is read via `componentConfig.<path>` (not bare names)
- [ ] `option` / `chip` are only referenced inside their owning iteration tag
- [ ] Empty-state is gated by the wireframe's `shouldShow` (or `componentConfig.flattenedItems.length === 0`) — not by ad-hoc rendering above the panel
- [ ] Group-option branch is gated by `componentConfig.customGroupsEnabled` (or the presence of `option.group`)
- [ ] `componentConfig.onOptionClick` is wired from custom option markup when overriding the click target

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/autocomplete-wireframe-variables — "Autocomplete Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-autocomplete-primitives.md` (standalone autocomplete primitives), `wireframe-variables/wireframe-variables-comment-dialog.md` (parent composer that mounts the panel)
