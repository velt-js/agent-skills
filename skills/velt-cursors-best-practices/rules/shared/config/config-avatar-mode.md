---
title: Show User Avatar Next to Cursor
impact: MEDIUM
impactDescription: Display user avatar floating beside cursor instead of name label
tags: avatar, avatarMode, cursor-avatar, user-identity, visual
---

## Enable Avatar Mode on Cursors

Use `avatarMode` to show a user's avatar image floating next to their cursor instead of the default name label. This provides a more visual and compact way to identify collaborators.

**Why this matters:**

In dense collaborative environments with many users, name labels can overlap and clutter the canvas. Avatar mode provides a compact circular image that is easier to scan visually, especially when users have profile photos set up.

**Incorrect (calling undocumented API methods):**

```javascript
// enableAvatarMode() / disableAvatarMode() are not documented CursorElement methods
Velt.getCursorElement().enableAvatarMode();
```

**Correct (React):**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasWithAvatarCursors() {
  return (
    <>
      <VeltCursor avatarMode={true} /> {/* single root-level instance */}
      <main className="canvas">{/* Canvas content */}</main>
    </>
  );
}
```

**Correct (Other Frameworks):**

```html
<velt-cursor avatar-mode="true"></velt-cursor>
```

**Key points:**

- Avatar mode replaces the default name label with the user's profile image
- Default is `false` (name label)
- If the avatar image fails to load, the cursor falls back to an initials avatar
- Can be combined with other cursor props like `allowedElementIds`
- Avatar mode is cosmetic; it does not change which cursors show or where
- Configure it with the `avatarMode` prop / `avatar-mode` attribute (no documented API method)

**Verification:**
- [ ] `avatarMode={true}` is set on `VeltCursor`
- [ ] User avatars display correctly next to cursors
- [ ] Users without avatars show a reasonable fallback
- [ ] Avatar does not overlap or obscure content

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#avatarmode - "avatarMode"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `avatarMode` default
