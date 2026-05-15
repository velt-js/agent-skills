---
title: Bind Comment Tool Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives dynamic content, conditional rendering, and class toggling inside the Comment Tool wireframe without reimplementing add-comment-mode state on top of the SDK
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, componentConfig, comment-tool, addCommentMode
---

## Bind Comment Tool Wireframe Slots Using Template Variables

The Comment Tool wireframe (`<velt-comment-tool-wireframe>` / `<VeltCommentToolWireframe>`) exposes a flat-config variable surface that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these to drive add-comment-mode styling instead of subscribing to SDK state and re-rendering from your component.

The Comment Tool uses the **explicit-path** form of the variable system: read values via `globalConfig.featureState.<name>` (cross-document) and `componentConfig.data.<name>` / `componentConfig.uiState.<name>` (per-instance). A flat compatibility shape is also exposed — `{commentToolEnabled}`, `{addCommentMode}`, and `{disabled}` resolve with no prefix — but the full path is canonical and never ambiguous.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer that sits on top of that structure.

**Incorrect (rebuilding tool state from `useVeltClient` and conditionally remounting the wireframe):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { VeltCommentToolWireframe } from '@veltdev/react';

function CommentToolButton() {
  const client = useVeltClient();
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Reimplements addCommentMode + commentToolEnabled tracking
    // that the wireframe already exposes as variables.
    const sub = client?.getCommentElement().getAddCommentModeState().subscribe(setActive);
    return () => sub?.unsubscribe();
  }, [client]);

  if (!enabled) return null;
  return (
    <VeltCommentToolWireframe>
      <button className={active ? 'my-tool active' : 'my-tool'}>
        {active ? 'Click anywhere…' : 'Add comment'}
      </button>
    </VeltCommentToolWireframe>
  );
}
```

**Correct (read the slot's variables via `velt-data` / `veltIf` / `veltClass`):**

```jsx
import { VeltCommentToolWireframe } from '@veltdev/react';

<VeltCommentToolWireframe veltClass="'active': {addCommentMode}, 'disabled': '!{commentToolEnabled}'">
  <button className="my-comment-button">
    <VeltIf condition="{addCommentMode}"><span>Click anywhere…</span></VeltIf>
    <VeltIf condition="!{addCommentMode}"><span>Add comment</span></VeltIf>
  </button>
</VeltCommentToolWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-comment-tool-wireframe>
  <button class="my-tool"
          velt-class="'is-active': {addCommentMode}, 'is-off': '!{commentToolEnabled}'">
    <svg class="my-tool__icon"></svg>
    <span velt-if="!{addCommentMode}">Add comment</span>
    <span velt-if="{addCommentMode}">Click anywhere to comment</span>
  </button>
</velt-comment-tool-wireframe>
```

### Variable namespaces

The Comment Tool exposes a flat-config surface with three explicit prefixes. The flat compatibility names (right column) resolve to the same values.

**Global feature state** (`globalConfig.featureState.*` — workspace-level capability flags):

| Variable | Type | Flat alias | Notes |
|---|---|---|---|
| `globalConfig.featureState.commentToolEnabled` | `boolean` | `{commentToolEnabled}` | Tool enabled at the workspace level. Gate the inner button with `velt-class="'is-off': '!{commentToolEnabled}'"`. |
| `globalConfig.featureState.addCommentMode` | `boolean` | `{addCommentMode}` | Add-comment mode is active — next click anywhere drops a pin. |
| `globalConfig.featureState.popoverMode` | `boolean` | — | Popover comment mode is enabled. |
| `globalConfig.featureState.groupMatchedComments` | `boolean` | — | Matched comments are grouped on the page. |

**Per-instance data** (`componentConfig.data.*` — annotation context bound to this tool instance):

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.data.commentAnnotationAvailable` | `boolean` | An annotation is currently associated with this tool instance. |
| `componentConfig.data.context` | `object \| null` | Free-form annotation context (read sub-fields with bracket / dotted paths). |
| `componentConfig.data.contextOptions` | `ContextOptions \| null` | Context-options config for the next annotation. |
| `componentConfig.data.folderId` | `string \| null` | Folder this tool drops annotations into. |
| `componentConfig.data.veltFolderId` | `string \| null` | Velt-managed folder id (when no client folder is set). |
| `componentConfig.data.clientDocumentId` | `string \| null` | Client-supplied document id. |
| `componentConfig.data.documentId` | `string \| null` | Resolved document id for this instance. |
| `componentConfig.data.locationId` | `string \| null` | Location id this tool is scoped to. |
| `componentConfig.data.targetElementId` | `string \| null` | DOM target the next annotation will anchor onto. |
| `componentConfig.data.sourceId` | `string \| null` | Source id from the host application. |
| `componentConfig.data.disabled` | `boolean` | Tool is disabled by host configuration. Flat alias: `{disabled}`. |

**Per-instance UI state** (`componentConfig.uiState.*`):

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.uiState.showDefaultBtn` | `boolean` | Default built-in button should render. Set to `false` when a wireframe overrides the button. |
| `componentConfig.uiState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled. Set on the host element, not from inside the wireframe. |
| `componentConfig.uiState.darkMode` | `boolean` | Dark mode is active for this instance. |
| `componentConfig.uiState.addCommentMode` | `boolean` | Per-instance mirror of the global add-comment-mode flag. |
| `componentConfig.uiState.contextInPageModeComposer` | `boolean` | Tool is rendering inside a page-mode composer. |
| `componentConfig.uiState.commentToolEnabled` | `boolean` | Per-instance mirror of the global enabled flag. |

**Parent local UI state** (`parentLocalUIState.*` — host-attribute mirrors):

| Variable | Type | Notes |
|---|---|---|
| `parentLocalUIState.darkMode` | `boolean` | Local dark-mode flag (set on the host element). |
| `parentLocalUIState.variant` | `string` | Per-instance variant tag from the host element. |
| `parentLocalUIState.shadowDom` | `boolean` | Local shadow-DOM flag. |

### Wireframe tag

The Comment Tool has a single wireframe primitive — the tool button itself.

| Public element | Wireframe tag | React component |
|---|---|---|
| `<velt-comments-tool>` | `<velt-comment-tool-wireframe>` *(singular)* | `<VeltCommentToolWireframe>` |

Children of `<VeltCommentToolWireframe>` are the host-app markup the customer supplies — there are no sub-component slots. The inner default button paints these classes automatically: `velt-comment-tool`, `velt-tool--action-btn`, `active` (when `addCommentMode`), `velt-tool--action-btn-disabled` (when `!commentToolEnabled`), `velt-tool--action-btn-icon`, `velt-comment-tool--custom-btn`.

### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. The root tool always renders by default; the disabled state is rendered via a CSS class, not an unmount, so `defaultCondition` is rarely needed here. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On <velt-comment-tool-wireframe> in an Angular template
[componentConfigSignal]="config()"      // featureState, data, uiState
[parentLocalUIState]="localUI()"        // darkMode, variant, shadowDom
```

The root `<velt-comments-tool>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `shadow-dom`.

### `shouldShow` reference

| Slot | `shouldShow` |
|---|---|
| `comment-tool-wireframe` (root) | Always renders. The *inner default button* visually disables (does not unmount) when `commentToolEnabled === false`. |

If you want the tool to disappear entirely when disabled, gate it yourself: `velt-if="{commentToolEnabled}"`.

### Common mistakes — DO NOT

**1. DO NOT confuse `commentToolEnabled` with `addCommentMode`.** `commentToolEnabled` is the workspace capability flag (can the tool be used at all). `addCommentMode` is the transient state (is the user about to drop a pin). Style with `addCommentMode`; gate visibility with `commentToolEnabled`.

**2. DO NOT subscribe to SDK state to drive the button.** The wireframe injects `addCommentMode` and `commentToolEnabled` automatically. Reading them via the host signal and re-rendering breaks the wireframe contract and double-paints state.

**3. DO NOT pass `componentConfig.uiState.shadowDom` through the wireframe.** `shadowDom` is a host-element attribute (`shadow-dom="true"` on `<velt-comments-tool>`), not a wireframe-bound knob.

**4. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal gate (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**Verification:**
- [ ] The wireframe root has no `velt-if` gate (the tool button should remain mounted so add-comment mode can be toggled)
- [ ] Active styling uses `{addCommentMode}` (not a host-React `useState`)
- [ ] Disabled styling uses `'!{commentToolEnabled}'` (string-quoted negation — required for the parser)
- [ ] `componentConfig.*` paths are used when explicitness is desired; flat aliases are used only for the three documented names (`commentToolEnabled`, `addCommentMode`, `disabled`)
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not
- [ ] `shadow-dom`, `dark-mode`, `variant` are set on the host element, not inside the wireframe

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-tool-wireframe-variables — "Comment Tool Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `mode/mode-inline-comments.md` (`{context.someProperty}` patterns in inline-section composers)
