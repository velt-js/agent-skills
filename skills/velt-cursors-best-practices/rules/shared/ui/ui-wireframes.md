---
title: Customize Cursor Pointer with Wireframes
impact: MEDIUM
impactDescription: Build custom cursor visuals using VeltCursorPointerWireframe sub-components
tags: wireframe, customization, cursor-pointer, VeltWireframe, VeltCursorPointerWireframe, avatar, audio-huddle, video-huddle, ui
---

## Customize Cursor Appearance with Wireframes

Use `VeltCursorPointerWireframe` and its sub-components to customize each remote cursor. There are five variants: Arrow, Avatar, Default (Name, Comment), AudioHuddle (Avatar, Audio), and VideoHuddle. Wrap wireframes in `VeltWireframe` (React) or `<velt-wireframe style="display:none;">` (HTML).

**Why this matters:**

Only the per-user pointer is wireframable; the root `<velt-cursor>` is not. `VeltCursor` has no `shadowDom` prop (its shadow DOM is always on), so style it through wireframes and CSS variables, not deep selectors.

**Incorrect (no wrapper, shadowDom prop on VeltCursor):**

```jsx
<VeltCursorPointerWireframe>
  <VeltCursorPointerWireframe.Arrow />
</VeltCursorPointerWireframe>
<VeltCursor shadowDom={false} /> {/* no such prop on VeltCursor */}
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltWireframe, VeltCursorPointerWireframe } from "@veltdev/react";

function CursorWireframes() {
  return (
    <VeltWireframe>
      <VeltCursorPointerWireframe>
        <VeltCursorPointerWireframe.Arrow />
        <VeltCursorPointerWireframe.Avatar />
        <VeltCursorPointerWireframe.Default>
          <VeltCursorPointerWireframe.Default.Name />
          <VeltCursorPointerWireframe.Default.Comment />
        </VeltCursorPointerWireframe.Default>
        <VeltCursorPointerWireframe.AudioHuddle>
          <VeltCursorPointerWireframe.AudioHuddle.Avatar />
          <VeltCursorPointerWireframe.AudioHuddle.Audio />
        </VeltCursorPointerWireframe.AudioHuddle>
        <VeltCursorPointerWireframe.VideoHuddle />
      </VeltCursorPointerWireframe>
    </VeltWireframe>
  );
}

// Render <CursorWireframes /> once inside VeltProvider alongside a single <VeltCursor />.
```

**Correct (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <velt-cursor-pointer-wireframe>
    <velt-cursor-pointer-arrow-wireframe></velt-cursor-pointer-arrow-wireframe>
    <velt-cursor-pointer-avatar-wireframe></velt-cursor-pointer-avatar-wireframe>
    <velt-cursor-pointer-default-wireframe>
      <velt-cursor-pointer-default-name-wireframe></velt-cursor-pointer-default-name-wireframe>
      <velt-cursor-pointer-default-comment-wireframe></velt-cursor-pointer-default-comment-wireframe>
    </velt-cursor-pointer-default-wireframe>
    <velt-cursor-pointer-audio-huddle-wireframe>
      <velt-cursor-pointer-audio-huddle-avatar-wireframe></velt-cursor-pointer-audio-huddle-avatar-wireframe>
      <velt-cursor-pointer-audio-huddle-audio-wireframe></velt-cursor-pointer-audio-huddle-audio-wireframe>
    </velt-cursor-pointer-audio-huddle-wireframe>
    <velt-cursor-pointer-video-huddle-wireframe></velt-cursor-pointer-video-huddle-wireframe>
  </velt-cursor-pointer-wireframe>
</velt-wireframe>

<velt-cursor></velt-cursor>
```

**Wireframe variants:**

- **Arrow**: the pointer glyph (use this to change the cursor icon)
- **Avatar**: avatar bubble next to the cursor (avatar mode)
- **Default**: container for the name label (**Name**) and an inline comment label (**Comment**)
- **AudioHuddle**: audio-huddle pointer with **Avatar** and **Audio** (speaking indicator)
- **VideoHuddle**: video-huddle pointer with a live video tile

**Limitations:**

- There is no live-cursor image prop; `pin-cursor-image` belongs to `VeltComments` (comment placement), not live cursors
- The root `<velt-cursor>` has no wireframe; only the per-user pointer does
- Your own cursor is hidden in normal use; `selfCursorPointer` renders only in huddle-on-cursor mode
- Requires an identified (non-anonymous) user

**Verification:**
- [ ] Wireframes are inside `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] Sub-components are nested as documented (e.g. `Default.Name` inside `Default`)
- [ ] No `shadowDom` prop is passed to `VeltCursor`
- [ ] Custom cursor renders with real-time positioning for a second user

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/cursors - "VeltCursorPointerWireframe", "Limitations"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "VeltCursor" (always shadow-DOM isolated)
- https://docs.velt.dev/ui-customization/overview - "UI Customization Concepts"
