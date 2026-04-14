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

**React: Enable avatar mode**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasWithAvatarCursors() {
  return (
    <main className="canvas">
      <VeltCursor avatarMode={true} />
      {/* Canvas content */}
    </main>
  );
}
```

**HTML: Enable avatar mode**

```html
<velt-cursor avatar-mode="true"></velt-cursor>
```

**API: Programmatic toggle**

```jsx
"use client";
import { useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorConfig() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.enableAvatarMode();
    }
  }, [cursorElement]);

  return null;
}
```

**Vanilla JS:**

```javascript
const cursorElement = client.getCursorElement();
cursorElement.enableAvatarMode();
// To disable: cursorElement.disableAvatarMode();
```

**Key points:**

- Avatar mode replaces the default name label with the user's profile image
- If the user has no avatar set, a fallback (initials or default icon) is shown
- Can be combined with other cursor props like `allowedElementIds`
- To revert to name labels, set `avatarMode={false}` or call `disableAvatarMode()`

**Verification:**
- [ ] `avatarMode={true}` is set on `VeltCursor`
- [ ] User avatars display correctly next to cursors
- [ ] Users without avatars show a reasonable fallback
- [ ] Avatar does not overlap or obscure content

**Source Pointers:**
- `https://docs.velt.dev/cursor/customize-behavior/avatar-mode` - Avatar mode
