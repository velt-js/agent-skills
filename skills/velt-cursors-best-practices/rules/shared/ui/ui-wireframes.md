---
title: Customize Cursor Pointer with Wireframes
impact: MEDIUM
impactDescription: Build custom cursor visuals using VeltCursorPointerWireframe sub-components
tags: wireframe, customization, cursor-pointer, avatar, audio-huddle, video-huddle, ui
---

## Customize Cursor Appearance with Wireframes

Use `VeltCursorPointerWireframe` and its sub-components to customize the visual appearance of cursors. There are 5 variants: Arrow, Avatar, Default (Name/Comment), AudioHuddle, and VideoHuddle.

**Why this matters:**

Default cursor styling may not match your app's design system. Wireframes let you rearrange, hide, or style individual parts of the cursor (pointer, name, avatar, huddle controls) while preserving Velt's real-time sync and positioning.

**React: Custom cursor wireframe**

```jsx
"use client";
import {
  VeltCursor,
  VeltCursorPointerWireframe,
} from "@veltdev/react";

function CustomCursor() {
  return (
    <>
      <VeltCursorPointerWireframe>
        <VeltCursorPointerWireframe.Arrow />
        <VeltCursorPointerWireframe.Avatar />
        <VeltCursorPointerWireframe.Default>
          <VeltCursorPointerWireframe.Default.Name />
          <VeltCursorPointerWireframe.Default.Comment />
        </VeltCursorPointerWireframe.Default>
        <VeltCursorPointerWireframe.AudioHuddle />
        <VeltCursorPointerWireframe.VideoHuddle />
      </VeltCursorPointerWireframe>
      <VeltCursor />
    </>
  );
}
```

**React: Minimal cursor (arrow + name only)**

```jsx
"use client";
import { VeltCursor, VeltCursorPointerWireframe } from "@veltdev/react";

function MinimalCursor() {
  return (
    <>
      <VeltCursorPointerWireframe>
        <VeltCursorPointerWireframe.Arrow />
        <VeltCursorPointerWireframe.Default>
          <VeltCursorPointerWireframe.Default.Name />
        </VeltCursorPointerWireframe.Default>
      </VeltCursorPointerWireframe>
      <VeltCursor />
    </>
  );
}
```

**HTML: Wireframe equivalents**

```html
<velt-cursor-pointer-wireframe>
  <velt-cursor-pointer-arrow-wireframe></velt-cursor-pointer-arrow-wireframe>
  <velt-cursor-pointer-avatar-wireframe></velt-cursor-pointer-avatar-wireframe>
  <velt-cursor-pointer-default-wireframe>
    <velt-cursor-pointer-default-name-wireframe></velt-cursor-pointer-default-name-wireframe>
    <velt-cursor-pointer-default-comment-wireframe></velt-cursor-pointer-default-comment-wireframe>
  </velt-cursor-pointer-default-wireframe>
  <velt-cursor-pointer-audio-huddle-wireframe></velt-cursor-pointer-audio-huddle-wireframe>
  <velt-cursor-pointer-video-huddle-wireframe></velt-cursor-pointer-video-huddle-wireframe>
</velt-cursor-pointer-wireframe>

<velt-cursor></velt-cursor>
```

**Wireframe variants explained:**

- **Arrow**: The pointer arrow icon itself
- **Avatar**: Circular avatar image shown next to cursor (used in avatar mode)
- **Default**: Container for name label and comment indicator
  - **Default.Name**: User name text
  - **Default.Comment**: Comment indicator when user is in comment mode
- **AudioHuddle**: Audio huddle indicator (shows when user is in audio call)
- **VideoHuddle**: Video huddle indicator (shows when user is in video call)

**Styling wireframes:**

Set `shadowDom={false}` on `VeltCursor` to apply custom CSS to wireframe internals:

```jsx
<VeltCursor shadowDom={false} />
```

**Key points:**

- Wireframe must be defined before or alongside `VeltCursor` in the component tree
- Only include the sub-components you want to display -- omitted parts are hidden
- Wireframes control layout and structure; use CSS for colors, sizes, and spacing
- `shadowDom={false}` is required to target wireframe elements with external CSS

**Verification:**
- [ ] `VeltCursorPointerWireframe` is rendered alongside `VeltCursor`
- [ ] Only desired sub-components are included
- [ ] Custom cursor renders correctly with real-time positioning
- [ ] `shadowDom={false}` is set if custom CSS is applied

**Source Pointers:**
- `https://docs.velt.dev/cursor/customize-ui/wireframe` - Cursor wireframe customization
