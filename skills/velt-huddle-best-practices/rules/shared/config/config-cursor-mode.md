---
title: Configure Cursor Mode for Huddle
impact: MEDIUM
impactDescription: Shows a video/audio bubble floating near the user's cursor position
tags: huddle, cursor, bubble, VeltCursor, spatial, configuration
---

## Huddle Cursor Mode

Cursor mode displays a small video or audio bubble that floats near each huddle participant's cursor position. This creates a spatial awareness effect where you can see both where a user is pointing and their video/audio feed simultaneously.

**Why this matters:**

In spatial applications like whiteboards, design tools, or canvas-based editors, cursor mode bridges the gap between communication and spatial context. Users can point at specific elements while discussing them, making remote collaboration feel more natural.

**React: Programmatic control via hook**

```jsx
"use client";
import { useHuddleUtils } from "@veltdev/react";

function CursorModeToggle() {
  const huddleElement = useHuddleUtils();

  const enableCursorMode = () => {
    huddleElement?.enableCursorMode();
  };

  const disableCursorMode = () => {
    huddleElement?.disableCursorMode();
  };

  return (
    <div>
      <button onClick={enableCursorMode}>Enable Cursor Bubbles</button>
      <button onClick={disableCursorMode}>Disable Cursor Bubbles</button>
    </div>
  );
}
```

**React: Ensure VeltCursor is also active**

```jsx
"use client";
import { VeltHuddle, VeltCursor } from "@veltdev/react";

function CollaborativeCanvas() {
  return (
    <>
      <VeltHuddle />
      <main className="canvas-area">
        <VeltCursor />
        {/* Canvas content */}
      </main>
    </>
  );
}
```

**Key requirements:**

- `VeltCursor` must be active in the content area for cursor tracking to work
- Cursor mode attaches the huddle bubble to each participant's tracked cursor
- Without `VeltCursor`, the SDK has no cursor position data to attach bubbles to
- Best suited for canvas, whiteboard, and spatial applications

**Key behaviors:**

- When enabled, each huddle participant's video/audio feed appears as a small bubble near their cursor
- The bubble follows the cursor in real time
- Provides spatial context for discussions — users can see what others are pointing at
- Works alongside standard cursor tracking features

**Verification:**
- [ ] `VeltCursor` component is rendered in the content area
- [ ] `huddleElement.enableCursorMode()` is called when cursor bubbles are desired
- [ ] Huddle participant bubbles appear near cursor positions during active huddle
- [ ] Bubbles follow cursor movement in real time

**Source Pointers:**
- `https://docs.velt.dev/huddle/customize-behavior` - Huddle cursor mode
- `https://docs.velt.dev/cursor/setup` - Cursor setup guide
