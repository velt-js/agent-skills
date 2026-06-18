---
title: Use Comments Sidebar for Comment Navigation
impact: MEDIUM-HIGH
impactDescription: Central panel for viewing, filtering, and navigating all comments
tags: sidebar, veltcommentssidebar, navigation, filter, embed-mode, page-mode, floating-mode, fullscreen, version, virtual-scroll, placeholders
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

**Opt into V2 from V1 (`version="2"` escape-hatch):**

`version="2"` on `VeltCommentsSidebar` (or `version="2"` on `<velt-comments-sidebar>`) routes to the V2 implementation without swapping the import. Equivalent to mounting `VeltCommentsSidebarV2` / `<velt-comments-sidebar-v2>` directly; do not mount both simultaneously. Prefer the dedicated V2 tag when V2 is the long-term choice — see `surface/surface-sidebar-v2.md`.

```jsx
// React — V1 component routed to V2 implementation
<VeltCommentsSidebar version="2" />

// Equivalent direct V2 usage:
<VeltCommentsSidebarV2 />
```

```html
<!-- HTML / Other Frameworks — V1 element routed to V2 -->
<velt-comments-sidebar version="2"></velt-comments-sidebar>

<!-- Equivalent direct V2 usage: -->
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
| `version` | string | — | `"2"` routes `VeltCommentsSidebar` to the V2 implementation. |
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

**Verification Checklist:**
- [ ] `VeltCommentsSidebar` mounted (or `version="2"` set if routing to V2 from a V1 import)
- [ ] `VeltSidebarButton` provides toggle
- [ ] `embedMode` set if using a custom container
- [ ] `position` is `'right'` or `'left'` (no other strings — the union is narrowed)
- [ ] `forceClose` is explicitly set when the default (`true`) is not desired — do not assume the old default of `false`
- [ ] `onCommentClick` handles navigation
- [ ] Deprecated event aliases (`openSidebar`, `sidebarCommentClick`, `onSidebarCommentClick`, `enableUrlNavigation`) are replaced with the canonical names in new code

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/overview - Overview
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior - V1 setup + customize-behavior (`/customize-behavior` paths re-rooted to `/v1/customize-behavior`)
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/setup - V2 entry (direct component or `version="2"` opt-in)
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarprops - `VeltCommentsSidebarProps`
