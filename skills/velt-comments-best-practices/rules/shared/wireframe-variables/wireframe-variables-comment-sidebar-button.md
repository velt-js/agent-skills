---
title: Bind Comment Sidebar Button Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives active/floating styling, total-vs-unread badge swapping, and the unread dot inside the Comment Sidebar Button wireframe without re-subscribing to sidebar visibility or annotation counts
tags: wireframe, template-variables, velt-data, velt-if, velt-class, sidebar-button, unread-count, flat-config
---

## Bind Comment Sidebar Button Wireframe Slots Using Template Variables

The Comment Sidebar Button wireframe family (`<velt-sidebar-button-...-wireframe>` / `<VeltSidebarButtonWireframe.*>`) is the toolbar button that opens the Comment Sidebar — with built-in unread-count and total-count indicators. You read its exposed variables with three directives: `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling.

Unlike Comment Bubble / Comment Dialog (which expose mapped short names at the root), the Sidebar Button uses the **flat-config** access pattern — variables span three explicit namespaces (`globalConfig.featureState.*`, `componentConfig.<data|uiState>.*`, `parentLocalUIState.*`) and **must** be referenced via their full path. There is no `{annotation}` / `{user}` alias here.

For the structural catalog of which wireframe tags exist, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top.

**Incorrect (rebuilding visibility / unread state from hooks and aliasing flat-config variables as if they were mapped):**

```jsx
import { useCommentAnnotations, useVeltClient } from '@veltdev/react';
import { VeltSidebarButtonWireframe } from '@veltdev/react';

function Trigger() {
  const annotations = useCommentAnnotations();
  // Reimplements unreadCount + sidebarVisible the wireframe already exposes.
  const unread = annotations?.filter(a => a.unread).length ?? 0;
  const [open, setOpen] = useState(false);
  return (
    <VeltSidebarButtonWireframe>
      <button className={open ? 'trigger active' : 'trigger'}>
        <VeltSidebarButtonWireframe.Icon />
        <span>{annotations?.length}</span>
        {unread > 0 && <span className="dot">{unread}</span>}
      </button>
    </VeltSidebarButtonWireframe>
  );
}
```

**Correct (read the slot's injected flat-config variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltSidebarButtonWireframe } from '@veltdev/react';

<VeltSidebarButtonWireframe>
  <button
    className="my-trigger"
    velt-class="'is-active': {globalConfig.featureState.sidebarVisible}, 'floating': {componentConfig.uiState.floatingMode}, 'dark': {componentConfig.uiState.darkMode}">
    <VeltSidebarButtonWireframe.Icon />
    <VeltSidebarButtonWireframe.CommentsCount>
      <span velt-if="{componentConfig.uiState.commentCountType} === 'total'">
        <velt-data field="componentConfig.data.annotations.length" />
      </span>
      <span velt-if="{componentConfig.uiState.commentCountType} === 'unread'">
        <velt-data field="componentConfig.data.unreadCount" />
      </span>
    </VeltSidebarButtonWireframe.CommentsCount>
    <VeltSidebarButtonWireframe.UnreadIcon
      velt-if="{componentConfig.data.unreadCount} > 0" />
  </button>
</VeltSidebarButtonWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-sidebar-button-wireframe>
  <button class="my-trigger"
          velt-class="'is-active': {globalConfig.featureState.sidebarVisible}, 'floating': {componentConfig.uiState.floatingMode}">
    <velt-sidebar-button-icon-wireframe></velt-sidebar-button-icon-wireframe>
    <velt-sidebar-button-comments-count-wireframe>
      <span velt-if="{componentConfig.uiState.commentCountType} === 'unread'">
        <velt-data field="componentConfig.data.unreadCount"></velt-data>
      </span>
    </velt-sidebar-button-comments-count-wireframe>
    <velt-sidebar-button-unread-icon-wireframe
      velt-if="{componentConfig.data.unreadCount} > 0"></velt-sidebar-button-unread-icon-wireframe>
  </button>
</velt-sidebar-button-wireframe>
```

### Variable namespaces (flat-config — full path required)

**Global Feature State** — cross-document:

| Variable | Type | Notes |
|---|---|---|
| `globalConfig.featureState.sidebarVisible` | `boolean` | Linked sidebar is currently open. Drives the active state on the button. |

**Per-instance Data** — counts for this button:

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.data.annotations` | `CommentAnnotation[] \| undefined` | All annotations in scope. `.length` drives the total-count badge. |
| `componentConfig.data.unreadCount` | `number \| null` | Unread-count badge value. Also gates the unread-icon slot. |

**Per-instance UI State** — layout flags:

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.uiState.showDefaultBtn` | `boolean` | Default built-in button should render. Set to `false` when a wireframe overrides the button entirely. |
| `componentConfig.uiState.floatingMode` | `boolean` | Button is rendering in floating mode. |
| `componentConfig.uiState.floatingModeSidebarVisible` | `boolean` | Floating-mode sidebar is currently open. |
| `componentConfig.uiState.darkMode` | `boolean` | Dark mode is active for this instance. |
| `componentConfig.uiState.commentCountType` | `'total' \| 'unread'` | Which count drives the badge. Compare with `===`, do not coerce to boolean. |

**Per-instance Local UI State** — host-attribute reflections:

| Variable | Type | Notes |
|---|---|---|
| `parentLocalUIState.darkMode` | `boolean` | Local dark-mode flag (host attribute). |
| `parentLocalUIState.variant` | `string` | Per-instance variant tag set on the host element. |
| `parentLocalUIState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled (read-only — set via the host attribute). |

### Wireframe tags

| Wireframe tag | React component | `shouldShow` |
|---|---|---|
| `<velt-sidebar-button-wireframe>` | `<VeltSidebarButtonWireframe>` | Root. |
| `<velt-sidebar-button-icon-wireframe>` | `<VeltSidebarButtonWireframe.Icon>` | Default chat icon. |
| `<velt-sidebar-button-comments-count-wireframe>` | `<VeltSidebarButtonWireframe.CommentsCount>` | Branches on `componentConfig.uiState.commentCountType` — `'total'` shows `annotations.length`, `'unread'` shows `unreadCount`. |
| `<velt-sidebar-button-unread-icon-wireframe>` | `<VeltSidebarButtonWireframe.UnreadIcon>` | `componentConfig.data.unreadCount > 0`. |

Override any gate with `defaultCondition={false}` (React) / `default-condition="false"` (HTML).

### Common mistakes — DO NOT

**1. DO NOT drop the namespace prefix.** This wireframe is flat-config — `<velt-data field="unreadCount" />` resolves to nothing. Use the full path: `<velt-data field="componentConfig.data.unreadCount" />`.

**2. DO NOT confuse `globalConfig.featureState.sidebarVisible` with `componentConfig.uiState.floatingModeSidebarVisible`.** The first is the global linked-sidebar state; the second is the floating-overlay variant. They are independent — the floating mode can be open while the docked sidebar is closed.

**3. DO NOT compare `commentCountType` to a boolean.** It is a string enum (`'total'` / `'unread'`). Compare explicitly: `velt-if="{componentConfig.uiState.commentCountType} === 'total'"`.

**4. DO NOT bind to `parentLocalUIState.shadowDom` to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-sidebar-button>`. The variable only reports the current state.

**Verification:**
- [ ] All bindings use the full flat-config path (`globalConfig.featureState.*`, `componentConfig.data.*`, `componentConfig.uiState.*`, `parentLocalUIState.*`)
- [ ] Total-vs-unread badge switching compares `commentCountType` with `===`, not a boolean coercion
- [ ] Unread-icon slot is gated by `{componentConfig.data.unreadCount} > 0`
- [ ] Active-state styling reads `globalConfig.featureState.sidebarVisible` (docked) or `componentConfig.uiState.floatingModeSidebarVisible` (floating), not both at once

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar-button/wireframe-variables — "Comment Sidebar Button Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `surface/surface-sidebar-button.md` (toggle button surface), `wireframe-variables-comment-sidebar.md` (the sidebar this button opens)
