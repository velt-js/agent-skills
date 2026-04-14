---
title: Configure VeltHuddleTool Type
impact: HIGH
impactDescription: The type prop controls which huddle options are available to users
tags: huddle, type, audio, video, screen, VeltHuddleTool, configuration
---

## VeltHuddleTool Type Prop

The `type` prop on `VeltHuddleTool` controls which huddle options are presented to users. Available values are `'audio'`, `'video'`, `'screen'`, and `'all'`.

**Why this matters:**

Choosing the right type ensures users see only the huddle options relevant to your application. A code review tool may only need audio, while a design collaboration tool benefits from all options including screen sharing.

**Type options:**

- `'all'` — Shows a dropdown with audio, video, and screen sharing options. This is the recommended default for most applications.
- `'audio'` — Shows only an audio huddle button. Users can start voice-only calls.
- `'video'` — Shows only a video huddle button. Users can start video calls.
- `'screen'` — Shows only a screen sharing button. Users can share their screen.

**React: Type examples**

```jsx
"use client";
import { VeltHuddleTool } from "@veltdev/react";

function Toolbar() {
  return (
    <div className="toolbar">
      {/* Dropdown with all options */}
      <VeltHuddleTool type="all" />
    </div>
  );
}
```

```jsx
// Audio-only huddle button
<VeltHuddleTool type="audio" />

// Video-only huddle button
<VeltHuddleTool type="video" />

// Screen share-only button
<VeltHuddleTool type="screen" />
```

**HTML: Type examples**

```html
<velt-huddle-tool type="all"></velt-huddle-tool>
<velt-huddle-tool type="audio"></velt-huddle-tool>
<velt-huddle-tool type="video"></velt-huddle-tool>
<velt-huddle-tool type="screen"></velt-huddle-tool>
```

**Usage guidance:**

- Use `type="all"` for general collaboration apps where users may want any communication mode
- Use `type="audio"` for lightweight voice-only scenarios like code reviews or quick syncs
- Use `type="video"` when face-to-face communication is the primary use case
- Use `type="screen"` when the main goal is screen sharing for demos or walkthroughs
- You can render multiple `VeltHuddleTool` components with different types if you want separate buttons instead of the dropdown

**Verification:**
- [ ] `type` prop is set on `VeltHuddleTool`
- [ ] The displayed huddle options match the intended user experience
- [ ] `VeltHuddle` component is present at the root for the tool to function
- [ ] Browser permissions for microphone/camera are handled appropriately for the chosen type

**Source Pointers:**
- `https://docs.velt.dev/huddle/setup` - Huddle tool configuration
