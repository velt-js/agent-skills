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

**Incorrect (enabling cursor mode without live cursors):**

```jsx
huddleElement?.enableCursorMode(); // no VeltCursor mounted: there is no cursor to attach bubbles to
```

**Correct (React: programmatic control via hook):**

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

**Correct (React: VeltCursor mounted once alongside VeltHuddle):**

```jsx
"use client";
import { VeltHuddle, VeltCursor } from "@veltdev/react";

function CollaborativeCanvas() {
  return (
    <>
      <VeltHuddle />
      <VeltCursor />
      <main className="canvas-area">{/* Canvas content */}</main>
    </>
  );
}
```

**Correct (Other Frameworks):**

```js
const huddleElement = Velt.getHuddleElement();
huddleElement.enableCursorMode();
huddleElement.disableCursorMode();
```

**Key requirements:**

- `VeltCursor` must be mounted (once, near the root) for cursor tracking to work
- Cursor mode attaches the huddle bubble to each participant's tracked cursor
- Without `VeltCursor`, the SDK has no cursor position data to attach bubbles to
- Best suited for canvas, whiteboard, and spatial applications

**Key behaviors:**

- When enabled, each huddle participant's video/audio feed appears as a small bubble near their cursor
- The bubble follows the cursor in real time
- Provides spatial context for discussions — users can see what others are pointing at
- Customize the bubble with the `AudioHuddle` / `VideoHuddle` cursor pointer wireframes; per-attendee state is `Attendee.huddleOnCursorMode`
- `enableCursorMode()` / `disableCursorMode()` are listed in the `HuddleElement` API reference; the huddle feature page does not document them

**Verification:**
- [ ] One `VeltCursor` is mounted
- [ ] `huddleElement.enableCursorMode()` is called when cursor bubbles are desired
- [ ] Huddle participant bubbles appear near cursor positions during active huddle
- [ ] Bubbles follow cursor movement in real time

**Source Pointers:**
- https://docs.velt.dev/ui-customization/reference/apis - "Huddle: client.getHuddleElement()" (`enableCursorMode`, `disableCursorMode`)
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/ui-customization/features/realtime/cursors - "AudioHuddle", "VideoHuddle" pointer wireframes
