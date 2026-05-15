---
title: Bind Text Comment Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives word/character-count display, capability gating, position offsets, and AI-rewriter visibility inside the Text Comment toolbar wireframes without re-implementing selection tracking
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, text-comment, text-comment-tool, text-comment-toolbar, rewriter
---

## Bind Text Comment Wireframe Slots Using Template Variables

The Text Comment wireframe family (`<velt-text-comment-...-wireframe>` / `<VeltTextCommentToolWireframe>`, `<VeltTextCommentToolbarWireframe>`) powers the floating toolbar that appears next to selected text. Read its injected variables with the three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of subscribing to selection / rewriter state by hand. Variables are mapped — reference them by their short name (`selectedWordsCount`, `showAdder`, `rewriterEnabled`), with a small set of conflicting names that **must** be read via their explicit path.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. For the Text Comment mode itself (setup, allowed elements, rewriter wiring), see `mode/mode-text-comments.md` if present, or the Text Comment overview docs.

Do not re-implement selection state and gate the toolbar from the host component. The wireframe already exposes `showAdder`, `selectedWordsCount`, `isUserAllowed`, and `rewriterEnabled` as injected variables. Manual `selectionchange` subscriptions break the wireframe contract.

**Correct (read the slot's injected variables via `velt-data` / `veltIf` / `veltClass`):**

```jsx
import { VeltTextCommentToolWireframe, VeltTextCommentToolbarWireframe } from '@veltdev/react';

<VeltTextCommentToolWireframe
  veltClass="'has-words': {selectedWordsCount} > 0">
  <span><VeltData field="selectedWordsCount" /> words selected</span>
  <VeltTextCommentToolbarWireframe>
    <VeltTextCommentToolbarWireframe.CommentAnnotation>
      Comment
    </VeltTextCommentToolbarWireframe.CommentAnnotation>
    <VeltTextCommentToolbarWireframe.Copywriter veltIf="{rewriterEnabled}">
      Rewrite with AI
    </VeltTextCommentToolbarWireframe.Copywriter>
  </VeltTextCommentToolbarWireframe>
</VeltTextCommentToolWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-text-comment-tool-wireframe
  velt-if="{isUserAllowed} && {enableTextComments}"
  velt-class="'has-words': {selectedWordsCount} > 0">
  <span class="my-tool__count">
    <velt-data field="selectedWordsCount"></velt-data> words
  </span>
  <velt-text-comment-toolbar-wireframe>
    <velt-text-comment-toolbar-comment-annotation-wireframe>
      Comment
    </velt-text-comment-toolbar-comment-annotation-wireframe>
    <velt-text-comment-toolbar-copywriter-wireframe velt-if="{rewriterEnabled}">
      Rewrite with AI
    </velt-text-comment-toolbar-copywriter-wireframe>
  </velt-text-comment-toolbar-wireframe>
</velt-text-comment-tool-wireframe>
```

### Variable namespaces

**Data State** — selection metrics, position, identity:

| Variable | Type | Notes |
|---|---|---|
| `position` / `position.top` / `position.left` | `{ top: number, left: number }` | Absolute viewport position of the floating toolbar. |
| `selectedWordsCount` | `number` | Words in the active selection. |
| `selectedCharactersCount` | `number` | Characters in the active selection. |
| `allowedElementIds` | `string[]` | Element ids the selection must originate from for the tool to render. |
| `contextId` | `string \| null` | Context id linking this tool to a host context. |
| `data.user` | `User \| null` | Currently identified end-user. Use the explicit `data.user` path — `user` is a conflicting name (see below). |

**UI State** — per-instance flags + min/max thresholds:

| Variable | Type | Notes |
|---|---|---|
| `showAdder` | `boolean` | Floating "add comment" adder is visible for the current selection. |
| `commentToolEnabled` | `boolean` | Comment Tool is enabled at the workspace level. |
| `isUserAllowed` | `boolean` | Current user has permission to add text comments. |
| `enableTextComments` | `boolean` | Text Comments feature is enabled by config. |
| `rewriterEnabled` | `boolean` | AI rewriter feature is enabled. |
| `rewriterDefaultUIEnabled` | `boolean` | Default rewriter UI should render (vs. a custom one). |
| `MIN_ALLOWED_WORDS_COUNT` | `number` | Minimum words before the toolbar shows. |
| `MIN_ALLOWED_CHARACTERS_COUNT` | `number` | Minimum characters before the toolbar shows. |
| `MAX_ALLOWED_CHARACTERS_COUNT` | `number` | Maximum characters before the toolbar hides. |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag from the host element. |
| `uiState.disabled` | `boolean` | Tool is disabled by host configuration. Use the full path — `disabled` is conflicting. |
| `uiState.left` | `number` | Raw horizontal offset (before `position` resolution). Use the full path — `left` is conflicting. |
| `uiState.isPlanExpired` | `boolean` | Workspace plan is expired. Use the full path — `isPlanExpired` is conflicting. |
| `parentLocalUIState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled. Set via the `shadow-dom` host attribute — the variable only reports state. |

### Naming conflicts — use the full path

Five names collide with mappings used by Comment Dialog. Inside a Text Comment wireframe, prefer the explicit path:

| Conflicting name | Use this in Text Comment |
|---|---|
| `user` | `data.user` |
| `disabled` | `uiState.disabled` |
| `left` | `uiState.left` |
| `isPlanExpired` | `uiState.isPlanExpired` |
| `shadowDom` | `parentLocalUIState.shadowDom` |

### Wireframe tags

The Text Comment family has a root tool plus a toolbar with four action slots.

| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-text-comment-wireframe>` | — | Outer wireframe — wraps the tool. |
| `<velt-text-comment-tool-wireframe>` | `<VeltTextCommentToolWireframe>` | The floating tool. `shouldShow` requires an active selection inside an allowed element with word/char counts in range. |
| `<velt-text-comment-toolbar-wireframe>` | `<VeltTextCommentToolbarWireframe>` | Toolbar wrapper that hosts the action buttons. |
| `<velt-text-comment-toolbar-comment-annotation-wireframe>` | `<VeltTextCommentToolbarWireframe.CommentAnnotation>` | "Comment" action — attaches a new annotation to the selection. |
| `<velt-text-comment-toolbar-copywriter-wireframe>` | `<VeltTextCommentToolbarWireframe.Copywriter>` | AI-rewrite action. `shouldShow` requires `rewriterEnabled === true`. |
| `<velt-text-comment-toolbar-generic-wireframe>` | `<VeltTextCommentToolbarWireframe.Generic>` | Generic, customizable position for an extra button. |
| `<velt-text-comment-toolbar-divider-wireframe>` | `<VeltTextCommentToolbarWireframe.Divider>` | Vertical separator between toolbar items. |

### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show the Copywriter button when `rewriterEnabled` is false, or the tool itself outside the min/max range. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-text-comment-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // position, selectedWordsCount,
                                         // selectedCharactersCount, data.user,
                                         // allowedElementIds, contextId
[parentLocalUIState]="localUI()"         // darkMode, variant, shadowDom
```

The root `<velt-text-comment>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `shadow-dom`.

### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `text-comment-tool-wireframe` (root) | Active selection inside an `allowedElementIds` element **and** `selectedWordsCount >= MIN_ALLOWED_WORDS_COUNT` **and** `selectedCharactersCount` between `MIN_ALLOWED_CHARACTERS_COUNT` and `MAX_ALLOWED_CHARACTERS_COUNT`. |
| `text-comment-toolbar-copywriter-wireframe` | `rewriterEnabled === true` |

Override either with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.

### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.selectedWordsCount" />` resolves to nothing — use `<velt-data field="selectedWordsCount" />`. The exception is the five conflicting names above, which **require** their explicit path (`data.user`, `uiState.disabled`, `uiState.left`, `uiState.isPlanExpired`, `parentLocalUIState.shadowDom`).

**2. DO NOT read `user` directly inside a Text Comment wireframe.** `user` is mapped elsewhere — use `data.user` (and `data.user.name`, `data.user.photoUrl`, etc.) to read the identified end-user here.

**3. DO NOT gate the Copywriter button with only `velt-if="{rewriterEnabled}"` when you also want the default UI hidden.** The toolbar slot's own `shouldShow` covers `rewriterEnabled`. If you are providing a custom rewriter UI, check `rewriterDefaultUIEnabled` separately — they are not the same flag.

**4. DO NOT compute the toolbar position from `uiState.left` directly.** `uiState.left` is the raw value before resolution; the placed `position` / `position.left` is what the tool actually uses for layout.

**5. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**6. DO NOT bind to `parentLocalUIState.shadowDom` from inside the wireframe to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-text-comment>`. The variable only reports the current state.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name (not `componentConfig.var`)
- [ ] The five conflicting names use their explicit path: `data.user`, `uiState.disabled`, `uiState.left`, `uiState.isPlanExpired`, `parentLocalUIState.shadowDom`
- [ ] Toolbar position uses `{position.top}` / `{position.left}`, not `{uiState.left}`
- [ ] Copywriter gate either relies on the slot's own `shouldShow` *or* uses `velt-if="{rewriterEnabled}"` — not both, and not combined with `defaultCondition`
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/text-comment-wireframe-variables — "Text Comment Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `wireframe-variables-comment-bubble.md` / `wireframe-variables-comment-dialog.md` / `wireframe-variables-comment-tool.md` (sibling wireframe-variable rules)
