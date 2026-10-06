---
title: Use Comments Sidebar for Comment Navigation
impact: MEDIUM-HIGH
impactDescription: Central panel for viewing, filtering, and navigating all comments
tags: sidebar, veltcommentssidebar, navigation, filter, embed-mode, page-mode, floating-mode, fullscreen, virtual-scroll, placeholders
---

## Use Comments Sidebar for Comment Navigation

`VeltCommentsSidebar` provides a panel displaying all comments with search, filter, and navigation capabilities. Essential for any non-trivial commenting implementation. The same `VeltCommentsSidebarProps` shape is reused by `VeltCommentsSidebarV2` — this rule is the prop catalog for both surfaces; for the V2-only declarative filter / sort surface, see `surface/surface-sidebar-v2.md`.

**Basic Setup:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebar,
  VeltSidebarButton
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentsSidebar />

      <div className="toolbar">
        <VeltSidebarButton />
      </div>
    </VeltProvider>
  );
}
```

**Embed Mode (in custom container):**

```jsx
<div className="my-sidebar-container">
  <VeltCommentsSidebar embedMode={true} />
</div>
```

**Page Mode (page-level comments):**

```jsx
<VeltCommentsSidebar pageMode={true} />
```

**Disable Comment Grouping:**

```jsx
<VeltCommentsSidebar
  groupConfig={{ enable: false }}
/>
```

**Handle Comment Clicks:**

```jsx
<VeltCommentsSidebar
  onCommentClick={(event) => {
    const { location, documentId, targetElementId, context } = event;
    // Navigate to comment location
    // e.g., scroll to element, seek video, etc.
  }}
/>
```

**V2 Sidebar Entry:**

For the primitive-based V2 sidebar, import `VeltCommentsSidebarV2` directly in React or mount `<velt-comments-sidebar-v2>` in other frameworks. The current V2 setup docs no longer document the V1 component prop opt-in as a setup path.

```jsx
import { VeltCommentsSidebarV2 } from '@veltdev/react';

<VeltCommentsSidebarV2 />
```

```html
<velt-comments-sidebar-v2></velt-comments-sidebar-v2>
```

**For HTML:**

```html
<velt-comments-sidebar
  embed-mode="true"
  page-mode="false"
>
</velt-comments-sidebar>

<velt-sidebar-button></velt-sidebar-button>
```

**Complete Example with Video Player:**

```jsx
<VeltCommentsSidebar
  embedMode={true}
  onCommentClick={(event) => {
    const { location } = event;
    if (location?.currentMediaPosition !== undefined) {
      // Seek video to timestamp
      videoRef.current.currentTime = location.currentMediaPosition;
      // Set location to show comments
      client.setLocations([location]);
    }
  }}
/>
```

### `VeltCommentsSidebarProps` (shared with `VeltCommentsSidebarV2`)

The React TypeScript interface; HTML attributes use the same names in kebab-case. All props are optional. Defaults reflect the current SDK surface — note in particular: `position` is narrowed from `string` to `'right' | 'left'`, and `forceClose` now defaults to `true` (the sidebar force-closes on outside click unless you explicitly set `forceClose={false}` — embed mode is unaffected).

**Layout / mode:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageMode` | boolean | `false` | Page-level comments mode (composer in the sidebar, no element attachment). |
| `focusedThreadMode` | boolean | `false` | Open individual threads in a focused view inside the sidebar. |
| `readOnly` | boolean | `false` | Render the sidebar in read-only mode. |
| `embedMode` | `string \| null` | `null` | Embed the sidebar inline within a host container. |
| `floatingMode` | boolean | `false` | Floating overlay layout. |
| `position` | `'right' \| 'left'` | `'right'` | Side of the viewport the sidebar opens from. Narrowed from `string`. |
| `variant` | string | `'sidebar'` | Layout variant id. |
| `forceClose` | boolean | `true` | Force-close on outside click, even when opened via API. Does not affect embed mode. (V2 default flipped from `false` → `true`.) |
| `fullScreen` | boolean | `false` | Add a fullscreen toggle button to the header. |
| `fullExpanded` | boolean | `false` | Render the sidebar fully expanded. |
| `shadowDom` | boolean | input `false`; shadow-DOM isolation is on by default | Render the sidebar body inside a shadow root for style isolation. Opt out via `shadow-dom="false"` or `disableSidebarShadowDOM()`. |
| `groupConfig` | `{ enable?: boolean; name?: string; groupBy?: string }` | — | Grouping config; defaults to grouping by location when enabled. |
| `currentLocationSuffix` | boolean | `false` | Append a "(this page)" suffix when a group matches the current location. |
| `dialogVariant` | string | `'sidebar'` | Variant for the embedded comment dialog rendered in the list. |
| `focusedThreadDialogVariant` | string | `'sidebar'` | Variant for the focused-thread dialog. |
| `pageModeComposerVariant` | string | `'sidebar'` | Variant for the page-mode composer. |
| `dialogSelection` | boolean | `true` | Clicking a comment opens its dialog inline; set `false` to fall back to a click event without inline expansion. |
| `expandOnSelection` | boolean | `true` | Expand the dialog automatically on selection. |
| `openAnnotationInFocusMode` | boolean | `false` | Open annotations in focus mode when `focusedThreadMode={true}` and a reply / `selectCommentByAnnotationId()` is used. |
| `excludeLocationIds` | `string[]` | `[]` | Hide comments from these locations. |
| `customActions` | boolean | `false` | Enable host-driven wireframe actions in the sidebar. |
| `sidebarButtonCountType` | `'default' \| 'filter'` | — | What the sidebar-button badge tracks — total open/in-progress (default) vs filtered count. |
| `context` | object | `null` | Context attached to comments added via the page-mode composer (serialized JSON on the HTML attribute). |

**Placeholders (V2 surface; also accepted by V1):**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchPlaceholder` | string | `'Search comments'` | Placeholder in the search input. |
| `pageModePlaceholder` | string | `''` | Placeholder for the page-mode composer. |
| `commentPlaceholder` | string | `''` | Placeholder for the dialog composer (new comment input). |
| `replyPlaceholder` | string | `''` | Placeholder for reply input fields. |
| `editPlaceholder` | string | `''` | Fallback edit placeholder. |
| `editCommentPlaceholder` | string | `''` | Placeholder when editing the first comment (takes precedence over `editPlaceholder`). |
| `editReplyPlaceholder` | string | `''` | Placeholder when editing a reply (takes precedence over `editPlaceholder`). |

**Virtual scrolling:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `measuredSize` | number | `220` | Estimated row size (px). |
| `minBufferPx` | number | `1000` | Minimum virtual-scroll buffer (px). |
| `maxBufferPx` | number | `2000` | Maximum virtual-scroll buffer (px). |

**URL navigation:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `urlNavigation` | boolean | `false` | Automatically update the URL when navigating between comments. |
| `enableUrlNavigation` | boolean | `false` | Deprecated alias for `urlNavigation`. Prefer `urlNavigation`. |
| `queryParamsComments` | boolean | `false` | Sync the selected comment to URL query params. |

**Events / callbacks:**

| Prop | Type | Description |
|------|------|-------------|
| `onSidebarOpen` | (data: any) => void | Fired when the sidebar opens. |
| `onSidebarClose` | (data: any) => void | Fired when the sidebar closes. |
| `onCommentClick` | (data: any) => void | Fired when a comment is clicked. |
| `onCommentNavigationButtonClick` | (data: any) => void | Fired when the navigation button is clicked. |
| `onFullscreenClick` | (data: any) => void | Fires when the fullscreen toggle is clicked. |
| `openSidebar` | (data: any) => void | Deprecated V1 alias; prefer `onSidebarOpen`. |
| `sidebarCommentClick` | (data: any) => void | Deprecated V1 alias; prefer `onCommentClick`. |
| `onSidebarCommentClick` | (data: any) => void | Deprecated V1 alias; prefer `onCommentClick`. |

For the V2-only declarative filter / sort surface (`filters`, `miniFilters`, `minimalFilters`, `filterOperator`, `filterPanelLayout`, `filterOptionLayout`, `filterCount`, `filterGhostCommentsInSidebar`, `systemFiltersOperator`, `sortBy`, `sortOrder`, `sortData`, `defaultMinimalFilter`) and the `applyCommentSidebarClientFilters()` API, see `surface/surface-sidebar-v2.md`.

**`setCommentSidebarFilters()` semantics (V1 + V2):**

`setCommentSidebarFilters()` applies values as selected filters in the sidebar UI — the values render as checked options and are cleared by **Reset**. The call is a partial update, not a full overwrite:

- Included keys replace their current selections.
- Omitted keys are preserved.
- A present-but-empty array clears one field (e.g. `{ location: [] }`).
- An empty object `{}` clears every client-provided selection.

This wording is aligned across V1 (`/async-collaboration/comments-sidebar/v1/customize-behavior#setcommentsidebarfilters`) and V2 (`/async-collaboration/comments-sidebar/v2/customize-behavior#setcommentsidebarfilters`), so the same guidance applies regardless of which sidebar version the app mounts. For the V2 `CommentSidebarFilters` payload shape (object identities for `people` / `location` etc.) and facet-count coupling, see `surface/surface-sidebar-v2.md`.

**Verification Checklist:**
- [ ] `VeltCommentsSidebar` mounted for V1/sidebar-prop usage, or `VeltCommentsSidebarV2` / `<velt-comments-sidebar-v2>` mounted directly for V2 setup
- [ ] `VeltSidebarButton` provides toggle
- [ ] `embedMode` set if using a custom container
- [ ] `position` is `'right'` or `'left'` (no other strings — the union is narrowed)
- [ ] `forceClose` is explicitly set when the default (`true`) is not desired — do not assume the old default of `false`
- [ ] `onCommentClick` handles navigation
- [ ] Deprecated event aliases (`openSidebar`, `sidebarCommentClick`, `onSidebarCommentClick`, `enableUrlNavigation`) are replaced with the canonical names in new code

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/overview - Overview
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior - V1 setup + customize-behavior (`/customize-behavior` paths re-rooted to `/v1/customize-behavior`)
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/setup - V2 entry (direct `VeltCommentsSidebarV2` / `<velt-comments-sidebar-v2>` setup)
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarprops - `VeltCommentsSidebarProps`
