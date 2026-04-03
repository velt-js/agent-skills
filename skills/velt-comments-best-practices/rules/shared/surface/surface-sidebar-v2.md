---
title: Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization
impact: MEDIUM-HIGH
impactDescription: Full composability of every sidebar UI section via 27+ independently importable primitives, enabling precise customization without forking the entire component
tags: sidebar, veltcommentssidebarv2, primitives, wireframe, filter, virtual-scroll, focused-thread
---

## Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization

`VeltCommentsSidebarV2` is a complete redesign of the Comments Sidebar built on a flat primitive component architecture. Every section of the UI is an independently importable and composable primitive, so you can replace only the parts you need without reimplementing the whole component. V2 ships with a unified filter model (replacing the legacy `minimalFilter` + `advancedFilters` system), CDK virtual scroll for large comment lists, a focused-thread view, a minimal actions dropdown, and a filter dropdown.

**Incorrect (customizing V1 sidebar by overriding deeply nested internals):**

```jsx
// V1 sidebar requires shadowing deeply nested internal components
// to change layout or filtering — there is no flat primitive tree
<VeltCommentsSidebar />
```

**Correct (React / Next.js — direct V2 component with primitive composition):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebarV2,
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      {/* Direct usage — all props are optional */}
      <VeltCommentsSidebarV2
        pageMode={false}
        focusedThreadMode={false}
        readOnly={false}
        position="right"
        variant="sidebar"
        forceClose={false}
        onSidebarOpen={(data) => console.log('sidebar opened', data)}
        onSidebarClose={(data) => console.log('sidebar closed', data)}
        onCommentClick={(data) => console.log('comment clicked', data)}
        onCommentNavigationButtonClick={(data) => console.log('nav button clicked', data)}
      />
    </VeltProvider>
  );
}
```

**Correct (HTML / Other Frameworks):**

```html
<velt-comments-sidebar-v2
  page-mode="false"
  focused-thread-mode="false"
  read-only="false"
  position="right"
  variant="sidebar"
  force-close="false"
></velt-comments-sidebar-v2>
```

**VeltCommentsSidebarV2 Props:**

| Prop | Type | Optional | Description |
|------|------|----------|-------------|
| `pageMode` | boolean | Yes | Enable page-level comments mode. |
| `focusedThreadMode` | boolean | Yes | Open individual threads in a focused view inside the sidebar. |
| `readOnly` | boolean | Yes | Render the sidebar in read-only mode. |
| `embedMode` | string \| null | Yes | Embed the sidebar inside a custom container. |
| `floatingMode` | boolean | Yes | Render the sidebar in floating mode. |
| `position` | string | Yes | Anchor position of the sidebar panel (e.g. `"right"`). |
| `variant` | string | Yes | Display variant (e.g. `"sidebar"`). |
| `forceClose` | boolean | Yes | Force the sidebar closed programmatically. |
| `onSidebarOpen` | (data: any) => void | Yes | Callback fired when the sidebar opens. |
| `onSidebarClose` | (data: any) => void | Yes | Callback fired when the sidebar closes. |
| `onCommentClick` | (data: any) => void | Yes | Callback fired when a comment item is clicked. |
| `onCommentNavigationButtonClick` | (data: any) => void | Yes | Callback fired when the comment navigation button is clicked. |

**Key V2 Differences from V1:**

- **Unified filter model** — replaces the legacy `minimalFilter` + `advancedFilters` system with a single consistent filter dropdown primitive.
- **CDK virtual scroll** — built-in for large comment lists; no manual configuration required.
- **Focused-thread view** — when `focusedThreadMode={true}`, clicking a comment opens the thread inline inside the sidebar instead of navigating away.
- **Primitive tree** — every section of the sidebar UI (header, filter bar, comment list item, thread view, actions dropdown) is an independently importable primitive that accepts `parentLocalUIState` and supports `velt-class` conditional styling.

**Verification Checklist:**
- [ ] `VeltCommentsSidebarV2` is used when per-section customization is required (the removed `version="2"` opt-in on `VeltCommentsSidebar` is no longer valid as of v5.0.2-beta.13)
- [ ] `focusedThreadMode` is set explicitly when inline thread expansion is needed
- [ ] `forceClose` is driven by state, not hardcoded to `true`
- [ ] Event callbacks (`onSidebarOpen`, `onSidebarClose`, `onCommentClick`) clean up any side effects on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/overview - Comments Sidebar overview
- https://docs.velt.dev/async-collaboration/comments-sidebar/setup - Setup guide
- https://docs.velt.dev/api-reference/sdk/models/data-models - Velt data models
