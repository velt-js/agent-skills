---
title: Configure VeltHuddleTool Type
impact: HIGH
impactDescription: The type prop controls what the first click on the huddle tool starts
tags: huddle, type, audio, video, screen, presentation, all, VeltHuddleTool, configuration
---

## VeltHuddleTool Type Prop

The `type` prop on `VeltHuddleTool` sets what kind of huddle the first click starts. Always set it explicitly: the huddle feature page lists the default as `all`, while the component behavior reference lists `audio`.

**Why this matters:**

Relying on the default gives different behavior depending on which doc you trust. A code review tool may only need audio, while a design tool needs video and screen sharing.

**Incorrect (implicit default):**

```jsx
<VeltHuddleTool /> {/* default is documented as both 'all' and 'audio' */}
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <div className="toolbar">
      <VeltHuddleTool type="all" />
    </div>
  );
}

// Single-purpose buttons
<VeltHuddleTool type="audio" />
<VeltHuddleTool type="video" />
```

**Correct (Other Frameworks):**

```html
<velt-huddle-tool type="all"></velt-huddle-tool>
<velt-huddle-tool type="audio"></velt-huddle-tool>
<velt-huddle-tool type="video"></velt-huddle-tool>
```

**Type values:**

| Value | What the first click starts |
|---|---|
| `'audio'` | Audio-only huddle |
| `'video'` | Audio + video huddle |
| `'all'` | All options |
| `'screen'` / `'presentation'` | Audio + screen share. The feature page names this `screen`; the component reference and `componentConfig.type` name it `presentation`. Verify against your SDK version before relying on it. |

**Key details:**

- If a huddle is already running, clicking any huddle tool joins it with the existing huddle's type
- Screen sharing requires browser support for `navigator.mediaDevices.getDisplayMedia`; the tool exposes `componentConfig.screenSharingSupported` for wireframes
- `darkMode` on `VeltHuddleTool` toggles the dark theme
- You can render several `VeltHuddleTool` buttons with different types

**Verification:**
- [ ] `type` is set explicitly on every `VeltHuddleTool`
- [ ] The offered huddle options match the intended experience
- [ ] `VeltHuddle` is mounted at the root for the tool to work
- [ ] Microphone, camera, and screen permissions are handled for the chosen type

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/huddle/customize-behavior#type - "type"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltHuddleTool (sibling)"
- https://docs.velt.dev/ui-customization/features/realtime/huddle/wireframe-variables - `componentConfig.type`
