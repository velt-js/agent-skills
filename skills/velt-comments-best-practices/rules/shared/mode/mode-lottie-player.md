---
title: Add Frame-by-Frame Comments to Lottie Animations
impact: HIGH
impactDescription: Comments synced to specific frames in Lottie animations
tags: lottie, animation, frames, timeline, media-position
---

## Add Frame-by-Frame Comments to Lottie Animations

Add collaborative comments to Lottie animations that sync with specific frames, similar to video player comments.

**Incorrect (missing location/frame management):**

```jsx
// Comments won't sync with animation frames
<VeltComments />
<LottiePlayer ... />
```

**Correct (with frame-synced commenting):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPlayerTimeline,
  VeltCommentsSidebar,
  VeltSidebarButton,
  useVeltClient
} from '@veltdev/react';

export default function LottieComments() {
  const { client } = useVeltClient();
  const lottieRef = useRef(null);

  // Handle comment mode - pause and set location
  const onCommentModeChange = (mode) => {
    if (mode) {
      lottieRef.current?.pause();
      setLocation();
    }
  };

  // Set location with current frame
  const setLocation = () => {
    const currentFrame = Math.floor(lottieRef.current?.currentFrame || 0);
    client.setLocation({
      currentMediaPosition: currentFrame
    });
  };

  // Clear location when animation plays
  const removeLocation = () => {
    client.removeLocation();
  };

  // Handle comment click - seek to frame
  const onCommentClick = (event) => {
    const { location } = event;
    if (location?.currentMediaPosition !== undefined) {
      lottieRef.current.goToAndStop(location.currentMediaPosition, true);
      client.setLocation(location);
    }
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments
        priority={true}
        autoCategorize={true}
        commentIndex={true}
      />

      <VeltCommentTool onCommentModeChange={onCommentModeChange} />
      <VeltSidebarButton />

      <div style={{ position: 'relative' }}>
        <LottiePlayer
          ref={lottieRef}
          onPlay={removeLocation}
          // ... other props
        />
        <VeltCommentPlayerTimeline
          totalMediaLength={120}
          onCommentClick={onCommentClick}
        />
      </div>

      <VeltCommentsSidebar
        embedMode={true}
        onCommentClick={onCommentClick}
      />
    </VeltProvider>
  );
}
```

**Key Implementation Steps:**

**1. Set Total Media Length (frames):**
```jsx
<VeltCommentPlayerTimeline totalMediaLength={120} />

// Or via API:
const commentElement = client.getCommentElement();
commentElement.setTotalMediaLength(120);
```

**2. Set Location on Comment Mode:**
```jsx
const setLocation = () => {
  client.setLocation({
    currentMediaPosition: Math.floor(currentFrame)
  });
};
```

**3. Remove Location on Play:**
```jsx
const removeLocation = () => {
  client.removeLocation();
};
```

**4. Handle Comment Click:**
```jsx
const onCommentClick = (event) => {
  const { location } = event;
  if (location?.currentMediaPosition !== undefined) {
    // Seek to frame
    lottiePlayer.goToAndStop(location.currentMediaPosition, true);
    // Set location to show comment
    client.setLocation(location);
  }
};
```

**Limit Commentable Elements:**
```jsx
const commentElement = client.getCommentElement();
commentElement.allowedElementIds(['lottiePlayerContainer']);
```

**For HTML:**

```html
<velt-comments priority="true" auto-categorize="true"></velt-comments>

<velt-comment-tool></velt-comment-tool>

<div style="position: relative;">
  <your-lottie-player id="lottiePlayerContainer"></your-lottie-player>
  <velt-comment-player-timeline total-media-length="120"></velt-comment-player-timeline>
</div>
```

**Verification Checklist:**
- [ ] Timeline parent has non-static position
- [ ] totalMediaLength matches animation frame count
- [ ] Location set with currentMediaPosition on comment
- [ ] Location removed when animation plays
- [ ] Comment clicks seek to correct frame

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/lottie-player-setup - Complete setup
