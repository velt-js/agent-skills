---
title: Integrate Comments with Custom Video Player
impact: HIGH
impactDescription: Add comments to any video player with timeline and sidebar
tags: video, player, custom, timeline, location, currentmediaposition
---

## Integrate Comments with Custom Video Player

Add collaborative comments to your own video player using Velt's timeline component and location-based commenting system.

**Incorrect (missing location management):**

```jsx
// Comments won't sync with video timeline
<VeltComments />
<VeltCommentPlayerTimeline />
<video src="..." />
```

**Correct (with location and timeline integration):**

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

export default function VideoComments() {
  const { client } = useVeltClient();
  const videoRef = useRef(null);

  // Handle comment mode activation
  const onCommentModeChange = async (mode) => {
    if (mode) {
      // Pause video when commenting
      videoRef.current?.pause();

      // Set location with current video time
      const currentTime = Math.floor(videoRef.current?.currentTime || 0);
      await client.setLocations([{
        currentMediaPosition: currentTime,
        videoPlayerId: 'my-video-player'
      }]);
    }
  };

  // Handle video play - clear location
  const onVideoPlay = async () => {
    await client.unsetLocationsIds();
  };

  // Handle comment click - seek to timestamp
  const onCommentClick = async (event) => {
    const { location } = event;
    if (location?.currentMediaPosition !== undefined) {
      videoRef.current.currentTime = location.currentMediaPosition;
      videoRef.current.pause();
      await client.setLocations([location]);
    }
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <VeltCommentTool onCommentModeChange={onCommentModeChange} />
      <VeltSidebarButton />

      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          id="my-video-player"
          src="https://example.com/video.mp4"
          onPlay={onVideoPlay}
        />
        <VeltCommentPlayerTimeline
          videoPlayerId="my-video-player"
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

**Key Concepts:**

**1. Location Management:**
- `currentMediaPosition` - Required field for timeline positioning
- `videoPlayerId` - Associates comments with specific player

**2. Timeline Setup:**
```jsx
<div style={{ position: 'relative' }}>  {/* Parent must not be static */}
  <YourVideoPlayer id="videoPlayerId" />
  <VeltCommentPlayerTimeline
    videoPlayerId="videoPlayerId"
    totalMediaLength={120}  {/* Total seconds or frames */}
  />
</div>
```

**3. Set Location When Commenting:**
```jsx
await client.setLocations([{
  currentMediaPosition: currentTimeInSeconds,
  videoPlayerId: 'videoPlayerId'
}]);
```

**4. Clear Location When Playing:**
```jsx
await client.unsetLocationsIds();
```

**5. Handle Comment Clicks:**
```jsx
const onCommentClick = async (event) => {
  const { location } = event;
  // Seek video to location.currentMediaPosition
  // Set location to show comment
  await client.setLocations([location]);
};
```

**For HTML:**

```html
<div style="position: relative;">
  <video id="videoPlayerId" src="..."></video>
  <velt-comment-player-timeline
    video-player-id="videoPlayerId"
    total-media-length="120"
  ></velt-comment-player-timeline>
</div>
```

**Verification Checklist:**
- [ ] Timeline parent has non-static position
- [ ] videoPlayerId matches on player and timeline
- [ ] totalMediaLength set correctly
- [ ] Location set when comment mode activates
- [ ] Location cleared when video plays
- [ ] Comment clicks seek video and set location

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/custom-video-player-setup - Complete setup
