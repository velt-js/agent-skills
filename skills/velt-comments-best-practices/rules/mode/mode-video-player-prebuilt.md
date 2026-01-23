---
title: Use Prebuilt Video Player for Quick Setup
impact: HIGH
impactDescription: Velt-provided video player with built-in commenting
tags: video, player, prebuilt, veltvideoplayer, sync, media
---

## Use Prebuilt Video Player for Quick Setup

Velt provides a prebuilt video player component with commenting and sync features already integrated. Use this for quick implementation without custom player setup.

**Incorrect (manual setup when prebuilt works):**

```jsx
// Unnecessary complexity for simple video commenting
<VeltComments />
<VeltCommentTool />
<VeltCommentPlayerTimeline ... />
<video src="..." />  // Manual integration required
```

**Correct (using prebuilt player):**

```jsx
import { VeltProvider, VeltVideoPlayer } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltVideoPlayer
        src="https://example.com/video.mp4"
        darkMode={false}
        sync={true}
      />
    </VeltProvider>
  );
}
```

**VeltVideoPlayer Props:**

| Prop | Type | Description |
|------|------|-------------|
| `src` | string | Video source URL |
| `darkMode` | boolean | Enable dark theme |
| `sync` | boolean | Enable synchronized playback |

**For HTML:**

```html
<velt-video-player
  src="https://example.com/video.mp4"
  dark-mode="false"
  sync="true"
>
</velt-video-player>
```

**When to Use Prebuilt vs Custom:**

| Use Prebuilt When | Use Custom When |
|-------------------|-----------------|
| Quick implementation | Custom player UI needed |
| Standard video features | Specific player library required |
| Don't need custom controls | Advanced playback features |
| Simple commenting needs | Custom timeline/seeking |

**Verification Checklist:**
- [ ] VeltVideoPlayer is inside VeltProvider
- [ ] src prop points to valid video URL
- [ ] darkMode matches app theme
- [ ] sync enabled if collaborative playback needed

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/video-player-setup/video-player-setup.mdx` - Complete setup
